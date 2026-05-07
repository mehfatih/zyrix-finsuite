// ================================================================
// ★ Influencer ROI Tracking — campaign performance + calculator
// ================================================================
import React, { useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getPaletteById, getMoneyPalette, getSuccessPalette, getAlertPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InfluencerROICalculator from "../../../components/dashboard/ecosystem/InfluencerROICalculator";
import { listInfluencers, calcInfluencerRoi, fmtCurrency } from "./ecosystemApi";

const PLATFORM_PALETTE = {
  instagram: { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" },
  tiktok:    { bg: "#0F172A1A", base: "#0F172A", dark: "#000000" },
  youtube:   { bg: "#FEE2E2", base: "#EF4444", dark: "#B91C1C" },
  linkedin:  { bg: "#E0F2FE", base: "#0284C7", dark: "#075985" },
};

export default function InfluencerTrackingPage() {
  const t = useDashboardI18n("ecosystem");
  const rose = getPaletteById("rose");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();

  const [influencers] = useState(listInfluencers());

  const stats = {
    active:  influencers.length,
    spend:   influencers.reduce((s, i) => s + i.spent, 0),
    revenue: influencers.reduce((s, i) => s + i.attributed, 0),
    avgROI: (() => {
      const rois = influencers.map((i) => calcInfluencerRoi(i.spent, i.attributed).roi);
      return rois.length ? Math.round((rois.reduce((s, r) => s + r, 0) / rois.length) * 100) : 0;
    })(),
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("influencer.title")} subtitle={t("influencer.subtitle")} icon="📣" palette={rose} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="if-kpis">
        <KpiCard label={t("influencer.kpi.activeCampaigns")} value={stats.active}              palette={rose}    icon="📣" />
        <KpiCard label={t("influencer.kpi.spend")}           value={fmtCurrency(stats.spend)}  palette={alert}   icon="💸" />
        <KpiCard label={t("influencer.kpi.revenue")}         value={fmtCurrency(stats.revenue)} palette={money}  icon="💰" />
        <KpiCard label={t("influencer.kpi.avgROI")}          value={`${stats.avgROI}%`}        palette={success} icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="if-grid">
        <Card palette={rose} title="Influencer performance" icon="🎬">
          {influencers.length === 0 ? (
            <EmptyState icon="📭" title="No influencers tracked yet." palette={rose} />
          ) : (
            influencers.map((inf) => {
              const { roi, profit } = calcInfluencerRoi(inf.spent, inf.attributed);
              const positive = roi >= 0;
              const palette = positive ? success : alert;
              const platform = PLATFORM_PALETTE[inf.platform] || customer;
              return (
                <div
                  key={inf.id}
                  style={{
                    background: "#fff", border: `1.5px solid ${palette.base}30`,
                    borderRadius: 14, padding: 14, marginBottom: 10,
                    boxShadow: `0 4px 12px ${palette.base}15`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${platform.base}, ${platform.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}>
                      {inf.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{inf.name}</div>
                      <div style={{ fontSize: 10, color: platform.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {t(`influencer.platform.${inf.platform}`)}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: palette.dark, fontFamily: "monospace" }}>
                      {positive ? "+" : ""}{(roi * 100).toFixed(0)}% {positive ? "🎉" : "⚠️"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }} className="if-stats">
                    <Stat label={t("influencer.spent")}      value={fmtCurrency(inf.spent)}      palette={alert} />
                    <Stat label={t("influencer.attributed")} value={fmtCurrency(inf.attributed)} palette={success} />
                    <Stat label={t("influencer.roi")}        value={`${(roi * 100).toFixed(0)}%`} palette={palette} />
                    <Stat label={t("influencer.ltv")}        value={fmtCurrency(inf.ltv)}        palette={customer} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {inf.recommended === "engageAgain" ? (
                      <button type="button" style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 12px ${success.base}40` }}>
                        ✨ {t("influencer.action.engageAgain")}
                      </button>
                    ) : (
                      <button type="button" style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                        {t("influencer.action.skip")}
                      </button>
                    )}
                  </div>
                  <style>{`@media (max-width: 540px) { .if-stats { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
                </div>
              );
            })
          )}
        </Card>

        <InfluencerROICalculator t={t} />
      </div>

      <style>{`
        @media (max-width: 900px) { .if-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .if-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}

function Stat({ label, value, palette }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "6px 8px", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: 8, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: palette.dark, marginTop: 2, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
