// ================================================================
// AnimatedGeoBubbles — SVG choropleth-style map of MENA + Türkiye.
// (Filename kept from prior round so CustomerOverviewPage import
// doesn't need to change; visualisation is now a real spatial map,
// not a list of rows.)
// Bubbles are positioned over each country, sized by customer count,
// pulse on a 2.4s loop, and reveal a tooltip on hover.
// ================================================================
import React, { useState, useEffect } from "react";

// Approximate geographic positions on a 400x260 SVG canvas
// (Türkiye top, Saudi/UAE/Qatar right-center, Egypt bottom-left).
const COUNTRY_POSITIONS = {
  TR: { x: 165, y: 60,  label: "Turkey" },
  EG: { x: 95,  y: 200, label: "Egypt" },
  SA: { x: 230, y: 175, label: "Saudi" },
  AE: { x: 305, y: 175, label: "UAE" },
  QA: { x: 270, y: 158, label: "Qatar" },
  // Fallbacks for other potential codes
  KW: { x: 250, y: 135, label: "Kuwait" },
  BH: { x: 268, y: 168, label: "Bahrain" },
  OM: { x: 330, y: 200, label: "Oman" },
  JO: { x: 175, y: 145, label: "Jordan" },
  LB: { x: 168, y: 130, label: "Lebanon" },
  IQ: { x: 215, y: 120, label: "Iraq" },
  IR: { x: 280, y: 110, label: "Iran" },
};

export default function AnimatedGeoBubbles({ regions }) {
  const max = Math.max(1, ...regions.map((r) => r.count));
  const [appeared, setAppeared] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setAppeared([]);
    const timers = regions.map((_, i) =>
      setTimeout(() => setAppeared((arr) => [...arr, i]), i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, [regions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* SVG MAP */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, rgba(45,212,191,0.01) 100%)",
        borderRadius: "12px",
        padding: "12px",
        border: "1px solid rgba(45,212,191,0.15)",
      }}>
        <svg viewBox="0 0 400 260" width="100%" height="200" style={{ display: "block" }}>
          <defs>
            <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(45,212,191,0.08)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="bubble-grad-active">
              <stop offset="0%"   stopColor="#2DD4BF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.4" />
            </radialGradient>
            <radialGradient id="bubble-grad-default">
              <stop offset="0%"   stopColor="#2DD4BF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          <rect width="400" height="260" fill="url(#geo-grid)" />

          <text x="200" y="20" fill="rgba(45,212,191,0.5)" fontSize="10" fontWeight="700"
                textAnchor="middle" letterSpacing="2">
            MENA · TÜRKİYE
          </text>

          {regions.map((region, i) => {
            const pos = COUNTRY_POSITIONS[region.code];
            if (!pos) return null;
            const isVisible = appeared.includes(i);
            const isHovered = hovered === region.code;
            const radius = 8 + (region.count / max) * 18; // 8-26px

            return (
              <g
                key={region.code}
                onMouseEnter={() => setHovered(region.code)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0.3)",
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transition: "opacity 500ms ease, transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="1.5"
                  opacity="0.6"
                  style={{
                    animation: "geo-pulse 2.4s ease-in-out infinite",
                    animationDelay: `${i * 0.3}s`,
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                  }}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={isHovered ? "url(#bubble-grad-active)" : "url(#bubble-grad-default)"}
                  stroke="#2DD4BF"
                  strokeWidth={isHovered ? 2 : 1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                  style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                >
                  {region.code}
                </text>
                {isHovered && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={pos.x - 45}
                      y={pos.y - radius - 32}
                      width="90"
                      height="24"
                      rx="6"
                      fill="#111827"
                      opacity="0.95"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - radius - 16}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {region.name}: {region.count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <style>{`
          @keyframes geo-pulse {
            0%, 100% { transform: scale(1);   opacity: 0.6; }
            50%      { transform: scale(1.4); opacity: 0;   }
          }
        `}</style>
      </div>

      {/* Compact pill legend below */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {regions.map((region) => (
          <div
            key={region.code}
            onMouseEnter={() => setHovered(region.code)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: hovered === region.code ? "rgba(45,212,191,0.15)" : "rgba(45,212,191,0.05)",
              border: `1px solid rgba(45,212,191,${hovered === region.code ? 0.5 : 0.2})`,
              borderRadius: "999px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            <span style={{ fontWeight: 700, color: "#2DD4BF" }}>{region.code}</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>{region.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
