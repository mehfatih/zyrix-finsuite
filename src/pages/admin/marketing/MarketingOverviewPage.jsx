// ================================================================
// /admin/marketing/overview — Marketing performance via Donut + Map
// + Funnel + Treemap. Funnel covers Visitor → Customer; treemap
// surfaces top campaigns by ROAS.
// ================================================================
import React, { useMemo } from "react";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedTierBars from "../../../components/admin/overview/charts/AnimatedTierBars";
import AnimatedGeoBubbles from "../../../components/admin/overview/charts/AnimatedGeoBubbles";
import AnimatedFunnel from "../../../components/admin/overview/charts/AnimatedFunnel";
import AnimatedPodium from "../../../components/admin/overview/charts/AnimatedPodium";
import PowerBISummary from "../../../components/admin/overview/PowerBISummary";
import AIRecommendations from "../../../components/admin/overview/AIRecommendations";
import { ANALYTICS_COLORS } from "../../../design-system/colors";

const genSparkline = (base, variance) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

function useMarketingOverviewData() {
  return useMemo(() => ({
    kpis: {
      leads:        { value: 3420, trend: 18.4, sparkline: genSparkline(3420, 320) },
      cac:          { value: 142,  trend: -8.2, sparkline: genSparkline(142, 24) },
      leadToPaid:   { value: 14.2, trend: 1.7,  sparkline: genSparkline(14.2, 1.5) },
      roas:         { value: 4.8,  trend: 0.6,  sparkline: genSparkline(4.8, 0.6) },
    },
    leadsBySource: [
      { name: "Organic",     count: 1240, mrr: 1240, color: "#10B981" },
      { name: "Paid Search", count: 920,  mrr: 920,  color: "#1A56DB" },
      { name: "Social",      count: 680,  mrr: 680,  color: "#7C3AED" },
      { name: "Referral",    count: 420,  mrr: 420,  color: "#F59E0B" },
      { name: "Direct",      count: 160,  mrr: 160,  color: "#6B7280" },
    ],
    geoReach: [
      { code: "TR", name: "Turkey", count: 2480 },
      { code: "AE", name: "UAE",    count: 380 },
      { code: "SA", name: "Saudi",  count: 280 },
      { code: "EG", name: "Egypt",  count: 180 },
      { code: "QA", name: "Qatar",  count: 100 },
    ],
    marketingFunnel: [
      { name: "Visitors",  value: 24800, color: "#22D3EE" },
      { name: "Leads",     value: 3420,  color: "#1A56DB" },
      { name: "MQLs",      value: 1480,  color: "#7C3AED" },
      { name: "SQLs",      value: 720,   color: "#F59E0B" },
      { name: "Customers", value: 486,   color: "#E30A17" },
    ],
    topCampaigns: [
      { id: 1, name: "Q2 Turkey Launch",     tier: "Paid",    mrr: 720 },
      { id: 2, name: "KOBİ Webinar Series",  tier: "Organic", mrr: 580 },
      { id: 3, name: "AI Co-Founder Beta",   tier: "Social",  mrr: 510 },
      { id: 4, name: "Saudi Partner Push",   tier: "Paid",    mrr: 420 },
      { id: 5, name: "Free→Pro Holiday",     tier: "Email",   mrr: 380 },
      { id: 6, name: "GDPR Whitepaper",      tier: "Organic", mrr: 280 },
    ],
  }), []);
}

function buildMarketingRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.organicLowestCac) {
    recs.push({
      id: "double-organic",
      priority: "high",
      text: `Organic delivers ${snapshot.organicShare}% of leads at the lowest blended CAC. Increase content + SEO investment — diminishing returns are still distant.`,
      action: "Open SEO planner",
    });
  }
  if (snapshot.mqlSqlDrop > 45) {
    recs.push({
      id: "mql-sql-drop",
      priority: "high",
      text: `MQL→SQL drop is ${snapshot.mqlSqlDrop}% — sales qualification is leaking. Re-tune the MQL definition with sales this week.`,
      action: "Open lead scoring",
    });
  }
  if (parseFloat(snapshot.roas) >= 4) {
    recs.push({
      id: "roas-strong",
      priority: "low",
      text: `Blended ROAS at ${snapshot.roas}x is well above the 3x threshold. Increase budget on the top campaign before saturation kicks in.`,
      action: "Adjust spend mix",
    });
  }
  if (snapshot.saudiPotential) {
    recs.push({
      id: "saudi-replicate",
      priority: "medium",
      text: `${snapshot.topCampaign} is performing at ${(snapshot.topRoas).toFixed(1)}x ROAS. Replicate the playbook in UAE — similar buyer profile and budget bracket.`,
      action: "Plan UAE campaign",
    });
  }
  if (parseFloat(snapshot.cacTrend) < 0) {
    recs.push({
      id: "cac-trend-down",
      priority: "medium",
      text: `CAC is trending down ${Math.abs(snapshot.cacTrend)}% — efficiency window. Lock in current creatives and increase frequency before audience saturation.`,
      action: "Lock winning creatives",
    });
  }
  return recs;
}

export default function MarketingOverviewPage() {
  const data = useMarketingOverviewData();

  const dataSnapshot = useMemo(() => {
    const totalLeads = data.leadsBySource.reduce((s, l) => s + l.count, 0) || 1;
    const organic = data.leadsBySource.find((l) => l.name === "Organic");
    const organicShare = organic ? Math.round((organic.count / totalLeads) * 100) : 0;

    const funnel = data.marketingFunnel;
    const mql = funnel.find((s) => s.name === "MQLs")?.value || 0;
    const sql = funnel.find((s) => s.name === "SQLs")?.value || 0;
    const mqlSqlDrop = mql ? Math.round(((mql - sql) / mql) * 100) : 0;

    const top = data.topCampaigns[0];
    const topRoas = top.mrr / 100; // mock convention: mrr × 100 = ROAS basis points

    return {
      primaryMetric:   { label: "Leads (30d)", value: data.kpis.leads.value.toLocaleString(), trend: data.kpis.leads.trend },
      secondaryMetric: { label: "ROAS",         value: `${data.kpis.roas.value}x`,             trend: data.kpis.roas.trend },
      topPerformer:    { label: top.name, value: `${topRoas.toFixed(1)}x ROAS` },
      risk:            { label: "MQL → SQL drop", value: `${mqlSqlDrop}% lost` },

      organicLowestCac: organicShare >= 30,
      organicShare,
      mqlSqlDrop,
      roas: data.kpis.roas.value.toFixed(1),
      cacTrend: data.kpis.cac.trend.toFixed(1),
      saudiPotential: data.geoReach.some((r) => r.code === "SA"),
      topCampaign: top.name,
      topRoas,
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Marketing Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="leads" position={0} pageKey="marketing" label="LEADS (30D)"
                 value={data.kpis.leads.value} trend={data.kpis.leads.trend}
                 trendLabel="vs last 30d" sparklineData={data.kpis.leads.sparkline} />,
        <KPICard key="cac"   position={1} pageKey="marketing" label="CAC"
                 value={data.kpis.cac.value} format="currency" prefix="₺"
                 trend={data.kpis.cac.trend} trendLabel="customer acquisition cost"
                 sparklineData={data.kpis.cac.sparkline} />,
        <KPICard key="conv"  position={2} pageKey="marketing" label="LEAD→PAID RATE"
                 value={data.kpis.leadToPaid.value} format="percent" suffix="%"
                 trend={data.kpis.leadToPaid.trend} trendLabel="conversion"
                 sparklineData={data.kpis.leadToPaid.sparkline} />,
        <KPICard key="roas"  position={3} pageKey="marketing" label="ROAS"
                 value={data.kpis.roas.value} suffix="x"
                 trend={data.kpis.roas.trend} trendLabel="return on ad spend"
                 sparklineData={data.kpis.roas.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="src" title="Leads by Source" icon="🪝"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.leadsBySource}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="geo" title="Geographic Reach" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.geoReach}
                              valueLabel={(v) => v.toLocaleString()} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="funnel" title="Marketing Funnel" icon="🪣"
                        color="#7C3AED">
          <AnimatedFunnel stages={data.marketingFunnel} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="campaigns" title="Top Campaigns by ROAS" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topCampaigns}
                          valueFormatter={(v) => `${(v / 100).toFixed(1)}x ROAS`} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Marketing performance" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildMarketingRecs} />}
    />
  );
}
