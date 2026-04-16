require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  const tables = ['transactions', 'budgets', 'ai_insights', 'user_behavior'];
  for (const table of tables) {
    const r = await supabase.from(table).select('id').limit(1);
    console.log(table + ':', r.error ? r.error.message : 'OK');
  }
}

test();