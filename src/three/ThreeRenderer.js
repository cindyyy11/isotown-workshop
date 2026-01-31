/**
 * ThreeRenderer.js
 * Manages WebGL renderer lifecycle, settings, and cleanup
 * Following Three.js official docs: https://threejs.org/docs/#api/en/renderers/WebGLRenderer
 */

import * as THREE from 'three';

/**
 * Create and configure a WebGL renderer with production-ready settings
 * @param {HTMLCanvasElement} canvas - Target canvas element
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(canvas) {
  if (!canvas) {
    throw new Error('createRenderer: canvas element is required');
  }
  
  // Check if canvas has valid dimensions
  if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
    throw new Error('createRenderer: canvas has zero dimensions');
  }
  
  let renderer;
  
  try {
    // Create renderer with explicit context attributes
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false, // Don't fail on software rendering
      preserveDrawingBuffer: false, // Better performance
      stencil: true,
      depth: true,
      premultipliedAlpha: true,
    });
    
    // Verify renderer was created successfully
    if (!renderer.domElement) {
      throw new Error('Renderer created but domElement is null');
    }
    
  } catch (error) {
    console.error('Failed to create WebGLRenderer:', error);
    
    // Provide more specific error message
    if (error.message && error.message.includes('context')) {
      throw new Error('Failed to create WebGL context. Your browser or device may not support WebGL.');
    }
    
    throw new Error(`WebGL initialization failed: ${error.message}`);
  }

  // Cap pixel ratio to avoid performance issues on high-DPI displays
  const maxPixelRatio = 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  
  // Enable shadows for realistic lighting
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
  
  // Color management (recommended by Three.js)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  return renderer;
}

/**
 * Handle renderer resize
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Camera} camera
 * @param {number} width
 * @param {number} height
 */
export function resizeRenderer(renderer, camera, width, height) {
  if (!renderer || !camera) return;
  
  renderer.setSize(width, height, false); // false = don't update canvas style
  
  if (camera.isPerspectiveCamera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

/**
 * Dispose renderer and free GPU resources
 * @param {THREE.WebGLRenderer} renderer
 */
export function disposeRenderer(renderer) {
  if (!renderer) return;
  
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement = null;
}
