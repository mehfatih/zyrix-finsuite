// ================================================================
// EducationProgressTree — Diablo-style skill tree with status nodes
// ================================================================
import React from "react";
import { getSuccessPalette, getAIPalette, getReportsPalette, getWarningPalette } from "../../../utils/dashboardPalette";

const STATUS_PALETTE = (success, ai, reports) => ({
  mastered:   success,
  inProgress: ai,
  locked:     reports,
});

export default function EducationProgressTree({ nodes = [], onSelect, t = (s) => s }) {
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const reports = getReportsPalette();
  const warn = getWarningPalette();
  const sp = STATUS_PALETTE(success, ai, reports);

  return (
    <div
      style={{
        background: "#0F172A",
        borderRadius: 18,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(108,58,255,0.18), transparent 60%)", pointerEvents: "none" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        {nodes.map((n) => {
          const palette = sp[n.status] || reports;
          const locked = n.status === "locked";
          const inProgress = n.status === "inProgress";
          const mastered = n.status === "mastered";
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => !locked && onSelect?.(n)}
              disabled={locked}
              style={{
                background: locked ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${palette.base}30, ${palette.dark}40)`,
                border: locked ? "1px dashed rgba(255,255,255,0.15)" : `2px solid ${palette.base}90`,
                borderRadius: 14,
                padding: 14,
                cursor: locked ? "not-allowed" : "pointer",
                textAlign: "center",
                position: "relative",
                opacity: locked ? 0.55 : 1,
                transition: "transform .15s, box-shadow .15s",
                boxShadow: mastered ? `0 0 18px ${palette.base}90, inset 0 0 12px ${palette.base}60` : inProgress ? `0 0 12px ${palette.base}60` : "none",
              }}
              onMouseEnter={(e) => { if (!locked) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>
                {mastered ? "🏆" : inProgress ? "📖" : "🔒"}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>
                {t(`education.skill.${n.id}`)}
              </div>
              <div style={{ fontSize: 9, color: palette.bg, fontWeight: 700, opacity: 0.85 }}>
                {t("education.tree.lessonsOf", { done: n.done, total: n.total })}
              </div>
              {inProgress && (
                <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(n.done / n.total) * 100}%`, background: `linear-gradient(90deg, ${palette.base}, ${palette.bg})`, borderRadius: 999 }} />
                </div>
              )}
              {mastered && (
                <div style={{ position: "absolute", top: -8, insetInlineEnd: -8, background: success.dark, color: "#fff", padding: "2px 6px", borderRadius: 999, fontSize: 9, fontWeight: 800 }}>
                  ✓✓✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
