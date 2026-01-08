document.addEventListener("DOMContentLoaded", () => {
	const app = {
		menuItems: [],
		recommendedItems: [],
		selectedCategory: "meal",
		selectedFlavors: [],
		selectedStyles: [],
		excludedIngredients: [],
		allIngredients: [],
		spicinessValue: 0.5,
		isLoading: false,
		promoData: null,
		isMenuExpanded: false,
		primaryMatch: null,
		modalCategory: "meal",

		categoryConfig: {
			meal: {
				flavors: ["Savory", "Spicy", "Rich"],
				styles: ["Crunchy", "Creamy", "Hearty"],
				spiciness: { enabled: true, weight: 1 }
			},
			dessert: {
				flavors: ["Sweet", "Rich", "Fruity"],
				styles: ["Creamy", "Crunchy", "Light"],
				spiciness: { enabled: true, weight: 0.3 }
			},
			drink: {
				flavors: ["Sweet", "Refreshing", "Rich"],
				styles: ["Icy", "Smooth", "Fizzy"],
				spiciness: { enabled: false }
			}
		},

		elements: {
			menuList: document.getElementById("menu-list"),
			categorySelector: document.getElementById("category-selector"),
			spicinessMeter: document.getElementById("spiciness-meter"),
			spicinessContainer: document.getElementById("spiciness-container"),
			spicinessLabel: document.getElementById("spiciness-value"),
			meterHint: document.getElementById("meter-hint"),
			helpMeChooseBtn: document.getElementById("help-me-choose"),
			loadingDotsContainer: document.getElementById("loading-dots-container"),
			promoShowcase: document.getElementById("promo-showcase"),
			featuredDish: document.getElementById("featured-dish"),
			spotlightContainer: document.getElementById("spotlight-container"),
			menuToggleBtn: document.getElementById("menu-toggle"),
			menuModal: document.getElementById("menu-modal"),
			modalClose: document.getElementById("modal-close"),
			modalTabsContainer: document.getElementById("modal-category-tabs"),
			exclusionToggle: document.getElementById("exclusion-toggle"),
			exclusionPanel: document.getElementById("exclusion-panel"),
			exclusionInput: document.getElementById("exclusion-input"),
			exclusionSuggestions: document.getElementById("exclusion-suggestions"),
			exclusionChips: document.getElementById("exclusion-chips"),
			exclusionFeedback: document.getElementById("exclusion-feedback"),
			howItWorksToggle: document.getElementById("how-it-works-toggle"),
			howItWorksContent: document.getElementById("how-it-works-content"),
			flavorSelectorFlavors: document.getElementById("flavor-selector-flavors"),
			flavorSelectorTextures: document.getElementById("flavor-selector-textures"),
		},

		init() {
			this.attachListeners();
			this.fetchMenuData();
			this.renderCategoryControls();
		},

		attachListeners() {
			// Category Selection
			this.elements.categorySelector.addEventListener("click", (e) => {
				const btn = e.target.closest(".selector-btn");
				if (!btn) return;

				this.selectedCategory = btn.dataset.type;
				this.selectedFlavors = [];
				this.selectedStyles = [];
				this.updateActiveSelectors(this.elements.categorySelector, [this.selectedCategory], "type");
				this.renderCategoryControls();
				this.getRecommendations();
			});

			// Flavor & Style Selection
			const handleTraitClick = (e, type) => {
				const btn = e.target.closest(".flavor-btn");
				if (!btn) return;

				const val = btn.dataset.trait;
				const targetArray = type === "flavor" ? this.selectedFlavors : this.selectedStyles;
				const index = targetArray.indexOf(val);

				if (index > -1) {
					targetArray.splice(index, 1);
				} else if (targetArray.length < 2) {
					targetArray.push(val);
				}

				this.updateActiveSelectors(this.elements.flavorSelectorFlavors, this.selectedFlavors, "trait");
				this.updateActiveSelectors(this.elements.flavorSelectorTextures, this.selectedStyles, "trait");
				this.getRecommendations();
			};

			this.elements.flavorSelectorFlavors.addEventListener("click", (e) => handleTraitClick(e, "flavor"));
			this.elements.flavorSelectorTextures.addEventListener("click", (e) => handleTraitClick(e, "style"));

			// How it works toggle
			if (this.elements.howItWorksToggle) {
				this.elements.howItWorksToggle.addEventListener("click", () => {
					this.elements.howItWorksContent.hidden = !this.elements.howItWorksContent.hidden;
				});
			}

			// Spiciness Meter
			this.elements.spicinessMeter.addEventListener("input", (e) => {
				this.spicinessValue = parseFloat(e.target.value);
				this.updateSpicinessLabel();
				this.getRecommendations(false, true);
			});

			// Help Me Choose CTA
			this.elements.helpMeChooseBtn.addEventListener("click", () => {
				this.getRecommendations(true);
			});

			// Ingredient Exclusions
			if (this.elements.exclusionToggle) {
				this.elements.exclusionToggle.addEventListener("click", () => {
					const isHidden = this.elements.exclusionPanel.hidden;
					this.elements.exclusionPanel.hidden = !isHidden;
					this.elements.exclusionToggle.querySelector(".toggle-icon").textContent = isHidden ? "－" : "＋";
				});
			}

			if (this.elements.exclusionInput) {
				this.elements.exclusionInput.addEventListener("input", (e) => {
					this.handleExclusionInput(e.target.value);
				});

				this.elements.exclusionInput.addEventListener("keydown", (e) => {
					if (e.key === "Enter" && e.target.value.trim()) {
						this.addExclusion(e.target.value.trim());
					}
				});
			}

			// Menu Visibility Toggle
			if (this.elements.menuToggleBtn) {
				this.elements.menuToggleBtn.addEventListener("click", (e) => {
					e.preventDefault();
					this.toggleMenuVisibility(true);
				});
			}

			if (this.elements.modalClose) {
				this.elements.modalClose.addEventListener("click", (e) => {
					e.preventDefault();
					this.toggleMenuVisibility(false);
				});
			}

			// Modal Category Tabs
			if (this.elements.modalTabsContainer) {
				this.elements.modalTabsContainer.addEventListener("click", (e) => {
					const btn = e.target.closest(".modal-tab-btn");
					if (!btn) return;
					
					this.modalCategory = btn.dataset.tab;
					this.updateActiveSelectors(this.elements.modalTabsContainer, [this.modalCategory], "tab");
					this.renderMenu();
				});
			}

			// Close modal on background click
			if (this.elements.menuModal) {
				this.elements.menuModal.addEventListener("click", (e) => {
					if (e.target === this.elements.menuModal) {
						this.toggleMenuVisibility(false);
					}
				});
			}
		},

		renderCategoryControls() {
			const config = this.categoryConfig[this.selectedCategory];
			
			// Render Flavors
			this.elements.flavorSelectorFlavors.innerHTML = config.flavors.map(f => 
				`<button class="flavor-btn" data-trait="${f.toLowerCase()}">${f}</button>`
			).join("");

			// Render Styles
			this.elements.flavorSelectorTextures.innerHTML = config.styles.map(s => 
				`<button class="flavor-btn" data-trait="${s.toLowerCase()}">${s}</button>`
			).join("");

			// Update Spiciness Meter state
			if (config.spiciness.enabled) {
				this.elements.spicinessContainer.classList.remove("disabled");
				this.elements.meterHint.textContent = "";
				this.elements.spicinessMeter.disabled = false;
			} else {
				this.elements.spicinessContainer.classList.add("disabled");
				this.elements.meterHint.textContent = "Not used for drinks";
				this.elements.spicinessMeter.disabled = true;
			}
		},

		updateActiveSelectors(container, activeValues, dataAttr) {
			if (!container) return;
			const buttons = container.querySelectorAll("button");
			buttons.forEach(btn => {
				const val = btn.getAttribute(`data-${dataAttr}`);
				btn.classList.toggle("active", activeValues.includes(val));
			});
		},

		updateSpicinessLabel() {
			let label = "Mild";
			if (this.spicinessValue > 0.3) label = "Medium";
			if (this.spicinessValue > 0.7) label = "Hot";
			if (this.spicinessValue > 0.9) label = "Extra Hot 🔥";
			this.elements.spicinessLabel.textContent = label;
		},

		fetchMenuData() {
			this.setLoading(true);
			fetch("menu.json")
				.then(res => res.json())
				.then(data => {
					this.menuItems = data.menu;
					this.promoData = data.promo;
					
					// Extract unique ingredients for autocomplete
					const ingredientsSet = new Set();
					this.menuItems.forEach(item => {
						if (item.ingredients) {
							item.ingredients.forEach(ing => ingredientsSet.add(ing.toLowerCase()));
						}
					});
					this.allIngredients = Array.from(ingredientsSet).sort();

					this.renderPromo();
					this.renderFeaturedDish();
					this.getRecommendations();
				})
				.catch(err => console.error("Error loading menu:", err))
				.finally(() => this.setLoading(false));
		},

		getRecommendations(isSurprise = false, skipLoading = false) {
			if (!this.menuItems.length) return;

			if (!skipLoading) this.setLoading(true);

			setTimeout(() => {
				const config = this.categoryConfig[this.selectedCategory];
				
				// 1. Hard Filter by Category and Exclusions
				let pool = this.menuItems.filter(item => 
					item.type === this.selectedCategory &&
					!this.excludedIngredients.some(ex => item.ingredients?.map(i => i.toLowerCase()).includes(ex))
				);

				// 2. Score Items
				const scoredItems = pool.map(item => {
					let score = 0;
					const attrs = item.attributes;

					// Flavor Matches
					this.selectedFlavors.forEach(f => {
						if (attrs.flavors?.includes(f)) score += 3;
					});

					// Style Matches
					this.selectedStyles.forEach(s => {
						if (attrs.styles?.includes(s)) score += 3;
					});

					// Spiciness Match (if enabled)
					if (config.spiciness.enabled) {
						const diff = Math.abs(attrs.spiciness - this.spicinessValue);
						const spacyWeight = config.spiciness.weight;
						score += (1 - diff) * 2 * spacyWeight;
					}

					return { ...item, matchScore: score };
				});

				// 3. Sort and Select
				scoredItems.sort((a, b) => b.matchScore - a.matchScore);

				// Randomize among top 5 if surprise
				if (isSurprise && scoredItems.length > 0) {
					const topCount = Math.min(5, scoredItems.length);
					const randomIndex = Math.floor(Math.random() * topCount);
					this.primaryMatch = scoredItems[randomIndex];
					scoredItems.splice(randomIndex, 1);
				} else {
					this.primaryMatch = scoredItems[0];
					scoredItems.shift();
				}

				this.recommendedItems = scoredItems;
				this.renderSpotlight();
				this.updateExclusionFeedback(pool.length);
				if (!skipLoading) this.setLoading(false);
			}, skipLoading ? 0 : 300);
		},

		renderSpotlight() {
			if (!this.primaryMatch) {
				this.elements.spotlightContainer.innerHTML = `<p class="no-matches">No matches found with your current filters.</p>`;
				return;
			}
			
			const item = this.primaryMatch;
			const visibleTags = item.tags ? item.tags.slice(0, 2) : [];
			const flavors = item.attributes?.flavors || [];
			const styles = item.attributes?.styles || [];
			
			this.elements.spotlightContainer.innerHTML = `
				<div class="spotlight-card">
					<div class="spotlight-image-container">
						<div class="spotlight-image" style="background-image: url('${item.image}')"></div>
						<div class="spotlight-tags">
							${visibleTags.map(tag => `<span class="spotlight-tag" title="${tag}">${this.getTagIcon(tag)} ${tag}</span>`).join("")}
						</div>
					</div>
					<div class="spotlight-details">
						<div class="spotlight-main-info">
							<h3 class="spotlight-name">${item.name}</h3>
							<span class="spotlight-price">$${item.price.toFixed(2)}</span>
						</div>
						<p class="spotlight-description">${item.description}</p>
						<div class="spotlight-traits">
							${flavors.map(f => `<span class="trait-pill flavor">${f}</span>`).join("")}
							${styles.map(s => `<span class="trait-pill style">${s}</span>`).join("")}
						</div>
					</div>
				</div>
			`;
		},

		renderMenu() {
			if (!this.elements.menuList) return;
			this.elements.menuList.innerHTML = "";
			const filtered = this.menuItems.filter(item => item.type === this.modalCategory);
			filtered.forEach(item => {
				this.elements.menuList.innerHTML += this.createMenuItemCard(item);
			});
		},

		createMenuItemCard(item) {
			const visibleTags = item.tags ? item.tags.slice(0, 2) : [];
			return `
				<div class="menu-card" style="background-image: url('${item.image}')">
					<div class="menu-card-overlay">
						<div class="menu-card-content">
							<div class="menu-card-top">
								<h4 class="menu-item-name">${item.name}</h4>
								<span class="menu-item-price">$${item.price.toFixed(2)}</span>
							</div>
							<div class="menu-item-tags">
								${visibleTags.map(tag => `<span class="tag-icon" title="${tag}">${this.getTagIcon(tag)}</span>`).join("")}
							</div>
						</div>
					</div>
				</div>
			`;
		},

		getTagIcon(tag) {
			const lowerTag = tag.toLowerCase();
			if (lowerTag.includes("spicy")) return "🌶️";
			if (lowerTag.includes("vegetarian")) return "🌱";
			if (lowerTag.includes("popular")) return "⭐";
			if (lowerTag.includes("dessert")) return "🍰";
			if (lowerTag.includes("drink")) return "🥤";
			if (lowerTag.includes("seafood")) return "🐟";
			if (lowerTag.includes("cheesy")) return "🧀";
			return "";
		},

		handleExclusionInput(val) {
			if (!val) {
				this.elements.exclusionSuggestions.hidden = true;
				return;
			}
			const query = val.toLowerCase();
			const matches = this.allIngredients.filter(ing => 
				ing.includes(query) && !this.excludedIngredients.includes(ing)
			).slice(0, 5);

			if (matches.length > 0) {
				this.elements.exclusionSuggestions.innerHTML = matches.map(m => `<li>${m}</li>`).join("");
				this.elements.exclusionSuggestions.hidden = false;
				this.elements.exclusionSuggestions.querySelectorAll("li").forEach(li => {
					li.addEventListener("click", () => {
						this.addExclusion(li.textContent);
						this.elements.exclusionInput.value = "";
						this.elements.exclusionSuggestions.hidden = true;
					});
				});
			} else {
				this.elements.exclusionSuggestions.hidden = true;
			}
		},

		addExclusion(ingredient) {
			const ing = ingredient.toLowerCase();
			if (ing && !this.excludedIngredients.includes(ing) && this.excludedIngredients.length < 5) {
				this.excludedIngredients.push(ing);
				this.renderExclusionChips();
				this.getRecommendations();
			}
		},

		removeExclusion(ing) {
			this.excludedIngredients = this.excludedIngredients.filter(i => i !== ing);
			this.renderExclusionChips();
			this.getRecommendations();
		},

		renderExclusionChips() {
			this.elements.exclusionChips.innerHTML = this.excludedIngredients.map(ing => `
				<span class="exclusion-chip">
					${ing}
					<span class="remove-btn" onclick="app.removeExclusion('${ing}')">&times;</span>
				</span>
			`).join("");
		},

		updateExclusionFeedback(poolSize) {
			if (this.excludedIngredients.length > 0 && poolSize === 0) {
				this.elements.exclusionFeedback.textContent = "Your exclusions filtered out all matches. Try removing some!";
				this.elements.exclusionFeedback.hidden = false;
			} else {
				this.elements.exclusionFeedback.hidden = true;
			}
		},

		setLoading(isLoading) {
			this.isLoading = isLoading;
			this.elements.loadingDotsContainer.hidden = !isLoading;
			this.elements.loadingDotsContainer.style.display = isLoading ? "flex" : "none";
			this.elements.helpMeChooseBtn.disabled = isLoading;
		},

		renderPromo() {
			if (!this.promoData || !this.promoData.enabled) return;
			this.elements.promoShowcase.innerHTML = this.promoData.sections.map(section => `
				<div class="promo-card" onclick="app.scrollToPromoItem('${section.linkedItemId}')">
					<div class="promo-image" style="background-image: url('${section.image}')"></div>
					<div class="promo-content">
						<h5>${section.title}</h5>
					</div>
				</div>
			`).join("");
		},

		renderFeaturedDish() {
			const featured = this.menuItems.find(item => item.featured);
			if (featured && this.elements.featuredDish) {
				this.elements.featuredDish.innerHTML = `
					<div class="featured-card" onclick="app.scrollToPromoItem('${featured.id}')">
						<div class="featured-image" style="background-image: url('${featured.image}')"></div>
						<div class="featured-badge">Chef's Pick</div>
						<div class="featured-content">
							<h4>${featured.name}</h4>
							<p>${featured.description}</p>
						</div>
					</div>
				`;
			}
		},

		scrollToPromoItem(itemId) {
			const item = this.menuItems.find(i => i.id === itemId);
			if (item) {
				this.selectedCategory = item.type;
				this.selectedFlavors = [];
				this.selectedStyles = [];
				this.updateActiveSelectors(this.elements.categorySelector, [this.selectedCategory], "type");
				this.renderCategoryControls();
				this.primaryMatch = item;
				this.renderSpotlight();
				this.elements.spotlightContainer.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		},

		toggleMenuVisibility(show) {
			this.elements.menuModal.hidden = !show;
			document.body.style.overflow = show ? "hidden" : "";
			if (show) {
				this.modalCategory = this.selectedCategory;
				this.updateActiveSelectors(this.elements.modalTabsContainer, [this.modalCategory], "tab");
				this.renderMenu();
			}
		}
	};

	window.app = app; // Expose for onclick handlers
	app.init();
});
