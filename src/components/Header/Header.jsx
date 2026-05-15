import { RefreshCw, MapPin, Activity } from 'lucide-react';
import './Header.css';

export default function Header({ lastUpdated, onRefresh, loading }) {
  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <div className="header-icon">
          <Activity size={24} />
        </div>
        <div className="header-titles">
          <h1>Tampa Bay Real Estate Crystal Ball</h1>
          <p className="header-subtitle">
            <MapPin size={12} />
            Live monitoring across Hillsborough · Pinellas · Pasco · Manatee counties
          </p>
        </div>
      </div>

      <div className="header-meta">
        <span className="last-updated">
          {lastUpdated ? `Updated ${lastUpdated}` : 'Initializing…'}
        </span>
        <button
          className={`refresh-btn ${loading ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh all data"
        >
          <RefreshCw size={16} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}
