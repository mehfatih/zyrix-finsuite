// ================================================================
// Admin impersonation API client.
//
// Storage keys:
//   zyrix_admin_token                       — admin JWT (used by /start)
//   zyrix_admin_token_before_impersonation  — admin JWT stashed for restore
//   zyrix_token                             — customer JWT (read by AuthContext)
//   zyrix_user                              — cached customer profile
//   zyrix_impersonation_session_id, zyrix_impersonation_expires_at,
//   zyrix_impersonation_target_name         — banner state
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || "https://finsuite-backend-production.up.railway.app";

const ADMIN_TOKEN_KEY        = "zyrix_admin_token";
const ADMIN_STASH_KEY        = "zyrix_admin_token_before_impersonation";
const ADMIN_USER_STASH_KEY   = "zyrix_admin_user_before_impersonation";
const CUSTOMER_TOKEN_KEY     = "zyrix_token";
const CUSTOMER_USER_KEY      = "zyrix_user";
const ADMIN_USER_KEY         = "zyrix_admin_user";
const IMP_SESSION_ID_KEY     = "zyrix_impersonation_session_id";
const IMP_EXPIRES_AT_KEY     = "zyrix_impersonation_expires_at";
const IMP_TARGET_NAME_KEY    = "zyrix_impersonation_target_name";

const adminToken    = () => { try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; } };
const customerToken = () => { try { return localStorage.getItem(CUSTOMER_TOKEN_KEY); } catch { return null; } };

async function apiCall(path, opts) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, opts);
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
  let body = {};
  try { body = await res.json(); } catch {}
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body?.data ?? body;
}

export async function startImpersonation({ customerId, reason, durationMinutes }) {
  const tok = adminToken();
  if (!tok) throw new Error("Admin session expired. Please sign in again.");
  return apiCall(`/api/admin/customers/${customerId}/impersonate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tok}`,
    },
    body: JSON.stringify({ reason, durationMinutes }),
  });
}

export async function exitImpersonationApi() {
  const tok = customerToken();
  if (!tok) return { ok: true };
  return apiCall(`/api/admin/impersonation/exit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok}` },
  });
}

export async function getImpersonationStatus() {
  const tok = customerToken();
  if (!tok) return { active: false };
  try {
    return await apiCall(`/api/admin/impersonation/status`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
  } catch {
    return { active: false };
  }
}

// ── Local helpers used by ImpersonatePage + Banner ──────────────

export function installImpersonationSession({ customerToken, sessionId, expiresAt, target }) {
  try {
    const adminTok = localStorage.getItem(ADMIN_TOKEN_KEY);
    const adminUsr = localStorage.getItem(ADMIN_USER_KEY);
    if (adminTok) localStorage.setItem(ADMIN_STASH_KEY, adminTok);
    if (adminUsr) localStorage.setItem(ADMIN_USER_STASH_KEY, adminUsr);

    localStorage.setItem(CUSTOMER_TOKEN_KEY, customerToken);
    localStorage.setItem(IMP_SESSION_ID_KEY, sessionId);
    localStorage.setItem(IMP_EXPIRES_AT_KEY, expiresAt);
    localStorage.setItem(IMP_TARGET_NAME_KEY, target?.name || "");

    // AuthContext loads user from zyrix_user — synthesize a minimal merchant
    // record so RequireAuth lets us into /dashboard.
    const fakeMerchantUser = {
      id:        target?.id,
      name:      target?.name,
      email:     target?.email,
      role:      "MERCHANT",
      _type:     "merchant",
      _impersonated: true,
    };
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(fakeMerchantUser));
  } catch (err) {
    console.error("installImpersonationSession failed:", err);
  }
}

export function clearImpersonationSession() {
  try {
    const stashedAdmin     = localStorage.getItem(ADMIN_STASH_KEY);
    const stashedAdminUser = localStorage.getItem(ADMIN_USER_STASH_KEY);

    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    localStorage.removeItem(IMP_SESSION_ID_KEY);
    localStorage.removeItem(IMP_EXPIRES_AT_KEY);
    localStorage.removeItem(IMP_TARGET_NAME_KEY);

    if (stashedAdmin) {
      localStorage.setItem(ADMIN_TOKEN_KEY, stashedAdmin);
      localStorage.removeItem(ADMIN_STASH_KEY);
    }
    if (stashedAdminUser) {
      localStorage.setItem(ADMIN_USER_KEY, stashedAdminUser);
      localStorage.removeItem(ADMIN_USER_STASH_KEY);
    }
  } catch (err) {
    console.error("clearImpersonationSession failed:", err);
  }
}

export const IMPERSONATION_KEYS = {
  CUSTOMER_TOKEN_KEY,
  IMP_SESSION_ID_KEY,
  IMP_EXPIRES_AT_KEY,
  IMP_TARGET_NAME_KEY,
};
