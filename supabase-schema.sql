-- Migration: Extending the Hackathon Schema for AI Integration

-- 1. Alter Existing Tables
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'demo_sms',
  ADD COLUMN IF NOT EXISTS confidence NUMERIC(3,2) DEFAULT 1.0;

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS month TEXT;

-- 2. Create New Tables
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  type TEXT,              -- 'insight', 'warning', 'prediction'
  message TEXT,
  risk_level TEXT,        -- 'low', 'medium', 'high'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_behavior (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  personality TEXT,
  pattern TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Expose new tables to Realtime (optional but recommended for UX)
comment on table ai_insights is 'AI generated insights';
comment on table user_behavior is 'AI analyzed spending persona';
alter publication supabase_realtime add table ai_insights;
alter publication supabase_realtime add table user_behavior;