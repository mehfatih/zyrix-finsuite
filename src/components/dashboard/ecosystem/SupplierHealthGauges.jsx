// ================================================================
// SupplierHealthGauges — per-supplier health score with signals
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getReportsPalette } from "../../../utils/dashboardPalette";

export default function SupplierHealthGauges({ supplier, onAction, t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();

  const palette =
    supplier.health === "healthy" ? success :
    supplier.health === "warning" ? warn : alert;

  const score = supplier.score;
  const arcStart = -Math.PI;
  const arcEnd   = 0;
  const cx = 60;
  const cy = 60;
  const r  = 46;
  const pct = Math.max(0, Math.min(1, score / 100));
  const angle = arcStart + (arcEnd - arcStart) * pct;
  const ex = cx + r * Math.cos(angle);
  const ey = cy + r * Math.sin(angle);
  const sweep = pct > 0.5 ? 1 : 0;
  const valuePath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${sweep} 1 ${ex} ${ey}`;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div
      style={{
        background: "#fff", border: `1.5px solid ${palette.base}40`,
        borderRadius: 14, padding: 16, marginBottom: 12,
        boxShadow: `0 4px 14px ${palette.base}15`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, insetInlineStart: 0, width: 4, height: "100%", background: `linear-gradient(180deg, ${palette.base}, ${palette.dark})` }} />

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center", marginBottom: 12, marginInlineStart: 4 }} className="shg-grid">
        <div style={{ textAlign: "center" }}>
          <svg width={120} height={70} viewBox="0 0 120 70">
            <path d={trackPath} stroke="#E2E8F0" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d={valuePath} stroke={palette.base} strokeWidth={10} fill="none" strokeLinecap="round" />
            <circle cx={ex} cy={ey} r={5} fill={palette.dark} stroke="#fff" strokeWidth={2} />
            <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="900" fill={palette.dark} fontFamily="monospace">{score}</text>
          </svg>
          <div style={{ fontSize: 9, fontWeight: 800, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t(`supplier.health.${supplier.health}`)}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{supplier.name}</div>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            {t("supplier.signals.title")}
          </div>
          {supplier.signals.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: s.positive ? success.dark : alert.dark, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{s.positive ? "✓" : "⚠"}</span>
              <span>{t(`supplier.signal.${s.kind}`)}</span>
              <span style={{ marginInlineStart: "auto", fontSize: 9, opacity: 0.7 }}>({s.weight > 0 ? "+" : ""}{s.weight})</span>
            </div>
          ))}
        </div>
      </div>

      {supplier.recommendation && (
        <div style={{ background: alert.bg, border: `1px solid ${alert.base}40`, borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: alert.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            {t("supplier.recommendation")}
          </div>
          <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600, lineHeight: 1.45 }}>
            {supplier.recommendation}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" onClick={() => onAction?.(supplier, "contact")} style={smBtn(reports)}>{t("supplier.action.contact")}</button>
        <button type="button" onClick={() => onAction?.(supplier, "profile")} style={smBtn(reports)}>{t("supplier.action.viewProfile")}</button>
        {supplier.recommendation && (
          <button type="button" onClick={() => onAction?.(supplier, "findBackup")} style={{ background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`, color: "#fff", border: "none", padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 12px ${palette.base}40` }}>
            🔍 {t("supplier.action.findBackup")}
          </button>
        )}
      </div>

      <style>{`@media (max-width: 540px) { .shg-grid { grid-template-columns: 1fr !important; text-align: center; } }`}</style>
    </div>
  );
}

function smBtn(p) {
  return { background: p.bg, color: p.dark, border: `1px solid ${p.base}40`, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" };
}
