// ================================================================
// /admin/customers — Filterable, sortable, exportable customer list
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
import DataTable from "../../../components/admin/DataTable";
import BulkActionsBar from "../../../components/admin/BulkActionsBar";
import DangerActionDialog from "../../../components/admin/DangerActionDialog";
import { hasPermission, PERMISSIONS } from "../../../utils/admin/permissions";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED, ROLE_PALETTE } from "../../../utils/admin/adminPalette";
import { logAdminAction } from "../../../utils/admin/adminApi";
import { fmtCurrency, fmtRelativeTime, fmtDate } from "../../../utils/format";

// Sample customer dataset — backend will return real data via GET /api/admin/customers
const SAMPLE_CUSTOMERS = Array.from({ length: 35 }).map((_, i) => {
  const tiers = ["Lite", "Pro", "Business", "Enterprise"];
  const statuses = ["active", "trial", "suspended", "archived"];
  const countries = ["TR", "TR", "TR", "AE", "SA", "EG"];
  const tier = tiers[i % tiers.length];
  return {
    id: `cus-${1000 + i}`,
    companyName: ["Levana İlaç", "Aydın Ova", "İstanbul Bakery", "Beyoğlu Cafe", "MENA Trading", "Cairo Imports", "Riyadh Tech", "Ankara Logistics"][i % 8] + ` #${i + 1}`,
    email: `contact${i + 1}@example.com`,
    phone: `+90 5${String(30 + (i % 50))} ${String(100 + i).slice(-3)} ${String(20 + i).slice(-2)} ${String(40 + i).slice(-2)}`,
    tier,
    status: statuses[i % statuses.length],
    country: countries[i % countries.length],
    mrr: tier === "Enterprise" ? 4999 : tier === "Business" ? 1499 : tier === "Pro" ? 499 : 99,
    createdAt: new Date(Date.now() - (i * 11 + 3) * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - (i % 14) * 3600000).toISOString(),
    riskScore: i % 7 === 0 ? "high" : i % 5 === 0 ? "medium" : "low",
    tags: i % 3 === 0 ? ["VIP"] : i % 4 === 0 ? ["At-Risk"] : [],
  };
});

const STATUS_PILL = {
  active:    { bg: "#DCFCE7", dark: "#047857" },
  trial:     { bg: "#FEF3C7", dark: "#B45309" },
  suspended: { bg: "#FFE4E6", dark: "#9F1239" },
  archived:  { bg: "#F1F5F9", dark: "#475569" },
};

const TIER_PILL = {
  Lite:       { bg: "#F1F5F9", dark: "#334155" },
  Pro:        { bg: "#DBEAFE", dark: "#1E40AF" },
  Business:   { bg: "#F3EFFF", dark: "#5B21B6" },
  Enterprise: { bg: "#FEE2E2", dark: "#991B1B" },
};

const RISK_PILL = {
  high:   { bg: "#FEE2E2", dark: "#991B1B", label: "HIGH" },
  medium: { bg: "#FEF3C7", dark: "#B45309", label: "MED" },
  low:    { bg: "#DCFCE7", dark: "#047857", label: "LOW" },
};

export default function CustomersListPage() {
  const { admin } = useOutletContext() || {};
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const brand = ADMIN_BRAND;

  const [search, setSearch] = useState(params.get("q") || "");
  const [tier, setTier] = useState(params.get("tier") || "");
  const [status, setStatus] = useState(params.get("status") || "");
  const [selected, setSelected] = useState([]);
  const [density, setDensity] = useState("comfortable");
  const [bulkAction, setBulkAction] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const next = {};
    if (search) next.q = search;
    if (tier) next.tier = tier;
    if (status) next.status = status;
    setParams(next, { replace: true });
  }, [search, tier, status, setParams]);

  const filtered = useMemo(() => {
    return SAMPLE_CUSTOMERS.filter((c) => {
      if (search) {
        const t = search.toLowerCase();
        if (!`${c.companyName} ${c.email} ${c.phone} ${c.id}`.toLowerCase().includes(t)) return false;
      }
      if (tier && c.tier !== tier) return false;
      if (status && c.status !== status) return false;
      return true;
    });
  }, [search, tier, status]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const exportCsv = () => {
    const rows = filtered.map((c) => [c.id, c.companyName, c.email, c.tier, c.status, c.mrr, c.country, c.createdAt].join(","));
    const csv = ["id,company,email,tier,status,mrr,country,createdAt", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `customers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    logAdminAction({ action: "data.export.bulk", resourceType: "customer", metadata: { count: filtered.length, format: "csv" } });
  };

  const onConfirmBulk = () => {
    const action = bulkAction;
    setBulkAction(null);
    if (!action) return;
    logAdminAction({
      action: `customer.bulk.${action.kind}`,
      resourceType: "customer",
      metadata: { ids: selected, count: selected.length },
      severity: action.kind === "delete" ? "CRITICAL" : "WARNING",
    });
    setSelected([]);
  };

  const columns = [
    { key: "companyName", label: "Customer", sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13 }}>{r.companyName}</div>
          <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "ui-monospace, monospace" }}>{r.id}</div>
        </div>
      ),
    },
    { key: "email", label: "Email", sortable: true,
      render: (r) => <span style={{ color: "#475569" }}>{r.email}</span> },
    { key: "tier", label: "Tier", sortable: true,
      render: (r) => {
        const p = TIER_PILL[r.tier];
        return <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.tier}</span>;
      },
    },
    { key: "status", label: "Status", sortable: true,
      render: (r) => {
        const p = STATUS_PILL[r.status];
        return <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.status}</span>;
      },
    },
    { key: "mrr", label: "MRR", sortable: true, align: "end", mono: true,
      render: (r) => <strong style={{ color: "#0F172A" }}>{fmtCurrency(r.mrr)}</strong> },
    { key: "country", label: "Country" },
    { key: "riskScore", label: "Risk",
      render: (r) => {
        const p = RISK_PILL[r.riskScore];
        return <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: p.bg, color: p.dark }}>{p.label}</span>;
      },
    },
    { key: "lastActiveAt", label: "Last active", sortable: true,
      render: (r) => <span style={{ fontSize: 11, color: "#64748B" }}>{fmtRelativeTime(r.lastActiveAt)}</span> },
    { key: "createdAt", label: "Created", sortable: true,
      render: (r) => <span style={{ fontSize: 11, color: "#64748B" }}>{fmtDate(r.createdAt)}</span> },
  ];

  const canBulk = hasPermission(admin, PERMISSIONS.CUSTOMER_BULK);

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0" }}>{filtered.length} of {SAMPLE_CUSTOMERS.length} matching</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")} style={ghostBtn()}>
            {density === "compact" ? "↕ Comfortable" : "↔ Compact"}
          </button>
          <button type="button" onClick={exportCsv} style={primaryBtn(brand)}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14, display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }} className="acl-filters">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search company, email, phone, ID…"
          style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(1); }} style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit" }}>
          <option value="">All tiers</option>
          {["Lite", "Pro", "Business", "Enterprise"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit" }}>
          <option value="">All statuses</option>
          {["active", "trial", "suspended", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="button" onClick={() => { setSearch(""); setTier(""); setStatus(""); }} style={ghostBtn()}>
          ✗ Clear
        </button>
        <style>{`@media (max-width: 720px) { .acl-filters { grid-template-columns: 1fr !important; } }`}</style>
      </div>

      <DataTable
        columns={columns}
        rows={paged}
        rowKey="id"
        selectable={canBulk}
        selectedIds={selected}
        onSelectionChange={setSelected}
        density={density}
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        empty="No customers match your filters"
      />

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12 }}>
        <span style={{ color: "#64748B" }}>Page {page} of {totalPages} · {PAGE_SIZE} per page</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} style={pageBtn(page === 1)}>← Prev</button>
          <button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} style={pageBtn(page === totalPages)}>Next →</button>
        </div>
      </div>

      <BulkActionsBar
        count={selected.length}
        onClear={() => setSelected([])}
        actions={[
          { label: "Suspend",  icon: "⏸", variant: "primary", onClick: () => setBulkAction({ kind: "suspend" }) },
          { label: "Tag",      icon: "🏷", variant: "default", onClick: () => setBulkAction({ kind: "tag" }) },
          { label: "Archive",  icon: "🗃",  variant: "default", onClick: () => setBulkAction({ kind: "archive" }) },
          { label: "Delete",   icon: "🗑",  variant: "danger",  onClick: () => setBulkAction({ kind: "delete" }) },
        ]}
      />

      <DangerActionDialog
        open={!!bulkAction}
        title={bulkAction?.kind === "delete" ? `Permanently delete ${selected.length} customers?` : `Bulk ${bulkAction?.kind} ${selected.length} customers`}
        message={bulkAction?.kind === "delete" ? "This is irreversible. All customer data, invoices, and history will be permanently erased." : `Apply ${bulkAction?.kind} to ${selected.length} selected customers.`}
        severity={bulkAction?.kind === "delete" ? "critical" : "warning"}
        steps={bulkAction?.kind === "delete" ? 5 : 1}
        confirmWord={bulkAction?.kind === "delete" ? "DELETE" : null}
        onConfirm={onConfirmBulk}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}

function ghostBtn() {
  return { background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
}
function primaryBtn(p) {
  return { background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${p.base}40`, whiteSpace: "nowrap" };
}
function pageBtn(disabled) {
  return { background: disabled ? "#F1F5F9" : "#fff", color: disabled ? "#CBD5E1" : "#0F172A", border: "1px solid #E2E8F0", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" };
}
