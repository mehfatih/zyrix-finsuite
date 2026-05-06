// ================================================================
// ★ Time-Loop Decision Simulator — dual timeline + AI verdict
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getCustomerPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import ScenarioCard from "../../../components/dashboard/predictive/ScenarioCard";
import TimelineSlider from "../../../components/dashboard/predictive/TimelineSlider";
import { localStore, KEYS, fmtCurrency } from "./predictiveApi";

const SCENARIOS = [
  { id: "priceUp",       icon: "📈", labelKey: "tl.pick.priceUp",       palette: "emerald", revFactor: 1.08, customerFactor: 0.95, profitFactor: 1.24, cashFactor: 1.18 },
  { id: "hire",          icon: "👤", labelKey: "tl.pick.hire",          palette: "indigo",  revFactor: 1.05, customerFactor: 1.02, profitFactor: 0.92, cashFactor: 0.88 },
  { id: "expand",        icon: "🏢", labelKey: "tl.pick.expand",        palette: "wine",    revFactor: 1.32, customerFactor: 1.28, profitFactor: 0.85, cashFactor: 0.62 },
  { id: "cutMarketing",  icon: "💰", labelKey: "tl.pick.cutMarketing",  palette: "amber",   revFactor: 0.94, customerFactor: 0.92, profitFactor: 1.08, cashFactor: 1.12 },
  { id: "discount",      icon: "🎁", labelKey: "tl.pick.discount",      palette: "rose",    revFactor: 1.15, customerFactor: 1.18, profitFactor: 0.94, cashFactor: 0.96 },
];

const BASELINE = {
  revenue: 128000,
  customers: 156,
  profit: 34200,
  cash: 124500,
};

export default function TimeLoopSimulatorPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [scenarioId, setScenarioId] = useState("priceUp");
  const [days, setDays] = useState(45);
  const [savedToast, setSavedToast] = useState(null);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  // Linearly interpolate factor effect over 0..90 days
  const projection = useMemo(() => {
    const ratio = Math.min(1, days / 90);
    const apply = (base, factor) => base * (1 + (factor - 1) * ratio);
    return {
      revenue: apply(BASELINE.revenue, scenario.revFactor),
      customers: Math.round(apply(BASELINE.customers, scenario.customerFactor)),
      profit: apply(BASELINE.profit, scenario.profitFactor),
      cash: apply(BASELINE.cash, scenario.cashFactor),
    };
  }, [scenario, days]);

  const verdict = useMemo(() => {
    const profitDelta = projection.profit - BASELINE.profit;
    const customerDelta = projection.customers - BASELINE.customers;
    const positive = profitDelta > 0;
    const bigCustomerLoss = customerDelta < -BASELINE.customers * 0.1;
    let confidence = 70;
    if (Math.abs(profitDelta) > BASELINE.profit * 0.2) confidence += 10;
    if (bigCustomerLoss) confidence -= 10;
    confidence = Math.min(95, confidence);
    return {
      message: positive
        ? `Net positive: +${fmtCurrency(profitDelta)} profit at day ${days}. ${bigCustomerLoss ? "Customer loss is significant — implement gradually." : "Recommended."}`
        : `Net negative: ${fmtCurrency(profitDelta)} profit hit. Reconsider or test on small segment first.`,
      confidence,
      peers: 247,
      positive,
    };
  }, [projection, days]);

  const save = () => {
    localStore.add(KEYS.scenarios, { scenarioId, days, projection, verdict, savedAt: new Date().toISOString() });
    setSavedToast(t("tl.action.save"));
    setTimeout(() => setSavedToast(null), 2400);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("tl.title")} subtitle={t("tl.subtitle")} icon="⏳" palette={ai} />

      {/* Scenario picker */}
      <Card palette={ai} title={t("tl.pick.title")} icon="🎯" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {SCENARIOS.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={{ icon: s.icon, label: t(s.labelKey) }}
              palette={s.palette}
              active={scenarioId === s.id}
              onClick={() => setScenarioId(s.id)}
            />
          ))}
          <ScenarioCard scenario={{ icon: "🎯", label: t("tl.pick.custom") }} palette="violet" onClick={() => {}} />
        </div>
      </Card>

      {/* Time slider */}
      <Card palette={ai} icon="⏱" style={{ marginBottom: 18 }}>
        <TimelineSlider value={days} max={90} onChange={setDays} label={t("tl.slider.label")} unit="days" />
      </Card>

      {/* Dual timeline KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="tl-grid">
        <Card palette={customer} title={t("tl.timeline.actual")} icon="📊">
          <Metric label={t("tl.metric.revenue")} value={fmtCurrency(BASELINE.revenue)} palette={money} />
          <Metric label={t("tl.metric.customers")} value={BASELINE.customers} palette={customer} />
          <Metric label={t("tl.metric.profit")} value={fmtCurrency(BASELINE.profit)} palette={success} />
          <Metric label={t("tl.metric.cash")} value={fmtCurrency(BASELINE.cash)} palette={ai} />
        </Card>
        <Card palette={ai} title={t("tl.timeline.simulated")} icon="🔮">
          <Metric label={t("tl.metric.revenue")} value={fmtCurrency(projection.revenue)} palette={money} delta={projection.revenue - BASELINE.revenue} />
          <Metric label={t("tl.metric.customers")} value={projection.customers} palette={customer} delta={projection.customers - BASELINE.customers} />
          <Metric label={t("tl.metric.profit")} value={fmtCurrency(projection.profit)} palette={success} delta={projection.profit - BASELINE.profit} />
          <Metric label={t("tl.metric.cash")} value={fmtCurrency(projection.cash)} palette={ai} delta={projection.cash - BASELINE.cash} />
        </Card>
      </div>

      {/* AI Verdict */}
      <div
        style={{
          background: `linear-gradient(135deg, ${verdict.positive ? success.bg : alert.bg}, ${ai.bg})`,
          border: `2px solid ${(verdict.positive ? success : alert).base}40`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          boxShadow: `0 12px 36px ${(verdict.positive ? success : alert).base}25`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: ai.base,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {t("tl.verdict.title")}
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              {t("tl.verdict.confidence").replace("{pct}", verdict.confidence).replace("{peers}", verdict.peers)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.6, marginBottom: 12 }}>
          {verdict.message}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" style={btn(reports, "secondary")}>{t("tl.action.try")}</button>
          <button type="button" onClick={save} style={btn(ai, "secondary")}>💾 {t("tl.action.save")}</button>
          <button type="button" style={btn(brand, "primary")}>⚡ {t("tl.action.implement")}</button>
        </div>
      </div>

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

      <style>{`@media (max-width: 720px) { .tl-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Metric({ label, value, palette, delta }) {
  const positive = delta > 0;
  const negative = delta < 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>{label}</span>
      <div style={{ textAlign: "end" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: palette.dark, fontFamily: "monospace" }}>{value}</div>
        {delta != null && delta !== 0 && (
          <div style={{ fontSize: 11, color: positive ? "#10B981" : negative ? "#EF4444" : "#94A3B8", fontWeight: 800 }}>
            {positive ? "↑" : "↓"} {typeof delta === "number" && delta % 1 === 0 ? Math.abs(delta) : fmtCurrency(Math.abs(delta))}
          </div>
        )}
      </div>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
