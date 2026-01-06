document.addEventListener('DOMContentLoaded', () => {
  const app = {
    menuItems: [],
    filteredItems: [],
    currentCategory: null,
    currentSearch: '', // Reintroduce currentSearch
    activeSuggestionIndex: -1, // Reintroduce activeSuggestionIndex
    minimumLoadingTime: 250, // milliseconds (1/4 second)
    loadingStartTime: 0,
    searchTimeout: null, // Add searchTimeout for debouncing

    elements: {
      menuList: document.getElementById('menu-list'),
      noResults: document.getElementById('no-results'),
      categoryButtons: document.querySelectorAll('.quick-actions .btn-pill'),
      loadingDotsContainer: document.getElementById('loading-dots-container'),
      searchInput: document.getElementById('search-input'), // Reintroduce searchInput
      suggestionsContainer: document.getElementById('search-suggestions'), // Reintroduce suggestionsContainer
    },

    init() {
      this.cacheDomElements();
      this.attachListeners();
      this.fetchMenuData();
    },

    cacheDomElements() {
      // The `elements` property is already populated, this is for clarity
    },

    attachListeners() {
      this.elements.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
      this.elements.searchInput.addEventListener('keydown', this.handleSearchKeyDown.bind(this));
      this.elements.suggestionsContainer.addEventListener('click', this.handleSuggestionClick.bind(this));
      
      this.elements.categoryButtons.forEach(button => {
        button.addEventListener('click', () => this.handleCategoryClick(button));
      });

      document.addEventListener('click', (e) => {
        if (!this.elements.suggestionsContainer.contains(e.target) && e.target !== this.elements.searchInput) {
          this.hideSuggestions();
        }
      });
    },

    fetchMenuData() {
      fetch('menu.json')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(menuData => {
          this.menuItems = menuData;
          this.filteredItems = menuData;
          this.renderAllItemsOnce();
        })
        .catch(error => {
          console.error('Error fetching or parsing menu data:', error);
          this.elements.menuList.innerHTML = '<p class="error-state">Could not load menu. Please try again later.</p>';
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
      this.renderSuggestions(); // Call renderSuggestions after filtering
    },


    renderCategorizedItems(items) {
      this.elements.menuList.innerHTML = '';
      const fragment = document.createDocumentFragment();

      const categoryOrder = ['main', 'dessert', 'drink'];
      const categoryNames = {
        main: 'Main Dishes',
        dessert: 'Desserts',
        drink: 'Drinks'
      };

      const grouped = items.reduce((acc, item) => {
        const type = item.type || 'main';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(item);
        return acc;
      }, {});

      categoryOrder.forEach(categoryKey => {
        if (grouped[categoryKey] && grouped[categoryKey].length > 0) {
          const header = document.createElement('h2');
          header.textContent = categoryNames[categoryKey];
          fragment.appendChild(header);
          
          grouped[categoryKey].forEach(item => {
            const card = this.createMenuItemCard(item);
            fragment.appendChild(card);
          });
        }
      });

      this.elements.menuList.appendChild(fragment);
      this.elements.noResults.hidden = items.length > 0;
      this.hideLoadingDots();
    },

    // --- Search Specific Methods ---
    renderSuggestions() {
      const query = this.currentSearch.trim().toLowerCase();
      if (!query) {
        this.hideSuggestions();
        return;
      }

      const suggestions = [];
      const addedItemIds = new Set(); // To prevent duplicate items in suggestions

      // Prioritize exact name matches
      this.menuItems.forEach(item => {
        if (item.name.toLowerCase().includes(query) && !addedItemIds.has(item.id)) {
          suggestions.push({ type: 'Dish', text: item.name, item: item });
          addedItemIds.add(item.id);
        }
      });

      // Then tag matches
      this.menuItems.forEach(item => {
        item.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query) && !addedItemIds.has(item.id)) {
            suggestions.push({ type: 'Tag', text: tag, item: item });
            addedItemIds.add(item.id);
          }
        });
      });

      // Then description matches
      this.menuItems.forEach(item => {
        if (item.description.toLowerCase().includes(query) && !addedItemIds.has(item.id)) {
          suggestions.push({ type: 'Description', text: item.description, item: item });
          addedItemIds.add(item.id);
        }
      });
      

      if (suggestions.length > 0) {
        const suggestionHtml = suggestions.slice(0, 5).map(suggestion => {
          const highlightedName = this.getHighlightedHTML(suggestion.item.name, query);
          const highlightedDesc = this.getHighlightedHTML(suggestion.item.description, query);
          const priceFormatted = `$${suggestion.item.price.toFixed(2)}`;
          return `
            <div class="suggestion-item" data-id="${suggestion.item.id}" data-name="${suggestion.item.name}">
              <div class="suggestion-text">
                <strong>${highlightedName}</strong> - ${priceFormatted} <span class="suggestion-type-label">(${suggestion.type})</span>
                <p class="suggestion-description">${highlightedDesc}</p>
              </div>
            </div>
          `;
        }).join('');
        this.elements.suggestionsContainer.innerHTML = suggestionHtml;
        this.showSuggestions();
      } else {
        this.hideSuggestions();
      }
    },
    
    handleSearchInput() {
      this.currentSearch = this.elements.searchInput.value;
      
      // Debounce the search input
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.renderSuggestions();
      }, 250); // 250ms debounce delay
    },
    
    handleSearchKeyDown(e) {
      const suggestions = this.elements.suggestionsContainer.querySelectorAll('.suggestion-item');
      if (e.key === 'Escape') {
        this.elements.searchInput.value = '';
        this.currentSearch = '';
        this.hideSuggestions();
        this.renderSuggestions(); // Clear suggestions
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.activeSuggestionIndex > -1 && suggestions[this.activeSuggestionIndex]) {
          this.selectSuggestion(suggestions[this.activeSuggestionIndex].dataset.name);
        } else if (suggestions.length > 0 && this.currentSearch.trim() !== '') {
          // If no suggestion is active but there's a search term, select the first one
          this.selectSuggestion(suggestions[0].dataset.name);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if(suggestions.length > 0) {
            this.activeSuggestionIndex = (this.activeSuggestionIndex + (e.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length;
            suggestions.forEach((s, i) => s.classList.toggle('is-active', i === this.activeSuggestionIndex));
            this.elements.searchInput.value = suggestions[this.activeSuggestionIndex].dataset.name; // Update search input with selected suggestion
            // Scroll selected suggestion into view if needed
            suggestions[this.activeSuggestionIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },

    handleSuggestionClick(e) {
        const suggestionEl = e.target.closest('.suggestion-item');
        if (suggestionEl) {
            this.selectSuggestion(suggestionEl.dataset.name);
        }
    },

    selectSuggestion(suggestionText) {
      this.elements.searchInput.value = suggestionText;
      this.currentSearch = suggestionText;
      this.hideSuggestions();
      
      // Find the first matching item in the full menu to scroll to and highlight
      const firstMatch = this.menuItems.find(item => 
        item.name === suggestionText || 
        (Array.isArray(item.tags) && item.tags.includes(suggestionText)) ||
        item.description === suggestionText
      );

      if (firstMatch) {
          const card = this.elements.menuList.querySelector(`[data-id="${firstMatch.id}"]`);
          if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.classList.add('is-highlighted');
              setTimeout(() => {
                  card.classList.remove('is-highlighted');
              }, 1500); // Highlight for 1.5 seconds
          }
      }
    },

    showSuggestions() { this.elements.suggestionsContainer.style.display = 'block'; },
    hideSuggestions() { 
      this.elements.suggestionsContainer.style.display = 'none'; 
      this.activeSuggestionIndex = -1; // Reset active suggestion
    },

    getHighlightedHTML(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'); // Escape regex special chars
      return text.replace(regex, '<span class="highlight">$1</span>');
    },
    

    handleCategoryClick(button) {
      this.elements.searchInput.value = '';
      this.currentSearch = '';
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

    hideLoadingDots() {
      // Ensure loading animation shows for at least minimumLoadingTime (250ms)
      const elapsedTime = Date.now() - (this.loadingStartTime || Date.now());
      const delay = Math.max(0, this.minimumLoadingTime - elapsedTime);

      setTimeout(() => {
        this.elements.loadingDotsContainer.hidden = true;
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
    }
  };

  app.init();
});
