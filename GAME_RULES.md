# IsoTown Game Rules

How the game works and how to use it in the workshop.

---

## 1. Time: Days (Simplified)

- Economy updates every **5 seconds**.
- **12 updates** = **1 day**.
- **First half of day** (updates 0–5) = **day** (sun, bright).
- **Second half** (updates 6–11) = **night** (moon, dark overlay, stars).

**UI:** Top bar shows **"Day N"** (e.g. *Day 2*). Tooltip: "Economy updates every 5s. 12 updates = 1 day."

**Workshop use:**  
"This is **simulated** time: every 5 seconds, the economy updates. No real-world clock. We use it to drive day/night and when coins/happiness change."

---

## 2. Pause Button

- **Pause** = stops the game loop:
  - No new rounds (time freezes).
  - No tick updates (coins, population, jobs, happiness stay the same).
  - Auto Gemini reports do not trigger.
- **Resume** = rounds and economy run again.

**Workshop use:**  
"**Pause** when we inspect the Network tab, check API responses, or look at React state. The game won’t change while we debug."

---

## 3. Economy (Each Round)

Every **5 seconds** (one round), the game runs a **tick**:

1. **Income**
   - **Cafes** earn +1 coin (each). If **RAIN**: must be adjacent to a **Road**, or they earn −1.
   - **Offices** earn +2 coins (each). If **WIND**: must be adjacent to a **Road**, or they earn −1.
2. **Happiness**
   - If **HEAT**: happiness −1 per tick unless at least one **Cafe** exists.
   - Otherwise, no base happiness change from weather.
3. **Buildings**
   - **Houses**: +2 population each.
   - **Offices**: +3 jobs each.
   - **Cafes**: +2 happiness each (from their effects).

Roads don’t earn coins but **connect** buildings for weather rules.

---

## 4. Buildings

| Building | Cost | Effects |
|----------|------|---------|
| **Road** | 1 | Connects buildings; needed for Cafes/Offices in RAIN/WIND. |
| **House** | 3 | +2 population. |
| **Cafe** | 5 | +2 happiness, earns coins (weather-dependent). |
| **Office** | 8 | +3 jobs, earns coins (weather-dependent). |
| **Erase** | 0 | Removes a building. |

You **place** with the selected tool (click on empty tile). **Erase** by selecting Erase then clicking a building.

---

## 5. Weather

- Comes from **OpenWeatherMap** (via backend) using the **chosen location** (Google Maps).
- **RAIN**: Cafes need adjacent Road to earn; else penalty.
- **WIND**: Offices need adjacent Road to earn; else penalty.
- **HEAT**: Happiness −1 per tick unless you have a Cafe.
- **CLEAR**: No weather penalties.

---

## 6. Season

- From **location + weather** (latitude and temperature when available).
- **SPRING / SUMMER / FALL / WINTER** change tile colours and day/night look.
- **Winter** adds snow overlay.

---

## 7. End Game Rules (Simple)

**Win Condition:**
- ✅ Reach **20 population** AND **20 happiness** AND **30 coins**

**Lose Condition:**
- ❌ **Happiness reaches 0** (city abandoned)

**UI:**
- Stats show goals: "15/20" (current/goal)
- When you win or lose, a modal appears
- You can "Play Again" or "Continue Building"

**Workshop use:**
- Clear objectives help participants focus
- Teaches state management (checking conditions)
- Can pause to inspect state when close to goals

---

## 8. Workshop Integration

| Topic | How the game supports it |
|-------|---------------------------|
| **APIs** | Weather (OpenWeatherMap), location (Maps), Gemini (Mayor Report). |
| **State** | `cityState` holds grid, coins, population, jobs, happiness, etc. |
| **Time** | Rounds and days are **simulated** (1 round = 5s); good intro to "game loop" vs real time. |
| **Pause** | Pause to inspect Network, state, or explain without the game changing. |
| **CRUD** | Save/Load via MockAPI (Create, Read, Update, Delete). |
| **WebSockets** | Workshop Mode: host, audience, voting, shared state. |

**Flow suggestion:**

1. **Explain rules**: Rounds, days, economy, weather. Show "Day N · Round R/12".
2. **Play a few rounds**: Place roads, houses, cafes. Watch coins and happiness.
3. **Pause**: Open DevTools → Network, trigger weather/location APIs, then resume.
4. **Optional goals**: e.g. "Reach 20 population by Day 3" while using APIs and tools.

---

## 9. Characters

- **NPCs** = Auto-walk characters (1 per population)
- **Purpose:** Visual feedback, atmosphere, speech bubbles
- **No player character** (simplified for workshop — no WASD controls)
- NPCs have roles: RESIDENT (visits cafes), WORKER (goes to offices), BARISTA (stays near cafes)

See [CHARACTER_PURPOSE.md](./CHARACTER_PURPOSE.md) for details.

---

## 10. Summary

- **Day** = calendar day (Day 1, 2, 3…). Economy updates every 5s; 12 updates = 1 day.  
- **Pause** = freeze economy for demos and debugging.  
- **Economy** = updates every 5s; weather changes how Cafes/Offices earn and how happiness changes.  
- **End game:** Win = 20 pop + 20 happiness + 30 coins. Lose = 0 happiness.  
- Use **GAME_RULES** + **pause** + **end game goals** to run a clear, workshop-friendly session.
