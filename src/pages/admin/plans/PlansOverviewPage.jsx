// ================================================================
// /admin/plans/overview — Plan performance via Donut + Radar +
// Sankey + Treemap. Demonstrates that the Bible's shape-language
// philosophy can rotate visualisation types per page so each
// Overview tells its own story without homogenising.
// ================================================================
import React, { useMemo } from "react";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedTierBars from "../../../components/admin/overview/charts/AnimatedTierBars";
import AnimatedRadar from "../../../components/admin/overview/charts/AnimatedRadar";
import AnimatedSankey from "../../../components/admin/overview/charts/AnimatedSankey";
import AnimatedPodium from "../../../components/admin/overview/charts/AnimatedPodium";
import PowerBISummary from "../../../components/admin/overview/PowerBISummary";
import AIRecommendations from "../../../components/admin/overview/AIRecommendations";
import { ANALYTICS_COLORS } from "../../../design-system/colors";

const genSparkline = (base, variance) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

function usePlansOverviewData() {
  return useMemo(() => ({
    kpis: {
      activePlans:  { value: 7,      trend: 0,    sparkline: genSparkline(7, 1) },
      totalPlanMrr: { value: 929353, trend: 12.1, sparkline: genSparkline(929353, 40000) },
      upgradeRate:  { value: 8.4,    trend: 1.2,  sparkline: genSparkline(8.4, 1.2) },
      avgLtv:       { value: 14250,  trend: 6.8,  sparkline: genSparkline(14250, 1500) },
    },
    planDistribution: [
      { name: "Free",       count: 412, mrr: 0,      color: "#6B7280" },
      { name: "Pro",        count: 538, mrr: 268362, color: "#1A56DB" },
      { name: "Business",   count: 247, mrr: 370253, color: "#7C3AED" },
      { name: "Enterprise", count: 50,  mrr: 249950, color: "#E30A17" },
    ],
    featureAxes: [
      { key: "aiUsage",       label: "AI Usage",     max: 100 },
      { key: "reportsRun",    label: "Reports",      max: 100 },
      { key: "integrations",  label: "Integrations", max: 100 },
      { key: "apiCalls",      label: "API",          max: 100 },
      { key: "collaboration", label: "Collab",       max: 100 },
    ],
    featureSeries: [
      { name: "Pro",      color: "#1A56DB",
        values: { aiUsage: 62, reportsRun: 78, integrations: 54, apiCalls: 45, collaboration: 71 } },
      { name: "Business", color: "#7C3AED",
        values: { aiUsage: 87, reportsRun: 91, integrations: 82, apiCalls: 79, collaboration: 88 } },
    ],
    planSwitches: {
      leftNodes: [
        { key: "free",     label: "Free",     color: "#6B7280" },
        { key: "pro",      label: "Pro",      color: "#1A56DB" },
        { key: "business", label: "Business", color: "#7C3AED" },
      ],
      rightNodes: [
        { key: "pro",        label: "Pro",        color: "#1A56DB" },
        { key: "business",   label: "Business",   color: "#7C3AED" },
        { key: "enterprise", label: "Enterprise", color: "#E30A17" },
        { key: "churned",    label: "Churned",    color: "#EF4444" },
      ],
      flows: [
        { from: "free",     to: "pro",        value: 142 },
        { from: "free",     to: "business",   value: 38 },
        { from: "free",     to: "churned",    value: 89 },
        { from: "pro",      to: "business",   value: 47 },
        { from: "pro",      to: "enterprise", value: 12 },
        { from: "pro",      to: "churned",    value: 28 },
        { from: "business", to: "enterprise", value: 9 },
        { from: "business", to: "churned",    value: 11 },
      ],
    },
    topPlansByMrr: [
      { id: 1, name: "Business Annual",      tier: "Business",   mrr: 370253 },
      { id: 2, name: "Pro Monthly",          tier: "Pro",        mrr: 268362 },
      { id: 3, name: "Enterprise Custom",    tier: "Enterprise", mrr: 249950 },
      { id: 4, name: "Pro Annual",           tier: "Pro",        mrr: 124500 },
      { id: 5, name: "Business Monthly",     tier: "Business",   mrr: 84200 },
      { id: 6, name: "Lite Pay-as-you-go",   tier: "Lite",       mrr: 18500 },
    ],
  }), []);
}

function buildPlansRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.freeToPaid < 30) {
    recs.push({
      id: "free-to-paid",
      priority: "high",
      text: `Free→Paid conversion at ${snapshot.freeToPaid}% is below the 30% benchmark. Audit the Free experience and add upgrade nudges at activation moments.`,
      action: "Review activation funnel",
    });
  }
  if (snapshot.freeToChurn > 25) {
    recs.push({
      id: "free-churn",
      priority: "high",
      text: `${snapshot.freeToChurn}% of Free users churn outright — onboarding gap. Add a 7-day welcome flow and ROI checklist before the trial wall.`,
      action: "Open onboarding builder",
    });
  }
  if (snapshot.businessAiGap >= 20) {
    recs.push({
      id: "business-ai-promote",
      priority: "medium",
      text: `Business plan uses ${snapshot.businessAi}% AI vs Pro's ${snapshot.proAi}%. Promote AI features in Pro upsell emails — clear value gap.`,
      action: "Edit upsell sequence",
    });
  }
  if (snapshot.enterpriseConversions < 25) {
    recs.push({
      id: "enterprise-motion",
      priority: "medium",
      text: `Only ${snapshot.enterpriseConversions} Enterprise conversions YTD. Stand up a dedicated outbound motion — current pipeline is too passive.`,
      action: "Open Enterprise pipeline",
    });
  }
  if (parseFloat(snapshot.upgradeRate) >= 8) {
    recs.push({
      id: "upgrade-strong",
      priority: "low",
      text: `Upgrade rate at ${snapshot.upgradeRate}% is healthy. Document what's working in onboarding so the next cohort sees the same pattern.`,
      action: "Capture playbook",
    });
  }
  return recs;
}

export default function PlansOverviewPage() {
  const data = usePlansOverviewData();

  const dataSnapshot = useMemo(() => {
    const totalMrr = data.kpis.totalPlanMrr.value;
    const top = data.topPlansByMrr[0];
    const switches = data.planSwitches.flows;
    const freeToPaid = switches.filter((f) => f.from === "free" && f.to !== "churned")
                              .reduce((s, f) => s + f.value, 0);
    const freeTotal = switches.filter((f) => f.from === "free")
                              .reduce((s, f) => s + f.value, 0) || 1;
    const freeToChurn = switches.filter((f) => f.from === "free" && f.to === "churned")
                                .reduce((s, f) => s + f.value, 0);
    const enterpriseConversions = switches.filter((f) => f.to === "enterprise")
                                          .reduce((s, f) => s + f.value, 0);
    const proAi = data.featureSeries.find((s) => s.name === "Pro")?.values.aiUsage || 0;
    const businessAi = data.featureSeries.find((s) => s.name === "Business")?.values.aiUsage || 0;

    return {
      primaryMetric:   { label: "Total Plan MRR", value: `₺${totalMrr.toLocaleString()}`, trend: data.kpis.totalPlanMrr.trend },
      secondaryMetric: { label: "Avg LTV",         value: `₺${data.kpis.avgLtv.value.toLocaleString()}`, trend: data.kpis.avgLtv.trend },
      topPerformer:    { label: top.name, value: `₺${top.mrr.toLocaleString()} MRR` },
      risk:            { label: "Free→Churn flow", value: `${freeToChurn} customers / period` },

      freeToPaid: ((freeToPaid / freeTotal) * 100).toFixed(1),
      freeToChurn: ((freeToChurn / freeTotal) * 100).toFixed(1),
      proAi,
      businessAi,
      businessAiGap: businessAi - proAi,
      enterpriseConversions,
      upgradeRate: data.kpis.upgradeRate.value.toFixed(1),
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Plans Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="active"   position={0} pageKey="plans" label="ACTIVE PLANS"
                 value={data.kpis.activePlans.value} trend={data.kpis.activePlans.trend}
                 trendLabel="vs last 30d" sparklineData={data.kpis.activePlans.sparkline} />,
        <KPICard key="mrr"      position={1} pageKey="plans" label="TOTAL PLAN MRR"
                 value={data.kpis.totalPlanMrr.value} format="currency" prefix="₺"
                 trend={data.kpis.totalPlanMrr.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.totalPlanMrr.sparkline} />,
        <KPICard key="upgrade"  position={2} pageKey="plans" label="UPGRADE RATE"
                 value={data.kpis.upgradeRate.value} format="percent" suffix="%"
                 trend={data.kpis.upgradeRate.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.upgradeRate.sparkline} />,
        <KPICard key="ltv"      position={3} pageKey="plans" label="AVG LTV"
                 value={data.kpis.avgLtv.value} format="currency" prefix="₺"
                 trend={data.kpis.avgLtv.trend} trendLabel="lifetime value"
                 sparklineData={data.kpis.avgLtv.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="plans" title="Plan Distribution" icon="💎"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.planDistribution}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="features" title="Feature Adoption" icon="🛰"
                        color="#7C3AED">
          <AnimatedRadar axes={data.featureAxes} series={data.featureSeries} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="switches" title="Plan Switches" icon="🔁"
                        color="#22D3EE">
          <AnimatedSankey leftNodes={data.planSwitches.leftNodes}
                          rightNodes={data.planSwitches.rightNodes}
                          flows={data.planSwitches.flows} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="top" title="Top Plans by MRR" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topPlansByMrr} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Plan performance" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildPlansRecs} />}
    />
  );
}
