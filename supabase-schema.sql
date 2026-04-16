-- Supabase Schema Initialization for FINSIM AI+ Hackathon MVP

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT,
  date TIMESTAMP DEFAULT NOW(),
  type TEXT DEFAULT 'debit',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Note: To enable real-time updates for the frontend dashboard:
-- Run the following commands in the SQL editor as well:
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table budgets;