/**
 * Visual Layout Theme Definitions for the Road Database
 * Maps categorical attributes to specific HEX values for both Light and Dark conditions.
 */
export const themes = {
  // Theme 1: Spatial Functional Classification (Example attribute: 'highway')
  highway_type: {
    name: "Functional Class",
    attribute: "highway",
    categories: {
      'motorway':     { lightColor: '#D84315', darkColor: '#FF7043', label: 'Expressway' },
      'trunk':        { lightColor: '#E65100', darkColor: '#FFB74D', label: 'Arterial Spine' },
      'primary':      { lightColor: '#F57C00', darkColor: '#FFE082', label: 'Primary Road' },
      'secondary':    { lightColor: '#FBC02D', darkColor: '#FFF59D', label: 'Secondary Link' },
      'tertiary':     { lightColor: '#388E3C', darkColor: '#A5D6A7', label: 'Local Collector' },
      'residential':  { lightColor: '#1976D2', darkColor: '#90CAF9', label: 'Residential Grid' },
      'service':      { lightColor: '#78909C', darkColor: '#B0BEC5', label: 'Alleys / Service Access' },
      'pedestrian':   { lightColor: '#C2185B', darkColor: '#F48FB1', label: 'Historical Walking Lanes' }
    }
  },

  // Theme 2: Historical Epoch/Chronology (Example database attribute: 'period')
  historical_epoch: {
    name: "Historical Period",
    attribute: "period", // Matches column name inside hian_db.csv or hian_geninfo.csv
    categories: {
      'feudal':       { lightColor: '#8D6E63', darkColor: '#D7CCC8', label: 'Pre-Colonial (Ancient)' },
      'french':       { lightColor: '#0D47A1', darkColor: '#64B5F6', label: 'French Colonial Era' },
      'modern':       { lightColor: '#2E7D32', darkColor: '#81C784', label: 'Post-1954 Modern Grid' },
      'contemporary': { lightColor: '#E53935', darkColor: '#EF9A9A', label: 'Recent Expansions' }
    }
  }
};