// ================================================================
// Customers List — KPI cards + smart table with revenue mini-bars
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getBrandPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { api, fmtCurrency, fmtDate, daysBetween } from "./salesApi";

export default function CustomersListPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api("/api/customers"), api("/api/invoices?limit=500")]).then(([cRes, iRes]) => {
      const cs = cRes?.data?.customers || cRes?.data?.items || cRes?.data || [];
      const is = iRes?.data?.invoices || iRes?.data?.items || iRes?.data || [];
      setCustomers(Array.isArray(cs) ? cs : []);
      setInvoices(Array.isArray(is) ? is : []);
      setLoading(false);
    });
  }, []);

  const enriched = useMemo(() => {
    const byCustomer = {};
    invoices.forEach((inv) => {
      const key = inv.customerId || inv.customerName;
      if (!key) return;
      const total = Number(inv.total) || 0;
      if (!byCustomer[key]) byCustomer[key] = { total: 0, count: 0, last: null, paid: 0 };
      byCustomer[key].total += total;
      byCustomer[key].count += 1;
      const date = inv.createdAt ? new Date(inv.createdAt) : null;
      if (date && (!byCustomer[key].last || date > byCustomer[key].last)) byCustomer[key].last = date;
      if (inv.status === "PAID") byCustomer[key].paid += total;
    });
    return customers.map((c) => {
      const key = c.id || c.name;
      const stats = byCustomer[key] || { total: 0, count: 0, last: null };
      const lastDays = stats.last ? daysBetween(stats.last) : 999;
      const status =
        lastDays < 60 ? "ACTIVE"
        : lastDays > 90 ? "AT_RISK"
        : daysBetween(c.createdAt) < 30 ? "NEW"
        : "INACTIVE";
      return { ...c, _revenue: stats.total, _invoiceCount: stats.count, _lastPurchase: stats.last, _status: status };
    });
  }, [customers, invoices]);

  const stats = useMemo(() => {
    const newCount = enriched.filter((c) => c._status === "NEW").length;
    const active = enriched.filter((c) => c._status === "ACTIVE").length;
    const atRisk = enriched.filter((c) => c._status === "AT_RISK").length;
    return { total: enriched.length, newCount, active, atRisk };
  }, [enriched]);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(
      (c) =>
        String(c.name || "").toLowerCase().includes(q) ||
        String(c.email || "").toLowerCase().includes(q) ||
        String(c.taxId || "").toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const maxRev = useMemo(() => Math.max(1, ...enriched.map((c) => c._revenue)), [enriched]);
  const palettes = paletteSequence(filtered.length, { exclude: ["wine"] });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        icon="👥"
        palette={customer}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋">
            {t("customers.new")}
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
        <KpiCard label={t("customers.kpi.total")} value={stats.total} palette={customer} icon="👥" />
        <KpiCard label={t("customers.kpi.new")} value={stats.newCount} palette={success} icon="✨" trend={stats.newCount > 0 ? `+${stats.newCount}` : null} />
        <KpiCard label={t("customers.kpi.active")} value={stats.active} palette={money} icon="💼" />
        <KpiCard label={t("customers.kpi.atrisk")} value={stats.atRisk} palette={alert} icon="⚠️" pulse={stats.atRisk > 0} />
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${customer.base}15`,
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t("invoices.search")}…`}
          style={{
            flex: 1,
            minWidth: 220,
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${customer.base}25`,
            background: "#fff",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("customers.empty")} icon="👥" palette={customer} />
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${customer.base}15`,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} className="sales-customer-table">
            <thead>
              <tr style={{ background: customer.bg, borderBottom: `1.5px solid ${customer.base}20` }}>
                <th style={th}>{t("customers.col.name")}</th>
                <th style={th}>{t("customers.col.taxid")}</th>
                <th style={{ ...th, minWidth: 220 }}>{t("customers.col.revenue")}</th>
                <th style={th}>{t("customers.col.lastpurchase")}</th>
                <th style={th}>{t("customers.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const palette = palettes[i] || customer;
                const revWidth = (c._revenue / maxRev) * 100;
                return (
                  <tr
                    key={c.id || i}
                    onClick={() => onNavigate && onNavigate("sales-customer-detail", { id: c.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = customer.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: palette.base,
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {(c.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{c.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{c.email || c.phone || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: "#64748B", fontSize: 12 }}>{c.taxId || "—"}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: `${palette.base}15`,
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.max(2, revWidth)}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
                              transition: "width .8s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: money.dark, fontSize: 12, minWidth: 80, textAlign: "end" }}>
                          {fmtCurrency(c._revenue)}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>
                      {c._lastPurchase ? fmtDate(c._lastPurchase, lang) : "—"}
                    </td>
                    <td style={td}>
                      <InvoiceStatusPill status={c._status} label={t(`customers.status.${c._status}`)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .sales-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sales-customer-table thead { display: none; }
          .sales-customer-table tr { display: grid; grid-template-columns: 1fr; gap: 4px; padding: 12px; }
          .sales-customer-table td { padding: 4px 0; }
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
const td = { padding: "12px 14px" };
