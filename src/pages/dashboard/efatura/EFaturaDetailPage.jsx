// ================================================================
// e-Fatura Detail — preview + actions + UBL XML viewer + status flow
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getMoneyPalette,
  getReportsPalette,
  getSuccessPalette,
  getCustomerPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import EFaturaStatusFlow from "../../../components/dashboard/efatura/EFaturaStatusFlow";
import XmlPreview from "../../../components/dashboard/efatura/XmlPreview";
import GibSubmitDialog from "../../../components/dashboard/efatura/GibSubmitDialog";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./efaturaApi";

const STATUS_ORDER = ["DRAFT", "SIGNED", "SUBMITTED", "RECEIVED", "ACKNOWLEDGED"];

export default function EFaturaDetailPage({ invoiceId, archive = false, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();

  const [inv, setInv] = useState(null);
  const [xmlOpen, setXmlOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const KEY = archive ? KEYS.archive : KEYS.outgoing;

  useEffect(() => {
    if (!invoiceId) return;
    setInv(localStore.get(KEY, invoiceId));
  }, [invoiceId, KEY]);

  if (!inv) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 2400);
  };

  const update = (patch) => {
    localStore.update(KEY, inv.id, patch);
    setInv({ ...inv, ...patch });
  };

  const sign = () => {
    update({ status: "SIGNED", signedAt: new Date().toISOString() });
    showToast("success", t("common.success"));
  };

  const submitGib = (signer) => {
    const now = new Date().toISOString();
    update({ status: "SUBMITTED", signedAt: inv.signedAt || now, submittedAt: now, signer });
    setDialogOpen(false);
    showToast("success", t("gib.success"));
  };

  const cancel = () => {
    if (!window.confirm(t("common.confirm") + "?")) return;
    update({ status: "CANCELLED" });
    showToast("success", t("common.success"));
  };

  const items = Array.isArray(inv.items) ? inv.items : [];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={inv.serial}
        subtitle={inv.customerName}
        icon="📄"
        palette={brand}
        breadcrumb={[
          { label: archive ? t("archive.title") : t("outgoing.title"), href: archive ? "#efatura-archive" : "#efatura-outgoing" },
          { label: inv.serial },
        ]}
        actions={
          <PageHeaderButton palette={brand} variant="ghost" onClick={() => onNavigate && onNavigate(archive ? "efatura-archive" : "efatura-outgoing")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* Action bar */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${brand.base}25`,
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: `0 4px 14px ${brand.base}10`,
        }}
      >
        <InvoiceStatusPill status={inv.status} label={t(`outgoing.status.${inv.status}`)} />
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => setXmlOpen((v) => !v)} style={btn(reports, "secondary")}>
          🧾 {t("detail.actions.preview.xml")}
        </button>
        {inv.status === "DRAFT" && (
          <button type="button" onClick={sign} style={btn(customer, "secondary")}>
            ✍️ {t("detail.actions.sign")}
          </button>
        )}
        {!archive && (inv.status === "DRAFT" || inv.status === "SIGNED") && (
          <button type="button" onClick={() => setDialogOpen(true)} style={btn(brand, "primary")}>
            📤 {t("detail.actions.submit.gib")}
          </button>
        )}
        {inv.status !== "CANCELLED" && (
          <button type="button" onClick={cancel} style={btn(reports, "secondary")}>
            ✗ {t("detail.actions.cancel")}
          </button>
        )}
      </div>

      {!archive && (
        <Card palette={brand} title={t("outgoing.flow.title")} icon="🔁" style={{ marginBottom: 18 }}>
          <EFaturaStatusFlow
            counts={STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: STATUS_ORDER.indexOf(inv.status) >= STATUS_ORDER.indexOf(s) ? 1 : 0 }), {})}
            currentStatus={inv.status}
            lang={lang}
            t={t}
          />
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18 }} className="ef-detail-grid">
        <div
          style={{
            background: "#fff",
            border: `1px solid ${brand.base}20`,
            borderRadius: 16,
            padding: 24,
            boxShadow: `0 4px 18px ${brand.base}10`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                Z
              </div>
              <div style={{ color: "#0F172A", fontWeight: 800, fontSize: 18 }}>Zyrix FinSuite</div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ color: brand.dark, fontWeight: 800, fontSize: 22 }}>{archive ? "e-ARŞİV" : "e-FATURA"}</div>
              <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
                <div>
                  <strong style={{ color: "#475569" }}>{t("detail.gib.serial")}:</strong> <span style={{ fontFamily: "monospace" }}>{inv.serial}</span>
                </div>
                {inv.uuid && (
                  <div>
                    <strong style={{ color: "#475569" }}>{t("detail.gib.uuid")}:</strong>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: 10 }}>{inv.uuid}</span>
                  </div>
                )}
                <div>{fmtDate(inv.createdAt, lang)}</div>
                <div>Due {fmtDate(inv.dueDate, lang)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bill To</div>
            <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 14, marginTop: 2 }}>{inv.customerName}</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>
              {inv.customerEmail && <div>{inv.customerEmail}</div>}
              {inv.customerTaxId && <div>VKN: {inv.customerTaxId}</div>}
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
                    {fmtCurrency(it.unitPrice, inv.currency)}
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.vatRate ?? 0}%</td>
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
            <span style={{ color: brand.dark, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${brand.base}30` }}>
              Grand Total
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
              {fmtCurrency(inv.total, inv.currency)}
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              background: inv.status === "SUBMITTED" || inv.status === "RECEIVED" || inv.status === "ACKNOWLEDGED" ? success.bg : brand.bg,
              border: `1.5px solid ${(inv.status === "SUBMITTED" || inv.status === "RECEIVED" ? success : brand).base}30`,
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              GİB
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: (inv.status === "SUBMITTED" || inv.status === "RECEIVED" ? success : brand).base }}>
              {inv.status === "ACKNOWLEDGED" ? "✅" : inv.status === "SUBMITTED" || inv.status === "RECEIVED" ? "📤" : "⏳"}
              {" "}
              {t(`outgoing.status.${inv.status}`)}
            </div>
            {inv.signedAt && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#64748B" }}>
                <div>{t("detail.signed.by")}: <strong>{inv.signer || "—"}</strong></div>
                <div>{t("detail.signed.at")}: {fmtDate(inv.signedAt, lang)}</div>
              </div>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              border: `1px solid ${money.base}20`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: money.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Total
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
              {fmtCurrency(inv.total, inv.currency)}
            </div>
          </div>
        </div>
      </div>

      {xmlOpen && (
        <div style={{ marginTop: 18 }}>
          <XmlPreview invoice={inv} t={t} />
        </div>
      )}

      <GibSubmitDialog
        open={dialogOpen}
        lang={lang}
        t={t}
        onCancel={() => setDialogOpen(false)}
        onConfirm={submitGib}
      />

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

      <style>{`@media (max-width: 880px) { .ef-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
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
