// ================================================================
// /admin/system/overview — System health via Donut + Map +
// Heatmap (services × hours) + Treemap. Map labels show latency
// in ms, treemap shows request volume in K.
// ================================================================
import React, { useMemo } from "react";
import OverviewLayout from "../../../components/admin/overview/OverviewLayout";
import KPICard from "../../../components/admin/overview/KPICard";
import AnalyticsBlock from "../../../components/admin/overview/AnalyticsBlock";
import AnimatedTierBars from "../../../components/admin/overview/charts/AnimatedTierBars";
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

function useSystemOverviewData() {
  return useMemo(() => ({
    kpis: {
      uptime:         { value: 99.98, trend: 0.02,  sparkline: genSparkline(99.98, 0.04) },
      apiLatencyP95:  { value: 142,   trend: -8.4,  sparkline: genSparkline(142, 24) },
      errorRate:      { value: 0.18,  trend: -0.06, sparkline: genSparkline(0.18, 0.05) },
      activeSessions: { value: 1284,  trend: 12.3,  sparkline: genSparkline(1284, 120) },
    },
    errorsByService: [
      { name: "API",    count: 47, mrr: 47, color: "#1A56DB" },
      { name: "Web",    count: 23, mrr: 23, color: "#22D3EE" },
      { name: "Worker", count: 12, mrr: 12, color: "#F59E0B" },
      { name: "DB",     count: 4,  mrr: 4,  color: "#EF4444" },
    ],
    latencyByRegion: [
      { code: "TR", name: "Turkey", count: 124 },
      { code: "AE", name: "UAE",    count: 187 },
      { code: "SA", name: "Saudi",  count: 168 },
      { code: "EG", name: "Egypt",  count: 218 },
    ],
    perfHeatmap: {
      rows: ["API", "Web", "Auth", "Worker", "DB"],
      cols: ["00", "04", "08", "12", "16", "20"],
      values: [
        [ 84, 76,  98, 142, 168, 124],
        [102, 88, 132, 184, 198, 156],
        [ 64, 58,  82, 118, 142, 102],
        [ 32, 28,  42,  68,  84,  56],
        [ 18, 14,  28,  56,  64,  42],
      ],
    },
    topEndpoints: [
      { id: 1, name: "/api/customers",     tier: "GET",  mrr: 18420 },
      { id: 2, name: "/api/invoices",      tier: "GET",  mrr: 12180 },
      { id: 3, name: "/api/auth/login",    tier: "POST", mrr: 8940 },
      { id: 4, name: "/api/dashboard",     tier: "GET",  mrr: 7250 },
      { id: 5, name: "/api/subscriptions", tier: "GET",  mrr: 5120 },
      { id: 6, name: "/api/admin/audit",   tier: "GET",  mrr: 3840 },
    ],
  }), []);
}

function buildSystemRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.worstLatency >= 200) {
    recs.push({
      id: "egypt-latency",
      priority: "high",
      text: `${snapshot.worstRegion} P95 latency at ${snapshot.worstLatency}ms — investigate CDN or stand up an edge node closer to that region.`,
      action: "Open infra map",
    });
  }
  if (snapshot.dbErrors >= 4) {
    recs.push({
      id: "db-errors",
      priority: "high",
      text: `DB error count at ${snapshot.dbErrors} — investigate the slow query log; usual culprit is a missing index that recently became hot.`,
      action: "Open slow-query log",
    });
  }
  if (snapshot.peakAtRow && snapshot.peakValue > 150) {
    recs.push({
      id: "peak-deploy",
      priority: "medium",
      text: `Peak load on ${snapshot.peakAtRow} at ${snapshot.peakAtCol}:00 (${snapshot.peakValue}ms). Pre-warm cache and avoid deploys in this window.`,
      action: "Suggest deploy slot",
    });
  }
  if (parseFloat(snapshot.uptime) >= 99.95) {
    recs.push({
      id: "uptime-strong",
      priority: "low",
      text: `Uptime at ${snapshot.uptime}% — enterprise-grade. The next 9 costs ~10× the current investment; revisit only when contracted to.`,
      action: "Open SLA tracker",
    });
  }
  if (parseFloat(snapshot.errorRate) > 0.15) {
    recs.push({
      id: "error-budget",
      priority: "medium",
      text: `Error rate ${snapshot.errorRate}% is eating into the SLO error budget. Identify the top 3 error endpoints and stabilise this week.`,
      action: "Open error monitor",
    });
  }
  return recs;
}

export default function SystemOverviewPage() {
  const data = useSystemOverviewData();

  const dataSnapshot = useMemo(() => {
    const sortedRegions = [...data.latencyByRegion].sort((a, b) => b.count - a.count);
    const worst = sortedRegions[0];

    const dbErrors = data.errorsByService.find((s) => s.name === "DB")?.count || 0;

    let peakAtRow = data.perfHeatmap.rows[0];
    let peakAtCol = data.perfHeatmap.cols[0];
    let peakValue = 0;
    data.perfHeatmap.values.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (v > peakValue) {
          peakValue = v;
          peakAtRow = data.perfHeatmap.rows[ri];
          peakAtCol = data.perfHeatmap.cols[ci];
        }
      });
    });

    const top = data.topEndpoints[0];

    return {
      primaryMetric:   { label: "Uptime (30d)", value: `${data.kpis.uptime.value}%`,                trend: data.kpis.uptime.trend },
      secondaryMetric: { label: "P95 latency",  value: `${data.kpis.apiLatencyP95.value}ms`,       trend: data.kpis.apiLatencyP95.trend },
      topPerformer:    { label: top.name,       value: `${(top.mrr / 1000).toFixed(1)}K req` },
      risk:            { label: `${worst.name} latency`, value: `${worst.count}ms` },

      worstRegion: worst.name,
      worstLatency: worst.count,
      dbErrors,
      peakAtRow,
      peakAtCol,
      peakValue,
      uptime: data.kpis.uptime.value.toFixed(2),
      errorRate: data.kpis.errorRate.value.toFixed(2),
    };
  }, [data]);

  return (
    <OverviewLayout
      title="System Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="uptime" position={0} pageKey="system" label="UPTIME (30D)"
                 value={data.kpis.uptime.value} format="percent" suffix="%"
                 trend={data.kpis.uptime.trend} trendLabel="rolling 30 days"
                 sparklineData={data.kpis.uptime.sparkline} />,
        <KPICard key="lat"    position={1} pageKey="system" label="API LATENCY (P95)"
                 value={data.kpis.apiLatencyP95.value} suffix=" ms"
                 trend={data.kpis.apiLatencyP95.trend} trendLabel="p95 last 30d"
                 sparklineData={data.kpis.apiLatencyP95.sparkline} />,
        <KPICard key="err"    position={2} pageKey="system" label="ERROR RATE"
                 value={data.kpis.errorRate.value} format="percent" suffix="%"
                 trend={data.kpis.errorRate.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.errorRate.sparkline} />,
        <KPICard key="sess"   position={3} pageKey="system" label="ACTIVE SESSIONS"
                 value={data.kpis.activeSessions.value} trend={data.kpis.activeSessions.trend}
                 trendLabel="live now" sparklineData={data.kpis.activeSessions.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="errors" title="Errors by Service" icon="🚨"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.errorsByService}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="latency" title="Latency by Region" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.latencyByRegion}
                              valueLabel={(v) => `${v}ms`} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="perf" title="Performance Heatmap" icon="🔥"
                        color={ANALYTICS_COLORS.risk.primary}>
          <AnimatedHeatmap rows={data.perfHeatmap.rows}
                           cols={data.perfHeatmap.cols}
                           values={data.perfHeatmap.values}
                           colorScale={{ low: "#DCFCE7", high: "#EF4444" }}
                           valueFormat={(v) => `${v}`} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="endpoints" title="Top Endpoints by Volume" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topEndpoints}
                          valueFormatter={(v) => `${(v / 1000).toFixed(1)}K req`} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="System health" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildSystemRecs} />}
    />
  );
}
