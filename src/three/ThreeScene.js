/**
 * ThreeScene.js
 * Main scene management class
 * Handles scene creation, lighting, and the animation loop
 * Following Three.js official docs: https://threejs.org/docs/#api/en/scenes/Scene
 */

import * as THREE from 'three';
import { createRenderer, resizeRenderer, disposeRenderer } from './ThreeRenderer.js';
import { createIsometricCamera, updateCameraAspect, zoomCamera, panCamera } from './ThreeCamera.js';
import { createTile, createBuilding, createCharacter, createGround, disposeObject } from './ThreeObjects.js';
import { createGridHelper, createAxesHelper } from './ThreeHelpers.js';
import { createOrbitControls, updateControls, disposeControls, resetCameraView } from './OrbitControlsSetup.js';
import { updateCharacterMovement, wander, goToWork, goHome, walkTo } from './CharacterMovement.js';
import { getRandomMBTI, getMBTIInfo } from '../data/mbtiData.js';
import { createRain, createSnow, createClouds, updateRain, updateSnow, updateClouds, disposeWeather } from './WeatherEffects.js';

/**
 * Main ThreeScene manager class
 * Encapsulates all Three.js scene logic in a clean, reusable way
 */
export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null; // OrbitControls for smooth rotation
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock(); // For deltaTime
    
    // Scene objects
    this.tiles = new THREE.Group();
    this.tiles.name = 'tiles';
    this.buildings = new THREE.Group();
    this.buildings.name = 'buildings';
    this.characters = new THREE.Group();
    this.characters.name = 'characters';
    
    // Debug helpers
    this.helpers = new THREE.Group();
    this.helpers.name = 'helpers';
    this.showHelpers = false;
    
    // Animation loop
    this.animationFrameId = null;
    this.isDisposed = false;
    
    // Current state
    this.currentSeason = 'SPRING';
    this.hoveredTile = null;
    this.currentGrid = {}; // For pathfinding (set in updateBuildings)
    
    this._init();
  }
  
  /**
   * Initialize scene, camera, renderer, and lights
   * @private
   */
  _init() {
    try {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
      this.scene.fog = new THREE.Fog(0x87ceeb, 10, 50); // Distance fog
      
      // Create camera
      const { width, height } = this._getSize();
      if (width === 0 || height === 0) {
        throw new Error(`Invalid canvas dimensions: ${width}x${height}`);
      }
      this.camera = createIsometricCamera(width, height);
      
      // Create renderer (this is where WebGL errors typically occur)
      this.renderer = createRenderer(this.canvas);
      this.renderer.setSize(width, height);
      
      // Create OrbitControls for smooth rotation
      this.controls = createOrbitControls(this.camera, this.canvas);
      console.log('ThreeScene: OrbitControls created - use right-click to rotate');
      
      // Add groups to scene
      this.scene.add(this.tiles);
      this.scene.add(this.buildings);
      this.scene.add(this.characters);
      this.scene.add(this.helpers);
      
      // Create ground plane
      this.ground = createGround(20, this.currentSeason);
      this.scene.add(this.ground);
      
      // Setup lighting
      this._setupLights();
      
      // Setup debug helpers (hidden by default)
      this._setupHelpers();
      
      // Start render loop
      this._animate();
      
      console.log('ThreeScene: Initialized successfully');
    } catch (error) {
      console.error('ThreeScene: Initialization failed:', error);
      // Mark as disposed to prevent animation loop
      this.isDisposed = true;
      throw error; // Re-throw to be caught by React component
    }
  }
  
  /**
   * Setup scene lighting
   * @private
   */
  _setupLights() {
    // Ambient light (soft global illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun) with shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    
    // Configure shadow camera for better quality
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    
    this.scene.add(dirLight);
    this.dirLight = dirLight;
    
    // Hemisphere light (sky and ground colors)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c59, 0.3);
    this.scene.add(hemiLight);
  }
  
  /**
   * Setup debug helpers
   * @private
   */
  _setupHelpers() {
    const gridHelper = createGridHelper(12, 12);
    const axesHelper = createAxesHelper(5);
    
    this.helpers.add(gridHelper);
    this.helpers.add(axesHelper);
    this.helpers.visible = this.showHelpers;
  }
  
  /**
   * Animation loop
   * @private
   */
  _animate = () => {
    if (this.isDisposed) return;
    
    this.animationFrameId = requestAnimationFrame(this._animate);
    
    // Get delta time for smooth animations
    const deltaTime = this.clock.getDelta() * 1000; // Convert to ms
    
    // Update OrbitControls (smooth damping)
    updateControls(this.controls);
    
    // Update character movements
    this._updateCharacters(deltaTime);
    
    // Update weather effects
    this._updateWeather(deltaTime, this.clock.elapsedTime * 1000);
    
    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
  
  /**
   * Update weather effects
   * @private
   */
  _updateWeather(deltaTime, elapsedTime) {
    if (!this.weather) return;
    
    if (this.currentWeather === 'rain') {
      updateRain(this.weather, deltaTime);
    } else if (this.currentWeather === 'snow') {
      updateSnow(this.weather, deltaTime, elapsedTime);
    } else if (this.currentWeather === 'cloudy') {
      updateClouds(this.weather, elapsedTime);
    }
  }
  
  /**
   * Update all character movements
   * @private
   */
  _updateCharacters(deltaTime) {
    this.characters.children.forEach(charMesh => {
      if (charMesh.userData && charMesh.userData.character) {
        const char = charMesh.userData.character;
        
        // Update movement
        updateCharacterMovement(char, deltaTime);
        
        // Update mesh position
        charMesh.position.x = char.x - 6; // Offset for centered grid
        charMesh.position.z = char.y - 6;
        
        // Make NPCs (not player) wander if idle; player is moved by click
        if (!char.isPlayer && !char.isMoving && Math.random() < 0.008) {
          const hour = new Date().getHours();
          if (hour >= 9 && hour < 17) {
            goToWork(char, this.currentGrid);
          } else if (hour >= 20 || hour < 7) {
            goHome(char, this.currentGrid);
          } else {
            wander(char, this.currentGrid, 12, 12);
          }
        }
      }
    });
  }
  
  /**
   * Update grid (create tiles)
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   */
  updateGrid(width = 12, height = 12) {
    // Clear existing tiles
    this.clearGroup(this.tiles);
    
    // Create tiles centered around origin
    const offsetX = -width / 2;
    const offsetY = -height / 2;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = createTile(x + offsetX, y + offsetY, this.currentSeason);
        this.tiles.add(tile);
      }
    }
  }
  
  /**
   * Update buildings from grid data
   * @param {Object} grid - Grid data object {x,y: {type: 'HOUSE'}}
   */
  updateBuildings(grid) {
    // Clear existing buildings
    this.clearGroup(this.buildings);
    
    this.currentGrid = grid || {};
    
    if (!grid) return;
    
    const offsetX = -6; // Center on 12x12 grid
    const offsetY = -6;
    
    // Create buildings from grid data
    Object.entries(grid).forEach(([key, data]) => {
      const [x, y] = key.split(',').map(Number);
      const building = createBuilding(data.type, x + offsetX, y + offsetY);
      this.buildings.add(building);
    });
  }
  
  /**
   * Update characters
   * @param {Array} charactersData - Array of character data
   */
  updateCharacters(charactersData = []) {
    // Clear existing characters
    this.clearGroup(this.characters);
    
    const offsetX = -6;
    const offsetY = -6;
    
    charactersData.forEach(char => {
      // Add MBTI if not present
      if (!char.mbtiType) {
        char.mbtiType = getRandomMBTI();
        char.mbtiInfo = getMBTIInfo(char.mbtiType);
      }
      
      const character = createCharacter(char.isPlayer, char.x + offsetX, char.y + offsetY, char.mbtiType);
      
      // Store character data in mesh userData for movement
      character.userData.character = char;
      
      this.characters.add(character);
    });
  }
  
  /**
   * Update season (changes colors)
   * @param {string} season - SPRING, SUMMER, FALL, WINTER
   */
  updateSeason(season) {
    this.currentSeason = season;
    
    // Update ground color
    const colors = {
      SPRING: 0x4a7c59,
      SUMMER: 0x5a9c69,
      FALL: 0x8b6914,
      WINTER: 0xd4dce4,
    };
    
    if (this.ground && this.ground.material) {
      this.ground.material.color.setHex(colors[season] || colors.SPRING);
    }
  }
  
  /**
   * Clear all objects from a group
   * @param {THREE.Group} group
   */
  clearGroup(group) {
    if (!group) return;
    
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      disposeObject(child);
    }
  }
  
  /**
   * Handle window resize
   */
  resize() {
    const { width, height } = this._getSize();
    resizeRenderer(this.renderer, this.camera, width, height);
    updateCameraAspect(this.camera, width, height);
  }
  
  /**
   * Zoom camera
   * @param {number} delta - Zoom delta
   */
  zoom(delta) {
    const { width, height } = this._getSize();
    zoomCamera(this.camera, delta, width, height);
  }
  
  /**
   * Pan camera
   * @param {number} deltaX
   * @param {number} deltaY
   */
  pan(deltaX, deltaY) {
    panCamera(this.camera, deltaX, deltaY);
  }
  
  /**
   * Get canvas size
   * @private
   * @returns {{width: number, height: number}}
   */
  _getSize() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    };
  }
  
  /**
   * Get tile at mouse position (raycasting)
   * @param {number} clientX - Mouse X
   * @param {number} clientY - Mouse Y
   * @returns {{x: number, y: number} | null}
   */
  /**
   * Move the player character to a grid tile (click-to-move)
   * @param {number} gridX - Grid X (0-11)
   * @param {number} gridY - Grid Y (0-11)
   */
  movePlayerTo(gridX, gridY) {
    const playerMesh = this.characters.children.find(
      m => m.userData && m.userData.character && m.userData.character.isPlayer
    );
    if (!playerMesh || !playerMesh.userData.character) return;
    
    const char = playerMesh.userData.character;
    walkTo(char, gridX, gridY, this.currentGrid);
  }
  
  getTileAtMouse(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Convert mouse position to normalized device coordinates (-1 to +1)
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check intersections with tiles
    const intersects = this.raycaster.intersectObjects(this.tiles.children);
    
    if (intersects.length > 0) {
      const tile = intersects[0].object;
      const gridX = tile.userData.gridX + 6; // Offset back to 0-11 range
      const gridY = tile.userData.gridY + 6;
      return { x: gridX, y: gridY };
    }
    
    return null;
  }
  
  /**
   * Get character at mouse position (raycasting)
   * @param {number} clientX - Mouse X
   * @param {number} clientY - Mouse Y
   * @returns {Object | null} Character data
   */
  getCharacterAtMouse(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Convert mouse position to normalized device coordinates
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check intersections with characters (recursive to get child meshes)
    const intersects = this.raycaster.intersectObjects(this.characters.children, true);
    
    if (intersects.length > 0) {
      // Find the parent group
      let parent = intersects[0].object;
      while (parent.parent && !parent.userData.character) {
        parent = parent.parent;
      }
      
      if (parent.userData.character) {
        return parent.userData.character;
      }
    }
    
    return null;
  }
  
  /**
   * Toggle debug helpers visibility
   * @param {boolean} visible
   */
  setHelpersVisible(visible) {
    this.showHelpers = visible;
    if (this.helpers) {
      this.helpers.visible = visible;
    }
  }
  
  /**
   * Dispose scene and free all resources
   */
  dispose() {
    this.isDisposed = true;
    
    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear all groups
    this.clearGroup(this.tiles);
    this.clearGroup(this.buildings);
    this.clearGroup(this.characters);
    this.clearGroup(this.helpers);
    
    // Dispose ground
    if (this.ground) {
      disposeObject(this.ground);
    }
    
    // Dispose controls
    disposeControls(this.controls);
    
    // Dispose renderer
    disposeRenderer(this.renderer);
    
    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }
}
