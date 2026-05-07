// ================================================================
// /trust (and /guvenlik) — Public Trust Center hero page
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { fmtDate } from "../../utils/format";
import TrustSignalBanner from "../../components/trust/TrustSignalBanner";
import ComplianceBadgeRow from "../../components/trust/ComplianceBadgeRow";
import EncryptionStatusCard from "../../components/trust/EncryptionStatusCard";
import DataResidencyMap from "../../components/trust/DataResidencyMap";

const LAST_INCIDENT = "2025-08-12";
const LAST_PENTEST = "2026-02-14";

export default function TrustCenterPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${p.bg}, #F8FAFC 60%)`, paddingBottom: 60 }}>
      {/* Hero */}
      <header style={{ padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: p.dark, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
          ZYRIX FINSUITE
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: "#0F172A", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          {t("trust.title")}
        </h1>
        <p style={{ fontSize: 17, color: p.dark, fontWeight: 700, margin: "0 0 28px" }}>
          {t("trust.tagline")}
        </p>
        <div style={{ marginBottom: 24 }}>
          <TrustSignalBanner t={t} />
        </div>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "10px 18px", background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 999, fontSize: 12, fontWeight: 800, color: p.dark, boxShadow: `0 4px 12px ${p.base}15` }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
          {t("trust.status.allOps")} · {t("trust.status.lastIncident", { date: fmtDate(LAST_INCIDENT, { lang }) })}
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "grid", gap: 24 }}>
        {/* Compliance row */}
        <section aria-labelledby="comp-heading">
          <h2 id="comp-heading" style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px", textAlign: "center" }}>
            {t("trust.compliance.title")}
          </h2>
          <ComplianceBadgeRow items={["kvkk", "gdpr", "soc2", "iso27001", "pci"]} t={t} lang={lang} />
        </section>

        {/* Encryption */}
        <section>
          <EncryptionStatusCard t={t} />
        </section>

        {/* Residency */}
        <section style={{ background: "#fff", borderRadius: 16, padding: 24, border: `1px solid ${p.base}20` }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: p.dark, margin: "0 0 14px" }}>{t("trust.residency.title")}</h2>
          <DataResidencyMap current="tr" onSelect={() => {}} t={t} />
        </section>

        {/* DR + Access */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="tc-bottom-grid">
          <div style={{ background: "#fff", border: `1px solid ${p.base}30`, borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: p.dark, margin: "0 0 12px" }}>{t("trust.dr.title")}</h3>
            <Row k={t("trust.dr.rto")}       v="4 hours" />
            <Row k={t("trust.dr.rpo")}       v="1 hour" />
            <Row k={t("trust.dr.backup")}    v="15-min incremental, 6h full" />
            <Row k={t("trust.dr.retention")} v="90 days" />
            <Row k={t("trust.dr.test")}      v="Quarterly" />
            <Row k={t("trust.pentest.last")} v={fmtDate(LAST_PENTEST, { lang })} />
          </div>
          <div style={{ background: "#fff", border: `1px solid ${p.base}30`, borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: p.dark, margin: "0 0 12px" }}>{t("trust.access.title")}</h3>
            <p style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.7, margin: 0 }}>{t("trust.access.zero")}</p>
            <hr style={{ border: 0, borderTop: "1px solid #F1F5F9", margin: "18px 0" }} />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: p.dark, margin: "0 0 8px" }}>{t("trust.dsr.title")}</h3>
            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, margin: 0 }}>{t("trust.dsr.body")}</p>
          </div>
        </section>

        {/* Footer CTAs */}
        <section style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", padding: "12px 0" }}>
          <Link to="/trust/whitepaper" style={{ background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", textDecoration: "none", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800, boxShadow: `0 6px 16px ${p.base}40` }}>
            📄 {t("trust.cta.whitepaper")}
          </Link>
          <a href="mailto:security@zyrix.co" style={{ background: "#fff", color: p.dark, textDecoration: "none", border: `1.5px solid ${p.base}40`, padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800 }}>
            📨 security@zyrix.co
          </a>
        </section>
      </main>

      <style>{`@media (max-width: 720px) { .tc-bottom-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #F1F5F9", fontSize: 12 }}>
      <span style={{ color: "#64748B", fontWeight: 700 }}>{k}</span>
      <strong style={{ color: "#0F172A" }}>{v}</strong>
    </div>
  );
}
