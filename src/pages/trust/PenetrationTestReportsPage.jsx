// ================================================================
// /trust/pentest — Latest pentest summaries + bug bounty
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { fmtDate } from "../../utils/format";
import { getSuccessPalette, getAlertPalette, getWarningPalette, getCustomerPalette } from "../../utils/dashboardPalette";

const REPORTS = [
  { id: 1, year: "2026 H1", date: "2026-02-14", firm: "Pentera Security",  scope: "API + Frontend + Mobile", critical: 0, high: 0, medium: 2, low: 4, summary: "All medium-severity findings closed within 30 days. No exploitable critical or high issues." },
  { id: 2, year: "2025 H2", date: "2025-08-22", firm: "Astra Security",    scope: "Full-stack + Cloud infra", critical: 0, high: 1, medium: 5, low: 8, summary: "1 high (auth flow edge case) closed within 14 days. All findings remediated." },
  { id: 3, year: "2025 H1", date: "2025-03-10", firm: "BSI / Trustwave",   scope: "Pre-launch security review", critical: 0, high: 2, medium: 7, low: 12, summary: "Pre-launch hardening pass. All issues resolved before public release." },
];

export default function PenetrationTestReportsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${p.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link to="/trust" style={{ fontSize: 12, color: p.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 18 }}>
          ← Trust Center
        </Link>

        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0F172A", margin: "0 0 10px" }}>{t("pentest.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{t("pentest.subtitle")}</p>
        </header>

        <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
          {REPORTS.map((r) => (
            <article key={r.id} style={{ background: "#fff", border: `1px solid ${p.base}30`, borderRadius: 14, padding: 20, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", marginBottom: 12 }} className="ptr-head">
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 22 }}>
                  📋
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: p.dark, margin: "0 0 2px" }}>{r.year}</h3>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>{r.firm} · {fmtDate(r.date, { lang })} · {r.scope}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: success.bg, color: success.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  All resolved
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                <Stat label={t("pentest.findings.critical")} value={r.critical} palette={alert} />
                <Stat label={t("pentest.findings.high")}     value={r.high}     palette={warn} />
                <Stat label={t("pentest.findings.medium")}   value={r.medium}   palette={customer} />
                <Stat label={t("pentest.findings.low")}      value={r.low}      palette={success} />
              </div>

              <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.55, margin: 0 }}>
                <strong style={{ color: "#0F172A" }}>{t("pentest.summary")}:</strong> {r.summary}
              </p>
            </article>
          ))}
        </div>

        <section style={{ background: `linear-gradient(135deg, ${p.bg}, #fff)`, border: `1.5px solid ${p.base}40`, borderRadius: 16, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🐛</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: p.dark, margin: "0 0 8px" }}>{t("trust.pentest.bounty")}</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 14px" }}>Found a security issue? We pay bounties for responsible disclosure.</p>
          <a href="mailto:security@zyrix.co" style={{ background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", textDecoration: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, display: "inline-block", boxShadow: `0 6px 16px ${p.base}40` }}>
            📨 security@zyrix.co
          </a>
        </section>

        <style>{`@media (max-width: 540px) { .ptr-head { grid-template-columns: 1fr !important; text-align: start; } }`}</style>
      </div>
    </div>
  );
}

function Stat({ label, value, palette }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, borderRadius: 10, padding: 10, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: palette.dark, fontFamily: "monospace", marginTop: 2 }}>{value}</div>
    </div>
  );
}
