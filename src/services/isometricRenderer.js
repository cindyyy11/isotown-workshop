/**
 * Isometric Renderer Service
 * 
 * Handles isometric math, tile rendering, and building drawing
 */

import { GRID_CONFIG, BUILDING_TYPES } from '../data/buildingData.js';

/**
 * Convert grid coordinates to screen isometric coordinates
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @returns {Object} - {x, y} screen coordinates
 */
export function gridToScreen(gridX, gridY) {
  const { tileWidth, tileHeight } = GRID_CONFIG;
  const x = (gridX - gridY) * (tileWidth / 2);
  const y = (gridX + gridY) * (tileHeight / 2);
  return { x, y };
}

/**
 * Convert screen coordinates to grid coordinates
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @returns {Object} - {x, y} grid coordinates
 */
export function screenToGrid(screenX, screenY) {
  const { tileWidth, tileHeight } = GRID_CONFIG;
  const x = Math.floor((screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2);
  const y = Math.floor((screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2);
  return { x, y };
}

/**
 * Check if grid coordinates are valid
 * @param {number} x - Grid X
 * @param {number} y - Grid Y
 * @returns {boolean}
 */
export function isValidGridPosition(x, y) {
  return x >= 0 && x < GRID_CONFIG.width && y >= 0 && y < GRID_CONFIG.height;
}

const SEASON_PALETTES = {
  SPRING: { land: '#4a7c59', g: ['#5a8c69', '#4a7c59', '#3a6c49'], stroke: 'rgba(40, 70, 50, 0.5)', dot: 'rgba(80, 140, 90, 0.4)' },
  SUMMER: { land: '#5a9c69', g: ['#6aac79', '#5a9c69', '#4a8c59'], stroke: 'rgba(50, 90, 60, 0.5)', dot: 'rgba(90, 160, 100, 0.4)' },
  FALL:   { land: '#8b6914', g: ['#9b7924', '#8b6914', '#6b5520'], stroke: 'rgba(80, 60, 30, 0.5)', dot: 'rgba(120, 90, 40, 0.4)' },
  WINTER: { land: '#d4dce4', g: ['#e8eef4', '#d0dce8', '#b8c8d8'], stroke: 'rgba(160, 180, 200, 0.5)', dot: 'rgba(220, 230, 240, 0.5)' },
};

/**
 * Get land and tile colors for a season. Canvas background and tiles use same base.
 */
export function getSeasonColors(season) {
  return SEASON_PALETTES[season] || SEASON_PALETTES.SPRING;
}

/**
 * Draw an isometric tile (diamond shape). Color matches season; land = background.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Screen X
 * @param {number} y - Screen Y
 * @param {string} season - SPRING|SUMMER|FALL|WINTER
 * @param {boolean} highlight
 */
export function drawTile(ctx, x, y, season = 'SPRING', highlight = false) {
  const { tileWidth, tileHeight } = GRID_CONFIG;
  const hw = tileWidth / 2;
  const hh = tileHeight / 2;
  const p = getSeasonColors(season);

  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(hw, 0);
  ctx.lineTo(0, hh);
  ctx.lineTo(-hw, 0);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(-hw, -hh, hw, hh);
  gradient.addColorStop(0, p.g[0]);
  gradient.addColorStop(0.5, p.g[1]);
  gradient.addColorStop(1, p.g[2]);
  ctx.fillStyle = highlight ? 'rgba(100, 200, 150, 0.8)' : gradient;
  ctx.fill();

  ctx.strokeStyle = highlight ? '#90EE90' : p.stroke;
  ctx.lineWidth = highlight ? 2 : 1;
  ctx.stroke();

  if (!highlight) {
    ctx.fillStyle = p.dot;
    for (let i = 0; i < 3; i++) {
      const seed = ((x + y * 31 + i * 7) % 1000) / 1000;
      const seed2 = ((x * 11 + y + i * 13) % 1000) / 1000;
      const dotX = (seed - 0.5) * tileWidth * 0.5;
      const dotY = (seed2 - 0.5) * tileHeight * 0.3;
      ctx.fillRect(dotX - 1, dotY - 1, 2, 2);
    }
  }

  ctx.restore();
}

/**
 * Draw a pixel art icon for each building type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} buildingId - Building ID (HOUSE, CAFE, OFFICE)
 * @param {number} x - Center X
 * @param {number} y - Center Y
 */
function drawBuildingIcon(ctx, buildingId, x, y) {
  ctx.save();
  ctx.translate(x, y);
  
  switch (buildingId) {
    case 'HOUSE':
      // House icon - simple house shape
      ctx.fillStyle = '#8B4513'; // Brown roof
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-8, -2);
      ctx.lineTo(-8, 6);
      ctx.lineTo(8, 6);
      ctx.lineTo(8, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Door
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-2, 0, 4, 6);
      
      // Window
      ctx.fillStyle = '#FFE082';
      ctx.fillRect(-6, -1, 3, 3);
      ctx.fillRect(3, -1, 3, 3);
      break;
      
    case 'CAFE':
      // Coffee cup icon
      ctx.fillStyle = '#8D6E63'; // Brown cup
      ctx.beginPath();
      ctx.moveTo(-6, 2);
      ctx.lineTo(-5, -4);
      ctx.lineTo(5, -4);
      ctx.lineTo(6, 2);
      ctx.lineTo(6, 6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Coffee inside
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.ellipse(0, -3, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Steam
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.quadraticCurveTo(-2, -7, -3, -9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(1, -8, 0, -10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.quadraticCurveTo(4, -7, 3, -9);
      ctx.stroke();
      
      // Handle
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(7, 0, 3, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      break;
      
    case 'OFFICE':
      // Office building icon - multiple windows
      ctx.fillStyle = '#607D8B'; // Gray building
      ctx.fillRect(-7, -6, 14, 12);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -6, 14, 12);
      
      // Windows grid
      ctx.fillStyle = '#FFE082';
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const wx = -5 + col * 4;
          const wy = -4 + row * 4;
          ctx.fillRect(wx, wy, 2, 2);
        }
      }
      
      // Door at bottom
      ctx.fillStyle = '#455A64';
      ctx.fillRect(-2, 3, 4, 3);
      break;

    case 'RESTAURANT':
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-7, -5, 14, 10);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -5, 14, 10);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-4, -3, 8, 4);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(2, -4, 2, 6);
      ctx.fillRect(-1, -2, 4, 2);
      break;

    case 'POLICE':
      ctx.fillStyle = '#3498db';
      ctx.fillRect(-7, -6, 14, 12);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -6, 14, 12);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(0, -2, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3498db';
      ctx.stroke();
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-2, 2, 4, 4);
      break;

    case 'FIRE':
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-7, -6, 14, 12);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -6, 14, 12);
      ctx.fillStyle = '#f5b041';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3, 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(-3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
      
    default:
      break;
  }
  
  ctx.restore();
}

/**
 * Draw a building block on a tile with enhanced 2.5D depth
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Screen X
 * @param {number} y - Screen Y
 * @param {Object} building - Building type object
 */
export function drawBuilding(ctx, x, y, building) {
  // Safety check: building must exist
  if (!building || !building.id) {
    console.warn('drawBuilding: Invalid building object', building);
    return;
  }

  const { tileWidth, tileHeight } = GRID_CONFIG;
  const hw = tileWidth / 2;
  const hh = tileHeight / 2;

  ctx.save();
  ctx.translate(x, y);

  if (building.id === 'ROAD') {
    // Road with subtle depth
    // Shadow
    ctx.beginPath();
    ctx.moveTo(2, -hh + 2);
    ctx.lineTo(hw + 2, 2);
    ctx.lineTo(2, hh + 2);
    ctx.lineTo(-hw + 2, 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Road surface
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(hw, 0);
    ctx.lineTo(0, hh);
    ctx.lineTo(-hw, 0);
    ctx.closePath();
    ctx.fillStyle = building.color;
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Road markings
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(8, 4);
    ctx.stroke();
  } else {
    // Enhanced 3D block building with shadows and depth
    const blockHeight = building.id === 'OFFICE' ? 55 : building.id === 'CAFE' ? 38 : 35;
    const blockWidth = hw * 0.75;

    // Ground shadow
    ctx.beginPath();
    ctx.ellipse(0, hh - 5, blockWidth * 1.2, hh * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Front face (right) with gradient
    ctx.beginPath();
    ctx.moveTo(0, -blockHeight);
    ctx.lineTo(blockWidth, -blockHeight + hh);
    ctx.lineTo(blockWidth, hh);
    ctx.lineTo(0, 0);
    ctx.closePath();
    const gradientFront = ctx.createLinearGradient(0, -blockHeight, blockWidth, hh);
    gradientFront.addColorStop(0, building.color);
    gradientFront.addColorStop(1, shadeColor(building.color, -20));
    ctx.fillStyle = gradientFront;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right face (left) - darker
    ctx.beginPath();
    ctx.moveTo(0, -blockHeight);
    ctx.lineTo(-blockWidth, -blockHeight + hh);
    ctx.lineTo(-blockWidth, hh);
    ctx.lineTo(0, 0);
    ctx.closePath();
    const gradientRight = ctx.createLinearGradient(0, -blockHeight, -blockWidth, hh);
    gradientRight.addColorStop(0, building.secondaryColor);
    gradientRight.addColorStop(1, shadeColor(building.secondaryColor, -30));
    ctx.fillStyle = gradientRight;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top face with gradient
    ctx.beginPath();
    ctx.moveTo(0, -blockHeight);
    ctx.lineTo(blockWidth, -blockHeight + hh);
    ctx.lineTo(0, -blockHeight + hh * 2);
    ctx.lineTo(-blockWidth, -blockHeight + hh);
    ctx.closePath();
    const gradientTop = ctx.createLinearGradient(0, -blockHeight, 0, -blockHeight + hh);
    gradientTop.addColorStop(0, '#ffffff');
    gradientTop.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = gradientTop;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windows (for buildings)
    if (building.id !== 'ROAD') {
      ctx.fillStyle = 'rgba(255, 230, 150, 0.7)';
      const windowSize = 4;
      const windowSpacing = 8;
      
      // Front windows
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < Math.floor(blockHeight / windowSpacing) - 1; j++) {
          const wx = (i - 0.5) * windowSpacing + 5;
          const wy = -blockHeight + 15 + j * windowSpacing;
          ctx.fillRect(wx, wy, windowSize, windowSize);
        }
      }
    }

    // Draw pixel art icon on building
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    drawBuildingIcon(ctx, building.id, 0, -blockHeight + 18);
    
    ctx.shadowColor = 'transparent';
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Helper: Shade a hex color lighter or darker
 * @param {string} color - Hex color
 * @param {number} percent - Positive to lighten, negative to darken
 * @returns {string} - Shaded hex color
 */
function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Draw a character (Stardew Valley–style pixel sprite).
 * Simple blocky design: brown hair, peach skin, green shirt, tan pants. No weather-based clothing.
 * Player (WASD-controlled): wears a blue cap; NPCs have no cap.
 */
export function drawCharacter(ctx, x, y, frame = 0, variant = 0, isPlayer = false, weather = 'CLEAR', season = 'SPRING') {
  ctx.save();
  ctx.translate(x, y - 10);
  ctx.imageSmoothingEnabled = false;

  const isPlayerChar = isPlayer || variant === 999;
  const playerPalette = {
    hair: '#8b4513',
    skin: '#fcc89b',
    shirt: '#7cb342',
    shirtLight: '#9ccc65',
    pants: '#c4915e',
    shoes: '#6b4423',
  };
  const npcPalettes = [
    { hair: '#6d4c41', skin: '#f5d0a9', shirt: '#558b2f', shirtLight: '#7cb342', pants: '#5d4037', shoes: '#3e2723' },
    { hair: '#4e342e', skin: '#e8c9a0', shirt: '#1565c0', shirtLight: '#1976d2', pants: '#455a64', shoes: '#263238' },
    { hair: '#3e2723', skin: '#d4a574', shirt: '#00695c', shirtLight: '#00897b', pants: '#6d4c41', shoes: '#4e342e' },
    { hair: '#5d4037', skin: '#ffdbac', shirt: '#e65100', shirtLight: '#ef6c00', pants: '#8d6e63', shoes: '#5d4037' },
    { hair: '#4e342e', skin: '#c68642', shirt: '#6a1b9a', shirtLight: '#7b1fa2', pants: '#546e7a', shoes: '#37474f' },
  ];
  const palette = isPlayerChar ? playerPalette : npcPalettes[Math.abs(variant) % npcPalettes.length];

  const px = 4;
  const walk = Math.sin(frame * 0.2) > 0 ? 1 : 0;
  const bob = Math.abs(Math.sin(frame * 0.25)) * 1;

  function block(bx, by, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(bx * px, by * px - bob, w * px, h * px);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 5 * px, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isPlayerChar) {
    const r = 10;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 5 * px, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const l1 = walk ? 0 : 1;
  const l2 = walk ? 1 : 0;
  block(-1, l1, 1, 1, palette.pants);
  block(0, l2, 1, 1, palette.pants);
  block(-1, 2, 1, 1, palette.shoes);
  block(0, 2, 1, 1, palette.shoes);

  block(-1, -1, 2, 2, palette.shirt);
  block(-1, -1, 2, 1, palette.shirtLight);
  ctx.fillStyle = palette.shirtLight;
  ctx.fillRect(-2 * px, -2 - bob, px, px);
  ctx.fillRect(1 * px, -2 - bob, px, px);
  ctx.fillStyle = palette.skin;
  ctx.fillRect(-2 * px, 4 - bob, px, px);
  ctx.fillRect(1 * px, 4 - bob, px, px);

  block(-1, -4, 2, 2, palette.skin);
  block(-1, -5, 2, 1, palette.hair);
  block(-1, -4, 1, 1, palette.hair);
  block(0, -4, 1, 1, palette.hair);

  ctx.fillStyle = '#2c1810';
  ctx.fillRect(-1 * px + 1, -3 * px - bob + 2, 2, 2);
  ctx.fillRect(0 * px + 1, -3 * px - bob + 2, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-1 * px + 1, -3 * px - bob + 2, 1, 1);
  ctx.fillRect(0 * px + 2, -3 * px - bob + 2, 1, 1);
  ctx.fillStyle = 'rgba(255,150,150,0.6)';
  ctx.fillRect(-1 * px, -3 * px - bob + 4, 1, 1);
  ctx.fillRect(0 * px + 2, -3 * px - bob + 4, 1, 1);
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(-0.5 * px, -2 * px - bob + 2, px, 1);

  ctx.restore();
}

/**
 * Speech bubble messages based on city state
 */
const SPEECH_BUBBLES = {
  happy: [
    "Nice day!",
    "Love it here!",
    "Great town!",
    "So cozy~",
    "Perfect!",
  ],
  neutral: [
    "Hello!",
    "Hi there~",
    "Nice road!",
    "...",
    "Hmm...",
  ],
  unhappy: [
    "Need cafe!",
    "Where's road?",
    "So boring...",
    "More jobs?",
    "Hmph!",
  ],
  weather: {
    RAIN: ["Rainy day~", "Need umbrella!", "Splish splash!"],
    WIND: ["So windy!", "Hold on!", "Whoosh~"],
    HEAT: ["So hot!", "Need AC!", "Sweating..."],
    CLEAR: ["Nice weather!", "Perfect day!", "Sunny~"],
  }
};

/**
 * Draw a speech bubble above a character
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @param {string} message - Text to display
 */
export function drawSpeechBubble(ctx, screenX, screenY, message) {
  if (!message) return;
  
  ctx.save();
  ctx.translate(screenX, screenY - 35); // Position above character head
  
  // Measure text
  ctx.font = 'bold 9px Rubik, sans-serif';
  const textWidth = ctx.measureText(message).width;
  const padding = 6;
  const bubbleWidth = textWidth + padding * 2;
  const bubbleHeight = 16;
  
  // Bubble background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 4);
  ctx.fill();
  
  // Bubble border
  ctx.strokeStyle = '#7c6b5e';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Bubble tail (triangle pointing down)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#3b322a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, 0, -bubbleHeight / 2);
  
  ctx.restore();
}

/**
 * Draw a dropped coin on a tile (player can collect by walking over)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} screenX
 * @param {number} screenY
 * @param {number} [amount]
 */
export function drawDroppedCoin(ctx, screenX, screenY, amount = 1) {
  ctx.save();
  ctx.translate(screenX, screenY - 8);
  const t = Date.now() / 400;
  const bob = Math.sin(t) * 2;
  ctx.translate(0, bob);
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3b322a';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(amount, 0, 0);
  ctx.restore();
}

const DESIRE_SPEECH = {
  eat: ['I need to eat!', 'Where\'s the cafe?', 'Lunch time~'],
  work: ['Going to work!', 'Busy day...', 'Off to the office'],
  sleep: ['Time to sleep...', 'Heading home', 'Zzz...'],
};

/**
 * Get speech for a character: desire-based (role + time) or mood-based (happiness, weather).
 * @param {Object} cityState
 * @param {Object} char - { id, role, isPlayer }
 * @param {boolean} [isNight]
 * @returns {string|null}
 */
export function getCharacterSpeech(cityState, char, isNight = false) {
  const id = typeof char === 'object' && char != null ? (char.id ?? 0) : char;
  const showBubble = (id + Math.floor(Date.now() / 3000)) % 5 === 0;
  if (!showBubble) return null;
  
  const role = typeof char === 'object' && char?.role ? char.role : null;
  if (role && !char.isPlayer) {
    let desire = 'eat';
    if (role === 'worker') desire = isNight ? 'sleep' : 'work';
    else if (role === 'barista') desire = 'work';
    else desire = isNight ? 'sleep' : 'eat';
    const msgs = DESIRE_SPEECH[desire] || DESIRE_SPEECH.eat;
    const idx = (id + Math.floor(Date.now() / 5000)) % msgs.length;
    return msgs[idx];
  }
  
  const happiness = cityState?.happiness || 10;
  const condition = cityState?.worldCondition || 'CLEAR';
  let messages;
  if (happiness < 5) messages = SPEECH_BUBBLES.unhappy;
  else if (happiness > 15) messages = SPEECH_BUBBLES.happy;
  else messages = [...SPEECH_BUBBLES.neutral, ...SPEECH_BUBBLES.weather[condition]];
  const index = (id + Math.floor(Date.now() / 5000)) % messages.length;
  return messages[index];
}

/**
 * Draw location label on canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} label - Location name
 * @param {number} canvasWidth
 */
export function drawLocationLabel(ctx, label, canvasWidth) {
  if (!label) return;
  
  ctx.save();
  
  // Position at top right
  const x = canvasWidth - 15;
  const y = 25;
  
  // Background
  ctx.font = 'bold 11px Rubik, sans-serif';
  const textWidth = ctx.measureText(`📍 ${label}`).width;
  const padding = 8;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(x - textWidth - padding * 2, y - 12, textWidth + padding * 2, 24, 6);
  ctx.fill();
  
  ctx.strokeStyle = '#7c6b5e';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#3b322a';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`📍 ${label}`, x - padding, y);
  
  ctx.restore();
}

/**
 * Draw weather overlay (rain or snow) on top of canvas.
 * Rain: diagonal streaks when RAIN and not winter. Snow: falling particles when WINTER.
 */
export function drawWeatherOverlay(ctx, condition, season, canvasWidth, canvasHeight) {
  const rain = condition === 'RAIN' && season !== 'WINTER';
  const snow = season === 'WINTER';
  if (!rain && !snow) return;
  ctx.save();

  const t = Date.now() / 60;

  if (rain) {
    // Enhanced rain effect - more visible with multiple layers
    ctx.strokeStyle = 'rgba(100, 150, 220, 0.5)';
    ctx.lineWidth = 2;
    const spacing = 25;
    const len = 45;
    for (let ix = -spacing; ix < canvasWidth + len; ix += spacing) {
      for (let iy = -len; iy < canvasHeight + len; iy += spacing * 0.75) {
        const offset = ((ix + iy) * 2.5 + t * 1.5) % (spacing * 2.5);
        ctx.beginPath();
        ctx.moveTo(ix + offset, iy - len);
        ctx.lineTo(ix + offset + len * 0.5, iy + len);
        ctx.stroke();
      }
    }
    // Additional lighter layer for depth
    ctx.strokeStyle = 'rgba(150, 180, 240, 0.3)';
    ctx.lineWidth = 1.5;
    for (let ix = -spacing * 0.7; ix < canvasWidth + len; ix += spacing * 0.7) {
      for (let iy = -len; iy < canvasHeight + len; iy += spacing * 0.6) {
        const offset = ((ix + iy) * 2 + t * 1.2) % (spacing * 2);
        ctx.beginPath();
        ctx.moveTo(ix + offset, iy - len * 0.8);
        ctx.lineTo(ix + offset + len * 0.35, iy + len * 0.8);
        ctx.stroke();
      }
    }
  }

  if (snow) {
    // Enhanced snow effect - larger, more visible particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const spacing = 20;
    for (let ix = 0; ix < canvasWidth + spacing; ix += spacing) {
      for (let iy = 0; iy < canvasHeight + spacing; iy += spacing) {
        const drop = ((ix * 3 + iy + t * 2.5) % (spacing * 5)) / (spacing * 5);
        const x = ix + (iy % 2) * 10;
        const y = (iy + drop * canvasHeight * 0.2) % (canvasHeight + 30);
        const size = 2 + Math.sin(drop * Math.PI * 2) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Additional smaller snowflakes for depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let ix = 10; ix < canvasWidth + spacing; ix += spacing * 1.3) {
      for (let iy = 10; iy < canvasHeight + spacing; iy += spacing * 1.3) {
        const drop = ((ix * 2.5 + iy * 1.5 + t * 1.8) % (spacing * 4)) / (spacing * 4);
        const x = ix + (iy % 2) * 6;
        const y = (iy + drop * canvasHeight * 0.15) % (canvasHeight + 25);
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/**
 * Draw day/night overlay - darkens canvas at night and adds stars/moon
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} hour24 - Hour of day (0-23)
 * @param {boolean} isNight - Whether it's night time
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawDayNightOverlay(ctx, hour24, isNight, canvasWidth, canvasHeight) {
  if (!isNight) {
    // Day time - no overlay, or very subtle brightness
    // Optional: add subtle brightness gradient for dawn/dusk
    const isDawn = hour24 >= 5 && hour24 < 7;
    const isDusk = hour24 >= 17 && hour24 < 19;
    
    if (isDawn || isDusk) {
      const progress = isDawn 
        ? (hour24 - 5) / 2  // 0 at 5 AM, 1 at 7 AM
        : (hour24 - 17) / 2; // 0 at 5 PM, 1 at 7 PM
      const alpha = Math.sin(progress * Math.PI) * 0.15; // Subtle orange tint
      ctx.fillStyle = isDawn 
        ? `rgba(255, 200, 150, ${alpha})`  // Dawn: warm orange
        : `rgba(255, 180, 100, ${alpha})`; // Dusk: golden
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    return;
  }

  // Night time - darken canvas and add stars
  ctx.save();

  // Calculate darkness based on hour (darkest at midnight, lighter near dawn/dusk)
  let darkness = 1.0;
  if (hour24 >= 18 && hour24 < 22) {
    // Evening: gradually darken (6 PM - 10 PM)
    darkness = 0.3 + ((hour24 - 18) / 4) * 0.7; // 0.3 → 1.0
  } else if (hour24 >= 22 || hour24 < 2) {
    // Midnight: fully dark (10 PM - 2 AM)
    darkness = 1.0;
  } else if (hour24 >= 2 && hour24 < 6) {
    // Dawn: gradually lighten (2 AM - 6 AM)
    darkness = 1.0 - ((hour24 - 2) / 4) * 0.7; // 1.0 → 0.3
  }

  // Dark overlay
  ctx.fillStyle = `rgba(0, 0, 30, ${darkness * 0.75})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Stars (only when fully dark)
  if (darkness > 0.5) {
    const starCount = Math.floor((canvasWidth * canvasHeight) / 8000);
    const t = Date.now() / 2000; // Slow twinkle
    
    for (let i = 0; i < starCount; i++) {
      const seed = i * 7919; // Prime for distribution
      const x = (seed * 17) % canvasWidth;
      const y = (seed * 23) % canvasHeight;
      const size = ((seed * 7) % 3) + 1; // 1-3 pixels
      const twinkle = (Math.sin(t + seed * 0.1) + 1) / 2; // 0-1
      const brightness = 0.4 + twinkle * 0.6; // 0.4-1.0
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * darkness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Moon (only when dark enough)
  if (darkness > 0.6) {
    const moonX = canvasWidth * 0.85;
    const moonY = canvasHeight * 0.15;
    const moonSize = 40;
    
    // Moon glow
    const gradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize * 1.5);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${darkness * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon circle
    ctx.fillStyle = `rgba(240, 240, 200, ${darkness * 0.9})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters (subtle)
    ctx.fillStyle = `rgba(200, 200, 180, ${darkness * 0.4})`;
    ctx.beginPath();
    ctx.arc(moonX - 10, moonY - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 8, moonY + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Calculate canvas center offset to center the grid
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} - {x, y} offset
 */
export function calculateCenterOffset(canvasWidth, canvasHeight) {
  const { width, height, tileWidth, tileHeight } = GRID_CONFIG;
  const gridWidth = width * (tileWidth / 2);
  const gridHeight = height * (tileHeight / 2);
  
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2 - gridHeight / 2 + 50,
  };
}

/**
 * Get grid key from coordinates
 * @param {number} x - Grid X
 * @param {number} y - Grid Y
 * @returns {string}
 */
export function getGridKey(x, y) {
  return `${x},${y}`;
}

/**
 * Parse grid key to coordinates
 * @param {string} key - Grid key
 * @returns {Object} - {x, y}
 */
export function parseGridKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}
