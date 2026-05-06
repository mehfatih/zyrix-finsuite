// ScatterChart — 2D point plot
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function ScatterChart({
  data = [],            // [{ x, y, r?, label? }]
  palette,
  width = 500,
  height = 320,
  xLabel,
  yLabel,
  ariaLabel = "scatter chart",
}) {
  const p = resolvePalette(palette);
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (t) => {
      const v = Math.min((t - start) / 900, 1);
      setProg(1 - Math.pow(1 - v, 3));
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(data), p.base]);

  if (!data || !data.length) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;
  const xs = data.map((d) => Number(d.x) || 0);
  const ys = data.map((d) => Number(d.y) || 0);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const padX = 44;
  const padY = 28;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const xAt = (x) => padX + ((x - xMin) / (xMax - xMin || 1)) * w;
  const yAt = (y) => padY + h - ((y - yMin) / (yMax - yMin || 1)) * h;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={padX} x2={width - padX} y1={padY + h * f} y2={padY + h * f} stroke="#E2E8F0" strokeDasharray="3 4" />
      ))}
      <line x1={padX} x2={padX} y1={padY} y2={padY + h} stroke="#CBD5E1" />
      <line x1={padX} x2={width - padX} y1={padY + h} y2={padY + h} stroke="#CBD5E1" />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xAt(Number(d.x) || 0)}
          cy={yAt(Number(d.y) || 0)}
          r={(d.r || 5) * prog}
          fill={p.base}
          fillOpacity="0.7"
          stroke="#fff"
          strokeWidth="1.5"
        >
          {d.label && <title>{d.label}</title>}
        </circle>
      ))}
      {xLabel && <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748B">{xLabel}</text>}
      {yLabel && <text x={12} y={height / 2} fontSize="11" fill="#64748B" transform={`rotate(-90 12 ${height / 2})`} textAnchor="middle">{yLabel}</text>}
    </svg>
  );
}
