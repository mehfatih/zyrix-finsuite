// ================================================================
// ChurnRiskBadge — green/amber/red pill with confidence meter
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function ChurnRiskBadge({ probability = 0, confidence = 0, size = "normal" }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const palette =
    probability >= 70 ? alert :
    probability >= 40 ? warn : success;
  const label = probability >= 70 ? "HIGH" : probability >= 40 ? "MEDIUM" : "LOW";
  const padding = size === "compact" ? "2px 8px" : "4px 12px";
  const fontSize = size === "compact" ? 10 : 11;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: `${palette.base}15`,
        color: palette.dark,
        border: `1px solid ${palette.base}40`,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: palette.base,
          flexShrink: 0,
          animation: probability >= 70 ? "crBlink 1.4s ease-in-out infinite" : "none",
        }}
      />
      {label} · {probability}%
      {confidence > 0 && (
        <span style={{ fontSize: fontSize - 1, opacity: 0.7, fontWeight: 600 }}>
          ({confidence}% conf)
        </span>
      )}
      <style>{`
        @keyframes crBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${palette.base}80; }
          50% { opacity: 0.5; box-shadow: 0 0 0 5px ${palette.base}00; }
        }
      `}</style>
    </span>
  );
}
