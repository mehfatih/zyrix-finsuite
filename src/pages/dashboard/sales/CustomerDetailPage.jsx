// ================================================================
// Customer Detail (360°) — hero page with DNA, gauges, heatmap, timeline
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAIPalette,
  getReportsPalette,
  getMarketPalette,
  getBrandPalette,
  paletteSequence,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import { Gauge, PulseRings } from "../../../components/dashboard/charts";
import PaymentHeatmap from "../../../components/dashboard/sales/PaymentHeatmap";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import DealCard from "../../../components/dashboard/sales/DealCard";
import { api, fmtCurrency, fmtDate, daysBetween } from "./salesApi";

const DEFAULT_DNA = {
  type: "Analytical",
  ltv: "High",
  score: 87,
};

export default function CustomerDetailPage({ customerId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const reports = getReportsPalette();
  const market = getMarketPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [data, setData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityTab, setActivityTab] = useState("ALL");

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api(`/api/customers/${customerId}`),
      api("/api/invoices?limit=500"),
      api("/api/deals"),
    ]).then(([cRes, iRes, dRes]) => {
      const c = cRes?.data || cRes?.customer || null;
      const allInvoices = iRes?.data?.invoices || iRes?.data?.items || iRes?.data || [];
      const allDeals = dRes?.data?.deals || dRes?.data?.items || dRes?.data || [];
      const cName = c?.name;
      setData(c);
      setInvoices(
        (Array.isArray(allInvoices) ? allInvoices : []).filter(
          (inv) => inv.customerId === customerId || (cName && inv.customerName === cName)
        )
      );
      setDeals(
        (Array.isArray(allDeals) ? allDeals : []).filter(
          (d) => d.customerId === customerId || (cName && d.customerName === cName)
        )
      );
      setLoading(false);
    });
  }, [customerId]);

  const totals = useMemo(() => {
    const revenue = invoices.reduce((s, i) => s + Number(i.total || 0), 0);
    const paidCount = invoices.filter((i) => i.status === "PAID").length;
    const onTimeRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;
    const ltv = revenue * 2.4; // simple 3yr projection
    return { revenue, ltv, onTimeRate };
  }, [invoices]);

  const heatmapPayments = useMemo(
    () =>
      invoices
        .filter((i) => i.status === "PAID" && (i.paidDate || i.updatedAt))
        .map((i) => ({
          date: String(i.paidDate || i.updatedAt).slice(0, 10),
          amount: Number(i.total) || 0,
        })),
    [invoices]
  );

  const activityFeed = useMemo(() => {
    const list = invoices.map((i) => ({
      kind: "EMAIL",
      label: `Invoice ${i.invoiceNumber || i.id?.slice(0, 6)} sent`,
      detail: fmtCurrency(i.total, i.currency),
      date: i.createdAt,
    }));
    deals.forEach((d) => {
      list.push({ kind: "PHONE", label: `Deal: ${d.title || "Untitled"}`, detail: d.stage, date: d.createdAt });
    });
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }, [invoices, deals]);

  const filteredActivity =
    activityTab === "ALL" ? activityFeed : activityFeed.filter((a) => a.kind === activityTab);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const c = data || { name: "Unknown" };
  const dna = DEFAULT_DNA;
  const onTimePalette = totals.onTimeRate >= 80 ? success : totals.onTimeRate >= 50 ? getPaletteById("amber") : getPaletteById("rose");

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={c.name}
        subtitle={c.taxId ? `VKN ${c.taxId}` : ""}
        icon="👤"
        palette={customer}
        breadcrumb={[
          { label: t("customers.title"), href: "#sales-customers" },
          { label: c.name },
        ]}
        actions={
          <PageHeaderButton palette={customer} variant="ghost" onClick={() => onNavigate && onNavigate("sales-customers")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* HERO BANNER with DNA */}
      <div
        style={{
          background: `linear-gradient(135deg, ${customer.bg}, ${ai.bg})`,
          border: `1px solid ${customer.base}25`,
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
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${customer.base}, ${customer.dark})`,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: `0 8px 24px ${customer.base}40`,
          }}
        >
          {(c.name || "?")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{c.name}</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>
            {c.email || "—"} {c.phone ? `· ${c.phone}` : ""}
          </div>
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: ai.base,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: `0 4px 14px ${ai.base}40`,
            }}
          >
            🧬 {t("customer.dna.title")} · {t(`customer.dna.${dna.type.toLowerCase()}`)} · {t(`customer.dna.ltv.${dna.ltv === "High" ? "high" : dna.ltv === "Medium" ? "med" : "low"}`)} · {dna.score}/100
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PageHeaderButton palette={brand} variant="primary" icon="📤" onClick={() => onNavigate && onNavigate("sales-invoice-new", { customerId })}>
            {t("customer.detail.send")}
          </PageHeaderButton>
          <PageHeaderButton palette={customer} variant="secondary" icon="✏️">
            {t("customer.detail.edit")}
          </PageHeaderButton>
          <PageHeaderButton palette={success} variant="secondary" icon="📞">
            {t("customer.detail.call")}
          </PageHeaderButton>
        </div>
      </div>

      {/* KPI ROW: revenue / ltv / payment behavior */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="sales-kpi-grid"
      >
        <Card palette={money} title={t("customer.kpi.revenue")} icon="💰">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Gauge value={Math.min(100, (totals.revenue / 100000) * 100)} palette={money} width={150} height={90} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
                {fmtCurrency(totals.revenue)}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                / {t("customer.target")} {fmtCurrency(100000)}
              </div>
            </div>
          </div>
        </Card>
        <Card palette={ai} title={t("customer.kpi.ltv")} icon="🔮">
          <div style={{ fontSize: 30, fontWeight: 900, color: ai.base, fontFamily: "monospace" }}>
            {fmtCurrency(totals.ltv)}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>3-year forecast (AI projection)</div>
        </Card>
        <Card palette={onTimePalette} title={t("customer.kpi.payment")} icon="⏱️">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <PulseRings palette={onTimePalette} size={70} count={3} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: onTimePalette.dark }}>
                {totals.onTimeRate >= 80
                  ? t("customer.payment.always.ontime")
                  : totals.onTimeRate >= 50
                  ? t("customer.payment.usually.ontime")
                  : t("customer.payment.late")}
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{totals.onTimeRate}% on-time rate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* PAYMENT HEATMAP */}
      <Card palette={customer} title={t("customer.heatmap.title")} subtitle={t("customer.heatmap.subtitle")} icon="🗓️" style={{ marginBottom: 18 }}>
        <PaymentHeatmap payments={heatmapPayments} palette={customer} />
      </Card>

      {/* INVOICES TABLE + ACTIVITY TIMELINE */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="sales-detail-grid">
        <Card palette={brand} title={t("customer.invoices.title")} icon="🧾">
          {invoices.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: brand.bg }}>
                    <th style={th}>#</th>
                    <th style={th}>Date</th>
                    <th style={{ ...th, textAlign: "end" }}>Amount</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 20).map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                      onClick={() => onNavigate && onNavigate("sales-invoice-detail", { id: inv.id })}
                    >
                      <td style={{ ...td, fontFamily: "monospace", color: brand.dark, fontWeight: 700 }}>
                        {inv.invoiceNumber || (inv.id || "").slice(0, 8)}
                      </td>
                      <td style={{ ...td, color: "#64748B" }}>{fmtDate(inv.createdAt, lang)}</td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                        {fmtCurrency(inv.total, inv.currency)}
                      </td>
                      <td style={td}>
                        <InvoiceStatusPill status={inv.status || "DRAFT"} label={t(`invoices.status.${inv.status || "DRAFT"}`)} size="compact" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card palette={reports} title={t("customer.activity.title")} icon="📡">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { id: "ALL", label: "All" },
              { id: "EMAIL", label: t("customer.activity.email") },
              { id: "WHATSAPP", label: t("customer.activity.whatsapp") },
              { id: "PHONE", label: t("customer.activity.phone") },
              { id: "VISIT", label: t("customer.activity.visit") },
            ].map((tab) => {
              const active = activityTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivityTab(tab.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: active ? `2px solid ${reports.base}` : `1px solid ${reports.base}30`,
                    background: active ? reports.base : `${reports.base}10`,
                    color: active ? "#fff" : reports.dark,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {filteredActivity.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>—</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {filteredActivity.slice(0, 12).map((evt, i) => (
                <ActivityRow key={i} evt={evt} reports={reports} lang={lang} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* MINI PIPELINE */}
      <Card palette={market} title={t("customer.pipeline.title")} icon="🤝">
        {deals.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {deals.slice(0, 6).map((d, i) => {
              const palette = paletteSequence(deals.length, { exclude: ["wine"] })[i] || market;
              return <DealCard key={d.id} deal={d} palette={palette} draggable={false} />;
            })}
          </div>
        )}
      </Card>

      <style>{`
        @keyframes heroIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 880px) {
          .sales-detail-grid { grid-template-columns: 1fr !important; }
          .sales-kpi-grid { grid-template-columns: repeat(1, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function ActivityRow({ evt, reports, lang }) {
  const icons = { EMAIL: "✉️", WHATSAPP: "💬", PHONE: "📞", VISIT: "📍" };
  const iconColors = {
    EMAIL: getPaletteById("cyan"),
    WHATSAPP: getPaletteById("emerald"),
    PHONE: getPaletteById("amber"),
    VISIT: getPaletteById("indigo"),
  };
  const p = iconColors[evt.kind] || reports;
  return (
    <li style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: p.bg,
          color: p.dark,
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {icons[evt.kind] || "•"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{evt.label}</div>
        <div style={{ fontSize: 11, color: "#64748B" }}>
          {fmtDate(evt.date, lang)} · {evt.detail || ""}
        </div>
      </div>
    </li>
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
