// ================================================================
// Admin tax-rate version CRUD client (Sprint D-11).
// Backed by /api/admin/regulatory/tax-rates (B.7).
// Uses the admin token (zyrix_admin_token).
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const adminToken = () => {
  try { return localStorage.getItem('zyrix_admin_token'); } catch { return null; }
};

async function request(path, init = {}) {
  const token = adminToken();
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {})
    }
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON ok */ }
  if (!res.ok || body?.success === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status   = res.status;
    err.conflict = body?.conflict;
    throw err;
  }
  return body?.data ?? body;
}

export async function listTaxRates({ country, taxName } = {}) {
  const q = new URLSearchParams();
  if (country) q.set('country', country);
  if (taxName) q.set('taxName', taxName);
  const s = q.toString();
  return request(`/api/admin/regulatory/tax-rates${s ? '?' + s : ''}`);
}

export async function createTaxRate({ country, taxName, rate, effectiveFrom, effectiveTo, notes }) {
  return request('/api/admin/regulatory/tax-rates', {
    method: 'POST',
    body:   JSON.stringify({ country, taxName, rate, effectiveFrom, effectiveTo, notes })
  });
}

export async function updateTaxRate(id, patch) {
  return request(`/api/admin/regulatory/tax-rates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body:   JSON.stringify(patch)
  });
}

export async function deleteTaxRate(id) {
  return request(`/api/admin/regulatory/tax-rates/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
