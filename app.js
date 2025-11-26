// Initialize map centered on Hanoi
const map = L.map('map').setView([21.03, 105.85], 12);

// Satellite basemap
const tileLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}',
  {
    maxZoom: 19,
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
  }
).addTo(map);

tileLayer.on('tileload', () => {
  const container = tileLayer.getContainer();
  if (container) container.classList.add('tile-filter');
});

let dataLayer = null;
let geojsonData = null;

// Color palettes
const palettes = {
  sub: ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'],
  period: ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666']
};

// Function to assign colors
function getColor(value, theme, categories) {
  const idx = categories.indexOf(value);
  if (idx === -1) return '#999';
  return palettes[theme][idx % palettes[theme].length];
}

// Function to build legend
function updateLegend(categories, theme) {
  const legendDiv = document.getElementById('legend');
  legendDiv.innerHTML = '<b>Legend</b><br>';
  categories.forEach((cat, i) => {
    const color = palettes[theme][i % palettes[theme].length];
    legendDiv.innerHTML += `
      <div class="legend-item">
        <div class="legend-color" style="background:${color}"></div>${cat}
      </div>`;
  });
}

// Function to apply theme
function applyTheme(theme) {
  if (!geojsonData) return;

  // Collect unique categories
  const categories = [...new Set(geojsonData.features.map(f => {
    return theme === 'sub' ? f.properties.Sub_category : f.properties.Period;
  }).filter(v => v && v !== 'NULL'))];

  if (dataLayer) map.removeLayer(dataLayer);

  dataLayer = L.geoJSON(geojsonData, {
    style: feature => {
      const value = theme === 'sub' ? feature.properties.Sub_category : feature.properties.Period;
      return {
        color: getColor(value, theme, categories),
        weight: Number(document.getElementById('lineWidth').value),
        opacity: Number(document.getElementById('layerOpacity').value) / 100
      };
    },
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

  map.fitBounds(dataLayer.getBounds());
  updateLegend(categories, theme);
}

// Load GeoJSON
fetch('data/HIAN_V1_Test.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonData = data;
    applyTheme('sub'); // default theme
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));

// Controls
document.getElementById('lineWidth').addEventListener('input', () => applyTheme(document.getElementById('themeSelect').value));
document.getElementById('lineColor').addEventListener('input', () => applyTheme(document.getElementById('themeSelect').value));
document.getElementById('layerOpacity').addEventListener('input', () => applyTheme(document.getElementById('themeSelect').value));
document.getElementById('basemapSat').addEventListener('input', e => {
  const value = Number(e.target.value) / 100;
  document.documentElement.style.setProperty('--sat', value);
});
document.getElementById('themeSelect').addEventListener('change', e => applyTheme(e.target.value));
