// Waterfall — running total / contribution chart
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function Waterfall({
  data = [],            // [{ label, value, type? 'start'|'end'|'delta' }]
  palette,
  width = 600,
  height = 280,
  ariaLabel = "waterfall",
}) {
  const p = resolvePalette(palette);
  const pos = getSuccessPalette();
  const neg = getAlertPalette();
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (t) => {
      const v = Math.min((t - start) / 1000, 1);
      setProg(1 - Math.pow(1 - v, 3));
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(data), p.base]);

  if (!data || !data.length) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;

  // build cumulative from sequence of deltas with optional start/end totals
  let running = 0;
  const items = data.map((d) => {
    if (d.type === "start" || d.type === "end") {
      const v = Number(d.value) || 0;
      const out = { ...d, from: 0, to: v, isTotal: true };
      running = v;
      return out;
    }
    const delta = Number(d.value) || 0;
    const from = running;
    running += delta;
    return { ...d, from, to: running, delta, isTotal: false };
  });

  const lo = Math.min(0, ...items.map((it) => Math.min(it.from, it.to)));
  const hi = Math.max(0, ...items.map((it) => Math.max(it.from, it.to)));
  const padX = 36;
  const padY = 28;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const colW = (w / items.length) * 0.65;
  const gap = (w / items.length) * 0.35;
  const yAt = (v) => padY + h - ((v - lo) / (hi - lo || 1)) * h;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padX} x2={width - padX} y1={padY + h * f} y2={padY + h * f} stroke="#E2E8F0" strokeDasharray="3 4" />
      ))}
      {items.map((it, i) => {
        const x = padX + i * (colW + gap) + gap / 2;
        const yTop = yAt(Math.max(it.from, it.to));
        const yBot = yAt(Math.min(it.from, it.to));
        const fullH = Math.max(2, yBot - yTop);
        const animH = fullH * prog;
        const y = yTop + (fullH - animH);
        const color = it.isTotal ? p.base : (it.delta >= 0 ? pos.base : neg.base);
        return (
          <g key={i}>
            <rect x={x} y={y} width={colW} height={animH} rx={4} fill={color} />
            <text x={x + colW / 2} y={yTop - 6} textAnchor="middle" fontSize="10" fill={color} fontWeight="700">
              {it.isTotal ? Math.round(it.to).toLocaleString() : (it.delta >= 0 ? "+" : "") + Math.round(it.delta).toLocaleString()}
            </text>
            <text x={x + colW / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748B">
              {it.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
