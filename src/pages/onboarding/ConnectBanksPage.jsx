// ================================================================
// /onboarding/setup/banks — Bank connection (step 3/5)
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import OnboardingShell from "./OnboardingShell";
import BankConnector from "../../components/onboarding/BankConnector";
import { trackEvent, EVENT } from "../../utils/analytics";

export default function ConnectBanksPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("onboarding");
  const [connected, setConnected] = useState([]);

  useEffect(() => { trackEvent(EVENT.ONBOARDING_STEP, { step: 3, name: "banks" }); }, []);

  const onChange = (next) => {
    setConnected(next);
    try { localStorage.setItem("zyrix_onboarding_banks", JSON.stringify(next)); } catch {}
  };

  return (
    <OnboardingShell step={3} lang={lang} t={t}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("banks.title")}</h2>
      <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>{t("banks.subtitle")}</p>

      <BankConnector onChange={onChange} lang={lang} t={t} />

      {connected.length > 0 && (
        <div role="status" style={{ marginTop: 16, padding: 12, background: "#DCFCE7", color: "#166534", borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
          ✓ {connected.length} bank{connected.length !== 1 ? "s" : ""} connected
        </div>
      )}
    </OnboardingShell>
  );
}
