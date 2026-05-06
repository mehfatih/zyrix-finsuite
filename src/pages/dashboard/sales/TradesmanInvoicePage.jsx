// ================================================================
// Tradesman Invoice — TR-specific simplified invoice with stoppage tax
// ================================================================
import React, { useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getWarningPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import { api, fmtCurrency } from "./salesApi";

// Esnaf-style stoppage withholding (simplified): 10% on net.
const WITHHOLDING_RATE = 0.10;
const VAT_RATE = 0.18;

export default function TradesmanInvoicePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const warn = getWarningPalette();

  const [form, setForm] = useState({
    customerName: "",
    customerTaxId: "",
    serviceDescription: "",
    gibCode: "9999",
    grossAmount: 0,
  });
  const [toast, setToast] = useState(null);

  const calc = useMemo(() => {
    const gross = Number(form.grossAmount) || 0;
    const net = gross / (1 + VAT_RATE);
    const vat = gross - net;
    const withholding = net * WITHHOLDING_RATE;
    const payout = net - withholding;
    return { gross, net, vat, withholding, payout };
  }, [form.grossAmount]);

  const submit = async () => {
    if (!form.customerName || calc.gross <= 0) {
      setToast({ kind: "error", msg: t("common.error") });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const payload = {
      customerName: form.customerName,
      customerTaxId: form.customerTaxId,
      items: [
        {
          name: form.serviceDescription || form.gibCode,
          quantity: 1,
          unitPrice: calc.net,
          vatRate: VAT_RATE * 100,
        },
      ],
      vatRate: VAT_RATE * 100,
      currency: "TRY",
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: `Esnaf · GİB ${form.gibCode} · Stopaj ${WITHHOLDING_RATE * 100}%`,
    };
    const res = await api("/api/invoices", { method: "POST", body: JSON.stringify(payload) });
    if (res?.success === false) {
      setToast({ kind: "error", msg: res.error || t("common.error") });
    } else {
      setToast({ kind: "success", msg: t("common.success") });
      if (onNavigate && res?.data?.id) {
        setTimeout(() => onNavigate("sales-invoice-detail", { id: res.data.id }), 600);
      }
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("tradesman.title")} subtitle={t("tradesman.subtitle")} icon="🛠️" palette={brand} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18 }} className="sales-tradesman-grid">
        <Card palette={brand} title={t("tradesman.create")} icon="📝">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
            <Field label={t("create.customer.name")}>
              <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} style={input(brand)} />
            </Field>
            <Field label={t("create.customer.taxId")}>
              <input type="text" value={form.customerTaxId} onChange={(e) => setForm({ ...form, customerTaxId: e.target.value })} style={input(brand)} />
            </Field>
            <Field label={t("tradesman.field.gib")}>
              <input type="text" value={form.gibCode} onChange={(e) => setForm({ ...form, gibCode: e.target.value })} style={input(brand)} />
            </Field>
            <Field label={t("tradesman.field.amount")}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.grossAmount}
                onChange={(e) => setForm({ ...form, grossAmount: e.target.value })}
                style={{ ...input(brand), fontFamily: "monospace", textAlign: "end" }}
              />
            </Field>
          </div>
          <Field label={t("tradesman.field.service")}>
            <textarea
              value={form.serviceDescription}
              onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
              rows={3}
              style={{ ...input(brand), fontFamily: "inherit", resize: "vertical" }}
            />
          </Field>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
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
              {t("tradesman.create")}
            </button>
          </div>
        </Card>

        <Card palette={money} title={t("tradesman.calc.title")} icon="🧮">
          <CalcRow label={t("tradesman.calc.gross")} value={fmtCurrency(calc.gross)} accent={money.dark} />
          <CalcRow label={t("tradesman.calc.vat") + ` (%${VAT_RATE * 100})`} value={`-${fmtCurrency(calc.vat)}`} accent="#94A3B8" />
          <CalcRow label={t("tradesman.calc.net")} value={fmtCurrency(calc.net)} accent={money.dark} bold />
          <div style={{ height: 8 }} />
          <CalcRow label={`Stopaj (%${WITHHOLDING_RATE * 100})`} value={`-${fmtCurrency(calc.withholding)}`} accent={warn.dark} />
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              background: `linear-gradient(135deg, ${money.bg}, ${money.base}20)`,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1px solid ${money.base}40`,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: money.dark }}>Net Payout</span>
            <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: money.base }}>
              {fmtCurrency(calc.payout)}
            </span>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
            ⓘ Esnaf vergi stopajı (%10) net tutar üzerinden uygulanır. KDV (%18) brüt tutardan ayrılır.
          </div>
        </Card>
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

      <style>{`
        @media (max-width: 880px) {
          .sales-tradesman-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

function CalcRow({ label, value, accent, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px dashed #E2E8F0",
      }}
    >
      <span style={{ fontSize: 13, color: "#475569", fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: accent, fontFamily: "monospace", fontWeight: bold ? 800 : 600 }}>{value}</span>
    </div>
  );
}

function input(brand) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${brand.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}
