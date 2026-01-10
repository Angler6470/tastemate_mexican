/**
 * TasteMate - Shortcut-Driven Food Decision Engine
 * 
 * This app recommends a single menu item based on user-selected shortcuts.
 * Scoring logic uses hidden attributes in menu.json for intelligent matching.
 * 
 * Architecture:
 * - Category selector (Meal/Dessert/Drink) filters the item pool
 * - Shortcut buttons trigger weighted scoring algorithms
 * - Top-scored items are randomized for variety
 * - "Try Another" reselects from top 3-5 matches
 */

document.addEventListener("DOMContentLoaded", () => {
	const app = {
		menuItems: [],
		config: null,
		selectedCategory: "meal",
		activeShortcut: null,
		activeShortcutLabel: null,
		scoredPool: [],
		currentRecommendation: null,
		lastShortcut: null,
		excludedIngredients: new Set(),
		logoClicks: 0,
		logoClickTimeout: null,

		elements: {
			logo: document.getElementById("logo"),
			appTagline: document.getElementById("app-tagline"),
			appMicrocopy: document.getElementById("app-microcopy"),
			dietaryContainer: document.getElementById("dietary-container"),
			categorySelector: document.getElementById("category-selector"),
			shortcutsGrid: document.getElementById("shortcuts-grid"),
			dietaryToggle: document.getElementById("dietary-toggle"),
			dietaryPanel: document.getElementById("dietary-panel"),
			exclusionChips: document.getElementById("exclusion-chips"),
			spotlightSection: document.getElementById("recommendation-spotlight"),
			spotlightContainer: document.getElementById("spotlight-container"),
			tryAnotherBtn: document.getElementById("try-another-btn"),
			showMenuBtn: document.getElementById("show-menu-btn"),
			menuModal: document.getElementById("menu-modal"),
			modalClose: document.getElementById("modal-close"),
			modalTabsContainer: document.getElementById("modal-category-tabs"),
			menuList: document.getElementById("menu-list"),

			// Admin Elements
			adminPasswordModal: document.getElementById("admin-password-modal"),
			passwordModalClose: document.getElementById("password-modal-close"),
			adminPasswordInput: document.getElementById("admin-password-input"),
			adminLoginBtn: document.getElementById("admin-login-btn"),
			passwordError: document.getElementById("password-error"),
			adminPanelModal: document.getElementById("admin-panel-modal"),
			adminPanelClose: document.getElementById("admin-panel-close"),
			adminTabs: document.getElementById("admin-tabs"),
			adminSaveBtn: document.getElementById("admin-save-btn"),
			adminSaveSuccess: document.getElementById("admin-save-success"),
			menuJsonEditor: document.getElementById("menu-json-editor"),

			// Config Inputs
			configPrimaryColor: document.getElementById("config-primary-color"),
			configBorderRadius: document.getElementById("config-border-radius"),
			configTagline: document.getElementById("config-tagline"),
			configMicrocopy: document.getElementById("config-microcopy"),
			configShowDietary: document.getElementById("config-show-dietary"),
			configAdminPassword: document.getElementById("config-admin-password"),
		},

		init() {
			this.fetchConfig();
			this.attachListeners();
			this.fetchMenuData();
		},

		attachListeners() {
			// Logo Clicks for Admin
			this.elements.logo.addEventListener("click", () => {
				this.handleLogoClick();
			});

			// Admin Password Modal
			this.elements.passwordModalClose.addEventListener("click", () => {
				this.toggleModal(this.elements.adminPasswordModal, false);
			});

			this.elements.adminLoginBtn.addEventListener("click", () => {
				this.verifyAdminPassword();
			});

			this.elements.adminPasswordInput.addEventListener("keypress", (e) => {
				if (e.key === "Enter") this.verifyAdminPassword();
			});

			// Admin Panel Modal
			this.elements.adminPanelClose.addEventListener("click", () => {
				this.toggleModal(this.elements.adminPanelModal, false);
			});

			this.elements.adminTabs.addEventListener("click", (e) => {
				const btn = e.target.closest(".modal-tab-btn");
				if (!btn) return;
				this.switchAdminTab(btn.dataset.tab);
			});

			this.elements.adminSaveBtn.addEventListener("click", () => {
				this.saveAdminChanges();
			});

			// Category Selection
			this.elements.categorySelector.addEventListener("click", (e) => {
				const btn = e.target.closest(".category-btn");
				if (!btn) return;

				this.selectedCategory = btn.dataset.type;
				this.updateActiveCategory();
				// Reset recommendation when category changes
				this.elements.spotlightSection.hidden = true;
				this.activeShortcut = null;
			});

			// Shortcut Buttons
			this.elements.shortcutsGrid.addEventListener("click", (e) => {
				const btn = e.target.closest(".shortcut-btn");
				if (!btn) return;

				const shortcut = btn.dataset.shortcut;
				this.handleShortcut(shortcut);
			});

			// Dietary Exclusions Toggle
			this.elements.dietaryToggle.addEventListener("click", () => {
				const isExpanded = this.elements.dietaryToggle.getAttribute("aria-expanded") === "true";
				const newStatus = !isExpanded;
				
				this.elements.dietaryToggle.setAttribute("aria-expanded", newStatus);
				this.elements.dietaryToggle.classList.toggle("active", newStatus);
				this.elements.dietaryPanel.classList.toggle("open", newStatus);
			});

			// Ingredient Chips
			this.elements.exclusionChips.addEventListener("click", (e) => {
				const chip = e.target.closest(".chip");
				if (!chip) return;

				const ingredient = chip.dataset.ingredient.toLowerCase();
				if (this.excludedIngredients.has(ingredient)) {
					this.excludedIngredients.delete(ingredient);
					chip.classList.remove("excluded");
				} else {
					this.excludedIngredients.add(ingredient);
					chip.classList.add("excluded");
				}

				// If we have an active recommendation, refresh it to respect new filters
				if (this.activeShortcut) {
					this.handleShortcut(this.activeShortcut);
				}
			});

			// Keyboard Shortcuts
			document.addEventListener("keydown", (e) => {
				// Don't trigger if user is typing in an input (though we don't have any yet)
				if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

				const key = e.key.toLowerCase();
				switch (key) {
					case "s":
						this.handleShortcut("surprise");
						break;
					case "f":
						this.handleShortcut("favorite");
						break;
					case "c":
						this.handleShortcut("comfort");
						break;
					case "n":
						this.handleShortcut("different");
						break;
				}
			});

			// Try Another Button
			this.elements.tryAnotherBtn.addEventListener("click", () => {
				this.tryAnother();
			});

			// Show Full Menu Button
			this.elements.showMenuBtn.addEventListener("click", () => {
				this.toggleMenuModal(true);
			});

			// Modal Controls
			this.elements.modalClose.addEventListener("click", () => {
				this.toggleMenuModal(false);
			});

			this.elements.menuModal.addEventListener("click", (e) => {
				if (e.target === this.elements.menuModal) {
					this.toggleMenuModal(false);
				}
			});

			// Modal Category Tabs
			this.elements.modalTabsContainer.addEventListener("click", (e) => {
				const btn = e.target.closest(".modal-tab-btn");
				if (!btn) return;
				
				const category = btn.dataset.tab;
				this.updateModalTabs(category);
				this.renderFullMenu(category);
			});
		},

		handleLogoClick() {
			this.logoClicks++;
			if (this.logoClickTimeout) clearTimeout(this.logoClickTimeout);

			if (this.logoClicks >= 5) {
				this.logoClicks = 0;
				this.toggleModal(this.elements.adminPasswordModal, true);
				this.elements.adminPasswordInput.value = "";
				this.elements.passwordError.hidden = true;
				this.elements.adminPasswordInput.focus();
			} else {
				this.logoClickTimeout = setTimeout(() => {
					this.logoClicks = 0;
				}, 2000); // 2 seconds to complete 5 clicks
			}
		},

		verifyAdminPassword() {
			const entered = this.elements.adminPasswordInput.value;
			const correct = this.config.adminPassword;

			if (entered === correct) {
				this.toggleModal(this.elements.adminPasswordModal, false);
				this.openAdminPanel();
			} else {
				this.elements.passwordError.hidden = false;
			}
		},

		openAdminPanel() {
			this.toggleModal(this.elements.adminPanelModal, true);
			this.switchAdminTab("config");
			this.populateAdminPanel();
		},

		switchAdminTab(tab) {
			const buttons = this.elements.adminTabs.querySelectorAll(".modal-tab-btn");
			buttons.forEach(btn => {
				btn.classList.toggle("active", btn.dataset.tab === tab);
			});

			document.getElementById("admin-tab-config").hidden = (tab !== "config");
			document.getElementById("admin-tab-menu").hidden = (tab !== "menu");
		},

		populateAdminPanel() {
			// Theme
			this.elements.configPrimaryColor.value = this.config.theme.primaryColor;
			this.elements.configBorderRadius.value = parseInt(this.config.theme.borderRadius);
			document.getElementById("config-container-width").value = parseInt(this.config.theme.containerMaxWidth);

			// Copy
			this.elements.configTagline.value = this.config.copy.tagline;
			this.elements.configMicrocopy.value = this.config.copy.microcopy;

			// Layout
			this.elements.configShowDietary.checked = this.config.layout.showDietaryToggle;

			// Password
			this.elements.configAdminPassword.value = this.config.adminPassword;

			// Menu JSON
			this.elements.menuJsonEditor.value = JSON.stringify(this.menuItems, null, 2);
		},

		saveAdminChanges() {
			try {
				// Update Config Object
				this.config.theme.primaryColor = this.elements.configPrimaryColor.value;
				this.config.theme.borderRadius = this.elements.configBorderRadius.value + "px";
				this.config.theme.containerMaxWidth = document.getElementById("config-container-width").value + "px";
				this.config.copy.tagline = this.elements.configTagline.value;
				this.config.copy.microcopy = this.elements.configMicrocopy.value;
				this.config.layout.showDietaryToggle = this.elements.configShowDietary.checked;
				this.config.adminPassword = this.elements.configAdminPassword.value;

				// Update Menu Object
				const newMenu = JSON.parse(this.elements.menuJsonEditor.value);
				
				// 1. Save Config to Backend
				fetch('/api/config', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-admin-token': this.config.adminPassword
					},
					body: JSON.stringify(this.config)
				})
				.then(res => res.json())
				.then(data => {
					if (!data.success) throw new Error('Failed to save config');
					
					// 2. Save Menu to Backend
					return fetch('/api/menu', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-admin-token': this.config.adminPassword
						},
						body: JSON.stringify(newMenu)
					});
				})
				.then(res => res.json())
				.then(data => {
					if (!data.success) throw new Error('Failed to save menu');

					this.menuItems = newMenu;
					this.applyConfig();

					// Success feedback
					this.elements.adminSaveSuccess.hidden = false;
					setTimeout(() => {
						this.elements.adminSaveSuccess.hidden = true;
					}, 3000);
				})
				.catch(err => {
					alert("Error saving changes: " + err.message);
				});

			} catch (err) {
				alert("Error saving changes. Please check your JSON format.\n" + err.message);
			}
		},

		toggleModal(modal, show) {
			modal.hidden = !show;
			document.body.style.overflow = show ? "hidden" : "";
		},

		applyConfig() {
			if (!this.config) return;

			// Apply Colors
			document.documentElement.style.setProperty("--color-orange", this.config.theme.primaryColor);
			
			// Apply Border Radius
			document.documentElement.style.setProperty("--border-radius", this.config.theme.borderRadius);
			document.documentElement.style.setProperty("--border-radius-lg", (parseInt(this.config.theme.borderRadius) * 1.5) + "px");

			// Apply Container Max Width
			document.documentElement.style.setProperty("--container-max-width", this.config.theme.containerMaxWidth);

			// Apply Text
			this.elements.appTagline.textContent = this.config.copy.tagline;
			this.elements.appMicrocopy.textContent = this.config.copy.microcopy;

			// Apply Layout
			this.elements.dietaryContainer.hidden = !this.config.layout.showDietaryToggle;
		},

		fetchConfig() {
			fetch("/api/config")
				.then(res => res.json())
				.then(data => {
					this.config = data;
					this.applyConfig();
				})
				.catch(err => {
					console.error("Error loading config from API:", err);
					// Fallback to static file if API fails (useful for local dev without server)
					fetch("config.json")
						.then(res => res.json())
						.then(data => {
							this.config = data;
							this.applyConfig();
						});
				});
		},

		updateActiveCategory() {
			const buttons = this.elements.categorySelector.querySelectorAll(".category-btn");
			buttons.forEach(btn => {
				btn.classList.toggle("active", btn.dataset.type === this.selectedCategory);
			});
		},

		handleShortcut(shortcut) {
			this.activeShortcut = shortcut;
			this.lastShortcut = shortcut;
			
			// Update active state
			const buttons = this.elements.shortcutsGrid.querySelectorAll(".shortcut-btn");
			buttons.forEach(btn => {
				const isActive = btn.dataset.shortcut === shortcut;
				btn.classList.toggle("active", isActive);
				
				if (isActive) {
					this.activeShortcutLabel = btn.querySelector(".shortcut-label").textContent;
				}
			});

			// Calculate and display recommendation
			this.getRecommendation(shortcut);
		},

		/**
		 * Main recommendation engine
		 * Filters by category, scores by shortcut, returns top match
		 */
		getRecommendation(shortcut) {
			// 1. Initial filter by category
			let pool = this.menuItems.filter(item => item.type === this.selectedCategory);
			
			// 2. Ingredient Exclusions (MVP Feature)
			// Any item containing an excluded ingredient is removed from the pool
			if (this.excludedIngredients.size > 0) {
				pool = pool.filter(item => {
					if (!item.ingredients) return true;
					// Case-insensitive check against excluded set
					return !item.ingredients.some(ing => 
						this.excludedIngredients.has(ing.toLowerCase())
					);
				});
			}

			if (pool.length === 0) {
				this.showEmptyState();
				return;
			}

			// 3. Score each item based on shortcut
			const scoredItems = pool.map(item => ({
				...item,
				score: this.calculateScore(item, shortcut)
			}));

			// 4. Sort by score (highest first)
			scoredItems.sort((a, b) => b.score - a.score);

			// Store top 5 for "Try Another"
			this.scoredPool = scoredItems.slice(0, 5);

			// Select top match
			this.currentRecommendation = scoredItems[0];
			this.renderRecommendation(this.currentRecommendation);
			this.elements.spotlightSection.hidden = false;
		},

		/**
		 * Weighted scoring algorithm for each shortcut
		 * 
		 * Scoring weights (documented for Envato buyers):
		 * - Surprise Me: Random selection from all items (equal weight)
		 * - House Favorite: popularity (0.5) + chefPick (0.3) + isCommonOrder (0.2)
		 * - Comfort Pick: richness (0.4) + low adventurous (0.3) + isCommonOrder (0.3)
		 * - Try Something New: adventurous (0.6) + low popularity (0.4)
		 */
		calculateScore(item, shortcut) {
			const s = item.scoring || {};
			let score = 0;

			switch (shortcut) {
				case "surprise":
					// Random selection - equal weight for all
					score = Math.random();
					break;

				case "favorite":
					// House Favorite: Popular, chef-picked, commonly ordered
					// Weight: popularity 50%, chefPick 30%, isCommonOrder 20%
					score = (s.popularity || 0) * 0.5;
					if (s.chefPick) score += 0.3;
					if (s.isCommonOrder) score += 0.2;
					break;

				case "comfort":
					// Comfort Pick: Rich, familiar, commonly ordered
					// Weight: richness 40%, low adventurous 30%, isCommonOrder 30%
					score = (s.richness || 0) * 0.4;
					score += (1 - (s.adventurous || 0)) * 0.3;
					if (s.isCommonOrder) score += 0.3;
					break;

				case "different":
					// Try Something New: Adventurous, less common
					// Weight: adventurous 60%, inverse popularity 40%
					score = (s.adventurous || 0) * 0.6;
					score += (1 - (s.popularity || 0)) * 0.4;
					break;

				default:
					score = 0;
			}

			return score;
		},

		/**
		 * Try Another: Reselect from top 3-5 scored items (randomized)
		 */
		tryAnother() {
			if (this.scoredPool.length === 0) {
				// Recalculate if pool is empty
				if (this.lastShortcut) {
					this.getRecommendation(this.lastShortcut);
					return;
				}
			}

			// Randomize selection from top 3-5
			const topCount = Math.min(5, this.scoredPool.length);
			const randomIndex = Math.floor(Math.random() * topCount);
			this.currentRecommendation = this.scoredPool[randomIndex];
			
			this.renderRecommendation(this.currentRecommendation);
		},

		/**
		 * Render the recommendation card
		 */
		renderRecommendation(item) {
			if (!item) {
				this.showEmptyState();
				return;
			}

			const tags = item.tags || [];
			const visibleTags = tags.slice(0, 2);

			this.elements.spotlightContainer.innerHTML = `
				<div class="recommendation-card">
					<div class="card-image-container">
						<div class="card-image" style="background-image: url('${item.image}')"></div>
						<div class="card-badge">Recommended</div>
					</div>
					<div class="card-content">
						<div class="card-header">
							<div class="card-title-group">
								${this.activeShortcutLabel ? `<span class="picked-via">Picked via: ${this.activeShortcutLabel}</span>` : ""}
								<h2 class="card-title">${item.name}</h2>
							</div>
							<span class="card-price">$${item.price.toFixed(2)}</span>
						</div>
						<p class="card-description">${item.description}</p>
						${visibleTags.length > 0 ? `
							<div class="card-tags">
								${visibleTags.map(tag => `<span class="tag-badge">${tag}</span>`).join("")}
							</div>
						` : ""}
					</div>
				</div>
			`;

			// Smooth scroll to recommendation
			setTimeout(() => {
				this.elements.spotlightSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}, 100);
		},

		showEmptyState() {
			const hasExclusions = this.excludedIngredients.size > 0;
			const message = hasExclusions 
				? "No matches with those exclusions — try removing one."
				: "No items found in this category.";

			this.elements.spotlightContainer.innerHTML = `
				<div class="empty-state">
					<p>${message}</p>
				</div>
			`;
			this.elements.spotlightSection.hidden = false;
		},

		/**
		 * Full Menu Modal
		 */
		toggleMenuModal(show) {
			this.elements.menuModal.hidden = !show;
			document.body.style.overflow = show ? "hidden" : "";
			
			if (show) {
				const category = this.selectedCategory;
				this.updateModalTabs(category);
				this.renderFullMenu(category);
			}
		},

		updateModalTabs(category) {
			const buttons = this.elements.modalTabsContainer.querySelectorAll(".modal-tab-btn");
			buttons.forEach(btn => {
				btn.classList.toggle("active", btn.dataset.tab === category);
			});
		},

		renderFullMenu(category) {
			const filtered = this.menuItems.filter(item => item.type === category);
			
			if (filtered.length === 0) {
				this.elements.menuList.innerHTML = `<div class="empty-state">No items in this category.</div>`;
				return;
			}

			this.elements.menuList.innerHTML = filtered.map(item => this.createMenuItemCard(item)).join("");
		},

		createMenuItemCard(item) {
			const tags = item.tags || [];
			const visibleTags = tags.slice(0, 2);

			return `
				<div class="menu-item-card">
					<div class="menu-card-image" style="background-image: url('${item.image}')"></div>
					<div class="menu-card-overlay">
						<h4 class="menu-card-title">${item.name}</h4>
						<p class="menu-card-description">${item.description || ""}</p>
						<div class="menu-card-footer">
							<span class="menu-card-price">$${item.price.toFixed(2)}</span>
							${visibleTags.length > 0 ? `
								<div class="menu-card-tags">
									${visibleTags.map(tag => `<span class="tag-badge-small">${tag}</span>`).join("")}
								</div>
							` : ""}
						</div>
					</div>
				</div>
			`;
		},

		fetchMenuData() {
			fetch("/api/menu")
				.then(res => res.json())
				.then(data => {
					this.menuItems = data.menu || [];
				})
				.catch(err => {
					console.error("Error loading menu from API:", err);
					// Fallback to static file
					fetch("menu.json")
						.then(res => res.json())
						.then(data => {
							this.menuItems = data.menu || [];
						});
				});
		}
	};

	app.init();
});
