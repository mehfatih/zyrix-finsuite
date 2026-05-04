// ================================================================
// Galata Tower silhouette SVG — bottom-left atmospheric element
// ================================================================

import React from "react";

export default function GalataTower({ style = {} }) {
  return (
    <svg
      viewBox="0 0 100 300"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute",
        left: "2%",
        bottom: 0,
        width: "11%",
        height: "60%",
        pointerEvents: "none",
        zIndex: 2,
        opacity: 0.55,
        ...style,
      }}
    >
      <defs>
        <linearGradient id="galataGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0A0102" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#0F0103" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* Conical roof */}
      <polygon points="50,5 38,55 62,55" fill="url(#galataGradV2)" />
      {/* Roof base ring */}
      <rect x="36" y="55" width="28" height="6" fill="url(#galataGradV2)" />
      {/* Observation deck */}
      <rect x="32" y="61" width="36" height="14" fill="url(#galataGradV2)" />
      {/* Deck rim */}
      <rect x="30" y="75" width="40" height="4" fill="url(#galataGradV2)" />
      {/* Main cylindrical body */}
      <rect x="36" y="79" width="28" height="180" fill="url(#galataGradV2)" />
      {/* Window slits */}
      <rect x="42" y="100" width="1.5" height="140" fill="rgba(227,10,23,0.15)" />
      <rect x="50" y="100" width="1.5" height="140" fill="rgba(227,10,23,0.15)" />
      <rect x="58" y="100" width="1.5" height="140" fill="rgba(227,10,23,0.15)" />
      {/* Wider base */}
      <rect x="32" y="259" width="36" height="20" fill="url(#galataGradV2)" />
      <rect x="28" y="279" width="44" height="21" fill="url(#galataGradV2)" />
    </svg>
  );
}