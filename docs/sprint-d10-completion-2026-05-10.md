# Sprint D-10 — Polish, Performance & Launch Prep: Completion Report

**Date:** 2026-05-10
**Repos touched:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE B COMPLETE** — code-complete; the launch path is the 6-step checklist in §4.

---

## TL;DR

The 14-commit sequence from the audit doc shipped (actual count: 17 across both repos plus the audit + this completion report). Two npm deps approved (`@sentry/node`, `@sentry/react`); three env vars deferred (`SENTRY_DSN`, `VITE_SENTRY_DSN`, `V2_DASHBOARD_ROLLOUT_PCT`). Every code path that depends on the deferred env vars is feature-flagged so the system runs cleanly without them — same pattern as D-9's Slack integration.

The bundle headline finding from Phase A held: removing `lucide-react` from the explicit `charts` chunk rule dropped the chart bundle from **1,236 KB / 258 KB gzipped → 335 KB / 91 KB gzipped** (74% reduction). Locale-split the `i18n-dashboard` chunk into three (tr / en / ar) so the browser parallelizes and a future per-locale lazy loader can drop the inactive bundles entirely. Trimmed Google Font weights from 21 to 8 (~250 KB of network savings on cold start).

Built four cinematic feedback primitives (`CinematicSkeleton`, `CinematicEmptyState`, `CinematicErrorBlock`, `CinematicErrorBoundary`) and swept five high-traffic V2 pages onto them. The boundary is wired at the App root so a render-time exception shows a branded retry surface instead of React's default white screen of death. Sentry is wired front + back; both helpers no-op when the DSN is unset.

Backend got: per-dependency `/health` probe, request-id middleware, error handler that captures to Sentry with merchant context, four AI usage admin endpoints reading the D-8 `ChatMessage.tokensUsed` columns, an env-var rollout endpoint hashing `merchantId % 100 < pct`, and six runbooks. Frontend got: an admin AI usage dashboard at `/admin/analytics/ai-usage`, a customer help center at `/help` with seven topics in TR / EN / AR, and post-login redirect logic that respects the rollout flag plus the existing manual opt-out.

PostHog deferred. Source-map upload deferred. Per-page distinct empty-state illustrations deferred (the three primitives suffice). Full per-animation spring-tuning deferred (foundational `prefers-reduced-motion` already shipped in Phase 12 a11y.css). Marketing materials deferred to a marketing sprint. Phased 5%→25%→50%→100% rollout deferred until merchant base grows past ~10 (with 2 test merchants the percentage stages would be theater); the rollout infrastructure is built and `V2_DASHBOARD_ROLLOUT_PCT` defaults to 100.

---

## 1. What shipped

### 1.1 Backend (5 commits)

| # | Commit | Subject |
|---|---|---|
| B.1 | `1776c28` | feat(monitoring): @sentry/node init + errorHandler integration |
| B.2 | `c1ffa62` | feat(monitoring): /health dependency-status endpoint |
| B.3 | `2a9a9a3` | feat(admin): AI token-usage aggregation endpoints |
| B.4 | `7d29d0e` | feat(rollout): /api/customer/rollout/v2-dashboard endpoint |
| B.5 | `b901ece` | docs(runbooks): incident response documentation |

#### B.1 — Sentry SDK + request id middleware

`@sentry/node@^8` installed (one of the two D-10 approved npm deps). `services/observability/sentry.ts` exports `initSentry()` / `captureException()` / `setMerchantContext()` / `isSentryEnabled()`. `initSentry()` returns false when `SENTRY_DSN` is unset; the helper functions are no-ops; the server boots clean.

`middleware/requestId.ts` stamps every request with a short hex id (or honors an upstream `x-request-id` header from Cloudflare / Railway). `errorHandler.ts` now logs with `rid=<id>`, calls `setMerchantContext(req.merchant?.id)`, captures the exception with `{ method, path, requestId, merchantId, userAgent }` extras, and surfaces `requestId` on the JSON response so support can correlate when a customer reports a 500.

`initSentry()` runs at the top of `src/index.ts` before any other module imports — unhandled exceptions during boot reach the tracker.

#### B.2 — `/health` with dependency status

`controllers/healthController.ts` exposes:
- `GET /health` — soft probe; always 200; `data.deps.{database, gemini, resend, slack, sentry, vapid}` carries per-dep `status: 'ok' | 'degraded' | 'down' | 'not_configured'`. UptimeRobot-style monitors stay green; the dep map carries the truth for the admin observability dashboard.
- `GET /health/ready` — strict readiness probe; 503 when DB is unreachable. Use for Railway / load-balancer readiness gates.

DB probe runs `SELECT 1` with a 1.5s timeout; >500ms is flagged `degraded`. Other deps probe by env-var presence (no live API calls — keeps the endpoint cheap so monitors can poll it freely).

#### B.3 — Admin AI usage endpoints

Four endpoints under `/api/admin/ai-usage` (admin JWT-required):

| Endpoint | Returns |
|---|---|
| `GET /summary` | overall counts + token totals + Gemini 2.0 Flash cost forecast |
| `GET /daily?merchantId?` | daily roll-up: { day, merchantId, messages, in/out tokens, avgLatency, costUsd } |
| `GET /top-merchants` | leaderboard (default 20 rows) with merchant names hydrated |
| `GET /latency` | P50 / P90 / P95 / P99 / max latency over the window |

Reads `ChatMessage.tokensUsed / inputTokens / outputTokens / latencyMs` (D-8 columns) joined to `ChatConversation.merchantId`. Aggregation runs in JS over a 50K row ceiling; promote to a SQL view if message volume grows past ~1M/day. Window defaults to 14 days; clamped to 90 max.

**No edits to protected files** (`kpiComputations.ts`, `aiBriefController.ts`, `merchantSnapshot.ts`).

#### B.4 — V2 dashboard rollout endpoint

`controllers/customer/rolloutController.ts` exposes `GET /api/customer/rollout/v2-dashboard`. Hashes `merchantId` via md5 + first-4-bytes-as-uint32 mod 100; returns `{ enabled: bucket < pct, pct, bucket }` where `pct = parseInt(process.env.V2_DASHBOARD_ROLLOUT_PCT || '100')`.

A given merchant is permanently in or out for a given `pct` value (deterministic hash); bumping the pct only ever lets MORE merchants in, never causes churn. Default 100 means the 2 test merchants always see V2 until the env var lands.

#### B.5 — Six runbooks under `docs/runbooks/`

Per discovery decision §10.J: short, action-oriented incident response docs. Each one: what's broken, how to confirm, how to fix, who to tell.

- `gemini-outage.md`         AI features fail or time out
- `pdf-service-crash.md`     Puppeteer pool exhausted; PDF / OG endpoints 500
- `email-bouncing.md`        Resend deliveries failing / sender reputation drop
- `rate-limit-storm.md`      sudden 429 spike or single-merchant flood
- `data-corruption.md`       KPI / Insight values look wrong (P1 — sensitive)
- `oauth-token-expiry.md`    Slack workspace stops receiving messages

Plus a `README.md` index. All cross-reference Sentry filter syntax + Railway log expressions.

### 1.2 Frontend (12 commits including audit + completion)

| # | Commit | Subject |
|---|---|---|
| A.1 | `34b8fa7` | docs(ai-copilot): Sprint D-10 audit report |
| F.1 | `16851b8` | perf: split charts and locale-split i18n-dashboard chunks |
| F.2 | `0ebc205` | perf: cut Google Font weights to match actual usage |
| F.3 | `2aaf491` | feat(ui): cinematic skeleton + empty state primitives |
| F.4 | `989be17` | feat(ui): cinematic error boundary + error block primitives |
| F.5 | `593b5b7` | feat(ui): sweep customer-facing V2 pages onto cinematic primitives |
| F.6 | `2a02dcc` | feat(a11y): ARIA + screen-reader sweep on customer-facing pages |
| F.7 | `1b127eb` | feat(monitoring): @sentry/react init + boundary capture |
| F.8 | `cac1a4b` | feat(rollout): /api client + post-login V2 redirect |
| F.9 | `146db33` | feat(admin): /admin/analytics/ai-usage page |
| F.10 | `1ca6314` | feat(ui): in-app /help route + TR/EN/AR JSON loader |
| F.11 | `7357f77` | feat(i18n): help center translations (TR/EN/AR) |
| F.12 | _(this commit)_ | docs(ai-copilot): Sprint D-10 completion report |

#### F.1 + F.2 — Bundle + font wins

`vite.config.js`:
- Removed `lucide-react` from the explicit `charts` chunk rule. With ~60 import sites across the suite, every page used to pull the full 1.2MB charts chunk just to render an icon. Now the charts chunk is `recharts + d3 + victory-vendor` only (335 KB / 91 KB gzipped) and only loads on routes that render a chart.
- Locale-split the `i18n-dashboard` chunk into `i18n-dashboard-tr / -en / -ar` (~110 KB raw / ~35 KB gzipped each) so the browser parallelizes the requests.
- `@sentry/*` now lives in its own chunk so minor SDK upgrades don't invalidate the main vendor hash on every deploy.

`index.html`:
- Cut Google Font weights from 21 to 8 (3 per family: 400 / 600 / 700 for Latin + Arabic, 600 / 800 for Inter Tight). Manrope removed entirely (near-twin of Plus Jakarta Sans; 6 existing call sites fall back to system-ui without a visual regression). ~250 KB of font payload saved on cold start.

**Known follow-up:** `src/components/v2/cmdk/CommandPalette.jsx` still uses `import * as Icons from 'lucide-react'` for runtime icon lookups via the sidebar registry. That wildcard defeats tree-shaking and pulls all ~1000 lucide icons into whichever shared chunk includes the palette (~166 KB gzipped). Replacing the wildcard with an explicit icon map keyed by sidebar registry names is a real refactor; deferred.

#### F.3 + F.4 — Cinematic feedback primitives

Four primitives in `src/components/v2/feedback/`:

| Component | Purpose |
|---|---|
| `CinematicSkeleton` | shimmer skeleton with `variant: 'card' \| 'list' \| 'chart' \| 'text'`; honors `prefers-reduced-motion` via the global a11y.css; `role/aria-busy` for screen readers |
| `CinematicEmptyState` | tone-coded radial glow + icon + title + description + optional CTA; `role="status"` |
| `CinematicErrorBlock` | replaces inline crimson `setError` boxes; `role="alert"` + `aria-live="polite"`; renders the requestId from the new backend errorHandler payload |
| `CinematicErrorBoundary` | top-level React boundary wrapping App routes; cosmic-gradient fallback page; TR/EN/AR copy + reload button + support mailto; forwards captured error + componentStack to Sentry via `captureBoundaryError()` |

#### F.5 + F.6 — Sweep + accessibility

Five high-traffic customer-facing V2 pages migrated from inline `<Loader2 spin>` + crimson error blocks + bespoke empty cards onto the F.3/F.4 primitives:
- `/insights/shares`, `/insights/recipients`, `/insights/share-links`
- `/notifications`, `/reports/weekly`

Three D-9 integration pages got an ARIA sweep (they had zero `aria-*` attrs at audit time): per-row group with `aria-labelledby`, channel-mapping `<select>` `aria-label`, test/connect/uninstall buttons get `aria-label` + `aria-busy` + decorative loaders marked `aria-hidden`.

Global a11y.css from Phase 12 (skip-to-content, focus-visible rings, prefers-reduced-motion, prefers-contrast, sr-only utility, 44×44 touch targets) untouched and already complete.

#### F.7 — Sentry browser SDK

`@sentry/react@^8` installed (the second of the two D-10 approved npm deps). `src/services/observability/sentry.js` replaces the F.4 stub: feature-flagged on `import.meta.env.VITE_SENTRY_DSN` (no-op + console.log when unset). `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 0` keep the bundle lean (no Replay sub-modules pulled in). `tracesSampleRate: 0` — errors only, no perf tracing in V1.

`captureBoundaryError()` is the helper `CinematicErrorBoundary.componentDidCatch` calls — tags the captured event `boundary='CinematicErrorBoundary'` so triage can filter for it.

`initSentry()` wired into `src/main.jsx` before `initAnalytics` so unhandled exceptions from any subsequent module reach the tracker.

#### F.8 — Rollout client + post-login redirect

`src/api/v2/rollout.js` exports:
- `getV2DashboardRollout()` — fetches the B.4 backend endpoint
- `isV2OptedOut() / setV2OptOut(value)` — localStorage-backed manual opt-out flag (interlocks with the existing `DashboardSwitchPill` for power users)

`App.jsx HomeRedirect` is now async. Decision tree:

```
not authed       → /
admin role       → /admin
onboarding off   → /onboarding
manual opt-out   → /dashboard (V1)
rollout disabled → /dashboard (V1)
rollout enabled  → /v2/dashboard
network failure  → /dashboard (fail closed)
```

The rollout client is dynamic-imported so the cold landing-page bundle doesn't pull rollout/sentry imports.

#### F.9 — Admin AI usage page

`/admin/analytics/ai-usage` reads the four B.3 endpoints. Layout:
- Range chips (7 / 14 / 30 / 90 days) with `aria-pressed`
- 8 KPI tiles (messages, merchants, total/input/output tokens, cost forecast, avg latency, P95 latency)
- Top-merchants leaderboard (10 rows; merchant name + email hydrated)
- Daily roll-up table (per (day, merchant) bucket; first 50 rows visible)
- Footer: "Cost forecast at Gemini 2.0 Flash public pricing — actual billing comes from Google Cloud Console"

Inline styles + `ADMIN_BRAND` palette (matches `/admin/ops/email-engagement` pattern). Lazy-loaded.

#### F.10 + F.11 — In-app help center

`/help` (index) and `/help/:topic` (article) — single component, lazy-loaded route. Seven topics: chat, insights, notifications, reports, sharing, slack, settings.

Reads from `src/i18n/dashboard/helpCenter.{tr,en,ar}.json` (new files; the existing `help.{tr,en,ar}.json` is reserved for admin knowledge-base `kb.*` keys — no collision).

Each topic has a summary + 3-4 ordered (title, body) sections. Component reads sections by index 1..12 — translators add a section by appending one row.

---

## 2. Hard-rule compliance — final

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Two npm deps + three env vars approved upfront. Zero Dockerfile / nixpacks / railway.toml / Node version changes. Zero new cron schedules. |
| **`merchantId` everywhere** | ✅ Rollout endpoint hashes `merchantId`; admin AI usage groups by `merchantId`; Sentry context tags `merchantId`. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`** | ✅ Admin AI usage reads `ChatMessage.tokensUsed/inputTokens/outputTokens/latencyMs` columns directly. |
| **Plain JSX + inline styles + design tokens** | ✅ All new V2 components import from `@/design-system-v2/cinematic/tokens`. |
| **Reuse D-1..D-9 infrastructure** | ✅ Notification engine (D-4), Phase 12 a11y.css, ChatMessage tokens (D-8), FeatureFlagsContext (existing) — all reused without modification. |
| **All commit messages in English** | ✅ |
| **Strict micro-commits** | ✅ 5 backend + 12 frontend = 17 commits. |
| **Stop on unexpected output** | ✅ Pre-existing TypeScript errors in `auditLogger.ts` and `admin/auth.ts` were not regressed. The lucide v1 `Slack` icon name change required a one-line fix mid-F10. |
| **Lighthouse 95+ on every page** (spec hard-rule, staged per §10.B) | ⚠️ Three easy wins shipped (lucide split + locale split + font cuts). Real Lighthouse measurement pending env-var provisioning + production deploy. The CommandPalette wildcard import is the remaining known blocker. |
| **WCAG AA mandatory** | ✅ Global baseline already AA-compliant; per-page sweep on customer-facing screens done; cinematic primitives ship correct ARIA. |
| **Sentry operational before rollout** | ⚠️ Code wired both repos; awaiting `SENTRY_DSN` + `VITE_SENTRY_DSN` env vars on Railway/Vercel. Until then both helpers no-op cleanly. |
| **Feature-flag deferred env vars** | ✅ All Sentry + rollout code paths run cleanly without env vars set. Same pattern as D-9's Slack integration. |

---

## 3. Required env vars + deps — for provisioning

### 3.1 Approved during Phase A — to be provisioned post-D-10

| Var | Where | Default behavior when unset |
|---|---|---|
| `SENTRY_DSN` | Backend (Railway) | `initSentry()` returns false; helpers no-op; console.log |
| `VITE_SENTRY_DSN` | Frontend (Vercel build env) | Same shape; UI-side errors don't reach Sentry |
| `V2_DASHBOARD_ROLLOUT_PCT` | Backend (Railway) | Defaults to 100 → 2 test merchants always land on V2 |

### 3.2 Approved deps — already installed

- `@sentry/node@^8` (backend `package.json`)
- `@sentry/react@^8` (frontend `package.json`)

### 3.3 Deferred

- `SENTRY_AUTH_TOKEN` + `@sentry/cli` — source-map upload (decision §10.D defer)
- `POSTHOG_API_KEY` — analytics (decision §10.C defer)

---

## 4. Launch checklist (operational steps for Mehmet)

1. **Provision env vars** on Railway (backend) + Vercel (frontend):
   - `SENTRY_DSN` (from sentry.io project for Node)
   - `VITE_SENTRY_DSN` (same Sentry account; project for React)
   - `V2_DASHBOARD_ROLLOUT_PCT=100` (start at full rollout for the 2 test merchants)
2. **Restart Railway** so `initSentry()` re-runs and the rollout endpoint picks up the env var.
3. **Smoke test** Sentry: trigger a 500 from any backend endpoint (e.g. send a malformed request). Verify the issue appears in Sentry with `requestId`, `merchantId`, `path`, `userAgent` extras.
4. **Smoke test** rollout: log in as one test merchant; verify `/v2/dashboard` is the post-login destination.
5. **Smoke test** admin AI usage: hit `/admin/analytics/ai-usage` (admin JWT); verify the page renders with the 8 KPI tiles, top-merchants leaderboard, daily roll-up.
6. **Smoke test** /help: log in as customer; visit `/help`; confirm 7 topic cards render in TR + click one to read; switch language; confirm content updates.

After smoke testing, **D-10 is launched.** The 2 test merchants are on V2 + AI Co-Pilot Suite. New merchants who sign up will be on V2 by default (until the pct is dialed back, which won't be needed until merchant base grows past ~10).

---

## 5. Deferred (intentional)

| Item | Why | When to revisit |
|---|---|---|
| PostHog analytics | No data to analyze at 2-merchant scale; ~75 KB JS bundle weight not justified. | When merchant base passes 50+. |
| Sentry source-map upload | Lightweight V1 per Mehmet's instruction; symbolicate on demand. | When triage of a specific minified stack frame fails. |
| Per-animation spring tuning | Foundational `prefers-reduced-motion` already shipped (Phase 12); polish work, not a launch gate. | Post-launch polish sprint. |
| Per-page distinct empty-state illustrations | The three primitives suffice; design assets needed for bespoke art. | Post-launch design sprint. |
| Phased 5%→25%→50%→100% rollout | 2 merchants make staged % theater. The infra is built (B.4 + F.8); set `V2_DASHBOARD_ROLLOUT_PCT=100` until merchant base grows. | When merchant base passes ~10 and a real cohort can be staged. |
| Marketing materials (screenshots, video, feature page copy, press release) | Not a code-completeness gate; benefits from a real customer base + UX testing. | Marketing-led sprint after launch. |
| CommandPalette icon wildcard refactor | ~166 KB gzipped on dashboard pages from `import * as Icons`. Real refactor (replace wildcard with explicit icon map keyed by sidebar registry names). | Post-launch perf sprint if Lighthouse target requires it. |
| Slack channel-validation cron schedule (D-9 deferred follow-up) | Backend handler not yet implemented; cron-job.org schedule deferred. | Schedule + endpoint together as a small follow-up. |

---

## 6. Commit ledger (this sprint)

| # | Repo | Commit | Subject |
|---|---|---|---|
| A.1 | frontend | `34b8fa7` | docs: Sprint D-10 audit report |
| B.1 | backend  | `1776c28` | feat(monitoring): @sentry/node init + errorHandler integration |
| B.2 | backend  | `c1ffa62` | feat(monitoring): /health dependency-status endpoint |
| B.3 | backend  | `2a9a9a3` | feat(admin): AI token-usage aggregation endpoints |
| B.4 | backend  | `7d29d0e` | feat(rollout): /api/customer/rollout/v2-dashboard endpoint |
| B.5 | backend  | `b901ece` | docs(runbooks): incident response documentation |
| F.1 | frontend | `16851b8` | perf: split charts and locale-split i18n-dashboard chunks |
| F.2 | frontend | `0ebc205` | perf: cut Google Font weights to match actual usage |
| F.3 | frontend | `2aaf491` | feat(ui): cinematic skeleton + empty state primitives |
| F.4 | frontend | `989be17` | feat(ui): cinematic error boundary + error block primitives |
| F.5 | frontend | `593b5b7` | feat(ui): sweep V2 pages onto cinematic primitives |
| F.6 | frontend | `2a02dcc` | feat(a11y): ARIA + screen-reader sweep on customer-facing pages |
| F.7 | frontend | `1b127eb` | feat(monitoring): @sentry/react init + boundary capture |
| F.8 | frontend | `cac1a4b` | feat(rollout): /api client + post-login V2 redirect |
| F.9 | frontend | `146db33` | feat(admin): /admin/analytics/ai-usage page |
| F.10 | frontend | `1ca6314` | feat(ui): in-app /help route + TR/EN/AR JSON loader |
| F.11 | frontend | `7357f77` | feat(i18n): help center translations (TR/EN/AR) |
| F.12 | frontend | _(this commit)_ | docs: Sprint D-10 completion report |

The program-level launch summary lands as the very next commit (F.13).

---

**Phase B — DONE. Awaiting env-var provisioning + smoke test for launch.**
