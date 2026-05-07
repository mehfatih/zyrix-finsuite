// ================================================================
// MoodRing — color-changing wellness ring (green → yellow → red)
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getCustomerPalette } from "../../../utils/dashboardPalette";

export default function MoodRing({ score = 67, size = 240, label = "Healthy" }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();

  const palette =
    score >= 80 ? success :
    score >= 60 ? customer :
    score >= 40 ? warn : alert;

  // Animate score reveal
  const [n, setN] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(score * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setN(score);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const stroke = size * 0.09;
  const circ = 2 * Math.PI * r;
  const fill = (n / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, marginInline: "auto" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="mr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.base} />
            <stop offset="100%" stopColor={palette.dark} />
          </linearGradient>
          <radialGradient id="mr-glow">
            <stop offset="0%" stopColor={palette.base} stopOpacity="0.4" />
            <stop offset="100%" stopColor={palette.base} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.18} fill="url(#mr-glow)" style={{ animation: "mrPulse 3s ease-in-out infinite" }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${palette.base}20`} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#mr-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: "stroke-dasharray .6s ease, stroke .6s ease", filter: `drop-shadow(0 0 12px ${palette.base}80)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", pointerEvents: "none" }}>
        <div>
          <div style={{ fontSize: 56, fontWeight: 900, color: palette.base, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, textShadow: `0 0 18px ${palette.base}40` }}>
            {Math.round(n)}
          </div>
          <div style={{ fontSize: 11, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>
            {label}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes mrPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
