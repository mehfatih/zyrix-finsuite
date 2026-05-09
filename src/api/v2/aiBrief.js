// AI Co-Pilot daily brief API client.
// Backend envelope: { success: true, data: { brief, cached, fallback } }

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

async function unwrap(res) {
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body?.data ?? body;
}

export async function getAIBrief(focus = 'all', language = 'tr') {
  const url = `${API_BASE}/api/customer/dashboard/ai-brief?focus=${encodeURIComponent(focus)}&language=${encodeURIComponent(language)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${customerToken()}` }
  });
  const data = await unwrap(res);
  return data.brief;
}

export async function refreshAIBrief() {
  const res = await fetch(`${API_BASE}/api/customer/dashboard/ai-brief/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken()}` }
  });
  const data = await unwrap(res);
  return data.brief;
}
