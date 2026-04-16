import React, { useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');

  const generateInsight = () => {
    setLoading(true);
    setTimeout(() => {
      setInsight("You're a 'Weekend Warrior' 🎯. 65% of your food budget is spent between Friday and Sunday. Consider meal prepping on Thursday to avoid impulse ordering on Friday night!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mt-8">
      <h1 className="text-2xl mb-6">AI Financial Personality</h1>
      <div className="glass-panel text-center p-12">
         <Activity className="mx-auto text-accent-secondary mb-4" size={48} />
         <h2 className="text-xl font-bold mb-2">Discover Your Spending DNA</h2>
         <p className="text-muted mb-6">Our AI analyzes your ledger history to identify deep behavioral patterns.</p>
         
         {!insight && !loading && (
            <button className="btn btn-primary" onClick={generateInsight}>
               Generate Deep Insight
            </button>
         )}

         {loading && (
            <div className="animate-pulse">
               <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-3/4 mx-auto mb-2"></div>
               <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-1/2 mx-auto"></div>
            </div>
         )}

         {insight && (
            <div className="mt-6 text-left alert alert-warning">
               <AlertTriangle className="alert-icon" size={24} />
               <div>
                  <h4 className="font-bold">AI Diagnosis</h4>
                  <p className="mt-1 text-sm font-light leading-relaxed">{insight}</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
