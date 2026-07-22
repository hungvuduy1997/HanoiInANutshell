import { setMode, getTheme, setTheme } from './data.js';

let defaultCenter = [21.028998, 105.852372];
let defaultZoom = 17;
let initialTheme = 'categorization'; 
let initialMode = 'light'; // Default mode

const hash = window.location.hash;
if (hash && hash.startsWith('#')) {
  const parts = hash.substring(1).split('/');
  
  // Format: #theme/mode/zoom/lat/lng
  if (parts.length === 5) {
    const parsedTheme = parts[0];
    const parsedMode = parts[1];
    const parsedZoom = parseFloat(parts[2]);
    const parsedLat = parseFloat(parts[3]);
    const parsedLng = parseFloat(parts[4]);
    
    if (!isNaN(parsedZoom) && !isNaN(parsedLat) && !isNaN(parsedLng)) {
      initialTheme = parsedTheme;
      if (['light', 'dark', 'satellite'].includes(parsedMode)) {
        initialMode = parsedMode;
      }
      defaultZoom = parsedZoom;
      defaultCenter = [parsedLat, parsedLng];
    }
  }
}

export { initialTheme, initialMode };

// Initialize Map Instance
export const map = L.map('map', {
  center: defaultCenter,
  zoom: defaultZoom,
  zoomControl: false
});

const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

const satelliteMap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains: ['0', '1', '2', '3'],
  attribution: '© Google Maps',
  maxZoom: 20
});

satelliteMap.on('tileload', (e) => {
  e.tile.classList.add('satellite-tile-target');
  const sliderValue = document.getElementById('satelliteSaturationSlider')?.value ?? 100;
  updateSatelliteSaturation(sliderValue);
});

lightMap.addTo(map);

let currentMapType = 'leaflet'; 
let currentLightMode = 'light'; 

const viewToggle = document.getElementById('viewToggle');
const modeToggle = document.getElementById('modeToggle');
const sliderContainer = document.getElementById('satelliteFilterContainer');
const saturationSlider = document.getElementById('satelliteSaturationSlider');

export function getCurrentModeString() {
  if (currentMapType === 'satellite') return 'satellite';
  return currentLightMode;
}

function updateSatelliteSaturation(val) {
  const grayscalePercent = 100 - val;
  const tiles = document.querySelectorAll('.satellite-tile-target');
  tiles.forEach(tile => {
    tile.style.filter = `grayscale(${grayscalePercent}%)`;
  });
}

function applyModeFromUrl(targetMode) {
  if (targetMode === 'satellite') {
    if (currentMapType !== 'satellite') {
      currentMapType = 'satellite';
      if (viewToggle) viewToggle.textContent = 'Bản đồ';
      if (map.hasLayer(lightMap)) map.removeLayer(lightMap);
      if (map.hasLayer(darkMap)) map.removeLayer(darkMap);
      satelliteMap.addTo(map);
      if (modeToggle) modeToggle.classList.add('hidden');
      if (sliderContainer) sliderContainer.classList.remove('hidden');
      setMode(currentLightMode);
    }
  } else {
    if (currentMapType === 'satellite') {
      currentMapType = 'leaflet';
      if (viewToggle) viewToggle.textContent = 'Vệ tinh';
      updateSatelliteSaturation(100);
      if (sliderContainer) sliderContainer.classList.add('hidden');
      map.removeLayer(satelliteMap);
      if (modeToggle) modeToggle.classList.remove('hidden');
    }

    if (targetMode === 'dark') {
      currentLightMode = 'dark';
      if (modeToggle) modeToggle.innerHTML = '🌙';
      if (map.hasLayer(lightMap)) map.removeLayer(lightMap);
      darkMap.addTo(map);
      setMode('dark');
    } else {
      currentLightMode = 'light';
      if (modeToggle) modeToggle.innerHTML = '☀️';
      if (map.hasLayer(darkMap)) map.removeLayer(darkMap);
      lightMap.addTo(map);
      setMode('light');
    }
  }
}

if (saturationSlider) {
  saturationSlider.addEventListener('input', (e) => {
    updateSatelliteSaturation(e.target.value);
  });
}

if (viewToggle) {
  viewToggle.addEventListener('click', () => {
    if (currentMapType === 'leaflet') {
      applyModeFromUrl('satellite');
    } else {
      applyModeFromUrl(currentLightMode);
    }
  });
}

if (modeToggle) {
  modeToggle.addEventListener('click', () => {
    const nextMode = currentLightMode === 'light' ? 'dark' : 'light';
    applyModeFromUrl(nextMode);
  });
}

map.on('moveend', () => {
  const activeThemeKey = getTheme();
  const activeModeStr = getCurrentModeString();
  const zoom = map.getZoom();
  const center = map.getCenter();
  window.history.replaceState(null, null, `#${activeThemeKey}/${activeModeStr}/${zoom}/${center.lat.toFixed(5)}/${center.lng.toFixed(5)}`);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#')) return;

  const parts = hash.substring(1).split('/');
  if (parts.length === 5) {
    const targetTheme = parts[0];
    const targetMode = parts[1];
    const targetZoom = parseFloat(parts[2]);
    const targetLat = parseFloat(parts[3]);
    const targetLng = parseFloat(parts[4]);

    if (!isNaN(targetZoom) && !isNaN(targetLat) && !isNaN(targetLng)) {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      
      const latDiff = Math.abs(currentCenter.lat - targetLat);
      const lngDiff = Math.abs(currentCenter.lng - targetLng);
      
      if (currentZoom !== targetZoom || latDiff > 0.0001 || lngDiff > 0.0001) {
        map.setView([targetLat, targetLng], targetZoom, { animate: true });
      }

      if (getTheme() !== targetTheme) {
        setTheme(targetTheme);
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = targetTheme;
      }

      if (targetMode !== getCurrentModeString()) {
        applyModeFromUrl(targetMode);
      }
    }
  }
});