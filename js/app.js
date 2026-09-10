import { initMap } from './map.js';
import { loadData } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize Leaflet Map instance
    initMap();

    // 2. Load relational CSV tables and FlatGeobuf layers safely
    await loadData();

    console.log('Hanoi In A Nutshell initialized successfully!');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});