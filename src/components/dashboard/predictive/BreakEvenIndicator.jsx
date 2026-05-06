// ================================================================
// BreakEvenIndicator — countdown to cash-zero with date display
// ================================================================
import React from "react";
import { getAlertPalette, getWarningPalette, getSuccessPalette } from "../../../utils/dashboardPalette";

export default function BreakEvenIndicator({ days = 60, lang = "TR", t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const palette = days < 15 ? alert : days < 30 ? warn : success;
  const date = new Date(Date.now() + days * 86400000);
  const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
  const dateStr = date.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}25)`,
        border: `2px solid ${palette.base}40`,
        borderRadius: 16,
        padding: 18,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {t("stress.breakeven.title")}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: palette.base,
          fontFamily: "monospace",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          animation: days < 15 ? "beBlink 1.4s ease-in-out infinite" : "none",
        }}
      >
        {days}
        <span style={{ fontSize: 18, color: palette.dark, fontWeight: 700, marginInlineStart: 6 }}>days</span>
      </div>
      <div style={{ fontSize: 13, color: palette.dark, fontWeight: 700, marginTop: 8 }}>
        {t("stress.breakeven.message").replace("{date}", dateStr)}
      </div>
      <style>{`
        @keyframes beBlink {
          0%, 100% { text-shadow: 0 0 0 ${palette.base}40; }
          50% { text-shadow: 0 0 20px ${palette.base}80; }
        }
      `}</style>
    </div>
  );
}
