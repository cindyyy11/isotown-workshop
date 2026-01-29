# Workshop Mode: Interactive Speaker-Led Session

**Purpose:** Make the workshop interactive by allowing the speaker (host) to control a shared city while participants (audience) vote on what to build next.

---

## ⚠️ Important: Deployment Requirements

**Do you need to deploy the WebSocket server?**

- **In-person workshop (same network)**: ❌ **No** - Use local server with local IP
- **Online/remote workshop**: ✅ **Yes** - Server must be deployed (Render, Railway, Cloud Run, etc.)

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup instructions.**

---

## 🎯 How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKSHOP MODE FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SPEAKER (Host)                                          │
│     ├─ Opens app → Workshop Mode                            │
│     ├─ Creates/joins room (e.g., "WORKSHOP-2024")          │
│     ├─ Starts a new city or loads existing                  │
│     └─ Shares room code with participants                   │
│                                                              │
│  2. PARTICIPANTS (Audience)                                 │
│     ├─ Open app → Workshop Mode                             │
│     ├─ Enter room code (e.g., "WORKSHOP-2024")             │
│     ├─ Select "Audience Mode"                                │
│     └─ Join room → See host's city in real-time             │
│                                                              │
│  3. VOTING ROUND                                            │
│     ├─ Host clicks "Start Vote" (30 seconds)                │
│     ├─ Participants vote: HOUSE, CAFE, OFFICE, ROAD, ERASE  │
│     ├─ Votes aggregate in real-time (Socket.IO)             │
│     ├─ Timer counts down (30s → 0s)                         │
│     └─ Host sees winning vote (e.g., "HOUSE: 12 votes")     │
│                                                              │
│  4. APPLY ACTION                                            │
│     ├─ Host clicks "Apply Winning Action"                   │
│     ├─ System places building on suggested tile            │
│     ├─ City state updates (coins, population, etc.)         │
│     └─ All participants see the change instantly            │
│                                                              │
│  5. REPEAT                                                  │
│     └─ Host starts next vote → Cycle continues              │
│                                                              │
│  6. FINAL SCORE                                             │
│     ├─ After workshop, host publishes score                │
│     ├─ Score saved to leaderboard                          │
│     └─ Participants see their collaborative city ranked    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Guide

### For the Speaker (Host)

1. **Start Workshop Mode**
   - Open the app
   - Click "Workshop Mode" button (or open Workshop Panel)
   - You'll see "Host Mode" selected by default

2. **Create/Join Room**
   - Enter a room code (e.g., `WORKSHOP-2024` or `API-101`)
   - Click "Generate Random Code" for a unique code
   - Click "Join Room"
   - Share this code with participants

3. **Start Your City**
   - Start a new city or load an existing one
   - Your city will be synced to all participants

4. **Run Voting Rounds**
   - Click "Start Vote" (30-second timer)
   - Participants vote while timer counts down
   - Watch votes accumulate in real-time
   - When timer ends, see the winning vote

5. **Apply Winning Action**
   - Click "Apply Winning Action"
   - The winning building type is placed automatically
   - All participants see the update instantly

6. **Repeat & Teach**
   - Start another vote
   - Explain API concepts while votes happen:
     - "Notice how votes update in real-time? That's WebSockets!"
     - "The server aggregates votes - that's our backend API"
     - "When we place a building, it affects the city state - that's React state management"

7. **End Workshop**
   - Publish the final score to leaderboard
   - Show participants how their collaborative city ranked

### For Participants (Audience)

1. **Join Workshop**
   - Open the app
   - Click "Workshop Mode"
   - Enter the room code shared by the speaker
   - Select "Audience Mode"
   - Click "Join Room"

2. **View Shared City**
   - You'll see the host's city in real-time
   - Watch as buildings are placed
   - See stats update (coins, population, etc.)

3. **Vote**
   - When host starts a vote, you'll see voting buttons
   - Click to vote: HOUSE, CAFE, OFFICE, ROAD, or ERASE
   - See your vote count in real-time
   - Watch the timer count down

4. **See Results**
   - When timer ends, see which option won
   - Watch the host apply the winning action
   - See the city update instantly

---

## 🔧 Technical Details

### Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_room` | Client → Server | Join a workshop room |
| `cast_vote` | Client → Server | Submit a vote |
| `start_vote` | Host → Server | Start a voting round |
| `vote_update` | Server → All | Broadcast vote counts |
| `timer_tick` | Server → All | Broadcast remaining time |
| `state_update` | Host → Server → All | Sync city state |

### Room Structure

```javascript
{
  id: "WORKSHOP-2024",
  votes: { HOUSE: 5, CAFE: 12, OFFICE: 3, ROAD: 2, ERASE: 0 },
  timer: Interval,
  endsAt: 1234567890
}
```

### Vote Aggregation

- Each participant can vote multiple times (allows changing mind)
- Server counts all votes in real-time
- Winner is the option with most votes when timer ends
- Ties: First option alphabetically wins (HOUSE > CAFE > OFFICE > ROAD > ERASE)

---

## 🎓 Educational Value

### What Participants Learn

1. **Real-time Communication**
   - WebSockets (Socket.IO) for instant updates
   - No page refresh needed

2. **Client-Server Architecture**
   - Host controls city (client)
   - Server aggregates votes (backend)
   - Participants see updates (clients)

3. **API Concepts**
   - GET requests (fetching city state)
   - POST requests (publishing score)
   - WebSocket events (real-time voting)

4. **State Management**
   - React state updates
   - Shared state across clients
   - State persistence (leaderboard)

---

## 💡 Tips for Speakers

1. **Start Simple**
   - First round: Explain what's happening
   - Second round: Let participants vote freely
   - Third round: Discuss strategy ("Should we build houses for population or cafes for happiness?")

2. **Use Weather API**
   - Change location during workshop
   - Show how weather affects gameplay
   - "Notice how the weather API call updates our city condition?"

3. **Use Maps API**
   - Let participants suggest locations
   - "Let's build a city in Tokyo!" → Change location
   - Show how Maps API provides coordinates

4. **Use Gemini AI**
   - Generate a "Town Gazette" after a few rounds
   - Show how AI APIs work
   - "The AI reads our city stats and generates news!"

5. **Publish to Leaderboard**
   - End with publishing the collaborative city
   - Show how POST requests work
   - "Our city is now saved on the leaderboard!"

---

## 🚀 Quick Start Commands

### Host Setup
```
1. Open app → Workshop Mode
2. Room: "WORKSHOP-2024"
3. Role: Host
4. Join Room
5. Start City
```

### Participant Setup
```
1. Open app → Workshop Mode
2. Room: "WORKSHOP-2024" (from host)
3. Role: Audience
4. Join Room
5. Wait for vote to start
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect | Check server is running (`npm run dev`) |
| Votes not updating | Refresh page, rejoin room |
| Timer not showing | Host must click "Start Vote" |
| City not syncing | Host must apply action, then state syncs |
| Room code not working | Ensure exact match (case-sensitive) |

---

## 📊 Integration with APIs

### How Each API Enhances Workshop Mode

1. **Google Maps API**
   - Participants suggest locations
   - Host changes city location mid-workshop
   - Shows how location affects weather

2. **OpenWeatherMap API**
   - Weather changes based on location
   - Affects gameplay (rain = cafes need roads)
   - Demonstrates real-time data fetching

3. **Gemini API**
   - Generate "Town Gazette" after voting rounds
   - AI analyzes city stats and gives tips
   - Shows how AI APIs work with structured prompts

4. **Backend API (Our Server)**
   - Aggregates votes (Socket.IO)
   - Saves scores to leaderboard (POST /api/score)
   - Demonstrates custom API endpoints

---

**Ready to run an interactive workshop? Start with a simple room code and let participants vote!** 🎉
