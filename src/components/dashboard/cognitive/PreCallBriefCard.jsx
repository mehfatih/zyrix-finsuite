// ================================================================
// PreCallBriefCard — DNA + talking points + context for next call
// ================================================================
import React from "react";
import { getAIPalette, getCustomerPalette, getMoneyPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency, fmtTime } from "../../../pages/dashboard/cognitive/cognitiveApi";

export default function PreCallBriefCard({ brief, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();

  if (!brief) return null;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #0F172A 0%, ${ai.dark} 100%)`,
        borderRadius: 22,
        padding: 24,
        color: "#fff",
        boxShadow: `0 16px 48px ${ai.base}50`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
            {t("coach.upcoming")}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
            {brief.customerName}
          </div>
          <div style={{ fontSize: 12, color: ai.chart, marginTop: 2 }}>
            {t("coach.scheduled")}: {fmtTime(brief.scheduledAt, lang)}
          </div>
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            boxShadow: `0 4px 12px ${ai.base}50`,
          }}
        >
          {t(`dna.personality.${brief.personality}`) || brief.personality}
        </div>
      </div>

      {/* DNA + style */}
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {t("coach.dnaSummary")}
        </div>
        <div style={{ fontSize: 13, color: "#CBD5E1", fontStyle: "italic" }}>
          <strong style={{ color: "#fff" }}>{t("coach.style")}:</strong> {t(`coach.${brief.style}`) || brief.style}
        </div>
      </div>

      {/* Talking points */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          🎯 {t("coach.talkingPoints")}
        </div>
        <ol style={{ paddingInlineStart: 18, margin: 0, color: "#CBD5E1", fontSize: 13, lineHeight: 1.8 }}>
          {brief.talkingPoints.map((tp, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{tp}</li>
          ))}
        </ol>
      </div>

      {/* Context */}
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          {t("coach.context")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <Field label={t("coach.context.lastInvoice")} value={brief.context.lastInvoice ? fmtCurrency(brief.context.lastInvoice) : "—"} palette={money} />
          <Field label={t("coach.context.ltv")} value={fmtCurrency(brief.context.ltv)} palette={success} />
          <Field
            label={t("coach.context.churn")}
            value={`${brief.context.churnRisk}%`}
            palette={brief.context.churnRisk > 50 ? { base: "#F43F5E", chart: "#FB7185" } : customer}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, palette }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: palette.chart || palette.base, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
