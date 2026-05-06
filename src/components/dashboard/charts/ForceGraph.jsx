// ForceGraph — small force-directed network (custom mini physics, no d3)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PALETTE_HUES, resolvePalette } from "../../../utils/dashboardPalette";

export default function ForceGraph({
  nodes = [],           // [{ id, label, group?, size? }]
  links = [],           // [{ source, target, weight? }]
  palette,
  width = 540,
  height = 380,
  iterations = 220,
  ariaLabel = "network graph",
}) {
  const p = resolvePalette(palette);
  const baseIdx = PALETTE_HUES.findIndex((h) => h.id === p.id);
  const [positions, setPositions] = useState([]);
  const computedRef = useRef(false);

  // Build initial positions on a circle, then simulate spring forces synchronously.
  const computed = useMemo(() => {
    if (!nodes.length) return [];
    const N = nodes.length;
    const pos = nodes.map((n, i) => ({
      id: n.id,
      x: width / 2 + Math.cos((i / N) * Math.PI * 2) * Math.min(width, height) * 0.32,
      y: height / 2 + Math.sin((i / N) * Math.PI * 2) * Math.min(width, height) * 0.32,
      vx: 0,
      vy: 0,
    }));
    const idx = {};
    pos.forEach((pp, i) => (idx[pp.id] = i));
    const linkPairs = links
      .map((l) => ({ a: idx[l.source], b: idx[l.target], k: 0.04 * (l.weight || 1) }))
      .filter((l) => l.a !== undefined && l.b !== undefined);

    const repulse = 1400;
    const center = 0.012;
    const damping = 0.85;
    const targetLen = Math.min(width, height) * 0.18;

    for (let it = 0; it < iterations; it++) {
      // repulsion
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const d2 = dx * dx + dy * dy + 0.01;
          const f = repulse / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          pos[i].vx -= fx;
          pos[i].vy -= fy;
          pos[j].vx += fx;
          pos[j].vy += fy;
        }
      }
      // spring links
      linkPairs.forEach((lp) => {
        const a = pos[lp.a];
        const b = pos[lp.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - targetLen) * lp.k;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });
      // gravity to center + integrate
      pos.forEach((pp) => {
        pp.vx += (width / 2 - pp.x) * center;
        pp.vy += (height / 2 - pp.y) * center;
        pp.vx *= damping;
        pp.vy *= damping;
        pp.x += pp.vx;
        pp.y += pp.vy;
      });
    }
    return pos;
  }, [nodes, links, width, height, iterations]);

  useEffect(() => {
    setPositions(computed);
    computedRef.current = true;
  }, [computed]);

  if (!nodes.length) return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No nodes</div>;
  if (!positions.length) return null;

  const idx = {};
  positions.forEach((pp, i) => (idx[pp.id] = i));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      {links.map((l, i) => {
        const a = positions[idx[l.source]];
        const b = positions[idx[l.target]];
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#CBD5E1"
            strokeWidth={Math.max(1, l.weight || 1)}
            strokeOpacity="0.7"
          />
        );
      })}
      {nodes.map((n, i) => {
        const pos = positions[idx[n.id]];
        if (!pos) return null;
        const r = n.size || 10;
        const fill = PALETTE_HUES[(baseIdx + (n.group || i) + 1) % PALETTE_HUES.length].base;
        return (
          <g key={n.id}>
            <circle cx={pos.x} cy={pos.y} r={r} fill={fill} stroke="#fff" strokeWidth="2">
              <title>{n.label || n.id}</title>
            </circle>
            <text x={pos.x} y={pos.y + r + 12} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">
              {n.label || n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
