# How Data Is Passed Through IsoTown

This document describes **how data flows** through the app: from external APIs and user actions into React state, then down to components and back up.

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              App.jsx (root)                                  │
│  State: cityState, zone, coordinates, capabilities, mayorReport, etc.        │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
   IsometricCanvas      WorkshopPanel       SavesPanel          WorldMap
   (grid, chars,        (cityState,         (cityState,         (zone,
    season, zone)        onApplyVote,        zone,               onSelectLocation)
                         onReceiveState)     onLoadSave)
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
   cityService          Socket.IO            savesApiService     Google Maps API
   (place, erase,       (server)             (MockAPI CRUD)      (location picker)
    processTick)
         │                    │                    │
         ▼                    ▼                    ▼
   weatherService       serverService        OpenWeatherMap
   (fetchWeather)       (capabilities,       (via /api/weather)
                         mayor-report,
                         leaderboard)
```

**Key idea:** `App` holds all main state. It fetches data via services, updates state, and **passes data down** as props. Children **send data back** via callbacks (`onTileClick`, `onSelectLocation`, `onLoadSave`, etc.).

---

## 2. Central State in `App.jsx`

App keeps these in React state:

| State | Type | Source / purpose |
|-------|------|-------------------|
| `cityState` | `object \| null` | City data: `grid`, `coins`, `population`, `jobs`, `happiness`, `worldCondition`, `worldTemperature`, `characters`, `selectedTool`, etc. |
| `zone` | `{ lat, lon, label }` | Current location (from Google Maps). Used for weather, season, UI label. |
| `coordinates` | `{ lat, lon }` | Same as zone but just coords. Used when calling weather API. |
| `capabilities` | `object` | From `GET /api/capabilities`: `server`, `weather`, `gemini`, etc. |
| `mayorReport` | `object \| null` | Gemini “Town Gazette” response. |
| `leaderboard` | `array` | From `GET /api/leaderboard`. |
| `hasSave` | `boolean` | Whether a save exists in localStorage. |
| `currentSaveId` | `string \| null` | ID of the currently loaded cloud save (MockAPI). |

Data is **passed into** components as props and **updated** via `setCityState`, `setZone`, etc., often in response to callbacks or `useEffect`.

---

## 3. Data In: APIs → App State

### 3.1 Server capabilities

```
App mount
  → getServerCapabilities() [serverService]
  → GET /api/capabilities
  → setCapabilities(data)
```

- **Flow:** `useEffect` on mount → `serverService.getServerCapabilities()` → `setCapabilities`.
- **Used for:** Deciding if weather, Gemini, leaderboard, etc. are available.

### 3.2 Weather (location-based)

```
coordinates (lat, lon)
  → fetchWeather(lat, lon) [weatherService]
  → GET /api/weather?lat=...&lon=...
  → backend calls OpenWeatherMap
  → { condition, temperature, ... }
```

- **Flow:**  
  - **Start game:** `handleStartGame` → `fetchWeather` → `initializeCity(condition, temperature)` → `setCityState`.  
  - **Refresh:** `handleRefreshWeather` → `fetchWeather` → `setCityState` with `worldCondition`, `worldTemperature`, `worldConditionFetchedAt`.  
  - **Change location:** `handleApplyCoordinates` → `fetchWeather` → same state update.  
  - **Init / continue:** `initialize` or `handleRetrySetup` loads saved state, then fetches weather and merges `worldCondition` / `worldTemperature` into it → `setCityState`.

- **Stored in:** `cityState.worldCondition`, `cityState.worldTemperature`.
- **Used for:** Season, weather UI, character clothing, gameplay effects.

### 3.3 Location (Google Maps)

```
User picks on map
  → WorldMap onSelectLocation(lat, lon, label)
  → handleApplyCoordinates(lat, lon, label)
  → setCoordinates({ lat, lon })
  → setZone({ lat, lon, label })
  → localStorage.setItem('isotown_zone_v1', ...)
  → fetchWeather(lat, lon) → update cityState
```

- **Flow:** User selects in `WorldMap` → `onSelectLocation` → `handleApplyCoordinates` → update `coordinates`, `zone`, persist zone, refresh weather.
- **Passed as:** `zone` and `coordinates` from App; `WorldMap` gets `currentZone` and `onSelectLocation`.

### 3.4 Season (derived, not stored)

```
zone.lat + cityState.worldTemperature
  → getSeasonFromLocationAndWeather(lat, temp)
  → 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER'
```

- **Flow:** Computed in `getGameTime()` from `zone?.lat` and `cityState?.worldTemperature`. Uses temp when available (from weather API for that location), else latitude + date.
- **Passed as:** `gameTime.season` → `IsometricCanvas` as `season`, and used for top bar, land color, etc.

### 3.5 CRUD cloud saves (MockAPI)

```
SavesPanel
  → listSaves() / getSave(id) / createSave(payload) / updateSave(id, payload) / deleteSave(id)
  → GET/POST/PUT/DELETE to MockAPI (VITE_MOCKAPI_BASE_URL)
```

- **Flow:**  
  - **List:** `SavesPanel` `loadList` → `listSaves()` → `setSaves`.  
  - **Load:** `handleLoad` → `getSave(id)` → `onLoadSave(save)` → `handleLoadSave` in App → `setCityState(snapshot)`, `setZone`, `setCoordinates`, `setCurrentSaveId`.  
  - **Save:** `handleSave` builds `{ name, zoneLabel, zoneLat, zoneLon, snapshot: cityState }` → `createSave` or `updateSave` → `onCurrentSaveIdChange`.

- **Data passed:** App gives `SavesPanel` `cityState`, `zone`, `currentSaveId`, `onLoadSave`, `onCurrentSaveIdChange`.

### 3.6 Leaderboard & publish score

```
App
  → publishScore(payload) [serverService]  → POST /api/score
  → fetchLeaderboard()                     → GET /api/leaderboard
  → setLeaderboard(data.leaderboard)
```

- **Flow:** Publish uses `cityState` + `zone`; leaderboard is fetched and stored in `leaderboard` state. Shown only when server is available.

### 3.7 Gemini mayor report

```
App
  → requestMayorReport({ stats, worldCondition }) [serverService]
  → POST /api/mayor-report
  → backend calls Gemini API
  → setMayorReport(result)
  → MayorReportPanel receives report, loading
```

- **Flow:** Manual “Generate” or auto-trigger when e.g. low happiness → `requestMayorReport` → `setMayorReport` → `MayorReportPanel` renders it.

---

## 4. Data Down: App → Components

### 4.1 IsometricCanvas

| Prop | Source | Purpose |
|------|--------|---------|
| `grid` | `cityState.grid` | Buildings on the map. |
| `selectedTool` | `cityState.selectedTool` | ROAD / HOUSE / CAFE / OFFICE / ERASE. |
| `onTileClick` | `handleTileClick` | Place or erase building on click. |
| `characters` | `cityState.characters` | Player + NPCs. |
| `onCharactersUpdate` | `(updated) => setCityState(prev => ({ ...prev, characters: updated }))` | Push character updates (movement, etc.) back to App. |
| `cityState` | `cityState` | Full state (e.g. `worldCondition` for speech, weather). |
| `zone` | `zone` | Current location (e.g. label). |
| `season` | `gameTime.season` | From `getSeasonFromLocationAndWeather(zone?.lat, cityState?.worldTemperature)`. |

- **Internal use:**  
  - `worldCondition = cityState?.worldCondition || 'CLEAR'` for weather overlay and character clothing.  
  - `season` for tiles, background, and clothing.  
  - Canvas calls `drawCharacter(..., worldCondition, season)` so clothing matches weather/season.

### 4.2 WorkshopPanel

| Prop | Source | Purpose |
|------|--------|---------|
| `enabled` | `capabilities.available` | Whether workshop server is usable. |
| `cityState` | `cityState` | Host’s city; votes apply to it. |
| `onApplyVote` | `handleApplyVote` | Apply winning vote (place/erase) → updates city. |
| `onReceiveState` | `handleReceiveState` | `(state) => setCityState(state)` when host broadcasts. |
| `onLog` | `handleWorkshopLog` | Optional logging. |

- **Flow:**  
  - Host applies vote → `onApplyVote(voteType)` → `findSuggestedTile` + `placeBuilding` / `eraseBuilding` → `setCityState`.  
  - Socket `state_update` → `onReceiveState(payload.state)` → `setCityState`.  
  So **data is passed** from WorkshopPanel (via callbacks and socket) **into** App state.

### 4.3 SavesPanel

| Prop | Source | Purpose |
|------|--------|---------|
| `isOpen` | `showSavesPanel` | Visibility. |
| `onClose` | `() => setShowSavesPanel(false)` | Close panel. |
| `cityState` | `cityState` | What gets saved in `snapshot`. |
| `zone` | `zone` | `zoneLabel`, `zoneLat`, `zoneLon` in save. |
| `currentSaveId` | `currentSaveId` | Which save we’re updating. |
| `onLoadSave` | `handleLoadSave` | Load a save → `setCityState`, `setZone`, etc. |
| `onCurrentSaveIdChange` | `setCurrentSaveId` | Track loaded save. |

- **Flow:** Load flows **from** MockAPI **into** App via `onLoadSave`. Save flows **from** App (`cityState`, `zone`) **into** MockAPI via `createSave` / `updateSave`.

### 4.4 WorldMap

| Prop | Source | Purpose |
|------|--------|---------|
| `mapsApiKey` | `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` | Google Maps. |
| `currentZone` | `zone` | Current location on map. |
| `onSelectLocation` | `handleApplyCoordinates` | New location chosen. |
| `onClose` | `() => setShowWorldMap(false)` | Close map. |

- **Flow:** User picks location → `onSelectLocation(lat, lon, label)` → `handleApplyCoordinates` → `setZone`, `setCoordinates`, refresh weather. So **data is passed** from WorldMap **into** App state.

### 4.5 MayorReportPanel

| Prop | Source | Purpose |
|------|--------|---------|
| `enabled` | `capabilities.gemini` | Show generate UI or “not enabled”. |
| `report` | `mayorReport` | Gemini response. |
| `loading` | `mayorLoading` | Request in progress. |
| `onGenerate` | `handleMayorReport` | Trigger report. |

- **Flow:** Report is fetched in App → `setMayorReport` → passed **down** as `report`.

---

## 5. Data Back Up: Components → App

| Callback | Component | App handler | Effect |
|----------|-----------|-------------|--------|
| `onTileClick(x, y)` | IsometricCanvas | `handleTileClick` | Place/erase → `placeBuilding` / `eraseBuilding` → `setCityState`. |
| `onCharactersUpdate(updated)` | IsometricCanvas | `setCityState(prev => ({ ...prev, characters: updated }))` | Sync character positions / state. |
| `onSelectLocation(lat, lon, label)` | WorldMap | `handleApplyCoordinates` | Update `zone`, `coordinates`, weather, then `setCityState` with new weather. |
| `onLoadSave(save)` | SavesPanel | `handleLoadSave` | `setCityState(snapshot)`, `setZone`, `setCoordinates`, `setCurrentSaveId`. |
| `onApplyVote(voteType)` | WorkshopPanel | `handleApplyVote` | Place/erase on suggested tile → `setCityState`. |
| `onReceiveState(state)` | WorkshopPanel | `handleReceiveState` | `setCityState(state)` from host. |

So **data is passed** from these components **into** App only through these callbacks (and WorkshopPanel’s socket handler that calls `onReceiveState`).

---

## 6. Persistence

### 6.1 localStorage

- **`isotown_state_v1`**: Full `cityState` (from `cityService.saveCityState`). Updated whenever `cityState` changes (useEffect in App).  
- **`isotown_zone_v1`**: `{ lat, lon, label }`. Set when changing location or loading a cloud save.  
- **Weather cache**: In `weatherService` (memory + localStorage). Key `isotown_weather_cache`, 5‑minute TTL.

### 6.2 Cloud (MockAPI)

- **Written:** `createSave` / `updateSave` send `{ name, zoneLabel, zoneLat, zoneLon, snapshot }`. `snapshot` is `cityState`.  
- **Read:** `listSaves` / `getSave` return saves; `handleLoadSave` applies `snapshot` to `cityState` and `zone` to `zone` / `coordinates`.

---

## 7. Quick Reference: “Where does X come from?”

| Data | Origin | Stored / passed |
|------|--------|------------------|
| **Weather** | OpenWeatherMap via `GET /api/weather` | `cityState.worldCondition`, `cityState.worldTemperature` |
| **Season** | `getSeasonFromLocationAndWeather(zone.lat, cityState.worldTemperature)` | Derived; passed as `season` to canvas |
| **Location** | Google Maps → `onSelectLocation` | `zone`, `coordinates`; also `localStorage` |
| **City grid** | `placeBuilding` / `eraseBuilding` / `processTick` | `cityState.grid` |
| **Characters** | `characterService` (sync, move, WASD) | `cityState.characters`; canvas calls `onCharactersUpdate` |
| **Cloud saves** | MockAPI CRUD | `SavesPanel` ↔ App via `onLoadSave`, `cityState`, `zone` |
| **Workshop state** | Socket.IO `state_update` | `onReceiveState` → `setCityState` |
| **Capabilities** | `GET /api/capabilities` | `capabilities` |
| **Mayor report** | `POST /api/mayor-report` → Gemini | `mayorReport` |

---

## 8. Summary

- **Single source of truth:** App state (`cityState`, `zone`, etc.).  
- **Data in:** APIs (weather, capabilities, leaderboard, Gemini, MockAPI) and user input (map, tiles, workshop, saves) → handlers → `setState`.  
- **Data down:** State → props to `IsometricCanvas`, `WorkshopPanel`, `SavesPanel`, `WorldMap`, `MayorReportPanel`.  
- **Data up:** Components → callbacks (`onTileClick`, `onSelectLocation`, `onLoadSave`, `onApplyVote`, `onReceiveState`, `onCharactersUpdate`) → same handlers → `setState`.

So **data is passed** through React state and props in one direction (down), and through callbacks (and socket) in the other direction (up), with services and APIs as the external sources.
