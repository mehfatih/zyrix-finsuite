// ================================================================
// AROverlay — AR markers (zone dots + labels) absolutely positioned
// over a parent that holds the camera preview.
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getAIPalette } from "../../../utils/dashboardPalette";

const SEV_PALETTE_FN = (success, warn, alert, ai) => ({
  success,
  warning: warn,
  alert,
  info: ai,
});

export default function AROverlay({ zones = [], t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const map = SEV_PALETTE_FN(success, warn, alert, ai);

  if (zones.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {zones.map((z) => {
        const palette = map[z.severity] || ai;
        const labelText = t(`ar.store.zone.${z.label}`) || z.label;
        return (
          <div
            key={z.id}
            style={{
              position: "absolute",
              insetInlineStart: `${z.x}%`,
              top: `${z.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: palette.base,
                border: "3px solid #fff",
                boxShadow: `0 0 0 6px ${palette.base}40, 0 0 16px ${palette.base}80`,
                animation: "aroPulse 1.6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                marginTop: 6,
                background: palette.base,
                color: "#fff",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                boxShadow: `0 4px 12px ${palette.base}50`,
                whiteSpace: "nowrap",
                transform: "translateX(-50%)",
                marginInlineStart: 11,
              }}
            >
              {labelText}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes aroPulse {
          0%, 100% { box-shadow: 0 0 0 6px transparent, 0 0 14px currentColor; }
          50% { box-shadow: 0 0 0 14px transparent, 0 0 24px currentColor; }
        }
      `}</style>
    </div>
  );
}
