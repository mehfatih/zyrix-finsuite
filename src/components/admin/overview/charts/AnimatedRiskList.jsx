// ================================================================
// AnimatedRiskList — risk bubble matrix (scatter plot).
// (Filename kept from prior round so CustomerOverviewPage import
// doesn't need to change; visualisation is now a 2D plane, not a
// list of rows.)
// X-axis = reason category bucket, Y-axis = risk %, danger band
// (>=75) tinted red, high-risk bubbles get a pulse ring.
// ================================================================
import React, { useState, useEffect } from "react";

// Categorize reasons into X-axis buckets so the scatter spreads.
const REASON_CATEGORIES = {
  "Payment failed":     { x: 0.15, label: "Billing" },
  "Login drop":         { x: 0.40, label: "Engagement" },
  "Support escalation": { x: 0.65, label: "Support" },
  "Trial ending":       { x: 0.85, label: "Lifecycle" },
  "Feature regression": { x: 0.55, label: "Product" },
  "NPS detractor":      { x: 0.75, label: "Sentiment" },
};

const getCategoryX = (reason) => REASON_CATEGORIES[reason]?.x ?? 0.5;

const riskColor = (risk) => {
  if (risk >= 75) return "#EF4444";
  if (risk >= 65) return "#F59E0B";
  return "#FBBF24";
};

export default function AnimatedRiskList({ customers }) {
  const [appeared, setAppeared] = useState([]);
  const [hovered, setHovered] = useState(null);

  const W = 380;
  const H = 220;
  const PAD = { l: 40, r: 20, t: 20, b: 30 };

  useEffect(() => {
    setAppeared([]);
    const timers = customers.map((_, i) =>
      setTimeout(() => setAppeared((arr) => [...arr, i]), i * 100)
    );
    return () => timers.forEach(clearTimeout);
  }, [customers]);

  return (
    <div>
      <div style={{
        background: "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, rgba(239,68,68,0.05) 100%)",
        borderRadius: "12px",
        padding: "8px",
        border: "1px solid rgba(245,158,11,0.15)",
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="220" style={{ display: "block" }}>
          {/* Y-axis */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <text x={PAD.l - 6} y={PAD.t + 4} fill="#6B7280" fontSize="9" fontWeight="700" textAnchor="end">100%</text>
          <text x={PAD.l - 6} y={(PAD.t + H - PAD.b) / 2 + 4} fill="#6B7280" fontSize="9" fontWeight="700" textAnchor="end">50%</text>
          <text x={PAD.l - 6} y={H - PAD.b + 4} fill="#6B7280" fontSize="9" fontWeight="700" textAnchor="end">0%</text>
          <text x={8} y={H / 2} fill="#6B7280" fontSize="9" fontWeight="700"
                transform={`rotate(-90 8 ${H / 2})`} textAnchor="middle">RISK</text>

          {/* X-axis */}
          <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <text x={(W + PAD.l) / 2} y={H - 6} fill="#6B7280" fontSize="9" fontWeight="700" textAnchor="middle">CATEGORY →</text>

          {/* Danger band (top 25% of plot) */}
          <rect
            x={PAD.l}
            y={PAD.t}
            width={W - PAD.l - PAD.r}
            height={(H - PAD.b - PAD.t) * 0.25}
            fill="rgba(239,68,68,0.06)"
          />
          <text x={W - PAD.r - 6} y={PAD.t + 12} fill="#EF4444" fontSize="9" fontWeight="700" textAnchor="end">DANGER</text>

          {/* Bubbles */}
          {customers.map((customer, i) => {
            const isVisible = appeared.includes(i);
            const isHovered = hovered === customer.id;
            const xRatio = getCategoryX(customer.reason);
            const cx = PAD.l + xRatio * (W - PAD.l - PAD.r);
            const cy = PAD.t + (1 - customer.risk / 100) * (H - PAD.b - PAD.t);
            const color = riskColor(customer.risk);
            const radius = 12 + (customer.risk / 100) * 8;

            return (
              <g
                key={customer.id}
                onMouseEnter={() => setHovered(customer.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0)",
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: "opacity 400ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {customer.risk >= 75 && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.5"
                    style={{
                      animation: "risk-pulse-ring 1.8s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                      transformOrigin: `${cx}px ${cy}px`,
                    }}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? radius + 2 : radius}
                  fill={color}
                  fillOpacity="0.85"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy + 3}
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {customer.risk}
                </text>
                {isHovered && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={cx - 70}
                      y={cy - radius - 38}
                      width="140"
                      height="32"
                      rx="6"
                      fill="#111827"
                      opacity="0.95"
                    />
                    <text x={cx} y={cy - radius - 24} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                      {customer.name}
                    </text>
                    <text x={cx} y={cy - radius - 12} fill="#9CA3AF" fontSize="10" textAnchor="middle">
                      {customer.reason}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <style>{`
          @keyframes risk-pulse-ring {
            0%, 100% { transform: scale(1);   opacity: 0.5; }
            50%      { transform: scale(1.6); opacity: 0;   }
          }
        `}</style>
      </div>

      {/* Compact summary chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
        {customers.slice(0, 4).map((customer) => {
          const color = riskColor(customer.risk);
          return (
            <div
              key={customer.id}
              onMouseEnter={() => setHovered(customer.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                background: `${color}15`,
                border: `1px solid ${color}40`,
                borderRadius: "999px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 700, color }}>{customer.risk}%</span>
              <span style={{ color: "#111827", fontWeight: 600 }}>{customer.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
