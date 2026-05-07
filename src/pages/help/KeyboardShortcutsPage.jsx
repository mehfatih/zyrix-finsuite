// ================================================================
// /help/shortcuts — Searchable keyboard shortcut reference.
// ================================================================
import React, { useMemo, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getAIPalette, getMoneyPalette, getCustomerPalette } from "../../utils/dashboardPalette";

const SHORTCUTS = [
  { cat: "global",  keys: ["?"],          desc: { TR: "Bu kısayol listesini aç", EN: "Open this shortcut list", AR: "افتح قائمة الاختصارات" } },
  { cat: "global",  keys: ["/"],          desc: { TR: "Genel arama", EN: "Global search", AR: "بحث عام" } },
  { cat: "global",  keys: ["Esc"],        desc: { TR: "Modal/dialog kapat", EN: "Close modal/dialog", AR: "أغلق النافذة" } },
  { cat: "global",  keys: ["Ctrl", "K"],  desc: { TR: "Komut paleti", EN: "Command palette", AR: "لوحة الأوامر" } },

  { cat: "nav",     keys: ["G", "D"],     desc: { TR: "Dashboard'a git", EN: "Go to Dashboard", AR: "اذهب إلى اللوحة" } },
  { cat: "nav",     keys: ["G", "I"],     desc: { TR: "Faturalar", EN: "Invoices", AR: "الفواتير" } },
  { cat: "nav",     keys: ["G", "C"],     desc: { TR: "Müşteriler", EN: "Customers", AR: "العملاء" } },
  { cat: "nav",     keys: ["G", "B"],     desc: { TR: "Bankalar", EN: "Banks", AR: "البنوك" } },
  { cat: "nav",     keys: ["G", "T"],     desc: { TR: "Vergi", EN: "Tax", AR: "الضريبة" } },
  { cat: "nav",     keys: ["G", "S"],     desc: { TR: "Ayarlar", EN: "Settings", AR: "الإعدادات" } },

  { cat: "invoice", keys: ["N"],          desc: { TR: "Yeni fatura", EN: "New invoice", AR: "فاتورة جديدة" } },
  { cat: "invoice", keys: ["E"],          desc: { TR: "Faturayı düzenle", EN: "Edit invoice", AR: "عدّل الفاتورة" } },
  { cat: "invoice", keys: ["P"],          desc: { TR: "PDF indir", EN: "Download PDF", AR: "تنزيل PDF" } },
  { cat: "invoice", keys: ["D"],          desc: { TR: "Müsvettedeyi kaydet", EN: "Save as draft", AR: "احفظ كمسودة" } },
  { cat: "invoice", keys: ["Ctrl", "S"],  desc: { TR: "Kaydet", EN: "Save", AR: "حفظ" } },

  { cat: "ai",      keys: ["V"],          desc: { TR: "Sesli komut başlat", EN: "Start voice command", AR: "ابدأ الأمر الصوتي" } },
  { cat: "ai",      keys: ["?", "AI"],    desc: { TR: "AI sohbet bot'unu aç", EN: "Open AI chat bot", AR: "افتح بوت AI" } },
];

export default function KeyboardShortcutsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("help");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const reports = getReportsPalette();
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();

  const palettes = { global: brand, nav: customer, invoice: money, ai };

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SHORTCUTS;
    return SHORTCUTS.filter((s) =>
      (s.desc[lang] || s.desc.EN || "").toLowerCase().includes(term) ||
      s.keys.join(" ").toLowerCase().includes(term)
    );
  }, [q, lang]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, s) => {
      (acc[s.cat] = acc[s.cat] || []).push(s);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 0% 0%, ${brand.bg}, #F8FAFC 60%)`, padding: 24 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>{t("shortcuts.title")}</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{t("shortcuts.subtitle")}</p>
        </header>

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("shortcuts.search.placeholder")}
          aria-label={t("shortcuts.search.placeholder")}
          style={{ width: "100%", padding: "14px 16px", border: `1.5px solid ${brand.base}30`, borderRadius: 12, fontSize: 13, fontFamily: "inherit", marginBottom: 24, background: "#fff", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
        />

        {Object.entries(grouped).map(([cat, items]) => {
          const p = palettes[cat] || reports;
          return (
            <section key={cat} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${p.base}20`, boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
              <h2 style={{ fontSize: 12, fontWeight: 800, color: p.dark, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                {t(`shortcuts.cat.${cat}`)}
              </h2>
              {items.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{s.desc[lang] || s.desc.EN}</span>
                  <span style={{ display: "flex", gap: 4 }}>
                    {s.keys.map((k, j) => (
                      <kbd key={j} style={kbdStyle(p)}>{k}</kbd>
                    ))}
                  </span>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function kbdStyle(p) {
  return {
    background: p.bg,
    color: p.dark,
    border: `1px solid ${p.base}40`,
    borderBottomWidth: 2,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "ui-monospace, monospace",
    fontWeight: 800,
    minWidth: 28,
    textAlign: "center",
    display: "inline-block",
  };
}
