const { supabase } = require('../utils/db');
const { parseSMS, generateInsights, analyzeBehavior } = require('../services/geminiService');
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
 * Parses dummy SMS arrays, delegates strict JSON extraction to Gemini,
 * falls back to regex if Gemini fails/struggles, constructs records.
 */
exports.loadDemoSms = async (req, res) => {
  try {
    const defaultSms = [
      "Rs.500 debited at Amazon",
      "Rs.250 spent on Swiggy",
      "Rs.1200 paid to Uber",
      "Rs.800 electricity bill"
    ];

    const messagesToProcess = req.body.messages || defaultSms;
    const processedTxns = [];

    for (let sms of messagesToProcess) {
      const parsed = await parseSMS(sms);
      
      // Validation & Fallback Guardrails (Mandatory)
      let txnRecord = parsed;
      if (parsed.confidence < 0.7 || !parsed.amount || !parsed.merchant) {
         console.warn(`[Gemini Fallback] Applying rigorous validation on missing fields:`, parsed);
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
    
    // HYBRID ROUTING: Route directly to local edge Ollama
    const responseText = await askLocalAI(contextualPrompt, 'llama3');
    
    res.json({ reply: responseText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
