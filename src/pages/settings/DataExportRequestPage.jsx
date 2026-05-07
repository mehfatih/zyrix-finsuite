// ================================================================
// /settings/data-export — KVKK / GDPR right-to-export request
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE, COMPLIANCE_BADGES } from "../../utils/trustPalette";
import { getSuccessPalette } from "../../utils/dashboardPalette";
import { fmtDateTime } from "../../utils/format";
import PageHeader from "../../components/dashboard/PageHeader";
import { requestDataExport, listDataExports } from "./securityApi";

const REASONS = ["kvkk", "gdpr", "backup", "migration"];

export default function DataExportRequestPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();

  const [reason, setReason] = useState("kvkk");
  const [history, setHistory] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { listDataExports().then(setHistory); }, []);

  const submit = async () => {
    await requestDataExport(reason);
    setSubmitted(true);
    listDataExports().then(setHistory);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const kvkkBadge = COMPLIANCE_BADGES.kvkk;
  const gdprBadge = COMPLIANCE_BADGES.gdpr;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("dsr.title")} subtitle={t("dsr.subtitle")} icon="📥" palette={p} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }} className="dsr-grid">
        <div style={{ background: kvkkBadge.bg, border: `1.5px solid ${kvkkBadge.base}40`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🇹🇷</span>
            <strong style={{ fontSize: 14, color: kvkkBadge.dark }}>{kvkkBadge.label}</strong>
          </div>
          <p style={{ fontSize: 11, color: "#475569", margin: 0, lineHeight: 1.55 }}>{t("dsr.law.tr")}</p>
        </div>
        <div style={{ background: gdprBadge.bg, border: `1.5px solid ${gdprBadge.base}40`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🇪🇺</span>
            <strong style={{ fontSize: 14, color: gdprBadge.dark }}>{gdprBadge.label}</strong>
          </div>
          <p style={{ fontSize: 11, color: "#475569", margin: 0, lineHeight: 1.55 }}>{t("dsr.law.eu")}</p>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 16, padding: 22, marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          {t("dsr.reason")}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {REASONS.map((r) => {
            const active = reason === r;
            return (
              <button key={r} type="button" onClick={() => setReason(r)} style={{
                background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
                color: active ? "#fff" : p.dark,
                border: `1px solid ${p.base}30`,
                padding: "8px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer",
              }}>
                {t(`dsr.reason.${r}`)}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={submit} style={{ width: "100%", background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 22px ${p.base}40` }}>
          📨 {t("dsr.submit")}
        </button>

        {submitted && (
          <div role="status" style={{ marginTop: 12, padding: 12, background: success.bg, color: success.dark, borderRadius: 10, fontSize: 12, fontWeight: 800, textAlign: "center" }}>
            ✓ {t("dsr.eta")}
          </div>
        )}

        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 12, textAlign: "center" }}>{t("dsr.intro") || t("dsr.eta")}</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 12px" }}>{t("dsr.history.title")}</h3>
        {history.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>{t("dsr.history.empty")}</div>
        ) : (
          history.map((req) => (
            <div key={req.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>{fmtDateTime(req.requestedAt, { lang })}</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{t(`dsr.reason.${req.reason || "kvkk"}`)}</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: req.status === "completed" ? success.bg : p.bg, color: req.status === "completed" ? success.dark : p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t(`dsr.status.${req.status || "pending"}`)}
              </span>
            </div>
          ))
        )}
      </div>

      <style>{`@media (max-width: 720px) { .dsr-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
