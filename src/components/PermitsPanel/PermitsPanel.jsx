import { Building2, Filter, ChevronRight } from 'lucide-react';
import { PERMIT_TYPES } from '../../data/dataSources.js';
import { formatCurrency, formatDate, statusColor, shortAddress } from '../../utils/formatters.js';
import { useState } from 'react';
import './PermitsPanel.css';

export default function PermitsPanel({ permits, loading, selectedRegion }) {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = (permits || []).filter((p) => {
    if (selectedRegion && p.region !== selectedRegion) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: filtered.length,
    issued: filtered.filter((p) => p.status?.toLowerCase().includes('issued')).length,
    totalValue: filtered.reduce((s, p) => s + (p.value || 0), 0),
    newConstruction: filtered.filter((p) => p.type === 'new-construction').length,
  };

  return (
    <div className="panel permits-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Building2 size={18} />
          <span>Building Permits</span>
        </div>
        <span className="panel-count">{stats.total} permits</span>
      </div>

      {/* Summary stats */}
      <div className="permits-stats">
        <div className="stat-card">
          <span className="stat-label">Issued</span>
          <span className="stat-value">{stats.issued}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">New Construction</span>
          <span className="stat-value">{stats.newConstruction}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Value</span>
          <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
        </div>
      </div>

      {/* Type filter */}
      <div className="panel-filters">
        <Filter size={12} />
        <button
          className={`filter-chip ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          All
        </button>
        {PERMIT_TYPES.map((pt) => (
          <button
            key={pt.id}
            className={`filter-chip ${typeFilter === pt.id ? 'active' : ''}`}
            onClick={() => setTypeFilter(pt.id)}
            style={{ '--chip-color': pt.color }}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Permits list */}
      <div className="panel-list">
        {loading ? (
          <div className="panel-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">No permits found for the selected filters.</div>
        ) : (
          filtered.map((permit) => {
            const pt = PERMIT_TYPES.find((p) => p.id === permit.type);
            return (
              <div key={permit.id} className="permit-item">
                <div className="permit-dot" style={{ background: pt?.color || '#94a3b8' }} />
                <div className="permit-body">
                  <div className="permit-top">
                    <span className="permit-id">{permit.id}</span>
                    <span className={`status-badge ${statusColor(permit.status)}`}>
                      {permit.status}
                    </span>
                  </div>
                  <div className="permit-subtype">{permit.subtype}</div>
                  <div className="permit-address">{shortAddress(permit.address)}</div>
                  <div className="permit-meta">
                    <span>{formatCurrency(permit.value)}</span>
                    {permit.units ? <span>{permit.units} units</span> : null}
                    <span>{formatDate(permit.date_issued || permit.date_applied)}</span>
                  </div>
                  {permit.description && (
                    <div className="permit-desc">{permit.description.slice(0, 120)}</div>
                  )}
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
