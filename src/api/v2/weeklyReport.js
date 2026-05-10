// ================================================================
// Weekly Report API client (Sprint D-6).
// Mirrors api/v2/morningBrief.js pattern.
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

// ── Reports ──────────────────────────────────────────────────
export async function listReports({ limit = 12, offset = 0 } = {}) {
  const p = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return request(`/api/customer/weekly-report?${p.toString()}`);
}

export async function getReport(id) {
  return request(`/api/customer/weekly-report/${encodeURIComponent(id)}`);
}

/** Returns the absolute URL the iframe / download link should hit. */
export function pdfUrl(id) {
  return `${API_BASE}/api/customer/weekly-report/${encodeURIComponent(id)}/pdf`;
}

export async function regenerateReport() {
  return request('/api/customer/weekly-report/regenerate', { method: 'POST' });
}

export async function sendTest() {
  return request('/api/customer/weekly-report/test', { method: 'POST' });
}

// ── Subscription ─────────────────────────────────────────────
export async function getSubscription() {
  return request('/api/customer/weekly-report/subscription');
}

export async function updateSubscription(patch) {
  return request('/api/customer/weekly-report/subscription', {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

// ── Engagement stats ────────────────────────────────────────
export async function getStats() {
  return request('/api/customer/weekly-report/stats');
}

// ── Public unsubscribe (token IS the credential) ────────────
const PUBLIC = '/api/weekly-report/unsubscribe';

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
