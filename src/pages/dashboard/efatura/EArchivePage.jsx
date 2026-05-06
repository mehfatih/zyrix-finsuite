// ================================================================
// e-Arşiv — B2C archive list (no GİB submission)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getReportsPalette,
  getMoneyPalette,
  getBrandPalette,
  getCustomerPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./efaturaApi";

export default function EArchivePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const customer = getCustomerPalette();

  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(localStore.list(KEYS.archive));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = items.filter((i) => {
      const d = new Date(i.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: items.length,
      month: thisMonth.length,
      value: items.reduce((s, i) => s + Number(i.total || 0), 0),
    };
  }, [items]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("archive.title")}
        subtitle={t("archive.subtitle")}
        icon="📦"
        palette={reports}
        actions={
          <PageHeaderButton
            palette={brand}
            variant="primary"
            icon="＋"
            onClick={() => onNavigate && onNavigate("efatura-archive-new")}
          >
            {t("archive.new")}
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
        className="ef-kpi-grid"
      >
        <KpiCard label={t("archive.kpi.total")} value={stats.total} palette={reports} icon="📦" />
        <KpiCard label={t("archive.kpi.month")} value={stats.month} palette={customer} icon="📆" />
        <KpiCard label={t("archive.kpi.value")} value={Math.round(stats.value)} prefix="₺" palette={money} icon="💰" />
      </div>

      {items.length === 0 ? (
        <EmptyState title={t("archive.empty")} icon="📦" palette={reports} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${reports.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: reports.bg, borderBottom: `1.5px solid ${reports.base}20` }}>
                <th style={th}>{t("outgoing.col.serial")}</th>
                <th style={th}>{t("outgoing.col.customer")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("outgoing.col.amount")}</th>
                <th style={th}>Date</th>
                <th style={th}>{t("outgoing.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => onNavigate && onNavigate("efatura-archive-detail", { id: inv.id })}
                  style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = reports.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...td, fontFamily: "monospace", color: reports.dark, fontWeight: 700 }}>{inv.serial}</td>
                  <td style={td}>{inv.customerName}</td>
                  <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                    {fmtCurrency(inv.total, inv.currency)}
                  </td>
                  <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(inv.createdAt, lang)}</td>
                  <td style={td}>
                    <InvoiceStatusPill status={inv.status} label={t(`outgoing.status.${inv.status}`)} size="compact" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
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
