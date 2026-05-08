// ================================================================
// AnalyticsBlock — white-card wrapper used by every Overview chart.
// 3px color accent strip across the top so each chart's theme is
// readable at a glance.
// ================================================================
import React from "react";

export default function AnalyticsBlock({ title, icon, color, children, headerExtra }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(0, 0, 0, 0.06)",
      borderRadius: "16px",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Color accent bar at top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: color,
      }} />

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
      }}>
        <h3 style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#111827",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textShadow: "none",
        }}>
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        {headerExtra}
      </div>

      {children}
    </div>
  );
}
