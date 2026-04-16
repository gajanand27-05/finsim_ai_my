/**
 * SMS Parser Library targeting major Indian Banks.
 * Fallback to standard generic patterns.
 */
export const parseSMS = (rawText) => {
  const patterns = {
    // HDFC, SBI, ICICI: "Rs.1,234.00 debited from A/c XX1234"
    amount: /(?:rs\.?|inr|₹)\s?([0-9,]+(?:\.[0-9]{2})?)/i,
    
    // "at SWIGGY FOOD" / "to AMAZON" / "merchant: Zomato" / "VPA: id@upi"
    merchant: /(?:at|to|merchant[:\s]+|for|vpa[:\s]+|info[:\s]+)\s*([A-Z0-9&.\-_ ]+?)(?:\s+on|\s+ref|\.|$)/i,
    
    // "on 14-Apr-25" / "15/04/2025" / "12-05-2026"
    date: /(\d{1,2}[-\/]\w{2,3}[-\/]\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    
    // Debit or Credit classification
    type: /(debited|spent|withdrawn|paid|sent to)/i,
  };

  const amountMatch = rawText.match(patterns.amount);
  const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : "0";
  const amount = parseFloat(amountStr);

  const merchantMatch = rawText.match(patterns.merchant);
  // Cleanup common trailing words that regex might catch
  let merchant = merchantMatch ? merchantMatch[1].trim() : "Unknown";
  if (merchant.toLowerCase().endsWith(' is')) merchant = merchant.slice(0, -3).trim();

  // Validate Type
  const isDebit = patterns.type.test(rawText);

  const dateMatch = rawText.match(patterns.date);
  const dateObj = dateMatch ? new Date(dateMatch[1]) : new Date();

  return {
    amount: isNaN(amount) ? 0 : amount,
    merchant,
    date: dateObj.toISOString(),
    type: isDebit ? 'debit' : 'credit',
    rawSms: rawText,
  };
};
