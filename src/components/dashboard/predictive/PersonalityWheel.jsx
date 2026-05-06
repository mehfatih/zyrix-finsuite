// ================================================================
// PersonalityWheel — 5-trait radar with animated reveal
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getCustomerPalette, getMoneyPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function PersonalityWheel({
  traits = [],
  size = 280,
  labels = {},
}) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const palettes = [ai, customer, money, success, alert];

  const [progress, setProgress] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setProgress(1);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(traits)]);

  if (traits.length === 0) {
    return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8" }}>—</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;

  const angleStep = (Math.PI * 2) / traits.length;
  const points = traits.map((tr, i) => {
    const r = ((tr.value || 0) / 100) * radius * progress;
    const a = -Math.PI / 2 + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: labels[tr.id] || tr.id, value: tr.value, color: palettes[i % palettes.length] };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block", maxWidth: size, marginInline: "auto" }}>
      <defs>
        <radialGradient id="pw-fill">
          <stop offset="0%" stopColor={ai.base} stopOpacity="0.18" />
          <stop offset="100%" stopColor={ai.base} stopOpacity="0.06" />
        </radialGradient>
      </defs>
      {/* Concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius * f} fill="none" stroke={`${ai.base}25`} strokeDasharray={i < 3 ? "3 3" : "0"} />
      ))}
      {/* Spokes + labels */}
      {traits.map((tr, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const lx = cx + (radius + 16) * Math.cos(a);
        const ly = cy + (radius + 16) * Math.sin(a);
        const label = labels[tr.id] || tr.id;
        return (
          <g key={`label-${i}`}>
            <line x1={cx} y1={cy} x2={cx + radius * Math.cos(a)} y2={cy + radius * Math.sin(a)} stroke={`${ai.base}20`} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={ai.dark}>
              {label} <tspan fill={palettes[i % palettes.length].base} fontWeight="800">{tr.value}</tspan>
            </text>
          </g>
        );
      })}
      {/* Filled polygon */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={`${ai.base}25`}
        stroke={ai.base}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Trait dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill={p.color.base} stroke="#fff" strokeWidth="1.5">
          <title>{`${p.label}: ${p.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}
