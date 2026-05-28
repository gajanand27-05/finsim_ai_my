import React, { useState } from 'react';
import { X, Plus, CreditCard, ShoppingBag, Utensils, Car, Zap, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const CATEGORIES = [
  { name: 'Food', icon: <Utensils size={14} />, color: 'bg-orange-500' },
  { name: 'Shopping', icon: <ShoppingBag size={14} />, color: 'bg-purple-500' },
  { name: 'Transport', icon: <Car size={14} />, color: 'bg-blue-500' },
  { name: 'Bills', icon: <Zap size={14} />, color: 'bg-yellow-500' },
  { name: 'Health', icon: <Heart size={14} />, color: 'bg-red-500' },
  { name: 'Entertainment', icon: <Plus size={14} />, color: 'bg-pink-500' },
];

export default function TransactionModal({ isOpen, onClose }) {
  const addTransaction = useStore(state => state.addTransaction);
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    category: 'Food',
    type: 'debit'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString()
    });
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      alert("Failed to save transaction. Check your connection.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-md relative z-10 !p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Plus className="text-sky-400" />
             </div>
             New Entry
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
             <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
            <div className="flex p-1 bg-slate-800/50 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'debit'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'debit' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500'}`}
              >
                DEBIT
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'credit'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'credit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
              >
                CREDIT
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (INR)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
              <input 
                required
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xl font-black text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Merchant / Source</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Amazon, Uber, Salary"
              value={formData.merchant}
              onChange={(e) => setFormData({...formData, merchant: e.target.value})}
              className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat.name})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.category === cat.name ? 'bg-slate-700 border-sky-500/50' : 'bg-slate-800/40 border-white/5 text-slate-500'}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${cat.color} ${formData.category === cat.name ? 'opacity-100' : 'opacity-40'}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 mt-4 !rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                Add Transaction
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
