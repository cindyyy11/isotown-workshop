# Checkpoints – Workshop TODO Answers

This folder contains **answers and solutions** for each workshop TODO. Use them as an instructor answer key or to verify participant work.

---

## Index

| # | File | TODO | Topic | Difficulty |
|---|------|------|--------|------------|
| 1 | [#1 checkpoint.md](./#1%20checkpoint.md) | TODO #1 | Debugging – cached weather `console.log` | Easy |
| 2 | [#2 checkpoint.md](./#2%20checkpoint.md) | TODO #2 | Debugging – fresh fetch `console.log` | Easy |
| 3 | [#3 checkpoint.md](./#3%20checkpoint.md) | TODO #3 | Express – `GET /api/version` | Medium |
| 4 | [#4 checkpoint.md](./#4%20checkpoint.md) | TODO #4 | Data – add PARK building in `buildingData.js` | Challenge (Easy) |
| 5 | [#5 checkpoint.md](./#5%20checkpoint.md) | TODO #5 | UI – PARK button in toolbar | Challenge (Easy) |
| 6 | [#6 checkpoint.md](./#6%20checkpoint.md) | TODO #6 | UX – better error when listing saves fails | Easy |
| 7 | [#7 checkpoint.md](./#7%20checkpoint.md) | TODO #7 | UX – better error when loading a save fails | Easy |
| 8 | [#8 checkpoint.md](./#8%20checkpoint.md) | TODO #8 | Full-stack – “notes” field (MockAPI + API + UI) | Challenge (Hard) |

---

## Where the TODOs live in the codebase

| TODO | File | Approx. location |
|------|------|-------------------|
| #1 | `src/services/weatherService.js` | `fetchWeather`, `if (cached)` block |
| #2 | `src/services/weatherService.js` | `fetchWeather`, before `try` |
| #3 | `server/index.js` | After `/health`, before capabilities |
| #4 | `src/data/buildingData.js` | Inside `BUILDING_TYPES`, after FIRE |
| #5 | `src/App.jsx` | Toolbar, after FIRE button |
| #6 | `src/components/SavesPanel.jsx` | `loadList` catch block |
| #7 | `src/components/SavesPanel.jsx` | `handleLoad` catch block |
| #8 | MockAPI + `src/services/savesApiService.js` + `src/components/SavesPanel.jsx` | createSave/updateSave body; SavesPanel state + UI |

---

## How to use these checkpoints

- **Instructor:** Use each `#N checkpoint.md` as the answer key for that TODO. You can share the file after the checkpoint or keep it as reference.
- **Participants:** After attempting a TODO, compare with the checkpoint file to verify or fix their solution.
- **Order:** #1 and #2 can be done in any order. #4 must be done before #5. #8 is full-stack and can be done last.

---

## Quick test commands (for instructor)

- **TODO #3:** `curl http://localhost:5176/api/version` or GET in Postman/Swagger.
- **TODO #1/#2:** Change location in app, watch browser Console and Network tab.
- **TODO #4+#5:** Place a PARK on the grid, confirm happiness increases.
- **TODO #6/#7:** Break MockAPI URL or load a missing save, check error text.
- **TODO #8:** Save with notes, reload, load save, confirm notes persist.
