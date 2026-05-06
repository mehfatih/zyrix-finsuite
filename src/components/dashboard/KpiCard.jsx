// ================================================================
// KpiCard — number + sparkline + delta. Built on top of Card.
// ================================================================
import React from "react";
import Card from "./Card";
import Sparkline from "./charts/Sparkline";
import { resolvePalette } from "../../utils/dashboardPalette";

export default function KpiCard({
  label,
  value,
  prefix = "",
  suffix = "",
  trend,
  trendLabel,
  spark,
  icon,
  palette,
  paletteIdx = 0,
  pulse = false,
  onClick,
  size = "normal",
}) {
  const p = resolvePalette(palette, paletteIdx);
  const chart = Array.isArray(spark) && spark.length > 1
    ? <Sparkline data={spark} palette={p} height={36} />
    : null;

  return (
    <div style={{ position: "relative" }}>
      <Card
        palette={p}
        title={label}
        icon={icon}
        value={value}
        prefix={prefix}
        suffix={suffix}
        trend={trend}
        trendLabel={trendLabel}
        chart={chart}
        onClick={onClick}
        size={size}
      />
      {pulse && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: p.base,
            boxShadow: `0 0 0 0 ${p.base}80`,
            animation: "kpiPulse 1.6s ease-out infinite",
          }}
        />
      )}
      <style>{`
        @keyframes kpiPulse {
          0%   { box-shadow: 0 0 0 0 ${p.base}80; }
          70%  { box-shadow: 0 0 0 10px ${p.base}00; }
          100% { box-shadow: 0 0 0 0 ${p.base}00; }
        }
      `}</style>
    </div>
  );
}
