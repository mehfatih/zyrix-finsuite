// ================================================================
// Sharing API client (Sprint D-3).
// Recipients CRUD + share send (email/WhatsApp) + history.
// All methods unwrap the standard `{ success, data }` envelope.
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
    if (body?.retryInSec) err.retryInSec = body.retryInSec;
    if (body?.shareId)    err.shareId    = body.shareId;
    throw err;
  }
  return body?.data ?? body;
}

// ─── Recipients ────────────────────────────────────────────────
export async function listRecipients({ limit = 100 } = {}) {
  const data = await request(`/api/customer/recipients?limit=${limit}`);
  return data.recipients || [];
}

export async function createRecipient(payload) {
  const data = await request('/api/customer/recipients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.recipient;
}

export async function updateRecipient(id, payload) {
  const data = await request(`/api/customer/recipients/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.recipient;
}

export async function deleteRecipient(id) {
  await request(`/api/customer/recipients/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return { id };
}

// ─── Send share via email / WhatsApp ────────────────────────────
export async function shareViaEmail(payload) {
  // payload shape:
  //  { reportType, insightId?, reportParams?, recipientId?, recipient?,
  //    customMessage?, locale, theme }
  return request('/api/customer/share/email', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function shareViaWhatsApp(payload) {
  // returns: { shareId, shareUrl, message, hasPhone, pdfUrl }
  return request('/api/customer/share/whatsapp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ─── Share history (audit log) ─────────────────────────────────
export async function listShares({ days = 30, limit = 100 } = {}) {
  const data = await request(`/api/customer/shares/history?days=${days}&limit=${limit}`);
  return data.shares || [];
}
