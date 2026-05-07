// ================================================================
// ★ Zyrix Twin — Digital Twin simulator HERO
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getPaletteById, getAIPalette, getSuccessPalette, getMoneyPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import DigitalTwinViz from "../../../components/dashboard/ecosystem/DigitalTwinViz";
import ScenarioRunner from "../../../components/dashboard/ecosystem/ScenarioRunner";
import { api, localStore, KEYS, fmtCurrency, fmtDate } from "./ecosystemApi";

export default function ZyrixTwinPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("ecosystem");
  const violet = getPaletteById("violet");
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();

  const [invoices, setInvoices] = useState([]);
  const [history, setHistory] = useState(localStore.list(KEYS.twinSimulations));

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
  }, []);

  const onSimulated = (r) => {
    const saved = localStore.add(KEYS.twinSimulations, r);
    setHistory((h) => [saved, ...h]);
  };

  const stats = {
    runs: history.length,
    implemented: localStore.list(KEYS.twinScenarios).filter((s) => s.implemented).length,
    risk: history.filter((h) => h.aiConfidence < 0.7).length,
    avgConfidence: history.length ? Math.round((history.reduce((s, h) => s + (h.aiConfidence || 0.8), 0) / history.length) * 100) : 0,
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("twin.title")} subtitle={t("twin.subtitle")} icon="🌐" palette={violet} />

      {/* HERO with holographic viz */}
      <Card palette={violet} title="" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center", padding: "20px 0 28px" }} className="zt-hero-grid">
          <DigitalTwinViz size={240} label={t("twin.title").replace("★ ", "")} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1.3, marginBottom: 8 }}>
              {t("twin.hero.tagline")}
            </div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
              {t("twin.subtitle")}
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 720px) { .zt-hero-grid { grid-template-columns: 1fr !important; text-align: center; } }`}</style>
      </Card>

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="zt-kpis"
      >
        <KpiCard label={t("twin.kpi.runs")}        value={stats.runs}        palette={violet}   icon="▶" />
        <KpiCard label={t("twin.kpi.implemented")} value={stats.implemented} palette={success}  icon="✓" />
        <KpiCard label={t("twin.kpi.savedRisk")}   value={stats.risk}        palette={money}    icon="🛡" />
        <KpiCard label={t("twin.kpi.confidence")}  value={`${stats.avgConfidence}%`} palette={ai} icon="🎯" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }} className="zt-grid">
        <ScenarioRunner invoices={invoices} lang={lang} onSimulated={onSimulated} t={t} />

        <Card palette={ai} title={t("twin.history.title")} icon="📚">
          {history.length === 0 ? (
            <EmptyState icon="🌌" title={t("twin.history.empty")} palette={ai} />
          ) : (
            history.slice(0, 8).map((sim) => {
              const profitDelta = ((sim.with.profit - sim.without.profit) / sim.without.profit) * 100;
              const positive = profitDelta >= 0;
              const palette = positive ? success : { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" };
              return (
                <div key={sim.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: 10, borderBottom: "1px solid #F1F5F9", alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                      {t(`twin.template.${sim.template}`)} · {t(`twin.duration.${sim.days}`)}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{fmtDate(sim.runAt, lang)}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: palette.bg, color: palette.dark }}>
                    {positive ? "+" : ""}{profitDelta.toFixed(0)}% profit
                  </span>
                </div>
              );
            })
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) { .zt-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .zt-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
