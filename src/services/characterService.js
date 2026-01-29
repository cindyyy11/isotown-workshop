/**
 * Character Service
 * 
 * WORKSHOP: This file teaches about game state and character AI
 * 
 * Characters have ROLES and PURPOSES:
 * - PLAYER: You control with WASD keys
 * - RESIDENT: Lives in houses, visits cafes and offices
 * - WORKER: Works at offices, takes coffee breaks
 * - BARISTA: Works at cafes, serves customers
 */

import { GRID_CONFIG } from '../data/buildingData.js';
import { isValidGridPosition, getGridKey } from './isometricRenderer.js';

// Character roles - each has different behavior
export const CHARACTER_ROLES = {
  PLAYER: 'player',      // Controlled by user
  RESIDENT: 'resident',  // Lives in houses
  WORKER: 'worker',      // Works in offices
  BARISTA: 'barista',    // Works in cafes
};

// What NPCs might be doing
export const NPC_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  WORKING: 'working',
  RESTING: 'resting',
};

/**
 * Create the PLAYER character - this is YOU!
 * Spawns at center of the map
 */
export function createPlayerCharacter() {
  return {
    id: 'player',
    isPlayer: true,
    role: CHARACTER_ROLES.PLAYER,
    x: Math.floor(GRID_CONFIG.width / 2),
    y: Math.floor(GRID_CONFIG.height / 2),
    variant: 999, // Special variant for player (different color)
    frame: 0,
    direction: 2, // Facing down
    state: NPC_STATES.IDLE,
    speech: null,
    speechTimer: 0,
  };
}

/**
 * Create an NPC character with a role and purpose
 * @param {number} id - Character ID
 * @param {Object} grid - City grid to find buildings
 * @returns {Object} Character object
 */
export function createNPC(id, grid = {}) {
  // Find buildings to assign homes/workplaces
  const houses = [];
  const cafes = [];
  const offices = [];
  
  Object.entries(grid).forEach(([key, building]) => {
    const [x, y] = key.split(',').map(Number);
    if (building.type === 'HOUSE') houses.push({ x, y });
    if (building.type === 'CAFE') cafes.push({ x, y });
    if (building.type === 'OFFICE') offices.push({ x, y });
  });

  // Assign a role based on what buildings exist
  let role = CHARACTER_ROLES.RESIDENT;
  let home = null;
  let workplace = null;
  
  if (houses.length > 0) {
    home = houses[id % houses.length];
  }
  
  // 50% workers, 30% residents, 20% baristas
  const roleRoll = Math.random();
  if (roleRoll < 0.5 && offices.length > 0) {
    role = CHARACTER_ROLES.WORKER;
    workplace = offices[id % offices.length];
  } else if (roleRoll < 0.8) {
    role = CHARACTER_ROLES.RESIDENT;
  } else if (cafes.length > 0) {
    role = CHARACTER_ROLES.BARISTA;
    workplace = cafes[id % cafes.length];
  }

  // Spawn near home or at edge
  let x, y;
  if (home) {
    x = home.x + (Math.random() < 0.5 ? 1 : -1);
    y = home.y + (Math.random() < 0.5 ? 1 : -1);
    x = Math.max(0, Math.min(GRID_CONFIG.width - 1, x));
    y = Math.max(0, Math.min(GRID_CONFIG.height - 1, y));
  } else {
    // Spawn at random edge
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: x = Math.floor(Math.random() * GRID_CONFIG.width); y = 0; break;
      case 1: x = GRID_CONFIG.width - 1; y = Math.floor(Math.random() * GRID_CONFIG.height); break;
      case 2: x = Math.floor(Math.random() * GRID_CONFIG.width); y = GRID_CONFIG.height - 1; break;
      case 3: x = 0; y = Math.floor(Math.random() * GRID_CONFIG.height); break;
    }
  }

  return {
    id,
    isPlayer: false,
    role,
    x,
    y,
    variant: Math.floor(Math.random() * 100) + id, // Visual variation
    frame: Math.floor(Math.random() * 100),
    direction: Math.floor(Math.random() * 4),
    state: NPC_STATES.IDLE,
    home,
    workplace,
    destination: null,
    moveTimer: 0,
    moveDelay: 800 + Math.random() * 1500,
    speech: null,
    speechTimer: 0,
  };
}

/**
 * Move player character based on keyboard input
 * @param {Object} player - Player character
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @param {Object} grid - City grid to check collisions
 * @returns {Object} Updated player
 */
export function movePlayer(player, direction, grid = {}) {
  if (!player) return player;
  
  const updated = { ...player };
  let newX = player.x;
  let newY = player.y;
  
  switch (direction) {
    case 'up':
      newY = Math.max(0, player.y - 1);
      updated.direction = 0;
      break;
    case 'right':
      newX = Math.min(GRID_CONFIG.width - 1, player.x + 1);
      updated.direction = 1;
      break;
    case 'down':
      newY = Math.min(GRID_CONFIG.height - 1, player.y + 1);
      updated.direction = 2;
      break;
    case 'left':
      newX = Math.max(0, player.x - 1);
      updated.direction = 3;
      break;
  }
  
  // Check if can move (not blocked by building)
  if (isValidGridPosition(newX, newY)) {
    const key = getGridKey(newX, newY);
    const building = grid[key];
    // Can walk on empty tiles and roads
    if (!building || building.type === 'ROAD') {
      updated.x = newX;
      updated.y = newY;
      updated.state = NPC_STATES.WALKING;
    }
  }
  
  updated.frame += 1;
  return updated;
}

/**
 * Update NPC - give them purpose!
 * @param {Object} npc - NPC character
 * @param {number} deltaTime - Time since last update
 * @param {Object} grid - City grid
 * @returns {Object} Updated NPC
 */
function updateNPC(npc, deltaTime, grid = {}) {
  const updated = { ...npc };
  
  // Update speech timer
  if (updated.speechTimer > 0) {
    updated.speechTimer -= deltaTime;
    if (updated.speechTimer <= 0) {
      updated.speech = null;
    }
  }
  
  // Random chance to say something
  if (!updated.speech && Math.random() < 0.001) {
    updated.speech = getRandomSpeech(updated.role);
    updated.speechTimer = 3000;
  }
  
  // Update move timer
  updated.moveTimer += deltaTime;
  
  if (updated.moveTimer >= updated.moveDelay) {
    // Decide where to go based on role
    if (!updated.destination) {
      updated.destination = chooseDestination(updated, grid);
    }
    
    // Move towards destination or wander
    if (updated.destination) {
      const moved = moveTowards(updated, updated.destination, grid);
      updated.x = moved.x;
      updated.y = moved.y;
      updated.direction = moved.direction;
      
      // Reached destination?
      if (updated.x === updated.destination.x && updated.y === updated.destination.y) {
        updated.destination = null;
        updated.state = NPC_STATES.IDLE;
        // Say something when arriving
        if (Math.random() < 0.3) {
          updated.speech = getArrivalSpeech(updated.role);
          updated.speechTimer = 2500;
        }
      }
    } else {
      // Random wander
      const wandered = randomWander(updated, grid);
      updated.x = wandered.x;
      updated.y = wandered.y;
      updated.direction = wandered.direction;
    }
    
    updated.moveTimer = 0;
    updated.moveDelay = 600 + Math.random() * 1200;
  }
  
  updated.frame += 1;
  return updated;
}

/**
 * Choose a destination based on NPC role
 */
function chooseDestination(npc, grid) {
  const buildings = { houses: [], cafes: [], offices: [], restaurants: [], roads: [] };
  
  Object.entries(grid).forEach(([key, building]) => {
    const [x, y] = key.split(',').map(Number);
    if (building.type === 'HOUSE') buildings.houses.push({ x, y });
    if (building.type === 'CAFE') buildings.cafes.push({ x, y });
    if (building.type === 'OFFICE') buildings.offices.push({ x, y });
    if (building.type === 'RESTAURANT') buildings.restaurants.push({ x, y });
    if (building.type === 'ROAD') buildings.roads.push({ x, y });
  });
  
  const eatSpots = [...buildings.cafes, ...buildings.restaurants];
  
  switch (npc.role) {
    case CHARACTER_ROLES.RESIDENT:
      if (Math.random() < 0.6 && eatSpots.length > 0) {
        return eatSpots[Math.floor(Math.random() * eatSpots.length)];
      }
      if (npc.home) return npc.home;
      break;
      
    case CHARACTER_ROLES.WORKER:
      if (Math.random() < 0.7 && buildings.offices.length > 0) {
        return buildings.offices[Math.floor(Math.random() * buildings.offices.length)];
      }
      if (eatSpots.length > 0) return eatSpots[Math.floor(Math.random() * eatSpots.length)];
      break;
      
    case CHARACTER_ROLES.BARISTA:
      if (npc.workplace) return npc.workplace;
      if (buildings.cafes.length > 0) return buildings.cafes[Math.floor(Math.random() * buildings.cafes.length)];
      break;
  }
  
  if (buildings.roads.length > 0 && Math.random() < 0.5) {
    return buildings.roads[Math.floor(Math.random() * buildings.roads.length)];
  }
  return null;
}

/**
 * Move towards a target position
 */
function moveTowards(char, target, grid) {
  let newX = char.x;
  let newY = char.y;
  let direction = char.direction;
  
  const dx = target.x - char.x;
  const dy = target.y - char.y;
  
  // Choose which axis to move on
  if (Math.abs(dx) > Math.abs(dy) || (Math.abs(dx) === Math.abs(dy) && Math.random() < 0.5)) {
    if (dx > 0) { newX++; direction = 1; }
    else if (dx < 0) { newX--; direction = 3; }
  } else {
    if (dy > 0) { newY++; direction = 2; }
    else if (dy < 0) { newY--; direction = 0; }
  }
  
  // Check collision
  if (isValidGridPosition(newX, newY)) {
    const key = getGridKey(newX, newY);
    const building = grid[key];
    if (!building || building.type === 'ROAD') {
      return { x: newX, y: newY, direction };
    }
  }
  
  // Blocked - try alternate direction
  return randomWander(char, grid);
}

/**
 * Random wander movement
 */
function randomWander(char, grid) {
  let newX = char.x;
  let newY = char.y;
  let direction = char.direction;
  
  // Change direction sometimes
  if (Math.random() < 0.4) {
    direction = Math.floor(Math.random() * 4);
  }
  
  switch (direction) {
    case 0: newY = Math.max(0, char.y - 1); break;
    case 1: newX = Math.min(GRID_CONFIG.width - 1, char.x + 1); break;
    case 2: newY = Math.min(GRID_CONFIG.height - 1, char.y + 1); break;
    case 3: newX = Math.max(0, char.x - 1); break;
  }
  
  if (isValidGridPosition(newX, newY)) {
    const key = getGridKey(newX, newY);
    const building = grid[key];
    if (!building || building.type === 'ROAD') {
      return { x: newX, y: newY, direction };
    }
  }
  
  return { x: char.x, y: char.y, direction: Math.floor(Math.random() * 4) };
}

/**
 * Get random speech based on role
 */
function getRandomSpeech(role) {
  const speeches = {
    [CHARACTER_ROLES.RESIDENT]: [
      "Nice day!",
      "Love this town",
      "Hello there!",
      "Beautiful city",
      "*humming*",
    ],
    [CHARACTER_ROLES.WORKER]: [
      "Back to work...",
      "Need coffee",
      "Meeting soon!",
      "Busy busy...",
      "Almost done",
    ],
    [CHARACTER_ROLES.BARISTA]: [
      "Fresh coffee!",
      "Welcome!",
      "Order up!",
      "Best brew!",
      "*whistling*",
    ],
  };
  
  const lines = speeches[role] || speeches[CHARACTER_ROLES.RESIDENT];
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Get speech when arriving at destination
 */
function getArrivalSpeech(role) {
  const speeches = {
    [CHARACTER_ROLES.RESIDENT]: ["Home sweet home!", "Finally here", "Made it!"],
    [CHARACTER_ROLES.WORKER]: ["Time to work", "Let's do this", "Ready!"],
    [CHARACTER_ROLES.BARISTA]: ["My shift!", "Open for business", "Let's brew!"],
  };
  
  const lines = speeches[role] || ["Here!"];
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Update all characters (player stays the same, NPCs auto-move)
 * @param {Array} characters - All characters including player
 * @param {number} deltaTime - Time since last update
 * @param {Object} grid - City grid
 * @returns {Array} Updated characters
 */
export function updateCharacters(characters, deltaTime, grid = {}) {
  return characters.map(char => {
    if (char.isPlayer) {
      // Player doesn't auto-move, just update frame
      return { ...char, frame: char.frame + 1 };
    }
    return updateNPC(char, deltaTime, grid);
  });
}

/**
 * Sync characters with population
 * @param {Array} currentCharacters
 * @param {number} population
 * @param {Object} grid
 * @param {{ includePlayer?: boolean }} [opts] - includePlayer: add WASD-controlled player (Option B)
 */
export function syncCharactersWithPopulation(currentCharacters, population, grid = {}, opts = {}) {
  const includePlayer = opts.includePlayer === true;
  const npcs = currentCharacters.filter(c => !c.isPlayer);
  
  let finalNPCs = npcs;
  if (population > npcs.length) {
    const newNPCs = [];
    for (let i = npcs.length; i < population; i++) {
      newNPCs.push(createNPC(i, grid));
    }
    finalNPCs = [...npcs, ...newNPCs];
  } else if (population < npcs.length) {
    finalNPCs = npcs.slice(0, population);
  }
  
  if (!includePlayer) return finalNPCs;
  
  const player = currentCharacters.find(c => c.isPlayer) || createPlayerCharacter();
  return [player, ...finalNPCs];
}

/**
 * Get player character from array
 */
export function getPlayer(characters) {
  return characters.find(c => c.isPlayer);
}
