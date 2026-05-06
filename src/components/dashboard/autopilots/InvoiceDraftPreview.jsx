// ================================================================
// InvoiceDraftPreview — AI-extracted draft with type-out animation
// ================================================================
import React, { useEffect, useState } from "react";
import { getAIPalette, getMoneyPalette, getSuccessPalette, getAlertPalette, getCustomerPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/autopilots/autopilotsApi";

export default function InvoiceDraftPreview({
  draft,
  onConfirm,
  onEdit,
  onDiscard,
  lang = "TR",
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  // Animate items appearing one by one
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (!draft?.items) return;
    setRevealed(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= draft.items.length) clearInterval(id);
    }, 220);
    return () => clearInterval(id);
  }, [draft?.transcript]);

  if (!draft) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#94A3B8",
          fontSize: 13,
          background: ai.bg,
          borderRadius: 14,
          border: `1px dashed ${ai.base}40`,
        }}
      >
        💬 {t("invoice.draft.empty")}
      </div>
    );
  }

  const conf = draft.confidence || 0;
  const confPalette = conf >= 80 ? success : conf >= 60 ? customer : alert;

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${ai.base}40`,
        borderRadius: 18,
        padding: 22,
        boxShadow: `0 12px 36px ${ai.base}25`,
        animation: "draftIn .35s ease",
      }}
    >
      {/* Header — AI confidence */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🤖 {t("invoice.draft.title")}
          </div>
          <div style={{ fontSize: 11, color: confPalette.dark, fontWeight: 700, marginTop: 2 }}>
            {t("invoice.draft.confidence").replace("{pct}", conf)}
          </div>
        </div>
        <div
          style={{
            background: confPalette.bg,
            color: confPalette.dark,
            border: `1px solid ${confPalette.base}40`,
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: confPalette.base,
              animation: "draftDot 1.4s ease-in-out infinite",
            }}
          />
          {conf}%
        </div>
      </div>

      {/* Transcript */}
      {draft.transcript && (
        <div
          style={{
            fontSize: 12,
            color: "#64748B",
            fontStyle: "italic",
            background: ai.bg,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 14,
            borderInlineStart: `3px solid ${ai.base}`,
          }}
        >
          <strong style={{ color: ai.dark, fontStyle: "normal" }}>{t("invoice.draft.transcript")}:</strong> "{draft.transcript}"
        </div>
      )}

      {/* Customer */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
          {t("invoice.draft.customer")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: customer.base,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {(draft.customer?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{draft.customer?.name || "Yeni Müşteri"}</div>
            {draft.customer?.email && <div style={{ fontSize: 11, color: "#64748B" }}>{draft.customer.email}</div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
          {t("invoice.draft.items")} ({draft.items?.length || 0})
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {draft.items?.map((it, i) => {
            const visible = i < revealed;
            return (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: visible ? "#F8FAFC" : "transparent",
                  borderRadius: 8,
                  marginBottom: 6,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-10px)",
                  transition: "opacity .3s ease, transform .3s ease",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    {it.quantity} × {it.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>
                    {fmtCurrency(it.unitPrice)} / unit · KDV {it.vatRate}%
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: money.dark, fontFamily: "monospace" }}>
                  {fmtCurrency(it.quantity * it.unitPrice)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Totals */}
      <div
        style={{
          background: `linear-gradient(135deg, ${money.bg}, ${money.base}15)`,
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1px solid ${money.base}30`,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: money.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t("invoice.draft.total")}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Subtotal {fmtCurrency(draft.subtotal)} + VAT {fmtCurrency(draft.vatTotal)}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
          {fmtCurrency(draft.grandTotal)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onDiscard && (
          <button type="button" onClick={onDiscard} style={btn(alert, "secondary")}>
            {t("invoice.draft.discard")}
          </button>
        )}
        {onEdit && (
          <button type="button" onClick={onEdit} style={btn(customer, "secondary")}>
            {t("invoice.draft.edit")}
          </button>
        )}
        {onConfirm && (
          <button type="button" onClick={onConfirm} style={btn(brand, "primary")}>
            {t("invoice.draft.save.send")}
          </button>
        )}
      </div>

      <style>{`
        @keyframes draftIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes draftDot {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 6px 16px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
