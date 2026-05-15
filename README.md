# real-estate-crystal-ball

Tampa Bay Real Estate Crystal Ball — a monitoring dashboard for
**Hillsborough (Tampa)** and **Pinellas (St. Petersburg)** counties.

Tracked in Jira project [RECB](https://codeboxx.atlassian.net/jira/software/projects/RECB/boards/320)
(epic [RECB-1](https://codeboxx.atlassian.net/browse/RECB-1)).

## Two ways to run it

The same data drives **two artifacts**:

| Mode | Use when | Entry point |
|---|---|---|
| **Local web app** | Local development, editing, testing | `npm start` → http://localhost:3000 |
| **Self-contained HTML** | The deliverable per RECB-1; what the weekly refresh task edits | `Tampa_Bay_Crystal_Ball.html` (open directly in a browser) |

The static file is generated from the live data — run `npm run build:static` to regenerate it.

## Quick start

```bash
npm install
npm start        # http://localhost:3000
```

That's it. No build step required for development.

### All scripts

```bash
npm start             # Production server on port 3000
npm run dev           # Same, with --watch reload
npm run build:static  # Regenerate Tampa_Bay_Crystal_Ball.html from data/dashboard.json
npm run validate:sources  # RECB-2: check every URL in dashboard.json resolves
```

## Architecture

```
real-estate-crystal-ball/
├── data/dashboard.json          ← single source of truth (refresh task edits this)
├── public/
│   ├── index.html               ← shell; fetches /api/data
│   ├── styles.css
│   └── app.js                   ← render + map logic (vanilla JS, no framework)
├── server/index.js              ← Express; serves public/ + /api/*
├── scripts/
│   ├── build-static.mjs         ← bundles into self-contained HTML
│   └── validate-sources.mjs     ← RECB-2 link checker
├── Tampa_Bay_Crystal_Ball.html  ← generated artifact; do not hand-edit
├── package.json
└── README.md
```

### API endpoints

| Method | Path | Returns |
|---|---|---|
| GET  | `/`                          | Dashboard HTML |
| GET  | `/api/data`                  | The full `dashboard.json` |
| GET  | `/api/health`                | `{ ok: true, ts }` |
| GET  | `/api/sources/categories`    | Source-directory category + count summary |
| POST | `/api/refresh`               | Refresh-info JSON (real refresh is via the scheduled task) |

## Sub-tasks covered

| Ticket | Surface | Status |
|---|---|---|
| [RECB-1](https://codeboxx.atlassian.net/browse/RECB-1) | Epic — the dashboard itself | ✅ End-to-end |
| [RECB-2](https://codeboxx.atlassian.net/browse/RECB-2) | Source Directory (9 categories, ~50 URLs) | ✅ `npm run validate:sources` passes with 0 hard failures |
| [RECB-3](https://codeboxx.atlassian.net/browse/RECB-3) | KPIs + indicator table + threshold doc | ✅ 8 KPIs with sources, 7 asset-class rows |
| [RECB-4](https://codeboxx.atlassian.net/browse/RECB-4) | Leaflet map + overlays + heatmap + right-rail | ✅ Status filters, submarket overlays, permit heatmap, marker rail |
| [RECB-5](https://codeboxx.atlassian.net/browse/RECB-5) | 14-day hearings + highlight tags | ✅ Client-side rolling window, zoning/cra/landuse tags |
| [RECB-6](https://codeboxx.atlassian.net/browse/RECB-6) | Top-5 transactions + foreclosure pulse + Recent Sales | ✅ Priority-ranked, sparkline, 30-day sales table |
| [RECB-7](https://codeboxx.atlassian.net/browse/RECB-7) | Weekly refresh task (`tampa-bay-crystal-ball-refresh`) | ⚠ Scheduled remote agent setup pending |
| [RECB-8](https://codeboxx.atlassian.net/browse/RECB-8) | Future expansion (parking lot) | n/a — promote items individually |

## How the weekly refresh edits the data

The scheduled task `tampa-bay-crystal-ball-refresh` runs every Monday 06:30 ET. Its
contract:

1. Edit **only** `data/dashboard.json` — never `public/*`, `server/*`, or `scripts/*`.
2. Preserve the JSON top-level keys and shapes (see the `.json` for the schema).
3. After editing, run `npm run build:static` so the standalone HTML matches.
4. Stamp `refresh.lastRefreshed` and `refresh.lastRefreshedDisplay`.
5. Rotate stale items off (past hearings, completed projects).
6. Run `npm run validate:sources`; fix any new hard 404s.
7. Commit with subject `RECB-7: weekly refresh <YYYY-MM-DD>` and summarize deltas
   in under 200 words.

## Direction-pill thresholds (RECB-3)

| Pill | Threshold |
|---|---|
| **hot** | Vacancy < 5% AND rent growth > 5% YoY |
| **balanced** | Vacancy 5–8% AND rent growth 0–5% YoY |
| **cool** | Vacancy > 8% OR negative absorption two quarters |
| **constrained** | Low new supply AND demand persistently above delivery |
| **generational** | Single development materially reshapes submarket inventory or zoning |

## Local dev notes

- Node 18.17+ required (uses native `fetch` and `--watch`).
- The static HTML loads Leaflet from unpkg CDN — works offline only on first load
  after the browser has cached the assets.
- Frontend is intentionally vanilla JS — no build step, no framework. Consistent
  with the "self-contained HTML" ethos of the epic deliverable.
