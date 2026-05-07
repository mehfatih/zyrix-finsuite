// ================================================================
// /admin/customers/:id — Full 360° customer detail with 7 tabs
// ================================================================
import React, { useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED, ADMIN_INDIGO } from "../../../utils/admin/adminPalette";
import AdminKpiCard from "../../../components/admin/AdminKpiCard";
import DangerActionDialog from "../../../components/admin/DangerActionDialog";
import { hasPermission, PERMISSIONS } from "../../../utils/admin/permissions";
import { logAdminAction } from "../../../utils/admin/adminApi";
import { startImpersonation } from "../../../components/admin/ImpersonationBanner";
import { fmtCurrency, fmtDate, fmtDateTime, fmtRelativeTime } from "../../../utils/format";

const TABS = [
  { id: "overview",     label: "Overview",       icon: "📊" },
  { id: "billing",      label: "Subscription",   icon: "💳" },
  { id: "usage",        label: "Usage",          icon: "📈" },
  { id: "support",      label: "Support",        icon: "💬" },
  { id: "users",        label: "Users",          icon: "👥" },
  { id: "compliance",   label: "Compliance",     icon: "🛡" },
  { id: "danger",       label: "Admin Actions",  icon: "⚠",  danger: true },
];

const SAMPLE_TIMELINE = [
  { at: new Date(Date.now() - 30 * 60000),       label: "Created invoice #INV-1287", icon: "📄" },
  { at: new Date(Date.now() - 2 * 3600000),       label: "Bank reconciliation completed", icon: "🏦" },
  { at: new Date(Date.now() - 6 * 3600000),       label: "Subscription auto-renewed (Pro · ₺499)", icon: "🔁" },
  { at: new Date(Date.now() - 24 * 3600000),      label: "Login from new device (İstanbul, TR)", icon: "💻" },
  { at: new Date(Date.now() - 3 * 86400000),      label: "Submitted support ticket #TK-9", icon: "🎫" },
];

export default function CustomerDetailPage() {
  const { admin } = useOutletContext() || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const brand = ADMIN_BRAND;
  const trust = TRUST_BLUE;
  const crit = CRITICAL_RED;
  const indigo = ADMIN_INDIGO;

  const [tab, setTab] = useState("overview");
  const [danger, setDanger] = useState(null);
  const [impersonateForm, setImpersonateForm] = useState({ open: false, reason: "" });

  // sample customer derived from id
  const customer = {
    id,
    companyName: "Levana İlaç ve Kozmetik",
    email: "contact@levana.com",
    phone: "+90 555 123 45 67",
    tier: "Pro",
    status: "active",
    country: "TR",
    city: "İstanbul",
    mrr: 499,
    ltv: 12450,
    lifetimeRevenue: 28900,
    daysSinceSignup: 412,
    healthScore: 78,
    churnProbability: 0.18,
    riskScore: "low",
    tags: ["VIP", "Engaged"],
    createdAt: "2024-12-21T08:00:00Z",
  };

  const onArchive = () => {
    logAdminAction({
      action: "customer.archive",
      resourceType: "customer", resourceId: id,
      severity: "WARNING",
      metadata: { tier: customer.tier },
    });
    setDanger(null);
    navigate("/admin/customers/archive");
  };

  const onHardDelete = () => {
    logAdminAction({
      action: "customer.delete",
      resourceType: "customer", resourceId: id,
      severity: "CRITICAL",
      metadata: { tier: customer.tier, reason: "admin_initiated" },
    });
    setDanger(null);
    navigate("/admin/customers");
  };

  const onSuspend = () => {
    logAdminAction({
      action: "customer.suspend",
      resourceType: "customer", resourceId: id,
      severity: "WARNING",
    });
    setDanger(null);
  };

  const onImpersonate = () => {
    if (!impersonateForm.reason.trim()) return;
    startImpersonation({
      customerId: id,
      customerName: customer.companyName,
      reason: impersonateForm.reason.trim(),
      durationMin: 240,
    });
    setImpersonateForm({ open: false, reason: "" });
    // In real impl: redirect to /dashboard with impersonation token
    window.location.href = "/dashboard";
  };

  return (
    <div style={{ padding: "24px 24px" }}>
      <Link to="/admin/customers" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, marginBottom: 14, display: "inline-block" }}>
        ← Customers
      </Link>

      {/* Hero */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 22, marginBottom: 18, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }} className="acd-hero">
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${indigo.base}, ${indigo.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 900 }}>
            {customer.companyName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>{customer.companyName}</h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12, color: "#64748B" }}>
              <code style={{ background: "#F1F5F9", padding: "1px 8px", borderRadius: 4, fontSize: 10 }}>{customer.id}</code>
              <span>·</span>
              <span>{customer.email}</span>
              <span>·</span>
              <span>{customer.city}, {customer.country}</span>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#DBEAFE", color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{customer.tier}</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#DCFCE7", color: "#047857", textTransform: "uppercase", letterSpacing: "0.06em" }}>{customer.status}</span>
              {customer.tags.map((t) => (
                <span key={t} style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#F3EFFF", color: "#5B21B6", textTransform: "uppercase", letterSpacing: "0.06em" }}>🏷 {t}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Health</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#047857", fontFamily: "monospace", lineHeight: 1 }}>{customer.healthScore}</div>
          </div>
          <style>{`@media (max-width: 720px) { .acd-hero { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid #E2E8F0", overflowX: "auto" }}>
        {TABS.map((tb) => {
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? `2.5px solid ${tb.danger ? crit.base : brand.base}` : "2.5px solid transparent",
                padding: "12px 16px",
                fontSize: 12,
                fontWeight: active ? 800 : 600,
                color: active ? (tb.danger ? crit.dark : "#0F172A") : "#64748B",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tb.icon} {tb.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
            <AdminKpiCard label="MRR"             value={fmtCurrency(customer.mrr)}            palette={trust}  icon="💰" />
            <AdminKpiCard label="LTV"             value={fmtCurrency(customer.ltv)}            palette={indigo} icon="💎" />
            <AdminKpiCard label="Lifetime Revenue" value={fmtCurrency(customer.lifetimeRevenue)} palette={{ bg: "#DCFCE7", base: "#10B981", dark: "#047857" }} icon="📈" />
            <AdminKpiCard label="Days since signup" value={customer.daysSinceSignup}             palette={{ bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8" }} icon="📅" />
            <AdminKpiCard label="Churn probability" value={`${(customer.churnProbability * 100).toFixed(0)}%`} palette={crit} icon="📉" />
            <AdminKpiCard label="Health"           value={customer.healthScore}                  palette={{ bg: "#DCFCE7", base: "#10B981", dark: "#047857" }} icon="❤️" />
          </div>

          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>Activity timeline</h3>
            {SAMPLE_TIMELINE.map((ev, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "10px 0", borderBottom: i < SAMPLE_TIMELINE.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <span style={{ fontSize: 16 }}>{ev.icon}</span>
                <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{ev.label}</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{fmtRelativeTime(ev.at.toISOString())}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>Current subscription</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
            <Row k="Plan"           v={customer.tier} />
            <Row k="MRR"            v={fmtCurrency(customer.mrr)} mono />
            <Row k="Status"         v={customer.status} />
            <Row k="Renews on"      v={fmtDate(new Date(Date.now() + 12 * 86400000).toISOString())} />
            <Row k="Method"         v="Iyzico · ****4242" />
            <Row k="Last invoice"   v={fmtDate(new Date(Date.now() - 18 * 86400000).toISOString())} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={primaryBtn(brand)}>Apply discount</button>
            <button type="button" style={ghostBtn()}>Change tier</button>
            <button type="button" style={ghostBtn()}>Issue refund</button>
            <button type="button" style={ghostBtn()}>Schedule cancellation</button>
            <button type="button" style={ghostBtn()}>Extend trial</button>
          </div>
        </div>
      )}

      {tab === "usage" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, color: "#64748B", textAlign: "center", fontSize: 14 }}>
          📊 Feature usage charts, login history, API usage, storage usage — Phase 14b deep implementation
        </div>
      )}

      {tab === "support" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, color: "#64748B", textAlign: "center", fontSize: 14 }}>
          💬 Tickets list, email correspondence, chat history, NPS scores, internal notes — Phase 14b
        </div>
      )}

      {tab === "users" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, color: "#64748B", textAlign: "center", fontSize: 14 }}>
          👥 User management — invite, reset password, remove, role assignment — Phase 14b
        </div>
      )}

      {tab === "compliance" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, color: "#64748B", textAlign: "center", fontSize: 14 }}>
          🛡 Data retention, KVKK/GDPR requests, audit trail for this customer — Phase 14b
        </div>
      )}

      {tab === "danger" && (
        <div style={{ background: crit.bg, border: `1.5px solid ${crit.base}`, borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: crit.dark, margin: "0 0 6px" }}>⚠ Danger Zone</h3>
          <p style={{ fontSize: 12, color: "#475569", margin: "0 0 18px" }}>These actions are logged to the admin audit log with severity WARNING or CRITICAL.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <DangerRow
              icon="🎭"
              title="Login as customer (impersonate)"
              desc="Access this customer's dashboard with a temporary token. All actions logged."
              actionLabel="Start session"
              palette={trust}
              onClick={() => setImpersonateForm({ open: true, reason: "" })}
              perm={hasPermission(admin, PERMISSIONS.CUSTOMER_IMPERSONATE)}
            />
            <DangerRow
              icon="⏸"
              title="Suspend account"
              desc="Customer cannot log in. Data preserved. Reversible at any time."
              actionLabel="Suspend"
              palette={{ bg: "#FEF3C7", base: "#F59E0B", dark: "#B45309" }}
              onClick={() => setDanger("suspend")}
            />
            <DangerRow
              icon="🗃"
              title="Archive (soft delete)"
              desc="Hide from active views. Data retained for 90 days, then auto-purged. Restorable."
              actionLabel="Archive"
              palette={{ bg: "#F1F5F9", base: "#64748B", dark: "#0F172A" }}
              onClick={() => setDanger("archive")}
              perm={hasPermission(admin, PERMISSIONS.CUSTOMER_ARCHIVE)}
            />
            <DangerRow
              icon="🗑"
              title="Permanently delete (GDPR/KVKK hard delete)"
              desc="IRREVERSIBLE. All customer data, invoices, history erased. 5-step confirmation."
              actionLabel="Delete forever"
              palette={crit}
              onClick={() => setDanger("delete")}
              perm={hasPermission(admin, PERMISSIONS.CUSTOMER_DELETE)}
            />
            <DangerRow
              icon="🔀"
              title="Merge with another account"
              desc="Combine two customer records into one. All invoices, users, and history move."
              actionLabel="Merge"
              palette={{ bg: "#F3EFFF", base: "#8B5CF6", dark: "#5B21B6" }}
              onClick={() => navigate(`/admin/customers/merge?source=${id}`)}
              perm={hasPermission(admin, PERMISSIONS.MERGE_ACCOUNTS)}
            />
          </div>
        </div>
      )}

      {/* Impersonation consent dialog */}
      {impersonateForm.open && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.7)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 18, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: crit.dark, margin: "0 0 6px" }}>🎭 Impersonate {customer.companyName}?</h2>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>This action is logged with severity WARNING. The customer will see a banner once you reach their dashboard.</p>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Reason (mandatory, audit-logged)</label>
            <textarea
              value={impersonateForm.reason}
              onChange={(e) => setImpersonateForm({ ...impersonateForm, reason: e.target.value })}
              placeholder="e.g. Customer requested help reproducing invoice issue"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setImpersonateForm({ open: false, reason: "" })} style={ghostBtn()}>Cancel</button>
              <button type="button" disabled={!impersonateForm.reason.trim()} onClick={onImpersonate} style={{ ...primaryBtn(trust), opacity: impersonateForm.reason.trim() ? 1 : 0.4, cursor: impersonateForm.reason.trim() ? "pointer" : "not-allowed" }}>
                ⚡ Start session (4h)
              </button>
            </div>
          </div>
        </div>
      )}

      <DangerActionDialog
        open={danger === "suspend"}
        title="Suspend this customer?"
        message="They will not be able to log in. Reversible — you can reactivate any time."
        severity="warning"
        steps={1}
        onConfirm={onSuspend}
        onCancel={() => setDanger(null)}
      />
      <DangerActionDialog
        open={danger === "archive"}
        title="Archive (soft delete) this customer?"
        message="They will be hidden from active views. Data retained for 90 days, then auto-purged. Restorable from the Archive page."
        severity="warning"
        steps={1}
        confirmWord="ARCHIVE"
        onConfirm={onArchive}
        onCancel={() => setDanger(null)}
      />
      <DangerActionDialog
        open={danger === "delete"}
        title="Permanently delete this customer?"
        message="IRREVERSIBLE. All invoices, users, conversations, files, and audit history will be erased forever. This action satisfies KVKK Art. 7 / GDPR Art. 17 right-to-erasure."
        severity="critical"
        steps={5}
        confirmWord="DELETE FOREVER"
        onConfirm={onHardDelete}
        onCancel={() => setDanger(null)}
      />
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 700, fontFamily: mono ? "monospace" : "inherit" }}>{v}</div>
    </div>
  );
}

function DangerRow({ icon, title, desc, actionLabel, palette, onClick, perm = true }) {
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${palette.base}30`, borderRadius: 12, padding: 14, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: palette.dark }}>{title}</div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{desc}</div>
      </div>
      <button type="button" disabled={!perm} onClick={onClick} style={{ background: perm ? palette.base : "#CBD5E1", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: perm ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
        {perm ? actionLabel : "🔒 No permission"}
      </button>
    </div>
  );
}

function ghostBtn() {
  return { background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };
}
function primaryBtn(p) {
  return { background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${p.base}40` };
}
