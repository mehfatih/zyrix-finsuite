// ================================================================
// ★ Zyrix University — micro-learning + skill tree + certificates
// ================================================================
import React, { useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getWarningPalette, getAIPalette, getSuccessPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EducationProgressTree from "../../../components/dashboard/ecosystem/EducationProgressTree";
import CertificateBadge from "../../../components/dashboard/ecosystem/CertificateBadge";
import { EDU_SKILL_TREE, DAILY_LESSON, CERTIFICATES, loadEducationProgress, saveEducationProgress, levelKeyForXp } from "./ecosystemApi";

export default function EducationPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("ecosystem");
  const warn = getWarningPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();

  const [progress, setProgress] = useState(loadEducationProgress());

  const completeDaily = () => {
    const next = { ...progress, xp: progress.xp + (DAILY_LESSON[lang]?.xp || 50), streak: progress.streak + 1, completedLessonIds: [...(progress.completedLessonIds || []), `daily-${Date.now()}`] };
    saveEducationProgress(next);
    setProgress(next);
  };

  const dailyLesson = DAILY_LESSON[lang] || DAILY_LESSON.TR;
  const levelKey = levelKeyForXp(progress.xp);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("education.title")} subtitle={t("education.subtitle")} icon="🎓" palette={warn} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="ed-kpis">
        <KpiCard label={t("education.kpi.xp")}        value={progress.xp.toLocaleString()}    palette={warn}    icon="✨" />
        <KpiCard label={t("education.kpi.level")}     value={t(`education.level.${levelKey}`)} palette={ai}      icon="🏅" />
        <KpiCard label={t("education.kpi.completed")} value={progress.completedLessonIds?.length || 0} palette={success} icon="✓" />
        <KpiCard label={t("education.kpi.streak")}    value={progress.streak}                  palette={customer} icon="🔥" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="ed-grid">
        <div>
          <Card palette={warn} title={t("education.tree.title")} icon="🗺">
            <EducationProgressTree nodes={EDU_SKILL_TREE} t={t} />
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card palette={success} title={t("education.certificates.title")} icon="🏆">
              {CERTIFICATES.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#94A3B8" }}>{t("education.certificates.empty")}</div>
              ) : (
                CERTIFICATES.map((c) => <CertificateBadge key={c.id} cert={c} onShare={() => {}} t={t} />)
              )}
            </Card>
          </div>
        </div>

        <Card palette={ai} title={t("education.daily.title")} icon="🎯">
          <div style={{ background: `linear-gradient(135deg, ${ai.bg}, #fff)`, border: `1.5px solid ${ai.base}40`, borderRadius: 14, padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🎬</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6, lineHeight: 1.4 }}>
              {dailyLesson.title}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
              ⏱ {t("education.daily.duration", { n: dailyLesson.duration })} · ✨ {t("education.daily.reward", { xp: dailyLesson.xp })}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {t("education.daily.snooze")}
              </button>
              <button type="button" onClick={completeDaily} style={{ background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${ai.base}40` }}>
                {t("education.daily.watch")}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) { .ed-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .ed-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
