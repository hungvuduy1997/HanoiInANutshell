/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 * Add "hidden:true" for hidden themes.
 * Add ranks: [{value: "<insert value here>", label: "<insert value here>"}] to explicitly create an order for theme
 */
export const themes = {
  categorization: {
    name: "Phân loại",
    attribute: "category",
    ranks: [
      { value: "Triều đại", label: "Triều đại" },
      { value: "Quốc hiệu", label: "Quốc hiệu"},
      { value: "Sự kiện lịch sử", label: "Sự kiện lịch sử" },
      { value: "Địa danh", label: "Địa danh" },
      { value: "Làng nghề", label: "Làng nghề" },
      { value: "Tôn giáo", label: "Tôn giáo" },
      { value: "Nhân vật lịch sử", label: "Nhân vật lịch sử" },
      { value: "Tư tưởng xã hội", label: "Tư tưởng xã hội" },
      { value: "Khác", label: "Khác" },
      { value: "Không rõ", label: "Không rõ" }
    ]
  },
  subcategory: {
    name: "Phân loại phụ",
    attribute: "subcategory",
    filter: (combinedData) => {
      const val = combinedData['subcategory'];
      return val && val !== 'NULL' && val.trim() !== '';
    }
  },
  historical_epoch: {
    name: "Thời kỳ Lịch sử",
    attribute: "period",
    filter: (combinedData) => {
      const val = combinedData['period'];
      return val && val !== 'NULL' && val.trim() !== '';
    },
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
  },
  Ke_Of_HN: {
    name: "Các Kẻ ở Hà Nội",
    attribute: "ke",
    filter: (combinedData) => {
      const val = combinedData['ke'];
      return val && val !== 'NULL' && val.trim() !== '';
    }
  }
};