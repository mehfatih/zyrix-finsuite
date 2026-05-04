import React from "react";

export default function SaudiFlag() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.18,
      mixBlendMode: "screen",
      animation: "flagWaveV2 8s ease-in-out infinite",
    }}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="saudiGreenBg" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 108, 53, 0.6)" />
            <stop offset="50%" stopColor="rgba(0, 140, 70, 0.5)" />
            <stop offset="100%" stopColor="rgba(0, 80, 40, 0.7)" />
          </linearGradient>
          <filter id="flagBlurSA" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Green background (Saudi flag is solid green) */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#saudiGreenBg)" />

        {/* Shahada (Arabic calligraphy) - represented as flowing horizontal strokes */}
        <g transform="translate(600 320)" filter="url(#flagBlurSA)" opacity="0.35">
          {/* Multiple horizontal calligraphic strokes representing the Shahada text */}
          <path d="M -380 0 Q -200 -8 0 0 T 380 0" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="14" strokeLinecap="round" />
          <path d="M -360 -28 Q -180 -36 0 -28 T 360 -28" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="6" strokeLinecap="round" />
          <path d="M -340 28 Q -160 24 0 28 T 340 28" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="6" strokeLinecap="round" />
          {/* Decorative dots above/below */}
          <circle cx="-200" cy="-50" r="4" fill="rgba(255,255,255,0.7)" />
          <circle cx="0" cy="-50" r="4" fill="rgba(255,255,255,0.7)" />
          <circle cx="200" cy="-50" r="4" fill="rgba(255,255,255,0.7)" />
        </g>

        {/* Sword underneath the Shahada */}
        <g transform="translate(600 470)" filter="url(#flagBlurSA)" opacity="0.7">
          {/* Sword blade — long horizontal line */}
          <path d="M -350 0 L 320 0 L 360 -10 L 360 10 Z" fill="rgba(255,255,255,0.9)" />
          {/* Handle */}
          <rect x="-380" y="-12" width="40" height="24" rx="3" fill="rgba(255,255,255,0.85)" />
          {/* Pommel */}
          <circle cx="-395" cy="0" r="8" fill="rgba(255,255,255,0.85)" />
          {/* Crossguard */}
          <rect x="-345" y="-18" width="6" height="36" fill="rgba(255,255,255,0.9)" />
          {/* Tip detail */}
          <path d="M 360 -10 L 380 0 L 360 10 Z" fill="rgba(255,255,255,1)" />
        </g>

        {/* Subtle palm tree silhouette in corner */}
        <g transform="translate(150 650)" opacity="0.25">
          <path d="M 0 0 L 0 -100" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
          {/* Palm fronds */}
          <path d="M 0 -100 Q -30 -120 -50 -110" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -100 Q -25 -130 -45 -135" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -100 Q 0 -135 -10 -150" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -100 Q 25 -130 45 -135" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -100 Q 30 -120 50 -110" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -100 Q 0 -125 10 -148" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
