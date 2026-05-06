// ================================================================
// DrawerForm — slide-in form panel from the side
// ================================================================
import React, { useEffect } from "react";
import { resolvePalette } from "../../utils/dashboardPalette";

export default function DrawerForm({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  width = 460,
  side = "right",
  palette,
  paletteIdx = 0,
  busy = false,
  children,
  footer,
}) {
  const p = resolvePalette(palette, paletteIdx);
  const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const physicalSide = isRTL
    ? (side === "right" ? "left" : "right")
    : side;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        zIndex: 10000,
        display: "flex",
        justifyContent: physicalSide === "right" ? "flex-end" : "flex-start",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) onSubmit?.(e);
        }}
        style={{
          background: "#fff",
          width: "min(100vw, " + width + "px)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: physicalSide === "right" ? "-24px 0 64px rgba(0,0,0,.2)" : "24px 0 64px rgba(0,0,0,.2)",
          animation: physicalSide === "right" ? "dfSlideR .3s ease" : "dfSlideL .3s ease",
        }}
      >
        <header
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #E2E8F0",
            background: p.bg,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: p.dark, lineHeight: 1.2 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: p.dark, opacity: 0.7 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#fff",
              border: `1px solid ${p.base}30`,
              color: p.dark,
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </header>

        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>{children}</div>

        <footer
          style={{
            padding: "14px 22px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            background: "#FAFAFE",
          }}
        >
          {footer}
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#1F2937",
              fontWeight: 700,
              fontSize: 13,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid transparent",
                background: p.base,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.7 : 1,
                boxShadow: `0 6px 14px ${p.base}40`,
              }}
            >
              {busy ? "…" : submitText}
            </button>
          )}
        </footer>
      </form>
      <style>{`
        @keyframes dfSlideR { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes dfSlideL { from { transform: translateX(-20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

// Small input helpers for use inside DrawerForm
export function FormField({ label, children, hint, error, required }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "#374151",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
        {required && <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && !error && (
        <span style={{ display: "block", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
          {hint}
        </span>
      )}
      {error && (
        <span style={{ display: "block", fontSize: 11, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function FormInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #E2E8F0",
        fontSize: 14,
        color: "#0F172A",
        background: "#fff",
        outline: "none",
        boxSizing: "border-box",
        ...(props.style || {}),
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#6366F1";
        e.currentTarget.style.boxShadow = "0 0 0 3px #6366F122";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}
