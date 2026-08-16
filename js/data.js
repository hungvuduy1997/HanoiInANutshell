import { map } from './map.js';
import { themes } from './themes.js';
import { attachInteractions } from './interactions.js';
import { updateLegend } from './legend.js';
import { DATA_SOURCES, PROPERTY_SCHEMA } from './schema.js'; // Centered relational truth schema
import { getCurrentModeString } from './map.js';

let dataLayer = null;
let bufferLayer = null;
let currentThemeKey = 'categorization'; 
let currentMode = 'light';
let lastBoundsStr = '';
const GLOBAL_ROAD_SCALE = 0.8;
let isZoomEventBound = false;

// Dynamic cache tables allocated dynamically from the schema profiles
const csvStorageTables = {
  geninfo: {},
  database: {},
  trivia: {}
};

window._csvStorageTables = csvStorageTables;

let activeFilterValue = null; // Currently selected filter value for highlighting

// Explicit rendering stack priorities: low numbers at bottom, high numbers layered on top
const highwayRenderWeight = {
  'unclassified': 1, 'elevator': 2, 'ladder': 3, 'corridor': 4, 'steps': 5,
  'path': 6, 'footway': 7, 'bridleway': 8, 'pedestrian': 9, 'track': 10,
  'busway': 11, 'living_street': 12, 'service': 13, 'raceway': 14, 'residential': 15,
  'tertiary_link': 16, 'tertiary': 17, 'secondary_link': 18, 'secondary': 19, 'primary_link': 20,
  'primary': 21, 'trunk_link': 22, 'trunk': 23, 'motorway_link': 24, 'motorway': 25
};

const RESTRICTED_HIGHWAY_TYPES = ['unclassified', 'elevator', 'ladder', 'corridor', 'steps', 'path', 'bridleway', 'pedestrian', 'track']

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
 * Updates the description box UI based on theme settings
 */
function updateThemeDescription(theme) {
  const descBox = document.getElementById('themeDescriptionBox');
  if (!descBox) return;

  if (theme && theme.description && theme.description.trim() !== '') {
    descBox.innerHTML = `
      <button class="close-desc-btn" id="closeDescBtn" aria-label="Close description">&times;</button>
      <div><strong>${theme.name || ''}</strong><br>${theme.description}</div>
    `;
    descBox.style.display = 'block';

    const closeBtn = document.getElementById('closeDescBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        descBox.style.display = 'none';
      });
    }
  } else {
    descBox.style.display = 'none';
  }
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
      { offset: 0.375,hex: '#ffbb00' },
      { offset: 0.5,  hex: '#81eb61' },
      { offset: 0.75, hex: '#abdda4' },
      { offset: 1.0,  hex: '#2b83ba' }
    ],/**
    [
      { offset: 0.0,  hex: '#d77a61' },
      { offset: 0.2,  hex: '#e4b0ba' },
      { offset: 0.4,  hex: '#e9c46a' },
      { offset: 0.6,  hex: '#b6c99a' },
      { offset: 0.8,  hex: '#8fb4c7' },
      { offset: 1.0,  hex: '#b08bbb' }
    ],*/
    dark: /**[
      { offset: 0.0,  hex: '#d77a61' },
      { offset: 0.2,  hex: '#e4b0ba' },
      { offset: 0.4,  hex: '#e9c46a' },
      { offset: 0.6,  hex: '#b6c99a' },
      { offset: 0.8,  hex: '#8fb4c7' },
      { offset: 1.0,  hex: '#b08bbb' }
    ]*/[
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
  const fallbackColor = mode === 'dark' ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 70%)';
  if (!theme) return fallbackColor;

  if (theme.ranks && theme.ranks.length > 0) {
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
  const hw = highway ? highway.toString().toLowerCase().trim() : '';

  switch (hw) {
    case 'motorway': case 'motorway_link': return 24.0;
    case 'trunk': case 'trunk_link': return 18.0;
    case 'primary': case 'primary_link': return 12.0;
    case 'secondary': case 'secondary_link': return 8.0;
    case 'tertiary': case 'tertiary_link': return 5.5;
    
    case 'residential': case 'unclassified': case 'service': case 'construction': case 'proposed': return 3.5;
    
    case 'pedestrian': return 2.5;
    case 'footway': case 'path': return 1; 
    
    default: return 1; 
  }
};

const calculatePixelWeight = (meters) => {
  const zoom = map.getZoom();
  const latInRadians = 21.0285 * (Math.PI / 180);
  const metersPerPixel = (40075016.686 * Math.cos(latInRadians)) / Math.pow(2, zoom + 8);
  
  const rawPixels = meters / metersPerPixel;
  return Math.max(0.5, rawPixels * GLOBAL_ROAD_SCALE);
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
  const targetValue = combinedData[activeTheme.attribute] || 'Unknown';
  
  const hw = props.highway || combinedData.highway; 

  const metersWidth = getHighwayWidthInMeters(hw);
  const dynamicPixelWeight = calculatePixelWeight(metersWidth);

  let dashPattern = null;
  if (['pedestrian', 'footway'].includes(hw)) { 
    dashPattern = `${dynamicPixelWeight * 2} ${dynamicPixelWeight * 2.5}`;
  }
  if (['construction', 'path'].includes(hw)) { 
    dashPattern = `${dynamicPixelWeight * 1} ${dynamicPixelWeight * 2}`;
  }
  if (hw === 'proposed') {
    dashPattern = `${dynamicPixelWeight * 1.5} ${dynamicPixelWeight * 5}`;
  }

  let color = getColorForValue(activeTheme, targetValue, currentMode);
  const dynamicOpacity = (hw === 'proposed') ? 0.4 : 1.0;

  const hasValidName = combinedData.street_name && 
                       combinedData.street_name !== 'NULL' && 
                       combinedData.street_name !== '' && 
                       combinedData.street_name !== 'Đường phố chưa biết tên';

  return { 
    color: color, 
    weight: dynamicPixelWeight,
    dashArray: dashPattern,
    lineCap: 'round',
    opacity: dynamicOpacity,
    interactive: hasValidName
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
  
  // Rebuild the geographic vectors layer stack safely
  rebuildLayers(theme);

  // Update theme description UI
  updateThemeDescription(theme);
  
  if (typeof updateLegend === 'function') {
    let legendData = null;

    if (theme.ranks && theme.ranks.length > 0) {
      legendData = theme.ranks;
    } 
    else if (theme.categories && Object.keys(theme.categories).length > 0) {
      legendData = theme.categories;
    } 
    else {
      console.log(`Legend Engine: Attribute drop detected for "${themeKey}". Compiling dynamic parameters...`);
      // Inside applyTheme() in js/data.js:
      const data = window._csvStorageTables;
      const uniqueValues = new Set();

      if (data && data.geninfo) {
        Object.keys(data.geninfo).forEach(fullId => {
          const combinedData = getStreetCombinedData(fullId);

          // 1. Run the theme's filter FIRST (if one exists)
          if (theme.filter && !theme.filter(combinedData)) {
            return; // Skip streets that don't pass the filter!
          }

          // 2. Extract the attribute value ONLY from features that passed
          const rawValue = combinedData[theme.attribute];

          if (rawValue && rawValue !== 'NULL' && rawValue.toString().trim() !== '') {
            uniqueValues.add(rawValue.toString().trim());
          }
        });
      }

      legendData = Array.from(uniqueValues)
        .sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }))
        .map(val => ({
          value: val,
          label: val
        }));

      theme.ranks = legendData;
    }

    updateLegend(legendData, theme, currentMode, getColorForValue);
  }

  if (map) {
    const zoom = map.getZoom();
    const center = map.getCenter();
    const activeModeStr = typeof getCurrentModeString === 'function' ? getCurrentModeString() : 'light';
    window.history.replaceState(null, null, `#${themeKey}/${activeModeStr}/${zoom}/${center.lat.toFixed(5)}/${center.lng.toFixed(5)}`);
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

    // Dynamically resolves FGB path from active theme or defaults to fallback schema configuration
    const fgbFilePath = theme?.fgbSource || (DATA_SOURCES.geninfo.fgbDefault || 'data/HIAN_Geometry-260719.fgb');

    console.log(`Streaming view-bounded binary elements via FlatGeobuf index (${fgbFilePath})...`);
    const iterator = flatgeobuf.deserialize(fgbFilePath, bbox);
    const visibleFeatures = [];
    
    const activeTheme = themes[currentThemeKey];

    for await (const feature of iterator) {
      const fullId = getNormalizedId(feature);
      const combinedData = getStreetCombinedData(fullId);

      // 1. PRE-FILTER OPTIMIZATION
      if (activeTheme && typeof activeTheme.filter === 'function') {
        if (!activeTheme.filter(combinedData)) {
          continue; 
        }
      }

      // 2. LEGEND CLICK HIGHLIGHT FILTER
      if (activeFilterValue !== null) {
        const targetValue = combinedData[activeTheme.attribute] || 'Unknown';
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

    // Inside async function rebuildLayers(theme) in js/data.js

    const nextDataLayer = L.geoJson(sortedGeoJsonStructure, {
      style: styleFunction,
      pointToLayer: (feature, latlng) => {
        const normId = getNormalizedId(feature);
        const combinedData = getStreetCombinedData(normId);
        const activeTheme = themes[currentThemeKey];
        const targetValue = combinedData[activeTheme?.attribute] || 'Unknown';
        const color = getColorForValue(activeTheme, targetValue, currentMode);

        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
          interactive: true
        });
      },
      onEachFeature: (f, l) => {
        const normId = getNormalizedId(f);
        f.properties.full_id = normId;
        
        const combinedData = getStreetCombinedData(normId);
        
        // 1. Check if street name is missing/invalid
        const isNameMissing = !combinedData.street_name || 
                              combinedData.street_name === 'NULL' || 
                              combinedData.street_name === '' || 
                              combinedData.street_name === 'Đường phố chưa biết tên';

        // 2. Check if the road type is in your restricted list
        const roadType = (combinedData.highway || f.properties.highway || '').toLowerCase().trim();
        const isRestrictedType = RESTRICTED_HIGHWAY_TYPES.includes(roadType);

        // 3. Un-clickable ONLY IF it's a restricted type AND has no name
        const isUnclickable = isRestrictedType && isNameMissing;

        if (!isUnclickable) {
          attachInteractions(l, f);
        } else {
          l.options.interactive = false;
          if (l.on) {
            l.on('add', () => {
              if (l._path) l._path.style.pointerEvents = 'none';
            });
          }
        }
      }
    });

    const nextBufferLayer = L.geoJson(sortedGeoJsonStructure, {
      style: () => ({ color: 'transparent', weight: 15, opacity: 0, interactive: true }),
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 25,
          stroke: false,
          fill: true,
          fillOpacity: 0,
          interactive: true
        });
      },
      onEachFeature: (f, l) => {
        const normId = getNormalizedId(f);
        f.properties.full_id = normId;
        
        const combinedData = getStreetCombinedData(normId);
        
        const isNameMissing = !combinedData.street_name || 
                              combinedData.street_name === 'NULL' || 
                              combinedData.street_name === '' || 
                              combinedData.street_name === 'Đường phố chưa biết tên';

        const roadType = (combinedData.highway || f.properties.highway || '').toLowerCase().trim();
        const isRestrictedType = RESTRICTED_HIGHWAY_TYPES.includes(roadType);

        const isUnclickable = isRestrictedType && isNameMissing;

        if (!isUnclickable) {
          attachInteractions(l, f);
        } else {
          l.options.interactive = false;
        }
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