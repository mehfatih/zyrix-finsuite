// ================================================================
// ★ Zyrix B2B Marketplace — peer-to-peer trade
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMarketPalette, getCustomerPalette, getSuccessPalette, getMoneyPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import B2BMatchEngine from "../../../components/dashboard/ecosystem/B2BMatchEngine";
import MarketplaceListingCard from "../../../components/dashboard/ecosystem/MarketplaceListingCard";
import { api, localStore, KEYS, listB2bListings, buildB2bOpportunities, fmtCurrency } from "./ecosystemApi";

export default function B2BMarketplacePage() {
  const t = useDashboardI18n("ecosystem");
  const market = getMarketPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const money = getMoneyPalette();

  const [purchases, setPurchases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [listings, setListings] = useState(listB2bListings());
  const [matches, setMatches] = useState(localStore.list(KEYS.b2bMatches));

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
  }, []);

  const opportunities = useMemo(() => buildB2bOpportunities({ purchases, customers }), [purchases, customers]);
  const handled = new Set(matches.map((m) => m.oppId));
  const visible = opportunities.filter((o) => !handled.has(o.id));

  const stats = {
    network: 234,
    opportunities: visible.length,
    matches: matches.filter((m) => m.action === "act" && new Date(m.at).getMonth() === new Date().getMonth()).length,
    commissioned: matches.length * 1250,
  };

  const onAct = (opp) => {
    const m = localStore.add(KEYS.b2bMatches, { oppId: opp.id, action: "act", at: new Date().toISOString() });
    setMatches((s) => [m, ...s]);
  };
  const onSkip = (opp) => {
    const m = localStore.add(KEYS.b2bMatches, { oppId: opp.id, action: "skip", at: new Date().toISOString() });
    setMatches((s) => [m, ...s]);
  };

  const removeListing = (l) => {
    localStore.remove(KEYS.b2bListings, l.id);
    setListings(localStore.list(KEYS.b2bListings));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("b2b.title")} subtitle={t("b2b.subtitle")} icon="🤝" palette={market} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="b2b-kpis">
        <KpiCard label={t("b2b.kpi.network")}       value={stats.network}                    palette={customer} icon="🌐" />
        <KpiCard label={t("b2b.kpi.opportunities")} value={stats.opportunities}              palette={market}   icon="💡" pulse={stats.opportunities > 0} />
        <KpiCard label={t("b2b.kpi.matches")}       value={stats.matches}                    palette={success}  icon="✓" />
        <KpiCard label={t("b2b.kpi.commissioned")}  value={fmtCurrency(stats.commissioned)}  palette={money}    icon="💰" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }} className="b2b-grid">
        <Card palette={market} title={t("b2b.opp.title")} icon="🧠">
          <B2BMatchEngine opportunities={visible} onAct={onAct} onSkip={onSkip} t={t} />
        </Card>

        <Card
          palette={customer}
          title={t("b2b.listings.title")}
          icon="📦"
          actions={<button type="button" style={{ background: customer.base, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{t("b2b.listings.create")}</button>}
        >
          {listings.length === 0 ? (
            <EmptyState icon="📦" title={t("b2b.listings.empty")} palette={customer} />
          ) : (
            listings.map((l, i) => <MarketplaceListingCard key={l.id} listing={l} idx={i} onRemove={removeListing} t={t} />)
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) { .b2b-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .b2b-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
