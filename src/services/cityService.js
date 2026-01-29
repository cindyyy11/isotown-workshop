/**
 * City Service
 * 
 * Handles city state management, building placement, and tick simulation
 */

import { BUILDING_TYPES, GRID_CONFIG, INITIAL_STATE, TICK_INTERVAL } from '../data/buildingData.js';
import { getGridKey, parseGridKey, isValidGridPosition } from './isometricRenderer.js';
import { syncCharactersWithPopulation } from './characterService.js';

const SAVE_KEY = 'isotown_state_v1';
const CITY_LOG_MAX = 10;

/**
 * Append an event to city log (memories). Keeps last CITY_LOG_MAX entries.
 * @param {Object} state
 * @param {string} message
 * @returns {Object} New state with updated cityLog
 */
export function addCityLog(state, message) {
  const log = [message, ...(state.cityLog || [])].slice(0, CITY_LOG_MAX);
  return { ...state, cityLog: log };
}

/**
 * Load city state from localStorage
 * @returns {Object|null}
 */
export function loadCityState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (state.version === INITIAL_STATE.version) {
        return state;
      }
    }
  } catch (error) {
    console.error('Failed to load city state:', error);
  }
  return null;
}

/**
 * Save city state to localStorage
 * @param {Object} state
 */
export function saveCityState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save city state:', error);
  }
}

/**
 * Clear saved city state
 */
export function clearCityState() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear city state:', error);
  }
}

/**
 * Initialize new city
 * @param {string} worldCondition
 * @param {number} [worldTemperature] - From weather API (location-based)
 * @returns {Object}
 */
export function initializeCity(worldCondition, worldTemperature) {
  return {
    ...INITIAL_STATE,
    worldCondition,
    worldTemperature: typeof worldTemperature === 'number' && !Number.isNaN(worldTemperature) ? worldTemperature : undefined,
    worldConditionFetchedAt: Date.now(),
    lastTickAt: Date.now(),
    characters: [],
    lastCharacterUpdate: Date.now(),
  };
}

/**
 * Check if player can afford a building
 * @param {Object} state
 * @param {string} buildingType
 * @returns {boolean}
 */
export function canAfford(state, buildingType) {
  const building = BUILDING_TYPES[buildingType];
  return state.coins >= building.cost;
}

/**
 * Place a building on the grid
 * @param {Object} state
 * @param {number} x
 * @param {number} y
 * @param {string} buildingType
 * @returns {Object|null} - New state or null if invalid
 */
export function placeBuilding(state, x, y, buildingType) {
  if (!isValidGridPosition(x, y)) return null;

  const key = getGridKey(x, y);
  const building = BUILDING_TYPES[buildingType];

  // Check if tile is occupied
  if (state.grid[key]) return null;

  // Check if can afford
  if (!canAfford(state, buildingType)) return null;

  const newGrid = { ...state.grid };
  newGrid[key] = {
    type: buildingType,
    placedAt: Date.now(),
  };

  let newState = {
    ...state,
    grid: newGrid,
    coins: state.coins - building.cost,
    population: state.population + (building.effects.population || 0),
    happiness: state.happiness + (building.effects.happiness || 0),
    jobs: state.jobs + (building.effects.jobs || 0),
  };

  newState = addCityLog(newState, `Built ${building.name}`);
  newState.characters = syncCharactersWithPopulation(
    state.characters || [],
    newState.population,
    newState.grid,
    { includePlayer: state.includePlayer !== false }
  );

  return newState;
}

/**
 * Erase a building from the grid
 * @param {Object} state
 * @param {number} x
 * @param {number} y
 * @returns {Object|null}
 */
export function eraseBuilding(state, x, y) {
  if (!isValidGridPosition(x, y)) return null;

  const key = getGridKey(x, y);
  if (!state.grid[key]) return null;

  const buildingType = state.grid[key].type;
  const building = BUILDING_TYPES[buildingType];

  const newGrid = { ...state.grid };
  delete newGrid[key];

  const newState = {
    ...state,
    grid: newGrid,
    coins: state.coins + Math.floor(building.cost / 2), // Refund 50%
    population: Math.max(0, state.population - (building.effects.population || 0)),
    happiness: Math.max(0, state.happiness - (building.effects.happiness || 0)),
    jobs: Math.max(0, state.jobs - (building.effects.jobs || 0)),
  };
  const logged = addCityLog(newState, `Removed ${building.name}`);
  logged.characters = syncCharactersWithPopulation(
    state.characters || [],
    logged.population,
    logged.grid,
    { includePlayer: state.includePlayer !== false }
  );
  return logged;
}

/**
 * Get adjacent tiles
 * @param {number} x
 * @param {number} y
 * @returns {Array} - Array of {x, y}
 */
function getAdjacentTiles(x, y) {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter(pos => isValidGridPosition(pos.x, pos.y));
}

/**
 * Get tiles within distance
 * @param {number} x
 * @param {number} y
 * @param {number} distance
 * @returns {Array}
 */
function getTilesWithinDistance(x, y, distance) {
  const tiles = [];
  for (let dx = -distance; dx <= distance; dx++) {
    for (let dy = -distance; dy <= distance; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist <= distance && isValidGridPosition(nx, ny)) {
        tiles.push({ x: nx, y: ny });
      }
    }
  }
  return tiles;
}

/**
 * Check if building is adjacent to road
 * @param {Object} grid
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function isAdjacentToRoad(grid, x, y) {
  const adjacent = getAdjacentTiles(x, y);
  return adjacent.some(pos => {
    const key = getGridKey(pos.x, pos.y);
    return grid[key] && grid[key].type === 'ROAD';
  });
}

/**
 * Check if there's a house within distance
 * @param {Object} grid
 * @param {number} x
 * @param {number} y
 * @param {number} distance
 * @returns {boolean}
 */
function hasHouseNearby(grid, x, y, distance) {
  const tiles = getTilesWithinDistance(x, y, distance);
  return tiles.some(pos => {
    const key = getGridKey(pos.x, pos.y);
    return grid[key] && grid[key].type === 'HOUSE';
  });
}

/**
 * Count buildings of a type
 * @param {Object} grid
 * @param {string} buildingType
 * @returns {number}
 */
function countBuildings(grid, buildingType) {
  return Object.values(grid).filter(b => b.type === buildingType).length;
}

function countSafety(grid) {
  return countBuildings(grid, 'POLICE') + countBuildings(grid, 'FIRE');
}

/** Pick a random adjacent road tile, or null if none. */
function randomAdjacentRoad(grid, x, y) {
  const adj = getAdjacentTiles(x, y).filter(pos => {
    const k = getGridKey(pos.x, pos.y);
    return grid[k] && grid[k].type === 'ROAD';
  });
  return adj.length ? adj[Math.floor(Math.random() * adj.length)] : null;
}

/**
 * Process tick simulation
 * Working hours: Office/Cafe/Restaurant earn only during day (tickInDay 0–5).
 * Rent: 1 coin per house per day (deducted over 12 ticks).
 * Tax: income scaled by (1 - taxRate).
 * Safety: Police/Fire reduce random unhappiness events.
 */
export function processTick(state) {
  let coinChange = 0;
  let happinessChange = 0;
  const tickCount = (state.tickCount || 0) + 1;
  const tickInDay = (tickCount - 1) % 12;
  const isDay = tickInDay < 6;
  const taxRate = Math.max(0, Math.min(0.1, state.taxRate || 0));
  const houseCount = countBuildings(state.grid, 'HOUSE');
  const rentPerTick = Math.ceil(houseCount / 12);
  const safety = countSafety(state.grid);

  // Income from buildings (day only for workplaces)
  Object.keys(state.grid).forEach(key => {
    const { x, y } = parseGridKey(key);
    const building = state.grid[key];

    if (building.type === 'CAFE' && isDay) {
      if (isAdjacentToRoad(state.grid, x, y)) coinChange += 1;
    }

    if (building.type === 'OFFICE' && isDay) {
      const adjacentToRoad = isAdjacentToRoad(state.grid, x, y);
      const hasHouse = hasHouseNearby(state.grid, x, y, 2);
      if (adjacentToRoad && hasHouse) coinChange += 2;
      if (state.worldCondition === 'WIND' && !adjacentToRoad) coinChange -= 1;
    }

    if (building.type === 'RESTAURANT' && isDay) {
      if (isAdjacentToRoad(state.grid, x, y)) {
        coinChange += 1;
        happinessChange += 1;
      }
    }

    if (building.type === 'HOUSE') {
      if (isAdjacentToRoad(state.grid, x, y)) happinessChange += 1;
    }
  });

  // Rent: deduct per day (spread over 12 ticks)
  coinChange -= rentPerTick;

  // Tax: reduce income (apply to positive change only; rent is already subtracted)
  const incomeOnly = Math.max(0, coinChange + rentPerTick);
  const afterTax = Math.floor(incomeOnly * (1 - taxRate));
  coinChange = afterTax - rentPerTick;

  // HEAT: happiness -1 per tick unless at least 1 Cafe exists
  if (state.worldCondition === 'HEAT') {
    if (countBuildings(state.grid, 'CAFE') === 0) happinessChange -= 1;
  }

  // Safety: random unhappiness event if no Police/Fire
  if (safety === 0 && Math.random() < 0.1) {
    happinessChange -= 1;
  }

  let newState = {
    ...state,
    coins: Math.max(0, state.coins + coinChange),
    happiness: Math.max(0, state.happiness + happinessChange),
    lastTickAt: Date.now(),
    tickCount,
    droppedCoins: state.droppedCoins || [],
  };

  // Dropped coins: day only, 15% chance per earning workplace on adjacent road
  let dropped = [...(newState.droppedCoins || [])];
  if (isDay && dropped.length < 20) {
    Object.keys(state.grid).forEach(key => {
      const { x, y } = parseGridKey(key);
      const b = state.grid[key];
      if (!b || !['CAFE', 'OFFICE', 'RESTAURANT'].includes(b.type)) return;
      if (!isAdjacentToRoad(state.grid, x, y)) return;
      if (Math.random() >= 0.15) return;
      const road = randomAdjacentRoad(state.grid, x, y);
      if (!road) return;
      const id = `drop-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dropped.push({ id, x: road.x, y: road.y, amount: 1 });
    });
    newState.droppedCoins = dropped;
  }

  // City log: low happiness warning
  if (newState.happiness > 0 && newState.happiness < 4 && state.happiness >= 4) {
    newState = addCityLog(newState, 'Happiness is getting low!');
  }

  newState.characters = syncCharactersWithPopulation(
    state.characters || [],
    newState.population,
    newState.grid,
    { includePlayer: state.includePlayer !== false }
  );

  return newState;
}

/**
 * Find a suggested empty tile near the center of the grid
 * @param {Object} grid
 * @returns {Object|null} - {x, y} or null if no empty tiles
 */
export function findSuggestedTile(grid) {
  const centerX = Math.floor(GRID_CONFIG.width / 2);
  const centerY = Math.floor(GRID_CONFIG.height / 2);
  const maxDistance = GRID_CONFIG.width + GRID_CONFIG.height;

  for (let dist = 0; dist <= maxDistance; dist++) {
    for (let dx = -dist; dx <= dist; dx++) {
      const dy = dist - Math.abs(dx);
      const candidates = [
        { x: centerX + dx, y: centerY + dy },
        { x: centerX + dx, y: centerY - dy },
      ];

      for (const pos of candidates) {
        if (!isValidGridPosition(pos.x, pos.y)) continue;
        const key = getGridKey(pos.x, pos.y);
        if (!grid[key]) return pos;
      }
    }
  }

  return null;
}

/**
 * Collect dropped coins when player stands on a tile with coins.
 * @param {Object} state
 * @param {number} px - Player grid X
 * @param {number} py - Player grid Y
 * @returns {{ newState: Object, collected: number }}
 */
export function collectDroppedCoins(state, px, py) {
  const dropped = state.droppedCoins || [];
  const onTile = dropped.filter(d => d.x === px && d.y === py);
  if (onTile.length === 0) return { newState: state, collected: 0 };
  const collected = onTile.reduce((s, d) => s + (d.amount || 1), 0);
  const ids = new Set(onTile.map(d => d.id));
  const remaining = dropped.filter(d => !ids.has(d.id));
  const newState = {
    ...state,
    coins: state.coins + collected,
    droppedCoins: remaining,
  };
  return { newState, collected };
}

/**
 * Check if tick should be processed
 * @param {Object} state
 * @returns {boolean}
 */
export function shouldProcessTick(state) {
  return Date.now() - state.lastTickAt >= TICK_INTERVAL;
}

/**
 * Export city to JSON
 * @param {Object} state
 * @returns {string}
 */
export function exportCity(state) {
  const exportData = {
    version: state.version,
    exportedAt: new Date().toISOString(),
    stats: {
      coins: state.coins,
      population: state.population,
      jobs: state.jobs,
      happiness: state.happiness,
    },
    worldCondition: state.worldCondition,
    buildings: Object.keys(state.grid).map(key => {
      const { x, y } = parseGridKey(key);
      return {
        x,
        y,
        type: state.grid[key].type,
        placedAt: state.grid[key].placedAt,
      };
    }),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download exported city data
 * @param {string} jsonData
 */
export function downloadExport(jsonData) {
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `isotown-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export canvas as image (PNG)
 * @param {HTMLCanvasElement} canvas - Canvas element to export
 * @param {string} filename - Optional filename (default: isotown-screenshot-{timestamp}.png)
 */
export function exportCanvasAsImage(canvas, filename = null) {
  if (!canvas) {
    console.error('Canvas element is required for image export');
    return;
  }

  try {
    // Convert canvas to data URL (PNG format)
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // Create download link
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || `isotown-screenshot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export canvas as image:', error);
    throw new Error('Failed to export image. Make sure the canvas is not tainted (CORS issue).');
  }
}
