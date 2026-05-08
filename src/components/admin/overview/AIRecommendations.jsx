// ================================================================
// AIRecommendations — live recommendation engine. Pure-function
// recommendationsBuilder takes the dataSnapshot and returns a list
// of { id, priority, text, action } items. Re-computes (and slides
// a fresh staircase animation) whenever the snapshot shifts.
// ================================================================
import React, { useMemo, useState, useEffect } from "react";
import { Lightbulb, ArrowRight } from "lucide-react";

export default function AIRecommendations({ dataSnapshot, recommendationsBuilder }) {
  const recs = useMemo(() => {
    if (!dataSnapshot || !recommendationsBuilder) return [];
    return recommendationsBuilder(dataSnapshot);
  }, [dataSnapshot, recommendationsBuilder]);

  // Bumping pulseKey re-mounts the row container so the slide-in
  // animation replays whenever recommendations change.
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => { setPulseKey((k) => k + 1); }, [recs]);

  const priorityColor = (p) =>
    p === "high" ? "#EF4444" : p === "medium" ? "#F59E0B" : "#22D3EE";

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "16px",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #7C3AED, #22D3EE)",
      }} />
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
      }}>
        <Lightbulb size={18} color="#7C3AED" />
        <h3 style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#111827",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>AI Recommendations</h3>
        <span style={{
          fontSize: "10px",
          color: "#7C3AED",
          background: "rgba(124,58,237,0.1)",
          padding: "2px 8px",
          borderRadius: "999px",
          fontWeight: 700,
        }}>LIVE</span>
      </div>

      <div key={pulseKey} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {recs.length === 0 && (
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            All clear — no actions recommended right now.
          </p>
        )}
        {recs.map((rec, i) => (
          <div key={rec.id} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "10px 12px",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "8px",
            borderInlineStart: `3px solid ${priorityColor(rec.priority)}`,
            animation: `ai-rec-slide-in 350ms ease ${i * 60}ms backwards`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "10px",
                fontWeight: 700,
                color: priorityColor(rec.priority),
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}>
                {rec.priority} priority
              </div>
              <div style={{ fontSize: "14px", color: "#111827", lineHeight: 1.5 }}>
                {rec.text}
              </div>
              {rec.action && (
                <button type="button" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "8px",
                  background: "transparent",
                  border: "none",
                  color: "#7C3AED",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}>
                  {rec.action} <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ai-rec-slide-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
