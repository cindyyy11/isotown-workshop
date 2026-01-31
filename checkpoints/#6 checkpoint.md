# Checkpoint 6: TODO #6 – Improve error message (Easy – UX)

**File:** `src/components/SavesPanel.jsx`  
**TODO:** Replace the generic error message when listing saves fails with a clearer, actionable message.

---

## Answer

**Location:** In the `catch` block of `loadList` (around line 42), where it currently does `setError(e.message || 'Failed to list saves');`.

**Replace with one of these (or similar):**

**Option A – Emphasize MockAPI / env:**
```javascript
} catch (e) {
  setError(
    e.message?.includes('MockAPI') || e.message?.includes('VITE_MOCKAPI')
      ? `Cannot connect to MockAPI. Check VITE_MOCKAPI_BASE_URL in .env and that your MockAPI project is running.`
      : `Network error listing saves: ${e.message || 'Check internet and MockAPI status.'}`
  );
  setSaves([]);
}
```

**Option B – Simple and clear:**
```javascript
} catch (e) {
  setError(`Could not load saves. ${e.message || 'Check VITE_MOCKAPI_BASE_URL in .env and internet connection.'}`);
  setSaves([]);
}
```

**Option C – Short and user-friendly:**
```javascript
} catch (e) {
  setError(e.message || 'Cannot connect to cloud saves. Check .env and MockAPI.');
  setSaves([]);
}
```

Any of these is valid; pick the level of detail you want for the workshop.

---

## Full context (Option B)

**Before:**
```javascript
    } catch (e) {
      // ===== TODO #6 (Easy - UX): Improve this error message =====
      setError(e.message || 'Failed to list saves');
      setSaves([]);
```

**After:**
```javascript
    } catch (e) {
      setError(`Could not load saves. ${e.message || 'Check VITE_MOCKAPI_BASE_URL in .env and internet connection.'}`);
      setSaves([]);
```

---

## How to verify

1. Temporarily break the MockAPI URL in `.env` (e.g. wrong URL or empty).
2. Open the Cloud Saves panel in the app.
3. You should see the new message instead of a bare “Failed to list saves”.
4. Restore `.env` and confirm the panel loads again when the URL is correct.

---

## Teaching notes

- **UX:** Errors should say what went wrong and what to check (env, network, service).
- **Consistency:** Use the same tone and structure for other save errors (e.g. TODO #7).
