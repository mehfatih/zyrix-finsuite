// ================================================================
// PaymentHeatmap — wraps CalendarHeatmap with currency tooltip & legend
// ================================================================
import React from "react";
import CalendarHeatmap from "../charts/CalendarHeatmap";
import { getCustomerPalette, resolvePalette } from "../../../utils/dashboardPalette";

export default function PaymentHeatmap({ payments = [], palette, currency = "TRY" }) {
  const p = resolvePalette(palette || getCustomerPalette());
  const data = payments.map((pay) => ({
    date: pay.date,
    value: Number(pay.amount) || 0,
  }));

  const total = data.reduce((s, d) => s + d.value, 0);
  const fmt = (n) =>
    `${currency === "TRY" ? "₺" : currency + " "}${Number(n).toLocaleString()}`;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <CalendarHeatmap data={data} palette={p} weeks={53} cellSize={11} gap={3} />
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, color: "#64748B" }}>
          <span style={{ color: p.dark, fontWeight: 700 }}>{data.length}</span> payment days
          <span style={{ margin: "0 8px", opacity: 0.4 }}>•</span>
          Total <span style={{ color: p.base, fontWeight: 700 }}>{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94A3B8" }}>
          <span>Less</span>
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((a, i) => (
            <span
              key={i}
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                background: `${p.base}${Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase()}`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
