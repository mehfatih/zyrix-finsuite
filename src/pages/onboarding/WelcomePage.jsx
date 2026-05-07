// ================================================================
// /onboarding/setup — Welcome (step 1/5)
// ================================================================
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { useAuth } from "../../context/AuthContext";
import OnboardingShell from "./OnboardingShell";
import WelcomeWizard from "../../components/onboarding/WelcomeWizard";
import { trackEvent, EVENT } from "../../utils/analytics";

export default function WelcomePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("onboarding");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { trackEvent(EVENT.ONBOARDING_STEP, { step: 1, name: "welcome" }); }, []);

  const name = user?.firstName || user?.fullName?.split?.(" ")?.[0] || user?.companyName || "there";

  return (
    <OnboardingShell step={1} lang={lang} t={t}>
      <WelcomeWizard
        name={name}
        lang={lang}
        t={t}
        onStart={() => navigate("/onboarding/setup/import")}
        onSkip={() => navigate("/dashboard")}
      />
    </OnboardingShell>
  );
}
