// ================================================================
// AuditStatCards — 4 tinted stat cards with mini sparkline charts.
// Each card has a unique chart type (Line / Bar / Area / Donut), an
// Eye toggle that hides its chart and dims the card to 40%, and the
// toggle state persists across reloads via localStorage.
// ================================================================
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
} from "recharts";
import { Eye, EyeOff } from "lucide-react";

const CARD_DEFS = [
  { key: "total",    label: "TOTAL ENTRIES", chart: "line",  color: "#1A56DB", bg: "rgba(26, 86, 219, 0.08)",  border: "rgba(26, 86, 219, 0.25)" },
  { key: "info",     label: "INFO",          chart: "bar",   color: "#22D3EE", bg: "rgba(34, 211, 238, 0.10)", border: "rgba(34, 211, 238, 0.30)" },
  { key: "warning",  label: "WARNING",       chart: "area",  color: "#F59E0B", bg: "rgba(245, 158, 11, 0.10)", border: "rgba(245, 158, 11, 0.30)" },
  { key: "critical", label: "CRITICAL",      chart: "donut", color: "#EF4444", bg: "rgba(239, 68, 68, 0.10)",  border: "rgba(239, 68, 68, 0.35)" },
];

const STORAGE_KEY = "auditLogCardToggles";

const generateSparkline = (base, variance = 5) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + Math.round((Math.random() - 0.5) * variance)),
  }));

export default function AuditStatCards({ counts }) {
  const cards = CARD_DEFS.map((c) => ({ ...c, value: counts?.[c.key] ?? 0 }));

  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { total: true, info: true, warning: true, critical: true };
    } catch {
      return { total: true, info: true, warning: true, critical: true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    } catch { /* localStorage may be blocked */ }
  }, [enabled]);

  const toggle = (key) =>
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

  const total = counts?.total ?? cards[0].value;

  // Generate once per render group — sparklines are illustrative.
  const sparklines = {
    total:    generateSparkline(cards[0].value || 35, 8),
    info:     generateSparkline(cards[1].value || 14, 6),
    warning:  generateSparkline(cards[2].value || 18, 7),
    critical: generateSparkline(cards[3].value || 3,  2),
  };

  const renderChart = (card) => {
    const data = sparklines[card.key];

    if (card.chart === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={card.color}
              strokeWidth={2.5}
              dot={false}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (card.chart === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar
              dataKey="value"
              fill={card.color}
              radius={[3, 3, 0, 0]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (card.chart === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${card.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={card.color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={card.color}
              strokeWidth={2}
              fill={`url(#grad-${card.key})`}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (card.chart === "donut") {
      const denom = Math.max(1, total);
      const donutData = [
        { name: "critical", value: card.value },
        { name: "rest",     value: Math.max(1, denom - card.value) },
      ];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              innerRadius={18}
              outerRadius={28}
              startAngle={90}
              endAngle={-270}
              animationDuration={900}
            >
              <Cell fill={card.color} />
              <Cell fill="rgba(0, 0, 0, 0.06)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    }}>
      {cards.map((card) => {
        const isOn = enabled[card.key];
        return (
          <div
            key={card.key}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: "16px",
              padding: "20px",
              opacity: isOn ? 1 : 0.4,
              transition: "all 300ms ease",
              position: "relative",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: card.color,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>{card.label}</span>
              <button
                type="button"
                onClick={() => toggle(card.key)}
                aria-label={isOn ? "Hide chart" : "Show chart"}
                aria-pressed={isOn}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: card.color,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isOn ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#111827",
              marginBottom: "12px",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>{(card.value ?? 0).toLocaleString()}</div>

            <div style={{ height: "56px", marginInline: "-4px" }}>
              {isOn && renderChart(card)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
