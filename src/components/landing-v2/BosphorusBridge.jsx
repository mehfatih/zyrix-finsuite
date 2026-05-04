// ================================================================
// Bosphorus Bridge SVG — atmospheric watermark for Landing V2 Hero
// ================================================================

import React from "react";

export default function BosphorusBridge({ style = {} }) {
  return (
    <svg
      viewBox="0 0 800 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        left: "-3%",
        top: "28%",
        width: "50%",
        height: "50%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
        filter: "drop-shadow(0 4px 20px rgba(227, 10, 23, 0.2))",
        ...style,
      }}
    >
      <defs>
        <linearGradient id="bv2_bridgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F0103" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#1A0205" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="bv2_cableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 80, 80, 0.5)" />
          <stop offset="100%" stopColor="rgba(227, 10, 23, 0.85)" />
        </linearGradient>
      </defs>

      {/* Water reflection */}
      <ellipse cx="400" cy="380" rx="380" ry="15" fill="rgba(227, 10, 23, 0.1)" opacity="0.5" />

      {/* Left tower */}
      <rect x="170" y="80" width="14" height="240" fill="url(#bv2_bridgeGrad)" />
      <rect x="160" y="78" width="34" height="6" fill="url(#bv2_bridgeGrad)" />
      <rect x="158" y="84" width="38" height="3" fill="url(#bv2_bridgeGrad)" opacity="0.8" />
      <rect x="150" y="160" width="54" height="5" fill="url(#bv2_bridgeGrad)" opacity="0.85" />
      <rect x="150" y="240" width="54" height="5" fill="url(#bv2_bridgeGrad)" opacity="0.85" />
      <polygon points="170,80 184,80 177,68" fill="url(#bv2_bridgeGrad)" />

      {/* Right tower */}
      <rect x="616" y="80" width="14" height="240" fill="url(#bv2_bridgeGrad)" />
      <rect x="606" y="78" width="34" height="6" fill="url(#bv2_bridgeGrad)" />
      <rect x="604" y="84" width="38" height="3" fill="url(#bv2_bridgeGrad)" opacity="0.8" />
      <rect x="596" y="160" width="54" height="5" fill="url(#bv2_bridgeGrad)" opacity="0.85" />
      <rect x="596" y="240" width="54" height="5" fill="url(#bv2_bridgeGrad)" opacity="0.85" />
      <polygon points="616,80 630,80 623,68" fill="url(#bv2_bridgeGrad)" />

      {/* Main suspension cable */}
      <path d="M 177 90 Q 400 280 623 90" fill="none" stroke="url(#bv2_cableGrad)" strokeWidth="3.5" opacity="0.95" />
      <path d="M 177 95 Q 400 285 623 95" fill="none" stroke="url(#bv2_cableGrad)" strokeWidth="2" opacity="0.6" />

      {/* Vertical suspenders */}
      <g stroke="rgba(227, 10, 23, 0.6)" strokeWidth="0.9">
        <line x1="200" y1="115" x2="200" y2="305" />
        <line x1="225" y1="138" x2="225" y2="305" />
        <line x1="250" y1="158" x2="250" y2="305" />
        <line x1="275" y1="176" x2="275" y2="305" />
        <line x1="300" y1="192" x2="300" y2="305" />
        <line x1="325" y1="206" x2="325" y2="305" />
        <line x1="350" y1="217" x2="350" y2="305" />
        <line x1="375" y1="225" x2="375" y2="305" />
        <line x1="400" y1="228" x2="400" y2="305" />
        <line x1="425" y1="225" x2="425" y2="305" />
        <line x1="450" y1="217" x2="450" y2="305" />
        <line x1="475" y1="206" x2="475" y2="305" />
        <line x1="500" y1="192" x2="500" y2="305" />
        <line x1="525" y1="176" x2="525" y2="305" />
        <line x1="550" y1="158" x2="550" y2="305" />
        <line x1="575" y1="138" x2="575" y2="305" />
        <line x1="600" y1="115" x2="600" y2="305" />
      </g>

      {/* Bridge deck */}
      <rect x="60" y="305" width="680" height="6" fill="url(#bv2_bridgeGrad)" opacity="0.92" />
      <rect x="60" y="311" width="680" height="3" fill="url(#bv2_bridgeGrad)" opacity="0.6" />

      {/* Side anchor cables */}
      <path d="M 60 280 Q 120 200 177 90" fill="none" stroke="url(#bv2_cableGrad)" strokeWidth="2.4" opacity="0.85" />
      <path d="M 740 280 Q 680 200 623 90" fill="none" stroke="url(#bv2_cableGrad)" strokeWidth="2.4" opacity="0.85" />

      {/* Distant skyline */}
      <g opacity="0.35">
        <rect x="700" y="320" width="8" height="20" fill="#0F0103" />
        <rect x="710" y="315" width="6" height="25" fill="#0F0103" />
        <rect x="720" y="325" width="10" height="15" fill="#0F0103" />
        <rect x="735" y="318" width="7" height="22" fill="#0F0103" />
        <rect x="50" y="322" width="9" height="18" fill="#0F0103" />
        <rect x="62" y="316" width="6" height="24" fill="#0F0103" />
      </g>
    </svg>
  );
}