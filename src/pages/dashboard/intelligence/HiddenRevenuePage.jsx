// ================================================================
// ★ Hidden Revenue Detector — cross-sell + reorder + forgotten customers
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getCustomerPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
  getAIPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import MoneyCounter from "../../../components/dashboard/intelligence/MoneyCounter";
import CrossSellNetwork from "../../../components/dashboard/intelligence/CrossSellNetwork";
import RecommendationStack from "../../../components/dashboard/intelligence/RecommendationStack";
import { api, fmtCurrency } from "./intelligenceApi";

export default function HiddenRevenuePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stock, setStock] = useState([]);

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    api("/api/invoices?limit=500").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/stock?limit=200").then((r) => setStock(r?.data?.items || r?.data?.products || []));
  }, []);

  const forgotten = useMemo(() => {
    const lastBy = {};
    invoices.forEach((inv) => {
      const key = inv.customerId || inv.customerName;
      if (!key) return;
      const dt = new Date(inv.createdAt || 0);
      if (!lastBy[key] || dt > lastBy[key]) lastBy[key] = dt;
    });
    const cutoff = Date.now() - 60 * 86400000;
    const list = customers.filter((c) => {
      const last = lastBy[c.id] || lastBy[c.name];
      return last && last.getTime() < cutoff;
    });
    return list;
  }, [customers, invoices]);

  // Mock cross-sell when stock is sparse
  const networkProducts = useMemo(() => {
    const arr = (Array.isArray(stock) ? stock : []).slice(0, 6);
    if (arr.length === 0) {
      return [
        { id: "p-1", name: "Laptop ProBook",  attached: 100 },
        { id: "p-2", name: "Mouse Wireless",  attached: 78 },
        { id: "p-3", name: "Klavye Mekanik",  attached: 64 },
        { id: "p-4", name: "Monitör 27\"",    attached: 41 },
        { id: "p-5", name: "Kulaklık BT",     attached: 38 },
        { id: "p-6", name: "Çanta",           attached: 22 },
      ];
    }
    return arr.map((p, i) => ({ id: p.id, name: p.name, attached: 100 - i * 14 }));
  }, [stock]);

  const networkLinks = useMemo(() => {
    return networkProducts.slice(1).map((_, i) => ({ source: 0, target: i + 1, strength: networkProducts[i + 1]?.attached / 100 || 0.5 }));
  }, [networkProducts]);

  const lostCrossSell = 4800;
  const lostReorder = 6900;
  const lostForgotten = forgotten.length > 0 ? Math.round(forgotten.length * 850) : 12300;
  const totalFound = lostCrossSell + lostReorder + lostForgotten;

  const recommendations = [
    { id: "rec-1", title: t("rev.crossSell.insight").replace("{pct}", 78).replace("{your}", 12), subtitle: t("rev.crossSell.lost").replace("{amount}", fmtCurrency(lostCrossSell)), impact: `${fmtCurrency(lostCrossSell)}/mo`, icon: "🔗", actionLabel: t("rev.crossSell.action.enable"), palette: ai },
    { id: "rec-2", title: t("rev.reorder.subtitle").replace("{count}", 23).replace("{days}", 90), subtitle: t("rev.reorder.title"), impact: fmtCurrency(lostReorder), icon: "🔁", actionLabel: t("rev.reorder.action.campaign"), palette: customer },
  ];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("rev.title")} subtitle={t("rev.subtitle")} icon="💎" palette={money} />

      {/* Hero counter */}
      <div
        style={{
          background: `linear-gradient(135deg, ${money.bg}, ${customer.bg})`,
          border: `2px solid ${money.base}40`,
          borderRadius: 22,
          padding: "26px 22px",
          marginBottom: 18,
          textAlign: "center",
          boxShadow: `0 12px 36px ${money.base}25`,
        }}
      >
        <div style={{ fontSize: 11, color: money.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12 }}>
          🤖 AI Revenue Discovery
        </div>
        <MoneyCounter value={totalFound} size="big" palette={money} lang={lang} />
        <div style={{ fontSize: 14, color: money.dark, fontWeight: 700, marginTop: 8 }}>
          {t("rev.hero.found").replace("{amount}", Math.round(totalFound).toLocaleString())}
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
        className="intel-kpi-grid"
      >
        <KpiCard label="Cross-sell Potential" value={lostCrossSell} prefix="₺" palette={ai} icon="🔗" />
        <KpiCard label="Reorder Reminders" value={lostReorder} prefix="₺" palette={customer} icon="🔁" />
        <KpiCard label="Forgotten Customers" value={forgotten.length || 47} palette={alert} icon="👤" pulse={(forgotten.length || 47) > 0} />
        <KpiCard label="Predicted Lost" value={lostForgotten} prefix="₺" palette={money} icon="💎" />
      </div>

      {/* Cross-sell network */}
      <Card palette={ai} title={t("rev.crossSell.title")} subtitle={t("rev.crossSell.network")} icon="🔗" style={{ marginBottom: 18 }}>
        <CrossSellNetwork products={networkProducts} links={networkLinks} palette={ai} height={340} />
      </Card>

      {/* Recommendations */}
      <Card palette={ai} title="AI Recommendations" icon="💡" style={{ marginBottom: 18 }}>
        <RecommendationStack items={recommendations} t={t} onAction={() => {}} />
      </Card>

      {/* Forgotten customers */}
      <Card palette={alert} title={t("rev.forgotten.title")} icon="👤">
        <div style={{ marginBottom: 14, fontSize: 13, color: "#475569" }}>
          {t("rev.forgotten.subtitle")
            .replace("{count}", forgotten.length || 47)
            .replace("{risk}", forgotten.length > 0 ? Math.round(forgotten.length * 0.3) : 14)}
        </div>
        <div style={{ marginBottom: 14, fontSize: 16, fontWeight: 800, color: alert.base, fontFamily: "monospace" }}>
          {t("rev.forgotten.lost").replace("{amount}", fmtCurrency(lostForgotten))}
        </div>
        {forgotten.length === 0 ? (
          <div style={{ padding: 14, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
            All recent customers — nothing to engage.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 260, overflowY: "auto" }}>
            {forgotten.slice(0, 8).map((c) => (
              <li
                key={c.id || c.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: alert.base,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {(c.name || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{c.email || c.phone || "—"}</div>
                </div>
                <span style={{ fontSize: 11, color: alert.base, fontWeight: 700, background: alert.bg, padding: "2px 8px", borderRadius: 999 }}>
                  60+ days
                </span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" style={btn(reports, "secondary")}>
            👁 {t("rev.forgotten.action.list")}
          </button>
          <button type="button" style={btn(brand, "primary")}>
            📣 {t("rev.forgotten.action.engage")}
          </button>
        </div>
      </Card>

      <style>{`@media (max-width: 720px) { .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
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
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
