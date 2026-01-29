# Day & Rounds: Purpose and How It Works

## 🎮 What Are Day and Rounds?

**Day** and **Round** in IsoTown are **simulated game mechanics** — **not** real-world calendar or clock time.

---

## ⏰ How It Works

### **Round-Based Simulation**

- **Every 5 seconds** = 1 **round** (1 tick)
- **12 rounds** = 1 **day** (so 1 day = 60 seconds of gameplay)
- **Day** = 1, 2, 3… (increases each 12 rounds)
- **Round** = 1–12 within the current day
- **Rounds 1–6** = **day** (sun); **rounds 7–12** = **night** (moon, stars)

### **Calculation**

```javascript
tickCount = number of ticks processed (increments every 5 seconds)
day = Math.floor(tickCount / 12) + 1
round = (tickCount % 12) + 1   // 1–12
isNight = round >= 7
```

**Example:**
- Tick 0 → Day 1, Round 1 (day)
- Tick 6 → Day 1, Round 7 (night)
- Tick 11 → Day 1, Round 12 (night)
- Tick 12 → Day 2, Round 1 (day)

---

## 🎯 Purpose

### **1. Game Feel**
- Makes the city feel "alive" and progressing
- Visual feedback: "Day 5 · Round 3/12" shows progress
- Day/night (rounds 1–6 vs 7–12) adds atmosphere

### **2. Teaching Tool**
- Demonstrates **state management** (tickCount stored in state)
- Shows **simulation vs real-world** (rounds ≠ real time)
- Illustrates **incremental updates** (every 5 seconds, one round)

### **3. Milestone Tracking**
- Participants can see "Day 10" or "Round 12" as milestones
- Gemini auto-suggestions trigger every 20 ticks
- Helps track progress during workshop

### **4. Workshop Discussion Point**
- **"Why isn't this real time?"**
  - Answer: "Game simulation — we control the pace. 1 round = 5 seconds."
- **"How does it advance?"**
  - Answer: "Every 5 seconds, one round runs; 12 rounds = 1 day. Economy updates each round."
- **"Can we pause it?"**
  - Answer: "Yes! Pause stops rounds and economy. Use it when inspecting APIs or state."

---

## ⏸️ Pause Button

**What it does:**
- **Pauses the game loop** — no new rounds; day and round stop advancing
- **Stops economy updates** — coins, population, jobs, happiness freeze
- **Resumes when clicked again** — rounds and economy run again

**Why it's useful:**
- Pause when inspecting Network tab, API responses, or React state
- Facilitator can pause for explanations without the city changing
- Prevents city from changing during breaks or debugging

See [GAME_RULES.md](./GAME_RULES.md) for full rules and workshop use.

---

## 🔄 Real-World vs Simulated

| Data | Source | Updates |
|------|--------|---------|
| **Day / Round** | **Simulated** (ticks) | Every 5 seconds (1 round) while playing |
| **Season** | **Real-world** (latitude + date) | Based on location & actual calendar |
| **Weather** | **Real-world** (OpenWeatherMap API) | On location change, refresh |

**Key point:** Day and rounds are **game mechanics**, not real-world data. This teaches:
- **Simulated data** (game state, rounds)
- **Real-world data** (APIs, location, date)

---

## 📚 Workshop Teaching Points

### **1. State Management**
- "Day and round come from `cityState.tickCount`"
- "Every round (5s), we increment `tickCount` and derive day, round, day/night"
- "This is how games track progress"

### **2. Simulation vs Real Data**
- "Day/Round = simulated (we control it)"
- "Weather/Season = real (from APIs and location)"
- "Both are useful for different purposes"

### **3. Incremental Updates**
- "We use `setInterval` to check every 100ms"
- "When 5 seconds pass, we process one round (tick)"
- "Common pattern in game loops"

### **4. User Control**
- "Pause stops the game loop — no rounds, no economy updates"
- "Use it when inspecting APIs or state during the workshop"
- "Resume to continue rounds and economy"

---

## 💡 Example Workshop Dialogue

**Facilitator:** "Notice **Day** and **Round** in the top bar. What do you think they represent?"

**Participant:** "Is it real time?"

**Facilitator:** "Good question! No — it's **simulated**. Every 5 seconds, one **round** runs; 12 rounds = 1 **day**. So 1 day = 1 minute of play. It's a game mechanic, not real-world time."

**Participant:** "Why not use real time?"

**Facilitator:** "We want the game to move quickly in the workshop. With real time, you'd wait hours for one day. Here you see progress in minutes. **Season** and **weather**, though, come from real location and APIs. So we mix simulated data (day/rounds) with real data (season/weather)."

---

## ✅ Summary

- **Day / Round = Simulated** (game mechanics)
- **Purpose = Game feel, teaching tool, milestone tracking**
- **Updates = Every 5 seconds (1 round), 12 rounds = 1 day**
- **Pause = Stops game loop (no rounds, no economy)**
- **Teaching value = State management, simulation vs real data**

This system is **intentionally different** from real-world time to teach:
1. Game state management (`tickCount`, rounds)
2. Simulation vs real data (rounds vs APIs)
3. User control (pause/resume)
4. Incremental updates (round-based economy)

See **[GAME_RULES.md](./GAME_RULES.md)** for full rules, economy, and workshop integration.
