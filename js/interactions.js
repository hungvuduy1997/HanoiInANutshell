import { getStreetCombinedData, getTheme } from './data.js';
import { themes } from './themes.js';
import { PROPERTY_SCHEMA } from './schema.js';

export function attachInteractions(layer, feature) {
  const props = feature.properties || {};
  const fullId = props.full_id;

  if (!fullId) return;

  const combinedData = getStreetCombinedData(fullId);

  // Retrieve the dynamic active theme classification context
  const currentThemeKey = getTheme();
  const activeTheme = themes[currentThemeKey];
  const targetValue = combinedData[activeTheme?.attribute] || '';

  // --------------------------------------------------------
  // 1. DYNAMIC MAP POPUP GENERATOR
  // --------------------------------------------------------
  let popupHeaderHtml = '';
  let popupRowsHtml = '';

  Object.keys(PROPERTY_SCHEMA).forEach(key => {
    const config = PROPERTY_SCHEMA[key];
    const value = combinedData[key] || config.default;
    if (!value) return;

    if (config.targets.includes('popup_header')) {
      popupHeaderHtml += `<strong style="color: #222; font-size: 13px;">${value}</strong>`;
    }
    if (config.targets.includes('popup_row')) {
      popupRowsHtml += `<span style="font-size: 11px; color: #222;"> (${value})</span>`;
    }
  });

  // Inject active theme classification dynamically as the primary popup detail row
  const themeRowHtml = targetValue ? `<br><span style="font-size: 11px; color: #222;">${targetValue}</span>` : '';

  const popupHTML = `
    <div style="font-family: sans-serif; line-height: 1.4;">
      ${popupHeaderHtml}
      ${themeRowHtml}
      ${popupRowsHtml}
    </div>
  `;
  layer.bindPopup(popupHTML);

  // --------------------------------------------------------
  // 2. DYNAMIC INFO PANEL GENERATOR
  // --------------------------------------------------------
  layer.on('click', () => {
    const panel = document.getElementById('infoPanel');
    if (!panel) return;

    let panelHeaderHtml = '';
    let panelSubheaderHtml = '';
    let panelRowsHtml = '';

    Object.keys(PROPERTY_SCHEMA).forEach(key => {
      const config = PROPERTY_SCHEMA[key];
      const value = combinedData[key] || config.default;
      if (!value) return;

      if (config.targets.includes('panel_header')) {
        panelHeaderHtml += `<h3 class="info-title" style="margin-top: 0; margin-bottom: 8px;">${value}</h3>`;
      }
      if (config.targets.includes('panel_subheader')) {
        panelSubheaderHtml += `<p class="info-old-names" style="margin: 4px 0; color: #222;"><em>${config.label}: ${value}</em></p>`;
      }
      if (config.targets.includes('panel_row')) {
        // Special class modifier for trivia styling to maintain original structure
        const extraClass = key === 'trivia' ? 'info-trivia' : '';
        panelRowsHtml += `<p class="info-row ${extraClass}" style="margin: 6px 0;"><strong>${config.label}:</strong> ${value}</p>`;
      }
    });

    // Inject active theme category row seamlessly right above descriptions
    if (targetValue) {
      panelRowsHtml = `<p class="info-row" style="margin: 6px 0;"><strong>Phân loại chính:</strong> ${targetValue}</p>` + panelRowsHtml;
    }

    panel.innerHTML = `
      <div class="info-content" style="position: relative;">
        <button class="close-panel-btn" style="position: absolute; top: 0; right: 0; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        ${panelHeaderHtml}
        ${panelSubheaderHtml}
        <hr class="info-divider" style="border: 0; border-top: 1px solid #eee; margin: 12px 0;">
        ${panelRowsHtml}
      </div>
    `;
    panel.style.display = 'block';

    const closeBtn = panel.querySelector('.close-panel-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
      });
    }
  });
}