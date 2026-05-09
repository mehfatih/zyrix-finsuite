// Customer Dashboard V2 — preferences API client.
// Backend endpoints live under /api/customer/dashboard.

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

export async function getPreferences() {
  const res = await fetch(`${API_BASE}/api/customer/dashboard/preferences`, {
    headers: { Authorization: `Bearer ${customerToken()}` }
  });
  const data = await unwrap(res);
  return data.preferences;
}

export async function updatePreferences(patch) {
  const res = await fetch(`${API_BASE}/api/customer/dashboard/preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${customerToken()}`
    },
    body: JSON.stringify(patch)
  });
  const data = await unwrap(res);
  return data.preferences;
}

export async function listAvailableKpis() {
  const res = await fetch(`${API_BASE}/api/customer/dashboard/preferences/kpis`, {
    headers: { Authorization: `Bearer ${customerToken()}` }
  });
  const data = await unwrap(res);
  return { kpis: data.kpis, focusAreas: data.focusAreas };
}
