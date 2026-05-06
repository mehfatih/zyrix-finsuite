// StepChart — stepped line (good for tier/threshold values)
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function StepChart({
  data = [],            // [{ label, value }]
  palette,
  width = 600,
  height = 200,
  ariaLabel = "step chart",
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

  if (!data || data.length < 2) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;
  const values = data.map((d) => Number(d.value) || 0);
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  const padX = 36;
  const padY = 24;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const ptsXY = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * w;
    const y = padY + h - ((d.value - min) / (max - min)) * h;
    return [x, y];
  });

  let path = "";
  ptsXY.forEach(([x, y], i) => {
    if (i === 0) path += `M ${x} ${y}`;
    else {
      const [px, py] = ptsXY[i - 1];
      path += ` L ${x} ${py} L ${x} ${y}`;
    }
  });

  // approximate path length for dashoffset draw-on
  const len = ptsXY.reduce((acc, [x, y], i) => {
    if (i === 0) return acc;
    const [px, py] = ptsXY[i - 1];
    return acc + Math.abs(x - px) + Math.abs(y - py);
  }, 0);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padX} x2={width - padX} y1={padY + h * f} y2={padY + h * f} stroke="#E2E8F0" strokeDasharray="3 4" />
      ))}
      <path
        d={path}
        fill="none"
        stroke={p.base}
        strokeWidth="2.5"
        strokeLinejoin="miter"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - prog)}
      />
      {data.map((d, i) => {
        const step = Math.max(1, Math.ceil(data.length / 8));
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={padX + (i / (data.length - 1)) * w} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748B">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
