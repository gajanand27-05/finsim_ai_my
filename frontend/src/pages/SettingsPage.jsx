import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Save, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Health', 'Entertainment'];

export default function SettingsPage() {
  const budgets = useStore(state => state.budgets);
  const updateBudget = useStore(state => state.updateBudget);
  const [loading, setLoading] = useState({});

  const handleUpdate = async (cat, val) => {
    setLoading(prev => ({ ...prev, [cat]: true }));
    await updateBudget(cat, parseFloat(val));
    setLoading(prev => ({ ...prev, [cat]: false }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 shadow-xl">
           <Settings className="text-slate-400" size={24} />
        </div>
        <div>
           <h1 className="text-3xl font-black text-slate-100">Preferences</h1>
           <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Core Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Budget Management */}
        <section className="glass-panel">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
               <Database className="text-sky-400" size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Budget Limits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map(cat => {
              const currentBudget = budgets.find(b => b.category === cat)?.limit_amount || 0;
              return (
                <div key={cat} className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-300">{cat}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Monthly Limit</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                      <input 
                        type="number" 
                        defaultValue={currentBudget}
                        onBlur={(e) => handleUpdate(cat, e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-7 pr-4 text-sm font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                      />
                    </div>
                    {loading[cat] && (
                       <div className="flex items-center px-2">
                          <div className="w-4 h-4 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                       </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security & System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="glass-panel !p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-emerald-400" size={20} />
                <h3 className="font-bold text-slate-100">AI Privacy</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                 Your data is processed using localized hybrid encryption. Personal Identifiable Information is never shared with the AI models during inference.
              </p>
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Enhanced Shield</span>
                 <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
              </div>
           </section>

           <section className="glass-panel !p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-amber-400" size={20} />
                <h3 className="font-bold text-slate-100">Intelligent Alerts</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                 Receive real-time notifications when the AI detects unusual spending spikes or potential budget failures.
              </p>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group">
                 Configure Webhooks <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </section>
        </div>
      </div>
    </div>
  );
}
