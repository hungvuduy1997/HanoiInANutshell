/**
 * Renders the map legend items dynamically based on the active theme categories
 */
export function updateLegend(categories, theme, currentMode) {
  // 1. Hook into your existing HTML layout elements
  const container = document.getElementById('legendContainer');
  const titleDiv = document.getElementById('legendTitle');
  const itemsDiv = document.getElementById('legendItems');
  const toggleBtn = document.getElementById('legendToggle');

  if (!container || !titleDiv || !itemsDiv) return;

  // 2. Insert the Title Text dynamically
  titleDiv.innerHTML = `<h4 style="margin: 0 0 8px 0; font-size: 14px;">${theme.name || 'Phân loại'}</h4>`;

  // 3. Build the Category Rows layout string
  let itemsHtml = '';
  Object.keys(categories).forEach(key => {
    const cat = categories[key];
    const color = (currentMode === 'dark') ? cat.darkColor : cat.lightColor;
    
    itemsHtml += `
      <div class="legend-row" style="display: flex; align-items: center; margin-bottom: 6px; font-size: 13px;">
        <span class="legend-color-swatch" style="background: ${color}; width: 14px; height: 14px; display: inline-block; margin-right: 8px; border-radius: 2px;"></span>
        <span class="legend-label">${cat.label || key}</span>
      </div>
    `;
  });

  // 4. Inject the compiled rows list into your container layout
  itemsDiv.innerHTML = itemsHtml;

  // 5. Ensure the click listener is bound cleanly and toggles the arrow indicator safely
  if (toggleBtn && !toggleBtn.dataset.listenerAttached) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop the click from registering on the underlying map surface
      
      container.classList.toggle('collapsed');
      
      // Update the arrow symbol indicator state instantly
      const isCollapsed = container.classList.contains('collapsed');
      toggleBtn.textContent = isCollapsed ? '▲' : '▼';
    });
    
    // Prevent duplicated listener loops across theme re-renders
    toggleBtn.dataset.listenerAttached = "true";
  }
}