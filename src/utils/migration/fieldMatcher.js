// ================================================================
// Phase 13 — AI fuzzy field matcher.
// Maps source columns ("Müşteri Adı") to FinSuite fields ("customer.name")
// using token overlap + abbreviation hints + canonical synonyms.
// ================================================================

// Canonical FinSuite fields (extend as needed).
export const FINSUITE_FIELDS = {
  customer: [
    { key: "customer.name",      label: "Customer name",      synonyms: ["name", "ad", "isim", "müşteri", "müşteri adı", "company", "ünvan", "unvan", "client", "العميل", "اسم العميل"] },
    { key: "customer.email",     label: "Email",              synonyms: ["email", "e-mail", "e-posta", "eposta", "mail", "البريد"] },
    { key: "customer.phone",     label: "Phone",              synonyms: ["phone", "tel", "telefon", "gsm", "mobil", "الهاتف"] },
    { key: "customer.taxId",     label: "Tax ID (VKN/TCKN)",  synonyms: ["vkn", "tckn", "tax", "vergi", "vergi no", "vat number", "tax id", "الرقم الضريبي"] },
    { key: "customer.address",   label: "Address",            synonyms: ["adres", "address", "العنوان"] },
    { key: "customer.city",      label: "City",               synonyms: ["şehir", "il", "city", "المدينة"] },
    { key: "customer.country",   label: "Country",            synonyms: ["ülke", "country", "البلد"] },
  ],
  invoice: [
    { key: "invoice.number",     label: "Invoice #",          synonyms: ["fatura no", "fatura numarası", "invoice", "invoice no", "invoice number", "belge no", "رقم الفاتورة"] },
    { key: "invoice.date",       label: "Invoice date",       synonyms: ["tarih", "fatura tarihi", "date", "invoice date", "issue date", "tanzim", "تاريخ"] },
    { key: "invoice.dueDate",    label: "Due date",           synonyms: ["vade", "vade tarihi", "due date", "due", "ödeme tarihi", "تاريخ الاستحقاق"] },
    { key: "invoice.customerName", label: "Customer name",    synonyms: ["müşteri", "customer", "client", "alıcı", "العميل"] },
    { key: "invoice.subtotal",   label: "Subtotal",           synonyms: ["ara toplam", "matrah", "subtotal", "net amount", "المجموع"] },
    { key: "invoice.vatRate",    label: "VAT %",              synonyms: ["kdv", "kdv oranı", "vat", "vat rate", "tax rate", "نسبة الضريبة"] },
    { key: "invoice.vatAmount",  label: "VAT amount",         synonyms: ["kdv tutarı", "kdv toplamı", "vat amount", "tax amount", "مبلغ الضريبة"] },
    { key: "invoice.total",      label: "Total",              synonyms: ["toplam", "genel toplam", "total", "amount due", "grand total", "الإجمالي"] },
    { key: "invoice.currency",   label: "Currency",           synonyms: ["para birimi", "currency", "العملة", "kur"] },
    { key: "invoice.status",     label: "Status",             synonyms: ["durum", "status", "state", "ödeme durumu", "الحالة"] },
  ],
  product: [
    { key: "product.name",       label: "Product name",       synonyms: ["ürün", "ürün adı", "product", "item", "stok adı", "name", "المنتج"] },
    { key: "product.sku",        label: "SKU/Stock code",     synonyms: ["stok kodu", "sku", "kod", "code", "barcode", "barkod", "كود"] },
    { key: "product.price",      label: "Price",              synonyms: ["fiyat", "price", "satış fiyatı", "السعر"] },
    { key: "product.stock",      label: "Stock qty",          synonyms: ["stok", "miktar", "quantity", "stock", "adet", "الكمية"] },
    { key: "product.unit",       label: "Unit",               synonyms: ["birim", "unit", "uom", "الوحدة"] },
  ],
  supplier: [
    { key: "supplier.name",      label: "Supplier name",      synonyms: ["tedarikçi", "supplier", "vendor", "satıcı", "المورّد"] },
    { key: "supplier.taxId",     label: "Supplier tax ID",    synonyms: ["vkn", "vergi no", "tax id", "الرقم الضريبي"] },
    { key: "supplier.email",     label: "Email",              synonyms: ["email", "e-posta", "البريد"] },
    { key: "supplier.phone",     label: "Phone",              synonyms: ["telefon", "phone", "الهاتف"] },
  ],
};

const ALL_FIELDS = Object.values(FINSUITE_FIELDS).flat();

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[_/\-.,()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return normalize(s).split(/\s+/).filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni === 0 ? 0 : inter / uni;
}

// Score a single source header against a candidate field.
function scoreField(sourceHeader, field) {
  const sTokens = tokens(sourceHeader);
  let best = 0;
  for (const syn of [...field.synonyms, field.label, field.key.split(".").pop()]) {
    const synTokens = tokens(syn);
    const exact = normalize(sourceHeader) === normalize(syn) ? 1 : 0;
    const j = jaccard(sTokens, synTokens);
    const sub = synTokens.every((t) => sTokens.includes(t)) ? 0.7 : 0;
    const score = Math.max(exact, j, sub);
    if (score > best) best = score;
  }
  return best;
}

// Suggest the best FinSuite field for a source header. Returns {key, label, confidence}.
export function suggestField(sourceHeader, scope = null) {
  const candidates = scope ? FINSUITE_FIELDS[scope] || ALL_FIELDS : ALL_FIELDS;
  let best = { key: null, label: null, confidence: 0 };
  for (const f of candidates) {
    const score = scoreField(sourceHeader, f);
    if (score > best.confidence) best = { key: f.key, label: f.label, confidence: score };
  }
  return best;
}

// Bulk: build mappings for a list of headers.
export function buildMappings(headers, scope = null) {
  return headers.map((h) => {
    const s = suggestField(h, scope);
    return {
      sourceHeader: h,
      finsuiteKey: s.key,
      finsuiteLabel: s.label,
      confidence: s.confidence,
      level: s.confidence >= 0.7 ? "high" : s.confidence >= 0.4 ? "medium" : "low",
      include: s.confidence >= 0.4,
    };
  });
}

export function flatFieldList(scope = null) {
  return scope ? FINSUITE_FIELDS[scope] || [] : ALL_FIELDS;
}
