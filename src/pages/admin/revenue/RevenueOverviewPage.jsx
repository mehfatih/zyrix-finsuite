// ================================================================
// /admin/revenue/overview — Second application of the Zyrix Admin
// Design Bible (after Customer Overview). Same structural shell:
// 4 KPI cards (positional Wine/Gold/Cyan/Violet) → 4 distinct
// analytics blocks (Donut/Map/Scatter/Treemap) → Power BI Summary
// + AI Recommendations.
//
// This page reuses the same chart components as Customer Overview;
// the components grew small backward-compatible props (valueKey,
// valueFormatter on the donut; valueLabel on the map; categoryMap
// + axis labels on the scatter) so revenue-specific semantics ride
// on top of the shared shape language without forking.
// ================================================================
import React, { useMemo } from "react";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedTierBars from "../../../components/admin/overview/charts/AnimatedTierBars";
import AnimatedGeoBubbles from "../../../components/admin/overview/charts/AnimatedGeoBubbles";
import AnimatedRiskList from "../../../components/admin/overview/charts/AnimatedRiskList";
import AnimatedPodium from "../../../components/admin/overview/charts/AnimatedPodium";
import PowerBISummary from "../../../components/admin/overview/PowerBISummary";
import AIRecommendations from "../../../components/admin/overview/AIRecommendations";
import { ANALYTICS_COLORS } from "../../../design-system/colors";

const genSparkline = (base, variance) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

// X-axis vocabulary for the failed-payments scatter plot. Reasons
// map to fractional positions on the plot's X axis so similar
// failure modes cluster visually.
const PAYMENT_CATEGORIES = {
  "Card expired":    { x: 0.15, label: "Card" },
  "Insufficient":    { x: 0.40, label: "Funds" },
  "Bank declined":   { x: 0.65, label: "Bank" },
  "Network timeout": { x: 0.85, label: "Network" },
};

function useRevenueOverviewData() {
  // Mock until /api/admin/revenue/overview ships on the backend.
  return useMemo(() => ({
    kpis: {
      totalMrr:  { value: 929353,   trend: 12.1, sparkline: genSparkline(929353, 40000) },
      arr:       { value: 11152236, trend: 12.1, sparkline: genSparkline(11152236, 480000) },
      churnRate: { value: 2.1,      trend: -0.6, sparkline: genSparkline(2.1, 0.4) },
      nrr:       { value: 108.4,    trend: 3.2,  sparkline: genSparkline(108.4, 4) },
    },
    plansRevenue: [
      { name: "Lite",       count: 412, mrr: 40788,  color: "#6B7280" },
      { name: "Pro",        count: 538, mrr: 268362, color: "#1A56DB" },
      { name: "Business",   count: 247, mrr: 370253, color: "#7C3AED" },
      { name: "Enterprise", count: 50,  mrr: 249950, color: "#E30A17" },
    ],
    geoRevenue: [
      { code: "TR", name: "Turkey", count: 707000 },
      { code: "AE", name: "UAE",    count: 92500 },
      { code: "SA", name: "Saudi",  count: 75000 },
      { code: "EG", name: "Egypt",  count: 38000 },
      { code: "QA", name: "Qatar",  count: 16853 },
    ],
    failedPayments: [
      { id: 1, name: "Bursa Gıda",       reason: "Card expired",    risk: 92, mrr: 580 },
      { id: 2, name: "Konya Tekstil",    reason: "Insufficient",    risk: 78, mrr: 320 },
      { id: 3, name: "İzmir Cafe",       reason: "Bank declined",   risk: 65, mrr: 240 },
      { id: 4, name: "Eskişehir IT",     reason: "Card expired",    risk: 55, mrr: 410 },
      { id: 5, name: "Antalya Tour",     reason: "Network timeout", risk: 45, mrr: 180 },
      { id: 6, name: "Mersin Logistik",  reason: "Insufficient",    risk: 30, mrr: 290 },
    ],
    topRevenue: [
      { id: 1, name: "Levana İlaç Holding",   tier: "Enterprise", mrr: 12500 },
      { id: 2, name: "Aydın Ova Üretim",      tier: "Enterprise", mrr: 11300 },
      { id: 3, name: "Beyoğlu Restoran Grup", tier: "Business",   mrr: 10100 },
      { id: 4, name: "Cairo Imports",         tier: "Business",   mrr: 8900 },
      { id: 5, name: "MENA Trading Co",       tier: "Business",   mrr: 7700 },
      { id: 6, name: "Marmara Sigorta",       tier: "Business",   mrr: 6500 },
    ],
  }), []);
}

function buildRevenueRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.failedAmount > 1500) {
    recs.push({
      id: "failed-payments-recovery",
      priority: "high",
      text: `₺${snapshot.failedAmount.toLocaleString()} in MRR is at risk across ${snapshot.failedCount} failed payments. Trigger automated retry + dunning emails for the critical accounts.`,
      action: "Open dunning workflow",
    });
  }
  if (snapshot.nrr < 100) {
    recs.push({
      id: "nrr-low",
      priority: "high",
      text: `NRR at ${snapshot.nrr}% means existing customers are spending less. Investigate downgrades and reach out to top accounts for upsell.`,
      action: "Review NRR breakdown",
    });
  } else if (snapshot.nrr >= 108) {
    recs.push({
      id: "nrr-strong",
      priority: "low",
      text: `NRR at ${snapshot.nrr}% is excellent — expansion is driving growth. Document what's working and double down.`,
      action: "View expansion playbook",
    });
  }
  if (snapshot.churnRate > 2) {
    recs.push({
      id: "churn-revenue-impact",
      priority: "medium",
      text: `Churn at ${snapshot.churnRate}% is eroding MRR. Enterprise tier accounts for ${snapshot.enterpriseShareOfMrr}% of revenue — prioritize their retention.`,
      action: "Open Enterprise retention",
    });
  }
  if (parseFloat(snapshot.arrMillions) >= 10) {
    recs.push({
      id: "arr-milestone",
      priority: "low",
      text: `ARR has crossed ₺${snapshot.arrMillions}M — start preparing investor reporting and Series-A metrics.`,
      action: "Open investor dashboard",
    });
  }
  if (parseFloat(snapshot.enterpriseShareOfMrr) > 40) {
    recs.push({
      id: "enterprise-concentration",
      priority: "medium",
      text: `Enterprise tier represents ${snapshot.enterpriseShareOfMrr}% of MRR — concentration risk. Accelerate Pro→Business upgrades to diversify.`,
      action: "View upgrade pipeline",
    });
  }
  return recs;
}

export default function RevenueOverviewPage() {
  const data = useRevenueOverviewData();

  const dataSnapshot = useMemo(() => {
    const totalMrr = data.kpis.totalMrr.value;
    const enterpriseMrr = data.plansRevenue.find((p) => p.name === "Enterprise")?.mrr || 0;
    const totalAtRisk = data.failedPayments.reduce((s, p) => s + p.mrr, 0);
    const topCustomer = data.topRevenue[0];

    return {
      primaryMetric:   { label: "Total MRR", value: `₺${totalMrr.toLocaleString()}`, trend: data.kpis.totalMrr.trend },
      secondaryMetric: { label: "NRR",       value: `${data.kpis.nrr.value}%`,        trend: data.kpis.nrr.trend },
      topPerformer:    { label: topCustomer.name, value: `₺${topCustomer.mrr.toLocaleString()} MRR` },
      risk:            { label: `${data.failedPayments.length} failed payments`, value: `₺${totalAtRisk.toLocaleString()} at risk` },

      // Extras for buildRevenueRecs
      nrr: data.kpis.nrr.value,
      churnRate: data.kpis.churnRate.value,
      failedCount: data.failedPayments.length,
      failedAmount: totalAtRisk,
      enterpriseShareOfMrr: ((enterpriseMrr / totalMrr) * 100).toFixed(1),
      arrMillions: (data.kpis.arr.value / 1000000).toFixed(1),
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Revenue Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard
          key="mrr"
          position={0}
          pageKey="revenue"
          label="TOTAL MRR"
          value={data.kpis.totalMrr.value}
          format="currency"
          prefix="₺"
          trend={data.kpis.totalMrr.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.totalMrr.sparkline}
        />,
        <KPICard
          key="arr"
          position={1}
          pageKey="revenue"
          label="ARR"
          value={data.kpis.arr.value}
          format="currency"
          prefix="₺"
          trend={data.kpis.arr.trend}
          trendLabel="annualized"
          sparklineData={data.kpis.arr.sparkline}
        />,
        <KPICard
          key="churn"
          position={2}
          pageKey="revenue"
          label="CHURN RATE"
          value={data.kpis.churnRate.value}
          format="percent"
          suffix="%"
          trend={data.kpis.churnRate.trend}
          trendLabel="vs last 30d"
          sparklineData={data.kpis.churnRate.sparkline}
        />,
        <KPICard
          key="nrr"
          position={3}
          pageKey="revenue"
          label="NRR"
          value={data.kpis.nrr.value}
          format="percent"
          suffix="%"
          trend={data.kpis.nrr.trend}
          trendLabel="net revenue retention"
          sparklineData={data.kpis.nrr.sparkline}
        />,
      ]}
      analytics={[
        <AnalyticsBlock
          key="plans"
          title="Revenue by Plan"
          icon="💎"
          color={ANALYTICS_COLORS.distribution.primary}
        >
          <AnimatedTierBars
            tiers={data.plansRevenue}
            gradient={ANALYTICS_COLORS.distribution.gradient}
            valueKey="mrr"
            valueFormatter={(v) => `₺${v.toLocaleString()}`}
          />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="geo"
          title="Revenue by Country"
          icon="🌍"
          color={ANALYTICS_COLORS.geographic.primary}
        >
          <AnimatedGeoBubbles
            regions={data.geoRevenue}
            valueLabel={(v) => `₺${(v / 1000).toFixed(0)}K`}
          />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="failed"
          title="Failed Payments"
          icon="⚠️"
          color={ANALYTICS_COLORS.risk.primary}
        >
          <AnimatedRiskList
            customers={data.failedPayments}
            categoryMap={PAYMENT_CATEGORIES}
            yAxisLabel="OVERDUE"
            dangerLabel="CRITICAL"
          />
        </AnalyticsBlock>,
        <AnalyticsBlock
          key="top"
          title="Top Revenue Customers"
          icon="🏆"
          color={ANALYTICS_COLORS.ranking.gold}
        >
          <AnimatedPodium customers={data.topRevenue} />
        </AnalyticsBlock>,
      ]}
      summary={
        <PowerBISummary
          dataSnapshot={dataSnapshot}
          pageContext="Revenue performance"
        />
      }
      recommendations={
        <AIRecommendations
          dataSnapshot={dataSnapshot}
          recommendationsBuilder={buildRevenueRecs}
        />
      }
    />
  );
}
