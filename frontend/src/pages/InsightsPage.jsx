import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, BrainCircuit, Target, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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
        <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse font-black text-[10px] uppercase tracking-[0.2em]">Decoding Spending DNA...</p>
      </div>
    );
  }

  const { behavior, aiInsights } = data || {};

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 text-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} /> AI Intelligence Engine
         </div>
         <h1 className="text-5xl font-black text-slate-100 mb-4 tracking-tight">Financial DNA</h1>
         <p className="text-slate-500 font-semibold text-lg">Deep behavioral analysis and predictive optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         {/* Personality Card */}
         <div className="glass-panel p-10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20">
               <BrainCircuit size={32} />
            </div>
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.25em] mb-3">Spending Persona</h3>
            <h2 className="text-4xl font-black text-slate-100 mb-6 tracking-tight group-hover:text-purple-400 transition-colors">{behavior?.personality || "Analyzing..."}</h2>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
               {behavior?.pattern || "We're still collecting data points to accurately categorize your financial behavior."}
            </p>
         </div>

         {/* Risk Card */}
         <div className={`glass-panel p-10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 ${aiInsights?.risk_level === 'high' ? 'border-rose-500/20 ring-1 ring-rose-500/10' : 'border-emerald-500/20 ring-1 ring-emerald-500/10'}`}>
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-10 -mt-10 transition-colors ${aiInsights?.risk_level === 'high' ? 'bg-rose-500/5 group-hover:bg-rose-500/10' : 'bg-emerald-500/5 group-hover:bg-emerald-500/10'}`}></div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border ${aiInsights?.risk_level === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
               {aiInsights?.risk_level === 'high' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
            </div>
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.25em] mb-3">Risk Assessment</h3>
            <h2 className={`text-4xl font-black mb-6 tracking-tight transition-colors ${aiInsights?.risk_level === 'high' ? 'text-rose-400' : 'text-emerald-400'}`}>
               {aiInsights?.risk_level?.toUpperCase() || "STABLE"}
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium text-lg">
               {aiInsights?.spending_insights || "Your spending habits are currently within safe parameters for your income bracket."}
            </p>
         </div>
      </div>

      {/* Behavioral Spectrum */}
      <div className="glass-panel p-10 mb-12">
         <h3 className="text-slate-100 font-black text-xl mb-10 flex items-center gap-3">
            <Zap size={24} className="text-sky-400" /> Behavioral Spectrum
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <SpectrumRow label="Impulse vs Planned" value={75} leftLabel="Planned" rightLabel="Impulsive" color="sky" />
            <SpectrumRow label="Needs vs Wants" value={42} leftLabel="Needs" rightLabel="Wants" color="purple" />
            <SpectrumRow label="Social vs Private" value={60} leftLabel="Private" rightLabel="Social" color="emerald" />
            <SpectrumRow label="Velocity vs Stability" value={30} leftLabel="Stable" rightLabel="Volatile" color="rose" />
         </div>
      </div>

      {/* Recommendations */}
      <div>
         <h3 className="text-slate-100 font-black text-xl mb-8 flex items-center gap-3">
            <Target size={24} className="text-amber-400" /> Actionable Strategy
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights?.suggestions ? aiInsights.suggestions.map((s, i) => (
               <div key={i} className="glass-panel !p-6 flex items-start gap-5 hover:border-sky-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 font-black shrink-0 border border-white/5 group-hover:bg-sky-500 group-hover:text-sky-950 transition-all">
                     {i+1}
                  </div>
                  <div className="flex-1">
                     <p className="text-slate-200 font-bold leading-relaxed">{s}</p>
                     <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors">
                        Execute Optimization <ArrowRight size={12} />
                     </button>
                  </div>
               </div>
            )) : (
               <div className="col-span-2 py-12 text-center text-slate-500 glass-panel border-dashed">
                  Load more transactions to generate your personalized AI strategy.
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function SpectrumRow({ label, value, leftLabel, rightLabel, color }) {
   const colorMap = {
      sky: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]',
      purple: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]',
      emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
      rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
   };
   
   return (
      <div>
         <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
            <span className="text-xs font-black text-slate-400">{value}% Profile Shift</span>
         </div>
         <div className="relative h-2 bg-slate-800/80 rounded-full mb-3 border border-white/5">
            <div className={`absolute top-0 h-full ${colorMap[color]} rounded-full transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1)`} style={{ left: `calc(${value}% - 10%)`, width: '20%' }}></div>
         </div>
         <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
         </div>
      </div>
   );
}
