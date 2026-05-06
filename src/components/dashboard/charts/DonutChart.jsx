// DonutChart — multi-segment ring with center total
import React, { useEffect, useRef, useState } from "react";
import { PALETTE_HUES, resolvePalette } from "../../../utils/dashboardPalette";

export default function DonutChart({
  data = [],            // [{ label, value, palette? }]
  palette,
  size = 200,
  showLegend = true,
  centerLabel,
  ariaLabel = "donut chart",
}) {
  const p = resolvePalette(palette);
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (t) => {
      const v = Math.min((t - start) / 1100, 1);
      setProg(1 - Math.pow(1 - v, 3));
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(data), p.base]);

  if (!data || !data.length) {
    return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;
  }
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.14;
  const circ = 2 * Math.PI * r;
  const colors = data.map((d, i) => d.color || PALETTE_HUES[(PALETTE_HUES.findIndex((h) => h.id === p.id) + i + 1) % PALETTE_HUES.length].base);
  let acc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width={size} height={size} role="img" aria-label={ariaLabel}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
        {data.map((d, i) => {
          const f = (Number(d.value) || 0) / total;
          const dash = f * circ * prog;
          const offset = -(acc * circ - circ * 0.25);
          acc += f;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={colors[i]}
              strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.14} fontWeight="800" fill={p.dark}>
          {Math.round(total).toLocaleString()}
        </text>
        <text x={cx} y={cy + size * 0.1} textAnchor="middle" fontSize={size * 0.07} fill="#94A3B8" fontWeight="600">
          {centerLabel || "total"}
        </text>
      </svg>
      {showLegend && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6, minWidth: 140 }}>
          {data.map((d, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[i] }} />
              <span style={{ flex: 1, color: "#0F172A" }}>{d.label}</span>
              <span style={{ color: "#64748B", fontWeight: 700 }}>
                {Math.round(((Number(d.value) || 0) / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
