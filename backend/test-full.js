require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  const txns = await supabase.from('transactions').select('*').order('id', { ascending: false });
  const budgets = await supabase.from('budgets').select('*');

  console.log('\n=== Transactions ===');
  txns.data?.forEach(t => console.log(`#${t.id}: ${t.merchant} - ₹${t.amount} (${t.category})`));

  console.log('\n=== Budgets ===');
  budgets.data?.forEach(b => console.log(`${b.category}: ₹${b.spent}/${b.limit_amount}`));

  // Test alerts (spending > 80% of limit)
  const alerts = [];
  budgets.data?.forEach(b => {
    if (b.spent > b.limit_amount * 0.8) {
      alerts.push(`${b.category}: ₹${b.spent}/${b.limit_amount} (${Math.round(b.spent/b.limit_amount*100)}%)`);
    }
  });
  console.log('\n=== Alerts ===');
  console.log(alerts.length ? alerts.join('\n') : 'All OK');
}

test();