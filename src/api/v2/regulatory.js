// ================================================================
// Regulatory + geo-context API client (Sprint D-11).
// Mirrors api/v2/integrations.js shape.
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
 * GET /api/users/me/geo-context
 * Returns { ipCountry, registeredCountry, language, mismatch }.
 */
export async function getGeoContext() {
  return request('/api/users/me/geo-context');
}
