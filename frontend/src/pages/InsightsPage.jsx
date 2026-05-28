import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, BrainCircuit, Target, Zap, ShieldCheck } from 'lucide-react';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchInsights = async () => {
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
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse">Decoding your Spending DNA...</p>
      </div>
    );
  }

  const { behavior, aiInsights, categoryBreakdown } = data || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-black text-slate-100 mb-2">AI Financial DNA</h1>
         <p className="text-slate-400">Deep behavioral analysis and predictive optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         {/* Personality Card */}
         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
            <BrainCircuit className="text-purple-400 mb-6" size={40} />
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Spending Persona</h3>
            <h2 className="text-3xl font-black text-slate-100 mb-4">{behavior?.personality || "Analyzing..."}</h2>
            <p className="text-slate-300 leading-relaxed">
               {behavior?.pattern || "We're still collecting data points to accurately categorize your financial behavior."}
            </p>
         </div>

         {/* Risk Card */}
         <div className={`bg-slate-900 border ${aiInsights?.risk_level === 'high' ? 'border-red-500/30' : 'border-emerald-500/30'} rounded-3xl p-8 shadow-2xl`}>
            {aiInsights?.risk_level === 'high' ? <AlertTriangle className="text-red-400 mb-6" size={40} /> : <ShieldCheck className="text-emerald-400 mb-6" size={40} />}
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Risk Assessment</h3>
            <h2 className={`text-3xl font-black mb-4 ${aiInsights?.risk_level === 'high' ? 'text-red-400' : 'text-emerald-400'}`}>
               {aiInsights?.risk_level?.toUpperCase() || "STABLE"}
            </h2>
            <p className="text-slate-300 leading-relaxed">
               {aiInsights?.spending_insights || "Your spending habits are currently within safe parameters."}
            </p>
         </div>
      </div>

      {/* Behavioral Spectrum */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-12 shadow-2xl">
         <h3 className="text-slate-100 font-bold mb-8 flex items-center gap-2">
            <Zap size={20} className="text-blue-400" /> Behavioral Spectrum
         </h3>
         <div className="space-y-8">
            <SpectrumRow label="Impulse vs Planned" value={75} leftLabel="Planned" rightLabel="Impulsive" color="blue" />
            <SpectrumRow label="Needs vs Wants" value={42} leftLabel="Needs" rightLabel="Wants" color="purple" />
            <SpectrumRow label="Social vs Private" value={60} leftLabel="Private" rightLabel="Social" color="emerald" />
         </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
         <h3 className="text-slate-100 font-bold flex items-center gap-2">
            <Target size={20} className="text-amber-400" /> Actionable Recommendations
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights?.suggestions ? aiInsights.suggestions.map((s, i) => (
               <div key={i} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex items-start gap-4 hover:border-slate-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold shrink-0">{i+1}</div>
                  <p className="text-sm text-slate-200 leading-relaxed">{s}</p>
               </div>
            )) : (
               <div className="col-span-2 py-8 text-center text-slate-500 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
                  Load more transactions to receive personalized AI recommendations.
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function SpectrumRow({ label, value, leftLabel, rightLabel, color }) {
   const colorMap = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      emerald: 'bg-emerald-500'
   };
   
   return (
      <div>
         <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-bold text-slate-500">{value}% Shift</span>
         </div>
         <div className="relative h-2 bg-slate-800 rounded-full mb-2">
            <div className={`absolute top-0 h-full ${colorMap[color]} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000`} style={{ left: `calc(${value}% - 10%)`, width: '20%' }}></div>
         </div>
         <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
         </div>
      </div>
   );
}
