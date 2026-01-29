# 🎓 IsoTown: Comprehensive Feature Guide

This document explains **every feature** in IsoTown, how it works, and why it's included in the workshop.

---

## 📋 Table of Contents

1. [Day & Time System](#day--time-system)
2. [Weather System](#weather-system)
3. [Season System](#season-system)
4. [Google Maps API](#google-maps-api)
5. [OpenWeatherMap API](#openweathermap-api)
6. [Gemini AI Integration](#gemini-ai-integration)
7. [Workshop Mode](#workshop-mode)
8. [CRUD API Endpoints](#crud-api-endpoints)
9. [Pause Button](#pause-button)
10. [Custom Cursors](#custom-cursors)
11. [Character System](#character-system)

---

## 🕐 Day & Time System

### What It Is
A **simulated game clock** that advances based on game ticks, not real-world time.

### How It Works
- **Every 5 seconds** = 1 game tick
- **Day** = `floor(tickCount / 12) + 1` (12 ticks = 1 day)
- **Time of Day** = Cycles from 6:00 AM → 6:00 AM in 2-hour steps
  - Tick 0: 6:00 AM
  - Tick 1: 8:00 AM
  - Tick 2: 10:00 AM
  - ... up to Tick 11: 4:00 AM (next day)

### Why It's Simulated (Not Real-Time)
1. **Workshop-Friendly**: Participants can see time advance quickly during demos
2. **Game Feel**: Creates a sense of progression and urgency
3. **Teaching Moment**: Shows the difference between real-world APIs (weather) vs simulated game mechanics
4. **No Dependency**: Works without any external API

### Where You See It
- **Top Status Bar**: "Day 1 · 6:00 AM"
- Updates automatically every 5 seconds when the game is running

### Purpose in Workshop
- Demonstrates **state management** (tickCount in cityState)
- Shows **useEffect** for periodic updates
- Teaches **derived state** (calculating day/hour from tickCount)

---

## 🌤️ Weather System

### What It Is
**Real-time weather data** from OpenWeatherMap API, affecting gameplay.

### How It Works
1. **Backend Proxy**: Frontend calls `/api/weather?lat=X&lon=Y`
2. **Backend Calls OpenWeatherMap**: Server uses `OPENWEATHERMAP_API_KEY` to fetch real weather
3. **Mapping**: Weather data → Game conditions:
   - Precipitation > 0 → `RAIN`
   - Wind Speed > 20 km/h → `WIND`
   - Temperature > 32°C → `HEAT`
   - Otherwise → `CLEAR`
4. **Caching**: 5-minute cache (memory + localStorage) to avoid API rate limits

### Weather Conditions & Effects

| Condition | Visual Effect | Gameplay Effect |
|-----------|---------------|-----------------|
| **RAIN** | Diagonal rain streaks (blue) | Cafes need roads to function |
| **WIND** | No visual overlay | Offices affected (lower efficiency) |
| **HEAT** | No visual overlay | Need cafes for happiness |
| **CLEAR** | No overlay | Optimal conditions |

### Fallback Behavior
- If API fails → Falls back to `CLEAR` (so workshop can continue)
- Shows "(fallback)" in console logs

### Purpose in Workshop
- **API Integration**: Learn how to call external APIs
- **Error Handling**: Fallback when API fails
- **Caching Strategy**: Reduce API calls with 5-minute cache
- **Environment Variables**: API keys stored in `.env`

---

## 🍂 Season System

### What It Is
**Real-world seasons** calculated from **latitude + current date** (no mock data).

### How It Works
1. **Get Location**: From Google Maps picker (or default: Kuala Lumpur)
2. **Get Current Month**: Real-world date (0-11, Jan=0, Dec=11)
3. **Calculate Season**:
   - **Northern Hemisphere** (lat ≥ 0):
     - Mar-May → `SPRING`
     - Jun-Aug → `SUMMER`
     - Sep-Nov → `FALL`
     - Dec-Feb → `WINTER`
   - **Southern Hemisphere** (lat < 0):
     - Opposite seasons (Dec-Feb → `SUMMER`)

### Visual Effects

| Season | Land Color | Canvas Background | Special Effect |
|--------|------------|-------------------|----------------|
| **SPRING** | Green (#4a7c59) | Green gradient | None |
| **SUMMER** | Bright green (#5a9c69) | Bright green | None |
| **FALL** | Golden brown (#8b6914) | Golden gradient | None |
| **WINTER** | Snow white (#d4dce4) | White/light blue | **Snow particles** falling |

### Why It's Real (Not Mock)
- **Teaching Moment**: Shows how real-world data (location + date) affects the game
- **Accuracy**: Participants can verify by changing location and seeing season change
- **No API Needed**: Pure calculation (latitude + month)

### Purpose in Workshop
- **Data Transformation**: Converting real-world data (lat/date) → game state
- **Conditional Rendering**: Different visuals per season
- **Canvas Rendering**: Drawing seasonal colors and effects

---

## 🗺️ Google Maps API

### What It Is
Interactive map picker to **select a location** on Earth for your city.

### How It Works
1. **User Clicks "Explore Earth"**: Opens Google Maps overlay
2. **User Picks Location**: Click anywhere on map
3. **Save Location**: Stores `{lat, lon, label}` in localStorage
4. **Use Location For**:
   - Weather API calls (real weather for that location)
   - Season calculation (latitude determines hemisphere)
   - Display in UI ("Kuala Lumpur" badge)

### Why It's Required
- **Central Feature**: Location drives weather + season
- **Real-World Integration**: Participants learn Google Maps JavaScript API
- **API Key Management**: Teaches how to secure API keys in frontend

### Setup
1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Maps JavaScript API"
3. Add to `.env`: `VITE_GOOGLE_MAPS_API_KEY=your_key`

### Purpose in Workshop
- **Third-Party API**: Learn Google Maps integration
- **User Input**: Map picker as form of user interaction
- **State Persistence**: Saving location to localStorage

---

## 🌡️ OpenWeatherMap API

### What It Is
**Real-time weather data** API used to determine game weather conditions.

### How It Works
1. **Backend Endpoint**: `/api/weather?lat=X&lon=Y`
2. **Backend Calls OpenWeatherMap**: Uses `OPENWEATHERMAP_API_KEY`
3. **Returns**: Temperature, wind speed, precipitation, description
4. **Frontend Maps**: Weather data → Game condition (RAIN/WIND/HEAT/CLEAR)

### Why It's Required
- **Workshop Requirement**: Participants must obtain API keys
- **Real Data**: No mock data - uses actual weather
- **Error Handling**: Teaches fallback when API fails

### Setup
1. Sign up at [openweathermap.org/api](https://openweathermap.org/api) (free tier)
2. Get API key from "API Keys" tab
3. Add to `.env`: `OPENWEATHERMAP_API_KEY=your_key`
4. **Note**: New keys may take a few minutes to activate

### Purpose in Workshop
- **API Authentication**: Using API keys
- **Backend Proxy**: Why we don't call APIs directly from frontend
- **Error Handling**: Graceful fallback when API unavailable

---

## 🤖 Gemini AI Integration

### What It Is
**AI-generated town newspaper** using Google's Gemini API.

### How It Works
1. **Auto-Trigger**: Automatically generates report when:
   - Happiness < 5 (after 3+ ticks)
   - Coins < 3 (after 5+ ticks)
   - Every 20 ticks (milestone)
   - Max once per 2 minutes
2. **Manual Trigger**: Click "Town Gazette" button
3. **Backend Call**: `/api/mayor-report` → Calls Gemini API
4. **Response Format**:
   ```
   HEADLINE: [Funny headline about town]
   CITIZEN: "[Quote from pixel resident]"
   TIP: [Actionable building suggestion]
   ```
5. **Auto-Opens Panel**: When auto-triggered, panel opens automatically

### Why It's Optional
- **Advanced Feature**: Shows AI integration without blocking workshop
- **API Key Required**: Participants can skip if they don't want to get Gemini key
- **Teaching Moment**: Demonstrates AI APIs in real applications

### Setup
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key`
3. Restart server

### Purpose in Workshop
- **AI Integration**: Using AI APIs in games/apps
- **Auto-Features**: Triggering actions based on game state
- **User Experience**: Proactive suggestions vs manual requests

---

## 👥 Workshop Mode

### What It Is
**Interactive speaker-led session** where participants vote on what to build.

### How It Works

#### Host Flow (Speaker)
1. Click "Workshop Mode" button
2. Create/join room (e.g., "WORKSHOP-ABC1")
3. Share room code with participants
4. Start voting round (30 seconds)
5. See votes accumulate in real-time
6. Apply winning action → City updates
7. All participants see update instantly

#### Participant Flow (Audience)
1. Open Workshop Mode panel
2. Enter room code from host
3. Select "Audience Mode"
4. Join room → See host's city in real-time
5. When vote starts, click to vote (HOUSE/CAFE/OFFICE/ROAD/ERASE)
6. See vote counts update live
7. See city update when host applies action

### Technical Details
- **WebSocket (Socket.IO)**: Real-time communication
- **Room-Based**: Each workshop = one room
- **Vote Aggregation**: Server counts votes, returns winner
- **State Sync**: Host's city state broadcast to all participants

### Deployment Requirements
- **In-Person Workshop**: ❌ No deployment needed (use local server)
- **Online/Remote Workshop**: ✅ Must deploy backend (Render, Railway, etc.)

### Purpose in Workshop
- **Real-Time Communication**: WebSockets vs HTTP
- **Collaborative Learning**: Participants see their votes affect shared city
- **Backend APIs**: Vote aggregation, state synchronization

### Comparison: Solo vs Workshop Mode

| Aspect | Solo Mode | Workshop Mode |
|--------|-----------|---------------|
| **Control** | You control everything | Host controls, you vote |
| **City State** | Your own city | Shared city (host's) |
| **Updates** | Instant (local) | Real-time (WebSocket) |
| **Learning** | Individual exploration | Collaborative learning |
| **APIs Used** | Weather, Maps, Gemini | + WebSocket, Vote aggregation |

---

## 💾 CRUD API Endpoints

### What It Is
**REST API** for saving/loading city states to cloud (using MockAPI.io).

### Endpoints

| CRUD | Method | Endpoint | Description |
|------|--------|----------|-------------|
| **Create** | `POST` | `/citysaves` | Save new city |
| **Read** | `GET` | `/citysaves` | List all saves |
| **Read** | `GET` | `/citysaves/:id` | Get one save |
| **Update** | `PUT` | `/citysaves/:id` | Update existing save |
| **Delete** | `DELETE` | `/citysaves/:id` | Delete save |

### Setup
1. Create project at [mockapi.io](https://mockapi.io)
2. Create resource `citysaves` with fields: `name`, `zoneLabel`, `zoneLat`, `zoneLon`, `snapshot`
3. Add to `.env`: `VITE_MOCKAPI_BASE_URL=https://your-project.mockapi.io/api/v1`

### Purpose in Workshop
- **CRUD Concepts**: Create, Read, Update, Delete
- **REST API**: HTTP methods (POST, GET, PUT, DELETE)
- **Cloud Persistence**: Saving data to external service

See [ENDPOINTS.md](./ENDPOINTS.md) for full API documentation.

---

## ⏸️ Pause Button

### What It Is
**Pauses the game simulation** (stops tick processing).

### How It Works
- **Click Pause**: `isPaused = true` → Tick loop stops
- **Click Resume**: `isPaused = false` → Tick loop resumes
- **Visual Indicator**: Button icon changes (⏸️ → ▶️)

### What Gets Paused
- ✅ Tick simulation (coins, population, happiness updates)
- ✅ Auto-triggered Gemini reports
- ❌ Character movement (still works)
- ❌ Building placement (still works)
- ❌ Manual actions (still work)

### Purpose in Workshop
- **State Management**: Boolean flag controlling game loop
- **User Control**: Giving players control over game pace
- **Teaching Moment**: Conditional rendering based on state

---

## 🖱️ Custom Cursors

### What It Is
**Different cursor icons** for each building tool.

### How It Works
- **ROAD**: Road icon cursor
- **HOUSE**: House icon cursor
- **CAFE**: Shop icon cursor
- **OFFICE**: Building icon cursor
- **ERASE**: Not-allowed cursor (🚫)
- **Default**: Normal pointer

### Implementation
- CSS `cursor` property with SVG data URLs
- Applied via `.tool-{TOOL_NAME}` class on canvas

### Purpose in Workshop
- **User Feedback**: Visual indication of selected tool
- **CSS Customization**: Custom cursor implementation
- **UX Polish**: Small details that improve experience

---

## 👤 Character System

### What It Is
**Pixel art characters** that walk around the city.

### How It Works
1. **Player Character**: Controlled with WASD keys
2. **NPCs**: Auto-walk randomly (one per population)
3. **Speech Bubbles**: Characters say things based on game state
4. **Variants**: Different sprite variants for variety

### Character Types
- **Player**: You (controlled with WASD)
- **NPCs**: One per population (auto-walk)

### Speech System
- Characters say things based on:
  - Happiness level
  - Weather conditions
  - Building types nearby
  - Random variety

### Purpose in Workshop
- **Canvas Animation**: Drawing sprites on canvas
- **State-Driven UI**: Speech based on game state
- **User Interaction**: Keyboard controls (WASD)

---

## 🎯 Complete Feature Checklist

### Core Gameplay
- ✅ 12x12 isometric grid
- ✅ 4 building types (Road, House, Cafe, Office)
- ✅ Click-to-place mechanics
- ✅ Tick simulation (coins, population, jobs, happiness)
- ✅ LocalStorage save/load
- ✅ Export to JSON
- ✅ Export to Image

### API Integrations
- ✅ Google Maps API (location picker)
- ✅ OpenWeatherMap API (weather data)
- ✅ Gemini API (AI reports)
- ✅ MockAPI.io (CRUD cloud saves)

### Real-Time Features
- ✅ Workshop Mode (WebSocket voting)
- ✅ Real-time state sync
- ✅ Vote aggregation

### Visual Features
- ✅ 4 seasons (real-world based)
- ✅ Weather effects (rain, snow)
- ✅ Custom cursors
- ✅ Character system with speech bubbles
- ✅ Stardew Valley style UI

### Educational Features
- ✅ Setup screen (teaches API keys)
- ✅ Error handling (fallbacks)
- ✅ Comprehensive documentation

---

## 📚 Additional Documentation

- **[README.md](./README.md)** - Installation & quick start
- **[WORKSHOP_CONDUCT.md](./WORKSHOP_CONDUCT.md)** - How to run the workshop
- **[API_PURPOSES.md](./API_PURPOSES.md)** - Why each API is included
- **[ENDPOINTS.md](./ENDPOINTS.md)** - CRUD API documentation
- **[WORKSHOP_MODE_GUIDE.md](./WORKSHOP_MODE_GUIDE.md)** - Workshop Mode setup
- **[HOW_APIS_AND_DATA_WORK.md](./HOW_APIS_AND_DATA_WORK.md)** - Data flow explanation

---

**🎓 Happy Building!**
