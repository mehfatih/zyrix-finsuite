// ================================================================
// OnboardingShell — shared layout for the 5-step setup wizard
// ================================================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { getBrandPalette } from "../../utils/dashboardPalette";
import OnboardingProgressBar from "../../components/onboarding/OnboardingProgressBar";

const STEP_PATHS = [
  "/onboarding/setup",
  "/onboarding/setup/import",
  "/onboarding/setup/banks",
  "/onboarding/setup/brand",
  "/onboarding/setup/ready",
];

const STEP_LABELS_BY_LANG = {
  TR: ["Hoş Geldin", "Müşteriler", "Bankalar", "Marka", "Hazır"],
  EN: ["Welcome", "Customers", "Banks", "Brand", "Ready"],
  AR: ["ترحيب", "عملاء", "بنوك", "هوية", "جاهز"],
};

export default function OnboardingShell({
  step,
  lang = "TR",
  t = (s) => s,
  children,
  onNext,
  onSkip,
  hideFooter = false,
}) {
  const navigate = useNavigate();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const labels = STEP_LABELS_BY_LANG[lang] || STEP_LABELS_BY_LANG.EN;

  const next = onNext || (() => {
    if (step >= 5) navigate("/dashboard");
    else navigate(STEP_PATHS[step]);
  });
  const back = () => {
    if (step <= 1) navigate("/dashboard");
    else navigate(STEP_PATHS[step - 2]);
  };
  const skip = onSkip || (() => navigate("/dashboard"));

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 0% 0%, ${brand.bg}, #F8FAFC 60%)`, padding: "24px 16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.08)", padding: "28px 32px" }} className="osh-card">
        <div style={{ marginBottom: 18, fontSize: 11, fontWeight: 800, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center" }}>
          ZYRIX FINSUITE — SETUP
        </div>
        <OnboardingProgressBar step={step} total={5} lang={lang} t={t} labels={labels} />
        {children}
        {!hideFooter && (
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={back} style={btnGhost}>
              ← {t("wizard.back")}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={skip} style={btnGhost}>{t("wizard.skip")}</button>
              <button type="button" onClick={next} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${brand.base}40` }}>
                {step >= 5 ? t("wizard.finish") : t("wizard.next")} →
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@media (max-width: 540px) { .osh-card { padding: 20px 16px !important; border-radius: 18px; } }`}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "12px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer" };
