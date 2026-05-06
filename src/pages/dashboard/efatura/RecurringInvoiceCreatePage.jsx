// ================================================================
// Recurring Invoice Create — subscription template + schedule
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getCustomerPalette, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import CustomerSelect from "../../../components/dashboard/sales/CustomerSelect";
import { api, localStore, KEYS, fmtCurrency } from "./efaturaApi";

const FREQ_OPTIONS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

export default function RecurringInvoiceCreatePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [customers, setCustomers] = useState([]);
  const [data, setData] = useState({
    customerId: null,
    customerName: "",
    template: "",
    amount: 0,
    currency: "TRY",
    frequency: "MONTHLY",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    dayOfMonth: 1,
    autoSend: true,
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/api/customers").then((res) => {
      const list = res?.data?.customers || res?.data?.items || res?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    });
  }, []);

  useEffect(() => {
    if (!data.customerId) return;
    const c = customers.find((x) => x.id === data.customerId);
    if (c) setData((d) => ({ ...d, customerName: c.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.customerId]);

  const yearForecast = useMemo(() => {
    const perYear = { DAILY: 365, WEEKLY: 52, MONTHLY: 12, QUARTERLY: 4, YEARLY: 1 }[data.frequency] || 12;
    return (Number(data.amount) || 0) * perYear;
  }, [data.amount, data.frequency]);

  const submit = () => {
    if (!data.customerName || Number(data.amount) <= 0) {
      setToast({ kind: "error", msg: t("common.error") });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    const created = localStore.add(KEYS.recurring, {
      ...data,
      amount: Number(data.amount),
      status: "ACTIVE",
      nextRunDate: new Date(data.startDate).toISOString(),
      createdAt: new Date().toISOString(),
    });
    setToast({ kind: "success", msg: t("common.success") });
    setTimeout(() => onNavigate && onNavigate("efatura-recurring"), 600);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("recurring.create.title")}
        subtitle={t("recurring.subtitle")}
        icon="🔁"
        palette={customer}
        breadcrumb={[
          { label: t("recurring.title"), href: "#efatura-recurring" },
          { label: t("recurring.create.title") },
        ]}
        actions={
          <PageHeaderButton palette={customer} variant="ghost" onClick={() => onNavigate && onNavigate("efatura-recurring")}>
            ←
          </PageHeaderButton>
        }
      />

      <Card palette={customer} title={t("recurring.create.customer")} icon="👤" style={{ marginBottom: 14 }}>
        <CustomerSelect
          customers={customers}
          value={data.customerId}
          onChange={(id) => setData({ ...data, customerId: id })}
          onCreateNew={(name) => setData({ ...data, customerId: null, customerName: name || "" })}
          placeholder="Search customer…"
        />
      </Card>

      <Card palette={customer} title={t("recurring.create.template")} icon="📋" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <Field label={t("recurring.create.template")}>
            <input type="text" value={data.template} onChange={(e) => setData({ ...data, template: e.target.value })} placeholder="e.g. Monthly SaaS subscription" style={input(customer)} />
          </Field>
          <Field label={`${t("recurring.create.amount")} (₺)`}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={data.amount}
              onChange={(e) => setData({ ...data, amount: e.target.value })}
              style={{ ...input(customer), fontFamily: "monospace", textAlign: "end" }}
            />
          </Field>
          <Field label="Currency">
            <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} style={input(customer)}>
              <option value="TRY">TRY ₺</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card palette={customer} title="Schedule" icon="📅" style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 6 }}>{t("recurring.create.freq")}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FREQ_OPTIONS.map((f) => {
              const active = data.frequency === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setData({ ...data, frequency: f })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: active ? `2px solid ${customer.base}` : `1px solid ${customer.base}30`,
                    background: active ? customer.base : `${customer.base}10`,
                    color: active ? "#fff" : customer.dark,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t(`recurring.freq.${f}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Field label={t("recurring.create.start")}>
            <input type="date" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} style={input(customer)} />
          </Field>
          <Field label={t("recurring.create.end")}>
            <input type="date" value={data.endDate} onChange={(e) => setData({ ...data, endDate: e.target.value })} style={input(customer)} />
          </Field>
          {data.frequency === "MONTHLY" && (
            <Field label={t("recurring.create.day")}>
              <select
                value={data.dayOfMonth}
                onChange={(e) => setData({ ...data, dayOfMonth: e.target.value === "last" ? "last" : Number(e.target.value) })}
                style={input(customer)}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="last">{t("recurring.create.day.last")}</option>
              </select>
            </Field>
          )}
        </div>

        <label style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.autoSend}
            onChange={(e) => setData({ ...data, autoSend: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: customer.base }}
          />
          <span style={{ fontSize: 13, color: customer.dark, fontWeight: 700 }}>
            {t("recurring.create.autosend")}
          </span>
        </label>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: money.dark, fontWeight: 700, marginInlineEnd: "auto" }}>
          Annual forecast:{" "}
          <span style={{ fontFamily: "monospace", color: money.base, fontSize: 16, fontWeight: 800 }}>
            {fmtCurrency(yearForecast, data.currency)}
          </span>
        </span>
        <button
          type="button"
          onClick={submit}
          style={{
            background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: `0 6px 18px ${brand.base}35`,
          }}
        >
          ✓ {t("recurring.create.save")}
        </button>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: toast.kind === "error" ? "#FFE4E6" : "#ECFDF5",
            color: toast.kind === "error" ? "#9F1239" : "#047857",
            border: `1px solid ${toast.kind === "error" ? "#F43F5E" : "#10B981"}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 250,
          }}
        >
          {toast.kind === "error" ? "⚠ " : "✓ "} {toast.msg}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}
