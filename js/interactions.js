import { getStreetCombinedData, getTheme } from './data.js';
import { themes } from './themes.js';
import { PROPERTY_SCHEMA } from './schema.js';

export function attachInteractions(layer, feature) {
  const props = feature.properties || {};
  const fullId = props.full_id;

  if (!fullId) return;

  const combinedData = getStreetCombinedData(fullId);
  const currentThemeKey = getTheme();
  const activeTheme = themes[currentThemeKey];
  
  // Get raw underlying theme attribute value
  const rawTargetValue = combinedData[activeTheme?.attribute] || '';

  // --------------------------------------------------------
  // RESOLVE LEGEND DISPLAY LABEL FOR POP-UP
  // --------------------------------------------------------
  let displayLegendLabel = rawTargetValue;

  if (activeTheme && rawTargetValue) {
    // 1. Check if the theme defines ranks (e.g., Historical Epochs, Categorization)
    if (activeTheme.ranks && Array.isArray(activeTheme.ranks)) {
      const matchedRank = activeTheme.ranks.find(r => r.value === rawTargetValue);
      if (matchedRank) {
        displayLegendLabel = matchedRank.label || matchedRank.value;
      }
    } 
    // 2. Check if the theme defines fixed categories (e.g., Local Hero "TRUE")
    else if (activeTheme.categories && activeTheme.categories[rawTargetValue]) {
      const cat = activeTheme.categories[rawTargetValue];
      displayLegendLabel = cat.label || rawTargetValue;
    }
  }

  // --------------------------------------------------------
  // 1. DYNAMIC MAP POPUP GENERATOR
  // --------------------------------------------------------
  let popupHeaderHtml = '';
  let popupRowsHtml = '';

  Object.keys(PROPERTY_SCHEMA).forEach(key => {
    // SKIP active theme's attribute
    if (activeTheme && key === activeTheme.attribute) return;

    const config = PROPERTY_SCHEMA[key];
    const value = combinedData[key] || config.default;
    if (!value || value === 'NULL' || value === '') return;

    if (config.targets.includes('popup_header')) {
      popupHeaderHtml += `<strong style="color: #222; font-size: 13px;">${value}</strong>`;
    }
    if (config.targets.includes('popup_row')) {
      popupRowsHtml += `<span style="font-size: 11px; color: #222;"> (${value})</span>`;
    }
  });

  // Render the exact legend label as the popup subtitle
  let themeRowHtml = '';
  const cleanDisplayLabel = displayLegendLabel ? displayLegendLabel.toString().trim() : '';
  
  if (cleanDisplayLabel && !['TRUE', 'FALSE', '1', '0', 'NULL'].includes(cleanDisplayLabel.toUpperCase())) {
    themeRowHtml = `<br><span style="font-size: 11px; color: #666; font-style: italic;">${cleanDisplayLabel}</span>`;
  }

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

    const renderSequence = Object.keys(PROPERTY_SCHEMA);

    renderSequence.forEach(key => {
      const config = PROPERTY_SCHEMA[key];
      if (!config) return;
      
      const value = combinedData[key] || config.default;
      if (!value || value === 'NULL' || value === '') return;

      if (config.targets.includes('panel_header')) {
        panelHeaderHtml += `<h3 class="info-title" style="margin-top: 0; margin-bottom: 8px;">${value}</h3>`;
      }
      if (config.targets.includes('panel_subheader')) {
        panelSubheaderHtml += `<p class="info-old-names" style="margin: 4px 0; color: #555;"><em>${config.label}: ${value}</em></p>`;
      }
    });

    renderSequence.forEach(key => {
      if (activeTheme && key === activeTheme.attribute) return;

      const config = PROPERTY_SCHEMA[key];
      if (!config) return;

      const value = combinedData[key] || config.default;
      if (!value || value === 'NULL' || value === '') return;

      if (config.targets.includes('panel_row')) {
        if (key === 'trivia' || key === 'description') {
          panelRowsHtml += `
            <div class="panel-section block-section" style="margin: 12px 0;">
              <span class="section-label" style="display: block; font-weight: bold; color: #444; margin-bottom: 4px;">${config.label}</span>
              <p class="section-value" style="margin: 0; line-height: 1.5; color: #222;">${value}</p>
            </div>
          `;
        } else {
          panelRowsHtml += `
            <p class="info-row" style="margin: 6px 0; color: #222;">
              <strong>${config.label}:</strong> ${value}
            </p>
          `;
        }
      }
    });

    const invalidDisplayValues = ['TRUE', 'FALSE', '1', '0', 'NULL', 'UNDEFINED'];
    if (cleanDisplayLabel && !invalidDisplayValues.includes(cleanDisplayLabel.toUpperCase())) {
      panelRowsHtml = `
        <p class="info-row" style="margin: 6px 0; color: #222;">
          <strong>${activeTheme.name}:</strong> ${cleanDisplayLabel}
        </p>
      ` + panelRowsHtml;
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