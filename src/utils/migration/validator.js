// ================================================================
// Phase 13 — Pre-import validator.
// Walks parsed rows, applies type checks and referential rules,
// returns errors + warnings keyed by row index for the validation UI.
// ================================================================

const RX = {
  email:    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneTr:  /^(\+?90|0)?\s*[2-9]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}$/,
  vkn:      /^\d{10}$/,
  tckn:     /^\d{11}$/,
  iso8601:  /^\d{4}-\d{2}-\d{2}/,
  trDate:   /^\d{2}[./]\d{2}[./]\d{4}/,
  number:   /^-?\d+([.,]\d+)?$/,
  currency: /^(TRY|USD|EUR|SAR|AED|GBP)$/,
};

const VAT_RATES = [0, 1, 8, 10, 18, 20];

function asNumber(v) {
  if (v == null || v === "") return null;
  const cleaned = String(v).replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function isDate(v) {
  if (!v) return false;
  if (RX.iso8601.test(String(v))) return true;
  if (RX.trDate.test(String(v))) return true;
  return !Number.isNaN(new Date(v).getTime());
}

// Apply rules per FinSuite field key.
const RULES = {
  "customer.email":      { type: "email",    required: false },
  "customer.phone":      { type: "phone",    required: false },
  "customer.taxId":      { type: "taxId",    required: false },
  "customer.name":       { type: "string",   required: true,  minLength: 2 },
  "invoice.number":      { type: "string",   required: true },
  "invoice.date":        { type: "date",     required: true },
  "invoice.dueDate":     { type: "date",     required: false },
  "invoice.subtotal":    { type: "number",   required: true,  min: 0 },
  "invoice.vatRate":     { type: "number",   required: false, allowed: VAT_RATES },
  "invoice.vatAmount":   { type: "number",   required: false, min: 0 },
  "invoice.total":       { type: "number",   required: true,  min: 0 },
  "invoice.currency":    { type: "currency", required: false },
  "product.name":        { type: "string",   required: true,  minLength: 1 },
  "product.price":       { type: "number",   required: true,  min: 0 },
  "product.stock":       { type: "number",   required: false },
  "supplier.name":       { type: "string",   required: true,  minLength: 2 },
};

function validateValue(value, rule) {
  if (value == null || value === "") {
    if (rule.required) return { kind: "error", code: "required" };
    return null;
  }
  switch (rule.type) {
    case "email":
      if (!RX.email.test(String(value))) return { kind: "error", code: "invalid_email" };
      break;
    case "phone":
      if (!RX.phoneTr.test(String(value))) return { kind: "warning", code: "invalid_phone" };
      break;
    case "taxId": {
      const s = String(value).replace(/\s/g, "");
      if (!RX.vkn.test(s) && !RX.tckn.test(s)) return { kind: "error", code: "invalid_tax_id" };
      break;
    }
    case "date":
      if (!isDate(value)) return { kind: "error", code: "invalid_date" };
      break;
    case "number": {
      const n = asNumber(value);
      if (n == null) return { kind: "error", code: "invalid_number" };
      if (rule.min != null && n < rule.min) return { kind: "error", code: "below_min" };
      if (rule.allowed && !rule.allowed.includes(Math.round(n))) return { kind: "warning", code: "unusual_value" };
      break;
    }
    case "currency":
      if (!RX.currency.test(String(value).toUpperCase())) return { kind: "warning", code: "unknown_currency" };
      break;
    case "string":
      if (rule.minLength && String(value).trim().length < rule.minLength) return { kind: "error", code: "too_short" };
      break;
  }
  return null;
}

// Public: validate a 2D record array given the field mappings.
export function validate({ headers = [], rows = [], mappings = [] }) {
  const issues = [];
  let errorCount = 0;
  let warningCount = 0;
  const seen = new Map(); // duplicate detection per (key:value)

  rows.forEach((row, rowIndex) => {
    headers.forEach((h, colIdx) => {
      const map = mappings.find((m) => m.sourceHeader === h);
      if (!map || !map.finsuiteKey || !map.include) return;
      const rule = RULES[map.finsuiteKey];
      if (!rule) return;
      const issue = validateValue(row[colIdx], rule);
      if (issue) {
        issues.push({ rowIndex: rowIndex + 1, column: h, finsuiteKey: map.finsuiteKey, ...issue });
        if (issue.kind === "error") errorCount++;
        else warningCount++;
      }
      // duplicate check on email + tax id
      if ((map.finsuiteKey === "customer.email" || map.finsuiteKey === "customer.taxId") && row[colIdx]) {
        const dKey = `${map.finsuiteKey}:${String(row[colIdx]).toLowerCase().trim()}`;
        if (seen.has(dKey)) {
          issues.push({ rowIndex: rowIndex + 1, column: h, finsuiteKey: map.finsuiteKey, kind: "warning", code: "duplicate" });
          warningCount++;
        } else {
          seen.set(dKey, rowIndex);
        }
      }
    });
  });

  // Cross-row sanity: subtotal + vatAmount ≈ total (10% tolerance)
  rows.forEach((row, rowIndex) => {
    const find = (key) => {
      const map = mappings.find((m) => m.finsuiteKey === key);
      if (!map) return null;
      const colIdx = headers.indexOf(map.sourceHeader);
      return colIdx >= 0 ? asNumber(row[colIdx]) : null;
    };
    const sub = find("invoice.subtotal");
    const vat = find("invoice.vatAmount");
    const tot = find("invoice.total");
    if (sub != null && vat != null && tot != null) {
      const expected = sub + vat;
      const diff = Math.abs(expected - tot);
      if (diff > Math.max(0.5, expected * 0.01)) {
        issues.push({ rowIndex: rowIndex + 1, column: "—", finsuiteKey: "invoice.total", kind: "warning", code: "total_mismatch", detail: `expected ~${expected.toFixed(2)}, got ${tot.toFixed(2)}` });
        warningCount++;
      }
    }
  });

  return {
    issues,
    errorCount,
    warningCount,
    canImport: errorCount === 0,
    rowCount: rows.length,
  };
}

export const ERROR_LABELS = {
  TR: {
    required:        "Zorunlu alan boş",
    invalid_email:   "Geçersiz e-posta",
    invalid_phone:   "Geçersiz telefon",
    invalid_tax_id:  "Geçersiz VKN/TCKN",
    invalid_date:    "Geçersiz tarih",
    invalid_number:  "Geçersiz sayı",
    below_min:       "Minimum değerin altında",
    unusual_value:   "Olağandışı değer",
    unknown_currency:"Tanınmayan para birimi",
    too_short:       "Çok kısa",
    duplicate:       "Yinelenen kayıt",
    total_mismatch:  "Toplam tutar tutarsız",
  },
  EN: {
    required:        "Required field empty",
    invalid_email:   "Invalid email",
    invalid_phone:   "Invalid phone",
    invalid_tax_id:  "Invalid Tax ID",
    invalid_date:    "Invalid date",
    invalid_number:  "Invalid number",
    below_min:       "Below minimum",
    unusual_value:   "Unusual value",
    unknown_currency:"Unknown currency",
    too_short:       "Too short",
    duplicate:       "Duplicate record",
    total_mismatch:  "Total mismatch with subtotal+VAT",
  },
  AR: {
    required:        "حقل إلزامي فارغ",
    invalid_email:   "بريد غير صالح",
    invalid_phone:   "هاتف غير صالح",
    invalid_tax_id:  "رقم ضريبي غير صالح",
    invalid_date:    "تاريخ غير صالح",
    invalid_number:  "رقم غير صالح",
    below_min:       "أقل من الحد الأدنى",
    unusual_value:   "قيمة غير اعتيادية",
    unknown_currency:"عملة غير معروفة",
    too_short:       "قصير جداً",
    duplicate:       "سجل مكرر",
    total_mismatch:  "عدم تطابق الإجمالي",
  },
};
