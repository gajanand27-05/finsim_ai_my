require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  // Insert transaction
  const txn = await supabase.from('transactions').insert({
    amount: 500,
    merchant: 'Zomato',
    category: 'Food',
    type: 'debit'
  }).select().single();
  console.log('Insert transaction:', txn.error ? txn.error.message : 'OK', txn.data?.id);

  // Insert budget
  const budget = await supabase.from('budgets').insert({
    category: 'Food',
    limit_amount: 5000,
    spent: 500
  }).select().single();
  console.log('Insert budget:', budget.error ? budget.error.message : 'OK', budget.data?.id);

  // Fetch all
  const allTxns = await supabase.from('transactions').select('*');
  console.log('All transactions:', allTxns.data?.length || 0);

  const allBudgets = await supabase.from('budgets').select('*');
  console.log('All budgets:', allBudgets.data?.length || 0);
}

test();