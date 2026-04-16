require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { parseSMS, generateInsights, analyzeBehavior, chatAssistant } = require('./services/geminiService');

const app = express();
const port = process.env.PORT || 5000;

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Transactions & Budgets (Legacy basic endpoints)
app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  res.json(data || []);
});
app.get('/api/budgets', async (req, res) => {
  const { data, error } = await supabase.from('budgets').select('*');
  res.json(data || []);
});

// ============================================
// GEMINI EXTENSION MODULES (AI + CORE)
// ============================================

/**
 * 1. Demo SMS Transaction Loading
 * Intercepts hardcoded text arrays and parses them with Gemini
 */
app.post('/api/load-demo-sms', async (req, res) => {
  try {
    const defaultSms = [
      "Rs.500 debited at Amazon on 14-Apr-2026",
      "Rs.250 spent on Swiggy on 15-Apr-2026",
      "Rs.1200 paid to Uber on 16-Apr-2026",
      "Rs.800 electricity bill deducted to BESCOM on 16-Apr-2026"
    ];

    const messagesToProcess = req.body.messages || defaultSms;
    const processedTxns = [];

    for (let sms of messagesToProcess) {
      const parsed = await parseSMS(sms);
      
      // Store in DB context
      const { data, error } = await supabase.from('transactions').insert([{
        amount: parsed.amount,
        merchant: parsed.merchant,
        category: parsed.category,
        type: parsed.type,
        source: 'demo_sms',
        confidence: parsed.confidence,
        date: new Date().toISOString()
      }]).select().single();
      
      if (!error && data) {
         processedTxns.push(data);
      }
    }

    res.json({ message: "Demo SMS Processed", inserted: processedTxns.length, transactions: processedTxns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Get Dashboard Data + Insights
 * Aggregates DB transactions and dynamically fetches AI health reports
 */
app.get('/api/dashboard', async (req, res) => {
  try {
    const { data: txns } = await supabase.from('transactions').select('*');
    const { data: budgets } = await supabase.from('budgets').select('*');
    
    // Aggregations
    const totalSpend = (txns || []).filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
    
    let categoryBreakdown = {};
    (txns || []).forEach(t => {
      if (t.type === 'debit') {
         categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    // Invoke Gemini AI explicitly for health score
    let healthScore = {};
    let personalityData = {};
    
    if (txns && txns.length > 0) {
      healthScore = await generateInsights(categoryBreakdown, budgets);
      personalityData = await analyzeBehavior(txns);
      
      // Persist insights
      if (healthScore) {
         await supabase.from('ai_insights').insert([{
            type: 'insight',
            message: healthScore.spending_insights || '',
            risk_level: healthScore.risk_level || 'low'
         }]);
      }
    }

    res.json({
      totalSpending: totalSpend,
      categoryBreakdown,
      recentTransactions: (txns || []).slice(0,5),
      aiInsights: healthScore,
      behavior: personalityData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. AI Chat Assistant
 * Context-aware dynamic LLM routing
 */
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Grab user context to ground the LLM
    const { data: txns } = await supabase.from('transactions').select('amount,merchant,category').limit(10);
    const { data: budgets } = await supabase.from('budgets').select('category,limit_amount');
    
    const context = { recentPurchases: txns, budgets };
    const responseText = await chatAssistant(prompt, context);
    
    res.json({ reply: responseText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`FINSIM Gemini Backend listening on port ${port}`);
});
