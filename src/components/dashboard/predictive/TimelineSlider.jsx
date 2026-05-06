// ================================================================
// TimelineSlider — drag through 0..N days with warp glow
// ================================================================
import React from "react";
import { getAIPalette, getCustomerPalette } from "../../../utils/dashboardPalette";

export default function TimelineSlider({
  value = 0,
  max = 90,
  onChange,
  label,
  unit = "days",
}) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>{label}</span>
          <span style={{ color: ai.base, fontFamily: "monospace" }}>{value} {unit}</span>
        </div>
      )}
      <div style={{ position: "relative", height: 40 }}>
        <div
          style={{
            position: "absolute",
            inset: "16px 0 16px 0",
            background: `linear-gradient(90deg, ${customer.bg}, ${ai.bg})`,
            border: `1px solid ${ai.base}25`,
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "16px auto 16px 0",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${ai.base}, ${ai.dark})`,
            borderRadius: 999,
            boxShadow: `0 0 14px ${ai.base}80`,
          }}
        />
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
        {/* Animated thumb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            insetInlineStart: `calc(${pct}% - 12px)`,
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #fff, ${ai.bg})`,
            border: `3px solid ${ai.base}`,
            boxShadow: `0 0 18px ${ai.base}90`,
            pointerEvents: "none",
            transition: "inset-inline-start .1s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8", fontWeight: 700, marginTop: 4 }}>
        <span>Today</span>
        <span>+{max} {unit}</span>
      </div>
    </div>
  );
}
