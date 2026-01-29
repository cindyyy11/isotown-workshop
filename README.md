# 🏙️ IsoTown: Pixel Village Builder

![Workshop Banner](https://img.shields.io/badge/Workshop-React%20%2B%20APIs-00d9ff?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite)

**Build Your Pixel Village** — A hands-on workshop teaching React fundamentals, Canvas rendering, and API integration through an isometric city builder.

## Workshop Starter Overview

**⚠️ IMPORTANT: This workshop requires API keys to work!**

The app will NOT work until you obtain and configure your API keys. This is intentional — you'll learn how real-world applications integrate with external services.

### Required API Keys:
| API | Purpose | Get It At |
|-----|---------|-----------|
| **OpenWeatherMap** | Real-time weather data | [openweathermap.org/api](https://openweathermap.org/api) |
| **Google Maps** | Interactive map picker | [console.cloud.google.com](https://console.cloud.google.com) |

### Optional API Keys:
| API | Purpose | Get It At |
|-----|---------|-----------|
| **Gemini** | AI-generated mayor reports | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **MockAPI.io** | CRUD API for Save/Load/Update/Delete city saves | [mockapi.io](https://mockapi.io) |

### What You'll Learn:
- **API Keys** — How to obtain and securely store credentials
- **Environment Variables** — The `.env` file pattern used in production apps
- **Client-Server Architecture** — Frontend talks to backend, backend talks to APIs
- **Third-Party API Integration** — Working with OpenWeatherMap and Google Maps

✨ **Stardew Valley Style UI** — Featuring rustic wooden panels and cozy pixel art aesthetic!

## 🎯 What You'll Build

A fully functional isometric pixel village builder featuring:

- **12x12 isometric grid** rendered on HTML Canvas
- **4 building types**: Roads, Houses, Cafes, Offices
- **Click-to-place** mechanics with hover highlights
- **Real-time weather integration** affecting gameplay
- **Tick simulation** generating income every 5 seconds
- **LocalStorage persistence** for save/load
- **Export to JSON** functionality
- **CRUD REST API** — Optional cloud saves via [MockAPI.io](https://mockapi.io) (Create, Read, Update, Delete); see [ENDPOINTS.md](./ENDPOINTS.md)

## 🎓 Learning Outcomes

By completing this workshop, you'll learn:

- React hooks (`useState`, `useEffect`, `useRef`)
- HTML Canvas rendering and isometric projection
- Mouse event handling and coordinate transformation
- State management and persistence
- API integration and caching strategies
- Tick-based game simulation
- File export functionality

---


---

## 📋 Prerequisites

| Requirement | Details |
|-------------|---------|
| **Node.js** | v18+ LTS recommended — [Download](https://nodejs.org/) |
| **npm** | Bundled with Node — check with `npm -v` |
| **Code editor** | VS Code, Cursor, etc. |
| **Terminal** | To run `npm` commands from the project folder |
| **Browser** | Chrome, Edge, or Firefox |

**Helpful but not required:** Basic JavaScript (variables, functions, arrays), and a rough idea of what "client" and "server" mean.

## 🚀 Quick Start (Installation)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File (REQUIRED)

**Why?** Environment variables teach you how real apps manage configuration, API keys, and different environments (dev vs production).

Copy the example file to create your `.env`:

```bash
# On Mac/Linux:
cp env.example .env

# On Windows (PowerShell):
Copy-Item env.example .env

# On Windows (Command Prompt):
copy env.example .env
```

That's it! The default values work for local development.

**📄 Open `env.example` to see detailed comments explaining each variable.**

**What each variable does:**

| Variable | Purpose |
|----------|---------|
| `PORT` | Which port the frontend runs on |
| `SERVER_PORT` | Which port the backend runs on |
| `VITE_API_BASE_URL` | Where the frontend finds the backend |
| `VITE_GOOGLE_MAPS_API_KEY` | Enables Google Maps zone picker |
| `VITE_MOCKAPI_BASE_URL` | MockAPI base URL for CRUD cloud saves (see [ENDPOINTS.md](./ENDPOINTS.md)) |
| `CORS_ORIGIN` | Which websites can call our backend API |
| `GEMINI_API_KEY` | Enables AI-generated mayor reports |

### 3. Run Development Server

```bash
npm run dev
```

This starts both:
- **Client**: http://localhost:5175
- **Server**: http://localhost:5176

### 4. Test Your Setup

Open a new terminal and test the server:

```bash
# Health check
curl http://localhost:5176/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

```bash
# Check what features are enabled
curl http://localhost:5176/server/capabilities
```

Should return:
```json
{"server":true,"proxy":true,"leaderboard":true,"voting":true,"gemini":false}
```

**Note:** `gemini: false` is normal if you haven't added a `GEMINI_API_KEY`.

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
api-questline-workshop/
├── server/
│   ├── index.js              # Express + Socket.IO + SQLite backend
│   └── data/                 # SQLite database (auto-created)
│       └── isotown.db
├── src/
│   ├── components/
│   │   ├── IsometricCanvas.jsx   # Canvas renderer
│   │   ├── Toolbar.jsx           # Building selection
│   │   ├── StatsPanel.jsx        # Stats display
│   │   ├── ControlPanel.jsx      # Save/load/export
│   │   ├── WeatherConfig.jsx     # Location config
│   │   ├── LeaderboardPanel.jsx  # Leaderboard UI
│   │   ├── MayorReportPanel.jsx  # Gemini report UI
│   │   ├── WorkshopPanel.jsx     # Voting host/audience
│   │   └── EventLog.jsx          # Event log UI
│   ├── services/
│   │   ├── isometricRenderer.js  # Isometric math & drawing
│   │   ├── cityService.js        # Game logic & simulation
│   │   ├── weatherService.js     # Weather API + cache
│   │   ├── serverService.js      # Backend communication
│   │   └── characterService.js   # Walking characters
│   ├── data/
│   │   └── buildingData.js       # Building definitions
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Stardew Valley theme
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Environment Variables

### Why Use Environment Variables?

Environment variables are how real-world apps manage:
- **Configuration** - ports, URLs, feature flags
- **Secrets** - API keys that shouldn't be in code
- **Environments** - different settings for dev vs production

**Learning to use `.env` files is an essential skill for any developer!**

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Vite dev server port (default: 5175) |
| `SERVER_PORT` | Yes | Express server port (default: 5176) |
| `VITE_API_BASE_URL` | No | Backend URL (leave empty for local) |
| `VITE_GOOGLE_MAPS_API_KEY` | No | Enables Google Maps zone picker |
| `CORS_ORIGIN` | Yes | Which websites can call our API |
| `GEMINI_API_KEY` | No | Enables AI mayor reports |

### How Vite Uses Environment Variables

Vite has special rules for env vars:
- Variables prefixed with `VITE_` are exposed to the browser
- Variables without `VITE_` are server-only (for security)

```javascript
// In your React code:
const apiUrl = import.meta.env.VITE_API_BASE_URL;  // ✅ Works
const secret = import.meta.env.GEMINI_API_KEY;     // ❌ undefined (not exposed)
```

This is why `GEMINI_API_KEY` stays on the server - it's a secret!

### Getting API Keys (Optional)

Want to enable all features? Get these keys:

1. **Google Maps API Key** (for map zone picker)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a project → Enable Maps JavaScript API
   - Create credentials → API Key
   - Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY=your_key`

2. **Gemini API Key** (for AI mayor reports)
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Add to `.env` as `GEMINI_API_KEY=your_key`

**Note:** Both are optional. The workshop works fully without them!

## How The System Works

### Client (React + Vite)
- Renders the isometric city builder on Canvas
- Uses localStorage to persist city state and zone selection
- Weather fetch flow:
  1. Try server proxy (`/api/weather`)
  2. Fallback to direct Open-Meteo
  3. Final fallback to CLEAR condition
- Optional panels are hidden or show "Not enabled" when server/keys missing

### Server (Express + Socket.IO + SQLite)
- Weather proxy for consistent responses
- SQLite leaderboard with CRUD and score formula:
  ```
  score = coins + population*2 + jobs*3 + happiness
  ```
- Socket.IO rooms for realtime voting
- Gemini report (only if `GEMINI_API_KEY` is set)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/capabilities` | GET | Server feature flags |
| `/api/weather` | GET | Weather proxy |
| `/api/score` | POST | Submit score |
| `/api/leaderboard` | GET | Get top 20 scores |
| `/api/city` | POST | Create city |
| `/api/city/:id` | GET | Get city |
| `/api/city/:id` | PUT | Update city |
| `/api/city/:id` | DELETE | Delete city |
| `/api/mayor-report` | POST | Gemini mayor report |

## Deployment (Cloud Run + Firebase Hosting)

This is the recommended deployment setup using Google Cloud:

```
┌─────────────────────────┐          ┌─────────────────────────┐
│   Firebase Hosting      │          │      Cloud Run          │
│   (Frontend - React)    │  ────►   │      (Backend - Node)   │
│                         │          │                         │
│   VITE_API_BASE_URL     │          │   OPENWEATHERMAP_API_KEY│
│   = Cloud Run URL       │          │   CORS_ORIGIN           │
└─────────────────────────┘          └─────────────────────────┘
```

### Backend: Deploy to Cloud Run

#### Step 1: Install Google Cloud CLI

```bash
# Download from https://cloud.google.com/sdk/docs/install
gcloud init
gcloud auth login
```

#### Step 2: Create a Project

```bash
gcloud projects create isotown-workshop --name="IsoTown Workshop"
gcloud config set project isotown-workshop
```

#### Step 3: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### Step 4: Deploy to Cloud Run

```bash
# From project root
gcloud run deploy isotown-server \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "OPENWEATHERMAP_API_KEY=your_key,CORS_ORIGIN=*"
```

#### Step 5: Test Deployment

```bash
# Get your Cloud Run URL
gcloud run services describe isotown-server --region asia-southeast1 --format 'value(status.url)'

# Test health check
curl https://isotown-server-xxxxx-as.a.run.app/health
```

### Frontend: Deploy to Firebase Hosting

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Firebase

```bash
firebase init hosting
# Select: Create a new project (or use existing)
# Public directory: dist
# Single-page app: Yes
# GitHub deploys: No (or Yes if you want CI/CD)
```

#### Step 3: Build and Deploy

```bash
# Set your Cloud Run URL
echo "VITE_API_BASE_URL=https://isotown-server-xxxxx-as.a.run.app" > .env.production

# Build the frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Environment Variables Summary

| Service | Variable | Value |
|---------|----------|-------|
| **Cloud Run** | `OPENWEATHERMAP_API_KEY` | Your OpenWeatherMap key |
| **Cloud Run** | `CORS_ORIGIN` | Firebase Hosting URL (or `*`) |
| **Cloud Run** | `GEMINI_API_KEY` | (optional) Gemini key |
| **Firebase/Local** | `VITE_API_BASE_URL` | Cloud Run URL |
| **Firebase/Local** | `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps key |

### Alternative: Deploy to Render

If you prefer Render over Cloud Run:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `OPENWEATHERMAP_API_KEY`
   - `CORS_ORIGIN`
   - `GEMINI_API_KEY` (optional)

**Note:** Render automatically sets `PORT`.

### Note on Database Persistence

Both Cloud Run and Render free tiers may not persist disk reliably. The SQLite database may reset on redeploy. For workshop demos this is acceptable. For production, consider:
- Cloud SQL (Google Cloud)
- PlanetScale
- Supabase

## CORS Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causes:**
1. `CORS_ORIGIN` not set or incorrect
2. Frontend origin not in allowed list
3. Missing protocol (http vs https)

**Solutions:**

1. **Quick fix (testing only):**
   ```
   CORS_ORIGIN=*
   ```

2. **Production (recommended):**
   ```
   CORS_ORIGIN=https://your-frontend.com,http://localhost:5175
   ```

3. **Check your frontend origin:**
   - Include protocol: `https://` or `http://`
   - Include port if non-standard: `:5175`
   - No trailing slash

4. **Restart server after changing env vars**

### Error: "net::ERR_CONNECTION_REFUSED"

**Cause:** Server not running or wrong URL

**Solutions:**
1. Check server is running: `npm run dev:server`
2. Check `VITE_API_BASE_URL` points to correct URL
3. For Render: wait for deploy to complete

## Workshop Milestones

### Milestone 1: Project Setup & Isometric Math
**Time: 30 minutes**

- ✅ Initialize React + Vite project
- ✅ Understand isometric projection
- ✅ Implement `gridToScreen()` and `screenToGrid()` conversion
- ✅ Draw basic isometric tile diamonds

**Key Files:**
- `src/services/isometricRenderer.js`
- `src/data/buildingData.js`

### Milestone 2: Canvas Rendering & Interaction
**Time: 40 minutes**

- ✅ Set up HTML Canvas with React refs
- ✅ Implement mouse hover detection
- ✅ Draw isometric buildings (3D blocks)
- ✅ Handle click events for placement

**Key Files:**
- `src/components/IsometricCanvas.jsx`

### Milestone 3: Building Placement & State Management
**Time: 35 minutes**

- ✅ Implement building placement logic
- ✅ Track grid state (occupied tiles)
- ✅ Validate placement (coins, occupied tiles)
- ✅ Erase tool with 50% refund

**Key Files:**
- `src/services/cityService.js`
- `src/App.jsx`

### Milestone 4: Tick Simulation & Income System
**Time: 35 minutes**

- ✅ Implement 5-second tick interval
- ✅ Calculate income from buildings
- ✅ Check adjacency (roads) and distance (houses)
- ✅ Update stats display

**Income Rules:**
- ☕ **Cafe**: +1 coin if adjacent to road
- 🏢 **Office**: +2 coins if adjacent to road AND house within distance 2

### Milestone 5: Weather API & Modifiers
**Time: 40 minutes**

- ✅ Get OpenWeatherMap API key and add to `.env`
- ✅ Understand client-server API flow
- ✅ Implement 5-minute cache (memory + localStorage)
- ✅ Map weather to game conditions
- ✅ Apply weather modifiers to tick simulation

**Key Files:**
- `src/services/weatherService.js`
- `server/index.js` (weather proxy endpoint)

**API Flow:**
```
Frontend → Backend (/server/weather) → OpenWeatherMap API
```

**Weather Modifiers:**
- 🌧️ **RAIN**: Cafes need roads (already covered by base rules)
- 💨 **WIND**: Offices earn -1 if not adjacent to road
- 🔥 **HEAT**: Happiness -1 per tick unless at least 1 cafe exists

## 🎮 How to Play

### Building Your Village

1. **Select a Tool**: Click a building type in the left toolbar
2. **Place Buildings**: Click tiles on the grid to place
3. **Manage Resources**: Keep an eye on your coins
4. **Earn Income**: Buildings generate coins every 5 seconds
5. **Expand**: Build roads to connect buildings for maximum income

### Building Types

| Building | Cost | Effects | Income |
|----------|------|---------|--------|
| 🛣️ Road | 1 coin | Connectivity | None |
| 🏠 House | 3 coins | +2 Population | None |
| ☕ Cafe | 5 coins | +2 Happiness | +1 coin/tick (needs road) |
| 🏢 Office | 8 coins | +3 Jobs | +2 coins/tick (needs road + house nearby) |

### Strategy Tips

- **Build roads first** to enable building income
- **Place houses near offices** for office income bonus
- **Spread cafes** throughout your village for consistent income
- **Watch the weather** and adapt your strategy

## Weather System

The game fetches real-time weather from Open-Meteo (no API key required):

- **Default Location**: Kuala Lumpur (3.1390, 101.6869)
- **Custom Location**: Click "📍 Change Location" to set coordinates
- **Cache Duration**: 5 minutes (prevents API spam)
- **Fallback**: If fetch fails, defaults to CLEAR condition

**Weather Mapping:**
- Precipitation > 0.1mm → **RAIN** 🌧️
- Wind speed > 20 km/h → **WIND** 💨
- Temperature > 32°C → **HEAT** 🔥
- Otherwise → **CLEAR** ☀️

## 🎨 UI Theme - Stardew Valley Style

IsoTown features a **rustic pixel art aesthetic** inspired by Stardew Valley:

### Design Elements
- **Wooden UI Panels**: Brown borders with cream backgrounds
- **Proper Fonts**: Georgia serif for text, Trebuchet MS for UI
- **3D Depth**: Inset shadows and pressable button effects
- **Earth Tones**: Greens, browns, oranges, and natural colors
- **Pixel-Perfect**: Sharp corners and thick borders (4px)

## Why There Is No frontend/backend Folder

This is a workshop starter focused on simplicity:
- Single repo, one command to run both client and server
- Fewer folders and fewer steps for participants
- Web code lives in `src/` and server code lives in `server/`
- This keeps the workshop flow fast and clear

## 🎓 Extension Ideas

Want to take this further? Try:

1. **More building types** - Parks, factories, shops
2. **Population growth** - Dynamic population based on happiness
3. **Day/night cycle** - Different income rates
4. **Disasters** - Random events affecting buildings
5. **Multiplayer** - Share cities with friends
6. **Achievements** - Track player milestones
7. **Zoom & pan** - Navigate larger grids
8. **Custom tiles** - Import your own pixel art

## 📚 Resources

- [React Documentation](https://react.dev)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Isometric Projection](https://en.wikipedia.org/wiki/Isometric_projection)
- [Open-Meteo API](https://open-meteo.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Render Documentation](https://render.com/docs)

## 📝 License

MIT License - Feel free to use this for learning and teaching!

## 🤝 Contributing

Found a bug? Have a suggestion? Open an issue or PR!

## 🙏 Acknowledgments

- Weather data from [Open-Meteo](https://open-meteo.com/)
- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)
- Inspired by classic city builders like SimCity

---

**Happy Building! May your village prosper and your cafes always be adjacent to roads.** 🏗️✨
