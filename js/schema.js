/**
 * Centralized Application Data & Relational Schema
 * * 1. DATA_SOURCES: Defines the relational layout, primary keys, and linking paths
 * between the decentralized CSV files.
 * * 2. PROPERTY_SCHEMA: Maps every user-facing property to its raw CSV source,
 * its exact column header name, fallback defaults, and UI layout rendering targets.
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
    label: 'Highway Type',
    default: 'unclassified',
    targets: [] // Intercepted programmatically by the map engine renderer
  },
  street_name: {
    csvSource: 'geninfo',
    csvHeader: 'name',
    label: 'Street Name',
    default: 'Unnamed Street',
    targets: ['popup_header', 'panel_header']
  },
  old_names: {
    csvSource: 'geninfo',
    csvHeader: 'old_name:processed',
    label: 'Old Names',
    default: '',
    targets: ['panel_subheader']
  },

  // --- PROPERTIES OUT OF hian_db.csv ---
  subcategory: {
    csvSource: 'database',
    csvHeader: 'subcategory',
    label: 'Sub-Category',
    default: '',
    targets: ['popup_row']
  },
  description: {
    csvSource: 'database',
    csvHeader: 'description',
    label: 'Description',
    default: '',
    targets: ['panel_row']
  },

  // --- PROPERTIES OUT OF hian_trivia.csv ---
  trivia: {
    csvSource: 'trivia',
    csvHeader: 'trivia', // Matches the text column header in hian_trivia.csv
    label: 'Trivia & Anecdotes',
    default: '',
    targets: ['panel_row']
  }

  /* FUTURE EXPANSION EXAMPLE:
  If you add a new column 'established_year' to hian_db.csv, you only write this:
  
  established_year: {
    csvSource: 'database',
    csvHeader: 'established_year',
    label: 'Year Established',
    default: 'Unknown',
    targets: ['panel_row']
  }
  */
};