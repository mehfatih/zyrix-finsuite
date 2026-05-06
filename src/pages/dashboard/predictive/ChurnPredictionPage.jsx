// ================================================================
// ★ Churn Prediction — at-risk customers + AI-recommended actions
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAlertPalette,
  getWarningPalette,
  getSuccessPalette,
  getCustomerPalette,
  getMoneyPalette,
  getAIPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ChurnRiskBadge from "../../../components/dashboard/predictive/ChurnRiskBadge";
import { api, predictChurn, localStore, KEYS, fmtCurrency, fmtDate } from "./predictiveApi";

export default function ChurnPredictionPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [recovered, setRecovered] = useState(0);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    api("/api/invoices?limit=500").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    setRecovered(Number(localStore.getKv(KEYS.churnRecover, 0)) || 0);
    setDismissed(new Set(localStore.list(KEYS.churnDismiss).map((d) => d.customerId)));
  }, []);

  const predictions = useMemo(() => {
    const out = [];
    customers.forEach((c) => {
      const p = predictChurn({ customer: c, invoices });
      if (p && p.probability >= 35) out.push(p);
    });
    return out.sort((a, b) => b.probability - a.probability);
  }, [customers, invoices]);

  const visible = predictions.filter((p) => !dismissed.has(p.customerId));
  const stats = useMemo(() => {
    const lostRev = visible.reduce((s, p) => s + Number(p.ltv || 0), 0);
    return {
      atRisk: visible.length,
      high: visible.filter((p) => p.probability >= 70).length,
      lostRev,
      recovered,
    };
  }, [visible, recovered]);

  const recover = (p) => {
    const newTotal = recovered + Number(p.ltv || 0) * 0.4;
    localStore.saveKv(KEYS.churnRecover, newTotal);
    setRecovered(newTotal);
    localStore.add(KEYS.churnDismiss, { customerId: p.customerId, action: "RECOVER", at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, p.customerId]));
  };

  const dismiss = (p) => {
    localStore.add(KEYS.churnDismiss, { customerId: p.customerId, action: "DISMISS", at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, p.customerId]));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("churn.title")} subtitle={t("churn.subtitle")} icon="📉" palette={alert} />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${alert.bg}, ${customer.bg})`,
          border: `2px solid ${alert.base}40`,
          borderRadius: 22,
          padding: "26px 22px",
          marginBottom: 18,
          textAlign: "center",
          boxShadow: `0 12px 36px ${alert.base}25`,
        }}
      >
        <div style={{ fontSize: 11, color: alert.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12 }}>
          🤖 AI Churn Detection
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: alert.base, fontFamily: "monospace", letterSpacing: "-0.04em" }}>
          {stats.atRisk}
        </div>
        <div style={{ fontSize: 14, color: alert.dark, fontWeight: 700, marginBottom: 4 }}>
          {t("churn.hero.atrisk")}
        </div>
        <div style={{ fontSize: 12, color: "#64748B" }}>
          {t("churn.hero.lostRevenue")}:{" "}
          <strong style={{ color: money.base, fontFamily: "monospace" }}>{fmtCurrency(stats.lostRev)}</strong>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="predict-kpi-grid"
      >
        <KpiCard label={t("churn.kpi.atrisk")} value={stats.atRisk} palette={alert} icon="📉" pulse={stats.atRisk > 0} />
        <KpiCard label={t("churn.kpi.high")} value={stats.high} palette={warn} icon="⚠️" pulse={stats.high > 0} />
        <KpiCard label={t("churn.kpi.predicted")} value={Math.round(stats.lostRev)} prefix="₺" palette={customer} icon="💸" />
        <KpiCard label={t("churn.kpi.recovered")} value={Math.round(stats.recovered)} prefix="₺" palette={success} icon="✅" />
      </div>

      {/* At-risk list */}
      {visible.length === 0 ? (
        <EmptyState title="No at-risk customers 🎉" icon="✅" palette={success} />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {visible.slice(0, 12).map((p) => (
            <Card key={p.customerId} palette={p.probability >= 70 ? alert : warn}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "flex-start" }} className="churn-card-grid">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${(p.probability >= 70 ? alert : warn).base}, ${(p.probability >= 70 ? alert : warn).dark})`,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 20,
                    fontWeight: 900,
                    flexShrink: 0,
                    boxShadow: `0 6px 18px ${(p.probability >= 70 ? alert : warn).base}50`,
                  }}
                >
                  {(p.customerName || "?")[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{p.customerName}</span>
                    <ChurnRiskBadge probability={p.probability} confidence={p.confidence} />
                    <span style={{ fontSize: 11, color: "#64748B" }}>
                      LTV {fmtCurrency(p.ltv)} · {t("churn.col.predicted")} {fmtDate(p.predictedDate, lang)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {t("churn.col.signals")}
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, marginBottom: 8 }}>
                    <li style={{ fontSize: 12, color: "#475569", marginBottom: 3 }}>
                      • {t("churn.signals.noBuy").replace("{days}", p.daysSinceLast).replace("{normal}", p.avgInterval)}
                    </li>
                    <li style={{ fontSize: 12, color: "#475569", marginBottom: 3 }}>
                      • {t("churn.signals.lowEngagement").replace("{days}", p.daysSinceLast)}
                    </li>
                    {p.probability >= 60 && (
                      <li style={{ fontSize: 12, color: "#475569", marginBottom: 3 }}>
                        • {t("churn.signals.competitor")}
                      </li>
                    )}
                  </ul>
                  <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {t("churn.actions.title")}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <Pill color={ai.bg} fg={ai.dark}>💬 {t("churn.actions.message")}</Pill>
                    <Pill color={success.bg} fg={success.dark}>🎫 {t("churn.actions.discount")}</Pill>
                    <Pill color={customer.bg} fg={customer.dark}>📞 {t("churn.actions.call")}</Pill>
                    <Pill color={money.bg} fg={money.dark}>🎁 {t("churn.actions.bundle")}</Pill>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => recover(p)} style={btnPrimary(brand)}>
                    ⚡ {t("churn.run")}
                  </button>
                  <button type="button" onClick={() => dismiss(p)} style={btnGhost(alert)}>
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) { .predict-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 720px) { .churn-card-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Pill({ children, color, fg }) {
  return (
    <span style={{ background: color, color: fg, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {children}
    </span>
  );
}

function btnPrimary(palette) {
  return {
    background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: `0 4px 14px ${palette.base}40`,
    whiteSpace: "nowrap",
  };
}

function btnGhost(palette) {
  return {
    background: "transparent",
    color: "#94A3B8",
    border: `1px solid #E2E8F0`,
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}
