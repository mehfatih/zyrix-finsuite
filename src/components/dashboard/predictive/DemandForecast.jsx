// ================================================================
// DemandForecast — line + light confidence band for product demand
// ================================================================
import React from "react";
import { getAIPalette, resolvePalette } from "../../../utils/dashboardPalette";

export default function DemandForecast({ data = [], palette, height = 180 }) {
  const ai = getAIPalette();
  const p = resolvePalette(palette || ai);

  if (!data || data.length < 2) {
    return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8" }}>—</div>;
  }

  const width = 600;
  const padding = 28;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const all = data.flatMap((d) => [d.value, d.high ?? d.value, d.low ?? d.value]);
  const min = Math.min(...all);
  const max = Math.max(...all, 1);
  const xAt = (i) => padding + (i / (data.length - 1)) * w;
  const yAt = (v) => padding + h - ((v - min) / Math.max(1, max - min)) * h;
  const linePts = data.map((d, i) => `${xAt(i)},${yAt(d.value)}`).join(" L ");
  const top = data.map((d, i) => `${xAt(i)},${yAt(d.high ?? d.value)}`).join(" L ");
  const bottom = data.slice().reverse().map((d, i, arr) => {
    const realIdx = data.length - 1 - i;
    return `${xAt(realIdx)},${yAt(data[realIdx].low ?? data[realIdx].value)}`;
  }).join(" L ");
  const bandPath = `M ${top} L ${bottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="df-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={p.chart} stopOpacity="0.4" />
          <stop offset="100%" stopColor={p.chart} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d={bandPath} fill="url(#df-grad)" />
      <path d={`M ${linePts}`} fill="none" stroke={p.base} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const step = Math.max(1, Math.ceil(data.length / 8));
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={xAt(i)} y={height - 6} textAnchor="middle" fontSize="9" fill="#64748B">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
