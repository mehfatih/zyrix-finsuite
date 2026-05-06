// Shared API + helpers for Phase 6 AI Autopilots cluster.
// Backend has /api/ai/insight, /api/ai-assistant/chat, /api/whatsapp,
// /api/receipt-scans. Voice STT uses Web Speech API (browser-side).
// New autopilot endpoints (invoice from-voice/text/image, recon auto-match,
// inbox aggregator, vault search) are served via localStorage + AI helpers.

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
  invoiceDrafts:   "zyrix_invoice_autopilot_drafts_v1",
  invoiceMinutes:  "zyrix_invoice_autopilot_minutes_v1",
  reconMatches:    "zyrix_recon_auto_matches_v1",
  reconCorrections:"zyrix_recon_corrections_v1",
  waConfig:        "zyrix_wa_agent_config_v1",
  waConversations: "zyrix_wa_conversations_v1",
  inboxMessages:   "zyrix_inbox_messages_v1",
  inboxRead:       "zyrix_inbox_read_v1",
  vaultDocs:       "zyrix_vault_docs_v1",
  filingQueue:     "zyrix_filing_queue_v1",
  recurringDismiss:"zyrix_recurring_setup_dismiss_v1",
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
  getKv(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  saveKv(key, value)   { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
};

// Track minutes saved for the wow-counter
export function recordMinutesSaved(minutes = 5) {
  const cur = Number(localStorage.getItem(KEYS.invoiceMinutes) || "0") + minutes;
  try { localStorage.setItem(KEYS.invoiceMinutes, String(cur)); } catch { /* ignore */ }
  return cur;
}
export function getMinutesSaved() {
  return Number(localStorage.getItem(KEYS.invoiceMinutes) || "0");
}

// ── Lightweight client-side parser for invoice drafts ────────────────────
// Production wires this through Gemini via /api/autopilot/invoice/from-text.
// Heuristics handle TR + EN orders ("invoice ahmed for 2 laptop" / "ahmed'e
// 1 laptop fatura kes") well enough to demo end-to-end.
const NUM_WORDS = {
  bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

export function parseInvoiceText(text, { customers = [], products = [] } = {}) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  // 1) Customer: best match by fuzzy includes against customer names.
  let customer = null;
  for (const c of customers) {
    const name = String(c.name || "").toLowerCase();
    if (!name) continue;
    const tokens = name.split(/\s+/).filter((t) => t.length > 2);
    if (lower.includes(name) || tokens.some((t) => lower.includes(t))) {
      customer = c;
      break;
    }
  }
  // Fallback: take the first capitalised word that isn't a product name
  if (!customer) {
    const m = raw.match(/[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}/);
    if (m) customer = { name: m[0] };
  }

  // 2) Items: scan for "<qty> <product>" patterns
  const items = [];
  const tokens = lower.replace(/[,.;]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    let qty = null;
    if (/^\d+$/.test(t)) qty = parseInt(t, 10);
    else if (NUM_WORDS[t] != null) qty = NUM_WORDS[t];
    if (qty == null) continue;
    // Look ahead 1-3 tokens for a product match
    for (let j = i + 1; j <= Math.min(i + 3, tokens.length - 1); j++) {
      const candidate = tokens.slice(i + 1, j + 1).join(" ");
      const product = products.find((p) => String(p.name || "").toLowerCase().includes(candidate) || candidate.includes(String(p.name || "").toLowerCase()));
      if (product) {
        items.push({
          name: product.name,
          quantity: qty,
          unitPrice: Number(product.salePrice ?? product.price ?? 0) || guessPrice(product.name),
          vatRate: 20,
        });
        i = j;
        break;
      }
      // Loose match: pick the noun even without product hit
      if (j === Math.min(i + 3, tokens.length - 1)) {
        const noun = tokens[i + 1];
        if (noun && noun.length > 2 && !/^\d+$/.test(noun)) {
          items.push({
            name: noun.charAt(0).toUpperCase() + noun.slice(1),
            quantity: qty,
            unitPrice: guessPrice(noun),
            vatRate: 20,
          });
          i = i + 1;
          break;
        }
      }
    }
  }

  if (items.length === 0 && customer) {
    items.push({ name: "Hizmet", quantity: 1, unitPrice: 1000, vatRate: 20 });
  }

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const vat = items.reduce((s, it) => s + it.quantity * it.unitPrice * (it.vatRate / 100), 0);
  const confidence = Math.min(98, 50 + items.length * 12 + (customer ? 18 : 0));

  return {
    transcript: raw,
    customer,
    items,
    subtotal,
    vatTotal: vat,
    grandTotal: subtotal + vat,
    confidence,
  };
}

function guessPrice(noun) {
  const n = String(noun).toLowerCase();
  if (n.includes("laptop") || n.includes("bilgisayar") || n.includes("tablet")) return 25000;
  if (n.includes("mouse") || n.includes("klavye") || n.includes("kulakl")) return 500;
  if (n.includes("telefon") || n.includes("phone")) return 18000;
  if (n.includes("kart") || n.includes("hesap")) return 200;
  return 1500;
}

// Seed a couple of voice-saved drafts so the UI feels populated
export function ensureInvoiceDraftSeed() {
  if (localStore.list(KEYS.invoiceDrafts).length > 0) return;
  const seeds = [
    {
      source: "voice",
      transcript: "Demo Müşteri'ye iki laptop ve dört mouse fatura kes",
      customer: { name: "Demo Müşteri A.Ş." },
      items: [
        { name: "Laptop", quantity: 2, unitPrice: 25000, vatRate: 20 },
        { name: "Mouse", quantity: 4, unitPrice: 500, vatRate: 20 },
      ],
      subtotal: 52000,
      vatTotal: 10400,
      grandTotal: 62400,
      confidence: 91,
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      status: "DRAFT",
    },
  ];
  seeds.forEach((s) => localStore.add(KEYS.invoiceDrafts, s));
}

// Inbox seed
export function ensureInboxSeed() {
  if (localStore.list(KEYS.inboxMessages).length > 0) return;
  const today = Date.now();
  const seeds = [
    {
      customerName: "Ahmed Yıldız",
      avatar: "A",
      channel: "WHATSAPP",
      lastMessage: "Faturam ne zaman gelir?",
      tag: "invoice",
      sentiment: "neutral",
      urgency: 4,
      unread: true,
      timestamp: new Date(today - 2 * 60000).toISOString(),
      thread: [
        { from: "customer", text: "Faturam ne zaman gelir?", at: new Date(today - 2 * 60000).toISOString() },
        { from: "ai", text: "Merhaba Ahmed! Faturanız bugün 14:30'da gönderildi. Mailinizi kontrol edebilirsiniz.", at: new Date(today - 90000).toISOString(), aiHandled: true },
      ],
    },
    {
      customerName: "Layla Akın",
      avatar: "L",
      channel: "EMAIL",
      lastMessage: "Geçen ayki ödeme makbuzunu yollar mısınız?",
      tag: "invoice",
      sentiment: "positive",
      urgency: 2,
      unread: true,
      timestamp: new Date(today - 60 * 60000).toISOString(),
      thread: [
        { from: "customer", text: "Geçen ayki ödeme makbuzunu yollar mısınız?", at: new Date(today - 60 * 60000).toISOString() },
      ],
    },
    {
      customerName: "Selim Kara",
      avatar: "S",
      channel: "PHONE",
      lastMessage: "İptal etmek istiyorum",
      tag: "complaint",
      sentiment: "negative",
      urgency: 5,
      unread: true,
      timestamp: new Date(today - 30 * 60000).toISOString(),
      thread: [
        { from: "customer", text: "İptal etmek istiyorum", at: new Date(today - 30 * 60000).toISOString() },
      ],
    },
    {
      customerName: "Yasin Demir",
      avatar: "Y",
      channel: "TRENDYOL",
      lastMessage: "Sipariş ne zaman çıkar?",
      tag: "order",
      sentiment: "neutral",
      urgency: 3,
      unread: false,
      timestamp: new Date(today - 4 * 3600000).toISOString(),
      thread: [
        { from: "customer", text: "Sipariş ne zaman çıkar?", at: new Date(today - 4 * 3600000).toISOString() },
        { from: "agent", text: "Yarın kargoya verilecek!", at: new Date(today - 3.5 * 3600000).toISOString() },
      ],
    },
    {
      customerName: "Zeynep Kaya",
      avatar: "Z",
      channel: "INSTAGRAM",
      lastMessage: "Harika hizmet, teşekkürler!",
      tag: "compliment",
      sentiment: "positive",
      urgency: 1,
      unread: false,
      timestamp: new Date(today - 24 * 3600000).toISOString(),
      thread: [
        { from: "customer", text: "Harika hizmet, teşekkürler!", at: new Date(today - 24 * 3600000).toISOString() },
      ],
    },
  ];
  seeds.forEach((s) => localStore.add(KEYS.inboxMessages, s));
}

export function ensureWaSeed() {
  if (localStore.list(KEYS.waConversations).length > 0) return;
  const today = Date.now();
  const seeds = [
    { customerName: "Ahmed Yıldız", phone: "+90 532 111 2233", avatar: "A", intent: "invoice", lastMessage: "Where's my invoice from yesterday?", aiReply: "Hi Ahmed! Your invoice #432 was sent at 14:30 yesterday. Want me to resend it?", status: "AI_HANDLED", confidence: 96, timestamp: new Date(today - 2 * 60000).toISOString() },
    { customerName: "Mehmet K.",    phone: "+90 555 998 7777", avatar: "M", intent: "complaint", lastMessage: "I want a refund for product X", aiReply: "I understand. Let me connect you with a human agent.", status: "ESCALATED", confidence: 42, timestamp: new Date(today - 5 * 60000).toISOString() },
    { customerName: "Demo Tedarik", phone: "+90 212 555 0001", avatar: "D", intent: "order", lastMessage: "İki tane laptop sipariş etmek istiyorum", aiReply: "Mevcut! Hangi modeli istersiniz? Stoklarımızda ProBook ve EliteBook var.", status: "AI_HANDLED", confidence: 88, timestamp: new Date(today - 12 * 60000).toISOString() },
    { customerName: "Beta İnşaat",  phone: "+90 312 444 5566", avatar: "B", intent: "payment", lastMessage: "Did you receive my payment?", aiReply: "Yes, your payment of ₺18,900 was received on Feb 12. Thanks!", status: "AI_HANDLED", confidence: 99, timestamp: new Date(today - 25 * 60000).toISOString() },
  ];
  seeds.forEach((s) => localStore.add(KEYS.waConversations, s));
}

export function ensureVaultSeed() {
  if (localStore.list(KEYS.vaultDocs).length > 0) return;
  const today = Date.now();
  const types = ["salesInvoice", "purchaseInvoice", "receipt", "contract", "permit", "bank", "tax"];
  const parties = ["Demo Müşteri", "Acme Yapı", "Yıldız Lojistik", "TEDAŞ", "Demo Tedarik", "Beta İnşaat"];
  const seeds = [];
  for (let i = 0; i < 14; i++) {
    seeds.push({
      title: `Doküman-${1000 + i}`,
      type: types[i % types.length],
      party: parties[i % parties.length],
      amount: Math.round(Math.random() * 18000) + 500,
      date: new Date(today - i * 86400000 * 3).toISOString(),
      tags: ["AI"],
      sizeKb: Math.round(Math.random() * 800) + 80,
    });
  }
  seeds.forEach((s) => localStore.add(KEYS.vaultDocs, s));
}

export function ensureFilingSeed() {
  if (localStore.list(KEYS.filingQueue).length > 0) return;
  const types = ["salesInvoice", "purchaseInvoice", "receipt", "tax", "contract"];
  const parties = ["Demo Müşteri", "TEDAŞ", "Acme Ofis", "Mali Müşavirim", "Demo Tedarik"];
  const seeds = [];
  for (let i = 0; i < 6; i++) {
    seeds.push({
      type: types[i % types.length],
      party: parties[i % parties.length],
      amount: Math.round(Math.random() * 12000) + 800,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      confidence: 70 + Math.round(Math.random() * 28),
      status: i < 4 ? "PENDING_REVIEW" : "AUTO_FILED",
    });
  }
  seeds.forEach((s) => localStore.add(KEYS.filingQueue, s));
}
