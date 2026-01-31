import React, { useState, useEffect } from 'react';
import { 
  FaMap, FaUsers, FaCog, FaCloud, FaSun, FaMoon, FaExpand, 
  FaCompress, FaVolumeUp, FaVolumeMute, FaInfoCircle, FaTimes,
  FaHome, FaBuilding, FaCoffee, FaTree, FaRoad, FaBolt, FaHandPointer,
  FaBriefcase, FaTrash
} from 'react-icons/fa';
import './GameUI.css';

/**
 * GameUI - Immersive game-like interface for Three.js world
 */
export default function GameUI({ 
  onToggleMinimap,
  onToggleCharacterRoster,
  onToggleSettings,
  onToggleWeather,
  onCameraReset,
  onTimeChange,
  characters = [],
  weather = 'clear',
  timeOfDay = 'day',
  isFullscreen = false,
  onToggleFullscreen,
  season = 'SPRING',
  selectedTool = null,
  onToolSelect,
  onToggle2D3D = null,
  layout = 'overlay', // 'minecraft' = full-width bars outside canvas
  coins = 0,
  population = 0,
  jobs = 0,
  happiness = 0,
  cityGrid = {}, // Add city grid for minimap
}) {
  const [showMinimap, setShowMinimap] = useState(layout === 'minecraft'); // Show by default in Minecraft layout
  const [showRoster, setShowRoster] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(12); // 0-24 hours
  const [fps, setFps] = useState(60);
  const [notifications, setNotifications] = useState([]);
  const [minimapPos, setMinimapPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const now = performance.now();
      frameCount++;
      
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const rafId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Draggable minimap
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setMinimapPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const tools = [
    { id: 'MOVE', icon: FaHandPointer, label: 'Move', color: '#7cb342', cost: null },
    { id: 'ROAD', icon: FaRoad, label: 'Road', color: '#696969', cost: 1 },
    { id: 'HOUSE', icon: FaHome, label: 'House', color: '#8b4513', cost: 3 },
    { id: 'CAFE', icon: FaCoffee, label: 'Cafe', color: '#d2691e', cost: 5 },
    { id: 'OFFICE', icon: FaBuilding, label: 'Office', color: '#4682b4', cost: 8 },
    { id: 'TREE', icon: FaTree, label: 'Tree', color: '#228b22', cost: 2 },
    { id: 'ERASE', icon: FaTrash, label: 'Erase', color: '#dc3545', cost: null },
  ];

  const weatherIcons = {
    clear: <FaSun />,
    cloudy: <FaCloud />,
    rain: <FaCloud />,
    night: <FaMoon />,
  };

  const isMinecraft = layout === 'minecraft';

  return (
    <div className={`game-ui-overlay ${isMinecraft ? 'game-ui-minecraft' : ''}`}>
      {/* MINECRAFT LAYOUT: Full-width top bar and hotbar outside canvas */}
      {isMinecraft ? (
        <>
          {/* TOP BAR - Full width, 56px, like Minecraft */}
          <div className="game-ui-topbar">
            <div className="topbar-left">
              {onToggle2D3D && (
                <button className="topbar-btn-2d" onClick={onToggle2D3D} title="Switch to 2D mode">
                  ← 2D
                </button>
              )}
              <button
                className={`topbar-btn ${showMinimap ? 'active' : ''}`}
                onClick={() => setShowMinimap(!showMinimap)}
                title="Toggle minimap"
              >
                <FaMap /> Map
              </button>
              <span className="topbar-logo">🏙️ IsoTown 3D</span>
            </div>
            <div className="topbar-center">
              <span className="topbar-stat" title="Number of citizens in your city">👥 {characters.length} citizens</span>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn" onClick={onToggleWeather} title="Change weather">
                {weatherIcons[weather] || <FaSun />} {weather}
              </button>
              <button
                className={`topbar-btn ${showRoster ? 'active' : ''}`}
                onClick={() => setShowRoster(!showRoster)}
                title="Citizens"
              >
                <FaUsers /> Roster
              </button>
              <button
                className={`topbar-btn ${showSettings ? 'active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <FaCog /> Settings
              </button>
            </div>
          </div>

          {/* HOTBAR - Full width, 88px, large slots like Minecraft */}
          <div className="game-ui-hotbar">
            <div className="hotbar-slots">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`hotbar-slot ${selectedTool === tool.id ? 'active' : ''}`}
                  onClick={() => onToolSelect?.(tool.id)}
                  title={`${tool.label}${tool.cost ? ` - $${tool.cost}` : ''}`}
                  style={{ '--tool-color': tool.color }}
                >
                  <tool.icon className="hotbar-icon" />
                  <span className="hotbar-label">
                    {tool.label}
                    {tool.cost && <span className="hotbar-cost">${tool.cost}</span>}
                  </span>
                </button>
              ))}
            </div>
            <div className="hotbar-hint">
              {selectedTool === 'MOVE' || !selectedTool
                ? 'Click ground to move your character'
                : selectedTool
                  ? `Click ground to place ${tools.find(t => t.id === selectedTool)?.label}`
                  : ''}
            </div>
          </div>
        </>
      ) : (
        /* OVERLAY LAYOUT (fallback) */
        <>
          {onToggle2D3D && (
            <button className="overlay-2d-btn" onClick={onToggle2D3D} title="Switch to 2D">← 2D</button>
          )}
          <div className="ui-panel top-left"><div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px', color: '#fff' }}><span>🏙️</span><span>FPS:{fps}</span><span>👥{characters.length}</span></div></div>
          <div className="ui-panel top-center"><div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '10px' }}>{weatherIcons[weather]} {weather}</div></div>
          <div className="ui-panel top-right">
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className={`control-btn ${showRoster ? 'active' : ''}`} onClick={() => setShowRoster(!showRoster)} title="Roster"><FaUsers /></button>
              <button className="control-btn" onClick={onToggleWeather} title="Weather"><FaCloud /></button>
              <button className={`control-btn ${showSettings ? 'active' : ''}`} onClick={() => setShowSettings(!showSettings)} title="Settings"><FaCog /></button>
            </div>
          </div>
          <div className="ui-panel bottom-center">
            <div style={{ display: 'flex', gap: '4px' }}>
              {tools.map(tool => (
                <button key={tool.id} className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`} onClick={() => onToolSelect?.(tool.id)} title={tool.label} style={{ '--tool-color': tool.color }}>
                  <tool.icon style={{ fontSize: '14px' }} /><span style={{ fontSize: '7px' }}>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MINIMAP - Below top bar when Minecraft layout, no overlap with 2D button */}
      {showMinimap && (
        <div 
          className={`minimap-panel ${isMinecraft ? 'minimap-minecraft' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{
            left: minimapPos.x !== null ? `${minimapPos.x}px` : undefined,
            top: minimapPos.y !== null ? `${minimapPos.y}px` : undefined,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div 
            className="minimap-header"
            onMouseDown={(e) => {
              setIsDragging(true);
              const rect = e.currentTarget.parentElement.getBoundingClientRect();
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <span>MINIMAP (Drag me)</span>
            <button className="close-btn-small" onClick={() => setShowMinimap(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="minimap-content">
            <div className="minimap-legend" style={{ marginBottom: '4px', fontSize: '9px', color: '#aaa', display: 'flex', justifyContent: 'space-around' }}>
              <span title="Grass">🟩 Grass</span>
              <span title="Road">⬛ Road</span>
              <span title="House">🟦 House</span>
              <span title="Office/Cafe">🟨 Work</span>
            </div>
            <div className="minimap-grid">
              {Array.from({ length: 144 }, (_, i) => {
                const x = i % 12;
                const y = Math.floor(i / 12);
                const key = `${x},${y}`;
                const building = cityGrid[key];
                
                // Check for character
                const hasCharacter = characters.some(c => 
                  Math.round(c.x) === x && Math.round(c.y) === y
                );
                
                // Determine color based on tile content
                let bgColor = '#4a7c59'; // Default: grass
                if (hasCharacter) {
                  bgColor = '#ffd700'; // Character (gold)
                } else if (building) {
                  if (building.type === 'ROAD') bgColor = '#666';
                  else if (building.type === 'HOUSE') bgColor = '#5c9eed';
                  else if (building.type === 'CAFE') bgColor = '#f4a460';
                  else if (building.type === 'OFFICE') bgColor = '#8b7355';
                  else if (building.type === 'TREE') bgColor = '#228b22';
                  else if (building.type === 'RESTAURANT') bgColor = '#ff6b6b';
                  else if (building.type === 'POLICE') bgColor = '#3b82f6';
                  else if (building.type === 'FIRE') bgColor = '#ef4444';
                }
                
                return (
                  <div 
                    key={i} 
                    className={`minimap-cell ${hasCharacter ? 'has-character' : ''}`}
                    style={{ background: bgColor }}
                  />
                );
              })}
            </div>
          </div>
          <div className="minimap-legend">
            <span><span className="legend-dot" style={{ background: '#ffd700' }}></span> Citizens</span>
            <span><span className="legend-dot" style={{ background: '#3498db' }}></span> Buildings</span>
          </div>
        </div>
      )}

      {/* CHARACTER ROSTER */}
      {showRoster && (
        <div className="roster-panel">
          <div className="roster-header">
            <span>👥 CITIZENS ({characters.length})</span>
            <button className="close-btn-small" onClick={() => setShowRoster(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="roster-content">
            {characters.slice(0, 10).map((char, i) => (
              <div key={i} className="roster-item">
                <div 
                  className="roster-avatar"
                  style={{
                    background: char.mbtiInfo?.color 
                      ? `#${char.mbtiInfo.color.toString(16).padStart(6, '0')}` 
                      : '#7cb342'
                  }}
                >
                  {char.isPlayer ? '👤' : '🧑'}
                </div>
                <div className="roster-info">
                  <div className="roster-name">
                    {char.isPlayer ? 'You' : `Citizen ${i + 1}`}
                  </div>
                  <div className="roster-type">
                    {char.mbtiType || 'NPC'}
                  </div>
                </div>
                <div className="roster-status">
                  {char.isMoving ? '🚶' : '🧍'}
                </div>
              </div>
            ))}
            {characters.length > 10 && (
              <div className="roster-more">
                +{characters.length - 10} more citizens
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <span>⚙️ SETTINGS</span>
              <button className="close-btn-small" onClick={() => setShowSettings(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="settings-content">
              <div className="setting-group">
                <label className="setting-label">
                  <FaVolumeUp />
                  Volume
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="setting-slider"
                />
                <span className="setting-value">{volume}%</span>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <FaBolt />
                  Graphics Quality
                </label>
                <select className="setting-select">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div className="setting-group">
                <button className="setting-btn" onClick={onCameraReset}>
                  🎥 Reset Camera
                </button>
              </div>
              
              <div className="setting-group">
                <button className="setting-btn secondary">
                  💾 Save Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <FaInfoCircle />
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
