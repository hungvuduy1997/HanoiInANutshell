import { setMode } from './data.js';

// 1. Initialize map view and export it so data.js and other files can interact with it
export const map = L.map('map', {
  center: [21.02899796430522, 105.85237212478512], // Centered on Hanoi coordinates
  zoom: 17,
  zoomControl: true
});

// 2. Define the base tile providers using CARTO and Google engines
const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 20
});

// Google Hybrid (lyrs=s,h provides high-res satellite photography with clear text labeling)
const satelliteMap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  subdomains: ['0', '1', '2', '3'],
  attribution: '© Google Maps',
  maxZoom: 20
});

// Default initial system state tracking
let currentMapType = 'leaflet'; // 'leaflet' or 'satellite'
let currentLightMode = 'light'; // 'light' or 'dark'

// Add the default light vector map background on startup
lightMap.addTo(map);

// 3. UI Element references mapped to your index.html hooks
const viewToggle = document.getElementById('viewToggle');
const modeToggle = document.getElementById('modeToggle');

// 4. Base map toggle logic (Swapping between vector maps and satellite photography)
if (viewToggle && modeToggle) {
  viewToggle.addEventListener('click', () => {
    if (currentMapType === 'leaflet') {
      // Switch map background to Satellite view
      currentMapType = 'satellite';
      viewToggle.textContent = 'Bản đồ';
      
      // Clear out running vector maps and slide satellite into place
      map.removeLayer(lightMap);
      map.removeLayer(darkMap);
      satelliteMap.addTo(map);
      
      // Hide the light/dark controller smoothly via CSS class
      modeToggle.classList.add('hidden');
      
      // Force overlay lines into dark mode coloring to stand out cleanly against dark satellite imagery
      setMode('dark');
    } else {
      // Return to Standard Vector layouts
      currentMapType = 'leaflet';
      viewToggle.textContent = 'Vệ tinh';
      
      map.removeLayer(satelliteMap);
      
      // Restore previous vector tile layer alongside the line configurations
      if (currentLightMode === 'light') {
        lightMap.addTo(map);
        setMode('light');
      } else {
        darkMap.addTo(map);
        setMode('dark');
      }
      
      // Slide the light/dark control switch back into display row layout
      modeToggle.classList.remove('hidden');
    }
  });

  // 5. Light Mode vs Dark Mode style toggling logic
  modeToggle.addEventListener('click', () => {
    if (currentLightMode === 'light') {
      currentLightMode = 'dark';
      modeToggle.textContent = 'Giao diện: Tối';
      
      if (currentMapType === 'leaflet') {
        map.removeLayer(lightMap);
        darkMap.addTo(map);
      }
      setMode('dark');
    } else {
      currentLightMode = 'light';
      modeToggle.textContent = 'Giao diện: Sáng';
      
      if (currentMapType === 'leaflet') {
        map.removeLayer(darkMap);
        lightMap.addTo(map);
      }
      setMode('light');
    }
  });
}