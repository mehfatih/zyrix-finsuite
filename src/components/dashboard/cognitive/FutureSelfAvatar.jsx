// ================================================================
// FutureSelfAvatar — mirror-shimmer effect avatar
// ================================================================
import React from "react";
import { getAIPalette } from "../../../utils/dashboardPalette";

export default function FutureSelfAvatar({ name = "?", years = 5, size = 110 }) {
  const ai = getAIPalette();
  const initial = (name || "?")[0].toUpperCase();

  return (
    <div style={{ position: "relative", width: size, height: size, marginInline: "auto" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <radialGradient id="fsa-glow">
            <stop offset="0%" stopColor={ai.base} stopOpacity="0.45" />
            <stop offset="100%" stopColor={ai.base} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fsa-mirror" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ai.dark} />
            <stop offset="50%" stopColor={ai.base} />
            <stop offset="100%" stopColor={ai.chart} />
            <animate attributeName="x1" values="0%;100%;0%" dur="6s" repeatCount="indefinite" />
            <animate attributeName="x2" values="100%;200%;100%" dur="6s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={size * 0.48} fill="url(#fsa-glow)" />
        <circle cx={size / 2} cy={size / 2} r={size * 0.42} fill="url(#fsa-mirror)" stroke="#fff" strokeWidth="2" />
        <text x={size / 2} y={size / 2 + size * 0.12} textAnchor="middle" fontSize={size * 0.42} fontWeight="900" fill="#fff" style={{ textShadow: `0 0 10px ${ai.base}80`, fontFamily: "system-ui" }}>
          {initial}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: -8,
          insetInlineStart: "50%",
          transform: "translateX(-50%)",
          background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
          color: "#fff",
          fontSize: 10,
          fontWeight: 800,
          padding: "3px 10px",
          borderRadius: 999,
          letterSpacing: "0.08em",
          boxShadow: `0 4px 12px ${ai.base}60`,
          whiteSpace: "nowrap",
        }}
      >
        +{years}Y
      </div>
    </div>
  );
}
