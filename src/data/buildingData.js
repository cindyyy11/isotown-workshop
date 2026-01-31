/**
 * IsoTown: Building Types and Configuration
 * 
 * Defines all building types, costs, and effects
 */
import { FaRoad, FaHome, FaCoffee, FaBuilding, FaTrash, FaUtensils, FaShieldAlt, FaFireExtinguisher } from 'react-icons/fa';

export const BUILDING_TYPES = {
  ROAD: {
    id: 'ROAD',
    name: 'Road',
    icon: FaRoad,
    cost: 1,
    color: '#666666',
    secondaryColor: '#888888',
    effects: { population: 0, happiness: 0, jobs: 0 },
    description: 'Connects buildings',
  },
  HOUSE: {
    id: 'HOUSE',
    name: 'House',
    icon: FaHome,
    cost: 3,
    color: '#ff6b9d',
    secondaryColor: '#ff8fb3',
    effects: { population: 2, happiness: 0, jobs: 0 },
    description: '+2 Population. Pays rent each day.',
  },
  CAFE: {
    id: 'CAFE',
    name: 'Cafe',
    icon: FaCoffee,
    cost: 5,
    color: '#ff9d6b',
    secondaryColor: '#ffb389',
    effects: { population: 0, happiness: 2, jobs: 0 },
    description: '+2 Happiness, Earns coins (day only)',
  },
  OFFICE: {
    id: 'OFFICE',
    name: 'Office',
    icon: FaBuilding,
    cost: 8,
    color: '#6b9dff',
    secondaryColor: '#89b3ff',
    effects: { population: 0, happiness: 0, jobs: 3 },
    description: '+3 Jobs, Earns coins (day only)',
  },
  RESTAURANT: {
    id: 'RESTAURANT',
    name: 'Restaurant',
    icon: FaUtensils,
    cost: 7,
    color: '#e67e22',
    secondaryColor: '#f39c12',
    effects: { population: 0, happiness: 1, jobs: 0 },
    description: '+1 Happiness, Earns coins (day only)',
  },
  POLICE: {
    id: 'POLICE',
    name: 'Police',
    icon: FaShieldAlt,
    cost: 10,
    color: '#3498db',
    secondaryColor: '#5dade2',
    effects: { population: 0, happiness: 0, jobs: 0, safety: 1 },
    description: '+1 Safety. Reduces random unhappiness.',
  },
  FIRE: {
    id: 'FIRE',
    name: 'Fire Station',
    icon: FaFireExtinguisher,
    cost: 10,
    color: '#e74c3c',
    secondaryColor: '#ec7063',
    effects: { population: 0, happiness: 0, jobs: 0, safety: 1 },
    description: '+1 Safety. Reduces random unhappiness.',
  },

  // ===== TODO #4 (Challenge - Easy): Add PARK Building =====
  //
  // GOAL: Add a new building type to the game
  //
  // TASK: Uncomment and complete the code below:
  // PARK: {
  //   id: 'PARK',
  //   name: 'Park',
  //   icon: FaTree,  // ⚠️ You need to import this: import { FaTree } from 'react-icons/fa';
  //   cost: 4,
  //   color: '#4a7c59',  // Green color for park
  //   secondaryColor: '#6b9d7a',
  //   effects: { population: 0, happiness: 1, jobs: 0 },
  //   description: '+1 Happiness. Green space for relaxation.',
  // },
  //
  // STEPS TO COMPLETE THIS CHALLENGE:
  // 1. Uncomment the PARK object above
  // 2. Add FaTree to the imports at the top of this file (line 6)
  //    Change: import { FaRoad, ... } from 'react-icons/fa';
  //    To:     import { FaRoad, ..., FaTree } from 'react-icons/fa';
  // 3. Add PARK button to toolbar in src/App.jsx (search for TODO #5)
  // 4. Test: Place 3 parks, check happiness increases by 3
  //
  // WHY: Learn how game data drives UI and logic
  // LEARN: Adding features = Data (this file) + UI (App.jsx) + Logic (cityService.js)
  //
  // BONUS: Try changing the cost, color, or effects!
};

export const TOOLS = {
  ERASE: {
    id: 'ERASE',
    name: 'Erase',
    icon: FaTrash,
    cost: 0,
    description: 'Remove buildings',
  },
};

// Initial game state
export const INITIAL_STATE = {
  version: '1',
  coins: 20,
  population: 0,
  jobs: 0,
  happiness: 10,
  worldCondition: null,
  worldConditionFetchedAt: null,
  grid: {},
  lastTickAt: Date.now(),
  tickCount: 0,
  selectedTool: 'ROAD',
  characters: [],
  lastCharacterUpdate: Date.now(),
  cityLog: [],
  droppedCoins: [],
  includePlayer: true,  // Option B: WASD player, collect coins, interact, trigger Gemini
};

// Grid configuration
export const GRID_CONFIG = {
  width: 12,
  height: 12,
  tileWidth: 64,
  tileHeight: 32,
};

// Tick configuration
export const TICK_INTERVAL = 5000; // 5 seconds
