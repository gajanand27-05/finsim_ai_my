require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 5000;

// Supabase and OpenAI config
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, merchant, category, date, type } = req.body;
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ amount, merchant, category, date, type }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { category, limit } = req.body;
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ category, limit, spent: 0 }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parse SMS
app.post('/api/parse-sms', async (req, res) => {
  try {
    const { sms } = req.body;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Parse this SMS and extract: amount (number), merchant (string), date (ISO), type (debit/credit).
Respond JSON only like: {"amount":1234,"merchant":"ZOMATO","date":"2025-04-14","type":"debit"}`
      }, {
        role: 'user',
        content: sms
      }]
    });
    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budget Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const { data: txns } = await supabase.from('transactions').select('amount, category, date');
    const { data: budgets } = await supabase.from('budgets').select('category, limit');
    const alerts = [];
    const spent = {};
    txns?.forEach(t => {
      spent[t.category] = (spent[t.category] || 0) + t.amount;
    });
    budgets?.forEach(b => {
      if ((spent[b.category] || 0) > b.limit * 0.8) {
        alerts.push({ category: b.category, spent: spent[b.category], limit: b.limit });
      }
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`FINSIM Backend listening on port ${port}`);
});
