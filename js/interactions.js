import { getStreetCombinedData, getTheme } from './data.js';
import { themes } from './themes.js';
import { PROPERTY_SCHEMA } from './schema.js';

/**
 * Attaches interactive map behaviors to a specific geographic vector street layer.
 * Configures responsive mouse popups and the structural detailed data panel.
 */
export function attachInteractions(layer, feature) {
  const props = feature.properties || {};
  const fullId = props.full_id;

  if (!fullId) return;

  // Fetch consolidated attributes from the flat relational store
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
    // SKIP if this key is the active theme's primary attribute (handled conditionally below)
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

  // Only render the theme subtitle if it's meaningful (not "TRUE", "FALSE", "1", or empty)
  let themeRowHtml = '';
  if (targetValue && !['TRUE', 'FALSE', '1', '0', 'NULL'].includes(targetValue.toString().toUpperCase().trim())) {
    themeRowHtml = `<br><span style="font-size: 11px; color: #666; font-style: italic;">${targetValue}</span>`;
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

    // Define the render sequence from the relational schema keys
    const renderSequence = Object.keys(PROPERTY_SCHEMA);

    // Parse structural headers and subheaders first
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

    // Process the detailed body rows exactly once in sequence order[cite: 2]
    renderSequence.forEach(key => {
      // SKIP if this key is the active theme's primary attribute (we prepend it as a highlight below!)
      if (activeTheme && key === activeTheme.attribute) return;

      const config = PROPERTY_SCHEMA[key];
      if (!config) return;

      const value = combinedData[key] || config.default;
      if (!value || value === 'NULL' || value === '') return;

      if (config.targets.includes('panel_row')) {
        if (key === 'trivia' || key === 'description') {
          // Elegant block layout for long paragraph content blocks
          panelRowsHtml += `
            <div class="panel-section block-section" style="margin: 12px 0;">
              <span class="section-label" style="display: block; font-weight: bold; color: #444; margin-bottom: 4px;">${config.label}</span>
              <p class="section-value" style="margin: 0; line-height: 1.5; color: #222;">${value}</p>
            </div>
          `;
        } else {
          // Clean, compact inline layout for short parameters
          panelRowsHtml += `
            <p class="info-row" style="margin: 6px 0; color: #222;">
              <strong>${config.label}:</strong> ${value}
            </p>
          `;
        }
      }
    });

  // Cleanly prepend the active theme's highlighted classification at the top of the body
  // (Filters out meaningless values like "TRUE", "FALSE", "1", "0", etc.)
  const invalidDisplayValues = ['TRUE', 'FALSE', '1', '0', 'NULL', 'UNDEFINED'];
  const cleanTargetVal = targetValue ? targetValue.toString().toUpperCase().trim() : '';

  if (targetValue && !invalidDisplayValues.includes(cleanTargetVal)) {
    panelRowsHtml = `
      <p class="info-row" style="margin: 6px 0; color: #222;">
        <strong>${activeTheme.name}:</strong> ${targetValue}
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

    // Hook up immediate close button interactions
    const closeBtn = panel.querySelector('.close-panel-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
      });
    }
  });
}