import React, { useRef, useEffect, useLayoutEffect, useCallback, forwardRef, useState } from 'react';
import { ThreeScene } from '../three/ThreeScene.js';
import { isWebGLAvailable, getWebGLErrorMessage } from '../three/WebGLSupport.js';

/**
 * ThreeCanvas Component
 * React wrapper for Three.js scene
 * Handles lifecycle, events, and provides clean API
 */
const ThreeCanvas = forwardRef(function ThreeCanvas({
  grid,
  selectedTool,
  onTileClick,
  characters = [],
  season = 'SPRING',
  showHelpers = false,
  onCharacterClick = null,
  weather = 'clear',
}, ref) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mountedRef = useRef(false);
  const [initError, setInitError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Three.js scene
  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;
    
    // Check WebGL support first
    if (!isWebGLAvailable()) {
      console.error('ThreeCanvas: WebGL not available');
      setInitError('WebGL not supported');
      setIsLoading(false);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('ThreeCanvas: Canvas ref not available');
      setIsLoading(false);
      return;
    }
    
    // Wait for canvas to be properly sized
    const initScene = () => {
      if (!mountedRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      console.log('ThreeCanvas: Canvas rect:', rect);
      
      if (rect.width === 0 || rect.height === 0) {
        console.warn('ThreeCanvas: Canvas not ready, retrying...');
        setTimeout(initScene, 50);
        return;
      }
      
      try {
        console.log('ThreeCanvas: Creating scene with dimensions:', rect.width, 'x', rect.height);
        const scene = new ThreeScene(canvas);
        
        if (!mountedRef.current) {
          // Component unmounted during initialization
          scene.dispose();
          return;
        }
        
        sceneRef.current = scene;
        scene.updateGrid(12, 12);
        setInitError(null);
        setIsLoading(false);
        console.log('ThreeCanvas: Scene initialized successfully');
      } catch (error) {
        console.error('ThreeCanvas: Failed to initialize scene:', error);
        setInitError(error.message || 'Failed to initialize 3D scene');
        setIsLoading(false);
      }
    };
    
    // Start initialization after a brief delay
    const timeoutId = setTimeout(initScene, 100);
    
    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      
      if (sceneRef.current) {
        try {
          console.log('ThreeCanvas: Disposing scene on unmount');
          sceneRef.current.dispose();
        } catch (e) {
          console.error('Error disposing scene:', e);
        }
        sceneRef.current = null;
      }
    };
  }, []); // Empty deps - init once
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current) {
        sceneRef.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle wheel event with non-passive listener to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleWheelEvent = (e) => {
      e.preventDefault();
      if (sceneRef.current) {
        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        sceneRef.current.zoom(delta);
      }
    };
    
    const handleTouchMove = (e) => {
      // Only prevent if we're doing a multi-touch gesture (pinch zoom)
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // Add with { passive: false } to allow preventDefault
    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent, { passive: false });
      canvas.removeEventListener('touchmove', handleTouchMove, { passive: false });
    };
  }, []);
  
  // Update grid when it changes
  useEffect(() => {
    if (sceneRef.current && grid) {
      sceneRef.current.updateBuildings(grid);
    }
  }, [grid]);
  
  // Update characters when they change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateCharacters(characters);
    }
  }, [characters]);
  
  // Update season when it changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateSeason(season);
    }
  }, [season]);
  
  // Toggle debug helpers
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setHelpersVisible(showHelpers);
    }
  }, [showHelpers]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    // Right click or middle click or shift+click to drag
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      e.preventDefault();
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current && sceneRef.current) {
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;
      
      sceneRef.current.pan(deltaX, deltaY);
      
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  
  const handleClick = useCallback((e) => {
    // Don't process click if we were dragging
    if (isDraggingRef.current) return;
    
    if (!sceneRef.current) return;
    
    // Check for character click first
    const character = sceneRef.current.getCharacterAtMouse(e.clientX, e.clientY);
    if (character && onCharacterClick) {
      onCharacterClick(character);
      return;
    }
    
    // Tile click: move player when Move tool or no tool; else build/erase
    const tile = sceneRef.current.getTileAtMouse(e.clientX, e.clientY);
    if (tile) {
      const isMoveMode = !selectedTool || selectedTool === 'MOVE';
      if (isMoveMode) {
        // Move tool or nothing selected → click-to-move player (special character)
        sceneRef.current.movePlayerTo(tile.x, tile.y);
      } else {
        // Building or erase tool selected → place or erase
        if (onTileClick) onTileClick(tile.x, tile.y);
      }
    }
  }, [onTileClick, onCharacterClick, selectedTool]);
  
  // Note: handleWheel is now handled via useEffect with { passive: false }
  
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);
  
  // Reset view button handlers (exposed via ref if needed)
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else {
        ref.current = canvasRef.current;
      }
    }
  }, [ref]);
  
  return (
    <div 
      className="canvas-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        className={`isometric-canvas ${isDraggingRef.current ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isDraggingRef.current ? 'grabbing' : selectedTool ? 'crosshair' : 'grab',
          touchAction: 'none',
        }}
      />
      
      {/* Loading indicator */}
      {isLoading && !initError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '8px',
          fontSize: '16px',
          fontFamily: 'sans-serif',
          zIndex: 1000,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>🎮 Initializing 3D Scene...</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Powered by Three.js</div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {initError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'monospace',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 1000,
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>⚠️ WebGL Initialization Failed</div>
          <div style={{ marginBottom: '10px' }}>{initError}</div>
          {initError.includes('WebGL not supported') ? (
            <div style={{ fontSize: '12px', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {getWebGLErrorMessage()}
            </div>
          ) : (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Try refreshing the page or switching to 2D mode using the button in the top bar
            </div>
          )}
        </div>
      )}
      
      {/* Control hints */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}>
        <div>🖱️ Right-click + drag to pan</div>
        <div>🔍 Scroll to zoom</div>
        <div>🎯 Click tiles to build</div>
      </div>
    </div>
  );
});

export default ThreeCanvas;
