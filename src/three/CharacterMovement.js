/**
 * CharacterMovement.js
 * Advanced character movement with pathfinding
 */

/**
 * Simple A* pathfinding for character movement
 * @param {Object} start - {x, y}
 * @param {Object} end - {x, y}
 * @param {Object} grid - Grid with obstacles
 * @returns {Array} Path as array of {x, y} positions
 */
export function findPath(start, end, grid) {
  // Simple pathfinding - just move toward target
  const path = [];
  let current = { ...start };
  
  while (current.x !== end.x || current.y !== end.y) {
    // Move X first
    if (current.x < end.x) current.x++;
    else if (current.x > end.x) current.x--;
    // Then Y
    else if (current.y < end.y) current.y++;
    else if (current.y > end.y) current.y--;
    
    path.push({ ...current });
    
    // Safety limit
    if (path.length > 100) break;
  }
  
  return path;
}

/**
 * Update character position along path
 * @param {Object} character - Character object
 * @param {number} deltaTime - Time since last update (ms)
 * @returns {Object} Updated character
 */
export function updateCharacterMovement(character, deltaTime) {
  if (!character.path || character.path.length === 0) {
    character.isMoving = false;
    return character;
  }
  
  character.isMoving = true;
  const speed = (character.mbtiInfo?.workSpeed || 1.0) * 0.004; // Visible walking speed
  
  // Get target position
  const target = character.path[0];
  const dx = target.x - character.x;
  const dy = target.y - character.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 0.1) {
    // Reached waypoint
    character.x = target.x;
    character.y = target.y;
    character.path.shift(); // Remove first waypoint
  } else {
    // Move toward waypoint
    const moveDistance = speed * deltaTime;
    const ratio = Math.min(moveDistance / distance, 1);
    character.x += dx * ratio;
    character.y += dy * ratio;
  }
  
  // Update animation frame
  character.frame = (character.frame || 0) + deltaTime * 0.01;
  
  return character;
}

/**
 * Make character walk to a destination
 * @param {Object} character - Character object
 * @param {number} destX - Destination X
 * @param {number} destY - Destination Y
 * @param {Object} grid - Grid data
 * @returns {Object} Character with path
 */
export function walkTo(character, destX, destY, grid) {
  const start = { x: Math.round(character.x), y: Math.round(character.y) };
  const end = { x: destX, y: destY };
  
  character.path = findPath(start, end, grid);
  character.isMoving = true;
  
  return character;
}

/**
 * Make character wander randomly
 * @param {Object} character - Character object
 * @param {Object} grid - Grid data
 * @param {number} gridWidth - Grid width
 * @param {number} gridHeight - Grid height
 * @returns {Object} Character with new path
 */
export function wander(character, grid, gridWidth = 12, gridHeight = 12) {
  // Random destination within grid
  const destX = Math.floor(Math.random() * gridWidth);
  const destY = Math.floor(Math.random() * gridHeight);
  
  return walkTo(character, destX, destY, grid);
}

/**
 * Make character go to work (preferred building type)
 * @param {Object} character - Character with MBTI
 * @param {Object} grid - Grid data
 * @returns {Object} Character with path to work
 */
export function goToWork(character, grid) {
  if (!character.mbtiInfo) return character;
  
  const preferredType = character.mbtiInfo.preferredBuilding;
  
  // Find nearest preferred building
  let nearest = null;
  let minDist = Infinity;
  
  Object.entries(grid).forEach(([key, building]) => {
    if (building.type === preferredType) {
      const [x, y] = key.split(',').map(Number);
      const dx = x - character.x;
      const dy = y - character.y;
      const dist = dx * dx + dy * dy;
      
      if (dist < minDist) {
        minDist = dist;
        nearest = { x, y };
      }
    }
  });
  
  if (nearest) {
    return walkTo(character, nearest.x, nearest.y, grid);
  }
  
  // No preferred building found, wander
  return wander(character, grid);
}

/**
 * Make character go home (to a house)
 * @param {Object} character - Character
 * @param {Object} grid - Grid data
 * @returns {Object} Character with path home
 */
export function goHome(character, grid) {
  // Find nearest house
  let nearest = null;
  let minDist = Infinity;
  
  Object.entries(grid).forEach(([key, building]) => {
    if (building.type === 'HOUSE') {
      const [x, y] = key.split(',').map(Number);
      const dx = x - character.x;
      const dy = y - character.y;
      const dist = dx * dx + dy * dy;
      
      if (dist < minDist) {
        minDist = dist;
        nearest = { x, y };
      }
    }
  });
  
  if (nearest) {
    return walkTo(character, nearest.x, nearest.y, grid);
  }
  
  // No house found – wander instead so citizen still moves
  return wander(character, grid, 12, 12);
}
