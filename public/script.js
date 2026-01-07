document.addEventListener('DOMContentLoaded', () => {
  const app = {
    menuItems: [],
    filteredItems: [],
    currentCategory: null,
    minimumLoadingTime: 800, // milliseconds (0.8 seconds)
    loadingStartTime: 0,
    activeTooltip: null, // Track currently active tooltip
    activeMenuTab: 'all', // Track active menu tab

    elements: {
      menuList: document.getElementById('menu-list'),
      noResults: document.getElementById('no-results'),
      categoryButtons: document.querySelectorAll('.quick-actions .btn-pill'),
      loadingDotsContainer: document.getElementById('loading-dots-container'),
      menuTabs: document.getElementById('menu-tabs'),
      legendContainer: document.getElementById('legend-items'),
    },

    init() {
      this.cacheDomElements();
      this.attachListeners();
      // Start with menu list hidden
      if (this.elements.menuList) {
        this.elements.menuList.style.opacity = '0';
      }
      this.createTagLegend();
      this.fetchMenuData();
    },

    cacheDomElements() {
      // The `elements` property is already populated, this is for clarity
    },

    attachListeners() {
      this.elements.categoryButtons.forEach(button => {
        button.addEventListener('click', () => this.handleCategoryClick(button));
      });

      // Menu tabs
      if (this.elements.menuTabs) {
        const tabButtons = this.elements.menuTabs.querySelectorAll('.menu-tab');
        tabButtons.forEach(button => {
          button.addEventListener('click', () => this.handleMenuTabClick(button));
        });
      }

      // Initialize tooltips
      this.initTooltips();
    },

    fetchMenuData() {
      this.showLoadingDots();
      fetch('menu.json')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(menuData => {
          this.menuItems = menuData;
          this.filteredItems = menuData;
          this.createTagLegend(); // Update legend with actual menu data
          this.renderAllItemsOnce();
        })
        .catch(error => {
          console.error('Error fetching or parsing menu data:', error);
          this.elements.menuList.innerHTML = '<p class="error-state">Could not load menu. Please try again later.</p>';
          this.hideLoadingDots(() => {
            this.elements.menuList.style.opacity = '1';
          });
        });
    },

    renderAllItemsOnce() {
      this.renderCategorizedItems(this.menuItems);
    },

    performFilter() {
      this.showLoadingDots();
      let items = this.menuItems;

      // Filter by category
      if (this.currentCategory && this.currentCategory !== 'surprise') {
        items = items.filter(item => item.tags && item.tags.includes(this.currentCategory));
      }
      
      this.filteredItems = items;
      this.renderCategorizedItems(this.filteredItems); // This will still handle the main menu display
    },


    renderCategorizedItems(items) {
      // Hide menu list while loading
      this.elements.menuList.style.opacity = '0';
      this.elements.menuList.innerHTML = '';
      const fragment = document.createDocumentFragment();

      // Filter by active tab if not "all"
      let itemsToShow = items;
      if (this.activeMenuTab !== 'all') {
        itemsToShow = items.filter(item => (item.type || 'main') === this.activeMenuTab);
      }

      // Render items without category headers (tabs handle navigation)
      itemsToShow.forEach(item => {
        const card = this.createMenuItemCard(item);
        fragment.appendChild(card);
      });

      this.elements.menuList.appendChild(fragment);
      this.elements.noResults.hidden = itemsToShow.length > 0;
      
      // Hide loading dots and show content after minimum loading time
      this.hideLoadingDots(() => {
        this.elements.menuList.style.opacity = '1';
      });
    },

    handleMenuTabClick(button) {
      // Update active tab
      const tabButtons = this.elements.menuTabs.querySelectorAll('.menu-tab');
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      this.activeMenuTab = button.dataset.tab;
      
      // Re-render menu with new tab filter
      this.renderCategorizedItems(this.filteredItems);
    },

    handleCategoryClick(button) {
      this.showLoadingDots();
      const newCategory = button.dataset.category;

      if (newCategory === 'surprise') {
        this.showRandomItem();
        return;
      }

      // Deactivate all buttons
      this.elements.categoryButtons.forEach(btn => btn.classList.remove('active'));

      if (this.currentCategory === newCategory) {
        // If the same category is clicked again, deactivate it and show all items.
        this.currentCategory = null;
      } else {
        // Activate the new category
        this.currentCategory = newCategory;
        button.classList.add('active');
      }
      
      this.performFilter();
    },

    showRandomItem() {
      this.showLoadingDots();
      this.currentCategory = null;
      this.elements.categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.performFilter(); // Clear existing filters visually

      // Do not clear search input when "surprise me" is clicked
      // this.elements.searchInput.value = ''; 
      // this.currentSearch = '';

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * this.menuItems.length);
        const randomItem = this.menuItems[randomIndex];
        this.filteredItems = [randomItem];
        this.renderCategorizedItems(this.filteredItems);

        const card = this.elements.menuList.querySelector(`[data-id="${randomItem.id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        this.hideLoadingDots();
      }, 100); // Small delay for visual feedback
    },
    
    // Helper functions for loading dots
    showLoadingDots() {
      this.elements.loadingDotsContainer.hidden = false;
      this.loadingStartTime = Date.now();
    },

    hideLoadingDots(callback) {
      // Ensure loading animation shows for at least minimumLoadingTime (0.8 seconds)
      const elapsedTime = Date.now() - (this.loadingStartTime || Date.now());
      const delay = Math.max(0, this.minimumLoadingTime - elapsedTime);

      setTimeout(() => {
        this.elements.loadingDotsContainer.hidden = true;
        if (callback) callback();
      }, delay);
    },
    
    createMenuItemCard(item) {
      const card = document.createElement('div');
      card.className = 'menu-item-card';
      card.setAttribute('data-id', item.id);

      const priceFormatted = `$${item.price.toFixed(2)}`;
      
      const tagsHtml = item.tags.map(tag => {
        const tagColorClass = this.getTagColorClass(tag);
        return `<span class="tag ${tagColorClass}">${tag}</span>`;
      }).join('');

      card.innerHTML = `
        <h3>${item.name}</h3>
        <p class="description">${item.description}</p>
        <div class="tags">${tagsHtml}</div>
        <div class="price">${priceFormatted}</div>
      `;
      return card;
    },

    // Helper to generate a consistent color class for each tag based on flavor
    getTagColorClass(tagText) {
      // Map tags to flavor-appropriate colors
      const tagColorMap = {
        'Spicy': 'tag-spicy',
        'Sweet': 'tag-sweet',
        'Vegetarian': 'tag-vegetarian',
        'Vegetarian Option': 'tag-vegetarian',
        'Healthy': 'tag-healthy',
        'Popular': 'tag-popular',
        'Meal': 'tag-meal',
        'Cheesy': 'tag-cheesy',
        'Meat': 'tag-meat',
        'Chicken': 'tag-chicken',
        'Seafood': 'tag-seafood',
        'Dessert': 'tag-dessert',
        'Drink': 'tag-drink',
        'Refreshing': 'tag-refreshing',
        'Shareable': 'tag-shareable',
        'Comfort Food': 'tag-comfort',
        'Mocktail': 'tag-mocktail',
        'Fizzy': 'tag-fizzy'
      };

      // Return mapped color or fallback to hash-based for unknown tags
      if (tagColorMap[tagText]) {
        return tagColorMap[tagText];
      }

      // Fallback for any unmapped tags
      let hash = 0;
      for (let i = 0; i < tagText.length; i++) {
        hash = tagText.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colorIndex = Math.abs(hash) % 6;
      return `tag-color-${colorIndex}`;
    },

    // Tooltip functionality (removed - no longer needed)
    initTooltips() {
      // Tooltips removed per user request
    },

    createTagLegend() {
      if (!this.elements.legendContainer) return;

      // Only show 6 most important/common tags
      const tagLegend = {
        'Popular': 'Most loved dishes',
        'Spicy': 'Has heat',
        'Vegetarian': 'Vegetarian friendly',
        'Sweet': 'Sweet treat',
        'Meal': 'Complete meal',
        'Healthy': 'Nutritious choice'
      };

      const tagColorMap = {
        'Popular': 'tag-popular',
        'Spicy': 'tag-spicy',
        'Vegetarian': 'tag-vegetarian',
        'Sweet': 'tag-sweet',
        'Meal': 'tag-meal',
        'Meals': 'tag-meal',
        'Healthy': 'tag-healthy'
      };

      // Create legend items for only the 6 selected tags
      const selectedTags = Object.keys(tagLegend);
      const legendItems = selectedTags
        .map(tag => {
          const colorClass = tagColorMap[tag] || 'tag-color-0';
          return `
            <div class="legend-item">
              <span class="legend-dot ${colorClass}"></span>
              <span class="legend-text">${tagLegend[tag]}</span>
            </div>
          `;
        })
        .join('');

      this.elements.legendContainer.innerHTML = legendItems;
    },


    showTooltip(element, text) {
      // Hide any existing tooltip
      this.hideTooltip();

      if (!text) return;

      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip tooltip-top';
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
        tooltip.classList.remove('tooltip-top');
        tooltip.classList.add('tooltip-bottom');
        top = rect.bottom + 8;
      } else {
        top = rect.top - tooltipRect.height - 8;
      }

      // Position horizontally centered
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      
      // Keep tooltip within viewport bounds
      const padding = 10;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }

      tooltip.style.position = 'fixed';
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      // Show tooltip with animation
      requestAnimationFrame(() => {
        tooltip.classList.add('show');
      });

      this.activeTooltip = tooltip;
    },

    hideTooltip() {
      if (this.activeTooltip) {
        this.activeTooltip.classList.remove('show');
        setTimeout(() => {
          if (this.activeTooltip && this.activeTooltip.parentNode) {
            this.activeTooltip.parentNode.removeChild(this.activeTooltip);
          }
          this.activeTooltip = null;
        }, 200);
      }
    }
  };

  app.init();
});
