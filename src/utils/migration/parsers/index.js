// ================================================================
// Phase 13 — Source system parsers + auto-detect.
// Each parser is the same shape; we pick by file extension or user choice.
// Logo / Mikro / Paraşüt / QuickBooks / Xero / Bizim Hesap all use a
// CSV/Excel export under the hood, so they share the smart CSV parser
// with system-specific header hints.
// ================================================================
import { csvParser } from "./csvParser";
import { excelParser } from "./excelParser";

const SYSTEM_HINTS = {
  logo:        { headers: ["Cari Hesap Kodu", "Cari Hesap Ünvanı", "Belge No", "Tarih"], region: "TR" },
  mikro:       { headers: ["MUS_KODU", "MUS_UNVAN", "FATURA_NO", "TARIH"], region: "TR" },
  parasut:     { headers: ["Müşteri", "Fatura No", "Toplam", "Vade Tarihi"], region: "TR" },
  bizim:       { headers: ["Ad Soyad", "Belge", "Tutar"], region: "TR" },
  quickbooks:  { headers: ["Customer", "Invoice No", "Amount", "Due Date"], region: "INTL" },
  xero:        { headers: ["Contact Name", "Invoice Number", "Total"], region: "INTL" },
  excel:       { headers: [], region: null },
  csv:         { headers: [], region: null },
};

export const SOURCE_SYSTEMS = [
  { id: "logo",       name: "Logo İşbaşı",      logo: "🟢", description: "Logo Yazılım — TR muhasebe lideri",       badge: "popular"     },
  { id: "mikro",      name: "Mikro Yazılım",    logo: "🔵", description: "Mikro Fly + ERP CSV/Excel exportları",     badge: "popular"     },
  { id: "parasut",    name: "Paraşüt",          logo: "🟣", description: "Paraşüt CSV / API export",                 badge: "popular"     },
  { id: "bizim",      name: "Bizim Hesap",      logo: "🟠", description: "Bizim Hesap muhasebe yazılımı",            badge: null          },
  { id: "quickbooks", name: "QuickBooks",       logo: "🇺🇸", description: "Intuit QuickBooks export",                 badge: null          },
  { id: "xero",       name: "Xero",             logo: "🟦", description: "Xero accounting CSV export",               badge: null          },
  { id: "excel",      name: "Generic Excel",    logo: "📗", description: ".xlsx / .xls — auto column detection",     badge: "recommended" },
  { id: "csv",        name: "Generic CSV",      logo: "📄", description: ".csv with auto-delimiter detection",       badge: "recommended" },
];

export function getSystemHints(systemId) {
  return SYSTEM_HINTS[systemId] || SYSTEM_HINTS.excel;
}

export function detectSystem(file) {
  if (!file) return "csv";
  if (/\.(xlsx|xls)$/i.test(file.name)) return "excel";
  return "csv";
}

export async function parseFile(file, systemId) {
  const text = await readAsText(file);
  if (systemId === "excel" || (systemId == null && excelParser.detect(file))) {
    return excelParser.parse(text);
  }
  return csvParser.parse(text);
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
