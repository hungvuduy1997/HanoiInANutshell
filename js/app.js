import { loadData, setTheme, getTheme } from './data.js';
import { themes } from './themes.js';
import { map, initialTheme } from './map.js'; 
import { applyTheme } from './data.js';

// --------------------------------------------------------
// 1. INITIALIZE THEME & UI SELECTORS
// --------------------------------------------------------
applyTheme(initialTheme); 

loadData();

const themeSelect = document.getElementById('themeSelect');

Object.keys(themes).forEach(key => {
  if (themes[key].hidden) return;

  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = themes[key].name;
  themeSelect.appendChild(opt);
});

const activeThemeKey = getTheme();
themeSelect.value = activeThemeKey;

if (!themeSelect.value && themes[activeThemeKey]) {
  const secretOpt = document.createElement('option');
  secretOpt.value = activeThemeKey;
  secretOpt.textContent = `🔒 ${themes[activeThemeKey].name}`;
  secretOpt.disabled = true; 
  
  themeSelect.appendChild(secretOpt);
  themeSelect.value = activeThemeKey;
}

themeSelect.addEventListener('change', e => setTheme(e.target.value));

const modeToggle = document.getElementById('modeToggle');
if (modeToggle) {
  modeToggle.textContent = '☀️';
}

// --------------------------------------------------------
// 2. SPATIAL INDEXING & BBOX FLATGEOBUF STREAMING
// --------------------------------------------------------
// Single LayerGroup on Canvas renderer to hold screen-visible features
const fgbLayerGroup = L.layerGroup().addTo(map);

// Set to track loaded feature IDs and avoid duplicate rendering during pan/zoom
const loadedFeatureIds = new Set();

async function loadVisibleFgbFeatures() {
  // Get current map bounding box coordinates
  const bounds = map.getBounds();
  const bbox = {
    minX: bounds.getWest(),
    minY: bounds.getSouth(),
    maxX: bounds.getEast(),
    maxY: bounds.getNorth()
  };

  // Adjust path to your .fgb dataset file if necessary
  const fgbUrl = 'data/hian_db.fgb'; 

  try {
    // Stream only features overlapping current screen viewport using FlatGeobuf's R-tree index
    const iter = flatgeobuf.geojson.deserialize(fgbUrl, bbox);

    for await (const feature of iter) {
      // Deduplicate already rendered entities
      const id = feature.properties?.id || feature.id;
      if (id && loadedFeatureIds.has(id)) continue;
      if (id) loadedFeatureIds.add(id);

      const layer = L.geoJSON(feature, {
        onEachFeature: (feat, layerInstance) => {
          // Bind popups, clicks, or sidebar info panel handlers here
          layerInstance.on('click', () => {
            // Handle street click event
          });
        }
      });

      layer.addTo(fgbLayerGroup);
    }
  } catch (err) {
    console.error('Error streaming FlatGeobuf spatial index:', err);
  }
}

// Trigger streaming when map is ready and whenever panning/zooming finishes
map.whenReady(() => {
  loadVisibleFgbFeatures();
});

map.on('moveend', () => {
  loadVisibleFgbFeatures();
});