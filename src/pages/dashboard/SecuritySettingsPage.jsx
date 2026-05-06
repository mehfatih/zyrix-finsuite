// ============================================================
// Zyrix FinSuite - Security Settings Page (Sprint 3)
// 3 tabs: Users (RBAC), Audit Logs, IP Allowlist
// ============================================================

import React, { useState, useEffect } from "react";
import { sprint3API } from "../../services/api";

const COLORS = {
  primary: "#0891B2",
  accent: "#06B6D4",
  text: "#1E1B4B",
  muted: "#64748B",
  border: "#E2E8F8",
  bg: "#F8FAFC",
};

const ROLE_BADGE_COLORS = {
  OWNER: { bg: "#FEE2E2", color: "#991B1B" },
  ADMIN: { bg: "#DBEAFE", color: "#1E40AF" },
  MANAGER: { bg: "#D1FAE5", color: "#065F46" },
  ACCOUNTANT: { bg: "#FEF3C7", color: "#92400E" },
  STAFF: { bg: "#E0E7FF", color: "#3730A3" },
  VIEWER: { bg: "#F1F5F9", color: "#475569" },
};

const ACTION_LABELS = {
  CREATE: "Created",
  READ: "Read",
  UPDATE: "Updated",
  DELETE: "Deleted",
  LOGIN: "Login",
  LOGOUT: "Logout",
  EXPORT: "Exported",
  IMPORT: "Imported",
  PERMISSION_CHANGE: "Permission Change",
  SUBSCRIPTION_CHANGE: "Subscription Change",
  CONNECTION_CONNECT: "Connection Connect",
  CONNECTION_DISCONNECT: "Connection Disconnect",
  WEBHOOK_RECEIVED: "Webhook",
  CRON_RUN: "Cron Job",
  ERROR: "Error",
};

export default function SecuritySettingsPage() {
  const [tab, setTab] = useState("users");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0 }}>
          🔒 Security & Users
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 13, margin: "4px 0 0" }}>
          Manage team members, audit trail, and network access controls
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24 }}>
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>
          👥 Users
        </TabBtn>
        <TabBtn active={tab === "audit"} onClick={() => setTab("audit")}>
          📋 Audit Logs
        </TabBtn>
        <TabBtn active={tab === "ip"} onClick={() => setTab("ip")}>
          🌐 IP Allowlist
        </TabBtn>
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "audit" && <AuditTab />}
      {tab === "ip" && <IpAllowlistTab />}
    </div>
  );
}

// ============================================================
// USERS TAB
// ============================================================

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([
        sprint3API.listUsers(),
        sprint3API.rolesCatalog(),
      ]);
      setUsers(u?.data?.users || []);
      setRoles(r?.data?.roles || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (user) => {
    if (!confirm(`Remove ${user.email}? They will lose access immediately.`)) return;
    try {
      await sprint3API.deleteUser(user.id);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onToggleActive = async (user) => {
    try {
      await sprint3API.updateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) return <Loading>Loading users...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>Team Members ({users.length})</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
            Invite team members and assign roles. Each role has a different set of permissions.
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} style={btnPrimary}>+ Invite User</button>
      </div>

      {users.length === 0 ? (
        <EmptyState>No team members yet. Invite one to get started.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last Login</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td>
                    <div style={{ fontWeight: 600, color: COLORS.text }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{u.email}</div>
                  </Td>
                  <Td><RoleBadge role={u.role} /></Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                      background: u.isActive ? "#D1FAE5" : "#FEE2E2",
                      color: u.isActive ? "#065F46" : "#991B1B",
                    }}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : <span style={{ color: COLORS.muted }}>Never</span>}</Td>
                  <Td align="right">
                    <button onClick={() => onToggleActive(u)} style={btnSm}>{u.isActive ? "Disable" : "Enable"}</button>
                    <button onClick={() => onDelete(u)} style={{ ...btnSm, marginLeft: 8, color: "#991B1B" }}>Remove</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <InviteModal
          roles={roles}
          onClose={() => setShowInvite(false)}
          onCreated={() => { setShowInvite(false); load(); }}
        />
      )}
    </div>
  );
}

function InviteModal({ roles, onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STAFF");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!email || !name || !password) {
      setError("All fields are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await sprint3API.inviteUser({ email, name, role, password });
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", color: COLORS.text }}>Invite Team Member</h3>

      <Field label="Full Name">
        <input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="John Doe" />
      </Field>
      <Field label="Email">
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="user@company.com" />
      </Field>
      <Field label="Role">
        <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
          {roles.filter((r) => r.role !== "OWNER").map((r) => (
            <option key={r.role} value={r.role}>
              {r.label} - {r.description}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Initial Password">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} placeholder="Min 8 characters" />
      </Field>

      {error && <div style={{ color: "#991B1B", fontSize: 13, marginTop: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnSecondary}>Cancel</button>
        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Creating..." : "Send Invite"}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ============================================================
// AUDIT LOGS TAB
// ============================================================

function AuditTab() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ action: "", failuresOnly: false });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter.action) params.action = filter.action;
      if (filter.failuresOnly) params.failuresOnly = "true";
      params.limit = 100;

      const [l, s] = await Promise.all([
        sprint3API.listAuditLogs(params),
        sprint3API.auditSummary(30),
      ]);
      setLogs(l?.data?.rows || []);
      setSummary(s?.data || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter.action, filter.failuresOnly]);

  if (loading) return <Loading>Loading audit logs...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Events (30d)" value={summary.totalEvents} />
          <StatCard label="Failures" value={summary.failures} color={summary.failures > 0 ? "#EF4444" : "#10B981"} />
          <StatCard label="Recent Logins" value={summary.recentLogins?.length || 0} />
          <StatCard label="Action Types" value={summary.byAction?.length || 0} />
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <label style={{ fontSize: 13, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={filter.failuresOnly}
            onChange={(e) => setFilter({ ...filter, failuresOnly: e.target.checked })}
          />
          Failures only
        </label>

        <button onClick={load} style={btnSm}>🔄 Refresh</button>
      </div>

      {logs.length === 0 ? (
        <EmptyState>No audit events match the current filter.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>Time</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>IP</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td><span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(log.createdAt).toLocaleString()}</span></Td>
                  <Td><span style={{ fontSize: 12 }}>{log.userEmail || "-"}</span></Td>
                  <Td><span style={{ fontSize: 12, fontWeight: 600 }}>{ACTION_LABELS[log.action] || log.action}</span></Td>
                  <Td>
                    <span style={{ fontSize: 12 }}>{log.resource}</span>
                    {log.resourceId && <span style={{ fontSize: 10, color: COLORS.muted, display: "block" }}>{log.resourceId.substring(0, 12)}...</span>}
                  </Td>
                  <Td><span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.muted }}>{log.ipAddress || "-"}</span></Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                      background: log.success ? "#D1FAE5" : "#FEE2E2",
                      color: log.success ? "#065F46" : "#991B1B",
                    }}>
                      {log.success ? "OK" : "FAIL"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// IP ALLOWLIST TAB
// ============================================================

function IpAllowlistTab() {
  const [config, setConfig] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await sprint3API.getAllowlist();
      setConfig(r?.data?.config || null);
      setEntries(r?.data?.entries || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChangeMode = async (mode) => {
    if (mode === "ALLOWLIST" && entries.length === 0) {
      if (!confirm("ALLOWLIST mode with no entries will block ALL access. Continue?")) return;
    }
    try {
      await sprint3API.setAllowlistMode(mode);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onToggle = async (entry) => {
    try {
      await sprint3API.toggleAllowlistEntry(entry.id, !entry.isActive);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onRemove = async (entry) => {
    if (!confirm(`Remove ${entry.ipAddress}?`)) return;
    try {
      await sprint3API.removeAllowlistEntry(entry.id);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) return <Loading>Loading IP rules...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  const mode = config?.mode || "DISABLED";

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", color: COLORS.text, fontSize: 15 }}>Enforcement Mode</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>
          Choose how IP rules are applied to API requests.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { v: "DISABLED",  label: "Disabled",  desc: "No restrictions" },
            { v: "ALLOWLIST", label: "Allowlist", desc: "Only listed IPs allowed" },
            { v: "BLOCKLIST", label: "Blocklist", desc: "Listed IPs blocked" },
          ].map((m) => (
            <ModeButton
              key={m.v}
              active={mode === m.v}
              onClick={() => onChangeMode(m.v)}
              label={m.label}
              desc={m.desc}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>IP Entries ({entries.length})</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
            Single IPs (e.g. <code>1.2.3.4</code>) or CIDR ranges (e.g. <code>10.0.0.0/24</code>).
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={btnPrimary}>+ Add IP</button>
      </div>

      {entries.length === 0 ? (
        <EmptyState>No IP entries configured.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>IP / CIDR</Th>
                <Th>Description</Th>
                <Th>Status</Th>
                <Th>Added</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td><code style={{ fontFamily: "monospace", color: COLORS.text }}>{e.ipAddress}</code></Td>
                  <Td>{e.description || <span style={{ color: COLORS.muted }}>—</span>}</Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600,
                      background: e.isActive ? "#D1FAE5" : "#F1F5F9",
                      color: e.isActive ? "#065F46" : "#475569",
                    }}>
                      {e.isActive ? "Active" : "Disabled"}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(e.createdAt).toLocaleDateString()}</span></Td>
                  <Td align="right">
                    <button onClick={() => onToggle(e)} style={btnSm}>{e.isActive ? "Disable" : "Enable"}</button>
                    <button onClick={() => onRemove(e)} style={{ ...btnSm, marginLeft: 8, color: "#991B1B" }}>Remove</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddIpModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load(); }} />
      )}
    </div>
  );
}

function AddIpModal({ onClose, onAdded }) {
  const [ip, setIp] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!ip) { setError("IP address required"); return; }
    setSubmitting(true);
    try {
      await sprint3API.addAllowlistEntry(ip, desc);
      onAdded();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", color: COLORS.text }}>Add IP Address</h3>

      <Field label="IP / CIDR">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          style={inp}
          placeholder="1.2.3.4 or 10.0.0.0/24"
        />
      </Field>
      <Field label="Description (optional)">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={inp}
          placeholder="Office network, VPN gateway..."
        />
      </Field>

      {error && <div style={{ color: "#991B1B", fontSize: 13, marginTop: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnSecondary}>Cancel</button>
        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "10px 18px",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer",
        marginBottom: -1.5,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: 14,
    }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function RoleBadge({ role }) {
  const c = ROLE_BADGE_COLORS[role] || { bg: "#F1F5F9", color: "#475569" };
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: "3px 10px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
    }}>
      {role}
    </span>
  );
}

function ModeButton({ active, onClick, label, desc }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 160,
        background: active ? COLORS.primary : "#fff",
        color: active ? "#fff" : COLORS.text,
        border: active ? "none" : `1.5px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{desc}</div>
    </button>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 460,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Th({ children, align }) {
  return (
    <th style={{
      padding: "12px 16px",
      textAlign: align || "left",
      fontSize: 11,
      fontWeight: 700,
      color: COLORS.muted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td style={{
      padding: "12px 16px",
      textAlign: align || "left",
      fontSize: 13,
      color: COLORS.text,
    }}>
      {children}
    </td>
  );
}

function Loading({ children }) {
  return <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>{children}</div>;
}

function ErrorBox({ children }) {
  return <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{children}</div>;
}

function EmptyState({ children }) {
  return (
    <div style={{
      padding: 40,
      textAlign: "center",
      color: COLORS.muted,
      background: "#fff",
      borderRadius: 12,
      border: `1px dashed ${COLORS.border}`,
    }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

const btnPrimary = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  background: "#fff",
  color: COLORS.text,
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSm = {
  background: "transparent",
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
