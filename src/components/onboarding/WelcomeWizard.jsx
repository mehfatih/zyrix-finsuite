// ================================================================
// WelcomeWizard — animated greeting + 5 outcome checklist + CTA
// ================================================================
import React from "react";
import { getBrandPalette, getSuccessPalette } from "../../utils/dashboardPalette";

const OUTCOMES = ["customers", "banks", "brand", "invoice", "ai"];

export default function WelcomeWizard({ name = "there", onStart, onSkip, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();

  return (
    <div style={{ textAlign: "center", padding: "24px 16px", animation: "wzFadeIn .4s ease" }}>
      {/* Animated logo orb */}
      <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 18px" }}>
        <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle, ${brand.base}30, transparent 65%)`, filter: "blur(14px)", animation: "wzHalo 3s ease-in-out infinite" }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          display: "grid", placeItems: "center",
          color: "#fff", fontSize: 48, fontWeight: 900,
          boxShadow: `0 12px 32px ${brand.base}50`,
          animation: "wzPulse 3s ease-in-out infinite",
        }}>Z</div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.25 }}>
        {t("welcome.greeting", { name })}
      </h1>
      <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 28px", maxWidth: 460, marginInline: "auto" }}>
        {t("welcome.tagline")}
      </p>

      <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, maxWidth: 460, margin: "0 auto 28px", textAlign: "start" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          {t("welcome.outcomes.title")}
        </div>
        {OUTCOMES.map((o, i) => (
          <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", animation: `wzSlide .4s ${0.1 + i * 0.08}s both ease` }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: success.bg, color: success.dark, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{t(`welcome.outcomes.${o}`)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {onSkip && (
          <button type="button" onClick={onSkip} style={btnGhost}>
            {t("wizard.skip")}
          </button>
        )}
        <button type="button" onClick={onStart} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 22px ${brand.base}50` }}>
          ⚡ {t("welcome.cta.start")}
        </button>
      </div>

      <style>{`
        @keyframes wzFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wzPulse  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes wzHalo   { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes wzSlide  { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "14px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" };
