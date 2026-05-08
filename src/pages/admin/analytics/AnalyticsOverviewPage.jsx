// ================================================================
// /admin/analytics/overview — Product engagement via Funnel + Map +
// Heatmap + Treemap. Funnel is the headline shape (visitor → paid).
// ================================================================
import React, { useMemo } from "react";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedFunnel from "../../../components/admin/overview/charts/AnimatedFunnel";
import AnimatedGeoBubbles from "../../../components/admin/overview/charts/AnimatedGeoBubbles";
import AnimatedHeatmap from "../../../components/admin/overview/charts/AnimatedHeatmap";
import AnimatedPodium from "../../../components/admin/overview/charts/AnimatedPodium";
import PowerBISummary from "../../../components/admin/overview/PowerBISummary";
import AIRecommendations from "../../../components/admin/overview/AIRecommendations";
import { ANALYTICS_COLORS } from "../../../design-system/colors";

const genSparkline = (base, variance) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: i,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

function useAnalyticsOverviewData() {
  return useMemo(() => ({
    kpis: {
      dau:            { value: 8420,  trend: 6.2, sparkline: genSparkline(8420, 600) },
      mau:            { value: 47200, trend: 9.1, sparkline: genSparkline(47200, 2000) },
      retention:      { value: 76.4,  trend: 2.8, sparkline: genSparkline(76.4, 3) },
      conversionRate: { value: 14.2,  trend: 1.7, sparkline: genSparkline(14.2, 1.2) },
    },
    conversionFunnel: [
      { name: "Visitors",        value: 47200, color: "#22D3EE" },
      { name: "Signed up",       value: 8420,  color: "#1A56DB" },
      { name: "Activated",       value: 5180,  color: "#7C3AED" },
      { name: "Trial started",   value: 2940,  color: "#F59E0B" },
      { name: "Paid conversion", value: 1247,  color: "#E30A17" },
    ],
    geoActivity: [
      { code: "TR", name: "Turkey", count: 6240 },
      { code: "AE", name: "UAE",    count: 920 },
      { code: "SA", name: "Saudi",  count: 720 },
      { code: "EG", name: "Egypt",  count: 380 },
      { code: "QA", name: "Qatar",  count: 160 },
    ],
    activityHeatmap: {
      rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      cols: ["00", "04", "08", "12", "16", "20"],
      values: [
        [180, 120, 620, 1240, 1480, 920],
        [200, 130, 680, 1320, 1540, 980],
        [220, 140, 720, 1410, 1620, 1040],
        [210, 130, 700, 1380, 1580, 1000],
        [240, 140, 700, 1320, 1480, 980],
        [310, 220, 480,  720,  640, 540],
        [280, 200, 420,  680,  600, 520],
      ],
    },
    topPages: [
      { id: 1, name: "/dashboard",          tier: "App",       mrr: 42800 },
      { id: 2, name: "/invoices",           tier: "App",       mrr: 31200 },
      { id: 3, name: "/customers",          tier: "App",       mrr: 28900 },
      { id: 4, name: "/landing",            tier: "Marketing", mrr: 24700 },
      { id: 5, name: "/pricing",            tier: "Marketing", mrr: 18400 },
      { id: 6, name: "/onboarding/welcome", tier: "App",       mrr: 12100 },
    ],
  }), []);
}

function buildAnalyticsRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.activationDrop > 30) {
    recs.push({
      id: "activation-drop",
      priority: "high",
      text: `Activation drop is ${snapshot.activationDrop}% (Sign-up → Activated). Investigate the first 5 minutes — that's where most B2B SaaS leaks.`,
      action: "Open onboarding session replay",
    });
  }
  if (parseFloat(snapshot.dauMauRatio) < 20) {
    recs.push({
      id: "dau-mau",
      priority: "medium",
      text: `DAU/MAU at ${snapshot.dauMauRatio}% is below the 20% B2B SaaS norm. Identify low-engagement segments and add re-engagement nudges.`,
      action: "Segment by activity",
    });
  }
  if (snapshot.peakDay && snapshot.peakValue > 1500) {
    recs.push({
      id: "deploy-window",
      priority: "medium",
      text: `Peak activity ${snapshot.peakDay} ${snapshot.peakHour}:00 (${snapshot.peakValue.toLocaleString()} active). Schedule deploys outside this window — minimum impact at Sun 04:00.`,
      action: "Suggest deploy slot",
    });
  }
  if (parseFloat(snapshot.trialToPaid) >= 40) {
    recs.push({
      id: "trial-conv-strong",
      priority: "low",
      text: `Trial→Paid at ${snapshot.trialToPaid}% is excellent for the segment. Document the trial flow before it gets touched.`,
      action: "Snapshot trial flow",
    });
  }
  if (snapshot.topPageShare > 25) {
    recs.push({
      id: "page-concentration",
      priority: "low",
      text: `${snapshot.topPageName} is ${snapshot.topPageShare}% of all traffic — concentration. A change there affects most users; double the test coverage on it.`,
      action: "Open page profile",
    });
  }
  return recs;
}

export default function AnalyticsOverviewPage() {
  const data = useAnalyticsOverviewData();

  const dataSnapshot = useMemo(() => {
    const funnel = data.conversionFunnel;
    const signup = funnel.find((s) => s.name === "Signed up")?.value || 1;
    const activated = funnel.find((s) => s.name === "Activated")?.value || 0;
    const trial = funnel.find((s) => s.name === "Trial started")?.value || 0;
    const paid = funnel.find((s) => s.name === "Paid conversion")?.value || 0;
    const activationDrop = Math.round(((signup - activated) / signup) * 100);
    const trialToPaid = trial ? ((paid / trial) * 100).toFixed(1) : "0";

    const dauMauRatio = ((data.kpis.dau.value / data.kpis.mau.value) * 100).toFixed(1);

    // Peak in the heatmap
    const days = data.activityHeatmap.rows;
    const hours = data.activityHeatmap.cols;
    let peakDay = days[0];
    let peakHour = hours[0];
    let peakValue = 0;
    data.activityHeatmap.values.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (v > peakValue) {
          peakValue = v;
          peakDay = days[ri];
          peakHour = hours[ci];
        }
      });
    });

    const topPage = data.topPages[0];
    const totalPageTraffic = data.topPages.reduce((s, p) => s + p.mrr, 0) || 1;
    const topPageShare = Math.round((topPage.mrr / totalPageTraffic) * 100);

    return {
      primaryMetric:   { label: "DAU",       value: data.kpis.dau.value.toLocaleString(), trend: data.kpis.dau.trend },
      secondaryMetric: { label: "Retention", value: `${data.kpis.retention.value}%`,        trend: data.kpis.retention.trend },
      topPerformer:    { label: topPage.name, value: `${topPage.mrr.toLocaleString()} views` },
      risk:            { label: "Activation drop", value: `${activationDrop}% lost after signup` },

      activationDrop,
      dauMauRatio,
      peakDay,
      peakHour,
      peakValue,
      trialToPaid,
      topPageName: topPage.name,
      topPageShare,
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Analytics Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="dau" position={0} pageKey="analytics" label="DAU"
                 value={data.kpis.dau.value} trend={data.kpis.dau.trend}
                 trendLabel="daily active users" sparklineData={data.kpis.dau.sparkline} />,
        <KPICard key="mau" position={1} pageKey="analytics" label="MAU"
                 value={data.kpis.mau.value} trend={data.kpis.mau.trend}
                 trendLabel="monthly active users" sparklineData={data.kpis.mau.sparkline} />,
        <KPICard key="ret" position={2} pageKey="analytics" label="RETENTION"
                 value={data.kpis.retention.value} format="percent" suffix="%"
                 trend={data.kpis.retention.trend} trendLabel="30-day retention"
                 sparklineData={data.kpis.retention.sparkline} />,
        <KPICard key="conv" position={3} pageKey="analytics" label="CONVERSION RATE"
                 value={data.kpis.conversionRate.value} format="percent" suffix="%"
                 trend={data.kpis.conversionRate.trend} trendLabel="visitor → paid"
                 sparklineData={data.kpis.conversionRate.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="funnel" title="Conversion Funnel" icon="🪣"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedFunnel stages={data.conversionFunnel} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="geo" title="Geographic Activity" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.geoActivity}
                              valueLabel={(v) => v.toLocaleString()} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="heat" title="Time-of-day Activity" icon="🔥"
                        color={ANALYTICS_COLORS.risk.primary}>
          <AnimatedHeatmap rows={data.activityHeatmap.rows}
                           cols={data.activityHeatmap.cols}
                           values={data.activityHeatmap.values}
                           colorScale={{ low: "#E0F2FE", high: "#1E40AF" }}
                           valueFormat={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="pages" title="Top Pages by Traffic" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topPages}
                          valueFormatter={(v) => `${v.toLocaleString()} views`} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Product engagement" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildAnalyticsRecs} />}
    />
  );
}
