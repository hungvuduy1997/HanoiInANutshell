// Create the map (centered roughly on Hanoi; adjust as needed)
const map = L.map('map').setView([21.03, 105.85], 12);

// Add OpenStreetMap basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load your GeoJSON file from /data/
fetch('data/HIAN_V1_Test.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
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
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));