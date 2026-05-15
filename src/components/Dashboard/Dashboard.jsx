import { Building2, DollarSign, Map, Gavel, Newspaper, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { REGIONS } from '../../data/regions.js';
import './Dashboard.css';

export default function OverviewDashboard({
  permits,
  transactions,
  zoning,
  hearings,
  news,
  market,
  selectedRegion,
  onRegionChange,
  onTabChange,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const filteredPermits = (permits || []).filter((p) => !selectedRegion || p.region === selectedRegion);
  const filteredTxn = (transactions || []).filter((t) => !selectedRegion || t.region === selectedRegion);
  const filteredZoning = (zoning || []).filter((z) => !selectedRegion || z.region === selectedRegion);
  const filteredHearings = (hearings || []).filter((h) => !selectedRegion || h.region === selectedRegion);
  const upcomingHearings = filteredHearings.filter((h) => h.date >= today && h.status !== 'Concluded');

  const permitValue = filteredPermits.reduce((s, p) => s + (p.value || 0), 0);
  const txnVolume = filteredTxn.reduce((s, t) => s + (t.price || 0), 0);

  const regionData = selectedRegion && market?.byRegion?.[selectedRegion];
  const indicators = regionData || market?.overall;

  const summaryCards = [
    {
      id: 'permits',
      icon: Building2,
      label: 'Building Permits',
      value: filteredPermits.length,
      sub: `${formatCurrency(permitValue)} total value`,
      color: '#f97316',
      tab: 'permits',
    },
    {
      id: 'transactions',
      icon: DollarSign,
      label: 'Transactions',
      value: filteredTxn.length,
      sub: `${formatCurrency(txnVolume)} total volume`,
      color: '#22c55e',
      tab: 'transactions',
    },
    {
      id: 'zoning',
      icon: Map,
      label: 'Zoning Cases',
      value: filteredZoning.length,
      sub: `${filteredZoning.filter((z) => z.status === 'Approved').length} approved`,
      color: '#a855f7',
      tab: 'zoning',
    },
    {
      id: 'hearings',
      icon: Gavel,
      label: 'Upcoming Hearings',
      value: upcomingHearings.length,
      sub: `${filteredHearings.length} total tracked`,
      color: '#3b82f6',
      tab: 'hearings',
    },
    {
      id: 'news',
      icon: Newspaper,
      label: 'News Articles',
      value: (news || []).filter((n) => !selectedRegion || n.region === selectedRegion).length,
      sub: 'From Tampa Bay media',
      color: '#f59e0b',
      tab: 'news',
    },
    {
      id: 'market',
      icon: TrendingUp,
      label: 'YoY Price Change',
      value: indicators ? formatPercent(indicators.yoyPriceChange, true) : 'N/A',
      sub: `Median SFR: ${indicators ? formatCurrency(indicators.medianHomePriceSFR) : 'N/A'}`,
      color: '#e63946',
      tab: 'market',
    },
  ];

  return (
    <div className="overview-layout">
      {/* Summary cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              className="summary-card"
              style={{ '--card-color': card.color }}
              onClick={() => onTabChange(card.tab)}
            >
              <div className="card-icon-wrap" style={{ background: `${card.color}20` }}>
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div className="card-content">
                <div className="card-label">{card.label}</div>
                <div className="card-value">{card.value}</div>
                <div className="card-sub">{card.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Region cards */}
      <div className="overview-section">
        <h3 className="section-title">Tampa Bay Key Regions</h3>
        <div className="regions-grid">
          {REGIONS.map((region) => {
            const rData = market?.byRegion?.[region.id];
            const pCount = (permits || []).filter((p) => p.region === region.id).length;
            const tCount = (transactions || []).filter((t) => t.region === region.id).length;
            const isSelected = selectedRegion === region.id;

            return (
              <button
                key={region.id}
                className={`region-card ${isSelected ? 'selected' : ''}`}
                style={{ '--region-color': region.color }}
                onClick={() => onRegionChange(isSelected ? null : region.id)}
              >
                <div className="region-header">
                  <span className="region-dot-lg" style={{ background: region.color }} />
                  <div className="region-info">
                    <span className="region-name">{region.name}</span>
                    <span className="region-county">{region.county} County</span>
                  </div>
                </div>
                <div className="region-stats">
                  <div className="rstat">
                    <span className="rstat-val">{pCount}</span>
                    <span className="rstat-lbl">Permits</span>
                  </div>
                  <div className="rstat">
                    <span className="rstat-val">{tCount}</span>
                    <span className="rstat-lbl">Deals</span>
                  </div>
                  {rData && (
                    <div className="rstat">
                      <span className="rstat-val" style={{ color: rData.yoyPriceChange >= 0 ? '#4ade80' : '#f87171' }}>
                        {formatPercent(rData.yoyPriceChange, true)}
                      </span>
                      <span className="rstat-lbl">YoY</span>
                    </div>
                  )}
                  {rData && (
                    <div className="rstat">
                      <span className="rstat-val">{formatCurrency(rData.medianHomePriceSFR)}</span>
                      <span className="rstat-lbl">Med. SFR</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent activity feed */}
      <div className="overview-section">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-feed">
          {[
            ...(filteredPermits.slice(0, 3).map((p) => ({
              type: 'permit', icon: '🏗️', label: p.subtype,
              sub: p.address?.split(',')[0], date: p.date_issued || p.date_applied,
              color: '#f97316',
            }))),
            ...(filteredTxn.slice(0, 3).map((t) => ({
              type: 'transaction', icon: '💰', label: t.type,
              sub: `${formatCurrency(t.price)} – ${t.asset_class}`,
              date: t.date, color: '#22c55e',
            }))),
            ...(upcomingHearings.slice(0, 3).map((h) => ({
              type: 'hearing', icon: '🏛️', label: h.title,
              sub: `${h.body} · ${h.date}`, date: h.date, color: '#3b82f6',
            }))),
          ]
            .sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1)
            .slice(0, 8)
            .map((item, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{item.icon}</span>
                <div className="activity-body">
                  <div className="activity-label">{item.label}</div>
                  <div className="activity-sub">{item.sub}</div>
                </div>
                <div className="activity-date">{item.date}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
