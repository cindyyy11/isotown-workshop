# Render Deployment Guide - Remote Workshop

**For online/remote workshops using Render.com**

This guide walks you through deploying the IsoTown server to Render so participants can join Workshop Mode from anywhere.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (free account works)
3. Verify your email

### Step 2: Create Web Service

1. **Dashboard** → Click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Connect your GitHub account
   - Select the `api-questline-workshop` repository
   - Or use **"Public Git repository"** and paste your repo URL
   - **Note:** If you have `render.yaml` in your repo, Render will auto-detect settings!

3. **Configure Service:**
   - **Name:** `isotown-server` (or any name)
   - **Region:** Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **OR:** If `render.yaml` exists, Render auto-fills these!

4. **Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"** and add:

   ```
   OPENWEATHERMAP_API_KEY=your_openweathermap_key_here
   GEMINI_API_KEY=your_gemini_key_here (optional)
   CORS_ORIGIN=*
   PORT=10000
   NODE_ENV=production
   ```

   **Important:** 
   - `CORS_ORIGIN=*` allows any domain to connect (for workshop)
   - `PORT=10000` (Render uses this port internally)
   - Don't add `VITE_` variables here (those are for frontend)

5. **Click "Create Web Service"**

### Step 3: Wait for Deployment

- Render will:
  1. Clone your repo
  2. Run `npm install`
  3. Start your server
  4. Assign a URL (e.g., `https://isotown-server.onrender.com`)

- **First deployment takes 3-5 minutes**
- Watch the logs to see progress

### Step 4: Get Your Server URL

Once deployed, you'll see:
- **URL:** `https://isotown-server-xxxxx.onrender.com`
- Copy this URL - this is your `VITE_API_BASE_URL`

### Step 5: Update Environment Variables

**For ALL participants (including you):**

Update `.env` file:

```env
# Your deployed Render server URL
VITE_API_BASE_URL=https://isotown-server-xxxxx.onrender.com

# Keep your existing keys
OPENWEATHERMAP_API_KEY=your_key
VITE_GOOGLE_MAPS_API_KEY=your_key
GEMINI_API_KEY=your_key (optional)
```

### Step 6: Test Connection

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Open app** → Click "Workshop Mode"
3. **Should connect** to Render server
4. **Check logs** in Render dashboard to see connections

---

## 📋 Detailed Configuration

### Server Configuration (`server/index.js`)

Render automatically:
- Sets `PORT` environment variable
- Your server already uses: `process.env.PORT || 5176`
- This works with Render's port (10000)

**No code changes needed!**

### CORS Configuration

For remote workshops, set:

```env
CORS_ORIGIN=*
```

This allows any domain to connect. For production, use specific domains:

```env
CORS_ORIGIN=https://your-frontend.com,https://another-domain.com
```

### Environment Variables in Render

**Required:**
- `OPENWEATHERMAP_API_KEY` - Weather API key
- `CORS_ORIGIN` - Set to `*` for workshop
- `PORT` - Set to `10000` (Render's default)

**Optional:**
- `GEMINI_API_KEY` - For AI reports
- `NODE_ENV` - Set to `production`

**Do NOT add:**
- `VITE_*` variables (those are for frontend only)
- `SERVER_PORT` (Render uses `PORT`)

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to server"

**Check:**
1. Server is running in Render dashboard
2. `VITE_API_BASE_URL` is correct in `.env`
3. Server URL is accessible: `curl https://your-server.onrender.com/health`

**Solution:**
- Check Render logs for errors
- Verify environment variables are set
- Restart service in Render dashboard

### Issue: "WebSocket connection failed"

**Check:**
1. Render supports WebSockets (it does!)
2. Using HTTPS (not HTTP)
3. CORS is configured (`CORS_ORIGIN=*`)

**Solution:**
- Ensure `CORS_ORIGIN=*` in Render environment variables
- Use HTTPS URL in `VITE_API_BASE_URL`
- Check Render logs for WebSocket errors

### Issue: "Server sleeps after inactivity"

**Render Free Tier:**
- Services "sleep" after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)

**Solutions:**
1. **Keep server warm:**
   - Ping `/health` endpoint every 10 minutes
   - Use a service like [UptimeRobot](https://uptimerobot.com) (free)

2. **Upgrade to paid tier:**
   - $7/month keeps service always running
   - No cold starts

3. **Accept cold start:**
   - Warn participants: "First connection may take 30 seconds"
   - Once connected, it stays connected

### Issue: "Environment variables not working"

**Check:**
1. Variables are set in Render dashboard
2. Service was restarted after adding variables
3. Variable names are correct (case-sensitive)

**Solution:**
- Go to Render dashboard → Your service → Environment
- Verify all variables are set
- Click "Manual Deploy" to restart with new variables

---

## 🎯 Workshop Day Checklist

### Before Workshop

- [ ] Server deployed to Render
- [ ] Server URL copied (`https://your-server.onrender.com`)
- [ ] Environment variables set in Render
- [ ] Health check works: `curl https://your-server.onrender.com/health`
- [ ] Test Workshop Mode connection
- [ ] Share server URL with participants

### During Workshop

- [ ] Render dashboard open (to monitor logs)
- [ ] Server URL displayed for participants
- [ ] Room code ready to share
- [ ] Backup plan if server goes down

### After Workshop

- [ ] Server can be stopped (saves free tier hours)
- [ ] Or keep running for participants to review

---

## 💰 Render Free Tier Limits

| Feature | Free Tier | Notes |
|---------|-----------|-------|
| **Web Services** | Unlimited | ✅ |
| **WebSocket Support** | ✅ Yes | ✅ |
| **Sleep After** | 15 min inactivity | Cold start ~30s |
| **Build Time** | 10 min max | Usually 2-3 min |
| **Bandwidth** | 100 GB/month | Plenty for workshop |
| **Logs** | 7 days retention | ✅ |

**For workshops:** Free tier is sufficient! Just be aware of cold starts.

---

## 🔄 Updating Server

### After Code Changes

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update server code"
   git push
   ```

2. **Render auto-deploys:**
   - Detects push to connected branch
   - Automatically rebuilds and redeploys
   - Takes 2-3 minutes

3. **Or manual deploy:**
   - Render dashboard → Your service → "Manual Deploy"

### Updating Environment Variables

1. **Render dashboard** → Your service → **"Environment"**
2. **Add/Edit variables**
3. **Click "Save Changes"**
4. **Service auto-restarts** with new variables

---

## 📊 Monitoring

### View Logs

1. **Render dashboard** → Your service
2. **"Logs" tab**
3. See:
   - Server startup messages
   - Socket.IO connections
   - API requests
   - Errors

### Health Check

Test server health:
```bash
curl https://your-server.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### Check Capabilities

Test API:
```bash
curl https://your-server.onrender.com/api/capabilities
```

Should return:
```json
{
  "server": true,
  "weather": true,
  "leaderboard": true,
  "voting": true,
  "gemini": false
}
```

---

## 🎓 Sharing with Participants

### What to Share

1. **Server URL:**
   ```
   https://isotown-server-xxxxx.onrender.com
   ```

2. **Instructions:**
   ```
   1. Open your .env file
   2. Add: VITE_API_BASE_URL=https://isotown-server-xxxxx.onrender.com
   3. Restart your dev server (npm run dev)
   4. Open Workshop Mode
   5. Enter room code: WORKSHOP-2024
   ```

3. **Room Code:**
   - Display prominently
   - Use simple code (e.g., `WORKSHOP-2024`)

---

## 🚨 Common Mistakes

### ❌ Wrong: Using HTTP instead of HTTPS
```env
VITE_API_BASE_URL=http://isotown-server.onrender.com  # ❌ Wrong
```

### ✅ Correct: Using HTTPS
```env
VITE_API_BASE_URL=https://isotown-server.onrender.com  # ✅ Correct
```

### ❌ Wrong: Adding VITE_ variables to Render
```
VITE_API_BASE_URL=...  # ❌ Don't add this to Render
```

### ✅ Correct: VITE_ variables stay in frontend .env
```
# Frontend .env (local)
VITE_API_BASE_URL=https://your-server.onrender.com
```

### ❌ Wrong: Using localhost in deployed setup
```env
VITE_API_BASE_URL=http://localhost:5176  # ❌ Won't work for remote participants
```

### ✅ Correct: Using Render URL
```env
VITE_API_BASE_URL=https://your-server.onrender.com  # ✅ Works for everyone
```

---

## 📝 Complete Example

### Render Environment Variables

```
OPENWEATHERMAP_API_KEY=abc123def456...
GEMINI_API_KEY=xyz789... (optional)
CORS_ORIGIN=*
PORT=10000
NODE_ENV=production
```

### Participant .env File

```env
# Deployed server URL
VITE_API_BASE_URL=https://isotown-server-xxxxx.onrender.com

# API keys (same as speaker)
OPENWEATHERMAP_API_KEY=abc123def456...
VITE_GOOGLE_MAPS_API_KEY=your_maps_key...
GEMINI_API_KEY=xyz789... (optional)
```

---

## ✅ Success Checklist

- [ ] Server deployed to Render
- [ ] Server URL obtained
- [ ] Health check works
- [ ] Capabilities endpoint works
- [ ] Workshop Mode connects
- [ ] Can create/join room
- [ ] Votes work
- [ ] State syncs
- [ ] Participants can connect

---

## 🎉 You're Ready!

Once deployed:
1. **Share server URL** with participants
2. **Share room code** when starting workshop
3. **Monitor Render logs** during workshop
4. **Enjoy interactive workshop!**

**Need help?** Check Render logs or see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for general troubleshooting.

---

## 📄 Quick Reference

### Render Dashboard URL
After deployment, you'll have:
- **Service URL:** `https://isotown-server-xxxxx.onrender.com`
- **Dashboard:** `https://dashboard.render.com/web/isotown-server`

### Environment Variables to Set
```
OPENWEATHERMAP_API_KEY=your_key
GEMINI_API_KEY=your_key (optional)
CORS_ORIGIN=*
PORT=10000
NODE_ENV=production
```

### Participant Setup
```env
VITE_API_BASE_URL=https://isotown-server-xxxxx.onrender.com
```

That's it! 🚀
