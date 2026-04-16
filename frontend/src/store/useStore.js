import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useStore = create((set) => ({
  user: null,
  transactions: [],
  budgetStatus: {},
  alerts: [],
  loading: false,

  setUser: (user) => set({ user }),

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/api/transactions`);
      const data = await res.json();
      set({ transactions: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      set({ loading: false });
    }
  },

  addTransaction: async (txn) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txn)
      });
      const newTxn = await res.json();
      set((state) => ({ transactions: [newTxn, ...state.transactions] }));
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  },

  fetchBudgets: async () => {
    try {
      const res = await fetch(`${API_URL}/api/budgets`);
      const budgets = await res.json();
      const status = {};
      budgets.forEach(b => { status[b.category] = { spent: b.spent || 0, limit: b.limit }; });
      set({ budgetStatus: status });
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
  },

  addBudget: async (category, limit) => {
    try {
      const res = await fetch(`${API_URL}/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit })
      });
      const newBudget = await res.json();
      set((state) => ({
        budgetStatus: { ...state.budgetStatus, [newBudget.category]: { spent: 0, limit: newBudget.limit } }
      }));
    } catch (err) {
      console.error('Failed to add budget:', err);
    }
  },

  fetchAlerts: async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts`);
      const alerts = await res.json();
      set({ alerts });
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  },

  parseSMS: async (sms) => {
    try {
      const res = await fetch(`${API_URL}/api/parse-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to parse SMS:', err);
      return null;
    }
  },

  triggerAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts]
  })),

  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a, i) => i !== id)
  }))
}));