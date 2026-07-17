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
    if (!value || value === 'NULL' || value === '') return;

    if (config.targets.includes('popup_header')) {
      popupHeaderHtml += `<strong style="color: #222; font-size: 13px;">${value}</strong>`;
    }
    if (config.targets.includes('popup_row')) {
      popupRowsHtml += `<span style="font-size: 11px; color: #222;"> (${value})</span>`;
    }
  });

  // Inject active theme classification dynamically as the primary popup detail row
  const themeRowHtml = targetValue ? `<br><span style="font-size: 11px; color: #555; font-style: italic;">${activeTheme.name}: ${targetValue}</span>` : '';

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

    // Inside js/interactions.js (Info Panel Generator)

// 1. Automatically grab every single key in the exact order defined in schema.js!
const renderSequence = Object.keys(PROPERTY_SCHEMA);

// 2. Loop through them and let the schema's 'targets' array decide if it belongs in the panel body
renderSequence.forEach(key => {
  const config = PROPERTY_SCHEMA[key];
  if (!config) return;

  const value = combinedData[key] || config.default;
  if (!value || value === 'NULL' || value === '') return;

  // If the schema config says this is destined for a panel row, render it!
  if (config.targets.includes('panel_row')) {
    if (key === 'trivia' || key === 'description') {
      // Elegant block styling for longer text blocks
      panelRowsHtml += `
        <div class="panel-section block-section" style="margin: 12px 0;">
          <span class="section-label" style="display: block; font-weight: bold; color: #444; margin-bottom: 4px;">${config.label}</span>
          <p class="section-value" style="margin: 0; line-height: 1.5; color: #222;">${value}</p>
        </div>
      `;
    } else {
      // Clean inline styling for shorter metadata fields
      panelRowsHtml += `
        <p class="info-row" style="margin: 6px 0; color: #222;">
          <strong>${config.label}:</strong> ${value}
        </p>
      `;
    }
  }
});

    // First process non-sequence targets (headers and subheaders)
    Object.keys(PROPERTY_SCHEMA).forEach(key => {
      const config = PROPERTY_SCHEMA[key];
      const value = combinedData[key] || config.default;
      if (!value || value === 'NULL' || value === '') return;

      if (config.targets.includes('panel_header')) {
        panelHeaderHtml += `<h3 class="info-title" style="margin-top: 0; margin-bottom: 8px;">${value}</h3>`;
      }
      if (config.targets.includes('panel_subheader')) {
        panelSubheaderHtml += `<p class="info-old-names" style="margin: 4px 0; color: #555;"><em>${config.label}: ${value}</em></p>`;
      }
    });

    // Process detailed rows in the exact sequence specified
    renderSequence.forEach(key => {
      const config = PROPERTY_SCHEMA[key];
      if (!config) return;

      const value = combinedData[key] || config.default;
      if (!value || value === 'NULL' || value === '') return;

      if (config.targets.includes('panel_row')) {
        if (key === 'trivia' || key === 'description') {
          // Keep distinct class layouts for long prose paragraphs
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

    // Inject active theme category row dynamically at the top of info parameters if not already rendered
    if (targetValue && !panelRowsHtml.includes(targetValue)) {
      panelRowsHtml = `<p class="info-row" style="margin: 6px 0; color: #222;"><strong>${activeTheme.name}:</strong> ${targetValue}</p>` + panelRowsHtml;
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