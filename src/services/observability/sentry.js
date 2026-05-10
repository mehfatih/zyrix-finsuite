// ================================================================
// Sentry browser SDK — Sprint D-10.
//
// Per Mehmet's deferred-env-vars rule: VITE_SENTRY_DSN will land
// AFTER Phase B closes. Until then initSentry() returns false,
// every helper is a no-op, and the app boots cleanly.
//
// Decision §10.D — V1 ships WITHOUT source-map upload. Stack
// traces will group by minified frames; we re-symbolicate on
// demand if a specific error needs investigation.
// ================================================================
import * as Sentry from '@sentry/react';

let initialized = false;

export function initSentry() {
  if (initialized) return true;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    if (typeof console !== 'undefined') console.log('[sentry] VITE_SENTRY_DSN not set; error tracking disabled.');
    return false;
  }
  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'production',
      release:     import.meta.env.VITE_APP_VERSION,
      // Decision §10.A — V1 ships LIGHTWEIGHT: errors only, no perf
      // tracing in production.
      tracesSampleRate:   0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // We DO NOT want PII leaking. setMerchantContext attaches an
      // opaque merchantId only.
      sendDefaultPii: false
    });
    initialized = true;
    if (typeof console !== 'undefined') console.log('[sentry] initialized.');
    return true;
  } catch (err) {
    if (typeof console !== 'undefined') console.error('[sentry] init failed:', err && err.message);
    return false;
  }
}

export function captureException(err, context) {
  if (!initialized) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export function captureBoundaryError(err, info) {
  if (!initialized) return;
  Sentry.captureException(err, {
    extra: { componentStack: info && info.componentStack },
    tags:  { boundary: 'CinematicErrorBoundary' }
  });
}

export function setMerchantContext(merchantId) {
  if (!initialized) return;
  Sentry.setUser(merchantId ? { id: merchantId } : null);
}

export function isSentryEnabled() {
  return initialized;
}
