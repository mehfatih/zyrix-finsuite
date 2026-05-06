// Gauge — semicircle progress meter (0-100 by default)
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function Gauge({
  value = 0,
  min = 0,
  max = 100,
  palette,
  width = 200,
  height = 120,
  label,
  suffix = "",
  ariaLabel = "gauge",
}) {
  const p = resolvePalette(palette);
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  const target = Math.max(min, Math.min(max, Number(value) || 0));
  const pct = (target - min) / (max - min || 1);

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (t) => {
      const v = Math.min((t - start) / 1100, 1);
      setProg((1 - Math.pow(1 - v, 3)) * pct);
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pct, p.base]);

  const cx = width / 2;
  const cy = height - 10;
  const r = Math.min(width, height * 2) / 2 - 14;
  const stroke = 14;

  const arc = (frac) => {
    const a = Math.PI * (1 - frac);
    const x = cx + r * Math.cos(a);
    const y = cy - r * Math.sin(a);
    return { x, y, large: frac > 0.5 ? 1 : 0 };
  };
  const start = arc(0);
  const end = arc(prog);

  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={`${p.base}1A`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${end.large} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={p.base}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy - r * 0.35}
        textAnchor="middle"
        fontSize={width * 0.16}
        fontWeight="800"
        fill={p.dark}
      >
        {Math.round(target)}{suffix}
      </text>
      {label && (
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={11} fill="#64748B" fontWeight="600">
          {label}
        </text>
      )}
    </svg>
  );
}
