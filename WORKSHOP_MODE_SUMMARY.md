# Workshop Mode: Complete Flow & Integration

## 🎯 Overview

**Workshop Mode** makes your workshop **interactive** by allowing:
- **Speaker (Host)** to control a shared city
- **Participants (Audience)** to vote on what to build next
- **Real-time synchronization** via WebSockets
- **Leaderboard integration** to save collaborative results

---

## 🔄 Complete Flow

### Step 1: Host Setup (Speaker)

1. **Open Workshop Mode**
   - Click the "Workshop Mode" button (👥 icon) in floating actions
   - Panel opens as a modal overlay

2. **Create/Join Room**
   - Room code is auto-generated (e.g., `WORKSHOP-ABC1`)
   - Click "Generate Random Code" for a new code
   - Click "Copy" to share with participants
   - Select "Host Mode"
   - Click "Join Room"

3. **Start City**
   - Start a new city or load existing
   - Your city is now the "master" city

4. **Share Room Code**
   - Display room code on screen/projector
   - Participants enter this code to join

### Step 2: Participant Setup (Audience)

1. **Open Workshop Mode**
   - Click "Workshop Mode" button
   - Panel opens

2. **Join Room**
   - Enter the room code from host (e.g., `WORKSHOP-ABC1`)
   - Select "Audience Mode"
   - Click "Join Room"

3. **View Shared City**
   - See host's city in real-time
   - Watch as buildings are placed
   - See stats update automatically

### Step 3: Voting Round

1. **Host Starts Vote**
   - Host clicks "Start Vote (30s)"
   - 30-second timer begins
   - All participants see voting buttons

2. **Participants Vote**
   - Click buttons: HOUSE, CAFE, OFFICE, ROAD, ERASE
   - Can vote multiple times (change mind)
   - Votes update in real-time for everyone

3. **Vote Aggregation**
   - Server counts all votes
   - Host sees live results
   - Leading option highlighted

4. **Timer Ends**
   - Voting stops at 0 seconds
   - Winner is displayed (e.g., "HOUSE: 12 votes")

### Step 4: Apply Action

1. **Host Applies Winner**
   - Host clicks "Apply [WINNER] (X votes)"
   - System finds suggested tile (near center, empty)
   - Building is placed automatically
   - City state updates (coins, population, etc.)

2. **State Sync**
   - Host's city state broadcasts to all participants
   - Everyone sees the new building instantly
   - Stats update for all viewers

### Step 5: Repeat & Teach

- Host starts another vote
- Participants vote again
- Host applies winner
- Cycle continues

**Teaching moments:**
- "Watch votes update in real-time - that's WebSockets!"
- "The server aggregates votes - that's our backend API"
- "When we place a building, state updates - that's React state management"

### Step 6: Final Score

1. **Publish to Leaderboard**
   - Host clicks "Publish Score" (in leaderboard panel)
   - POST request to `/api/score`
   - Score saved to SQLite database

2. **View Leaderboard**
   - All participants can view leaderboard
   - See their collaborative city ranked
   - "This is how POST requests save data!"

---

## 🔌 Technical Flow

### Socket.IO Events

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│   Host      │                    │   Server     │                    │ Participants│
└─────────────┘                    └──────────────┘                    └─────────────┘
      │                                    │                                    │
      │─── join_room(roomId, "host") ────>│                                    │
      │                                    │                                    │
      │                                    │<─── join_room(roomId, "audience")──│
      │                                    │                                    │
      │─── start_vote(roomId, 30000) ────>│                                    │
      │                                    │─── vote_update ───────────────────>│
      │                                    │─── timer_tick ────────────────────>│
      │                                    │                                    │
      │                                    │<─── cast_vote(roomId, "HOUSE") ────│
      │                                    │                                    │
      │<─── vote_update ──────────────────│─── vote_update ───────────────────>│
      │                                    │                                    │
      │─── state_update(roomId, state) ──>│                                    │
      │                                    │─── state_update ──────────────────>│
      │                                    │                                    │
```

### API Integration

1. **Workshop Mode** → Socket.IO (WebSockets)
2. **Weather** → OpenWeatherMap API (via `/api/weather`)
3. **Location** → Google Maps API (client-side)
4. **Leaderboard** → Backend API (`POST /api/score`, `GET /api/leaderboard`)
5. **AI Report** → Gemini API (via `/api/mayor-report`)

---

## 📊 How APIs Enhance Workshop Mode

### 1. Google Maps API

**During Workshop:**
- Host: "Let's build a city in Tokyo!"
- Changes location on map
- Weather updates automatically
- "See how the Maps API provides coordinates, which the Weather API uses?"

**Teaching Point:**
- "APIs can chain together - Maps → Weather"

### 2. OpenWeatherMap API

**During Workshop:**
- Location changes → Weather changes
- Weather affects gameplay (rain = cafes need roads)
- "The Weather API returns real data that affects our game logic"

**Teaching Point:**
- "Real-world APIs provide data that affects application behavior"

### 3. Gemini API

**During Workshop:**
- After a few voting rounds, generate "Town Gazette"
- AI analyzes city stats and provides tips
- "The AI API reads our city state and generates content"

**Teaching Point:**
- "AI APIs take structured input and generate dynamic output"

### 4. Backend API (Our Server)

**During Workshop:**
- Votes aggregate in real-time (Socket.IO)
- Scores save to database (POST /api/score)
- Leaderboard reads from database (GET /api/leaderboard)

**Teaching Point:**
- "We built our own API endpoints for custom functionality"

---

## 🎓 Educational Value

### What Participants Learn

1. **Real-time Communication**
   - WebSockets vs HTTP
   - Socket.IO for instant updates
   - No page refresh needed

2. **Client-Server Architecture**
   - Host = client controlling city
   - Server = aggregates votes, syncs state
   - Participants = clients viewing/ voting

3. **API Concepts**
   - GET requests (fetching data)
   - POST requests (saving data)
   - WebSocket events (real-time)

4. **State Management**
   - React state updates
   - Shared state across clients
   - State persistence (database)

5. **Third-Party APIs**
   - Google Maps (location)
   - OpenWeatherMap (weather)
   - Gemini (AI content)

---

## 💡 Best Practices for Running Workshop Mode

### Before Workshop

1. **Test Setup**
   - Start server (`npm run dev`)
   - Create test room
   - Verify Socket.IO connection

2. **Prepare Room Code**
   - Generate a simple code (e.g., `WORKSHOP-2024`)
   - Display it prominently

3. **Prepare Teaching Points**
   - When to explain WebSockets
   - When to show API calls
   - When to demonstrate state sync

### During Workshop

1. **Start Simple**
   - First round: Explain what's happening
   - Second round: Let participants vote freely
   - Third round: Discuss strategy

2. **Use APIs Actively**
   - Change location mid-workshop
   - Generate AI report after votes
   - Publish score at the end

3. **Show DevTools**
   - Network tab → See API requests
   - Console → See Socket.IO events
   - "This is what's happening behind the scenes"

4. **Encourage Questions**
   - "Why do votes update instantly?"
   - "How does the server know who voted?"
   - "Where is the city state stored?"

### After Workshop

1. **Review Leaderboard**
   - Show collaborative city ranked
   - Explain POST/GET requests

2. **Q&A**
   - Answer technical questions
   - Explain API concepts
   - Provide resources

---

## 🚀 Quick Reference

### Host Commands
```
1. Open Workshop Mode
2. Generate/Enter room code
3. Join as Host
4. Start city
5. Start Vote → Apply Winner → Repeat
6. Publish Score
```

### Participant Commands
```
1. Open Workshop Mode
2. Enter room code
3. Join as Audience
4. Wait for vote → Vote → See results
```

### Room Code Format
- Pattern: `WORKSHOP-XXXX`
- Example: `WORKSHOP-ABC1`
- Case-sensitive
- Auto-generated or custom

---

## ✅ Integration Checklist

- [x] Socket.IO server running
- [x] Room code generation
- [x] Real-time vote aggregation
- [x] State synchronization
- [x] Participant count tracking
- [x] Timer countdown
- [x] Winner detection
- [x] Auto-placement of buildings
- [x] Leaderboard integration
- [x] API integration (Maps, Weather, Gemini)

---

**Workshop Mode is fully integrated and ready to make your workshop interactive!** 🎉
