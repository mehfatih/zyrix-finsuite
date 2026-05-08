// ================================================================
// AnimatedTierBars — donut chart with auto-rotating active slice.
// (Filename kept from prior round so CustomerOverviewPage import
// doesn't need to change; visualisation is now circular, not bars.)
// Center label tracks the active tier; legend rows sync with chart
// hover both ways.
// ================================================================
import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";

const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <g>
      {/* Halo behind active slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
      {/* Active slice grows outward */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function AnimatedTierBars({
  tiers,
  gradient = [],
  // Which numeric field on each tier the donut weights by. Default
  // "count" matches Customer Overview; Revenue Overview passes "mrr".
  valueKey = "count",
  // Optional formatter for the center label's big number. Falls back
  // to toLocaleString() so the existing call sites stay unchanged.
  valueFormatter,
}) {
  // tiers = [{ name, count, mrr, color }]
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 2.5s for liveliness.
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tiers.length);
    }, 2500);
    return () => clearInterval(id);
  }, [tiers.length]);

  const total = tiers.reduce((s, t) => s + (t[valueKey] || 0), 0) || 1;
  const active = tiers[activeIndex];
  const fmt = (v) => (valueFormatter ? valueFormatter(v) : v.toLocaleString());

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", minHeight: "260px", flexWrap: "wrap" }}>
      {/* LEFT: donut */}
      <div style={{ width: "220px", height: "220px", position: "relative", flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={tiers}
              dataKey={valueKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              isAnimationActive
              animationDuration={1100}
              animationBegin={0}
            >
              {tiers.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.color || gradient[i % (gradient.length || 1)] || "#1A56DB"}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: "11px",
            color: "#6B7280",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {active?.name || "Total"}
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: 800,
            color: active?.color || "#111827",
            lineHeight: 1.1,
            marginTop: "4px",
            transition: "color 300ms ease",
          }}>
            {active ? fmt(active[valueKey] || 0) : fmt(total)}
          </div>
          <div style={{
            fontSize: "11px",
            color: "#6B7280",
            fontWeight: 600,
            marginTop: "2px",
          }}>
            {active ? `${(((active[valueKey] || 0) / total) * 100).toFixed(1)}%` : "share"}
          </div>
        </div>
      </div>

      {/* RIGHT: legend */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "8px" }}>
        {tiers.map((tier, i) => {
          const isActive = i === activeIndex;
          const tierColor = tier.color || gradient[i % (gradient.length || 1)] || "#1A56DB";
          return (
            <div
              key={tier.name}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: isActive ? `${tierColor}15` : "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                borderInlineStart: isActive ? `3px solid ${tierColor}` : "3px solid transparent",
                transition: "all 250ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: tierColor,
                  boxShadow: isActive ? `0 0 0 3px ${tierColor}33` : "none",
                  transition: "box-shadow 250ms ease",
                }} />
                <span style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: isActive ? tierColor : "#111827",
                  transition: "color 250ms ease",
                }}>
                  {tier.name}
                </span>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                  {valueKey === "mrr" ? fmt(tier.mrr || 0) : tier.count}
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>
                  {valueKey === "mrr"
                    ? `${tier.count} customers`
                    : `₺${(tier.mrr / 1000).toFixed(0)}K MRR`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
