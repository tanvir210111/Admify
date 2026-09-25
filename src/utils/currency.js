/**
 * Currency conversion and formatting utility
 * Primary Currency: Bangladeshi Taka (৳ / BDT)
 * Secondary Currency: US Dollar ($ / USD)
 * Standard benchmark exchange rates:
 * 1 USD = 120 BDT
 * 1 CAD = 0.74 USD (88.8 BDT)
 * 1 GBP = 1.30 USD (156 BDT)
 * 1 AUD = 0.66 USD (79.2 BDT)
 * 1 EUR = 1.08 USD (129.6 BDT)
 */

export const USD_TO_BDT_RATE = 120;

export const EXCHANGE_RATES_TO_USD = {
  USD: 1.0,
  $: 1.0,
  CAD: 0.74,
  GBP: 1.30,
  "£": 1.30,
  AUD: 0.66,
  EUR: 1.08,
  "€": 1.08,
};

/**
 * Format an amount in USD into Primary: Taka (৳), Secondary: Dollar ($)
 * @param {number} usdAmount
 * @param {object} options
 * @returns {string} e.g. "৳4,200,000 ($35,000)"
 */
export function formatCurrency(usdAmount, options = {}) {
  const { perYear = false } = options;
  const num = typeof usdAmount === "number" ? usdAmount : parseFloat(String(usdAmount).replace(/[^0-9.]/g, "")) || 0;
  const bdt = Math.round(num * USD_TO_BDT_RATE);

  const bdtStr = bdt.toLocaleString("en-BD");
  const usdStr = Math.round(num).toLocaleString("en-US");

  const suffix = perYear ? " / yr" : "";
  return `৳${bdtStr}${suffix} ($${usdStr}${suffix})`;
}

/**
 * Format primary Taka with secondary USD separated
 */
export function formatDualCurrency(usdAmount) {
  const num = typeof usdAmount === "number" ? usdAmount : parseFloat(String(usdAmount).replace(/[^0-9.]/g, "")) || 0;
  const bdt = Math.round(num * USD_TO_BDT_RATE);

  return {
    bdt: `৳${bdt.toLocaleString("en-BD")}`,
    usd: `$${Math.round(num).toLocaleString("en-US")}`,
    bdtNum: bdt,
    usdNum: Math.round(num),
    combined: `৳${bdt.toLocaleString("en-BD")} ($${Math.round(num).toLocaleString("en-US")})`,
  };
}

/**
 * Parse any currency string containing "$", "CAD", "£", "AUD", "€" or numbers into BDT primary + USD secondary
 * Example: "$35,000 / year" -> "৳4,200,000 / yr ($35,000 / yr)"
 * Example: "CAD $60,510 - $65,510 / year" -> "৳5,373,000 - ৳5,817,000 / yr ($44,780 - $48,480 / yr)"
 */
export function convertTextToDual(text) {
  if (!text || typeof text !== "string") return text;
  // If already formatted with Taka (৳), do not convert again
  if (text.includes("৳")) return text;

  // Check for range patterns like "CAD $60,510 - $65,510 / year" or "£33,050 - £48,620 / year" or "$30,000 - $50,000 / year"
  const rangeRegex = /(CAD\s*\$|AUD\s*\$|£|€|\$)\s*([0-9,]+)\s*[-–—]\s*(?:CAD\s*\$|AUD\s*\$|£|€|\$)?\s*([0-9,]+)(\s*\/\s*(?:year|yr|semester|month|mo))?/i;
  const rangeMatch = text.match(rangeRegex);

  if (rangeMatch) {
    const symbol = rangeMatch[1].toUpperCase().replace(/\s+/g, "");
    let toUsdRate = 1.0;
    if (symbol.includes("CAD")) toUsdRate = EXCHANGE_RATES_TO_USD.CAD;
    else if (symbol.includes("AUD")) toUsdRate = EXCHANGE_RATES_TO_USD.AUD;
    else if (symbol.includes("£") || symbol.includes("GBP")) toUsdRate = EXCHANGE_RATES_TO_USD.GBP;
    else if (symbol.includes("€") || symbol.includes("EUR")) toUsdRate = EXCHANGE_RATES_TO_USD.EUR;

    const minRaw = parseFloat(rangeMatch[2].replace(/,/g, "")) || 0;
    const maxRaw = parseFloat(rangeMatch[3].replace(/,/g, "")) || 0;

    const minUsd = Math.round(minRaw * toUsdRate);
    const maxUsd = Math.round(maxRaw * toUsdRate);

    const minBdt = Math.round(minUsd * USD_TO_BDT_RATE);
    const maxBdt = Math.round(maxUsd * USD_TO_BDT_RATE);

    let period = "";
    if (rangeMatch[4]) {
      const p = rangeMatch[4].toLowerCase();
      if (p.includes("year") || p.includes("yr")) period = " / yr";
      else if (p.includes("month") || p.includes("mo")) period = " / mo";
      else if (p.includes("semester")) period = " / sem";
    }

    const dualString = `৳${minBdt.toLocaleString("en-BD")} - ৳${maxBdt.toLocaleString("en-BD")}${period} ($${minUsd.toLocaleString("en-US")} - $${maxUsd.toLocaleString("en-US")}${period})`;
    return text.replace(rangeMatch[0], dualString);
  }

  // Single amount replacements: e.g. "$61,731 / year" or "€934 Monthly" or "CAD $7,500" or "$299"
  const singleRegex = /(CAD\s*\$|AUD\s*\$|£|€|\$)\s*([0-9,]+)(\s*\/\s*(?:year|yr|semester|month|mo))?/gi;
  return text.replace(singleRegex, (match, prefix, numStr, periodStr) => {
    const symbol = prefix.toUpperCase().replace(/\s+/g, "");
    let toUsdRate = 1.0;
    if (symbol.includes("CAD")) toUsdRate = EXCHANGE_RATES_TO_USD.CAD;
    else if (symbol.includes("AUD")) toUsdRate = EXCHANGE_RATES_TO_USD.AUD;
    else if (symbol.includes("£") || symbol.includes("GBP")) toUsdRate = EXCHANGE_RATES_TO_USD.GBP;
    else if (symbol.includes("€") || symbol.includes("EUR")) toUsdRate = EXCHANGE_RATES_TO_USD.EUR;

    const rawVal = parseFloat(numStr.replace(/,/g, ""));
    if (isNaN(rawVal)) return match;

    const usdVal = Math.round(rawVal * toUsdRate);
    const bdtVal = Math.round(usdVal * USD_TO_BDT_RATE);

    let period = "";
    if (periodStr) {
      const p = periodStr.toLowerCase();
      if (p.includes("year") || p.includes("yr")) period = " / yr";
      else if (p.includes("month") || p.includes("mo")) period = " / mo";
      else if (p.includes("semester")) period = " / sem";
    }

    return `৳${bdtVal.toLocaleString("en-BD")}${period} ($${usdVal.toLocaleString("en-US")}${period})`;
  });
}
