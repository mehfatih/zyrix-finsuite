// ================================================================
// WellnessRing — multi-dim radar with smooth color zones
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette, getCustomerPalette, getMoneyPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function WellnessRing({ dimensions = [], size = 320, labels = {} }) {
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const palettes = [success, customer, alert, money, ai];

  if (dimensions.length === 0) {
    return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8" }}>—</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const points = dimensions.map((d, i) => {
    const r = (d.value / 100) * radius;
    const a = -Math.PI / 2 + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: labels[d.id] || d.id, value: d.value, color: palettes[i % palettes.length] };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block", maxWidth: size, marginInline: "auto" }}>
      <defs>
        <radialGradient id="wr-fill">
          <stop offset="0%" stopColor={success.chart} stopOpacity="0.20" />
          <stop offset="100%" stopColor={ai.base} stopOpacity="0.06" />
        </radialGradient>
      </defs>
      {/* concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius * f} fill="none" stroke={`${ai.base}25`} strokeDasharray={i < 3 ? "3 3" : "0"} />
      ))}
      {/* spokes */}
      {dimensions.map((_, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(a)}
            y2={cy + radius * Math.sin(a)}
            stroke={`${ai.base}20`}
          />
        );
      })}
      {/* labels */}
      {dimensions.map((d, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const lx = cx + (radius + 22) * Math.cos(a);
        const ly = cy + (radius + 22) * Math.sin(a);
        const palette = palettes[i % palettes.length];
        return (
          <g key={`label-${i}`}>
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={palette.dark}>
              {labels[d.id] || d.id}
            </text>
            <text x={lx} y={ly + 16} textAnchor="middle" fontSize="11" fontWeight="900" fill={palette.base}>
              {d.value}
            </text>
          </g>
        );
      })}
      {/* polygon */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="url(#wr-fill)"
        stroke={ai.base}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={p.color.base} stroke="#fff" strokeWidth="2">
          <title>{`${p.label}: ${p.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}
