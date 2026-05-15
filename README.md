# real-estate-crystal-ball

Tampa Bay Real Estate Crystal Ball — a self-contained monitoring dashboard for
**Hillsborough (Tampa)** and **Pinellas (St. Petersburg)** counties.

Tracked in Jira project [RECB](https://codeboxx.atlassian.net/jira/software/projects/RECB/boards/320)
(epic [RECB-1](https://codeboxx.atlassian.net/browse/RECB-1)).

## Deliverable

[`Tampa_Bay_Crystal_Ball.html`](Tampa_Bay_Crystal_Ball.html) — a single
self-contained HTML file. No build step, no server. Open it in a browser.

Auto-refreshed every **Monday 06:30 ET** by the scheduled task
`tampa-bay-crystal-ball-refresh` (RECB-7).

## What it covers

- **Market KPIs** — median price, vacancy, pipeline, absorption (RECB-3)
- **Geographic map** — Leaflet + OSM, color-coded markers (RECB-4)
- **Projects to Watch** — Water Street, Ybor Harbor, Gasworx, ONE Tampa,
  Historic Gas Plant District, St. Pete Pier, East Tampa Industrial, …
- **Indicators table** — direction pills (hot / balanced / cool /
  constrained / generational) per asset class
- **Hearings & policy** — Tampa Council, CRA, St. Pete DRC, Plan Hillsborough
  (RECB-5)
- **Transactions & legal** — foreclosure flows, M&A, lis pendens, FL bills
  (RECB-6)
- **Source directory** — permits, planning, courts, brokers, news, MLS,
  policy (RECB-2)

## File layout

```
Tampa_Bay_Crystal_Ball.html   ← the whole product
README.md                     ← this file
LICENSE
```

## How the weekly refresh edits the file

The refresh job is expected to **surgically replace data only**, never touch
layout or CSS. Each editable region is fenced with a comment marker pair:

```html
<!-- DATA:refresh START --> ... <!-- DATA:refresh END -->
<!-- DATA:kpis    START --> ... <!-- DATA:kpis    END -->
```

And inside the `<script>` data block:

```js
/* DATA:projects START */     /* DATA:projects END */
/* DATA:indicators START */   /* DATA:indicators END */
/* DATA:hearings START */     /* DATA:hearings END */
/* DATA:transactions START */ /* DATA:transactions END */
/* DATA:sources START */      /* DATA:sources END */
```

Rules for the refresh job:

1. Replace **only** the bytes between a matching START / END pair.
2. Do **not** rename variables (`projects`, `indicators`, `hearings`,
   `transactions`, `sources`, `indicatorThresholds`).
3. Do **not** edit any `<style>` block or render logic.
4. Stamp the new run date inside `<!-- DATA:refresh -->`.
5. Rotate stale items off (past hearings, completed projects).

## Local preview

Just open the file:

```bash
# macOS
open Tampa_Bay_Crystal_Ball.html
# Windows
start Tampa_Bay_Crystal_Ball.html
```

No server required. Leaflet loads from CDN.
