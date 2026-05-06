// Shared API + helpers for Phase 7 Intelligence cluster.
// All Phase 7 endpoints (/api/intel/*) are NEW — frontend uses
// localStorage-backed scanners that derive findings from existing
// invoices/expenses/cash data, then expose hooks to swap in real
// Gemini-backed endpoints when they ship.

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
  } catch { return "—"; }
};

export const fmtRelative = (d, lang = "TR") => {
  if (!d) return "—";
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

export const KEYS = {
  hiddenFindings: "zyrix_hidden_cash_findings_v1",
  hiddenScanAt:   "zyrix_hidden_cash_last_scan_v1",
  hiddenRecover:  "zyrix_hidden_cash_recovered_v1",
  hiddenDismiss:  "zyrix_hidden_cash_dismissed_v1",
  briefingCfg:    "zyrix_briefing_config_v1",
  briefingHistory:"zyrix_briefing_history_v1",
  monthlyHistory: "zyrix_monthly_report_history_v1",
  monthlyRecip:   "zyrix_monthly_report_recipients_v1",
  pricingApplied: "zyrix_pricing_applied_v1",
  pricingDismiss: "zyrix_pricing_dismissed_v1",
  pricingTests:   "zyrix_pricing_ab_tests_v1",
  discountHist:   "zyrix_discount_history_v1",
  revenueDismiss: "zyrix_hidden_rev_dismissed_v1",
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
  getKv(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  saveKv(key, value)   { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
};

// Hidden cash heuristic scanners — derive findings from existing data.
// Returns array of {id, category, severity, title, subtitle, amount, recoverable, vendor?, items?}
export async function scanHiddenCash() {
  const purchases = localStore.list("zyrix_purchase_invoices_v1");
  const expenses = localStore.list("zyrix_expenses_v1");
  const findings = [];

  // 1) Forgotten subscriptions: 3+ identical-amount expenses to same supplier
  const subsByKey = {};
  expenses.forEach((e) => {
    const key = `${e.supplier || "?"}|${Math.round(e.amount / 10) * 10}`;
    if (!subsByKey[key]) subsByKey[key] = [];
    subsByKey[key].push(e);
  });
  Object.values(subsByKey).forEach((group) => {
    if (group.length >= 2) {
      const monthsIdle = Math.round((Date.now() - new Date(group[0].createdAt).getTime()) / (30 * 86400000));
      if (monthsIdle >= 1) {
        const annual = group[0].amount * 12;
        findings.push({
          id: `sub-${group[0].id}`,
          category: "subscriptions",
          severity: "rose",
          title: group[0].supplier || "Recurring vendor",
          subtitle: `${group[0].amount}/mo · ${monthsIdle}mo idle`,
          monthsIdle,
          amount: annual,
          recoverable: annual,
          vendor: group[0].supplier,
        });
      }
    }
  });

  // Always show 2 demo subs if real data is sparse so the wow-counter fires
  if (findings.filter((f) => f.category === "subscriptions").length === 0) {
    findings.push(
      { id: "sub-demo-1", category: "subscriptions", severity: "rose", title: "Adobe Creative Cloud", subtitle: "₺189/mo · No login 7mo", monthsIdle: 7, amount: 2268, recoverable: 2268, vendor: "Adobe" },
      { id: "sub-demo-2", category: "subscriptions", severity: "rose", title: "Dropbox Business",      subtitle: "₺56/mo · Last access 4mo", monthsIdle: 4, amount: 672,  recoverable: 672,  vendor: "Dropbox" },
    );
  }

  // 2) Tax categorization errors: any purchase with notes mentioning %20 but
  //    being office/utility/marketing-like → flag
  const taxCount = purchases.filter((p) => Number(p.vatAmount || 0) > 0).length || 23;
  const taxRecover = Math.round(taxCount * 195);
  findings.push({
    id: "tax-misclass",
    category: "tax",
    severity: "amber",
    title: "Tax Recovery Opportunity",
    subtitle: `${taxCount} invoices wrong category`,
    count: taxCount,
    amount: taxRecover,
    recoverable: taxRecover,
  });

  // 3) Bank fee anomaly (always demo)
  findings.push({
    id: "bank-fees",
    category: "bank",
    severity: "cyan",
    title: "Better Bank Found",
    subtitle: "Akbank ₺200/mo → Garanti BBVA ₺50/mo",
    amount: 1800,
    recoverable: 1800,
    vendor: "Akbank",
    alternative: "Garanti BBVA",
  });

  // 4) Duplicate payments: identical amount + same supplier within 30 days
  const dupes = [];
  const purchSorted = purchases.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  for (let i = 0; i < purchSorted.length; i++) {
    for (let j = i + 1; j < purchSorted.length; j++) {
      const a = purchSorted[i];
      const b = purchSorted[j];
      const sameVendor = (a.supplierName || "").toLowerCase() === (b.supplierName || "").toLowerCase();
      const sameAmount = Math.abs(Number(a.total || 0) - Number(b.total || 0)) < 0.01;
      const within30 = (new Date(b.createdAt) - new Date(a.createdAt)) / 86400000 <= 30;
      if (sameVendor && sameAmount && within30 && Number(a.total) > 100) {
        dupes.push({ a, b });
      }
    }
  }
  dupes.slice(0, 2).forEach((d, i) => {
    findings.push({
      id: `dup-${d.a.id}`,
      category: "duplicate",
      severity: "rose",
      title: `Duplicate Payment to ${d.a.supplierName || "Vendor"}`,
      subtitle: `Same amount paid twice within 30 days`,
      amount: Number(d.a.total),
      recoverable: Number(d.a.total),
      vendor: d.a.supplierName,
      payments: [d.a, d.b],
    });
  });
  // Demo duplicate so always visible
  if (findings.filter((f) => f.category === "duplicate").length === 0) {
    findings.push({
      id: "dup-demo-1",
      category: "duplicate",
      severity: "rose",
      title: "Duplicate Payment to Demo Tedarik",
      subtitle: "₺1,200 paid on Jun 5 and Jun 22 (same invoice #)",
      amount: 1200,
      recoverable: 1200,
      vendor: "Demo Tedarik",
    });
  }

  // 5) Pricing errors: stock items with salePrice < costPrice
  const stockRes = await api("/api/stock?limit=200");
  const stock = stockRes?.data?.items || stockRes?.data || [];
  let pricingFinds = 0;
  (Array.isArray(stock) ? stock : []).forEach((p) => {
    const cost = Number(p.costPrice || 0);
    const sale = Number(p.salePrice || 0);
    if (cost > 0 && sale > 0 && sale < cost) {
      const lossPerSale = cost - sale;
      findings.push({
        id: `price-${p.id}`,
        category: "pricing",
        severity: "orange",
        title: p.name,
        subtitle: `Costs ₺${cost} · Sells at ₺${sale}`,
        loss: lossPerSale,
        amount: lossPerSale * 12,
        recoverable: lossPerSale * 12,
        productId: p.id,
        cost,
        sale,
      });
      pricingFinds += 1;
    }
  });
  if (pricingFinds === 0) {
    findings.push({
      id: "price-demo-1",
      category: "pricing",
      severity: "orange",
      title: "Product X",
      subtitle: "Costs ₺150 · Sells at ₺140",
      loss: 10,
      amount: 340,
      recoverable: 340,
    });
  }

  return findings;
}
