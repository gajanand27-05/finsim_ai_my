require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const sql = `
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT,
  date TIMESTAMP DEFAULT NOW(),
  type TEXT DEFAULT 'debit',
  source TEXT DEFAULT 'demo_sms',
  confidence NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  month TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  type TEXT,
  message TEXT,
  risk_level TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_behavior (
  id SERIAL PRIMARY KEY,
  personality TEXT,
  pattern TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

console.log("Initializing database tables...");

// Since rpc('pg_catalog') might not be enabled, we advise manual creation 
// but provide this script as a reference.
console.log("SQL to execute in Supabase SQL Editor:");
console.log(sql);
