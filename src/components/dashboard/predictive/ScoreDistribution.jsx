// ================================================================
// ScoreDistribution — A-F histogram + scatter Score×Revenue
// ================================================================
import React from "react";
import { getSuccessPalette, getCustomerPalette, getWarningPalette, getAlertPalette, getMoneyPalette, getAIPalette } from "../../../utils/dashboardPalette";

const GRADE_PALETTE = (s, c, w, a, ai) => ({
  A: s,
  B: c,
  C: ai,
  D: w,
  F: a,
});

export function GradeHistogram({ buckets = {}, onSelect, t = (s) => s }) {
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const map = GRADE_PALETTE(success, customer, warn, alert, ai);
  const grades = ["A", "B", "C", "D", "F"];
  const maxCount = Math.max(1, ...grades.map((g) => buckets[g] || 0));
  const total = grades.reduce((s, g) => s + (buckets[g] || 0), 0) || 1;

  return (
    <div>
      {grades.map((g) => {
        const count = buckets[g] || 0;
        const pct = (count / maxCount) * 100;
        const sharePct = (count / total) * 100;
        const palette = map[g];
        return (
          <button
            key={g}
            type="button"
            onClick={() => onSelect && onSelect(g)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${palette.base}30`,
              background: "transparent",
              cursor: onSelect ? "pointer" : "default",
              marginBottom: 8,
              textAlign: "start",
              transition: "background .15s, transform .15s",
            }}
            onMouseEnter={(e) => onSelect && (e.currentTarget.style.background = `${palette.base}10`)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: `0 4px 12px ${palette.base}40`,
              }}
            >
              {g}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, background: `${palette.base}15`, borderRadius: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
                    transition: "width .8s ease",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 70 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: palette.dark, fontFamily: "monospace" }}>{count}</span>
              <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{sharePct.toFixed(0)}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ScoreScatter({ items = [], width = 480, height = 280 }) {
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const map = GRADE_PALETTE(success, customer, warn, alert, ai);

  if (!items.length) {
    return <div style={{ height, display: "grid", placeItems: "center", color: "#94A3B8" }}>—</div>;
  }

  const padding = 36;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const xMax = 100;
  const yMax = Math.max(1, ...items.map((it) => it.totalRev || 0));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
      {/* Quadrant grid */}
      <line x1={padding + w / 2} y1={padding} x2={padding + w / 2} y2={padding + h} stroke="#E2E8F0" strokeDasharray="4 4" />
      <line x1={padding} y1={padding + h / 2} x2={padding + w} y2={padding + h / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
      {/* Quadrant labels */}
      <text x={padding + w * 0.75} y={padding + 14} fontSize="10" fontWeight="800" fill={success.dark} textAnchor="middle">VIP</text>
      <text x={padding + w * 0.75} y={padding + h - 6} fontSize="10" fontWeight="800" fill={customer.dark} textAnchor="middle">Grow</text>
      <text x={padding + w * 0.25} y={padding + 14} fontSize="10" fontWeight="800" fill={alert.dark} textAnchor="middle">Risky</text>
      <text x={padding + w * 0.25} y={padding + h - 6} fontSize="10" fontWeight="800" fill={warn.dark} textAnchor="middle">Drop</text>
      {/* Axis labels */}
      <text x={padding + w / 2} y={height - 4} fontSize="10" fill="#64748B" textAnchor="middle">Score →</text>
      <text x={6} y={padding + h / 2} fontSize="10" fill="#64748B" transform={`rotate(-90 6 ${padding + h / 2})`} textAnchor="middle">Revenue ↑</text>
      {/* Dots */}
      {items.map((it, i) => {
        const x = padding + (it.score / xMax) * w;
        const y = padding + h - (it.totalRev / yMax) * h;
        const palette = map[it.grade] || ai;
        const r = 6 + (it.totalRev / yMax) * 8;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={palette.base}
            opacity="0.7"
            stroke="#fff"
            strokeWidth="1.5"
          >
            <title>{`${it.name} · Score ${it.score} · ₺${Math.round(it.totalRev).toLocaleString()}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
