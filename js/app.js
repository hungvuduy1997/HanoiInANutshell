import { MAP_TYPES } from './schema.js';
import { themes } from './themes.js';
import { setTheme, getTheme, loadData } from './data.js';
import { initMap } from './map.js';

// Memory object to track last selected theme for each map type
const lastSelectedThemeByMapType = {
  streets: 'categorization',
  cuaOHanoi: 'categorization'
};

function setupDropdownCascading() {
  const mapTypeSelect = document.getElementById('mapTypeSelect');
  const themeSelect = document.getElementById('themeSelect');

  if (!mapTypeSelect || !themeSelect) return;

  // 1. Populate "Loại bản đồ"
  mapTypeSelect.innerHTML = '';
  Object.keys(MAP_TYPES).forEach(typeKey => {
    const opt = document.createElement('option');
    opt.value = typeKey;
    opt.textContent = MAP_TYPES[typeKey].name;
    mapTypeSelect.appendChild(opt);
  });

  // 2. Helper to filter "Chủ đề" based on selected "Loại bản đồ"
  function populateThemesForMapType(selectedMapType) {
    themeSelect.innerHTML = '';

    const matchingThemes = Object.keys(themes).filter(
      key => themes[key].mapType === selectedMapType
    );

    matchingThemes.forEach(themeKey => {
      const opt = document.createElement('option');
      opt.value = themeKey;
      opt.textContent = themes[themeKey].name;
      themeSelect.appendChild(opt);
    });

    // Use remembered theme for this map type, or fall back to first theme
    const rememberedTheme = lastSelectedThemeByMapType[selectedMapType];
    const activeKey = rememberedTheme && matchingThemes.includes(rememberedTheme)
      ? rememberedTheme
      : matchingThemes[0];

    if (activeKey) {
      themeSelect.value = activeKey;
      lastSelectedThemeByMapType[selectedMapType] = activeKey;
      setTheme(activeKey);
    }
  }

  // 3. Event Listener: When Map Type changes
  mapTypeSelect.addEventListener('change', (e) => {
    populateThemesForMapType(e.target.value);
  });

  // 4. Event Listener: When Theme changes, remember choice
  themeSelect.addEventListener('change', (e) => {
    const currentMapType = mapTypeSelect.value;
    lastSelectedThemeByMapType[currentMapType] = e.target.value;
    setTheme(e.target.value);
  });

  // 5. Initial Sync with current active theme
  const currentThemeKey = getTheme() || 'categorization';
  const currentMapType = themes[currentThemeKey]?.mapType || 'streets';
  lastSelectedThemeByMapType[currentMapType] = currentThemeKey;
  
  mapTypeSelect.value = currentMapType;
  populateThemesForMapType(currentMapType);
}

// Complete initialization cycle
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Map engine
  initMap();
  
  // 2. Link dropdown cascading UI
  setupDropdownCascading();
  
  // 3. Load CSV data and fetch spatial geometries
  await loadData();
});