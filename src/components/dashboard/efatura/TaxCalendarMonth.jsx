// ================================================================
// TaxCalendarMonth — month grid with deadline pills + today pulse
// Color coding: red(today/overdue), amber(<3d), cyan(<7d), gray(future)
// ================================================================
import React, { useMemo } from "react";
import { getBrandPalette, getPaletteById } from "../../../utils/dashboardPalette";

function urgencyOf(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return "OVERDUE";
  if (diff === 0) return "TODAY";
  if (diff <= 3) return "THREE";
  if (diff <= 7) return "WEEK";
  return "FUTURE";
}

const URGENCY_PALETTE = {
  OVERDUE: "rose",
  TODAY:   "wine",
  THREE:   "amber",
  WEEK:    "cyan",
  FUTURE:  "indigo",
};

export default function TaxCalendarMonth({ year, month, deadlines = [], lang = "TR", t = (s) => s, onSelect }) {
  const brand = getBrandPalette(lang.toLowerCase());
  const ref = new Date(year, month, 1);
  const refY = ref.getFullYear();
  const refM = ref.getMonth();

  const monthName = ref.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const first = new Date(refY, refM, 1);
    const last = new Date(refY, refM + 1, 0);
    const offset = (first.getDay() + 6) % 7; // Monday-based
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(d);
    return cells;
  }, [refY, refM]);

  const byDay = useMemo(() => {
    const map = {};
    deadlines.forEach((dl) => {
      const dt = new Date(dl.dueDate || dl.date);
      if (dt.getFullYear() !== refY || dt.getMonth() !== refM) return;
      const day = dt.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(dl);
    });
    return map;
  }, [deadlines, refY, refM]);

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() && refM === today.getMonth() && refY === today.getFullYear();

  const dayHeaders = lang === "AR"
    ? ["إث", "ثلث", "أرب", "خم", "جم", "سب", "أح"]
    : lang === "EN"
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt", "Paz"];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: brand.dark, textTransform: "capitalize" }}>
          {monthName}
        </div>
        <div style={{ fontSize: 11, color: "#64748B" }}>{deadlines.length} deadlines</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {dayHeaders.map((h, i) => (
          <div
            key={i}
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#94A3B8",
              textAlign: "center",
              padding: "4px 0",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {days.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const dayDeadlines = byDay[d] || [];
          const top = dayDeadlines[0];
          const palette = top ? getPaletteById(URGENCY_PALETTE[urgencyOf(top.dueDate || top.date)]) : null;
          const today = isToday(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect && onSelect(d, dayDeadlines)}
              style={{
                aspectRatio: "1",
                borderRadius: 10,
                border: today ? `2px solid ${brand.base}` : `1px solid #E2E8F0`,
                background: dayDeadlines.length > 0 ? `${palette.base}15` : "#fff",
                color: "#0F172A",
                cursor: dayDeadlines.length > 0 ? "pointer" : "default",
                padding: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                position: "relative",
                animation: today ? "todayPulse 1.6s ease-in-out infinite" : "none",
                transition: "transform .15s",
              }}
              onMouseEnter={(e) => {
                if (dayDeadlines.length > 0) e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: today ? 900 : 700,
                  color: today ? brand.base : palette?.dark || "#475569",
                  textAlign: "start",
                  marginBottom: 2,
                }}
              >
                {d}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                {dayDeadlines.slice(0, 2).map((dl, j) => {
                  const u = urgencyOf(dl.dueDate || dl.date);
                  const p = getPaletteById(URGENCY_PALETTE[u]);
                  return (
                    <div
                      key={j}
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        background: p.base,
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {dl.title || dl.label || dl.code || "Tax"}
                    </div>
                  );
                })}
                {dayDeadlines.length > 2 && (
                  <div style={{ fontSize: 8, color: palette?.dark, fontWeight: 700 }}>
                    +{dayDeadlines.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes todayPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${brand.base}40; }
          50%      { box-shadow: 0 0 0 6px ${brand.base}10; }
        }
      `}</style>
    </div>
  );
}
