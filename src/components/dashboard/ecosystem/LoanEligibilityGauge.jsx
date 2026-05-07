// ================================================================
// LoanEligibilityGauge — radial gauge with status badge
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getMoneyPalette } from "../../../utils/dashboardPalette";

export default function LoanEligibilityGauge({ score = 0, status = "review", size = 200, t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const money = getMoneyPalette();

  const [animated, setAnimated] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    const tick = (t0) => {
      const p = Math.min((t0 - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(score * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const palette = status === "approved" ? success : status === "review" ? warn : alert;
  const pct = Math.max(0, Math.min(1, animated / 100));
  const radius = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius * 0.78; // 280° arc
  const offset = circumference * (1 - pct);

  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-220deg)" }}>
          <circle
            cx={cx} cy={cy} r={radius}
            stroke="#E2E8F0" strokeWidth={14} fill="none"
            strokeDasharray={`${circumference} ${circumference * 1.5}`}
            strokeLinecap="round"
          />
          <circle
            cx={cx} cy={cy} r={radius}
            stroke={`url(#leg-${status})`}
            strokeWidth={14} fill="none"
            strokeDasharray={`${circumference} ${circumference * 1.5}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .6s" }}
          />
          <defs>
            <linearGradient id={`leg-${status}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={palette.base} />
              <stop offset="1" stopColor={palette.dark} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: palette.dark, fontFamily: "monospace", lineHeight: 1 }}>
              {Math.round(animated)}
            </div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, marginTop: 2 }}>/ 100</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {t(`capital.eligibility.${status}`)}
      </div>
    </div>
  );
}
