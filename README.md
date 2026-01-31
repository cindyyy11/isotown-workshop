# 🏙️ IsoTown 3D – Interactive City Builder Demo

**Build a 3D isometric city with AI citizens and real-world APIs!**

This is a **demo application** showcasing modern web technologies including React, Three.js, and API integration.

[![Tech Stack](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-Latest-black)](https://threejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js** v18+ ([Download here](https://nodejs.org/))
- Modern browser with WebGL support (Chrome/Edge/Firefox)

### Installation

```bash
# 1. Clone or download this repository
git clone <your-repo-url>

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Windows PowerShell:
Copy-Item env.example .env

# Mac/Linux:
cp env.example .env

# 4. Add your API keys to .env (see below)

# 5. Start the app
npm run dev
```

**That's it!** Open http://localhost:5175 in your browser 🎉

---

## 🔑 API Keys Setup

Add these to your `.env` file:

### Required (for basic functionality):
1. **OpenWeatherMap** (for weather effects)
   - Get free key: https://openweathermap.org/api
   - Add to `.env`: `OPENWEATHERMAP_API_KEY=your_key_here`

2. **Google Maps** (for location picker)
   - Get key: https://console.cloud.google.com
   - Enable "Maps JavaScript API"
   - Add to `.env`: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`

### Optional (for advanced features):
3. **MockAPI** (for cloud saves)
   - Create free account: https://mockapi.io
   - Add to `.env`: `VITE_MOCKAPI_BASE_URL=your_endpoint_here`

4. **Gemini AI** (for AI-generated reports)
   - Get key: https://aistudio.google.com/app/apikey
   - Add to `.env`: `GEMINI_API_KEY=your_key_here`

---

## 🎮 How to Play

### Controls

**3D Mode (Default):**
- 🖱️ **Right-click + Drag** → Rotate camera 360°
- 🖱️ **Mouse wheel** → Zoom in/out
- 🖱️ **Middle-click + Drag** → Pan camera
- 👆 **Click "Move"** (hand icon) → Select move mode
- 👆 **Click ground** → Move your character
- 👆 **Click buildings** → Select tool, then click to place
- 👆 **Click citizens** → View their MBTI personality

**2D Mode (Classic):**
- ⌨️ **WASD** → Move player character
- ⌨️ **E** → Interact with buildings
- 🖱️ **Click toolbar** → Select buildings
- 🖱️ **Click grid** → Place buildings

### Game Objectives

🎯 **Win Condition:**
- Reach **20 population**
- Maintain **20 happiness**
- Accumulate **30 coins**

💔 **Lose Condition:**
- Happiness drops to **0**

### Game Mechanics

- ⏱️ **Time**: Economy updates every 5 seconds (12 updates = 1 day)
- 🌤️ **Weather**: Affects income (RAIN/WIND/HEAT change building income)
- 🏠 **Buildings**:
  - **Houses** ($3) → +2 population, earns rent
  - **Offices** ($8) → +3 jobs, earns coins (day only)
  - **Cafes** ($5) → +2 happiness, earns coins (day only)
  - **Trees** ($2) → +1 happiness
  - **Roads** ($1) → Connects buildings (required in rain/wind)

---

## ✨ Features Showcase

### 🎨 3D Graphics
- ✅ **WebGL rendering** with realistic shadows
- ✅ **Isometric view** using OrthographicCamera
- ✅ **360° rotation** with smooth OrbitControls
- ✅ **Weather particles**: Rain, snow, clouds
- ✅ **Day/night cycle** with dynamic lighting
- ✅ **Click-to-move** character control
- ✅ **Immersive background** with gradient effects

### 🤖 AI Character System (MBTI)
- ✅ **16 personality types** (INTJ, ENFP, ISTP, etc.)
- ✅ **Autonomous behavior**: Characters walk around, go to work, go home
- ✅ **Pathfinding AI**: Simple A* algorithm for navigation
- ✅ **Daily routines**: Work hours (9am-5pm), Home time (8pm-7am), Free time (wander)
- ✅ **Personality traits**: Each type has unique work speed, social needs, preferred buildings

### 🌍 Real-World Integration
- ✅ **Live weather** from OpenWeatherMap API
- ✅ **Location-based**: Pick any city on Earth (Google Maps)
- ✅ **Season matching**: Weather adapts to real location
- ✅ **Cloud saves**: Save/load your city via MockAPI
- ✅ **Global leaderboard**: Compete with others (SQLite backend)

### 🎨 User Interface
- ✅ **2D/3D toggle**: Switch modes anytime
- ✅ **Game-style UI**: Top bar and hotbar (Minecraft-inspired)
- ✅ **Draggable minimap**: See your entire city at a glance
- ✅ **Character roster**: View all citizens with details
- ✅ **Responsive design**: Works on various screen sizes

---

## 📁 Project Architecture

```
api-questline-workshop/
├── src/
│   ├── three/                   # Three.js 3D engine (9 modules)
│   │   ├── ThreeScene.js        # Main scene manager
│   │   ├── ThreeRenderer.js     # WebGL renderer
│   │   ├── ThreeCamera.js       # Isometric camera
│   │   ├── ThreeObjects.js      # 3D meshes factory
│   │   ├── OrbitControlsSetup.js # Camera controls
│   │   ├── CharacterMovement.js  # AI pathfinding
│   │   ├── WeatherEffects.js     # Particle systems
│   │   ├── ThreeHelpers.js       # Debug tools
│   │   └── WebGLSupport.js       # WebGL detection
│   │
│   ├── components/              # React UI components (15 files)
│   │   ├── App.jsx              # Main application
│   │   ├── ThreeCanvas.jsx      # 3D wrapper
│   │   ├── GameUI.jsx           # Overlay UI
│   │   └── ...                  # More components
│   │
│   ├── data/
│   │   ├── buildingData.js      # Building definitions
│   │   └── mbtiData.js          # 16 MBTI personalities
│   │
│   └── services/                # Business logic
│       ├── cityService.js       # City management
│       ├── characterService.js  # Character AI
│       ├── weatherService.js    # Weather API
│       └── ...                  # More services
│
├── server/
│   └── index.js                 # Express backend (506 lines)
│
└── public/
    └── logo.gif                 # App logo
```

---

## 🔧 API Endpoints

The backend server (`http://localhost:5176`) provides:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/capabilities` | GET | Check which features are enabled |
| `/api/weather` | GET | Fetch real-time weather (lat/lon params) |
| `/api/score` | POST | Submit score to leaderboard |
| `/api/leaderboard` | GET | Get top scores |
| `/api/mayor-report` | POST | Generate AI report (requires Gemini) |

---

## 🐛 Troubleshooting

### ❌ Server won't start

**Problem**: `EADDRINUSE` error (port already in use)

**Solution**:
```bash
# Windows PowerShell:
Get-Process -Name node | Stop-Process -Force

# Mac/Linux:
killall node
```

Then run `npm run dev` again.

---

### ❌ Weather not working

**Problem**: "Weather not configured" message

**Solutions**:
1. Add `OPENWEATHERMAP_API_KEY` to `.env`
2. Restart the server: `npm run dev`
3. Wait 10-30 minutes (new API keys need activation)
4. Check the key at: https://home.openweathermap.org/api_keys

---

### ❌ 3D scene is black or not loading

**Problem**: WebGL context lost or not supported

**Solutions**:
1. **Hard refresh**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Update GPU drivers**: Visit your graphics card manufacturer's website
3. **Try different browser**: Chrome usually has best WebGL support
4. **Check WebGL**: Visit https://get.webgl.org/ to verify support

---

### ❌ Map is blank

**Problem**: Google Maps not showing

**Solutions**:
1. Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
2. Enable "Maps JavaScript API" in [Google Cloud Console](https://console.cloud.google.com)
3. Restart: `npm run dev`

---

### ❌ Characters not moving

**Problem**: Citizens standing still

**Solutions**:
1. Click the **"Move" tool** (hand icon) in bottom hotbar
2. Click on the ground to set destination
3. Wait a few seconds (NPCs wander automatically)
4. Check that you're in 3D mode (not 2D)

---

## 🎯 Key Technologies

| Technology | Purpose | Why It's Cool |
|------------|---------|---------------|
| **React 18** | UI framework | Fast, component-based architecture |
| **Three.js** | 3D graphics | Industry-standard WebGL library |
| **Vite** | Build tool | Lightning-fast HMR and builds |
| **Express** | Backend | Simple, flexible Node.js server |
| **SQLite** | Database | Lightweight, zero-config database |
| **OrbitControls** | Camera | Smooth 360° rotation and zoom |
| **MBTI System** | Character AI | 16 unique personality types |
| **A\* Pathfinding** | Movement | Smart navigation around obstacles |

---

## 📊 Performance

- 🎯 **Target**: 60 FPS on modern hardware
- 🖥️ **Rendering**: Hardware-accelerated WebGL
- 🌑 **Shadows**: PCFSoftShadowMap (soft, realistic)
- 💧 **Particles**: 1000 rain drops, 500 snowflakes, 200 clouds
- 🧠 **Memory**: Zero leaks (proper disposal of all Three.js objects)
- 📱 **Responsive**: Auto-scales for different screen sizes

---

## 🔒 Security Notes

⚠️ **Important**:
- Never commit your `.env` file to Git
- Don't share API keys in screenshots or logs
- Variables starting with `VITE_` are exposed to the browser (treat as public)
- The `.env.example` file is safe to commit (contains no real keys)

---

## 🎓 What Can You Learn From This?

This demo showcases:
- ✅ Modern React patterns (hooks, effects, state management)
- ✅ Three.js integration with React
- ✅ WebGL 3D graphics programming
- ✅ API integration (REST, real-time data)
- ✅ AI pathfinding algorithms
- ✅ Game loop and animation
- ✅ Responsive UI design
- ✅ Full-stack JavaScript (React + Node.js)
- ✅ Database integration (SQLite)
- ✅ Clean code architecture

---

## 📚 Additional Resources

- 📖 **Three.js Docs**: https://threejs.org/docs/
- 📖 **React Docs**: https://react.dev/
- 📖 **Vite Guide**: https://vitejs.dev/guide/
- 🎮 **MBTI Types**: https://www.16personalities.com/
- 🌐 **WebGL Tutorial**: https://webglfundamentals.org/

---

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Fork and experiment
- Use as learning material
- Build your own features on top
- Share with others learning web development

---

## 📜 License

See `LICENSE` file for details.

---

## 🙏 Acknowledgments

- **Three.js** for amazing 3D library
- **React** team for incredible framework
- **Vite** for blazing-fast dev experience
- **OpenWeatherMap** for weather data
- **Google Maps** for location services

---

**Built with ❤️ to demonstrate modern web development capabilities**

🌟 **Enjoy exploring your 3D city!** 🌟

---

## 🆘 Need Help?

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Verify all API keys are set correctly
3. Make sure Node.js v18+ is installed
4. Try running in a different browser
5. Check the browser console for errors (F12)

**Pro tip**: Most issues are solved by restarting the server (`npm run dev`) or hard refreshing the browser (`Ctrl + Shift + R`)!
