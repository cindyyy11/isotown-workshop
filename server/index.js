import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { swaggerUi, specs } from './swagger.js';

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

// ===== SWAGGER API DOCUMENTATION =====
// Visit http://localhost:5176/api-docs to see interactive API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'IsoTown API Docs - Workshop',
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== TODO #3 (Medium - Express Routing): Create /api/version endpoint =====
// 
// GOAL: Create a new API endpoint that returns version information
// 
// TASK: Add the code below (uncomment and fill in):
// app.get('/api/version', (req, res) => {
//   res.json({
//     version: '1.0.0',
//     name: 'IsoTown',
//     author: 'Your Name',  // Put your name here!
//     description: 'Pixel city builder with real-world APIs'
//   });
// });
//
// WHY: Learn Express routing, JSON responses, and Postman testing
//
// TEST STEPS:
// 1. Uncomment the code above
// 2. Restart server: Ctrl+C then npm run dev
// 3. Open Postman
// 4. Create request: GET http://localhost:5176/api/version
// 5. Click Send
// 6. You should see the JSON response!
//
// BONUS CHALLENGE:
// - Display the version in the app footer (src/App.jsx)
// - Add it to the /api/capabilities response
// - Add a "lastUpdated" field with current date
//
// LEARN: This is how every API endpoint works!
// - Define route with app.get() or app.post()
// - Handle request (req) and response (res)
// - Send JSON with res.json()

// ===== CAPABILITIES =====
app.get('/api/capabilities', (req, res) => {
  res.json({
    server: true,
    weather: Boolean(OPENWEATHERMAP_API_KEY), // Weather requires API key
    leaderboard: true,
    gemini: Boolean(GEMINI_API_KEY),
  });
});

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Get weather data
 *     description: Fetch current weather conditions for given coordinates using OpenWeatherMap API
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *         example: 3.1390
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *         example: 101.6869
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Weather'
 *       400:
 *         description: Missing latitude or longitude
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: Weather API key not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/score:
 *   post:
 *     summary: Submit city score
 *     description: Save a city's final score to the leaderboard
 *     tags: [Leaderboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: object
 *                 description: City state object
 *               stats:
 *                 type: object
 *                 properties:
 *                   coins:
 *                     type: integer
 *                     example: 100
 *                   population:
 *                     type: integer
 *                     example: 25
 *                   jobs:
 *                     type: integer
 *                     example: 20
 *                   happiness:
 *                     type: integer
 *                     example: 18
 *     responses:
 *       200:
 *         description: Score saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 score:
 *                   type: integer
 *                   example: 238
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to save score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     description: Retrieve top 20 city scores from the leaderboard
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeaderboardEntry'
 *       500:
 *         description: Failed to load leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/mayor-report:
 *   post:
 *     summary: Generate AI mayor report
 *     description: Generate a city analysis report using Google Gemini AI
 *     tags: [Mayor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stats:
 *                 type: object
 *                 properties:
 *                   coins:
 *                     type: integer
 *                   population:
 *                     type: integer
 *                   jobs:
 *                     type: integer
 *                   happiness:
 *                     type: integer
 *               worldCondition:
 *                 type: string
 *                 enum: [CLEAR, RAIN, SNOW, WIND, HEAT, COLD]
 *               cityLog:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MayorReport'
 *       503:
 *         description: Gemini API key not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
    const cityLog = Array.isArray(req.body?.cityLog) ? req.body.cityLog : [];
    
    const isStruggling = (stats.happiness || 0) < 5 || (stats.coins || 0) < 5;
    const isThriving = (stats.happiness || 0) > 15 && (stats.coins || 0) > 20;
    const hasWeatherIssue = worldCondition !== 'CLEAR';
    const logPreview = cityLog.length ? `Recent events: ${cityLog.join('; ')}.` : 'No recent events.';
    
    const prompt = `You are writing a tiny pixel town newspaper called "The IsoTown Gazette".

Current town stats:
- Weather: ${worldCondition} ${hasWeatherIssue ? '(affecting the town!)' : ''}
- Coins: ${stats.coins || 0} ${(stats.coins || 0) < 5 ? '(very low!)' : ''}
- Population: ${stats.population || 0}
- Jobs: ${stats.jobs || 0}
- Happiness: ${stats.happiness || 0} ${isStruggling ? '(citizens unhappy!)' : isThriving ? '(citizens delighted!)' : ''}
${logPreview}

Write in this EXACT format (keep each part short, 1-2 sentences max):

HEADLINE: [A creative, funny 4-6 word headline about the town. Reference stats or recent events if relevant.]

CITIZEN: "[A short quote from a made-up pixel resident. ${isStruggling ? 'They complain about something specific (rent, happiness, jobs).' : isThriving ? 'They praise something.' : 'Neutral or mild opinion.'} Use a fun name like 'Pixel Pete' or 'Blocky Betty']"

TIP: [One specific, actionable suggestion: build a Restaurant/Police/Fire/Cafe/Office/House, connect roads, lower tax, or improve happiness. Be practical.]

Be playful and fun! Match the tone to the town's state.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

// ===== START SERVER =====
app.listen(PORT, () => {
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
