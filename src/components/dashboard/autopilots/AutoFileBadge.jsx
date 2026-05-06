// ================================================================
// AutoFileBadge — pill that says "AI Auto-Filed" with confidence
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette, getWarningPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function AutoFileBadge({ confidence = 100, label = "AI Filed", size = "normal" }) {
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const palette = confidence >= 90 ? success : confidence >= 70 ? warn : alert;
  const padding = size === "compact" ? "2px 8px" : "4px 10px";
  const fontSize = size === "compact" ? 10 : 11;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: ai.bg,
        color: ai.dark,
        border: `1px solid ${ai.base}30`,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span>🤖</span>
      <span>{label}</span>
      <span
        style={{
          background: palette.base,
          color: "#fff",
          padding: "1px 6px",
          borderRadius: 999,
          fontSize: fontSize - 1,
          fontWeight: 800,
        }}
      >
        {confidence}%
      </span>
    </span>
  );
}
