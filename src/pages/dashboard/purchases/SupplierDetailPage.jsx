// ================================================================
// Supplier Detail (360°) — hero + spend gauge + trend + items + invoices
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import { Gauge, AreaChart, Treemap } from "../../../components/dashboard/charts";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, api, fmtCurrency, fmtDate } from "./purchasesApi";

export default function SupplierDetailPage({ supplierId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [supplier, setSupplier] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    if (!supplierId) return;
    setSupplier(localStore.get(KEYS.suppliers, supplierId));
    const all = localStore.list(KEYS.purchases);
    setInvoices(all.filter((inv) => inv.supplierId === supplierId || inv.supplierName === localStore.get(KEYS.suppliers, supplierId)?.name));
    api("/api/stock?limit=100").then((res) => {
      const list = res?.data?.items || [];
      setStockItems(Array.isArray(list) ? list.slice(0, 10) : []);
    });
  }, [supplierId]);

  const totals = useMemo(() => {
    const spend = invoices.reduce((s, i) => s + Number(i.total || 0), 0);
    const count = invoices.length;
    const avgDays = count > 0 ? Math.round(invoices.reduce((s, i) => s + (i.dueDate && i.paidDate ? Math.abs(new Date(i.paidDate) - new Date(i.dueDate)) / 86400000 : 0), 0) / count) : 0;
    return { spend, count, avgDays };
  }, [invoices]);

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = d.toISOString().slice(0, 7);
      return { key, label: d.toLocaleString(undefined, { month: "short" }), value: 0 };
    });
    invoices.forEach((inv) => {
      const k = String(inv.createdAt || "").slice(0, 7);
      const b = buckets.find((x) => x.key === k);
      if (b) b.value += Number(inv.total || 0);
    });
    return buckets;
  }, [invoices]);

  const treemapData = useMemo(() => {
    const palettes = paletteSequence(stockItems.length, { exclude: ["wine"] });
    return stockItems.map((it, i) => ({
      label: it.name,
      value: Number(it.quantity || 0) * Number(it.costPrice || 0) || 1,
      color: palettes[i].base,
    }));
  }, [stockItems]);

  if (!supplier) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={supplier.name}
        subtitle={supplier.category}
        icon="🏭"
        palette={market}
        breadcrumb={[
          { label: t("suppliers.title"), href: "#purch-suppliers" },
          { label: supplier.name },
        ]}
        actions={
          <PageHeaderButton palette={market} variant="ghost" onClick={() => onNavigate && onNavigate("purch-suppliers")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${market.bg}, ${reports.bg})`,
          border: `1px solid ${market.base}25`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
          animation: "heroIn .6s ease",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${market.base}, ${market.dark})`,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: `0 8px 24px ${market.base}40`,
          }}
        >
          {(supplier.name || "?")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{supplier.name}</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            {supplier.category && <span>📦 {supplier.category}</span>}
            {supplier.taxId && <span> · VKN {supplier.taxId}</span>}
            {supplier.email && <span> · {supplier.email}</span>}
            {supplier.phone && <span> · {supplier.phone}</span>}
          </div>
        </div>
        <PageHeaderButton palette={brand} variant="primary" icon="📤">
          {t("supplier.detail.send.po")}
        </PageHeaderButton>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="purch-kpi-grid"
      >
        <Card palette={money} title={t("supplier.kpi.total")} icon="💰">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Gauge value={Math.min(100, (totals.spend / 100000) * 100)} palette={money} width={150} height={90} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
                {fmtCurrency(totals.spend)}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>lifetime spend</div>
            </div>
          </div>
        </Card>
        <Card palette={reports} title={t("supplier.kpi.invoices")} icon="📄">
          <div style={{ fontSize: 30, fontWeight: 900, color: reports.base, fontFamily: "monospace" }}>{totals.count}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>received</div>
        </Card>
        <Card palette={success} title={t("supplier.kpi.avgday")} icon="⏱️">
          <div style={{ fontSize: 30, fontWeight: 900, color: success.base, fontFamily: "monospace" }}>{totals.avgDays}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>days from due to pay</div>
        </Card>
      </div>

      {/* Spend trend */}
      <Card palette={market} title={t("supplier.spend.title")} icon="📈" style={{ marginBottom: 18 }}>
        <AreaChart data={monthly} palette={market} height={180} />
      </Card>

      {/* Items + Invoice history */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 18 }} className="purch-detail-grid">
        <Card palette={reports} title={t("supplier.products.title")} icon="📦">
          {treemapData.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
          ) : (
            <Treemap data={treemapData} palette={reports} height={220} />
          )}
        </Card>

        <Card palette={market} title={t("supplier.invoices.title")} icon="🧾">
          {invoices.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: market.bg }}>
                    <th style={th}>#</th>
                    <th style={th}>Date</th>
                    <th style={{ ...th, textAlign: "end" }}>Amount</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                      onClick={() => onNavigate && onNavigate("purch-invoice-detail", { id: inv.id })}
                    >
                      <td style={{ ...td, fontFamily: "monospace", color: market.dark, fontWeight: 700 }}>{inv.number}</td>
                      <td style={{ ...td, color: "#64748B" }}>{fmtDate(inv.createdAt, lang)}</td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                        {fmtCurrency(inv.total, inv.currency)}
                      </td>
                      <td style={td}>
                        <InvoiceStatusPill status={inv.status} label={t(`invoices.status.${inv.status}`)} size="compact" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @keyframes heroIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 880px) {
          .purch-detail-grid { grid-template-columns: 1fr !important; }
          .purch-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const th = {
  textAlign: "start",
  padding: "8px 10px",
  fontSize: 10,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "8px 10px" };
