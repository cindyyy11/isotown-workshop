# Checkpoint 8: TODO #8 – Add "notes" field (Challenge – Hard)

**Files:** MockAPI (dashboard), `src/services/savesApiService.js`, `src/components/SavesPanel.jsx`  
**TODO:** Add full-stack support for a “notes” field on saves (MockAPI schema, API layer, UI).

---

## Answer

### 1. MockAPI (do this first)

1. Go to https://mockapi.io → your project → **citysaves** resource.
2. Edit the resource and add a new field:
   - **Field name:** `notes`
   - **Type:** string
   - **Default:** `""` (empty string)
3. Save.

---

### 2. `src/services/savesApiService.js`

**In `createSave`, add `notes` to the request body** (around line 84):

**Before:**
```javascript
  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
    // TODO: Add notes field here (see TODO #8 above)
  };
```

**After:**
```javascript
  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
    notes: payload.notes || '',
  };
```

**In `updateSave`, add `notes` the same way** (around line 167):

**Before:**
```javascript
  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
    // TODO: Also add notes field here (same as createSave - see TODO #8)
  };
```

**After:**
```javascript
  const body = {
    name: payload.name || 'Unnamed City',
    zoneLabel: payload.zoneLabel || 'Unknown',
    zoneLat: payload.zoneLat ?? 0,
    zoneLon: payload.zoneLon ?? 0,
    snapshot: payload.snapshot || {},
    notes: payload.notes || '',
  };
```

---

### 3. `src/components/SavesPanel.jsx`

**Add state for notes:**
```javascript
const [notes, setNotes] = useState('');
```

**When building the save payload** (in create/update), include `notes`:
- When creating: pass `notes` (e.g. from local state).
- When updating: pass the current `notes` (from state or from loaded save).

**When opening the panel or selecting a save**, set notes from the save if it has them:
- e.g. `setNotes(save.notes || '');` when loading a save for editing, or when displaying.

**UI – add a textarea** (e.g. near the save name input):
```jsx
<textarea
  placeholder="Add notes about this city..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={3}
  className="saves-notes-input"
/>
```

**When calling create/update**, include `notes` in the payload object you pass to `createSave` / `updateSave`.

**When loading a save**, show its notes (e.g. in the same textarea or in a read-only block) and optionally prefill `notes` for “Save over current”.

---

## Minimal SavesPanel change summary

- Add `const [notes, setNotes] = useState('');`.
- Add the textarea (value=`notes`, onChange updates `notes`).
- When saving (create or update), add `notes` to the payload.
- When loading a save, set `setNotes(save.notes || '')` and/or display `save.notes`.

---

## How to verify

1. Add `notes` in MockAPI and in `savesApiService.js` (create + update).
2. Add notes state and textarea in `SavesPanel.jsx` and pass `notes` in payloads.
3. Save a city with some notes.
4. Reload the app, open Cloud Saves, load that save → notes should appear.
5. Edit notes and save again → updated notes should persist.

---

## Teaching notes

- **Full-stack:** Schema (MockAPI) → API (savesApiService) → UI (SavesPanel) must all include `notes`.
- **Consistency:** Same field name and type everywhere avoids bugs.
- **Optional:** Validate length or sanitize input before sending to the API.
