// ================================================================
// CoFounderAvatar — breathing AI avatar with cursor-tracking eyes
// + thinking particle effect
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export default function CoFounderAvatar({
  size = 200,
  thinking = false,
  speaking = false,
  lang = "tr",
}) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang);
  const wrapRef = useRef(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const max = 3;
      setEye({
        x: Math.max(-max, Math.min(max, dx * 6)),
        y: Math.max(-max, Math.min(max, dy * 6)),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      {/* Outer glow halo */}
      <div
        style={{
          position: "absolute", inset: -20, borderRadius: "50%",
          background: `radial-gradient(circle, ${ai.base}30, transparent 70%)`,
          filter: "blur(12px)",
          animation: "cofHalo 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {/* Avatar body — breathing chest */}
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block", position: "relative", zIndex: 1 }}>
        <defs>
          <radialGradient id="cofBody" cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor={ai.base} stopOpacity="0.95" />
            <stop offset="0.65" stopColor={ai.dark} stopOpacity="0.9" />
            <stop offset="1" stopColor={brand.dark} stopOpacity="0.85" />
          </radialGradient>
          <linearGradient id="cofShimmer" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.4">
              <animate attributeName="stop-opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Chest — breathing scale */}
        <g transform="translate(100,170)">
          <ellipse cx="0" cy="-10" rx="62" ry="38" fill="url(#cofBody)" style={{ animation: "cofBreath 3.2s ease-in-out infinite", transformOrigin: "0 -10px" }} />
          <ellipse cx="0" cy="-10" rx="62" ry="38" fill="url(#cofShimmer)" />
        </g>

        {/* Head */}
        <circle cx="100" cy="78" r="48" fill="url(#cofBody)" />
        <circle cx="100" cy="78" r="48" fill="url(#cofShimmer)" />

        {/* Eyes — track cursor */}
        <g>
          <ellipse cx={84 + eye.x} cy={78 + eye.y} rx="6" ry="7" fill="#fff" />
          <ellipse cx={116 + eye.x} cy={78 + eye.y} rx="6" ry="7" fill="#fff" />
          <circle cx={85 + eye.x * 1.5} cy={80 + eye.y * 1.5} r="3" fill="#0F172A" />
          <circle cx={117 + eye.x * 1.5} cy={80 + eye.y * 1.5} r="3" fill="#0F172A" />
        </g>

        {/* Mouth — smiling slight */}
        <path
          d={speaking ? "M 86 100 Q 100 112 114 100" : "M 86 100 Q 100 106 114 100"}
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ transition: "all .25s" }}
        />

        {/* Aura ring — pulses gently */}
        <circle cx="100" cy="78" r="58" fill="none" stroke={ai.base} strokeWidth="1" strokeOpacity="0.3" style={{ animation: "cofRing 3s ease-in-out infinite", transformOrigin: "100px 78px" }} />
      </svg>

      {/* Thinking particles */}
      {thinking && (
        <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 70;
            const cx = 100 + Math.cos(angle) * r;
            const cy = 78 + Math.sin(angle) * r;
            return (
              <circle key={i} cx={cx} cy={cy} r={3} fill={ai.base}
                style={{ animation: `cofParticle 1.6s ease-in-out ${i * 0.18}s infinite`, opacity: 0 }}
              />
            );
          })}
        </svg>
      )}

      <style>{`
        @keyframes cofBreath  { 0%,100% { transform: scale(1, 1); } 50% { transform: scale(1.04, 1.06); } }
        @keyframes cofHalo    { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes cofRing    { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.06); opacity: 0.55; } }
        @keyframes cofParticle{ 0% { opacity: 0; transform: scale(0.4); } 50% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.4); } }
      `}</style>
    </div>
  );
}
