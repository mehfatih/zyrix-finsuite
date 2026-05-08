// ================================================================
// AnimatedPodium — top customers as a rank list with bars that grow
// from left, gold/silver/bronze rank icons, and tier label below.
// ================================================================
import React, { useEffect, useState } from "react";

export default function AnimatedPodium({ customers }) {
  // customers = [{ id, name, tier, mrr }]
  const max = Math.max(...customers.map((c) => c.mrr));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1300;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [customers]);

  const rankColor = (i) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#9CA3AF";
  };
  const rankIcon = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {customers.map((c, i) => {
        const widthPct = (c.mrr / max) * 100 * progress;
        const color = rankColor(i);
        return (
          <div key={c.id} style={{ position: "relative" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              background: "rgba(0,0,0,0.02)",
              borderRadius: "8px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Animated bar fill behind row content */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, bottom: 0,
                width: `${widthPct}%`,
                background: `linear-gradient(90deg, ${color}33, ${color}11)`,
                borderInlineStart: `3px solid ${color}`,
                transition: "width 100ms linear",
              }} />
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <span style={{ fontSize: "18px" }}>{rankIcon(i)}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{c.name}</div>
                  <div style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginTop: "2px",
                  }}>{c.tier}</div>
                </div>
              </div>
              <div style={{
                position: "relative",
                fontSize: "15px",
                fontWeight: 800,
                color: "#111827",
              }}>
                ₺{c.mrr.toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
