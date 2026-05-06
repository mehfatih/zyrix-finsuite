// ================================================================
// EOQCalculator — interactive Economic Order Quantity calc
// ================================================================
import React, { useMemo, useState } from "react";
import { getMoneyPalette, getAIPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import { calcEOQ, fmtCurrency } from "../../../pages/dashboard/predictive/predictiveApi";

export default function EOQCalculator({ defaults = { annualDemand: 1000, orderCost: 50, holdingCost: 5 }, t = (s) => s }) {
  const money = getMoneyPalette();
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const [data, setData] = useState(defaults);
  const result = useMemo(() => calcEOQ(data), [data]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Field label={t("inv.eoq.demand")}>
          <input
            type="number"
            min="0"
            value={data.annualDemand}
            onChange={(e) => setData({ ...data, annualDemand: Number(e.target.value) || 0 })}
            style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label={t("inv.eoq.orderCost")}>
          <input
            type="number"
            min="0"
            value={data.orderCost}
            onChange={(e) => setData({ ...data, orderCost: Number(e.target.value) || 0 })}
            style={{ ...input(customer), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label={t("inv.eoq.holdCost")}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.holdingCost}
            onChange={(e) => setData({ ...data, holdingCost: Number(e.target.value) || 0 })}
            style={{ ...input(ai), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${money.bg}, ${ai.bg})`,
          border: `2px solid ${money.base}40`,
          borderRadius: 14,
          padding: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 11, color: money.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          {t("inv.eoq.optimal")}
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: money.base, fontFamily: "monospace", letterSpacing: "-0.02em" }}>
          {result.qty.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: customer.dark, marginTop: 4 }}>
          {t("inv.eoq.frequency").replace("{n}", result.frequency)}
        </div>
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
