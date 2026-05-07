// ================================================================
// ReviewProbabilityGauge — animated NPS gauge with bucket label
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getReportsPalette } from "../../../utils/dashboardPalette";

export default function ReviewProbabilityGauge({
  nps = 7,
  bucket = "passive",
  size = 120,
  t = (s) => s,
}) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();

  const [animated, setAnimated] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    const tick = (t0) => {
      const p = Math.min((t0 - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(nps * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nps]);

  const palette = bucket === "promoter" ? success : bucket === "passive" ? reports : alert;
  const r = (size - 18) / 2;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const arc = Math.PI; // semi-circle
  const pct = Math.max(0, Math.min(1, animated / 10));
  const angle = -Math.PI + arc * pct;
  const tx = cx + r * Math.cos(angle);
  const ty = cy + r * Math.sin(angle);

  // arc path
  const start = { x: cx - r, y: cy };
  const end = { x: cx + r, y: cy };
  const trackPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  // value path
  const vEnd = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  const valuePath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${vEnd.x} ${vEnd.y}`;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size / 2 + 18} style={{ display: "block" }}>
        <path d={trackPath} stroke="#E2E8F0" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={valuePath} stroke={`url(#gaugeGrad-${bucket})`} strokeWidth={12} fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id={`gaugeGrad-${bucket}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={alert.base} />
            <stop offset="0.5" stopColor={warn.base} />
            <stop offset="1" stopColor={success.base} />
          </linearGradient>
        </defs>
        <circle cx={tx} cy={ty} r={6} fill={palette.base} stroke="#fff" strokeWidth={2} />
      </svg>
      <div style={{ textAlign: "center", marginTop: -10 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: palette.dark, fontFamily: "monospace", lineHeight: 1 }}>
          {animated.toFixed(1)}<span style={{ fontSize: 12, opacity: 0.6 }}>{t("review.nps.outOf")}</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
          {t(`review.nps.${bucket}`)}
        </div>
      </div>
    </div>
  );
}
