// BulletChart — actual vs target progress bar
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function BulletChart({
  value = 0,
  target = 100,
  max,
  palette,
  width = 360,
  height = 36,
  label,
  ariaLabel = "bullet",
}) {
  const p = resolvePalette(palette);
  const [prog, setProg] = useState(0);
  const rafRef = useRef();
  const cap = max ?? Math.max(target * 1.25, value * 1.1, 1);

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
  }, [value, target, p.base]);

  const pctVal = Math.min(1, value / cap) * prog;
  const pctTgt = Math.min(1, target / cap);

  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{label}</span>
          <span style={{ color: p.dark, fontWeight: 700 }}>
            {Number(value).toLocaleString()} / {Number(target).toLocaleString()}
          </span>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} preserveAspectRatio="none" style={{ display: "block" }}>
        <rect x={0} y={height * 0.25} width={width} height={height * 0.5} rx={6} fill={`${p.base}10`} />
        <rect x={0} y={height * 0.25} width={width * pctVal} height={height * 0.5} rx={6} fill={p.base} />
        <line
          x1={width * pctTgt}
          x2={width * pctTgt}
          y1={4}
          y2={height - 4}
          stroke={p.dark}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
