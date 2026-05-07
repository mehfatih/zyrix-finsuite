// ================================================================
// LoyaltyPointCalculator — interactive point-value & ROI calculator
// ================================================================
import React, { useMemo, useState } from "react";
import { getAIPalette, getMoneyPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import { calcPointValue, fmtCurrency } from "../../../pages/dashboard/voice-cx/voiceCxApi";

export default function LoyaltyPointCalculator({ t = (s) => s }) {
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();

  const [spend, setSpend] = useState(1500);
  const [multiplier, setMultiplier] = useState(2);
  const [valuePerPoint, setValuePerPoint] = useState(0.01);

  const result = useMemo(() => calcPointValue(spend, multiplier, valuePerPoint), [spend, multiplier, valuePerPoint]);

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 18 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{t("loyalty.calc.title")}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="lpc-controls">
        <Field label={t("loyalty.calc.spend")} suffix="₺">
          <input
            type="number"
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value) || 0)}
            style={inp}
          />
        </Field>
        <Field label="x multiplier">
          <input
            type="range"
            min={1} max={20} step={1}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, marginTop: 4 }}>{multiplier}x</div>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="lpc-results">
        <Metric label={t("loyalty.calc.points")} value={result.points.toLocaleString()} palette={ai} />
        <Metric label={t("loyalty.calc.value")} value={fmtCurrency(result.value)} palette={money} />
        <Metric label={t("loyalty.calc.roi")} value={`${result.roi.toFixed(1)}%`} palette={success} />
      </div>

      <style>{`@media (max-width: 540px) {
        .lpc-controls { grid-template-columns: 1fr !important; }
        .lpc-results { grid-template-columns: 1fr !important; }
      }`}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, suffix, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label} {suffix && <span style={{ color: "#94A3B8" }}>({suffix})</span>}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, palette }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "10px 12px", borderRadius: 12 }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: palette.dark, marginTop: 4, fontFamily: "monospace" }}>
        {value}
      </div>
    </div>
  );
}
