# Weather Conditions Explained

## 🌤️ What is "CLEAR"?

**CLEAR** is the **default/optimal weather condition** in IsoTown. It means:
- ✅ **No rain**
- ✅ **No high winds** (≤20 km/h)
- ✅ **No extreme heat** (≤32°C)

**In gameplay:** CLEAR = **No penalties, normal building income**

---

## 📊 All Weather Conditions

| Condition | When It Occurs | Game Effect | Icon |
|-----------|----------------|-------------|------|
| **CLEAR** | No rain, wind ≤20 km/h, temp ≤32°C | ✅ **Optimal** - No penalties | ☀️ |
| **RAIN** | Precipitation > 0 | ⚠️ Cafes need roads to earn income | 🌧️ |
| **WIND** | Wind speed > 20 km/h | ⚠️ Offices lose -1 coin if not adjacent to road | 💨 |
| **HEAT** | Temperature > 32°C | ⚠️ Happiness -1 per tick unless at least 1 cafe exists | 🔥 |

---

## 🎮 How CLEAR Works

### Building Income (Normal Rules)

When weather is **CLEAR**, buildings follow **standard income rules**:

1. **Cafe** ☕
   - Earns **+1 coin** per tick if adjacent to road
   - No income if not adjacent to road
   - **No penalty** (unlike RAIN)

2. **Office** 🏢
   - Earns **+2 coins** per tick if:
     - Adjacent to road **AND**
     - Has house within distance 2
   - **No penalty** (unlike WIND)

3. **House** 🏠
   - **+1 happiness** per tick if adjacent to road
   - No income (houses don't earn coins)

4. **Road** 🛣️
   - No income (just connectivity)

### Happiness (Normal Rules)

- **Houses next to roads:** +1 happiness per tick
- **No penalties** (unlike HEAT which reduces happiness)

---

## 🔄 Weather Priority

The weather system checks conditions in this order:

```
1. RAIN?    → If precipitation > 0 → RAIN
2. WIND?    → If wind > 20 km/h → WIND  
3. HEAT?    → If temp > 32°C → HEAT
4. CLEAR    → Otherwise → CLEAR (default)
```

**Example:**
- If it's raining AND windy → **RAIN** (higher priority)
- If it's hot but no rain/wind → **HEAT**
- If it's sunny, calm, and cool → **CLEAR**

---

## 💡 Why CLEAR Exists

### 1. **Baseline Condition**
- CLEAR is the "normal" state
- Other conditions add penalties/modifiers
- CLEAR = no special rules

### 2. **Fallback Safety**
- If weather API fails → defaults to CLEAR
- App still works without API
- Participants can continue building

### 3. **Teaching Value**
- Shows contrast: "CLEAR = easy, RAIN/WIND/HEAT = challenges"
- Demonstrates how APIs affect gameplay
- "When weather is CLEAR, everything works normally"

---

## 🎓 Workshop Teaching Points

### When Weather is CLEAR:

**Say:**
- "CLEAR weather means optimal conditions - no penalties!"
- "Buildings earn income normally when it's CLEAR"
- "This is the baseline - other weather adds challenges"

### Compare to Other Conditions:

**CLEAR vs RAIN:**
- CLEAR: Cafes work normally (if next to road)
- RAIN: Cafes MUST be next to road (same rule, but emphasized)

**CLEAR vs WIND:**
- CLEAR: Offices work normally
- WIND: Offices lose -1 coin if not next to road

**CLEAR vs HEAT:**
- CLEAR: Happiness stable
- HEAT: Happiness -1 per tick (need cafes!)

---

## 📍 Where CLEAR Appears

1. **Weather Box** (Stats Panel)
   - Shows: ☀️ **Clear** - "Optimal conditions"

2. **Location Badge** (Bottom of screen)
   - Shows: `Location Name • CLEAR`

3. **Game Logic** (`cityService.js`)
   - Used in `processTick()` to check for penalties
   - If `worldCondition === 'CLEAR'` → no special modifiers

4. **Weather Service** (`weatherService.js`)
   - Default return value
   - Fallback when API fails

---

## 🔍 Code Reference

### How CLEAR is Determined

```javascript
// src/services/weatherService.js
function determineWorldCondition(weather) {
  const precipitation = weather.rain || weather.snow || 0;
  const windSpeed = weather.windspeed || 0;
  const temperature = weather.temperature || 25;

  // Priority: RAIN > WIND > HEAT > CLEAR
  if (precipitation > 0) return 'RAIN';
  if (windSpeed > 20) return 'WIND';
  if (temperature > 32) return 'HEAT';
  return 'CLEAR'; // ← Default/optimal condition
}
```

### How CLEAR Affects Gameplay

```javascript
// src/services/cityService.js - processTick()
// CLEAR = no special modifiers, normal rules apply

// RAIN modifier: cafes need roads (already in base rules)
if (state.worldCondition === 'RAIN') {
  // No extra penalty - base rule already requires roads
}

// WIND modifier: offices lose -1 if not adjacent to road
if (state.worldCondition === 'WIND' && !adjacentToRoad) {
  coinChange -= 1; // ← Only applies in WIND
}

// HEAT modifier: happiness -1 unless cafes exist
if (state.worldCondition === 'HEAT') {
  if (cafeCount === 0) {
    happinessChange -= 1; // ← Only applies in HEAT
  }
}

// CLEAR: None of these modifiers apply!
```

---

## ✅ Summary

**CLEAR = Optimal Weather Condition**

- **No penalties** on building income
- **No happiness penalties**
- **Normal gameplay** - standard rules apply
- **Default/fallback** when weather is good or API fails
- **Baseline** for comparing other weather effects

**Think of it as:** "Perfect weather for building your city!" ☀️

---

## 🎮 Strategy in CLEAR Weather

Since CLEAR has no penalties, you can:
- ✅ Build cafes anywhere (but still need roads for income)
- ✅ Build offices without worrying about wind penalties
- ✅ Focus on population/happiness without heat concerns
- ✅ Build freely and optimize your layout

**CLEAR is the easiest condition to build in!** 🎉
