// ================================================================
// /onboarding/setup/import — Customer CSV import (step 2/5)
// ================================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import OnboardingShell from "./OnboardingShell";
import DataImporter from "../../components/onboarding/DataImporter";
import { trackEvent, EVENT } from "../../utils/analytics";
import { getMarketPalette } from "../../utils/dashboardPalette";

export default function ImportDataPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("onboarding");
  const navigate = useNavigate();
  const market = getMarketPalette();
  const [imported, setImported] = useState(null);

  useEffect(() => { trackEvent(EVENT.ONBOARDING_STEP, { step: 2, name: "import" }); }, []);

  const onImport = (records) => {
    try { localStorage.setItem("zyrix_onboarding_customers", JSON.stringify(records)); } catch {}
    setImported(records);
    trackEvent(EVENT.ONBOARDING_STEP, { step: 2, name: "import-complete", count: records.length });
    setTimeout(() => navigate("/onboarding/setup/banks"), 800);
  };

  return (
    <OnboardingShell step={2} lang={lang} t={t}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("import.title")}</h2>
      <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>{t("import.subtitle")}</p>

      <DataImporter onImport={onImport} lang={lang} t={t} />

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, alignSelf: "center", marginInlineEnd: 4 }}>{t("import.or")}</span>
        {[
          { id: "logo",  key: "import.connect.logo" },
          { id: "mikro", key: "import.connect.mikro" },
          { id: "excel", key: "import.connect.excel" },
        ].map((c) => (
          <button key={c.id} type="button" style={{ background: market.bg, color: market.dark, border: `1px solid ${market.base}40`, padding: "8px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
            {t(c.key)}
          </button>
        ))}
      </div>

      {imported && (
        <div role="status" style={{ marginTop: 16, padding: 14, background: "#DCFCE7", color: "#166534", borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
          ✓ {t("import.preview.rows", { n: imported.length })} →
        </div>
      )}
    </OnboardingShell>
  );
}
