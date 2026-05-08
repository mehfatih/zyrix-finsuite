// ================================================================
// AnimatedSankey — simplified 2-column sankey. Left and right node
// columns are stacked proportionally to total flow; ribbons reveal
// left-to-right via a clip-path that animates from 0 to 1. Hovering
// a ribbon dims the others.
// ================================================================
import React, { useState, useEffect } from "react";

export default function AnimatedSankey({ leftNodes, rightNodes, flows }) {
  const [progress, setProgress] = useState(0);
  const [hoveredFlow, setHoveredFlow] = useState(null);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    const dur = 1200;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [leftNodes, rightNodes, flows]);

  const W = 380;
  const H = 240;
  const nodeW = 14;
  const padding = 16;
  const colWidth = W - 2 * padding - 2 * nodeW;

  const totalValue = flows.reduce((s, f) => s + f.value, 0) || 1;
  const usableH = H - 2 * padding;
  const heightFor = (value) => (value / totalValue) * usableH;

  const leftTotals = {};
  const rightTotals = {};
  leftNodes.forEach((n) => {
    leftTotals[n.key] = flows.filter((f) => f.from === n.key).reduce((s, f) => s + f.value, 0);
  });
  rightNodes.forEach((n) => {
    rightTotals[n.key] = flows.filter((f) => f.to === n.key).reduce((s, f) => s + f.value, 0);
  });

  const leftY = {};
  let yAcc = padding;
  leftNodes.forEach((n) => {
    leftY[n.key] = yAcc;
    yAcc += heightFor(leftTotals[n.key]) + 4;
  });
  const rightY = {};
  yAcc = padding;
  rightNodes.forEach((n) => {
    rightY[n.key] = yAcc;
    yAcc += heightFor(rightTotals[n.key]) + 4;
  });

  const leftOffsets = {};
  const rightOffsets = {};
  leftNodes.forEach((n) => { leftOffsets[n.key] = 0; });
  rightNodes.forEach((n) => { rightOffsets[n.key] = 0; });

  const flowPaths = flows.map((flow, idx) => {
    const h = heightFor(flow.value);
    const y0 = leftY[flow.from] + leftOffsets[flow.from];
    const y1 = rightY[flow.to] + rightOffsets[flow.to];
    leftOffsets[flow.from] += h;
    rightOffsets[flow.to] += h;
    const x0 = padding + nodeW;
    const x1 = padding + nodeW + colWidth;
    const cpx = (x0 + x1) / 2;
    const path = `M ${x0} ${y0} C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1} L ${x1} ${y1 + h} C ${cpx} ${y1 + h}, ${cpx} ${y0 + h}, ${x0} ${y0 + h} Z`;
    const leftNode = leftNodes.find((n) => n.key === flow.from);
    return { path, color: leftNode?.color || "#9CA3AF", flow, idx };
  });

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          {flowPaths.map((fp) => (
            <linearGradient key={fp.idx} id={`sankey-grad-${fp.idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={fp.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={fp.color} stopOpacity="0.25" />
            </linearGradient>
          ))}
        </defs>

        <g style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}>
          {flowPaths.map((fp) => (
            <path
              key={fp.idx}
              d={fp.path}
              fill={`url(#sankey-grad-${fp.idx})`}
              opacity={hoveredFlow == null || hoveredFlow === fp.idx ? 1 : 0.25}
              onMouseEnter={() => setHoveredFlow(fp.idx)}
              onMouseLeave={() => setHoveredFlow(null)}
              style={{ cursor: "pointer", transition: "opacity 200ms ease" }}
            />
          ))}
        </g>

        {leftNodes.map((n) => {
          const h = heightFor(leftTotals[n.key]);
          return (
            <g key={n.key}>
              <rect x={padding} y={leftY[n.key]} width={nodeW} height={h} fill={n.color} rx="2" />
              <text x={padding + nodeW + 6} y={leftY[n.key] + h / 2 + 4}
                    fill="#111827" fontSize="11" fontWeight="700">
                {n.label}
              </text>
              <text x={padding + nodeW + 6} y={leftY[n.key] + h / 2 + 17}
                    fill="#6B7280" fontSize="10">
                {leftTotals[n.key]}
              </text>
            </g>
          );
        })}

        {rightNodes.map((n) => {
          const h = heightFor(rightTotals[n.key]);
          return (
            <g key={n.key}>
              <rect x={padding + nodeW + colWidth} y={rightY[n.key]} width={nodeW} height={h} fill={n.color} rx="2" />
              <text x={padding + nodeW + colWidth - 6} y={rightY[n.key] + h / 2 + 4}
                    fill="#111827" fontSize="11" fontWeight="700" textAnchor="end">
                {n.label}
              </text>
              <text x={padding + nodeW + colWidth - 6} y={rightY[n.key] + h / 2 + 17}
                    fill="#6B7280" fontSize="10" textAnchor="end">
                {rightTotals[n.key]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
