// ================================================================
// /migration/history — Past migrations + rollback
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette, getAlertPalette, getReportsPalette, getCustomerPalette } from "../../utils/dashboardPalette";
import { fmtDateTime } from "../../utils/format";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import { listMigrations, rollback } from "./migrationApi";

const STATUS_PALETTE = (success, alert, reports, customer) => ({
  COMPLETED:    success,
  ROLLED_BACK:  customer,
  FAILED:       alert,
  IN_PROGRESS:  reports,
  VALIDATING:   reports,
  PENDING:      customer,
});

export default function MigrationHistoryPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("migration");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const palettes = STATUS_PALETTE(success, alert, reports, customer);

  const [jobs, setJobs] = useState([]);

  useEffect(() => { listMigrations().then(setJobs); }, []);

  const onRollback = async (job) => {
    if (!window.confirm(`${t("history.rollback.confirm")}\n\n${t("history.rollback.detail", { n: job.totalRows })}`)) return;
    await rollback(job.id);
    listMigrations().then(setJobs);
  };

  const isRollbackable = (job) => {
    if (job.status !== "COMPLETED") return false;
    if (!job.completedAt) return false;
    return Date.now() - new Date(job.completedAt).getTime() < 7 * 86400000;
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("history.title")} icon="📜" palette={brand} />

      {jobs.length === 0 ? (
        <EmptyState icon="📦" title={t("history.empty")} palette={brand} />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
          {jobs.map((j, i) => {
            const p = palettes[j.status] || customer;
            const canRollback = isRollbackable(j);
            return (
              <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: i < jobs.length - 1 ? "1px solid #F1F5F9" : "none" }} className="mhp-row">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>{j.fileName}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{j.sourceSystem} · {j.totalRows} rows · {fmtDateTime(j.createdAt, { lang })}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {j.status}
                </span>
                {canRollback ? (
                  <button type="button" onClick={() => onRollback(j)} style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    ↶ {t("history.rollback")}
                  </button>
                ) : (
                  <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{j.status === "ROLLED_BACK" ? "—" : t("history.rollback.expired")}</span>
                )}
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{t("history.rollback.window")}</span>
                <style>{`@media (max-width: 720px) { .mhp-row { grid-template-columns: 1fr auto !important; } .mhp-row > *:nth-child(3), .mhp-row > *:nth-child(4) { display: none; } }`}</style>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
