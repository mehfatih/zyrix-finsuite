// ================================================================
// ★ Zyrix Capital — embedded finance, AI underwriting
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMoneyPalette, getCustomerPalette, getAIPalette, getSuccessPalette, getPaletteById } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import LoanEligibilityGauge from "../../../components/dashboard/ecosystem/LoanEligibilityGauge";
import CashAdvanceCalculator from "../../../components/dashboard/ecosystem/CashAdvanceCalculator";
import { api, localStore, KEYS, calcEligibility, capitalProducts, fmtCurrency } from "./ecosystemApi";

const PRODUCT_ICONS = { workingCapital: "💼", cashAdvance: "⚡", bnpl: "🛍" };

export default function CapitalPage() {
  const t = useDashboardI18n("ecosystem");
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [apps, setApps] = useState(localStore.list(KEYS.capitalApplications));

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
  }, []);

  const eligibility = useMemo(() => calcEligibility({ invoices, customers, purchases }), [invoices, customers, purchases]);
  const products = useMemo(() => capitalProducts({ invoices }), [invoices]);

  const apply = (product) => {
    const a = localStore.add(KEYS.capitalApplications, { productId: product.id, kind: product.kind, at: new Date().toISOString() });
    setApps((s) => [a, ...s]);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("capital.title")} subtitle={t("capital.subtitle")} icon="🏦" palette={money} />

      <Card palette={money} title={t("capital.eligibility.title")} icon="🎯" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }} className="cp-elig">
          <div style={{ textAlign: "center" }}>
            <LoanEligibilityGauge score={eligibility.score} status={eligibility.status} t={t} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 12 }}>
              AI underwriting reviewed your invoices, customer mix, supplier dependence, and payment history. Pre-approved offers below — final approval requires partner-bank review.
            </div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic" }}>
              ⚖ {t("capital.disclaimer")}
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 720px) { .cp-elig { grid-template-columns: 1fr !important; text-align: center; } }`}</style>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 18 }} className="cp-products">
        {products.map((p) => {
          const palette = getPaletteById(p.palette);
          const pending = apps.find((a) => a.productId === p.id);
          if (p.kind === "workingCapital") {
            return (
              <Card key={p.id} palette={palette} icon={PRODUCT_ICONS[p.kind]} title={t(`capital.product.${p.kind}`)}>
                <Row label={t("capital.product.upTo")}          value={fmtCurrency(p.upTo)} />
                <Row label={t("capital.product.interest")}      value={`${p.interestPct}%`} />
                <Row label={t("capital.product.term")}          value={`${p.termMin}-${p.termMax} ${t("twin.duration.30").split(" ")[1] || "mo"}`} />
                <Row label={t("capital.product.approvalTime")}  value={`${p.approvalMins} min`} />
                <button type="button" onClick={() => apply(p)} disabled={!!pending} style={btnPrimary(palette)}>
                  {pending ? "✓ Applied" : `⚡ ${t("capital.action.applyNow")}`}
                </button>
              </Card>
            );
          }
          if (p.kind === "cashAdvance") {
            return (
              <Card key={p.id} palette={palette} icon={PRODUCT_ICONS[p.kind]} title={t(`capital.product.${p.kind}`)}>
                <Row label={t("capital.product.fee")}       value={`${p.feePct}%`} />
                <Row label={t("capital.product.available")} value={fmtCurrency(p.available)} />
                <CashAdvanceCalculator defaultInvoice={Math.min(50000, Math.max(2000, p.available))} defaultFeePct={p.feePct} t={t} />
              </Card>
            );
          }
          // bnpl
          return (
            <Card key={p.id} palette={palette} icon={PRODUCT_ICONS[p.kind]} title={t(`capital.product.${p.kind}`)}>
              <Row label={t("capital.product.fee")} value={`${p.feePct}%`} />
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                Zyrix pays you fully today, your customer pays in 30/60 days. Absorb the fee or pass to customer.
              </div>
              <button type="button" onClick={() => apply(p)} disabled={!!pending} style={btnPrimary(palette)}>
                {pending ? "✓ Enabled" : `${t("capital.action.enable")}`}
              </button>
            </Card>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 720px) { .cp-products { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #E2E8F0", fontSize: 12 }}>
      <span style={{ color: "#64748B", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#0F172A", fontWeight: 800, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function btnPrimary(p) {
  return { width: "100%", marginTop: 14, background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${p.base}40` };
}
