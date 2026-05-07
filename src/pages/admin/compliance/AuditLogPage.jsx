// ================================================================
// /admin/compliance/audit — Admin audit log (deep). Filter, expand, export
// Reads AdminAuditLog from backend; falls back to localStorage seed.
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../../../components/admin/DataTable";
import AdminKpiCard from "../../../components/admin/AdminKpiCard";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED, ROLE_PALETTE } from "../../../utils/admin/adminPalette";
import { listAdminAudit } from "../../../utils/admin/adminApi";
import { fmtDateTime, fmtRelativeTime } from "../../../utils/format";

const SEVERITY_PILL = {
  INFO:     { bg: "#DBEAFE", dark: "#1E40AF" },
  WARNING:  { bg: "#FEF3C7", dark: "#B45309" },
  CRITICAL: { bg: "#FEE2E2", dark: "#991B1B" },
};

const ACTION_PALETTE = {
  customer:     { bg: "#EAEDFF", dark: "#3730A3" },
  subscription: { bg: "#DEFAF6", dark: "#115E59" },
  invoice:      { bg: "#DCFCE7", dark: "#047857" },
  coupon:       { bg: "#FFF8E5", dark: "#B45309" },
  admin:        { bg: "#FFE4E6", dark: "#9F1239" },
  feature_flag: { bg: "#F3EFFF", dark: "#5B21B6" },
  data:         { bg: "#DBEAFE", dark: "#1E40AF" },
  default:      { bg: "#F1F5F9", dark: "#334155" },
};

// Seed entries for offline visibility
const SEED_AUDIT = Array.from({ length: 35 }).map((_, i) => {
  const actions = [
    { action: "customer.archive",         severity: "WARNING",  resourceType: "customer" },
    { action: "customer.delete",          severity: "CRITICAL", resourceType: "customer" },
    { action: "customer.impersonate.started", severity: "WARNING", resourceType: "customer" },
    { action: "subscription.refund",      severity: "WARNING",  resourceType: "subscription" },
    { action: "subscription.cancel",      severity: "WARNING",  resourceType: "subscription" },
    { action: "coupon.create",            severity: "INFO",     resourceType: "coupon" },
    { action: "coupon.delete",            severity: "WARNING",  resourceType: "coupon" },
    { action: "feature_flag.toggle",      severity: "INFO",     resourceType: "feature_flag" },
    { action: "admin.login.success",      severity: "INFO",     resourceType: "admin" },
    { action: "admin.login.failed",       severity: "WARNING",  resourceType: "admin" },
    { action: "admin.password.changed",   severity: "INFO",     resourceType: "admin" },
    { action: "data.export.bulk",         severity: "INFO",     resourceType: "data" },
  ];
  const a = actions[i % actions.length];
  return {
    id: `aud-seed-${i}`,
    ...a,
    resourceId: `${a.resourceType}-${1000 + i}`,
    adminEmail: ["meh.fatih77@gmail.com", "admin@finsuite.zyrix.co"][i % 2],
    ipAddress: `85.121.${30 + (i % 50)}.${50 + (i % 90)}`,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    metadata: { source: "admin-panel", endpoint: `/api/admin/${a.resourceType}s/${1000 + i}` },
    createdAt: new Date(Date.now() - i * 17 * 60000).toISOString(),
  };
});

export default function AdminAuditLogPage() {
  const brand = ADMIN_BRAND;
  const trust = TRUST_BLUE;
  const crit = CRITICAL_RED;

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [resource, setResource] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    listAdminAudit({ limit: 200 }).then((items) => {
      setEntries(items.length > 0 ? items : SEED_AUDIT);
    });
  }, []);

  const filtered = useMemo(() => entries.filter((e) => {
    if (severity && e.severity !== severity) return false;
    if (resource && e.resourceType !== resource) return false;
    if (search) {
      const t = search.toLowerCase();
      if (!`${e.action} ${e.resourceType} ${e.resourceId} ${e.adminEmail} ${e.ipAddress}`.toLowerCase().includes(t)) return false;
    }
    return true;
  }), [entries, search, severity, resource]);

  const counts = useMemo(() => ({
    total: entries.length,
    info: entries.filter((e) => e.severity === "INFO").length,
    warning: entries.filter((e) => e.severity === "WARNING").length,
    critical: entries.filter((e) => e.severity === "CRITICAL").length,
  }), [entries]);

  const exportCsv = () => {
    const header = "createdAt,adminEmail,action,resourceType,resourceId,severity,ipAddress\n";
    const rows = filtered.map((e) => `${e.createdAt},${e.adminEmail || ""},${e.action},${e.resourceType || ""},${e.resourceId || ""},${e.severity || ""},${e.ipAddress || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `admin-audit-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const resourceTypes = useMemo(() => Array.from(new Set(entries.map((e) => e.resourceType).filter(Boolean))), [entries]);

  const columns = [
    { key: "createdAt", label: "When", width: 160, sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontSize: 12, color: "#0F172A", fontFamily: "ui-monospace, monospace" }}>{fmtDateTime(r.createdAt)}</div>
          <div style={{ fontSize: 10, color: "#94A3B8" }}>{fmtRelativeTime(r.createdAt)}</div>
        </div>
      ),
    },
    { key: "adminEmail", label: "Admin",
      render: (r) => <span style={{ fontSize: 11, color: "#475569" }}>{r.adminEmail || "—"}</span> },
    { key: "action", label: "Action", sortable: true,
      render: (r) => {
        const p = ACTION_PALETTE[r.resourceType] || ACTION_PALETTE.default;
        return <code style={{ background: p.bg, color: p.dark, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{r.action}</code>;
      },
    },
    { key: "resourceId", label: "Resource", mono: true,
      render: (r) => <span style={{ fontSize: 11, color: "#475569" }}>{r.resourceId || "—"}</span> },
    { key: "ipAddress", label: "IP", mono: true,
      render: (r) => <span style={{ fontSize: 11, color: "#94A3B8" }}>{r.ipAddress || "—"}</span> },
    { key: "severity", label: "Severity", sortable: true,
      render: (r) => {
        const p = SEVERITY_PILL[r.severity] || SEVERITY_PILL.INFO;
        return <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.severity}</span>;
      },
    },
    { key: "expand", label: "", width: 30, align: "end",
      render: (r) => <span style={{ color: "#94A3B8" }}>{expanded === r.id ? "▼" : "▸"}</span> },
  ];

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>Admin Audit Log</h1>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Every admin action is recorded here. Retention: 7 years per KVKK Art. 16.</p>
        </div>
        <button type="button" onClick={exportCsv} style={{ background: `linear-gradient(135deg, ${trust.base}, ${trust.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${trust.base}40` }}>
          ↓ Export CSV ({filtered.length})
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <AdminKpiCard label="Total entries"     value={counts.total}     palette={trust} icon="📜" />
        <AdminKpiCard label="INFO"              value={counts.info}      palette={{ bg: "#DBEAFE", base: "#1E40AF", dark: "#1E3A8A" }} icon="ℹ" />
        <AdminKpiCard label="WARNING"           value={counts.warning}   palette={{ bg: "#FEF3C7", base: "#F59E0B", dark: "#B45309" }} icon="⚠" />
        <AdminKpiCard label="CRITICAL"          value={counts.critical}  palette={crit} icon="🚨" />
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14, display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }} className="aal-filters">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, resource, admin email, IP…" style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit" }}>
          <option value="">All severities</option>
          {["INFO", "WARNING", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={resource} onChange={(e) => setResource(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit" }}>
          <option value="">All resources</option>
          {resourceTypes.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="button" onClick={() => { setSearch(""); setSeverity(""); setResource(""); }} style={{ background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✗ Clear</button>
        <style>{`@media (max-width: 720px) { .aal-filters { grid-template-columns: 1fr !important; } }`}</style>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey="id"
        density="compact"
        onRowClick={(r) => setExpanded(expanded === r.id ? null : r.id)}
        empty="No matching audit entries"
      />

      {expanded && (
        <div style={{ marginTop: 14, background: "#0F172A", color: "#A5F3FC", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Entry detail · {expanded}</div>
          <pre style={{ margin: 0, fontSize: 11, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(filtered.find((e) => e.id === expanded), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
