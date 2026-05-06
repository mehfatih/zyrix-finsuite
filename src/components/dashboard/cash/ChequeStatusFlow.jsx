// ================================================================
// ChequeStatusFlow — visual lifecycle: PENDING → DEPOSITED → CLEARED/BOUNCED
// ================================================================
import React from "react";
import { getPaletteById } from "../../../utils/dashboardPalette";

const STEPS = [
  { id: "PENDING",   icon: "⏳", paletteId: "amber" },
  { id: "DEPOSITED", icon: "🏦", paletteId: "indigo" },
  { id: "CLEARED",   icon: "✅", paletteId: "emerald" },
];

export default function ChequeStatusFlow({ status, lang = "TR", t = (s) => s }) {
  const isBounced = status === "BOUNCED";
  const isCancelled = status === "CANCELLED";

  if (isBounced || isCancelled) {
    const failPalette = getPaletteById("rose");
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${failPalette.bg}, ${failPalette.base}20)`,
          border: `2px solid ${failPalette.base}60`,
          borderRadius: 14,
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          animation: "shake .4s ease",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: failPalette.base,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 22,
            flexShrink: 0,
            boxShadow: `0 4px 14px ${failPalette.base}50`,
          }}
        >
          {isBounced ? "✗" : "⊘"}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: failPalette.dark }}>
            {t(`cheques.status.${status}`)}
          </div>
          <div style={{ fontSize: 12, color: "#9F1239" }}>
            {isBounced ? "Karşılıksız çek — tahsilat başarısız" : "İptal edildi"}
          </div>
        </div>
        <style>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.id === status);

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap" }}>
      {STEPS.map((step, i) => {
        const palette = getPaletteById(step.paletteId);
        const reached = currentIdx >= 0 && i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                flex: "1 1 130px",
                minWidth: 130,
                padding: "14px 16px",
                background: reached ? `linear-gradient(135deg, ${palette.bg}, ${palette.base}20)` : "#F8FAFC",
                border: isCurrent ? `2px solid ${palette.base}` : `1px solid ${reached ? palette.base + "40" : "#E2E8F0"}`,
                borderRadius: 14,
                position: "relative",
                animation: isCurrent ? "chqPulse 1.6s ease-in-out infinite" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: reached ? palette.base : "#CBD5E1",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: reached ? palette.dark : "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t(`cheques.status.${step.id}`)}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 6px",
                  color: reached ? palette.base : "#CBD5E1",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        );
      })}
      <style>{`
        @keyframes chqPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
