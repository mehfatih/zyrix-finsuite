// ================================================================
// HealthScoreGauge — large semicircle with zone bands + center value
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getAIPalette } from "../../../utils/dashboardPalette";

export default function HealthScoreGauge({ score = 75, size = 260, label, sublabel }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const palette = score >= 70 ? success : score >= 40 ? warn : alert;

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
  const cy = size * 0.66;
  const r = size * 0.4;
  const stroke = size * 0.08;

  // Three bands: 0-40 (red), 40-70 (amber), 70-100 (green)
  const arc = (start, end) => {
    const startAngle = Math.PI - (start / 100) * Math.PI;
    const endAngle = Math.PI - (end / 100) * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle) * -1;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle) * -1;
    const largeArc = end - start > 50 ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const valueAngle = Math.PI - (n / 100) * Math.PI;
  const needleX = cx + r * Math.cos(valueAngle) * 0.95;
  const needleY = cy + r * Math.sin(valueAngle) * -0.95;

  return (
    <svg viewBox={`0 0 ${size} ${size * 0.78}`} width="100%" style={{ display: "block", maxWidth: size, marginInline: "auto" }}>
      {/* zone bands */}
      <path d={arc(0, 40)} stroke={alert.base} strokeWidth={stroke} fill="none" strokeLinecap="round" opacity="0.25" />
      <path d={arc(40, 70)} stroke={warn.base} strokeWidth={stroke} fill="none" strokeLinecap="round" opacity="0.3" />
      <path d={arc(70, 100)} stroke={success.base} strokeWidth={stroke} fill="none" strokeLinecap="round" opacity="0.3" />
      {/* progress arc */}
      <path
        d={arc(0, n)}
        stroke={palette.base}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 12px ${palette.base}60)` }}
      />
      {/* needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={palette.dark} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill={palette.dark} />
      {/* center text */}
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="42" fontWeight="900" fill={palette.base} style={{ fontFamily: "monospace" }}>
        {Math.round(n)}
      </text>
      {label && (
        <text x={cx} y={cy + 50} textAnchor="middle" fontSize="10" fontWeight="700" fill={palette.dark} style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </text>
      )}
      {/* zone labels */}
      <text x={cx + r * Math.cos(Math.PI) * 1.05} y={cy + 12} textAnchor="middle" fontSize="9" fill={alert.dark}>0</text>
      <text x={cx + r * Math.cos(0) * 1.05} y={cy + 12} textAnchor="middle" fontSize="9" fill={success.dark}>100</text>
    </svg>
  );
}
