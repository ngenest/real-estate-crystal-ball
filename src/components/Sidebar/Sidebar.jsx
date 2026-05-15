import { REGIONS } from '../../data/regions.js';
import './Sidebar.css';

export default function Sidebar({ selectedRegion, onRegionChange, activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'map', label: 'Map View', icon: '🗺️' },
    { id: 'permits', label: 'Permits', icon: '🏗️' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'zoning', label: 'Zoning', icon: '📐' },
    { id: 'hearings', label: 'Hearings', icon: '🏛️' },
    { id: 'news', label: 'News & Media', icon: '📰' },
    { id: 'market', label: 'Market Data', icon: '📈' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Dashboard Views</div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-regions">
        <div className="sidebar-section-label">Filter by Region</div>
        <button
          className={`region-chip ${!selectedRegion ? 'active' : ''}`}
          onClick={() => onRegionChange(null)}
        >
          All Tampa Bay
        </button>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`region-chip ${selectedRegion === r.id ? 'active' : ''}`}
            onClick={() => onRegionChange(r.id)}
            style={{ '--region-color': r.color }}
          >
            <span className="region-dot" style={{ background: r.color }} />
            {r.name}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <p>Data sources: Tampa Open Data · Hillsborough HCPA · Pinellas PCPAO · FEMA · FRED · US Census</p>
      </div>
    </aside>
  );
}
