# Agent City–Inspired Roadmap (Workshop-Appropriate)

**Reference:** [Agent City](https://x.com/VittoStack/status/2004551422642110695) — autonomous AI citizens, rent, jobs, relationships, etc.

**Our scope:** IsoTown is a **workshop demo** (2.5–3h, intro to Web & APIs). We take **ideas** from Agent City but keep implementation **simple**, **teachable**, and **no LLM-per-citizen**.

---

## What We Already Have (Aligned with “Agent City–lite”)

| Agent City concept      | IsoTown today                          |
|-------------------------|----------------------------------------|
| Night/day cycles        | Day/night overlay (day vs night rounds)|
| Jobs                    | Offices = jobs; population from houses |
| Buildings               | Road, House, Cafe, Office              |
| Economy                 | Coins, happiness, population           |
| AI mayor                | Gemini Mayor Report                    |
| Citizens moving around  | NPCs auto-walk, roles, speech bubbles  |

---

## What to Implement Next (Prioritized)

### Tier 1 — Quick wins (teach state, game loop, UI)

1. **Desires / needs in speech bubbles**
   - NPCs already have roles (RESIDENT, WORKER, BARISTA).
   - Add explicit **desires**: e.g. “I need to eat”, “Going to work”, “Time to sleep”.
   - Derive from **role + time of day** (no LLM). Reuse existing speech bubble logic.
   - **Teaching:** State (desire), time (day/night), mapping data → UI.

2. **Working hours**
   - Offices earn **only during “day”** (e.g. rounds 1–6); no income at night.
   - Optionally: Cafes only earn during day (or day + first few night rounds).
   - **Teaching:** Game loop, conditional logic, “real-world” rules.

3. **Simple “memories” / city log**
   - Store last **5–10 events** in state: “Built Cafe”, “Happiness dropped”, “Reached 10 population”, etc.
   - Show in a small **City log** or **Memories** panel (collapsible).
   - **Teaching:** Arrays, state updates, optional persistence (e.g. last N in `localStorage`).

### Tier 2 — Deeper economy and buildings

4. **Rent / upkeep**
   - Houses cost **1 coin per day** (or per N ticks) as “rent”.
   - If you can’t pay, happiness drops (e.g. −1 per unpaid day).
   - **Teaching:** Economy design, constraints, trade-offs.

5. **One new building: Restaurant**
   - **Cost:** e.g. 7 coins. **Effects:** +happiness, +slight coin income (different from Cafe).
   - Placement rules similar to Cafe (e.g. adjacent to road).
   - **Teaching:** Adding new entity, new UI, new economy rules.

6. **Mayor “tax” (optional)**
   - Slider: **0–10% tax**. Reduces coin gain globally (e.g. `income * (1 - tax)`).
   - Gemini Mayor Report can reference current tax level.
   - **Teaching:** User input → state → economy; prompt engineering.

### Tier 3 — More “Agent City–like” flavor

7. **Simplified relationships**
   - When two NPCs “meet” (same building or adjacent), increment a **relationship** counter.
   - After N meets: **acquaintance → friend**. Show a small “friend” icon when they’re close.
   - **Teaching:** State per entity, adjacency, simple rules.

8. **Police / Fire station**
   - New buildings that provide **“safety”** (abstract stat).
   - **Effect:** Reduce chance of “bad event” (e.g. random happiness −1) or mitigate upkeep penalty.
   - **Teaching:** New building type, new stats, simple RNG.

---

## What We’re *Not* Doing (Agent City scale)

- LLM per citizen
- Real-time natural-language conversations
- Crypto / x402 / 8004
- Kids, school, degrees
- Complex relationship graphs
- Fully autonomous world evolution

---

## Suggested “Implement Next” Order

1. **Desires in speech bubbles** — reuses NPCs, high visual payoff.  
2. **Working hours** — small change to economy, clear day/night impact.  
3. **City log / memories** — good for teaching state and optional persistence.  
4. **Rent** — then **Restaurant** — then **Tax** and **Relationships** / **Police–Fire** as you expand.

---

## How This Fits the Workshop

- **APIs:** Weather, Maps, Gemini (mayor) unchanged; optional: “log events” to MockAPI as CRUD practice.
- **State:** Desires, working hours, rent, tax, relationships all live in React state (and optionally `localStorage` / MockAPI).
- **Game loop:** Working hours and rent run on the existing tick.

You can implement **Tier 1** first, then choose 1–2 items from **Tier 2** based on time and learning goals.
