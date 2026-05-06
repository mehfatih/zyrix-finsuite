// ================================================================
// InvoiceActionsBar — sticky action bar with sign/send/pdf/edit/delete
// ================================================================
import React from "react";
import { getBrandPalette, getPaletteById } from "../../../utils/dashboardPalette";

function ActionBtn({ label, icon, onClick, palette, variant = "secondary", disabled }) {
  const p = palette;
  const base = variant === "primary"
    ? { background: p.base, color: "#fff", border: `1px solid ${p.base}` }
    : { background: "#fff", color: p.dark, border: `1px solid ${p.base}30` };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...base,
        padding: "8px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = `0 6px 14px ${p.base}33`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}

export default function InvoiceActionsBar({
  lang = "TR",
  onSign,
  onEmail,
  onWhatsApp,
  onPdf,
  onEdit,
  onDuplicate,
  onDelete,
  signed = false,
  sticky = true,
}) {
  const brand = getBrandPalette(lang.toLowerCase());
  const emerald = getPaletteById("emerald");
  const cyan = getPaletteById("cyan");
  const indigo = getPaletteById("indigo");
  const amber = getPaletteById("amber");
  const rose = getPaletteById("rose");

  return (
    <div
      style={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 10,
        background: "#fff",
        border: `1px solid ${brand.base}20`,
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: `0 4px 14px ${brand.base}10`,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <ActionBtn label="GİB" icon="✍️" onClick={onSign} palette={brand} variant="primary" disabled={signed} />
      <ActionBtn label="WhatsApp" icon="💬" onClick={onWhatsApp} palette={emerald} />
      <ActionBtn label="Email" icon="✉️" onClick={onEmail} palette={cyan} />
      <ActionBtn label="PDF" icon="📄" onClick={onPdf} palette={indigo} />
      <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 4px" }} />
      <ActionBtn label="Edit" icon="✏️" onClick={onEdit} palette={amber} />
      <ActionBtn label="Duplicate" icon="⎘" onClick={onDuplicate} palette={indigo} />
      <ActionBtn label="Delete" icon="🗑" onClick={onDelete} palette={rose} />
    </div>
  );
}
