// ================================================================
// ConfirmDialog — modal for destructive confirmations
// ================================================================
import React, { useEffect, useRef } from "react";
import { resolvePalette, getAlertPalette } from "../../utils/dashboardPalette";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  palette,
  paletteIdx = 0,
  onConfirm,
  onCancel,
  icon,
}) {
  const p = destructive ? getAlertPalette() : resolvePalette(palette, paletteIdx);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    cancelBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmDialogTitle"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        backdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        zIndex: 10000,
        padding: 20,
        animation: "cdFade .2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          padding: 24,
          boxShadow: "0 24px 64px rgba(0,0,0,.25)",
          animation: "cdRise .25s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: p.bg,
              color: p.base,
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {icon || (destructive ? "⚠" : "?")}
          </div>
          <h2
            id="confirmDialogTitle"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p
            style={{
              margin: "0 0 22px",
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#1F2937",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid transparent",
              background: p.base,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: `0 6px 14px ${p.base}40`,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes cdFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cdRise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
