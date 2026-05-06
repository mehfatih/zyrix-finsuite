// ================================================================
// Sales Orders — list of open orders + convert-to-invoice action
// (Backend lacks a dedicated /api/orders, so we derive from invoices
// with status=DRAFT|PENDING and surface the workflow in the UI.)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getMoneyPalette,
  getCustomerPalette,
  getMarketPalette,
  getReportsPalette,
  getSuccessPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { api, fmtCurrency, fmtDate } from "./salesApi";

const ORDER_STATUS_MAP = {
  DRAFT:    "OPEN",
  PENDING:  "OPEN",
  SENT:     "SHIPPED",
  VIEWED:   "PARTIAL",
  PAID:     "INVOICED",
  OVERDUE:  "OPEN",
};

export default function SalesOrdersPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const market = getMarketPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/invoices?limit=200").then((res) => {
      const list = res?.data?.invoices || res?.data?.items || res?.data || [];
      const arr = (Array.isArray(list) ? list : []).map((inv) => ({
        ...inv,
        _orderStatus: ORDER_STATUS_MAP[inv.status] || "OPEN",
      }));
      setOrders(arr);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const totalValue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const open = orders.filter((o) => o._orderStatus === "OPEN").length;
    const shipped = orders.filter((o) => o._orderStatus === "SHIPPED").length;
    const invoiced = orders.filter((o) => o._orderStatus === "INVOICED").length;
    return { totalValue, open, shipped, invoiced };
  }, [orders]);

  const convert = async (order) => {
    await api(`/api/invoices/${order.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "SENT" }),
    });
    setOrders((arr) => arr.map((o) => (o.id === order.id ? { ...o, _orderStatus: "INVOICED", status: "SENT" } : o)));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        icon="📦"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => onNavigate && onNavigate("sales-invoice-new")}>
            {t("orders.new")}
          </PageHeaderButton>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="sales-kpi-grid"
      >
        <KpiCard label={t("orders.kpi.open")} value={stats.open} palette={reports} icon="📋" />
        <KpiCard label={t("orders.kpi.shipped")} value={stats.shipped} palette={customer} icon="🚚" />
        <KpiCard label={t("orders.kpi.invoiced")} value={stats.invoiced} palette={success} icon="✅" />
        <KpiCard
          label={t("orders.kpi.value")}
          value={Math.round(stats.totalValue)}
          prefix="₺"
          palette={money}
          icon="💰"
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : orders.length === 0 ? (
        <EmptyState title={t("orders.empty")} icon="📦" palette={market} />
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${market.base}15`,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} className="sales-orders-table">
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("invoices.col.status")}</th>
                <th style={th}>{t("orders.col.number")}</th>
                <th style={th}>{t("invoices.col.customer")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.amount")}</th>
                <th style={th}>{t("invoices.col.due")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: "1px solid #F1F5F9", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = market.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={td}>
                    <InvoiceStatusPill status={o._orderStatus} label={t(`orders.status.${o._orderStatus}`)} />
                  </td>
                  <td style={{ ...td, fontFamily: "monospace", color: market.dark, fontWeight: 700 }}>
                    {o.invoiceNumber || (o.id || "").slice(0, 8)}
                  </td>
                  <td style={td}>{o.customerName || "—"}</td>
                  <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                    {fmtCurrency(o.total, o.currency)}
                  </td>
                  <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(o.dueDate, lang)}</td>
                  <td style={{ ...td, textAlign: "end" }}>
                    {o._orderStatus !== "INVOICED" ? (
                      <button
                        type="button"
                        onClick={() => convert(o)}
                        style={{
                          background: success.bg,
                          color: success.dark,
                          border: `1px solid ${success.base}40`,
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ↻ {t("orders.action.convert")}
                      </button>
                    ) : (
                      <span style={{ color: success.base, fontSize: 12, fontWeight: 700 }}>✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .sales-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sales-orders-table thead { display: none; }
          .sales-orders-table tr { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 10px; border-bottom: 1px solid #F1F5F9; }
          .sales-orders-table td { padding: 4px 6px; }
        }
      `}</style>
    </div>
  );
}

const th = {
  textAlign: "start",
  padding: "12px 14px",
  fontSize: 11,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "12px 14px", color: "#0F172A" };
