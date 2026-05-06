// ================================================================
// ★ Cashflow Stress Test — 100-scenario Monte Carlo + mitigations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import MonteCarloViz from "../../../components/dashboard/predictive/MonteCarloViz";
import BreakEvenIndicator from "../../../components/dashboard/predictive/BreakEvenIndicator";
import { runStressTest, localStore, KEYS, fmtCurrency } from "./predictiveApi";

const FACTORS = [
  { id: "lateCustomers", labelKey: "stress.factor.lateCustomers", revenueShock: 1.0, default: true },
  { id: "revenueDrop",   labelKey: "stress.factor.revenueDrop",   revenueShock: 0.8, default: true },
  { id: "bigExpense",    labelKey: "stress.factor.bigExpense",    revenueShock: 1.0, default: false },
  { id: "fxShock",       labelKey: "stress.factor.fxShock",       revenueShock: 0.92, default: false },
  { id: "supplierRise",  labelKey: "stress.factor.supplierRise",  revenueShock: 1.0, default: false },
  { id: "churn",         labelKey: "stress.factor.churn",         revenueShock: 0.85, default: false },
];

export default function CashflowStressTestPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [activeFactors, setActiveFactors] = useState(() => {
    const out = {};
    FACTORS.forEach((f) => { out[f.id] = f.default; });
    return out;
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => setHistory(localStore.list(KEYS.stressRuns)), []);

  const toggle = (id) => setActiveFactors((cur) => ({ ...cur, [id]: !cur[id] }));

  const run = async () => {
    setRunning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    const accounts = localStore.list("zyrix_cash_accounts_v1");
    const cash = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const startBalance = cash || 124500;
    const monthlyIn = 128000;
    const monthlyOut = 96000;
    const factors = FACTORS.filter((f) => activeFactors[f.id]).map((f) => ({ ...f }));
    const out = runStressTest({ startBalance, monthlyIn, monthlyOut, factors, days: 90 });
    setResult(out);
    localStore.add(KEYS.stressRuns, { factors: factors.map((f) => f.id), summary: out.summary, runAt: new Date().toISOString() });
    setHistory(localStore.list(KEYS.stressRuns));
    setRunning(false);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("stress.title")} subtitle={t("stress.subtitle")} icon="🧪" palette={ai} />

      {/* Factor selector */}
      <Card palette={ai} title={t("stress.factors.title")} icon="⚙️" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
          {FACTORS.map((f) => {
            const active = !!activeFactors[f.id];
            return (
              <label
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: active ? `${alert.base}10` : "#F8FAFC",
                  border: `1px solid ${active ? alert.base : "#E2E8F0"}40`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: active ? alert.dark : "#475569",
                }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(f.id)}
                  style={{ width: 16, height: 16, accentColor: alert.base }}
                />
                <span>{t(f.labelKey)}</span>
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={run}
            disabled={running}
            style={{
              background: running ? "#CBD5E1" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: "#fff",
              border: "none",
              padding: "12px 22px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: running ? "not-allowed" : "pointer",
              boxShadow: running ? "none" : `0 6px 18px ${brand.base}40`,
            }}
          >
            {running ? `🧠 ${t("stress.running")}` : `⚡ ${t("stress.run")}`}
          </button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
            className="predict-kpi-grid"
          >
            <KpiCard label={t("stress.results.best")} value={result.summary.bestDays} suffix=" days" palette={success} icon="🌟" />
            <KpiCard label={t("stress.results.likely")} value={result.summary.medianDays} suffix=" days" palette={ai} icon="📊" />
            <KpiCard label={t("stress.results.worst")} value={result.summary.worstDays} suffix=" days" palette={alert} icon="⚠️" pulse={result.summary.worstDays < 30} />
            <KpiCard label="End balance (median)" value={Math.round(result.summary.median)} prefix="₺" palette={money} icon="💰" />
          </div>

          {/* Monte Carlo fan */}
          <Card palette={ai} title={t("stress.fan.title")} subtitle={t("stress.fan.subtitle")} icon="📈" style={{ marginBottom: 18 }}>
            <MonteCarloViz trajectories={result.trajectories} days={result.days} palette={ai} height={300} />
          </Card>

          {/* Break-even indicator */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 18, marginBottom: 18 }} className="predict-detail-grid">
            <BreakEvenIndicator days={result.summary.medianDays} lang={lang} t={t} />
            <Card palette={ai} title={t("stress.mitigation.title")} icon="💡">
              <Mitigation icon="💰" label={t("stress.mitigation.cash").replace("{current}", 18).replace("{needed}", 60)} palette={money} />
              <Mitigation icon="🌐" label={t("stress.mitigation.diversify")} palette={customer} />
              <Mitigation icon="📅" label={t("stress.mitigation.terms")} palette={ai} />
              <Mitigation icon="💱" label={t("stress.mitigation.fx")} palette={success} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" style={btn(reports, "secondary")}>💾 {t("stress.action.save")}</button>
                <button type="button" style={btn(brand, "primary")}>⚡ {t("stress.action.apply")}</button>
              </div>
            </Card>
          </div>
        </>
      )}

      {!result && !running && (
        <EmptyState title="Run a stress test to see Monte Carlo results" icon="🧪" palette={ai} />
      )}

      {/* History */}
      {history.length > 0 && (
        <Card palette={reports} title="Recent runs" icon="📜">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {history.slice(0, 6).map((h) => (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: "1px solid #F1F5F9",
                  fontSize: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span style={{ color: "#475569", fontWeight: 700 }}>
                  📅 {new Date(h.runAt).toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span style={{ color: "#64748B", fontSize: 11 }}>
                  Factors: {h.factors.length} · Median: <strong style={{ color: ai.dark, fontFamily: "monospace" }}>{h.summary.medianDays}d</strong> · Worst: <strong style={{ color: alert.base, fontFamily: "monospace" }}>{h.summary.worstDays}d</strong>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <style>{`
        @media (max-width: 720px) { .predict-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 880px) { .predict-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Mitigation({ icon, label, palette }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: palette.bg, color: palette.dark, display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{label}</div>
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
