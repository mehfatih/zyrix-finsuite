// ================================================================
// Public Share Links API client (Sprint D-7).
// Mirrors api/v2/weeklyReport.js / morningBrief.js shape.
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

// ─── CRUD ────────────────────────────────────────────────────
export async function listShareLinks({ limit = 20, offset = 0 } = {}) {
  const p = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return request(`/api/customer/share-links?${p.toString()}`);
}

export async function getShareLink(id) {
  return request(`/api/customer/share-links/${encodeURIComponent(id)}`);
}

export async function createShareLink(payload) {
  return request('/api/customer/share-links', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateShareLink(id, patch) {
  return request(`/api/customer/share-links/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function revokeShareLink(id) {
  return request(`/api/customer/share-links/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function hideComment(id, commentId, reason) {
  return request(`/api/customer/share-links/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: reason || 'owner_hidden' })
  });
}
