// ================================================================
// ★ Customer Self-Service Portals — link manager + brand customizer
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getAlertPalette, getMoneyPalette, getSuccessPalette, getCustomerPalette, getReportsPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import PortalCustomizer from "../../../components/dashboard/voice-cx/PortalCustomizer";
import PortalPreview from "../../../components/dashboard/voice-cx/PortalPreview";
import { api, localStore, KEYS, ensureCustomerPortal, loadPortalBrand, savePortalBrand, portalAnalytics } from "./voiceCxApi";

const FEATURES = [
  { id: "viewInvoices" }, { id: "payOnline" }, { id: "downloadPdf" }, { id: "requestNew" },
  { id: "trackOrders" }, { id: "submitTicket" }, { id: "loyaltyPoints" }, { id: "catalog" },
];

export default function CustomerPortalsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("voice-cx");
  const rose = { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239", chart: "#FB7185" };
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();

  const [customers, setCustomers] = useState([]);
  const [portals, setPortals] = useState([]);
  const [brand, setBrand] = useState(loadPortalBrand());
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPortalId, setSelectedPortalId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    setPortals(localStore.list(KEYS.portals));
  }, []);

  const stats = portalAnalytics();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 30);
    return customers.filter((c) => `${c.companyName || ""} ${c.fullName || ""} ${c.name || ""}`.toLowerCase().includes(q)).slice(0, 30);
  }, [customers, search]);

  const create = (cust) => {
    const p = ensureCustomerPortal(cust);
    setPortals(localStore.list(KEYS.portals));
    setSelectedPortalId(p.id);
  };

  const disable = (portal) => {
    localStore.update(KEYS.portals, portal.id, { enabled: false });
    setPortals(localStore.list(KEYS.portals));
  };

  const copyLink = (portal) => {
    const url = `${window.location.origin}/portal/${portal.slug}`;
    navigator.clipboard?.writeText?.(url).catch(() => {});
    setCopiedId(portal.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onSaveBrand = () => {
    savePortalBrand(brand);
  };

  const onToggleFeature = (id) => {
    setBrand((b) => {
      const has = (b.enabledFeatures || []).includes(id);
      return { ...b, enabledFeatures: has ? b.enabledFeatures.filter((x) => x !== id) : [...(b.enabledFeatures || []), id] };
    });
  };

  const previewPortal = portals.find((p) => p.id === selectedPortalId) || portals[0];
  const previewCust = previewPortal ? (customers.find((c) => String(c.id) === String(previewPortal.customerId)) || { name: previewPortal.customerName }) : null;
  const previewInvs = previewPortal ? invoices.filter((i) => String(i.customerId) === String(previewPortal.customerId)) : [];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("portals.title")} subtitle={t("portals.subtitle")} icon="🪟" palette={rose} />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="cp-kpis"
      >
        <KpiCard label={t("portals.kpi.created")}        value={stats.created}              palette={rose}     icon="🪟" />
        <KpiCard label={t("portals.kpi.views")}          value={stats.views}                palette={reports}  icon="👁" />
        <KpiCard label={t("portals.kpi.ticketsReduced")} value={`-${stats.ticketsReducedPct}%`} palette={success} icon="🎉" />
        <KpiCard label={t("portals.kpi.payments")}       value={stats.payments}             palette={money}    icon="💳" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 16 }} className="cp-grid">
        <div>
          <PortalCustomizer
            brand={brand}
            onChange={setBrand}
            onSave={onSaveBrand}
            onPreview={() => setShowPreview((v) => !v)}
            features={FEATURES}
            enabledFeatures={brand.enabledFeatures || []}
            onToggleFeature={onToggleFeature}
            t={t}
          />

          <div style={{ marginTop: 16 }}>
            <Card palette={customer} title={t("portals.list.title")} icon="🧾">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("portals.list.search")}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }}
              />
              {filtered.length === 0 && (
                <EmptyState icon="🔍" title={t("portals.list.empty")} palette={customer} />
              )}
              <div style={{ maxHeight: 360, overflowY: "auto", marginInlineEnd: -6, paddingInlineEnd: 6 }}>
                {filtered.map((c) => {
                  const portal = portals.find((p) => String(p.customerId) === String(c.id));
                  return (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #F1F5F9" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                          {c.companyName || c.fullName || c.name || "—"}
                        </div>
                        {portal && (
                          <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "monospace", marginTop: 2 }}>
                            /portal/{portal.slug}
                          </div>
                        )}
                      </div>
                      {portal ? (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => { setSelectedPortalId(portal.id); setShowPreview(true); }} style={smBtn(customer)}>{t("portals.actions.open")}</button>
                          <button type="button" onClick={() => copyLink(portal)} style={smBtn(success)}>
                            {copiedId === portal.id ? t("portals.actions.copied") : t("portals.actions.copy")}
                          </button>
                          <button type="button" onClick={() => disable(portal)} style={smBtn(getAlertPalette(), "ghost")}>{t("portals.actions.disable")}</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => create(c)} style={smBtn(rose, "primary")}>+ {t("portals.actions.create")}</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <div>
          {showPreview && previewPortal && previewCust && (
            <Card palette={rose} title={t("common.preview")} icon="📱">
              <PortalPreview brand={brand} customer={previewCust} invoices={previewInvs} t={t} />
            </Card>
          )}
          {!showPreview && (
            <Card palette={rose} title={t("common.preview")} icon="📱">
              <PortalPreview brand={brand} customer={{ companyName: "Levana İlaç", name: "Ahmed Yıldız" }} invoices={invoices.slice(0, 4)} t={t} />
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .cp-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .cp-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}

function smBtn(palette, variant = "secondary") {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  if (variant === "ghost") {
    return {
      background: "transparent", color: palette.dark, border: `1px solid ${palette.base}30`,
      padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
    };
  }
  return {
    background: palette.bg, color: palette.dark, border: `1px solid ${palette.base}40`,
    padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
  };
}
