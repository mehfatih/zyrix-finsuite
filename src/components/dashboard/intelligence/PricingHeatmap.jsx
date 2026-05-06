// ================================================================
// PricingHeatmap — demand × price grid with optimal-zone highlight
// ================================================================
import React from "react";
import { resolvePalette, getMoneyPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function PricingHeatmap({
  data,
  rows = ["Low", "Med", "High"],
  cols = ["-20%", "-10%", "Current", "+10%", "+20%"],
  optimalRow = 2,
  optimalCol = 2,
  palette,
  t = (s) => s,
}) {
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const p = resolvePalette(palette || money);

  // Generate a synthetic heatmap if no data passed.
  // Score is highest near the optimal cell, decreases outward
  const grid = data || rows.map((_, r) =>
    cols.map((_, c) => {
      const rDist = Math.abs(r - optimalRow);
      const cDist = Math.abs(c - optimalCol);
      const dist = Math.sqrt(rDist * rDist + cDist * cDist);
      return Math.max(0.05, 1 - dist * 0.32);
    })
  );

  const cellColor = (score) => {
    if (score >= 0.8) return success.base;
    if (score >= 0.55) return p.base;
    if (score >= 0.35) return "#F59E0B";
    return alert.base;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: 60 }} />
        {cols.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.map((rowLabel, r) => (
        <div key={r} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <div
            style={{
              width: 60,
              fontSize: 11,
              fontWeight: 800,
              color: p.dark,
              textAlign: "end",
              paddingInlineEnd: 8,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {rowLabel}
          </div>
          {cols.map((c, ci) => {
            const score = grid[r][ci];
            const isOptimal = r === optimalRow && ci === optimalCol;
            return (
              <div
                key={ci}
                title={`Demand ${rowLabel} × Price ${c}: ${(score * 100).toFixed(0)}%`}
                style={{
                  flex: 1,
                  aspectRatio: "1.4",
                  margin: 2,
                  borderRadius: 8,
                  background: cellColor(score),
                  opacity: 0.25 + score * 0.75,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  border: isOptimal ? `2.5px solid ${success.dark}` : "1px solid rgba(255,255,255,0.3)",
                  boxShadow: isOptimal ? `0 0 18px ${success.base}80` : "none",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
              >
                {Math.round(score * 100)}
                {isOptimal && (
                  <span style={{ position: "absolute", top: -6, insetInlineEnd: -6, background: success.dark, color: "#fff", fontSize: 8, padding: "2px 6px", borderRadius: 999, fontWeight: 800 }}>
                    ★
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ marginTop: 10, display: "flex", gap: 12, fontSize: 10, color: "#64748B", justifyContent: "center", flexWrap: "wrap" }}>
        <Legend color={success.base} label="Optimal" />
        <Legend color={p.base} label="Healthy" />
        <Legend color="#F59E0B" label="Caution" />
        <Legend color={alert.base} label="Risky" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}
