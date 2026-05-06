// ================================================================
// PageHeader — title + subtitle + breadcrumb + action buttons
// ================================================================
import React from "react";
import { resolvePalette } from "../../utils/dashboardPalette";

export default function PageHeader({
  title,
  subtitle,
  breadcrumb = [],
  actions,
  palette,
  paletteIdx = 0,
  icon,
  style = {},
}) {
  const p = resolvePalette(palette, paletteIdx);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 24,
        ...style,
      }}
    >
      {breadcrumb.length > 0 && (
        <nav
          aria-label="breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#64748B",
            flexWrap: "wrap",
          }}
        >
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {item.href ? (
                <a
                  href={item.href}
                  style={{
                    color: "#64748B",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span style={{ color: p.dark, fontWeight: 600 }}>{item.label}</span>
              )}
              {i < breadcrumb.length - 1 && <span style={{ opacity: 0.4 }}>/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
          {icon && (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: p.bg,
                color: p.base,
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                border: `1px solid ${p.base}25`,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  color: "#64748B",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component: PageHeaderButton — palette-aware action
export function PageHeaderButton({
  children,
  onClick,
  palette,
  paletteIdx = 0,
  variant = "primary",
  icon,
  type = "button",
  disabled = false,
}) {
  const p = resolvePalette(palette, paletteIdx);
  const styles = {
    primary: {
      background: p.base,
      color: "#fff",
      border: `1px solid ${p.base}`,
    },
    secondary: {
      background: "#fff",
      color: p.dark,
      border: `1px solid ${p.base}40`,
    },
    ghost: {
      background: "transparent",
      color: p.dark,
      border: "1px solid transparent",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: "10px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = `0 6px 14px ${p.base}33`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
