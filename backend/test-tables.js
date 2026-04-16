require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  const t = await supabase.from('transactions').select('id').limit(1);
  const b = await supabase.from('budgets').select('id').limit(1);
  console.log('Transactions:', t.error ? t.error.message : 'OK');
  console.log('Budgets:', b.error ? b.error.message : 'OK');
}

test();