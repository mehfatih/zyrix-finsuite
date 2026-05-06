// ================================================================
// Card — color-aware container, foundation of the dashboard system
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { resolvePalette } from "../../utils/dashboardPalette";

function AnimatedNumber({ value, durationMs = 1200 }) {
  const [n, setN] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setN(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs]);
  const display = Number.isInteger(Number(value))
    ? Math.round(n).toLocaleString()
    : n.toFixed(2).toLocaleString();
  return <span>{display}</span>;
}

export default function Card({
  palette,
  paletteIdx = 0,
  title,
  subtitle,
  icon,
  value,
  prefix = "",
  suffix = "",
  trend,
  trendLabel,
  chart,
  footerText,
  footerLink,
  onClick,
  size = "normal",
  children,
  className = "",
  style = {},
  noHover = false,
}) {
  const p = resolvePalette(palette, paletteIdx);
  const isPositive = trend && !String(trend).startsWith("-");
  const padding = size === "compact" ? 14 : size === "large" ? 26 : 20;
  const numberSize = size === "large" ? 36 : size === "compact" ? 22 : 28;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: p.bg,
        borderRadius: 18,
        padding,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .25s ease, box-shadow .25s ease, background .3s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        border: `1px solid ${p.base}1A`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (noHover) return;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 32px ${p.base}25, 0 2px 6px rgba(0,0,0,.06)`;
      }}
      onMouseLeave={(e) => {
        if (noHover) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)";
      }}
    >
      {(title || icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background: p.base + "22",
                color: p.base,
                fontSize: 18,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div style={{ fontSize: 13, color: p.dark, fontWeight: 700, opacity: 0.9 }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 11, color: p.dark, opacity: 0.6, marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {value !== undefined && value !== null && (
        <div style={{ marginBottom: chart || children || footerText ? 12 : 0 }}>
          <div
            style={{
              fontSize: numberSize,
              fontWeight: 800,
              color: p.dark,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {prefix}
            <AnimatedNumber value={value} />
            {suffix}
          </div>
          {trend && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                fontSize: 12,
                fontWeight: 700,
                color: isPositive ? "#10B981" : "#EF4444",
              }}
            >
              {isPositive ? "↑" : "↓"} {trend}
              {trendLabel && (
                <span style={{ color: p.dark, opacity: 0.6, fontWeight: 500, marginLeft: 4 }}>
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {chart && (
        <div style={{ marginBottom: footerText ? 12 : 0 }}>
          {React.isValidElement(chart) ? React.cloneElement(chart, { palette: p }) : chart}
        </div>
      )}

      {children}

      {footerText && (
        <div
          style={{
            fontSize: 12,
            color: p.dark,
            opacity: 0.7,
            paddingTop: 10,
            marginTop: chart || children ? 4 : 0,
            borderTop: `1px solid ${p.base}22`,
          }}
        >
          {footerLink ? (
            <a
              href={footerLink}
              style={{ color: p.base, fontWeight: 700, textDecoration: "none" }}
            >
              {footerText} →
            </a>
          ) : (
            footerText
          )}
        </div>
      )}
    </div>
  );
}

export { AnimatedNumber };
