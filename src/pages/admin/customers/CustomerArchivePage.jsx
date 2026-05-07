// ================================================================
// /admin/customers/archive — Soft-deleted customers + restore window
// ================================================================
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import DataTable from "../../../components/admin/DataTable";
import DangerActionDialog from "../../../components/admin/DangerActionDialog";
import AdminKpiCard from "../../../components/admin/AdminKpiCard";
import { ADMIN_BRAND, CRITICAL_RED, ADMIN_INDIGO } from "../../../utils/admin/adminPalette";
import { hasPermission, PERMISSIONS } from "../../../utils/admin/permissions";
import { logAdminAction } from "../../../utils/admin/adminApi";
import { fmtDate, fmtRelativeTime } from "../../../utils/format";

const SAMPLE_ARCHIVES = Array.from({ length: 8 }).map((_, i) => ({
  id: `arch-${i + 1}`,
  customerName: ["Eski Müşteri Co", "Closed Deal Ltd", "Cancelled Inc", "Test Account", "Demo Org", "Trial User", "Pilot SMB", "Departed Corp"][i],
  customerId: `cus-${800 + i}`,
  reason: ["Customer requested deletion", "Payment failure 90 days", "Duplicate account", "GDPR request", "Internal cleanup", "Policy violation", "Inactive 12 months", "Customer churned"][i],
  archivedBy: "Mehmet Fatih",
  archivedAt: new Date(Date.now() - i * 8 * 86400000).toISOString(),
  scheduledPurgeAt: new Date(Date.now() - i * 8 * 86400000 + 90 * 86400000).toISOString(),
}));

export default function CustomerArchivePage() {
  const { admin } = useOutletContext() || {};
  const brand = ADMIN_BRAND;
  const crit = CRITICAL_RED;
  const indigo = ADMIN_INDIGO;
  const [items, setItems] = useState(SAMPLE_ARCHIVES);
  const [pendingRestore, setPendingRestore] = useState(null);
  const [pendingPurge, setPendingPurge] = useState(null);

  const canRestore = hasPermission(admin, PERMISSIONS.CUSTOMER_RESTORE);
  const canPurge = hasPermission(admin, PERMISSIONS.CUSTOMER_DELETE);

  const restore = () => {
    if (!pendingRestore) return;
    logAdminAction({
      action: "customer.restore",
      resourceType: "customer", resourceId: pendingRestore.customerId,
      severity: "WARNING",
      metadata: { archiveId: pendingRestore.id },
    });
    setItems(items.filter((x) => x.id !== pendingRestore.id));
    setPendingRestore(null);
  };

  const purge = () => {
    if (!pendingPurge) return;
    logAdminAction({
      action: "customer.purge",
      resourceType: "customer", resourceId: pendingPurge.customerId,
      severity: "CRITICAL",
      metadata: { archiveId: pendingPurge.id, reason: "manual_purge" },
    });
    setItems(items.filter((x) => x.id !== pendingPurge.id));
    setPendingPurge(null);
  };

  const columns = [
    { key: "customerName", label: "Customer", sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0F172A" }}>{r.customerName}</div>
          <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "ui-monospace, monospace" }}>{r.customerId}</div>
        </div>
      ),
    },
    { key: "reason", label: "Reason" },
    { key: "archivedAt", label: "Archived", sortable: true,
      render: (r) => <span style={{ fontSize: 12 }}>{fmtRelativeTime(r.archivedAt)}</span> },
    { key: "scheduledPurgeAt", label: "Auto-purge", sortable: true,
      render: (r) => {
        const d = (new Date(r.scheduledPurgeAt).getTime() - Date.now()) / 86400000;
        const days = Math.ceil(d);
        const c = days <= 7 ? crit.dark : days <= 30 ? "#B45309" : "#64748B";
        return <span style={{ fontSize: 12, color: c, fontWeight: 700 }}>{days > 0 ? `${days}d` : "expired"}</span>;
      },
    },
    { key: "actions", label: "Actions", align: "end",
      render: (r) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          {canRestore && (
            <button type="button" onClick={() => setPendingRestore(r)} style={{ background: indigo.bg, color: indigo.dark, border: `1px solid ${indigo.base}40`, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ↶ Restore
            </button>
          )}
          {canPurge && (
            <button type="button" onClick={() => setPendingPurge(r)} style={{ background: crit.bg, color: crit.dark, border: `1px solid ${crit.base}40`, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              🗑 Purge now
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>Archived Customers</h1>
        <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Soft-deleted accounts. Auto-purge runs at 90 days from archive date.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 22 }}>
        <AdminKpiCard label="Total archived"   value={items.length}                                      palette={indigo} icon="🗃" />
        <AdminKpiCard label="Within 30 days"   value={items.filter((i) => (new Date(i.scheduledPurgeAt) - Date.now()) / 86400000 <= 30).length} palette={{ bg: "#FEF3C7", base: "#F59E0B", dark: "#B45309" }} icon="⏰" />
        <AdminKpiCard label="Purge imminent"    value={items.filter((i) => (new Date(i.scheduledPurgeAt) - Date.now()) / 86400000 <= 7).length}  palette={crit} icon="⚠" />
      </div>

      <DataTable columns={columns} rows={items} rowKey="id" empty="No archived customers" />

      <DangerActionDialog
        open={!!pendingRestore}
        title="Restore customer?"
        message={`Restore ${pendingRestore?.customerName} to active status. They'll be able to log in again.`}
        severity="warning"
        steps={1}
        onConfirm={restore}
        onCancel={() => setPendingRestore(null)}
      />
      <DangerActionDialog
        open={!!pendingPurge}
        title="Purge customer immediately?"
        message={`IRREVERSIBLE. This bypasses the 90-day grace period and permanently erases ${pendingPurge?.customerName}. Used only for KVKK/GDPR right-to-erasure requests.`}
        severity="critical"
        steps={3}
        confirmWord="PURGE NOW"
        onConfirm={purge}
        onCancel={() => setPendingPurge(null)}
      />
    </div>
  );
}
