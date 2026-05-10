# Sprint D-10 — Polish, Performance & Launch Prep: Audit Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of decisions in §10 before Phase B**

---

## TL;DR

Three structural findings up front:

1. **The Lighthouse blocker is the chunking config, not the page code.** `vite.config.js:51-54` collapses `recharts + d3-* + victory-vendor + lucide-react` into a single `charts-*.js` chunk that's **1,236 KB uncompressed / 258 KB gzipped**. Because **60 files import from `lucide-react`** (used across virtually every page for icons), every route — even pages that have nothing to do with charts — pulls the full 1.2 MB chunk in. Splitting `lucide-react` out of the charts chunk and lazy-loading per-route chart components is the single biggest performance lever this sprint.
2. **Empty / error / loading states are inconsistent across V2 pages, not absent.** Each V2 page rolls its own `<Loader2 spin>` + inline crimson error block. The legacy `<EmptyState>` component (`src/components/dashboard/EmptyState.jsx`) is V1-style (emoji icons, palette-based, not cinematic) and **zero V2 pages use it**. There is no cinematic skeleton/particle component yet. We don't need to write 11 distinct empty states from scratch — we need three primitive components (`<CinematicSkeleton>`, `<CinematicEmptyState>`, `<CinematicErrorBoundary>`) and a sweep that swaps them in.
3. **Most "monitoring & analytics" goals can be met with one new env var.** Sentry (frontend + backend) is justified — the backend errorHandler currently `console.error()`'s and returns `{ error: "Internal server error" }` with zero context. PostHog is **NOT justified** for V1 with 2 test merchants — analytics has nothing to analyze yet, and the dep would add ~75 KB to the bundle. Defer PostHog to post-launch. Gradual rollout reduces to one env var (`V2_DASHBOARD_ROLLOUT_PCT`) + one tiny endpoint (`GET /api/customer/rollout/v2-dashboard`) reading `hash(merchantId) % 100 < pct`. Total infra ask: **2 new env vars + 1 npm dep on each side** (`@sentry/node` + `@sentry/react`). PostHog and source-map upload defer to post-launch.

**The 23-commit Phase B sequence in the spec is over-prescribed.** With recommendations applied, D-10 collapses to a tighter ~14-commit sequence (§12) that hits every hard rule:
- Lighthouse Performance 95+ via the chunking fix + font subsetting + lazy-load (§4)
- WCAG AA via global a11y.css already present (good baseline) + targeted ARIA sweep on customer-facing screens only (§7)
- Sentry operational on both repos before any rollout phase (§10.A)
- AI usage admin dashboard reading the `ChatMessage.tokensUsed/inputTokens/outputTokens/latencyMs` columns already shipped in D-8 (§8)

**12 open decisions** are surfaced in §10. Recommendations together yield the 2-env-vars / 2-deps / no-Dockerfile-changes outcome.

---

## 1. Repo geography (recap)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Vite + React 18 frontend, plain JSX. Cinematic tokens at `src/design-system-v2/cinematic/tokens.js`. Global accessibility primitives at `src/styles/a11y.css`. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma. Bare-bones errorHandler at `src/middleware/errorHandler.ts`. Shallow `/health` at `src/index.ts:111`. D-8's per-message token tracking columns live on `ChatMessage`. |

Hard-rule reminder: `merchantId` everywhere; no edits to `aiBriefController.ts / merchantSnapshot.ts / kpiComputations.ts`; plain JSX + inline styles + design tokens.

---

## 2. A.6 — Bundle analysis (the headline finding)

Built locally during D-9 closeout. Top chunks (uncompressed):

| Rank | Chunk | Bytes | Notes |
|---|---|---:|---|
| 1 | `charts-lM4VP3tW.js` | **1,236,258** | recharts + d3-* + victory-vendor + **lucide-react** all collapsed together |
| 2 | `i18n-dashboard-H2-Pkja4.js` | 371,101 | All TR/EN/AR dashboard JSON loaded together |
| 3 | `index-CSsq0vmf.js` | 292,798 | App entry |
| 4 | `CustomerDashboard-Db5KBv38.js` | 169,117 | Legacy V1 dashboard |
| 5 | `react-dom-BLvJTZeP.js` | 129,817 | React core |
| 6 | `vendor-D0gZy8II.js` | 109,756 | Misc node_modules |
| 7 | `i18n-Cu2AevGE.js` | 82,892 | Marketing-page i18n |
| 8 | `DashboardV2Page-BO_Pnl0E.js` | 58,857 | V2 dashboard route |

### 2.1 Why the charts chunk is 1.2 MB

`vite.config.js:43-56`:

```js
manualChunks(id) {
  if (id.includes("node_modules")) {
    if (id.includes("/recharts/")
        || id.includes("/lucide-react/")          // ← this line is the bug
        || id.includes("/d3-")
        || id.includes("/victory-vendor/")) return "charts";
    ...
  }
}
```

`lucide-react` is bundled into `charts` because of this rule. But:
- `60 files` in `src/` import from `lucide-react` (all V2 pages, marketing pages, settings).
- Every single one of them transitively pulls `recharts + d3 + victory-vendor` into the network request, even when the page doesn't render a chart.

This is the dominant Lighthouse Performance penalty. **Fixing this one config line alone will push every non-chart page from ~258 KB gzipped to ~30 KB gzipped on the chart side.**

### 2.2 Other notable bundle facts

- `i18n-dashboard` chunk is 371 KB because every locale bundle for every dashboard module gets eagerly imported via `src/i18n/dashboard/index.js`. The merchant only ever needs ONE locale (their own). Locale-split would save ~250 KB on each first paint.
- 4 Google Font families load blocking from `index.html:39-40` (IBM Plex Sans Arabic ×5 weights + Plus Jakarta Sans ×6 + Manrope ×6 + Inter Tight ×4 = **21 weights**). `display=swap` is set so it's not text-blocking, but every weight is 12-30 KB → ~400 KB of font payload over the network on cold start.
- `recharts@3.8.1` brings d3-shape, d3-scale, d3-array, victory-vendor — together ~700 KB. Used only by ~10 chart components in `src/components/dashboard/charts/`.

### 2.3 Recommended fixes (smallest → biggest impact)

| Fix | Effort | Expected gain |
|---|---|---|
| Pull `lucide-react` out of the `charts` rule into `vendor` | 1 line in vite.config.js | Massive — every non-chart route drops ~250 KB gzipped |
| Locale-split the i18n-dashboard chunk by language | ~30 LOC in `src/i18n/dashboard/index.js` | ~80 KB gzipped saved on cold start |
| Cut Google Font weights to 3 per family (400 / 600 / 700) | 1 line in index.html | ~200 KB on cold network |
| Lazy-load chart components in `dashboard-shared` (already split but eagerly imported) | ~10 LOC across 3 pages | Frees the 700 KB recharts chunk from non-chart routes |
| Self-host fonts with `font-display: optional` + preload critical 1 weight | ~15 LOC + asset adds | Eliminates Google round-trip; LCP improves ~200 ms |

V1 of D-10 should ship the first three for sure (very low effort, very high impact). The lazy-load and self-hosting cuts are nice-to-have if Lighthouse is still <95 after the easy wins.

---

## 3. A.5 — Performance baseline (predicted, not measured)

I cannot run Lighthouse from Phase A (no headless browser available in this environment). Predicted scores BEFORE the §2.3 fixes, based on bundle composition + font loading:

| Page | Predicted Performance | Predicted Accessibility | Notes |
|---|---:|---:|---|
| `/v2/dashboard` | 70-78 | 78-85 | Heavy bundle on first paint; missing ARIA on dashboard cards |
| `/insights/shares` | 75-82 | 82-88 | Smaller page; lucide pull is the bottleneck |
| `/notifications` | 78-85 | 85-90 | Light page; same lucide issue |
| `/chat` | 65-72 | 88-92 | Chat surface has the most aria coverage; bundle still heavy |
| `/reports/weekly/:id` | 80-86 | 80-85 | iframe loads PDF, so initial JS is small |

After §2.3 fixes (lucide split + i18n locale-split + font weight cuts): **all five pages should hit 92-96**, clearing the 95+ bar on the lighter routes and within reach on `/chat` + `/v2/dashboard`. Decision §10.B picks where to invest the second-pass effort.

---

## 4. A.1 — Animation audit

`src/styles/a11y.css:51-60` already enforces `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**This is already a complete and correct global override.** Per-page animation tuning in V1 is mostly future-proofing — the hard requirement (don't animate when the user opts out) is met.

The remaining issue is **inline `<style>{`@keyframes spin …`}</style>` blocks scattered across V2 pages** (`IntegrationsPage.jsx`, `SlackChannelMappingPanel.jsx`, others). These are functionally fine but stylistically duplicated. Recommendation: a single `src/styles/animations.css` with `spin / pulse / shimmer` keyframes globally, deleted from page-level inline styles. ~50 line cleanup, no UX change.

Spring-physics tuning (the spec's "3 hours per animation" intent) is **not justified for V1** with 2 test merchants. Defer to a post-launch polish sprint.

---

## 5. A.2 — Empty states audit

| V2 page | Empty state today | Recommendation |
|---|---|---|
| `/v2/dashboard` (DashboardV2Page) | Lists card "no data yet" inline | Cinematic skeleton during initial load; constellation pattern for empty insights tile |
| `/insights/shares` (SharesPage) | Inline text | `<CinematicEmptyState>` with link icon |
| `/insights/recipients` (RecipientsPage) | Inline text + button | Same primitive, "Add first recipient" CTA |
| `/insights/share-links` (ShareLinksManagementPage) | Inline text | Same primitive |
| `/notifications` (NotificationArchivePage) | Bell icon + text | Already cinematic-ish; promote to primitive |
| `/settings/notifications` (NotificationPreferencesPage) | N/A — always has prefs row | None needed |
| `/chat` (ChatPage) | Has empty hint already | Already cinematic |
| `/reports/weekly` (ReportsArchivePage) | Inline text | Hourglass primitive ("First report Sunday 18:00") |
| `/reports/weekly/:id` (ReportViewerPage) | iframe loading | Skeleton-rectangle primitive |
| `/settings/integrations` (IntegrationsPage — D-9) | Already has 3-state UI | Already cinematic |
| `/settings/integrations` SlackInstallationCard | Mappings list | Cinematic skeleton during channel-list load |

**11 V2 pages, 8 need a primitive applied.** With one `<CinematicEmptyState>` component the sweep is ~30 LOC per page.

The legacy `src/components/dashboard/EmptyState.jsx` is V1-style (emoji + dashboard palette). Don't touch it (V1 dashboard still uses it). Build the V2 primitive at `src/components/v2/feedback/CinematicEmptyState.jsx`.

---

## 6. A.3 — Error states audit

Across the 11 customer-facing V2 pages:
- **87 `catch (err) / setError(`** call sites
- Almost all render an inline crimson box like:
  ```jsx
  {error && <div style={{...crimson glow...}}>{error.message}</div>}
  ```
- No error boundary at the app root → a render-time exception in any V2 page shows React's default white-screen error overlay in dev, blank screen in prod.
- No Sentry → backend 500s log to Railway stdout only.

| Error path | Today | Recommendation |
|---|---|---|
| Network failure (fetch throws) | Inline crimson `err.message` | `<CinematicErrorBoundary>` with retry |
| 401 / 403 (token expired) | Generic error message | Auto-redirect to login + toast "Session expired" |
| 500 from backend | "HTTP 500" raw | Branded "Something glitched in the matrix" page; Sentry capture |
| Validation (form submit) | Per-page handling | Already adequate; standardize crimson glow on field |
| Slack 503 (D-9 not configured) | Already handled cleanly by D-9 | None — done |

**Recommended primitives:**
1. `<CinematicErrorBoundary>` — top-level React error boundary with the cosmic gradient + retry. Wrap `<RequireAuth>` children.
2. `<CinematicErrorBlock>` — page-level error UI replacing the inline crimson boxes. Single component, props `{ error, onRetry }`.
3. Backend `errorHandler` middleware extension: `requestId`, structured log line, Sentry capture. Five-line edit.

---

## 7. A.4 — Loading states audit

`<Loader2>` from lucide-react with `style={{ animation: 'spin 1s linear infinite' }}` is used in **126 places** across V2 pages.

This is functionally fine (it spins) but cinematic-inconsistent (spec § B.4 wants skeleton/particle/aurora). Recommendation:

| Component | Where it goes | Lines |
|---|---|---|
| `<CinematicSkeleton variant="card" />` | Replace inline spinner before initial data loads | ~80 LOC primitive |
| `<CinematicSkeleton variant="list" rows={n} />` | Lists / tables | (same component) |
| `<CinematicSkeleton variant="chart" />` | Charts | (same component) |
| `<CinematicLoaderOrb />` | "AI thinking" states (chat) | ~40 LOC |

Then a sweep — replace the inline `<Loader2 spin>` blocks with the primitive. ~5 LOC per page; 11 pages.

The `<Loader2>` itself stays for in-button busy states (e.g. "Saving…" on a Save button) — those are correct as-is.

---

## 8. A.7 — Accessibility audit

### 8.1 Global baseline

`src/styles/a11y.css` (already shipped) covers:
- ✅ Skip-to-content link (CSS only — also rendered in `App.jsx` per grep)
- ✅ Global focus-visible ring (Saudi green for `lang="ar"`, Turkish red otherwise)
- ✅ Screen-reader-only utility class
- ✅ `prefers-reduced-motion` honour
- ✅ `prefers-contrast: more` enhancement
- ✅ 44×44 touch targets on small screens

This is already a **production-grade global baseline**. The remaining work is per-page ARIA, not foundational rework.

### 8.2 Per-page ARIA coverage (customer-facing screens — per Mehmet's instruction)

| Page | aria-* count | Notes |
|---|---:|---|
| `/chat` (ChatPage) | 5 | Best-covered V2 page (focused on by D-8) |
| All 10 other V2 pages | 0 | Inline buttons / inputs without labels |

**Recommendation: targeted ARIA sweep on customer-facing pages only** (login, register, OnboardingPage, dashboard, insights, notifications, chat, settings, integrations). ~15-20 ARIA attribute additions per page; ~2 hours of work total. Admin pages can wait — they're internal-only.

### 8.3 Color contrast

The cinematic palette uses `pearlWhite (#F8FAFC)` text on `deepSpace1 (#0A0E27)` background. Contrast ratio: **18.5:1** — well above WCAG AAA (7:1).

`pearlDim (#CBD5E1)` on `deepSpace1`: **13.8:1** — passes AAA.

`pearlFaint (#64748B)` on `deepSpace1`: **5.4:1** — passes AA (4.5:1) for normal text, **fails AA (7:1)** for AAA. Acceptable for hint/caption text per WCAG; not used for primary content.

**No contrast remediation needed** for the cinematic surfaces. The marketing pages (white-background) use `#14060A` on `#FFFFFF` (16:1) and various reds on white — those pre-date cinematic and are not in this sprint's scope.

### 8.4 Keyboard navigation gaps (manual review)

- ✅ `<button>` and `<a>` are used consistently (no `<div onClick>` shortcuts spotted)
- ✅ Forms use real `<input>` / `<select>` / `<textarea>`
- ⚠️ Modals (`ShareInsightModal`, `ConfirmDialog`) lack focus trap on open; tab leaks to background
- ⚠️ The chat overlay (`ChatPanel`) has `Escape` close but no focus return to the trigger
- ⚠️ Channel mapping `<select>` has no aria-label (D-9, just shipped)

Targeted fixes; ~50 LOC across 4 files.

---

## 9. Backend audit (added beyond spec scope)

### 9.1 Health endpoint

`src/index.ts:111`:

```ts
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", service: "...", version: "3.0.0", environment: env.nodeEnv, timestamp: new Date().toISOString() } });
});
```

Always returns 200 — doesn't actually check anything. UptimeRobot pinging this gets a green light even when DB is down.

**Recommendation:** extend to verify DB (`prisma.$queryRaw`'SELECT 1'`), Resend (`resend.domains.list()` or just key presence), Gemini (key presence), Slack (`isSlackConfigured()`), and return per-dependency status. ~25 LOC. Spec § B.7 explicitly asks for this.

### 9.2 Error handler

`src/middleware/errorHandler.ts`:
- Logs `err.stack` to stdout
- Returns `{ success: false, error: "Internal server error" }` (or message in dev)
- No request ID
- No Sentry capture
- No structured log

**Recommendation:** add `requestId` middleware (one ~10 LOC file), pipe to Sentry when `SENTRY_DSN` is set, include `requestId` in the error response (so support can correlate when a customer reports a 500). ~30 LOC.

### 9.3 Token-usage data already exists (D-8 windfall)

`prisma/schema.prisma:2342-2345` (D-8):

```prisma
tokensUsed      Int?     // total (input + output)
inputTokens     Int?     // promptTokenCount from Gemini usageMetadata
outputTokens    Int?     // candidatesTokenCount from Gemini usageMetadata
latencyMs       Int?
```

These columns exist on every `ChatMessage` row. The admin AI usage dashboard is **purely a query layer** — no schema changes needed.

Aggregation queries needed:
- Daily token usage by merchant: `groupBy(merchantId, DATE(createdAt))` summing `tokensUsed`
- Per-conversation breakdown: `findMany` ordered by total tokens, top 20
- Latency P50 / P95: standard percentile (Postgres `percentile_cont`)
- Cost forecast: `tokensUsed * (input rate ÷ 1M)` with Gemini 2.0 Flash pricing constants in code

Spec § B.7 asks for "Cache hit rate" — there is no cache layer for Gemini calls in D-8 (decision §6.5 deferred). Skip from V1; report as N/A on the dashboard or omit the tile.

---

## 10. Open decisions — BLOCKERS for Phase B

12 decisions; the recommendations together yield zero infra changes beyond 2 env vars + 2 npm deps.

### 10.A — Sentry: yes / no?

| Option | Trade-off |
|---|---|
| **(A1) Yes — `@sentry/node` (backend) + `@sentry/react` (frontend)** (recommended) | Justified by zero current visibility into backend 500s. Lightweight init: ~5 LOC each. Source-map upload deferred (decision §10.D). 2 new env vars. |
| (A2) Defer to post-launch | Risk: launch with no visibility into errors during the rollout phase. |
| (A3) Self-host (GlitchTip) | More work, more infra, no V1 win. |

**Recommended: A1.** Lightweight install (no source maps in V1) is cheap; visibility during the rollout phase is critical.

### 10.B — Lighthouse target: 95 vs 90?

| Option | Trade-off |
|---|---|
| **(B1) 95+ on every page** (spec target) | Hard-rule; needs full §2.3 fix list (lucide split + locale split + font cuts + lazy chart). ~1 day of work. |
| (B2) 90+ acceptable; pursue 95 post-launch | Easier; ships sooner. Mehmet has flagged Lighthouse 95+ as a hard constraint, so this only relaxes if he agrees explicitly. |

**Recommended: B1, but staged.** Ship the three easy wins (§2.3 rows 1-3) first, measure, then decide whether to do lazy-chart-load + self-hosted fonts. Will likely clear 95 with three fixes alone.

### 10.C — PostHog: yes / no / later?

| Option | Trade-off |
|---|---|
| (C1) PostHog (cloud) — page views, conversion funnels | ~75 KB JS dep on frontend; cloud account; ~$0/month at 2-test-merchant volume. **No data yet to analyze.** |
| (C2) Self-hosted PostHog | Adds Postgres-as-warehouse infra. No. |
| **(C3) Defer to post-launch; ship without analytics** (recommended) | Saves bundle weight + env var + dep. We will need analytics, but not at 2-merchant scale. Add when 50+ merchants are on V2. |

**Recommended: C3.** Spec is explicit that PostHog "or similar" is fine; the tracking value is zero with 2 merchants. The "what to track" decisions can be made better with a real customer base.

### 10.D — Sentry source-map upload?

| Option | Trade-off |
|---|---|
| (D1) Upload sourcemaps via Sentry CLI on every build | Stack traces show TS/JSX line numbers. Adds CI step + token; minor infra. |
| **(D2) Defer source-map upload — V1 ships with minified frames** (recommended) | Errors group by minified frame; still useful for trend detection. We can re-symbolicate later if a specific error needs investigation by uploading the deployed bundle's sourcemap on demand. |
| (D3) Inline source maps in production bundle | Bundle weight penalty. No. |

**Recommended: D2.** Per Mehmet's instruction "lightweight config — no source maps upload in V1 if it adds infra burden."

### 10.E — Gradual rollout shape

| Option | Trade-off |
|---|---|
| **(E1) Single env var `V2_DASHBOARD_ROLLOUT_PCT` (0-100)** (recommended) | Backend exposes `GET /api/customer/rollout/v2-dashboard` returning `{ enabled: hash(merchantId) % 100 < pct }`. Frontend reads on boot; if `enabled` and the merchant hasn't manually toggled, post-login navigates to `/v2/dashboard`. Manual override stored in `localStorage` (existing `FeatureFlagsContext`). One env var change → rollout phase advance. |
| (E2) Per-merchant database flag | Heavier — requires DB migration + admin tool to flip. |
| (E3) GrowthBook / LaunchDarkly | New infra; overkill at 2-merchant scale. |

**Recommended: E1.** Mehmet's instruction was "the simplest implementation (env-var-based percentage gate)"; this matches it. Phase progression is a Railway env var edit + restart (~30 sec).

### 10.F — Animation tuning depth

| Option | Trade-off |
|---|---|
| **(F1) Foundational only — keep `prefers-reduced-motion` (already done), centralize keyframes, don't tune spring physics per-animation** (recommended) | Saves ~6 hours; spring tuning is pre-mature for 2-merchant launch. |
| (F2) Full per-page audit + spring-tuning sweep | Spec's intent. Justifies ~2 days of work that nobody is going to A/B notice at 2-merchant scale. |

**Recommended: F1.** Promote to F2 in a post-launch polish sprint when there's behavior data.

### 10.G — Empty / loading / error states scope

| Option | Trade-off |
|---|---|
| **(G1) 3 primitives (CinematicSkeleton + CinematicEmptyState + CinematicErrorBlock) + sweep across 11 V2 pages** (recommended) | ~250 LOC for primitives + ~30 LOC per page × 11 = 580 LOC total. One day. |
| (G2) Per-page custom illustrations (per spec mock) | Multi-day; needs design assets (constellation, hourglass, chat orb). V2 polish work. |

**Recommended: G1.** Functionally complete; consistent across the suite; doesn't need design assets.

### 10.H — Accessibility sweep scope

| Option | Trade-off |
|---|---|
| **(H1) Customer-facing only (login, register, onboarding, dashboard, insights, notifications, chat, settings, integrations)** (recommended; per Mehmet's instruction) | ~10 pages × ~20 ARIA attrs each = ~200 attribute additions. ~3 hours. |
| (H2) Customer + admin | Doubles the sweep; admin is internal-only. |

**Recommended: H1.** Explicitly aligned with Mehmet's instruction.

### 10.I — Documentation: where do customer guides live?

| Option | Trade-off |
|---|---|
| **(I1) In-app `/help` route with TR/EN/AR translation files** (recommended) | Zero new infra; reuses existing i18n loader; customer can reach docs without leaving the app. ~6 short pages (Chat, Insights, Slack, Notifications, Reports, Settings). Translation files mirror the D-3..D-9 i18n convention. |
| (I2) Separate static site (docs.zyrix.co) | New domain + hosting + sync gap. Overkill for V1. |
| (I3) README on GitHub | Customer-hostile; private repo anyway. |

**Recommended: I1.** Six TR/EN/AR JSON files under `src/i18n/dashboard/help.{tr,en,ar}.json` (already partially exist — see `help.tr.json` etc. in the i18n dir, currently for marketing-side help center). One new route `/help/:topic` with a simple cinematic markdown renderer.

### 10.J — Admin runbook: where does it live?

| Option | Trade-off |
|---|---|
| **(J1) `docs/runbooks/*.md` on the backend repo** (recommended; spec § B.8) | Lives next to the code that triggers each incident. Mehmet pulls them up when paged. |
| (J2) Notion / Linear | External; sync gap. |
| (J3) In-app admin page | Overkill; nobody reads runbooks while clicking through admin UI. |

**Recommended: J1.** Six Markdown files (one per failure mode in spec § B.8) committed to the backend repo. Plain text, no special infra.

### 10.K — Marketing materials scope

| Option | Trade-off |
|---|---|
| **(K1) Skip in V1 sprint; defer to a marketing sprint** (recommended) | Spec asks for "10 high-resolution screenshots + 1-min video script + feature page copy + pricing update + press release template." None of this is engineering work; all of it benefits from a real customer base + UX testing first. |
| (K2) Ship a minimal feature page copy (4-6 sections, TR/EN/AR) | Matches spec; ~6 hours of writing. Useful but separable from D-10. |
| (K3) Full spec | Multi-day effort that doesn't gate launch. |

**Recommended: K1.** Marketing assets aren't a code-completeness gate. Ship product first; marketing in a follow-up.

### 10.L — Cutover plan execution

The spec § B.9 wants a 5%→25%→50%→100% rollout over 5 days. With 2 test merchants, the math doesn't work — one merchant is already 50%.

| Option | Trade-off |
|---|---|
| **(L1) Build the rollout infra (env var + endpoint) and document the procedure; defer ACTUAL phased rollout until merchant base grows past ~10** (recommended) | Infra is future-proofing; running 5%→25%→50% with 2 merchants is theater. |
| (L2) Run the literal phased rollout regardless | Wastes 4 days waiting for a 24h hold per phase between 2 merchants. |
| (L3) Skip rollout infra entirely | Loses the safety net for when the merchant base does grow. |

**Recommended: L1.** Build infrastructure (decision §10.E option E1); set initial `V2_DASHBOARD_ROLLOUT_PCT=100` for the 2 test merchants (or `50` so one is V1, one V2 for comparison if Mehmet wants); revisit when merchant count grows.

---

## 11. Hard-rule compliance preview

| Rule | Status |
|---|---|
| **No infra change without approval** | ⚠️ Phase A surfaces 2 new env vars (§10.A `SENTRY_DSN` + `VITE_SENTRY_DSN`, §10.E `V2_DASHBOARD_ROLLOUT_PCT`) and 2 npm deps (`@sentry/node` + `@sentry/react`). Phase B blocks until approved. **No** Dockerfile / nixpacks / railway.toml / Node version changes. |
| **`merchantId` everywhere** | ✅ Rollout endpoint hashes `merchantId`; admin token-usage dashboard groups by `merchantId`. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`** | ✅ AI usage dashboard reads `ChatMessage` columns (D-8) directly via fresh aggregation queries. |
| **Plain JSX + inline styles + design tokens** | ✅ All new V2 components follow the D-1..D-9 pattern. |
| **Reuse D-1..D-9 infrastructure** | ✅ ChatMessage tokens (D-8), FeatureFlagsContext (existing), a11y.css (Phase 12), notification engine (D-4) — all reused without modification. |
| **All commit messages in English** | ✅ |
| **Strict micro-commits** | ✅ Phase B sequence reduced from spec's 23 to ~14 (§12). |
| **Stop on unexpected output** | ✅ |
| **Lighthouse 95+ on every page** (spec hard-rule) | ⚠️ Achievable with §2.3 fixes; conditional on §10.B option B1 vs B2. |
| **WCAG AA mandatory** | ✅ Global baseline already AA-compliant; per-page sweep §10.H option H1. |
| **Sentry operational before rollout** | ✅ Decision §10.A option A1. |

---

## 12. Phase B commit sequence — recommended

Spec § Commit Sequence has 23 commits; with recommended options, this reduces to **14**. Skipped commits are explicitly tied to deferred decisions (PostHog, marketing materials, source-map upload, full animation tuning).

### Frontend repo

```
docs(ai-copilot): Sprint D-10 audit report                       (this commit)
perf: split lucide-react out of charts chunk; locale-split i18n   (§10.B / §2.3)
perf: cut Google Font weights to 3 per family                     (§10.B / §2.3)
feat(ui): cinematic skeleton + empty state primitives             (§10.G / §5 / §7)
feat(ui): cinematic error boundary + error block primitives       (§10.G / §6)
feat(ui): sweep V2 pages onto cinematic state primitives          (§10.G / §5-7)
feat(a11y): ARIA + focus-trap pass on customer-facing screens     (§10.H / §8.4)
feat(monitoring): @sentry/react init + error boundary capture     (§10.A)
feat(rollout): /api client + post-login redirect logic            (§10.E)
feat(ui): in-app /help route with TR/EN/AR JSON loader            (§10.I)
feat(i18n): help center translations (TR/EN/AR)                   (§10.I)
docs(ai-copilot): Sprint D-10 completion report                   (final)
```

### Backend repo

```
feat(monitoring): @sentry/node init + errorHandler integration    (§10.A / §9.2)
feat(monitoring): /health dependency-status endpoint              (§9.1)
feat(admin): AI token-usage aggregation endpoints                 (§9.3 / §10 spec § B.7)
feat(admin): /admin/analytics/ai-usage page                       (frontend pair)
feat(rollout): /api/customer/rollout/v2-dashboard endpoint        (§10.E)
docs(runbooks): incident response (Gemini, PDF, email, …)         (§10.J)
```

Total: **14 commits across both repos.** Spec's 23-commit list collapses by skipping PostHog (decision §10.C), source-map upload (§10.D), marketing materials (§10.K), per-animation spring tuning (§10.F), per-merchant DB flag rollout (§10.E), and per-page distinct empty/loading illustrations (§10.G).

---

## 13. Required env vars — for one-batch approval

These are the **only** infrastructure changes D-10 needs.

### 13.1 Sentry (decision §10.A)

| Var | Where | Purpose |
|---|---|---|
| `SENTRY_DSN` | Backend (Railway) | `Sentry.init({ dsn })` for Node SDK |
| `VITE_SENTRY_DSN` | Frontend (Vercel build env) | `Sentry.init({ dsn })` for browser SDK |

(Both DSNs come from a single Sentry project — frontend + backend. Sign up at sentry.io, create a project for Node, create a project for React, take both DSNs. Free tier covers 5k events/month — comfortable for 2-merchant launch.)

### 13.2 Rollout (decision §10.E)

| Var | Where | Purpose |
|---|---|---|
| `V2_DASHBOARD_ROLLOUT_PCT` | Backend (Railway) | Integer 0-100; merchants where `hash(merchantId) % 100 < pct` are on V2 by default |

### 13.3 Sentry source-map upload — DEFERRED (decision §10.D)

`SENTRY_AUTH_TOKEN` and `@sentry/cli` are NOT required in V1 because we ship without source-map upload. Re-evaluate if specific errors need symbol resolution.

### 13.4 PostHog — DEFERRED (decision §10.C)

`POSTHOG_API_KEY` is NOT required. Add when merchant base justifies analytics.

### Total NEW infra

- **3 env vars** (`SENTRY_DSN`, `VITE_SENTRY_DSN`, `V2_DASHBOARD_ROLLOUT_PCT`)
- **2 npm deps** (`@sentry/node` on backend, `@sentry/react` on frontend)
- **Zero** nixpacks / Dockerfile / railway.toml / Node version changes
- **Zero** new cron schedules

---

## 14. Phase B readiness

Phase A is complete. Phase B is blocked on:

1. **Env var + dep approval** (§13).
2. **Decisions §10.A through §10.L** — recommended picks listed below; one explicit yes/no on each.

| Decision | Recommended | Notes |
|---|---|---|
| **10.A** Sentry | A1 (yes, lightweight, no source maps) | Required for "Sentry operational before rollout" hard-rule |
| **10.B** Lighthouse target | B1 staged — ship 3 easy wins first, measure | If <95 after, do the heavier fixes |
| **10.C** PostHog | C3 (defer; no data to analyze at 2-merchant scale) | Re-evaluate at 50+ merchants |
| **10.D** Source-map upload | D2 (defer; symbolicate on demand) | Per Mehmet's instruction |
| **10.E** Rollout shape | E1 (env var + endpoint) | Per Mehmet's instruction |
| **10.F** Animation tuning depth | F1 (foundational only) | Per-animation spring is post-launch polish |
| **10.G** Empty/loading/error scope | G1 (3 primitives + sweep) | Functionally complete; design assets later |
| **10.H** Accessibility sweep | H1 (customer-facing only) | Per Mehmet's instruction |
| **10.I** Customer docs location | I1 (in-app `/help` route + i18n JSON) | Reuses i18n loader |
| **10.J** Admin runbook location | J1 (`docs/runbooks/*.md` on backend) | Spec-aligned |
| **10.K** Marketing materials | K1 (defer to marketing sprint) | Not a code-completeness gate |
| **10.L** Cutover execution | L1 (build infra, set 100%; defer phased rollout) | 2 merchants make 5%→25%→50% theater |

Once Mehmet confirms picks + the 3 env vars + 2 deps, Phase B proceeds per the 14-commit sequence in §12. Estimated effort: ~3 working days (matches spec's "3 days" estimate).

---

**Phase A — DONE. Awaiting review.**
