/**
 * WebGLSupport.js
 * Check if browser supports WebGL
 * Based on Three.js WebGL capabilities detection
 */

/**
 * Check if WebGL is available in the browser
 * @returns {boolean}
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!context) {
      return false;
    }
    
    // Check if context is valid
    if (typeof context.getParameter !== 'function') {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get WebGL error message
 * @returns {string}
 */
export function getWebGLErrorMessage() {
  return `Your browser or device does not support WebGL.
  
Possible solutions:
• Update your browser to the latest version
• Enable hardware acceleration in browser settings
• Update your graphics drivers
• Try a different browser (Chrome, Firefox, Edge)
• Switch to 2D mode using the button in the top bar`;
}
