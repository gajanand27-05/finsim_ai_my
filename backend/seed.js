require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const seedDatabase = async () => {
  console.log("Seeding Hackathon Demo data...");
  
  // 1. Insert Budgets
  const { error: err1 } = await supabase.from('budgets').insert([
    { category: 'Food', limit_amount: 5000 },
    { category: 'Transport', limit_amount: 2000 },
    { category: 'Shopping', limit_amount: 3000 }
  ]);
  
  if (err1) console.error("Budgets exist or error:", err1.message);

  // 2. Insert Past Transactions
  const dummyTxns = [
    { amount: 350, merchant: 'Zomato', category: 'Food', type: 'debit', date: new Date(Date.now() - 5*86400000).toISOString() },
    { amount: 1500, merchant: 'Uber', category: 'Transport', type: 'debit', date: new Date(Date.now() - 4*86400000).toISOString() },
    { amount: 2000, merchant: 'Amazon', category: 'Shopping', type: 'debit', date: new Date(Date.now() - 3*86400000).toISOString() },
    { amount: 800, merchant: 'Swiggy', category: 'Food', type: 'debit', date: new Date(Date.now() - 1*86400000).toISOString() }
  ];

  const { error: err2 } = await supabase.from('transactions').insert(dummyTxns);
  
  if (err2) console.error("Transactions error:", err2.message);
  else console.log("Demo txns seeded successfully!");
};

seedDatabase();
