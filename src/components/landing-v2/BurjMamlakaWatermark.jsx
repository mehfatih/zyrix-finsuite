import React from "react";

/**
 * Heavy decorative watermark of Burj Al-Mamlaka (Kingdom Tower)
 * Used as a visible-but-subtle backdrop in section dividers.
 */
export default function BurjMamlakaWatermark({ side = "right" }) {
  const positionStyle = side === "right"
    ? { right: "-8%", top: "10%" }
    : { left: "-8%", top: "10%" };

  return (
    <div style={{
      position: "absolute",
      ...positionStyle,
      width: 420,
      height: 620,
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.07,
      transform: side === "left" ? "scaleX(-1)" : "none",
    }}>
      <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="bmwBody" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#006C35" />
            <stop offset="60%" stopColor="#004D26" />
            <stop offset="100%" stopColor="#002A14" />
          </linearGradient>
          <linearGradient id="bmwAccent" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#0A8F45" />
            <stop offset="100%" stopColor="#006C35" />
          </linearGradient>
        </defs>

        {/* Tower base/foundation */}
        <rect x="140" y="540" width="120" height="60" fill="url(#bmwBody)" />
        <rect x="120" y="560" width="160" height="40" fill="url(#bmwBody)" opacity="0.7" />

        {/* Left wall - tapered */}
        <path d="M 140 540 L 140 200 L 175 110 L 175 540 Z"
              fill="url(#bmwBody)" stroke="#0A8F45" strokeWidth="1.5" />

        {/* Right wall - tapered */}
        <path d="M 260 540 L 260 200 L 225 110 L 225 540 Z"
              fill="url(#bmwBody)" stroke="#0A8F45" strokeWidth="1.5" />

        {/* The iconic inverted arch at top (the "hole") */}
        <path d="M 175 110 L 175 200 Q 200 175 225 200 L 225 110 Z"
              fill="url(#bmwAccent)" stroke="#0A8F45" strokeWidth="1.5" />

        {/* Suspended sky-bridge — the famous observation deck */}
        <rect x="143" y="178" width="114" height="12" fill="url(#bmwAccent)" rx="2" />
        <rect x="143" y="178" width="114" height="3" fill="#0A8F45" rx="1" />

        {/* Antenna spire */}
        <line x1="200" y1="110" x2="200" y2="40" stroke="#0A8F45" strokeWidth="3" />
        <circle cx="200" cy="38" r="4" fill="#0A8F45" />
        <line x1="200" y1="60" x2="200" y2="40" stroke="#0EA571" strokeWidth="1" />

        {/* Window rows on left wall */}
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={"wl" + i} x1="142" y1={220 + i * 14} x2="173" y2={220 + i * 14}
                stroke="rgba(10, 143, 69, 0.45)" strokeWidth="0.8" />
        ))}

        {/* Window rows on right wall */}
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={"wr" + i} x1="227" y1={220 + i * 14} x2="258" y2={220 + i * 14}
                stroke="rgba(10, 143, 69, 0.45)" strokeWidth="0.8" />
        ))}

        {/* Vertical highlight lines */}
        <line x1="155" y1="200" x2="155" y2="540" stroke="#0EA571" strokeWidth="0.6" opacity="0.5" />
        <line x1="245" y1="200" x2="245" y2="540" stroke="#0EA571" strokeWidth="0.6" opacity="0.5" />

        {/* Subtle ground glow */}
        <ellipse cx="200" cy="600" rx="180" ry="20" fill="#0A8F45" opacity="0.3" />
      </svg>
    </div>
  );
}
