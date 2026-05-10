// ================================================================
// Integrations API client (Sprint D-9).
// Slack workspace install + channel mapping + test-send + preferences.
// Mirrors api/v2/publicShareLinks.js shape.
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
    err.code   = body?.code;
    throw err;
  }
  return body?.data ?? body;
}

// ─── Slack: installations ────────────────────────────────────

export async function listSlackInstallations() {
  // Returns { configured: boolean, installations: [...] } so the
  // UI can show a "Setup pending" state when SLACK_* env vars are
  // unset on Railway (per Mehmet's deferred-env-vars rule).
  return request('/api/integrations/slack');
}

export async function getSlackInstallUrl() {
  return request('/api/integrations/slack/install');
}

export async function uninstallSlack(installationId) {
  return request(`/api/integrations/slack/uninstall/${encodeURIComponent(installationId)}`, {
    method: 'POST'
  });
}

// ─── Slack: channel mapping CRUD ─────────────────────────────

export async function listSlackChannels(installationId) {
  return request(`/api/integrations/slack/${encodeURIComponent(installationId)}/channels`);
}

export async function listSlackMappings(installationId) {
  return request(`/api/integrations/slack/${encodeURIComponent(installationId)}/mappings`);
}

export async function replaceSlackMappings(installationId, mappings) {
  return request(`/api/integrations/slack/${encodeURIComponent(installationId)}/mappings`, {
    method: 'PUT',
    body:   JSON.stringify({ mappings })
  });
}

export async function sendSlackTest(installationId, channelId) {
  return request(`/api/integrations/slack/${encodeURIComponent(installationId)}/test-send`, {
    method: 'POST',
    body:   JSON.stringify({ channelId })
  });
}

// ─── Slack: per-severity preferences (slackEnabled + slackChannels) ─

export async function updateSlackPreferences({ slackEnabled, slackChannels } = {}) {
  return request('/api/integrations/slack/preferences', {
    method: 'PATCH',
    body:   JSON.stringify({ slackEnabled, slackChannels })
  });
}
