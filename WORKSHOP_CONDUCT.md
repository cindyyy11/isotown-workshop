# IsoTown Workshop: Introduction to Web and APIs

**Topic:** Introduction to Web and APIs  
**Duration:** 2.5–3 hours  
**Format:** Hands-on, code-along / explore

This document is a **facilitator guide** for running the IsoTown workshop. It covers prerequisites, installation, workshop flow, and how each section supports the learning goals.

---

## 1. Workshop Goals

By the end of this workshop, participants will:

- Understand **how the web works**: browser (client), server, and HTTP.
- Know what an **API** is and how apps use **GET** and **POST** (and optionally **PUT**, **DELETE**).
- Use **environment variables** and **API keys** in a real project.
- **Call real APIs**: Weather, Maps, and optionally CRUD (MockAPI) and your backend.
- **Explore a React + Canvas app** and see where API calls happen.

**Does this workshop achieve that?** Yes, if you follow the flow below. The app is built so that:

- **Setup** introduces env vars and API keys.
- **Playing the game** uses Weather + Maps APIs.
- **Server / Leaderboard** uses GET/POST against your backend.
- **Cloud Saves (optional)** use MockAPI for CRUD.

---

## 2. Prerequisites

### 2.1 Technical

| Requirement | Details | How to check |
|-------------|---------|--------------|
| **Node.js** | v18+ (LTS recommended) | `node -v` |
| **npm** | Comes with Node | `npm -v` |
| **Code editor** | VS Code, Cursor, etc. | — |
| **Terminal** | Use project folder, run `npm` commands | — |
| **Browser** | Chrome, Edge, or Firefox | — |

### 2.2 Conceptual (nice to have, not mandatory)

- **JavaScript basics**: variables, functions, arrays, objects.
- **Very basic HTML/CSS**: what a “page” is; no deep knowledge needed.
- **Curiosity about “how websites talk to servers”** — we teach the rest.

### 2.3 What participants do *not* need

- Prior React experience (you’ll explore, not build from scratch).
- Prior API experience.
- Git (unless you use it for distributing the project).

---

## 3. Installation Guidelines

Participants should do this **before** the workshop (or in the first 15–20 minutes).

### 3.1 Get the project

- **Option A:** Download ZIP from your repo and extract.
- **Option B:** `git clone <repo-url>` then `cd` into the project folder.

### 3.2 Install dependencies

```bash
npm install
```

If you see errors:

- Use **Node v18+**.
- Run from the **project root** (where `package.json` is).
- Try deleting `node_modules` and `package-lock.json`, then `npm install` again.

### 3.3 Create `.env` from `env.example`

**Mac / Linux:**

```bash
cp env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item env.example .env
```

**Windows (Command Prompt):**

```cmd
copy env.example .env
```

### 3.4 Add required API keys

Open `.env` in your editor and set:

1. **OpenWeatherMap**
   - Sign up: [openweathermap.org/api](https://openweathermap.org/api) → API Keys.
   - Add: `OPENWEATHERMAP_API_KEY=your_key_here`

2. **Google Maps**
   - [console.cloud.google.com](https://console.cloud.google.com) → Create project → Enable “Maps JavaScript API” → Create API key.
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`

**Important:** New keys can take a few minutes to activate. If the app says “invalid key,” wait 5–10 minutes and restart.

### 3.5 Run the app

```bash
npm run dev
```

This starts:

- **Frontend (Vite):** [http://localhost:5175](http://localhost:5175)
- **Backend (Express):** [http://localhost:5176](http://localhost:5176)

### 3.6 Verify setup

1. Open [http://localhost:5175](http://localhost:5175).
2. You should see the IsoTown start screen (not the “Setup required” error).
3. Click **“Explore Earth & Pick Location”** — the map should load.
4. Pick a city, then **“Start Building”** — the game should start and weather should appear.

If the **“Setup required”** screen appears, the app will show what’s missing (e.g. server not running, or keys not set).

### 3.7 Optional: MockAPI (for CRUD section)

- Create a project at [mockapi.io](https://mockapi.io).
- Add a resource **`citysaves`** with: `name`, `zoneLabel`, `zoneLat`, `zoneLon`, `snapshot`.
- Set `VITE_MOCKAPI_BASE_URL=https://<YOUR_PROJECT_ID>.mockapi.io/api/v1` in `.env`.
- See [ENDPOINTS.md](./ENDPOINTS.md) for details.

---

## 4. Workshop Flow (2.5–3 hours)

Total duration is **≈ 2.5–3 hours** including a short break. Adjust timings based on group size and pace.

| Phase | Duration | Focus |
|-------|----------|--------|
| **0. Intro & setup check** | 10 min | What we’ll learn, verify install |
| **1. Web & APIs 101** | 15 min | Client, server, HTTP, APIs, keys |
| **2. Run & play** | 20 min | Play the game, Maps, Weather |
| **3. Where are the APIs?** | 25 min | Trace Weather, Maps, env vars |
| **4. Our backend API** | 25 min | GET/POST, leaderboard, publish score |
| **5. CRUD with MockAPI (optional)** | 25 min | Cloud Saves, GET/POST/PUT/DELETE |
| **6. Workshop Mode (optional)** | 15 min | Interactive voting, WebSockets |
| **7. Wrap-up & next steps** | 10 min | Recap, resources, Q&A |
| **Break** | 10 min | Mid-workshop |

---

### Phase 0: Intro & setup check (10 min)

- **Welcome:** “Today we’ll learn how the web and APIs work by using them in a real app.”
- **Quick pitch:** IsoTown = small city builder; we use Weather API, Maps API, and our own server.
- **Setup check:**
  - Everyone run `npm run dev`, open [http://localhost:5175](http://localhost:5175).
  - Fix any “Setup required” issues (keys, server) together.
- **Prerequisites:** “You need Node.js and a code editor. We’ll use the terminal and `.env`.”

---

### Phase 1: Web & APIs 101 (15 min)

**Goal:** High-level model of the web and APIs.

- **Client and server:**
  - Browser = **client**. It requests pages and data.
  - **Server** sends HTML, JSON, etc. over the network.
- **HTTP:** Requests (e.g. GET, POST) and responses (status codes, body).
- **API:** A way for a client to request or send **data** (often JSON) instead of a full HTML page.
- **API keys:** Why we use them (auth, usage limits). “We’ll see them in `.env`.”

Keep it conceptual; no code yet. Use a simple diagram (browser → server → external APIs) if helpful.

---

### Phase 2: Run & play (20 min)

**Goal:** Use the app and see Weather + Maps in action.

- **Start the game:** Pick a location on the map, then “Start Building.”
- **Play:** Place roads, houses, cafes, offices. Mention WASD for movement.
- **Weather:** Point out weather in the UI; say it comes from a **Weather API**.
- **Map:** “The map is the **Google Maps API**. We’ll look at how the app talks to these.”

Participants should leave this block comfortable with *using* the app, not yet implementing APIs.

---

### Phase 3: Where are the APIs? (25 min)

**Goal:** Find and understand API usage in the codebase.

- **Environment variables:** Open `.env`. Explain `OPENWEATHERMAP_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY`. “Keys stay here, not in code.”
- **Weather API:**
  - Open `src/services/weatherService.js`.
  - Find `fetch(...)` and `response.json()`. Explain: “We **GET** data from our server, which calls OpenWeatherMap.”
- **Maps API:**
  - Open `src/components/WorldMap.jsx`.
  - Show where the map is created and how clicks (lat/lng) are used.
- **Quick demo:** Change location on the map, refresh weather, show it updates.

**Checkpoint:** “We’ve seen GET requests, API keys, and env vars in a real app.”

---

### Phase 4: Our backend API (25 min)

**Goal:** Understand our server’s API and GET vs POST.

- **Our server:** `npm run dev` runs both frontend and backend. Backend = Express in `server/index.js`.
- **Capabilities:** `GET /api/capabilities` — “What’s enabled?” (weather, etc.).
- **Leaderboard:** `GET /api/leaderboard` — we **fetch** scores.
- **Publish score:** When we “Publish” in the app, we **POST** to the server.
- **Code:** In `src/services/serverService.js`, show a GET and a POST (e.g. `fetchLeaderboard`, `publishScore`). Highlight `method: 'POST'`, `headers`, `body: JSON.stringify(...)`.
- **Try it:** Publish a score, then look at the leaderboard.

**Checkpoint:** “We’ve used GET to read and POST to create/update. That’s the core of many APIs.”

---

### Phase 5: CRUD with MockAPI (optional, 25 min)

**Goal:** Map CRUD to HTTP methods using Cloud Saves.

- **CRUD:** Create, Read, Update, Delete. “We’ll see each as an HTTP method.”
- **MockAPI:** External service that gives us a fake REST API. We use it for **city saves**.
- **ENDPOINTS.md:** Walk through the table:
  - **Create** → `POST /citysaves`
  - **Read** → `GET /citysaves` (list), `GET /citysaves/:id` (one)
  - **Update** → `PUT /citysaves/:id`
  - **Delete** → `DELETE /citysaves/:id`
- **App:** Open Cloud Saves (cloud icon). Save a city (Create), load (Read), update (Update), delete (Delete).
- **Code:** In `src/services/savesApiService.js`, point out `createSave`, `listSaves`, `getSave`, `updateSave`, `deleteSave` and their HTTP methods.

**Checkpoint:** “We’ve seen all four CRUD operations as REST endpoints.”

*Skip this phase if you’re short on time or MockAPI isn’t set up.*

---

### Phase 6: Workshop Mode - Interactive Session (optional, 15 min)

**Goal:** Demonstrate real-time communication with WebSockets.

- **What is Workshop Mode?** Speaker controls city, participants vote on what to build.
- **Setup:** Speaker creates room → Shares code → Participants join.
- **Demonstrate:**
  - Start a vote → Participants vote → See votes aggregate in real-time
  - Apply winning action → All participants see update instantly
- **Teaching point:** "This is WebSockets - real-time communication without page refresh!"
- **Code:** Show Socket.IO events in `src/components/WorkshopPanel.jsx` and `server/index.js`.
- **Deployment note:** For remote workshops, server must be deployed (see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)).

**Checkpoint:** "We've seen WebSockets for real-time communication - that's how modern apps stay in sync!"

*Skip if short on time or if running in-person without deployment.*

---

### Phase 7: Wrap-up & next steps (10 min)

- **Recap:** Web (client/server), HTTP, APIs, GET/POST (and optionally CRUD), env vars, API keys.
- **What we used:** Weather API, Maps API, our backend, optional MockAPI.
- **Next steps:**  
  - Try changing something small (e.g. copy in `weatherService.js`).  
  - Read [WORKSHOP_MILESTONES.md](./WORKSHOP_MILESTONES.md) for more tasks.  
  - Add MockAPI CRUD if you skipped it.
- **Q&A.**

---

## 5. Timing at a glance

| Block | Duration | Cumulative |
|-------|----------|------------|
| Intro & setup | 10 min | 0:10 |
| Web & APIs 101 | 15 min | 0:25 |
| Run & play | 20 min | 0:45 |
| **Break** | **10 min** | **0:55** |
| Where are the APIs? | 25 min | 1:20 |
| Our backend API | 25 min | 1:45 |
| CRUD (optional) | 25 min | 2:10 |
| Workshop Mode (optional) | 15 min | 2:25 |
| Wrap-up | 10 min | 2:35 |

**Timing options:**
- **Core (Phases 0-4, 7):** ~1 h 35 min + break → **~2 h**
- **With CRUD (Phases 0-5, 7):** ~2 h + break → **~2.5 h**
- **Full (all phases):** ~2 h 35 min + break → **~3 h**

---

## 6. Tips for facilitators

- **Do setup checks early.** Fix `.env`, keys, and `npm run dev` before Phase 1.
- **Keep “Web & APIs 101” short.** We reinforce ideas when we look at code.
- **Prioritize “Run & play” and “Where are the APIs?”** — that’s where “intro to web and APIs” clicks.
- **Use the “Setup required” screen.** It tells participants exactly what’s missing.
- **If behind schedule:** Shorten Phase 1 or 2, or drop CRUD (Phase 5).
- **If ahead:** Add a short “change one thing” task (e.g. modify a `console.log` or a copy string, then reload).

---

## 7. Troubleshooting

| Issue | What to check |
|-------|----------------|
| “Setup required” / “Server not running” | `npm run dev` running? Both client and server start. |
| “OpenWeatherMap API key not configured” | `OPENWEATHERMAP_API_KEY` in `.env`, no typos, key activated. |
| “Google Maps API key not configured” | `VITE_GOOGLE_MAPS_API_KEY` in `.env`, Maps JavaScript API enabled. |
| “Invalid API key” | New keys can take 5–15 min to activate. Restart dev server after adding keys. |
| Port already in use | Change `PORT` / `SERVER_PORT` in `.env` or stop the other process. |
| Cloud Saves / MockAPI not working | `VITE_MOCKAPI_BASE_URL` set? Resource `citysaves` created? See [ENDPOINTS.md](./ENDPOINTS.md). |

---

## 8. Summary

- **Prerequisites:** Node.js v18+, npm, code editor, terminal; basic JS helpful.
- **Installation:** Clone/download → `npm install` → `cp env.example .env` → add Weather + Maps keys → `npm run dev` → verify in browser.
- **Flow:** Intro → Web & APIs 101 → Play → Trace APIs → Backend GET/POST → Optional CRUD → Optional Workshop Mode → Wrap-up.
- **Duration:** 2–3 hours with break, depending on optional sections.

This structure ensures the workshop delivers an **introduction to web and APIs** that is practical and achievable in 2.5–3 hours.
