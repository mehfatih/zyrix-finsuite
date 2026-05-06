// ================================================================
// InflationCalculator — TRY ↔ USD/EUR with inflation impact viz
// Shows: nominal value, real value after inflation, hedge suggestion
// ================================================================
import React, { useMemo, useState } from "react";
import { getMoneyPalette, getAlertPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import { FX_RATES, convertFx, fmtCurrencyExact, TR_ANNUAL_INFLATION } from "../../../pages/dashboard/cash/cashApi";

export default function InflationCalculator({ defaultAmount = 100000, t = (s) => s }) {
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();

  const [amount, setAmount] = useState(defaultAmount);
  const [months, setMonths] = useState(12);
  const [hedgeCurrency, setHedgeCurrency] = useState("USD");

  const monthlyRate = TR_ANNUAL_INFLATION / 12;
  const realValue = useMemo(() => {
    const r = (Number(amount) || 0) / Math.pow(1 + monthlyRate, Number(months) || 0);
    return r;
  }, [amount, months, monthlyRate]);

  const lost = (Number(amount) || 0) - realValue;
  const lostPct = amount > 0 ? (lost / amount) * 100 : 0;

  const hedgeAmount = convertFx(amount, "TRY", hedgeCurrency);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Field label="₺ Tutar">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label="Süre (ay)">
          <input
            type="number"
            min="1"
            max="60"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            style={{ ...input(money), fontFamily: "monospace", textAlign: "center" }}
          />
        </Field>
        <Field label="Hedge para birimi">
          <select value={hedgeCurrency} onChange={(e) => setHedgeCurrency(e.target.value)} style={input(money)}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 12,
        }}
        className="inflation-grid"
      >
        <Tile palette={money} label="Bugün (Nominal)" value={fmtCurrencyExact(amount)} />
        <Tile palette={alert} label={`${months} ay sonra (Reel)`} value={fmtCurrencyExact(realValue)} />
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: alert.bg,
          border: `1px solid ${alert.base}30`,
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 12, color: alert.dark, fontWeight: 700 }}>
          🔻 Enflasyon kaybı (~%{(TR_ANNUAL_INFLATION * 100).toFixed(0)} yıllık)
        </span>
        <span style={{ fontSize: 16, color: alert.base, fontFamily: "monospace", fontWeight: 800 }}>
          -{fmtCurrencyExact(lost)} ({lostPct.toFixed(1)}%)
        </span>
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: `linear-gradient(135deg, ${success.bg}, ${money.bg})`,
          border: `1px solid ${success.base}30`,
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            💱 Hedge önerisi
          </div>
          <div style={{ fontSize: 13, color: success.dark, fontWeight: 700 }}>
            {fmtCurrencyExact(amount)} → {fmtCurrencyExact(hedgeAmount, hedgeCurrency)}
          </div>
        </div>
        <span style={{ fontSize: 11, color: success.dark, fontWeight: 700 }}>
          1 {hedgeCurrency} = ₺{(FX_RATES[hedgeCurrency] || 1).toFixed(2)}
        </span>
      </div>

      <style>{`@media (max-width: 540px) { .inflation-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

function Tile({ palette, label, value }) {
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.base}30`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 10, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: palette.base, fontFamily: "monospace" }}>
        {value}
      </div>
    </div>
  );
}

function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}
