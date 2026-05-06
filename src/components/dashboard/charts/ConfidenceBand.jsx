// ConfidenceBand — line with shaded uncertainty range above/below
import React, { useEffect, useId, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function ConfidenceBand({
  data = [],            // [{ label, value, low, high }]
  palette,
  width = 600,
  height = 220,
  ariaLabel = "confidence band",
}) {
  const p = resolvePalette(palette);
  const uid = useId();
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (t) => {
      const v = Math.min((t - start) / 1200, 1);
      setProg(1 - Math.pow(1 - v, 3));
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(data), p.base]);

  if (!data || data.length < 2) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;
  const all = data.flatMap((d) => [Number(d.value) || 0, Number(d.low ?? d.value) || 0, Number(d.high ?? d.value) || 0]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const padX = 36;
  const padY = 22;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const xAt = (i) => padX + (i / (data.length - 1)) * w;
  const yAt = (v) => padY + h - ((v - min) / range) * h;

  const linePts = data.map((d, i) => `${xAt(i)},${yAt(Number(d.value) || 0)}`).join(" L ");
  const top = data.map((d, i) => `${xAt(i)},${yAt(Number(d.high ?? d.value) || 0)}`).join(" L ");
  const bottom = data
    .slice()
    .reverse()
    .map((d, i, arr) => {
      const realIdx = data.length - 1 - i;
      return `${xAt(realIdx)},${yAt(Number(d.low ?? d.value) || 0)}`;
    })
    .join(" L ");
  const bandPath = `M ${top} L ${bottom} Z`;
  const gid = `cb-${uid.replace(/[:]/g, "")}`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.chart} stopOpacity="0.45" />
          <stop offset="100%" stopColor={p.chart} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padX} x2={width - padX} y1={padY + h * f} y2={padY + h * f} stroke="#E2E8F0" strokeDasharray="3 4" />
      ))}
      <path d={bandPath} fill={`url(#${gid})`} opacity={prog} />
      <path d={`M ${linePts}`} fill="none" stroke={p.base} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity={prog} />
      {data.map((d, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(Number(d.value) || 0)} r={prog > 0.95 ? 3.5 : 0} fill="#fff" stroke={p.base} strokeWidth="2" />
      ))}
      {data.map((d, i) => {
        const step = Math.max(1, Math.ceil(data.length / 8));
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={xAt(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748B">{d.label}</text>
        );
      })}
    </svg>
  );
}
