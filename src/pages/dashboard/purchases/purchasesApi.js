// Shared API helpers for the Phase 3 purchases / products / stock cluster.
// The backend currently only exposes /api/stock; suppliers, purchase
// invoices, expenses are stored in localStorage so the UI is fully
// functional today and migrates seamlessly when /api/* lands.
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
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const apiBase = API;

// Local-storage backed collection — drop-in replacement for a REST list.
// When a real route lands, just swap callers to `api("/api/<path>")`.
export const localStore = {
  list(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  },
  save(key, items) {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* ignore */ }
  },
  add(key, item) {
    const arr = localStore.list(key);
    const next = [{ ...item, id: item.id || `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }, ...arr];
    localStore.save(key, next);
    return next[0];
  },
  update(key, id, patch) {
    const arr = localStore.list(key).map((x) => (x.id === id ? { ...x, ...patch } : x));
    localStore.save(key, arr);
    return arr.find((x) => x.id === id);
  },
  remove(key, id) {
    const arr = localStore.list(key).filter((x) => x.id !== id);
    localStore.save(key, arr);
  },
  get(key, id) {
    return localStore.list(key).find((x) => x.id === id) || null;
  },
};

export const KEYS = {
  suppliers:   "zyrix_suppliers_v1",
  purchases:   "zyrix_purchase_invoices_v1",
  pos:         "zyrix_purchase_orders_v1",
  expenses:    "zyrix_expenses_v1",
  services:    "zyrix_services_v1",
};

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

export const monthsAgo = (date) => {
  if (!date) return Infinity;
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60 * 24 * 30);
};

export const daysAgo = (date) => {
  if (!date) return Infinity;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
};

// Seed a few demo suppliers if the store is empty (so the supplier 360°
// page has something interesting to show out of the box).
export function ensureSupplierSeed() {
  if (localStore.list(KEYS.suppliers).length > 0) return;
  const seeds = [
    { name: "Demo Tedarik A.Ş.",    category: "Hammadde", taxId: "1234567890", email: "info@demo-tedarik.com", phone: "+90 212 555 0001" },
    { name: "Acme Ofis Malzeme",   category: "Ofis",     taxId: "9876543210", email: "satis@acme-ofis.com",  phone: "+90 216 555 0002" },
    { name: "Yıldız Lojistik",      category: "Nakliye",  taxId: "5555555555", email: "destek@yildiz.com",    phone: "+90 312 555 0003" },
  ];
  seeds.forEach((s) => localStore.add(KEYS.suppliers, s));
}
