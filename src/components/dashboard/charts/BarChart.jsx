// BarChart — vertical or horizontal bars with animation
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function BarChart({
  data = [],            // [{ label, value }]
  palette,
  width = 600,
  height = 240,
  horizontal = false,
  showValues = true,
  ariaLabel = "bar chart",
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

  if (!data || !data.length) {
    return (
      <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>
        No data yet
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  if (horizontal) {
    const rowH = Math.max(28, Math.min(48, height / data.length));
    const labelW = 110;
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${rowH * data.length + 12}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
        {data.map((d, i) => {
          const v = (Number(d.value) || 0) / max;
          const barW = (width - labelW - 50) * v * prog;
          return (
            <g key={i} transform={`translate(0 ${i * rowH + 6})`}>
              <text x={labelW - 8} y={rowH / 2 + 4} textAnchor="end" fontSize="12" fill="#475569" fontWeight="600">
                {d.label}
              </text>
              <rect x={labelW} y={6} width={width - labelW - 50} height={rowH - 12} rx={6} fill={`${p.base}10`} />
              <rect x={labelW} y={6} width={barW} height={rowH - 12} rx={6} fill={p.base} />
              {showValues && (
                <text x={labelW + barW + 6} y={rowH / 2 + 4} fontSize="11" fill={p.dark} fontWeight="700">
                  {Number(d.value).toLocaleString()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const gap = 8;
  const barW = (innerW - gap * (data.length - 1)) / data.length;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {[0, 0.5, 1].map((f, i) => (
        <line
          key={i}
          x1={padX}
          x2={width - padX}
          y1={padY + (height - padY * 2) * (1 - f)}
          y2={padY + (height - padY * 2) * (1 - f)}
          stroke="#E2E8F0"
          strokeDasharray="3 4"
        />
      ))}
      {data.map((d, i) => {
        const v = (Number(d.value) || 0) / max;
        const fullH = (height - padY * 2) * v;
        const h = fullH * prog;
        const x = padX + i * (barW + gap);
        const y = padY + (height - padY * 2) - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={6} fill={p.base} />
            <rect x={x} y={y} width={barW} height={Math.min(4, h)} rx={3} fill={p.dark} opacity={0.7} />
            {showValues && h > 18 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fill={p.dark} fontWeight="700">
                {Number(d.value).toLocaleString()}
              </text>
            )}
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748B">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
