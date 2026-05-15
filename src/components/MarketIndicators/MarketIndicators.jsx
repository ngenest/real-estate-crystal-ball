import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters.js';
import { REGIONS } from '../../data/regions.js';
import './MarketIndicators.css';

function MetricCard({ label, value, change, changeLabel, format = 'number', highlight }) {
  const isPos = change > 0;
  const isNeg = change < 0;
  return (
    <div className={`metric-card ${highlight ? 'highlight' : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {format === 'currency' ? formatCurrency(value) :
          format === 'percent' ? formatPercent(value) :
          formatNumber(value)}
      </div>
      {change !== undefined && change !== null && (
        <div className={`metric-change ${isPos ? 'pos' : isNeg ? 'neg' : ''}`}>
          {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {formatPercent(Math.abs(change))} {changeLabel || 'YoY'}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <strong>
            {p.dataKey.toLowerCase().includes('price') || p.dataKey.toLowerCase().includes('sfr') || p.dataKey.toLowerCase().includes('condo')
              ? formatCurrency(p.value)
              : formatNumber(p.value)}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function MarketIndicators({ market, selectedRegion }) {
  if (!market) return null;

  const { overall, byRegion, priceHistory, permitHistory } = market;

  // Get region-specific data if a region is selected
  const regionData = selectedRegion ? byRegion?.[selectedRegion] : null;
  const displayData = regionData || overall;

  const region = selectedRegion ? REGIONS.find((r) => r.id === selectedRegion) : null;

  return (
    <div className="market-panel">
      <div className="market-header">
        <div className="market-title-row">
          <TrendingUp size={18} className="market-icon" />
          <span className="market-title">Market Indicators</span>
          {region && (
            <span className="market-region-badge" style={{ background: `${region.color}20`, color: region.color, borderColor: `${region.color}40` }}>
              {region.name}
            </span>
          )}
          {!region && <span className="market-region-badge">Tampa Bay MSA</span>}
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="metrics-grid">
        <MetricCard
          label="Median SFR Price"
          value={displayData.medianHomePriceSFR}
          change={displayData.yoyPriceChange}
          format="currency"
          highlight
        />
        <MetricCard
          label="Median Condo Price"
          value={displayData.medianHomePriceCondo}
          change={displayData.yoyPriceChange ? displayData.yoyPriceChange * 0.85 : null}
          format="currency"
        />
        <MetricCard
          label="Active Listings"
          value={displayData.activeListings}
          format="number"
        />
        <MetricCard
          label="Days on Market"
          value={displayData.daysOnMarket}
          format="number"
        />
        {overall && (
          <>
            <MetricCard
              label="Inventory (months)"
              value={overall.inventoryMonths}
              format="number"
            />
            <MetricCard
              label="Closed Sales (30d)"
              value={overall.closedSales30d}
              format="number"
            />
            <MetricCard
              label="Office Vacancy"
              value={displayData.vacancyOffice}
              format="percent"
            />
            <MetricCard
              label="Retail Vacancy"
              value={displayData.vacancyRetail}
              format="percent"
            />
          </>
        )}
        {!selectedRegion && overall && (
          <>
            <MetricCard
              label="Industrial Vacancy"
              value={overall.vacancyIndustrial}
              format="percent"
            />
            <MetricCard
              label="Multifamily Vacancy"
              value={overall.vacancyMultifamily}
              format="percent"
            />
            <MetricCard
              label="Multi-Family Cap Rate"
              value={overall.capRateMultifamily / 100}
              format="percent"
            />
            <MetricCard
              label="Industrial Cap Rate"
              value={overall.capRateIndustrial / 100}
              format="percent"
            />
          </>
        )}
      </div>

      {/* Price history chart */}
      {priceHistory && priceHistory.length > 0 && (
        <div className="chart-section">
          <div className="chart-title">Tampa Bay Median Home Price History</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={priceHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="sfrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="condoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#64748b' }} interval={1} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Area
                type="monotone"
                dataKey="medianSFR"
                name="Median SFR"
                stroke="#f97316"
                fill="url(#sfrGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="medianCondo"
                name="Median Condo"
                stroke="#22c55e"
                fill="url(#condoGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Permit volume chart */}
      {permitHistory && permitHistory.length > 0 && (
        <div className="chart-section">
          <div className="chart-title">Monthly Permit Volume (2025 YTD)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={permitHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="residential" name="Residential" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="commercial" name="Commercial" fill="#f97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Region comparison */}
      {!selectedRegion && byRegion && (
        <div className="chart-section">
          <div className="chart-title">Median SFR Price by Region</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={Object.entries(byRegion).map(([id, d]) => ({
                name: REGIONS.find((r) => r.id === id)?.name?.split('/')[0]?.trim() || id,
                price: d.medianHomePriceSFR,
                yoy: Math.round(d.yoyPriceChange * 1000) / 10,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={75} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" name="Median SFR Price" fill="#f97316" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
