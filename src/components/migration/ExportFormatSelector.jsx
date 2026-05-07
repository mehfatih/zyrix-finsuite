// ================================================================
// ExportFormatSelector — format chips (CSV/XLSX/JSON/PDF)
// ================================================================
import React from "react";
import { getBrandPalette } from "../../utils/dashboardPalette";

const FORMATS = ["csv", "xlsx", "json", "pdf"];

export default function ExportFormatSelector({ value, onChange, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FORMATS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange?.(f)}
            aria-pressed={active}
            style={{
              background: active ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : brand.bg,
              color: active ? "#fff" : brand.dark,
              border: `1px solid ${active ? brand.base : brand.base + "30"}`,
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t(`export.format.${f}`)}
          </button>
        );
      })}
    </div>
  );
}
