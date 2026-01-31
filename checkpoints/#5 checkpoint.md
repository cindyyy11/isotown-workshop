# Checkpoint 5: TODO #5 – Add PARK button (Challenge – Easy)

**File:** `src/App.jsx`  
**TODO:** Add a toolbar button for the PARK building (after completing TODO #4 in `buildingData.js`).

**Prerequisite:** Checkpoint 4 (PARK in `buildingData.js`) must be done first.

---

## Answer

**1. Add `FaTree` to the icon imports** (top of `App.jsx`, around lines 2–6):

**Before:**
```javascript
import {
  FaCity, FaMapMarkerAlt, FaPlay, FaPlusCircle, FaHammer, FaSyncAlt, FaLightbulb, FaGlobeAsia,
  FaPause, FaRoad, FaHome, FaCoffee, FaBuilding, FaTrash, FaSave, FaCoins, FaUsers, FaBriefcase,
  FaSmile, FaSun, FaCloudRain, FaWind, FaFire, FaRedo, FaTimes, FaLeaf, FaCloudUploadAlt, FaImage,
  FaSnowflake, FaNewspaper, FaMoon, FaUtensils, FaShieldAlt, FaFireExtinguisher, FaList, FaInfoCircle,
} from 'react-icons/fa';
```

**After:** add `FaTree` to the list, e.g.:

```javascript
  FaSnowflake, FaNewspaper, FaMoon, FaUtensils, FaShieldAlt, FaFireExtinguisher, FaList, FaInfoCircle, FaTrophy, FaTree,
} from 'react-icons/fa';
```

(If you don’t have `FaTrophy`, just add `FaTree` somewhere in that import list.)

**2. Replace the TODO comment block** with the actual button (around line 955):

**Remove:**
```javascript
                    {/* ===== TODO #5 (Challenge - Easy): Add PARK Button Here ===== */}
                    {/*
            After you add PARK to src/data/buildingData.js (see TODO #4),
            ... entire comment ...
          */}
```

**Add:**
```javascript
                    <button
                      className={`floating-tool-btn ${cityState.selectedTool === 'PARK' ? 'active' : ''}`}
                      onClick={() => handleSelectTool('PARK')}
                    >
                      <FaTree /> {BUILDING_TYPES['PARK'].name} <span className="tool-cost">${BUILDING_TYPES['PARK'].cost}</span>
                    </button>
```

---

## How to verify

1. Save both `buildingData.js` (PARK defined) and `App.jsx` (button + `FaTree` import).
2. Refresh the app; the PARK button should appear in the toolbar (e.g. under SERVICES).
3. Click PARK, then click on the grid to place a park; happiness should increase.

---

## Teaching notes

- **Data + UI:** Button uses `BUILDING_TYPES['PARK']` so name and cost stay in sync with `buildingData.js`.
- **Pattern:** Same as other building buttons (active state, `handleSelectTool`, icon + name + cost).
- **Flow:** Data (buildingData) → UI (button) → Logic (cityService) when placing.
