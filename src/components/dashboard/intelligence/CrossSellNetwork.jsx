// ================================================================
// CrossSellNetwork — animated radial product graph
// Wraps charts/ForceGraph if available, else renders a SVG fan-network.
// ================================================================
import React, { useMemo } from "react";
import { resolvePalette, getCustomerPalette, getMoneyPalette, getAIPalette, paletteSequence } from "../../../utils/dashboardPalette";

export default function CrossSellNetwork({ products = [], links = [], palette, height = 320 }) {
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const ai = getAIPalette();
  const p = resolvePalette(palette || customer);

  // Build a simple radial layout
  const nodes = useMemo(() => {
    if (!products.length) return [];
    const cx = 250;
    const cy = height / 2;
    const palettes = paletteSequence(products.length, { exclude: ["wine"] });
    const center = products[0];
    const others = products.slice(1);
    const out = [{
      ...center,
      x: cx,
      y: cy,
      r: 32,
      palette: palettes[0],
      isCenter: true,
    }];
    others.forEach((prod, i) => {
      const angle = (i / Math.max(1, others.length)) * Math.PI * 2 - Math.PI / 2;
      const dist = 130 + (i % 2 === 0 ? 0 : 16);
      out.push({
        ...prod,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 22,
        palette: palettes[i + 1] || palettes[0],
      });
    });
    return out;
  }, [products, height]);

  if (!products.length) {
    return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>No data</div>;
  }

  const center = nodes[0];
  const linkRecords = links.length > 0 ? links : nodes.slice(1).map((n) => ({ source: 0, target: nodes.indexOf(n), strength: n.strength || 0.6 }));

  return (
    <svg viewBox={`0 0 500 ${height}`} width="100%" style={{ display: "block" }}>
      <defs>
        <radialGradient id="csn-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.base} stopOpacity="0.10" />
          <stop offset="100%" stopColor={p.base} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="500" height={height} fill="url(#csn-bg)" />

      {/* Links */}
      {linkRecords.map((lk, i) => {
        const a = nodes[lk.source];
        const b = nodes[lk.target];
        if (!a || !b) return null;
        const strength = lk.strength || 0.5;
        return (
          <line
            key={`l-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={ai.base}
            strokeWidth={1 + strength * 3}
            opacity={0.4 + strength * 0.4}
            strokeLinecap="round"
            style={{ animation: `csnPulse 3s ease-in-out ${i * 0.2}s infinite` }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r + 6}
            fill={n.palette.base}
            opacity="0.18"
            style={{ animation: n.isCenter ? "csnPulseR 2s ease-in-out infinite" : "none" }}
          />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={`url(#csn-grad-${i})`}
            stroke={n.palette.dark}
            strokeWidth="2"
          />
          <defs>
            <radialGradient id={`csn-grad-${i}`}>
              <stop offset="0%" stopColor={n.palette.base} />
              <stop offset="100%" stopColor={n.palette.dark} />
            </radialGradient>
          </defs>
          <text
            x={n.x}
            y={n.y + n.r + 14}
            textAnchor="middle"
            fontSize={n.isCenter ? 12 : 10}
            fontWeight={n.isCenter ? "800" : "600"}
            fill="#0F172A"
          >
            {n.name}
          </text>
          {n.attached != null && (
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="800">
              {n.attached}%
            </text>
          )}
        </g>
      ))}

      <style>{`
        @keyframes csnPulse {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }
        @keyframes csnPulseR {
          0%,100% { opacity: 0.15; r: ${center?.r + 6}; }
          50% { opacity: 0.35; r: ${center?.r + 14}; }
        }
      `}</style>
    </svg>
  );
}
