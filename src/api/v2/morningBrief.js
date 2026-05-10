// ================================================================
// Morning Brief API client (Sprint D-5).
// Mirrors the shape of api/v2/notifications.js (token from
// localStorage; { success, data } envelope; throws on !ok).
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

async function request(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${customerToken()}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {})
    }
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON ok */ }
  if (!res.ok || body?.success === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.waitSeconds = body?.waitSeconds;
    throw err;
  }
  return body?.data ?? body;
}

export async function getSubscription() {
  return request('/api/customer/morning-brief');
}

export async function updateSubscription(patch) {
  return request('/api/customer/morning-brief', {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function sendTest() {
  return request('/api/customer/morning-brief/test', { method: 'POST' });
}

export async function getStats() {
  return request('/api/customer/morning-brief/stats');
}

// Public unsubscribe endpoints — token is the credential, no auth header.
const PUBLIC = '/api/morning-brief/unsubscribe';

export async function getUnsubInfo(token) {
  const url = `${API_BASE}${PUBLIC}/info?token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON ok */ }
  if (!res.ok || body?.ok === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function applyUnsub(token, action, reasons) {
  const url = `${API_BASE}${PUBLIC}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action, reasons: reasons || [] })
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON ok */ }
  if (!res.ok || body?.ok === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}
