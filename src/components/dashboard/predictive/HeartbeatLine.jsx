// ================================================================
// HeartbeatLine — ECG-style health indicator
// Steady when score > 70, erratic when score < 50
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getSuccessPalette, getWarningPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function HeartbeatLine({ score = 75, width = 600, height = 100 }) {
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const palette = score >= 70 ? success : score >= 40 ? warn : alert;
  const [t, setT] = useState(0);
  const rafRef = useRef();

  // Beat rate scales with score: healthy = slow steady; critical = fast erratic
  const beatPeriod = score >= 70 ? 1.6 : score >= 40 ? 1.0 : 0.55;

  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => (prev + dt) % 999);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Build polyline path: scrolling beats
  const samples = 220;
  const cy = height / 2;
  const beatHeight = 38;
  const erraticness = score >= 70 ? 0 : (70 - score) / 70;
  const beatsPerSweep = score >= 70 ? 4 : score >= 40 ? 6 : 9;

  const points = [];
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * width;
    const phase = ((i / samples) + t / beatPeriod) * beatsPerSweep;
    const beatPos = phase - Math.floor(phase);
    let y = cy;
    // Generate ECG-like spike near beatPos = 0.5
    if (beatPos > 0.45 && beatPos < 0.55) {
      const local = (beatPos - 0.45) / 0.1;
      y = cy - Math.sin(local * Math.PI) * beatHeight + (Math.random() - 0.5) * erraticness * 12;
    } else if (beatPos > 0.55 && beatPos < 0.62) {
      const local = (beatPos - 0.55) / 0.07;
      y = cy + Math.sin(local * Math.PI) * beatHeight * 0.4;
    } else {
      y = cy + (Math.random() - 0.5) * erraticness * 6;
    }
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: width, marginInline: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="hb-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.base} stopOpacity="0" />
            <stop offset="50%" stopColor={palette.base} stopOpacity="1" />
            <stop offset="100%" stopColor={palette.base} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal baseline grid */}
        <line x1="0" y1={cy} x2={width} y2={cy} stroke={`${palette.base}20`} strokeDasharray="4 4" />
        {/* heartbeat line */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={palette.base}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${palette.base}80)` }}
        />
        {/* pulse glow on right side */}
        <rect x="0" y="0" width={width} height={height} fill="url(#hb-glow)" opacity="0.06" />
      </svg>
      <div
        style={{
          position: "absolute",
          insetInlineStart: 8,
          top: 6,
          fontSize: 9,
          color: palette.dark,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: "rgba(255,255,255,0.85)",
          padding: "2px 8px",
          borderRadius: 999,
        }}
      >
        ❤️ {score >= 70 ? "Stable" : score >= 40 ? "Irregular" : "Arrhythmic"}
      </div>
    </div>
  );
}
