// ================================================================
// DeductionFinderCard — animated counter + AI-found missed deductions
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getMoneyPalette, getAlertPalette } from "../../../utils/dashboardPalette";

function AnimatedNumber({ value }) {
  const [n, setN] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setN(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <>{Math.round(n).toLocaleString()}</>;
}

export default function DeductionFinderCard({
  deductions = [],
  totalRecovered = 0,
  loading = false,
  onReview,
  onApplyAll,
  onDismissOne,
  t = (s) => s,
  currency = "TRY",
}) {
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const fmt = (n) => `${currency === "TRY" ? "₺" : currency + " "}${Math.round(Number(n) || 0).toLocaleString()}`;

  if (loading) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${ai.bg}, ${money.bg})`,
          border: `1px solid ${ai.base}30`,
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
          color: ai.dark,
          fontSize: 13,
        }}
      >
        🔍 AI is scanning your invoices…
      </div>
    );
  }

  if (deductions.length === 0) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, #ECFDF5, ${money.bg})`,
          border: `1px solid #10B98140`,
          borderRadius: 16,
          padding: 22,
          textAlign: "center",
          color: "#047857",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        🎉 {t("deductions.empty")}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${alert.base}40`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 6px 24px ${alert.base}20`,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: `linear-gradient(90deg, ${alert.base}, ${alert.dark})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {t("deductions.title")}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>
          {t("deductions.subtitle").replace("{count}", deductions.length)}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
              {t("deductions.recovered")}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: money.base,
                fontFamily: "monospace",
                letterSpacing: "-0.02em",
              }}
            >
              {currency === "TRY" ? "₺" : currency + " "}<AnimatedNumber value={totalRecovered} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onReview && (
              <button type="button" onClick={onReview} style={btn(alert, "secondary")}>
                {t("deductions.action.review")}
              </button>
            )}
            {onApplyAll && (
              <button type="button" onClick={onApplyAll} style={btn(money, "primary")}>
                ✓ {t("deductions.action.applyAll")}
              </button>
            )}
          </div>
        </div>

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {deductions.map((d) => (
            <li
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: alert.bg,
                  color: alert.dark,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                💡
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                  {d.invoiceNumber || d.label}
                </div>
                <div style={{ fontSize: 11, color: "#64748B" }}>
                  {d.suggestedCategory || d.description}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: money.base, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                +{fmt(d.amount)}
              </div>
              {onDismissOne && (
                <button
                  type="button"
                  onClick={() => onDismissOne(d.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
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
