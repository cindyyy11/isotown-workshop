# Deployment Guide: Workshop Mode & WebSockets

## 🎯 Quick Answer

**Do you need to deploy the WebSocket server?**

- **In-person workshop (same network)**: ❌ **No** - Use local server
- **Online/remote workshop**: ✅ **Yes** - Server must be deployed and accessible

---

## 📍 Scenario 1: In-Person Workshop (Same Network)

### Setup
- **Speaker's laptop** runs `npm run dev` (server on `localhost:5176`)
- **Participants** connect to speaker's **local IP address**

### Configuration

1. **Find speaker's local IP:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address (e.g., 192.168.1.100)
   ```

2. **Update participant's `.env`:**
   ```env
   VITE_API_BASE_URL=http://192.168.1.100:5176
   ```

3. **Start server on speaker's machine:**
   ```bash
   npm run dev
   ```

4. **Participants join:**
   - Open app → Workshop Mode
   - Enter room code
   - Connect to `http://192.168.1.100:5176` (Socket.IO)

### ✅ Works Because
- All devices on same Wi-Fi network
- Local IP is accessible to all participants
- No internet required (except for Maps/Weather APIs)

---

## 🌐 Scenario 2: Online/Remote Workshop

### Setup
- **Server must be deployed** to a public URL
- **All participants** connect to the deployed server

### Deployment Options

#### Option A: Render.com (Free Tier)

1. **Create account** at [render.com](https://render.com)

2. **Create Web Service:**
   - Connect your GitHub repo
   - Build command: `npm install`
   - Start command: `node server/index.js`
   - Environment variables:
     ```
     OPENWEATHERMAP_API_KEY=your_key
     GEMINI_API_KEY=your_key (optional)
     CORS_ORIGIN=*
     PORT=10000
     ```

3. **Get your URL:**
   - Render provides: `https://your-app.onrender.com`
   - This is your `VITE_API_BASE_URL`

4. **Update `.env` for all participants:**
   ```env
   VITE_API_BASE_URL=https://your-app.onrender.com
   ```

#### Option B: Railway.app (Free Tier)

1. **Create account** at [railway.app](https://railway.app)

2. **Deploy:**
   - New Project → Deploy from GitHub
   - Select your repo
   - Railway auto-detects Node.js

3. **Set environment variables:**
   - Same as Render.com

4. **Get URL:**
   - Railway provides: `https://your-app.railway.app`
   - Use as `VITE_API_BASE_URL`

#### Option C: Google Cloud Run (Free Tier)

1. **Follow deployment guide** in `README.md`
2. **Get Cloud Run URL:**
   - `https://isotown-server-xxxxx-as.a.run.app`
   - Use as `VITE_API_BASE_URL`

#### Option D: Fly.io (Free Tier)

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create `fly.toml`:**
   ```toml
   app = "isotown-server"
   primary_region = "iad"
   
   [build]
   
   [http_service]
     internal_port = 5176
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
   
   [[services]]
     protocol = "tcp"
     internal_port = 5176
   ```

3. **Deploy:**
   ```bash
   fly launch
   fly secrets set OPENWEATHERMAP_API_KEY=your_key
   fly deploy
   ```

4. **Get URL:**
   - `https://isotown-server.fly.dev`
   - Use as `VITE_API_BASE_URL`

---

## 🔧 Configuration for Remote Workshop

### Step 1: Deploy Server

Choose one of the options above and deploy your server.

### Step 2: Update Environment Variables

**For all participants (including speaker):**

```env
# Use deployed server URL
VITE_API_BASE_URL=https://your-deployed-server.com

# Keep these the same
OPENWEATHERMAP_API_KEY=your_key
VITE_GOOGLE_MAPS_API_KEY=your_key
```

### Step 3: Test Connection

1. **Speaker:**
   - Open app → Workshop Mode
   - Should connect to deployed server
   - Create room → Share code

2. **Participant:**
   - Open app → Workshop Mode
   - Enter room code
   - Should connect and see host's city

---

## 🚨 Common Issues

### Issue: "Cannot connect to server"

**Causes:**
- Server not deployed
- Wrong `VITE_API_BASE_URL`
- CORS not configured
- Server not running

**Solutions:**
1. Check `VITE_API_BASE_URL` in `.env`
2. Verify server is running (check deployment logs)
3. Check CORS settings on server
4. Test server health: `curl https://your-server.com/health`

### Issue: "WebSocket connection failed"

**Causes:**
- Server doesn't support WebSockets
- Firewall blocking WebSocket connections
- Wrong protocol (http vs https)

**Solutions:**
1. Ensure deployment platform supports WebSockets (Render, Railway, Cloud Run all do)
2. Use HTTPS for deployed servers
3. Check server logs for connection errors

### Issue: "Participants can't join room"

**Causes:**
- Room code mismatch
- Server not broadcasting events
- Socket.IO not properly configured

**Solutions:**
1. Verify exact room code match (case-sensitive)
2. Check server logs for Socket.IO events
3. Ensure `CORS_ORIGIN` includes participant domains

---

## 📊 Deployment Comparison

| Platform | Free Tier | WebSocket Support | Setup Difficulty | Best For |
|----------|-----------|-------------------|------------------|----------|
| **Render** | ✅ Yes | ✅ Yes | Easy | Quick deployment |
| **Railway** | ✅ Yes | ✅ Yes | Easy | GitHub integration |
| **Cloud Run** | ✅ Yes | ✅ Yes | Medium | Google Cloud users |
| **Fly.io** | ✅ Yes | ✅ Yes | Medium | Global edge network |
| **Heroku** | ❌ No | ✅ Yes | Easy | (No longer free) |

---

## 🎓 Workshop Scenarios

### Scenario A: In-Person Workshop (10-50 people, same room)

**Setup:**
- Speaker runs local server
- Participants use speaker's local IP
- No deployment needed

**Pros:**
- Fast (local network)
- No internet dependency (except for Maps/Weather)
- Easy setup

**Cons:**
- Only works on same network
- Speaker's laptop must stay on

---

### Scenario B: Online Workshop (Remote participants)

**Setup:**
- Deploy server to Render/Railway/Cloud Run
- All participants use deployed URL
- Server must be running during workshop

**Pros:**
- Works from anywhere
- Stable (cloud hosting)
- Can record sessions

**Cons:**
- Requires deployment
- Free tiers may have cold starts
- Need to configure CORS

---

### Scenario C: Hybrid (Some in-person, some remote)

**Setup:**
- Deploy server (required for remote participants)
- In-person participants can use local IP OR deployed URL
- Remote participants use deployed URL

**Pros:**
- Flexible
- Everyone can join

**Cons:**
- Must deploy server
- More complex setup

---

## 🔐 Security Considerations

### For Deployed Servers

1. **CORS Configuration:**
   ```javascript
   // server/index.js
   const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
   // For production, use specific origins:
   // CORS_ORIGIN=https://your-frontend.com,https://another-domain.com
   ```

2. **Environment Variables:**
   - Never commit `.env` to Git
   - Use platform's secret management
   - API keys stay on server

3. **Rate Limiting:**
   - Consider adding rate limits for production
   - Prevent abuse of voting system

---

## 📝 Quick Checklist

### For In-Person Workshop
- [ ] Speaker finds local IP address
- [ ] Participants update `.env` with local IP
- [ ] Speaker runs `npm run dev`
- [ ] Test connection from participant device
- [ ] Share room code

### For Online Workshop
- [ ] Deploy server (Render/Railway/etc.)
- [ ] Get deployed URL
- [ ] Update all `.env` files with deployed URL
- [ ] Test connection from multiple devices
- [ ] Share room code + deployed URL

---

## 💡 Pro Tips

1. **Test Before Workshop:**
   - Always test Workshop Mode before the actual workshop
   - Have a backup plan (local server if deployment fails)

2. **Monitor Server:**
   - Check deployment logs during workshop
   - Have server dashboard open

3. **Room Code Strategy:**
   - Use simple codes for workshops (e.g., `WORKSHOP-2024`)
   - Display code prominently (screen/projector)

4. **Cold Start Warning:**
   - Free tiers may "sleep" after inactivity
   - First connection might be slow (10-30 seconds)
   - Keep server "warm" by pinging `/health` endpoint

5. **Backup Plan:**
   - If deployment fails, use local server
   - Have participants connect via local IP
   - Works if everyone is on same network

---

## 🎯 Summary

| Scenario | Deployment Needed? | Why |
|----------|-------------------|-----|
| **In-person, same network** | ❌ No | Local server accessible via local IP |
| **Online/remote** | ✅ Yes | Participants need public URL to connect |
| **Hybrid** | ✅ Yes | Remote participants need deployed server |

**Bottom line:** If participants are **not on the same network** as the speaker, you **must deploy the server** for Workshop Mode to work.

---

## 🚀 Recommended Setup

**For most workshops:**
1. **Deploy to Render.com** (easiest, free tier)
2. **Get URL:** `https://your-app.onrender.com`
3. **Update `.env`:** `VITE_API_BASE_URL=https://your-app.onrender.com`
4. **Test connection**
5. **Share room code**

**This works for both in-person and remote participants!**
