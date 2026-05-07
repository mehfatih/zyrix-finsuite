// ================================================================
// /support/contact — multi-channel contact options
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getCustomerPalette, getSuccessPalette } from "../../utils/dashboardPalette";

const CHANNELS = [
  { id: "chat",     icon: "💬", palette: "brand"    },
  { id: "email",    icon: "📨", palette: "reports"  },
  { id: "phone",    icon: "📞", palette: "customer" },
  { id: "whatsapp", icon: "💚", palette: "success"  },
];

export default function ContactSupportPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const palettes = { brand, reports, customer, success: { bg: "#DCFCE7", base: "#25D366", dark: "#0D9669" } };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link to="/support" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 16 }}>
          ← {t("title")}
        </Link>

        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>{t("contact.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{t("contact.subtitle")}</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {CHANNELS.map((c) => {
            const p = palettes[c.palette];
            return (
              <article key={c.id} style={{ background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 12 }}>
                  {c.icon}
                </div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t(`contact.channel.${c.id}`)}</h2>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.55 }}>{t(`contact.channel.${c.id}.desc`)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
