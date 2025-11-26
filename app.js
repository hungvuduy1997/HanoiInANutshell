// Initialize map centered on Hanoi
const map = L.map('map').setView([21.03, 105.85], 12);

// Add Esri World Imagery (satellite) basemap
const tileLayer = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
).addTo(map);

// Apply saturation filter to basemap tiles
tileLayer.on('tileload', () => {
  const container = tileLayer.getContainer();
  if (container) container.classList.add('tile-filter');
});

// Initial style settings
let currentStyle = {
  color: document.getElementById('lineColor').value,
  weight: Number(document.getElementById('lineWidth').value),
  opacity: Number(document.getElementById('layerOpacity').value) / 100
};

let dataLayer = null;

// Function to apply style to the layer
function applyStyle() {
  if (dataLayer) {
    dataLayer.setStyle({
      color: currentStyle.color,
      weight: currentStyle.weight,
      opacity: currentStyle.opacity
    });
  }
}

// Load GeoJSON and add to map
fetch('data/HIAN_V1_Test.geojson')
  .then(res => res.json())
  .then(data => {
    dataLayer = L.geoJSON(data, {
      style: () => currentStyle,
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const entries = Object.entries(props)
          .filter(([k, v]) => v !== null && v !== undefined && v !== '' && v !== 'NULL');
        if (entries.length) {
          const html = entries.map(([k, v]) => `<b>${k}:</b> ${v}`).join('<br>');
          layer.bindPopup(html);
        }
      }
    }).addTo(map);

    // Zoom to layer bounds
    map.fitBounds(dataLayer.getBounds());
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));

// Line width control
document.getElementById('lineWidth').addEventListener('input', e => {
  currentStyle.weight = Number(e.target.value);
  applyStyle();
});

// Line color control
document.getElementById('lineColor').addEventListener('input', e => {
  currentStyle.color = e.target.value;
  applyStyle();
});

// Layer opacity control
document.getElementById('layerOpacity').addEventListener('input', e => {
  currentStyle.opacity = Number(e.target.value) / 100;
  applyStyle();
});

// Basemap saturation control
document.getElementById('basemapSat').addEventListener('input', e => {
  const value = Number(e.target.value) / 100;
  document.documentElement.style.setProperty('--sat', value);
});

