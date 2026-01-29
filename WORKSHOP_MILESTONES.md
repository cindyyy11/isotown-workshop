# 🎮 Workshop: Build Your First Web Game with APIs

**Duration:** 2-3 hours  
**Goal:** Learn web development by building a pixel city game  
**Main Focus:** Introduction to Web & APIs

---

## 📚 What You'll Learn

1. **React Basics** - Components, state, props
2. **API Calls** - fetch(), async/await, error handling
3. **Real-time Data** - Weather API, Google Maps API
4. **Game Loop** - Tick simulation, animations
5. **Persistence** - localStorage, server sync

---

## 🎯 Workshop Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR JOURNEY                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SETUP] → [M1] → [M2] → [M3] → [M4] → [BONUS]                 │
│     │        │       │       │       │       │                  │
│     │        │       │       │       │       └── AI News!       │
│     │        │       │       │       └── Save to Server         │
│     │        │       │       └── Weather API                    │
│     │        │       └── Google Maps                            │
│     │        └── Canvas & React                                 │
│     └── Install & Configure                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 SETUP (15 min)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Your `.env` File
Copy `env.example` to `.env` and add your API keys:

```env
# REQUIRED - Get from https://openweathermap.org/api
OPENWEATHERMAP_API_KEY=your_key_here

# REQUIRED - Get from https://console.cloud.google.com/
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# OPTIONAL - Get from https://aistudio.google.com/
GEMINI_API_KEY=your_key_here
```

### Step 3: Start the App
```bash
npm run dev
```

### 🎉 Success Check
- Can you see the start screen?
- Can you open the World Map?
- Does weather load for your location?

---

## M1: HELLO WORLD - Canvas & React (30 min)

### 🎯 Goal: Understand how React renders to Canvas

### What You'll Do
1. Explore `src/components/IsometricCanvas.jsx`
2. Understand `gridToScreen()` - how 2D becomes isometric
3. Add a new tile color when hovered
4. Draw your first shape on the canvas

### 🧪 API LESSON: Your First `fetch()` Call

```javascript
// This is how we get weather data!
const response = await fetch('/server/weather?lat=3.14&lon=101.68');
const data = await response.json();
console.log(data.condition); // "RAIN", "WIND", "HEAT", or "CLEAR"
```

### Key Files
- `src/components/IsometricCanvas.jsx` - Canvas rendering
- `src/services/isometricRenderer.js` - Drawing functions
- `src/services/weatherService.js` - Weather API

### ✅ Checkpoint
- [ ] Understand how isometric math works
- [ ] Can explain what `fetch()` does
- [ ] Modified a color or shape on the canvas

---

## M2: BUILD YOUR CITY - Google Maps API (30 min)

### 🎯 Goal: Pick a real location and see it affect your game

### What You'll Do
1. Open the World Map (click "Explore Earth")
2. Click on different cities around the world
3. See how weather changes based on location
4. Understand how Google Maps API works

### 🧪 API LESSON: Google Maps JavaScript API

```javascript
// Initialize a map
const map = new google.maps.Map(element, {
  center: { lat: 3.14, lng: 101.68 },
  zoom: 10
});

// Listen for clicks
map.addListener('click', (event) => {
  const lat = event.latLng.lat();
  const lng = event.latLng.lng();
  console.log(`Clicked: ${lat}, ${lng}`);
});
```

### Key Files
- `src/components/WorldMap.jsx` - Google Maps integration
- `src/components/WeatherConfig.jsx` - Location config

### ✅ Checkpoint
- [ ] Picked a location on the map
- [ ] Saw weather change based on location
- [ ] Understand how map click events work

---

## M3: BRING IT TO LIFE - Characters & State (30 min)

### 🎯 Goal: Control your character and see NPCs with purpose

### What You'll Do
1. Use WASD to move YOUR character (red shirt, blue hair)
2. Watch NPCs walk to cafes, offices, and homes
3. Add a new building and see population grow
4. Understand game state and React hooks

### 🧪 API LESSON: State Management

```javascript
// React useState - local state
const [cityState, setCityState] = useState(null);

// Updating state
setCityState(prev => ({
  ...prev,
  coins: prev.coins + 10
}));
```

### Key Files
- `src/services/characterService.js` - Character AI
- `src/services/cityService.js` - City state
- `src/App.jsx` - Main app state

### ✅ Checkpoint
- [ ] Moved your character with WASD
- [ ] Built a house and saw a new NPC spawn
- [ ] Understand how `useState` works

---

## M4: CONNECT TO THE WORLD - Server APIs (30 min)

### 🎯 Goal: Save your city to the server and see the leaderboard

### What You'll Do
1. Publish your score to the server
2. See your city on the leaderboard
3. Understand POST requests vs GET requests
4. Learn about server-side validation

### 🧪 API LESSON: POST Requests

```javascript
// GET - Fetch data
const response = await fetch('/server/leaderboard');

// POST - Send data
const response = await fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    city: cityState,
    score: calculateScore()
  })
});
```

### Key Files
- `src/services/serverService.js` - Server communication
- `server/index.js` - Backend API (read-only, already done!)

### ✅ Checkpoint
- [ ] Published your score
- [ ] Saw your name on the leaderboard
- [ ] Understand GET vs POST

---

## M5: BONUS - AI Integration (Optional, 30 min)

### 🎯 Goal: Generate AI-powered town newspaper

### What You'll Do
1. Add `GEMINI_API_KEY` to your `.env`
2. Click "Print New Edition" in Town Gazette panel
3. See AI generate news based on your city!
4. Understand how to prompt AI APIs

### 🧪 API LESSON: Gemini AI API

```javascript
// Server-side AI call (you don't write this, but understand it!)
const response = await ai.generateContent({
  contents: [{
    parts: [{
      text: `Write a newspaper for a city with ${stats.population} people...`
    }]
  }]
});
```

### Key Files
- `src/components/MayorReportPanel.jsx` - UI for AI news
- `server/index.js` - Server-side Gemini call

### ✅ Checkpoint
- [ ] Generated AI newspaper
- [ ] Understand how prompts work
- [ ] Experimented with different city states

---

## 🏆 Congratulations!

You've learned:
- ✅ React components and state
- ✅ Canvas rendering
- ✅ Weather API (GET request)
- ✅ Google Maps API (interactive maps)
- ✅ Server API (POST request)
- ✅ AI API (bonus!)

### Next Steps
- Add your own building type
- Create new NPC behaviors
- Add sound effects
- Deploy to the web!

---

## 📁 Key Files Reference

```
src/
├── App.jsx                     # Main app, state management
├── components/
│   ├── IsometricCanvas.jsx     # Canvas rendering, WASD controls
│   ├── WorldMap.jsx            # Google Maps picker
│   ├── Toolbar.jsx             # Building tools
│   ├── StatsPanel.jsx          # City stats display
│   └── MayorReportPanel.jsx    # AI newspaper
├── services/
│   ├── weatherService.js       # Weather API
│   ├── cityService.js          # City state logic
│   ├── characterService.js     # NPC AI
│   ├── isometricRenderer.js    # Canvas drawing
│   └── serverService.js        # Server API calls
└── data/
    └── buildingData.js         # Building configs
```

---

## ❓ Troubleshooting

### "API key invalid"
- Wait 10-30 minutes after creating new API keys
- Check if keys are correctly copied (no extra spaces)
- Verify API is enabled in the console

### "Cannot connect to server"
- Make sure `npm run dev` is running
- Check terminal for errors
- Server runs on port 5176

### "Weather shows CLEAR but it's raining"
- Weather comes from OpenWeatherMap for your picked location
- Make sure location is correct on the map
- Weather updates when you change location

---

**Happy Coding! 🚀**
