// ================================================================
// Purchase Invoice Detail — preview + actions + timeline
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./purchasesApi";

export default function PurchaseInvoiceDetailPage({ invoiceId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const [inv, setInv] = useState(null);

  useEffect(() => {
    if (!invoiceId) return;
    setInv(localStore.get(KEYS.purchases, invoiceId));
  }, [invoiceId]);

  if (!inv) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const update = (patch) => {
    localStore.update(KEYS.purchases, inv.id, patch);
    setInv({ ...inv, ...patch });
  };

  const remove = () => {
    if (!window.confirm(t("common.confirm") + "?")) return;
    localStore.remove(KEYS.purchases, inv.id);
    onNavigate && onNavigate("purch-invoices");
  };

  const items = Array.isArray(inv.items) ? inv.items : [];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={inv.number}
        subtitle={inv.supplierName}
        icon="📥"
        palette={market}
        breadcrumb={[
          { label: t("invoices.title"), href: "#purch-invoices" },
          { label: inv.number },
        ]}
        actions={
          <PageHeaderButton palette={market} variant="ghost" onClick={() => onNavigate && onNavigate("purch-invoices")}>
            ←
          </PageHeaderButton>
        }
      />

      <div
        style={{
          background: "#fff",
          border: `1px solid ${market.base}25`,
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: `0 4px 14px ${market.base}10`,
        }}
      >
        <InvoiceStatusPill status={inv.status} label={t(`invoices.status.${inv.status}`)} />
        <div style={{ flex: 1 }} />
        {inv.status === "PENDING_ACCEPT" && (
          <>
            <button type="button" onClick={() => update({ status: "ACCEPTED" })} style={btn(success, "primary")}>
              ✓ {t("detail.actions.accept")}
            </button>
            <button type="button" onClick={() => update({ status: "REJECTED" })} style={btn(alert)}>
              ✗ {t("detail.actions.reject")}
            </button>
          </>
        )}
        {inv.status === "ACCEPTED" && (
          <button type="button" onClick={() => update({ status: "PAID", paidDate: new Date().toISOString() })} style={btn(brand, "primary")}>
            💵 {t("detail.actions.pay")}
          </button>
        )}
        <button type="button" onClick={remove} style={btn(alert)}>
          🗑 {t("detail.actions.delete")}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18 }} className="purch-detail-grid">
        <div
          style={{
            background: "#fff",
            border: `1px solid ${market.base}20`,
            borderRadius: 16,
            padding: 24,
            boxShadow: `0 4px 18px ${market.base}10`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${market.base}, ${market.dark})`,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                {(inv.supplierName || "?")[0].toUpperCase()}
              </div>
              <div style={{ color: "#0F172A", fontWeight: 800, fontSize: 16 }}>{inv.supplierName}</div>
              {inv.supplierTaxId && <div style={{ color: "#64748B", fontSize: 12 }}>VKN {inv.supplierTaxId}</div>}
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ color: market.dark, fontWeight: 800, fontSize: 22 }}>PURCHASE INVOICE</div>
              <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
                <div>#{inv.number}</div>
                <div>{fmtDate(inv.createdAt, lang)}</div>
                <div>Due {fmtDate(inv.dueDate, lang)}</div>
              </div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: market.bg }}>
                <th style={{ textAlign: "start", padding: "8px 10px", color: market.dark }}>Description</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: market.dark }}>Qty</th>
                <th style={{ textAlign: "end", padding: "8px 10px", color: market.dark }}>Price</th>
                <th style={{ textAlign: "end", padding: "8px 10px", color: market.dark }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "8px 10px" }}>{it.name || "—"}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.quantity}</td>
                  <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                    {fmtCurrency(it.unitPrice, inv.currency)}
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                    {fmtCurrency((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), inv.currency)}
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
            <span style={{ color: "#475569" }}>Subtotal</span>
            <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmtCurrency(inv.subtotal, inv.currency)}</span>
            <span style={{ color: "#475569" }}>VAT</span>
            <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmtCurrency(inv.vatAmount, inv.currency)}</span>
            <span style={{ color: market.dark, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${market.base}30` }}>
              Grand Total
            </span>
            <span
              style={{
                textAlign: "end",
                fontFamily: "monospace",
                fontWeight: 800,
                color: market.base,
                fontSize: 16,
                paddingTop: 8,
                borderTop: `1px solid ${market.base}30`,
              }}
            >
              {fmtCurrency(inv.total, inv.currency)}
            </span>
          </div>

          {inv.notes && (
            <div style={{ marginTop: 18, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#475569" }}>
              {inv.notes}
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${market.base}20`,
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: market.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
              {t("detail.timeline.title")}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <TimelineRow icon="📥" label={t("detail.timeline.received")} date={inv.createdAt} palette={market} />
              {(inv.status === "ACCEPTED" || inv.status === "PAID") && (
                <TimelineRow icon="✓" label={t("detail.timeline.accepted")} date={inv.createdAt} palette={success} />
              )}
              {inv.status === "PAID" && (
                <TimelineRow icon="💵" label={t("detail.timeline.paid")} date={inv.paidDate || inv.createdAt} palette={brand} />
              )}
            </ul>
          </div>

          <div
            style={{
              background: inv.status === "PAID" ? success.bg : market.bg,
              border: `1.5px solid ${(inv.status === "PAID" ? success : market).base}30`,
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: (inv.status === "PAID" ? success : market).dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {t("invoices.col.status")}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: (inv.status === "PAID" ? success : market).base }}>
              {inv.status === "PAID" ? "✅" : inv.status === "REJECTED" ? "✗" : "⏳"} {t(`invoices.status.${inv.status}`)}
            </div>
            <div style={{ fontSize: 12, color: money.dark, marginTop: 8, fontFamily: "monospace", fontWeight: 800 }}>
              {fmtCurrency(inv.total, inv.currency)}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 880px) { .purch-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function TimelineRow({ icon, label, date, palette }) {
  return (
    <li style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: palette.bg,
          color: palette.dark,
          display: "grid",
          placeItems: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{label}</div>
        <div style={{ fontSize: 11, color: "#64748B" }}>{new Date(date).toLocaleString("tr-TR")}</div>
      </div>
    </li>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}30`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
