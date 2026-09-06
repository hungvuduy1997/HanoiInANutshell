// app.js

import { loadData, setTheme, getTheme } from './data.js';
import { themes } from './themes.js';
import { map, initialTheme } from './map.js'; 
import { applyTheme } from './data.js';

applyTheme(initialTheme); 
loadData();

// --------------------------------------------------------
// THEME SELECTOR UI
// --------------------------------------------------------
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
// SINGLE FETCH FLATGEOBUF LOADER (Fixes HTTP 206 Waterfall)
// --------------------------------------------------------
const fgbUrl = 'data/HIAN_Geometry-260719.fgb';

async function loadFgbData() {
  try {
    // 1. Single HTTP request to fetch the entire file into memory (200 OK)
    const response = await fetch(fgbUrl);
    
    // 2. Stream directly into Leaflet's Canvas layer without range requests
    const fgbLayer = flatgeobuf.L.leafletData(response.body, {
      style: () => ({
        color: '#1e88e5',
        weight: 1.5,
        opacity: 0.8
      })
    });

    fgbLayer.addTo(map);
  } catch (err) {
    console.error('Error loading FlatGeobuf:', err);
  }
}

// Load ONCE when the map is ready (No moveend listeners needed!)
map.whenReady(() => {
  loadFgbData();
});