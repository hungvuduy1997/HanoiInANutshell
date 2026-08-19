/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 * Add "hidden:true" for hidden themes.
 * Add ranks: [{value: "<insert value here>", label: "<insert value here>"}] to explicitly create an order for theme
 */
export const themes = {
  categorization: {
    name: "Phân loại",
    description: "",
    attribute: "category",
    ranks: [
      {value: "Triều đại/ Quốc hiệu", label: "Triều đại/ Quốc hiệu"},
      {value: "Sự kiện lịch sử", label: "Sự kiện lịch sử"},
      {value: "Địa danh", label: "Địa danh"},
      {value: "Di tích", label: "Di tích"},
      {value: "Nhân vật lịch sử", label: "Nhân vật lịch sử"},
      {value: "Tư tưởng xã hội", label: "Tư tưởng xã hội"},
      {value: "Khác", label: "Khác"}
    ]
  },
  subcategory: {
    name: "Lĩnh vực hoạt động",
    description: "",
    attribute: "subcategory",
    filter: (combinedData) => {
      const val = combinedData['subcategory'];
      return val && val !== 'NULL' && val.trim() !== '';
    }
  },
  historical_epoch: {
    name: "Thời kỳ Lịch sử",
    description: "Bản đồ thể hiện các thời kỳ lịch sử gắn liền với danh nhân, sự kiện và triều đại được dùng để đặt tên đường phố tại Hà Nội.",
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
      { value: "Cách mạng & kháng chiến", label: "Cách mạng & kháng chiến (1945 - 1975)" }
    ]
  },
  Local_Hero: {
    name: "Danh nhân địa phương",
    description: "",
    attribute: "name_processed",
    filter: (combinedData) => {
      const val = combinedData['localhero'];
      return val && String(val).trim().toUpperCase() === 'TRUE';
    }
  },
  Ke_Of_HN: {
    name: "Các Kẻ ở Hà Nội",
    description: "Trong tiếng Việt cổ, 'Kẻ' nghĩa là một vùng đất, một không gian cư trú, một cộng đồng người. Tại Hà Nội, các làng 'Kẻ' vốn là tên Nôm dân dã của các làng cổ (một số có từ thời Hùng Vương), phần lớn bên cạnh các dòng sông xung quanh kinh thành, tạo thành một vành đai nông - thủ công nghiệp phụ trợ cho kinh thành.",
    attribute: "ke",
    filter: (combinedData) => {
      const val = combinedData['ke'];
      return val && val !== 'NULL' && val.trim() !== '';
    }
  },
  Thap_Tam_Trai: {
    name: "Thập Tam Trại",
    description: ["Thập Tam Trại là một khu vực gắn với lịch sử hình thành của Hà Nội.",
      "Theo tương truyền, khu vực này được hình thành vào thời Lý.",
      "Ông Hoàng Phúc Trung (có chỗ ghi tên là Nguyễn Quý Công) đã có công tìm được xác công chúa con gái vua Lý Nhân Tông bị đắm thuyền khi đi chơi trên sông Thiên Đức (một nhánh của sông Đuống).",
      "Vua muốn ban thưởng, nhưng ông không nhận, chỉ xin cho dân làng Lệ Mật được khai phá vùng đất phía Tây thành Thăng Long, hình thành Thập Tam Trại.",
      "Rất khó xác định được Thập Tam Trại gốc có bao nhiêu làng, gồm những làng nào.",
      "Cũng có nhiều nguồn thông tin khác nhau, nên chỉ có thể tổng hợp và xác định được khu vực Thập Tam Trại bao gồm các làng Ngọc Hà, Hữu Tiệp, Giảng Võ, Thủ Lệ, Liễu Giai, Cống Yên, Cống Vị, Vạn Phúc/ Vạn Bảo, Đại Yên, Vĩnh Phúc, Kim Mã, Ngọc Khánh, Hào Nam/ Thịnh Hào, Xuân Biểu.",
      "Mỗi làng chịu một trách nhiệm riêng với triều đình, trong đó Ngọc Hà, Hữu Tiệp trồng hoa; Giảng Võ luyện võ cho quân lính; Kim Mã nuôi ngựa cho triều đình."].join(' '),
    attribute: "name_processed",
    filter: (combinedData) => {
      const val = combinedData['name_processed'];
      const validTrai = [
        "Lệ Mật", "Ngọc Hà", "Vĩnh Phúc", "Liễu Giai", "Ngọc Khánh", 
        "Vạn Phúc", "Kim Mã", "Kim Mã Thượng", "Giảng Võ", "Vạn Bảo", "Hào Nam", "Thịnh Hào"
      ];
      return val && validTrai.includes(val.trim());
    },
    ranks: [
      { value: "Lệ Mật", label: "Lệ Mật" },
      { value: "Ngọc Hà", label: "Ngọc Hà" },
      { value: "Vĩnh Phúc", label: "Vĩnh Phúc" },
      { value: "Liễu Giai", label: "Liễu Giai" },
      { value: "Ngọc Khánh", label: "Ngọc Khánh" },
      { value: "Vạn Phúc", label: "Vạn Phúc" },
      { value: "Kim Mã", label: "Kim Mã" },
      { value: "Kim Mã Thượng", label: "Kim Mã Thượng"},
      { value: "Giảng Võ", label: "Giảng Võ" },
      { value: "Vạn Bảo", label: "Vạn Bảo" },
      { value: "Hào Nam", label: "Hào Nam" },
      { value: "Thịnh Hào", label: "Thịnh Hào" }
    ]
  },
  navalbattle: {
    name: "Thuỷ chiến nhà Trần",
    attribute: "name_processed", // Color/rank features by name
    filter: (combinedData) => {
      const val = combinedData['theme'];
      if (!val || val === 'NULL') return false;
      // Splits "Thuỷ chiến nhà Trần, ..." by commas and checks if the theme is present
      return val.split(',').map(t => t.trim()).includes("Thuỷ chiến nhà Trần");
    }
  } // Ensure this closing brace exists!
};