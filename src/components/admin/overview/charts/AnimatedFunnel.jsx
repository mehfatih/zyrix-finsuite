// ================================================================
// AnimatedFunnel — vertical funnel. Bars centre-anchored, widths
// grow from 0 to value/max on mount. Conversion percentage between
// stages floats in the gap above each bar.
// ================================================================
import React, { useState, useEffect } from "react";

export default function AnimatedFunnel({ stages }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setProgress(0);
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
  }, [stages]);

  const max = Math.max(...stages.map((s) => s.value));
  const W = 360;
  const stageH = 44;
  const gap = 8;
  const H = stages.length * (stageH + gap);

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {stages.map((stage, i) => {
          const ratio = (stage.value / max) * progress;
          const stageW = ratio * W;
          const x = (W - stageW) / 2;
          const y = i * (stageH + gap);
          const isHovered = hovered === i;
          const prevValue = i > 0 ? stages[i - 1].value : null;
          const conversionPct = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : null;

          return (
            <g
              key={stage.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={stageW}
                height={stageH}
                rx={6}
                fill={stage.color}
                fillOpacity={isHovered ? 0.95 : 0.82}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ transition: "fill-opacity 200ms ease" }}
              />
              <text
                x={stageW > 120 ? x + 12 : 8}
                y={y + stageH / 2 + 4}
                fill={stageW > 120 ? "#FFFFFF" : "#111827"}
                fontSize="13"
                fontWeight="700"
                style={{ pointerEvents: "none", textShadow: stageW > 120 ? "0 1px 2px rgba(0,0,0,0.5)" : "none" }}
              >{stage.name}</text>
              {stageW > 80 && (
                <text
                  x={x + stageW - 12}
                  y={y + stageH / 2 + 4}
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="end"
                  style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                >{stage.value.toLocaleString()}</text>
              )}
              {conversionPct && (
                <text
                  x={W - 6}
                  y={y - gap / 2 + 3}
                  fill="#6B7280"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="end"
                >▼ {conversionPct}%</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
