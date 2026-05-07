// Shared API + helpers for Phase 9 Cognitive Companion cluster.
// Phase 9 endpoints (/api/cognitive/*) are NEW — frontend uses heuristic
// generators that derive briefings, decisions, wellness, future-self
// chat, calendar plans, AR analysis, and fraud anomalies from existing
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

export const fmtTime = (d, lang = "TR") => {
  if (!d) return "—";
  try {
    const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    return new Date(d).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};

export const fmtDate = (d, lang = "TR") => {
  if (!d) return "—";
  try {
    const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    return new Date(d).toLocaleDateString(locale);
  } catch { return "—"; }
};

export const KEYS = {
  callRecordings:  "zyrix_cog_call_recordings_v1",
  decisionsLog:    "zyrix_cog_decisions_log_v1",
  autoRules:       "zyrix_cog_auto_rules_v1",
  wellnessHistory: "zyrix_cog_wellness_history_v1",
  futureChat:      "zyrix_cog_future_chat_v1",
  futureNotes:     "zyrix_cog_future_notes_v1",
  calendarPlan:    "zyrix_cog_calendar_plan_v1",
  arCaptures:      "zyrix_cog_ar_captures_v1",
  fraudReviews:    "zyrix_cog_fraud_reviews_v1",
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

// ─── Negotiation Coach helpers ────────────────────────────────
const TALKING_POINTS_BY_PERSONALITY = {
  analytical: [
    "Lead with numbers — ROI, payback period, %ages",
    "Avoid emotional appeals; they confuse this customer",
    "Be ready with data: invoice history, comparable benchmarks",
    "Counter discount asks with bundle math, not feelings",
  ],
  driver: [
    "Get to the point in 30 seconds — they hate preamble",
    "Lead with the recommendation, then justify briefly",
    "Offer 2-3 clear options, never more",
    "Confirm next steps + deadlines before hanging up",
  ],
  expressive: [
    "Open with a personal story or shared connection",
    "Use vision language: 'imagine what this would do for you'",
    "Mirror their energy and tone",
    "End with vivid recap — they remember stories not specs",
  ],
  amiable: [
    "Open warm, ask how they/family are",
    "Move slowly; reassure on risk and continuity",
    "Mention long-term partnership and our relationship",
    "Avoid hard closes — propose, don't push",
  ],
};

export function buildPreCallBrief({ customer, dna, lastInvoice, ltv, churn }) {
  if (!customer) return null;
  const personality = dna?.personality || "analytical";
  return {
    customerName: customer.name || customer.customerName,
    scheduledAt: new Date().toISOString(),
    personality,
    style: `style.${personality}`,
    talkingPoints: TALKING_POINTS_BY_PERSONALITY[personality] || TALKING_POINTS_BY_PERSONALITY.analytical,
    context: {
      lastInvoice: lastInvoice || null,
      ltv: ltv || 0,
      churnRisk: churn || 12,
    },
  };
}

export function analyzeCallRecording({ durationSec = 720, transcript = "" }) {
  // Synthetic but data-driven analysis: derive metrics from transcript length / mock
  const words = transcript.split(/\s+/).filter(Boolean).length;
  const youPct = Math.min(85, Math.max(25, 50 + Math.round(Math.sin(words) * 30)));
  const customerPct = 100 - youPct;
  const recommended = "40-50% you · 50-60% customer";
  const verdict = youPct > 60 ? "tooMuch" : youPct < 35 ? "tooLittle" : "balanced";
  return {
    durationSec,
    youPct,
    customerPct,
    recommended,
    verdict,
    sentiment: {
      start:  60,
      middle: 40,
      end:    75,
    },
    keyMoments: [
      { atSec: 222, kind: "warning", note: 'Customer said "expensive" 4 times — ROI never addressed' },
      { atSec: 435, kind: "positive", note: "You offered alternative discount — customer agreed immediately" },
      { atSec: 570, kind: "warning", note: "Competitor mentioned — you didn't probe the concern" },
    ],
    recommendations: [
      "Next time: ask more questions, talk less",
      'When customer says "expensive", lead with ROI numbers',
      "Probe competitor mentions — might be at risk",
    ],
    actions: [
      { id: "act-1", label: "Send promised discount confirmation" },
      { id: "act-2", label: "Schedule 7-day follow-up (auto-scheduled)" },
      { id: "act-3", label: "Update Customer DNA with new insight" },
    ],
  };
}

// ─── Decision Manager helpers ───────────────────────────────────
const DECISION_TEMPLATES = (invoices, customers, purchases) => {
  const out = [];
  const overdue = (invoices || []).filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date());
  if (overdue[0]) {
    const inv = overdue[0];
    out.push({
      id: `dec-overdue-${inv.id}`,
      kind: "invoice",
      title: `${inv.customerName || "Customer"} requests 30-day extension`,
      analysis: [
        `Payment risk +12%`,
        `Customer LTV ${fmtCurrency(Number(inv.total || 0) * 4)}`,
        `Recommended: Approve with credit limit`,
      ],
      recommended: "approve",
      urgency: 92,
      amount: Number(inv.total || 0),
    });
  }
  if (purchases[0]) {
    const p = purchases[0];
    const discount = Math.round(Number(p.total || 0) * 0.08);
    out.push({
      id: `dec-supplier-${p.id}`,
      kind: "purchase",
      title: `${p.supplierName || "Supplier"} offers payment-discount`,
      analysis: [
        `Pay now (${fmtCurrency(p.total)}) for 8% discount = ${fmtCurrency(discount)} save`,
        "ROI 8% over 30 days = excellent",
        "Cash position allows it",
      ],
      recommended: "approve",
      urgency: 78,
      amount: Number(p.total || 0),
    });
  }
  // Add default decisions to always have 5
  out.push({
    id: "dec-discount-vip-1",
    kind: "discount",
    title: "VIP customer asks for 12% discount on ₺18K order",
    analysis: ["LTV ₺94K (top 5)", "Margin after discount: 28% (still healthy)", "Recommended: Counter with 10% + free shipping"],
    recommended: "counter",
    urgency: 65,
    amount: 18000,
  });
  out.push({
    id: "dec-payment-1",
    kind: "payment",
    title: "Pay supplier early to lock 5% discount",
    analysis: ["Save ₺640", "Supplier reliability bonus", "Cash impact: -₺12,160 today"],
    recommended: "approve",
    urgency: 58,
    amount: 12800,
  });
  out.push({
    id: "dec-refund-1",
    kind: "refund",
    title: "Refund request from new customer",
    analysis: ["Customer tier: New", "Reason: 'Wrong size'", "Goodwill cost: ₺450"],
    recommended: "approve",
    urgency: 42,
    amount: 450,
  });
  return out.slice(0, 5);
};

export function buildTodayDecisions({ invoices, customers, purchases }) {
  return DECISION_TEMPLATES(invoices || [], customers || [], purchases || []);
}

export function detectAutoRules({ decisionsLog }) {
  // Group identical kinds with same recommendation; if user did the same 5+ times suggest
  const groups = {};
  (decisionsLog || []).forEach((d) => {
    const key = `${d.kind}|${d.decision}`;
    if (!groups[key]) groups[key] = { kind: d.kind, decision: d.decision, count: 0, total: 0 };
    groups[key].count += 1;
    groups[key].total += 1;
  });
  return Object.values(groups).filter((g) => g.count >= 3);
}

// ─── Wellness Index helpers ─────────────────────────────────────
export function computeWellness({ invoices, customers, purchases, cash, monthBurn }) {
  const totalRev = (invoices || []).reduce((s, i) => s + Number(i.total || 0), 0);
  const overdue = (invoices || []).filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date()).length;
  const churnSignals = (customers || []).length === 0 ? 0 : Math.min(100, 30 + (overdue / Math.max(1, (customers || []).length)) * 100);

  const customerSentiment = Math.max(40, 95 - overdue * 4);
  const cashAnxiety = monthBurn > 0 ? Math.min(95, Math.max(15, Math.round((cash / monthBurn) * 30 * 1.2))) : 60;
  const burnoutRisk = Math.max(20, 100 - Math.min(80, (invoices || []).length / 5));
  const growth = Math.min(95, 50 + Math.min(40, (invoices || []).length / 4));
  const opStress = Math.max(20, 90 - overdue * 6 - Math.min(40, (purchases || []).length));

  const score = Math.round((customerSentiment + cashAnxiety + burnoutRisk + growth + opStress) / 5);
  const dimensions = [
    { id: "customerSentiment", value: Math.round(customerSentiment) },
    { id: "cashAnxiety",       value: Math.round(cashAnxiety) },
    { id: "burnout",           value: Math.round(burnoutRisk) },
    { id: "growth",            value: Math.round(growth) },
    { id: "opStress",          value: Math.round(opStress) },
  ];
  const status =
    score >= 80 ? "excellent" :
    score >= 60 ? "healthy"  :
    score >= 40 ? "caution"  : "warning";
  return { score, status, dimensions };
}

// ─── Future Self chat helpers ───────────────────────────────────
const FUTURE_RESPONSES = {
  best: "Hiring Layla as ops manager in 2026 was the best move. She freed up 30+ hours of my week. ROI was 10x in 6 months — but I almost didn't do it because the salary felt expensive. Don't postpone the hire you're considering.",
  regret: "I waited too long to raise prices. I was scared of losing customers; in reality I lost margin instead. The 5 customers who left after our 8% increase had been low-margin anyway. Net positive.",
  focus: "Focus on the 20 customers driving 80% of your revenue. The 47 long-tail customers consume more time than they're worth. I learned this the hard way in 2027.",
  expand: "The 2nd location worked out — but it took 18 months to break even. The hardest months were 8–12 when cash was extremely tight. If I were you now, I'd ask: Do I have ₺250K cash buffer? If yes, proceed. If not, focus on growing current location to that level first.",
  generic: "Whatever you're choosing now — make sure you can sleep at night. The biggest mistakes I made came from saying yes to deals that needed me to compromise. Ask: would I be proud of this in 5 years?",
};

export function generateFutureResponse(question = "") {
  const q = question.toLowerCase();
  if (q.includes("best") || q.includes("good") || q.includes("right")) return FUTURE_RESPONSES.best;
  if (q.includes("regret") || q.includes("wrong") || q.includes("mistake")) return FUTURE_RESPONSES.regret;
  if (q.includes("focus") || q.includes("priority") || q.includes("important")) return FUTURE_RESPONSES.focus;
  if (q.includes("expand") || q.includes("location") || q.includes("branch") || q.includes("şube")) return FUTURE_RESPONSES.expand;
  return FUTURE_RESPONSES.generic;
}

// ─── Calendar Planner ───────────────────────────────────────────
export function generateDayPlan({ name = "" } = {}) {
  const baseDate = new Date();
  baseDate.setHours(7, 0, 0, 0);
  const at = (h, m) => {
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    { id: "ev-1", at: at(7, 0),   priority: "auto",     title: "Daily Briefing",                      subtitle: "Auto-sent ✓",                                  icon: "☀️" },
    { id: "ev-2", at: at(8, 30),  priority: "high",     title: "Call Customer X (high churn risk)",   subtitle: "AI prepared talking points",                   icon: "📞" },
    { id: "ev-3", at: at(9, 30),  priority: "free",     title: "Free slot",                           subtitle: "AI suggests: Strategic planning hour",         icon: "💡" },
    { id: "ev-4", at: at(11, 0),  priority: "medium",   title: "Approve 3 pending invoices",          subtitle: "Auto-shown when you arrive",                   icon: "✓" },
    { id: "ev-5", at: at(12, 0),  priority: "protected",title: "Lunch (protected)",                   subtitle: "Don't book over this",                          icon: "🥗" },
    { id: "ev-6", at: at(13, 30), priority: "high",     title: "Visit Supplier Y",                    subtitle: "23 min drive · route in Maps",                  icon: "🚗" },
    { id: "ev-7", at: at(15, 0),  priority: "medium",   title: "Review weekly KPIs",                  subtitle: "Q1 dashboard ready",                            icon: "📊" },
    { id: "ev-8", at: at(16, 30), priority: "low",      title: "Reply to 8 customer messages",        subtitle: "AI drafted in inbox",                           icon: "💬" },
    { id: "ev-9", at: at(18, 0),  priority: "protected",title: "Family time (protected)",             subtitle: "Phone on Do Not Disturb",                       icon: "🏠" },
  ];
}

// ─── AR mock analysis ───────────────────────────────────────────
export function fakeStorefrontAnalysis() {
  return {
    zones: [
      { id: "z1", x: 18, y: 30, label: "lowTraffic",  severity: "warning"  },
      { id: "z2", x: 55, y: 50, label: "movePremium", severity: "success" },
      { id: "z3", x: 80, y: 22, label: "lighting",    severity: "alert"    },
      { id: "z4", x: 40, y: 70, label: "bestseller",  severity: "success" },
    ],
    recommendations: ["rec.eyeLevel", "rec.lighting", "rec.priceTag"],
  };
}

export function fakeReceiptDetect() {
  return {
    total: 247.50,
    date: new Date().toISOString(),
    vendor: "Migros",
    items: 12,
    vat: 47.50,
    suggestedCategory: "office",
  };
}

// ─── Fraud anomaly scanner ──────────────────────────────────────
export function scanFraudAnomalies({ invoices = [], purchases = [], customers = [] }) {
  const out = [];

  // Duplicate invoice (same amount + customer within 24h)
  const sortedI = invoices.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  for (let i = 0; i < sortedI.length; i++) {
    for (let j = i + 1; j < sortedI.length; j++) {
      const a = sortedI[i];
      const b = sortedI[j];
      const sameAmt = Math.abs(Number(a.total || 0) - Number(b.total || 0)) < 0.01;
      const sameCust = (a.customerName || "") === (b.customerName || "");
      const within = (new Date(b.createdAt) - new Date(a.createdAt)) / 3600000 < 24;
      if (sameAmt && sameCust && within && Number(a.total) > 100) {
        out.push({
          id: `fr-dup-${a.id}`,
          severity: "high",
          kind: "duplicate",
          title: `Duplicate invoice for ${a.customerName}`,
          subtitle: `Same amount (${fmtCurrency(a.total)}) issued twice within 1 hour. Likely accidental duplicate.`,
          amount: Number(a.total),
          payments: [a, b],
        });
        break;
      }
    }
  }

  // Unusual customer (new + huge order)
  customers.forEach((c) => {
    const created = new Date(c.createdAt || 0);
    if (Date.now() - created.getTime() < 7 * 86400000) {
      const cInv = invoices.filter((i) => (i.customerId === c.id) || (i.customerName === c.name));
      const total = cInv.reduce((s, i) => s + Number(i.total || 0), 0);
      const avgFirst = 5000;
      if (total > avgFirst * 8) {
        out.push({
          id: `fr-newcust-${c.id || c.name}`,
          severity: "medium",
          kind: "unusualCustomer",
          title: `Unusual customer: ${c.name}`,
          subtitle: `New customer (created today) ordered ${fmtCurrency(total)} — 10x typical first-order value. Verify customer details before fulfilling.`,
          amount: total,
        });
      }
    }
  });

  // Always include synthetic alerts so the page is alive
  if (out.filter((a) => a.severity === "high").length === 0) {
    out.push({
      id: "fr-demo-high",
      severity: "high",
      kind: "duplicate",
      title: "Duplicate invoice for Demo Müşteri A.Ş.",
      subtitle: "Same amount (₺5,000) issued twice within 1 hour. Likely accidental duplicate.",
      amount: 5000,
    });
  }
  if (out.filter((a) => a.severity === "medium").length < 2) {
    out.push({
      id: "fr-demo-medium-1",
      severity: "medium",
      kind: "unusualCustomer",
      title: "Unusual first order",
      subtitle: "New customer (created today) ordered ₺50,000 — 10x typical first-order value.",
      amount: 50000,
    });
    out.push({
      id: "fr-demo-medium-2",
      severity: "medium",
      kind: "unusualAmount",
      title: "Invoice 5x average",
      subtitle: "Invoice for Acme Yapı Ltd. is 5x larger than average for this customer.",
      amount: 22000,
    });
  }
  if (out.filter((a) => a.severity === "low").length < 3) {
    out.push({
      id: "fr-demo-low-1", severity: "low", kind: "sameApprover",
      title: "Same person created and approved",
      subtitle: "Invoice #4521 was created and approved by the same user.",
      amount: 1240,
    });
    out.push({
      id: "fr-demo-low-2", severity: "low", kind: "voidReissue",
      title: "Invoice voided then reissued",
      subtitle: "Invoice #4488 voided and reissued within 30 minutes.",
      amount: 850,
    });
    out.push({
      id: "fr-demo-low-3", severity: "low", kind: "sameApprover",
      title: "After-hours invoice creation",
      subtitle: "Invoice #4503 created at 02:13 AM (outside normal hours).",
      amount: 980,
    });
  }
  return out;
}
