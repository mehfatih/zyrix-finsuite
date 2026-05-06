// ================================================================
// Service Purchase — simplified invoice for received services
// ================================================================
import React, { useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMarketPalette, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import { localStore, KEYS, fmtCurrency } from "./purchasesApi";

export default function ServicePurchaseInvoicePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [form, setForm] = useState({
    provider: "",
    description: "",
    amount: 0,
    vatRate: 20,
    date: new Date().toISOString().slice(0, 10),
  });
  const [toast, setToast] = useState(null);

  const calc = useMemo(() => {
    const gross = Number(form.amount) || 0;
    const vat = gross * ((Number(form.vatRate) || 0) / 100);
    return { gross, vat, total: gross + vat };
  }, [form.amount, form.vatRate]);

  const submit = () => {
    if (!form.provider || calc.gross <= 0) {
      setToast({ kind: "error", msg: t("common.error") });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    const created = localStore.add(KEYS.purchases, {
      number: `SVC-${new Date().getFullYear()}-${String(localStore.list(KEYS.purchases).length + 1).padStart(4, "0")}`,
      supplierName: form.provider,
      direction: "OUTGOING",
      items: [{ name: form.description, quantity: 1, unitPrice: calc.gross, vatRate: form.vatRate }],
      currency: "TRY",
      subtotal: calc.gross,
      vatAmount: calc.vat,
      total: calc.total,
      status: "ACCEPTED",
      issueDate: form.date,
      dueDate: form.date,
      notes: `Service: ${form.description}`,
      createdAt: new Date().toISOString(),
    });
    setToast({ kind: "success", msg: t("common.success") });
    setTimeout(() => onNavigate && onNavigate("purch-invoice-detail", { id: created.id }), 600);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("services.title")} subtitle={t("services.subtitle")} icon="🛠️" palette={market} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18 }} className="purch-svc-grid">
        <Card palette={market} title={t("services.create")} icon="📝">
          <div style={{ display: "grid", gap: 14 }}>
            <Field label={t("services.field.provider")}>
              <input type="text" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} style={input(market)} />
            </Field>
            <Field label={t("services.field.description")}>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...input(market), fontFamily: "inherit", resize: "vertical" }} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label={t("services.field.amount")}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  style={{ ...input(market), fontFamily: "monospace", textAlign: "end" }}
                />
              </Field>
              <Field label={t("services.field.vat")}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                  style={{ ...input(market), fontFamily: "monospace", textAlign: "center" }}
                />
              </Field>
              <Field label={t("services.field.date")}>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={input(market)} />
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                {t("services.create")}
              </button>
            </div>
          </div>
        </Card>

        <Card palette={money} title="Summary" icon="🧮">
          <SummaryRow label="Subtotal" value={fmtCurrency(calc.gross)} />
          <SummaryRow label={`VAT (${form.vatRate}%)`} value={fmtCurrency(calc.vat)} />
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
            <span style={{ fontSize: 13, fontWeight: 800, color: money.dark }}>Total</span>
            <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: money.base }}>
              {fmtCurrency(calc.total)}
            </span>
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

      <style>{`@media (max-width: 880px) { .purch-svc-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0F172A", fontFamily: "monospace", fontWeight: 700 }}>{value}</span>
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
