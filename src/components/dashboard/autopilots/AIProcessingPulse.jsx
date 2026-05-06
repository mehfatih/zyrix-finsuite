// ================================================================
// AIProcessingPulse — animated thinking indicator with stage labels
// ================================================================
import React from "react";
import { getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export default function AIProcessingPulse({
  stage,
  stages = ["transcribing", "parsing", "matching", "draft"],
  lang = "TR",
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const idx = stages.indexOf(stage);
  const pct = idx < 0 ? 0 : ((idx + 1) / stages.length) * 100;

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
        <svg viewBox="0 0 120 120" width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke={`${ai.base}20`} strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#ap-grad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(2 * Math.PI * 52 * pct) / 100} ${2 * Math.PI * 52}`}
            style={{ transition: "stroke-dasharray .6s ease" }}
          />
          <defs>
            <linearGradient id="ap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ai.base} />
              <stop offset="100%" stopColor={brand.base} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ fontSize: 32, animation: "apSpin 2.4s linear infinite" }}>🧠</div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, fontWeight: 800, color: ai.dark }}>
        {t("invoice.processing")}
      </div>
      <ul style={{ listStyle: "none", margin: "14px auto 0", padding: 0, maxWidth: 320 }}>
        {stages.map((s, i) => {
          const done = idx > i;
          const active = idx === i;
          return (
            <li
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 10px",
                borderRadius: 8,
                background: active ? `${ai.base}10` : "transparent",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: done ? ai.dark : active ? ai.base : "#94A3B8",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: done ? ai.base : active ? "#fff" : "#E2E8F0",
                  border: active ? `2px solid ${ai.base}` : "none",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                  animation: active ? "apDot 1s ease-in-out infinite" : "none",
                }}
              >
                {done ? "✓" : ""}
              </span>
              <span>{t(`invoice.processing.${s}`)}</span>
            </li>
          );
        })}
      </ul>
      <style>{`
        @keyframes apSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes apDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
}
