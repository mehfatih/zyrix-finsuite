// ================================================================
// Sales Invoice Detail — preview + actions bar + activity timeline
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getCustomerPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import InvoiceActionsBar from "../../../components/dashboard/sales/InvoiceActionsBar";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { api, apiBase, fmtCurrency, fmtDate, daysBetween } from "./salesApi";

export default function SalesInvoiceDetailPage({ invoiceId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!invoiceId) return;
    api(`/api/invoices/${invoiceId}`).then((res) => {
      setInvoice(res?.data || null);
      setLoading(false);
    });
  }, [invoiceId]);

  const showToast = (msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const downloadPdf = async () => {
    const token = localStorage.getItem("zyrix_token");
    const res = await fetch(`${apiBase}/api/invoices/${invoiceId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      showToast("PDF " + t("common.error"), "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markPaid = async () => {
    await api(`/api/invoices/${invoiceId}/paid`, { method: "PUT" });
    setInvoice({ ...invoice, status: "PAID", paidDate: new Date().toISOString() });
    showToast(t("common.success"));
  };

  const remove = async () => {
    if (!window.confirm(t("common.confirm") + "?")) return;
    await api(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    if (onNavigate) onNavigate("sales-invoices");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;
  if (!invoice) return <div style={{ padding: 40, textAlign: "center" }}>404</div>;

  const status = invoice.status || "DRAFT";
  const overdueDays = invoice.dueDate && status !== "PAID" ? daysBetween(invoice.dueDate) : 0;
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const timeline = [
    { date: invoice.createdAt, label: t("detail.timeline.created"), icon: "📝", palette: customer },
    invoice.status === "SENT" || invoice.status === "VIEWED" || invoice.status === "PAID"
      ? { date: invoice.updatedAt, label: t("detail.timeline.sent"), icon: "📤", palette: brand }
      : null,
    invoice.paidDate
      ? { date: invoice.paidDate, label: t("detail.timeline.paid"), icon: "💵", palette: success }
      : null,
  ].filter(Boolean);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={invoice.invoiceNumber || (invoice.id || "").slice(0, 8)}
        subtitle={invoice.customerName}
        icon="🧾"
        palette={brand}
        breadcrumb={[
          { label: t("invoices.title"), href: "#sales-invoices" },
          { label: invoice.invoiceNumber || "—" },
        ]}
        actions={
          <PageHeaderButton palette={brand} variant="ghost" onClick={() => onNavigate && onNavigate("sales-invoices")}>
            ← {t("invoices.title")}
          </PageHeaderButton>
        }
      />

      <div style={{ marginBottom: 18 }}>
        <InvoiceActionsBar
          lang={lang}
          onSign={() => showToast("GİB " + t("common.success"))}
          onEmail={() => showToast(t("create.send.email") + " " + t("common.success"))}
          onWhatsApp={() => showToast(t("create.send.whatsapp") + " " + t("common.success"))}
          onPdf={downloadPdf}
          onEdit={() => onNavigate && onNavigate("sales-invoice-edit", { id: invoiceId })}
          onDuplicate={() => onNavigate && onNavigate("sales-invoice-new")}
          onDelete={remove}
        />
      </div>

      {overdueDays > 0 && (
        <div
          style={{
            background: "#FFE4E6",
            border: "1px solid #F43F5E40",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "#9F1239", fontWeight: 700, fontSize: 13 }}>
            ⚡ {t("detail.overdue.days").replace("{days}", overdueDays)}
          </span>
          <button
            type="button"
            style={{
              background: "#F43F5E",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => showToast(t("detail.send.reminder") + " ✓")}
          >
            {t("detail.send.reminder")}
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 18,
        }}
        className="sales-detail-grid"
      >
        {/* Invoice preview */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${brand.base}20`,
            borderRadius: 16,
            padding: 24,
            boxShadow: `0 4px 18px ${brand.base}10`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 22,
                  marginBottom: 8,
                }}
              >
                Z
              </div>
              <div style={{ color: "#0F172A", fontWeight: 800, fontSize: 18 }}>Zyrix FinSuite</div>
              <div style={{ color: "#64748B", fontSize: 12 }}>invoices@zyrix.com</div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ color: brand.dark, fontWeight: 800, fontSize: 22 }}>INVOICE</div>
              <InvoiceStatusPill status={status} label={t(`invoices.status.${status}`)} />
              <div style={{ color: "#64748B", fontSize: 12, marginTop: 6 }}>
                <div>{fmtDate(invoice.createdAt, lang)}</div>
                <div>Due {fmtDate(invoice.dueDate, lang)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bill To</div>
            <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 14, marginTop: 2 }}>{invoice.customerName}</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>
              {invoice.customerEmail && <div>{invoice.customerEmail}</div>}
              {invoice.customerPhone && <div>{invoice.customerPhone}</div>}
              {invoice.customerTaxId && <div>VKN: {invoice.customerTaxId}</div>}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: brand.bg }}>
                <th style={{ textAlign: "start", padding: "8px 10px", color: brand.dark }}>Description</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: brand.dark }}>Qty</th>
                <th style={{ textAlign: "end", padding: "8px 10px", color: brand.dark }}>Price</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: brand.dark }}>VAT</th>
                <th style={{ textAlign: "end", padding: "8px 10px", color: brand.dark }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "8px 10px" }}>{it.name || "—"}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.quantity}</td>
                  <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                    {fmtCurrency(it.unitPrice, invoice.currency)}
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.vatRate ?? invoice.vatRate ?? 0}%</td>
                  <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                    {fmtCurrency((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 6,
              maxWidth: 320,
              marginInlineStart: "auto",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#475569" }}>{t("create.subtotal")}</span>
            <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmtCurrency(invoice.subtotal, invoice.currency)}</span>
            <span style={{ color: "#475569" }}>{t("create.vat")}</span>
            <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmtCurrency(invoice.vatAmount, invoice.currency)}</span>
            <span style={{ color: brand.dark, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${brand.base}30` }}>
              {t("create.grandtotal")}
            </span>
            <span
              style={{
                textAlign: "end",
                fontFamily: "monospace",
                fontWeight: 800,
                color: brand.base,
                fontSize: 16,
                paddingTop: 8,
                borderTop: `1px solid ${brand.base}30`,
              }}
            >
              {fmtCurrency(invoice.total, invoice.currency)}
            </span>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: 18, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#475569" }}>
              {invoice.notes}
            </div>
          )}

          <div style={{ marginTop: 18, padding: 12, background: brand.bg, borderRadius: 10, fontSize: 11, color: brand.dark }}>
            <strong>{t("detail.bank.title")}:</strong> Türkiye İş Bankası · TR48 0006 0000 0000 0000 0000 00
          </div>
        </div>

        {/* Timeline + status panel */}
        <div>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${customer.base}20`,
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: customer.dark,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              {t("detail.timeline.title")}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {timeline.map((evt, i) => (
                <li key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: evt.palette.bg,
                      color: evt.palette.dark,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {evt.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{evt.label}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{fmtDate(evt.date, lang)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: status === "PAID" ? success.bg : brand.bg,
              border: `1.5px solid ${status === "PAID" ? success.base : brand.base}30`,
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: status === "PAID" ? success.dark : brand.dark,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {t("invoices.col.status")}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: status === "PAID" ? success.base : brand.base, marginBottom: 8 }}>
              {status === "PAID" ? "✅" : "⏳"} {t(`invoices.status.${status}`)}
            </div>
            {status !== "PAID" && (
              <button
                type="button"
                onClick={markPaid}
                style={{
                  background: success.base,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                ✓ Mark as Paid
              </button>
            )}
            {status === "PAID" && invoice.paidDate && (
              <div style={{ fontSize: 12, color: success.dark, marginTop: 4 }}>
                {fmtDate(invoice.paidDate, lang)}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .sales-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

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
