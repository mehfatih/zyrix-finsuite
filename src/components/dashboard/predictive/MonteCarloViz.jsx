// ================================================================
// MonteCarloViz — 100-trajectory fan chart with median highlight
// ================================================================
import React from "react";
import { getAIPalette, resolvePalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function MonteCarloViz({ trajectories = [], days = 90, palette, height = 280 }) {
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const p = resolvePalette(palette || ai);

  if (!trajectories.length) {
    return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8" }}>—</div>;
  }

  const width = 720;
  const padding = 40;
  const w = width - padding * 2;
  const h = height - padding * 2;

  // Compute global min/max across all trajectories
  const all = trajectories.flat();
  const min = Math.min(...all);
  const max = Math.max(...all, 1);

  const xAt = (i) => padding + (i / days) * w;
  const yAt = (v) => padding + h - ((v - min) / Math.max(1, max - min)) * h;
  const zeroY = yAt(0);

  // Compute median path
  const median = [];
  for (let day = 0; day <= days; day++) {
    const values = trajectories.map((t) => t[day]).filter((v) => v != null).sort((a, b) => a - b);
    const idx = Math.floor(values.length / 2);
    median.push(values[idx]);
  }
  const medianPts = median.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
      {/* Zero line */}
      <line x1={padding} y1={zeroY} x2={padding + w} y2={zeroY} stroke={alert.base} strokeDasharray="4 4" opacity="0.5" />
      <text x={padding + 6} y={zeroY - 4} fontSize="9" fill={alert.dark} fontWeight="700">Zero</text>
      {/* Trajectories */}
      {trajectories.map((traj, i) => {
        const pts = traj.map((v, j) => `${xAt(j)},${yAt(v)}`).join(" L ");
        return (
          <path
            key={i}
            d={`M ${pts}`}
            fill="none"
            stroke={p.base}
            strokeWidth="0.7"
            opacity="0.18"
          />
        );
      })}
      {/* Median path */}
      <path
        d={`M ${medianPts}`}
        fill="none"
        stroke={p.dark}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${p.base}80)` }}
      />
      {/* Axis labels */}
      {[0, Math.round(days / 2), days].map((d, i) => (
        <text key={i} x={xAt(d)} y={height - 8} textAnchor="middle" fontSize="9" fill="#64748B">
          Day {d}
        </text>
      ))}
    </svg>
  );
}
