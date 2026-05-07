// ================================================================
// Phase 12 — Sentry-compatible error reporting.
// Lazy-loads @sentry/browser at runtime if VITE_SENTRY_DSN is set,
// so a missing dep doesn't break the build. No-op when unconfigured.
// ================================================================

const DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV = import.meta.env.VITE_SENTRY_ENV || (import.meta.env.PROD ? "production" : "development");
const RELEASE = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined;

let SentryRef = null;
let initialized = false;

export async function initErrorReporting() {
  if (initialized || !DSN || typeof window === "undefined") return;
  initialized = true;
  try {
    // Hide the import from Vite's static analyser so the bundle stays clean
    // when @sentry/browser isn't installed. Build can ship without the dep.
    const dynImport = new Function("specifier", "return import(specifier)");
    SentryRef = await dynImport("@sentry/browser").catch(() => null);
    if (!SentryRef?.init) return;
    SentryRef.init({
      dsn: DSN,
      environment: ENV,
      release: RELEASE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch { /* swallow */ }

  // browser-level fallback even if Sentry never loads
  window.addEventListener("error", (ev) => reportError(ev.error || ev.message));
  window.addEventListener("unhandledrejection", (ev) => reportError(ev.reason));
}

export function reportError(err, ctx = {}) {
  if (typeof console !== "undefined") {
    // Always log locally even if Sentry isn't configured
    console.error("[zyrix:error]", err, ctx);
  }
  if (SentryRef?.captureException && err) {
    try {
      SentryRef.captureException(err, { extra: ctx });
    } catch { /* ignore */ }
  }
}

export function setUserContext(user) {
  if (!SentryRef?.setUser) return;
  try {
    SentryRef.setUser(user ? { id: user.id, email: user.email, username: user.fullName } : null);
  } catch { /* ignore */ }
}
