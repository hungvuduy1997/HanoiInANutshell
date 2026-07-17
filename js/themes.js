/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 */
export const themes = {
  categorization: {
    name: "Phân loại",
    attribute: "category",
    isDynamicGradient: true,    ranks: [
      { value: "Triều đại", label: "Triều đại" },
      { value: "Sự kiện lịch sử", label: "Sự kiện lịch sử" },
      { value: "Địa danh", label: "Địa danh" },
      { value: "Làng nghề", label: "Làng nghề" },
      { value: "Tôn giáo", label: "Tôn giáo" },
      { value: "Nhân vật lịch sử", label: "Nhân vật lịch sử" },
      { value: "Tư tưởng xã hội", label: "Tư tưởng xã hội" },
      { value: "Khác", label: "Khác" },
      { value: "Unknown", label: "Không rõ" }
    ]
  },
  subcategory: {
    name: "Phân loại phụ",
    attribute: "subcategory",
    isDynamicGradient: true,
    ranks: [
      { value: "Cách mạng", label: "Cách mạng" },
      { value: "Doanh nhân", label: "Doanh nhân" },
      { value: "Giáo dục", label: "Giáo dục" },
      { value: "Kinh tế - xã hội", label: "Kinh tế - xã hội" },
      { value: "Kỹ thuật", label: "Kỹ thuật" },
      { value: "Lãnh đạo", label: "Lãnh đạo" },
      { value: "Phong kiến", label: "Phong kiến" },
      { value: "Quan chức", label: "Quan chức" },
      { value: "Quân sự", label: "Quân sự" },
      { value: "Thần thoại", label: "Thần thoại" },
      { value: "Tổ nghề", label: "Tổ nghề" },
      { value: "Tôn giáo", label: "Tôn giáo" },
      { value: "Văn hoá - nghệ thuật", label: "Văn hoá - nghệ thuật" },
      { value: "Y học", label: "Y học" }
    ]
  },
  historical_epoch: {
    name: "Thời kỳ Lịch sử",
    attribute: "period",
    isDynamicGradient: true,
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