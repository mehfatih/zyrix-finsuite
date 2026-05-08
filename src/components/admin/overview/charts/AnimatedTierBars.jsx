// ================================================================
// AnimatedTierBars — horizontal bars that grow from left on mount.
// Each tier is rendered with its own brand color (e.g. Lite gray,
// Pro blue, Business violet, Enterprise wine) and shows count + MRR.
// ================================================================
import React, { useEffect, useState } from "react";

export default function AnimatedTierBars({ tiers, gradient = [] }) {
  // tiers = [{ name, count, mrr, color? }]
  const max = Math.max(...tiers.map((t) => t.count));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tiers]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {tiers.map((tier, i) => {
        const widthPct = (tier.count / max) * 100 * progress;
        const tierColor = tier.color || gradient[i % (gradient.length || 1)] || "#1A56DB";
        return (
          <div key={tier.name}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              marginBottom: "6px",
            }}>
              <span style={{ fontWeight: 700, color: tierColor }}>{tier.name}</span>
              <span style={{ color: "#6B7280", fontWeight: 500 }}>
                {tier.count} · ₺{tier.mrr.toLocaleString()} MRR
              </span>
            </div>
            <div style={{
              height: "8px",
              background: "rgba(0,0,0,0.05)",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${widthPct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${tierColor}, ${tierColor}DD)`,
                borderRadius: "4px",
                transition: "width 100ms linear",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
