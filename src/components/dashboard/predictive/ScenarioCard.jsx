// ================================================================
// ScenarioCard — what-if scenario chooser tile
// ================================================================
import React from "react";
import { resolvePalette, getAIPalette } from "../../../utils/dashboardPalette";

export default function ScenarioCard({ scenario, palette, active = false, onClick }) {
  const ai = getAIPalette();
  const p = resolvePalette(palette || ai);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? `linear-gradient(135deg, ${p.bg}, ${p.base}30)` : "#fff",
        border: active ? `2px solid ${p.base}` : `1px solid ${p.base}25`,
        borderRadius: 16,
        padding: "14px 14px",
        cursor: "pointer",
        textAlign: "start",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "transform .15s, box-shadow .15s",
        position: "relative",
        boxShadow: active ? `0 8px 24px ${p.base}30` : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 10px 28px ${p.base}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = active ? `0 8px 24px ${p.base}30` : "none";
      }}
    >
      <div style={{ fontSize: 24 }}>{scenario.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: p.dark, lineHeight: 1.4 }}>
        {scenario.label}
      </div>
      {scenario.subtitle && (
        <div style={{ fontSize: 11, color: "#64748B" }}>{scenario.subtitle}</div>
      )}
      {active && (
        <span
          style={{
            position: "absolute",
            top: 8,
            insetInlineEnd: 8,
            background: p.base,
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          ✓ ACTIVE
        </span>
      )}
    </button>
  );
}
