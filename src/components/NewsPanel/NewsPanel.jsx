import { Newspaper, ExternalLink, Tag } from 'lucide-react';
import { formatDate, relativeTime } from '../../utils/formatters.js';
import { REGIONS } from '../../data/regions.js';
import './NewsPanel.css';

const CATEGORY_COLORS = {
  'Market Trends': '#f59e0b',
  'Major Development': '#ef4444',
  Development: '#f97316',
  'Affordable Housing': '#22c55e',
  'Zoning / Policy': '#a855f7',
  Demographics: '#3b82f6',
  'Risk / Environmental': '#06b6d4',
  News: '#94a3b8',
};

export default function NewsPanel({ news, loading, selectedRegion }) {
  const filtered = (news || []).filter(
    (n) => !selectedRegion || n.region === selectedRegion
  );

  const categories = [...new Set(filtered.map((n) => n.category))].filter(Boolean);

  return (
    <div className="panel news-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Newspaper size={18} />
          <span>News & Media Coverage</span>
        </div>
        <span className="panel-count">{filtered.length} articles</span>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="news-categories">
          {categories.map((cat) => {
            const count = filtered.filter((n) => n.category === cat).length;
            return (
              <div
                key={cat}
                className="cat-chip"
                style={{
                  background: `${CATEGORY_COLORS[cat] || '#94a3b8'}15`,
                  borderColor: `${CATEGORY_COLORS[cat] || '#94a3b8'}40`,
                  color: CATEGORY_COLORS[cat] || '#94a3b8',
                }}
              >
                {cat} <span className="cat-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="panel-list">
        {loading ? (
          <div className="panel-loading">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">No news for selected region.</div>
        ) : (
          filtered.map((article) => {
            const region = REGIONS.find((r) => r.id === article.region);
            return (
              <div key={article.id} className="news-item">
                <div className="news-body">
                  <div className="news-top">
                    <span
                      className="news-category"
                      style={{ color: CATEGORY_COLORS[article.category] || '#94a3b8' }}
                    >
                      <Tag size={10} />
                      {article.category}
                    </span>
                    <span className="news-date">{relativeTime(article.date)}</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-title"
                  >
                    {article.title}
                    <ExternalLink size={12} className="news-link-icon" />
                  </a>
                  {article.summary && (
                    <p className="news-summary">{article.summary}</p>
                  )}
                  <div className="news-meta">
                    <span className="news-source">{article.source}</span>
                    {region && (
                      <span className="news-region" style={{ color: region.color }}>
                        <span className="region-dot-sm" style={{ background: region.color }} />
                        {region.name}
                      </span>
                    )}
                    <span className="news-full-date">{formatDate(article.date)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
