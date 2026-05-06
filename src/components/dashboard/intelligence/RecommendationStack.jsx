// ================================================================
// RecommendationStack — vertically-stacked AI suggestion cards
// ================================================================
import React from "react";
import { resolvePalette, getAIPalette, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export default function RecommendationStack({
  items = [],
  lang = "TR",
  t = (s) => s,
  onAction,
  onDismiss,
}) {
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  if (items.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
        {t("common.empty") || "—"}
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((rec, i) => {
        const palette = resolvePalette(rec.palette || ai);
        return (
          <li
            key={rec.id || i}
            style={{
              background: "#fff",
              border: `1.5px solid ${palette.base}30`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              alignItems: "center",
              boxShadow: `0 2px 10px ${palette.base}10`,
              animation: `recIn .35s ease both`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
                color: palette.dark,
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {rec.icon || "💡"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                {rec.title}
              </div>
              {rec.subtitle && (
                <div style={{ fontSize: 11, color: "#64748B" }}>{rec.subtitle}</div>
              )}
              {rec.impact && (
                <div style={{ fontSize: 12, color: money.base, fontWeight: 800, marginTop: 4, fontFamily: "monospace" }}>
                  +{rec.impact}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(rec)}
                  style={{
                    background: "transparent",
                    color: "#94A3B8",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              )}
              {onAction && (
                <button
                  type="button"
                  onClick={() => onAction(rec)}
                  style={{
                    background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: `0 4px 12px ${brand.base}30`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rec.actionLabel || "Take Action"}
                </button>
              )}
            </div>
            <style>{`
              @keyframes recIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </li>
        );
      })}
    </ul>
  );
}
