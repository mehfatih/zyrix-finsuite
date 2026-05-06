// Shared API + helpers for the Phase 5 cash/bank/AI-finance cluster.
// Backend: /api/banks (CSV import), /api/cash-crisis. Cash accounts,
// cheques, forecast, real-profit are localStorage-backed for now.
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
  const abs = Math.abs(Number(n) || 0);
  const compact = abs >= 1000000 ? `${(abs / 1000000).toFixed(1)}M` : abs >= 10000 ? `${(abs / 1000).toFixed(0)}K` : abs.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${(Number(n) || 0) < 0 ? "-" : ""}${sym}${compact}`;
};

export const fmtCurrencyExact = (n, currency = "TRY") => {
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

// Mock live FX rates (typical Q1 2026 levels). Real deploy hits TCMB or
// an FX provider via /api/fx/rates.
export const FX_RATES = {
  TRY: 1,
  USD: 32.5,
  EUR: 35.2,
  GBP: 41.8,
};

export const convertFx = (amount, from, to) => {
  if (!from || !to || from === to) return Number(amount) || 0;
  const inTry = (Number(amount) || 0) * (FX_RATES[from] || 1);
  return inTry / (FX_RATES[to] || 1);
};

export const KEYS = {
  cashAccounts:   "zyrix_cash_accounts_v1",
  cashTxn:        "zyrix_cash_txns_v1",
  bankStatement:  "zyrix_bank_statement_v1",
  bankReconAck:   "zyrix_bank_recon_ack_v1",
  cheques:        "zyrix_cheques_v1",
  cfoDismissed:   "zyrix_cfo_dismissed_v1",
  crisisDismiss:  "zyrix_crisis_dismiss_v1",
};

export const localStore = {
  list(key)            { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } },
  save(key, items)     { try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* ignore */ } },
  add(key, item)       {
    const arr = localStore.list(key);
    const next = [{ ...item, id: item.id || `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...arr];
    localStore.save(key, next);
    return next[0];
  },
  update(key, id, patch) {
    const arr = localStore.list(key).map((x) => (x.id === id ? { ...x, ...patch } : x));
    localStore.save(key, arr);
    return arr.find((x) => x.id === id);
  },
  remove(key, id)      {
    const arr = localStore.list(key).filter((x) => x.id !== id);
    localStore.save(key, arr);
  },
  get(key, id)         { return localStore.list(key).find((x) => x.id === id) || null; },
};

// Annual TR inflation (TÜİK) — wire to real feed later.
export const TR_ANNUAL_INFLATION = 0.42; // 42%

// Seed demo cash accounts on first run
export function ensureAccountSeed() {
  if (localStore.list(KEYS.cashAccounts).length > 0) return;
  const seeds = [
    { name: "Ana TL Hesabı",       currency: "TRY", balance: 124500, type: "BANK",    bank: "Ziraat",        paletteId: "teal"    },
    { name: "USD İhracat",          currency: "USD", balance: 4200,   type: "BANK",    bank: "İş Bankası",    paletteId: "emerald" },
    { name: "EUR Tedarikçi",        currency: "EUR", balance: 2850,   type: "BANK",    bank: "Garanti BBVA",  paletteId: "cyan"    },
    { name: "Petty Cash",            currency: "TRY", balance: 4800,   type: "PETTY",   bank: "Kasa",          paletteId: "amber"   },
  ];
  seeds.forEach((s) => localStore.add(KEYS.cashAccounts, s));
}

export function ensureChequeSeed() {
  if (localStore.list(KEYS.cheques).length > 0) return;
  const today = Date.now();
  const seeds = [
    { number: "CHK-100201", direction: "INCOMING", party: "ABC Müşteri",      bank: "Ziraat",     amount: 12500, currency: "TRY", dueDate: new Date(today + 12 * 86400000).toISOString(),  status: "PENDING" },
    { number: "CHK-100202", direction: "INCOMING", party: "XYZ Tic.",         bank: "İş Bankası", amount: 4200,  currency: "TRY", dueDate: new Date(today + 28 * 86400000).toISOString(),  status: "DEPOSITED" },
    { number: "CHK-200305", direction: "OUTGOING", party: "Demo Tedarik",     bank: "Garanti",    amount: 8900,  currency: "TRY", dueDate: new Date(today - 4 * 86400000).toISOString(),   status: "CLEARED" },
    { number: "CHK-200306", direction: "OUTGOING", party: "Acme Lojistik",    bank: "QNB",        amount: 1850,  currency: "TRY", dueDate: new Date(today + 5 * 86400000).toISOString(),   status: "PENDING" },
    { number: "CHK-100150", direction: "INCOMING", party: "Geçen Ay Müşteri", bank: "Yapı Kredi", amount: 2100,  currency: "TRY", dueDate: new Date(today - 30 * 86400000).toISOString(),  status: "BOUNCED" },
  ];
  seeds.forEach((s) => localStore.add(KEYS.cheques, s));
}
