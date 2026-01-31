/**
 * ThreeObjects.js
 * Factory functions for creating 3D objects (tiles, buildings, characters)
 * Following Three.js official docs: https://threejs.org/docs/#api/en/geometries/BoxGeometry
 */

import * as THREE from 'three';

// Season color palettes (from original isometricRenderer)
const SEASON_COLORS = {
  SPRING: { ground: 0x4a7c59, grass: 0x5a8c69 },
  SUMMER: { ground: 0x5a9c69, grass: 0x6aac79 },
  FALL: { ground: 0x8b6914, grass: 0x9b7924 },
  WINTER: { ground: 0xd4dce4, grass: 0xe8eef4 },
};

/**
 * Create a single tile (ground plane)
 * @param {number} x - Grid X position
 * @param {number} y - Grid Y position
 * @param {string} season - Current season
 * @returns {THREE.Mesh}
 */
export function createTile(x, y, season = 'SPRING') {
  const colors = SEASON_COLORS[season] || SEASON_COLORS.SPRING;
  
  // Create a flat plane for the tile
  const geometry = new THREE.PlaneGeometry(0.9, 0.9);
  const material = new THREE.MeshStandardMaterial({
    color: colors.ground,
    roughness: 0.8,
    metalness: 0.1,
  });
  
  const tile = new THREE.Mesh(geometry, material);
  
  // Rotate to lay flat and position in grid
  tile.rotation.x = -Math.PI / 2;
  tile.position.set(x, 0, y);
  
  // Enable shadows
  tile.receiveShadow = true;
  
  // Store grid coordinates for raycasting
  tile.userData = { gridX: x, gridY: y, type: 'tile' };
  
  return tile;
}

/**
 * Create a building mesh based on type
 * @param {string} buildingType - Type of building (HOUSE, CAFE, OFFICE, etc.)
 * @param {number} x - Grid X position
 * @param {number} y - Grid Y position
 * @returns {THREE.Group}
 */
export function createBuilding(buildingType, x, y) {
  const group = new THREE.Group();
  group.position.set(x, 0, y);
  group.userData = { gridX: x, gridY: y, type: 'building', buildingType };
  
  // Building configurations
  const configs = {
    ROAD: { color: 0x666666, height: 0.05, size: 0.9 },
    HOUSE: { color: 0x5c9eed, height: 0.8, size: 0.7 },
    CAFE: { color: 0xf4a460, height: 0.6, size: 0.7 },
    OFFICE: { color: 0x607D8B, height: 1.2, size: 0.7 },
    RESTAURANT: { color: 0xe67e22, height: 0.7, size: 0.7 },
    POLICE: { color: 0x3498db, height: 0.9, size: 0.7 },
    FIRE: { color: 0xe74c3c, height: 0.9, size: 0.7 },
  };
  
  const config = configs[buildingType] || configs.HOUSE;
  
  // Create building block
  const geometry = new THREE.BoxGeometry(config.size, config.height, config.size);
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: 0.7,
    metalness: 0.2,
  });
  
  const building = new THREE.Mesh(geometry, material);
  building.position.y = config.height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  
  group.add(building);
  
  // Add roof for non-road buildings
  if (buildingType !== 'ROAD') {
    const roofGeometry = new THREE.ConeGeometry(config.size * 0.6, 0.3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = config.height + 0.15;
    roof.rotation.y = Math.PI / 4; // Rotate 45° for diamond shape
    roof.castShadow = true;
    group.add(roof);
  }
  
  return group;
}

/**
 * Create an advanced character mesh with MBTI personality
 * @param {boolean} isPlayer - Whether this is the player character
 * @param {number} x - Grid X position
 * @param {number} y - Grid Y position
 * @param {string} mbtiType - MBTI personality type (e.g., 'INTJ')
 * @returns {THREE.Group}
 */
export function createCharacter(isPlayer, x, y, mbtiType = null) {
  const group = new THREE.Group();
  group.position.set(x, 0, y);
  group.userData = { type: 'character', isPlayer, mbtiType };
  
  // Get MBTI color if available
  let bodyColor = isPlayer ? 0x7cb342 : 0x558b2f;
  if (mbtiType && !isPlayer) {
    // Import MBTI data dynamically
    try {
      const mbtiData = {
        INTJ: 0x6a5acd, INTP: 0x4169e1, ENTJ: 0x8b008b, ENTP: 0x9370db,
        INFJ: 0x228b22, INFP: 0x32cd32, ENFJ: 0x00fa9a, ENFP: 0x7fff00,
        ISTJ: 0x4682b4, ISFJ: 0x87ceeb, ESTJ: 0x1e90ff, ESFJ: 0x00bfff,
        ISTP: 0xff8c00, ISFP: 0xffa500, ESTP: 0xff4500, ESFP: 0xff6347,
      };
      bodyColor = mbtiData[mbtiType] || 0x558b2f;
    } catch (e) {
      console.warn('MBTI color not found:', mbtiType);
    }
  }
  
  // Body (capsule shape for better appearance)
  const bodyGeometry = new THREE.CapsuleGeometry(0.1, 0.3, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.7,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.25;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  
  // Head (sphere with better shading)
  const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xfcc89b,
    roughness: 0.8,
    metalness: 0.0,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.5;
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);
  
  // Eyes (simple dots)
  const eyeGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.04, 0.52, 0.1);
  group.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.04, 0.52, 0.1);
  group.add(rightEye);
  
  // Player indicator (animated gold ring with glow)
  if (isPlayer) {
    const ringGeometry = new THREE.TorusGeometry(0.28, 0.03, 8, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.3,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    ring.userData.animate = true; // Mark for animation
    group.add(ring);
    
    // Add point light for glow effect
    const pointLight = new THREE.PointLight(0xffd700, 0.5, 2);
    pointLight.position.y = 0.5;
    group.add(pointLight);
  }
  
  // MBTI indicator (small colored sphere above head)
  if (mbtiType && !isPlayer) {
    const indicatorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const indicatorMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      emissive: bodyColor,
      emissiveIntensity: 0.5,
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = 0.7;
    group.add(indicator);
  }
  
  return group;
}

/**
 * Create ground plane (base surface)
 * @param {number} size - Size of ground plane
 * @param {string} season - Current season
 * @returns {THREE.Mesh}
 */
export function createGround(size, season = 'SPRING') {
  const colors = SEASON_COLORS[season] || SEASON_COLORS.SPRING;
  
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color: colors.ground,
    roughness: 0.9,
  });
  
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01; // Slightly below tiles
  ground.receiveShadow = true;
  
  return ground;
}

/**
 * Dispose of geometry and material to free GPU memory
 * @param {THREE.Object3D} object - Object to dispose
 */
export function disposeObject(object) {
  if (!object) return;
  
  if (object.geometry) {
    object.geometry.dispose();
  }
  
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.dispose());
    } else {
      object.material.dispose();
    }
  }
  
  // Recursively dispose children
  if (object.children) {
    object.children.forEach(child => disposeObject(child));
  }
}
