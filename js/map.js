import { setMode, getTheme, setTheme } from './data.js';
import { CARTO_KEY } from './config.js';

// --------------------------------------------------------
// 1. DEVICE DETECTOR & MIN-ZOOM THRESHOLDS
// --------------------------------------------------------
function getDeviceMinZoom() {
  const width = window.innerWidth;

  if (width <= 600) {
    // 📱 Mobile Phones: Restrict zoom-out to level 15 so performance stays fast
    return 15; 
  } else if (width <= 1024) {
    // 📱 Tablets: Moderate limit (level 13)
    return 13; 
  } else {
    // 💻 Laptops / Desktops: No restrictive limit (level 10)
    return 10; 
  }
}

// Default map view settings
let defaultCenter = [21.028998, 105.852372];
let defaultZoom = 17;
let initialTheme = 'categorization'; 
let initialMode = 'light';

// Calculate current device's minimum zoom limit
const deviceMinZoom = getDeviceMinZoom();

// Ensure initial starting zoom isn't lower than the device allows
if (defaultZoom < deviceMinZoom) {
  defaultZoom = deviceMinZoom;
}

// --------------------------------------------------------
// 2. PARSE INITIAL HASH URL (#theme/mode/zoom/lat/lng)
// --------------------------------------------------------
const hash = window.location.hash;
if (hash && hash.startsWith('#')) {
  const parts = hash.substring(1).split('/');
  
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
      // Clamp incoming URL zoom level so phones don't load lower than deviceMinZoom
      defaultZoom = Math.max(parsedZoom, deviceMinZoom);
      defaultCenter = [parsedLat, parsedLng];
    }
  }
}

export { initialTheme, initialMode };

// --------------------------------------------------------
// 3. INITIALIZE LEAFLET MAP INSTANCE
// --------------------------------------------------------
export const map = L.map('map', {
  center: defaultCenter,
  zoom: defaultZoom,
  minZoom: deviceMinZoom, // Enforces the zoom limit
  maxZoom: 20,
  zoomControl: false,
  renderer: L.canvas({ padding: 0.5 })
});

// Create a custom pane so user location marker renders ON TOP of road geometries
map.createPane('userLocationPane');
map.getPane('userLocationPane').style.zIndex = '650';
map.getPane('userLocationPane').style.pointerEvents = 'none';

L.control.zoom({ position: 'bottomright' }).addTo(map);

// Vector Tile Layers Setup (MapLibre GL container opacity is handled via CSS)
const lightMap = L.maplibreGL({
  style: `https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json?key=${CARTO_KEY}`,
  attribution: '© OpenStreetMap, © CARTO'
});

const darkMap = L.maplibreGL({
  style: `https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json?key=${CARTO_KEY}`,
  attribution: '© OpenStreetMap, © CARTO'
});

// Raster Tile Layer (Leaflet tile layers DO support native opacity)
const satelliteMap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains: ['0', '1', '2', '3'],
  attribution: '© Google Maps',
  maxZoom: 20,
  opacity: 0.8
});

satelliteMap.on('tileload', (e) => {
  e.tile.classList.add('satellite-tile-target');
  const sliderValue = document.getElementById('satelliteSaturationSlider')?.value ?? 100;
  updateSatelliteSaturation(sliderValue);
});

// Set initial map base layer & container theme background
const mapEl = document.getElementById('map');
if (initialMode === 'dark') {
  darkMap.addTo(map);
  mapEl.classList.add('dark-mode');
} else {
  lightMap.addTo(map);
  mapEl.classList.add('light-mode');
}

let currentMapType = initialMode === 'satellite' ? 'satellite' : 'leaflet'; 
let currentLightMode = initialMode === 'satellite' ? 'light' : initialMode; 

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
  const mapContainer = document.getElementById('map');

  if (targetMode === 'satellite') {
    if (currentMapType !== 'satellite') {
      currentMapType = 'satellite';
      if (viewToggle) viewToggle.textContent = 'Bản đồ';
      if (map.hasLayer(lightMap)) map.removeLayer(lightMap);
      if (map.hasLayer(darkMap)) map.removeLayer(darkMap);
      satelliteMap.addTo(map);
      
      mapContainer.classList.remove('light-mode', 'dark-mode');
      mapContainer.classList.add('satellite-mode');

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

      mapContainer.classList.remove('light-mode', 'satellite-mode');
      mapContainer.classList.add('dark-mode');

      setMode('dark');
    } else {
      currentLightMode = 'light';
      if (modeToggle) modeToggle.innerHTML = '☀️';
      if (map.hasLayer(darkMap)) map.removeLayer(darkMap);
      lightMap.addTo(map);

      mapContainer.classList.remove('dark-mode', 'satellite-mode');
      mapContainer.classList.add('light-mode');

      setMode('light');
    }
  }
}

// UI Controls
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

// Sync map movement to URL Hash
map.on('moveend', () => {
  const activeThemeKey = getTheme();
  const activeModeStr = getCurrentModeString();
  const zoom = map.getZoom();
  const center = map.getCenter();
  window.history.replaceState(null, null, `#${activeThemeKey}/${activeModeStr}/${zoom}/${center.lat.toFixed(5)}/${center.lng.toFixed(5)}`);
});

// --------------------------------------------------------
// 4. GLOBAL WINDOW EVENT LISTENERS
// --------------------------------------------------------
let userLocationMarker = null;
const locateBtn = document.getElementById('locateToggle');

if (locateBtn) {
  locateBtn.addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 18 });
  });
}

map.on('locationfound', (e) => {
  const radius = e.accuracy;

  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
  }

  userLocationMarker = L.layerGroup([
    L.circleMarker(e.latlng, {
      radius: 8,
      fillColor: '#1e88e5',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
      pane: 'userLocationPane'
    }),
    L.circle(e.latlng, {
      radius: radius,
      color: '#1e88e5',
      weight: 1,
      fillColor: '#1e88e5',
      fillOpacity: 0.15,
      pane: 'userLocationPane'
    })
  ]).addTo(map);
});

map.on('locationerror', () => {
  alert("Không thể xác định vị trí của bạn. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.");
});

window.addEventListener('resize', () => {
  const currentMinZoom = getDeviceMinZoom();
  if (map.getMinZoom() !== currentMinZoom) {
    map.setMinZoom(currentMinZoom);
    if (map.getZoom() < currentMinZoom) {
      map.setZoom(currentMinZoom);
    }
  }
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
      
      const safeZoom = Math.max(targetZoom, map.getMinZoom());

      if (currentZoom !== safeZoom || latDiff > 0.0001 || lngDiff > 0.0001) {
        map.setView([targetLat, targetLng], safeZoom, { animate: true });
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