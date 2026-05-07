// ================================================================
// InsuranceComparator — risk-level recommendation card with quote CTA
// ================================================================
import React from "react";
import { getAlertPalette, getWarningPalette, getCustomerPalette, getSuccessPalette, getPaletteById } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/ecosystem/ecosystemApi";

const PRIORITY_ICON = { high: "🚨", medium: "⚠️", low: "🛡" };

export default function InsuranceComparator({ recommendation, onQuote, onCompare, onSkip, t = (s) => s }) {
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const palette =
    recommendation.priority === "high" ? alert :
    recommendation.priority === "medium" ? warn : customer;

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${palette.base}40`,
        borderRadius: 14, padding: 16, marginBottom: 12,
        boxShadow: `0 4px 14px ${palette.base}15`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, insetInlineStart: 0, width: 4, height: "100%", background: `linear-gradient(180deg, ${palette.base}, ${palette.dark})` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap", marginInlineStart: 4 }}>
        <span style={{ fontSize: 24 }}>{PRIORITY_ICON[recommendation.priority] || "🛡"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{t(`insurance.product.${recommendation.product}`)}</div>
          <div style={{ fontSize: 10, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
            {t(`insurance.priority.${recommendation.priority}`)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10, marginInlineStart: 4 }}>
        💡 {recommendation.reason}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }} className="ic-grid">
        <Tile label={t("insurance.coverage")} value={fmtCurrency(recommendation.coverage)} palette={customer} />
        <Tile label={t("insurance.bestPrice")} value={recommendation.bestProvider} palette={success} />
        <Tile label={t("insurance.monthlyPremium")} value={`${fmtCurrency(recommendation.monthlyPremium)}/mo`} palette={palette} highlight />
      </div>

      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, marginBottom: 12, marginInlineStart: 4 }}>
        ✨ {t("insurance.compared", { n: recommendation.providersCompared })}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" onClick={() => onSkip?.(recommendation)} style={btnGhost}>{t("insurance.action.skip")}</button>
        <button type="button" onClick={() => onCompare?.(recommendation)} style={btnGhost}>{t("insurance.action.compareAll")}</button>
        <button type="button" onClick={() => onQuote?.(recommendation)} style={{ background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${palette.base}40` }}>
          ⚡ {t("insurance.action.getQuote")}
        </button>
      </div>

      <style>{`@media (max-width: 540px) { .ic-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };

function Tile({ label, value, palette, highlight }) {
  return (
    <div style={{ background: highlight ? `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)` : palette.bg, border: `1px solid ${palette.base}30`, padding: 8, borderRadius: 10 }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: highlight ? 14 : 12, fontWeight: 800, color: palette.dark, marginTop: 2 }}>{value}</div>
    </div>
  );
}
