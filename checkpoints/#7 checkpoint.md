# Checkpoint 7: TODO #7 – Improve load-save error handling (Easy – UX)

**File:** `src/components/SavesPanel.jsx`  
**TODO:** Make the error message when loading a single save more specific and helpful.

---

## Answer

**Location:** In the `catch` block of `handleLoad` (around line 75), where it currently does `setError(e.message || 'Failed to load save');`.

**Replace with something more specific, for example:**

**Option A – Differentiate 404 vs network:**
```javascript
} catch (e) {
  const msg = e.message || '';
  if (msg.includes('404') || msg.includes('not found')) {
    setError('Save not found. It may have been deleted.');
  } else if (msg.includes('fetch') || msg.includes('network')) {
    setError('Network error loading save. Check your connection.');
  } else {
    setError(`Failed to load save: ${msg}`);
  }
}
```

**Option B – Single clear message:**
```javascript
} catch (e) {
  setError(e.message || 'Could not load save. Check connection and that the save still exists.');
}
```

**Option C – Short and consistent with Checkpoint 6:**
```javascript
} catch (e) {
  setError(`Load failed. ${e.message || 'Save may have been deleted or MockAPI is unreachable.'}`);
}
```

---

## Full context (Option B)

**Before:**
```javascript
    } catch (e) {
      // ===== TODO #7 (Easy - UX): Improve error handling =====
      setError(e.message || 'Failed to load save');
    }
```

**After:**
```javascript
    } catch (e) {
      setError(e.message || 'Could not load save. Check connection and that the save still exists.');
    }
```

---

## How to verify

1. Open Cloud Saves and click “Load” on a save that no longer exists (e.g. deleted in MockAPI), or use an invalid ID.
2. You should see the new message instead of a generic “Failed to load save”.
3. Load a valid save and confirm it still works.

---

## Teaching notes

- **UX:** Users should understand whether the problem is “not found” vs “network/config”.
- **Consistency:** Align wording with Checkpoint 6 (list error) so the whole panel feels coherent.
