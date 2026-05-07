// ================================================================
// Phase 12 — Locale-aware formatting helpers
// Built on Intl APIs. Replaces ad-hoc fmtCurrency/fmtDate scattered
// across feature folders. Defaults to TR but accepts EN/AR.
// ================================================================

const LOCALE_MAP = { TR: "tr-TR", EN: "en-US", AR: "ar-SA" };
const CURRENCY_DEFAULT_BY_LANG = { TR: "TRY", EN: "TRY", AR: "SAR" };

const safeLocale = (lang) => LOCALE_MAP[String(lang || "TR").toUpperCase()] || "tr-TR";

export function fmtCurrency(value, opts = {}) {
  const { lang = "TR", currency, maximumFractionDigits = 2, minimumFractionDigits = 0 } = opts;
  const cur = currency || CURRENCY_DEFAULT_BY_LANG[String(lang).toUpperCase()] || "TRY";
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat(safeLocale(lang), {
      style: "currency",
      currency: cur,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(n);
  } catch {
    const sym = cur === "TRY" ? "₺" : cur === "USD" ? "$" : cur === "EUR" ? "€" : cur === "SAR" ? "ر.س." : `${cur} `;
    return `${sym}${n.toLocaleString()}`;
  }
}

export function fmtNumber(value, opts = {}) {
  const { lang = "TR", maximumFractionDigits = 2, minimumFractionDigits = 0 } = opts;
  try {
    return new Intl.NumberFormat(safeLocale(lang), { minimumFractionDigits, maximumFractionDigits }).format(Number(value || 0));
  } catch {
    return Number(value || 0).toLocaleString();
  }
}

export function fmtPercent(value, opts = {}) {
  const { lang = "TR", maximumFractionDigits = 1, multiplier = 1 } = opts;
  // Pass already-percentage-shaped value (0.42 → 42%). Multiplier defaults to 1 because
  // some callers already multiply themselves; pass 100 if the input is the raw percent.
  try {
    return new Intl.NumberFormat(safeLocale(lang), { style: "percent", maximumFractionDigits }).format(Number(value || 0) * multiplier);
  } catch {
    return `${(Number(value || 0) * multiplier * 100).toFixed(maximumFractionDigits)}%`;
  }
}

export function fmtDate(value, opts = {}) {
  const { lang = "TR", style = "medium" } = opts;
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(safeLocale(lang), { dateStyle: style }).format(new Date(value));
  } catch { return "—"; }
}

export function fmtDateTime(value, opts = {}) {
  const { lang = "TR", dateStyle = "medium", timeStyle = "short" } = opts;
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(safeLocale(lang), { dateStyle, timeStyle }).format(new Date(value));
  } catch { return "—"; }
}

export function fmtTime(value, opts = {}) {
  const { lang = "TR", style = "short" } = opts;
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(safeLocale(lang), { timeStyle: style }).format(new Date(value));
  } catch { return "—"; }
}

export function fmtRelativeTime(value, opts = {}) {
  const { lang = "TR" } = opts;
  if (!value) return "—";
  try {
    const diff = (new Date(value).getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(safeLocale(lang), { numeric: "auto" });
    const abs = Math.abs(diff);
    if (abs < 60)        return rtf.format(Math.round(diff), "second");
    if (abs < 3600)      return rtf.format(Math.round(diff / 60), "minute");
    if (abs < 86400)     return rtf.format(Math.round(diff / 3600), "hour");
    if (abs < 2592000)   return rtf.format(Math.round(diff / 86400), "day");
    if (abs < 31536000)  return rtf.format(Math.round(diff / 2592000), "month");
    return rtf.format(Math.round(diff / 31536000), "year");
  } catch { return "—"; }
}

export function isRTL(lang) {
  return String(lang || "").toUpperCase() === "AR";
}

// Useful when building inline styles where left/right need to flip.
// Use logical CSS properties (margin-inline-start) when possible — this is the
// JS-side fallback for the few places where the sidebar-position math matters.
export function dirSign(lang) { return isRTL(lang) ? -1 : 1; }
