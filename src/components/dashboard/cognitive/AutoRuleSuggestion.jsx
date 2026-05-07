// ================================================================
// AutoRuleSuggestion — "auto-approve invoices from supplier X"
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette } from "../../../utils/dashboardPalette";

export default function AutoRuleSuggestion({ rules = [], onEnable, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const success = getSuccessPalette();

  if (rules.length === 0) {
    return (
      <div style={{ padding: 18, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
        {t("decisions.autoRule.empty")}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        🤖 {t("decisions.autoRule.subtitle")}
      </div>
      {rules.map((r, i) => (
        <div
          key={`${r.kind}-${r.decision}-${i}`}
          style={{
            background: "#fff",
            border: `1.5px solid ${ai.base}30`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
              {t(`decisions.kind.${r.kind}`)} · {t(`decisions.action.${r.decision}`)}
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              {t("decisions.autoRule.times").replace("{n}", r.count).replace("{total}", r.total)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEnable && onEnable(r)}
            style={{
              background: `linear-gradient(135deg, ${success.base}, ${success.dark})`,
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${success.base}40`,
              whiteSpace: "nowrap",
            }}
          >
            ⚡ {t("decisions.autoRule.enable")}
          </button>
        </div>
      ))}
    </div>
  );
}
