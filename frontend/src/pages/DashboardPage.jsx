import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, Zap, BrainCircuit, RefreshCw, Target, TrendingUp } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
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
      console.error(err);
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

  if (loading || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse">Synchronizing FINSIM Intelligence...</p>
      </div>
    );
  }

  // Formatting for charts
  const categoryChartData = Object.keys(data.categoryBreakdown).map((k, i) => ({
     name: k,
     value: data.categoryBreakdown[k],
     color: COLORS[i % COLORS.length]
  }));

  // Calculate real trend data from transactions
  const trendMap = transactions.reduce((acc, t) => {
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

  // If trendData is too small, add some padding
  if (trendData.length < 5) {
     trendData.unshift({ date: 'Start', spend: 0 });
  }

  const income = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
  const savingsRate = income > 0 ? Math.round(((income - data.totalSpending) / income) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
         <div>
            <h1 className="text-3xl font-bold text-slate-100">Financial Pulse</h1>
            <p className="text-slate-400 mt-1">Real-time AI behavioral tracking</p>
         </div>
         <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/20">
               <Plus size={20} /> Add Entry
            </button>
            <button onClick={fetchDashboard} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors border border-slate-700">
               <RefreshCw size={20} />
            </button>
            <button onClick={loadDemoSms} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-all border border-slate-700">
               Inject Demo Log
            </button>
         </div>
      </div>
      
      {/* Transaction Modal Integration */}
      <TransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchDashboard(); }} />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Monthly Outflow" 
          value={`₹${data.totalSpending.toLocaleString()}`} 
          icon={<Activity size={18} className="text-blue-400" />} 
          subValue={`${trendData.length} active transactions`}
        />
        <MetricCard 
          title="Savings Rate" 
          value={`${savingsRate}%`} 
          icon={<TrendingUp size={18} className="text-emerald-400" />} 
          subValue={savingsRate > 20 ? "Exceeding average" : "Below target (20%)"}
          trend={savingsRate > 20 ? 'up' : 'down'}
        />
        <MetricCard 
          title="AI Personality" 
          value={data.behavior?.personality || 'Analyzing...'} 
          icon={<BrainCircuit size={18} className="text-purple-400" />} 
          subValue={data.behavior?.pattern || 'Collecting data points'}
        />
        <MetricCard 
          title="Risk Profile" 
          value={data.aiInsights?.risk_level?.toUpperCase() || 'LOW'} 
          icon={data.aiInsights?.risk_level === 'high' ? <AlertTriangle size={18} className="text-red-400" /> : <ShieldCheck size={18} className="text-emerald-400" />} 
          subValue={data.aiInsights?.spending_insights || 'System stable'}
          status={data.aiInsights?.risk_level}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
               <Zap size={18} className="text-blue-400" /> Spending Velocity
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">DAILY RESOLUTION</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#velocity)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="font-bold text-slate-200 mb-6">Allocation Mix</h3>
          <div className="flex-1">
             <div className="h-[200px] w-full flex justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                     {categoryChartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="space-y-4 mt-6">
             {categoryChartData.map(c => (
                <div key={c.name} className="flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                      <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{c.name}</span>
                   </div>
                   <span className="font-bold text-slate-100">₹{c.value.toLocaleString()}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Savings Goal Tracker */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
               <Target size={18} className="text-emerald-400" /> Active Savings Goal
            </h3>
            <div className="mb-6">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-slate-400">Emergency Fund</span>
                  <span className="text-xl font-bold text-slate-100">64%</span>
               </div>
               <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '64%' }}></div>
               </div>
               <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                  <span>₹1,28,000 saved</span>
                  <span>Target: ₹2,00,000</span>
               </div>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <p className="text-xs text-emerald-400 leading-relaxed font-medium">
                  "At your current savings rate, you will reach this goal in 4 months. Consider reducing 'Entertainment' spend to accelerate by 22 days."
               </p>
            </div>
         </div>

         {/* Recent Log */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-1">
            <h3 className="font-bold text-slate-200 mb-6 flex justify-between items-center">
               Recent Audits
               <span className="text-xs text-blue-400 cursor-pointer hover:underline">View All</span>
            </h3>
            <div className="space-y-5">
               {data.recentTransactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-default">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${t.type === 'debit' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           {t.merchant[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="font-bold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">{t.merchant}</p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{t.category}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`font-bold text-sm ${t.type === 'debit' ? 'text-slate-100' : 'text-emerald-400'}`}>
                           {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-600 font-medium mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         
         {/* AI Assistant */}
         <div className="h-[450px]">
           <AIChatPanel />
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subValue, trend, status }) {
   const isHighRisk = status === 'high';
   return (
      <div className={`bg-slate-900 border ${isHighRisk ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl p-6 shadow-lg shadow-black/20 transition-all hover:border-slate-700 relative overflow-hidden group`}>
         {isHighRisk && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>}
         <div className="flex justify-between items-start mb-4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</span>
            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
               {icon}
            </div>
         </div>
         <div className="flex items-baseline gap-2">
            <h2 className={`text-2xl font-black ${isHighRisk ? 'text-red-400' : 'text-slate-100'}`}>{value}</h2>
            {trend && (
               <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trend === 'up' ? '↑' : '↓'}
               </span>
            )}
         </div>
         <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed">
            {subValue}
         </p>
      </div>
   );
}
