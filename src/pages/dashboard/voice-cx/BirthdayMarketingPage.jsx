// ================================================================
// ★ AI Birthday & Occasion Marketing — auto-send timeline
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getAIPalette, getMarketPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import OccasionTimeline from "../../../components/dashboard/voice-cx/OccasionTimeline";
import { api, localStore, KEYS, buildOccasionTimeline, generateOccasionMessage } from "./voiceCxApi";

export default function BirthdayMarketingPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("voice-cx");
  const ai = getAIPalette();
  const market = getMarketPalette();
  const success = getSuccessPalette();
  const rose = { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239", chart: "#FB7185" };

  const [customers, setCustomers] = useState([]);
  const [history, setHistory] = useState(localStore.list(KEYS.occasionHistory));

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
  }, []);

  const occasions = useMemo(() => buildOccasionTimeline(customers), [customers]);
  const handledIds = new Set(history.map((h) => h.occasionId));
  const visible = occasions.filter((o) => !handledIds.has(o.id));

  const stats = {
    upcoming: visible.length,
    scheduled: history.filter((h) => h.action === "configure").length,
    sent: history.filter((h) => h.action === "sent").length,
    engagement: 64,
  };

  const skip = (occ) => {
    localStore.add(KEYS.occasionHistory, { occasionId: occ.id, action: "skipped", at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.occasionHistory));
  };
  const configure = (occ) => {
    localStore.add(KEYS.occasionHistory, { occasionId: occ.id, action: "configure", message: generateOccasionMessage(occ, lang), at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.occasionHistory));
  };
  const generate = (occ) => {
    localStore.add(KEYS.occasionHistory, { occasionId: occ.id, action: "sent", message: generateOccasionMessage(occ, lang), at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.occasionHistory));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("birthday.title")} subtitle={t("birthday.subtitle")} icon="🎂" palette={rose} />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="bm-kpis"
      >
        <KpiCard label={t("birthday.kpi.upcoming")}    value={stats.upcoming}   palette={rose}    icon="📅" pulse={stats.upcoming > 0} />
        <KpiCard label={t("birthday.kpi.scheduled")}   value={stats.scheduled}  palette={ai}      icon="⏰" />
        <KpiCard label={t("birthday.kpi.sent")}        value={stats.sent}       palette={success} icon="📨" />
        <KpiCard label={t("birthday.kpi.engagement")}  value={`${stats.engagement}%`} palette={market} icon="❤️" />
      </div>

      <Card palette={rose} title={t("birthday.timeline.title")} icon="🗓">
        {visible.length === 0 ? (
          <EmptyState icon="🎉" title={t("birthday.timeline.empty")} palette={success} />
        ) : (
          <OccasionTimeline occasions={visible} onSkip={skip} onConfigure={configure} onGenerate={generate} t={t} lang={lang} />
        )}
      </Card>

      <style>{`
        @media (max-width: 720px) { .bm-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
