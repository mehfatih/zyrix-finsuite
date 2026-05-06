// AreaChart — smooth area chart with x-axis labels
import React, { useEffect, useId, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function AreaChart({
  data = [],            // [{ label, value }] or [number]
  palette,
  width = 600,
  height = 220,
  showAxis = true,
  ariaLabel = "area chart",
}) {
  const p = resolvePalette(palette);
  const uid = useId();
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

  if (!data || data.length < 2) {
    return <Empty width={width} height={height} />;
  }

  const norm = data.map((d, i) => (typeof d === "number" ? { label: String(i + 1), value: d } : d));
  const values = norm.map((d) => Number(d.value) || 0);
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  const padX = 36;
  const padY = 22;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const pts = norm.map((d, i) => {
    const x = padX + (i / (norm.length - 1)) * w;
    const y = padY + h - ((d.value - min) / (max - min)) * h;
    return [x, y];
  });

  const linePath = pts.map((pt, i) => (i === 0 ? `M ${pt[0]} ${pt[1]}` : `L ${pt[0]} ${pt[1]}`)).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${padY + h} L ${pts[0][0]} ${padY + h} Z`;
  const gid = `ac-${uid.replace(/[:]/g, "")}`;
  const totalLen = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return acc;
    const [px, py] = pts[i - 1];
    return acc + Math.hypot(x - px, y - py);
  }, 0);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.chart} stopOpacity="0.45" />
          <stop offset="100%" stopColor={p.chart} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showAxis && (
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
            <line
              key={i}
              x1={padX}
              x2={width - padX}
              y1={padY + h * f}
              y2={padY + h * f}
              stroke="#E2E8F0"
              strokeDasharray="3 4"
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      <path d={areaPath} fill={`url(#${gid})`} opacity={prog} />
      <path
        d={linePath}
        fill="none"
        stroke={p.base}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={totalLen}
        strokeDashoffset={totalLen * (1 - prog)}
      />

      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={prog > 0.95 ? 3.5 : 0} fill="#fff" stroke={p.base} strokeWidth="2" />
      ))}

      {showAxis &&
        norm.map((d, i) => {
          const step = Math.max(1, Math.ceil(norm.length / 8));
          if (i % step !== 0 && i !== norm.length - 1) return null;
          return (
            <text
              key={i}
              x={padX + (i / (norm.length - 1)) * w}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
            >
              {d.label}
            </text>
          );
        })}
    </svg>
  );
}

function Empty({ width, height }) {
  return (
    <div style={{ width: "100%", height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>
      No data yet
    </div>
  );
}
