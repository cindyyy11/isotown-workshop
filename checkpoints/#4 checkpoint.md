# Checkpoint 4: TODO #4 – Add PARK building (Challenge – Easy)

**File:** `src/data/buildingData.js`  
**TODO:** Add a new building type `PARK` to `BUILDING_TYPES`.

---

## Answer

**1. Add `FaTree` to the imports** (top of file, around line 6):

**Before:**
```javascript
import { FaRoad, FaHome, FaCoffee, FaBuilding, FaTrash, FaUtensils, FaShieldAlt, FaFireExtinguisher } from 'react-icons/fa';
```

**After:**
```javascript
import { FaRoad, FaHome, FaCoffee, FaBuilding, FaTrash, FaUtensils, FaShieldAlt, FaFireExtinguisher, FaTree } from 'react-icons/fa';
```

**2. Add the PARK entry** inside `BUILDING_TYPES`, after the `FIRE` block (around line 80). Uncomment and use:

```javascript
  FIRE: {
    id: 'FIRE',
    name: 'Fire Station',
    // ... existing FIRE config
  },

  PARK: {
    id: 'PARK',
    name: 'Park',
    icon: FaTree,
    cost: 4,
    color: '#4a7c59',
    secondaryColor: '#6b9d7a',
    effects: { population: 0, happiness: 1, jobs: 0 },
    description: '+1 Happiness. Green space for relaxation.',
  },
};
```

---

## Full PARK object

```javascript
  PARK: {
    id: 'PARK',
    name: 'Park',
    icon: FaTree,
    cost: 4,
    color: '#4a7c59',
    secondaryColor: '#6b9d7a',
    effects: { population: 0, happiness: 1, jobs: 0 },
    description: '+1 Happiness. Green space for relaxation.',
  },
```

---

## How to verify

1. Save the file; ensure no syntax errors (e.g. commas between entries).
2. Complete **Checkpoint 5** (PARK button in `App.jsx`) so you can select PARK in the UI.
3. In game: select Park, place on grid, check that happiness increases by 1 per park.

---

## Teaching notes

- **Data-driven UI:** Same structure as other buildings (id, name, icon, cost, effects).
- **Effects:** `happiness: 1` is used by game logic (e.g. in `cityService`) to update happiness.
- **Next step:** Toolbar must reference `BUILDING_TYPES['PARK']` (TODO #5).
