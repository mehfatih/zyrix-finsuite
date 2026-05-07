// ================================================================
// SecurityBadge — small "🔒 Encrypted" pill for use across the app.
// Trust Blue ONLY (per build rule #15).
// ================================================================
import React from "react";
import { TRUST_PALETTE } from "../../utils/trustPalette";

export default function SecurityBadge({ icon = "🔒", children, palette = null, size = "sm" }) {
  const p = palette || TRUST_PALETTE;
  const fs = size === "lg" ? 13 : size === "md" ? 12 : 11;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: p.bg,
        color: p.dark,
        border: `1px solid ${p.base}40`,
        padding: size === "lg" ? "6px 12px" : "4px 10px",
        borderRadius: 999,
        fontSize: fs,
        fontWeight: 800,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}
