# IsoTown Workshop (Participant Guide)

Build a tiny pixel town while learning **web development + APIs** using a real project:

- **Frontend**: React 18 + Vite
- **Backend**: Node + Express + SQLite
- **APIs**: Google Maps (location), OpenWeatherMap (weather), optional MockAPI (CRUD), optional Gemini (AI)

This repo is designed so you **don’t code from scratch**—you’ll run the project and make small guided changes.

## What you need

- **Node.js**: v18+ (required)
- **Editor**: VS Code / Cursor
- **Browser**: Chrome / Edge
- **Optional**: Postman (recommended for the API section)

## Setup (5–10 minutes)

### 1) Install dependencies

```bash
npm install
```

### 2) Create your `.env`

PowerShell (Windows):

```powershell
Copy-Item env.example .env
```

Mac/Linux:

```bash
cp env.example .env
```

### 3) Add required API keys (in `.env`)

Required:
- **OpenWeatherMap**: set `OPENWEATHERMAP_API_KEY` (get it from [OpenWeatherMap API](https://openweathermap.org/api))
- **Google Maps**: set `VITE_GOOGLE_MAPS_API_KEY` (get it from [Google Cloud Console](https://console.cloud.google.com))

Optional (workshop extensions):
- **MockAPI CRUD**: set `VITE_MOCKAPI_BASE_URL` (get it from [MockAPI.io](https://mockapi.io)) and see `ENDPOINTS.md`
- **Gemini AI**: set `GEMINI_API_KEY` (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 4) Start the app

```bash
npm run dev
```

- **Frontend**: `http://localhost:5175`
- **Backend**: `http://localhost:5176`

### 5) Verify everything works

```bash
curl http://localhost:5176/health
curl http://localhost:5176/api/capabilities
```

In `api/capabilities`, you should see:
- `"server": true`
- `"weather": true` (only true after `OPENWEATHERMAP_API_KEY` is set)

## What we do in the workshop (high level)

- **Demo the app**: pick a location → start building → see weather affect gameplay
- **Understand data flow**: user action → API request → React state update → UI change
- **Debug like a developer**:
  - DevTools **Network** (see `GET /api/weather`)
  - DevTools **Console**
  - backend logs in your terminal
- **Practice REST with Postman** (optional): CRUD using MockAPI 

## Game rules (quick)

The main idea:
- Economy updates every **5 seconds**
- Weather can change income rules (RAIN/WIND/HEAT)
- You can **Pause** to inspect state/APIs without the game changing

## Key files (where to look)

- **App state & flow**: `src/App.jsx`
- **Frontend → backend calls**: `src/services/serverService.js`
- **Weather fetch + caching**: `src/services/weatherService.js` (calls `GET /api/weather`)
- **Game logic (tick / place / erase)**: `src/services/cityService.js`
- **Backend endpoints**: `server/index.js`
- 

## Backend API (the ones you’ll see in DevTools)

- `GET /health`
- `GET /api/capabilities`
- `GET /api/weather?lat=...&lon=...`
- `POST /api/score` and `GET /api/leaderboard` (SQLite)
- `POST /api/mayor-report` (Gemini, optional)

## Troubleshooting (most common)

- **Setup screen says server not running**
  - Keep `npm run dev` running (it starts both client + server).
  - If you started only the frontend, run `npm run dev` from the project root.

- **Weather not configured / 503**
  - Add `OPENWEATHERMAP_API_KEY` to `.env`, then **restart** `npm run dev`.
  - New OpenWeatherMap keys may take **10–30 minutes** to activate.

- **Map is blank**
  - Confirm `VITE_GOOGLE_MAPS_API_KEY` is set, restart the dev server.
  - In Google Cloud, ensure **Maps JavaScript API** is enabled for your key.

- **Ports already in use**
  - Close other dev servers or change `PORT` / `SERVER_PORT` in `.env`.

## Security note (important)

- **Never commit your `.env`** or share API keys in screenshots.
- Anything starting with `VITE_` is exposed to the browser—treat it as public.
