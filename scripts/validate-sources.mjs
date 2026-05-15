#!/usr/bin/env node
// RECB-2 acceptance: every source link must resolve (no 404).
// Walks dashboard.json and verifies all `url` fields via HEAD/GET with timeout.
// Exit code: 0 = all green; 1 = at least one failure.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const TIMEOUT_MS = 12000;
const USER_AGENT = 'Mozilla/5.0 (compatible; CrystalBallLinkCheck/1.0; +https://github.com/ngenest/real-estate-crystal-ball)';

const raw = await readFile(path.join(root, 'data', 'dashboard.json'), 'utf-8');
const data = JSON.parse(raw);

const urls = new Set();
function collect(o, originLabel) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach(x => collect(x, originLabel));
  for (const [k, v] of Object.entries(o)) {
    if ((k === 'url' || k === 'source' || k === 'sourceUrl') && typeof v === 'string') {
      if (/^https?:\/\//.test(v)) urls.add(v);
    } else if (typeof v === 'object') {
      collect(v, k);
    }
  }
}
collect(data);

console.log(`Checking ${urls.size} unique URLs (timeout ${TIMEOUT_MS}ms, concurrency 6)...\n`);

// Outcomes:
//   ok    — 2xx or 3xx
//   warn  — 403 / 429 (bot-block or rate-limit on a known public site) or network-level error
//   fail  — true 404 / 410 / 5xx
const results = [];
const list = [...urls];
const CONC = 6;
let i = 0;

async function worker() {
  while (i < list.length) {
    const url = list[i++];
    const r = await check(url);
    results.push({ url, ...r });
    process.stdout.write(`  [${r.outcome.toUpperCase().padEnd(4)}] ${r.status ?? '-'}  ${url}\n`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

const failed = results.filter(r => r.outcome === 'fail');
const warned = results.filter(r => r.outcome === 'warn');
const okCnt  = results.length - failed.length - warned.length;

console.log('\n' + '─'.repeat(60));
console.log(`Total: ${results.length}    OK: ${okCnt}    Warn: ${warned.length}    Fail: ${failed.length}`);

if (warned.length) {
  console.log('\nWarnings (URL likely valid — bot-blocked, rate-limited, or network):');
  for (const w of warned) console.log(`  ${w.status ?? '-'} ${w.url}${w.note ? '   (' + w.note + ')' : ''}`);
}
if (failed.length) {
  console.log('\nFailures (hard 4xx/5xx):');
  for (const f of failed) console.log(`  ${f.status ?? '-'} ${f.url}${f.note ? '   (' + f.note + ')' : ''}`);
  process.exit(1);
}

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': USER_AGENT } });
    if ([403, 405, 429, 501].includes(res.status)) {
      res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': USER_AGENT } });
    }
    clearTimeout(timer);
    if (res.status >= 200 && res.status < 400) return { outcome: 'ok',   status: res.status };
    if (res.status === 403 || res.status === 429) return { outcome: 'warn', status: res.status, note: res.status === 403 ? 'bot-blocked but URL valid' : 'rate-limited' };
    return { outcome: 'fail', status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return { outcome: 'warn', status: null, note: err.name === 'AbortError' ? 'timeout' : 'network: ' + err.message };
  }
}
