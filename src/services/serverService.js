/**
 * Server Service
 * 
 * Handles communication with the IsoTown backend.
 * Falls back gracefully if server is unavailable.
 */

// API base URL from env, or default to local dev server
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176';

let cachedCapabilities = null;
let serverReachable = null;

function normalizeBase(base) {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function getApiBase() {
  return normalizeBase(API_BASE);
}

// Export for use by other services
export { getApiBase };

async function tryFetchJson(url, options = {}, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check server capabilities
 * @returns {Promise<Object>} Capabilities object or fallback
 */
export async function getServerCapabilities() {
  if (cachedCapabilities !== null) return cachedCapabilities;

  const base = getApiBase();
  const data = await tryFetchJson(`${base}/api/capabilities`);
  
  if (data && data.server) {
    serverReachable = true;
    cachedCapabilities = { available: true, base, ...data };
    return cachedCapabilities;
  }

  serverReachable = false;
  cachedCapabilities = { 
    available: false, 
    base: null, 
    server: false, 
    proxy: false,
    leaderboard: false,
    voting: false,
    gemini: false 
  };
  return cachedCapabilities;
}

/**
 * Check if server is reachable
 * @returns {Promise<boolean>}
 */
export async function isServerReachable() {
  if (serverReachable !== null) return serverReachable;
  await getServerCapabilities();
  return serverReachable;
}

/**
 * Fetch weather from server proxy
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object|null>}
 */
export async function fetchServerWeather(lat, lon) {
  if (!await isServerReachable()) return null;
  const base = getApiBase();
  return await tryFetchJson(`${base}/api/weather?lat=${lat}&lon=${lon}`, {}, 3000);
}

/**
 * Publish score to leaderboard
 * @param {Object} payload - { city, stats }
 * @returns {Promise<Object|null>}
 */
export async function publishScore(payload) {
  if (!await isServerReachable()) return null;
  const base = getApiBase();
  return await tryFetchJson(`${base}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 3000);
}

/**
 * Fetch leaderboard
 * @returns {Promise<Object|null>}
 */
export async function fetchLeaderboard() {
  if (!await isServerReachable()) return null;
  const base = getApiBase();
  return await tryFetchJson(`${base}/api/leaderboard`, {}, 3000);
}

/**
 * Request mayor report from Gemini
 * @param {Object} payload - { stats, worldCondition }
 * @returns {Promise<Object|null>} { report, parsed, enabled } on success; { message, hint? } on error
 */
export async function requestMayorReport(payload) {
  if (!await isServerReachable()) return null;
  const base = getApiBase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}/api/mayor-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    clearTimeout(timeout);
    if (res.ok) return data;
    const msg = data?.hint || data?.error || 'Gemini request failed';
    return { message: msg };
  } catch (e) {
    clearTimeout(timeout);
    return { message: 'Could not reach server. Check network and that the backend is running.' };
  }
}

/**
 * Get socket URL for realtime features
 * @returns {string}
 */
export function getSocketUrl() {
  return getApiBase() || 'http://localhost:5176';
}

/**
 * Reset cached capabilities (useful for testing)
 */
export function resetServerCache() {
  cachedCapabilities = null;
  serverReachable = null;
}
