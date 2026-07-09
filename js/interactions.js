import { getStreetCombinedData, getTheme } from './data.js';
import { themes } from './themes.js';

export function attachInteractions(layer, feature) {
  const props = feature.properties || {};
  const fullId = props.full_id;

  if (!fullId) return;

  // Retrieve the unified relational database record for this street ID
  const combinedData = getStreetCombinedData(fullId);

  // 1. Determine the target classification value based on the currently active map theme
  const currentThemeKey = getTheme();
  const activeTheme = themes[currentThemeKey];
  const targetValue = combinedData[activeTheme?.attribute] || '';

  // 2. Build the minimalist popup tooltip template for map hovers/clicks
  const popupHTML = `
    <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
      <strong style="color: #222;">${combinedData.street_name || ''}</strong>
      ${targetValue ? `<br><span style="font-size: 11px; color: #666;">${targetValue}</span>` : ''}
    </div>
  `;

  layer.bindPopup(popupHTML);
  
  // 3. Attach click event handler to update and reveal the detailed Info Panel layout
  layer.on('click', () => {
    const panel = document.getElementById('infoPanel');
    if (panel) {
      // Inject structural template markup with bold labels and strict clean data conditional visibility
      panel.innerHTML = `
        <div class="info-content" style="position: relative;">
          <button class="close-panel-btn" style="position: absolute; top: 0; right: 0; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
          
          <h3 class="info-title" style="margin-top: 0; margin-bottom: 8px;">${combinedData.street_name || ''}</h3>
          ${combinedData.old_names ? `<p class="info-old-names" style="margin: 4px 0; color: #666;"><em>Tên cũ: ${combinedData.old_names}</em></p>` : ''}
          <hr class="info-divider" style="border: 0; border-top: 1px solid #eee; margin: 12px 0;">
          
          ${targetValue ? `<p class="info-row" style="margin: 6px 0;"><strong>Phân loại chính:</strong> ${targetValue}</p>` : ''}
          ${combinedData.description ? `<p class="info-row" style="margin: 6px 0;"><strong>Mô tả:</strong> ${combinedData.description}</p>` : ''}
          ${combinedData.trivia ? `<p class="info-row info-trivia" style="margin: 6px 0;"><strong>Thông tin bên lề:</strong> ${combinedData.trivia}</p>` : ''}
        </div>
      `;
      panel.style.display = 'block';

      // Bind close interaction event directly to the template button element
      const closeBtn = panel.querySelector('.close-panel-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          panel.style.display = 'none';
        });
      }
    }
  });
}