// ================================================================
// Chat API client (Sprint D-8).
// Mirrors api/v2/* shape from D-4..D-7. The streaming flow is
// two-step (decision §7.D): postMessage() returns a streamToken;
// caller opens an EventSource at streamUrl(streamToken).
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

// ─── Conversations ──────────────────────────────────────────
export async function listConversations({ limit = 30, offset = 0, archived = false } = {}) {
  const p = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (archived) p.set('archived', 'true');
  return request(`/api/customer/chat/conversations?${p.toString()}`);
}

export async function createConversation(payload = {}) {
  return request('/api/customer/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getConversation(id) {
  return request(`/api/customer/chat/conversations/${encodeURIComponent(id)}`);
}

export async function updateConversation(id, patch) {
  return request(`/api/customer/chat/conversations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function deleteConversation(id) {
  return request(`/api/customer/chat/conversations/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function listMessages(id, { limit = 50, before } = {}) {
  const p = new URLSearchParams({ limit: String(limit) });
  if (before) p.set('before', new Date(before).toISOString());
  return request(`/api/customer/chat/conversations/${encodeURIComponent(id)}/messages?${p.toString()}`);
}

// ─── Streaming (two-step) ──────────────────────────────────
export async function postMessage({ conversationId, message, lang } = {}) {
  return request('/api/customer/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message, lang })
  });
}

/** Build the EventSource URL for a streamToken returned by postMessage. */
export function streamUrl(streamToken, lang) {
  const p = new URLSearchParams({ token: streamToken });
  if (lang) p.set('lang', lang);
  return `${API_BASE}/api/customer/chat/stream?${p.toString()}`;
}

// ─── Actions (allowlisted mutations) ───────────────────────
export async function executeAction(type, payload) {
  return request(`/api/customer/chat/actions/${encodeURIComponent(type)}`, {
    method: 'POST',
    body: JSON.stringify({ payload })
  });
}
