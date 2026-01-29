# Gemini API in IsoTown

## What It Does

The **Gemini API** powers the **Town Gazette** (Mayor Report): AI-generated, context-aware news about your town.

- **HEADLINE** — Short, fun headline based on coins, population, jobs, happiness, weather, tax, and recent city log.
- **CITIZEN SAYS** — A fictional resident quote (e.g. “Pixel Pete”) that matches town mood (struggling vs thriving).
- **MAYOR'S TIP** — One concrete suggestion: e.g. build a Restaurant, add Police/Fire, connect roads, lower tax, etc.

The backend sends **stats**, **weather**, **tax rate**, and **recent city log** to Gemini so tips and tone stay relevant.

---

## When It Runs

1. **Manual** — Click the Gazette button in the action bar, then “Print Today’s Edition” in the panel.
2. **Auto** — Low happiness (<5), very low coins (<3), or every 20 ticks → report is generated and the panel opens.
3. **Town square** — Walk your character (WASD) to the center tiles (5,5) or (6,6) → report is generated and panel opens.

---

## How to Verify It Works

1. **Backend** — Ensure the server is running and `GEMINI_API_KEY` is set in the server `.env`.
2. **Capabilities** — On load, the app calls `/api/capabilities`. If `gemini: true`, the Gazette button and panel are enabled.
3. **Generate** — Click the Gazette button → “Print Today’s Edition”. You should see “Printing…” then HEADLINE / CITIZEN / TIP.
4. **Town square** — Move your character (WASD) to the center tiles (5,5) or (6,6). The Gazette panel opens with a new report. This is throttled to once every 30 seconds to avoid spamming the API.
5. **Network** — In DevTools → Network, filter by “mayor-report”. You should see a `POST` to `/api/mayor-report` returning JSON with `report` and `parsed`.
6. **Errors** — If the request fails (no key, network error, etc.), the Gazette panel shows a clear error message. Fix config or network and click “Print Today’s Edition” again to retry.

---

## If It Doesn’t Work

- **“Not enabled” / key not used**  
  - Put the key in a **`.env`** file in the **project root** (same folder as `package.json`), **not** in `server/`.  
  - Use exactly: `GEMINI_API_KEY=your_key_here` (no spaces around `=`, no quotes).  
  - **Restart the server** after changing `.env` (keys are read only at startup).  
  - Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey) (not a Google Cloud API key).  
  - Check server startup logs: you should see `Gemini: CONFIGURED ✓` and `.env: loaded from ...`. If you see `NOT FOUND` or `NOT CONFIGURED`, fix `.env` location/format and restart.
- **“Printing…” forever** — Backend might be unreachable or Gemini might error. Check server logs and `/api/capabilities`, `/health`.
- **Red error in Gazette** — The app shows “Could not generate report…” or “Gemini request failed” when the fetch fails. Check server logs, `GEMINI_API_KEY`, and network (e.g. DNS, firewall).
- **Server log: "Gemini error: fetch failed" / "ENOTFOUND generativelanguage.googleapis.com"** — The key is loaded, but the **server cannot reach Google's API** (DNS/network). Ensure the machine running the server has internet, can resolve external domains, and isn't blocked by firewall/VPN/proxy. Try `curl -I https://generativelanguage.googleapis.com` from that machine.
- **Empty or generic report** — Gemini can sometimes return odd formatting. The server parses HEADLINE / CITIZEN / TIP; if parsing fails, the raw `report` string is still shown.

---

## Workshop Use

- **Intro to APIs** — Show the Network tab when generating a report; discuss REST, request/response, and how the frontend uses the result.
- **AI + app state** — Explain how stats, tax, and city log are sent to Gemini and how the UI updates from the response.
- **Feature gating** — Gemini is only used when `capabilities.gemini` is true, so the app still runs without a key (Gazette shows “Not enabled”).
