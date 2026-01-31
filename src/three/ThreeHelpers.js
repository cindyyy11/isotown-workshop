/**
 * ThreeHelpers.js
 * Debug helpers for development (GridHelper, AxesHelper)
 * Following Three.js official docs: https://threejs.org/docs/#api/en/helpers/GridHelper
 */

import * as THREE from 'three';

/**
 * Create a grid helper for visualizing the grid
 * @param {number} size - Size of grid
 * @param {number} divisions - Number of divisions
 * @returns {THREE.GridHelper}
 */
export function createGridHelper(size = 12, divisions = 12) {
  const gridHelper = new THREE.GridHelper(
    size,
    divisions,
    0x444444, // Center line color
    0x888888  // Grid color
  );
  
  gridHelper.position.y = 0.01; // Slightly above ground
  gridHelper.name = 'gridHelper';
  
  return gridHelper;
}

/**
 * Create an axes helper for visualizing coordinate system
 * Red = X axis, Green = Y axis, Blue = Z axis
 * @param {number} size - Size of axes
 * @returns {THREE.AxesHelper}
 */
export function createAxesHelper(size = 5) {
  const axesHelper = new THREE.AxesHelper(size);
  axesHelper.name = 'axesHelper';
  
  return axesHelper;
}
