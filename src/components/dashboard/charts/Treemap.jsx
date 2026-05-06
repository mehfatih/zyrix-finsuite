// Treemap — squarified tile layout (palette varies by index)
import React, { useMemo } from "react";
import { PALETTE_HUES, resolvePalette } from "../../../utils/dashboardPalette";

function squarify(items, x, y, w, h) {
  const total = items.reduce((s, it) => s + it.value, 0) || 1;
  const tiles = [];
  const remaining = items.slice();
  let rectX = x, rectY = y, rectW = w, rectH = h;
  let restValue = total;

  while (remaining.length) {
    if (remaining.length === 1) {
      const it = remaining.shift();
      tiles.push({ x: rectX, y: rectY, w: rectW, h: rectH, item: it });
      break;
    }
    const horiz = rectW >= rectH;
    let row = [];
    let bestRatio = Infinity;
    let i = 0;
    while (i < remaining.length) {
      row.push(remaining[i]);
      const sumRow = row.reduce((s, it) => s + it.value, 0);
      const lengthAlong = horiz ? rectH : rectW;
      const lengthCross = horiz ? rectW : rectH;
      const cross = (sumRow / restValue) * lengthCross;
      const ratio = row.reduce((mx, it) => {
        const along = (it.value / sumRow) * lengthAlong;
        const r = Math.max(along / cross, cross / along);
        return Math.max(mx, r);
      }, 0);
      if (ratio < bestRatio) {
        bestRatio = ratio;
        i++;
      } else {
        row.pop();
        break;
      }
    }
    if (!row.length) row = [remaining[0]];

    const sumRow = row.reduce((s, it) => s + it.value, 0);
    const lengthAlong = horiz ? rectH : rectW;
    const lengthCross = horiz ? rectW : rectH;
    const cross = (sumRow / restValue) * lengthCross;
    let along = 0;
    row.forEach((it) => {
      const len = (it.value / sumRow) * lengthAlong;
      if (horiz) {
        tiles.push({ x: rectX, y: rectY + along, w: cross, h: len, item: it });
      } else {
        tiles.push({ x: rectX + along, y: rectY, w: len, h: cross, item: it });
      }
      along += len;
    });
    if (horiz) {
      rectX += cross;
      rectW -= cross;
    } else {
      rectY += cross;
      rectH -= cross;
    }
    restValue -= sumRow;
    remaining.splice(0, row.length);
  }
  return tiles;
}

export default function Treemap({
  data = [],            // [{ label, value, color? }]
  palette,
  width = 600,
  height = 320,
  ariaLabel = "treemap",
}) {
  const p = resolvePalette(palette);
  const sorted = useMemo(
    () => data.slice().sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)).filter((d) => Number(d.value) > 0),
    [data]
  );
  const tiles = useMemo(() => squarify(sorted, 0, 0, width, height), [sorted, width, height]);
  const total = sorted.reduce((s, it) => s + it.value, 0) || 1;
  const baseIdx = PALETTE_HUES.findIndex((h) => h.id === p.id);

  if (!sorted.length) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {tiles.map((t, i) => {
        const fill = t.item.color || PALETTE_HUES[(baseIdx + i + 1) % PALETTE_HUES.length].base;
        const showLabel = t.w > 60 && t.h > 32;
        const pct = Math.round(((t.item.value || 0) / total) * 100);
        return (
          <g key={i}>
            <rect x={t.x + 1} y={t.y + 1} width={Math.max(0, t.w - 2)} height={Math.max(0, t.h - 2)} rx={6} fill={fill} fillOpacity="0.9">
              <title>{`${t.item.label}: ${t.item.value}`}</title>
            </rect>
            {showLabel && (
              <text x={t.x + 8} y={t.y + 16} fontSize="11" fill="#fff" fontWeight="700">
                {t.item.label}
              </text>
            )}
            {showLabel && (
              <text x={t.x + 8} y={t.y + 32} fontSize="14" fill="#fff" fontWeight="800">
                {pct}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
