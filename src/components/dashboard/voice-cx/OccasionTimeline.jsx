// ================================================================
// OccasionTimeline — vertical countdown of upcoming birthdays/events
// ================================================================
import React from "react";
import { getAlertPalette, getAIPalette, getCustomerPalette, getMarketPalette, getSuccessPalette, paletteSequence } from "../../../utils/dashboardPalette";
import { fmtDate } from "../../../pages/dashboard/voice-cx/voiceCxApi";

const KIND_ICON = {
  birthday:    "🎂",
  anniversary: "🎉",
  ramadan:     "🌙",
  eid:         "🕌",
  yearEnd:     "🎊",
  newcustomer: "👋",
};

export default function OccasionTimeline({
  occasions = [],
  onConfigure,
  onSkip,
  onGenerate,
  t = (s) => s,
  lang = "TR",
}) {
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const market = getMarketPalette();
  const success = getSuccessPalette();

  if (!occasions || occasions.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>{t("birthday.timeline.empty")}</div>;
  }

  const palettes = paletteSequence(occasions.length, { exclude: ["wine"], startIdx: 6 });

  return (
    <div style={{ position: "relative", paddingInlineStart: 24 }}>
      <div
        style={{
          position: "absolute",
          insetInlineStart: 12,
          top: 6,
          bottom: 6,
          width: 2,
          background: "linear-gradient(180deg, #F43F5E, #6C3AFF, #10B981)",
          borderRadius: 2,
          opacity: 0.4,
        }}
      />
      {occasions.map((occ, i) => {
        const p = palettes[i] || ai;
        const dayLabel =
          occ.daysAway === 0 ? t("birthday.today") :
          occ.daysAway === 1 ? t("birthday.tomorrow") :
          t("birthday.daysAway", { n: occ.daysAway });
        return (
          <div key={occ.id} style={{ position: "relative", marginBottom: 16 }}>
            <div
              style={{
                position: "absolute",
                insetInlineStart: -19,
                top: 18,
                width: 16, height: 16, borderRadius: "50%",
                background: `linear-gradient(135deg, ${p.base}, ${p.dark})`,
                boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${p.base}40`,
                animation: occ.daysAway <= 1 ? "occPulse 1.6s infinite" : "none",
              }}
            />
            <div
              style={{
                background: "#fff",
                border: `1.5px solid ${p.base}40`,
                borderRadius: 14,
                padding: 14,
                boxShadow: `0 4px 14px ${p.base}15`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22 }}>{KIND_ICON[occ.kind] || "📅"}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                    {occ.customer
                      ? `${occ.customer.companyName || occ.customer.fullName || occ.customer.name || "—"} — ${t(`birthday.occasion.${occ.kind}`)}`
                      : `${t(`birthday.occasion.${occ.kind}`)} ${occ.bulkCount ? `(${occ.bulkCount})` : ""}`
                    }
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                    {fmtDate(occ.date, lang)} · <span style={{ color: p.dark, fontWeight: 700 }}>{dayLabel}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, background: p.bg, color: p.dark, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {occ.discountPct}% off
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#475569", padding: "8px 10px", background: "#F8FAFC", borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: ai.dark, fontWeight: 800, marginInlineEnd: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t("birthday.suggests")}:
                </span>
                {occ.bulkCount ? t("birthday.bulk.subtitle", { n: occ.bulkCount }) : `${occ.discountPct}% ${t(`nudge.channel.${occ.channel}`)}`}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                {onSkip && (
                  <button type="button" onClick={() => onSkip(occ)} style={{ background: "transparent", color: "#64748B", border: "1px solid transparent", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {t("birthday.skip")}
                  </button>
                )}
                {occ.bulkCount ? (
                  <button type="button" onClick={() => onGenerate?.(occ)} style={btn(p, "primary")}>
                    ⚡ {t("birthday.generate")}
                  </button>
                ) : (
                  <button type="button" onClick={() => onConfigure?.(occ)} style={btn(p, "primary")}>
                    {t("birthday.config")}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes occPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.18);} }`}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff", border: "none", padding: "8px 14px", borderRadius: 10,
      fontSize: 11, fontWeight: 800, cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  return {};
}
