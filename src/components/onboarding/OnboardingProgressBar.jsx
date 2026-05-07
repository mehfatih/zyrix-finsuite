// ================================================================
// OnboardingProgressBar — visual step indicator (1/5 → 5/5)
// ================================================================
import React from "react";
import { getBrandPalette } from "../../utils/dashboardPalette";

export default function OnboardingProgressBar({ step = 1, total = 5, lang = "tr", t = (s) => s, labels = [] }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const pct = Math.max(0, Math.min(1, step / total)) * 100;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("wizard.step", { n: step, total })}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} aria-label={t("wizard.progress")}
        style={{ height: 8, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${brand.base}, ${brand.dark})`,
            borderRadius: 999,
            transition: "width .4s ease",
            boxShadow: `0 0 12px ${brand.base}80`,
          }}
        />
      </div>
      {labels.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, gap: 4 }}>
          {labels.map((label, i) => {
            const isDone = i < step;
            const isActive = i === step - 1;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", margin: "0 auto",
                  background: isDone || isActive ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : "#E2E8F0",
                  color: isDone || isActive ? "#fff" : "#94A3B8",
                  display: "grid", placeItems: "center",
                  fontSize: 10, fontWeight: 800,
                  boxShadow: isActive ? `0 0 0 4px ${brand.base}30` : "none",
                  transition: "all .3s",
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: isActive ? brand.dark : "#94A3B8", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }} className="opb-label">
                  {label}
                </div>
              </div>
            );
          })}
          <style>{`@media (max-width: 540px) { .opb-label { display: none; } }`}</style>
        </div>
      )}
    </div>
  );
}
