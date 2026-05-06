// ================================================================
// Sales Invoices List — KPI row + funnel chart + filterable table
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { api, fmtCurrency, fmtDate, daysBetween } from "./salesApi";

export default function SalesInvoicesListPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let live = true;
    api("/api/invoices?limit=200").then((res) => {
      if (!live) return;
      const list = res?.data?.invoices || res?.data?.items || res?.data || [];
      setInvoices(Array.isArray(list) ? list : []);
      setLoading(false);
    });
    return () => { live = false; };
  }, []);

  const enriched = useMemo(
    () =>
      invoices.map((inv) => ({
        ...inv,
        _status:
          inv.status ||
          (inv.dueDate && new Date(inv.dueDate) < new Date() ? "OVERDUE" : "DRAFT"),
      })),
    [invoices]
  );

  const totals = useMemo(() => {
    const sum = (arr) => arr.reduce((s, i) => s + Number(i.total || 0), 0);
    const total = sum(enriched);
    const paid = sum(enriched.filter((i) => i._status === "PAID"));
    const overdue = sum(enriched.filter((i) => i._status === "OVERDUE"));
    const draft = sum(enriched.filter((i) => i._status === "DRAFT"));
    return { total, paid, overdue, draft };
  }, [enriched]);

  const funnel = useMemo(() => {
    const stages = ["DRAFT", "SENT", "VIEWED", "PAID"];
    return stages.map((stage) => ({
      stage,
      count: enriched.filter((i) => i._status === stage).length,
    }));
  }, [enriched]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (filter !== "ALL") list = list.filter((i) => i._status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          String(i.customerName || "").toLowerCase().includes(q) ||
          String(i.invoiceNumber || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, filter, search]);

  const filters = ["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("invoices.title")}
        subtitle={t("invoices.subtitle")}
        icon="🧾"
        palette={brand}
        actions={
          <>
            <PageHeaderButton
              palette={brand}
              variant="primary"
              icon="＋"
              onClick={() => onNavigate && onNavigate("sales-invoice-new")}
            >
              {t("invoices.new")}
            </PageHeaderButton>
            <PageHeaderButton palette={brand} variant="secondary" icon="⤓">
              {t("invoices.export")}
            </PageHeaderButton>
          </>
        }
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="sales-kpi-grid"
      >
        <KpiCard
          label={t("invoices.kpi.total")}
          value={Math.round(totals.total)}
          prefix="₺"
          palette={money}
          icon="💰"
          spark={[totals.total * 0.6, totals.total * 0.7, totals.total * 0.85, totals.total]}
        />
        <KpiCard
          label={t("invoices.kpi.paid")}
          value={Math.round(totals.paid)}
          prefix="₺"
          palette={success}
          icon="✅"
        />
        <KpiCard
          label={t("invoices.kpi.overdue")}
          value={Math.round(totals.overdue)}
          prefix="₺"
          palette={alert}
          icon="⚠️"
          pulse={totals.overdue > 0}
        />
        <KpiCard
          label={t("invoices.kpi.draft")}
          value={Math.round(totals.draft)}
          prefix="₺"
          palette={warn}
          icon="📝"
        />
      </div>

      {/* Sales funnel */}
      <Card palette={customer} title={t("invoices.funnel.title")} subtitle={t("invoices.funnel.subtitle")} icon="📊" style={{ marginBottom: 18 }}>
        <SalesFunnel data={funnel} palette={customer} t={t} />
      </Card>

      {/* Filter pills + search */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${brand.base}15`,
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {filters.map((f) => {
            const active = filter === f;
            const p = f === "ALL" ? brand : getPaletteById(
              { DRAFT: "amber", SENT: "cyan", PAID: "emerald", OVERDUE: "rose" }[f] || "indigo"
            );
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: active ? `2px solid ${p.base}` : `1px solid ${p.base}30`,
                  background: active ? p.base : `${p.base}10`,
                  color: active ? "#fff" : p.dark,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {f === "ALL" ? t("invoices.filter.all") : t(`invoices.status.${f}`)}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("invoices.search")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${brand.base}25`,
            background: "#fff",
            fontSize: 13,
            minWidth: 220,
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("invoices.empty")}
          icon="🧾"
          palette={brand}
          action={
            <PageHeaderButton palette={brand} variant="primary" onClick={() => onNavigate && onNavigate("sales-invoice-new")}>
              {t("invoices.new")}
            </PageHeaderButton>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div
            className="sales-table-desktop"
            style={{
              background: "#fff",
              borderRadius: 16,
              border: `1px solid ${brand.base}15`,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: brand.bg, borderBottom: `1.5px solid ${brand.base}20` }}>
                  <th style={th}>{t("invoices.col.status")}</th>
                  <th style={th}>{t("invoices.col.number")}</th>
                  <th style={th}>{t("invoices.col.customer")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.amount")}</th>
                  <th style={th}>{t("invoices.col.due")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate && onNavigate("sales-invoice-detail", { id: inv.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = brand.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <InvoiceStatusPill status={inv._status} label={t(`invoices.status.${inv._status}`)} />
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", fontWeight: 700, color: brand.dark }}>
                      {inv.invoiceNumber || (inv.id || "").slice(0, 8)}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: `${customer.base}25`,
                            color: customer.dark,
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                        >
                          {(inv.customerName || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ color: "#0F172A", fontWeight: 600 }}>{inv.customerName || "—"}</span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(inv.total, inv.currency)}
                    </td>
                    <td style={td}>
                      <DueLabel due={inv.dueDate} status={inv._status} lang={lang} />
                    </td>
                    <td style={{ ...td, textAlign: "end" }}>
                      <span style={{ fontSize: 16, color: "#94A3B8" }}>›</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sales-table-mobile" style={{ display: "none" }}>
            {filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onNavigate && onNavigate("sales-invoice-detail", { id: inv.id })}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: `1px solid ${brand.base}20`,
                  padding: 14,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <InvoiceStatusPill status={inv._status} label={t(`invoices.status.${inv._status}`)} />
                  <span style={{ fontFamily: "monospace", color: brand.dark, fontWeight: 700, fontSize: 12 }}>
                    {inv.invoiceNumber || (inv.id || "").slice(0, 8)}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>
                  {inv.customerName || "—"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B" }}>
                  <DueLabel due={inv.dueDate} status={inv._status} lang={lang} />
                  <span style={{ fontFamily: "monospace", color: money.dark, fontWeight: 700 }}>
                    {fmtCurrency(inv.total, inv.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 720px) {
          .sales-table-desktop { display: none; }
          .sales-table-mobile { display: block !important; }
          .sales-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function DueLabel({ due, status, lang }) {
  if (!due) return <span style={{ color: "#94A3B8" }}>—</span>;
  const days = daysBetween(due);
  const overdue = days > 0 && status !== "PAID";
  return (
    <span style={{ color: overdue ? "#9F1239" : "#475569", fontWeight: overdue ? 700 : 500, fontSize: 12 }}>
      {fmtDate(due, lang)}
      {overdue && <span style={{ marginInlineStart: 6 }}>⚡ +{days}d</span>}
    </span>
  );
}

function SalesFunnel({ data, palette, t }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ minWidth: 100, fontSize: 12, fontWeight: 700, color: palette.dark }}>
              {t(`invoices.status.${d.stage}`)}
            </span>
            <div style={{ flex: 1, height: 28, background: palette.bg, borderRadius: 6, overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
                  borderRadius: 6,
                  transition: "width .6s ease",
                  display: "flex",
                  alignItems: "center",
                  paddingInlineStart: 10,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 28,
                }}
              >
                {d.count}
              </div>
            </div>
          </div>
        );
      })}
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
