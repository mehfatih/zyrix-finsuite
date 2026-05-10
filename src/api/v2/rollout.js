// ================================================================
// Rollout API client (Sprint D-10).
// Reads the V2-dashboard percentage gate from the backend.
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

async function request(path) {
  const token = customerToken();
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON ok */ }
  if (!res.ok || body?.success === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body?.data ?? body;
}

/**
 * GET /api/customer/rollout/v2-dashboard
 * Returns { enabled, pct, bucket }. The merchant is in the rollout
 * window if `enabled === true`. The frontend uses this to decide
 * whether post-login navigation goes to /v2/dashboard or /dashboard.
 */
export async function getV2DashboardRollout() {
  return request('/api/customer/rollout/v2-dashboard');
}

const STORAGE_KEY = 'zyrix_v2_optout';

/**
 * Manual opt-out persisted in localStorage. The DashboardSwitchPill
 * already toggles this for power users via the existing FeatureFlags
 * context; expose a helper here so the post-login redirect can
 * respect it.
 */
export function isV2OptedOut() {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; }
  catch { return false; }
}

export function setV2OptOut(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1');
    else       localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / privacy mode */
  }
}
