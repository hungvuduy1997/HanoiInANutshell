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

const subLabels = {
  "CM": "Cách mạng",
  "DN": "Doanh nhân",
  "GD": "Giáo dục",
  "KT": "Kỹ thuật",
  "KT-XH": "Kinh tế - xã hội",
  "LĐ": "Lãnh đạo, nguyên thủ",
  "PK": "Phong kiến, hoàng gia",
  "QC": "Quan chức",
  "QS": "Quân sự",
  "TG": "Tôn giáo",
  "ThTh": "Thần thoại",
  "VH-NT": "Văn hoá - nghệ thuật",
  "YH": "Y học",
  "Other": "Khác"
};

// 📐 Order for Phân loại legend
// Rearrange this list to change legend order
const subOrder = [
  "CM","DN","GD","KT","KT-XH","LĐ","PK","QC","QS","TG","ThTh","VH-NT","YH","Other"
];

// -----------------------------
// -----------------------------
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
  "22 - Nhà Nguyễn & Pháp thuộc - Cách mạng
