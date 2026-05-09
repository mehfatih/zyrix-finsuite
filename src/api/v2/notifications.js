// ================================================================
// Notifications API client (Sprint D-4).
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
    throw err;
  }
  return body?.data ?? body;
}

export async function listNotifications({ limit = 30, before, unread = false, archived = false } = {}) {
  const p = new URLSearchParams({ limit: String(limit) });
  if (before)   p.set('before',   typeof before === 'string' ? before : new Date(before).toISOString());
  if (unread)   p.set('unread',   'true');
  if (archived) p.set('archived', 'true');
  const data = await request(`/api/customer/notifications?${p.toString()}`);
  return data.notifications || [];
}

export async function getUnreadCount() {
  const data = await request('/api/customer/notifications/unread-count');
  return data.count || 0;
}

export async function markRead(id) {
  const data = await request(`/api/customer/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  return data.notification;
}

export async function bulkRead() {
  const data = await request('/api/customer/notifications/bulk-read', { method: 'PATCH' });
  return data.updated || 0;
}

export async function archive(id) {
  const data = await request(`/api/customer/notifications/${encodeURIComponent(id)}/archive`, { method: 'PATCH' });
  return data.notification;
}

export async function getStreamToken() {
  const data = await request('/api/customer/notifications/stream-token');
  return { token: data.token, expiresInSec: data.expiresInSec };
}

export function streamUrl(token) {
  return `${API_BASE}/api/customer/notifications/stream?token=${encodeURIComponent(token)}`;
}

// ─── Preferences ─────────────────────────────────────────────
export async function getPreferences() {
  const data = await request('/api/customer/preferences/notifications');
  return data.preferences;
}

export async function updatePreferences(patch) {
  const data = await request('/api/customer/preferences/notifications', {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
  return data.preferences;
}
