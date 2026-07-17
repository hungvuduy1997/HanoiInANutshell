import { toggleLegendFilter } from './data.js';

/**
 * Renders the map legend items dynamically based on the active theme categories or dynamic ranks.
 * Adds interactive click mechanics to isolate selected categories and dim non-matching entries.
 */
export function updateLegend(categories, theme, currentMode, getColorForValueFn) {
  const container = document.getElementById('legendContainer');
  const titleDiv = document.getElementById('legendTitle');
  const itemsDiv = document.getElementById('legendItems');
  const toggleBtn = document.getElementById('legendToggle');

  if (!container || !titleDiv || !itemsDiv) return;

  titleDiv.innerHTML = `<h4 style="margin: 0 0 8px 0; font-size: 14px;">${theme.name || 'Phân loại'}</h4>`;

  // Clear any old elements inside the items container
  itemsDiv.innerHTML = '';

  // Standard utility handler to coordinate click transitions across all legend item rows
  const handleLegendClick = (clickedValue, clickedRowElement) => {
    // 1. Fire the state machine filter change inside data.js
    const activeFilter = toggleLegendFilter(clickedValue);

    // 2. Query all sibling rows to update their opacities on the fly
    const allRows = itemsDiv.querySelectorAll('.legend-row');
    allRows.forEach(row => {
      if (activeFilter === null) {
        // No filter active -> reset all items back to full visibility
        row.style.opacity = '1.0';
      } else {
        // Lower the opacity of any non-matching category item
        if (row.getAttribute('data-value') === activeFilter) {
          row.style.opacity = '1.0';
        } else {
          row.style.opacity = '0.25';
        }
      }
    });
  };

  // Branch 1: Dynamic Gradient Ranks (Array-based)
  if (theme.ranks && Array.isArray(categories)) {
    categories.forEach(item => {
      const valueStr = item.value;
      const labelStr = item.label || valueStr;
      const color = typeof getColorForValueFn === 'function' 
        ? getColorForValueFn(theme, valueStr, currentMode)
        : ((currentMode === 'dark') ? '#b0bec5' : '#546e7a');
      
      const rowEl = document.createElement('div');
      rowEl.className = 'legend-row';
      rowEl.setAttribute('data-value', valueStr);
      rowEl.style.cssText = 'display: flex; align-items: center; margin-bottom: 6px; font-size: 13px; cursor: pointer; transition: opacity 0.2s ease-in-out;';

      rowEl.innerHTML = `
        <span class="legend-color-swatch" style="background: ${color}; width: 14px; height: 14px; display: inline-block; margin-right: 8px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.15);"></span>
        <span class="legend-label" style="user-select: none;">${labelStr}</span>
      `;

      rowEl.addEventListener('click', () => handleLegendClick(valueStr, rowEl));
      itemsDiv.appendChild(rowEl);
    });
  } 
  // Branch 2: Fixed Category Definitions (Object-based)
  else {
    Object.keys(categories || {}).forEach(key => {
      const cat = categories[key];
      const labelStr = cat.label || key;
      const color = (currentMode === 'dark') ? cat.darkColor : cat.lightColor;
      
      const rowEl = document.createElement('div');
      rowEl.className = 'legend-row';
      rowEl.setAttribute('data-value', key);
      rowEl.style.cssText = 'display: flex; align-items: center; margin-bottom: 6px; font-size: 13px; cursor: pointer; transition: opacity 0.2s ease-in-out;';

      rowEl.innerHTML = `
        <span class="legend-color-swatch" style="background: ${color}; width: 14px; height: 14px; display: inline-block; margin-right: 8px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.15);"></span>
        <span class="legend-label" style="user-select: none;">${labelStr}</span>
      `;

      rowEl.addEventListener('click', () => handleLegendClick(key, rowEl));
      itemsDiv.appendChild(rowEl);
    });
  }

  // Preserve your existing collapse action button configuration
  if (toggleBtn && !toggleBtn.dataset.listenerAttached) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('collapsed');
      toggleBtn.innerText = container.classList.contains('collapsed') ? '▲' : '▼';
    });
    toggleBtn.dataset.listenerAttached = "true";
  }
}