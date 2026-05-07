// ================================================================
// /migration/concierge — paid migration help tiers
// ================================================================
import React, { useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getMarketPalette, getMoneyPalette, getCustomerPalette, getSuccessPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";

const TIERS = [
  { id: "standard",    palette: "customer", featured: false },
  { id: "premium",     palette: "money",    featured: true  },
  { id: "enterprise",  palette: "market",   featured: false },
];

export default function MigrationConciergePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("migration");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const palettes = { brand, market, money, customer };

  const [chosen, setChosen] = useState(null);
  const [form, setForm] = useState({ system: "", size: "", urgency: "" });
  const [done, setDone] = useState(false);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("concierge.title")} subtitle={t("concierge.subtitle")} icon="🤝" palette={brand} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 22 }}>
        {TIERS.map((tier) => {
          const p = palettes[tier.palette];
          const isChosen = chosen === tier.id;
          return (
            <div key={tier.id} style={{
              background: tier.featured ? `linear-gradient(135deg, ${p.bg}, #fff)` : "#fff",
              border: `2px solid ${isChosen || tier.featured ? p.base : "#E2E8F0"}`,
              borderRadius: 16,
              padding: 22,
              position: "relative",
              boxShadow: tier.featured ? `0 10px 28px ${p.base}25` : "0 2px 8px rgba(15,23,42,0.04)",
            }}>
              {tier.featured && (
                <span style={{ position: "absolute", top: -10, insetInlineStart: 14, background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", boxShadow: `0 4px 12px ${p.base}40` }}>
                  Most popular
                </span>
              )}
              <h2 style={{ fontSize: 18, fontWeight: 900, color: p.dark, margin: "0 0 4px" }}>{t(`concierge.tier.${tier.id}`)}</h2>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "6px 0 12px", fontFamily: "monospace" }}>{t(`concierge.tier.${tier.id}.price`)}</div>
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, marginBottom: 16 }}>{t(`concierge.tier.${tier.id}.desc`)}</p>
              <button type="button" onClick={() => setChosen(tier.id)} style={{
                width: "100%",
                background: isChosen ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
                color: isChosen ? "#fff" : p.dark,
                border: `1.5px solid ${p.base}40`, padding: "10px 16px", borderRadius: 10,
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                boxShadow: isChosen ? `0 6px 14px ${p.base}40` : "none",
              }}>
                {isChosen ? "✓ Selected" : t("concierge.book")}
              </button>
            </div>
          );
        })}
      </div>

      {chosen && !done && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, maxWidth: 640, margin: "0 auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>{t("concierge.questions.title")}</h3>
          <Field label={t("concierge.questions.system")}>
            <input type="text" value={form.system} onChange={(e) => setForm({ ...form, system: e.target.value })} placeholder="Logo, Mikro, Excel…" style={inp} />
          </Field>
          <Field label={t("concierge.questions.size")}>
            <input type="text" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="~5,000 invoices, 800 customers" style={inp} />
          </Field>
          <Field label={t("concierge.questions.urgency")}>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} style={inp}>
              <option value="">—</option>
              <option value="low">This month</option>
              <option value="med">This week</option>
              <option value="high">ASAP</option>
            </select>
          </Field>
          <button type="button" onClick={() => setDone(true)} style={{ marginTop: 10, width: "100%", background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            📅 {t("concierge.book")}
          </button>
        </div>
      )}

      {done && (
        <div role="status" style={{ background: success.bg, color: success.dark, border: `1.5px solid ${success.base}40`, borderRadius: 14, padding: 22, textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Booking submitted. Our team will contact you within 24h to schedule your call.</div>
        </div>
      )}
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
