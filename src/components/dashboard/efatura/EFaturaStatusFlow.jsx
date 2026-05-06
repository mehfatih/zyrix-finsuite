// ================================================================
// EFaturaStatusFlow — visual waterfall: Draft→Signed→Submitted→Received
// Shows current status highlighted; counts under each step.
// ================================================================
import React from "react";
import { getBrandPalette, getPaletteById, resolvePalette } from "../../../utils/dashboardPalette";

const STEPS = [
  { id: "DRAFT",        icon: "📝", paletteId: "amber" },
  { id: "SIGNED",       icon: "✍️", paletteId: "indigo" },
  { id: "SUBMITTED",    icon: "📤", paletteId: "cyan" },
  { id: "RECEIVED",     icon: "📥", paletteId: "emerald" },
  { id: "ACKNOWLEDGED", icon: "✅", paletteId: "teal" },
];

export default function EFaturaStatusFlow({ counts = {}, currentStatus, lang = "TR", t = (s) => s }) {
  const brand = getBrandPalette(lang.toLowerCase());
  const currentIdx = STEPS.findIndex((s) => s.id === currentStatus);

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap" }}>
      {STEPS.map((step, i) => {
        const palette = getPaletteById(step.paletteId);
        const reached = currentIdx >= 0 && i <= currentIdx;
        const isCurrent = i === currentIdx;
        const count = counts[step.id] ?? 0;
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
                animation: isCurrent ? "flowPulse 1.6s ease-in-out infinite" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
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
                  {t(`outgoing.status.${step.id}`)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: reached ? palette.base : "#94A3B8",
                  fontFamily: "monospace",
                }}
              >
                {count}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 6px",
                  color: reached ? brand.base : "#CBD5E1",
                  fontSize: 18,
                  fontWeight: 800,
                }}
                aria-hidden="true"
              >
                →
              </div>
            )}
          </React.Fragment>
        );
      })}
      <style>{`
        @keyframes flowPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
