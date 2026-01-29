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
// ===== TODO #8 (Challenge - Hard): Add "notes" Field Support =====
//
// GOAL: Extend the save system to include player notes
//
// FULL-STACK FEATURE - Requires changes in 3 places:
//
// 1. MOCKAPI SETUP (do this first):
//    - Go to https://mockapi.io → Your project → citysaves resource
//    - Click "Edit" → Add new field:
//      Field name: notes
//      Type: string
//      Default: "" (empty string)
//    - Click Save
//
// 2. THIS FILE (savesApiService.js):
//    - Add "notes" to the body below (line 47):
//      notes: payload.notes || '',
//    - Do the same in updateSave() function (around line 120)
//
// 3. UI (SavesPanel.jsx):
//    - Add a textarea for users to type notes
//    - Pass notes in the payload when saving
//    - Display notes when loading
//
// TEST STEPS:
// 1. Add notes field to MockAPI
// 2. Add notes: payload.notes || '', to body below
// 3. In SavesPanel.jsx, add this before the save name input:
//    <textarea 
//      placeholder="Add notes about this city..."
//      value={notes}
//      onChange={(e) => setNotes(e.target.value)}
//    />
//    (You'll need to add: const [notes, setNotes] = useState('');)
// 4. When building payload, add: notes
// 5. When loading, display: save.notes
// 6. Test: Save with notes → Reload page → Load save → Notes appear!
//
// WHY: Learn full-stack feature development
// LEARN: Data model (MockAPI) + API layer (this file) + UI (SavesPanel) must align
//
export async function createSave(payload) {
  const url = getUrl();
  if (!url) throw new Error('VITE_MOCKAPI_BASE_URL is not set');

  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
    // TODO: Add notes field here (see TODO #8 above)
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
    // TODO: Also add notes field here (same as createSave - see TODO #8)
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
