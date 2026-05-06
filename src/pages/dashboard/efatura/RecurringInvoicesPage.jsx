// ================================================================
// Recurring Invoices — list + 30-day timeline + KPIs + run/pause actions
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import RecurringScheduleCard from "../../../components/dashboard/efatura/RecurringScheduleCard";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./efaturaApi";

const FREQ_PER_YEAR = { DAILY: 365, WEEKLY: 52, MONTHLY: 12, QUARTERLY: 4, YEARLY: 1 };

function seedIfEmpty() {
  if (localStore.list(KEYS.recurring).length > 0) return;
  const today = Date.now();
  const seeds = [
    { customerName: "Demo Müşteri A.Ş.",  amount: 4500,  currency: "TRY", frequency: "MONTHLY",   dayOfMonth: 1, status: "ACTIVE", autoSend: true,  startDate: new Date(today - 60 * 86400000).toISOString(),  nextRunDate: new Date(today + 5 * 86400000).toISOString(),  template: "Aylık SaaS aboneliği" },
    { customerName: "Acme Yapı Ltd.",     amount: 1200,  currency: "TRY", frequency: "WEEKLY",    status: "ACTIVE", autoSend: true,  startDate: new Date(today - 30 * 86400000).toISOString(),  nextRunDate: new Date(today + 3 * 86400000).toISOString(),  template: "Haftalık servis ücreti" },
    { customerName: "Beta İnşaat",         amount: 18900, currency: "TRY", frequency: "QUARTERLY", status: "ACTIVE", autoSend: false, startDate: new Date(today - 90 * 86400000).toISOString(),  nextRunDate: new Date(today + 21 * 86400000).toISOString(), template: "3-aylık bakım" },
    { customerName: "Alpha Reklamcılık",   amount: 800,   currency: "TRY", frequency: "MONTHLY",   dayOfMonth: 15, status: "PAUSED", autoSend: true,  startDate: new Date(today - 200 * 86400000).toISOString(), nextRunDate: new Date(today + 12 * 86400000).toISOString(), template: "Aylık reklam yönetimi" },
  ];
  seeds.forEach((s) => localStore.add(KEYS.recurring, s));
}

export default function RecurringInvoicesPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [plans, setPlans] = useState([]);

  const reload = () => setPlans(localStore.list(KEYS.recurring));
  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.status === "ACTIVE");
    const monthDue = active.filter((p) => {
      const next = new Date(p.nextRunDate || p.startDate);
      const now = new Date();
      return next.getMonth() === now.getMonth() && next.getFullYear() === now.getFullYear();
    });
    const yearForecast = active.reduce(
      (s, p) => s + (Number(p.amount) || 0) * (FREQ_PER_YEAR[p.frequency || "MONTHLY"] || 12),
      0
    );
    return {
      active: active.length,
      monthDue: monthDue.length,
      yearRuns: active.reduce((s, p) => s + (FREQ_PER_YEAR[p.frequency || "MONTHLY"] || 12), 0),
      yearForecast,
    };
  }, [plans]);

  const update = (id, patch) => {
    localStore.update(KEYS.recurring, id, patch);
    reload();
  };

  const runNow = (plan) => {
    const next = new Date();
    if (plan.frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
    else if (plan.frequency === "WEEKLY") next.setDate(next.getDate() + 7);
    else if (plan.frequency === "DAILY") next.setDate(next.getDate() + 1);
    else if (plan.frequency === "QUARTERLY") next.setMonth(next.getMonth() + 3);
    else if (plan.frequency === "YEARLY") next.setFullYear(next.getFullYear() + 1);
    update(plan.id, { lastRunDate: new Date().toISOString(), nextRunDate: next.toISOString() });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("recurring.title")}
        subtitle={t("recurring.subtitle")}
        icon="🔁"
        palette={customer}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => onNavigate && onNavigate("efatura-recurring-new")}>
            {t("recurring.new")}
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
        <KpiCard label={t("recurring.kpi.active")} value={stats.active} palette={success} icon="🟢" />
        <KpiCard label={t("recurring.kpi.month")} value={stats.monthDue} palette={customer} icon="📆" />
        <KpiCard label={t("recurring.kpi.runs")} value={stats.yearRuns} palette={reports} icon="🔁" />
        <KpiCard label={t("recurring.kpi.forecast")} value={Math.round(stats.yearForecast)} prefix="₺" palette={money} icon="📈" />
      </div>

      <Card palette={customer} title={t("recurring.timeline.title")} icon="🗓️" style={{ marginBottom: 18 }}>
        <RecurringScheduleCard plans={plans} days={30} t={t} lang={lang} />
      </Card>

      {plans.length === 0 ? (
        <EmptyState title={t("recurring.empty")} icon="🔁" palette={customer} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${customer.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: customer.bg, borderBottom: `1.5px solid ${customer.base}20` }}>
                <th style={th}>{t("recurring.col.customer")}</th>
                <th style={th}>{t("recurring.col.frequency")}</th>
                <th style={th}>{t("recurring.col.next")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("recurring.col.amount")}</th>
                <th style={th}>{t("recurring.col.status")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("recurring.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => {
                const palette = p.status === "ACTIVE" ? success : p.status === "PAUSED" ? getPaletteById("amber") : getPaletteById("rose");
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>{p.customerName}</div>
                      {p.template && <div style={{ fontSize: 11, color: "#64748B" }}>{p.template}</div>}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: customer.bg,
                          color: customer.dark,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {t(`recurring.freq.${p.frequency || "MONTHLY"}`)}
                      </span>
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(p.nextRunDate || p.startDate, lang)}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(p.amount, p.currency)}
                    </td>
                    <td style={td}>
                      <InvoiceStatusPill status={p.status} label={t(`recurring.status.${p.status}`)} size="compact" />
                    </td>
                    <td style={{ ...td, textAlign: "end" }}>
                      <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                        {p.status === "ACTIVE" ? (
                          <button type="button" onClick={() => update(p.id, { status: "PAUSED" })} style={btnSm(palette)}>
                            ⏸ {t("recurring.action.pause")}
                          </button>
                        ) : p.status === "PAUSED" ? (
                          <button type="button" onClick={() => update(p.id, { status: "ACTIVE" })} style={btnSm(success)}>
                            ▶ {t("recurring.action.resume")}
                          </button>
                        ) : null}
                        <button type="button" onClick={() => runNow(p)} style={btnSm(brand)}>
                          ▶▶ {t("recurring.action.run")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function btnSm(palette) {
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
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
