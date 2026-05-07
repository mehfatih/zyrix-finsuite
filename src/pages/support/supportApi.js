// ================================================================
// Phase 13 — Support API helper.
// Hits the real backend; falls back to localStorage if endpoint isn't
// deployed yet (mirrors the heuristic-generator pattern from earlier phases).
// ================================================================

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function api(path, opts = {}) {
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

export const KEYS = {
  tickets:    "zyrix_support_tickets_v1",
  chat:       "zyrix_support_chat_v1",
  csat:       "zyrix_support_csat_v1",
  articleVotes: "zyrix_support_article_votes_v1",
};

const local = {
  list(k)        { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
  save(k, v)     { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  add(k, item)   {
    const arr = local.list(k);
    const next = [{ ...item, id: item.id || `${k}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...arr];
    local.save(k, next);
    return next[0];
  },
  update(k, id, patch) {
    const arr = local.list(k).map((x) => (x.id === id ? { ...x, ...patch } : x));
    local.save(k, arr);
    return arr.find((x) => x.id === id);
  },
};

// ── Tickets ────────────────────────────────────────────────────
export async function listTickets() {
  const r = await api("/api/support/tickets");
  if (r.success) return r.data || [];
  return local.list(KEYS.tickets);
}

export async function getTicket(id) {
  const r = await api(`/api/support/tickets/${id}`);
  if (r.success) return r.data;
  return local.list(KEYS.tickets).find((t) => t.id === id) || null;
}

export async function createTicket({ subject, description, category, priority }) {
  const r = await api("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ subject, description, category, priority }),
  });
  if (r.success) return r.data;
  return local.add(KEYS.tickets, {
    subject, description, category, priority: priority || "NORMAL",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [{ id: `m-${Date.now()}`, authorType: "CUSTOMER", content: description, createdAt: new Date().toISOString() }],
  });
}

export async function addMessage(ticketId, content) {
  const r = await api(`/api/support/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (r.success) return r.data;
  // local fallback
  const arr = local.list(KEYS.tickets);
  const t = arr.find((x) => x.id === ticketId);
  if (t) {
    t.messages = [...(t.messages || []), { id: `m-${Date.now()}`, authorType: "CUSTOMER", content, createdAt: new Date().toISOString() }];
    t.updatedAt = new Date().toISOString();
    local.save(KEYS.tickets, arr);
  }
  return { id: `m-${Date.now()}`, content };
}

export async function submitCsat(ticketId, rating, comment) {
  const r = await api(`/api/support/tickets/${ticketId}/csat`, {
    method: "PATCH",
    body: JSON.stringify({ rating, comment }),
  });
  if (r.success) return r.data;
  local.update(KEYS.tickets, ticketId, { csatRating: rating, csatComment: comment, status: "CLOSED" });
  return { rating, comment };
}

// ── Knowledge base ─────────────────────────────────────────────
const SEED_ARTICLES = [
  // Getting Started
  { slug: "getting-started",     category: "gettingStarted", titles: { TR: "Zyrix'e ilk girişte yapılacak 5 adım", EN: "5 things to do on your first Zyrix login", AR: "5 خطوات عند أول دخول لـ Zyrix" }, bodies: { TR: "1) Onboarding sihirbazını tamamla, 2) En az bir banka bağla, 3) Logo + VKN gir, 4) İlk müşteriyi ekle, 5) İlk faturayı oluştur. 5 dakikada bitir.", EN: "1) Complete onboarding wizard, 2) Connect a bank, 3) Add logo + tax ID, 4) Add your first customer, 5) Create your first invoice. Under 5 minutes.", AR: "1) أكمل الإعداد، 2) اربط بنكاً، 3) أضف الشعار والرقم الضريبي، 4) أول عميل، 5) أول فاتورة. أقل من 5 دقائق." }, helpfulCount: 47, viewCount: 312 },
  { slug: "shortcuts",           category: "gettingStarted", titles: { TR: "Klavye kısayollarını öğren", EN: "Learn the keyboard shortcuts", AR: "تعلّم اختصارات لوحة المفاتيح" }, bodies: { TR: "G+I → Faturalar, G+D → Dashboard. Tam liste /help/shortcuts'ta.", EN: "G+I → Invoices, G+D → Dashboard. Full list at /help/shortcuts.", AR: "G+I → الفواتير، G+D → اللوحة. القائمة الكاملة في /help/shortcuts." }, helpfulCount: 22, viewCount: 178 },
  // Invoicing
  { slug: "first-invoice",       category: "invoicing",      titles: { TR: "İlk faturanı 30 saniyede oluştur", EN: "Create your first invoice in 30 seconds", AR: "أنشئ أول فاتورة في 30 ثانية" }, bodies: { TR: "AI Fatura Otopilotu sayfasında ses, metin veya fotoğrafla başlatabilirsin. AI tüm alanları doldurur, sen onaylarsın.", EN: "Open AI Invoice Autopilot. Use voice, text, or photo. AI fills all fields — you confirm.", AR: "افتح Autopilot الفواتير AI. استخدم الصوت أو النص أو الصورة." }, helpfulCount: 89, viewCount: 612 },
  { slug: "invoice-pdf",         category: "invoicing",      titles: { TR: "Fatura PDF'ini indir", EN: "Download invoice PDF", AR: "حمّل PDF للفاتورة" }, bodies: { TR: "Fatura detayında 'PDF İndir' butonuna bas. Logon ve VKN otomatik gelir.", EN: "On the invoice detail, tap 'Download PDF'. Logo + tax ID render automatically.", AR: "في تفاصيل الفاتورة اضغط 'تحميل PDF'." }, helpfulCount: 34, viewCount: 240 },
  { slug: "recurring-invoices",  category: "invoicing",      titles: { TR: "Tekrarlayan fatura kur", EN: "Set up recurring invoices", AR: "أنشئ فواتير متكررة" }, bodies: { TR: "Faturalar → Otomatik Faturalar → + Yeni. Müşteri ve periyot seç, kaydet.", EN: "Invoices → Recurring → + New. Pick customer and frequency, save.", AR: "الفواتير → متكررة → + جديد. اختر العميل والتكرار." }, helpfulCount: 18, viewCount: 145 },
  // Tax
  { slug: "vat-auto-calc",       category: "tax",            titles: { TR: "KDV otomatik hesaplaması nasıl çalışır?", EN: "How does VAT auto-calc work?", AR: "كيف يعمل حساب الضريبة التلقائي؟" }, bodies: { TR: "Fatura kalemine KDV oranı seç → Zyrix toplam, KDV, genel toplam anlık hesaplar. Aylık beyanname için Vergi → KDV Raporu'nu aç.", EN: "Pick VAT rate per line → Zyrix calculates subtotal/VAT/total live. For monthly declaration: Tax → VAT Report.", AR: "اختر نسبة KDV لكل بند → يُحسب المجموع و KDV والإجمالي مباشرة." }, helpfulCount: 56, viewCount: 421 },
  { slug: "efatura-gib",         category: "tax",            titles: { TR: "e-Fatura GİB'e gönderme", EN: "Submit e-Fatura to GİB", AR: "أرسل e-Fatura إلى GİB" }, bodies: { TR: "Faturayı kaydettikten sonra 'GİB'e Gönder' butonuna bas. e-Fatura/e-Arşiv otomatik karar.", EN: "After saving the invoice, tap 'Submit to GİB'. e-Fatura/e-Arşiv routing is automatic.", AR: "بعد حفظ الفاتورة اضغط 'إرسال إلى GİB'." }, helpfulCount: 41, viewCount: 318 },
  // Banks & Cash
  { slug: "connect-bank",        category: "banks",          titles: { TR: "Bankamı nasıl bağlarım?", EN: "How do I connect my bank?", AR: "كيف أربط بنكي؟" }, bodies: { TR: "Onboarding sırasında veya Hesap → Ayarlar → Bankalar yolundan. 17 banka destekleniyor — Açık Bankacılık (BDDK) sadece okuma.", EN: "During onboarding or Account → Settings → Banks. 17 banks supported. Open Banking (BDDK) is read-only.", AR: "أثناء الإعداد أو الحساب → الإعدادات → البنوك. 17 بنكاً مدعوماً." }, helpfulCount: 67, viewCount: 489 },
  // AI
  { slug: "ai-features-list",    category: "ai",             titles: { TR: "AI özelliklerinin tam listesi (78)", EN: "Full list of AI features (78)", AR: "القائمة الكاملة لميزات AI (78)" }, bodies: { TR: "Otopilotlar (7), Hidden Cash (6), Predictive (7), Cognitive (8), Voice & CX (8), Ecosystem (10).", EN: "Autopilots (7), Hidden Cash (6), Predictive (7), Cognitive (8), Voice & CX (8), Ecosystem (10).", AR: "Autopilots (7)، Hidden Cash (6)، Predictive (7)، Cognitive (8)، Voice & CX (8)، Ecosystem (10)." }, helpfulCount: 92, viewCount: 743 },
  { slug: "customer-dna",        category: "ai",             titles: { TR: "Customer DNA nasıl çalışır?", EN: "How does Customer DNA work?", AR: "كيف يعمل Customer DNA؟" }, bodies: { TR: "Geçmiş 6 ayın faturaları + ödeme paternleri + iletişim sıklığı analiz edilerek müşterinin kişilik tipi belirlenir.", EN: "Last 6 months of invoices + payment patterns + contact frequency are analyzed to assign personality.", AR: "نحلّل 6 أشهر من الفواتير + أنماط الدفع + تكرار التواصل." }, helpfulCount: 38, viewCount: 287 },
  // Security
  { slug: "enable-2fa",          category: "security",       titles: { TR: "İki Faktörlü Doğrulamayı (2FA) etkinleştir", EN: "Enable Two-Factor Authentication (2FA)", AR: "فعّل المصادقة الثنائية (2FA)" }, bodies: { TR: "Ayarlar → Güvenlik → 2FA Kur. SMS, TOTP veya passkey seç. 10 yedek kodu kaydetmeyi unutma.", EN: "Settings → Security → Set up 2FA. Pick SMS, TOTP, or passkey. Save your 10 backup codes.", AR: "الإعدادات → الأمان → إعداد 2FA. اختر SMS أو TOTP أو passkey." }, helpfulCount: 51, viewCount: 376 },
  { slug: "kvkk-export",         category: "security",       titles: { TR: "KVKK kapsamında verilerimi nasıl indiririm?", EN: "How do I export my data under KVKK/GDPR?", AR: "كيف أصدّر بياناتي وفق KVKK/GDPR؟" }, bodies: { TR: "Ayarlar → Güvenlik → Veri İhracı Talebi. PDF formatında 30 gün içinde teslim edilir.", EN: "Settings → Security → Data Export Request. Delivered as PDF within 30 days as required by law.", AR: "الإعدادات → الأمان → طلب تصدير البيانات. يُسلَّم خلال 30 يوماً." }, helpfulCount: 28, viewCount: 198 },
  // Billing
  { slug: "upgrade-plan",        category: "billing",        titles: { TR: "Aboneliği yükselt", EN: "Upgrade your subscription", AR: "ترقية الاشتراك" }, bodies: { TR: "Profil → Abonelik → Yükselt. Lite, Pro, Business, Enterprise. Co-Founder + AR + Twin Enterprise'da.", EN: "Profile → Subscription → Upgrade. Lite, Pro, Business, Enterprise.", AR: "الملف → الاشتراك → ترقية." }, helpfulCount: 24, viewCount: 167 },
  // Troubleshoot
  { slug: "voice-not-working",   category: "troubleshoot",   titles: { TR: "Sesli komut tanınmıyor", EN: "Voice command isn't recognized", AR: "الأمر الصوتي لا يُتعرّف عليه" }, bodies: { TR: "Chrome veya Edge kullan (Safari sınırlı). Mikrofon iznini kontrol et.", EN: "Use Chrome or Edge (Safari is limited). Check mic permission.", AR: "استخدم Chrome أو Edge. تأكد من صلاحية الميكروفون." }, helpfulCount: 15, viewCount: 108 },
];

export async function listArticles({ category = null, q = null } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const r = await api(`/api/support/articles?${params.toString()}`);
  if (r.success) return r.data || [];
  // fallback to seed
  let items = SEED_ARTICLES;
  if (category) items = items.filter((a) => a.category === category);
  if (q) {
    const term = q.toLowerCase();
    items = items.filter((a) =>
      Object.values(a.titles).some((t) => t.toLowerCase().includes(term)) ||
      Object.values(a.bodies).some((b) => b.toLowerCase().includes(term))
    );
  }
  return items;
}

export async function getArticle(slug) {
  const r = await api(`/api/support/articles/${slug}`);
  if (r.success) return r.data;
  return SEED_ARTICLES.find((a) => a.slug === slug) || null;
}

export async function voteHelpful(articleId, helpful) {
  const r = await api(`/api/support/articles/${articleId}/helpful`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  });
  if (r.success) return r.data;
  const votes = local.list(KEYS.articleVotes);
  votes.push({ articleId, helpful, at: new Date().toISOString() });
  local.save(KEYS.articleVotes, votes);
  return { ok: true };
}

// ── AI chatbot ─────────────────────────────────────────────────
const CHAT_REPLIES = {
  TR: {
    invoice: "Faturayı 3 yoldan oluşturabilirsin: 1) AI Fatura Otopilotu (sesle/yazıyla), 2) Faturalar → + Yeni, 3) Sesli Mod aktifse WhatsApp'tan komut. Tam rehber: /support → Faturalama.",
    tax: "KDV otomatik hesaplanır. Vergi → AI Otopilotu beyannameni 30 saniyede hazırlar.",
    bank: "Hesap → Ayarlar → Bankalar → + Banka Ekle. 17 banka destekleniyor (Açık Bankacılık, BDDK).",
    ai: "78 AI özelliği: Hidden Cash, Customer DNA, Voice Mode, Co-Founder, vb. Tam liste: /support → AI Özellikleri.",
    security: "2FA için Ayarlar → Güvenlik → 2FA Kur. SMS, TOTP veya passkey destekleniyor.",
    default: "Birkaç anahtar kelime daha yazarsan veya 'İnsan destek' butonuna basarsan yardımcı olurum.",
  },
  EN: {
    invoice: "Three ways to create invoices: 1) AI Invoice Autopilot (voice/text), 2) Invoices → + New, 3) Voice Mode via WhatsApp. Full guide: /support → Invoicing.",
    tax: "VAT is calculated automatically. Tax → AI Autopilot prepares your declaration in 30 seconds.",
    bank: "Account → Settings → Banks → + Add Bank. 17 banks supported (Open Banking, BDDK).",
    ai: "78 AI features: Hidden Cash, Customer DNA, Voice Mode, Co-Founder, etc. Full list: /support → AI Features.",
    security: "For 2FA: Settings → Security → Set up 2FA. SMS, TOTP, or passkey.",
    default: "Add a few more keywords or hit 'Talk to human' for direct support.",
  },
  AR: {
    invoice: "ثلاث طرق لإنشاء فاتورة: 1) Autopilot الفواتير AI، 2) الفواتير → + جديد، 3) الوضع الصوتي عبر واتساب.",
    tax: "الضريبة تُحسب تلقائياً. الضريبة → Autopilot يحضّر الإقرار في 30 ثانية.",
    bank: "الحساب → الإعدادات → البنوك → + أضف بنكاً. 17 بنكاً مدعوماً.",
    ai: "78 ميزة AI. القائمة الكاملة في /support → ميزات AI.",
    security: "لتفعيل 2FA: الإعدادات → الأمان → إعداد 2FA.",
    default: "أضف كلمات مفتاحية أكثر أو اضغط 'تواصل مع إنسان'.",
  },
};

export async function chat(message, lang = "TR") {
  const r = await api("/api/support/chat", {
    method: "POST",
    body: JSON.stringify({ message, lang }),
  });
  if (r.success) return r.data?.reply;
  const m = String(message).toLowerCase();
  const dict = CHAT_REPLIES[lang] || CHAT_REPLIES.EN;
  if (/invoice|fatura|فاتورة/.test(m)) return dict.invoice;
  if (/tax|vat|kdv|ضريبة/.test(m)) return dict.tax;
  if (/bank|banka|بنك/.test(m)) return dict.bank;
  if (/2fa|security|güven|أمان/.test(m)) return dict.security;
  if (/ai|yapay|ذكاء/.test(m)) return dict.ai;
  return dict.default;
}

export const SUPPORT_CATEGORIES = ["gettingStarted", "invoicing", "tax", "banks", "ai", "security", "billing", "troubleshoot"];
