import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, Settings, FileText, Bell, Sparkles } from 'lucide-react';
import { useStore } from './store/useStore';

import DashboardPage from './pages/DashboardPage';
import LedgerPage from './pages/LedgerPage';
import InsightsPage from './pages/InsightsPage';

const SettingsPage = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <div className="glass-panel text-center p-12">
      <Settings className="mx-auto text-slate-500 mb-6" size={48} />
      <h1 className="text-3xl font-black text-slate-100 mb-4">System Settings</h1>
      <p className="text-slate-400">Configure your data sources and AI preferences.</p>
    </div>
  </div>
);

function App() {
  const initData = useStore(state => state.initData);
  const isServerOnline = useStore(state => state.isServerOnline);
  const alerts = useStore(state => state.alerts);
  const dismissAlert = useStore(state => state.dismissAlert);
  
  useEffect(() => {
     initData();
  }, [initData]);

  return (
    <Router>
      <div className="min-h-screen pb-20">
        {/* Offline Notification */}
        {!isServerOnline && (
          <div className="fixed top-0 left-0 w-full z-50 bg-red-500/20 backdrop-blur-md border-b border-red-500/30 text-red-400 font-bold text-center py-2 text-xs uppercase tracking-widest">
            ⚠️ AI Intelligence offline • Local processing fallback active
          </div>
        )}

        {/* Floating Top Navigation */}
        <header className="sticky top-0 z-40 px-4 py-4 md:px-8">
          <nav className="glass-panel mx-auto max-w-7xl flex justify-between items-center py-3 px-6 !rounded-2xl border-white/5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                 <Activity className="text-white" size={24} />
              </div>
              <span className="font-black text-xl gradient-text hidden sm:block">FINSIM AI+</span>
            </div>

            <div className="flex items-center gap-1 md:gap-4">
              <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                 <LayoutDashboard size={18} /> <span className="hidden md:block">Pulse</span>
              </NavLink>
              <NavLink to="/ledger" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                 <FileText size={18} /> <span className="hidden md:block">Ledger</span>
              </NavLink>
              <NavLink to="/insights" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                 <Sparkles size={18} /> <span className="hidden md:block">DNA</span>
              </NavLink>
              <div className="w-[1px] h-6 bg-white/10 mx-2 hidden md:block"></div>
              <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                 <Settings size={18} />
              </NavLink>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer group">
                 <Bell size={20} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
                 {alerts.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 animate-ping"></span>
                 )}
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Premium Access</span>
                <span className="text-xs font-bold text-slate-200">User_2705</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Gaj`} alt="avatar" />
              </div>
            </div>
          </nav>
        </header>

        {/* Global Alert Notification Toast */}
        <div className="fixed bottom-24 right-8 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
          {alerts.map((alert) => (
            <div key={alert.id} className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300">
               <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${alert.severity === 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 mb-1">{alert.severity === 3 ? 'CRITICAL ALERT' : 'SYSTEM UPDATE'}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
                    <button onClick={() => dismissAlert(alert.id)} className="mt-3 text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest">Dismiss</button>
                  </div>
               </div>
            </div>
          ))}
        </div>

        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
