# Checkpoint 1: TODO #1 – Debugging (Easy)

**File:** `src/services/weatherService.js`  
**TODO:** Add `console.log` when using cached weather data.

---

## Answer

**Location:** Inside `fetchWeather()`, in the `if (cached)` block (around line 111).

**Add this line** (uncomment or type it):

```javascript
if (cached) {
  console.log('✅ Using cached weather data:', cached);
  return cached;
}
```

---

## Full context (before → after)

**Before:**
```javascript
if (cached) {
  // ===== TODO #1 (Easy - Debugging): Add console.log here =====
  // ...
  return cached;
}
```

**After:**
```javascript
if (cached) {
  console.log('✅ Using cached weather data:', cached);
  return cached;
}
```

---

## How to verify

1. Open the app and change location (e.g. World Map → pick a city).
2. Change location again within ~5 minutes.
3. Open DevTools → **Console**.
4. You should see: `✅ Using cached weather data: { ... }` on the second change.

---

## Teaching notes

- **When it runs:** Only when the cache is used (same or nearby location, within cache TTL).
- **Why it helps:** Confirms caching works and reduces unnecessary API calls.
- **Concept:** Caching = fewer requests, faster UX, lower cost.
