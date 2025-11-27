// Initialize map
const map = L.map('map').setView([21.03, 105.85], 12);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
).addTo(map);

let dataLayer = null;
let bufferLayer = null;
let geojsonData = null;

// -----------------------------
// Theme configs
// -----------------------------
const subColors = { "CM":"#7A8B3D","DN":"#E89CB1","GD":"#F4A03A","KT":"#E85C3C","KT-XH":"#4E9A4F","LĐ":"#7C3E3E","PK":"#E5D5B7","QC":"#B6E3B6","QS":"#9B6FB3","TG":"#6ED3D3","ThTh":"#A3C9E5","VH-NT":"#5A3C6E","YH":"#3C6EB3","Other":"#F02AE7" };
const subLabels = { "CM":"Cách mạng","DN":"Doanh nhân","GD":"Giáo dục","KT":"Kỹ thuật","KT-XH":"Kinh tế - xã hội","LĐ":"Lãnh đạo, nguyên thủ","PK":"Phong kiến, hoàng gia","QC":"Quan chức","QS":"Quân sự","TG":"Tôn giáo","ThTh":"Thần thoại","VH-NT":"Văn hoá - nghệ thuật","YH":"Y học","Other":"Khác" };
const subOrder = ["CM","DN","GD","KT","KT-XH","LĐ","PK","QC","QS","TG","ThTh","VH-NT","YH","Other"];

const periodColors = { 
  "01 - Hồng Bàng - sơ sử (trước 258 TCN)":"#0D0887",
  "02 - Bắc thuộc & khởi nghĩa (258 TCN - 938 SCN)":"#270592",
  "03 - Bắc thuộc & khởi nghĩa - Độc lập tự chủ sớm (258 TCN - 1009 SCN)":"#3A049B",
  "04 - Độc lập tự chủ sớm (938 - 1009)":"#4C02A1",
  "05 - Độc lập tự chủ sớm - Nhà Lý (938 - 1226)":"#5D00A6",
  "06 - Nhà Lý (1009 - 1226)":"#6E03A8",
  "07 - Nhà Lý - Nhà Trần (1009 - 1400)":"#7E0BA4",
  "08 - Nhà Trần (1226 - 1400)":"#8D0FA4",
  "09 - Nhà Trần - Nhà Hồ & Minh thuộc (1226 - 1428)":"#B62F8C",
  "10 - Nhà Trần - Nhà Hồ & Minh thuộc  - Nhà Hậu Lê (1226 - 1527)":"#B62F8C",
  "11 - Nhà Hồ & Minh thuộc (1400 - 1428)":"#C13B82",
  "12 - Nhà Hồ & Minh thuộc - Nhà Hậu Lê (1400 - 1527)":"#C13B82",
  "13 - Nhà Hậu Lê (1428 - 1527)":"#CB4778",
  "14 - Nhà Hậu Lê - Phân tranh (1428 - 1788)":"#D5536E",
  "15 - Phân tranh (1527 - 1788)":"#DD5F65",
  "16 - Phân tranh - Nhà Tây Sơn (1527 - 1802)":"#E66B5C",
  "17 - Phân Tranh - Nhà Tây Sơn - Nhà Nguyễn & Pháp thuộc (1527 - 1945)":"#ED7953",
  "18 - Nhà Tây Sơn (1788 - 1802)":"#F4864A",
  "19 - Nhà Tây Sơn - Nhà Nguyễn & Pháp Thuộc (1788 - 1945)":"#F89641",
  "20 - Nhà Nguyễn & Pháp thuộc (1802 - 1945)":"#FEB32F",
  "21 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến (1802 - 1975)":"#FEC328",
  "22 - Nhà Nguyễn & Pháp thuộc - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1802 - nay)":"#FEC328",
  "23 - Cách mạng & kháng chiến (1945 - 1975)":"#FCD524",
  "24 - Cách mạng & kháng chiến - Sau Giải phóng & hiện đại (1945 - nay)":"#F7E726" 
};
const periodOrder = Object.keys(periodColors);

// -----------------------------
// Helpers
// -----------------------------
function getSubCategory(props) {
  return props.Sub_category ?? props.Sub_Category ?? props.SubCategory ?? null;
}

function buildPopupHTML(props) {
  const labels = {
    name: "Tên",
    Sub_Category: "Phân loại",
    Period: "Thời kỳ",
    "Birth & Death": "Năm sinh - mất",
    Profession: "Nghề nghiệp",
    title: "Danh hiệu",
    description: "Mô tả",
    Family: "Gia đình",
    Trivia: "Giai thoại"
  };

  const order = ["name","Sub_Category","Period","Birth & Death","Profession","title","description","Family","Trivia"];

  return order
    .filter(k => props[k] && props[k] !== 'NULL' && props[k] !== '')
    .map(k => {
      let value = props[k];
      if (k === "Sub_Category") value = subLabels[value] || value;
      return `<b>${labels[k] || k}:</b> ${value}`;
    })
    .join('<br>');
}

// -----------------------------
// Legend builder
// -----------------------------
function updateLegend(categories, theme) {
  const titleDiv = document.getElementById('legendTitle');
  const itemsDiv = document.getElementById('legendItems');
  titleDiv.textContent = theme === 'sub' ? 'Phân loại' : 'Thời kỳ';
  itemsDiv.innerHTML = '';

  const visibleCategories = new Set();
  dataLayer.eachLayer(layer => {
    const props = layer.feature.properties || {};
    const value = theme === 'sub' ? getSubCategory(props) : props.Period;
    if (value && value !== 'NULL') visibleCategories.add(value);
  });

  const ordered = theme === 'sub'
    ? subOrder.filter(c => visibleCategories.has(c))
        .concat([...visibleCategories].filter(c => !subOrder.includes(c)))
    : periodOrder.filter(c => visibleCategories.has(c));

    ordered.forEach(cat => {
    const color = theme === 'sub' ? (subColors[cat] || '#999') : (periodColors[cat] || '#999');
    const label = theme === 'sub' ? (subLabels[cat] || cat) : cat;
    const row = document.createElement('div');
    row.className = 'legend-item';
    row.innerHTML = `<div class="legend-color" style="background:${color}"></div>${label}`;
    itemsDiv.appendChild(row);
  });
}

// -----------------------------
// Apply theme and redraw layers
// -----------------------------
function applyTheme(theme) {
  if (!geojsonData) return;

  const categoriesSet = new Set();
  geojsonData.features.forEach(f => {
    const props = f.properties || {};
    const subValue = getSubCategory(props);
    const value = theme === 'sub' ? subValue : props.Period;
    if (value && value !== 'NULL') categoriesSet.add(value);
  });
  const categories = Array.from(categoriesSet);

  if (dataLayer) map.removeLayer(dataLayer);
  if (bufferLayer) map.removeLayer(bufferLayer);

  dataLayer = L.geoJSON(geojsonData, {
    style: feature => {
      const props = feature.properties || {};
      const subValue = getSubCategory(props);
      const value = theme === 'sub' ? subValue : props.Period;
      const color = theme === 'sub' ? (subColors[value] || '#999') : (periodColors[value] || '#999');
      return { color, weight: 1.25, opacity: 1 };
    },
    onEachFeature: (feature, layer) => {
      layer.on('click', () => {
        const html = buildPopupHTML(feature.properties || {});
        const panel = document.getElementById('infoPanel');
        panel.innerHTML = html;
        panel.style.display = 'block';

        // Remove glow from others
        dataLayer.eachLayer(l => l.getElement()?.classList.remove('glow-highlight'));
        layer.getElement()?.classList.add('glow-highlight');
      });
    }
  }).addTo(map);

  bufferLayer = L.geoJSON(geojsonData, {
    style: () => ({
      color: 'transparent',
      weight: 10, // adjust for clickability
      opacity: 0,
      interactive: true
    }),
    onEachFeature: (feature, layer) => {
      layer.on('click', () => {
        const html = buildPopupHTML(feature.properties || {});
        const panel = document.getElementById('infoPanel');
        panel.innerHTML = html;
        panel.style.display = 'block';

        dataLayer.eachLayer(l => l.getElement()?.classList.remove('glow-highlight'));
        layer.getElement()?.classList.add('glow-highlight');
      });
    }
  }).addTo(map);

  dataLayer.bringToFront();
  updateLegend(categories, theme);
}

// -----------------------------
// Load GeoJSON and initialize
// -----------------------------
fetch('data/HIAN_V1_Test.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonData = data;
    applyTheme('sub'); // default theme

    if (dataLayer) {
      const bounds = dataLayer.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds);
      }
    }
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));

// -----------------------------
// Theme selector
// -----------------------------
document.getElementById('themeSelect').addEventListener('change', e => {
  applyTheme(e.target.value);
});

// -----------------------------
// Legend toggle with slide open/close
// -----------------------------
document.getElementById('legendToggle').addEventListener('click', () => {
  const legend = document.getElementById('legend');
  const toggle = document.getElementById('legendToggle');
  if (legend.classList.contains('open')) {
    legend.classList.remove('open');
    toggle.textContent = '▼';
  } else {
    legend.classList.add('open');
    toggle.textContent = '▲';
  }
});

// -----------------------------
// Clear info panel on map click
// -----------------------------
map.on('click', () => {
  const panel = document.getElementById('infoPanel');
  panel.style.display = 'none';
  dataLayer.eachLayer(l => l.getElement()?.classList.remove('glow-highlight'));
});

