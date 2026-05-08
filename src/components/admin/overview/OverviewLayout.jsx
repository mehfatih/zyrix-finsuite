// ================================================================
// OverviewLayout — single shell every Overview page wraps itself in.
// Header → 4 KPI tiles → 2x2 analytics blocks → summary + AI recs.
// Responsive grid: each row collapses to 1 column on narrow widths.
// ================================================================
import React from "react";

export default function OverviewLayout({
  title,
  subtitle,
  kpis,
  analytics,
  summary,
  recommendations,
}) {
  return (
    <div style={{
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    }}>
      {/* Page header */}
      <div>
        <h1 style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#111827",
          margin: 0,
          letterSpacing: "-0.02em",
          textShadow: "none",
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize: "14px",
            color: "#6B7280",
            margin: "4px 0 0",
            textShadow: "none",
          }}>{subtitle}</p>
        )}
      </div>

      {/* KPI Row — 4 cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
      }}>
        {kpis}
      </div>

      {/* Analytics Row — 2x2 grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "16px",
      }}>
        {analytics}
      </div>

      {/* Bottom Row — Summary + Recommendations side by side */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "16px",
      }}>
        {summary}
        {recommendations}
      </div>
    </div>
  );
}
