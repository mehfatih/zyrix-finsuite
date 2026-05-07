// ================================================================
// B2BMatchEngine — AI-matched buyer/seller opportunity cards
// ================================================================
import React from "react";
import { getMoneyPalette, getCustomerPalette, getSuccessPalette, getMarketPalette } from "../../../utils/dashboardPalette";

export default function B2BMatchEngine({
  opportunities = [],
  onAct,
  onSkip,
  t = (s) => s,
}) {
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const market = getMarketPalette();

  if (!opportunities.length) {
    return <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>{t("b2b.opp.empty")}</div>;
  }

  return (
    <div>
      {opportunities.map((opp) => {
        const isBuy = opp.kind === "buy";
        const palette = isBuy ? success : market;
        return (
          <div
            key={opp.id}
            style={{
              background: "#fff",
              border: `1.5px solid ${palette.base}40`,
              borderRadius: 14, padding: 16, marginBottom: 12,
              boxShadow: `0 4px 14px ${palette.base}15`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: palette.bg, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {isBuy ? t("b2b.opp.buy") : t("b2b.opp.sell")}
              </span>
              <span style={{ marginInlineStart: "auto", fontSize: 10, color: "#94A3B8", fontWeight: 800 }}>
                {t("b2b.opp.matchScore")}: <span style={{ color: customer.dark, fontWeight: 800 }}>{opp.matchScore}%</span>
              </span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
              {isBuy
                ? `${opp.seller} — ${opp.item}`
                : `${opp.buyer} ${t("b2b.opp.sell").toLowerCase()} — ${opp.units} × ${opp.item}`}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>
              📍 {opp.location}
              {isBuy && opp.belowMarketPct ? ` · ${t("b2b.listing.belowMarket", { pct: opp.belowMarketPct })}` : ""}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={() => onSkip?.(opp)} style={btnGhost}>{t("b2b.opp.skip")}</button>
              <button type="button" onClick={() => onAct?.(opp)} style={{ background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${palette.base}40` }}>
                {isBuy ? `⚡ ${t("b2b.opp.makeOffer")}` : t("b2b.opp.sendQuote")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };
