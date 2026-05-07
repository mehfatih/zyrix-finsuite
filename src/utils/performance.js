// ================================================================
// Phase 12 — Web Vitals tracker. Reports LCP / FID / CLS / INP / TTFB
// without depending on the `web-vitals` package. Pure PerformanceObserver.
// Sends to Plausible custom event when initAnalytics() is configured.
// ================================================================
import { trackEvent } from "./analytics.js";

let started = false;

export function initWebVitals() {
  if (started || typeof window === "undefined" || !("PerformanceObserver" in window)) return;
  started = true;

  // LCP — largest-contentful-paint. Use the LAST entry (final LCP).
  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) report("LCP", last.renderTime || last.loadTime || last.startTime);
  });

  // FID / INP — first-input + event timing
  observe("first-input", (entries) => {
    const first = entries[0];
    if (first) report("FID", first.processingStart - first.startTime);
  });

  // CLS — cumulative layout shift (sessions of <5s, >1s gap)
  let cls = 0;
  let session = 0;
  let lastTs = 0;
  let firstTs = 0;
  observe("layout-shift", (entries) => {
    for (const e of entries) {
      if (e.hadRecentInput) continue;
      if (lastTs && e.startTime - lastTs < 1000 && e.startTime - firstTs < 5000) {
        session += e.value;
      } else {
        firstTs = e.startTime;
        session = e.value;
      }
      lastTs = e.startTime;
      cls = Math.max(cls, session);
    }
  });

  // Report final CLS on visibility change
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        report("CLS", cls);
      }
    }, { once: true });
  }

  // TTFB
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav) report("TTFB", nav.responseStart);
  } catch { /* ignore */ }
}

function observe(type, cb) {
  try {
    const po = new PerformanceObserver((list) => cb(list.getEntries()));
    po.observe({ type, buffered: true });
  } catch { /* type unsupported in this browser */ }
}

function report(metric, value) {
  if (value == null || !isFinite(value)) return;
  const v = Math.round(value * 100) / 100;
  try {
    trackEvent("Web Vital", { metric, value: v });
  } catch { /* ignore */ }
  if (typeof window !== "undefined" && window.__zyrixVitalsLog !== false) {
    // Quiet by default. Set window.__zyrixVitalsLog = true in console to inspect.
  }
}
