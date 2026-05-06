// RadarChart — multi-axis polygon for skill/score profiles
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function RadarChart({
  axes = [],            // [{ label, value, max? }]
  palette,
  size = 280,
  ariaLabel = "radar",
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
  }, [JSON.stringify(axes), p.base]);

  if (!axes || axes.length < 3) return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>Need 3+ axes</div>;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const N = axes.length;

  const point = (i, frac) => {
    const angle = -Math.PI / 2 + (i / N) * Math.PI * 2;
    return [cx + Math.cos(angle) * r * frac, cy + Math.sin(angle) * r * frac];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPts = axes.map((a, i) => {
    const v = Math.min(1, (Number(a.value) || 0) / (a.max || 100));
    return point(i, v * prog);
  });

  return (
    <svg width={size} height={size} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {rings.map((rg, i) => {
        const pts = axes.map((_, j) => point(j, rg).join(",")).join(" ");
        return <polygon key={i} points={pts} fill="none" stroke="#E2E8F0" strokeDasharray="3 3" />;
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F0" />;
      })}
      <polygon
        points={dataPts.map((pt) => pt.join(",")).join(" ")}
        fill={p.base}
        fillOpacity="0.25"
        stroke={p.base}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {dataPts.map((pt, i) => (
        <circle key={i} cx={pt[0]} cy={pt[1]} r={prog > 0.9 ? 4 : 0} fill="#fff" stroke={p.base} strokeWidth="2" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#475569" fontWeight="600">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
