// ================================================================
// PeerBenchmarkScatter — you-vs-peers per metric (range bar)
// ================================================================
import React from "react";
import { getSuccessPalette, getReportsPalette, getAlertPalette, getCustomerPalette, getAIPalette } from "../../../utils/dashboardPalette";

export default function PeerBenchmarkScatter({ metrics = [], t = (s) => s }) {
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();

  const tierPalette = (tier) =>
    tier === "top25" ? success :
    tier === "middle50" ? reports : alert;

  return (
    <div>
      {metrics.map((m) => {
        const palette = tierPalette(m.tier);
        // Map you/peer values to a 0-100% range for visualization
        const max = Math.max(m.youValue, m.peerMedian) * 1.4 || 1;
        const youPct = (m.youValue / max) * 100;
        const peerPct = (m.peerMedian / max) * 100;

        return (
          <div
            key={m.id}
            style={{
              background: "#fff", border: `1.5px solid ${palette.base}30`,
              borderRadius: 14, padding: 14, marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
                {t(m.labelKey)}
              </span>
              <span style={{ marginInlineStart: "auto", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: palette.bg, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t(`network.tier.${m.tier}`)}
              </span>
              {m.action && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: alert.bg, color: alert.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t("network.insight.action")}
                </span>
              )}
            </div>

            {/* Range bar with you/peer dots */}
            <div style={{ position: "relative", height: 28, marginBottom: 10 }}>
              <div style={{ position: "absolute", insetInlineStart: 0, insetInlineEnd: 0, top: 12, height: 4, background: "linear-gradient(90deg, #FECDD3, #FDE68A, #BBF7D0)", borderRadius: 999 }} />
              <div
                title={`Peers: ${formatVal(m.peerMedian, m.id)}`}
                style={{
                  position: "absolute", insetInlineStart: `${peerPct}%`, top: 6,
                  width: 16, height: 16, borderRadius: "50%",
                  background: customer.base, border: "2px solid #fff",
                  boxShadow: `0 2px 4px rgba(0,0,0,0.15)`,
                  transform: "translateX(-50%)",
                }}
              />
              <div
                title={`You: ${formatVal(m.youValue, m.id)}`}
                style={{
                  position: "absolute", insetInlineStart: `${youPct}%`, top: 2,
                  width: 24, height: 24, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
                  border: "3px solid #fff",
                  boxShadow: `0 4px 10px ${palette.base}50`,
                  transform: "translateX(-50%)",
                  display: "grid", placeItems: "center",
                  fontSize: 10, fontWeight: 800, color: "#fff",
                }}
              >
                ★
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
              <span>{t("network.you")}: <strong style={{ color: palette.dark }}>{formatVal(m.youValue, m.id)}</strong></span>
              <span>{t("network.peer")}: <strong style={{ color: customer.dark }}>{formatVal(m.peerMedian, m.id)}</strong></span>
            </div>

            <div style={{ fontSize: 11, color: "#475569", padding: "8px 10px", background: ai.bg, borderRadius: 8, lineHeight: 1.45 }}>
              💡 {m.insight}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatVal(v, id) {
  if (id === "retention" || id === "margin" || id === "churnRate") return `${(v * 100).toFixed(0)}%`;
  if (id === "revenuePerCust" || id === "salaryAvg") return `₺${Math.round(v).toLocaleString()}`;
  return Math.round(v);
}
