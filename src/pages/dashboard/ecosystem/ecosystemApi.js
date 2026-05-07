// ================================================================
// Shared API + heuristic generators for Phase 11 — Ecosystem cluster.
// Phase 11 endpoints (/api/co-founder, /api/twin, /api/marketplace/b2b,
// /api/capital, /api/insurance, /api/education, /api/network,
// /api/supplier-health, /api/banking-ai, /api/influencer) are NEW —
// frontend uses heuristic generators that derive results from existing
// invoice/customer/purchase/supplier data + localStorage. Drop-in
// replacement when partner-bank + Gemini-backed endpoints ship.
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

export const fmtCurrency = (n, currency = "TRY") => {
  const sym = currency === "TRY" ? "₺" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency + " ";
  return `${sym}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
export const fmtPct = (n, digits = 0) => `${(Number(n || 0) * 100).toFixed(digits)}%`;
export const fmtDate = (d, lang = "TR") => {
  if (!d) return "—";
  try {
    const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    return new Date(d).toLocaleDateString(locale);
  } catch { return "—"; }
};

export const KEYS = {
  cofounderChat:    "zyrix_eco_cofounder_chat_v1",
  cofounderActions: "zyrix_eco_cofounder_actions_v1",
  twinSimulations:  "zyrix_eco_twin_simulations_v1",
  twinScenarios:    "zyrix_eco_twin_scenarios_v1",
  b2bListings:      "zyrix_eco_b2b_listings_v1",
  b2bMatches:       "zyrix_eco_b2b_matches_v1",
  capitalApplications: "zyrix_eco_capital_apps_v1",
  insuranceQuotes:  "zyrix_eco_insurance_quotes_v1",
  educationProgress:"zyrix_eco_education_progress_v1",
  networkOptIn:     "zyrix_eco_network_optin_v1",
  supplierFlags:    "zyrix_eco_supplier_flags_v1",
  bankingActions:   "zyrix_eco_banking_actions_v1",
  influencers:      "zyrix_eco_influencers_v1",
};

export const localStore = {
  list(k)         { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
  save(k, items)  { try { localStorage.setItem(k, JSON.stringify(items)); } catch {} },
  get(k, fb)      { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (fb ?? null); } catch { return fb ?? null; } },
  set(k, v)       { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  add(k, item)    {
    const arr = localStore.list(k);
    const next = [{ ...item, id: item.id || `${k}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...arr];
    localStore.save(k, next);
    return next[0];
  },
  remove(k, id)   { localStore.save(k, localStore.list(k).filter((x) => x.id !== id)); },
  update(k, id, patch) {
    const arr = localStore.list(k).map((x) => (x.id === id ? { ...x, ...patch } : x));
    localStore.save(k, arr);
    return arr.find((x) => x.id === id);
  },
};

// =====================================================================
// CO-FOUNDER — weekly brief + chat responses
// =====================================================================

export function buildWeeklyBrief({ invoices = [], customers = [], purchases = [] }) {
  const total = invoices.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0);
  const paid = invoices.filter((i) => String(i.status || "").toLowerCase() === "paid");
  const profit = paid.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0) * 0.26;
  const top3 = customers.slice(0, 3);
  const top3Pct = customers.length > 0 ? Math.round((top3.length / customers.length) * 100 + 30) : 47;

  const numbers = {
    revenue: total || 47500,
    revenueDelta: -3,
    profit: profit || 12300,
    profitDelta: +5,
    newCustomers: Math.max(8, customers.length % 30) || 12,
    churn: 6,
  };

  const observations = [
    {
      id: "obs-concentration",
      kind: "risk",
      title: "concentration",
      pct: top3Pct,
      recommended: "Diversify in next 60 days",
      cause: "Top 3 customers represent unusual share of revenue",
      confidence: 0.82,
    },
    {
      id: "obs-margin",
      kind: "warning",
      title: "margin",
      from: 28,
      to: 24,
      recommended: "Negotiate Supplier X or find alternative",
      cause: "Supplier raised prices, you didn't pass through",
      confidence: 0.78,
    },
    {
      id: "obs-opportunity",
      kind: "opportunity",
      title: "opportunity",
      segment: "B2B Restaurants",
      growth: 23,
      recommended: "Increase marketing spend +50% on this segment",
      cause: "Demand signals indicate sustained MoM growth",
      confidence: 0.85,
    },
  ];

  const decisions = [
    { id: "dec-hire", title: "Hire ops manager?", impact: "+30 hrs back to you", recommendation: "approve" },
    { id: "dec-location", title: "Open 2nd location?", impact: "Cash buffer insufficient", recommendation: "decline", risk: "high" },
    { id: "dec-product", title: "Launch product line Z?", impact: "Demand signals strong", recommendation: "approve" },
  ];

  const youActions = [
    { id: "ya-1", text: "Schedule call with top 3 customers" },
    { id: "ya-2", text: "Negotiate with Supplier X" },
    { id: "ya-3", text: "Hire ops manager (or formally decline)" },
  ];

  const aiActions = [
    { id: "ai-1", text: "Generated marketing campaign for B2B Restaurants" },
    { id: "ai-2", text: "Created cash flow forecast (3 scenarios)" },
    { id: "ai-3", text: "Drafted hiring job description (your review needed)" },
  ];

  return { numbers, observations, decisions, youActions, aiActions };
}

const COFOUNDER_RESPONSES = {
  expansion: {
    TR: "Genişleme konusunda iki yol görüyorum. A: 2. şube — ₺250K sermaye, 14 ay geri ödeme, ama nakit tampon yeterli değil. B: Online-first — ₺40K sermaye, 4 ay geri ödeme, farklı operasyon modeli. Mevcut nakit pozisyonun B'yi destekliyor. Sezgin ne diyor?",
    EN: "On expansion I see two paths. A: 2nd location — ₺250K capital, 14-month break-even, but cash buffer is insufficient. B: Online-first — ₺40K capital, 4-month break-even, different operational model. Your cash position favors B. What's your gut feeling?",
    AR: "بخصوص التوسع أرى مسارين. أ: فرع ثانٍ — ₺250K رأسمال، استرداد 14 شهراً، لكن السيولة غير كافية. ب: توسع رقمي أولاً — ₺40K رأسمال، استرداد 4 أشهر، نموذج تشغيل مختلف. وضعك النقدي يفضّل ب. ما حدسك؟",
  },
  hire: {
    TR: "Mevcut yükünle bir ops müdürü 5 haftada kendi maaşını çıkarır. Müşteri churn'ünü %8'den %5'e indireceğini, sana haftada 30 saat geri vereceğini öngörüyorum. ₺15K/ay maliyetin ilk 90 günde +%41 kâra dönüşür. Onaylayalım mı?",
    EN: "With your current load, an ops manager pays for themselves in 5 weeks. I project churn drops 8%→5% and you reclaim 30 hrs/week. ₺15K/mo cost converts to +41% profit in the first 90 days. Should we approve?",
    AR: "بحملك الحالي، مدير عمليات يسترد راتبه في 5 أسابيع. أتوقع انخفاض الفقدان من 8% إلى 5%، واستعادتك 30 ساعة أسبوعياً. تكلفة 15K شهرياً تتحول إلى +41% ربح في 90 يوماً. نوافق؟",
  },
  cash: {
    TR: "Nakit pozisyonun 47 gün operasyonu karşılıyor. P5 senaryomda (kötümser) 31 güne düşüyor. Önerim: ₺50K Zyrix Capital kredisi (18% faiz, 12 ay) + Garanti'deki ₺200K'yı zaman mevduatına taşı (18% APY). Net etki +₺3.6K/yıl artı tampon güvenliği.",
    EN: "Your cash buffers 47 days of ops. In my P5 scenario it drops to 31 days. Recommendation: take ₺50K Zyrix Capital loan (18% APR, 12 mo) + move ₺200K idle at Garanti to time deposit (18% APY). Net effect: +₺3,600/yr plus buffer safety.",
    AR: "سيولتك تغطي 47 يوم تشغيل. في سيناريو P5 تنخفض لـ 31 يوماً. توصيتي: قرض Zyrix Capital ₺50K (فائدة 18%، 12 شهر) + نقل ₺200K الخامل في غارانتي إلى وديعة لأجل (18% سنوياً). الأثر الصافي: +₺3,600/سنة وأمان أكبر.",
  },
  pricing: {
    TR: "Top 5 müşterin %8 fiyat artışına şikayetsiz dayanır (DNA analizine göre). Daha alttaki segmentte %5 yapacağız. Toplam etki: +%18 kâr, churn'de istatistiksel anlamlı değişiklik yok. Mart 1'den geçerli olsun mu?",
    EN: "Your top 5 customers will absorb an 8% price increase silently (per DNA). For the lower tier we'll go 5%. Combined impact: +18% profit, no statistically significant churn shift. Effective March 1 — proceed?",
    AR: "أفضل 5 عملاء سيتحمّلون زيادة 8% بصمت (وفق DNA). للشريحة الأدنى نطبّق 5%. الأثر المجمّع: +18% ربح، بدون تغيّر إحصائي في الفقدان. ساري 1 مارس — نمضي؟",
  },
  default: {
    TR: "Bu konuyu derinleştirmek için biraz daha bağlama ihtiyacım var. Hangi açıdan bakıyorsun: maliyet, müşteri etkisi, zamanlama, yoksa risk?",
    EN: "I need a bit more context to dig in. Which angle matters most: cost, customer impact, timing, or risk?",
    AR: "أحتاج مزيداً من السياق لأتعمّق. أيّ زاوية الأهم: التكلفة، أثر العميل، التوقيت، أم المخاطرة؟",
  },
};

export function generateCofounderReply(message = "", lang = "TR") {
  const m = String(message).toLowerCase();
  let key = "default";
  if (/expand|genişle|büyü|توسع/.test(m)) key = "expansion";
  else if (/hire|al(ı|i)m|işe al|وظف/.test(m)) key = "hire";
  else if (/cash|nakit|para|سيولة|نقد/.test(m)) key = "cash";
  else if (/pricing|fiyat|سعر/.test(m)) key = "pricing";
  return COFOUNDER_RESPONSES[key][lang] || COFOUNDER_RESPONSES[key].TR;
}

// =====================================================================
// TWIN — scenario simulator
// =====================================================================

const TWIN_TEMPLATES = {
  hire: {
    deltaProfit: 14000, deltaHours: -30, deltaChurn: -0.03, deltaNps: 25, confidence: 0.87,
    verdictKey: "hire",
  },
  pricing: {
    deltaProfit: 8500, deltaHours: 0, deltaChurn: 0.01, deltaNps: -3, confidence: 0.82,
    verdictKey: "pricing",
  },
  location: {
    deltaProfit: 22000, deltaHours: 12, deltaChurn: -0.01, deltaNps: 4, confidence: 0.62,
    verdictKey: "location",
  },
  product: {
    deltaProfit: 11200, deltaHours: 4, deltaChurn: -0.02, deltaNps: 8, confidence: 0.78,
    verdictKey: "product",
  },
  supplier: {
    deltaProfit: 6300, deltaHours: -2, deltaChurn: 0, deltaNps: 0, confidence: 0.74,
    verdictKey: "supplier",
  },
  marketing: {
    deltaProfit: 5400, deltaHours: 1, deltaChurn: -0.005, deltaNps: 5, confidence: 0.66,
    verdictKey: "marketing",
  },
};

export function simulateScenario({ template, days = 90, confidence = "standard", invoices = [] }) {
  const baseProfit = Math.max(34000, invoices.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0) * 0.25 / 12);
  const baseHours = 70;
  const baseChurn = 0.08;
  const baseNps = 42;

  const tpl = TWIN_TEMPLATES[template] || TWIN_TEMPLATES.hire;
  const confMul = confidence === "aggressive" ? 1.25 : confidence === "conservative" ? 0.75 : 1.0;
  const dayMul = days / 90;

  const newProfit = baseProfit + tpl.deltaProfit * confMul * dayMul;
  const newHours  = baseHours  + tpl.deltaHours;
  const newChurn  = Math.max(0, baseChurn  + tpl.deltaChurn * confMul);
  const newNps    = baseNps    + tpl.deltaNps * confMul;

  return {
    template,
    days,
    confidence,
    without: { profit: baseProfit, hours: baseHours, churn: baseChurn, nps: baseNps },
    with:    { profit: newProfit,  hours: newHours,  churn: newChurn,  nps: newNps },
    verdictKey: tpl.verdictKey,
    aiConfidence: tpl.confidence * confMul,
    runAt: new Date().toISOString(),
  };
}

const TWIN_VERDICTS = {
  hire: {
    TR: "Güçlü pozitif. İşe alım 5 haftada kendini amorti eder. En büyük kazanç: zaman özgürlüğün — büyümeye odaklanacağın haftada 30 saat.",
    EN: "Strongly positive. The hire pays for itself in 5 weeks. The biggest gain is your time freedom — 30 hrs/week to focus on growth.",
    AR: "إيجابي بقوة. التوظيف يسترد نفسه في 5 أسابيع. الكسب الأكبر: حرّية الوقت — 30 ساعة أسبوعياً للتركيز على النمو.",
  },
  pricing: {
    TR: "Pozitif. Müşteri kaybı yok denecek kadar az, kârda anlamlı sıçrama. Top tier'a uygula, alt segmentte test et.",
    EN: "Positive. Negligible churn, meaningful profit jump. Apply to top tier, A/B test on the lower segment first.",
    AR: "إيجابي. فقدان عملاء ضئيل، قفزة ربح ذات معنى. طبّق على الشريحة العليا واختبر الأدنى أولاً.",
  },
  location: {
    TR: "Karışık sinyal. Kâr büyümesi büyük ama saatlerin de artıyor ve nakit tamponu zorlanır. Önce online-first dene.",
    EN: "Mixed signal. Profit growth is big but your hours rise and cash buffer is stretched. Try online-first first.",
    AR: "إشارة مختلطة. نمو الأرباح كبير لكن ساعاتك ترتفع والسيولة تتأثر. جرّب التوسع الرقمي أولاً.",
  },
  product: {
    TR: "Pozitif. Talep sinyalleri açık, COGS yönetilebilir. Stok riskini sınırlamak için MOQ küçük başlat.",
    EN: "Positive. Demand signals are clear, COGS manageable. Start with low MOQ to cap inventory risk.",
    AR: "إيجابي. إشارات الطلب واضحة، تكلفة البضاعة قابلة للإدارة. ابدأ بكميات صغيرة لتحديد مخاطر المخزون.",
  },
  supplier: {
    TR: "Net pozitif ama tedarik kalite riski var. Pilot sipariş ile doğrula, sonra ölçeklendir.",
    EN: "Net positive but supply quality risk exists. Validate with a pilot order, then scale.",
    AR: "إيجابي صافٍ لكن خطر جودة قائم. اختبر بطلب تجريبي ثم وسّع.",
  },
  marketing: {
    TR: "Mütevazı pozitif. Doğru segmente nokta atışı yaparsan ROI 3x'e çıkar. Aksi hâlde dağılır.",
    EN: "Modestly positive. Tightly target the right segment and ROI hits 3x; otherwise it dilutes.",
    AR: "إيجابي متواضع. استهداف دقيق للشريحة الصحيحة يصل بـROI إلى 3x، وإلا يتشتت.",
  },
};

export function twinVerdict(verdictKey, lang = "TR") {
  return TWIN_VERDICTS[verdictKey]?.[lang] || TWIN_VERDICTS.hire.TR;
}

// =====================================================================
// B2B MARKETPLACE
// =====================================================================

export function buildB2bOpportunities({ purchases = [], customers = [] }) {
  const buyOpps = [
    { id: "buy-1", kind: "buy", item: "Un (100 kg)", seller: "Levent Bakery", belowMarketPct: 18, matchScore: 92, location: "Levent, İstanbul" },
    { id: "buy-2", kind: "buy", item: "Zeytinyağı (50 L)", seller: "Aydın Ova Üreticileri", belowMarketPct: 11, matchScore: 78, location: "Aydın" },
  ];
  const sellOpps = [
    { id: "sell-1", kind: "sell", buyer: "Beyoğlu Restoran", units: 50, item: "Ürün X", matchScore: 88, location: "Beyoğlu, İstanbul" },
    { id: "sell-2", kind: "sell", buyer: "Kadıköy Cafe", units: 20, item: "Ürün Y", matchScore: 71, location: "Kadıköy, İstanbul" },
  ];
  return [...buyOpps, ...sellOpps];
}

export function listB2bListings() {
  const cached = localStore.list(KEYS.b2bListings);
  if (cached.length > 0) return cached;
  const seeds = [
    { id: "lst-1", item: "Premium Olive Oil", units: 200, priceTRY: 320, location: "İstanbul", postedAt: new Date().toISOString() },
    { id: "lst-2", item: "Organic Flour 25kg", units: 80, priceTRY: 540, location: "İstanbul", postedAt: new Date().toISOString() },
    { id: "lst-3", item: "Custom Packaging Service", units: 1, priceTRY: 0, location: "Remote", postedAt: new Date().toISOString() },
  ];
  localStore.save(KEYS.b2bListings, seeds);
  return seeds;
}

// =====================================================================
// CAPITAL — eligibility + cash advance
// =====================================================================

export function calcEligibility({ invoices = [], customers = [], purchases = [] }) {
  let score = 60;
  const total = invoices.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0);
  if (total > 50000) score += 10;
  if (total > 200000) score += 8;
  if (invoices.length > 30) score += 5;
  if (customers.length > 20) score += 6;
  const overdueRate = invoices.length ? invoices.filter((i) => String(i.status || "").toLowerCase() === "overdue").length / invoices.length : 0;
  score -= Math.round(overdueRate * 30);
  score = Math.max(0, Math.min(100, score));
  const status = score >= 70 ? "approved" : score >= 50 ? "review" : "declined";
  return { score, status };
}

export function capitalProducts({ invoices = [] }) {
  const outstanding = invoices.filter((i) => String(i.status || "").toLowerCase() !== "paid").reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0);
  return [
    { id: "wc",       kind: "workingCapital", upTo: 50000, interestPct: 18, termMin: 6, termMax: 24, approvalMins: 2, palette: "teal" },
    { id: "advance",  kind: "cashAdvance",    feePct: 2.5, available: outstanding || 23000, palette: "indigo" },
    { id: "bnpl",     kind: "bnpl",           feePct: 1.5, palette: "purple" },
  ];
}

export function calcCashAdvance(invoiceAmount, feePct = 2.5) {
  const fee = invoiceAmount * (feePct / 100);
  return { fee, youGet: invoiceAmount - fee };
}

// =====================================================================
// INSURANCE
// =====================================================================

export function buildInsuranceRecommendations({ invoices = [], customers = [] }) {
  const totalRevenue = invoices.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0);
  return [
    {
      id: "cyber",
      product: "cyber",
      priority: "high",
      reason: "You're heavily digital + e-commerce active",
      coverage: 500000,
      bestProvider: "Allianz",
      monthlyPremium: 240,
      providersCompared: 5,
      palette: "rose",
    },
    {
      id: "income",
      product: "income",
      priority: "medium",
      reason: "Cash flow has volatility — protect 6 months",
      coverage: 50000,
      bestProvider: "Anadolu Sigorta",
      monthlyPremium: 85,
      providersCompared: 4,
      palette: "amber",
    },
    {
      id: "credit",
      product: "creditInsurance",
      priority: "low",
      reason: "Most customers pay reliably",
      coverage: 100000,
      bestProvider: "Coface",
      monthlyPremium: 130,
      providersCompared: 3,
      palette: "indigo",
    },
    {
      id: "fire",
      product: "fire",
      priority: customers.length > 50 ? "medium" : "low",
      reason: "Physical premises and inventory",
      coverage: totalRevenue * 2 || 1000000,
      bestProvider: "Aksigorta",
      monthlyPremium: 320,
      providersCompared: 6,
      palette: "orange",
    },
  ];
}

// =====================================================================
// EDUCATION — skill tree + lessons
// =====================================================================

export const EDU_SKILL_TREE = [
  { id: "tax",         status: "mastered",   total: 5, done: 5, requires: [] },
  { id: "cashflow",    status: "mastered",   total: 5, done: 5, requires: [] },
  { id: "pricing",     status: "inProgress", total: 5, done: 3, requires: ["cashflow"] },
  { id: "negotiation", status: "locked",     total: 6, done: 0, requires: ["pricing"] },
  { id: "marketing",   status: "inProgress", total: 5, done: 2, requires: ["cashflow"] },
  { id: "hr",          status: "locked",     total: 4, done: 0, requires: ["marketing"] },
  { id: "ops",         status: "inProgress", total: 4, done: 1, requires: ["tax"] },
  { id: "strategy",    status: "locked",     total: 8, done: 0, requires: ["pricing", "ops"] },
];

export function loadEducationProgress() {
  return localStore.get(KEYS.educationProgress, {
    xp: 4250,
    completedLessonIds: [],
    streak: 7,
  });
}

export function saveEducationProgress(p) { localStore.set(KEYS.educationProgress, p); }

export function levelKeyForXp(xp) {
  if (xp >= 8000) return "master";
  if (xp >= 4000) return "owner2";
  if (xp >= 1500) return "owner1";
  return "starter";
}

export const DAILY_LESSON = {
  TR: { title: "5 Türk işletmeden 4'ü neden KDV'yi fazla ödüyor", duration: 90, xp: 50 },
  EN: { title: "Why 4 of 5 Turkish businesses overpay VAT", duration: 90, xp: 50 },
  AR: { title: "لماذا 4 من 5 شركات تركية تدفع KDV زيادة", duration: 90, xp: 50 },
};

export const CERTIFICATES = [
  { id: "tax-3",      skill: "tax",      level: 3, awardedAt: "2025-12-12" },
  { id: "cashflow-2", skill: "cashflow", level: 2, awardedAt: "2026-01-08" },
];

// =====================================================================
// NETWORK INTELLIGENCE — peer benchmarks
// =====================================================================

export function buildPeerBenchmarks({ invoices = [], customers = [] }) {
  const customerCount = customers.length || 47;
  const totalRevenue = invoices.reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0) || 47500;
  const margin = 0.24;
  const peerCount = 247;

  const metrics = [
    {
      id: "retention",
      labelKey: "network.metric.retention",
      youValue: 0.86,
      peerMedian: 0.78,
      tier: "top25",
      insight: "Müşterileri elinde tutuyorsun — buradaki gücü pazarlama mesajına dönüştür.",
    },
    {
      id: "revenuePerCust",
      labelKey: "network.metric.revenuePerCust",
      youValue: totalRevenue / Math.max(1, customerCount),
      peerMedian: 1100,
      tier: "middle50",
      insight: "Müşteri başı gelirin ortada. Cross-sell ile yukarı çekebilirsin.",
    },
    {
      id: "margin",
      labelKey: "network.metric.margin",
      youValue: margin,
      peerMedian: 0.32,
      tier: "bottom25",
      insight: "Tier'ın 32% marjda, sen 24%. Tedarikçi pazarlığı + fiyat ayarı.",
      action: true,
    },
    {
      id: "suppliers",
      labelKey: "network.metric.suppliers",
      youValue: 2,
      peerMedian: 5,
      tier: "bottom25",
      insight: "Tier'ın 4-6 tedarikçi kullanıyor, sen 2 — risk yoğunlaşmış.",
      action: true,
    },
    {
      id: "salaryAvg",
      labelKey: "network.metric.salaryAvg",
      youValue: 6000,
      peerMedian: 10000,
      tier: "bottom25",
      insight: "Ortalama maaşın eş tier'ından düşük — retention etkisi var.",
    },
    {
      id: "churnRate",
      labelKey: "network.metric.churnRate",
      youValue: 0.06,
      peerMedian: 0.08,
      tier: "top25",
      insight: "Çok iyi durum — pazarlamada 'düşük churn' iddiası kullanılabilir.",
    },
  ];

  return { peerCount, metrics };
}

// =====================================================================
// SUPPLIER HEALTH
// =====================================================================

export function buildSupplierHealth({ purchases = [] }) {
  // Aggregate suppliers from real purchases when available, else seeds
  const seeds = [
    {
      id: "sup-a",
      name: "Supplier A",
      score: 87,
      health: "healthy",
      signals: [
        { kind: "paysOnTime",     positive: true, weight: 8 },
        { kind: "stableEmployees", positive: true, weight: 6 },
        { kind: "growingRevenue",  positive: true, weight: 7 },
      ],
      recommendation: null,
    },
    {
      id: "sup-b",
      name: "Supplier B",
      score: 42,
      health: "warning",
      signals: [
        { kind: "latePayments",    positive: false, weight: -15 },
        { kind: "reducedEmployees", positive: false, weight: -8 },
        { kind: "cashFlowIssues",   positive: false, weight: -12 },
      ],
      recommendation: "Find backup supplier within 30 days. Risk of stockout if Supplier B fails.",
    },
    {
      id: "sup-c",
      name: "Supplier C",
      score: 22,
      health: "critical",
      signals: [
        { kind: "lawsuit",         positive: false, weight: -20 },
        { kind: "latePayments",    positive: false, weight: -10 },
        { kind: "cashFlowIssues",   positive: false, weight: -15 },
      ],
      recommendation: "Immediate diversification needed. Move 50% of orders within 14 days.",
    },
    {
      id: "sup-d",
      name: "Supplier D",
      score: 76,
      health: "healthy",
      signals: [
        { kind: "paysOnTime",      positive: true, weight: 8 },
        { kind: "stableEmployees", positive: true, weight: 5 },
      ],
      recommendation: null,
    },
  ];
  // Augment first supplier name from real purchase data if available
  if (purchases.length > 0 && purchases[0]?.supplierName) {
    seeds[0].name = purchases[0].supplierName;
  }
  return seeds;
}

// =====================================================================
// OPEN BANKING AI
// =====================================================================

export function buildBankingInsights() {
  return {
    bankCount: 17,
    insights: [
      {
        id: "fees",
        kind: "fees",
        savingsTRY: 2400,
        title: "Akbank service fees 3x higher than Garanti",
        details: "Same services available, monthly maintenance is the issue.",
        from: "Akbank", to: "Garanti",
      },
      {
        id: "interest",
        kind: "interest",
        savingsTRY: 1800,
        title: "₺200K idle in zero-interest accounts",
        details: "Move to Garanti time deposit at 18% APY (current best).",
        from: "Idle", to: "Garanti TD",
      },
      {
        id: "fx",
        kind: "fx",
        savingsTRY: 3200,
        title: "USD conversions go through 3 hops",
        details: "Direct conversion via İş Bankası saves 1.2% per transaction.",
        from: "3-hop", to: "İş Bankası direct",
      },
    ],
  };
}

export function bankFeeComparison() {
  return [
    { bank: "Akbank",     monthlyFee: 89, txFee: 2.40, savings: 0,    palette: "rose"   },
    { bank: "Garanti",    monthlyFee: 29, txFee: 1.80, savings: 2400, palette: "emerald" },
    { bank: "İş Bankası", monthlyFee: 39, txFee: 1.50, savings: 1900, palette: "indigo" },
    { bank: "Yapı Kredi", monthlyFee: 49, txFee: 1.90, savings: 1200, palette: "amber"   },
  ];
}

// =====================================================================
// INFLUENCER ROI
// =====================================================================

export function listInfluencers() {
  const cached = localStore.list(KEYS.influencers);
  if (cached.length > 0) return cached;
  const seeds = [
    { id: "inf-1", name: "Aylin K.",   platform: "instagram", spent: 5000, attributed: 18400, ltv: 47000, recommended: "engageAgain" },
    { id: "inf-2", name: "Mehmet B.",  platform: "tiktok",    spent: 3000, attributed: 1200,  ltv: 0,     recommended: "skip" },
    { id: "inf-3", name: "Selin Y.",   platform: "youtube",   spent: 12000, attributed: 31000, ltv: 89000, recommended: "engageAgain" },
    { id: "inf-4", name: "Burak T.",   platform: "linkedin",  spent: 4000, attributed: 9500,  ltv: 22000, recommended: "engageAgain" },
    { id: "inf-5", name: "Deniz A.",   platform: "instagram", spent: 2500, attributed: 800,   ltv: 0,     recommended: "skip" },
  ];
  localStore.save(KEYS.influencers, seeds);
  return seeds;
}

export function calcInfluencerRoi(spend, attributed, cogsPct = 0.6) {
  const cogs = attributed * cogsPct;
  const profit = attributed - cogs - spend;
  const roi = spend > 0 ? profit / spend : 0;
  return { profit, roi };
}
