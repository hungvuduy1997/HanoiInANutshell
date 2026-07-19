import { setMode } from './data.js';

let defaultCenter = [21.028998, 105.852372];
let defaultZoom = 17;
let initialTheme = 'categorization'; 

const hash = window.location.hash;
if (hash && hash.startsWith('#')) {
  const parts = hash.substring(1).split('/');
  
  if (parts.length === 4) {
    const parsedTheme = parts[0];
    const parsedZoom = parseFloat(parts[1]);
    const parsedLat = parseFloat(parts[2]);
    const parsedLng = parseFloat(parts[3]);
    
    if (!isNaN(parsedZoom) && !isNaN(parsedLat) && !isNaN(parsedLng)) {
      initialTheme = parsedTheme;
      defaultZoom = parsedZoom;
      defaultCenter = [parsedLat, parsedLng];
    }
  }
}

export const map = L.map('map', {
  center: defaultCenter,
  zoom: defaultZoom,
  zoomControl: true
});

export { initialTheme };

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

function updateSatelliteSaturation(val) {
  const grayscalePercent = 100 - val;
  const tiles = document.querySelectorAll('.satellite-tile-target');
  tiles.forEach(tile => {
    tile.style.filter = `grayscale(${grayscalePercent}%)`;
  });
}

if (saturationSlider) {
  saturationSlider.addEventListener('input', (e) => {
    updateSatelliteSaturation(e.target.value);
  });
}

viewToggle.addEventListener('click', () => {
  if (currentMapType === 'leaflet') {
    currentMapType = 'satellite';
    viewToggle.textContent = 'Bản đồ';
    
    if (currentLightMode === 'light') map.removeLayer(lightMap);
    else map.removeLayer(darkMap);
    
    satelliteMap.addTo(map);
    modeToggle.classList.add('hidden');
    if (sliderContainer) sliderContainer.classList.remove('hidden');
    
    setMode(currentLightMode); 
    
    setTimeout(() => {
      updateSatelliteSaturation(saturationSlider ? saturationSlider.value : 100);
    }, 50);

  } else {
    currentMapType = 'leaflet';
    viewToggle.textContent = 'Vệ tinh';
    
    updateSatelliteSaturation(100);
    if (sliderContainer) sliderContainer.classList.add('hidden');
    
    setTimeout(() => {
      map.removeLayer(satelliteMap);
      
      if (currentLightMode === 'light') {
        lightMap.addTo(map);
        setMode('light');
      } else {
        darkMap.addTo(map);
        setMode('dark');
      }
      modeToggle.classList.remove('hidden');
    }, 800);
  }
});

modeToggle.addEventListener('click', () => {
  if (currentLightMode === 'light') {
    currentLightMode = 'dark';
    modeToggle.innerHTML = '🌙';
    if (currentMapType === 'leaflet') {
      map.removeLayer(lightMap);
      darkMap.addTo(map);
    }
    setMode('dark');
  } else {
    currentLightMode = 'light';
    modeToggle.innerHTML = '☀️';
    if (currentMapType === 'leaflet') {
      map.removeLayer(darkMap);
      lightMap.addTo(map);
    }
    setMode('light');
  }
});

import { getTheme, setTheme } from './data.js';

map.on('moveend', () => {
  const activeThemeKey = getTheme();
  const zoom = map.getZoom();
  const center = map.getCenter();
  window.history.replaceState(null, null, `#${activeThemeKey}/${zoom}/${center.lat.toFixed(5)}/${center.lng.toFixed(5)}`);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#')) return;

  const parts = hash.substring(1).split('/');
  if (parts.length === 4) {
    const targetTheme = parts[0];
    const targetZoom = parseFloat(parts[1]);
    const targetLat = parseFloat(parts[2]);
    const targetLng = parseFloat(parts[3]);

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
    }
  }
});