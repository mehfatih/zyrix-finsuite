// ================================================================
// KdvComparisonChart — paired bars: this month vs last month
// ================================================================
import React from "react";
import { resolvePalette, getMoneyPalette } from "../../../utils/dashboardPalette";

export default function KdvComparisonChart({
  thisMonth = { collected: 0, paid: 0 },
  lastMonth = { collected: 0, paid: 0 },
  palette,
  currency = "TRY",
  t = (s) => s,
}) {
  const p = resolvePalette(palette || getMoneyPalette());
  const max = Math.max(
    1,
    Number(thisMonth.collected) || 0,
    Number(thisMonth.paid) || 0,
    Number(lastMonth.collected) || 0,
    Number(lastMonth.paid) || 0
  );
  const fmt = (n) => `${currency === "TRY" ? "₺" : currency + " "}${Math.round(Number(n) || 0).toLocaleString()}`;

  const groups = [
    { label: t("vat.kpi.collected"), this: thisMonth.collected, last: lastMonth.collected },
    { label: t("vat.kpi.paid"),      this: thisMonth.paid,      last: lastMonth.paid },
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {groups.map((g, i) => {
        const delta = (Number(g.this) || 0) - (Number(g.last) || 0);
        const pct = g.last ? Math.round((delta / Number(g.last)) * 100) : null;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.dark }}>{g.label}</span>
              {pct != null && (
                <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? "#10B981" : "#EF4444" }}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
                </span>
              )}
            </div>
            <Bar label={t("vat.compare.title").includes("vs") ? "Last" : "Geçen"} value={g.last} max={max} color="#94A3B8" fmt={fmt} />
            <div style={{ height: 4 }} />
            <Bar label={t("vat.compare.title").includes("vs") ? "This" : "Bu"} value={g.this} max={max} color={p.base} fmt={fmt} />
          </div>
        );
      })}
    </div>
  );
}

function Bar({ label, value, max, color, fmt }) {
  const w = (Number(value) || 0) / max * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 40, fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 14, background: `${color}15`, borderRadius: 7, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.max(2, w)}%`,
            height: "100%",
            background: color,
            transition: "width .8s ease",
            display: "flex",
            alignItems: "center",
            paddingInlineStart: 8,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {w > 24 ? fmt(value) : ""}
        </div>
      </div>
      {w <= 24 && (
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{fmt(value)}</span>
      )}
    </div>
  );
}
