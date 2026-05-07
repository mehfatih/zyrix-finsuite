// ================================================================
// BoardMeetingPrep — weekly board brief layout (numbers + sections)
// ================================================================
import React from "react";
import { getReportsPalette, getMoneyPalette, getCustomerPalette, getAlertPalette, getSuccessPalette, getAIPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/ecosystem/ecosystemApi";

export default function BoardMeetingPrep({
  brief,
  onAction,
  t = (s) => s,
}) {
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const ai = getAIPalette();
  if (!brief) return null;

  return (
    <div>
      {/* Numbers strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }} className="bm-num-grid">
        <Tile label={t("cofounder.metric.revenue")}      value={fmtCurrency(brief.numbers.revenue)} delta={brief.numbers.revenueDelta} palette={money}    icon="💰" />
        <Tile label={t("cofounder.metric.profit")}       value={fmtCurrency(brief.numbers.profit)}  delta={brief.numbers.profitDelta}  palette={success} icon="📈" />
        <Tile label={t("cofounder.metric.newCustomers")} value={brief.numbers.newCustomers}         palette={customer} icon="👥" />
        <Tile label={t("cofounder.metric.churn")}        value={`${brief.numbers.churn}%`}          palette={alert}    icon="📉" />
      </div>

      {/* Observations */}
      <Section title={t("cofounder.brief.observations")}>
        {brief.observations.map((obs) => {
          const p = obs.kind === "risk" ? alert : obs.kind === "warning" ? { bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309" } : success;
          return (
            <div
              key={obs.id}
              style={{
                background: "#fff", border: `1.5px solid ${p.base}40`,
                borderRadius: 14, padding: 14, marginBottom: 10,
                boxShadow: `0 4px 12px ${p.base}15`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16 }}>{obs.kind === "risk" ? "⚠️" : obs.kind === "warning" ? "🟡" : "🚀"}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                  {obs.kind === "risk" && t("cofounder.observation.risk", { pct: obs.pct })}
                  {obs.kind === "opportunity" && t("cofounder.observation.opportunity", { segment: obs.segment, growth: obs.growth })}
                  {obs.kind === "warning" && t("cofounder.observation.margin", { from: obs.from, to: obs.to })}
                </span>
                <span style={{ marginInlineStart: "auto", fontSize: 9, fontWeight: 800, color: ai.dark, background: ai.bg, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {Math.round(obs.confidence * 100)}% {t("cofounder.confidence")}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                <strong>{t("cofounder.cause")}:</strong> {obs.cause}
              </div>
              <div style={{ fontSize: 12, color: p.dark, fontWeight: 700, background: p.bg, padding: "8px 12px", borderRadius: 10 }}>
                <strong>{t("cofounder.recommended")}:</strong> {obs.recommended}
              </div>
            </div>
          );
        })}
      </Section>

      {/* Decisions */}
      <Section title={t("cofounder.brief.decisions")}>
        {brief.decisions.map((d) => (
          <div key={d.id} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 12, marginBottom: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }} className="bm-dec-row">
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{d.title}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{d.impact}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => onAction?.(d, "discuss")} style={btn(reports, "secondary")}>{t("cofounder.action.discuss")}</button>
              {d.recommendation === "approve" && <button type="button" onClick={() => onAction?.(d, "approve")} style={btn(success, "primary")}>{t("cofounder.action.approve")}</button>}
              {d.recommendation === "decline" && <button type="button" onClick={() => onAction?.(d, "override")} style={btn(alert, "secondary")}>{t("cofounder.action.override")}</button>}
            </div>
          </div>
        ))}
      </Section>

      {/* Action items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="bm-actions-grid">
        <Section title={t("cofounder.brief.youAction")}>
          {brief.youActions.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: customer.bg, border: `1px solid ${customer.base}30`, borderRadius: 10, marginBottom: 6 }}>
              <input type="checkbox" />
              <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{a.text}</span>
            </div>
          ))}
        </Section>
        <Section title={t("cofounder.brief.aiAction")}>
          {brief.aiActions.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: ai.bg, border: `1px solid ${ai.base}30`, borderRadius: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 12, color: ai.dark, fontWeight: 700 }}>{a.text}</span>
            </div>
          ))}
        </Section>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .bm-num-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bm-dec-row { grid-template-columns: 1fr !important; }
          .bm-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Tile({ label, value, delta, palette, icon }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "10px 12px", borderRadius: 12 }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: palette.dark, marginTop: 4, fontFamily: "monospace" }}>{value}</div>
      {delta != null && (
        <div style={{ fontSize: 10, color: delta < 0 ? "#9F1239" : "#166534", fontWeight: 700, marginTop: 2 }}>
          {delta > 0 ? "+" : ""}{delta}% vs last week
        </div>
      )}
    </div>
  );
}

function btn(p, variant) {
  if (variant === "primary") {
    return { background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 10px ${p.base}40` };
  }
  return { background: p.bg, color: p.dark, border: `1px solid ${p.base}40`, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" };
}
