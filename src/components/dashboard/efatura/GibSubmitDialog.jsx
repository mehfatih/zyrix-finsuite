// ================================================================
// GibSubmitDialog — confirmation modal for irreversible GİB send
// ================================================================
import React, { useState } from "react";
import { getBrandPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function GibSubmitDialog({ open, lang = "TR", onConfirm, onCancel, t = (s) => s, defaultSigner = "" }) {
  const brand = getBrandPalette(lang.toLowerCase());
  const alert = getAlertPalette();
  const [signer, setSigner] = useState(defaultSigner);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!signer.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(signer.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
        zIndex: 320,
        display: "grid",
        placeItems: "center",
        padding: 20,
        animation: "fadeIn .15s ease",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 22,
          maxWidth: 460,
          width: "100%",
          boxShadow: `0 16px 48px ${brand.base}40`,
          borderTop: `4px solid ${brand.base}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow: `0 6px 18px ${brand.base}40`,
            }}
          >
            ✍️
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: brand.dark }}>
              {t("gib.dialog.title")}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>GİB e-Fatura Sistemi</div>
          </div>
        </div>

        <div
          style={{
            background: alert.bg,
            border: `1px solid ${alert.base}30`,
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 12,
            color: alert.dark,
            marginBottom: 14,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16 }}>⚠</span>
          <span>{t("gib.dialog.warning")}</span>
        </div>

        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>
            {t("gib.dialog.signer")}
          </div>
          <input
            type="text"
            value={signer}
            onChange={(e) => setSigner(e.target.value)}
            placeholder="Ahmet Yılmaz · CFO"
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1.5px solid ${brand.base}25`,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${brand.base}30`,
              background: "#fff",
              color: brand.dark,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t("gib.dialog.cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!signer.trim() || submitting}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: submitting || !signer.trim() ? "#CBD5E1" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: submitting || !signer.trim() ? "not-allowed" : "pointer",
              boxShadow: submitting || !signer.trim() ? "none" : `0 4px 12px ${brand.base}40`,
            }}
          >
            {submitting ? "⟳ " : "✓ "} {t("gib.dialog.confirm")}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
