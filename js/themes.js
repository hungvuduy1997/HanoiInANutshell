/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 */
export const themes = {
  // Theme 1: Spatial Functional Classification
  highway_hierarchy: {
    name: "Phân cấp đường bộ",
    attribute: "highway",
    isDynamicGradient: true,
    lightStartOklch: { l: 0.56, c: 0.22, h: 27 },
    lightEndOklch:   { l: 0.58, c: 0.12, h: 241 },
    darkStartOklch:  { l: 0.56, c: 0.22, h: 27 },
    darkEndOklch:    { l: 0.58, c: 0.12, h: 241 },
    ranks: [
      { value: "motorway", label: "Đường bộ trên cao" },
      { value: "motorway_link", label: "Đường nối cao tốc" },
      { value: "trunk", label: "Đường đối ngoại" },
      { value: "trunk_link", label: "Đường nối đối ngoại" },
      { value: "primary", label: "Đường trục chính" },
      { value: "primary_link", label: "Đường nối trục chính" },
      { value: "secondary", label: "Đường cấp hai" },
      { value: "secondary_link", label: "Đường nối cấp hai" },
      { value: "tertiary", label: "Đường cấp ba" },
      { value: "tertiary_link", label: "Đường nối cấp ba" },
      { value: "road", label: "Đường hỗn hợp" },
      { value: "residential", label: "Đường nội bộ" },
      { value: "service", label: "Đường nội khu" },
      { value: "living_street", label: "Đường dân sinh" },
      { value: "cycleway", label: "Đường xe đạp" },
      { value: "pedestrian", label: "Đường đi bộ" },
      { value: "construction", label: "Đang xây dựng" },
      { value: "unclassified", label: "Chưa phân loại" }
    ]
  },

  // Theme 2: Historical Epoch/Chronology
  historical_epoch: {
    name: "Thời kỳ Lịch sử",
    attribute: "period",
    isDynamicGradient: true,
    lightStartOklch: { l: 0.56, c: 0.22, h: 27 },
    lightEndOklch:   { l: 0.58, c: 0.12, h: 241 },
    darkStartOklch:  { l: 0.56, c: 0.22, h: 27 },
    darkEndOklch:    { l: 0.58, c: 0.12, h: 241 },
    ranks: [
      { value: "Hồng Bàng - sơ sử", label: "Hồng Bàng - sơ sử (trước 258 TCN)" },
      { value: "Bắc Thuộc & khởi nghĩa", label: "Bắc Thuộc & khởi nghĩa (258 TCN - 938 SCN)" },
      { value: "Độc lập tự chủ sớm", label: "Độc lập tự chủ sớm (938 - 1009)" },
      { value: "Nhà Lý", label: "Nhà Lý (1009 - 1226)" },
      { value: "Nhà Trần", label: "Nhà Trần (1226 - 1400)" },
      { value: "Nhà Hồ & Minh thuộc", label: "Nhà Hồ & Minh thuộc (1400 - 1428)" },
      { value: "Nhà Hậu Lê", label: "Nhà Hậu Lê (1428 - 1527)" },
      { value: "Phân tranh", label: "Phân tranh (1527 - 1788)" },
      { value: "Nhà Tây Sơn", label: "Nhà Tây Sơn (1788 - 1802)" },
      { value: "Nhà Nguyễn & Pháp thuộc", label: "Nhà Nguyễn & Pháp thuộc (1802 - 1945)" },
      { value: "Cách mạng & kháng chiến", label: "Cách mạng & kháng chiến (1945 - 1975)" },
      { value: "Sau Giải phóng & hiện đại", label: "Sau Giải phóng & hiện đại (1975 - nay)" }
    ]
  }
};