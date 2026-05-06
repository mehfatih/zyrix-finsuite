// ================================================================
// VatBreakdownDonut — Collected vs Paid donut + net-payable center
// ================================================================
import React from "react";
import { DonutChart } from "../charts";
import { getMoneyPalette, getSuccessPalette, getReportsPalette } from "../../../utils/dashboardPalette";

export default function VatBreakdownDonut({ collected = 0, paid = 0, currency = "TRY", size = 180, t = (s) => s }) {
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const net = collected - paid;

  const data = [
    { label: t("vat.kpi.collected"), value: Math.max(0, Number(collected) || 0), color: success.base },
    { label: t("vat.kpi.paid"),      value: Math.max(0, Number(paid) || 0),      color: reports.base },
  ];

  const fmt = (n) =>
    `${currency === "TRY" ? "₺" : currency + " "}${Math.round(Number(n) || 0).toLocaleString()}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <DonutChart data={data} palette={money} size={size} showLegend={false} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("vat.kpi.net")}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: net >= 0 ? money.base : success.base,
                fontFamily: "monospace",
                marginTop: 2,
              }}
            >
              {fmt(net)}
            </div>
          </div>
        </div>
      </div>
      <div>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{d.label}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>{fmt(d.value)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
