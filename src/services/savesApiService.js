/**
 * Saves API Service – CRUD via MockAPI.io
 *
 * Teaches REST API concepts:
 * - CREATE: POST /citysaves
 * - READ:   GET /citysaves, GET /citysaves/:id
 * - UPDATE: PUT /citysaves/:id
 * - DELETE: DELETE /citysaves/:id
 *
 * Set VITE_MOCKAPI_BASE_URL in .env (e.g. https://xxxx.mockapi.io/api/v1).
 */

const RESOURCE = 'citysaves';

function getBaseUrl() {
  return (import.meta.env.VITE_MOCKAPI_BASE_URL || '').replace(/\/$/, '');
}

function getUrl(id = '') {
  const base = getBaseUrl();
  if (!base) return null;
  return id ? `${base}/${RESOURCE}/${id}` : `${base}/${RESOURCE}`;
}

/**
 * Check if MockAPI is configured.
 * @returns {boolean}
 */
export function isSavesApiAvailable() {
  return Boolean(getBaseUrl());
}

/**
 * CREATE – Save a new city (POST /citysaves)
 * @param {Object} payload - { name, zoneLabel, zoneLat, zoneLon, snapshot }
 * @returns {Promise<Object>} Created save with id, createdAt
 */
export async function createSave(payload) {
  const url = getUrl();
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create save failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * READ – List all saves (GET /citysaves)
 * @returns {Promise<Array>} Array of save objects
 */
export async function listSaves() {
  const url = getUrl();
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List saves failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * READ – Get one save by ID (GET /citysaves/:id)
 * @param {string} id - Save ID
 * @returns {Promise<Object>} Save object
 */
export async function getSave(id) {
  if (!id) throw new Error('Save ID is required');
  const url = getUrl(id);
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    throw new Error(`Get save failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * UPDATE – Update an existing save (PUT /citysaves/:id)
 * @param {string} id - Save ID
 * @param {Object} payload - { name, zoneLabel, zoneLat, zoneLon, snapshot }
 * @returns {Promise<Object>} Updated save
 */
export async function updateSave(id, payload) {
  if (!id) throw new Error('Save ID is required');
  const url = getUrl(id);
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update save failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * DELETE – Remove a save (DELETE /citysaves/:id)
 * @param {string} id - Save ID
 * @returns {Promise<void>}
 */
export async function deleteSave(id) {
  if (!id) throw new Error('Save ID is required');
  const url = getUrl(id);
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Delete save failed: ${res.status} ${text}`);
  }
}
