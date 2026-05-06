// ================================================================
// InvoiceStatusPill — colored status badge keyed by invoice status
// ================================================================
import React from "react";
import { getPaletteById } from "../../../utils/dashboardPalette";

const STATUS_PALETTE = {
  DRAFT:     "amber",
  SENT:      "cyan",
  VIEWED:    "indigo",
  PAID:      "emerald",
  OVERDUE:   "rose",
  PENDING:   "amber",
  CANCELLED: "rose",
  // orders
  OPEN:      "cyan",
  PARTIAL:   "amber",
  SHIPPED:   "indigo",
  INVOICED:  "emerald",
  // quotes
  ACCEPTED:  "emerald",
  REJECTED:  "rose",
  EXPIRED:   "amber",
  // customers
  ACTIVE:    "emerald",
  INACTIVE:  "wine",
  AT_RISK:   "rose",
  NEW:       "indigo",
};

export default function InvoiceStatusPill({ status, label, size = "normal" }) {
  const paletteId = STATUS_PALETTE[status] || "wine";
  const p = getPaletteById(paletteId);
  const padding = size === "compact" ? "2px 8px" : "4px 10px";
  const fontSize = size === "compact" ? 10 : 11;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: `${p.base}15`,
        color: p.dark,
        border: `1px solid ${p.base}30`,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: p.base,
          flexShrink: 0,
        }}
      />
      {label || status}
    </span>
  );
}
