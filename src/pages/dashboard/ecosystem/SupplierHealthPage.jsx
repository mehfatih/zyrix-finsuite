// ================================================================
// ★ Supplier Health Monitor — score + signals + recommendations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import SupplierHealthGauges from "../../../components/dashboard/ecosystem/SupplierHealthGauges";
import { localStore, KEYS, buildSupplierHealth } from "./ecosystemApi";

export default function SupplierHealthPage() {
  const t = useDashboardI18n("ecosystem");
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();

  const [purchases, setPurchases] = useState([]);
  const [flags, setFlags] = useState(localStore.list(KEYS.supplierFlags));

  useEffect(() => {
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
  }, []);

  const suppliers = useMemo(() => buildSupplierHealth({ purchases }), [purchases]);

  const stats = {
    total:    suppliers.length,
    healthy:  suppliers.filter((s) => s.health === "healthy").length,
    warning:  suppliers.filter((s) => s.health === "warning").length,
    critical: suppliers.filter((s) => s.health === "critical").length,
  };

  const onAction = (s, kind) => {
    localStore.add(KEYS.supplierFlags, { supplierId: s.id, action: kind, at: new Date().toISOString() });
    setFlags(localStore.list(KEYS.supplierFlags));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("supplier.title")} subtitle={t("supplier.subtitle")} icon="🏭" palette={success} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="sh-kpis">
        <KpiCard label={t("supplier.kpi.total")}    value={stats.total}    palette={customer} icon="🏭" />
        <KpiCard label={t("supplier.kpi.healthy")}  value={stats.healthy}  palette={success}  icon="✓" />
        <KpiCard label={t("supplier.kpi.warning")}  value={stats.warning}  palette={warn}     icon="⚠️" pulse={stats.warning > 0} />
        <KpiCard label={t("supplier.kpi.critical")} value={stats.critical} palette={alert}    icon="🚨" pulse={stats.critical > 0} />
      </div>

      {suppliers.map((s) => (
        <SupplierHealthGauges key={s.id} supplier={s} onAction={onAction} t={t} />
      ))}

      <style>{`@media (max-width: 720px) { .sh-kpis { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
