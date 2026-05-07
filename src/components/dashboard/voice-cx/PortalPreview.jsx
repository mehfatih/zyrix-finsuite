// ================================================================
// PortalPreview — phone-mock preview of the public customer portal
// ================================================================
import React from "react";
import { fmtCurrency } from "../../../pages/dashboard/voice-cx/voiceCxApi";

export default function PortalPreview({
  brand = {},
  customer = {},
  invoices = [],
  t = (s) => s,
}) {
  const primary = brand.primaryColor || "#E30A17";
  const welcome = brand.welcomeMessage || `Welcome to your portal`;

  const outstanding = (invoices || [])
    .filter((i) => String(i.status || "").toLowerCase() !== "paid")
    .reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0);

  const items = (invoices || []).slice(0, 4);

  return (
    <div
      style={{
        width: 320, maxWidth: "100%", margin: "0 auto",
        background: "#0F172A",
        borderRadius: 36,
        padding: 12,
        boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
      }}
    >
      <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", minHeight: 540 }}>
        {/* Branded header */}
        <div style={{ background: `linear-gradient(135deg, ${primary}, ${primary}E0)`, color: "#fff", padding: "20px 18px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", overflow: "hidden" }}>
              {brand.logoDataUrl ? (
                <img src={brand.logoDataUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 18 }}>🏢</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>portal.zyrix.co</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{welcome}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>{customer.companyName || customer.name || "Ahmed Yıldız"}</div>
        </div>

        {/* Outstanding balance */}
        <div style={{ padding: "16px 18px" }}>
          <div
            style={{
              background: `linear-gradient(135deg, #fff, ${primary}10)`,
              border: `1.5px solid ${primary}30`,
              borderRadius: 14, padding: 14, marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("portals.public.outstanding")}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: primary, fontFamily: "monospace", margin: "4px 0 8px" }}>
              {fmtCurrency(outstanding)}
            </div>
            {outstanding > 0 && (
              <button
                type="button"
                style={{ background: primary, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", width: "100%" }}
              >
                💳 {t("portals.public.payNow")}
              </button>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("portals.public.recentInvoices")}
          </div>
          {items.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94A3B8", padding: "12px 0", textAlign: "center" }}>{t("portals.public.empty")}</div>
          ) : (
            items.map((inv) => {
              const isPaid = String(inv.status || "").toLowerCase() === "paid";
              return (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{t("portals.public.invoice")} #{inv.invoiceNumber || inv.number || inv.id}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>{fmtCurrency(inv.totalAmount || inv.total || 0)}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 9, fontWeight: 800,
                      background: isPaid ? "#DCFCE7" : "#FEF2F2",
                      color: isPaid ? "#166534" : "#9F1239",
                      padding: "4px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em",
                    }}
                  >
                    {isPaid ? t("portals.public.paid") : t("portals.public.unpaid")}
                  </span>
                </div>
              );
            })
          )}

          <div style={{ marginTop: 16, padding: 12, background: "#F8FAFC", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 8 }}>{t("portals.public.needSomething")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "#fff", color: "#0F172A", padding: "6px 10px", borderRadius: 999, border: "1px solid #E2E8F0" }}>
                {t("portals.public.requestInvoice")}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, background: "#25D366", color: "#fff", padding: "6px 10px", borderRadius: 999 }}>
                💬 {t("portals.public.contact")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
