// ================================================================
// BulkActionsBar — floating bar shown when rows selected
// ================================================================
import React from "react";
import { ADMIN_BRAND, CRITICAL_RED } from "../../utils/admin/adminPalette";

export default function BulkActionsBar({ count = 0, onClear, actions = [] }) {
  if (count === 0) return null;
  const brand = ADMIN_BRAND;
  return (
    <div role="toolbar" style={{
      position: "fixed",
      bottom: 24,
      insetInlineStart: "50%",
      transform: "translateX(-50%)",
      zIndex: 90,
      background: "#0F172A",
      color: "#fff",
      borderRadius: 16,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 16px 40px rgba(15,23,42,0.4)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}>
      <span style={{ fontSize: 12, fontWeight: 800 }}>
        ✓ {count} selected
      </span>
      <span style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
      {actions.map((a, i) => (
        <button
          key={i}
          type="button"
          onClick={a.onClick}
          style={{
            background: a.variant === "danger" ? CRITICAL_RED.base : a.variant === "primary" ? brand.base : "rgba(255,255,255,0.1)",
            color: "#fff", border: "none",
            padding: "7px 12px", borderRadius: 8,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          {a.icon} {a.label}
        </button>
      ))}
      <button type="button" onClick={onClear} style={{ background: "transparent", color: "rgba(255,255,255,0.7)", border: "none", padding: "4px 8px", fontSize: 14, cursor: "pointer" }}>✗</button>
    </div>
  );
}
