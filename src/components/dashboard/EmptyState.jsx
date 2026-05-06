// ================================================================
// EmptyState — illustrated empty data UI with CTA
// ================================================================
import React from "react";
import { resolvePalette } from "../../utils/dashboardPalette";

export default function EmptyState({
  icon = "📭",
  title = "No data yet",
  description = "",
  action,
  palette,
  paletteIdx = 0,
  size = "normal",
  style = {},
}) {
  const p = resolvePalette(palette, paletteIdx);
  const padY = size === "compact" ? 24 : size === "large" ? 64 : 44;
  const iconSize = size === "compact" ? 36 : size === "large" ? 64 : 48;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${padY}px 20px`,
        textAlign: "center",
        gap: 10,
        ...style,
      }}
    >
      <div
        style={{
          width: iconSize + 28,
          height: iconSize + 28,
          borderRadius: "50%",
          background: p.bg,
          color: p.base,
          display: "grid",
          placeItems: "center",
          fontSize: iconSize,
          border: `1px solid ${p.base}22`,
          marginBottom: 4,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: size === "compact" ? 14 : 16,
          fontWeight: 700,
          color: p.dark,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 13,
            color: "#64748B",
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
