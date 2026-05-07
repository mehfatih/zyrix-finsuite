// ================================================================
// ★ Zyrix Insurance Marketplace — AI-recommended coverage
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getCustomerPalette, getAIPalette, getAlertPalette, getWarningPalette, getMoneyPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InsuranceComparator from "../../../components/dashboard/ecosystem/InsuranceComparator";
import { api, localStore, KEYS, buildInsuranceRecommendations, fmtCurrency } from "./ecosystemApi";

export default function InsurancePage() {
  const t = useDashboardI18n("ecosystem");
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const money = getMoneyPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotes, setQuotes] = useState(localStore.list(KEYS.insuranceQuotes));

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
  }, []);

  const recs = useMemo(() => buildInsuranceRecommendations({ invoices, customers }), [invoices, customers]);
  const handled = new Set(quotes.map((q) => q.recId));
  const visible = recs.filter((r) => !handled.has(r.id));

  const stats = {
    products: visible.length,
    high: visible.filter((r) => r.priority === "high").length,
    coverage: visible.reduce((s, r) => s + r.coverage, 0),
    quoted: quotes.length,
  };

  const onQuote = (rec) => {
    const q = localStore.add(KEYS.insuranceQuotes, { recId: rec.id, action: "quote", at: new Date().toISOString() });
    setQuotes((s) => [q, ...s]);
  };
  const onSkip = (rec) => {
    const q = localStore.add(KEYS.insuranceQuotes, { recId: rec.id, action: "skip", at: new Date().toISOString() });
    setQuotes((s) => [q, ...s]);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("insurance.title")} subtitle={t("insurance.subtitle")} icon="🛡" palette={customer} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="ip-kpis">
        <KpiCard label={t("insurance.priority.high")}    value={stats.high}                  palette={alert}    icon="🚨" pulse={stats.high > 0} />
        <KpiCard label="Active recommendations"           value={stats.products}              palette={ai}       icon="🛡" />
        <KpiCard label={t("insurance.coverage")}          value={fmtCurrency(stats.coverage)} palette={money}    icon="💰" />
        <KpiCard label="Quotes requested"                  value={stats.quoted}                palette={customer} icon="📨" />
      </div>

      <Card palette={ai} title="AI recommendations" icon="🧠">
        {visible.length === 0 ? (
          <EmptyState icon="✓" title="All recommendations addressed" palette={ai} />
        ) : (
          visible.map((rec) => (
            <InsuranceComparator key={rec.id} recommendation={rec} onQuote={onQuote} onSkip={onSkip} t={t} />
          ))
        )}
      </Card>

      <style>{`
        @media (max-width: 720px) { .ip-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
