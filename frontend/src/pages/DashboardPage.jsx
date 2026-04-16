import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, Zap, BrainCircuit, RefreshCw } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const resp = await fetch(`${API_BASE}/api/dashboard`);
      if (resp.ok) {
        const json = await resp.json();
        setData(json);
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
    } catch (err) {
      console.error("Demo failed");
    }
  };

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading FINSIM Intelligence...</div>;
  }

  // Formatting for charts
  const categoryChartData = Object.keys(data.categoryBreakdown).map((k, i) => ({
     name: k,
     value: data.categoryBreakdown[k],
     color: COLORS[i % COLORS.length]
  }));

  // Dummy area chart progression based on total spending
  const trendData = [
     { day: '01', spend: 0 },
     { day: '10', spend: data.totalSpending * 0.4 },
     { day: '20', spend: data.totalSpending * 0.8 },
     { day: 'Now', spend: data.totalSpending }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h1 className="text-3xl font-bold text-slate-100">Financial Pulse</h1>
            <p className="text-slate-400 mt-1">AI-powered analytics from Gemini</p>
         </div>
         <button onClick={loadDemoSms} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <RefreshCw size={16} /> Load Demo SMS Log
         </button>
      </div>
      
      {/* Top Health Row (Tailwind Styled) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
          <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center justify-between">
             Total Settled Spend
             <Activity size={16} className="text-slate-500" />
          </h3>
          <p className="text-4xl font-bold text-slate-100">₹{data.totalSpending.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center justify-between">
            Detected Persona
            <BrainCircuit size={16} className="text-purple-400" />
          </h3>
          <p className="text-2xl font-bold text-purple-400">{data.behavior?.personality || 'Scanning...'}</p>
          <p className="text-sm text-slate-400 mt-2 truncate">{data.behavior?.pattern || 'Waiting for enough data points'}</p>
        </div>

        <div className={`bg-slate-900 border ${data.aiInsights?.risk_level === 'high' ? 'border-red-500/50' : 'border-emerald-500/30'} rounded-2xl p-6 shadow-lg shadow-black/20`}>
          <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center justify-between">
            AI Risk Assessment
            {data.aiInsights?.risk_level === 'high' ? <AlertTriangle size={16} className="text-red-400" /> : <ShieldCheck size={16} className="text-emerald-400" />}
          </h3>
          <p className="text-md text-slate-200 leading-snug">
            {data.aiInsights?.spending_insights || 'Your cash flow is exceptionally healthy.'}
          </p>
          {data.aiInsights?.prediction && (
             <p className="text-xs text-orange-400 mt-3 font-medium bg-orange-400/10 inline-block px-2 py-1 rounded">
                Prediction: {data.aiInsights.prediction}
             </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
             <Zap size={18} className="text-blue-400" /> Spending Velocity
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" tick={{fill: '#64748b'}} />
                <YAxis stroke="#475569" tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#velocity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="font-bold text-slate-200 mb-4">Top Vectors</h3>
          <div className="flex-1">
             <div className="h-[180px] w-full flex justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                     {categoryChartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="space-y-3 mt-4">
             {categoryChartData.map(c => (
                <div key={c.name} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                      <span className="text-slate-400 font-medium">{c.name}</span>
                   </div>
                   <span className="font-semibold text-slate-200">₹{c.value.toLocaleString()}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Log */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-slate-200 mb-4">Recent Audits</h3>
            <div className="space-y-4">
               {data.recentTransactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center group">
                     <div>
                        <p className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{t.merchant}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                     </div>
                     <span className={`font-semibold ${t.type === 'debit' ? 'text-slate-200' : 'text-emerald-400'}`}>
                        {t.type === 'debit' ? '-' : '+'}₹{t.amount}
                     </span>
                  </div>
               ))}
            </div>
         </div>
         
         {/* Gemini AI Assistant Component */}
         <div className="h-[400px]">
           <AIChatPanel />
         </div>
      </div>
    </div>
  );
}
