// ================================================================
// AnimatedGeoBubbles — region rows that fade-in left-to-right and
// pulse a teal halo. Bubble size scales with the region's count so
// the eye picks up the dominant market without reading the numbers.
// ================================================================
import React, { useEffect, useState } from "react";

export default function AnimatedGeoBubbles({ regions }) {
  // regions = [{ code, name, count }]
  const max = Math.max(...regions.map((r) => r.count));
  const [appeared, setAppeared] = useState([]);

  useEffect(() => {
    setAppeared([]);
    const timers = regions.map((_, i) =>
      setTimeout(() => setAppeared((arr) => [...arr, i]), i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, [regions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {regions.map((region, i) => {
        const size = 16 + (region.count / max) * 28; // 16-44px
        const isVisible = appeared.includes(i);
        return (
          <div key={region.code} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(-8px)",
            transition: "all 400ms ease",
          }}>
            <div style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              background: "radial-gradient(circle, #2DD4BF 0%, rgba(45,212,191,0.3) 70%)",
              flexShrink: 0,
              animation: "pulse-bubble 2.4s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
              boxShadow: "0 0 0 0 rgba(45,212,191,0.5)",
            }} />
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              minWidth: 0,
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#6B7280",
                background: "rgba(0,0,0,0.04)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>{region.code}</span>
              <span style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#111827",
                flex: 1,
              }}>{region.name}</span>
              <span style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#2DD4BF",
              }}>{region.count}</span>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes pulse-bubble {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45,212,191,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(45,212,191,0); }
        }
      `}</style>
    </div>
  );
}
