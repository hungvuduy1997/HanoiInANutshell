import { map } from './map.js';
import { themes } from './themes.js';
import { attachInteractions } from './interactions.js';
import { updateLegend } from './legend.js';

let dataLayer = null;
let bufferLayer = null;
let currentThemeKey = 'highway_type';
let currentMode = 'light';
const dataUrl = 'data/HIAN_FullDatabase.geojson';

let isZoomEventBound = false;
let genInfoMap = {}; // Keyed by full_id
let databaseMap = {}; // Keyed by name
let triviaMap = {};   // Keyed by name:trivia

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

async function loadRelationalData() {
  try {
    console.log("Loading relational CSV data stores...");
    const [genInfoData, dbData, triviaData] = await Promise.all([
      parseCSV('data/hian_geninfo.csv'),
      parseCSV('data/hian_db.csv'),
      parseCSV('data/hian_trivia.csv')
    ]);

    genInfoData.forEach(row => { if (row.full_id) genInfoMap[row.full_id] = row; });
    dbData.forEach(row => { if (row.name) databaseMap[row.name] = row; });
    triviaData.forEach(row => { if (row['name:trivia']) triviaMap[row['name:trivia']] = row; });

    console.log("Relational tables fully optimized!");
  } catch (err) {
    console.error("Critical error mapping relational CSV tables:", err);
  }
}

export function getStreetCombinedData(fullId) {
  const genInfo = genInfoMap[fullId] || {};
  const processedName = genInfo['name:processed'];
  const triviaKey = genInfo['name:trivia'];

  const dbInfo = processedName ? (databaseMap[processedName] || {}) : {};
  const triviaInfo = triviaKey ? (triviaMap[triviaKey] || {}) : {};

  return {
    full_id: fullId,
    highway: genInfo.highway || 'unclassified',
    street_name: genInfo.name || 'Đường phố chưa rõ tên',
    old_names: genInfo['old_name:processed'] || '',
    ...dbInfo,
    ...triviaInfo
  };
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
    updateLegend(theme.categories, theme, currentMode);
  }
}

async function rebuildLayers(theme) {
  if (dataLayer) map.removeLayer(dataLayer);
  if (bufferLayer) map.removeLayer(bufferLayer);

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
    const hw = combinedData.highway;

    // --- FIX: READ THEME CONDITIONALS DYNAMICALLY FROM GLOBAL TRACKING STATE ---
    const activeTheme = themes[currentThemeKey]; 
    const val = combinedData[activeTheme.attribute];
    const def = activeTheme.categories[val];
    const color = def ? (currentMode === 'dark' ? def.darkColor : def.lightColor) : '#999';
    
    const metersWidth = getHighwayWidthInMeters(hw);
    const dynamicPixelWeight = calculatePixelWeight(metersWidth);

    let dashPattern = null;
    if (['pedestrian', 'footway', 'path'].includes(hw)) dashPattern = "6, 5";
    if (hw === 'construction') dashPattern = "3, 4";

    return { 
      color: color, 
      weight: dynamicPixelWeight, 
      dashArray: dashPattern,
      opacity: 0.85,
      interactive: true
    };
  };

  try {
    // 1. Fetch GeoJSON file dataset if not cached
    if (!window._cachedGeojsonData) {
      console.log("Fetching and parsing GeoJSON database...");
      const response = await fetch(dataUrl);
      window._cachedGeojsonData = await response.json();
    }

    // 2. Sort lines dynamically so major corridors draw over local alleys
    const sortedFeatures = [...window._cachedGeojsonData.features].sort((a, b) => {
      const getNormalizedId = (f) => {
        const osmId = f.properties?.id || f.id;
        if (!osmId) return f.properties?.full_id || '';
        const idStr = osmId.toString();
        if (idStr.includes('way/')) return `w${idStr.replace('way/', '')}`;
        if (idStr.includes('relation/')) return `r${idStr.replace('relation/', '')}`;
        return idStr.startsWith('w') || idStr.startsWith('r') ? idStr : `w${idStr}`;
      };

      const fullIdA = getNormalizedId(a);
      const fullIdB = getNormalizedId(b);

      const hwA = getStreetCombinedData(fullIdA).highway || 'unclassified';
      const hwB = getStreetCombinedData(fullIdB).highway || 'unclassified';

      return (highwayRenderWeight[hwA] || 0) - (highwayRenderWeight[hwB] || 0);
    });

    const sortedGeoJsonStructure = { type: "FeatureCollection", features: sortedFeatures };

    // 3. Render visual pathways smoothly onto Leaflet canvas
    dataLayer = L.geoJson(sortedGeoJsonStructure, {
      style: styleFunction,
      onEachFeature: (f, l) => {
        const osmId = f.properties?.id || f.id;
        let fullId = f.properties?.full_id;
        if (osmId) {
          const idStr = osmId.toString();
          if (idStr.includes('way/')) fullId = `w${idStr.replace('way/', '')}`;
          else if (idStr.includes('relation/')) fullId = `r${idStr.replace('relation/', '')}`;
          else fullId = idStr.startsWith('w') || idStr.startsWith('r') ? idStr : `w${idStr}`;
        }
        f.properties.full_id = fullId;
        attachInteractions(l, f);
      }
    }).addTo(map);

    // 4. Invisible thick overlay layers to maximize mobile touch accuracy
    bufferLayer = L.geoJson(sortedGeoJsonStructure, {
      style: () => ({ color: 'transparent', weight: 15, opacity: 0 }),
      onEachFeature: (f, l) => {
        const osmId = f.properties?.id || f.id;
        let fullId = f.properties?.full_id;
        if (osmId) {
          const idStr = osmId.toString();
          if (idStr.includes('way/')) fullId = `w${idStr.replace('way/', '')}`;
          else if (idStr.includes('relation/')) fullId = `r${idStr.replace('relation/', '')}`;
          else fullId = idStr.startsWith('w') || idStr.startsWith('r') ? idStr : `w${idStr}`;
        }
        f.properties.full_id = fullId;
        attachInteractions(l, f);
      }
    }).addTo(map);

    if (!isZoomEventBound) {
      map.on('zoomend', () => { if (dataLayer) dataLayer.setStyle(styleFunction); });
      map.on('click', () => {
        const panel = document.getElementById('infoPanel');
        if (panel) { panel.innerHTML = ''; panel.style.display = 'none'; }
      });
      isZoomEventBound = true;
    }

  } catch (error) {
    console.error("Error drawing GeoJSON vector layers:", error);
  }
}

export function setMode(mode) { currentMode = mode; applyTheme(currentThemeKey); }
export function getTheme() { return currentThemeKey; }
export function setTheme(key) { applyTheme(key); }