// CalendarHeatmap — GitHub-style 365-day grid OR small monthly mini
import React from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

function shade(base, intensity) {
  // intensity 0..1; 0 -> very light, 1 -> base color
  const a = Math.max(0.08, intensity);
  return `${base}${Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase()}`;
}

export default function CalendarHeatmap({
  data = [],            // [{ date: 'YYYY-MM-DD', value: number }]
  palette,
  weeks = 53,
  cellSize = 11,
  gap = 3,
  mode = "year",        // 'year' | 'month'
  monthDate,            // optional Date for 'month' mode
  ariaLabel = "calendar heatmap",
}) {
  const p = resolvePalette(palette);
  const map = new Map(data.map((d) => [d.date, Number(d.value) || 0]));
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  if (mode === "month") {
    const ref = monthDate || new Date();
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const first = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7; // Monday-based
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= lastDay; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ d, iso, value: map.get(iso) || 0 });
    }
    return (
      <div role="img" aria-label={ariaLabel} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((dn, i) => (
          <div key={`hd-${i}`} style={{ fontSize: 10, color: "#94A3B8", textAlign: "center", fontWeight: 700 }}>{dn}</div>
        ))}
        {cells.map((c, i) =>
          c ? (
            <div
              key={i}
              title={`${c.iso}: ${c.value}`}
              style={{
                aspectRatio: "1",
                borderRadius: 6,
                background: c.value > 0 ? shade(p.base, 0.2 + 0.8 * (c.value / max)) : `${p.base}10`,
                color: c.value > 0 ? "#fff" : "#94A3B8",
                fontSize: 11,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
              }}
            >
              {c.d}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    );
  }

  // year mode: 53 weeks × 7 days grid
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  // align to Monday
  const wkOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - wkOffset);

  const totalCols = weeks;
  const cells = [];
  for (let c = 0; c < totalCols; c++) {
    for (let r = 0; r < 7; r++) {
      const dt = new Date(start);
      dt.setDate(dt.getDate() + c * 7 + r);
      const iso = dt.toISOString().slice(0, 10);
      cells.push({ c, r, iso, value: map.get(iso) || 0 });
    }
  }

  const w = totalCols * (cellSize + gap);
  const h = 7 * (cellSize + gap);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel} preserveAspectRatio="xMinYMin meet" style={{ display: "block" }}>
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.c * (cellSize + gap)}
          y={cell.r * (cellSize + gap)}
          width={cellSize}
          height={cellSize}
          rx={2.5}
          fill={cell.value > 0 ? shade(p.base, 0.2 + 0.8 * (cell.value / max)) : `${p.base}12`}
        >
          <title>{`${cell.iso}: ${cell.value}`}</title>
        </rect>
      ))}
    </svg>
  );
}
