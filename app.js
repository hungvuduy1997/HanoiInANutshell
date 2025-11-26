// Initialize map centered on Hanoi
const map = L.map('map').setView([21.03, 105.85], 12);

// CARTO basemap (light)
const tileLayer = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
).addTo(map);

tileLayer.on('tileload', () => {
  const container = tileLayer.getContainer();
  if (container) container.classList.add('tile-filter');
});

let dataLayer = null;
let geojsonData = null;

// Phân loại (Sub_category) color scheme (from your QGIS export)
const subColors = {
  "CM": "#7A8B3D",       // Cách mạng
  "DN": "#E89CB1",       // Doanh nhân
  "GD": "#F4A03A",       // Giáo dục
  "KT": "#E85C3C",       // Kỹ thuật
  "KT-XH": "#4E9A4F",    // Kinh tế - xã hội
  "LĐ": "#7C3E3E",       // Lãnh đạo, nguyên thủ
  "PK": "#E5D5B7",       // Phong kiến, hoàng gia
  "QC": "#B6E3B6",       // Quan chức
  "QS": "#9B6FB3",       // Quân sự
  "TG": "#6ED3D3",       // Tôn giáo
  "ThTh": "#A3C9E5",     // Thần thoại
  "VH-NT": "#5A3C6E",    // Văn hoá - nghệ thuật
  "YH": "#3C6EB3",       // Y học
  "Other": "#F02AE7"     // Khác
};

// Optional: order for Phân loại legend (if you want specific ordering instead of data order)
const subOrder = [
  "CM","DN","GD","KT","KT-XH","LĐ","PK","QC","QS","TG","ThTh","VH-NT","YH","Other"
];

// Thời kỳ color scheme (derived from your QGIS export)
const periodColors = {
  "01 - Hồng Bàng - sơ sử (trước 258 TCN)": "#0D0887",
  "02 - Bắc thuộc & khởi nghĩa (258 TCN - 938 SCN)": "#270592",
  "03 - Bắc thuộc & khởi nghĩa - Độc lập tự chủ sớm (258 TCN - 1009 SCN)": "#3A049B",
  "04 - Độc lập tự chủ sớm (938 - 1009)": "#4C02A1",
  "05 - Độc lập tự chủ sớm - Nhà Lý (938 - 1226)": "#5D00A6",
  "06 - Nhà Lý (1009 - 1226)": "#6E03A8",
  "07 - Nhà Lý - Nhà Trần (1009 - 1400)": "#7E0BA4",
  "08 - Nhà Trần (1226 - 1400)": "#8D0FA4",
  "09 - Nhà Trần - Nhà Hồ & Minh thuộc (1226 - 1428)": "#B62F8C",
  "10 - Nhà Trần - Nhà Hồ & Minh thuộc  - Nhà Hậu Lê (1226 - 1527)": "#B62F8C",
  "11 - Nhà Hồ & Minh thuộc (1400 - 1428)": "#C13B82",
  "12 - Nhà Hồ & Minh thuộc - Nhà Hậu Lê (1400 - 1527)": "#C13B82",
  "13 - Nhà Hậu Lê (1428 - 1527)": "#CB4778",
  "14 - Nhà Hậu Lê - Phân tranh (1428 - 1788)": "#D5536E",
  "15 - Phân tranh (1527 - 1788)": "#DD5F65",
  "16 - Phân tranh - Nhà Tây Sơn (1527 - 1802)": "#E66B5C",
  "17 - Phân Tranh - Nhà Tây Sơn - Nhà Nguyễn & Pháp thuộc (1527 - 1945)": "#ED7953",
  "18 - Nhà Tây Sơn (1788 - 1802)": "#F4864A",
  "19 - Nhà Tây Sơn - Nhà Nguyễn & Pháp Thuộc (1788 - 1945)": "#F89641",
  "20 - Nhà Nguyễn & Pháp thuộc (1802 - 1945)": "#FEB32F",
  "21 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến (1802 - 1975)": "#FEC328",
  "22 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1802 - nay)": "#FEC328",
  "23 - Cách mạng & kháng chiến (1945 - 1975)": "#FCD524",
  "24 - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1945 - nay)": "#F7E726"
};

// Explicit order for Period legend (matches your category list)
const periodOrder = [
  "01 - Hồng Bàng - sơ sử (trước 258 TCN)",
  "02 - Bắc thuộc & khởi nghĩa (258 TCN - 938 SCN)",
  "03 - Bắc thuộc & khởi nghĩa - Độc lập tự chủ sớm (258 TCN - 1009 SCN)",
  "04 - Độc lập tự chủ sớm (938 - 1009)",
  "05 - Độc lập tự chủ sớm - Nhà Lý (938 - 1226)",
  "06 - Nhà Lý (1009 - 1226)",
  "07 - Nhà Lý - Nhà Trần (1009 - 1400)",
  "08 - Nhà Trần (1226 - 1400)",
  "09 - Nhà Trần - Nhà Hồ & Minh thuộc (1226 - 1428)",
  "10 - Nhà Trần - Nhà Hồ & Minh thuộc  - Nhà Hậu Lê (1226 - 1527)",
  "11 - Nhà Hồ & Minh thuộc (1400 - 1428)",
  "12 - Nhà Hồ & Minh thuộc - Nhà Hậu Lê (1400 - 1527)",
  "13 - Nhà Hậu Lê (1428 - 1527)",
  "14 - Nhà Hậu Lê - Phân tranh (1428 - 1788)",
  "15 - Phân tranh (1527 - 1788)",
  "16 - Phân tranh - Nhà Tây Sơn (1527 - 1802)",
  "17 - Phân Tranh - Nhà Tây Sơn - Nhà Nguyễn & Pháp thuộc (1527 - 1945)",
  "18 - Nhà Tây Sơn (1788 - 1802)",
  "19 - Nhà Tây Sơn - Nhà Nguyễn & Pháp Thuộc (1788 - 1945)",
  "20 - Nhà Nguyễn & Pháp thuộc (1802 - 1945)",
  "21 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến (1802 - 1975)",
  "22 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1802 - nay)",
  "23 - Cách mạng & kháng chiến (1945 - 1975)",
  "24 - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1945 - nay)"
];

// Build legend UI
function updateLegend(categories, theme) {
  const titleDiv = document.getElementById('legendTitle');
  const itemsDiv = document.getElementById('legendItems');

  titleDiv.textContent = theme === 'sub' ? 'Phân loại' : 'Thời kỳ';
  itemsDiv.innerHTML = '';

  // Sort categories according to the explicit order for each theme
  let ordered = categories.slice();
  if (theme === 'period') {
    ordered = periodOrder.filter(c => categories.includes(c));
  } else if (theme === 'sub') {
    ordered = subOrder.filter(c => categories.includes(c));
    // Include any unforeseen categories at the end
    const extras = categories.filter(c => !subOrder.includes(c));
    ordered = ordered.concat(extras);
  }

  ordered.forEach(cat => {
    const color = theme === 'sub' ? (subColors[cat] || '#999') : (periodColors[cat] || '#999');
    const row = document.createElement('div');
    row.className = 'legend-item';
    row.innerHTML = `<div class="legend-color" style="background:${color}"></div>${cat}`;
    itemsDiv.appendChild(row);
  });
}

// Apply theme and redraw layer
function applyTheme(theme) {
  if (!geojsonData) return;

  // Collect categories from data (support Sub_category or Sub_Category)
  const categoriesSet = new Set();
  geojsonData.features.forEach(f => {
    const props = f.properties || {};
    const subValue = props.Sub_category ?? props.Sub_Category; // handle both field names
    const value = theme === 'sub' ? subValue : props.Period;
    if (value && value !== 'NULL') categoriesSet.add(value);
  });
  const categories = Array.from(categoriesSet);

  if (dataLayer) map.removeLayer(dataLayer);

  dataLayer = L.geoJSON(geojsonData, {
    style: feature => {
      const props = feature.properties || {};
      const subValue = props.Sub_category ?? props.Sub_Category;
      const value = theme === 'sub' ? subValue : props.Period;
      const color = theme === 'sub' ? (subColors[value] || '#999') : (periodColors[value] || '#999');
      return {
        color,
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
    applyTheme('sub'); // default to Phân loại
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));

// Controls
document.getElementById('lineWidth').addEventListener('input', () => applyTheme(document.getElementById('themeSelect').value));
document.getElementById('layerOpacity').addEventListener('input', () => applyTheme(document.getElementById('themeSelect').value));
document.getElementById('basemapSat').addEventListener('input', e => {
  const value = Number(e.target.value) / 100;
  document.documentElement.style.setProperty('--sat', value);
});
document.getElementById('themeSelect').addEventListener('change', e => applyTheme(e.target.value));
