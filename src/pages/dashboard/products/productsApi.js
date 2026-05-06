// Shared API helpers for the Phase 3 products / stock cluster.
// Talks to /api/stock for product persistence (the backend "stockItem"
// model is the product catalog). Services + variants are localStorage.
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const apiBase = API;

export const fmtCurrency = (n, currency = "TRY") => {
  const sym = currency === "TRY" ? "₺" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency + " ";
  return `${sym}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const fmtDate = (d, lang = "TR") => {
  if (!d) return "—";
  try {
    const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    return new Date(d).toLocaleDateString(locale);
  } catch {
    return "—";
  }
};

export const SERVICES_KEY = "zyrix_services_v1";
export const PRODUCT_IMAGES_KEY = "zyrix_product_images_v1";
export const PRODUCT_VARIANTS_KEY = "zyrix_product_variants_v1";

export function localList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
export function localSave(key, items) {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* ignore */ }
}
