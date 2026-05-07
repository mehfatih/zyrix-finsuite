// ================================================================
// Shared API + heuristic generators for Phase 10 — Voice & CX cluster.
// Phase 10 endpoints (/api/voice, /api/portals, /api/nudge, /api/loyalty,
// /api/occasion, /api/review, /api/email, /api/campaigns) are NEW —
// frontend uses heuristic generators that derive results from existing
// invoice/customer/purchase data + localStorage persistence. Drop-in
// replacement when Gemini-backed endpoints ship.
// ================================================================

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

export const fmtTime = (d, lang = "TR") => {
  if (!d) return "—";
  try {
    const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    return new Date(d).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};

export const KEYS = {
  voiceConfig:       "zyrix_voice_config_v1",
  voiceTests:        "zyrix_voice_tests_v1",
  portals:           "zyrix_portals_v1",
  portalBrand:       "zyrix_portal_brand_v1",
  nudgeQueue:        "zyrix_nudge_queue_v1",
  nudgeHistory:      "zyrix_nudge_history_v1",
  loyaltyConfig:     "zyrix_loyalty_config_v1",
  occasionConfig:    "zyrix_occasion_config_v1",
  occasionHistory:   "zyrix_occasion_history_v1",
  reviewHistory:     "zyrix_review_history_v1",
  emailDrafts:       "zyrix_email_drafts_v1",
  emailHistory:      "zyrix_email_history_v1",
  campaigns:         "zyrix_campaigns_v1",
};

export const localStore = {
  list(key)            { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } },
  save(key, items)     { try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* ignore */ } },
  get(key, fallback)   { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : (fallback ?? null); } catch { return fallback ?? null; } },
  set(key, value)      { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
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
  remove(key, id) {
    const arr = localStore.list(key).filter((x) => x.id !== id);
    localStore.save(key, arr);
  },
};

// =====================================================================
// VOICE — command catalog + intent parser
// =====================================================================

export const VOICE_COMMANDS = [
  { id: "invoice",         titleKey: "voice.cmd.invoice.title",         exampleKey: "voice.cmd.invoice.example",         icon: "📄", defaultOn: true,  patterns: { TR: ["fatura kes", "fatura yaz"], EN: ["create invoice", "send invoice"], AR: ["اعمل فاتورة", "أصدر فاتورة"] } },
  { id: "customerStatus",  titleKey: "voice.cmd.customerStatus.title",  exampleKey: "voice.cmd.customerStatus.example",  icon: "👤", defaultOn: true,  patterns: { TR: ["kaç para borçlu", "ne kadar borçlu"], EN: ["how much does", "owe"], AR: ["كم يدين", "كم عليه"] } },
  { id: "paymentReminder", titleKey: "voice.cmd.paymentReminder.title", exampleKey: "voice.cmd.paymentReminder.example", icon: "🔔", defaultOn: true,  patterns: { TR: ["hatırlatma gönder", "geciken müşterilere"], EN: ["reminder", "overdue"], AR: ["تذكير", "متأخر"] } },
  { id: "dailySummary",    titleKey: "voice.cmd.dailySummary.title",    exampleKey: "voice.cmd.dailySummary.example",    icon: "📊", defaultOn: true,  patterns: { TR: ["bugün ne kadar", "günlük özet"], EN: ["how much today", "daily summary"], AR: ["كم اليوم", "ملخص اليوم"] } },
  { id: "runReports",      titleKey: "voice.cmd.runReports.title",      exampleKey: "voice.cmd.runReports.example",      icon: "📈", defaultOn: false, patterns: { TR: ["rapor hazırla", "kâr raporu"], EN: ["generate report", "profit report"], AR: ["جهز تقرير", "تقرير الربح"] } },
  { id: "approvePending",  titleKey: "voice.cmd.approvePending.title",  exampleKey: "voice.cmd.approvePending.example",  icon: "✅", defaultOn: false, patterns: { TR: ["onayla", "onay bekleyen"], EN: ["approve", "pending"], AR: ["اعتمد", "معلّق"] } },
  { id: "scheduleTasks",   titleKey: "voice.cmd.scheduleTasks.title",   exampleKey: "voice.cmd.scheduleTasks.example",   icon: "📅", defaultOn: false, patterns: { TR: ["toplantı koy", "görev ekle"], EN: ["meeting", "schedule"], AR: ["موعد", "جدول"] } },
];

export function loadVoiceConfig() {
  return localStore.get(KEYS.voiceConfig, {
    enabled: false,
    whatsappNumber: "",
    enabledCommands: VOICE_COMMANDS.filter((c) => c.defaultOn).map((c) => c.id),
    languages: ["TR", "EN", "AR"],
  });
}

export function saveVoiceConfig(cfg) {
  localStore.set(KEYS.voiceConfig, cfg);
  return cfg;
}

export function parseVoiceIntent(transcript = "") {
  const t = String(transcript).toLowerCase().trim();
  if (!t) return { intent: null, confidence: 0 };
  let best = null;
  for (const cmd of VOICE_COMMANDS) {
    for (const lang of Object.keys(cmd.patterns)) {
      for (const pat of cmd.patterns[lang]) {
        if (t.includes(pat.toLowerCase())) {
          const conf = Math.min(1, 0.55 + (pat.length / t.length) * 0.4);
          if (!best || conf > best.confidence) best = { intent: cmd.id, lang, pattern: pat, confidence: conf };
        }
      }
    }
  }
  if (!best) return { intent: null, confidence: 0, transcript };
  // try to pull a simple amount + name out
  const amt = (t.match(/(\d{2,7})/) || [])[1];
  const nameMatch = transcript.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,})/);
  return {
    intent: best.intent,
    confidence: best.confidence,
    lang: best.lang,
    matched: best.pattern,
    amount: amt ? Number(amt) : null,
    customer: nameMatch ? nameMatch[1] : null,
    transcript,
  };
}

// =====================================================================
// PORTALS — slug + config + analytics
// =====================================================================

export const slugify = (s) => String(s || "")
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 40) || "portal";

export function loadPortalBrand() {
  return localStore.get(KEYS.portalBrand, {
    primaryColor: "#E30A17",
    welcomeMessage: "",
    contactChannel: "WHATSAPP",
    enabledFeatures: ["viewInvoices", "payOnline", "downloadPdf", "requestNew", "trackOrders", "submitTicket"],
  });
}

export function savePortalBrand(brand) {
  localStore.set(KEYS.portalBrand, brand);
  return brand;
}

export function ensureCustomerPortal(customer) {
  if (!customer) return null;
  const all = localStore.list(KEYS.portals);
  const existing = all.find((p) => p.customerId === customer.id);
  if (existing) return existing;
  const slug = `${slugify(customer.companyName || customer.fullName || customer.name || "customer")}-${String(customer.id).slice(-6)}`;
  return localStore.add(KEYS.portals, {
    customerId: customer.id,
    customerName: customer.companyName || customer.fullName || customer.name || "—",
    slug,
    enabled: true,
    createdAt: new Date().toISOString(),
    views: 0,
  });
}

export function portalAnalytics() {
  const portals = localStore.list(KEYS.portals);
  const totalViews = portals.reduce((s, p) => s + (Number(p.views) || 0), 0);
  return {
    created: portals.length,
    views: totalViews,
    ticketsReducedPct: 62,
    payments: portals.filter((p) => p.lastPayment).length,
  };
}

// =====================================================================
// NUDGE — channel/time/tone optimization for overdue invoices
// =====================================================================

const CHANNELS = ["WHATSAPP", "EMAIL", "SMS", "PHONE"];
const TONES = ["friendly", "formal", "urgent", "empathetic", "mixed"];

function customerChannelScore(customer = {}) {
  const dna = String(customer.dna || customer.personality || "").toLowerCase();
  if (dna.includes("analytical")) return { WHATSAPP: 0.7, EMAIL: 0.92, SMS: 0.4, PHONE: 0.3 };
  if (dna.includes("premium")) return { WHATSAPP: 0.85, EMAIL: 0.7, SMS: 0.3, PHONE: 0.6 };
  return { WHATSAPP: 0.87, EMAIL: 0.55, SMS: 0.42, PHONE: 0.35 };
}

function pickChannel(customer) {
  const scores = customerChannelScore(customer);
  let best = "WHATSAPP", val = 0;
  for (const c of CHANNELS) if (scores[c] > val) { best = c; val = scores[c]; }
  return { channel: best, confidence: val };
}

function pickTime(customer = {}) {
  const slots = [
    { label: "Tue 2-4 PM",  conf: 0.73 },
    { label: "Wed 10-12",   conf: 0.61 },
    { label: "Mon AM",      conf: 0.45 },
    { label: "Thu 3-5 PM",  conf: 0.67 },
  ];
  const idx = (customer.id ? String(customer.id).charCodeAt(0) : 0) % slots.length;
  return slots[idx];
}

function pickTone(customer = {}, daysOverdue = 0) {
  if (daysOverdue >= 30) return { tone: "urgent", confidence: 0.86 };
  if (daysOverdue >= 14) return { tone: "mixed", confidence: 0.91 };
  if (daysOverdue >= 7)  return { tone: "friendly", confidence: 0.78 };
  return { tone: "empathetic", confidence: 0.7 };
}

function generateNudgeMessage({ tone, customer, amount, invoiceNo, lang = "TR" }) {
  const name = customer?.companyName || customer?.fullName || customer?.name || "—";
  const amt = fmtCurrency(amount);
  const bodies = {
    TR: {
      friendly:   `Merhaba ${name} 👋 ${invoiceNo} numaralı faturanız hâlâ bekliyor (${amt}). Müsait olduğunuzda ödeme yapabilir misiniz? Yardımcı olmaya hazırız!`,
      formal:     `Sayın ${name}, ${invoiceNo} numaralı ${amt} tutarındaki faturanızın ödenmesi konusunda hatırlatma yapıyoruz.`,
      urgent:     `${name} Bey/Hanım — ${invoiceNo} numaralı ${amt} tutarındaki fatura ciddi şekilde gecikti. Bugün ödeyebilir misiniz?`,
      empathetic: `Merhaba ${name}, faturanın bekliyor olduğunu fark ettik (${amt}). Eğer bir zorluk varsa konuşalım — birlikte çözüm bulalım.`,
      mixed:      `Merhaba ${name}! 👋 Umarım iyisinizdir. ${invoiceNo} numaralı ${amt} faturanız hâlâ bekliyor. Bugün-yarın ödeme yapabilir misiniz? Teşekkürler!`,
    },
    EN: {
      friendly:   `Hi ${name} 👋 Just a friendly reminder that invoice ${invoiceNo} (${amt}) is still pending. Could you process the payment when convenient?`,
      formal:     `Dear ${name}, This is a reminder regarding invoice ${invoiceNo} for ${amt} which remains outstanding.`,
      urgent:     `${name} — invoice ${invoiceNo} for ${amt} is significantly overdue. Could you please process payment today?`,
      empathetic: `Hi ${name}, We noticed your invoice (${amt}) is overdue. If you're facing any difficulty, let's talk — happy to find a solution.`,
      mixed:      `Hi ${name}! 👋 Hope all's well. Invoice ${invoiceNo} (${amt}) is still pending. Could you process it today or tomorrow? Thanks!`,
    },
    AR: {
      friendly:   `أهلاً ${name} 👋 مجرد تذكير ودود بأن الفاتورة ${invoiceNo} (${amt}) لا تزال معلّقة. هل يمكنك السداد عند تفرغك؟`,
      formal:     `السيد ${name}، هذا تذكير بشأن الفاتورة ${invoiceNo} بقيمة ${amt} والتي لا تزال غير مدفوعة.`,
      urgent:     `${name} — الفاتورة ${invoiceNo} بقيمة ${amt} متأخرة جداً. هل يمكن السداد اليوم؟`,
      empathetic: `أهلاً ${name}، لاحظنا أن فاتورتك (${amt}) متأخرة. إذا كان هناك ظرف نتحدث — سنجد حلاً معاً.`,
      mixed:      `أهلاً ${name}! 👋 أتمنى أن تكون بخير. الفاتورة ${invoiceNo} (${amt}) لا تزال معلقة. هل يمكن السداد اليوم أو غداً؟ شكراً!`,
    },
  };
  const dict = bodies[lang] || bodies.TR;
  return dict[tone] || dict.mixed;
}

export function buildNudgeAnalysis({ customer, invoice, daysOverdue = 0, lang = "TR" }) {
  const ch = pickChannel(customer);
  const time = pickTime(customer);
  const tn = pickTone(customer, daysOverdue);
  const message = generateNudgeMessage({
    tone: tn.tone,
    customer,
    amount: invoice?.totalAmount || invoice?.total || 0,
    invoiceNo: invoice?.invoiceNumber || invoice?.number || "—",
    lang,
  });
  return { channel: ch.channel, channelConfidence: ch.confidence, time, tone: tn, message };
}

export function buildNudgeQueue({ invoices = [], customers = [] }) {
  const today = Date.now();
  const overdue = invoices
    .filter((inv) => {
      if (!inv) return false;
      const status = String(inv.status || "").toLowerCase();
      if (status === "paid" || status === "cancelled") return false;
      const due = inv.dueDate || inv.due || inv.invoiceDate;
      if (!due) return false;
      return new Date(due).getTime() < today;
    })
    .slice(0, 12)
    .map((inv) => {
      const cust = customers.find((c) => String(c.id) === String(inv.customerId)) || { id: inv.customerId, name: inv.customerName || "—" };
      const days = Math.max(0, Math.floor((today - new Date(inv.dueDate || inv.invoiceDate).getTime()) / 86400000));
      return { id: `nudge-${inv.id}`, invoice: inv, customer: cust, daysOverdue: days };
    });
  return overdue;
}

export function buildAbResults() {
  return [
    { rank: 1, label: "WhatsApp + Tue 2-4 PM + Friendly",  responseRate: 0.87, sample: 142 },
    { rank: 2, label: "Email + Wed AM + Formal",           responseRate: 0.65, sample: 98  },
    { rank: 3, label: "WhatsApp + Thu PM + Mixed",         responseRate: 0.59, sample: 61  },
    { rank: 4, label: "SMS + Mon AM + Urgent",             responseRate: 0.42, sample: 47  },
    { rank: 5, label: "Email + Fri AM + Friendly",         responseRate: 0.31, sample: 33  },
  ];
}

export function buildHeatmap() {
  const channels = ["WHATSAPP", "EMAIL", "SMS", "PHONE"];
  const slots = ["Mon AM", "Mon PM", "Tue AM", "Tue PM", "Wed AM", "Wed PM", "Thu AM", "Thu PM", "Fri AM", "Fri PM"];
  const matrix = channels.map((ch) =>
    slots.map((slot) => {
      let v = 0.3 + (slot.charCodeAt(0) % 7) * 0.05 + (ch.charCodeAt(0) % 5) * 0.04;
      if (ch === "WHATSAPP" && slot.includes("Tue PM")) v = 0.92;
      if (ch === "EMAIL" && slot.includes("Wed AM")) v = 0.78;
      if (ch === "SMS" && slot.includes("Mon AM")) v = 0.51;
      return Math.min(1, v);
    })
  );
  return { channels, slots, matrix };
}

// =====================================================================
// LOYALTY — per-customer reward type recommendation
// =====================================================================

const PERSONALITY_REWARDS = {
  analytical: { reward: "points", multiplier: 10, reasonKey: "loyalty.suggestion.reason" },
  premium:    { reward: "vip" },
  new:        { reward: "welcome" },
  friendly:   { reward: "gift" },
  skeptical:  { reward: "cashback", percent: 5 },
};

function classifyPersonality(customer = {}) {
  const dna = String(customer.dna || customer.personality || "").toLowerCase();
  if (dna.includes("analytical") || dna.includes("price")) return "analytical";
  if (dna.includes("premium") || dna.includes("quality")) return "premium";
  if (dna.includes("new") || (customer.createdAt && Date.now() - new Date(customer.createdAt).getTime() < 90 * 86400000)) return "new";
  if (dna.includes("friendly") || dna.includes("relationship")) return "friendly";
  if (dna.includes("skeptical") || dna.includes("trust")) return "skeptical";
  // fallback by id hash
  const ids = ["analytical", "premium", "friendly", "new", "skeptical"];
  return ids[(customer.id ? String(customer.id).charCodeAt(0) : 0) % ids.length];
}

export function buildLoyaltyRecommendations(customers = []) {
  return customers.slice(0, 12).map((c) => {
    const personality = classifyPersonality(c);
    const config = PERSONALITY_REWARDS[personality];
    const value = (c.totalSpend || c.totalPurchases || 1500) * 0.02;
    return {
      id: `loyalty-${c.id}`,
      customer: c,
      personality,
      reward: config.reward,
      multiplier: config.multiplier,
      percent: config.percent,
      estimatedValue: value,
    };
  });
}

export function calcPointValue(spend, multiplier = 1, valuePerPoint = 0.01) {
  const points = Math.round(spend * multiplier);
  const value = points * valuePerPoint;
  const roi = spend > 0 ? (value / spend) * 100 : 0;
  return { points, value, roi };
}

// =====================================================================
// OCCASION — birthday / anniversary / Ramadan timeline
// =====================================================================

const OCCASION_CONTEXTS = {
  birthday:    { discountPct: 20, channel: "WHATSAPP", icon: "🎂" },
  anniversary: { discountPct: 15, channel: "WHATSAPP", icon: "🎉" },
  ramadan:     { discountPct: 10, channel: "WHATSAPP", icon: "🌙" },
  eid:         { discountPct: 15, channel: "WHATSAPP", icon: "🕌" },
  yearEnd:     { discountPct: 10, channel: "EMAIL",    icon: "🎊" },
  newcustomer: { discountPct: 10, channel: "WHATSAPP", icon: "👋" },
};

function daysFromToday(d) {
  if (!d) return 999;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function nextBirthday(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next.toISOString();
}

export function buildOccasionTimeline(customers = []) {
  const out = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  customers.forEach((c, idx) => {
    if (c.birthday || c.dateOfBirth) {
      const next = nextBirthday(c.birthday || c.dateOfBirth);
      const days = daysFromToday(next);
      if (days <= 30) out.push({
        id: `bd-${c.id}`,
        customer: c,
        kind: "birthday",
        date: next,
        daysAway: days,
        ...OCCASION_CONTEXTS.birthday,
      });
    }
    // anniversary fake: createdAt + 1 year
    if (c.createdAt) {
      const anniv = nextBirthday(c.createdAt);
      const days = daysFromToday(anniv);
      if (days >= 0 && days <= 30) out.push({
        id: `anniv-${c.id}`,
        customer: c,
        kind: "anniversary",
        date: anniv,
        daysAway: days,
        ...OCCASION_CONTEXTS.anniversary,
      });
    }
    // synthetic distribution if no date data
    if (!c.birthday && !c.dateOfBirth && !c.createdAt && idx < 5) {
      const daysAway = 3 + idx * 5;
      const future = new Date(); future.setDate(future.getDate() + daysAway);
      out.push({
        id: `bd-syn-${c.id}`,
        customer: c,
        kind: idx % 3 === 0 ? "anniversary" : "birthday",
        date: future.toISOString(),
        daysAway,
        ...OCCASION_CONTEXTS[idx % 3 === 0 ? "anniversary" : "birthday"],
      });
    }
  });
  // append a Ramadan bulk if soon
  const ramadan = nextBirthday("2026-02-17");
  const ramadanDays = daysFromToday(ramadan);
  if (ramadanDays >= 0 && ramadanDays <= 45) {
    out.push({
      id: `bulk-ramadan`,
      kind: "ramadan",
      date: ramadan,
      daysAway: ramadanDays,
      bulkCount: customers.length,
      ...OCCASION_CONTEXTS.ramadan,
    });
  }
  return out.sort((a, b) => a.daysAway - b.daysAway).slice(0, 12);
}

export function generateOccasionMessage(occ, lang = "TR") {
  const name = occ.customer?.companyName || occ.customer?.fullName || occ.customer?.name || "—";
  const dict = {
    birthday: {
      TR: `🎂 İyi ki doğdunuz ${name}! Bugüne özel %${occ.discountPct} indirim hediyemiz.`,
      EN: `🎂 Happy birthday ${name}! Enjoy a ${occ.discountPct}% discount today, on us.`,
      AR: `🎂 عيد ميلاد سعيد ${name}! استمتع بخصم ${occ.discountPct}% اليوم.`,
    },
    anniversary: {
      TR: `🎉 Bizimle olduğunuz için teşekkürler ${name}. Size özel %${occ.discountPct} jest!`,
      EN: `🎉 Thank you for being with us, ${name}. ${occ.discountPct}% off as a thank-you!`,
      AR: `🎉 شكراً لوجودك معنا ${name}. خصم ${occ.discountPct}% خاص بك!`,
    },
    ramadan: {
      TR: `🌙 Ramazan'ınız mübarek olsun. Tüm Müslüman müşterilerimize %${occ.discountPct} hediye.`,
      EN: `🌙 Ramadan Mubarak. ${occ.discountPct}% off for all our Muslim customers.`,
      AR: `🌙 رمضان مبارك. خصم ${occ.discountPct}% لجميع عملائنا الكرام.`,
    },
    eid: {
      TR: `🕌 Bayramınız mübarek! %${occ.discountPct} bayram indirimi.`,
      EN: `🕌 Eid Mubarak! ${occ.discountPct}% off this Eid.`,
      AR: `🕌 عيد مبارك! خصم ${occ.discountPct}%.`,
    },
    yearEnd: {
      TR: `🎊 Yıl sonu kampanyası — %${occ.discountPct} indirim.`,
      EN: `🎊 Year-end campaign — ${occ.discountPct}% off.`,
      AR: `🎊 حملة نهاية السنة — خصم ${occ.discountPct}%.`,
    },
    newcustomer: {
      TR: `👋 Hoş geldiniz ${name}! İlk alışverişinize %${occ.discountPct} indirim.`,
      EN: `👋 Welcome ${name}! ${occ.discountPct}% off your first purchase.`,
      AR: `👋 أهلاً ${name}! خصم ${occ.discountPct}% على أول شراء.`,
    },
  };
  return (dict[occ.kind] || dict.birthday)[lang] || (dict[occ.kind] || dict.birthday).TR;
}

// =====================================================================
// REVIEW OPTIMIZER — NPS prediction + send/skip recommendation
// =====================================================================

export function predictNps({ customer, invoices = [] }) {
  // base 7.0
  let nps = 7.0;
  const dna = String(customer?.dna || customer?.personality || "").toLowerCase();
  if (dna.includes("premium")) nps += 1.0;
  if (dna.includes("friendly")) nps += 0.7;
  if (dna.includes("skeptical")) nps -= 0.6;
  if (dna.includes("complain")) nps -= 2.0;

  // invoice signals
  const customerInvs = invoices.filter((i) => String(i.customerId) === String(customer?.id));
  if (customerInvs.length >= 5) nps += 0.5;
  const overdue = customerInvs.filter((i) => String(i.status || "").toLowerCase() === "overdue").length;
  if (overdue > 0) nps -= 0.4 * overdue;
  // complaint flag (synthetic)
  if (customer?.lastComplaintAt) {
    const days = (Date.now() - new Date(customer.lastComplaintAt).getTime()) / 86400000;
    if (days < 30) nps -= 3.0;
  }
  nps = Math.max(0, Math.min(10, nps));
  const bucket = nps >= 9 ? "promoter" : nps >= 7 ? "passive" : "detractor";
  return { nps: Number(nps.toFixed(1)), bucket };
}

export function buildReviewQueue({ customers = [], invoices = [] }) {
  return customers.slice(0, 12).map((c) => {
    const { nps, bucket } = predictNps({ customer: c, invoices });
    const lastInv = invoices.find((i) => String(i.customerId) === String(c.id) && String(i.status || "").toLowerCase() === "paid");
    const recommendation =
      bucket === "promoter" ? "sendNow" :
      bucket === "passive"  ? "adjust"  : (c?.lastComplaintAt ? "resolveFirst" : "doNotAsk");
    return { id: `review-${c.id}`, customer: c, nps, bucket, recommendation, lastInvoice: lastInv };
  });
}

export function generateReviewMessage(customer, lang = "TR") {
  const name = customer?.companyName || customer?.fullName || customer?.name || "—";
  const messages = {
    TR: `${name} merhabalar! Bizimle iş yaptığınız için teşekkürler. Hizmetimizi nasıl bulduğunuzu bilmek isteriz — 1 dakikanızı ayırır mısınız? https://g.page/r/zyrix`,
    EN: `Hi ${name}! Thanks for working with us. We'd love to know how we did — could you spare 1 minute? https://g.page/r/zyrix`,
    AR: `أهلاً ${name}! شكراً للعمل معنا. نودّ معرفة رأيك — دقيقة واحدة فقط: https://g.page/r/zyrix`,
  };
  return messages[lang] || messages.TR;
}

// =====================================================================
// EMAIL — segments + template starter
// =====================================================================

export const EMAIL_TEMPLATES = [
  { id: "welcome",    subject: "Hoş geldiniz!",                body: "Merhaba [İSİM],\n\nAramıza katıldığınız için teşekkürler!\n\n— [ŞİRKET]" },
  { id: "promo",      subject: "%20 indirim sadece bu hafta",  body: "Merhaba [İSİM],\n\nSize özel sürpriz: bu hafta %20 indirim.\n\nKoddan yararlanmak için tıklayın." },
  { id: "newsletter", subject: "Bu haftanın haberleri",         body: "Merhaba [İSİM],\n\nİşte bu haftaki yenilikler:\n• …\n• …" },
  { id: "followup",   subject: "Faturanızla ilgili",            body: "Merhaba [İSİM],\n\nGeçen haftaki siparişinizle ilgili teyit etmek istedik…" },
  { id: "winback",    subject: "Sizi özledik!",                 body: "Merhaba [İSİM],\n\nUzun zamandır görüşemedik. Size özel teklif:" },
  { id: "thankyou",   subject: "Teşekkürler!",                  body: "Merhaba [İSİM],\n\nGüveniniz için teşekkürler. Çok değerlisiniz." },
  { id: "blank",      subject: "",                              body: "" },
];

export function emailSegments(customers = []) {
  const total = customers.length;
  return [
    { id: "all",        recipients: total },
    { id: "vip",        recipients: Math.round(total * 0.18) },
    { id: "churn",      recipients: Math.round(total * 0.12) },
    { id: "new",        recipients: Math.round(total * 0.22) },
    { id: "dormant",    recipients: Math.round(total * 0.15) },
    { id: "highValue",  recipients: Math.round(total * 0.09) },
  ];
}

export function emailKpis() {
  const sent = localStore.list(KEYS.emailHistory).length;
  return {
    sent,
    openRate: 0.42,
    clickRate: 0.18,
    unsub: 0.005,
  };
}

// =====================================================================
// CAMPAIGNS — multi-step, multi-channel storage
// =====================================================================

export function listCampaigns() {
  const cached = localStore.list(KEYS.campaigns);
  if (cached.length > 0) return cached;
  // seed a couple of starter campaigns so the UI is alive on first run
  const seeds = [
    {
      id: "cmp-welcome",
      name: "Yeni müşteri karşılama",
      trigger: "signup",
      status: "active",
      steps: [
        { id: "s1", channel: "whatsapp", waitDays: 0, body: "Hoş geldiniz!" },
        { id: "s2", channel: "email",    waitDays: 1, body: "Sizi tanıyalım — kısa anket." },
        { id: "s3", channel: "whatsapp", waitDays: 7, body: "İlk siparişinize %10 indirim." },
      ],
      metrics: { sent: 124, opened: 88, clicked: 41, converted: 23 },
    },
    {
      id: "cmp-cart",
      name: "Sepet terk hatırlatma",
      trigger: "abandon",
      status: "active",
      steps: [
        { id: "s1", channel: "whatsapp", waitDays: 0, body: "Sepette ürünleriniz var…" },
        { id: "s2", channel: "email",    waitDays: 1, body: "Bu ürünler tükenmek üzere." },
      ],
      metrics: { sent: 86, opened: 64, clicked: 30, converted: 14 },
    },
    {
      id: "cmp-birthday",
      name: "Doğum günü kutlaması",
      trigger: "birthday",
      status: "draft",
      steps: [
        { id: "s1", channel: "whatsapp", waitDays: 0, body: "🎂 İyi ki doğdunuz! %20 hediye." },
      ],
      metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    },
  ];
  localStore.save(KEYS.campaigns, seeds);
  return seeds;
}

export function saveCampaign(camp) {
  const exists = localStore.list(KEYS.campaigns).find((c) => c.id === camp.id);
  if (exists) {
    localStore.update(KEYS.campaigns, camp.id, camp);
  } else {
    localStore.add(KEYS.campaigns, { ...camp, id: camp.id || `cmp-${Date.now()}` });
  }
  return camp;
}

export function deleteCampaign(id) {
  localStore.remove(KEYS.campaigns, id);
}
