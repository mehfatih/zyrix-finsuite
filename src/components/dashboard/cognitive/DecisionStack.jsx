// ================================================================
// DecisionStack — stacked priority cards (today's 5 decisions)
// ================================================================
import React from "react";
import { getAIPalette, getMoneyPalette, getSuccessPalette, getAlertPalette, getCustomerPalette, getReportsPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/cognitive/cognitiveApi";

const KIND_PALETTE_FN = (g) => g; // placeholder; we use static palette via getX

function paletteFor(kind, getMoney, getCustomer, getSuccess, getAI, getAlert) {
  switch (kind) {
    case "invoice":  return getMoney;
    case "purchase": return getCustomer;
    case "discount": return getAI;
    case "payment":  return getSuccess;
    case "refund":   return getAlert;
    default:         return getAI;
  }
}

export default function DecisionStack({ decisions = [], onDecide, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  if (decisions.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: "center", background: success.bg, color: success.dark, borderRadius: 16, fontSize: 14, fontWeight: 700 }}>
        {t("decisions.empty")}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {decisions.map((d, i) => {
        const palette = paletteFor(d.kind, money, customer, success, ai, alert);
        const numEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][i] || `${i + 1}.`;
        return (
          <div
            key={d.id}
            style={{
              background: "#fff",
              border: `1.5px solid ${palette.base}30`,
              borderRadius: 16,
              padding: 16,
              boxShadow: `0 4px 16px ${palette.base}15`,
              animation: `dsIn .35s ease both`,
              animationDelay: `${i * 70}ms`,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "flex-start" }} className="ds-grid">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {numEmoji}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{d.title}</span>
                  <span style={{ background: palette.bg, color: palette.dark, padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800 }}>
                    {t(`decisions.kind.${d.kind}`)}
                  </span>
                  {d.amount > 0 && (
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: money.base }}>
                      {fmtCurrency(d.amount)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  🤖 {t("decisions.aiAnalysis")}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 8 }}>
                  {d.analysis.map((line, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", fontSize: 12, color: "#475569" }}>
                      <span style={{ color: palette.base, flexShrink: 0 }}>•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 11, color: success.dark, fontWeight: 800 }}>
                  💡 {t("decisions.recommended")}: {t(`decisions.action.${d.recommended}`)}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <button type="button" onClick={() => onDecide && onDecide(d, "approve")} style={btn(success, "primary")}>
                  ✓ {t("decisions.action.approve")}
                </button>
                <button type="button" onClick={() => onDecide && onDecide(d, "counter")} style={btn(brand, "secondary")}>
                  ↔ {t("decisions.action.counter")}
                </button>
                <button type="button" onClick={() => onDecide && onDecide(d, "reject")} style={btn(alert, "ghost")}>
                  ✗ {t("decisions.action.reject")}
                </button>
              </div>
            </div>
            <style>{`
              @keyframes dsIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @media (max-width: 720px) { .ds-grid { grid-template-columns: 1fr !important; } }
            `}</style>
          </div>
        );
      })}
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
      boxShadow: `0 4px 12px ${palette.base}40`,
      whiteSpace: "nowrap",
    };
  }
  if (variant === "secondary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
  }
  return {
    background: "transparent",
    color: palette.dark,
    border: `1px solid ${palette.base}30`,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
