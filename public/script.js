document.addEventListener("DOMContentLoaded", () => {
	const app = {
		menuItems: [],
		filteredItems: [],
		currentCategory: null,
		activeTooltip: null, // Track currently active tooltip
		activeMenuTab: "all", // Track active menu tab
		isLoading: false, // Track loading state
		promoData: null, // Promo data from menu.json
		itemsLimit: 9, // Show 9 items (3 rows) by default
		itemsIncrement: 9, // Increment by 9 when "Show More" is clicked

		elements: {
			menuList: document.getElementById("menu-list"),
			noResults: document.getElementById("no-results"),
			loadMoreContainer: document.getElementById("load-more-container"),
			categoryButtons: document.querySelectorAll(
				".filter-btn--chip[data-category]",
			),
			loadingDotsContainer: document.getElementById("loading-dots-container"),
			menuTabs: document.querySelectorAll(".filter-btn--segmented[data-tab]"),
			legendContainer: document.getElementById("legend-items"),
			legendToggle: document.getElementById("tag-guide-toggle"),
			legend: document.getElementById("tag-legend"),
			primaryAction: document.querySelector(".btn-primary-action"),
			promoShowcase: document.getElementById("promo-showcase"),
			featuredDish: document.getElementById("featured-dish"),
		},

		init() {
			this.cacheDomElements();
			this.attachListeners();
			// Start with menu list hidden
			if (this.elements.menuList) {
				this.elements.menuList.style.opacity = "0";
			}
			this.fetchMenuData();
		},

		cacheDomElements() {
			// The `elements` property is already populated, this is for clarity
		},

		attachListeners() {
			this.elements.categoryButtons.forEach((button) => {
				button.addEventListener("click", () =>
					this.handleCategoryClick(button),
				);
			});

			// Menu tabs (now using filter-btn class)
			this.elements.menuTabs.forEach((button) => {
				button.addEventListener("click", () => this.handleMenuTabClick(button));
			});

			// Primary action button
			if (this.elements.primaryAction) {
				this.elements.primaryAction.addEventListener("click", () => {
					this.showRandomItem();
				});
			}

			// Legend toggle
			if (this.elements.legendToggle) {
				this.elements.legendToggle.addEventListener("click", () => {
					this.toggleTagGuide();
				});
			}

			// Initialize tooltips
			this.initTooltips();
		},

		fetchMenuData() {
			this.setLoading(true);
			try {
				fetch("menu.json")
					.then((response) => {
						if (!response.ok)
							throw new Error(`HTTP error! status: ${response.status}`);
						return response.json();
					})
					.then((data) => {
						// Handle new structure with promo and menu
						if (data.menu && Array.isArray(data.menu)) {
							this.menuItems = data.menu;
							this.promoData = data.promo || null;
						} else {
							// Fallback to old structure (array of items)
							this.menuItems = data;
							this.promoData = null;
						}
						
						this.filteredItems = this.menuItems;
						
						// Render promo and featured dish first
						this.renderPromo();
						this.renderFeaturedDish();
						
						// Then render menu
						this.renderAllItemsOnce();
						this.elements.menuList.style.opacity = "1";
						this.createTagLegend();
					})
					.catch((error) => {
						console.error("Error fetching or parsing menu data:", error);
						this.elements.menuList.innerHTML =
							'<p class="error-state">Could not load menu. Please try again later.</p>';
						this.elements.menuList.style.opacity = "1";
					})
					.finally(() => {
						this.setLoading(false);
					});
			} catch (error) {
				console.error("Error in fetchMenuData:", error);
				this.setLoading(false);
			}
		},

		renderAllItemsOnce() {
			this.renderCategorizedItems(this.menuItems);
		},

		performFilter() {
			this.itemsLimit = 9; // Reset limit when filtering
			this.setLoading(true);
			try {
				let items = this.menuItems;

				// Filter by category
				if (this.currentCategory && this.currentCategory !== "surprise") {
					items = items.filter((item) =>
						item.tags?.includes(this.currentCategory),
					);
				}

				this.filteredItems = items;
				this.renderCategorizedItems(this.filteredItems);
			} finally {
				this.setLoading(false);
			}
		},

		renderCategorizedItems(items) {
			// Only fade on category change, not every interaction
			this.elements.menuList.style.opacity = "0.5";

			// Update content quickly
			setTimeout(() => {
				this.elements.menuList.innerHTML = "";
				const fragment = document.createDocumentFragment();

				// Filter by active tab if not "all"
				let itemsToShow = items;
				if (this.activeMenuTab !== "all") {
					itemsToShow = items.filter(
						(item) => (item.type || "main") === this.activeMenuTab,
					);
				}

				// Render items without category headers (tabs handle navigation)
				const slicedItems = itemsToShow.slice(0, this.itemsLimit);
				slicedItems.forEach((item) => {
					const card = this.createMenuItemCard(item);
					fragment.appendChild(card);
				});

				this.elements.menuList.appendChild(fragment);
				this.elements.noResults.hidden = itemsToShow.length > 0;

				// Update "Explore More" button
				this.updateLoadMoreButton(itemsToShow.length);

				// Fade in content
				this.elements.menuList.style.opacity = "1";
			}, 100); // Quick transition
		},

		handleMenuTabClick(button) {
			this.itemsLimit = 9; // Reset limit when switching tabs
			this.setLoading(true);
			try {
				// Update active tab
				this.elements.menuTabs.forEach((btn) => btn.classList.remove("active"));
				button.classList.add("active");

				this.activeMenuTab = button.dataset.tab;

				// Re-render menu with new tab filter, keeping current category tag
				this.performFilter();
			} finally {
				this.setLoading(false);
			}
		},

		handleCategoryClick(button) {
			const newCategory = button.dataset.category;

			if (newCategory === "surprise") {
				this.showRandomItem();
				return;
			}

			// Deactivate all buttons
			this.elements.categoryButtons.forEach((btn) =>
				btn.classList.remove("active"),
			);

			if (this.currentCategory === newCategory) {
				// If the same category is clicked again, deactivate it and show all items.
				this.currentCategory = null;
			} else {
				// Activate the new category
				this.currentCategory = newCategory;
				button.classList.add("active");
			}

			this.performFilter(); // This will handle loading state
		},

		updateLoadMoreButton(totalItems) {
			if (!this.elements.loadMoreContainer) return;

			if (totalItems > this.itemsLimit) {
				this.elements.loadMoreContainer.innerHTML = `
					<button class="btn btn-load-more">Explore More Flavors</button>
				`;
				this.elements.loadMoreContainer.hidden = false;
				
				const btn = this.elements.loadMoreContainer.querySelector('.btn-load-more');
				btn.addEventListener('click', () => {
					this.itemsLimit += this.itemsIncrement;
					this.renderCategorizedItems(this.filteredItems);
				});
			} else {
				this.elements.loadMoreContainer.hidden = true;
				this.elements.loadMoreContainer.innerHTML = "";
			}
		},

		showRandomItem() {
			this.setLoading(true);
			try {
				// Don't clear filters - work with current active filters
				let items = this.menuItems;

				// Filter by active tab if not "all"
				if (this.activeMenuTab !== "all") {
					items = items.filter(
						(item) => (item.type || "main") === this.activeMenuTab,
					);
				}

				// Filter by active category tag if one is selected
				if (this.currentCategory && this.currentCategory !== "surprise") {
					items = items.filter((item) =>
						item.tags?.includes(this.currentCategory),
					);
				}

				// If no items match the current filters, show all items
				if (items.length === 0) {
					items = this.menuItems;
				}

				// Select a random item from the filtered items
				const randomIndex = Math.floor(Math.random() * items.length);
				const randomItem = items[randomIndex];
				this.filteredItems = [randomItem];

				setTimeout(() => {
					try {
						this.renderCategorizedItems(this.filteredItems);

						const card = this.elements.menuList.querySelector(
							`[data-id="${randomItem.id}"]`,
						);
						if (card) {
							card.scrollIntoView({ behavior: "smooth", block: "center" });
							// Highlight the selected card briefly
							card.classList.add("is-highlighted");
							setTimeout(() => {
								card.classList.remove("is-highlighted");
							}, 2000);
						}
					} finally {
						this.setLoading(false);
					}
				}, 100); // Small delay for visual feedback
			} catch (error) {
				console.error("Error in showRandomItem:", error);
				this.setLoading(false);
			}
		},

		// Single loading state management function
		setLoading(isLoading) {
			this.isLoading = isLoading;
			if (this.elements.loadingDotsContainer) {
				if (isLoading) {
					this.elements.loadingDotsContainer.hidden = false;
					this.elements.loadingDotsContainer.style.display = "flex";
				} else {
					this.elements.loadingDotsContainer.hidden = true;
					this.elements.loadingDotsContainer.style.display = "none";
				}
			}
		},

		toggleTagGuide() {
			if (!this.elements.legend || !this.elements.legendToggle) return;

			const isHidden = this.elements.legend.hidden;
			this.elements.legend.hidden = !isHidden;

			// Update button text
			const textSpan =
				this.elements.legendToggle.querySelector(".tag-guide-text");
			if (textSpan) {
				textSpan.textContent = isHidden
					? "Hide tag guide"
					: "What do these tags mean?";
			}

			// Trigger reflow to ensure transition works
			if (isHidden) {
				// Force a reflow
				void this.elements.legend.offsetHeight;
				this.elements.legend.classList.add("is-expanded");
			} else {
				this.elements.legend.classList.remove("is-expanded");
			}
		},

		createMenuItemCard(item) {
			const card = document.createElement("div");
			card.className = "menu-item-card";
			card.setAttribute("data-id", item.id);

			const priceFormatted = `$${item.price.toFixed(2)}`;

			// Tag priority map for sorting
			const priorityMap = {
				Spicy: 1,
				Vegetarian: 2,
				"Vegetarian Option": 2,
				Popular: 3,
				Seafood: 4,
				Dessert: 5,
				Drink: 6,
			};

			const tags = (item.tags || [])
				.filter((tag) => tag !== "Meal" && tag !== "Meals")
				.sort((a, b) => (priorityMap[a] || 99) - (priorityMap[b] || 99));

			// Max 2 icons per item
			const visibleTags = tags.slice(0, 2);

			const tagsHtml = visibleTags
				.map((tag) => {
					const iconInfo = this.getTagIconInfo(tag);
					return `<span class="tag-icon" title="${tag}">${iconInfo.icon}</span>`;
				})
				.join("");

			card.innerHTML = `
				<div class="menu-card-image" style="background-image: url('${item.image || ''}');">
					<div class="menu-card-overlay">
						<div class="menu-card-content">
							<h3 class="menu-card-title">${item.name}</h3>
							<p class="menu-card-description">${item.description}</p>
							<div class="menu-card-footer">
								<div class="menu-card-price">${priceFormatted}</div>
								<div class="menu-card-tags">${tagsHtml}</div>
							</div>
						</div>
					</div>
				</div>
			`;
			return card;
		},

		// Helper to get icon for a tag
		getTagIconInfo(tagText) {
			const tagMap = {
				Spicy: { icon: "🌶️" },
				Vegetarian: { icon: "🌱" },
				"Vegetarian Option": { icon: "🌱" },
				Popular: { icon: "⭐" },
				Dessert: { icon: "🍰" },
				Drink: { icon: "🥤" },
				Seafood: { icon: "🐟" },
				Healthy: { icon: "🥗" },
				Sweet: { icon: "🍬" },
			};

			return tagMap[tagText] || { icon: "🏷️" };
		},

		// Tooltip functionality (removed - no longer needed)
		initTooltips() {
			// Tooltips removed per user request
		},

		renderPromo() {
			if (!this.promoData || !this.promoData.enabled || !this.elements.promoShowcase) {
				if (this.elements.promoShowcase) {
					this.elements.promoShowcase.hidden = true;
				}
				return;
			}

			const sections = this.promoData.sections || [];
			if (sections.length === 0) {
				if (this.elements.promoShowcase) {
					this.elements.promoShowcase.hidden = true;
				}
				return;
			}

			// Create banner with 3 sections
			const promoHTML = `
				<div class="promo-banner">
					${sections.map((section, index) => `
						<div class="promo-banner-section" data-linked-item="${section.linkedItemId || ''}">
							<div class="promo-banner-image" style="background-image: url('${section.image || ''}');">
								<div class="promo-banner-overlay"></div>
								<div class="promo-banner-content">
									<h4 class="promo-banner-title">${section.title || ''}</h4>
								</div>
							</div>
						</div>
					`).join('')}
				</div>
			`;

			this.elements.promoShowcase.innerHTML = promoHTML;
			this.elements.promoShowcase.hidden = false;

			// Add click handlers for each section
			const bannerSections = this.elements.promoShowcase.querySelectorAll('.promo-banner-section');
			bannerSections.forEach(section => {
				section.addEventListener('click', () => {
					const itemId = section.dataset.linkedItem;
					if (itemId) {
						this.scrollToMenuItem(itemId);
					}
				});
			});
		},

		renderFeaturedDish() {
			if (!this.elements.featuredDish) return;

			// Find featured dish (featured: true) or fallback to first Popular item
			let featuredItem = this.menuItems.find(item => item.featured === true);
			
			if (!featuredItem) {
				featuredItem = this.menuItems.find(item => 
					item.tags && item.tags.includes('Popular')
				);
			}

			if (!featuredItem) {
				this.elements.featuredDish.hidden = true;
				return;
			}

			const priceFormatted = `$${featuredItem.price.toFixed(2)}`;
			const tags = (featuredItem.tags || [])
				.filter((tag) => tag !== "Meal" && tag !== "Meals")
				.slice(0, 2); // Limit to 2 tags
			const tagsHtml = tags
				.map((tag) => {
					const iconInfo = this.getTagIconInfo(tag);
					return `<span class="tag-icon" title="${tag}">${iconInfo.icon}</span>`;
				})
				.join("");

			const featuredHTML = `
				<div class="featured-card">
					<div class="featured-header">
						<span class="featured-label">Chef's Pick</span>
					</div>
					<div class="featured-content">
						<div class="featured-info">
							<h3 class="featured-name">${featuredItem.name}</h3>
							<div class="featured-tags">${tagsHtml}</div>
						</div>
						<div class="featured-footer">
							<span class="featured-price">${priceFormatted}</span>
							<button class="btn btn-featured-cta" data-item-id="${featuredItem.id}">View</button>
						</div>
					</div>
				</div>
			`;

			this.elements.featuredDish.innerHTML = featuredHTML;
			this.elements.featuredDish.hidden = false;

			// Add click handler for CTA
			const ctaButton = this.elements.featuredDish.querySelector('.btn-featured-cta');
			if (ctaButton) {
				ctaButton.addEventListener('click', () => {
					const itemId = ctaButton.dataset.itemId;
					if (itemId) {
						this.scrollToMenuItem(itemId);
					}
				});
			}
		},

		scrollToMenuItem(itemId) {
			// Scroll to the menu item in the menu list
			const card = this.elements.menuList.querySelector(`[data-id="${itemId}"]`);
			if (card) {
				card.scrollIntoView({ behavior: 'smooth', block: 'center' });
				// Highlight the card briefly
				card.classList.add('is-highlighted');
				setTimeout(() => {
					card.classList.remove('is-highlighted');
				}, 2000);
			}
		},

		createTagLegend() {
			if (!this.elements.legendContainer) return;

			// Define legend items with icons
			const tagLegend = {
				Spicy: { icon: "🌶️", label: "Spicy" },
				Vegetarian: { icon: "🌱", label: "Vegetarian" },
				Popular: { icon: "⭐", label: "Popular choice" },
				Dessert: { icon: "🍰", label: "Dessert" },
				Drink: { icon: "🥤", label: "Drink" },
				Seafood: { icon: "🐟", label: "Seafood" },
			};

			const legendItems = Object.keys(tagLegend)
				.map((tag) => {
					const info = tagLegend[tag];
					return `
						<div class="legend-item">
							<span class="legend-icon">${info.icon}</span>
							<span class="legend-text">${info.label}</span>
						</div>
					`;
				})
				.join("");

			this.elements.legendContainer.innerHTML = legendItems;
		},

		showTooltip(element, text) {
			// Hide any existing tooltip
			this.hideTooltip();

			if (!text) return;

			// Create tooltip element
			const tooltip = document.createElement("div");
			tooltip.className = "tooltip tooltip-top";
			tooltip.textContent = text;
			document.body.appendChild(tooltip);

			// Position tooltip
			const rect = element.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();

			// Check if tooltip should be above or below
			const spaceAbove = rect.top;
			const spaceBelow = window.innerHeight - rect.bottom;

			let top, left;

			if (spaceBelow < tooltipRect.height + 20 && spaceAbove > spaceBelow) {
				tooltip.classList.remove("tooltip-top");
				tooltip.classList.add("tooltip-bottom");
				top = rect.bottom + 8;
			} else {
				top = rect.top - tooltipRect.height - 8;
			}

			// Position horizontally centered
			left = rect.left + rect.width / 2 - tooltipRect.width / 2;

			// Keep tooltip within viewport bounds
			const padding = 10;
			if (left < padding) left = padding;
			if (left + tooltipRect.width > window.innerWidth - padding) {
				left = window.innerWidth - tooltipRect.width - padding;
			}

			tooltip.style.position = "fixed";
			tooltip.style.top = `${top}px`;
			tooltip.style.left = `${left}px`;

			// Show tooltip with animation
			requestAnimationFrame(() => {
				tooltip.classList.add("show");
			});

			this.activeTooltip = tooltip;
		},

		hideTooltip() {
			if (this.activeTooltip) {
				this.activeTooltip.classList.remove("show");
				setTimeout(() => {
					if (this.activeTooltip?.parentNode) {
						this.activeTooltip.parentNode.removeChild(this.activeTooltip);
					}
					this.activeTooltip = null;
				}, 200);
			}
		},
	};

	app.init();
});
