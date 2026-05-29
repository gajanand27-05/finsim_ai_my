import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, Zap, BrainCircuit, RefreshCw, Target, TrendingUp, Plus } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';
import TransactionModal from '../components/TransactionModal';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderError, setRenderError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setRenderError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [dashResp, transResp] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard`),
        fetch(`${API_BASE}/api/transactions`)
      ]);
      
      if (dashResp.ok) {
        const json = await dashResp.json();
        setData(json);
      }
      if (transResp.ok) {
        const json = await transResp.json();
        setTransactions(json);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const loadDemoSms = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_BASE}/api/load-demo-sms`, { method: 'POST', body: JSON.stringify({}) });
      fetchDashboard();
    } catch {
      console.error("Demo failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse font-bold tracking-widest text-xs uppercase">Synchronizing Intelligence...</p>
      </div>
    );
  }

  if (renderError || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="glass-panel max-w-md text-slate-100 border-rose-500/20">
           <h2 className="text-rose-400 font-black text-xl mb-2">Initialization Failed</h2>
           <p className="text-slate-400 text-sm mb-6">{renderError || "No data received from intelligence engine. Please ensure your Supabase tables are created."}</p>
           <button onClick={fetchDashboard} className="btn-secondary text-xs">Retry Connection</button>
        </div>
      </div>
    );
  }

  try {
    const breakdown = data.categoryBreakdown || {};
    const categoryChartData = Object.keys(breakdown).map((k, i) => ({
       name: k,
       value: breakdown[k] || 0,
       color: COLORS[i % COLORS.length]
    }));

    const txList = Array.isArray(transactions) ? transactions : [];
    const trendMap = txList.reduce((acc, t) => {
      if (t.type === 'debit') {
        const date = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        acc[date] = (acc[date] || 0) + Number(t.amount);
      }
      return acc;
    }, {});

    const trendData = Object.keys(trendMap).map(date => ({
      date,
      spend: trendMap[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (trendData.length < 5) {
       trendData.unshift({ date: 'Start', spend: 0 });
    }

    const income = txList.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalSpent = Number(data.totalSpending) || 0;
    const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
    const recentTx = Array.isArray(data.recentTransactions) ? data.recentTransactions : [];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
           <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-100">Financial Pulse</h1>
              <p className="text-slate-500 font-semibold mt-1">Real-time AI behavioral tracking engine</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                 <Plus size={20} /> Add Entry
              </button>
              <button onClick={fetchDashboard} className="btn-secondary !p-2.5">
                 <RefreshCw size={20} />
              </button>
              <button onClick={loadDemoSms} className="btn-secondary !text-sky-400 !border-sky-500/20">
                 Inject Demo Log
              </button>
           </div>
        </div>
        
        <TransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchDashboard(); }} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-slate-100">
          <MetricCard 
            title="Monthly Outflow" 
            value={`₹${totalSpent.toLocaleString()}`} 
            icon={<Activity size={18} className="text-sky-400" />} 
            subValue={`${trendData.length} active transactions detected`}
          />
          <MetricCard 
            title="Savings Rate" 
            value={`${savingsRate}%`} 
            icon={<TrendingUp size={18} className="text-emerald-400" />} 
            subValue={savingsRate > 20 ? "Exceeding market average" : "Below target threshold (20%)"}
            trend={savingsRate > 20 ? 'up' : 'down'}
          />
          <MetricCard 
            title="AI Personality" 
            value={data.behavior?.personality || 'Analyzing...'} 
            icon={<BrainCircuit size={18} className="text-purple-400" />} 
            subValue={data.behavior?.pattern || 'Processing behavioral data points'}
          />
          <MetricCard 
            title="Risk Profile" 
            value={data.aiInsights?.risk_level?.toUpperCase() || 'LOW'} 
            icon={data.aiInsights?.risk_level === 'high' ? <AlertTriangle size={18} className="text-rose-400" /> : <ShieldCheck size={18} className="text-emerald-400" />} 
            subValue={data.aiInsights?.spending_insights || 'No immediate risks identified'}
            status={data.aiInsights?.risk_level}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 text-slate-100">
          <div className="glass-panel lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                 <Zap size={18} className="text-sky-400" /> Spending Velocity
              </h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-800/50 border border-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">Daily Resolution</span>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} 
                    itemStyle={{ color: '#38bdf8', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#38bdf8" strokeWidth={4} fillOpacity={1} fill="url(#velocity)" dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel flex flex-col">
            <h3 className="font-bold text-slate-100 mb-8">Allocation Mix</h3>
            <div className="flex-1 flex flex-col justify-center">
               <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={10} dataKey="value">
                       {categoryChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="space-y-3.5 mt-8">
                  {categoryChartData.slice(0, 4).map(c => (
                     <div key={c.name} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: c.color }}></div>
                           <span className="text-xs text-slate-400 font-bold group-hover:text-slate-100 transition-colors uppercase tracking-tight">{c.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-100">₹{c.value.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100">
           <div className="glass-panel">
              <h3 className="font-bold text-slate-100 mb-8 flex items-center gap-2">
                 <Target size={18} className="text-emerald-400" /> Savings Target
              </h3>
              <div className="mb-8">
                 <div className="flex justify-between items-end mb-2.5">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Emergency Fund</span>
                    <span className="text-xl font-black text-emerald-400">64%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: '64%' }}></div>
                 </div>
                 <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <span>₹1,28,000 saved</span>
                    <span>Goal: ₹2,00,000</span>
                 </div>
              </div>
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                 <p className="text-xs text-emerald-400/90 leading-relaxed font-bold italic">
                    "AI trajectory suggests goal completion in 4 months. Optimization detected: Reduce 'Dining' velocity to accelerate by 22 days."
                 </p>
              </div>
           </div>

           <div className="glass-panel lg:col-span-1">
              <h3 className="font-bold text-slate-100 mb-8 flex justify-between items-center">
                 Recent Intelligence
                 <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] cursor-pointer hover:text-sky-300 transition-colors">Audit All</span>
              </h3>
              <div className="space-y-4">
                 {recentTx.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-default p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${t.type === 'debit' ? 'bg-slate-800 text-slate-400 border border-white/5' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                             {(t.merchant?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                             <p className="font-bold text-slate-200 text-sm group-hover:text-sky-400 transition-colors">{t.merchant || 'Unknown'}</p>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{t.category || 'Other'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`font-black text-sm ${t.type === 'debit' ? 'text-slate-100' : 'text-emerald-400'}`}>
                             {t.type === 'debit' ? '-' : '+'}₹{(t.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-600 font-black mt-1">{new Date(t.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="h-[480px]">
             <AIChatPanel />
           </div>
        </div>
      </div>
    );
  } catch (err) {
     console.error("Dashboard Render Error:", err);
     setRenderError(err.message);
     return null;
  }
}

function MetricCard({ title, value, icon, subValue, trend, status }) {
   const isHighRisk = status === 'high';
   return (
      <div className={`glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${isHighRisk ? 'border-rose-500/30 ring-1 ring-rose-500/10' : ''}`}>
         {isHighRisk && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>}
         <div className="flex justify-between items-start mb-5">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">{title}</span>
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isHighRisk ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800/50 text-slate-400 group-hover:bg-sky-400 group-hover:text-sky-950 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]'}`}>
               {icon}
            </div>
         </div>
         <div className="flex items-baseline gap-2">
            <h2 className={`text-3xl font-black tracking-tight ${isHighRisk ? 'text-rose-400' : 'text-slate-100'}`}>{value}</h2>
            {trend && (
               <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {trend === 'up' ? '↑' : '↓'}
               </span>
            )}
         </div>
         <p className="text-[11px] text-slate-500 mt-3 font-bold line-clamp-2 leading-relaxed tracking-tight">
            {subValue}
         </p>
      </div>
   );
}
