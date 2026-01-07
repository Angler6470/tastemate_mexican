document.addEventListener('DOMContentLoaded', () => {
  const app = {
    menuItems: [],
    filteredItems: [],
    currentCategory: null,
    activeTooltip: null, // Track currently active tooltip
    activeMenuTab: 'all', // Track active menu tab
    isLoading: false, // Track loading state

    elements: {
      menuList: document.getElementById('menu-list'),
      noResults: document.getElementById('no-results'),
      categoryButtons: document.querySelectorAll('.filter-btn--chip[data-category]'),
      loadingDotsContainer: document.getElementById('loading-dots-container'),
      menuTabs: document.querySelectorAll('.filter-btn--segmented[data-tab]'),
      legendContainer: document.getElementById('legend-items'),
      legendToggle: document.getElementById('tag-guide-toggle'),
      legend: document.getElementById('tag-legend'),
      primaryAction: document.querySelector('.btn-primary-action'),
    },

    init() {
      this.cacheDomElements();
      this.attachListeners();
      // Start with menu list hidden
      if (this.elements.menuList) {
        this.elements.menuList.style.opacity = '0';
      }
      this.fetchMenuData();
    },

    cacheDomElements() {
      // The `elements` property is already populated, this is for clarity
    },

    attachListeners() {
      this.elements.categoryButtons.forEach(button => {
        button.addEventListener('click', () => this.handleCategoryClick(button));
      });

      // Menu tabs (now using filter-btn class)
      this.elements.menuTabs.forEach(button => {
        button.addEventListener('click', () => this.handleMenuTabClick(button));
      });

      // Primary action button
      if (this.elements.primaryAction) {
        this.elements.primaryAction.addEventListener('click', () => {
          this.showRandomItem();
        });
      }

      // Legend toggle
      if (this.elements.legendToggle) {
        this.elements.legendToggle.addEventListener('click', () => {
          this.toggleTagGuide();
        });
      }

      // Initialize tooltips
      this.initTooltips();
    },

    fetchMenuData() {
      this.setLoading(true);
      try {
        fetch('menu.json')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(menuData => {
            this.menuItems = menuData;
            this.filteredItems = menuData;
            this.renderAllItemsOnce();
            this.elements.menuList.style.opacity = '1';
            this.createTagLegend(); // Create legend after menu data is loaded
          })
          .catch(error => {
            console.error('Error fetching or parsing menu data:', error);
            this.elements.menuList.innerHTML = '<p class="error-state">Could not load menu. Please try again later.</p>';
            this.elements.menuList.style.opacity = '1';
          })
          .finally(() => {
            this.setLoading(false);
          });
      } catch (error) {
        console.error('Error in fetchMenuData:', error);
        this.setLoading(false);
      }
    },

    renderAllItemsOnce() {
      this.renderCategorizedItems(this.menuItems);
    },

    performFilter() {
      this.setLoading(true);
      try {
        let items = this.menuItems;

        // Filter by category
        if (this.currentCategory && this.currentCategory !== 'surprise') {
          items = items.filter(item => item.tags && item.tags.includes(this.currentCategory));
        }
        
        this.filteredItems = items;
        this.renderCategorizedItems(this.filteredItems);
      } finally {
        this.setLoading(false);
      }
    },


    renderCategorizedItems(items) {
      // Only fade on category change, not every interaction
      this.elements.menuList.style.opacity = '0.5';
      
      // Update content quickly
      setTimeout(() => {
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
        
        // Fade in content
        this.elements.menuList.style.opacity = '1';
      }, 100); // Quick transition
    },

    handleMenuTabClick(button) {
      this.setLoading(true);
      try {
        // Update active tab
        this.elements.menuTabs.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Clear category filters when switching tabs
        this.elements.categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.currentCategory = null;
        
        this.activeMenuTab = button.dataset.tab;
        
        // Re-render menu with new tab filter
        this.renderCategorizedItems(this.filteredItems);
      } finally {
        this.setLoading(false);
      }
    },

    handleCategoryClick(button) {
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
      
      this.performFilter(); // This will handle loading state
    },

    showRandomItem() {
      this.setLoading(true);
      try {
        // Don't clear filters - work with current active filters
        let items = this.menuItems;

        // Filter by active tab if not "all"
        if (this.activeMenuTab !== 'all') {
          items = items.filter(item => (item.type || 'main') === this.activeMenuTab);
        }

        // Filter by active category tag if one is selected
        if (this.currentCategory && this.currentCategory !== 'surprise') {
          items = items.filter(item => item.tags && item.tags.includes(this.currentCategory));
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

            const card = this.elements.menuList.querySelector(`[data-id="${randomItem.id}"]`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the selected card briefly
              card.classList.add('is-highlighted');
              setTimeout(() => {
                card.classList.remove('is-highlighted');
              }, 2000);
            }
          } finally {
            this.setLoading(false);
          }
        }, 100); // Small delay for visual feedback
      } catch (error) {
        console.error('Error in showRandomItem:', error);
        this.setLoading(false);
      }
    },
    
    // Single loading state management function
    setLoading(isLoading) {
      this.isLoading = isLoading;
      if (this.elements.loadingDotsContainer) {
        if (isLoading) {
          this.elements.loadingDotsContainer.hidden = false;
          this.elements.loadingDotsContainer.style.display = 'flex';
        } else {
          this.elements.loadingDotsContainer.hidden = true;
          this.elements.loadingDotsContainer.style.display = 'none';
        }
      }
    },

    toggleTagGuide() {
      if (!this.elements.legend || !this.elements.legendToggle) return;
      
      const isHidden = this.elements.legend.hidden;
      this.elements.legend.hidden = !isHidden;
      
      // Update button text
      const textSpan = this.elements.legendToggle.querySelector('.tag-guide-text');
      if (textSpan) {
        textSpan.textContent = isHidden ? 'Hide tag guide' : 'What do these tags mean?';
      }
      
      // Trigger reflow to ensure transition works
      if (isHidden) {
        // Force a reflow
        void this.elements.legend.offsetHeight;
        this.elements.legend.classList.add('is-expanded');
      } else {
        this.elements.legend.classList.remove('is-expanded');
      }
    },
    
    createMenuItemCard(item) {
      const card = document.createElement('div');
      card.className = 'menu-item-card';
      card.setAttribute('data-id', item.id);

      const priceFormatted = `$${item.price.toFixed(2)}`;
      
      // Show all tags (no overflow limit)
      const tags = (item.tags || []).filter(tag => tag !== 'Meal' && tag !== 'Meals'); // Remove Meal/Meals tags
      const tagsHtml = tags.map(tag => {
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

      // Only show 6 most important/common tags (removed Meal)
      const tagLegend = {
        'Popular': 'Most loved dishes',
        'Spicy': 'Has heat',
        'Vegetarian': 'Vegetarian friendly',
        'Sweet': 'Sweet treat',
        'Healthy': 'Nutritious choice',
        'Cheesy': 'Cheese lovers'
      };

      const tagColorMap = {
        'Popular': 'tag-popular',
        'Spicy': 'tag-spicy',
        'Vegetarian': 'tag-vegetarian',
        'Sweet': 'tag-sweet',
        'Healthy': 'tag-healthy',
        'Cheesy': 'tag-cheesy'
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
