// ================================================================
// ★ Predictive Calendar AI — auto-fills your day
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { useAuth } from "../../../context/AuthContext";
import {
  getAIPalette,
  getAlertPalette,
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import DayTimeline from "../../../components/dashboard/cognitive/DayTimeline";
import { generateDayPlan, localStore, KEYS } from "./cognitiveApi";

export default function PredictiveCalendarPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const { user } = useAuth();
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [events, setEvents] = useState([]);
  const [savedToast, setSavedToast] = useState(null);

  useEffect(() => {
    const cached = localStore.getKv(KEYS.calendarPlan, null);
    if (cached && cached.date === new Date().toISOString().slice(0, 10)) {
      setEvents(cached.events);
    } else {
      regenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regenerate = () => {
    const plan = generateDayPlan({ name: user?.name });
    setEvents(plan);
    localStore.saveKv(KEYS.calendarPlan, { date: new Date().toISOString().slice(0, 10), events: plan });
    setSavedToast("Plan refreshed");
    setTimeout(() => setSavedToast(null), 1800);
  };

  const stats = useMemo(() => {
    const high = events.filter((e) => e.priority === "high").length;
    const protectedCount = events.filter((e) => e.priority === "protected").length;
    const free = events.filter((e) => e.priority === "free").length;
    return {
      events: events.length,
      protected: protectedCount,
      travel: 1,
      deepWork: free + protectedCount,
    };
  }, [events]);

  const today = new Date().toLocaleDateString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("calendar.title")}
        subtitle={t("calendar.subtitle")}
        icon="📅"
        palette={ai}
        actions={
          <>
            <PageHeaderButton palette={reports} variant="secondary" icon="⤓" onClick={() => {}}>
              {t("calendar.action.export")}
            </PageHeaderButton>
            <PageHeaderButton palette={brand} variant="primary" icon="✨" onClick={regenerate}>
              {t("calendar.action.optimize")}
            </PageHeaderButton>
          </>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cog-kpi-grid"
      >
        <KpiCard label={t("calendar.kpi.events")} value={stats.events} palette={ai} icon="📅" />
        <KpiCard label={t("calendar.kpi.protected")} value={stats.protected} palette={money} icon="🛡" />
        <KpiCard label={t("calendar.kpi.travel")} value={stats.travel} suffix="h" palette={customer} icon="🚗" />
        <KpiCard label={t("calendar.kpi.deepWork")} value={stats.deepWork} suffix="h" palette={success} icon="🧠" />
      </div>

      <Card palette={ai} title={`${t("calendar.today")} · ${today}`} icon="📆">
        <DayTimeline events={events} lang={lang} t={t} />
      </Card>

      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: success.bg,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          ✓ {savedToast}
        </div>
      )}

      <style>{`@media (max-width: 720px) { .cog-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
