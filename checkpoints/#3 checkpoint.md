# Checkpoint 3: TODO #3 – Express routing (Medium)

**File:** `server/index.js`  
**TODO:** Create a `GET /api/version` endpoint that returns version info.

---

## Answer

**Location:** After the `/health` route and before the `// ===== CAPABILITIES =====` block (around line 138).

**Add this code** (uncomment the template and adjust if needed):

```javascript
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'IsoTown',
    author: 'Your Name',
    description: 'Pixel city builder with real-world APIs'
  });
});
```

---

## Full context

**Remove or replace** the TODO comment block with:

```javascript
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'IsoTown',
    author: 'Your Name',  // Participants put their name!
    description: 'Pixel city builder with real-world APIs'
  });
});

// ===== CAPABILITIES =====
app.get('/api/capabilities', (req, res) => {
```

---

## How to verify

1. Restart the server: stop it (Ctrl+C), then run `npm run dev` or `npm run dev:server`.
2. In browser or Postman: **GET** `http://localhost:5176/api/version`.
3. Response should be JSON, e.g.:
   ```json
   {
     "version": "1.0.0",
     "name": "IsoTown",
     "author": "Your Name",
     "description": "Pixel city builder with real-world APIs"
   }
   ```
4. In Swagger UI: open `http://localhost:5176/api-docs/` and add the endpoint there if you document it.

---

## Teaching notes

- **Concepts:** Express route (`app.get`), URL path, `res.json()`.
- **REST:** GET = read-only, no body; response is JSON.
- **Optional:** Add to Swagger, or add `lastUpdated: new Date().toISOString()`.
