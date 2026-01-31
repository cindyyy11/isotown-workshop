# Checkpoint 2: TODO #2 – Debugging (Easy)

**File:** `src/services/weatherService.js`  
**TODO:** Add `console.log` when fetching fresh weather from the server.

---

## Answer

**Location:** In `fetchWeather()`, right before the `try {` that calls the API (around line 124).

**Add this line:**

```javascript
console.log('🌐 Fetching fresh weather from server...', { lat, lon });

try {
  const apiBase = getApiBase();
  // ...
```

---

## Full context (before → after)

**Before:**
```javascript
  // ===== TODO #2 (Easy - Debugging): Add console.log here =====
  // ...

  try {
    const apiBase = getApiBase();
```

**After:**
```javascript
  console.log('🌐 Fetching fresh weather from server...', { lat, lon });

  try {
    const apiBase = getApiBase();
```

---

## How to verify

1. Open the app, open DevTools → **Console**.
2. Change location via World Map (or wait for cache to expire).
3. You should see: `🌐 Fetching fresh weather from server... { lat: ..., lon: ... }`.
4. In **Network** tab you should see a request to `/api/weather?lat=...&lon=...`.

---

## Teaching notes

- **When it runs:** When there is no valid cache, so a real HTTP request is made.
- **Why it helps:** Distinguishes “cache hit” (Checkpoint 1) from “fresh fetch” (this one).
- **Concept:** Debugging with `console.log` and Network tab to see API usage.
