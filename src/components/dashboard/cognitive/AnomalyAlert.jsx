// ================================================================
// AnomalyAlert — fraud detection card with severity stripe + actions
// ================================================================
import React from "react";
import { getAlertPalette, getWarningPalette, getCustomerPalette, getReportsPalette, getMoneyPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/cognitive/cognitiveApi";

export default function AnomalyAlert({ anomaly, onReview, onDismiss, onAction, t = (s) => s }) {
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const palette =
    anomaly.severity === "high"   ? alert :
    anomaly.severity === "medium" ? warn  : customer;

  const actionLabel =
    anomaly.kind === "duplicate" ? t("fraud.action.delete") :
    anomaly.kind === "voidReissue" ? t("fraud.action.bothValid") :
    t("fraud.action.review");

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${palette.base}40`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        boxShadow: `0 4px 16px ${palette.base}15`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, insetInlineStart: 0, width: 4, height: "100%", background: `linear-gradient(180deg, ${palette.base}, ${palette.dark})` }} />
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", marginBottom: 10 }} className="anom-grid">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
            color: palette.dark,
            display: "grid",
            placeItems: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {anomaly.severity === "high" ? "🚨" : anomaly.severity === "medium" ? "⚠️" : "🔍"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{anomaly.title}</span>
            <span style={{ background: palette.base, color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t(`fraud.severity.${anomaly.severity}`)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>{anomaly.subtitle}</div>
        </div>
        {anomaly.amount > 0 && (
          <div style={{ textAlign: "end" }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>{fmtCurrency(anomaly.amount)}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onDismiss && <button type="button" onClick={() => onDismiss(anomaly)} style={btn(palette, "ghost")}>{t("fraud.action.dismiss")}</button>}
        {onReview &&  <button type="button" onClick={() => onReview(anomaly)}  style={btn(reports, "secondary")}>{t("fraud.action.review")}</button>}
        {onAction &&  <button type="button" onClick={() => onAction(anomaly)}  style={btn(palette, "primary")}>⚡ {actionLabel}</button>}
      </div>
      <style>{`@media (max-width: 540px) { .anom-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}30`,
    };
  }
  if (variant === "secondary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "8px 12px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    background: "transparent",
    color: "#64748B",
    border: "1px solid transparent",
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}
