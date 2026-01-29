import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env from project root (parent of server/) so it works regardless of cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
dotenv.config({ path: envPath });

// Also run default config so Render / env vars still work
dotenv.config();

// ===== CONFIG =====
// Render sets PORT; locally we use SERVER_PORT or default 5176
// For local dev: use SERVER_PORT (5176)
// For production (Render): use PORT (auto-set by Render)
// This ensures the server doesn't accidentally use the Vite port (5175)
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 5176);

// API Keys (REQUIRED for workshop) — trim to avoid newline/space issues
const OPENWEATHERMAP_API_KEY = (process.env.OPENWEATHERMAP_API_KEY || '').trim();
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();

// CORS: allow "*" for quick testing, or comma-separated origins
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const allowedOrigins = CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map(o => o.trim());

const corsOptions = {
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: corsOptions,
});

// ===== SQLITE SETUP =====
// Data folder next to server/index.js (__dirname from env loading above)
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'isotown.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS city_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      score INTEGER NOT NULL,
      city_json TEXT NOT NULL
    )`
  );
});

function computeScore(stats) {
  const coins = Number(stats?.coins || 0);
  const population = Number(stats?.population || 0);
  const jobs = Number(stats?.jobs || 0);
  const happiness = Number(stats?.happiness || 0);
  return coins + population * 2 + jobs * 3 + happiness;
}

function determineWorldCondition(weather) {
  const precipitation = weather.precipitation || 0;
  const windSpeed = weather.windspeed || 0;
  const temperature = weather.temperature || 25;

  if (precipitation > 0.1) return 'RAIN';
  if (windSpeed > 20) return 'WIND';
  if (temperature > 32) return 'HEAT';
  return 'CLEAR';
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== CAPABILITIES =====
app.get('/api/capabilities', (req, res) => {
  res.json({
    server: true,
    weather: Boolean(OPENWEATHERMAP_API_KEY), // Weather requires API key
    leaderboard: true,
    voting: true,
    gemini: Boolean(GEMINI_API_KEY),
  });
});

// ===== WEATHER PROXY (OpenWeatherMap) =====
// WORKSHOP NOTE: Requires OPENWEATHERMAP_API_KEY in .env
// Get your free key at: https://openweathermap.org/api
app.get('/api/weather', async (req, res) => {
  // Check if API key is configured
  if (!OPENWEATHERMAP_API_KEY) {
    res.status(503).json({ 
      error: 'Weather API not configured. Add OPENWEATHERMAP_API_KEY to your .env file.',
      hint: 'Get a free API key at https://openweathermap.org/api'
    });
    return;
  }

  const lat = Number(req.query.lat || 3.1390);
  const lon = Number(req.query.lon || 101.6869);

  try {
    // OpenWeatherMap Current Weather API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenWeatherMap error:', errorData);
      
      // If API key is invalid, provide helpful message
      if (errorData.cod === 401 || errorData.cod === '401') {
        res.status(502).json({ 
          error: 'Weather API request failed',
          details: 'Invalid API key. New keys take 10-30 minutes to activate. Please wait and try again.',
          hint: 'Check your OPENWEATHERMAP_API_KEY in .env file'
        });
        return;
      }
      
      res.status(502).json({ 
        error: 'Weather API request failed',
        details: errorData.message || 'Unknown error'
      });
      return;
    }

    const data = await response.json();
    
    // Extract weather data from OpenWeatherMap response
    const temperature = data.main?.temp || 25;
    const windspeed = (data.wind?.speed || 0) * 3.6; // Convert m/s to km/h
    const humidity = data.main?.humidity || 50;
    const rain = data.rain?.['1h'] || 0;
    const snow = data.snow?.['1h'] || 0;
    const description = data.weather?.[0]?.description || 'clear';
    
    const condition = determineWorldCondition({
      temperature,
      windspeed,
      precipitation: rain + snow,
    });

    res.json({
      temperature: Math.round(temperature * 10) / 10,
      windspeed: Math.round(windspeed * 10) / 10,
      humidity,
      rain,
      description,
      condition,
      lat,
      lon,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather proxy error:', error);
    res.status(500).json({ error: 'Weather proxy failed' });
  }
});

// ===== CRUD: SCORE / LEADERBOARD =====
app.post('/api/score', async (req, res) => {
  try {
    const city = req.body?.city;
    const stats = req.body?.stats || {};
    const score = computeScore(stats);
    const createdAt = new Date().toISOString();
    const cityJson = JSON.stringify({ city, stats, createdAt });

    const result = await dbRun(
      'INSERT INTO city_scores (created_at, score, city_json) VALUES (?, ?, ?)',
      [createdAt, score, cityJson]
    );

    res.json({ id: result.lastID, score, createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = await dbAll(
      'SELECT id, created_at, score, city_json FROM city_scores ORDER BY score DESC, created_at DESC LIMIT 20'
    );
    const leaderboard = rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      score: row.score,
      city: JSON.parse(row.city_json),
    }));
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// ===== CRUD: CITY =====
app.post('/api/city', async (req, res) => {
  try {
    const stats = req.body?.stats || {};
    const city = req.body?.city || {};
    const score = computeScore(stats);
    const createdAt = new Date().toISOString();
    const cityJson = JSON.stringify({ city, stats, createdAt });
    const result = await dbRun(
      'INSERT INTO city_scores (created_at, score, city_json) VALUES (?, ?, ?)',
      [createdAt, score, cityJson]
    );
    res.json({ id: result.lastID, score, createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create city' });
  }
});

app.get('/api/city/:id', async (req, res) => {
  try {
    const row = await dbGet('SELECT id, created_at, score, city_json FROM city_scores WHERE id = ?', [req.params.id]);
    if (!row) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    res.json({
      id: row.id,
      createdAt: row.created_at,
      score: row.score,
      city: JSON.parse(row.city_json),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load city' });
  }
});

app.put('/api/city/:id', async (req, res) => {
  try {
    const stats = req.body?.stats || {};
    const city = req.body?.city || {};
    const score = computeScore(stats);
    const updatedAt = new Date().toISOString();
    const cityJson = JSON.stringify({ city, stats, updatedAt });
    await dbRun(
      'UPDATE city_scores SET created_at = ?, score = ?, city_json = ? WHERE id = ?',
      [updatedAt, score, cityJson, req.params.id]
    );
    res.json({ id: req.params.id, score, updatedAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update city' });
  }
});

app.delete('/api/city/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM city_scores WHERE id = ?', [req.params.id]);
    res.json({ id: req.params.id, deleted: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// ===== GEMINI TOWN NEWSPAPER =====
// Generates a fun "IsoTown Gazette" newspaper using AI
app.post('/api/mayor-report', async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.json({ enabled: false, message: 'Gemini is not enabled on this server.' });
    return;
  }

  try {
    const stats = req.body?.stats || {};
    const worldCondition = req.body?.worldCondition || 'CLEAR';
    const taxRate = req.body?.taxRate != null ? Math.max(0, Math.min(0.1, Number(req.body.taxRate))) : 0;
    const cityLog = Array.isArray(req.body?.cityLog) ? req.body.cityLog : [];
    
    const isStruggling = (stats.happiness || 0) < 5 || (stats.coins || 0) < 5;
    const isThriving = (stats.happiness || 0) > 15 && (stats.coins || 0) > 20;
    const hasWeatherIssue = worldCondition !== 'CLEAR';
    const taxPct = Math.round(taxRate * 100);
    const logPreview = cityLog.length ? `Recent events: ${cityLog.join('; ')}.` : 'No recent events.';
    
    const prompt = `You are writing a tiny pixel town newspaper called "The IsoTown Gazette".

Current town stats:
- Weather: ${worldCondition} ${hasWeatherIssue ? '(affecting the town!)' : ''}
- Coins: ${stats.coins || 0} ${(stats.coins || 0) < 5 ? '(very low!)' : ''}
- Population: ${stats.population || 0}
- Jobs: ${stats.jobs || 0}
- Happiness: ${stats.happiness || 0} ${isStruggling ? '(citizens unhappy!)' : isThriving ? '(citizens delighted!)' : ''}
- Mayor tax: ${taxPct}% ${taxPct > 0 ? '(reduces income)' : ''}
${logPreview}

Write in this EXACT format (keep each part short, 1-2 sentences max):

HEADLINE: [A creative, funny 4-6 word headline about the town. Reference stats, tax, or recent events if relevant.]

CITIZEN: "[A short quote from a made-up pixel resident. ${isStruggling ? 'They complain about something specific (rent, happiness, jobs).' : isThriving ? 'They praise something.' : 'Neutral or mild opinion.'} Use a fun name like 'Pixel Pete' or 'Blocky Betty']"

TIP: [One specific, actionable suggestion: build a Restaurant/Police/Fire/Cafe/Office/House, connect roads, lower tax, or improve happiness. Be practical.]

Be playful and fun! Match the tone to the town's state.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      res.status(502).json({ error: 'Gemini request failed' });
      return;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No report generated.';
    
    // Parse the structured response
    const headlineMatch = text.match(/HEADLINE:\s*(.+?)(?=\n|CITIZEN:|$)/is);
    const citizenMatch = text.match(/CITIZEN:\s*(.+?)(?=\n|TIP:|$)/is);
    const tipMatch = text.match(/TIP:\s*(.+?)$/is);
    
    res.json({ 
      enabled: true, 
      report: text,
      parsed: {
        headline: headlineMatch ? headlineMatch[1].trim() : 'Town News Today!',
        citizen: citizenMatch ? citizenMatch[1].trim() : 'Everything seems fine here.',
        tip: tipMatch ? tipMatch[1].trim() : 'Keep building!',
      }
    });
  } catch (error) {
    console.error('Gemini error:', error);
    const cause = error?.cause || error;
    const isNetwork = cause?.code === 'ENOTFOUND' || cause?.code === 'ECONNREFUSED' || /fetch failed|network/i.test(String(cause?.message || ''));
    const hint = isNetwork
      ? 'Cannot reach Gemini API (network/DNS). Check internet, firewall, VPN.'
      : 'Gemini request failed. Check server logs.';
    res.status(502).json({ error: 'Gemini request failed', hint });
  }
});

// ===== SOCKET.IO VOTING =====
const rooms = new Map();

function createRoom(roomId) {
  return {
    id: roomId,
    votes: { HOUSE: 0, CAFE: 0, OFFICE: 0, ROAD: 0, ERASE: 0 },
    timer: null,
    endsAt: null,
    participants: new Set(), // Track socket IDs
    hostId: null,
  };
}

function resetVotes(room) {
  room.votes = { HOUSE: 0, CAFE: 0, OFFICE: 0, ROAD: 0, ERASE: 0 };
}

function broadcastParticipantCount(io, roomId, room) {
  const count = room.participants.size;
  io.to(roomId).emit('participant_count', { roomId, count });
}

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, role }) => {
    if (!roomId) return;
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, createRoom(roomId));
    }
    const room = rooms.get(roomId);
    room.participants.add(socket.id);
    
    // Track host
    if (role === 'host') {
      room.hostId = socket.id;
    }
    
    socket.emit('vote_update', { roomId, votes: room.votes });
    broadcastParticipantCount(io, roomId, room);
  });

  socket.on('disconnect', () => {
    // Remove from all rooms
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        if (room.hostId === socket.id) {
          room.hostId = null;
        }
        broadcastParticipantCount(io, roomId, room);
        
        // Clean up empty rooms
        if (room.participants.size === 0) {
          if (room.timer) clearInterval(room.timer);
          rooms.delete(roomId);
        }
      }
    });
  });

  socket.on('cast_vote', ({ roomId, vote }) => {
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    if (!Object.prototype.hasOwnProperty.call(room.votes, vote)) return;
    room.votes[vote] += 1;
    io.to(roomId).emit('vote_update', { roomId, votes: room.votes });
  });

  socket.on('start_vote', ({ roomId, durationMs = 30000 }) => {
    if (!roomId) return;
    if (!rooms.has(roomId)) {
      rooms.set(roomId, createRoom(roomId));
    }
    const room = rooms.get(roomId);
    resetVotes(room);
    room.endsAt = Date.now() + durationMs;

    if (room.timer) clearInterval(room.timer);
    room.timer = setInterval(() => {
      const remaining = Math.max(0, room.endsAt - Date.now());
      io.to(roomId).emit('timer_tick', { roomId, remainingMs: remaining });
      if (remaining <= 0) {
        clearInterval(room.timer);
        room.timer = null;
        io.to(roomId).emit('vote_update', { roomId, votes: room.votes });
      }
    }, 1000);

    io.to(roomId).emit('vote_update', { roomId, votes: room.votes });
  });

  socket.on('state_update', ({ roomId, state }) => {
    if (!roomId) return;
    io.to(roomId).emit('state_update', { roomId, state });
  });
});

// ===== START SERVER =====
server.listen(PORT, () => {
  const envFound = fs.existsSync(envPath);
  console.log(`[IsoTown Server] Running on port ${PORT}`);
  console.log(`[IsoTown Server] .env: ${envFound ? `loaded from ${envPath}` : `NOT FOUND at ${envPath} (copy env.example → .env)`}`);
  console.log(`[IsoTown Server] Health check: http://localhost:${PORT}/health`);
  console.log(`[IsoTown Server] CORS origins: ${allowedOrigins === '*' ? 'ALL (*)' : allowedOrigins.join(', ')}`);
  console.log(`[IsoTown Server] OpenWeatherMap: ${OPENWEATHERMAP_API_KEY ? 'CONFIGURED ✓' : 'NOT CONFIGURED ✗'}`);
  if (GEMINI_API_KEY) {
    console.log(`[IsoTown Server] Gemini: CONFIGURED ✓ (Town Gazette enabled)`);
  } else {
    console.log(`[IsoTown Server] Gemini: NOT CONFIGURED — add GEMINI_API_KEY to .env (project root) and restart. Get key: https://aistudio.google.com/app/apikey`);
  }
  console.log(`[IsoTown Server] SQLite DB: ${dbPath}`);
});
