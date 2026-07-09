import { loadData, setTheme, getTheme, setMode } from './data.js';
import { themes } from './themes.js';
import { map } from './map.js';

loadData();

const themeSelect = document.getElementById('themeSelect');
Object.keys(themes).forEach(key => {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = themes[key].name;
  themeSelect.appendChild(opt);
});

themeSelect.value = getTheme();
themeSelect.addEventListener('change', e => setTheme(e.target.value));

const modeToggle = document.getElementById('modeToggle');
let currentMode = 'light';
if (modeToggle) {
  modeToggle.textContent = '☀️';
}