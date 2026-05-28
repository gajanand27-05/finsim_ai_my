import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Fetch analysis and transactions in parallel
      const [analysisResp, transResp] = await Promise.all([
        fetch(`${API_BASE}/api/ledger-analysis`),
        fetch(`${API_BASE}/api/transactions`)
      ]);

      if (analysisResp.ok) {
        const json = await analysisResp.json();
        setAnalysis(json);
      }
      if (transResp.ok) {
        const json = await transResp.json();
        setTransactions(json);
      }
    } catch (err) {
      console.error("Failed to fetch ledger data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <ActivityIndicator />
        <h2 className="text-xl mt-6 font-semibold animate-pulse text-blue-400">Running Ledger Intelligence Scan...</h2>
        <p className="text-slate-500 mt-2">Checking double-entry validation and scanning for ghost subscriptions.</p>
      </div>
    );
  }

  if (!analysis) {
     return <div className="container py-12 text-center text-slate-400">No analysis available. Try loading demo data first.</div>;
  }

  // Generate chart data from transactions (grouped by month)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { month, inflow: 0, outflow: 0, balance: 0 };
    if (t.type === 'credit') acc[month].inflow += Number(t.amount);
    else acc[month].outflow += Number(t.amount);
    acc[month].balance = acc[month].inflow - acc[month].outflow;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).reverse();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h1 className="text-3xl font-bold text-slate-100">Ledger Analysis Report</h1>
            <p className="text-slate-400 mt-1">Professional financial audit powered by AI</p>
         </div>
         <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${analysis.integrity_score > 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
            {analysis.integrity_score > 70 ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            {analysis.integrity_score > 70 ? 'Audit Passed' : 'Audit Warning'}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center text-center">
           <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Cash-Flow Integrity Score</h3>
           <div className={`text-7xl font-bold mb-4 ${analysis.integrity_score > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {analysis.integrity_score}
              <span className="text-2xl text-slate-600 font-normal ml-1">/100</span>
           </div>
           <p className="text-slate-300 max-w-xs leading-relaxed">
              {analysis.health_summary}
           </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
           <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Target size={20} className="text-blue-400" /> 
              Net Cash-Flow Trajectory
           </h3>
           <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" tick={{fill: '#64748b'}} />
                  <YAxis stroke="#475569" tick={{fill: '#64748b'}} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
               <Activity size={20} className="text-amber-400" />
               Detected Ghost Subscriptions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {analysis.ghost_subscriptions && analysis.ghost_subscriptions.length > 0 ? (
                analysis.ghost_subscriptions.map((sub, idx) => (
                  <div key={idx} className={`bg-slate-900 border ${sub.risk === 'High' ? 'border-red-500/30' : 'border-slate-800'} rounded-xl p-5 flex justify-between items-center transition-all hover:border-slate-700`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sub.risk === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {sub.risk === 'High' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-100 text-lg">{sub.name}</h4>
                          <p className="text-sm text-slate-500 mt-0.5">{sub.frequency} payment detected</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-bold text-slate-100">₹{sub.amount}</div>
                       <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${sub.risk === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {sub.risk} Risk
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
                   No recurring subscriptions detected yet.
                </div>
              )}
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
               <AlertTriangle size={20} className="text-red-400" />
               Anomalies
            </h2>
            <div className="space-y-4">
               {analysis.anomalies && analysis.anomalies.length > 0 ? (
                 analysis.anomalies.map((anom, idx) => (
                   <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-slate-200">{anom.merchant}</span>
                         <span className="text-red-400 font-bold">₹{anom.amount}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{anom.reason}</p>
                   </div>
                 ))
               ) : (
                 <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
                    Your spending is remarkably consistent.
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function ActivityIndicator() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-800"></div>
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
  );
}
