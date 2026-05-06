// ================================================================
// Outgoing e-Faturas — list + GİB status flow + KPIs
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getWarningPalette,
  getCustomerPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import EFaturaStatusFlow from "../../../components/dashboard/efatura/EFaturaStatusFlow";
import { api, localStore, KEYS, fmtCurrency, fmtDate } from "./efaturaApi";

function seedIfEmpty() {
  if (localStore.list(KEYS.outgoing).length > 0) return;
  const today = Date.now();
  const seeds = [
    { serial: "ZYR2026000000001", customerName: "Demo Müşteri A.Ş.",   total: 12500, currency: "TRY", status: "ACKNOWLEDGED", createdAt: new Date(today - 5 * 86400000).toISOString(),  signedAt: new Date(today - 5 * 86400000 + 3600000).toISOString(), submittedAt: new Date(today - 5 * 86400000 + 7200000).toISOString() },
    { serial: "ZYR2026000000002", customerName: "Acme Yapı Ltd.",      total: 4800,  currency: "TRY", status: "SUBMITTED",    createdAt: new Date(today - 3 * 86400000).toISOString(),  signedAt: new Date(today - 3 * 86400000 + 1800000).toISOString(), submittedAt: new Date(today - 3 * 86400000 + 3600000).toISOString() },
    { serial: "ZYR2026000000003", customerName: "Yeni Müşteri Tic.",   total: 2150,  currency: "TRY", status: "SIGNED",       createdAt: new Date(today - 1 * 86400000).toISOString(),  signedAt: new Date(today - 1 * 86400000 + 600000).toISOString() },
    { serial: "ZYR2026000000004", customerName: "Beta İnşaat",          total: 18900, currency: "TRY", status: "DRAFT",        createdAt: new Date(today - 86400000 / 4).toISOString() },
  ];
  seeds.forEach((s) => localStore.add(KEYS.outgoing, s));
}

export default function OutgoingEFaturasPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();

  const [items, setItems] = useState([]);

  useEffect(() => {
    seedIfEmpty();
    setItems(localStore.list(KEYS.outgoing));
  }, []);

  const counts = useMemo(() => {
    const m = {};
    items.forEach((i) => {
      m[i.status] = (m[i.status] || 0) + 1;
    });
    if (m.ACKNOWLEDGED) m.RECEIVED = (m.RECEIVED || 0) + m.ACKNOWLEDGED;
    return m;
  }, [items]);

  const stats = useMemo(() => ({
    draft: items.filter((i) => i.status === "DRAFT").length,
    signed: items.filter((i) => i.status === "SIGNED").length,
    submitted: items.filter((i) => i.status === "SUBMITTED").length,
    received: items.filter((i) => i.status === "RECEIVED" || i.status === "ACKNOWLEDGED").length,
  }), [items]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("outgoing.title")}
        subtitle={t("outgoing.subtitle")}
        icon="📤"
        palette={brand}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => onNavigate && onNavigate("efatura-new")}>
            {t("outgoing.new")}
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
        <KpiCard label={t("outgoing.kpi.draft")} value={stats.draft} palette={warn} icon="📝" />
        <KpiCard label={t("outgoing.kpi.signed")} value={stats.signed} palette={customer} icon="✍️" />
        <KpiCard label={t("outgoing.kpi.submitted")} value={stats.submitted} palette={reports} icon="📤" pulse={stats.submitted > 0} />
        <KpiCard label={t("outgoing.kpi.received")} value={stats.received} palette={success} icon="✅" />
      </div>

      <Card palette={brand} title={t("outgoing.flow.title")} icon="🔁" style={{ marginBottom: 18 }}>
        <EFaturaStatusFlow counts={counts} currentStatus={items[0]?.status} lang={lang} t={t} />
      </Card>

      {items.length === 0 ? (
        <EmptyState title={t("outgoing.empty")} icon="📤" palette={brand} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${brand.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: brand.bg, borderBottom: `1.5px solid ${brand.base}20` }}>
                <th style={th}>{t("outgoing.col.status")}</th>
                <th style={th}>{t("outgoing.col.serial")}</th>
                <th style={th}>{t("outgoing.col.customer")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("outgoing.col.amount")}</th>
                <th style={th}>Date</th>
                <th style={{ ...th, textAlign: "end" }}>{t("outgoing.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => {
                const palette = getPaletteById(
                  { DRAFT: "amber", SIGNED: "indigo", SUBMITTED: "cyan", RECEIVED: "emerald", ACKNOWLEDGED: "teal", CANCELLED: "rose", REJECTED: "rose" }[inv.status] || "indigo"
                );
                return (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate && onNavigate("efatura-detail", { id: inv.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = brand.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <InvoiceStatusPill status={inv.status} label={t(`outgoing.status.${inv.status}`)} />
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: palette.dark, fontWeight: 700, fontSize: 12 }}>{inv.serial}</td>
                    <td style={td}>{inv.customerName}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(inv.total, inv.currency)}
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(inv.createdAt, lang)}</td>
                    <td style={{ ...td, textAlign: "end" }}>
                      <span style={{ fontSize: 16, color: "#94A3B8" }}>›</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
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
