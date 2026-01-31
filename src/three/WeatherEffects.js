/**
 * WeatherEffects.js
 * Particle-based weather effects (rain, snow, clouds)
 * Official docs: https://threejs.org/docs/#api/en/objects/Points
 */

import * as THREE from 'three';

/**
 * Create rain particles
 * @param {number} count - Number of rain drops
 * @returns {THREE.Points}
 */
export function createRain(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;     // x
    positions[i * 3 + 1] = Math.random() * 30;         // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z
    velocities[i] = 0.5 + Math.random() * 0.5;         // fall speed
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
  
  const material = new THREE.PointsMaterial({
    color: 0x6699cc,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
  });
  
  const rain = new THREE.Points(geometry, material);
  rain.userData.type = 'rain';
  
  return rain;
}

/**
 * Create snow particles
 * @param {number} count - Number of snowflakes
 * @returns {THREE.Points}
 */
export function createSnow(count = 500) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;     // x
    positions[i * 3 + 1] = Math.random() * 30;         // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z
    velocities[i] = 0.1 + Math.random() * 0.2;         // fall speed
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
  
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
  });
  
  const snow = new THREE.Points(geometry, material);
  snow.userData.type = 'snow';
  
  return snow;
}

/**
 * Create fog clouds
 * @param {number} count - Number of cloud particles
 * @returns {THREE.Points}
 */
export function createClouds(count = 200) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;     // x
    positions[i * 3 + 1] = 15 + Math.random() * 10;    // y (high in sky)
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xcccccc,
    size: 2.0,
    transparent: true,
    opacity: 0.3,
  });
  
  const clouds = new THREE.Points(geometry, material);
  clouds.userData.type = 'clouds';
  
  return clouds;
}

/**
 * Update rain particles (make them fall)
 * @param {THREE.Points} rain
 * @param {number} deltaTime - Time since last frame (ms)
 */
export function updateRain(rain, deltaTime) {
  if (!rain || rain.userData.type !== 'rain') return;
  
  const positions = rain.geometry.attributes.position.array;
  const velocities = rain.geometry.attributes.velocity.array;
  
  for (let i = 0; i < positions.length / 3; i++) {
    positions[i * 3 + 1] -= velocities[i] * (deltaTime / 16); // Normalize to 60fps
    
    // Reset to top when hitting ground
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 30;
    }
  }
  
  rain.geometry.attributes.position.needsUpdate = true;
}

/**
 * Update snow particles (make them fall with drift)
 * @param {THREE.Points} snow
 * @param {number} deltaTime - Time since last frame (ms)
 * @param {number} time - Total elapsed time
 */
export function updateSnow(snow, deltaTime, time) {
  if (!snow || snow.userData.type !== 'snow') return;
  
  const positions = snow.geometry.attributes.position.array;
  const velocities = snow.geometry.attributes.velocity.array;
  
  for (let i = 0; i < positions.length / 3; i++) {
    positions[i * 3 + 1] -= velocities[i] * (deltaTime / 16);
    
    // Add gentle drift
    positions[i * 3] += Math.sin(time * 0.001 + i) * 0.01;
    positions[i * 3 + 2] += Math.cos(time * 0.001 + i) * 0.01;
    
    // Reset to top when hitting ground
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 30;
    }
  }
  
  snow.geometry.attributes.position.needsUpdate = true;
}

/**
 * Update clouds (drift slowly)
 * @param {THREE.Points} clouds
 * @param {number} time - Total elapsed time
 */
export function updateClouds(clouds, time) {
  if (!clouds || clouds.userData.type !== 'clouds') return;
  
  clouds.rotation.y = time * 0.00001;
}

/**
 * Dispose weather particles
 * @param {THREE.Points} particles
 */
export function disposeWeather(particles) {
  if (!particles) return;
  
  if (particles.geometry) {
    particles.geometry.dispose();
  }
  
  if (particles.material) {
    particles.material.dispose();
  }
}
