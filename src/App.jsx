import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header/Header.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import OverviewDashboard from './components/Dashboard/Dashboard.jsx';
import MapView from './components/MapView/MapView.jsx';
import PermitsPanel from './components/PermitsPanel/PermitsPanel.jsx';
import TransactionsPanel from './components/TransactionsPanel/TransactionsPanel.jsx';
import ZoningPanel from './components/ZoningPanel/ZoningPanel.jsx';
import HearingsPanel from './components/HearingsPanel/HearingsPanel.jsx';
import NewsPanel from './components/NewsPanel/NewsPanel.jsx';
import MarketIndicators from './components/MarketIndicators/MarketIndicators.jsx';

import { fetchTampaPermits } from './services/tampaOpenData.js';
import { fetchMarketSnapshot } from './services/marketData.js';
import { fetchNews } from './services/newsAggregator.js';

import {
  SEED_PERMITS,
  SEED_TRANSACTIONS,
  SEED_ZONING,
  SEED_HEARINGS,
  SEED_NEWS,
  SEED_MARKET_INDICATORS,
} from './data/seedData.js';

import { formatDate } from './utils/formatters.js';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [permits, setPermits] = useState(SEED_PERMITS);
  const [transactions] = useState(SEED_TRANSACTIONS);
  const [zoning] = useState(SEED_ZONING);
  const [hearings] = useState(SEED_HEARINGS);
  const [news, setNews] = useState(SEED_NEWS);
  const [market, setMarket] = useState(SEED_MARKET_INDICATORS);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [permitsData, marketData, newsData] = await Promise.allSettled([
        fetchTampaPermits({ limit: 25 }),
        fetchMarketSnapshot(),
        fetchNews(),
      ]);

      if (permitsData.status === 'fulfilled' && permitsData.value?.length) {
        setPermits(permitsData.value);
      }
      if (marketData.status === 'fulfilled') {
        setMarket(marketData.value);
      }
      if (newsData.status === 'fulfilled' && newsData.value?.length) {
        setNews(newsData.value);
      }

      setLastUpdated(formatDate(new Date().toISOString()));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount via ref to avoid lint false positive on setState-in-effect
  const loadDataRef = useRef(loadData);
  useEffect(() => { loadDataRef.current(); }, []);

  useEffect(() => {
    const interval = setInterval(loadData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  function renderContent() {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            permits={permits}
            transactions={transactions}
            zoning={zoning}
            hearings={hearings}
            news={news}
            market={market}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            onTabChange={setActiveTab}
            loading={loading}
          />
        );
      case 'map':
        return (
          <div className="map-full">
            <MapView
              permits={permits}
              transactions={transactions}
              zoning={zoning}
              hearings={hearings}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>
        );
      case 'permits':
        return (
          <div className="panel-full">
            <PermitsPanel permits={permits} loading={loading} selectedRegion={selectedRegion} />
          </div>
        );
      case 'transactions':
        return (
          <div className="panel-full">
            <TransactionsPanel
              transactions={transactions}
              loading={loading}
              selectedRegion={selectedRegion}
            />
          </div>
        );
      case 'zoning':
        return (
          <div className="panel-full">
            <ZoningPanel zoning={zoning} loading={loading} selectedRegion={selectedRegion} />
          </div>
        );
      case 'hearings':
        return (
          <div className="panel-full">
            <HearingsPanel hearings={hearings} loading={loading} selectedRegion={selectedRegion} />
          </div>
        );
      case 'news':
        return (
          <div className="panel-full">
            <NewsPanel news={news} loading={loading} selectedRegion={selectedRegion} />
          </div>
        );
      case 'market':
        return (
          <div className="panel-full">
            <MarketIndicators market={market} loading={loading} selectedRegion={selectedRegion} />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="app">
      <Header lastUpdated={lastUpdated} onRefresh={loadData} loading={loading} />
      <div className="app-body">
        <Sidebar
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <main className="app-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
