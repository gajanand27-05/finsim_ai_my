import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  transactions: [
    { id: 1, amount: 3200, category: 'Food', merchant: 'Zomato', date: new Date().toISOString() },
    { id: 2, amount: 800, category: 'Transport', merchant: 'Uber', date: new Date().toISOString() }
  ],
  budgetStatus: {
    Food: { spent: 3200, limit: 5000 },
    Transport: { spent: 800, limit: 2000 },
    Shopping: { spent: 1500, limit: 3000 }
  },
  alerts: [],
  
  setUser: (user) => set({ user }),
  
  addTransaction: (txn) => set((state) => ({ 
    transactions: [txn, ...state.transactions] 
  })),
  
  triggerAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts] 
  })),
  
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a, i) => i !== id)
  }))
}));
