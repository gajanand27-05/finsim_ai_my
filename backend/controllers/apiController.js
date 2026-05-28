const { supabase } = require('../utils/db');
const { parseSMS, generateInsights, analyzeBehavior, analyzeLedger } = require('../services/geminiService');
const { askLocalAI } = require('../services/localAI');

exports.healthCheck = (req, res) => {
  res.json({ status: 'API is running' });
};

exports.getTransactions = async (req, res) => {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  res.json(data || []);
};

exports.getBudgets = async (req, res) => {
  const { data, error } = await supabase.from('budgets').select('*');
  res.json(data || []);
};

/**
 * Advanced Ledger Analysis Controller
 */
exports.getLedgerAnalysis = async (req, res) => {
  try {
    const { data: txns } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    
    if (!txns || txns.length === 0) {
      return res.json({
        ghost_subscriptions: [],
        integrity_score: 100,
        anomalies: [],
        health_summary: "No transactions found to analyze."
      });
    }

    const analysis = await analyzeLedger(txns);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Parses dummy SMS arrays, delegates strict JSON extraction to Gemini,
 * falls back to regex if Gemini fails/struggles, constructs records.
 */
exports.loadDemoSms = async (req, res) => {
  try {
    const defaultSms = [
      { text: "Rs.500 debited at Amazon", date: new Date() },
      { text: "Rs.250 spent on Swiggy", date: new Date() },
      { text: "Rs.1200 paid to Uber", date: new Date() },
      { text: "Rs.800 electricity bill", date: new Date() },
      { text: "Rs.199 Netflix subscription", date: new Date() },
      { text: "Rs.199 Netflix subscription", date: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      { text: "Rs.199 Netflix subscription", date: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
      { text: "Rs.45000 salary credited", date: new Date() },
      { text: "Rs.1500 Gym Membership", date: new Date() },
      { text: "Rs.1500 Gym Membership", date: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      { text: "Rs.5000 rent paid", date: new Date() }
    ];

    const messagesToProcess = req.body.messages || defaultSms;
    const processedTxns = [];

    for (let item of messagesToProcess) {
      const sms = typeof item === 'string' ? item : item.text;
      const date = typeof item === 'string' ? new Date().toISOString() : item.date.toISOString();
      
      const parsed = await parseSMS(sms);
      
      // Validation & Fallback Guardrails (Mandatory)
      let txnRecord = parsed;
      if (parsed.confidence < 0.7 || !parsed.amount || !parsed.merchant) {
         txnRecord.amount = parsed.amount || (sms.match(/[0-9]+/) ? parseFloat(sms.match(/[0-9]+/)[0]) : 0);
         txnRecord.merchant = parsed.merchant || "Unknown Outlet";
      }

      const { data, error } = await supabase.from('transactions').insert([{
        amount: txnRecord.amount,
        merchant: txnRecord.merchant,
        category: txnRecord.category,
        type: txnRecord.type,
        source: 'demo_sms',
        confidence: txnRecord.confidence,
        date: date
      }]).select().single();
      
      if (!error && data) {
         processedTxns.push(data);
      }
    }

    res.json({ message: "Demo SMS Processed", inserted: processedTxns.length, transactions: processedTxns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Aggregates core UI states and forces massive Gemini evaluations
 * to identify risks and suggest optimizations
 */
exports.getDashboard = async (req, res) => {
  try {
    const { data: txns } = await supabase.from('transactions').select('*');
    const { data: budgets } = await supabase.from('budgets').select('*');
    
    const totalSpend = (txns || []).filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
    
    let categoryBreakdown = {};
    (txns || []).forEach(t => {
      if (t.type === 'debit') {
         categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    let healthScore = {};
    let personalityData = {};
    
    if (txns && txns.length > 0) {
      healthScore = await generateInsights(categoryBreakdown, budgets);
      personalityData = await analyzeBehavior(txns);
      
      if (healthScore) {
         await supabase.from('ai_insights').insert([{
            type: 'insight',
            message: healthScore.spending_insights || healthScore.insight || '',
            risk_level: healthScore.risk || healthScore.risk_level || 'low'
         }]);
      }
      if (personalityData) {
         await supabase.from('user_behavior').insert([{
            personality: personalityData.personality,
            pattern: personalityData.pattern
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
};

/**
 * Routes user conversation strictly locally using Ollama Llama3/Mistral APIs.
 */
exports.askAi = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Quick Context Fetch
    const { data: txns } = await supabase.from('transactions').select('amount,merchant,category').limit(5);
    const contextualPrompt = `
       Act as a friendly financial advisor. Context of users latest transactions: ${JSON.stringify(txns)}.
       User Question: "${prompt}"
       Provide a concise 2-sentence conversational answer.
    `;
    
    // HYBRID ROUTING: Try local edge Ollama first, fallback to Gemini
    let responseText = await askLocalAI(contextualPrompt, 'llama3');
    
    if (responseText.includes("Local AI is currently offline")) {
       console.log("[Hybrid Routing] Falling back to Gemini for chat...");
       const { chatAssistant } = require('../services/geminiService');
       responseText = await chatAssistant(prompt, txns);
    }
    
    res.json({ reply: responseText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
