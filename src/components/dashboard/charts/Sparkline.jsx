// Sparkline — minimal trend line with gradient fill
import React, { useEffect, useRef, useState, useId } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function Sparkline({
  data = [],
  palette,
  width = 120,
  height = 36,
  stroke = 2,
  showFill = true,
  ariaLabel = "trend",
}) {
  const p = resolvePalette(palette);
  const uid = useId();
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

  if (!data || data.length < 2) {
    return <div style={{ width, height, color: "#CBD5E1", fontSize: 11, display: "grid", placeItems: "center" }}>—</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y];
    });
  const visiblePts = pts.slice(0, Math.max(2, Math.ceil(pts.length * prog)));
  const linePts = visiblePts.map(([x, y]) => `${x},${y}`).join(" ");
  const fillPts = `0,${height} ${linePts} ${visiblePts[visiblePts.length - 1]?.[0] ?? width},${height}`;
  const gid = `sg-${uid.replace(/[:]/g, "")}`;

  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.chart} stopOpacity="0.35" />
          <stop offset="100%" stopColor={p.chart} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showFill && (
        <polyline points={fillPts} fill={`url(#${gid})`} stroke="none" />
      )}
      <polyline
        points={linePts}
        fill="none"
        stroke={p.base}
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
