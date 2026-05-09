// ================================================================
// Insight history API client (Sprint D-1).
// Backend envelope: { success: true, data: { insights, count, days, limit } }
//
// Endpoints
//   GET   /api/customer/insights/history?days=7
//   PATCH /api/customer/insights/:id            { status: 'DISMISSED' | 'RESOLVED' | 'ARCHIVED' | 'ACTIVE' }
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

async function unwrap(res) {
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body?.data ?? body;
}

/**
 * Fetch the merchant's insight history.
 * @param {object} [opts]
 * @param {number} [opts.days=7]   1-90
 * @param {number} [opts.limit=100] 1-200
 * @returns {Promise<Array>}
 */
export async function getInsightHistory({ days = 7, limit = 100 } = {}) {
  const url = `${API_BASE}/api/customer/insights/history?days=${days}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${customerToken()}` }
  });
  const data = await unwrap(res);
  return data.insights || [];
}

/**
 * Transition an insight's status.
 * @param {string} id
 * @param {'ACTIVE' | 'DISMISSED' | 'RESOLVED' | 'ARCHIVED'} status
 * @returns {Promise<object>} updated insight row
 */
export async function patchInsightStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/customer/insights/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${customerToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  const data = await unwrap(res);
  return data.insight;
}
