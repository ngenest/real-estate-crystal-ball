import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(root, 'public'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache')
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/api/data', async (_req, res) => {
  try {
    const raw = await readFile(path.join(root, 'data', 'dashboard.json'), 'utf-8');
    res.type('application/json').send(raw);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to read dashboard.json: ' + err.message });
  }
});

app.post('/api/refresh', async (_req, res) => {
  res.json({
    ok: true,
    message: 'Refresh is operated by the scheduled remote agent `tampa-bay-crystal-ball-refresh` (RECB-7). Manual local refresh not implemented.',
    nextScheduled: 'Monday 06:30 ET'
  });
});

app.get('/api/sources/categories', async (_req, res) => {
  try {
    const raw = await readFile(path.join(root, 'data', 'dashboard.json'), 'utf-8');
    const { sources } = JSON.parse(raw);
    res.json({
      ok: true,
      categories: Object.keys(sources),
      counts: Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, v.length]))
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Tampa Bay Crystal Ball — http://localhost:${PORT}`);
  console.log(`  GET  /                       → dashboard`);
  console.log(`  GET  /api/data               → dashboard data`);
  console.log(`  GET  /api/health             → liveness check`);
  console.log(`  GET  /api/sources/categories → source-directory summary`);
  console.log(`  POST /api/refresh            → refresh trigger info`);
});
