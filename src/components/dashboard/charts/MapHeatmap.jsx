// MapHeatmap — abstract Turkey + MENA dot-grid heatmap (lightweight, no GeoJSON dependency)
import React from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

// Approximate normalized lat/lng for major cities (TR + MENA)
// Scaled to a 0..1 box where x=0 (left/west), y=0 (top/north).
const CITIES = {
  // Turkey
  istanbul:   { x: 0.30, y: 0.18, label: "İstanbul" },
  ankara:     { x: 0.40, y: 0.26, label: "Ankara" },
  izmir:      { x: 0.27, y: 0.30, label: "İzmir" },
  antalya:    { x: 0.36, y: 0.36, label: "Antalya" },
  bursa:      { x: 0.32, y: 0.22, label: "Bursa" },
  adana:      { x: 0.46, y: 0.34, label: "Adana" },
  gaziantep:  { x: 0.50, y: 0.34, label: "Gaziantep" },
  trabzon:    { x: 0.55, y: 0.22, label: "Trabzon" },
  konya:      { x: 0.40, y: 0.32, label: "Konya" },
  // MENA
  cairo:      { x: 0.50, y: 0.55, label: "Cairo" },
  riyadh:     { x: 0.65, y: 0.62, label: "Riyadh" },
  jeddah:     { x: 0.60, y: 0.62, label: "Jeddah" },
  dubai:      { x: 0.78, y: 0.62, label: "Dubai" },
  doha:       { x: 0.74, y: 0.60, label: "Doha" },
  beirut:     { x: 0.48, y: 0.40, label: "Beirut" },
  amman:      { x: 0.50, y: 0.46, label: "Amman" },
  baghdad:    { x: 0.62, y: 0.42, label: "Baghdad" },
  kuwait:     { x: 0.68, y: 0.50, label: "Kuwait" },
  manama:     { x: 0.74, y: 0.55, label: "Manama" },
  muscat:     { x: 0.84, y: 0.62, label: "Muscat" },
};

export default function MapHeatmap({
  data = [],            // [{ city: 'istanbul', value: number }]
  palette,
  width = 640,
  height = 360,
  ariaLabel = "geo heatmap",
  showLabels = true,
}) {
  const p = resolvePalette(palette);
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} style={{ display: "block" }}>
      <defs>
        <radialGradient id={`mapglow-${p.id}`}>
          <stop offset="0%" stopColor={p.base} stopOpacity="0.55" />
          <stop offset="100%" stopColor={p.base} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background dot grid evoking landmass */}
      <g opacity="0.18">
        {Array.from({ length: 18 }).map((_, r) =>
          Array.from({ length: 32 }).map((__, c) => {
            const x = (c / 31) * width;
            const y = (r / 17) * height;
            // crude landmass mask: drop dots outside a hand-tuned silhouette
            const insideTR = y > 0.12 * height && y < 0.40 * height && x > 0.18 * width && x < 0.62 * width;
            const insideMENA = y > 0.38 * height && y < 0.78 * height && x > 0.40 * width && x < 0.92 * width;
            if (!insideTR && !insideMENA) return null;
            return <circle key={`${r}-${c}`} cx={x} cy={y} r="2" fill="#94A3B8" />;
          })
        )}
      </g>

      {/* Heat blobs */}
      {data.map((d, i) => {
        const city = CITIES[d.city];
        if (!city) return null;
        const cx = city.x * width;
        const cy = city.y * height;
        const intensity = (Number(d.value) || 0) / max;
        const r = 16 + 36 * intensity;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={`url(#mapglow-${p.id})`} />
            <circle cx={cx} cy={cy} r={4 + 6 * intensity} fill={p.base}>
              <title>{`${city.label}: ${d.value}`}</title>
            </circle>
            {showLabels && intensity > 0.3 && (
              <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={p.dark}>
                {city.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Region tag */}
      <text x={12} y={height - 12} fontSize="10" fill="#94A3B8" fontWeight="600">
        TR + MENA
      </text>
    </svg>
  );
}
