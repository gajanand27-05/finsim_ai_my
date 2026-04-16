import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, LayoutDashboard, Settings, FileText } from 'lucide-react';
import { useStore } from './store/useStore';

import DashboardPage from './pages/DashboardPage';
import LedgerPage from './pages/LedgerPage';
import InsightsPage from './pages/InsightsPage';

const SettingsPage = () => <div className="container mt-8"><h1 className="text-2xl">Settings</h1></div>;

function App() {
  const initData = useStore(state => state.initData);
  const isServerOnline = useStore(state => state.isServerOnline);
  
  useEffect(() => {
     initData();
  }, [initData]);

  return (
    <Router>
      {!isServerOnline && (
        <div className="bg-red-500/20 border-b border-red-500/50 text-red-500 font-semibold text-center py-2 px-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          ⚠️ Server is offline. Please try later. AI Intelligence degraded.
        </div>
      )}
      <nav style={{ borderBottom: '1px solid var(--border-light)', padding: '16px 0', background: 'var(--bg-panel)' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-accent-primary" size={24} />
            <span className="font-bold text-lg gradient-text">FINSIM AI+</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="flex items-center gap-2 text-muted hover-text" style={{ textDecoration: 'none' }}>
               <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/ledger" className="flex items-center gap-2 text-muted hover-text" style={{ textDecoration: 'none' }}>
               <FileText size={18} /> Ledger
            </Link>
            <Link to="/insights" className="flex items-center gap-2 text-muted hover-text" style={{ textDecoration: 'none' }}>
               <Activity size={18} /> Insights
            </Link>
            <Link to="/settings" className="flex items-center gap-2 text-muted hover-text" style={{ textDecoration: 'none' }}>
               <Settings size={18} /> Settings
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
