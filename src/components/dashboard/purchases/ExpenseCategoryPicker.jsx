// ================================================================
// ExpenseCategoryPicker — quick-select pill grid for expense categories
// ================================================================
import React from "react";
import { paletteSequence } from "../../../utils/dashboardPalette";

export const EXPENSE_CATEGORIES = [
  { id: "fuel",      icon: "⛽" },
  { id: "office",    icon: "🖇️" },
  { id: "travel",    icon: "✈️" },
  { id: "utilities", icon: "💡" },
  { id: "rent",      icon: "🏠" },
  { id: "marketing", icon: "📣" },
  { id: "salary",    icon: "💼" },
  { id: "other",     icon: "•" },
];

export default function ExpenseCategoryPicker({ value, onChange, t = (s) => s }) {
  const palettes = paletteSequence(EXPENSE_CATEGORIES.length, { exclude: ["wine"] });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
      {EXPENSE_CATEGORIES.map((c, i) => {
        const palette = palettes[i];
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
              background: active ? palette.bg : "#fff",
              color: active ? palette.dark : "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 6px 14px ${palette.base}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <span style={{ flex: 1, textAlign: "start" }}>{t(`expenses.cat.${c.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
