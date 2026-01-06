document.addEventListener('DOMContentLoaded', () => {
  const menuList = document.getElementById('menu-list');

  fetch('menu.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(menuData => {
      renderMenu(menuData);
    })
    .catch(error => {
      console.error('Error fetching or parsing menu data:', error);
      menuList.innerHTML = '<p class="error-state">Could not load menu. Please try again later.</p>';
    });

  function renderMenu(items) {
    if (!items || items.length === 0) {
      menuList.innerHTML = '<p class="empty-state">No menu items available at the moment.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const card = createMenuItemCard(item);
      fragment.appendChild(card);
    });
    menuList.appendChild(fragment);
  }

  function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.setAttribute('data-id', item.id);

    const priceFormatted = `$${item.price.toFixed(2)}`;

    const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p class="description">${item.description}</p>
      <div class="tags">${tagsHtml}</div>
      <div class="price">${priceFormatted}</div>
    `;

    return card;
  }
});