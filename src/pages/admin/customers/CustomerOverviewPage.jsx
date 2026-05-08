// ================================================================
// /admin/customers/overview — Reference implementation of the
// unified Overview design system (Phase A). 4 animated KPIs +
// 4 distinct analytics blocks + reactive Power BI summary +
// reactive AI recommendations.
//
// Existing page used purely mock data (no API hookups), so the
// new mock data continues that pattern. When the backend ships
// /api/admin/customers/overview, swap the body of
// useCustomerOverviewData() to call it and map response into the
// shape { kpis, tiers, regions, atRisk, topByMrr } below.
// ================================================================
import React, { useMemo } from "react";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedTierBars from "../../../components/admin/overview/charts/AnimatedTierBars";
import AnimatedGeoBubbles from "../../../components/admin/overview/charts/AnimatedGeoBubbles";
import AnimatedRiskList from "../../../components/admin/overview/charts/AnimatedRiskList";
import AnimatedPodium from "../../../components/admin/overview/charts/AnimatedPodium";
import PowerBISummary from "../../../components/admin/overview/PowerBISummary";
import AIRecommendations from "../../../components/admin/overview/AIRecommendations";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import { ANALYTICS_COLORS } from "../../../design-system/colors";

const genSparkline = (base, variance) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

function useCustomerOverviewData() {
  // Mock until /api/admin/customers/overview exists on the backend.
  return useMemo(() => ({
    kpis: {
      totalCustomers: { value: 1247,   trend: 8.4,  sparkline: genSparkline(1247, 60) },
      totalMrr:       { value: 929353, trend: 12.1, sparkline: genSparkline(929353, 40000) },
      churn:          { value: 2.1,    trend: -0.6, sparkline: genSparkline(2.1, 0.4) },
      growth:         { value: 8.4,    trend: 4,    sparkline: genSparkline(8.4, 1.5) },
    },
    tiers: [
      { name: "Lite",       count: 412, mrr: 40788,  color: "#6B7280" },
      { name: "Pro",        count: 538, mrr: 268362, color: "#1A56DB" },
      { name: "Business",   count: 247, mrr: 370253, color: "#7C3AED" },
      { name: "Enterprise", count: 50,  mrr: 249950, color: "#E30A17" },
    ],
    regions: [
      { code: "TR", name: "Turkey", count: 942 },
      { code: "AE", name: "UAE",    count: 124 },
      { code: "SA", name: "Saudi",  count: 98 },
      { code: "EG", name: "Egypt",  count: 56 },
      { code: "QA", name: "Qatar",  count: 27 },
    ],
    atRisk: [
      { id: 1, name: "Bursa Gıda",       reason: "Payment failed",       risk: 78 },
      { id: 2, name: "Konya Tekstil",    reason: "Login drop",           risk: 74 },
      { id: 3, name: "İzmir Cafe",       reason: "Support escalation",   risk: 70 },
      { id: 4, name: "Eskişehir IT",     reason: "Trial ending",         risk: 66 },
      { id: 5, name: "Antalya Tour",     reason: "Feature regression",   risk: 62 },
      { id: 6, name: "Mersin Logistik",  reason: "NPS detractor",        risk: 58 },
    ],
    topByMrr: [
      { id: 1, name: "Levana İlaç Holding",     tier: "Enterprise", mrr: 12500 },
      { id: 2, name: "Aydın Ova Üretim",         tier: "Enterprise", mrr: 11300 },
      { id: 3, name: "Beyoğlu Restoran Grup",    tier: "Business",   mrr: 10100 },
      { id: 4, name: "Cairo Imports",            tier: "Business",   mrr: 8900 },
      { id: 5, name: "MENA Trading Co",          tier: "Business",   mrr: 7700 },
      { id: 6, name: "Marmara Sigorta",          tier: "Business",   mrr: 6500 },
    ],
  }), []);
}

// Pure recommendations builder. Re-runs whenever the snapshot shifts.
function buildCustomerRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;
  if (snapshot.churn > 2) {
    recs.push({
      id: "churn-high",
      priority: "high",
      text: `Churn at ${snapshot.churn}% is above the 2% target. Prioritize retention outreach for the ${snapshot.atRiskHigh} at-risk accounts.`,
      action: "Open retention playbook",
    });
  }
  if (snapshot.atRiskHigh > 0) {
    recs.push({
      id: "risk-action",
      priority: "high",
      text: `${snapshot.atRiskHigh} customers are at >75% churn risk. ${snapshot.topRiskName} needs immediate payment recovery.`,
      action: "Trigger payment recovery flow",
    });
  }
  if (snapshot.enterpriseShare < 5) {
    recs.push({
      id: "enterprise-grow",
      priority: "medium",
      text: `Enterprise tier is only ${snapshot.enterpriseShare}% of customers but ${snapshot.enterpriseRevShare}% of MRR. Double down on enterprise sales.`,
      action: "View enterprise pipeline",
    });
  }
  if (snapshot.qatarGrowing) {
    recs.push({
      id: "qatar-expansion",
      priority: "low",
      text: "Qatar is the smallest market but growing fastest. Consider a localized landing page.",
      action: "Plan Qatar campaign",
    });
  }
  return recs;
}

export default function CustomerOverviewPage() {
  const data = useCustomerOverviewData();

  const totalCustomers = data.kpis.totalCustomers.value;
  const enterpriseTier = data.tiers.find((t) => t.name === "Enterprise");
  const enterpriseCount = enterpriseTier?.count || 0;
  const enterpriseMrr = enterpriseTier?.mrr || 0;
  const totalMrr = data.kpis.totalMrr.value;

  const dataSnapshot = useMemo(() => ({
    churn: data.kpis.churn.value,
    atRiskHigh: data.atRisk.filter((c) => c.risk >= 75).length,
    topRiskName: data.atRisk[0]?.name,
    enterpriseShare: ((enterpriseCount / totalCustomers) * 100).toFixed(1),
    enterpriseRevShare: ((enterpriseMrr / totalMrr) * 100).toFixed(1),
    qatarGrowing: true,
    primaryMetric: {
      label: "Total customers",
      value: totalCustomers.toLocaleString(),
      trend: data.kpis.totalCustomers.trend,
    },
    secondaryMetric: {
      label: "MRR",
      value: `₺${totalMrr.toLocaleString()}`,
      trend: data.kpis.totalMrr.trend,
    },
    topPerformer: {
      label: data.topByMrr[0].name,
      value: `₺${data.topByMrr[0].mrr.toLocaleString()} MRR`,
    },
    risk: {
      label: data.atRisk[0].name,
      value: `${data.atRisk[0].risk}% churn risk`,
    },
  }), [data, totalCustomers, totalMrr, enterpriseCount, enterpriseMrr]);

  return (
    <OverviewLayout
      title="Customer Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard
          key="total"
          position={0}
          pageKey="customers"
          label="TOTAL CUSTOMERS"
          value={data.kpis.totalCustomers.value}
          trend={data.kpis.totalCustomers.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.totalCustomers.sparkline}
        />,
        <KPICard
          key="mrr"
          position={1}
          pageKey="customers"
          label="TOTAL MRR"
          value={data.kpis.totalMrr.value}
          format="currency"
          prefix="₺"
          trend={data.kpis.totalMrr.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.totalMrr.sparkline}
        />,
        <KPICard
          key="churn"
          position={2}
          pageKey="customers"
          label="CHURN (30D)"
          value={data.kpis.churn.value}
          format="percent"
          suffix="%"
          trend={data.kpis.churn.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.churn.sparkline}
        />,
        <KPICard
          key="growth"
          position={3}
          pageKey="customers"
          label="GROWTH (30D)"
          value={data.kpis.growth.value}
          format="percent"
          suffix="%"
          trend={data.kpis.growth.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.growth.sparkline}
        />,
      ]}
      analytics={[
        <AnalyticsBlock
          key="tiers"
          title="Distribution by tier"
          icon="📊"
          color={ANALYTICS_COLORS.distribution.primary}
        >
          <AnimatedTierBars tiers={data.tiers} gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="geo"
          title="Geographic distribution"
          icon="🌍"
          color={ANALYTICS_COLORS.geographic.primary}
        >
          <AnimatedGeoBubbles regions={data.regions} />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="risk"
          title="At-risk customers"
          icon="⚠️"
          color={ANALYTICS_COLORS.risk.primary}
        >
          <AnimatedRiskList customers={data.atRisk} />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="top"
          title="Top customers by MRR"
          icon="🏆"
          color={ANALYTICS_COLORS.ranking.gold}
        >
          <AnimatedPodium customers={data.topByMrr} />
        </AnalyticsBlock>,
      ]}
      summary={
        <PowerBISummary
          dataSnapshot={dataSnapshot}
          pageContext="Customer base"
        />
      }
      recommendations={
        <AIRecommendations
          dataSnapshot={dataSnapshot}
          recommendationsBuilder={buildCustomerRecs}
        />
      }
    />
  );
}
