import { loadData, setTheme, getTheme, setMode } from './data.js';
import { themes } from './themes.js';
import { map} from './map.js';

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
modeToggle.textContent = '☀️';

modeToggle.addEventListener('click', () => {
  if (currentMode === 'light') {
    currentMode = 'dark';
    modeToggle.textContent = '🌙';
    setMode('dark');
    map.removeLayer(lightBasemap);
    darkBasemap.addTo(map);
  } else {
    currentMode = 'light';
    modeToggle.textContent = '☀️';
    setMode('light');
    map.removeLayer(darkBasemap);
    lightBasemap.addTo(map);
  }
});