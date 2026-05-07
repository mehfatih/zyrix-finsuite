// ================================================================
// Phase 12 — Plausible analytics integration (privacy-friendly).
// Drops the script tag at runtime so it isn't bundled. No-op until
// VITE_PLAUSIBLE_DOMAIN env var is set, so dev runs stay quiet.
// ================================================================

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
const SRC    = import.meta.env.VITE_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

let initialized = false;

export function initAnalytics() {
  if (initialized || !DOMAIN || typeof document === "undefined") return;
  initialized = true;
  try {
    const s = document.createElement("script");
    s.defer = true;
    s.dataset.domain = DOMAIN;
    s.src = SRC;
    document.head.appendChild(s);
    window.plausible = window.plausible || function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
  } catch { /* ignore */ }
}

export function trackPageview(url) {
  if (typeof window === "undefined") return;
  try {
    if (window.plausible) {
      window.plausible("pageview", url ? { u: url } : undefined);
    }
  } catch { /* ignore */ }
}

export function trackEvent(name, props = {}) {
  if (typeof window === "undefined") return;
  try {
    if (window.plausible) {
      window.plausible(name, { props });
    }
  } catch { /* ignore */ }
}

// Common product-event names — keep tags consistent across the codebase.
export const EVENT = {
  AI_INVOICE_CREATED:     "AI Invoice Created",
  AI_VOICE_USED:          "AI Voice Used",
  AI_DNA_VIEWED:          "AI DNA Viewed",
  AI_HIDDEN_CASH_FOUND:   "AI Hidden Cash Found",
  AI_TWIN_SIMULATION:     "AI Twin Simulation",
  AI_COFOUNDER_CHAT:      "AI Co-Founder Chat",
  ONBOARDING_STEP:        "Onboarding Step",
  ONBOARDING_COMPLETED:   "Onboarding Completed",
  CAPITAL_APPLIED:        "Capital Applied",
  INSURANCE_QUOTE:        "Insurance Quote",
};
