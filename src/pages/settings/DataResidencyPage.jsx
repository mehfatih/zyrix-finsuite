// ================================================================
// /settings/data-residency — Enterprise: TR/EU/UAE region picker
// ================================================================
import React, { useState } from "react";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getCustomerPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import DataResidencyMap from "../../components/trust/DataResidencyMap";

export default function DataResidencyPage() {
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const customer = getCustomerPalette();

  const [current, setCurrent] = useState("tr");

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("residency.title")} subtitle={t("residency.subtitle")} icon="🌐" palette={p} />

      <div style={{ background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 16, padding: 24 }}>
        <DataResidencyMap current={current} onSelect={setCurrent} t={t} />

        <div style={{ marginTop: 22, padding: 16, background: customer.bg, border: `1px solid ${customer.base}30`, borderRadius: 10, fontSize: 12, color: customer.dark, fontWeight: 700, textAlign: "center" }}>
          ℹ {t("residency.contact")}
        </div>
      </div>
    </div>
  );
}
