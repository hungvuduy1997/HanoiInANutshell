/**
 * Renders the map legend items dynamically based on the active theme categories or dynamic ranks
 */
export function updateLegend(categories, theme, currentMode, getColorForValueFn) {
  const container = document.getElementById('legendContainer');
  const titleDiv = document.getElementById('legendTitle');
  const itemsDiv = document.getElementById('legendItems');
  const toggleBtn = document.getElementById('legendToggle');

  if (!container || !titleDiv || !itemsDiv) return;

  titleDiv.innerHTML = `<h4 style="margin: 0 0 8px 0; font-size: 14px;">${theme.name || 'Phân loại'}</h4>`;

  let itemsHtml = '';

  if (theme.isDynamicGradient && Array.isArray(categories)) {
    categories.forEach(item => {
      // Safely consume the Hue-stepping function context passed down from applyTheme
      const color = typeof getColorForValueFn === 'function' 
        ? getColorForValueFn(theme, item.value, currentMode)
        : ((currentMode === 'dark') ? '#b0bec5' : '#546e7a');
      
      itemsHtml += `
        <div class="legend-row" style="display: flex; align-items: center; margin-bottom: 6px; font-size: 13px;">
          <span class="legend-color-swatch" style="background: ${color}; width: 14px; height: 14px; display: inline-block; margin-right: 8px; border-radius: 2px;"></span>
          <span class="legend-label">${item.label || item.value}</span>
        </div>
      `;
    });
  } else {
    Object.keys(categories || {}).forEach(key => {
      const cat = categories[key];
      const color = (currentMode === 'dark') ? cat.darkColor : cat.lightColor;
      
      itemsHtml += `
        <div class="legend-row" style="display: flex; align-items: center; margin-bottom: 6px; font-size: 13px;">
          <span class="legend-color-swatch" style="background: ${color}; width: 14px; height: 14px; display: inline-block; margin-right: 8px; border-radius: 2px;"></span>
          <span class="legend-label">${cat.label || key}</span>
        </div>
      `;
    });
  }

  itemsDiv.innerHTML = itemsHtml;

  if (toggleBtn && !toggleBtn.dataset.listenerAttached) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('collapsed');
      toggleBtn.innerText = container.classList.contains('collapsed') ? '▲' : '▼';
    });
    toggleBtn.dataset.listenerAttached = "true";
  }
}