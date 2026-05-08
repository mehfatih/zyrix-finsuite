// ================================================================
// /admin/musavir/overview — Tax advisor network via Donut + Map +
// Funnel + Treemap. Funnel covers partner onboarding (Applied →
// Active); treemap surfaces top partners by commission earned.
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

function useMusavirOverviewData() {
  return useMemo(() => ({
    kpis: {
      activePartners:     { value: 84,     trend: 8,    sparkline: genSparkline(84, 6) },
      commissionsPaid:    { value: 142800, trend: 14.2, sparkline: genSparkline(142800, 12000) },
      referralConversion: { value: 38.4,   trend: 4.2,  sparkline: genSparkline(38.4, 4) },
      nps:                { value: 8.7,    trend: 0.4,  sparkline: genSparkline(8.7, 0.5) },
    },
    partnersBySpec: [
      { name: "KDV",      count: 32, mrr: 32, color: "#1A56DB" },
      { name: "Kurumlar", count: 24, mrr: 24, color: "#7C3AED" },
      { name: "Bordro",   count: 18, mrr: 18, color: "#22D3EE" },
      { name: "E-Fatura", count: 10, mrr: 10, color: "#F59E0B" },
    ],
    partnerGeo: [
      { code: "TR", name: "Turkey", count: 68 },
      { code: "SA", name: "Saudi",  count: 9 },
      { code: "AE", name: "UAE",    count: 5 },
      { code: "EG", name: "Egypt",  count: 2 },
    ],
    onboardingFunnel: [
      { name: "Applied",    value: 248, color: "#22D3EE" },
      { name: "Reviewed",   value: 178, color: "#1A56DB" },
      { name: "Trained",    value: 124, color: "#7C3AED" },
      { name: "Certified",  value: 96,  color: "#F59E0B" },
      { name: "Active",     value: 84,  color: "#10B981" },
    ],
    topPartners: [
      { id: 1, name: "Aydın Mali Müşavirlik",   tier: "GOLD",   mrr: 18400 },
      { id: 2, name: "İzmir Vergi Danışmanlık", tier: "GOLD",   mrr: 14200 },
      { id: 3, name: "Ankara Smmm Group",       tier: "SILVER", mrr: 11800 },
      { id: 4, name: "Bursa Mali Çözümler",     tier: "SILVER", mrr: 9420 },
      { id: 5, name: "Adana Smmm Ofisi",        tier: "BRONZE", mrr: 7180 },
      { id: 6, name: "Konya Mali Hizmet",       tier: "BRONZE", mrr: 5840 },
    ],
  }), []);
}

function buildMusavirRecs(snapshot) {
  const recs = [];
  if (!snapshot) return recs;

  if (snapshot.reviewedToTrainedDrop > 25) {
    recs.push({
      id: "training-drop",
      priority: "high",
      text: `Reviewed→Trained drops ${snapshot.reviewedToTrainedDrop}% — your training step is leaking ${snapshot.reviewedLost} approved candidates. Audit the training onboarding email/portal flow.`,
      action: "Open training analytics",
    });
  }
  if (snapshot.top2Concentration >= 25) {
    recs.push({
      id: "top-2-concentration",
      priority: "medium",
      text: `Top 2 partners drive ₺${snapshot.top2Mrr.toLocaleString()} (${snapshot.top2Concentration}% of commissions). Capture their playbook into a partner-success guide and protect those relationships.`,
      action: "Schedule partner QBR",
    });
  }
  if (snapshot.efaturaUnderrepresented) {
    recs.push({
      id: "efatura-recruit",
      priority: "medium",
      text: `E-Fatura specialists are only ${snapshot.efaturaShare}% of the network — underrepresented vs demand. Recruit 8-12 E-Fatura experts to balance.`,
      action: "Open recruiter pipeline",
    });
  }
  if (snapshot.saudiRamp) {
    recs.push({
      id: "saudi-expansion",
      priority: "low",
      text: `Saudi partners are ramping ~4× faster than Turkey average — explore expansion plan for Q3.`,
      action: "Plan Saudi expansion",
    });
  }
  if (parseFloat(snapshot.nps) >= 8.5) {
    recs.push({
      id: "nps-strong",
      priority: "low",
      text: `Partner NPS at ${snapshot.nps}/10 — top decile. Run a quote-collection drive and use voices in next quarter's recruitment.`,
      action: "Capture quotes",
    });
  }
  return recs;
}

export default function MusavirOverviewPage() {
  const data = useMusavirOverviewData();

  const dataSnapshot = useMemo(() => {
    const funnel = data.onboardingFunnel;
    const reviewed = funnel.find((s) => s.name === "Reviewed")?.value || 0;
    const trained = funnel.find((s) => s.name === "Trained")?.value || 0;
    const reviewedToTrainedDrop = reviewed ? Math.round(((reviewed - trained) / reviewed) * 100) : 0;
    const reviewedLost = reviewed - trained;

    const totalMrr = data.topPartners.reduce((s, p) => s + p.mrr, 0) || 1;
    const top2Mrr = (data.topPartners[0]?.mrr || 0) + (data.topPartners[1]?.mrr || 0);
    const top2Concentration = Math.round((top2Mrr / totalMrr) * 100);

    const totalSpec = data.partnersBySpec.reduce((s, p) => s + p.count, 0) || 1;
    const efatura = data.partnersBySpec.find((p) => p.name === "E-Fatura");
    const efaturaShare = efatura ? Math.round((efatura.count / totalSpec) * 100) : 0;

    const top = data.topPartners[0];

    return {
      primaryMetric:   { label: "Active partners", value: data.kpis.activePartners.value.toString(), trend: data.kpis.activePartners.trend },
      secondaryMetric: { label: "Commissions paid", value: `₺${data.kpis.commissionsPaid.value.toLocaleString()}`, trend: data.kpis.commissionsPaid.trend },
      topPerformer:    { label: top.name, value: `₺${top.mrr.toLocaleString()} commission` },
      risk:            { label: "Reviewed → Trained drop", value: `${reviewedToTrainedDrop}%` },

      reviewedToTrainedDrop,
      reviewedLost,
      top2Mrr,
      top2Concentration,
      efaturaShare,
      efaturaUnderrepresented: efaturaShare < 20,
      saudiRamp: (data.partnerGeo.find((g) => g.code === "SA")?.count || 0) >= 8,
      nps: data.kpis.nps.value.toFixed(1),
    };
  }, [data]);

  return (
    <OverviewLayout
      title="Mali Müşavir Overview"
      subtitle="Live snapshot · updates every 30s"
      kpis={[
        <KPICard key="active"  position={0} pageKey="musavir" label="ACTIVE PARTNERS"
                 value={data.kpis.activePartners.value} trend={data.kpis.activePartners.trend}
                 trendLabel="vs last 30d" sparklineData={data.kpis.activePartners.sparkline} />,
        <KPICard key="comm"    position={1} pageKey="musavir" label="COMMISSIONS PAID"
                 value={data.kpis.commissionsPaid.value} format="currency" prefix="₺"
                 trend={data.kpis.commissionsPaid.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.commissionsPaid.sparkline} />,
        <KPICard key="ref"     position={2} pageKey="musavir" label="REFERRAL CONVERSION"
                 value={data.kpis.referralConversion.value} format="percent" suffix="%"
                 trend={data.kpis.referralConversion.trend} trendLabel="vs last 30d"
                 sparklineData={data.kpis.referralConversion.sparkline} />,
        <KPICard key="nps"     position={3} pageKey="musavir" label="NPS"
                 value={data.kpis.nps.value} suffix="/10"
                 trend={data.kpis.nps.trend} trendLabel="partner satisfaction"
                 sparklineData={data.kpis.nps.sparkline} />,
      ]}
      analytics={[
        <AnalyticsBlock key="spec" title="Partners by Specialization" icon="🧮"
                        color={ANALYTICS_COLORS.distribution.primary}>
          <AnimatedTierBars tiers={data.partnersBySpec}
                            gradient={ANALYTICS_COLORS.distribution.gradient} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="geo" title="Geographic Coverage" icon="🌍"
                        color={ANALYTICS_COLORS.geographic.primary}>
          <AnimatedGeoBubbles regions={data.partnerGeo} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="onb" title="Onboarding Funnel" icon="🪣"
                        color="#7C3AED">
          <AnimatedFunnel stages={data.onboardingFunnel} />
        </AnalyticsBlock>,
        <AnalyticsBlock key="top" title="Top Partners by Commission" icon="🏆"
                        color={ANALYTICS_COLORS.ranking.gold}>
          <AnimatedPodium customers={data.topPartners} />
        </AnalyticsBlock>,
      ]}
      summary={<PowerBISummary dataSnapshot={dataSnapshot} pageContext="Tax advisor network" />}
      recommendations={<AIRecommendations dataSnapshot={dataSnapshot}
                                          recommendationsBuilder={buildMusavirRecs} />}
    />
  );
}
