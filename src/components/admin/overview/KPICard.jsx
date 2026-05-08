// ================================================================
// KPICard — animated KPI tile for Overview pages.
// Position 0..3 picks both the color theme and the chart shape:
//   0 → wine red,  area chart
//   1 → gold,      bar chart
//   2 → cyan,      donut
//   3 → violet,    pulsing sparkline
// Big number counts up on mount, chart draws in, hover lifts card.
// Eye toggle hides chart and dims card; persists per (pageKey, position).
// ================================================================
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { KPI_COLORS } from "../../../design-system/colors";

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function KPICard({
  position,             // 0..3 (also picks chart shape)
  label,                // 'TOTAL CUSTOMERS'
  value,                // 1247
  trend,                // +8.4 or -0.6
  trendLabel,           // 'vs last 30d'
  format = "number",    // 'number' | 'currency' | 'percent'
  prefix = "",          // '₺' for currency
  suffix = "",          // '%' for percent
  sparklineData,        // array of {day, value}
  pageKey,              // for localStorage namespace, e.g. 'customers'
}) {
  const theme = KPI_COLORS[position % 4];
  const animatedValue = useCountUp(value, 1100);
  const storageKey = `kpi_${pageKey}_${position}_enabled`;

  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(enabled));
    } catch { /* localStorage may be blocked */ }
  }, [enabled, storageKey]);

  // Decimal-aware formatting: percent values like 2.1 should keep one
  // decimal during count-up; integer values round naturally.
  const isFractional = format === "percent" || (typeof value === "number" && !Number.isInteger(value));
  const display = isFractional ? animatedValue.toFixed(1) : Math.round(animatedValue).toLocaleString();

  const formatted =
    format === "currency" ? `${prefix}${Math.round(animatedValue).toLocaleString()}` :
    format === "percent"  ? `${display}${suffix || "%"}` :
                            `${prefix}${display}${suffix}`;

  const renderChart = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    // Position 0 → Animated Area Line
    if (position % 4 === 0) return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData}>
          <defs>
            <linearGradient id={`area-${pageKey}-${position}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={theme.color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={theme.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={theme.color}
            strokeWidth={2.5}
            fill={`url(#area-${pageKey}-${position})`}
            isAnimationActive
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    );

    // Position 1 → Bar Chart
    if (position % 4 === 1) return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sparklineData}>
          <Bar
            dataKey="value"
            fill={theme.color}
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    );

    // Position 2 → Animated Donut
    if (position % 4 === 2) {
      const last = sparklineData[sparklineData.length - 1]?.value || 0;
      const total = sparklineData.reduce((s, d) => s + d.value, 0) || 1;
      const data = [
        { name: "now",  value: last },
        { name: "rest", value: Math.max(1, total - last) },
      ];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={20}
              outerRadius={32}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={1200}
            >
              <Cell fill={theme.color} />
              <Cell fill="rgba(0,0,0,0.06)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Position 3 → Pulsing Sparkline
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparklineData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={theme.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: theme.color }}
            isAnimationActive
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend >= 0 ? "#10B981" : "#EF4444";

  return (
    <div
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding: "20px",
        opacity: enabled ? 1 : 0.45,
        transition: "all 300ms ease",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 0 0 1px transparent",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px ${theme.glow}, 0 0 0 1px ${theme.border}`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 0 rgba(0,0,0,0.02), 0 0 0 1px transparent";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row: label + eye toggle */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "8px",
      }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 700,
          color: theme.color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textShadow: "none",
        }}>{label}</span>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          aria-label={enabled ? "Hide chart" : "Show chart"}
          aria-pressed={enabled}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: theme.color,
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {/* Big animated number */}
      <div style={{
        fontSize: "32px",
        fontWeight: 800,
        color: "#111827",
        marginBottom: "8px",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        textShadow: "none",
      }}>{formatted}</div>

      {/* Trend pill */}
      {typeof trend === "number" && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "10px",
          fontSize: "12px",
          fontWeight: 600,
          color: trendColor,
        }}>
          <TrendIcon size={14} />
          <span>{trend > 0 ? "+" : ""}{trend}%</span>
          {trendLabel && <span style={{ color: "#6B7280", fontWeight: 500 }}>· {trendLabel}</span>}
        </div>
      )}

      {/* Mini chart */}
      <div style={{ height: "54px", marginInline: "-4px" }}>
        {enabled && renderChart()}
      </div>
    </div>
  );
}
