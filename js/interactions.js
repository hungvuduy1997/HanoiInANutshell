import { buildPopupHTML } from './popup.js';
import { getStreetCombinedData } from './data.js';

export function attachInteractions(layer, feature) {
  const props = feature.properties || {};
  const fullId = props.full_id;

  if (!fullId) return;

  // Retrieve our combined CSV relational dataset for this street ID
  const combinedData = getStreetCombinedData(fullId);

  // We build a minimalist tooltip popup on hover/click with just the name and category
  const popupHTML = buildPopupHTML(combinedData, { only: ["street_name", "category", "subcategory"] });
  // We build a comprehensive detailed string for the info panel layout
  const panelHTML = buildPopupHTML(combinedData, { isPanel: true });

  if (popupHTML) {
    layer.bindPopup(popupHTML);
    
    layer.on('click', () => {
      const panel = document.getElementById('infoPanel');
      if (panel) {
        panel.innerHTML = panelHTML;
        panel.style.display = 'block';

        // Bind an event listener to the close button inside our template
        const closeBtn = panel.querySelector('.close-panel-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
          });
        }
      }
    });
  }
}