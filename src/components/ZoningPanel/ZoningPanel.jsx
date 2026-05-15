import { Map, ChevronRight, ArrowRight } from 'lucide-react';
import { formatDate, statusColor, shortAddress } from '../../utils/formatters.js';
import { ZONING_CATEGORIES } from '../../data/dataSources.js';
import './ZoningPanel.css';

function getCategoryInfo(fromZone, toZone) {
  const search = (toZone || fromZone || '').toUpperCase();
  if (search.includes('RS') || search.includes('SINGLE')) return ZONING_CATEGORIES[0];
  if (search.includes('RM') || search.includes('MULTI')) return ZONING_CATEGORIES[1];
  if (search.includes('CG') || search.includes('C-2')) return ZONING_CATEGORIES[2];
  if (search.includes('CI')) return ZONING_CATEGORIES[3];
  if (search.includes('IND') || search.includes('I-')) return ZONING_CATEGORIES[4];
  if (search.includes('PD') || search.includes('MU') || search.includes('DT')) return ZONING_CATEGORIES[5];
  return null;
}

const ZONING_TYPE_COLORS = {
  Rezoning: '#a855f7',
  Variance: '#f59e0b',
  'Planned Development': '#3b82f6',
  'Future Land Use Amendment': '#ef4444',
  'Special Use Permit': '#06b6d4',
};

export default function ZoningPanel({ zoning, loading, selectedRegion }) {
  const filtered = (zoning || []).filter(
    (z) => !selectedRegion || z.region === selectedRegion
  );

  const approvedCount = filtered.filter((z) => z.status === 'Approved').length;
  const pendingCount = filtered.filter(
    (z) => z.status === 'Pending' || z.status === 'Under Review'
  ).length;

  return (
    <div className="panel zoning-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Map size={18} />
          <span>Zoning Activity</span>
        </div>
        <span className="panel-count">{filtered.length} cases</span>
      </div>

      <div className="zoning-stats">
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value zoning-approved">{approvedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending / Review</span>
          <span className="stat-value zoning-pending">{pendingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Cases</span>
          <span className="stat-value zoning-total">{filtered.length}</span>
        </div>
      </div>

      <div className="panel-list">
        {loading ? (
          <div className="panel-loading">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">No zoning cases for selected region.</div>
        ) : (
          filtered.map((item) => {
            const catInfo = getCategoryInfo(item.from_zone, item.to_zone);
            const typeColor = ZONING_TYPE_COLORS[item.type] || '#94a3b8';
            return (
              <div key={item.id} className="zoning-item">
                <div className="zoning-left">
                  <div className="zoning-type-badge" style={{ color: typeColor, borderColor: `${typeColor}40` }}>
                    {item.type}
                  </div>
                </div>
                <div className="zoning-body">
                  <div className="zoning-top">
                    <span className="zoning-id">{item.id}</span>
                    <span className={`status-badge ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="zoning-zones">
                    <span className="zone-tag from">{item.from_zone}</span>
                    <ArrowRight size={12} className="zone-arrow" />
                    <span className="zone-tag to" style={{ borderColor: catInfo?.color || '#94a3b8', color: catInfo?.color || '#94a3b8' }}>
                      {item.to_zone}
                    </span>
                  </div>
                  <div className="zoning-address">{shortAddress(item.address)}</div>
                  <div className="zoning-desc">{item.description?.slice(0, 120)}</div>
                  <div className="zoning-meta">
                    <span>Hearing: {formatDate(item.hearing_date)}</span>
                    {item.approved_date && (
                      <span>Approved: {formatDate(item.approved_date)}</span>
                    )}
                    <span>{item.applicant}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="item-arrow" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
