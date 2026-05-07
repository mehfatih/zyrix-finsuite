// ================================================================
// /onboarding/setup/ready — Confetti celebration (step 5/5)
// ================================================================
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import OnboardingShell from "./OnboardingShell";
import FirstInvoiceCelebration from "../../components/onboarding/FirstInvoiceCelebration";
import { trackEvent, EVENT } from "../../utils/analytics";

export default function ReadyToFlyPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("onboarding");
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(EVENT.ONBOARDING_STEP, { step: 5, name: "ready" });
    trackEvent(EVENT.ONBOARDING_COMPLETED);
    try {
      const u = JSON.parse(localStorage.getItem("zyrix_user") || "{}");
      if (u && !u.onboardingDone) {
        u.onboardingDone = true;
        localStorage.setItem("zyrix_user", JSON.stringify(u));
      }
    } catch {}
  }, []);

  return (
    <OnboardingShell step={5} lang={lang} t={t} hideFooter>
      <FirstInvoiceCelebration
        lang={lang}
        t={t}
        onDashboard={() => navigate("/dashboard")}
        onTour={() => navigate("/dashboard?tour=1")}
      />
    </OnboardingShell>
  );
}
