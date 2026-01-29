# Workshop Quick Start Guide

**Topic:** Introduction to Web and APIs  
**Duration:** 2.5–3 hours  
**Format:** Hands-on, interactive

---

## ✅ Does This Workshop Achieve Its Goals?

**Yes!** This workshop successfully teaches "Introduction to Web and APIs" by:

- ✅ **Web basics:** Client vs server, HTTP requests/responses
- ✅ **API concepts:** GET, POST (and optionally PUT, DELETE)
- ✅ **Real APIs:** Weather, Maps, CRUD (MockAPI), Backend
- ✅ **Environment variables:** API keys, `.env` files
- ✅ **Real-time:** WebSockets (Workshop Mode)
- ✅ **Hands-on:** Participants use APIs in a real app

---

## 📋 Prerequisites

### Required (Technical)

| Requirement | Details | How to Check |
|-------------|---------|--------------|
| **Node.js** | v18+ LTS | `node -v` |
| **npm** | Comes with Node | `npm -v` |
| **Code Editor** | VS Code, Cursor, etc. | — |
| **Terminal** | Command line access | — |
| **Browser** | Chrome, Edge, Firefox | — |

### Helpful (Conceptual)

- **Basic JavaScript:** variables, functions, arrays, objects
- **Basic HTML/CSS:** understanding what a "page" is
- **Curiosity:** interest in how websites work

### NOT Required

- ❌ Prior React experience
- ❌ Prior API experience
- ❌ Git knowledge (unless distributing via Git)

---

## 🚀 Installation Guidelines

### Step 1: Get the Project

**Option A: Download ZIP**
- Download from GitHub
- Extract to a folder

**Option B: Git Clone**
```bash
git clone https://github.com/YOUR_USERNAME/isotown-workshop.git
cd isotown-workshop
```

### Step 2: Install Dependencies

```bash
npm install
```

**Troubleshooting:**
- Ensure Node.js v18+ is installed
- Run from project root (where `package.json` is)
- If errors: delete `node_modules` and `package-lock.json`, then `npm install` again

### Step 3: Create `.env` File

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

### Step 4: Add Required API Keys

Open `.env` in your editor and add:

1. **OpenWeatherMap API Key** (REQUIRED)
   - Sign up: [openweathermap.org/api](https://openweathermap.org/api)
   - Go to "API Keys" tab → Copy your key
   - Add: `OPENWEATHERMAP_API_KEY=your_key_here`

2. **Google Maps API Key** (REQUIRED)
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create project → Enable "Maps JavaScript API"
   - Create credentials → API Key
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`

**Important:** New API keys may take 5–15 minutes to activate. If you see "invalid key," wait and restart the server.

### Step 5: Run the App

```bash
npm run dev
```

This starts:
- **Frontend:** [http://localhost:5175](http://localhost:5175)
- **Backend:** [http://localhost:5176](http://localhost:5176)

### Step 6: Verify Setup

1. Open [http://localhost:5175](http://localhost:5175)
2. Should see IsoTown start screen (not "Setup required" error)
3. Click "Explore Earth & Pick Location" → Map should load
4. Pick a city → "Start Building" → Game should start with weather

**If "Setup required" appears:** The app will tell you what's missing (server not running, keys not set, etc.)

### Step 7: Optional Setup

**MockAPI (for CRUD section):**
- Create project at [mockapi.io](https://mockapi.io)
- Add resource `citysaves` with: `name`, `zoneLabel`, `zoneLat`, `zoneLon`, `snapshot`
- Add to `.env`: `VITE_MOCKAPI_BASE_URL=https://YOUR_PROJECT_ID.mockapi.io/api/v1`

**Gemini (for AI reports):**
- Get key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Add to `.env`: `GEMINI_API_KEY=your_key_here`

**Workshop Mode (for remote workshops):**
- Deploy server to Render (see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md))
- Update `.env`: `VITE_API_BASE_URL=https://your-server.onrender.com`

---

## 📅 Workshop Flow (2.5–3 hours)

### Phase 0: Intro & Setup Check (10 min)

- Welcome and workshop overview
- Verify everyone has app running
- Fix any setup issues together

**Goal:** Everyone ready to learn

---

### Phase 1: Web & APIs 101 (15 min)

**Concepts:**
- Client (browser) vs Server
- HTTP requests (GET, POST)
- What is an API?
- Why API keys?

**No code yet** - just concepts

---

### Phase 2: Run & Play (20 min)

- Use the app
- Pick location on map
- Build city
- See weather in action

**Goal:** Comfortable using the app

---

### Phase 3: Where are the APIs? (25 min)

**Find in code:**
- `.env` file → API keys
- `weatherService.js` → `fetch()` calls
- `WorldMap.jsx` → Maps API usage
- Change location → See weather update

**Goal:** Understand where APIs are called

---

### Phase 4: Our Backend API (25 min)

**Learn:**
- Express server in `server/index.js`
- `GET /api/leaderboard` → Fetch scores
- `POST /api/score` → Publish score
- See GET vs POST in code

**Goal:** Understand GET vs POST

---

### Phase 5: CRUD with MockAPI (optional, 25 min)

**Learn:**
- Create → `POST /citysaves`
- Read → `GET /citysaves`
- Update → `PUT /citysaves/:id`
- Delete → `DELETE /citysaves/:id`

**Goal:** Understand CRUD operations

---

### Phase 6: Workshop Mode (optional, 15 min)

**Learn:**
- Real-time voting with WebSockets
- Socket.IO for instant updates
- Server aggregates votes

**Goal:** Understand real-time communication

*Requires deployed server for remote workshops*

---

### Phase 7: Wrap-up (10 min)

- Recap what we learned
- Q&A
- Next steps

---

## ⏱️ Timing Options

| Version | Phases | Duration |
|--------|--------|----------|
| **Core** | 0-4, 7 | ~2 hours |
| **With CRUD** | 0-5, 7 | ~2.5 hours |
| **Full** | All phases | ~3 hours |

**Break:** 10 minutes (after Phase 2)

---

## 🎯 Learning Outcomes

By the end, participants will:

- ✅ Understand client vs server
- ✅ Know what HTTP GET and POST are
- ✅ Use environment variables and API keys
- ✅ Call real APIs (Weather, Maps, CRUD)
- ✅ Understand WebSockets (if Workshop Mode used)
- ✅ See APIs in a real React app

---

## 📚 Full Documentation

- **[WORKSHOP_CONDUCT.md](./WORKSHOP_CONDUCT.md)** - Complete facilitator guide
- **[WORKSHOP_MODE_GUIDE.md](./WORKSHOP_MODE_GUIDE.md)** - Interactive Workshop Mode
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Deploy for remote workshops
- **[API_PURPOSES.md](./API_PURPOSES.md)** - Why each API is included

---

## ✅ Pre-Workshop Checklist

**For Facilitator:**
- [ ] Test `npm run dev` works
- [ ] Verify API keys work
- [ ] Test Workshop Mode (if using)
- [ ] Deploy server (if remote workshop)
- [ ] Prepare room code (if using Workshop Mode)

**For Participants:**
- [ ] Node.js v18+ installed
- [ ] Project downloaded/cloned
- [ ] `npm install` completed
- [ ] `.env` file created
- [ ] API keys added
- [ ] App runs successfully

---

**Ready to run your workshop!** 🚀
