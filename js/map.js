import { setMode } from './data.js';

// Inside js/map.js
export const map = L.map('map', {
  center: [21.02899796430522, 105.85237212478512],
  zoom: 17,
  zoomControl: true
});

const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

// OPTION 1: Pure Satellite Imagery without text labels
const satelliteMap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains: ['0', '1', '2', '3'],
  attribution: '© Google Maps',
  maxZoom: 20
});

// Add a specific class hook to the satellite tiles once they are appended to the DOM 
satelliteMap.on('tileload', (e) => {
  e.tile.classList.add('satellite-tile-target');
  // Initialize current slider value immediately to newly loaded tiles
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

/**
 * Sweeps through active satellite image tiles and updates their CSS grayscale metrics
 */
function updateSatelliteSaturation(val) {
  const grayscalePercent = 100 - val; // Sliding to left (0) means 100% grayscale desaturation
  const tiles = document.querySelectorAll('.satellite-tile-target');
  tiles.forEach(tile => {
    tile.style.filter = `grayscale(${grayscalePercent}%)`;
  });
}

// Bind input event to live-update tiles as you drag the slider track handle
if (saturationSlider) {
  saturationSlider.addEventListener('input', (e) => {
    updateSatelliteSaturation(e.target.value);
  });
}

// Replace the entire viewToggle.addEventListener block inside js/map.js

viewToggle.addEventListener('click', () => {
  if (currentMapType === 'leaflet') {
    currentMapType = 'satellite';
    viewToggle.textContent = 'Bản đồ';
    
    if (currentLightMode === 'light') map.removeLayer(lightMap);
    else map.removeLayer(darkMap);
    
    // 1. Add satellite layer to map
    satelliteMap.addTo(map);
    modeToggle.classList.add('hidden');
    if (sliderContainer) sliderContainer.classList.remove('hidden');
    
    // 2. Force layer rebuild to apply light colors over the photography
    setMode(currentLightMode); 
    
    // 3. Trigger the slow desaturation transition after tiles are placed
    setTimeout(() => {
      updateSatelliteSaturation(saturationSlider ? saturationSlider.value : 100);
    }, 50);

  } else {
    currentMapType = 'leaflet';
    viewToggle.textContent = 'Vệ tinh';
    
    // 1. First, smoothly slide saturation all the way back to full color (100%)
    updateSatelliteSaturation(100);
    if (sliderContainer) sliderContainer.classList.add('hidden');
    
    // 2. Wait 800ms (matching your CSS transition length) for the color to completely bleed back in
    setTimeout(() => {
      // 3. Cleanly swap layers only AFTER the transition has completed
      map.removeLayer(satelliteMap);
      
      if (currentLightMode === 'light') {
        lightMap.addTo(map);
        setMode('light');
      } else {
        darkMap.addTo(map);
        setMode('dark');
      }
      modeToggle.classList.remove('hidden');
    }, 800); // 800ms delay matches the 0.8s transition in style.css
  }
});

// Light Mode vs Dark Mode button interactions 
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