const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Ensure GEMINI_API_KEY is available in process.env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5-flash for speed/efficiency

/**
 * AI-Powered SMS Parsing
 * Extracts structured transaction details consistently
 */
async function parseSMS(smsText) {
  try {
    const prompt = `
      Analyze the following Indian Bank SMS representing a transaction.
      Extract the following fields in strict JSON format:
      - amount: number (without currency symbols or commas)
      - merchant: string (the entity receiving/sending the money. Keep it clean)
      - category: string (one of: Food, Transport, Shopping, Bills, Entertainment, Income, Other)
      - type: string (must be exactly 'debit' or 'credit')
      - confidence: number between 0 and 1 indicating how confident you are in this extraction.

      SMS Text: "${smsText}"

      Return ONLY valid JSON. Your response must start with { and end with }. Do not add markdown formatting.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return {
      amount: parsed.amount || 0,
      merchant: parsed.merchant || "Unknown",
      category: parsed.category || "Other",
      type: parsed.type === 'credit' ? 'credit' : 'debit',
      confidence: parsed.confidence || 0.5
    };
  } catch (error) {
    console.error("Gemini SMS parsing failed, falling back to regex...", error);
    // Fallback regex (simple version)
    const fallbackAmount = smsText.match(/(?:rs\.?|inr|₹)\s?([0-9,]+(\.[0-9]+)?)/i);
    const amt = fallbackAmount ? parseFloat(fallbackAmount[1].replace(/,/g, '')) : 0;
    const isDebit = /(debited|spent|paid)/i.test(smsText);
    
    return {
      amount: amt,
      merchant: "Fallback Entity",
      category: "Other",
      type: isDebit ? 'debit' : 'credit',
      confidence: 0.1
    };
  }
}

/**
 * Generate spending insights and predictions
 */
async function generateInsights(spendData, budgets) {
  try {
    const dataStr = JSON.stringify({ spendData, budgets });
    const prompt = `
      You are FINSIM, an expert financial AI. Analyze the user's recent transactions and their category budgets.
      Provide an insightful health-check JSON.

      Data: ${dataStr}

      Return strict JSON:
      {
        "spending_insights": "2-3 sentences of sharp observation.",
        "risk_level": "low" | "medium" | "high",
        "prediction": "1 sentence predicting if they will exhaust their budget based on run-rate.",
        "suggestions": ["Actionable tip 1", "Actionable tip 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return null;
  }
}

/**
 * Behavioral Analysis Persona Generation
 */
async function analyzeBehavior(transactions) {
  try {
    const dataStr = JSON.stringify(transactions);
    const prompt = `
      Given these recent transactions: ${dataStr}
      Determine the user's spending personality.
      Return strict JSON:
      {
        "personality": "Short catchy title (e.g. Weekend Warrior, Prudent Saver, Impulse Spender)",
        "pattern": "1-2 sentences explaining their dominant psychological spending pattern."
      }
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Behavior analysis failed:", error);
    return null;
  }
}

/**
 * Smart natural language chat assistant
 */
async function chatAssistant(userPrompt, contextData) {
   try {
    const prompt = `
      You are an embedded financial assistant. 
      Context Data for this user: ${JSON.stringify(contextData)}
      
      User's question: "${userPrompt}"
      
      Respond directly to them in a helpful, concise manner (max 3 sentences).
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
   } catch(error) {
     return "I'm having trouble analyzing your request right now. Try again shortly!";
   }
}

module.exports = {
  parseSMS,
  generateInsights,
  analyzeBehavior,
  chatAssistant
};
