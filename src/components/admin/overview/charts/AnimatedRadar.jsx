// ================================================================
// AnimatedRadar — radar / spider chart for multi-dimensional comparison.
// Polygon vertices grow from center on mount (eased), and each series
// gets a polygon + dot per axis. Hovering a series in the legend
// highlights its polygon.
// ================================================================
import React, { useState, useEffect } from "react";

export default function AnimatedRadar({ axes, series, size = 240 }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    const dur = 1100;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [axes, series]);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const n = axes.length;

  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointFor = (axisIdx, valueRatio) => {
    const a = angleFor(axisIdx);
    const r = radius * valueRatio;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const polygonPoints = (s) =>
    axes
      .map((axis, i) => {
        const v = (s.values[axis.key] ?? 0) / axis.max;
        const ratio = v * progress;
        const [x, y] = pointFor(i, ratio);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
        {/* Concentric grid */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={axes.map((_, i) => {
              const [x, y] = pointFor(i, r);
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {axes.map((_, i) => {
          const [x, y] = pointFor(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
        })}
        {/* Axis labels */}
        {axes.map((axis, i) => {
          const [x, y] = pointFor(i, 1.15);
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              fill="#6B7280"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {axis.label}
            </text>
          );
        })}
        {/* Series polygons + dots */}
        {series.map((s) => (
          <g key={s.name}>
            <polygon
              points={polygonPoints(s)}
              fill={s.color}
              fillOpacity={hovered === s.name ? 0.35 : 0.18}
              stroke={s.color}
              strokeWidth="2.5"
              style={{ transition: "fill-opacity 250ms ease" }}
            />
            {axes.map((axis, i) => {
              const v = (s.values[axis.key] ?? 0) / axis.max;
              const [x, y] = pointFor(i, v * progress);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={hovered === s.name ? 5 : 3.5}
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "r 200ms ease" }}
                />
              );
            })}
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "120px" }}>
        {series.map((s) => (
          <div
            key={s.name}
            onMouseEnter={() => setHovered(s.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              background: hovered === s.name ? `${s.color}15` : "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 200ms ease",
            }}
          >
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: s.color }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
