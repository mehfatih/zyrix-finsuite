// ================================================================
// ★ Marketplace Intelligence Network — anonymized peer benchmarks
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getPaletteById, getAIPalette, getCustomerPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import PeerBenchmarkScatter from "../../../components/dashboard/ecosystem/PeerBenchmarkScatter";
import { api, buildPeerBenchmarks } from "./ecosystemApi";

export default function NetworkIntelligencePage() {
  const t = useDashboardI18n("ecosystem");
  const cyan = getPaletteById("cyan");
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
  }, []);

  const data = useMemo(() => buildPeerBenchmarks({ invoices, customers }), [invoices, customers]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("network.title")} subtitle={t("network.subtitle")} icon="📡" palette={cyan} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }} className="ni-kpis">
        <KpiCard label={t("network.kpi.peers")}    value={data.peerCount}     palette={cyan}     icon="🌐" />
        <KpiCard label={t("network.kpi.industry")} value="F&B / Retail"        palette={customer} icon="🏷" />
        <KpiCard label={t("network.kpi.location")} value="İstanbul"            palette={ai}       icon="📍" />
        <KpiCard label={t("network.kpi.size")}     value="SMB"                 palette={success}  icon="🏢" />
      </div>

      <Card palette={cyan} title="You vs peers (anonymized)" icon="📊">
        <PeerBenchmarkScatter metrics={data.metrics} t={t} />
        <div style={{ marginTop: 10, fontSize: 10, color: "#94A3B8", textAlign: "center" }}>
          {t("network.privacy")}
        </div>
      </Card>

      <style>{`@media (max-width: 720px) { .ni-kpis { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
