// PulseRings — animated concentric pulsing rings (active indicator)
import React from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function PulseRings({
  palette,
  size = 80,
  rings = 3,
  count,
  label,
  ariaLabel = "live",
}) {
  const p = resolvePalette(palette);
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.12;
  const uid = `pr${p.id || "x"}`;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} role="img" aria-label={ariaLabel}>
        {Array.from({ length: rings }).map((_, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={baseR}
            fill="none"
            stroke={p.base}
            strokeWidth="2"
            opacity="0"
            style={{
              animation: `${uid}Ring 2s ease-out ${i * 0.6}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={baseR} fill={p.base} />
        {count !== undefined && (
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={size * 0.18} fontWeight="800" fill="#fff">
            {count}
          </text>
        )}
      </svg>
      {label && (
        <span style={{ fontSize: 11, color: p.dark, fontWeight: 700, opacity: 0.8 }}>
          {label}
        </span>
      )}
      <style>{`
        @keyframes ${uid}Ring {
          0%   { r: ${baseR}; opacity: .8; }
          100% { r: ${baseR * 3}; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
