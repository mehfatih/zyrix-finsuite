// ================================================================
// PowerBISummary — strategic narrative bullets generated from the
// current dataSnapshot. Re-computes whenever any input metric
// shifts, even by a single point.
// ================================================================
import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";

/**
 * dataSnapshot = {
 *   primaryMetric:   { label, value, trend },
 *   secondaryMetric: { label, value, trend },
 *   topPerformer:    { label, value },
 *   risk:            { label, value }
 * }
 */
export default function PowerBISummary({ dataSnapshot, pageContext }) {
  const narrative = useMemo(() => {
    if (!dataSnapshot) return [];
    const { primaryMetric, secondaryMetric, topPerformer, risk } = dataSnapshot;
    const lines = [];

    if (primaryMetric) {
      const dir = primaryMetric.trend >= 0 ? "up" : "down";
      const verb = primaryMetric.trend >= 0 ? "grew" : "declined";
      lines.push(
        `${pageContext} is trending ${dir}: ${primaryMetric.label} ${verb} ${Math.abs(primaryMetric.trend)}% to ${primaryMetric.value}.`
      );
    }
    if (secondaryMetric) {
      lines.push(
        `${secondaryMetric.label} sits at ${secondaryMetric.value} (${secondaryMetric.trend >= 0 ? "+" : ""}${secondaryMetric.trend}% over the period).`
      );
    }
    if (topPerformer) {
      lines.push(`Top contributor: ${topPerformer.label} at ${topPerformer.value}.`);
    }
    if (risk) {
      lines.push(`Watch closely: ${risk.label} (${risk.value}).`);
    }

    return lines;
  }, [dataSnapshot, pageContext]);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(34,211,238,0.04) 100%)",
      border: "1px solid rgba(124,58,237,0.15)",
      borderRadius: "16px",
      padding: "20px",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}>
        <Sparkles size={18} color="#7C3AED" />
        <h3 style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#111827",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>Power BI Summary</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {narrative.map((line, i) => (
          <p key={i} style={{
            fontSize: "14px",
            color: "#374151",
            lineHeight: 1.5,
            margin: 0,
            textShadow: "none",
          }}>
            <span style={{ color: "#7C3AED", fontWeight: 700, marginInlineEnd: "6px" }}>•</span>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
