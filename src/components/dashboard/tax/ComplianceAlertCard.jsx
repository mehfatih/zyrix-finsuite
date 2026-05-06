// ================================================================
// ComplianceAlertCard — government law-change alert with action buttons
// ================================================================
import React from "react";
import { getPaletteById, getBrandPalette } from "../../../utils/dashboardPalette";

const SEVERITY_PALETTE = {
  HIGH:   "rose",
  MEDIUM: "amber",
  LOW:    "cyan",
};

export default function ComplianceAlertCard({
  alert,
  lang = "TR",
  onViewProducts,
  onApplyAll,
  onDismiss,
  t = (s) => s,
}) {
  const brand = getBrandPalette(lang.toLowerCase());
  const palette = getPaletteById(SEVERITY_PALETTE[alert.severity || "HIGH"]);
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
      return new Date(d).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return "—";
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1.5px solid ${palette.base}40`,
        boxShadow: `0 6px 24px ${palette.base}20`,
        overflow: "hidden",
        animation: "alertIn .35s ease",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("compliance.alert.new")}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            background: "rgba(255,255,255,0.2)",
            padding: "3px 8px",
            borderRadius: 999,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {t(`compliance.severity.${alert.severity || "HIGH"}`)}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>
          {t("compliance.alert.effective")}: <strong style={{ color: palette.dark }}>{fmtDate(alert.effectiveDate)}</strong>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12, lineHeight: 1.5 }}>
          {alert.title}
        </div>
        {alert.description && (
          <div style={{ fontSize: 13, color: "#475569", marginBottom: 12, lineHeight: 1.6 }}>
            {alert.description}
          </div>
        )}

        {alert.affectedCount > 0 && (
          <div
            style={{
              background: palette.bg,
              border: `1px solid ${palette.base}30`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: palette.dark,
              fontWeight: 700,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>⚡</span>
            <span>
              {t("compliance.alert.affects").replace(/of/, `${alert.affectedCount} of`)} —{" "}
              {alert.affectedKind || "products"}
            </span>
          </div>
        )}

        {alert.suggestedAction && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
              {t("compliance.alert.action")}
            </div>
            <div style={{ fontSize: 13, color: "#0F172A", fontStyle: "italic" }}>{alert.suggestedAction}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onViewProducts && (
            <button type="button" onClick={onViewProducts} style={btn(palette, "secondary")}>
              👁 {t("compliance.alert.action.viewProducts")}
            </button>
          )}
          {onApplyAll && (
            <button type="button" onClick={onApplyAll} style={btn(brand, "primary")}>
              ⚡ {t("compliance.alert.action.applyAll")}
            </button>
          )}
          {onDismiss && (
            <button type="button" onClick={onDismiss} style={btn(palette, "ghost")}>
              {t("compliance.alert.action.dismiss")}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes alertIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
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
      padding: "8px 16px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  if (variant === "secondary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "8px 16px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    background: "transparent",
    color: "#64748B",
    border: "1px solid transparent",
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
