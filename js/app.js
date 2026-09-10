import { MAP_TYPES } from './schema.js';
import { themes } from './themes.js';
import { setTheme, getTheme, loadData } from './data.js';
import { initMap } from './map.js';

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
  function populateThemesForMapType(selectedMapType, targetThemeKey = null) {
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

    // Select target theme or fall back to first option
    const activeKey = targetThemeKey && matchingThemes.includes(targetThemeKey)
      ? targetThemeKey
      : matchingThemes[0];

    if (activeKey) {
      themeSelect.value = activeKey;
      setTheme(activeKey);
    }
  }

  // 3. Event Listener: When Map Type changes
  mapTypeSelect.addEventListener('change', (e) => {
    populateThemesForMapType(e.target.value);
  });

  // 4. Event Listener: When Theme changes
  themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
  });

  // 5. Initial Sync with current active theme
  const currentThemeKey = getTheme() || 'categorization';
  const currentMapType = themes[currentThemeKey]?.mapType || 'streets';
  mapTypeSelect.value = currentMapType;
  populateThemesForMapType(currentMapType, currentThemeKey);
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