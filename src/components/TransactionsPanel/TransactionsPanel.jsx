import { DollarSign, ChevronRight, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, shortAddress } from '../../utils/formatters.js';
import './TransactionsPanel.css';

const ASSET_COLORS = {
  'Office Tower': '#3b82f6',
  'Office Building': '#60a5fa',
  'Single-Family Residential': '#22c55e',
  'Multi-Family Residential': '#86efac',
  'Multifamily / Apartment': '#4ade80',
  'Industrial / Warehouse': '#f97316',
  'Retail / Mall': '#e879f9',
  'Residential Development Land': '#fbbf24',
  'Mixed-Use Development Land': '#fb923c',
  default: '#94a3b8',
};

function getAssetColor(assetClass) {
  return ASSET_COLORS[assetClass] || ASSET_COLORS.default;
}

export default function TransactionsPanel({ transactions, loading, selectedRegion }) {
  const filtered = (transactions || []).filter(
    (t) => !selectedRegion || t.region === selectedRegion
  );

  const totalVolume = filtered.reduce((s, t) => s + (t.price || 0), 0);
  const avgCapRate =
    filtered.filter((t) => t.cap_rate).length > 0
      ? filtered
          .filter((t) => t.cap_rate)
          .reduce((s, t) => s + t.cap_rate, 0) / filtered.filter((t) => t.cap_rate).length
      : null;

  return (
    <div className="panel transactions-panel">
      <div className="panel-header">
        <div className="panel-title">
          <DollarSign size={18} />
          <span>Recent Transactions</span>
        </div>
        <span className="panel-count">{filtered.length} deals</span>
      </div>

      <div className="txn-stats">
        <div className="stat-card">
          <span className="stat-label">Total Volume</span>
          <span className="stat-value txn-value">{formatCurrency(totalVolume)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Cap Rate</span>
          <span className="stat-value txn-value">
            {avgCapRate ? `${avgCapRate.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Deals Tracked</span>
          <span className="stat-value txn-value">{filtered.length}</span>
        </div>
      </div>

      <div className="panel-list">
        {loading ? (
          <div className="panel-loading">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">No transactions for selected region.</div>
        ) : (
          filtered.map((txn) => (
            <div key={txn.id} className="txn-item">
              <div
                className="txn-color-bar"
                style={{ background: getAssetColor(txn.asset_class) }}
              />
              <div className="txn-body">
                <div className="txn-top">
                  <span className="txn-type">{txn.type}</span>
                  <span className="txn-price">{formatCurrency(txn.price)}</span>
                </div>
                <div className="txn-asset">{txn.asset_class}</div>
                <div className="txn-address">{shortAddress(txn.address)}</div>
                <div className="txn-meta">
                  {txn.price_per_sqft && (
                    <span>${txn.price_per_sqft.toLocaleString()}/sqft</span>
                  )}
                  {txn.acres && <span>{txn.acres} acres</span>}
                  {txn.cap_rate && (
                    <span className="txn-cap">
                      <TrendingUp size={10} /> {txn.cap_rate}% cap
                    </span>
                  )}
                  <span>{formatDate(txn.date)}</span>
                </div>
                <div className="txn-parties">
                  <span className="party-label">Buyer</span>
                  <span className="party-name">{txn.buyer}</span>
                  <span className="party-sep">·</span>
                  <span className="party-label">Seller</span>
                  <span className="party-name">{txn.seller}</span>
                </div>
              </div>
              <ChevronRight size={14} className="item-arrow" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
