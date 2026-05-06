// ================================================================
// ToastSystem — global toast notifications via Context
// Usage:
//   <ToastProvider> ... </ToastProvider>
//   const { toast } = useToast();  toast.success("Saved!")
// ================================================================
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  resolvePalette,
} from "../../utils/dashboardPalette";

const ToastContext = createContext(null);

const PALETTES = {
  success: getSuccessPalette(),
  error:   getAlertPalette(),
  warning: getWarningPalette(),
  info:    getCustomerPalette(),
};

const ICONS = {
  success: "✓",
  error:   "⚠",
  warning: "!",
  info:    "i",
};

let idCounter = 0;

export function ToastProvider({ children, position = "bottom-right" }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, kind = "info", { duration = 4000, title } = {}) => {
      const id = ++idCounter;
      setItems((arr) => [...arr, { id, message, kind, title, duration }]);
      if (duration > 0) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const toast = {
    success: (msg, opts) => push(msg, "success", opts),
    error:   (msg, opts) => push(msg, "error", opts),
    warning: (msg, opts) => push(msg, "warning", opts),
    info:    (msg, opts) => push(msg, "info", opts),
    dismiss: remove,
  };

  const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const side = position.includes("right") ? (isRTL ? "left" : "right") : (isRTL ? "right" : "left");
  const vert = position.startsWith("top") ? "top" : "bottom";

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          [vert]: 20,
          [side]: 20,
          display: "flex",
          flexDirection: vert === "top" ? "column" : "column-reverse",
          gap: 10,
          zIndex: 9999,
          pointerEvents: "none",
          maxWidth: "calc(100vw - 40px)",
        }}
      >
        {items.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDismiss }) {
  const p = PALETTES[item.kind] || PALETTES.info;
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      role="status"
      style={{
        background: "#fff",
        borderLeft: `4px solid ${p.base}`,
        borderRadius: 10,
        padding: "12px 14px 12px 14px",
        minWidth: 260,
        maxWidth: 380,
        boxShadow: "0 12px 32px rgba(0,0,0,.12)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        pointerEvents: "auto",
        transform: enter ? "translateY(0)" : "translateY(8px)",
        opacity: enter ? 1 : 0,
        transition: "transform .25s ease, opacity .25s ease",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: p.bg,
          color: p.base,
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {ICONS[item.kind]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && (
          <div style={{ fontSize: 13, fontWeight: 700, color: p.dark, marginBottom: 2 }}>
            {item.title}
          </div>
        )}
        <div style={{ fontSize: 13, color: "#1F2937", lineHeight: 1.45, wordBreak: "break-word" }}>
          {item.message}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="dismiss"
        style={{
          background: "transparent",
          border: "none",
          color: "#9CA3AF",
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Soft fallback so calling toast.x outside provider doesn't crash builds
    return {
      toast: {
        success: (m) => console.log("[toast.success]", m),
        error:   (m) => console.log("[toast.error]", m),
        warning: (m) => console.log("[toast.warning]", m),
        info:    (m) => console.log("[toast.info]", m),
        dismiss: () => {},
      },
    };
  }
  return ctx;
}

export default ToastProvider;
