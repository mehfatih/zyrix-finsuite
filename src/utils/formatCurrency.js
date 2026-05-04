// ================================================================
// Zyrix FinSuite — formatCurrency utility
// Country-aware money formatter for the V2 design system.
//
// Usage:
//   import { formatCurrency } from "../utils/formatCurrency.js";
//   import { useCountry } from "../hooks/useCountry.jsx";
//   import { useI18n } from "../i18n/i18n.jsx";
//
//   const { profile } = useCountry();
//   const { lang } = useI18n();
//
//   formatCurrency("850K", profile, lang)
//     → "₺850K"     (TR lang, any country)
//     → "$850K"     (EN lang, any country)
//     → "850K ر.س"  (AR lang + Saudi Arabia)
//     → "850K د.إ"  (AR lang + UAE)
//     → "850K ج.م"  (AR lang + Egypt)
// ================================================================

/**
 * Format a money value with country-aware currency symbol.
 *
 * Logic:
 *   - TR lang → "₺" prefix (Turkish lira, always)
 *   - EN lang → "$" prefix (international default)
 *   - AR lang → country-specific symbol from profile, suffix
 *
 * @param {string|number} value - The numeric part, e.g. "850K", "1,250,000", 87
 * @param {object} profile - Country profile from useCountry() hook
 * @param {string} lang - Language code from useI18n(): "TR" | "EN" | "AR"
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, profile, lang) {
  const v = String(value);

  // Turkish: always Lira
  if (lang === "TR") {
    return "\u20BA" + v;
  }

  // English: international default ($)
  if (lang === "EN") {
    return "$" + v;
  }

  // Arabic: country-specific currency symbol (suffix style)
  // For non-Arab countries (TR/US), fallback to ر.س to keep Arabic context
  if (lang === "AR") {
    const ARAB_COUNTRIES = ["SA", "AE", "EG", "QA", "KW", "BH", "OM", "JO", "MA", "LB", "TN", "DZ", "IQ", "SY", "YE", "LY", "PS", "SD"];
    const isArabCountry = profile && profile.code && ARAB_COUNTRIES.indexOf(profile.code) !== -1;
    const symbol = isArabCountry
      ? (profile.currencySymbol || profile.currencyCode || "\u0631.\u0633")
      : "\u0631.\u0633"; // ر.س default for non-Arab countries
    return v + " " + symbol;
  }

  // Fallback (unknown lang)
  return "$" + v;
}

/**
 * Get just the currency symbol/prefix for a given lang+profile.
 * Useful for labels like "Currency: $" or "Currency: ر.س"
 */
export function getCurrencySymbol(profile, lang) {
  if (lang === "TR") return "\u20BA";
  if (lang === "EN") return "$";
  if (lang === "AR") {
    return (
      (profile && profile.currencySymbol) ||
      (profile && profile.currencyCode) ||
      "\u0631.\u0633"
    );
  }
  return "$";
}

/**
 * Format with thousands separators based on locale.
 * - EN/AR: 1,250,000
 * - TR:    1.250.000
 *
 * @param {number} num - The number to format
 * @param {string} lang - Language code
 */
export function formatNumber(num, lang) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);

  if (lang === "TR") {
    return n.toLocaleString("tr-TR");
  }
  if (lang === "AR") {
    return n.toLocaleString("en-US"); // Western digits, comma separator
  }
  return n.toLocaleString("en-US");
}

/**
 * Combined: format a raw number with both thousand separators AND currency.
 *
 * Example:
 *   formatMoney(1250000, profile, "EN")  → "$1,250,000"
 *   formatMoney(1250000, profile, "TR")  → "₺1.250.000"
 *   formatMoney(1250000, saudiProfile, "AR") → "1,250,000 ر.س"
 */
export function formatMoney(num, profile, lang) {
  const formatted = formatNumber(num, lang);
  return formatCurrency(formatted, profile, lang);
}
