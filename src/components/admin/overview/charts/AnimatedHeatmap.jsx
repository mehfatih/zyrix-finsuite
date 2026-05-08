// ================================================================
// AnimatedHeatmap — grid heatmap (rows × cols) with row-by-row reveal.
// Each cell's color is interpolated between colorScale.low and
// colorScale.high relative to the matrix' min/max. Cells with above-
// average values switch to white text for readability.
// ================================================================
import React, { useState, useEffect } from "react";

export default function AnimatedHeatmap({
  rows,
  cols,
  values,
  colorScale = { low: "#FEF3C7", high: "#EF4444" },
  valueFormat = (v) => v,
}) {
  const [appearedRows, setAppearedRows] = useState(0);
  const [hovered, setHovered] = useState(null);

  const flat = values.flat();
  const max = Math.max(...flat);
  const min = Math.min(...flat);

  useEffect(() => {
    setAppearedRows(0);
    const timers = rows.map((_, i) =>
      setTimeout(() => setAppearedRows((n) => Math.max(n, i + 1)), i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [rows, values]);

  const cellSize = 32;
  const gap = 3;
  const labelW = 40;
  const labelH = 24;
  const W = labelW + cols.length * (cellSize + gap);
  const H = labelH + rows.length * (cellSize + gap);

  const interpolateColor = (v) => {
    const range = max - min || 1;
    const t = (v - min) / range;
    const lerp = (a, b) => Math.round(a + (b - a) * t);
    const lo = parseInt(colorScale.low.slice(1), 16);
    const hi = parseInt(colorScale.high.slice(1), 16);
    const r = lerp((lo >> 16) & 255, (hi >> 16) & 255);
    const g = lerp((lo >> 8) & 255, (hi >> 8) & 255);
    const b = lerp(lo & 255, hi & 255);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {/* Column labels */}
        {cols.map((col, ci) => (
          <text
            key={col}
            x={labelW + ci * (cellSize + gap) + cellSize / 2}
            y={labelH - 8}
            fill="#6B7280"
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
          >{col}</text>
        ))}
        {/* Row labels + cells */}
        {rows.map((row, ri) => (
          <g key={row}>
            <text
              x={labelW - 8}
              y={labelH + ri * (cellSize + gap) + cellSize / 2 + 3}
              fill="#6B7280"
              fontSize="10"
              fontWeight="700"
              textAnchor="end"
            >{row}</text>
            {cols.map((col, ci) => {
              const v = values[ri]?.[ci] ?? 0;
              const x = labelW + ci * (cellSize + gap);
              const y = labelH + ri * (cellSize + gap);
              const isVisible = ri < appearedRows;
              const cellId = `${ri}-${ci}`;
              const isHovered = hovered === cellId;
              return (
                <g
                  key={col}
                  onMouseEnter={() => setHovered(cellId)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={4}
                    fill={interpolateColor(v)}
                    fillOpacity={isVisible ? 1 : 0}
                    stroke={isHovered ? "#111827" : "rgba(255,255,255,0.5)"}
                    strokeWidth={isHovered ? 2 : 1}
                    style={{ transition: "fill-opacity 350ms ease, stroke 150ms ease" }}
                  />
                  {isVisible && cellSize > 24 && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 3}
                      fill={v > (max + min) / 2 ? "#FFFFFF" : "#111827"}
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                      style={{ pointerEvents: "none" }}
                    >{valueFormat(v)}</text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
