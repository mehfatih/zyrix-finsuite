// ================================================================
// Sentry browser SDK — Sprint D-10.
//
// F4 ships this file as a stub of safe no-ops so CinematicErrorBoundary
// can import the helpers without depending on @sentry/react being
// installed yet. F7 replaces the stub with the real init + capture
// logic feature-flagged on VITE_SENTRY_DSN per Mehmet's deferred-env-vars
// rule.
// ================================================================

/* eslint-disable no-unused-vars */
export function initSentry() {
  return false;
}

export function captureException(_err, _ctx) {
  /* no-op until F7 wires @sentry/react */
}

export function captureBoundaryError(_err, _info) {
  /* no-op until F7 wires @sentry/react */
}

export function setMerchantContext(_merchantId) {
  /* no-op until F7 wires @sentry/react */
}

export function isSentryEnabled() {
  return false;
}
