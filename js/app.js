import { loadData, setTheme, getTheme } from './data.js';
import { themes } from './themes.js';
import { map, initialTheme } from './map.js'; 

import { applyTheme } from './data.js';
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