// ================================================================
// /settings/audit-log — Audit log viewer + CSV export
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import AuditLogTable from "../../components/trust/AuditLogTable";
import { listAuditLog } from "./securityApi";

export default function AuditLogPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const [items, setItems] = useState([]);

  useEffect(() => {
    listAuditLog({ page: 1, limit: 200 }).then((r) => setItems(r.items || []));
  }, []);

  const exportCsv = () => {
    const header = "createdAt,action,resourceType,resourceId,ipAddress\n";
    const rows = items.map((i) => `${i.createdAt},${i.action},${i.resourceType || ""},${i.resourceId || ""},${i.ipAddress || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("audit.title")}
        subtitle={t("audit.subtitle")}
        icon="📋"
        palette={p}
        actions={
          <button type="button" onClick={exportCsv} style={{ background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${p.base}40` }}>
            ↓ {t("audit.export")}
          </button>
        }
      />
      <AuditLogTable items={items} t={t} lang={lang} />
    </div>
  );
}
