require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  const txns = await supabase.from('transactions').select('amount, category');
  const budgets = await supabase.from('budgets').select('*');

  const spent = {};
  txns.data?.forEach(t => {
    if (t.category) {
      spent[t.category] = (spent[t.category] || 0) + Number(t.amount);
    }
  });

  console.log('\n=== Spent by Category ===');
  Object.entries(spent).forEach(([cat, amt]) => console.log(`${cat}: ₹${amt}`));

  console.log('\n=== Budget Alerts (>80%) ===');
  let hasAlert = false;
  budgets.data?.forEach(b => {
    const s = spent[b.category] || 0;
    const pct = Math.round(s / b.limit_amount * 100);
    if (pct >= 80) {
      console.log(`⚠️ ${b.category}: ₹${s}/${b.limit_amount} (${pct}%)`);
      hasAlert = true;
    }
  });
  if (!hasAlert) console.log('All OK ✅');
}

test();