/**
 * News aggregator service.
 * Fetches RSS feeds from Tampa Bay media sources via a public CORS proxy.
 * Falls back to seed data if parsing fails.
 */
import axios from 'axios';
import { SEED_NEWS } from '../data/seedData.js';

// Public CORS proxy for RSS feeds
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

const FEEDS = [
  {
    id: 'tampabay-times',
    name: 'Tampa Bay Times – Real Estate',
    url: 'https://www.tampabay.com/business/real-estate/feed/',
    source: 'Tampa Bay Times',
  },
  {
    id: 'tampabay-local',
    name: 'Tampa Bay Times – Local',
    url: 'https://www.tampabay.com/local/feed/',
    source: 'Tampa Bay Times',
  },
  {
    id: 'bizjournal',
    name: 'Tampa Bay Business Journal',
    url: 'https://www.bizjournals.com/tampabay/feed/news/',
    source: 'Tampa Bay Business Journal',
  },
  {
    id: 'stpete-catalyst',
    name: 'St. Pete Catalyst',
    url: 'https://stpetecatalyst.com/feed/',
    source: 'St. Pete Catalyst',
  },
];

/**
 * Parse an RSS XML string into article objects.
 */
function parseRssFeed(xml, sourceName) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const items = Array.from(doc.querySelectorAll('item'));

    return items.slice(0, 10).map((item, i) => ({
      id: `rss-${sourceName}-${i}`,
      title: item.querySelector('title')?.textContent?.trim() || '',
      source: sourceName,
      url: item.querySelector('link')?.textContent?.trim() ||
        item.querySelector('guid')?.textContent?.trim() || '#',
      date: item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString(),
      summary: stripHtml(
        item.querySelector('description')?.textContent?.trim() ||
          item.querySelector('summary')?.textContent?.trim() || ''
      ).slice(0, 280),
      category: 'News',
      region: guessRegion(
        (item.querySelector('title')?.textContent || '') +
          (item.querySelector('description')?.textContent || '')
      ),
    }));
  } catch {
    return [];
  }
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent ?? tmp.innerText ?? '').trim();
}

function guessRegion(text) {
  const t = text.toLowerCase();
  if (t.includes('south tampa') || t.includes('hyde park') || t.includes('palma ceia')) return 'south-tampa';
  if (t.includes('new tampa') || t.includes('wesley chapel') || t.includes('land o lake') || t.includes('lutz')) return 'new-tampa';
  if (t.includes('brandon') || t.includes('riverview')) return 'brandon';
  if (t.includes('westchase') || t.includes('citrus park')) return 'westchase';
  if (t.includes('st. pete') || t.includes('st pete') || t.includes('saint pete')) return 'st-pete';
  if (t.includes('clearwater')) return 'clearwater';
  if (t.includes('largo') || t.includes('pinellas park')) return 'largo';
  if (t.includes('dunedin') || t.includes('palm harbor')) return 'dunedin';
  if (t.includes('bradenton') || t.includes('sarasota')) return 'bradenton';
  if (t.includes('pasco')) return 'land-o-lakes';
  return 'tampa-downtown';
}

/**
 * Fetch a single RSS feed via CORS proxy.
 */
async function fetchFeed(feed) {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feed.url)}`;
    const { data } = await axios.get(proxyUrl, { timeout: 8000 });
    const xml = data.contents || data;
    if (typeof xml === 'string') {
      return parseRssFeed(xml, feed.source);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Fetch all configured RSS feeds in parallel.
 * Merges results with seed data, deduplicated by title.
 */
export async function fetchNews({ regionFilter = null } = {}) {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const liveArticles = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((a) => a.title && a.title.length > 5);

  // Merge live articles with seed data (live first), deduplicate by title
  const seen = new Set();
  const merged = [...liveArticles, ...SEED_NEWS].filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (regionFilter) {
    return merged.filter((a) => a.region === regionFilter);
  }

  return merged.slice(0, 20);
}
