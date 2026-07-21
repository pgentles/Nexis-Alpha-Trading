import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  History, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Zap 
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import BotsView from './components/BotsView';
import TradesView from './components/TradesView';
import IntegrationsView from './components/IntegrationsView';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Terminal global state
  const [portfolioData, setPortfolioData] = useState(null);
  const [traders, setTraders] = useState([]);
  const [algoSettings, setAlgoSettings] = useState(null);
  const [trades, setTrades] = useState([]);
  const [integrations, setIntegrations] = useState(null);

  // Initial and poll data fetcher
  const fetchAllData = async () => {
    try {
      const [portfolioRes, tradersRes, algoRes, tradesRes, integrationsRes] = await Promise.all([
        fetch(`${API_BASE}/portfolio`),
        fetch(`${API_BASE}/traders`),
        fetch(`${API_BASE}/algo/settings`),
        fetch(`${API_BASE}/trades`),
        fetch(`${API_BASE}/integrations`)
      ]);

      const [portfolioData, tradersData, algoData, tradesData, integrationsData] = await Promise.all([
        portfolioRes.json(),
        tradersRes.json(),
        algoRes.json(),
        tradesRes.json(),
        integrationsRes.json()
      ]);

      setPortfolioData(portfolioData);
      setTraders(tradersData);
      setAlgoSettings(algoData);
      setTrades(tradesData);
      setIntegrations(integrationsData);
    } catch (err) {
      console.error("Error fetching terminal datasets:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Fast polling for prices, values, and logs
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  // API Mutators
  const handleUpdateTrader = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/traders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setTraders(traders.map(t => t.id === id ? data : t));
    } catch (err) {
      console.error("Error updating trader:", err);
    }
  };

  const handleAddTrader = async (newTrader) => {
    try {
      const res = await fetch(`${API_BASE}/traders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrader)
      });
      const data = await res.json();
      setTraders([...traders, data]);
    } catch (err) {
      console.error("Error adding trader:", err);
    }
  };

  const handleDeleteTrader = async (id) => {
    try {
      await fetch(`${API_BASE}/traders/${id}`, { method: 'DELETE' });
      setTraders(traders.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error removing trader:", err);
    }
  };

  const handleSaveAlgoSettings = async (settings) => {
    try {
      const res = await fetch(`${API_BASE}/algo/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setAlgoSettings(data);
    } catch (err) {
      console.error("Error updating algorithmic settings:", err);
    }
  };

  const handleCloseTrade = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/trades/${id}/close`, { method: 'POST' });
      const data = await res.json();
      fetchAllData(); // Refresh all to reconcile cash balance changes
    } catch (err) {
      console.error("Error exiting trade position:", err);
    }
  };

  const handleSaveIntegrations = async (keys) => {
    try {
      const res = await fetch(`${API_BASE}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });
      const data = await res.json();
      setIntegrations(data);
    } catch (err) {
      console.error("Error saving integration keys:", err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <div className="logo-container">
          <Zap size={22} fill="currentColor" />
          <span>NEXIS.ALPHA</span>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'bots' ? 'active' : ''}`}
            onClick={() => setActiveView('bots')}
          >
            <Cpu size={18} />
            <span>Trading Bots</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveView('trades')}
          >
            <History size={18} />
            <span>Execution Logs</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveView('integrations')}
          >
            <Settings size={18} />
            <span>Integrations</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
            <ShieldAlert size={14} />
            <span>Private Node Mode</span>
          </div>
        </div>
      </div>

      {/* Main content display */}
      <div className="main-content">
        {activeView === 'dashboard' && (
          <DashboardView 
            portfolioData={portfolioData} 
            algoSettings={algoSettings}
            traders={traders}
          />
        )}
        {activeView === 'bots' && (
          <BotsView 
            traders={traders}
            algoSettings={algoSettings}
            onUpdateTrader={handleUpdateTrader}
            onAddTrader={handleAddTrader}
            onDeleteTrader={handleDeleteTrader}
            onSaveAlgoSettings={handleSaveAlgoSettings}
          />
        )}
        {activeView === 'trades' && (
          <TradesView 
            trades={trades} 
            onCloseTrade={handleCloseTrade}
            onRefresh={fetchAllData}
          />
        )}
        {activeView === 'integrations' && (
          <IntegrationsView 
            integrations={integrations}
            onSaveIntegrations={handleSaveIntegrations}
          />
        )}
      </div>
    </div>
  );
}
