// ================================================================
// Admin AI usage API client (Sprint D-10).
// Reads ChatMessage tokensUsed/inputTokens/outputTokens/latencyMs
// aggregations exposed by the backend B3 endpoints.
// Uses the admin token (zyrix_admin_token), not the customer token.
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const adminToken = () => {
  try { return localStorage.getItem('zyrix_admin_token'); } catch { return null; }
};

async function request(path) {
  const token = adminToken();
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

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function getAiUsageSummary({ from, to } = {}) {
  return request(`/api/admin/ai-usage/summary${buildQuery({ from, to })}`);
}

export async function getAiUsageDaily({ from, to, merchantId } = {}) {
  return request(`/api/admin/ai-usage/daily${buildQuery({ from, to, merchantId })}`);
}

export async function getAiUsageTopMerchants({ from, to, limit = 20 } = {}) {
  return request(`/api/admin/ai-usage/top-merchants${buildQuery({ from, to, limit })}`);
}

export async function getAiUsageLatency({ from, to } = {}) {
  return request(`/api/admin/ai-usage/latency${buildQuery({ from, to })}`);
}
