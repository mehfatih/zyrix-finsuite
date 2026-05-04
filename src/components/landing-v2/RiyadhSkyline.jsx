import React from "react";

export default function RiyadhSkyline() {
  return (
    <div style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "55%",
      pointerEvents: "none",
      zIndex: 1,
      opacity: 0.32,
      mixBlendMode: "screen",
    }}>
      <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="skyGlow" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 200, 100, 0.15)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 60, 30, 0)" />
          </linearGradient>
          <linearGradient id="towerFade" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
          </linearGradient>
          <filter id="skyBlur">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Atmospheric haze */}
        <rect x="0" y="0" width="1600" height="600" fill="url(#skyGlow)" />

        <g filter="url(#skyBlur)">
          {/* Far-left buildings — small filler */}
          <rect x="40" y="450" width="60" height="150" fill="url(#towerFade)" />
          <rect x="110" y="420" width="50" height="180" fill="url(#towerFade)" />
          <rect x="170" y="470" width="45" height="130" fill="url(#towerFade)" />

          {/* Al Faisaliah Tower (tower with the ball/sphere) */}
          <g transform="translate(280 0)">
            <path d="M 0 600 L 0 280 L 40 240 L 40 600 Z" fill="url(#towerFade)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            <circle cx="20" cy="225" r="22" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            <circle cx="20" cy="225" r="14" fill="rgba(255,255,255,0.4)" />
            <line x1="20" y1="200" x2="20" y2="160" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="20" cy="158" r="2" fill="rgba(255,255,255,0.7)" />
          </g>

          {/* Mid buildings cluster */}
          <rect x="380" y="380" width="55" height="220" fill="url(#towerFade)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
          <rect x="445" y="420" width="50" height="180" fill="url(#towerFade)" />
          <rect x="505" y="350" width="60" height="250" fill="url(#towerFade)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

          {/* Kingdom Centre Tower (THE iconic centerpiece — the inverted arch) */}
          <g transform="translate(680 0)">
            {/* Left wall */}
            <path d="M 0 600 L 0 220 L 35 140 L 35 600 Z" fill="url(#towerFade)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
            {/* Right wall */}
            <path d="M 145 600 L 145 220 L 110 140 L 110 600 Z" fill="url(#towerFade)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
            {/* Top arch (the iconic inverted parabola hole) */}
            <path d="M 35 140 L 35 220 Q 72.5 200 110 220 L 110 140 Z" fill="rgba(0,80,40,0.4)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
            {/* Suspended sky-bridge (the famous deck) */}
            <rect x="38" y="200" width="69" height="8" fill="rgba(255,255,255,0.6)" rx="1" />
            {/* Antenna spire */}
            <line x1="72.5" y1="140" x2="72.5" y2="100" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="72.5" cy="98" r="2" fill="rgba(255,255,255,0.8)" />
            {/* Window rows on left wall */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={"l" + i} x1="2" y1={240 + i * 18} x2="33" y2={240 + i * 18} stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
            ))}
            {/* Window rows on right wall */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={"r" + i} x1="112" y1={240 + i * 18} x2="143" y2={240 + i * 18} stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
            ))}
          </g>

          {/* Burj Rafal area — slim tall building */}
          <g transform="translate(870 0)">
            <path d="M 0 600 L 0 260 L 40 220 L 40 600 Z" fill="url(#towerFade)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" />
            <line x1="20" y1="220" x2="20" y2="180" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          </g>

          {/* PIF Tower — modern stepped tower */}
          <g transform="translate(950 0)">
            <rect x="0" y="180" width="60" height="420" fill="url(#towerFade)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" />
            <rect x="60" y="220" width="40" height="380" fill="url(#towerFade)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <line x1="30" y1="180" x2="30" y2="140" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
          </g>

          {/* Mid-right buildings */}
          <rect x="1080" y="400" width="55" height="200" fill="url(#towerFade)" />
          <rect x="1145" y="350" width="65" height="250" fill="url(#towerFade)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

          {/* Olaya district cluster */}
          <rect x="1230" y="380" width="50" height="220" fill="url(#towerFade)" />
          <rect x="1290" y="320" width="55" height="280" fill="url(#towerFade)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" />
          <rect x="1355" y="420" width="45" height="180" fill="url(#towerFade)" />
          <rect x="1410" y="380" width="50" height="220" fill="url(#towerFade)" />

          {/* Far-right filler buildings */}
          <rect x="1475" y="450" width="40" height="150" fill="url(#towerFade)" />
          <rect x="1525" y="420" width="50" height="180" fill="url(#towerFade)" />
        </g>

        {/* Subtle ground line */}
        <line x1="0" y1="600" x2="1600" y2="600" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </svg>
    </div>
  );
}
