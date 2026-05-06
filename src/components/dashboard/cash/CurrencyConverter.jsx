// ================================================================
// CurrencyConverter — live FX converter with rate display
// ================================================================
import React, { useMemo, useState } from "react";
import { getMoneyPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import { FX_RATES, convertFx, fmtCurrencyExact } from "../../../pages/dashboard/cash/cashApi";

const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];

export default function CurrencyConverter({ defaultFrom = "TRY", defaultTo = "USD", t = (s) => s }) {
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [amount, setAmount] = useState(1000);

  const result = useMemo(() => convertFx(amount, from, to), [amount, from, to]);
  const rate = useMemo(() => convertFx(1, from, to), [from, to]);
  const now = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end", marginBottom: 14 }}>
        <Field label={t("fx.from")}>
          <div style={{ display: "flex", gap: 6 }}>
            <select value={from} onChange={(e) => setFrom(e.target.value)} style={selectStyle(money)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...input(money), flex: 1, fontFamily: "monospace", textAlign: "end" }}
            />
          </div>
        </Field>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap currencies"
          style={{
            background: customer.bg,
            color: customer.dark,
            border: `1px solid ${customer.base}30`,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            height: 38,
          }}
        >
          ⇄
        </button>
        <Field label={t("fx.to")}>
          <div style={{ display: "flex", gap: 6 }}>
            <select value={to} onChange={(e) => setTo(e.target.value)} style={selectStyle(money)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${money.base}40`,
                background: `linear-gradient(135deg, ${money.bg}, ${money.base}15)`,
                fontSize: 15,
                fontWeight: 800,
                color: money.base,
                fontFamily: "monospace",
                textAlign: "end",
                minHeight: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {fmtCurrencyExact(result, to)}
            </div>
          </div>
        </Field>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: customer.bg,
          borderRadius: 10,
          fontSize: 11,
          color: customer.dark,
          fontWeight: 600,
        }}
      >
        <span>
          1 {from} = <strong style={{ fontFamily: "monospace" }}>{rate.toFixed(4)}</strong> {to}
        </span>
        <span style={{ opacity: 0.7 }}>
          🟢 {t("fx.live").replace("{time}", now)}
        </span>
      </div>
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
function input(palette) {
  return {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 14,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}
function selectStyle(palette) {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 12,
    fontWeight: 700,
    color: palette.dark,
    outline: "none",
    minWidth: 70,
  };
}
