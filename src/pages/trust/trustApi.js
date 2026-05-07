// ================================================================
// Phase 13 — Trust + Security API client.
// 2FA setup/verify, sessions, audit log, KVKK export.
// All backed by /api/security/*; localStorage fallback for dev.
// ================================================================

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function api(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const KEYS = {
  twofa:        "zyrix_2fa_state_v1",
  sessions:     "zyrix_sessions_v1",
  auditLog:     "zyrix_audit_log_v1",
  exportRequests: "zyrix_data_export_requests_v1",
};

const local = {
  list(k)        { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
  save(k, v)     { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  get(k, fb)     { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (fb ?? null); } catch { return fb ?? null; } },
  set(k, v)      { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  add(k, item)   {
    const arr = local.list(k);
    const next = [{ ...item, id: item.id || `${k}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...arr];
    local.save(k, next);
    return next[0];
  },
  update(k, id, patch) {
    const arr = local.list(k).map((x) => (x.id === id ? { ...x, ...patch } : x));
    local.save(k, arr);
    return arr.find((x) => x.id === id);
  },
};

// ── 2FA ──────────────────────────────────────────────────────
export async function get2faStatus() {
  const r = await api("/api/security/2fa");
  if (r.success) return r.data;
  return local.get(KEYS.twofa, { enabled: false });
}

export async function setup2fa({ method, phoneNumber }) {
  const r = await api("/api/security/2fa/setup", {
    method: "POST",
    body: JSON.stringify({ method, phoneNumber }),
  });
  if (r.success) return r.data;
  // Local fallback: generate a fake otpauth + 10 backup codes
  const backupCodes = Array.from({ length: 10 }).map(() =>
    Array.from({ length: 8 }).map(() => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("")
  );
  const provisioningUri = method === "totp" ? `otpauth://totp/Zyrix:user?secret=${btoa(Math.random().toString()).slice(0, 16)}&issuer=Zyrix` : null;
  local.set(KEYS.twofa, { enabled: false, method, phoneNumber, provisioningUri, backupCodes });
  return { method, provisioningUri, backupCodes };
}

export async function verify2fa(code) {
  const r = await api("/api/security/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (r.success) {
    const cur = local.get(KEYS.twofa, {});
    local.set(KEYS.twofa, { ...cur, enabled: true, enabledAt: new Date().toISOString() });
    return r.data;
  }
  // Local fallback — accept any 6-digit code
  if (/^\d{6}$/.test(String(code).trim())) {
    const cur = local.get(KEYS.twofa, {});
    local.set(KEYS.twofa, { ...cur, enabled: true, enabledAt: new Date().toISOString() });
    return { verified: true };
  }
  throw new Error("Invalid code");
}

export async function disable2fa() {
  const r = await api("/api/security/2fa", { method: "DELETE" });
  if (r.success) {
    local.set(KEYS.twofa, { enabled: false });
    return true;
  }
  local.set(KEYS.twofa, { enabled: false });
  return true;
}

// ── Sessions ──────────────────────────────────────────────────
export async function listSessions() {
  const r = await api("/api/security/sessions");
  if (r.success) return r.data || [];
  // seed sample sessions
  const seeds = local.list(KEYS.sessions);
  if (seeds.length > 0) return seeds;
  const now = Date.now();
  const sample = [
    { deviceInfo: { browser: "Chrome", os: "Windows 10", deviceType: "desktop" }, ipAddress: "85.121.34.56",  location: "İstanbul, TR", current: true,  lastActiveAt: new Date().toISOString(),                  createdAt: new Date(now - 2 * 86400000).toISOString() },
    { deviceInfo: { browser: "Safari", os: "iOS 17",     deviceType: "mobile"  }, ipAddress: "85.121.34.57",  location: "İstanbul, TR", current: false, lastActiveAt: new Date(now - 3 * 3600000).toISOString(), createdAt: new Date(now - 7 * 86400000).toISOString() },
    { deviceInfo: { browser: "Edge",   os: "macOS 14",   deviceType: "desktop" }, ipAddress: "194.105.55.10", location: "Ankara, TR",   current: false, lastActiveAt: new Date(now - 9 * 3600000).toISOString(), createdAt: new Date(now - 14 * 86400000).toISOString() },
  ].map((s, i) => ({ ...s, id: `session-${i}` }));
  local.save(KEYS.sessions, sample);
  return sample;
}

export async function revokeSession(id) {
  const r = await api(`/api/security/sessions/${id}`, { method: "DELETE" });
  if (r.success) {
    local.save(KEYS.sessions, local.list(KEYS.sessions).filter((s) => s.id !== id));
    return true;
  }
  local.save(KEYS.sessions, local.list(KEYS.sessions).filter((s) => s.id !== id));
  return true;
}

// ── Audit log ─────────────────────────────────────────────────
export async function listAuditLog({ page = 1, limit = 50, action, resourceType, from, to } = {}) {
  const params = new URLSearchParams();
  params.set("page", page); params.set("limit", limit);
  if (action) params.set("action", action);
  if (resourceType) params.set("resourceType", resourceType);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const r = await api(`/api/security/audit-log?${params.toString()}`);
  if (r.success) return r.data || { items: [], total: 0 };
  // Seed sample audit entries
  const seeds = local.list(KEYS.auditLog);
  if (seeds.length > 0) return { items: seeds, total: seeds.length };
  const sample = [
    { action: "invoice.created",   resourceType: "invoice",  resourceId: "inv-432", ipAddress: "85.121.34.56", createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { action: "customer.updated",  resourceType: "customer", resourceId: "cus-128", ipAddress: "85.121.34.56", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { action: "login.success",     resourceType: "session",  resourceId: "session-0", ipAddress: "85.121.34.56", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { action: "invoice.deleted",   resourceType: "invoice",  resourceId: "inv-401", ipAddress: "194.105.55.10", createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
    { action: "security.2fa.enabled", resourceType: "security", resourceId: null,  ipAddress: "85.121.34.56", createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
    { action: "export.created",    resourceType: "export",   resourceId: "exp-1",   ipAddress: "85.121.34.56", createdAt: new Date(Date.now() - 36 * 3600000).toISOString() },
  ].map((e, i) => ({ ...e, id: `audit-${i}`, userId: "current-user" }));
  local.save(KEYS.auditLog, sample);
  return { items: sample, total: sample.length };
}

export async function exportAuditLog() {
  // Returns a CSV-shaped string (or a real download URL when backend deploys)
  const { items } = await listAuditLog({ limit: 1000 });
  const header = "createdAt,action,resourceType,resourceId,ipAddress\n";
  const rows = items.map((i) => `${i.createdAt},${i.action},${i.resourceType || ""},${i.resourceId || ""},${i.ipAddress || ""}`).join("\n");
  return header + rows;
}

// ── KVKK / GDPR data export request ───────────────────────────
export async function listExportRequests() {
  const r = await api("/api/security/data-export-request");
  if (r.success) return r.data || [];
  return local.list(KEYS.exportRequests);
}

export async function requestDataExport({ reason }) {
  const r = await api("/api/security/data-export-request", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (r.success) return r.data;
  return local.add(KEYS.exportRequests, {
    reason,
    status: "pending",
    requestedAt: new Date().toISOString(),
  });
}
