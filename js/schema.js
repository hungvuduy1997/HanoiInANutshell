/**
 * Centralized Application Data & Relational Schema
 * 
 * 1. DATA_SOURCES: Defines the relational layout, primary keys, and linking paths
 *    between the decentralized CSV files.
 * 
 * 2. PROPERTY_SCHEMA (UI LAYOUT & ROUTING MAP):
 *    Maps every user-facing attribute to its raw CSV source, column header, and fallback defaults.
 *    The 'targets' array dynamically routes where each attribute is rendered in the UI:
 *      - 'popup_header'    --> Renders as the bold main title inside the map's small Pop-up Box.
 *      - 'popup_row'       --> Appends as a secondary parenthetical detail inside the small Pop-up Box.
 *      - 'panel_header'    --> Renders as the large H3 title in the sidebar Info Panel.
 *      - 'panel_subheader' --> Renders as italicized secondary text under the title in the sidebar Info Panel.
 *      - 'panel_row'       --> Renders as a structured detail row inside the body of the sidebar Info Panel.
 *      - Empty Array ([])  --> Handled dynamically by styling/rendering engines (e.g., road widths or map colors).
 */

export const DATA_SOURCES = {
  geninfo: {
    file: 'data/hian_geninfo.csv',
    primaryKey: 'full_id',        // Root identifier matching map geometries
    label: 'Geographic Base Table'
  },
  database: {
    file: 'data/hian_db.csv',
    primaryKey: 'name',           // Looked up via geninfo['name:processed']
    foreignKeyInGenInfo: 'name:processed',
    label: 'Historical Attributes Table'
  },
  trivia: {
    file: 'data/hian_trivia.csv',
    primaryKey: 'name:trivia',    // Looked up via geninfo['name:trivia']
    foreignKeyInGenInfo: 'name:trivia',
    label: 'Trivia & Anecdotes Table'
  }
};

export const PROPERTY_SCHEMA = {
  // --- PROPERTIES OUT OF hian_geninfo.csv ---
  highway: {
    csvSource: 'geninfo',
    csvHeader: 'highway',
    label: 'Loại đường',
    default: 'unclassified',
    targets: [] // Handled directly by the rendering pipeline weights
  },
  street_name: {
    csvSource: 'geninfo',
    csvHeader: 'name',
    label: 'Tên đường/ phố',
    default: 'Đường phố chưa biết tên',
    targets: ['popup_header', 'panel_header']
  },
  old_names: {
    csvSource: 'geninfo',
    csvHeader: 'old_name:processed',
    label: 'Tên cũ',
    default: '',
    targets: ['panel_subheader']
  },

  // --- THEME ATTRIBUTES OUT OF hian_db.csv ---
  category: {
    csvSource: 'database',
    csvHeader: 'category', // Matches themes.categorization.attribute exactly
    label: 'Phân loại chính',
    default: 'Không rõ',
    targets: [] // Picked up by map engine styles & legend systems
  },
  subcategory: {
    csvSource: 'database',
    csvHeader: 'subcategory',
    label: 'Phân loại con',
    default: '',
    targets: ['panel_row']
  },
  period: {
    csvSource: 'database',
    csvHeader: 'period', // Matches themes.historical_epoch.attribute exactly
    label: 'Thời kỳ',
    default: '',
    targets: ['panel_row']
  },
  profession: {
    csvSource: 'database',
    csvHeader: 'profession',
    label: 'Nghề nghiệp chính',
    default: '',
    targets: ['panel_row']
  },
    birthanddeath: {
    csvSource: 'database',
    csvHeader: 'birthanddeath',
    label: 'Ngày sinh & mất',
    default: '',
    targets: ['panel_row']
  },
  title: {
    csvSource: 'database',
    csvHeader: 'title',
    label: 'Chức vụ / Danh hiệu',
    default: '',
    targets: ['panel_row']
  },
  equititle: {
    csvSource: 'database',
    csvHeader: 'equititle',
    label: 'Danh hiệu tương đương',
    default: '',
    targets: ['panel_row']
  },
  family: {
    csvSource: 'database',
    csvHeader: 'family',
    label: 'Mối quan hệ gia đình',
    default: '',
    targets: ['panel_row']
  },
  ke: {
    csvSource: 'database',
    csvHeader: 'ke',
    label: 'Kẻ',
    default: '',
    targets: ['panel_row']
  },
  othernames: {
    csvSource: 'database',
    csvHeader: 'othernames',
    label: 'Tên gọi khác',
    default: '',
    targets: ['panel_row']
  },
  description: {
    csvSource: 'database',
    csvHeader: 'description',
    label: 'Mô tả',
    default: '',
    targets: ['panel_row']
  },
  name_processed: {
    csvSource: 'geninfo',
    csvHeader: 'name:processed',
  },

  // --- PROPERTIES OUT OF hian_trivia.csv ---
  trivia: {
    csvSource: 'trivia',
    csvHeader: 'trivia',
    label: 'Thông tin thú vị',
    default: '',
    targets: ['panel_row']
  }
};