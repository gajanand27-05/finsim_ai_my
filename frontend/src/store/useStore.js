import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

export const useStore = create((set, get) => ({
  user: null,
  transactions: [],
  budgets: [],
  alerts: [],
  loading: true,
  isServerOnline: true,
  
  checkServerHealth: async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/health`, { method: 'GET'});
      set({ isServerOnline: res.ok });
    } catch (e) {
      set({ isServerOnline: false });
    }
  },
  
  initData: async () => {
    set({ loading: true });
    // Fetch initial limits
    const { data: budgetsData } = await supabase.from('budgets').select('*');
    if (budgetsData) set({ budgets: budgetsData });

    // Fetch initial transactions
    let { data: txnsData } = await supabase
       .from('transactions')
       .select('*')
       .order('created_at', { ascending: false });
       
    // fallback if no connection or error
    if (txnsData) {
      set({ transactions: txnsData });
    }

    // Subscribe to real-time changes
    supabase.channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const newTxn = payload.new;
        set((state) => ({ transactions: [newTxn, ...state.transactions] }));
        get().processPreSpendWarning(newTxn);
      })
      .subscribe();
      
    // Start Heartbeat
    setInterval(() => get().checkServerHealth(), 5000);
    get().checkServerHealth();
      
    set({ loading: false });
  },

  processPreSpendWarning: (newTxn) => {
      const state = get();
      const catBudget = state.budgets.find(b => b.category === newTxn.category);
      if (!catBudget) return;

      const totalSpentForCat = state.transactions
         .filter(t => t.category === newTxn.category && t.type === 'debit')
         .reduce((acc, t) => acc + Number(t.amount), 0);

      if (totalSpentForCat > catBudget.limit_amount) {
         state.triggerAlert({
            id: Date.now(),
            severity: 3,
            message: `⛔ Danger! A transaction of ₹${newTxn.amount} at ${newTxn.merchant} pushed you OVER your ${newTxn.category} budget limit of ₹${catBudget.limit_amount}!`
         });
      } else if (totalSpentForCat > (catBudget.limit_amount * 0.8)) {
         state.triggerAlert({
            id: Date.now(),
            severity: 2,
            message: `⚠️ Warning! You've now consumed >80% of your ${newTxn.category} budget.`
         });
      }
  },

  triggerAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts] 
  })),
  
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id)
  }))
}));