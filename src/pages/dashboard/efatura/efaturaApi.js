// Shared API + helpers for the Phase 4 e-Fatura / Tax cluster.
// Backend has: /api/efatura, /api/recurring, /api/tax-calendar, /api/muhasebeci.
// Tax-Autopilot + Compliance Watcher are AI-driven; we surface mock
// orchestration locally and label the AI-only features as such.
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

// localStorage helpers — backend lacks dedicated endpoints for compliance
// alerts, dismissed deductions, and the Phase 4 archive bucket today.
export const KEYS = {
  archive:        "zyrix_efatura_archive_v1",
  outgoing:       "zyrix_efatura_outgoing_v1",
  incoming:       "zyrix_efatura_incoming_v1",
  recurring:      "zyrix_recurring_plans_v1",
  taxDeadlines:   "zyrix_tax_deadlines_v1",
  complianceAck:  "zyrix_compliance_ack_v1",
  dismissedDeds:  "zyrix_dismissed_deds_v1",
  musavirInvites: "zyrix_musavir_invites_v1",
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
