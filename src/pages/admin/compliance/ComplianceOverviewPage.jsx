// ================================================================
// /admin/compliance/overview — Compliance posture via Donut + Map +
// Bubble Matrix + Treemap. Bubble matrix surfaces risk events on a
// 2D plane (auth/access/data/config × severity).
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

const COMPLIANCE_RISK_CATEGORIES = {
  "Failed login":      { x: 0.15, label: "Auth" },
  "Permission change": { x: 0.40, label: "Access" },
  "Data export":       { x: 0.65, label: "Data" },
  "Config change":     { x: 0.85, label: "Config" },
};

function useComplianceOverviewData() {
  return useMemo(() => ({
    kpis: {
      totalEvents:     { value: 35,   trend: 12,    sparkline: genSparkline(35, 8) },
      pendingRequests: { value: 4,    trend: -2,    sparkline: genSparkline(4, 2) },
      failedLogins:    { value: 18,   trend: -22.7, sparkline: genSparkline(18, 6) },
      complianceScore: { value: 94.2, trend: 1.4,   sparkline: genSparkline(94.2, 1.5) },
    },
    severityDist: [
      { name: "Info",     count: 14, mrr: 14, color: "#22D3EE" },
      { name: "Warning",  count: 18, mrr: 18, color: "#F59E0B" },
      { name: "Critical", count: 3,  mrr: 3,  color: "#EF4444" },
    ],
    eventsByCountry: [
      { code: "TR", name: "Turkey", count: 22 },
      { code: "AE", name: "UAE",    count: 6 },
      { code: "SA", name: "Saudi",  count: 4 },
      { code: "EG", name: "Egypt",  count: 3 },
    ],
    complianceRisks: [
      { id: 1, name: "Failed login spike",  reason: "Failed login",      risk: 88 },
      { id: 2, name: "Bulk export attempt", reason: "Data export",       risk: 76 },
      { id: 3, name: "Admin role granted",  reason: "Permission change", risk: 64 },
      { id: 4, name: "Cron config change",  reason: "Config change",     risk: 42 },
      { id: 5, name: "Multiple IP login",   reason: "Failed login",      risk: 58 },
      { id: 6, name: "Webhook secret",      reason: "Config change",     risk: 35 },
    ],
    topAuditors: [
      { id: 1, name: "meh.fatih77@gmail.com",   tier: "SUPER ADMIN", mrr: 18 },
      { id: 2, name: "admin@finsuite.zyrix.co", tier: "ADMIN",       mrr: 12 },
      { id: 3, name: "adminfinsuite@zyrix.co",  tier: "ADMIN",       mrr: 5 },
    ],
  }), []);
}

function buildComplianceRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.failedLoginsTR > 12) {
    recs.push({
      id: "failed-login-tr",
      priority: "high",
      text: `${snapshot.failedLoginsTR} failed logins originated from Turkey in the last 7 days. Consider rate-limiting per IP and CAPTCHA on the affected accounts.`,
      action: "Open security policy",
    });
  }
  if (snapshot.criticalEvents > 0) {
    recs.push({
      id: "critical-events",
      priority: "high",
      text: `${snapshot.criticalEvents} CRITICAL events open. Top item: "${snapshot.topRiskName}" (${snapshot.topRiskScore}%). Review and dispose before SLA.`,
      action: "Open audit log",
    });
  }
  if (snapshot.pendingRequests >= 3) {
    recs.push({
      id: "kvkk-gdpr-pending",
      priority: "medium",
      text: `${snapshot.pendingRequests} KVKK/GDPR data requests are pending. The 30-day SLA approaches — escalate the oldest one today.`,
      action: "Open KVKK queue",
    });
  }
  if (parseFloat(snapshot.complianceScore) < 95) {
    recs.push({
      id: "compliance-gap",
      priority: "medium",
      text: `Compliance score ${snapshot.complianceScore}% leaves a ${(100 - parseFloat(snapshot.complianceScore)).toFixed(1)}% gap — typically data retention or subprocessor docs. Audit those two clusters first.`,
      action: "View gap report",
    });
  }
  if (snapshot.exportAttempts >= 1) {
    recs.push({
      id: "export-watch",
      priority: "low",
      text: `${snapshot.exportAttempts} bulk-export attempt(s) flagged. Confirm legitimate-business-need on each before approving.`,
      action: "Review export log",
    });
  }
  return recs;
}

export default function ComplianceOverviewPage() {
  const data = useComplianceOverviewData();

  const dataSnapshot = useMemo(() => {
    const tr = data.eventsByCountry.find((c) => c.code === "TR");
    const failedLoginsTR = tr ? Math.round(data.kpis.failedLogins.value * (tr.count / data.kpis.totalEvents.value)) : 0;
    const critical = data.severityDist.find((s) => s.name === "Critical")?.count || 0;
    const top = data.complianceRisks[0];
    const exportAttempts = data.complianceRisks.filter((r) => r.reason === "Data export").length;
    const auditor = data.topAuditors[0];

    return {
      primaryMetric:   { label: "Total events",     value: data.kpis.totalEvents.value.toString(), trend: data.kpis.totalEvents.trend },
      secondaryMetric: { label: "Compliance score", value: `${data.kpis.complianceScore.value}%`, trend: data.kpis.complianceScore.trend },
      topPerformer:    { label: auditor.name, value: `${auditor.mrr} events reviewed` },
      risk:            { label: top.name, value: `${top.risk}% severity` },

      failedLoginsTR,
      criticalEvents: critical,
      topRiskName: top.name,
      topRiskScore: top.risk,
      pendingRequests: data.kpis.pendingRequests.value,
      complianceScore: data.kpis.complianceScore.value.toFixed(1),
      exportAttempts,
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Compliance Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="events"  position={0} pageKey="compliance" label="TOTAL EVENTS"
                 value={data.kpis.totalEvents.value} trend={data.kpis.totalEvents.trend}
                 trendLabel="vs last 30d" sparklineData={data.kpis.totalEvents.sparkline} />,
        <KPICard key="pending" position={1} pageKey="compliance" label="PENDING REQUESTS"
                 value={data.kpis.pendingRequests.value} trend={data.kpis.pendingRequests.trend}
                 trendLabel="KVKK / GDPR" sparklineData={data.kpis.pendingRequests.sparkline} />,
        <KPICard key="failed"  position={2} pageKey="compliance" label="FAILED LOGINS (7D)"
                 value={data.kpis.failedLogins.value} trend={data.kpis.failedLogins.trend}
                 trendLabel="vs prior week" sparklineData={data.kpis.failedLogins.sparkline} />,
        <KPICard key="score"   position={3} pageKey="compliance" label="COMPLIANCE SCORE"
                 value={data.kpis.complianceScore.value} format="percent" suffix="%"
                 trend={data.kpis.complianceScore.trend} trendLabel="overall posture"
                 sparklineData={data.kpis.complianceScore.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="severity" title="Events by Severity" icon="🛡"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.severityDist}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="geo" title="Events by Country" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.eventsByCountry} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="risk" title="Risk Matrix" icon="⚠️"
                        color={ANALYTICS_COLORS.risk.primary}>
          <AnimatedRiskList customers={data.complianceRisks}
                            categoryMap={COMPLIANCE_RISK_CATEGORIES}
                            yAxisLabel="SEVERITY"
                            dangerLabel="CRITICAL" />
        </AnalyticsBlock>,
        <AnalyticsBlock key="auditors" title="Top Auditors" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topAuditors}
                          valueFormatter={(v) => `${v} events`} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Compliance posture" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildComplianceRecs} />}
    />
  );
}
