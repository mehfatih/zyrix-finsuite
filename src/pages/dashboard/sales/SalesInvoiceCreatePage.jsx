// ================================================================
// Sales Invoice Create — wraps InvoiceForm + persists to backend
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import InvoiceForm from "../../../components/dashboard/sales/InvoiceForm";
import { api } from "./salesApi";

export default function SalesInvoiceCreatePage({ onNavigate, initial = {} }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/api/customers").then((res) => {
      const list = res?.data?.customers || res?.data?.items || res?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    });
    api("/api/stock").then((res) => {
      const list = res?.data?.products || res?.data?.items || res?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setProducts(arr.map((p) => ({ name: p.name, price: p.price ?? p.unitPrice })));
    });
  }, []);

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const submit = async (data, status) => {
    const payload = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerTaxId: data.customerTaxId,
      items: data.items.map((it) => ({
        name: it.name,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        vatRate: Number(it.vatRate) || 0,
      })),
      vatRate: data.items[0]?.vatRate || 20,
      currency: data.currency,
      dueDate: data.dueDate,
      notes: data.customerNotes,
      status,
    };
    const res = await api("/api/invoices", { method: "POST", body: JSON.stringify(payload) });
    if (res?.success === false) {
      showToast("error", res.error || t("common.error"));
      return null;
    }
    return res?.data || null;
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("create.title")}
        subtitle={t("create.subtitle")}
        icon="🧾"
        palette={brand}
        breadcrumb={[
          { label: t("invoices.title"), href: "#sales-invoices" },
          { label: t("create.title") },
        ]}
        actions={
          <PageHeaderButton
            palette={brand}
            variant="ghost"
            onClick={() => onNavigate && onNavigate("sales-invoices")}
          >
            ← {t("invoices.title")}
          </PageHeaderButton>
        }
      />

      <InvoiceForm
        initial={initial}
        customers={customers}
        products={products}
        onSaveDraft={async (data, isAuto) => {
          const created = await submit(data, "DRAFT");
          if (created && !isAuto) {
            showToast("success", t("common.success"));
          }
        }}
        onSendNow={async (data) => {
          const created = await submit(data, "SENT");
          if (created) {
            showToast("success", t("common.success"));
            if (onNavigate) onNavigate("sales-invoice-detail", { id: created.id });
          }
        }}
        onSignGib={async (data) => {
          const created = await submit(data, "SENT");
          if (created) {
            showToast("success", t("common.success"));
            if (onNavigate) onNavigate("sales-invoice-detail", { id: created.id });
          }
        }}
      />

      {toast && <Toast kind={toast.kind} msg={toast.msg} />}
    </div>
  );
}

function Toast({ kind, msg }) {
  const colors = {
    success: { bg: "#ECFDF5", fg: "#047857", border: "#10B981" },
    error: { bg: "#FFE4E6", fg: "#9F1239", border: "#F43F5E" },
  };
  const c = colors[kind] || colors.success;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        insetInlineEnd: 28,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: "12px 18px",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        zIndex: 250,
        animation: "fadeIn .25s ease",
      }}
    >
      {kind === "success" ? "✓ " : "⚠ "}
      {msg}
    </div>
  );
}
