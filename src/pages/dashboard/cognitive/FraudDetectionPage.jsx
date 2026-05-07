// ================================================================
// ★ AI Fraud Detection — anomalies grouped by severity + actions
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  getAIPalette,
  getSuccessPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import AnomalyAlert from "../../../components/dashboard/cognitive/AnomalyAlert";
import { api, scanFraudAnomalies, localStore, KEYS } from "./cognitiveApi";

export default function FraudDetectionPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
    setReviews(localStore.list(KEYS.fraudReviews));
  }, []);

  useEffect(() => {
    setAnomalies(scanFraudAnomalies({ invoices, purchases, customers }));
  }, [invoices, purchases, customers]);

  const handled = new Set(reviews.map((r) => r.anomalyId));
  const visible = anomalies.filter((a) => !handled.has(a.id));

  const stats = useMemo(() => ({
    total: visible.length,
    high: visible.filter((a) => a.severity === "high").length,
    medium: visible.filter((a) => a.severity === "medium").length,
    low: visible.filter((a) => a.severity === "low").length,
  }), [visible]);

  const handle = (anomaly, decision) => {
    localStore.add(KEYS.fraudReviews, { anomalyId: anomaly.id, decision, at: new Date().toISOString() });
    setReviews(localStore.list(KEYS.fraudReviews));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("fraud.title")} subtitle={t("fraud.subtitle")} icon="🛡" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cog-kpi-grid"
      >
        <KpiCard label={t("fraud.kpi.total")}  value={stats.total}  palette={ai} icon="🔍" pulse={stats.total > 0} />
        <KpiCard label={t("fraud.kpi.high")}   value={stats.high}   palette={alert} icon="🚨" pulse={stats.high > 0} />
        <KpiCard label={t("fraud.kpi.medium")} value={stats.medium} palette={warn} icon="⚠️" />
        <KpiCard label={t("fraud.kpi.low")}    value={stats.low}    palette={customer} icon="🔎" />
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("fraud.empty")} icon="🎉" palette={success} />
      ) : (
        ["high", "medium", "low"].map((sev) => {
          const items = visible.filter((a) => a.severity === sev);
          if (items.length === 0) return null;
          const palette = sev === "high" ? alert : sev === "medium" ? warn : customer;
          return (
            <Card
              key={sev}
              palette={palette}
              title={`${t(`fraud.severity.${sev}`)} (${items.length})`}
              icon={sev === "high" ? "🚨" : sev === "medium" ? "⚠️" : "🔎"}
              style={{ marginBottom: 16 }}
            >
              {items.map((a) => (
                <AnomalyAlert
                  key={a.id}
                  anomaly={a}
                  onAction={() => handle(a, "action")}
                  onReview={() => handle(a, "review")}
                  onDismiss={() => handle(a, "dismiss")}
                  t={t}
                />
              ))}
            </Card>
          );
        })
      )}

      <style>{`@media (max-width: 720px) { .cog-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
