// ================================================================
// /trust/compliance — KVKK / GDPR / SOC2 / ISO / PCI badges + body
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE, COMPLIANCE_BADGES } from "../../utils/trustPalette";
import { fmtDate } from "../../utils/format";

const CERTS = [
  { id: "kvkk",     icon: "🇹🇷", lastAudit: "2025-11-08", nextAudit: "2026-11-08" },
  { id: "gdpr",     icon: "🇪🇺", lastAudit: "2025-09-15", nextAudit: "2026-09-15" },
  { id: "soc2",     icon: "📋", lastAudit: null,         nextAudit: "2026-09-30" },
  { id: "iso27001", icon: "🏅", lastAudit: null,         nextAudit: "2026-12-15" },
  { id: "pci",      icon: "💳", lastAudit: "2025-12-22", nextAudit: "2026-12-22" },
];

export default function ComplianceCertificationsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${p.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link to="/trust" style={{ fontSize: 12, color: p.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 18 }}>
          ← Trust Center
        </Link>

        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0F172A", margin: "0 0 10px" }}>{t("compliance.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{t("trust.compliance.title")}</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {CERTS.map((c) => {
            const badge = COMPLIANCE_BADGES[c.id];
            return (
              <article key={c.id} style={{ background: "#fff", border: `1.5px solid ${badge.base}40`, borderRadius: 16, padding: 20, boxShadow: `0 4px 14px ${badge.base}15` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${badge.base}, ${badge.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 22 }}>
                    {c.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: badge.dark, margin: "0 0 2px" }}>{badge.label}</h2>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>{t(`trust.compliance.${c.id}`)}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#0F172A", lineHeight: 1.6, margin: "0 0 14px" }}>{t(`compliance.${c.id}.body`)}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#F8FAFC", padding: 8, borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("compliance.lastAudit")}</div>
                    <div style={{ fontSize: 11, color: "#0F172A", fontWeight: 700 }}>{c.lastAudit ? fmtDate(c.lastAudit, { lang }) : "—"}</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: 8, borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("compliance.nextAudit")}</div>
                    <div style={{ fontSize: 11, color: "#0F172A", fontWeight: 700 }}>{c.nextAudit ? fmtDate(c.nextAudit, { lang }) : "—"}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
