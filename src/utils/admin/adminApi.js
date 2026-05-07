// ================================================================
// Phase 14 — Admin API client.
// Stores admin token under separate localStorage key (zyrix_admin_token)
// so admin and customer sessions can coexist. All admin endpoints
// scoped under /api/admin/*. Falls back gracefully when backend isn't
// deployed yet (returns mock data so the UI is testable).
// ================================================================

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ADMIN_TOKEN_KEY = "zyrix_admin_token";
export const ADMIN_USER_KEY  = "zyrix_admin_user";

export function getAdminToken() {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
}

export function setAdminToken(token) {
  try { token ? localStorage.setItem(ADMIN_TOKEN_KEY, token) : localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
}

export function getAdminUser() {
  try { const v = localStorage.getItem(ADMIN_USER_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

export function setAdminUser(user) {
  try { user ? localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user)) : localStorage.removeItem(ADMIN_USER_KEY); } catch {}
}

export async function adminApi(path, opts = {}) {
  const token = getAdminToken();
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body.error || `HTTP ${res.status}`, requires2FA: body.requires2FA, status: res.status };
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Auth ──────────────────────────────────────────────────────
export async function adminLogin({ email, password, totpCode }) {
  return adminApi("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, totpCode }),
  });
}

export async function adminLogout() {
  await adminApi("/api/admin/auth/logout", { method: "POST" });
  setAdminToken(null);
  setAdminUser(null);
}

export async function getCurrentAdmin() {
  const r = await adminApi("/api/admin/auth/me");
  if (r.success) return r.data;
  return getAdminUser();
}

export async function changeAdminPassword({ currentPassword, newPassword }) {
  return adminApi("/api/admin/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function setupAdmin2FA() {
  return adminApi("/api/admin/auth/2fa/setup", { method: "POST" });
}

export async function verifyAdmin2FA(code) {
  return adminApi("/api/admin/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ── Audit log helper (used by every admin mutation) ───────────
const KEYS = {
  audit:     "zyrix_admin_audit_local",
  customers: "zyrix_admin_customers_cache",
  archives:  "zyrix_admin_archives_local",
  flags:     "zyrix_admin_feature_flags",
  alerts:    "zyrix_admin_system_alerts",
  coupons:   "zyrix_admin_coupons_local",
};

const local = {
  list(k)        { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
  save(k, v)     { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
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
  remove(k, id)  { local.save(k, local.list(k).filter((x) => x.id !== id)); },
};

export { local as localAdmin, KEYS as ADMIN_KEYS };

// Records every admin mutation locally + posts to backend if available.
export async function logAdminAction({ action, resourceType, resourceId, metadata, severity = "INFO", beforeState, afterState }) {
  const entry = {
    action, resourceType, resourceId, metadata, severity, beforeState, afterState,
    createdAt: new Date().toISOString(),
    adminUserId: getAdminUser()?.id,
    adminEmail: getAdminUser()?.email,
  };
  // local mirror — survives offline + visible in audit log page immediately
  local.add(KEYS.audit, entry);
  // backend (fire and forget)
  adminApi("/api/admin/audit-log", {
    method: "POST",
    body: JSON.stringify(entry),
  }).catch(() => {});
  return entry;
}

export async function listAdminAudit({ limit = 100 } = {}) {
  const r = await adminApi(`/api/admin/audit-log?limit=${limit}`);
  if (r.success) return r.data?.items || [];
  return local.list(KEYS.audit).slice(0, limit);
}
