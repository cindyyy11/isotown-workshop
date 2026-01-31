/**
 * OrbitControlsSetup.js
 * Advanced camera controls for smooth 3D rotation
 * Official docs: https://threejs.org/docs/#examples/en/controls/OrbitControls
 */

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Create and configure OrbitControls for smooth camera rotation
 * @param {THREE.Camera} camera - Camera to control
 * @param {HTMLElement} domElement - Canvas element
 * @returns {OrbitControls}
 */
export function createOrbitControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  
  // Smooth damping for professional feel
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Limit zoom range
  controls.minDistance = 5;
  controls.maxDistance = 30;
  
  // Limit vertical rotation (don't go under the ground)
  controls.maxPolarAngle = Math.PI / 2 - 0.1; // Just above horizon
  controls.minPolarAngle = 0.3; // Don't go too high
  
  // Set target to center of grid
  controls.target.set(0, 0, 0);
  
  // Enable panning
  controls.enablePan = true;
  controls.panSpeed = 0.8;
  controls.screenSpacePanning = false; // Pan in world space
  
  // Rotation speed
  controls.rotateSpeed = 0.7;
  
  // Mouse buttons
  controls.mouseButtons = {
    LEFT: 2,   // Rotate (right button)
    MIDDLE: 1, // Zoom (scroll wheel)
    RIGHT: 0,  // Pan (right button + shift)
  };
  
  return controls;
}

/**
 * Update controls (call in animation loop)
 * @param {OrbitControls} controls
 */
export function updateControls(controls) {
  if (controls && controls.enabled) {
    controls.update();
  }
}

/**
 * Reset camera to default position
 * @param {OrbitControls} controls
 * @param {THREE.Camera} camera
 */
export function resetCameraView(controls, camera) {
  // Smooth transition to default position
  camera.position.set(10, 10, 10);
  controls.target.set(0, 0, 0);
  controls.update();
}

/**
 * Focus camera on a specific position
 * @param {OrbitControls} controls
 * @param {number} x - Target X
 * @param {number} y - Target Y  
 * @param {number} z - Target Z
 */
export function focusOn(controls, x, y, z) {
  controls.target.set(x, y, z);
  controls.update();
}

/**
 * Dispose controls
 * @param {OrbitControls} controls
 */
export function disposeControls(controls) {
  if (controls) {
    controls.dispose();
  }
}
