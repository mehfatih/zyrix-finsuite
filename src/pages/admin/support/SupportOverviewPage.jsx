// ================================================================
// /admin/support/overview — Support operations via Donut + Map +
// Heatmap + Treemap. Heatmap shows weekday × time-of-day SLA stress.
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

function useSupportOverviewData() {
  return useMemo(() => ({
    kpis: {
      openTickets:    { value: 32,   trend: -14.3, sparkline: genSparkline(32, 8) },
      avgResponseMin: { value: 1240, trend: -18.2, sparkline: genSparkline(1240, 240) },
      csat:           { value: 4.6,  trend: 0.3,   sparkline: genSparkline(4.6, 0.3) },
      resolutionRate: { value: 87.4, trend: 4.1,   sparkline: genSparkline(87.4, 3) },
    },
    ticketsByCategory: [
      { name: "Billing",      count: 84, mrr: 84, color: "#1A56DB" },
      { name: "Onboarding",   count: 62, mrr: 62, color: "#22D3EE" },
      { name: "Technical",    count: 48, mrr: 48, color: "#F59E0B" },
      { name: "Feature req.", count: 31, mrr: 31, color: "#7C3AED" },
      { name: "Bug",          count: 22, mrr: 22, color: "#EF4444" },
    ],
    ticketsByRegion: [
      { code: "TR", name: "Turkey", count: 168 },
      { code: "AE", name: "UAE",    count: 38 },
      { code: "SA", name: "Saudi",  count: 24 },
      { code: "EG", name: "Egypt",  count: 12 },
      { code: "QA", name: "Qatar",  count: 5 },
    ],
    slaHeatmap: {
      rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      cols: ["00", "04", "08", "12", "16", "20"],
      values: [
        [ 8,  4, 24, 38, 41, 22],
        [ 6,  3, 28, 42, 47, 28],
        [ 5,  4, 31, 44, 51, 31],
        [ 7,  5, 29, 41, 46, 26],
        [10,  6, 35, 48, 54, 38],
        [22, 18, 42, 51, 49, 41],
        [28, 21, 44, 38, 36, 33],
      ],
    },
    topAgents: [
      { id: 1, name: "Mehmet Y.",   tier: "L3 SENIOR", mrr: 247 },
      { id: 2, name: "Ayşe K.",     tier: "L2",        mrr: 218 },
      { id: 3, name: "Mohammed A.", tier: "L2",        mrr: 192 },
      { id: 4, name: "Fatma D.",    tier: "L1",        mrr: 168 },
      { id: 5, name: "Omar H.",     tier: "L1",        mrr: 142 },
      { id: 6, name: "Zeynep S.",   tier: "L1",        mrr: 119 },
    ],
  }), []);
}

function buildSupportRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.fridayPm > 50) {
    recs.push({
      id: "friday-load",
      priority: "high",
      text: `Friday afternoons are running ${snapshot.fridayPm} unresolved tickets — beyond steady-state. Add weekend / late-Friday coverage or shift workloads earlier in the week.`,
      action: "Adjust shift pattern",
    });
  }
  if (snapshot.weekendBacklog > 40) {
    recs.push({
      id: "weekend-coverage",
      priority: "medium",
      text: `Weekend morning backlog of ${snapshot.weekendBacklog} suggests an unattended outage pattern. Investigate whether a paging gap exists on Sat/Sun.`,
      action: "Audit on-call rota",
    });
  }
  if (snapshot.l2Imbalance >= 50) {
    recs.push({
      id: "l2-balance",
      priority: "medium",
      text: `${snapshot.topL2Name} resolved ${snapshot.topL2Volume} tickets — ${snapshot.l2Imbalance}% above L1 average. Promote to L3 or rebalance routing.`,
      action: "Open agent profile",
    });
  }
  if (parseFloat(snapshot.csat) >= 4.5) {
    recs.push({
      id: "csat-strong",
      priority: "low",
      text: `CSAT at ${snapshot.csat}/5 is excellent. Share top quotes with the team and surface them in marketing case studies.`,
      action: "Compile feedback",
    });
  }
  if (parseFloat(snapshot.resolutionRate) < 90) {
    recs.push({
      id: "resolution-target",
      priority: "low",
      text: `Resolution rate ${snapshot.resolutionRate}% is approaching the 90% target. Audit the unresolved bucket — likely 1-2 stuck themes.`,
      action: "Open unresolved queue",
    });
  }
  return recs;
}

export default function SupportOverviewPage() {
  const data = useSupportOverviewData();

  const dataSnapshot = useMemo(() => {
    const heat = data.slaHeatmap.values;
    // Friday is row index 4, afternoon cols 16/20 = indexes 4,5.
    const fridayPm = (heat[4]?.[4] || 0) + (heat[4]?.[5] || 0);
    // Weekend morning backlog = Sat+Sun cols 00/04 (indexes 0,1).
    const weekendBacklog = (heat[5]?.[0] || 0) + (heat[5]?.[1] || 0)
                         + (heat[6]?.[0] || 0) + (heat[6]?.[1] || 0);

    const l1Agents = data.topAgents.filter((a) => a.tier === "L1");
    const l1Avg = l1Agents.length
      ? l1Agents.reduce((s, a) => s + a.mrr, 0) / l1Agents.length
      : 0;
    const topL2 = data.topAgents.find((a) => a.tier === "L2") || data.topAgents[0];
    const l2Imbalance = l1Avg ? Math.round(((topL2.mrr - l1Avg) / l1Avg) * 100) : 0;

    const top = data.topAgents[0];

    return {
      primaryMetric:   { label: "Open tickets",    value: data.kpis.openTickets.value.toString(), trend: data.kpis.openTickets.trend },
      secondaryMetric: { label: "Resolution rate", value: `${data.kpis.resolutionRate.value}%`,    trend: data.kpis.resolutionRate.trend },
      topPerformer:    { label: top.name, value: `${top.mrr} tickets resolved` },
      risk:            { label: "Friday afternoon SLA", value: `${fridayPm} unresolved` },

      fridayPm,
      weekendBacklog,
      topL2Name: topL2.name,
      topL2Volume: topL2.mrr,
      l2Imbalance,
      csat: data.kpis.csat.value.toFixed(1),
      resolutionRate: data.kpis.resolutionRate.value.toFixed(1),
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Support Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="open"     position={0} pageKey="support" label="OPEN TICKETS"
                 value={data.kpis.openTickets.value} trend={data.kpis.openTickets.trend}
                 trendLabel="vs last 30d" sparklineData={data.kpis.openTickets.sparkline} />,
        <KPICard key="response" position={1} pageKey="support" label="AVG RESPONSE TIME"
                 value={data.kpis.avgResponseMin.value} suffix=" min"
                 trend={data.kpis.avgResponseMin.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.avgResponseMin.sparkline} />,
        <KPICard key="csat"     position={2} pageKey="support" label="CSAT"
                 value={data.kpis.csat.value} suffix="/5"
                 trend={data.kpis.csat.trend} trendLabel="customer satisfaction"
                 sparklineData={data.kpis.csat.sparkline} />,
        <KPICard key="resolved" position={3} pageKey="support" label="RESOLUTION RATE"
                 value={data.kpis.resolutionRate.value} format="percent" suffix="%"
                 trend={data.kpis.resolutionRate.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.resolutionRate.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="cat" title="Tickets by Category" icon="📂"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.ticketsByCategory}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="region" title="Tickets by Region" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.ticketsByRegion} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="sla" title="SLA Heatmap" icon="🔥"
                        color={ANALYTICS_COLORS.risk.primary}>
          <AnimatedHeatmap rows={data.slaHeatmap.rows}
                           cols={data.slaHeatmap.cols}
                           values={data.slaHeatmap.values} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="agents" title="Top Agents" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topAgents}
                          valueFormatter={(v) => `${v} tickets`} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Support operations" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildSupportRecs} />}
    />
  );
}
