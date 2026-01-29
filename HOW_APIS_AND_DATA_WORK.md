# How APIs and Data Work in IsoTown

This doc explains **what’s real vs simulated**, how **Google Maps**, **OpenWeatherMap**, and **Gemini** are used, and how **season**, **weather**, **day**, and **time** work.

---

## 1. Overview

| Data | Source | Updates |
|------|--------|---------|
| **Weather** | OpenWeatherMap API (via backend) | On start, on location change, on “Refresh Weather”; 5‑min cache |
| **Location** | Google Maps API | When you pick a place on the map |
| **Season** | Real-world (latitude + current month) | On load; varies by location and date |
| **Day & time** | Game simulation (ticks) | Every 5 seconds (one tick); not real-world |
| **Town Gazette** | Gemini API (optional) | When you click “Generate Mayor Report” |

---

## 2. Weather (OpenWeatherMap)

- **Where:** Fetched by the **backend** (`/api/weather?lat=...&lon=...`), which calls OpenWeatherMap.
- **When:**  
  - App init, “Start Building”, “Refresh Weather”, and when you **change location** on the map.  
  - Results are **cached for 5 minutes** (memory + `localStorage`).
- **What you see:**  
  - **UI:** Top bar shows “Weather” + icon + condition (`CLEAR`, `RAIN`, `WIND`, `HEAT`).  
  - **Canvas:** Rain overlay when `RAIN` (and not winter); snow overlay in **WINTER**.
- **Why it might not “work”:**  
  - Missing or invalid `OPENWEATHERMAP_API_KEY` in `.env`.  
  - New keys can take 5–15 minutes to activate.  
  - Backend not running (`npm run dev`).  
- **Conditions:**  
  - `CLEAR`: default; no rain/snow, moderate wind/temp.  
  - `RAIN`: precipitation > 0.  
  - `WIND`: wind > 20 km/h.  
  - `HEAT`: temp > 32 °C.  

See [WEATHER_CONDITIONS.md](./WEATHER_CONDITIONS.md) for details.

---

## 3. Location (Google Maps)

- **Where:** Google Maps JavaScript API in the **WorldMap** component.
- **When:** You open “Explore Earth”, search/click a place, then confirm.  
  - Stored in app state and `localStorage` (`isotown_zone_v1`).
- **What it’s used for:**  
  - **Weather:** All weather requests use this `lat`/`lon`.  
  - **Season:** Derived from **latitude** + current month (see below).  
  - **UI:** Location badge shows the place name (e.g. “Kuala Lumpur, MY”).
- **Why it might not work:**  
  - Missing or invalid `VITE_GOOGLE_MAPS_API_KEY` in `.env`.  
  - Maps JavaScript API not enabled in Google Cloud.

---

## 4. Season (real‑world)

- **Source:** **Location (latitude) + current date** — not game day, not random.
- **Logic:**  
  - Northern hemisphere: Mar–May → SPRING, Jun–Aug → SUMMER, Sep–Nov → FALL, Dec–Feb → WINTER.  
  - Southern hemisphere: opposite (e.g. Dec–Feb → SUMMER).
- **What you see:**  
  - **UI:** “Season” badge in the top bar (icon + name).  
  - **Canvas:**  
    - Tile and background colors change by season (green → gold → brown → snow-like).  
    - **WINTER** → snow overlay (falling particles).  
- **Fallback:** If no location is set, season falls back to a simple game‑week–based value.

---

## 5. Day and rounds (simulated)

- **Source:** **Game ticks** — **not** real-world date/time.
- **How:**  
  - Every **5 seconds** = 1 **round** (1 tick).  
  - **12 rounds** = 1 **day**.  
  - **Day** = `floor(tickCount / 12) + 1`.  
  - **Round** = `(tickCount % 12) + 1` (1–12 within the current day).  
  - **Rounds 1–6** = day (sun); **rounds 7–12** = night (moon, stars).
- **What you see:** Top bar: “Day 1 · Round 5/12”, etc. Tooltip: “Next round in Xs” and timing rules.  
- **So:** Day and rounds **advance only while you play**; they are **simulated** for game feel, not real time.  

See [GAME_RULES.md](./GAME_RULES.md) for economy, pause, and workshop use.

---

## 6. Town Gazette (Gemini)

- **Where:** Backend `/api/mayor-report` calls the **Gemini API**.
- **When:** Only when you click “Generate Mayor Report” (or similar) in the UI.
- **What you see:** AI‑generated “newspaper” about your town (stats, tips, etc.).
- **Why it might not work:**  
  - No `GEMINI_API_KEY` in `.env` → feature disabled, UI shows “Not enabled”.  
  - Invalid key or API errors → request fails.

---

## 7. Canvas and visuals

- **Land = background:** Canvas “land” and the page background use the **same** seasonal color (e.g. green in spring, snow-like in winter).
- **Weather overlays:**  
  - **Rain:** Shown when weather is `RAIN` and season is not `WINTER`.  
  - **Snow:** Shown when season is `WINTER` (regardless of weather).

---

## 8. Quick checklist

- **Weather not updating?** Check backend, `OPENWEATHERMAP_API_KEY`, and “Refresh Weather”.  
- **Maps not loading?** Check `VITE_GOOGLE_MAPS_API_KEY` and Maps API enablement.  
- **Season wrong?** It’s from **location + real date**; change location or check system date.  
- **Day always 1 / time not moving?** Day and time advance only with **ticks** (every 5 s); keep playing.  
- **Gemini / Gazette not working?** Add `GEMINI_API_KEY` and ensure the backend can reach the API.

---

## 9. See also

- [API_PURPOSES.md](./API_PURPOSES.md) — why each API is used.  
- [WEATHER_CONDITIONS.md](./WEATHER_CONDITIONS.md) — weather rules and effects.  
- [ENDPOINTS.md](./ENDPOINTS.md) — MockAPI CRUD for cloud saves.
