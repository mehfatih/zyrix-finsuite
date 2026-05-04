import React from "react";

export default function KingdomTower() {
  return (
    <div style={{
      position: "absolute",
      right: "-3%",
      bottom: "-2%",
      width: "55%",
      height: "85%",
      pointerEvents: "none",
      zIndex: 1,
      opacity: 0.12,
      mixBlendMode: "screen",
    }}>
      <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="kingdomGrad" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="60%" stopColor="rgba(220, 240, 230, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 108, 53, 0)" />
          </linearGradient>
          <linearGradient id="kingdomGlow" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Main tower body — tapered rectangle (the iconic shape with the hole at top) */}
        {/* Left wall going up */}
        <path d="M 240 800 L 240 280 L 280 180 L 280 800 Z" fill="url(#kingdomGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        {/* Right wall going up */}
        <path d="M 360 800 L 360 280 L 320 180 L 320 800 Z" fill="url(#kingdomGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        {/* Top arch connecting the two walls (the iconic hole/inverted arch) */}
        <path d="M 280 180 L 280 280 Q 300 250 320 280 L 320 180 L 280 180 Z" fill="url(#kingdomGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* Bridge/sky-walk between the two walls (the famous suspended deck) */}
        <rect x="245" y="240" width="110" height="14" fill="rgba(255,255,255,0.35)" rx="2" />
        <line x1="245" y1="247" x2="355" y2="247" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />

        {/* Antenna spire on top */}
        <line x1="300" y1="180" x2="300" y2="120" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <circle cx="300" cy="118" r="2" fill="rgba(255,255,255,0.6)" />

        {/* Windows pattern — horizontal lines suggesting floors */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="244" y1={300 + i * 20} x2="356" y2={300 + i * 20} stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        ))}

        {/* Glow at base */}
        <ellipse cx="300" cy="800" rx="180" ry="40" fill="url(#kingdomGlow)" opacity="0.4" />
      </svg>
    </div>
  );
}
