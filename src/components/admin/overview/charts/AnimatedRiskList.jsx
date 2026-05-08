// ================================================================
// AnimatedRiskList — at-risk customers slide into view top-to-bottom.
// Risk badge color heat-maps the percentage; >=75% additionally
// pulses to draw the eye to immediate-action items.
// ================================================================
import React, { useEffect, useState } from "react";

export default function AnimatedRiskList({ customers }) {
  // customers = [{ id, name, reason, risk }]
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    const timers = customers.map((_, i) =>
      setTimeout(() => setVisible((v) => Math.max(v, i + 1)), i * 90)
    );
    return () => timers.forEach(clearTimeout);
  }, [customers]);

  const riskColor = (risk) => {
    if (risk >= 75) return "#EF4444";
    if (risk >= 60) return "#F59E0B";
    return "#FBBF24";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {customers.map((c, i) => {
        const color = riskColor(c.risk);
        const shown = i < visible;
        return (
          <div key={c.id} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            background: shown ? "rgba(0,0,0,0.02)" : "transparent",
            borderRadius: "8px",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(8px)",
            transition: "all 350ms ease",
            borderInlineStart: shown ? `3px solid ${color}` : "3px solid transparent",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{c.name}</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{c.reason}</div>
            </div>
            <div style={{
              padding: "4px 10px",
              background: `${color}1A`,
              color,
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              animation: c.risk >= 75 ? "risk-pulse 1.6s ease-in-out infinite" : "none",
            }}>
              {c.risk}%
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes risk-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
