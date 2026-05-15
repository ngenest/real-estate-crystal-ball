(async function () {
  'use strict';

  const TYPE_COLOR = {
    mixed:       getCSS('--cyan'),
    residential: getCSS('--green'),
    industrial:  getCSS('--amber'),
    masterplan:  getCSS('--purple'),
    office:      getCSS('--red')
  };

  let data;
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
  } catch (err) {
    document.getElementById('loading').remove();
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Failed to load dashboard data: ' + err.message;
    document.getElementById('main').appendChild(div);
    return;
  }

  document.getElementById('loading').remove();
  document.getElementById('content').hidden = false;

  renderRefresh(data.refresh);
  renderKpis(data.kpis);
  renderMap(data);
  renderProjects(data.projects);
  renderIndicators(data.indicators, data.indicatorThresholds);
  renderHearings(data.hearings, data.refresh.lastRefreshed);
  renderTransactions(data.transactions);
  renderForeclosurePulse(data.foreclosurePulse);
  renderSales(data.recentSales);
  renderSources(data.sources);

  // ---------- renderers ----------

  function renderRefresh(refresh) {
    document.getElementById('refresh-date').textContent = refresh.lastRefreshedDisplay || refresh.lastRefreshed;
    document.getElementById('refresh-schedule').textContent = refresh.schedule;
    document.getElementById('refresh-task').textContent = refresh.scheduledTask;
  }

  function renderKpis(kpis) {
    document.getElementById('kpi-grid').innerHTML = kpis.map(k => `
      <div class="kpi">
        <div class="label">${esc(k.label)}</div>
        <div class="value">${esc(k.value)}</div>
        <div class="delta">${esc(k.delta)}</div>
        <div class="src">Source: <a href="${esc(k.sourceUrl)}" target="_blank" rel="noopener">${esc(k.sourceName)}</a></div>
      </div>
    `).join('');
  }

  function renderMap({ projects, submarkets, permitHeat }) {
    const map = L.map('map', { scrollWheelZoom: false }).setView([27.87, -82.55], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    const markerByName = {};
    projects.forEach(p => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 9,
        color: '#0b1220',
        weight: 2,
        fillColor: TYPE_COLOR[p.type] || '#fff',
        fillOpacity: 0.9
      })
      .bindPopup(`
        <strong>${esc(p.name)}</strong><br>
        ${esc(p.region)}<br>
        Status: ${esc(p.status)}<br>
        Value: ${esc(p.value)}<br>
        <a href="#" data-rail="${esc(p.name)}">More details &rarr;</a>
      `)
      .addTo(map);
      m.on('popupopen', e => {
        const link = e.popup.getElement().querySelector('[data-rail]');
        if (link) link.addEventListener('click', ev => { ev.preventDefault(); openRail(p); });
      });
      markerByName[p.name] = { marker: m, status: p.status };
    });

    document.querySelectorAll('.map-controls [data-status]').forEach(cb => {
      cb.addEventListener('change', () => {
        const allowed = new Set(
          Array.from(document.querySelectorAll('.map-controls [data-status]:checked'))
               .map(x => x.dataset.status)
        );
        Object.entries(markerByName).forEach(([_, { marker, status }]) => {
          if (allowed.has(status)) marker.addTo(map);
          else map.removeLayer(marker);
        });
      });
    });

    const submarketLayer = L.layerGroup(
      submarkets.map(s => L.polygon(s.polygon, {
        color: getCSS('--accent-2'),
        weight: 1,
        fillColor: getCSS('--accent-2'),
        fillOpacity: 0.08
      }).bindTooltip(s.name, { permanent: false, direction: 'center' }))
    );
    document.getElementById('layer-submarkets').addEventListener('change', e => {
      if (e.target.checked) submarketLayer.addTo(map);
      else map.removeLayer(submarketLayer);
    });

    const heatLayer = window.L.heatLayer
      ? L.heatLayer(permitHeat, { radius: 30, blur: 25, maxZoom: 12,
          gradient: { 0.2: '#4cc2ff', 0.5: '#7c5cff', 0.8: '#ffb347', 1.0: '#ff5d6c' } })
      : null;
    document.getElementById('layer-heatmap').addEventListener('change', e => {
      if (!heatLayer) return;
      if (e.target.checked) heatLayer.addTo(map);
      else map.removeLayer(heatLayer);
    });

    const rail = document.getElementById('map-rail');
    const railContent = document.getElementById('rail-content');
    document.getElementById('rail-close').addEventListener('click', closeRail);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRail(); });

    function openRail(p) {
      railContent.innerHTML = `
        <h3>${esc(p.name)}</h3>
        <div class="row"><span>Region</span><strong>${esc(p.region)}</strong></div>
        <div class="row"><span>Status</span><strong>${esc(p.status)}</strong></div>
        <div class="row"><span>Type</span><strong>${esc(p.type)}</strong></div>
        <div class="row"><span>Value</span><strong>${esc(p.value)}</strong></div>
        <div class="row"><span>Acres</span><strong>${esc(p.acres)}</strong></div>
        <div class="row"><span>Sq ft</span><strong>${esc(p.sqft)}</strong></div>
        <div class="row"><span>Units</span><strong>${esc(p.units)}</strong></div>
        <div class="row"><span>Phase</span><strong>${esc(p.phase)}</strong></div>
        <p style="margin-top:14px;font-size:13px;color:var(--muted);">${esc(p.history)}</p>
        <a class="src-btn" href="${esc(p.source)}" target="_blank" rel="noopener">Open primary source &rarr;</a>
      `;
      rail.classList.add('open');
      rail.setAttribute('aria-hidden', 'false');
    }
    function closeRail() {
      rail.classList.remove('open');
      rail.setAttribute('aria-hidden', 'true');
    }
  }

  function renderProjects(projects) {
    document.getElementById('proj-grid').innerHTML = projects.map(p => `
      <div class="proj">
        <h3>${esc(p.name)}</h3>
        <div class="row"><span>Region</span><strong>${esc(p.region)}</strong></div>
        <div class="row"><span>Status</span><strong>${esc(p.status)}</strong></div>
        <div class="row"><span>Value</span><strong>${esc(p.value)}</strong></div>
        <div class="row" style="margin-top:8px"><span class="type type-${esc(p.type)}">${esc(p.type)}</span><a href="${esc(p.source)}" target="_blank" rel="noopener">Source &rarr;</a></div>
      </div>
    `).join('');
  }

  function renderIndicators(indicators, thresholds) {
    document.getElementById('indicators-body').innerHTML = indicators.map(i => `
      <tr>
        <td><strong>${esc(i.cls)}</strong></td>
        <td><span class="pill pill-${esc(i.dir)}">${esc(i.dir)}</span></td>
        <td>${esc(i.vac)}</td>
        <td>${esc(i.price)}</td>
        <td>${esc(i.cap)}</td>
        <td>${esc(i.note)}</td>
      </tr>
    `).join('');
    document.getElementById('threshold-summary').innerHTML = Object.entries(thresholds)
      .map(([k, v]) => `<code>${esc(k)}</code> = ${esc(v)}`).join(' &middot; ');
  }

  function renderHearings(hearings, refreshIso) {
    const today = new Date(refreshIso || Date.now());
    today.setHours(0, 0, 0, 0);
    const horizon = new Date(today); horizon.setDate(horizon.getDate() + 14);
    const live = hearings
      .filter(h => {
        const d = new Date(h.when + 'T00:00:00');
        return d >= today && d <= horizon;
      })
      .sort((a, b) => a.when.localeCompare(b.when));
    document.getElementById('hearings-count').textContent = `${live.length} in next 14 days`;
    document.getElementById('hearings-list').innerHTML = live.map(h => `
      <li>
        <span class="when">${esc(h.when)}</span>
        <a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.title)}</a>
        ${h.tag ? `<span class="tag">${esc(h.tag)}</span>` : ''}
        ${(h.highlights || []).map(k => `<span class="tag tag-${esc(k)}">${esc(k)}</span>`).join('')}
      </li>
    `).join('') || '<li><em>No hearings in the next 14 days.</em></li>';
  }

  function renderTransactions(transactions) {
    const top = [...transactions]
      .sort((a, b) => (a.priority || 99) - (b.priority || 99))
      .slice(0, 5);
    document.getElementById('transactions-list').innerHTML = top.map((t, idx) => `
      <li class="feed-row ${idx === 0 ? 'priority' : ''}">
        <span class="when">${esc(t.when)}</span>
        <a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.title)}</a>
        ${(t.tags || []).map(k => `<span class="tag tag-${esc(k)}">${esc(k)}</span>`).join('')}
      </li>
    `).join('');
  }

  function renderForeclosurePulse(pulse) {
    drawSparkline('foreclosure-chart', pulse);
    if (pulse && pulse.length >= 6) {
      document.getElementById('foreclosure-chart-sub').textContent =
        `Last ${pulse.length} weeks. Latest: ${pulse[pulse.length-1]} filings.`;
    } else {
      document.getElementById('foreclosure-chart-sub').textContent =
        `Needs 6 weeks of accrued data before trend is meaningful — currently ${pulse?.length || 0}.`;
    }
  }

  function renderSales(sales) {
    document.getElementById('sales-body').innerHTML = [...sales]
      .sort((a, b) => b.when.localeCompare(a.when))
      .map(s => `
        <tr>
          <td>${esc(s.when)}</td>
          <td>${esc(s.property)}<br><span style="color:var(--muted);font-size:11px;">${esc(s.city)}</span></td>
          <td><span class="class">${esc(s.assetClass)}</span></td>
          <td class="num">${formatPrice(s.price)}</td>
          <td class="num">${s.psf ? '$' + s.psf : '—'}</td>
          <td>${esc(s.buyer)} ← ${esc(s.seller)}</td>
          <td><a href="${esc(s.source)}" target="_blank" rel="noopener">Source</a></td>
        </tr>
      `).join('');
  }

  function renderSources(sources) {
    document.getElementById('sources-grid').innerHTML = Object.entries(sources).map(([cat, items]) => `
      <div class="source-cat">
        <h4>${esc(cat)}</h4>
        <ul>${items.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul>
      </div>
    `).join('');
  }

  // ---------- helpers ----------

  function drawSparkline(id, data) {
    const svg = document.getElementById(id);
    if (!svg || !data || !data.length) return;
    const W = 600, H = 140, pad = 12;
    const max = Math.max(...data), min = Math.min(...data);
    const range = Math.max(1, max - min);
    const step = (W - pad * 2) / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => [pad + i * step, H - pad - ((v - min) / range) * (H - pad * 2)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area = `M${pts[0][0]},${H-pad} ${line.replace(/^M/, 'L')} L${pts[pts.length-1][0]},${H-pad} Z`;
    svg.innerHTML = `
      <path d="${area}" fill="rgba(255,93,108,0.15)" />
      <path d="${line}" fill="none" stroke="${getCSS('--hot')}" stroke-width="2" />
      ${pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${getCSS('--hot')}" />`).join('')}
    `;
  }

  function formatPrice(n) {
    if (n == null) return '—';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + n;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
})();
