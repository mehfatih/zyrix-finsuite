// ================================================================
// DayTimeline — vertical day events with priority colors
// ================================================================
import React from "react";
import { getAlertPalette, getCustomerPalette, getReportsPalette, getMoneyPalette, getSuccessPalette, getAIPalette } from "../../../utils/dashboardPalette";
import { fmtTime } from "../../../pages/dashboard/cognitive/cognitiveApi";

export default function DayTimeline({ events = [], lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();

  const paletteFor = (priority) => {
    switch (priority) {
      case "high":      return alert;
      case "medium":    return customer;
      case "low":       return reports;
      case "protected": return money;
      case "free":      return ai;
      case "auto":      return success;
      default:          return ai;
    }
  };

  const labelFor = (priority) => {
    switch (priority) {
      case "high":      return t("calendar.priority.high");
      case "medium":    return t("calendar.priority.medium");
      case "low":       return t("calendar.priority.low");
      case "protected": return t("calendar.priority.protected");
      case "free":      return t("calendar.priority.free");
      default:          return null;
    }
  };

  if (events.length === 0) {
    return <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>{t("calendar.empty")}</div>;
  }

  return (
    <div style={{ position: "relative", paddingInlineStart: 60 }}>
      {/* vertical guide line */}
      <div style={{ position: "absolute", insetInlineStart: 38, top: 12, bottom: 12, width: 2, background: `${ai.base}25` }} />
      {events.map((ev, i) => {
        const palette = paletteFor(ev.priority);
        const label = labelFor(ev.priority);
        return (
          <div key={ev.id} style={{ position: "relative", marginBottom: 10 }}>
            {/* time on left */}
            <div
              style={{
                position: "absolute",
                insetInlineStart: -60,
                top: 14,
                width: 60,
                fontSize: 11,
                color: "#64748B",
                fontFamily: "monospace",
                fontWeight: 700,
                textAlign: "end",
                paddingInlineEnd: 12,
              }}
            >
              {fmtTime(ev.at, lang)}
            </div>
            {/* dot on guide */}
            <div
              style={{
                position: "absolute",
                insetInlineStart: -32,
                top: 18,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: palette.base,
                border: "2px solid #fff",
                boxShadow: `0 0 0 2px ${palette.base}40`,
                animation: ev.priority === "high" ? "dtPulse 1.4s ease-in-out infinite" : "none",
              }}
            />
            {/* card */}
            <div
              style={{
                background: "#fff",
                border: `1.5px solid ${palette.base}30`,
                borderRadius: 12,
                padding: 12,
                boxShadow: `0 2px 8px ${palette.base}15`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18 }}>{ev.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", flex: 1 }}>{ev.title}</span>
                {label && (
                  <span
                    style={{
                      background: `${palette.base}15`,
                      color: palette.dark,
                      border: `1px solid ${palette.base}40`,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
              {ev.subtitle && (
                <div style={{ fontSize: 11, color: "#64748B", paddingInlineStart: 26 }}>
                  {ev.priority === "free" ? `💡 ${t("calendar.suggestion")} ` : ""}
                  {ev.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes dtPulse {
          0%, 100% { box-shadow: 0 0 0 2px ${alert.base}40; }
          50%      { box-shadow: 0 0 0 8px ${alert.base}00; }
        }
      `}</style>
    </div>
  );
}
