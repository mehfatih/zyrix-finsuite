// ================================================================
// SignalRadar — 47-signal radar with category groupings + severity dots
// Renders as a circular polar plot. Each spoke = signal; length = score.
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getAIPalette, getPaletteById } from "../../../utils/dashboardPalette";

export default function SignalRadar({ signals = [], size = 420 }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();

  if (!signals || signals.length === 0) {
    return <div style={{ height: size, display: "grid", placeItems: "center", color: "#94A3B8" }}>No signals</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;

  // Build radial points
  const angleStep = (Math.PI * 2) / signals.length;
  const polygonPts = signals
    .map((s, i) => {
      const r = (s.score / 100) * radius;
      const a = -Math.PI / 2 + i * angleStep;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block", maxWidth: size, marginInline: "auto" }}>
      <defs>
        <radialGradient id="sr-grad">
          <stop offset="0%" stopColor={ai.base} stopOpacity="0.25" />
          <stop offset="100%" stopColor={ai.base} stopOpacity="0.05" />
        </radialGradient>
      </defs>
      {/* Concentric grid */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius * f} fill={i === 3 ? "url(#sr-grad)" : "none"} stroke={`${ai.base}25`} strokeDasharray={i < 3 ? "3 4" : "0"} />
      ))}
      {/* Spokes */}
      {signals.map((s, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(a)}
            y2={cy + radius * Math.sin(a)}
            stroke={`${ai.base}15`}
          />
        );
      })}
      {/* Filled polygon */}
      <polygon
        points={polygonPts}
        fill={`${ai.base}25`}
        stroke={ai.base}
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 8px ${ai.base}50)`, animation: "srPulse 4s ease-in-out infinite" }}
      />
      {/* Severity dots */}
      {signals.map((s, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const r = (s.score / 100) * radius;
        const palette = s.severity === "healthy" ? success : s.severity === "warning" ? warn : alert;
        return (
          <g key={`dot-${i}`}>
            <circle cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r="3.5" fill={palette.base} stroke="#fff" strokeWidth="1">
              <title>{`${s.name}: ${s.score}/100 · ${s.severity}`}</title>
            </circle>
          </g>
        );
      })}
      <style>{`
        @keyframes srPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
