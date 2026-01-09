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
		selectedCategory: "meal",
		activeShortcut: null,
		scoredPool: [],
		currentRecommendation: null,
		lastShortcut: null,

		elements: {
			categorySelector: document.getElementById("category-selector"),
			shortcutsGrid: document.getElementById("shortcuts-grid"),
			spotlightSection: document.getElementById("recommendation-spotlight"),
			spotlightContainer: document.getElementById("spotlight-container"),
			tryAnotherBtn: document.getElementById("try-another-btn"),
			showMenuBtn: document.getElementById("show-menu-btn"),
			menuModal: document.getElementById("menu-modal"),
			modalClose: document.getElementById("modal-close"),
			modalTabsContainer: document.getElementById("modal-category-tabs"),
			menuList: document.getElementById("menu-list"),
		},

		init() {
			this.attachListeners();
			this.fetchMenuData();
		},

		attachListeners() {
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
				btn.classList.toggle("active", btn.dataset.shortcut === shortcut);
			});

			// Calculate and display recommendation
			this.getRecommendation(shortcut);
		},

		/**
		 * Main recommendation engine
		 * Filters by category, scores by shortcut, returns top match
		 */
		getRecommendation(shortcut) {
			// Filter by category
			const pool = this.menuItems.filter(item => item.type === this.selectedCategory);
			
			if (pool.length === 0) {
				this.showEmptyState();
				return;
			}

			// Score each item based on shortcut
			const scoredItems = pool.map(item => ({
				...item,
				score: this.calculateScore(item, shortcut)
			}));

			// Sort by score (highest first)
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
							<h2 class="card-title">${item.name}</h2>
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
			this.elements.spotlightContainer.innerHTML = `
				<div class="empty-state">
					<p>No items found in this category.</p>
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
			fetch("menu.json")
				.then(res => {
					if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
					return res.json();
				})
				.then(data => {
					this.menuItems = data.menu || [];
				})
				.catch(err => {
					console.error("Error loading menu:", err);
					this.elements.spotlightContainer.innerHTML = `
						<div class="empty-state">
							<p>Error loading menu. Please refresh the page.</p>
						</div>
					`;
				});
		}
	};

	app.init();
});
