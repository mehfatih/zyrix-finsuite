// Sunburst — concentric arc hierarchy (2-level)
import React, { useEffect, useRef, useState } from "react";
import { PALETTE_HUES, resolvePalette } from "../../../utils/dashboardPalette";

function arcPath(cx, cy, rIn, rOut, a0, a1) {
  const x0 = cx + rOut * Math.cos(a0);
  const y0 = cy + rOut * Math.sin(a0);
  const x1 = cx + rOut * Math.cos(a1);
  const y1 = cy + rOut * Math.sin(a1);
  const x2 = cx + rIn * Math.cos(a1);
  const y2 = cy + rIn * Math.sin(a1);
  const x3 = cx + rIn * Math.cos(a0);
  const y3 = cy + rIn * Math.sin(a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${rOut} ${rOut} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${rIn} ${rIn} 0 ${large} 0 ${x3} ${y3} Z`;
}

export default function Sunburst({
  data = [],            // [{ label, value, children?: [{ label, value }] }]
  palette,
  size = 320,
  ariaLabel = "sunburst",
}) {
  const p = resolvePalette(palette);
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

  if (!data || !data.length) return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data yet</div>;
  const cx = size / 2;
  const cy = size / 2;
  const r0 = size * 0.16;
  const r1 = size * 0.30;
  const r2 = size * 0.46;
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  const baseIdx = PALETTE_HUES.findIndex((h) => h.id === p.id);

  let acc = 0;
  return (
    <svg width={size} height={size} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={r0} fill={p.base} fillOpacity="0.9" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={size * 0.085} fontWeight="800" fill="#fff">
        {Math.round(total).toLocaleString()}
      </text>
      {data.map((d, i) => {
        const f = ((Number(d.value) || 0) / total) * prog;
        const a0 = -Math.PI / 2 + acc * 2 * Math.PI;
        const a1 = a0 + f * 2 * Math.PI;
        acc += (Number(d.value) || 0) / total;
        const fill = PALETTE_HUES[(baseIdx + i + 1) % PALETTE_HUES.length].base;

        // children
        let childAcc = a0;
        const totChild = (d.children || []).reduce((s, c) => s + (Number(c.value) || 0), 0) || 1;

        return (
          <g key={i}>
            <path d={arcPath(cx, cy, r0, r1, a0, Math.max(a0 + 0.001, a1))} fill={fill} fillOpacity="0.9">
              <title>{`${d.label}: ${d.value}`}</title>
            </path>
            {(d.children || []).map((c, j) => {
              const fc = ((Number(c.value) || 0) / totChild) * (a1 - a0);
              const ca0 = childAcc;
              const ca1 = childAcc + fc;
              childAcc += fc;
              return (
                <path
                  key={j}
                  d={arcPath(cx, cy, r1, r2, ca0, Math.max(ca0 + 0.001, ca1))}
                  fill={fill}
                  fillOpacity={0.55}
                  stroke="#fff"
                  strokeWidth="1"
                >
                  <title>{`${d.label} / ${c.label}: ${c.value}`}</title>
                </path>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
