/**
 * Centralized Application Data Schema
 * Controls labels, fallback defaults, and rendering targets for all relational CSV columns.
 * * Targets:
 * - 'popup_header': Top bold title of map popups
 * - 'popup_row': Small sub-details inside map popups
 * - 'panel_header': Main top title of the detailed sidebar panel
 * - 'panel_subheader': Italicized second-row text in the sidebar panel
 * - 'panel_row': Main descriptive key-value rows inside the sidebar panel
 */
export const PROPERTY_SCHEMA = {
  street_name: {
    label: "Tên đường/phố",
    default: "Đường phố chưa biết tên",
    targets: ["popup_header", "panel_header"]
  },
  old_names: {
    label: "Tên cũ",
    default: "",
    targets: ["panel_subheader"]
  },
  subcategory: {
    label: "Phân loại phụ",
    default: "",
    targets: ["popup_row"]
  },
  description: {
    label: "Mô tả",
    default: "",
    targets: ["panel_row"]
  },
  trivia: {
    label: "Thông tin bên lề",
    default: "",
    targets: ["panel_row"]
  }
  
  // TO ADD MORE PROPERTIES IN THE FUTURE:
  // Just drop them here matching your CSV headers exactly, for example:
  // district: {
  //   label: "Quận/Huyện",
  //   default: "",
  //   targets: ["popup_row", "panel_row"]
  // }
};