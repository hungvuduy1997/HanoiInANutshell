import { initMap } from './map.js';
import { loadData, setTheme, getTheme } from './data.js';
import { themes } from './themes.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize Map
    initMap();

    // 2. Load relational CSV tables and FlatGeobuf layers
    await loadData();

    // 3. Populate themeSelect dropdown options
    populateThemeSelector();

    console.log('Hanoi In A Nutshell initialized successfully!');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

function populateThemeSelector() {
  const themeSelect = document.getElementById('themeSelect');
  if (!themeSelect) return;

  // Clear existing static/empty HTML options
  themeSelect.innerHTML = '';

  const activeThemeKey = getTheme();

  // Dynamically create <option> tags for every theme in themes.js
  Object.keys(themes).forEach((key) => {
    const themeObj = themes[key];
    const option = document.createElement('option');
    option.value = key;
    option.textContent = themeObj.name || key;

    if (key === activeThemeKey) {
      option.selected = true;
    }

    themeSelect.appendChild(option);
  });

  // Attach switch listener
  themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
  });
}