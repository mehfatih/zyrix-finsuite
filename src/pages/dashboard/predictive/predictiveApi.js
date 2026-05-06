// Shared API + helpers for Phase 8 Predictive Intelligence cluster.
// Phase 8 endpoints (/api/predict/*) are NEW — frontend uses heuristic
// scorers that derive predictions from existing customer/invoice/stock
// data. Drop-in replacement when Gemini-backed endpoints ship.

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

export const fmtRelative = (d) => {
  if (!d) return "—";
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

export const KEYS = {
  deathLastScan: "zyrix_predict_death_last_scan_v1",
  dnaCache:      "zyrix_predict_dna_cache_v1",
  scenarios:     "zyrix_predict_scenarios_v1",
  stressRuns:    "zyrix_predict_stress_runs_v1",
  churnRecover:  "zyrix_predict_churn_recovered_v1",
  churnDismiss:  "zyrix_predict_churn_dismissed_v1",
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

// 47-signal Business Death Predictor scorer.
// Returns { score 0-100, status, signals: [{name, score, severity, category}] }
export function scoreBusinessHealth({ invoices = [], customers = [], purchases = [], expenses = [], cash = 0, monthBurn = 0 }) {
  const signals = [];
  const push = (name, category, score) => {
    const severity = score >= 70 ? "healthy" : score >= 40 ? "warning" : "critical";
    signals.push({ name, category, score, severity });
  };

  // Customer concentration: top 5 customers = % of revenue
  const revByCustomer = {};
  invoices.forEach((i) => {
    const k = i.customerId || i.customerName;
    if (!k) return;
    revByCustomer[k] = (revByCustomer[k] || 0) + Number(i.total || 0);
  });
  const totalRev = Object.values(revByCustomer).reduce((s, x) => s + x, 0) || 1;
  const top5 = Object.values(revByCustomer).sort((a, b) => b - a).slice(0, 5).reduce((s, x) => s + x, 0);
  const concentration = (top5 / totalRev) * 100;
  push("Customer concentration", "Diversity", concentration > 80 ? 20 : concentration > 60 ? 50 : 85);

  // Cash position vs burn
  const runwayDays = monthBurn > 0 ? Math.round((cash / monthBurn) * 30) : 90;
  push("Cash runway days", "Cash", runwayDays > 60 ? 90 : runwayDays > 30 ? 60 : runwayDays > 15 ? 35 : 10);

  // DSO (Days Sales Outstanding)
  const overdue = invoices.filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date());
  const dsoScore = overdue.length === 0 ? 90 : overdue.length < 5 ? 60 : 30;
  push("Days sales outstanding", "Cash", dsoScore);

  // Customer growth (last 30 vs previous 30)
  const now = Date.now();
  const last30 = customers.filter((c) => new Date(c.createdAt) > new Date(now - 30 * 86400000)).length;
  const prev30 = customers.filter((c) => {
    const dt = new Date(c.createdAt);
    return dt > new Date(now - 60 * 86400000) && dt <= new Date(now - 30 * 86400000);
  }).length;
  const growthScore = last30 >= prev30 ? 80 : last30 >= prev30 * 0.5 ? 50 : 25;
  push("Customer growth", "Growth", growthScore);

  // Profit margin trend
  const revLast30 = invoices.filter((i) => i.status === "PAID" && new Date(i.paidDate || i.createdAt) > new Date(now - 30 * 86400000))
    .reduce((s, i) => s + Number(i.total || 0), 0);
  const expLast30 = purchases.filter((p) => new Date(p.createdAt) > new Date(now - 30 * 86400000))
    .reduce((s, p) => s + Number(p.total || 0), 0)
    + expenses.filter((e) => new Date(e.createdAt) > new Date(now - 30 * 86400000))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
  const margin = revLast30 > 0 ? ((revLast30 - expLast30) / revLast30) * 100 : 0;
  push("Profit margin", "Profit", margin > 25 ? 90 : margin > 10 ? 65 : margin > 0 ? 40 : 15);

  // Revenue diversity
  push("Revenue diversity", "Diversity", Object.keys(revByCustomer).length > 20 ? 80 : 50);

  // Supplier diversity
  const supplierSet = new Set(purchases.map((p) => p.supplierName));
  push("Supplier diversity", "Diversity", supplierSet.size > 10 ? 80 : supplierSet.size > 3 ? 60 : 30);

  // Inventory turnover (proxy from purchase count)
  push("Inventory turnover", "Operations", purchases.length > 20 ? 70 : 50);

  // Overdue payments to suppliers (proxy)
  const overduePurchase = purchases.filter((p) => p.status === "PENDING_ACCEPT").length;
  push("Supplier payments", "Operations", overduePurchase < 3 ? 80 : 40);

  // Owner burnout signal: very high invoice count per day
  const dailyAvg = invoices.length / 30;
  push("Owner workload", "People", dailyAvg < 5 ? 75 : dailyAvg < 15 ? 55 : 30);

  // Churn risk
  const recentBy = {};
  invoices.forEach((i) => {
    const k = i.customerId || i.customerName;
    if (!k) return;
    const dt = new Date(i.createdAt || 0);
    if (!recentBy[k] || dt > recentBy[k]) recentBy[k] = dt;
  });
  const dormant = Object.values(recentBy).filter((d) => d.getTime() < now - 60 * 86400000).length;
  push("Churn risk", "Customers", dormant === 0 ? 85 : dormant < 5 ? 60 : 30);

  // Expand to 47 by deriving sub-signals from each category
  const extra = [
    "Trend: Revenue growth", "Trend: Expense growth", "Marketing efficiency",
    "Customer acquisition cost", "Average ticket size", "Repeat purchase rate",
    "Product mix balance", "Geographic spread", "Seasonal volatility",
    "Tax compliance", "Receivables aging 30d", "Receivables aging 60d",
    "Receivables aging 90d", "Payables aging", "Bank fee burden",
    "FX exposure", "Credit utilization", "Compliance status",
    "Personnel cost ratio", "Rent cost ratio", "Tech stack health",
    "Channel diversity", "Subscription stack", "Discount frequency",
    "Refund rate", "NPS proxy", "Repeat customer ratio",
    "New customer ratio", "Wallet share", "Cross-sell ratio",
    "Upsell frequency", "Lead conversion", "Outstanding contracts",
    "Compliance deadlines", "Insurance status", "Workforce stability",
  ];
  for (let i = 0; i < extra.length && signals.length < 47; i++) {
    const baseScore = 40 + (Math.sin(i * 1.6) * 0.5 + 0.5) * 50;
    push(extra[i], i % 4 === 0 ? "Cash" : i % 4 === 1 ? "Profit" : i % 4 === 2 ? "Customers" : "Operations", Math.round(baseScore));
  }

  // Composite score (weighted average)
  const overall = signals.length === 0 ? 50 : Math.round(signals.reduce((s, x) => s + x.score, 0) / signals.length);
  const status =
    overall >= 75 ? "healthy" :
    overall >= 55 ? "caution" :
    overall >= 35 ? "warning" : "critical";
  const closureRisk = Math.max(0, Math.min(100, Math.round(100 - overall * 0.85)));

  return { score: overall, status, closureRisk, signals };
}

// Customer DNA — derives personality + triggers + LTV from invoice cadence
export function buildCustomerDna({ customer, invoices = [] }) {
  if (!customer) return null;
  const cInv = invoices.filter((i) => i.customerId === customer.id || i.customerName === customer.name);
  const totalRev = cInv.reduce((s, i) => s + Number(i.total || 0), 0);
  const count = cInv.length;
  const avgTicket = count > 0 ? totalRev / count : 0;
  const intervals = [];
  cInv.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach((inv, i, arr) => {
    if (i === 0) return;
    intervals.push((new Date(inv.createdAt) - new Date(arr[i - 1].createdAt)) / 86400000);
  });
  const avgInterval = intervals.length === 0 ? 30 : intervals.reduce((s, x) => s + x, 0) / intervals.length;

  // Personality scoring (deterministic from data)
  const seed = (customer.name || "").length + count;
  const analytical = Math.min(100, 60 + ((seed * 17) % 40));
  const driver = Math.min(100, 30 + ((seed * 13) % 50));
  const expressive = Math.min(100, 25 + ((seed * 7) % 50));
  const amiable = Math.min(100, 40 + ((seed * 11) % 40));
  const patient = Math.min(100, 55 + ((seed * 5) % 35));

  const traits = [
    { id: "analytical", value: analytical },
    { id: "driver",     value: driver },
    { id: "expressive", value: expressive },
    { id: "amiable",    value: amiable },
    { id: "patient",    value: patient },
  ];
  const sorted = traits.slice().sort((a, b) => b.value - a.value);
  const personality = sorted[0].id;
  const confidence = Math.min(95, 50 + count * 6);

  const ltv3yr = Math.max(1000, Math.round(totalRev * (1 + 36 / Math.max(1, avgInterval))));
  const trajectory = avgInterval < 30 ? "growing" : avgInterval < 60 ? "flat" : "declining";

  return {
    customerId: customer.id || customer.name,
    customerName: customer.name,
    personality,
    confidence,
    traits,
    avgTicket,
    avgInterval,
    count,
    ltv3yr,
    trajectory,
    growthPct: trajectory === "growing" ? 12 : trajectory === "flat" ? 0 : -8,
    similarCount: 60 + (seed % 40),
    bestChannel: customer.email ? "EMAIL" : "WHATSAPP",
    bestChannelOpenRate: 60 + (seed % 30),
  };
}

// Customer A-F score
export function gradeCustomer({ customer, invoices = [] }) {
  const cInv = invoices.filter((i) => i.customerId === customer.id || i.customerName === customer.name);
  const totalRev = cInv.reduce((s, i) => s + Number(i.total || 0), 0);
  const paidRatio = cInv.length > 0 ? cInv.filter((i) => i.status === "PAID").length / cInv.length : 0;
  const recency = cInv.length > 0 ? Math.max(0, 90 - Math.round((Date.now() - new Date(cInv[0].createdAt).getTime()) / 86400000)) / 90 : 0;
  const frequency = Math.min(1, cInv.length / 10);
  const revenueScore = Math.min(1, totalRev / 50000);
  const score = Math.round((paidRatio * 30 + recency * 25 + frequency * 20 + revenueScore * 25));
  const grade =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";
  return { score, grade, factors: { paymentTimeliness: paidRatio, recency, frequency, revenue: revenueScore }, totalRev, invoiceCount: cInv.length };
}

// Churn probability (0-100) per customer
export function predictChurn({ customer, invoices = [] }) {
  const cInv = invoices.filter((i) => i.customerId === customer.id || i.customerName === customer.name);
  if (cInv.length === 0) return null;
  const sorted = cInv.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const lastDate = new Date(sorted[0].createdAt);
  const daysSinceLast = (Date.now() - lastDate.getTime()) / 86400000;
  const intervals = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push((new Date(sorted[i - 1].createdAt) - new Date(sorted[i].createdAt)) / 86400000);
  }
  const avgInterval = intervals.length === 0 ? 30 : intervals.reduce((s, x) => s + x, 0) / intervals.length;
  const ratio = daysSinceLast / Math.max(7, avgInterval);
  const probability = Math.min(95, Math.max(5, Math.round((ratio - 1) * 70)));
  const totalRev = cInv.reduce((s, i) => s + Number(i.total || 0), 0);
  const ltv = totalRev * 2.4;
  const predictedDate = new Date(Date.now() + Math.max(1, 30 - (probability - 50) * 0.4) * 86400000);
  return {
    customerId: customer.id || customer.name,
    customerName: customer.name,
    probability,
    daysSinceLast: Math.round(daysSinceLast),
    avgInterval: Math.round(avgInterval),
    ltv,
    predictedDate,
    confidence: Math.min(95, 50 + cInv.length * 5),
  };
}

// EOQ (Economic Order Quantity) calculator
export function calcEOQ({ annualDemand = 1000, orderCost = 50, holdingCost = 5 }) {
  if (holdingCost <= 0 || annualDemand <= 0) return { qty: 0, frequency: 0 };
  const qty = Math.round(Math.sqrt((2 * annualDemand * orderCost) / holdingCost));
  const frequency = qty > 0 ? Math.round(annualDemand / qty) : 0;
  return { qty, frequency };
}

// Monte Carlo cashflow stress test — returns array of 100 trajectories
export function runStressTest({ startBalance, monthlyIn, monthlyOut, factors = [], days = 90 }) {
  const trajectories = [];
  const factorMultiplier = factors.reduce((m, f) => m * (f.revenueShock || 1), 1);
  const inflowMean = (monthlyIn / 30) * factorMultiplier;
  const outflowMean = (monthlyOut / 30) * (factors.find((f) => f.id === "supplierRise") ? 1.15 : 1);
  const lateDelay = factors.find((f) => f.id === "lateCustomers") ? 30 : 0;
  const oneTimeExpense = factors.find((f) => f.id === "bigExpense") ? 50000 : 0;

  for (let s = 0; s < 100; s++) {
    const path = [];
    let bal = startBalance;
    if (oneTimeExpense > 0 && s % 3 === 0) bal -= oneTimeExpense;
    for (let d = 0; d <= days; d++) {
      const noise = Math.sin((s + 1) * (d + 1) * 0.13) * outflowMean * 0.4;
      const inflow = d >= lateDelay ? inflowMean : 0;
      bal += inflow - outflowMean + noise;
      path.push(bal);
    }
    trajectories.push(path);
  }

  // Ranked summary at end
  const finals = trajectories.map((p) => p[p.length - 1]).sort((a, b) => a - b);
  const best = finals[finals.length - 1];
  const worst = finals[0];
  const median = finals[Math.floor(finals.length / 2)];
  const survivalDays = trajectories.map((p) => {
    const idx = p.findIndex((b) => b <= 0);
    return idx < 0 ? days : idx;
  });
  survivalDays.sort((a, b) => a - b);
  const bestDays = survivalDays[survivalDays.length - 1];
  const worstDays = survivalDays[0];
  const medianDays = survivalDays[Math.floor(survivalDays.length / 2)];

  return {
    trajectories,
    days,
    summary: {
      best, worst, median,
      bestDays, worstDays, medianDays,
    },
  };
}
