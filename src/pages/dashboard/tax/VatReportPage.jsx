// ================================================================
// VAT Report — KDV breakdown with donut, trend, comparison, exports
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
  getCustomerPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import { AreaChart, BulletChart } from "../../../components/dashboard/charts";
import VatBreakdownDonut from "../../../components/dashboard/tax/VatBreakdownDonut";
import KdvComparisonChart from "../../../components/dashboard/tax/KdvComparisonChart";
import { api, localStore, KEYS, fmtCurrency } from "../efatura/efaturaApi";

const RATES = [1, 8, 18, 20];

export default function VatReportPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("tax");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const customer = getCustomerPalette();

  const [period, setPeriod] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [salesInvoices, setSalesInvoices] = useState([]);

  useEffect(() => {
    api("/api/invoices?limit=500").then((res) => {
      const list = res?.data?.invoices || res?.data?.items || res?.data || [];
      setSalesInvoices(Array.isArray(list) ? list : []);
    });
  }, []);

  const purchaseInvoices = useMemo(() => localStore.list("zyrix_purchase_invoices_v1"), []);

  const inMonth = (date, ref) => {
    const d = new Date(date || 0);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  };

  const summary = useMemo(() => {
    const collected = salesInvoices
      .filter((i) => inMonth(i.createdAt, period))
      .reduce((s, i) => s + Number(i.vatAmount || 0), 0);
    const paid = purchaseInvoices
      .filter((i) => inMonth(i.createdAt, period))
      .reduce((s, i) => s + Number(i.vatAmount || 0), 0);
    return { collected, paid, net: collected - paid };
  }, [salesInvoices, purchaseInvoices, period]);

  const lastMonth = new Date(period.getFullYear(), period.getMonth() - 1, 1);
  const lastMonthSummary = useMemo(() => {
    const collected = salesInvoices.filter((i) => inMonth(i.createdAt, lastMonth)).reduce((s, i) => s + Number(i.vatAmount || 0), 0);
    const paid = purchaseInvoices.filter((i) => inMonth(i.createdAt, lastMonth)).reduce((s, i) => s + Number(i.vatAmount || 0), 0);
    return { collected, paid };
  }, [salesInvoices, purchaseInvoices, lastMonth]);

  const trend = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(period.getFullYear(), period.getMonth() - (11 - i), 1);
      return {
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "short" }),
        value: 0,
      };
    });
    salesInvoices.forEach((i) => {
      const k = String(i.createdAt || "").slice(0, 7);
      const b = buckets.find((x) => x.key === k);
      if (b) b.value += Number(i.vatAmount || 0);
    });
    return buckets;
  }, [salesInvoices, period, lang]);

  const byRate = useMemo(() => {
    const map = Object.fromEntries(RATES.map((r) => [r, 0]));
    salesInvoices.filter((i) => inMonth(i.createdAt, period)).forEach((i) => {
      const r = Number(i.vatRate || 0);
      const closest = RATES.reduce((best, x) => (Math.abs(x - r) < Math.abs(best - r) ? x : best), RATES[0]);
      map[closest] += Number(i.vatAmount || 0);
    });
    return RATES.map((r) => ({ label: `${r}%`, value: map[r] }));
  }, [salesInvoices, period]);

  const target = 50000;

  const exportFile = (kind) => {
    const filename = `vat-${period.toISOString().slice(0, 7)}.${kind === "xml" ? "xml" : kind === "excel" ? "csv" : "txt"}`;
    let content = "";
    if (kind === "xml") {
      content = `<?xml version="1.0" encoding="UTF-8"?>
<VatReport period="${period.toISOString().slice(0, 7)}">
  <Collected>${summary.collected.toFixed(2)}</Collected>
  <Paid>${summary.paid.toFixed(2)}</Paid>
  <NetPayable>${summary.net.toFixed(2)}</NetPayable>
${byRate.map((r) => `  <Rate code="${r.label}" amount="${r.value.toFixed(2)}"/>`).join("\n")}
</VatReport>`;
    } else if (kind === "excel") {
      content = `Period,${period.toISOString().slice(0, 7)}\nCollected,${summary.collected}\nPaid,${summary.paid}\nNet,${summary.net}\n\nRate,Amount\n${byRate.map((r) => `${r.label},${r.value}`).join("\n")}`;
    } else {
      content = `VAT Report ${period.toISOString().slice(0, 7)}\n\nCollected: ${summary.collected.toFixed(2)}\nPaid:      ${summary.paid.toFixed(2)}\nNet:       ${summary.net.toFixed(2)}`;
    }
    const blob = new Blob([content], { type: kind === "xml" ? "application/xml" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("vat.title")}
        subtitle={t("vat.subtitle")}
        icon="📊"
        palette={money}
        actions={
          <>
            <select
              value={period.toISOString().slice(0, 7)}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setPeriod(new Date(y, m - 1, 1));
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: `1px solid ${money.base}30`,
                background: "#fff",
                fontSize: 13,
                fontWeight: 700,
                color: money.dark,
                outline: "none",
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                d.setDate(1);
                return (
                  <option key={i} value={d.toISOString().slice(0, 7)}>
                    {d.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "long", year: "numeric" })}
                  </option>
                );
              })}
            </select>
            <PageHeaderButton palette={reports} variant="secondary" onClick={() => exportFile("pdf")}>
              📄 {t("vat.export.pdf")}
            </PageHeaderButton>
            <PageHeaderButton palette={success} variant="secondary" onClick={() => exportFile("excel")}>
              📊 {t("vat.export.excel")}
            </PageHeaderButton>
            <PageHeaderButton palette={brand} variant="primary" onClick={() => exportFile("xml")}>
              ⬇ {t("vat.export.xml")}
            </PageHeaderButton>
          </>
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
        <KpiCard label={t("vat.kpi.collected")} value={Math.round(summary.collected)} prefix="₺" palette={success} icon="↓" />
        <KpiCard label={t("vat.kpi.paid")} value={Math.round(summary.paid)} prefix="₺" palette={reports} icon="↑" />
        <KpiCard label={t("vat.kpi.net")} value={Math.round(summary.net)} prefix="₺" palette={money} icon="💰" />
        <Card palette={customer} title={t("vat.kpi.target")} icon="🎯">
          <BulletChart value={summary.collected} target={target} max={target * 1.5} palette={customer} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="ef-detail-grid">
        <Card palette={money} title={t("vat.donut.title")} icon="🍩">
          <VatBreakdownDonut collected={summary.collected} paid={summary.paid} t={t} />
        </Card>
        <Card palette={reports} title={t("vat.compare.title")} icon="⚖️">
          <KdvComparisonChart
            thisMonth={{ collected: summary.collected, paid: summary.paid }}
            lastMonth={lastMonthSummary}
            palette={reports}
            t={t}
          />
        </Card>
      </div>

      <Card palette={success} title={t("vat.trend.title")} icon="📈" style={{ marginBottom: 18 }}>
        <AreaChart data={trend} palette={success} height={200} />
      </Card>

      <Card palette={brand} title={t("vat.rates.title")} icon="📊">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {byRate.map((r, i) => {
            const palettes = ["cyan", "amber", "rose", "indigo"];
            const palette = ["%1", "%8", "%18", "%20"];
            const p = { cyan: { base: "#0EA5E9", bg: "#E0F7FF", dark: "#0369A1" }, amber: { base: "#F59E0B", bg: "#FFF8E5", dark: "#B45309" }, rose: { base: "#F43F5E", bg: "#FFE4E6", dark: "#9F1239" }, indigo: { base: "#6366F1", bg: "#EAEDFF", dark: "#3730A3" } }[palettes[i]];
            return (
              <div
                key={r.label}
                style={{
                  background: p.bg,
                  border: `1px solid ${p.base}30`,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 11, color: p.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  KDV {r.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: p.base, fontFamily: "monospace" }}>
                  {fmtCurrency(r.value)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`
        @media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 880px) { .ef-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
