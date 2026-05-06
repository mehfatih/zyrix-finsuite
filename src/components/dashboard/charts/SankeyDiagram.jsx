// SankeyDiagram — simple 2-column flow diagram
import React, { useMemo } from "react";
import { PALETTE_HUES, resolvePalette } from "../../../utils/dashboardPalette";

export default function SankeyDiagram({
  nodes = [],           // [{ id, label, side: 'left'|'right' }]
  links = [],           // [{ source, target, value }]
  palette,
  width = 640,
  height = 360,
  ariaLabel = "sankey",
}) {
  const p = resolvePalette(palette);
  const baseIdx = PALETTE_HUES.findIndex((h) => h.id === p.id);

  const layout = useMemo(() => {
    const left = nodes.filter((n) => n.side === "left");
    const right = nodes.filter((n) => n.side === "right");
    const padY = 24;
    const colW = 14;
    const innerH = height - padY * 2;
    const place = (arr, x) => {
      const totals = arr.map((n) =>
        links.filter((l) => l.source === n.id || l.target === n.id).reduce((s, l) => s + (Number(l.value) || 0), 0)
      );
      const sum = totals.reduce((s, v) => s + v, 0) || 1;
      const gap = 8;
      const heights = totals.map((t) => Math.max(20, ((innerH - gap * (arr.length - 1)) * t) / sum));
      let y = padY;
      const positioned = arr.map((n, i) => {
        const h = heights[i];
        const out = { ...n, x, y, w: colW, h };
        y += h + gap;
        return out;
      });
      return positioned;
    };
    return {
      left: place(left, 16),
      right: place(right, width - 16 - colW),
    };
  }, [nodes, links, width, height]);

  const byId = useMemo(() => {
    const m = {};
    [...layout.left, ...layout.right].forEach((n) => (m[n.id] = n));
    return m;
  }, [layout]);

  // assign vertical offsets within each node for incoming/outgoing edges
  const sourceOffsets = {};
  const targetOffsets = {};

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {[...layout.left, ...layout.right].map((n, i) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={3} fill={PALETTE_HUES[(baseIdx + i + 1) % PALETTE_HUES.length].base} />
          <text
            x={n.side === "left" ? n.x + n.w + 6 : n.x - 6}
            y={n.y + n.h / 2 + 4}
            textAnchor={n.side === "left" ? "start" : "end"}
            fontSize="11"
            fill="#475569"
            fontWeight="700"
          >
            {n.label}
          </text>
        </g>
      ))}
      {links.map((l, i) => {
        const s = byId[l.source];
        const t = byId[l.target];
        if (!s || !t) return null;
        const totalS = links.filter((x) => x.source === l.source).reduce((sum, x) => sum + (Number(x.value) || 0), 0) || 1;
        const totalT = links.filter((x) => x.target === l.target).reduce((sum, x) => sum + (Number(x.value) || 0), 0) || 1;
        const sH = (s.h * (Number(l.value) || 0)) / totalS;
        const tH = (t.h * (Number(l.value) || 0)) / totalT;
        const sOff = sourceOffsets[l.source] || 0;
        const tOff = targetOffsets[l.target] || 0;
        sourceOffsets[l.source] = sOff + sH;
        targetOffsets[l.target] = tOff + tH;
        const x0 = s.x + s.w;
        const y0 = s.y + sOff + sH / 2;
        const x1 = t.x;
        const y1 = t.y + tOff + tH / 2;
        const cx = (x0 + x1) / 2;
        const color = PALETTE_HUES[(baseIdx + i + 2) % PALETTE_HUES.length].base;
        return (
          <path
            key={i}
            d={`M ${x0} ${y0} C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`}
            fill="none"
            stroke={color}
            strokeOpacity="0.45"
            strokeWidth={Math.max(2, Math.min(sH, tH))}
            strokeLinecap="round"
          >
            <title>{`${s.label} → ${t.label}: ${l.value}`}</title>
          </path>
        );
      })}
    </svg>
  );
}
