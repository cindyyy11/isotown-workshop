# Character System: Purpose & Decision

## Current Implementation

### **Player Character (WASD)**
- **Status:** ✅ **REMOVED** (simplified for workshop)
- **Previous purpose:** You could move "your" character with WASD keys
- **Why removed:** No clear gameplay purpose; adds complexity without teaching value

### **NPCs (Auto-walk)**
- **Status:** ✅ **KEPT**
- **Purpose:** 
  - **Visual feedback:** Shows population (1 NPC per population)
  - **Atmosphere:** Makes city feel alive
  - **Speech bubbles:** NPCs say things based on game state (happiness, weather, etc.)
- **Behavior:**
  - Auto-walk to buildings (houses, cafes, offices)
  - Different roles: RESIDENT, WORKER, BARISTA
  - Each has a purpose (workers go to offices, residents visit cafes, etc.)

---

## Options for Future Enhancement

### **Option A: Keep as-is** (Recommended for Workshop)
- ✅ NPCs show population visually
- ✅ Speech bubbles add personality
- ✅ No player character = simpler, less confusing
- **Best for:** Workshop focus on APIs, not character control

### **Option B: Add Player Character Back with Purpose**
If you want player character back, add:
- **Interact with buildings:** Walk to building → press E → see stats/info
- **Collect coins:** Visual coins drop from buildings → walk over to collect
- **Trigger events:** Walk to special tiles → trigger Gemini suggestions
- **Pros:** More engaging, teaches interaction
- **Cons:** More code, might distract from API learning

### **Option C: Remove All Characters**
- Remove NPCs too
- Just show buildings and stats
- **Pros:** Simplest possible
- **Cons:** Less visual appeal, no population feedback

---

## Recommendation

**Keep Option A** (current):
- NPCs provide visual feedback without complexity
- No player character = one less thing to explain
- Focus stays on APIs, building placement, and economy
- Speech bubbles add personality without requiring interaction

---

## Implementation Status

- ✅ **Option B implemented** (player character with purpose):
  - **Interact with buildings:** Walk next to a building → press **E** → modal shows name, cost, effects, and tips (e.g. “Connect to road for income”).
  - **Collect coins:** Coins drop from CAFE/OFFICE/RESTAURANT (day only, 15% chance per tick). Walk over them to collect; “+N” toast appears.
  - **Trigger Gemini:** Walk to town square (5,5) or (6,6) → Gazette opens with AI report. Throttled to once every 30s.
- ✅ **NPCs kept** (auto-walk, speech bubbles, roles)
- ✅ **Characters sync with population** (1 NPC per population)
- ✅ **Player** shown when `includePlayer` is true (default); WASD + E + center trigger all wired.
