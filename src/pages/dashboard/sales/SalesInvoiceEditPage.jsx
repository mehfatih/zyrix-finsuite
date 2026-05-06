// ================================================================
// Sales Invoice Edit — loads existing invoice + reuses InvoiceForm
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import InvoiceForm from "../../../components/dashboard/sales/InvoiceForm";
import { api } from "./salesApi";

export default function SalesInvoiceEditPage({ invoiceId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const [invoice, setInvoice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api(`/api/invoices/${invoiceId}`),
      api("/api/customers"),
      api("/api/stock"),
    ]).then(([invRes, custRes, stockRes]) => {
      setInvoice(invRes?.data || null);
      const clist = custRes?.data?.customers || custRes?.data?.items || custRes?.data || [];
      setCustomers(Array.isArray(clist) ? clist : []);
      const plist = stockRes?.data?.products || stockRes?.data?.items || stockRes?.data || [];
      setProducts(
        (Array.isArray(plist) ? plist : []).map((p) => ({
          name: p.name,
          price: p.price ?? p.unitPrice,
        }))
      );
      setLoading(false);
    });
  }, [invoiceId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;
  }

  const initial = invoice
    ? {
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        customerTaxId: invoice.customerTaxId,
        items: Array.isArray(invoice.items) ? invoice.items : [],
        currency: invoice.currency,
        dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : undefined,
        customerNotes: invoice.notes,
      }
    : {};

  const update = async (data, status) => {
    if (!invoice) return;
    const payload = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerTaxId: data.customerTaxId,
      items: data.items,
      vatRate: data.items[0]?.vatRate || 20,
      currency: data.currency,
      dueDate: data.dueDate,
      notes: data.customerNotes,
      status,
    };
    await api(`/api/invoices/${invoice.id}`, { method: "PUT", body: JSON.stringify(payload) });
    if (onNavigate) onNavigate("sales-invoice-detail", { id: invoice.id });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("detail.actions.edit")}
        subtitle={invoice?.invoiceNumber || ""}
        icon="✏️"
        palette={brand}
        breadcrumb={[
          { label: t("invoices.title"), href: "#sales-invoices" },
          { label: invoice?.invoiceNumber || "—" },
          { label: t("detail.actions.edit") },
        ]}
        actions={
          <PageHeaderButton
            palette={brand}
            variant="ghost"
            onClick={() => onNavigate && onNavigate("sales-invoice-detail", { id: invoiceId })}
          >
            ← {t("common.cancel")}
          </PageHeaderButton>
        }
      />
      <InvoiceForm
        initial={initial}
        customers={customers}
        products={products}
        onSaveDraft={(d) => update(d, "DRAFT")}
        onSendNow={(d) => update(d, "SENT")}
      />
    </div>
  );
}
