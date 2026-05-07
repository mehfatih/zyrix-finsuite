// ================================================================
// ★ Smart Loyalty AI — per-customer reward type recommendations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getAIPalette, getMoneyPalette, getSuccessPalette, getCustomerPalette, getMarketPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import LoyaltyPointCalculator from "../../../components/dashboard/voice-cx/LoyaltyPointCalculator";
import { api, localStore, KEYS, buildLoyaltyRecommendations, fmtCurrency } from "./voiceCxApi";

export default function LoyaltyAIPage() {
  const t = useDashboardI18n("voice-cx");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const market = getMarketPalette();

  const [customers, setCustomers] = useState([]);
  const [config, setConfig] = useState(localStore.list(KEYS.loyaltyConfig));

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
  }, []);

  const recs = useMemo(() => buildLoyaltyRecommendations(customers), [customers]);
  const appliedIds = new Set(config.map((c) => c.recommendationId));
  const stats = {
    optimized: config.length,
    activeCustomers: customers.length,
    pointsValue: customers.length * 240,
    uplift: customers.length * 85,
  };

  const apply = (rec) => {
    localStore.add(KEYS.loyaltyConfig, {
      recommendationId: rec.id,
      customerId: rec.customer.id,
      reward: rec.reward,
      multiplier: rec.multiplier,
      percent: rec.percent,
      at: new Date().toISOString(),
    });
    setConfig(localStore.list(KEYS.loyaltyConfig));
  };

  const applyAll = () => {
    recs.forEach((r) => { if (!appliedIds.has(r.id)) apply(r); });
  };

  const rewardLabel = (rec) => {
    if (rec.reward === "points") return t("loyalty.reward.points", { x: rec.multiplier || 10 });
    if (rec.reward === "vip") return t("loyalty.reward.vip");
    if (rec.reward === "welcome") return t("loyalty.reward.welcome");
    if (rec.reward === "gift") return t("loyalty.reward.gift");
    if (rec.reward === "cashback") return t("loyalty.reward.cashback", { x: rec.percent || 5 });
    return t("loyalty.reward.discount", { x: rec.percent || 10 });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("loyalty.title")} subtitle={t("loyalty.subtitle")} icon="💝" palette={ai}
        actions={recs.length > 0 && (
          <button type="button" onClick={applyAll} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            ⚡ {t("loyalty.action.applyAll")}
          </button>
        )}
      />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="lo-kpis"
      >
        <KpiCard label={t("loyalty.kpi.optimized")}        value={stats.optimized}              palette={ai}      icon="🎯" />
        <KpiCard label={t("loyalty.kpi.activeCustomers")}  value={stats.activeCustomers}        palette={customer} icon="👥" />
        <KpiCard label={t("loyalty.kpi.pointsValue")}      value={fmtCurrency(stats.pointsValue)} palette={money}  icon="💎" />
        <KpiCard label={t("loyalty.kpi.uplift")}           value={fmtCurrency(stats.uplift)}    palette={success} icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }} className="lo-grid">
        <Card palette={ai} title={t("loyalty.queue.title")} icon="🧠">
          {recs.length === 0 ? (
            <EmptyState icon="👤" title={t("loyalty.queue.empty")} palette={ai} />
          ) : (
            recs.map((rec) => {
              const applied = appliedIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  style={{
                    background: applied ? success.bg : "#fff",
                    border: `1.5px solid ${applied ? success.base + "50" : ai.base + "30"}`,
                    borderRadius: 14, padding: 14, marginBottom: 10,
                    transition: "all .25s",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginBottom: 8 }} className="lo-row-head">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                        {rec.customer.companyName || rec.customer.fullName || rec.customer.name || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: customer.dark, fontWeight: 700, marginTop: 2 }}>
                        {t(`loyalty.personality.${rec.personality}`)}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, background: ai.bg, color: ai.dark, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t("loyalty.suggestion.label")}
                    </span>
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: market.dark }}>
                      🎁 {rewardLabel(rec)}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontStyle: "italic" }}>
                      "{rewardReason(rec.personality)}"
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {!applied && (
                      <>
                        <button type="button" style={btnGhost}>{t("loyalty.action.skip")}</button>
                        <button type="button" style={btnGhost}>{t("loyalty.action.customize")}</button>
                        <button type="button" onClick={() => apply(rec)} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 12px ${success.base}40` }}>
                          {t("loyalty.action.apply")}
                        </button>
                      </>
                    )}
                    {applied && (
                      <span style={{ fontSize: 11, fontWeight: 800, color: success.dark }}>
                        ✓ Applied
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <div>
          <LoyaltyPointCalculator t={t} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .lo-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) {
          .lo-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .lo-row-head { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer" };

function rewardReason(personality) {
  return ({
    analytical: "He values savings more than experiences",
    premium:    "She values exclusivity over discounts",
    new:        "Get them hooked first, then optimize",
    friendly:   "They respond to personal gestures",
    skeptical:  "Cashback feels safer than promises",
  })[personality] || "Tailored to their personality";
}
