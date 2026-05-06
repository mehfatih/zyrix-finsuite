// ================================================================
// ConfidenceBandChart — wraps charts/ConfidenceBand with dual bands
// (50% inner, 95% outer) + today vertical marker + risk pulses
// ================================================================
import React, { useEffect, useId, useRef, useState } from "react";
import { resolvePalette, getAIPalette } from "../../../utils/dashboardPalette";

export default function ConfidenceBandChart({
  data = [],            // [{ label, value, low50, high50, low95, high95, isToday?, isRisk? }]
  palette,
  width = 720,
  height = 280,
  t = (s) => s,
}) {
  const p = resolvePalette(palette || getAIPalette());
  const uid = useId();
  const [prog, setProg] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    setProg(0);
    const start = performance.now();
    const tick = (tt) => {
      const v = Math.min((tt - start) / 1500, 1);
      setProg(1 - Math.pow(1 - v, 3));
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(data), p.base]);

  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8", fontSize: 13 }}>
        No data yet
      </div>
    );
  }

  const all = data.flatMap((d) => [
    Number(d.value) || 0,
    Number(d.low95 ?? d.low50 ?? d.value) || 0,
    Number(d.high95 ?? d.high50 ?? d.value) || 0,
  ]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const padX = 44;
  const padY = 28;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const xAt = (i) => padX + (i / (data.length - 1)) * w;
  const yAt = (v) => padY + h - ((v - min) / range) * h;

  const linePts = data.map((d, i) => `${xAt(i)},${yAt(Number(d.value) || 0)}`).join(" L ");

  const buildBandPath = (lowKey, highKey) => {
    const top = data.map((d, i) => `${xAt(i)},${yAt(Number(d[highKey] ?? d.value) || 0)}`).join(" L ");
    const bottom = data
      .slice()
      .reverse()
      .map((d, i) => {
        const realIdx = data.length - 1 - i;
        return `${xAt(realIdx)},${yAt(Number(d[lowKey] ?? d.value) || 0)}`;
      })
      .join(" L ");
    return `M ${top} L ${bottom} Z`;
  };

  const path95 = buildBandPath("low95", "high95");
  const path50 = buildBandPath("low50", "high50");
  const gid95 = `cb95-${uid.replace(/[:]/g, "")}`;
  const gid50 = `cb50-${uid.replace(/[:]/g, "")}`;

  // Visible-line clip for animated draw-in
  const clipId = `cbclip-${uid.replace(/[:]/g, "")}`;
  const lineWidth = w * prog + padX;

  // Y-axis labels
  const tickValues = [min, (min + max) / 2, max];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="forecast" style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid95} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.chart} stopOpacity="0.18" />
            <stop offset="100%" stopColor={p.chart} stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={gid50} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.chart} stopOpacity="0.40" />
            <stop offset="100%" stopColor={p.chart} stopOpacity="0.18" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={lineWidth} height={height} />
          </clipPath>
        </defs>

        {/* Grid + tick labels */}
        {tickValues.map((v, i) => {
          const yy = yAt(v);
          return (
            <g key={i}>
              <line x1={padX} x2={width - padX} y1={yy} y2={yy} stroke="#E2E8F0" strokeDasharray="3 4" />
              <text x={6} y={yy + 4} fontSize="9" fill="#94A3B8">
                ₺{Math.round(v).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* 95% band */}
        <path d={path95} fill={`url(#${gid95})`} opacity={prog} />
        {/* 50% band */}
        <path d={path50} fill={`url(#${gid50})`} opacity={prog} />

        {/* Predicted line — clipped for left-to-right draw */}
        <g clipPath={`url(#${clipId})`}>
          <path
            d={`M ${linePts}`}
            fill="none"
            stroke={p.base}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* Today marker (vertical red line) */}
        {data.findIndex((d) => d.isToday) >= 0 && (() => {
          const idx = data.findIndex((d) => d.isToday);
          const tx = xAt(idx);
          return (
            <g>
              <line x1={tx} y1={padY} x2={tx} y2={padY + h} stroke="#E30A17" strokeWidth="1.5" strokeDasharray="4 4" opacity={prog} />
              <rect x={tx - 24} y={padY - 22} width={48} height={18} rx={9} fill="#E30A17" opacity={prog} />
              <text x={tx} y={padY - 9} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" opacity={prog}>
                {t("forecast.today").toUpperCase()}
              </text>
            </g>
          );
        })()}

        {/* Risk pulses (low points) */}
        {data.map((d, i) => {
          if (!d.isRisk) return null;
          const cx = xAt(i);
          const cy = yAt(Number(d.value) || 0);
          return (
            <g key={`r-${i}`}>
              <circle cx={cx} cy={cy} r="6" fill="#F43F5E" opacity={prog * 0.25}>
                <animate attributeName="r" values="6;14;6" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r="4" fill="#F43F5E" opacity={prog} />
            </g>
          );
        })}

        {/* Anchor dots once line drawn */}
        {prog > 0.96 && data.map((d, i) => {
          const step = Math.max(1, Math.ceil(data.length / 12));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <circle key={`a-${i}`} cx={xAt(i)} cy={yAt(Number(d.value) || 0)} r={3} fill="#fff" stroke={p.base} strokeWidth="1.6" />
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.ceil(data.length / 8));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text key={`xl-${i}`} x={xAt(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748B">
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "#475569", flexWrap: "wrap", justifyContent: "center" }}>
        <Legend color={p.base} label={t("forecast.line.predicted")} solid />
        <Legend color={p.chart} label={t("forecast.confidence.50")} alpha={0.4} />
        <Legend color={p.chart} label={t("forecast.confidence.95")} alpha={0.18} />
        <Legend color="#F43F5E" label={t("forecast.kpi.risk")} dash />
      </div>
    </div>
  );
}

function Legend({ color, label, solid, dash, alpha = 1 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 18,
          height: solid ? 3 : dash ? 3 : 10,
          borderRadius: solid || dash ? 2 : 3,
          background: color,
          opacity: alpha,
          borderTop: dash ? `2px dashed ${color}` : "none",
        }}
      />
      {label}
    </span>
  );
}
