// ================================================================
// SuggestionChip — AI-suggested action button (3 variants)
// ================================================================
import React from "react";
import { resolvePalette, getAIPalette } from "../../../utils/dashboardPalette";

export default function SuggestionChip({
  label,
  variant = "quick", // quick | detailed | empathetic
  palette,
  onClick,
  icon = "✨",
}) {
  const ai = getAIPalette();
  const p = palette || ai;
  const styles = {
    quick: {
      bg: `${p.base}10`,
      color: p.dark,
      border: `1px solid ${p.base}30`,
    },
    detailed: {
      bg: "#fff",
      color: p.dark,
      border: `1.5px solid ${p.base}50`,
    },
    empathetic: {
      bg: `linear-gradient(135deg, ${p.bg}, ${p.base}25)`,
      color: p.dark,
      border: `1px solid ${p.base}40`,
    },
  };
  const s = styles[variant] || styles.quick;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: s.bg,
        color: s.color,
        border: s.border,
        borderRadius: 12,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        textAlign: "start",
        maxWidth: "100%",
        transition: "transform .15s, box-shadow .15s",
        whiteSpace: "normal",
        lineHeight: 1.4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 6px 14px ${p.base}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
