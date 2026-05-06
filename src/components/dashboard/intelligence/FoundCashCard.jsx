// ================================================================
// FoundCashCard — per-finding card with category palette + actions
// ================================================================
import React from "react";
import { getPaletteById, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/intelligence/intelligenceApi";

const CATEGORY_ICON = {
  subscriptions: "🔁",
  tax:           "🧾",
  bank:          "🏦",
  duplicate:     "🔴",
  pricing:       "💰",
};

export default function FoundCashCard({
  finding,
  lang = "TR",
  onAction,
  onDismiss,
  primaryAction,
  secondaryActions = [],
  t = (s) => s,
  delay = 0,
}) {
  const palette = getPaletteById(finding.severity || "indigo");
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${palette.base}40`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        boxShadow: `0 4px 16px ${palette.base}15`,
        animation: `findIn .55s ease both`,
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: 4,
          height: "100%",
          background: `linear-gradient(180deg, ${palette.base}, ${palette.dark})`,
        }}
      />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
            color: palette.dark,
            display: "grid",
            placeItems: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {CATEGORY_ICON[finding.category] || "💰"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: palette.dark }}>
            {finding.title}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            {finding.subtitle}
          </div>
        </div>
        <div style={{ textAlign: "end" }}>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("hidden.kpi.recovered")}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: palette.base, fontFamily: "monospace" }}>
            +{fmtCurrency(finding.recoverable || finding.amount || 0)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {secondaryActions.map((a, i) => (
          <button
            key={i}
            type="button"
            onClick={() => a.onClick && a.onClick(finding)}
            style={btn(a.palette || palette, "secondary")}
          >
            {a.label}
          </button>
        ))}
        {onDismiss && (
          <button type="button" onClick={() => onDismiss(finding)} style={btn(palette, "ghost")}>
            {t("hidden.dismiss")}
          </button>
        )}
        {primaryAction && (
          <button
            type="button"
            onClick={() => primaryAction.onClick && primaryAction.onClick(finding)}
            style={{
              ...btn(brand, "primary"),
              animation: "actionPulse 2s ease-in-out infinite",
            }}
          >
            ⚡ {primaryAction.label || t("hidden.takeAction")}
          </button>
        )}
      </div>

      <style>{`
        @keyframes findIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes actionPulse {
          0%, 100% { box-shadow: 0 4px 14px ${brand.base}40; }
          50% { box-shadow: 0 6px 22px ${brand.base}70; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
    };
  }
  if (variant === "secondary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "8px 12px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    background: "transparent",
    color: "#64748B",
    border: "1px solid transparent",
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}
