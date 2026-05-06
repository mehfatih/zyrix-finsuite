// ================================================================
// ★ Cashflow Forecast — HERO PAGE with confidence band + what-if
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getAlertPalette,
  getSuccessPalette,
  getReportsPalette,
  getCustomerPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import ConfidenceBandChart from "../../../components/dashboard/cash/ConfidenceBandChart";
import { api, localStore, KEYS, fmtCurrencyExact, convertFx } from "../cash/cashApi";

const SCENARIOS = {
  baseline:        { label: "Baseline",       revFactor: 1.0, paymentDelay: 0, hireExtra: 0 },
  lateCustomer:    { label: "Late Customer",  revFactor: 1.0, paymentDelay: 30, hireExtra: 0 },
  revenueDrop:     { label: "Revenue -20%",   revFactor: 0.8, paymentDelay: 0, hireExtra: 0 },
  newHire:         { label: "+1 Hire",        revFactor: 1.0, paymentDelay: 0, hireExtra: 25000 },
  delayPayments:   { label: "Delay Payments", revFactor: 1.0, paymentDelay: -30, hireExtra: 0 },
};

// Build a probabilistic 90-day forecast from simple inputs
function buildForecast({ startBalance, monthlyIn, monthlyOut, days = 90, scenario = "baseline" }) {
  const cfg = SCENARIOS[scenario] || SCENARIOS.baseline;
  const dailyIn = (monthlyIn * cfg.revFactor) / 30;
  const dailyOut = (monthlyOut + cfg.hireExtra) / 30;
  const points = [];
  let bal = startBalance;
  let lowestVal = bal;
  let lowestIdx = 0;
  for (let i = 0; i <= days; i++) {
    // Simulate slightly noisy daily trajectory
    if (i > 0) {
      const noise = (Math.sin(i * 0.55) * dailyIn * 0.18) + (Math.cos(i * 0.31) * dailyOut * 0.18);
      const inflow = i >= cfg.paymentDelay ? dailyIn : 0;
      bal += inflow - dailyOut + noise;
    }
    if (bal < lowestVal) {
      lowestVal = bal;
      lowestIdx = i;
    }
    // Confidence widens with time (sqrt growth)
    const sigma = Math.sqrt(Math.max(0, i)) * dailyOut * 0.55;
    const date = new Date();
    date.setDate(date.getDate() + i);
    points.push({
      label: i === 0 ? "Today" : i % 7 === 0 ? `Day ${i}` : "",
      value: bal,
      low50: bal - sigma * 0.7,
      high50: bal + sigma * 0.7,
      low95: bal - sigma * 1.96,
      high95: bal + sigma * 1.96,
      isToday: i === 0,
      date: date.toISOString().slice(0, 10),
    });
  }
  // Tag lowest as risk if it is below 25% of starting balance
  if (lowestVal < startBalance * 0.4) {
    points[lowestIdx].isRisk = true;
  }
  return { points, lowest: { value: lowestVal, day: lowestIdx } };
}

export default function CashflowForecastPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("ai-finance");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [days, setDays] = useState(90);
  const [scenario, setScenario] = useState("baseline");
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    setAccounts(localStore.list(KEYS.cashAccounts));
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
  }, []);

  const startBalance = useMemo(
    () => accounts.reduce((s, a) => s + convertFx(a.balance, a.currency, "TRY"), 0),
    [accounts]
  );

  const monthlyIn = useMemo(() => {
    const last90 = (invoices || []).filter((i) => i.status === "PAID" && i.paidDate && Date.now() - new Date(i.paidDate).getTime() < 90 * 86400000);
    if (last90.length === 0) return 80000;
    return last90.reduce((s, i) => s + Number(i.total || 0), 0) / 3;
  }, [invoices]);

  const monthlyOut = useMemo(() => {
    if (purchases.length === 0) return 60000;
    const total = purchases.reduce((s, p) => s + Number(p.total || 0), 0);
    return Math.max(40000, total / Math.max(1, Math.min(3, purchases.length / 5)));
  }, [purchases]);

  const forecast = useMemo(
    () => buildForecast({ startBalance, monthlyIn, monthlyOut, days, scenario }),
    [startBalance, monthlyIn, monthlyOut, days, scenario]
  );

  const points = forecast.points;
  const runwayDays = useMemo(() => {
    const idx = points.findIndex((p) => p.value <= 0);
    return idx < 0 ? days : idx;
  }, [points, days]);

  const overdue = useMemo(
    () => (invoices || []).filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date()),
    [invoices]
  );
  const largestRisk = overdue.sort((a, b) => Number(b.total || 0) - Number(a.total || 0))[0];

  const lowestDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + forecast.lowest.day);
    return d;
  })();

  const recommendations = [
    overdue.length > 0 && {
      icon: "📞",
      title: `${overdue.length} müşterinin gecikmiş ödemesi var`,
      action: `Tahsilatla ${runwayDays + 12} güne çıkar`,
      palette: alert,
    },
    monthlyOut > monthlyIn * 1.1 && {
      icon: "✂️",
      title: "Aylık çıkış girişten daha hızlı",
      action: "Gider kategorilerini gözden geçir",
      palette: getReportsPalette(),
    },
    {
      icon: "💱",
      title: `Nakdin %30'unu USD/EUR'a çevir`,
      action: "Enflasyon hedge'i — 90 günde ~₺6,300 koruma",
      palette: success,
    },
  ].filter(Boolean);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("forecast.title")}
        subtitle={t("forecast.subtitle")}
        icon="🔮"
        palette={ai}
        actions={
          <div style={{ display: "flex", gap: 4, padding: 4, background: ai.bg, borderRadius: 10 }}>
            {[30, 60, 90].map((d) => {
              const active = days === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "#fff" : "transparent",
                    color: active ? ai.dark : "#64748B",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: active ? `0 2px 8px ${ai.base}25` : "none",
                  }}
                >
                  {t(`forecast.range.${d}`)}
                </button>
              );
            })}
          </div>
        }
      />

      {/* HERO chart */}
      <Card palette={ai} title={`90-day projection · ${SCENARIOS[scenario].label}`} icon="📈" style={{ marginBottom: 18 }}>
        <ConfidenceBandChart data={points} palette={ai} t={t} />
      </Card>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cash-kpi-grid"
      >
        <Card palette={alert} title={t("forecast.kpi.lowPoint")} icon="📉">
          <div style={{ fontSize: 26, fontWeight: 900, color: alert.base, fontFamily: "monospace" }}>
            {fmtCurrencyExact(forecast.lowest.value)}
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            {t("forecast.kpi.lowDay").replace("{day}", forecast.lowest.day)} · {lowestDate.toLocaleDateString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "short", day: "numeric" })}
          </div>
        </Card>
        <KpiCard label={t("forecast.kpi.runway")} value={runwayDays} suffix="d" palette={runwayDays < 30 ? alert : success} icon="🛬" pulse={runwayDays < 30} />
        <Card palette={customer} title={t("forecast.kpi.risk")} icon="⚠️">
          {largestRisk ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: customer.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {largestRisk.customerName || "—"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: alert.base, fontFamily: "monospace" }}>
                {fmtCurrencyExact(largestRisk.total, largestRisk.currency)}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                {Math.abs(Math.round((new Date(largestRisk.dueDate) - new Date()) / 86400000))} days overdue
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: success.dark, fontWeight: 700 }}>No major risks 🎉</div>
          )}
        </Card>
        <KpiCard label="Predicted End" value={Math.round(points[points.length - 1]?.value || 0)} prefix="₺" palette={money} icon="🎯" />
      </div>

      {/* What-if scenarios */}
      <Card palette={brand} title={t("forecast.whatif.title")} icon="🧪" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {[
            { id: "baseline",      label: "Baseline",                              icon: "📊" },
            { id: "lateCustomer",  label: t("forecast.whatif.lateCustomer"),       icon: "⏰" },
            { id: "revenueDrop",   label: t("forecast.whatif.revenueDrop"),        icon: "📉" },
            { id: "newHire",       label: t("forecast.whatif.newHire"),            icon: "👥" },
            { id: "delayPayments", label: t("forecast.whatif.delayPayments"),      icon: "📅" },
          ].map((s) => {
            const active = scenario === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: active ? `2px solid ${brand.base}` : `1px solid ${brand.base}25`,
                  background: active ? brand.bg : "#fff",
                  color: active ? brand.dark : "#475569",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "start",
                }}
              >
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ flex: 1 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card palette={ai} title={t("forecast.recommendations")} icon="💡">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {recommendations.map((rec, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 12px",
                borderBottom: "1px solid #F1F5F9",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: rec.palette.bg,
                  color: rec.palette.dark,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {rec.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{rec.title}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>↳ {rec.action}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <style>{`@media (max-width: 720px) { .cash-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
