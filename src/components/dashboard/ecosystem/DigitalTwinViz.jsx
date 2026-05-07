// ================================================================
// DigitalTwinViz — 3D-style holographic glow with orbiting data
// ================================================================
import React from "react";
import { getPaletteById } from "../../../utils/dashboardPalette";

export default function DigitalTwinViz({ size = 240, label = "Your Business" }) {
  const violet = getPaletteById("violet");
  const purple = getPaletteById("purple");

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div
        style={{
          position: "absolute", inset: -30, borderRadius: "50%",
          background: `radial-gradient(circle, ${violet.base}40, transparent 65%)`,
          filter: "blur(20px)",
          animation: "twHalo 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <svg viewBox="0 0 240 240" width={size} height={size} style={{ display: "block", position: "relative", zIndex: 1 }}>
        <defs>
          <radialGradient id="twCore" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.4" stopColor={violet.base} stopOpacity="0.85" />
            <stop offset="1" stopColor={purple.dark} stopOpacity="0.7" />
          </radialGradient>
          <linearGradient id="twRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={violet.base} />
            <stop offset="1" stopColor={purple.base} />
          </linearGradient>
        </defs>

        {/* Outer holographic rings */}
        {[110, 95, 78].map((r, i) => (
          <ellipse
            key={r}
            cx="120" cy="120"
            rx={r} ry={r * 0.32 + i * 4}
            fill="none"
            stroke="url(#twRing)"
            strokeWidth="1.2"
            strokeOpacity={0.5 - i * 0.1}
            style={{ animation: `twRing${i} 6s linear infinite`, transformOrigin: "120px 120px" }}
          />
        ))}

        {/* Pulsing core */}
        <circle cx="120" cy="120" r="48" fill="url(#twCore)" style={{ animation: "twCorePulse 3s ease-in-out infinite", transformOrigin: "120px 120px" }} />

        {/* Orbiting data dots */}
        {Array.from({ length: 6 }).map((_, i) => {
          const ang = (i / 6) * Math.PI * 2;
          const r = 80;
          return (
            <g key={i} style={{ animation: `twOrbit 8s linear infinite`, transformOrigin: "120px 120px" }}>
              <circle
                cx={120 + Math.cos(ang) * r}
                cy={120 + Math.sin(ang) * r * 0.5}
                r="4"
                fill={violet.base}
                style={{ filter: `drop-shadow(0 0 4px ${violet.base})` }}
              />
            </g>
          );
        })}

        {/* Glints */}
        <g>
          <circle cx="100" cy="106" r="14" fill="#fff" opacity="0.6" />
          <circle cx="98" cy="104" r="6" fill="#fff" opacity="0.85" />
        </g>
      </svg>

      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -18, textAlign: "center", fontSize: 10, fontWeight: 800, color: violet.dark, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {label}
        </div>
      )}

      <style>{`
        @keyframes twHalo { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes twCorePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes twRing0 { from { transform: rotate(0deg) skewY(2deg); } to { transform: rotate(360deg) skewY(2deg); } }
        @keyframes twRing1 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes twRing2 { from { transform: rotate(0deg) skewX(-3deg); } to { transform: rotate(360deg) skewX(-3deg); } }
        @keyframes twOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
