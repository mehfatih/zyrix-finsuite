// ================================================================
// /onboarding/setup/brand — Brand identity setup (step 4/5)
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import OnboardingShell from "./OnboardingShell";
import BrandSetupStep from "../../components/onboarding/BrandSetupStep";
import { trackEvent, EVENT } from "../../utils/analytics";

export default function BrandSetupPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("onboarding");

  const [brand, setBrand] = useState(() => {
    try { return JSON.parse(localStorage.getItem("zyrix_onboarding_brand") || "{}"); } catch { return {}; }
  });

  useEffect(() => { trackEvent(EVENT.ONBOARDING_STEP, { step: 4, name: "brand" }); }, []);

  const onChange = (next) => {
    setBrand(next);
    try { localStorage.setItem("zyrix_onboarding_brand", JSON.stringify(next)); } catch {}
  };

  return (
    <OnboardingShell step={4} lang={lang} t={t}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("brand.title")}</h2>
      <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>{t("brand.subtitle")}</p>

      <BrandSetupStep brand={brand} onChange={onChange} lang={lang} t={t} />
    </OnboardingShell>
  );
}
