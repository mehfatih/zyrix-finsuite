// ================================================================
// AnimatedPodium — animated treemap (squarified layout).
// (Filename kept from prior round so CustomerOverviewPage import
// doesn't need to change; visualisation is now nested rectangles
// with area proportional to MRR, not a row list.)
// Top 3 cells get gold/silver/bronze; smaller cells fall back to
// tier color. Hover reveals a tooltip when the cell is too small
// to render its own labels.
// ================================================================
import React, { useState, useEffect } from "react";

// Squarified treemap layout (good enough for 6-12 items).
function squarify(items, x, y, width, height) {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, w: width, h: height }];
  }

  const total = items.reduce((s, it) => s + it.value, 0);
  const half = total / 2;
  let acc = 0;
  let splitIdx = 0;
  for (let i = 0; i < items.length; i++) {
    acc += items[i].value;
    if (acc >= half) { splitIdx = i + 1; break; }
  }
  splitIdx = Math.max(1, Math.min(items.length - 1, splitIdx));

  const left  = items.slice(0, splitIdx);
  const right = items.slice(splitIdx);
  const leftSum  = left.reduce((s, it) => s + it.value, 0);

  const horizontal = width >= height;
  if (horizontal) {
    const leftW = (leftSum / total) * width;
    return [
      ...squarify(left,  x,         y, leftW,         height),
      ...squarify(right, x + leftW, y, width - leftW, height),
    ];
  }
  const topH = (leftSum / total) * height;
  return [
    ...squarify(left,  x, y,        width, topH),
    ...squarify(right, x, y + topH, width, height - topH),
  ];
}

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const TIER_FALLBACK_COLORS = {
  "Enterprise": "#E30A17",
  "Business":   "#7C3AED",
  "Pro":        "#1A56DB",
  "Lite":       "#6B7280",
};

const colorFor = (item, idx) => {
  if (idx < 3) return RANK_COLORS[idx];
  return TIER_FALLBACK_COLORS[item.tier] || "#9CA3AF";
};

export default function AnimatedPodium({
  customers,
  // Optional formatter for the cell amount label. Defaults to
  // `₺{mrr.toLocaleString()}` so Customer/Revenue Overview keep their
  // currency rendering. Support page passes `(v) => `${v} tickets`,
  // System page `(v) => `${(v/1000).toFixed(1)}K req`, etc.
  valueFormatter,
}) {
  const fmt = (v) => (valueFormatter ? valueFormatter(v) : `₺${v.toLocaleString()}`);
  const [appeared, setAppeared] = useState([]);
  const [hovered, setHovered] = useState(null);

  const W = 380;
  const H = 240;

  const itemsForLayout = customers.map((c, i) => ({
    ...c, value: c.mrr, _idx: i,
  }));
  const layout = squarify(itemsForLayout, 0, 0, W, H);

  useEffect(() => {
    setAppeared([]);
    const timers = customers.map((_, i) =>
      setTimeout(() => setAppeared((arr) => [...arr, i]), i * 90)
    );
    return () => timers.forEach(clearTimeout);
  }, [customers]);

  return (
    <div>
      <div style={{
        background: "linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.01) 100%)",
        borderRadius: "12px",
        padding: "6px",
        border: "1px solid rgba(255,215,0,0.2)",
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="240" style={{ display: "block" }}>
          {layout.map((cell) => {
            const original = customers[cell._idx];
            const isVisible = appeared.includes(cell._idx);
            const isHovered = hovered === original.id;
            const color = colorFor(original, cell._idx);
            const showLabel = cell.w > 70 && cell.h > 40;
            const showSubLabel = cell.w > 100 && cell.h > 60;
            const rankIcon = cell._idx === 0 ? "🥇" : cell._idx === 1 ? "🥈" : cell._idx === 2 ? "🥉" : "";

            return (
              <g
                key={original.id}
                onMouseEnter={() => setHovered(original.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 500ms ease",
                }}
              >
                <rect
                  x={cell.x + 2}
                  y={cell.y + 2}
                  width={Math.max(0, cell.w - 4)}
                  height={Math.max(0, cell.h - 4)}
                  rx={6}
                  fill={color}
                  fillOpacity={isHovered ? 0.95 : 0.78}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "fill-opacity 200ms ease" }}
                />
                {rankIcon && cell.w > 36 && cell.h > 36 && (
                  <text
                    x={cell.x + 10}
                    y={cell.y + 22}
                    fontSize={cell._idx === 0 ? 18 : 14}
                    style={{ pointerEvents: "none" }}
                  >
                    {rankIcon}
                  </text>
                )}
                {showLabel && (
                  <text
                    x={cell.x + (cell._idx < 3 ? 32 : 10)}
                    y={cell.y + 22}
                    fill="#FFFFFF"
                    fontSize={cell.w > 140 ? 13 : 11}
                    fontWeight="800"
                    style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {original.name.length > Math.floor(cell.w / 8)
                      ? original.name.slice(0, Math.floor(cell.w / 8) - 1) + "…"
                      : original.name}
                  </text>
                )}
                {showSubLabel && (
                  <>
                    <text
                      x={cell.x + 10}
                      y={cell.y + cell.h - 28}
                      fill="rgba(255,255,255,0.85)"
                      fontSize="10"
                      fontWeight="700"
                      style={{ pointerEvents: "none" }}
                    >
                      {original.tier}
                    </text>
                    <text
                      x={cell.x + 10}
                      y={cell.y + cell.h - 12}
                      fill="#FFFFFF"
                      fontSize={cell.w > 140 ? 16 : 13}
                      fontWeight="800"
                      style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {fmt(original.mrr)}
                    </text>
                  </>
                )}

                {isHovered && !showSubLabel && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={cell.x + cell.w / 2 - 60}
                      y={cell.y + cell.h / 2 - 20}
                      width="120"
                      height="40"
                      rx="6"
                      fill="#111827"
                      opacity="0.95"
                    />
                    <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 - 4} fill="#FFFFFF"
                          fontSize="11" fontWeight="700" textAnchor="middle">
                      {original.name}
                    </text>
                    <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 10} fill="#9CA3AF"
                          fontSize="10" textAnchor="middle">
                      {fmt(original.mrr)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Top-3 medal strip below */}
      <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
        {customers.slice(0, 3).map((c, i) => (
          <div
            key={c.id}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1,
              padding: "6px 10px",
              background: `${RANK_COLORS[i]}15`,
              border: `1px solid ${RANK_COLORS[i]}50`,
              borderRadius: "8px",
              fontSize: "11px",
              cursor: "pointer",
              minWidth: 0,
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 700,
              color: RANK_COLORS[i] === "#C0C0C0" ? "#6B7280" : RANK_COLORS[i],
            }}>
              <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>{c.name}</span>
            </div>
            <div style={{ color: "#111827", fontWeight: 800, marginTop: "2px" }}>
              {fmt(c.mrr)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
