// ================================================================
// Sprint D-5 — Admin email engagement API client.
// Uses the admin token (zyrix_admin_token), not the customer token.
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const adminToken = () => {
  try { return localStorage.getItem('zyrix_admin_token'); } catch { return null; }
};

async function request(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${adminToken()}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {})
    }
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

export async function getEngagementStats() {
  return request('/api/admin/email-engagement');
}

export async function getBouncedList() {
  return request('/api/admin/email-engagement/bounced');
}

export async function reEnableSubscription(merchantId) {
  return request(`/api/admin/email-engagement/${encodeURIComponent(merchantId)}/re-enable`, {
    method: 'POST'
  });
}
