/**
 * ThreeCamera.js
 * Camera setup for isometric view
 * Following Three.js official docs: https://threejs.org/docs/#api/en/cameras/OrthographicCamera
 */

import * as THREE from 'three';

/**
 * Create an isometric camera (orthographic projection)
 * Orthographic cameras provide true isometric view without perspective distortion
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @returns {THREE.OrthographicCamera}
 */
export function createIsometricCamera(width, height) {
  const aspect = width / height;
  const frustumSize = 15; // Controls zoom level
  
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,  // left
    frustumSize * aspect / 2,   // right
    frustumSize / 2,            // top
    frustumSize / -2,           // bottom
    0.1,                        // near
    1000                        // far
  );
  
  // Position camera for isometric view (45° angle from X and Z axes)
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);
  
  return camera;
}

/**
 * Update camera aspect ratio on resize
 * @param {THREE.OrthographicCamera} camera
 * @param {number} width
 * @param {number} height
 */
export function updateCameraAspect(camera, width, height) {
  if (!camera || !camera.isOrthographicCamera) return;
  
  const aspect = width / height;
  const frustumSize = 15;
  
  camera.left = frustumSize * aspect / -2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  
  camera.updateProjectionMatrix();
}

/**
 * Zoom camera (adjust frustum size)
 * @param {THREE.OrthographicCamera} camera
 * @param {number} delta - Zoom delta (positive = zoom in, negative = zoom out)
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 */
export function zoomCamera(camera, delta, width, height) {
  if (!camera || !camera.isOrthographicCamera) return;
  
  const aspect = width / height;
  const currentSize = (camera.right - camera.left) / aspect;
  const newSize = Math.max(5, Math.min(30, currentSize - delta));
  
  camera.left = newSize * aspect / -2;
  camera.right = newSize * aspect / 2;
  camera.top = newSize / 2;
  camera.bottom = newSize / -2;
  
  camera.updateProjectionMatrix();
}

/**
 * Pan camera (move in screen space)
 * @param {THREE.OrthographicCamera} camera
 * @param {number} deltaX - Pan delta X
 * @param {number} deltaY - Pan delta Y
 */
export function panCamera(camera, deltaX, deltaY) {
  if (!camera) return;
  
  // Calculate pan speed based on camera zoom
  const frustumSize = camera.right - camera.left;
  const panSpeed = frustumSize * 0.001;
  
  // Pan in camera's local coordinate system
  const offset = new THREE.Vector3();
  offset.setFromMatrixColumn(camera.matrix, 0); // X axis
  offset.multiplyScalar(-deltaX * panSpeed);
  
  const offsetY = new THREE.Vector3();
  offsetY.setFromMatrixColumn(camera.matrix, 1); // Y axis
  offsetY.multiplyScalar(deltaY * panSpeed);
  
  camera.position.add(offset);
  camera.position.add(offsetY);
}
