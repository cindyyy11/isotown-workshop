import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { GRID_CONFIG, BUILDING_TYPES } from '../data/buildingData.js';
import {
  gridToScreen,
  screenToGrid,
  drawTile,
  drawBuilding,
  calculateCenterOffset,
  getGridKey,
  isValidGridPosition,
  drawCharacter,
  drawSpeechBubble,
  getCharacterSpeech,
  drawLocationLabel,
  getSeasonColors,
  drawWeatherOverlay,
  drawDayNightOverlay,
  drawDroppedCoin,
} from '../services/isometricRenderer.js';
import { updateCharacters, movePlayer, getPlayer } from '../services/characterService.js';

/**
 * IsometricCanvas Component
 * Renders the isometric grid with pan/zoom support
 * Features: 
 * - WASD to control YOUR character
 * - Drag to pan the view
 * - Mouse wheel to zoom
 * - Auto-walking NPCs with speech bubbles
 * - Location display from Google Maps
 */
const IsometricCanvas = forwardRef(function IsometricCanvas({ 
  grid, 
  selectedTool, 
  onTileClick, 
  characters = [],
  onCharactersUpdate,
  cityState = null,
  zone = null,
  season = 'SPRING',
  hour24 = 12,
  isNight = false,
  showPlayerCharacter = true,
  onCollectCoins = null,
  onBuildingInteract = null,
  onTriggerGemini = null,
}, ref) {
  const internalCanvasRef = useRef(null);
  const canvasRef = ref || internalCanvasRef;
  const [hoveredTile, setHoveredTile] = useState(null);
  const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localCharacters, setLocalCharacters] = useState(characters);
  const lastUpdateRef = useRef(Date.now());
  const latestCharactersRef = useRef(characters);
  const [weatherFrame, setWeatherFrame] = useState(0);
  const worldCondition = cityState?.worldCondition || 'CLEAR';

  useEffect(() => {
    const id = setInterval(() => setWeatherFrame(f => f + 1), 120);
    return () => clearInterval(id);
  }, []);

  // Combined offset (base center + user pan)
  const offset = {
    x: baseOffset.x + panOffset.x,
    y: baseOffset.y + panOffset.y,
  };

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      setBaseOffset(calculateCenterOffset(canvas.width, canvas.height));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Sync characters from props and keep ref in sync
  useEffect(() => {
    setLocalCharacters(characters);
    latestCharactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    latestCharactersRef.current = localCharacters;
  }, [localCharacters]);

  // Auto-walk NPC animation loop — never call parent callbacks inside setState updater
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      const prev = latestCharactersRef.current;
      if (prev.length === 0) return;
      const updated = updateCharacters(prev, deltaTime, grid);
      latestCharactersRef.current = updated;
      setLocalCharacters(updated);
      if (onCharactersUpdate) onCharactersUpdate(updated);
    }, 50);

    return () => clearInterval(interval);
  }, [grid, onCharactersUpdate]);

  // WASD + E keyboard controls for player character (Option B)
  // Never call parent callbacks inside setState updater to avoid "setState during render" warning
  useEffect(() => {
    if (!showPlayerCharacter) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const keyMap = {
        'w': 'up', 'W': 'up', 'ArrowUp': 'up',
        's': 'down', 'S': 'down', 'ArrowDown': 'down',
        'a': 'left', 'A': 'left', 'ArrowLeft': 'left',
        'd': 'right', 'D': 'right', 'ArrowRight': 'right',
      };
      const direction = keyMap[e.key];

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        const prev = latestCharactersRef.current;
        const player = getPlayer(prev);
        if (!player) return;
        const adj = [
          { x: player.x - 1, y: player.y },
          { x: player.x + 1, y: player.y },
          { x: player.x, y: player.y - 1 },
          { x: player.x, y: player.y + 1 },
        ];
        for (const { x, y } of adj) {
          if (x < 0 || x >= GRID_CONFIG.width || y < 0 || y >= GRID_CONFIG.height) continue;
          const key = getGridKey(x, y);
          const b = grid[key];
          if (b && b.type !== 'ROAD') {
            if (onBuildingInteract) onBuildingInteract(b.type, x, y);
            return;
          }
        }
        return;
      }

      if (direction) {
        e.preventDefault();
        const prev = latestCharactersRef.current;
        const player = getPlayer(prev);
        if (!player) return;
        const updatedPlayer = movePlayer(player, direction, grid);
        const updated = prev.map(c => c.isPlayer ? updatedPlayer : c);
        latestCharactersRef.current = updated;
        setLocalCharacters(updated);
        if (onCharactersUpdate) onCharactersUpdate(updated);
        const nx = updatedPlayer.x;
        const ny = updatedPlayer.y;
        if (onCollectCoins) onCollectCoins(nx, ny);
        const townSquare = (nx === 5 && ny === 5) || (nx === 6 && ny === 6);
        if (townSquare && onTriggerGemini) onTriggerGemini();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, onCharactersUpdate, showPlayerCharacter, onCollectCoins, onBuildingInteract, onTriggerGemini]);

  // Handle mouse down (start drag)
  const handleMouseDown = useCallback((e) => {
    // Right click or middle click to drag
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If dragging, update pan offset
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Otherwise, handle hover
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    const gridPos = screenToGrid(mouseX, mouseY);

    if (isValidGridPosition(gridPos.x, gridPos.y)) {
      setHoveredTile(gridPos);
    } else {
      setHoveredTile(null);
    }
  }, [isDragging, dragStart, offset, zoom]);

  // Handle mouse up (end drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click
  const handleClick = useCallback((e) => {
    // Don't process click if we were dragging
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    const gridPos = screenToGrid(mouseX, mouseY);

    if (isValidGridPosition(gridPos.x, gridPos.y)) {
      onTileClick(gridPos.x, gridPos.y);
    }
  }, [isDragging, offset, zoom, onTileClick]);

  // Handle mouse wheel (zoom)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(2, Math.max(0.5, prev + delta)));
  }, []);

  // Handle context menu (prevent default)
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Reset view button
  const handleResetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const palette = getSeasonColors(season);
    
    // Fill background — same as land/tiles (canvas land = background)
    ctx.fillStyle = palette.land;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid pattern; tint matches season
    ctx.strokeStyle = palette.stroke ?? 'rgba(60, 100, 70, 0.3)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Apply transforms
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Collect all characters with their screen positions for speech bubbles
    const characterDrawData = [];

    // Draw all tiles and buildings (back to front for proper depth)
    for (let y = 0; y < GRID_CONFIG.height; y++) {
      for (let x = 0; x < GRID_CONFIG.width; x++) {
        const screenPos = gridToScreen(x, y);
        const isHovered = hoveredTile && hoveredTile.x === x && hoveredTile.y === y;
        
        // Draw base tile
        drawTile(ctx, screenPos.x, screenPos.y, season, isHovered);

        // Draw building if exists
        const key = getGridKey(x, y);
        if (grid[key]) {
          const buildingType = grid[key].type;
          const building = BUILDING_TYPES[buildingType];
          if (building) {
            drawBuilding(ctx, screenPos.x, screenPos.y, building);
          }
        }

        // Draw dropped coins on this tile (player collects by walking over)
        const drops = (cityState?.droppedCoins || []).filter(d => d.x === x && d.y === y);
        const coinAmount = drops.reduce((s, d) => s + (d.amount || 1), 0);
        if (coinAmount > 0) {
          drawDroppedCoin(ctx, screenPos.x, screenPos.y, coinAmount);
        }

        // Draw all characters on their tiles
        localCharacters.forEach(char => {
          if (char.x === x && char.y === y) {
            // Offset characters slightly so they don't overlap perfectly
            const charId = typeof char.id === 'string' ? 0 : char.id;
            const charOffsetX = char.isPlayer ? 0 : (charId % 3 - 1) * 3;
            const charOffsetY = char.isPlayer ? 0 : (Math.floor(charId / 3) % 3 - 1) * 2;
            const charScreenX = screenPos.x + charOffsetX;
            const charScreenY = screenPos.y + charOffsetY;
            
            drawCharacter(ctx, charScreenX, charScreenY, char.frame, char.variant, char.isPlayer, worldCondition, season);
            
            characterDrawData.push({
              char,
              screenX: charScreenX,
              screenY: charScreenY,
            });
          }
        });
      }
    }

    // Draw speech bubbles on top (desire-based for NPCs: role + isNight)
    characterDrawData.forEach(({ char, screenX, screenY }) => {
      const speech = char.speech || (char.isPlayer ? null : getCharacterSpeech(cityState, char, isNight));
      if (speech) {
        drawSpeechBubble(ctx, screenX, screenY, speech);
      }
    });

    // Draw preview of selected tool on hovered tile
    if (hoveredTile && selectedTool && selectedTool !== 'ERASE') {
      const screenPos = gridToScreen(hoveredTile.x, hoveredTile.y);
      const building = BUILDING_TYPES[selectedTool];
      if (building) {
        ctx.globalAlpha = 0.4;
        drawBuilding(ctx, screenPos.x, screenPos.y, building);
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.restore();

    // Weather overlay (rain / snow) in screen space
    drawWeatherOverlay(ctx, worldCondition, season, canvas.width, canvas.height);
    
    // Day/night overlay (darkens at night, adds stars/moon)
    drawDayNightOverlay(ctx, hour24, isNight, canvas.width, canvas.height);
  }, [grid, hoveredTile, selectedTool, offset, zoom, localCharacters, cityState, zone, season, worldCondition, weatherFrame, hour24, isNight]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className={`isometric-canvas ${isDragging ? 'dragging' : ''} tool-${selectedTool || 'none'} ${!hoveredTile && selectedTool ? 'cursor-default' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHoveredTile(null); setIsDragging(false); }}
        onClick={handleClick}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />
      <div className="canvas-controls">
        <button className="canvas-control-btn" onClick={handleResetView} title="Reset View">
          ⌂
        </button>
        <button className="canvas-control-btn" onClick={() => setZoom(z => Math.min(2, z + 0.2))} title="Zoom In">
          +
        </button>
        <button className="canvas-control-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} title="Zoom Out">
          −
        </button>
      </div>
    </div>
  );
});

export default IsometricCanvas;
