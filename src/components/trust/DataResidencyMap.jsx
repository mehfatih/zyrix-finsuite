// ================================================================
// DataResidencyMap — visual region picker (TR/EU/UAE)
// ================================================================
import React from "react";
import { TRUST_PALETTE, COMPLIANCE_BADGES } from "../../utils/trustPalette";

const REGIONS = [
  { id: "tr",  flag: "🇹🇷", x: 55,  y: 55  },
  { id: "eu",  flag: "🇪🇺", x: 45,  y: 35  },
  { id: "uae", flag: "🇦🇪", x: 70,  y: 70  },
];

export default function DataResidencyMap({ current = "tr", onSelect, t = (s) => s }) {
  const p = TRUST_PALETTE;
  return (
    <div>
      <div style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto 24px", aspectRatio: "16/9", background: `linear-gradient(135deg, ${p.bg}, #fff)`, borderRadius: 14, border: `1px solid ${p.base}30`, overflow: "hidden" }}>
        {/* Stylised map grid */}
        <svg viewBox="0 0 100 56" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* horizontal lines */}
          {[10, 25, 40, 55].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={p.base + "20"} strokeWidth="0.3" />
          ))}
          {/* vertical lines */}
          {[20, 40, 60, 80].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="56" stroke={p.base + "20"} strokeWidth="0.3" />
          ))}
        </svg>

        {/* Region pins */}
        {REGIONS.map((r) => {
          const active = current === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect?.(r.id)}
              style={{
                position: "absolute",
                left: `${r.x}%`,
                top: `${r.y}%`,
                transform: "translate(-50%, -50%)",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : "#fff",
                color: active ? "#fff" : p.dark,
                border: `2px solid ${p.base}`,
                boxShadow: active ? `0 0 0 6px ${p.base}30, 0 0 16px ${p.base}80` : `0 4px 12px ${p.base}30`,
                fontSize: 18,
                cursor: "pointer",
                animation: active ? "drmPulse 2s ease-in-out infinite" : "none",
              }}
              aria-label={t(`residency.region.${r.id}`)}
            >
              {r.flag}
            </button>
          );
        })}

        <style>{`@keyframes drmPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.1); } }`}</style>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {REGIONS.map((r) => {
          const active = current === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect?.(r.id)}
              style={{
                background: active ? `linear-gradient(135deg, ${p.bg}, #fff)` : "#fff",
                border: `1.5px solid ${active ? p.base : "#E2E8F0"}`,
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
                textAlign: "start",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{r.flag}</span>
                <strong style={{ fontSize: 13, color: "#0F172A" }}>{t(`residency.region.${r.id}`)}</strong>
                {active && <span style={{ fontSize: 9, fontWeight: 800, color: p.dark, background: p.bg, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("residency.current")}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{t(`residency.${r.id}.desc`)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
