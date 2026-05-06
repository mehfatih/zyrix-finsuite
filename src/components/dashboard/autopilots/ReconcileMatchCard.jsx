// ================================================================
// ReconcileMatchCard — auto-matched bank-txn ↔ invoice pair card
// ================================================================
import React from "react";
import { getSuccessPalette, getCustomerPalette, getAlertPalette, getAIPalette, getMoneyPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency, fmtDate } from "../../../pages/dashboard/autopilots/autopilotsApi";

export default function ReconcileMatchCard({
  match,
  lang = "TR",
  onConfirm,
  onOverride,
  t = (s) => s,
}) {
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const money = getMoneyPalette();

  const conf = match.confidence || 0;
  const confPalette = conf >= 90 ? success : conf >= 70 ? customer : alert;

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${confPalette.base}30`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: `0 2px 10px ${confPalette.base}10`,
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 22px ${confPalette.base}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = `0 2px 10px ${confPalette.base}10`;
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }} className="rmc-grid">
        {/* LEFT: bank statement */}
        <div style={{ background: customer.bg, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: customer.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            🏦 Bank
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 2 }}>
            {fmtDate(match.statement?.date, lang)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {match.statement?.description || "—"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: customer.base, fontFamily: "monospace" }}>
            {fmtCurrency(match.statement?.amount)}
          </div>
        </div>

        {/* CENTER: confidence indicator */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${confPalette.base}, ${confPalette.dark})`,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 20,
              fontWeight: 800,
              boxShadow: `0 4px 12px ${confPalette.base}40`,
              marginInline: "auto",
            }}
          >
            ↔
          </div>
          <div style={{ fontSize: 10, color: confPalette.dark, fontWeight: 800, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {conf}%
          </div>
        </div>

        {/* RIGHT: invoice */}
        <div style={{ background: money.bg, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: money.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            🧾 Invoice
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 2, fontFamily: "monospace" }}>
            #{match.invoice?.invoiceNumber || match.invoice?.id?.slice(0, 8) || "—"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {match.invoice?.customerName || "—"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: money.base, fontFamily: "monospace" }}>
            {fmtCurrency(match.invoice?.total, match.invoice?.currency)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: ai.dark, fontWeight: 700 }}>
          <span style={{ background: ai.bg, padding: "3px 8px", borderRadius: 999, border: `1px solid ${ai.base}30` }}>
            🤖 {match.reason || "Amount + date match"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {match.status === "CONFIRMED" || match.status === "AUTO" ? (
            <span style={{ fontSize: 11, color: success.base, fontWeight: 800, padding: "5px 10px", background: success.bg, borderRadius: 8 }}>
              ✓ {t("recon.match.confirmed")}
            </span>
          ) : (
            <>
              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  style={{
                    background: `linear-gradient(135deg, ${success.base}, ${success.dark})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✓
                </button>
              )}
              {onOverride && (
                <button
                  type="button"
                  onClick={onOverride}
                  style={{
                    background: alert.bg,
                    color: alert.dark,
                    border: `1px solid ${alert.base}40`,
                    borderRadius: 8,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {t("recon.match.override")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 540px) { .rmc-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
