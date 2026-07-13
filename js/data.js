import { map } from './map.js';
import { themes } from './themes.js';
import { attachInteractions } from './interactions.js';
import { updateLegend } from './legend.js';
import { DATA_SOURCES, PROPERTY_SCHEMA } from './schema.js'; // Centered relational truth schema

let dataLayer = null;
let bufferLayer = null;
let currentThemeKey = 'categorization'; 
let currentMode = 'light';
let lastBoundsStr = '';

let isZoomEventBound = false;

// Dynamic cache tables allocated dynamically from the schema profiles
const csvStorageTables = {
  geninfo: {},
  database: {},
  trivia: {}
};

let activeFilterValue = null; // Currently selected filter value for highlighting

// Explicit rendering stack priorities: low numbers at bottom, high numbers layered on top
const highwayRenderWeight = {
  'path': 1, 'footway': 1, 'pedestrian': 2, 'service': 3, 'living_street': 4,
  'unclassified': 4, 'residential': 5, 'tertiary_link': 6, 'tertiary': 7,
  'secondary_link': 8, 'secondary': 9, 'primary_link': 10, 'primary': 11,
  'trunk_link': 12, 'trunk': 13, 'motorway_link': 14, 'motorway': 15
};

function parseCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

/**
 * Maps any procedural step percentage (0.0 to 1.0) directly to a mode-specific
 * multi-stop Spectral color ramp, interpolating smoothly between coordinates.
 */
function getSpectralGradientColor(percent, mode) {
  const spectralStops = {
    light: [
      { offset: 0.0,  hex: '#d7191c' },
      { offset: 0.25, hex: '#fdae61' },
      { offset: 0.5,  hex: '#ffffbf' },
      { offset: 0.75, hex: '#abdda4' },
      { offset: 1.0,  hex: '#2b83ba' }
    ],
    dark: [
      { offset: 0.0,  hex: '#ff4d4d' },
      { offset: 0.2,  hex: '#ff9f43' },
      { offset: 0.4,  hex: '#fff200' },
      { offset: 0.6,  hex: '#2ed573' },
      { offset: 0.8,  hex: '#1e90ff' },
      { offset: 1.0,  hex: '#70a1ff' }
    ]
  };

  const p = Math.max(0, Math.min(1, percent));
  const stops = spectralStops[mode] || spectralStops.light;

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i].offset && p <= stops[i + 1].offset) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.offset - lower.offset;
  const localPercent = range === 0 ? 0 : (p - lower.offset) / range;

  const r1 = parseInt(lower.hex.substring(1, 3), 16);
  const g1 = parseInt(lower.hex.substring(3, 5), 16);
  const b1 = parseInt(lower.hex.substring(5, 7), 16);

  const r2 = parseInt(upper.hex.substring(1, 3), 16);
  const g2 = parseInt(upper.hex.substring(3, 5), 16);
  const b2 = parseInt(upper.hex.substring(5, 7), 16);

  const r = Math.round(Math.sqrt(r1 * r1 + (r2 * r2 - r1 * r1) * localPercent));
  const g = Math.round(Math.sqrt(g1 * g1 + (g2 * g2 - g1 * g1) * localPercent));
  const b = Math.round(Math.sqrt(b1 * b1 + (b2 * b2 - b1 * b1) * localPercent));

  const toHex = val => Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Global color resolution engine
export function getColorForValue(theme, value, mode) {
  const fallbackColor = mode === 'dark' ? 'hsl(0, 0%, 60%)' : 'hsl(0, 0%, 70%)';
  if (!theme) return fallbackColor;

  if (theme.isDynamicGradient) {
    const rankIndex = theme.ranks.findIndex(r => r.value === value);
    if (rankIndex !== -1 && theme.ranks.length > 1) {
      const percent = rankIndex / (theme.ranks.length - 1);
      
      const viewToggle = document.getElementById('viewToggle');
      const isSatelliteActive = viewToggle && viewToggle.textContent === 'Bản đồ';
      const resolvedMode = isSatelliteActive ? 'light' : mode;
      
      return getSpectralGradientColor(percent, resolvedMode);
    }
    return fallbackColor;
  } else {
    const def = theme.categories ? theme.categories[value] : null;
    return def ? (mode === 'dark' ? def.darkColor : def.lightColor) : fallbackColor;
  }
}

const getHighwayWidthInMeters = (highway) => {
  switch (highway) {
    case 'motorway': case 'motorway_link': return 15.0;
    case 'trunk': case 'trunk_link': return 12.0;
    case 'primary': case 'primary_link': return 10.0;
    case 'secondary': case 'secondary_link': return 8.0;
    case 'tertiary': case 'tertiary_link': return 6.0;
    case 'residential': case 'unclassified': case 'living_street': case 'construction': return 4.5;
    case 'service': case 'pedestrian': case 'footway': case 'path': return 2.5;
    default: return 4.0;
  }
};

const calculatePixelWeight = (meters) => {
  const zoom = map.getZoom();
  const latInRadians = 21.0285 * (Math.PI / 180);
  const metersPerPixel = (40075016.686 * Math.cos(latInRadians)) / Math.pow(2, zoom + 8);
  return Math.max(1, meters / metersPerPixel);
};

// Global style definition function for GeoJSON vectors
const styleFunction = feature => {
  const props = feature.properties || {};
  const osmId = props.id || feature.id;
  let fullId = '';
  
  if (osmId) {
    const idStr = osmId.toString();
    if (idStr.includes('way/')) fullId = `w${idStr.replace('way/', '')}`;
    else if (idStr.includes('relation/')) fullId = `r${idStr.replace('relation/', '')}`;
    else fullId = idStr.startsWith('w') || idStr.startsWith('r') ? idStr : `w${idStr}`;
  } else {
    fullId = props.full_id;
  }
  
  const combinedData = getStreetCombinedData(fullId);
  const activeTheme = themes[currentThemeKey]; 
  const targetValue = combinedData[activeTheme.attribute] || 'unclassified';
  const hw = combinedData.highway;

  const metersWidth = getHighwayWidthInMeters(hw);
  const dynamicPixelWeight = calculatePixelWeight(metersWidth);

  let dashPattern = null;
  if (['pedestrian', 'footway', 'path'].includes(hw)) {
    dashPattern = `${dynamicPixelWeight * 2} ${dynamicPixelWeight * 2.5}`;
  }
  if (hw === 'construction') {
    dashPattern = `${dynamicPixelWeight * 1} ${dynamicPixelWeight * 2}`;
  }

  let color = getColorForValue(activeTheme, targetValue, currentMode);

  return { 
    color: color, 
    weight: dynamicPixelWeight, 
    dashArray: dashPattern,
    lineCap: 'square', 
    opacity: 1,
    interactive: true
  };
};

// Top-level function wrapper to safely manipulate active filter selection state
export function toggleLegendFilter(value) {
  if (activeFilterValue === value) {
    activeFilterValue = null; 
  } else {
    activeFilterValue = value; 
  }
  
  applyTheme(currentThemeKey);
  return activeFilterValue;
}

/**
 * Parses and processes decentralized CSV structures algorithmically via rules from schema.js
 */
async function loadRelationalData() {
  try {
    console.log("Centralized Engine: Parsing relational CSV data stores...");
    const [genInfoData, dbData, triviaData] = await Promise.all([
      parseCSV(DATA_SOURCES.geninfo.file),
      parseCSV(DATA_SOURCES.database.file),
      parseCSV(DATA_SOURCES.trivia.file)
    ]);

    genInfoData.forEach(row => { 
      const pKey = row[DATA_SOURCES.geninfo.primaryKey];
      if (pKey) csvStorageTables.geninfo[pKey] = row; 
    });
    
    dbData.forEach(row => { 
      const pKey = row[DATA_SOURCES.database.primaryKey];
      if (pKey) csvStorageTables.database[pKey] = row; 
    });
    
    triviaData.forEach(row => { 
      const pKey = row[DATA_SOURCES.trivia.primaryKey];
      if (pKey) csvStorageTables.trivia[pKey] = row; 
    });

    console.log("Centralized Engine: Relational storage structures compiled successfully!");
  } catch (err) {
    console.error("Critical Schema Error: Failed parsing table records:", err);
  }
}

/**
 * Dynamically resolves data elements across separated CSV layers using parameters from schema.js
 */
export function getStreetCombinedData(fullId) {
  const genInfoRow = csvStorageTables.geninfo[fullId] || {};
  
  const dbLookupKey = genInfoRow[DATA_SOURCES.database.foreignKeyInGenInfo];
  const triviaLookupKey = genInfoRow[DATA_SOURCES.trivia.foreignKeyInGenInfo];

  const dbRow = dbLookupKey ? (csvStorageTables.database[dbLookupKey] || {}) : {};
  const triviaRow = triviaLookupKey ? (csvStorageTables.trivia[triviaLookupKey] || {}) : {};

  const compiledRecord = { full_id: fullId };

  // Read explicitly from the master schema layout maps
  Object.keys(PROPERTY_SCHEMA).forEach(propertyKey => {
    const config = PROPERTY_SCHEMA[propertyKey];
    let sourceRow = {};

    if (config.csvSource === 'geninfo') sourceRow = genInfoRow;
    else if (config.csvSource === 'database') sourceRow = dbRow;
    else if (config.csvSource === 'trivia') sourceRow = triviaRow;

    compiledRecord[propertyKey] = sourceRow[config.csvHeader] || config.default;
  });

  return compiledRecord;
}

export async function loadData() {
  await loadRelationalData();
  applyTheme(currentThemeKey, true);
}

export function applyTheme(themeKey, initialLoad = false) {
  const theme = themes[themeKey];
  if (!theme) return;
  currentThemeKey = themeKey;
  rebuildLayers(theme);
  
  if (typeof updateLegend === 'function') {
    const legendData = theme.isDynamicGradient ? theme.ranks : theme.categories;
    updateLegend(legendData, theme, currentMode, getColorForValue);
  }
}

async function rebuildLayers(theme) {
  const getNormalizedId = (f) => {
    const osmId = f.properties?.id || f.id;
    if (!osmId) return f.properties?.full_id || '';
    const idStr = osmId.toString();
    if (idStr.includes('way/')) return `w${idStr.replace('way/', '')}`;
    if (idStr.includes('relation/')) return `r${idStr.replace('relation/', '')}`;
    return idStr.startsWith('w') || idStr.startsWith('r') ? idStr : `w${idStr}`;
  };

  try {
    const bounds = map.getBounds();
    const bbox = {
      minX: bounds.getWest(),
      minY: bounds.getSouth(),
      maxX: bounds.getEast(),
      maxY: bounds.getNorth()
    };

    console.log("Streaming view-bounded binary elements via FlatGeobuf index...");
    const iterator = flatgeobuf.deserialize('data/HIAN_FullDatabase.fgb', bbox);
    const visibleFeatures = [];
    
    const activeTheme = themes[currentThemeKey];

    for await (const feature of iterator) {
      // -------------------------------------------------------------
      // OPTIMIZATION ENHANCEMENT: REVERSED PIPELINE INTERCEPTION
      // -------------------------------------------------------------
      if (activeFilterValue !== null) {
        const fullId = getNormalizedId(feature);
        const combinedData = getStreetCombinedData(fullId);
        const targetValue = combinedData[activeTheme.attribute] || 'unclassified';

        // Discard unmatched vectors directly at the stream entry level
        if (targetValue !== activeFilterValue) {
          continue; 
        }
      }

      visibleFeatures.push(feature);
    }

    const sortedFeatures = visibleFeatures.sort((a, b) => {
      const hwA = getStreetCombinedData(getNormalizedId(a)).highway || 'unclassified';
      const hwB = getStreetCombinedData(getNormalizedId(b)).highway || 'unclassified';
      return (highwayRenderWeight[hwA] || 0) - (highwayRenderWeight[hwB] || 0);
    });

    const sortedGeoJsonStructure = { type: "FeatureCollection", features: sortedFeatures };

    const nextDataLayer = L.geoJson(sortedGeoJsonStructure, {
      style: styleFunction,
      onEachFeature: (f, l) => {
        f.properties.full_id = getNormalizedId(f);
        attachInteractions(l, f);
      }
    });

    const nextBufferLayer = L.geoJson(sortedGeoJsonStructure, {
      style: () => ({ color: 'transparent', weight: 15, opacity: 0, interactive: true }),
      onEachFeature: (f, l) => {
        f.properties.full_id = getNormalizedId(f);
        attachInteractions(l, f);
      }
    });

    nextDataLayer.addTo(map);
    nextBufferLayer.addTo(map);

    if (dataLayer) map.removeLayer(dataLayer);
    if (bufferLayer) map.removeLayer(bufferLayer);

    dataLayer = nextDataLayer;
    bufferLayer = nextBufferLayer;

    if (!isZoomEventBound) {
      map.on('moveend', () => {
        const newBounds = map.getBounds().toBBoxString();
        if (newBounds !== lastBoundsStr) {
          lastBoundsStr = newBounds;
          rebuildLayers(themes[currentThemeKey]);
        }
      });

      map.on('click', () => {
        const panel = document.getElementById('infoPanel');
        if (panel) { panel.innerHTML = ''; panel.style.display = 'none'; }
        
        if (activeFilterValue !== null) {
          activeFilterValue = null;
          applyTheme(currentThemeKey);
        }
      });
      
      isZoomEventBound = true;
    }

  } catch (error) {
    console.error("Error drawing indexed FlatGeobuf layers:", error);
  }
}

export function setMode(mode) { currentMode = mode; applyTheme(currentThemeKey); }
export function getTheme() { return currentThemeKey; }
export function setTheme(key) { applyTheme(key); }