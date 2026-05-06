// ================================================================
// TaxAutopilotProgressBar — animated stage tracker for AI workflow
// ================================================================
import React from "react";
import { getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

const STAGES = [
  { id: "collect",     icon: "📥" },
  { id: "categorize",  icon: "🗂️" },
  { id: "verify",      icon: "🔍" },
  { id: "generate",    icon: "📄" },
];

export default function TaxAutopilotProgressBar({ stage, etaSeconds = 0, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const currentIdx = STAGES.findIndex((s) => s.id === stage);
  const totalProgress = currentIdx < 0 ? 0 : (currentIdx + 1) / STAGES.length;

  return (
    <div>
      {/* Animated ring + status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
          <svg viewBox="0 0 110 110" width="110" height="110">
            <circle cx="55" cy="55" r="48" fill="none" stroke={`${ai.base}20`} strokeWidth="9" />
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke={`url(#auto-grad)`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48 * totalProgress} ${2 * Math.PI * 48}`}
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dasharray .6s ease" }}
            />
            <defs>
              <linearGradient id="auto-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ai.base} />
                <stop offset="100%" stopColor={brand.base} />
              </linearGradient>
            </defs>
            <text x="55" y="58" textAnchor="middle" fontSize="22" fontWeight="900" fill={ai.dark}>
              {Math.round(totalProgress * 100)}%
            </text>
            <text x="55" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill="#94A3B8">
              {currentIdx >= 0 ? t("autopilot.preparing") : t("autopilot.ready")}
            </text>
          </svg>
          {currentIdx >= 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                insetInlineEnd: -4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: ai.base,
                animation: "autoPulse 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
            {currentIdx >= 0 ? t(`autopilot.stage.${STAGES[currentIdx].id}`) : t("autopilot.ready")}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
            {currentIdx >= 0 ? `${currentIdx + 1} / ${STAGES.length}` : "✓ Done"}
          </div>
          {etaSeconds > 0 && (
            <div style={{ fontSize: 11, color: "#64748B" }}>
              {t("autopilot.eta")}: <strong style={{ color: ai.dark }}>{etaSeconds}s</strong>
            </div>
          )}
        </div>
      </div>

      {/* Stage list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        {STAGES.map((s, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          return (
            <div
              key={s.id}
              style={{
                padding: "10px 12px",
                background: done ? ai.bg : active ? `linear-gradient(135deg, ${ai.bg}, ${brand.bg})` : "#F8FAFC",
                border: active ? `2px solid ${ai.base}` : `1px solid ${done ? ai.base + "40" : "#E2E8F0"}`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: active ? "stagePulse 1.6s ease-in-out infinite" : "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: done ? ai.base : active ? brand.base : "#CBD5E1",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {done ? "✓" : s.icon}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: done ? ai.dark : active ? brand.dark : "#94A3B8",
                  lineHeight: 1.3,
                }}
              >
                {t(`autopilot.stage.${s.id}`)}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes autoPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${ai.base}80; }
          70%      { box-shadow: 0 0 0 10px ${ai.base}00; }
        }
        @keyframes stagePulse {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
