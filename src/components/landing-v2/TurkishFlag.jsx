// ================================================================
// Turkish Flag SVG — subtle watermark layer for Landing V2 Hero
// ================================================================

import React from "react";

export default function TurkishFlag({ style = {} }) {
  return (
    <svg
      viewBox="0 0 600 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        left: "-3%",
        top: 0,
        width: "38%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.18,
        mixBlendMode: "screen",
        animation: "flagWaveV2 20s ease-in-out infinite",
        ...style,
      }}
    >
      <defs>
        <radialGradient id="flagGlowV2" cx="35%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.25" />
          <stop offset="40%" stopColor="#E30A17" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#7A0710" stopOpacity="0" />
        </radialGradient>

        <filter id="fabricTextureV2" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="3" />
          <feColorMatrix
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.4 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        <filter id="flagShadowV2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        <linearGradient id="foldShade1V2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="foldShade2V2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="black" stopOpacity="0" />
          <stop offset="50%" stopColor="black" stopOpacity="0.15" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="600" height="800" fill="url(#flagGlowV2)" />
      <rect width="600" height="800" fill="url(#foldShade1V2)" opacity="0.6" />
      <rect width="600" height="800" fill="url(#foldShade2V2)" opacity="0.5" />

      <g>
        <g filter="url(#flagShadowV2)" opacity="0.4">
          <circle cx="225" cy="405" r="155" fill="black" />
          <circle cx="265" cy="405" r="130" fill="#0F0103" />
          <polygon
            points="430,405 360,425 405,365 380,395 430,405 405,415 360,385"
            fill="black"
            transform="translate(15 5)"
          />
        </g>

        <circle cx="225" cy="400" r="155" fill="white" opacity="0.92" />
        <circle cx="265" cy="400" r="128" fill="#1A0205" />

        <g transform="translate(420 400)">
          <polygon
            points="0,-65 15.3,-20.1 62.5,-20.1 24.1,7.7 38.7,52.6 0,25 -38.7,52.6 -24.1,7.7 -62.5,-20.1 -15.3,-20.1"
            fill="white"
            opacity="0.92"
          />
        </g>

        <g filter="url(#fabricTextureV2)" opacity="0.25">
          <circle cx="225" cy="400" r="155" fill="white" />
          <circle cx="265" cy="400" r="128" fill="#1A0205" />
          <polygon
            points="420,335 435.3,379.9 482.5,379.9 444.1,407.7 458.7,452.6 420,425 381.3,452.6 395.9,407.7 357.5,379.9 404.7,379.9"
            fill="white"
          />
        </g>
      </g>
    </svg>
  );
}