// ================================================================
// InfluencerROICalculator — interactive net-ROI calculator
// ================================================================
import React, { useMemo, useState } from "react";
import { getMoneyPalette, getAlertPalette, getSuccessPalette, getMarketPalette } from "../../../utils/dashboardPalette";
import { calcInfluencerRoi, fmtCurrency } from "../../../pages/dashboard/ecosystem/ecosystemApi";

export default function InfluencerROICalculator({ t = (s) => s }) {
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const market = getMarketPalette();

  const [spend, setSpend] = useState(5000);
  const [attributed, setAttributed] = useState(15000);
  const [cogsPct, setCogsPct] = useState(60);

  const result = useMemo(() => calcInfluencerRoi(spend, attributed, cogsPct / 100), [spend, attributed, cogsPct]);
  const positive = result.roi >= 0;

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{t("influencer.calc.title")}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }} className="irc-controls">
        <Field label={t("influencer.calc.spend")}>
          <input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value) || 0)} style={inp} />
        </Field>
        <Field label={t("influencer.calc.attributed")}>
          <input type="number" value={attributed} onChange={(e) => setAttributed(Number(e.target.value) || 0)} style={inp} />
        </Field>
        <Field label={t("influencer.calc.cogs")}>
          <input type="range" min={20} max={90} value={cogsPct} onChange={(e) => setCogsPct(Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ fontSize: 11, color: market.dark, fontWeight: 800 }}>{cogsPct}%</div>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="irc-results">
        <Tile label="Profit" value={fmtCurrency(result.profit)} palette={positive ? success : alert} />
        <Tile label={t("influencer.calc.netROI")} value={`${(result.roi * 100).toFixed(0)}%`} palette={positive ? success : alert} highlight />
      </div>

      <style>{`@media (max-width: 540px) {
        .irc-controls { grid-template-columns: 1fr !important; }
        .irc-results { grid-template-columns: 1fr !important; }
      }`}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Tile({ label, value, palette, highlight }) {
  return (
    <div style={{ background: highlight ? `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)` : palette.bg, border: `1px solid ${palette.base}30`, padding: 12, borderRadius: 12, boxShadow: highlight ? `0 6px 14px ${palette.base}30` : "none" }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: highlight ? 22 : 16, fontWeight: 900, color: palette.dark, marginTop: 4, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
