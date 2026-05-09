// ================================================================
// Web Push API client (Sprint D-4).
// Public key is fetched from the backend — never hardcoded — so the
// key in Railway env stays the single source of truth.
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
  try { body = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || body?.success === false) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body?.data ?? body;
}

export async function getVapidPublicKey() {
  const data = await request('/api/customer/web-push/vapid-key');
  return data.publicKey;
}

export async function subscribePush(subscription) {
  const json = subscription.toJSON();
  return request('/api/customer/web-push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint:  json.endpoint,
      keys:      json.keys,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    })
  });
}

export async function unsubscribePush(endpoint) {
  return request('/api/customer/web-push/unsubscribe', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint })
  });
}

// ─── Browser-side helpers ─────────────────────────────────────

/** Convert URL-safe base64 (used for VAPID public keys) into Uint8Array. */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function isWebPushSupported() {
  return typeof window !== 'undefined'
      && 'serviceWorker'   in navigator
      && 'PushManager'     in window
      && 'Notification'    in window;
}

/**
 * Full subscription flow. Returns the resulting PushSubscription.
 * Throws on user denial OR any registration failure.
 */
export async function enableWebPush() {
  if (!isWebPushSupported()) throw new Error('Web Push is not supported in this browser.');

  // 1. Permission
  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications permission was denied.');

  // 2. Service worker — register if not already.
  let reg = await navigator.serviceWorker.getRegistration('/notification-sw.js');
  if (!reg) {
    reg = await navigator.serviceWorker.register('/notification-sw.js', { scope: '/' });
  }
  await navigator.serviceWorker.ready;

  // 3. Subscribe — fetch VAPID public key from backend (NOT hardcoded).
  const publicKey  = await getVapidPublicKey();
  const appKey     = urlBase64ToUint8Array(publicKey);
  const existing   = await reg.pushManager.getSubscription();
  let subscription = existing;
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey
    });
  }

  // 4. Persist on backend
  await subscribePush(subscription);
  return subscription;
}

/** Tear down the current subscription, both client and server. */
export async function disableWebPush() {
  if (!isWebPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration('/notification-sw.js');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  try { await unsubscribePush(sub.endpoint); } catch { /* ignore */ }
  await sub.unsubscribe();
}
