/**
 * Centralized Application Data & Relational Schema
 * * 1. DATA_SOURCES: Defines the relational layout, primary keys, and linking paths
 * between the decentralized CSV files.
 * 2. PROPERTY_SCHEMA: Maps every user-facing property to its raw CSV source,
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
    targets: [] // Handled directly by the rendering pipeline weights
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

  // --- THEME ATTRIBUTES OUT OF hian_db.csv ---
  category: {
    csvSource: 'database',
    csvHeader: 'category', // Matches themes.categorization.attribute exactly
    label: 'Classification',
    default: 'Unknown',
    targets: [] // Picked up by map engine styles & legend systems
  },
  period: {
    csvSource: 'database',
    csvHeader: 'period', // Matches themes.historical_epoch.attribute exactly
    label: 'Historical Period',
    default: 'Unknown',
    targets: []
  },

  // --- OTHER DESCRIPTIONAL FIELDS OUT OF hian_db.csv ---
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
    csvHeader: 'trivia',
    label: 'Trivia & Anecdotes',
    default: '',
    targets: ['panel_row']
  }
};