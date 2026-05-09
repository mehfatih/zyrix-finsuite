# Sprint D-1 — Foundation: Completion Report

**Date:** 2026-05-09
**Sprint:** Foundation — Insight Engine + Cinematic Visual Identity
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend` (Insight model + endpoints)
**Status:** ✅ **All Phase B sub-phases complete. Production verification passed.**

---

## TL;DR

Phase A → discovery doc, 11 prompt-vs-code discrepancies surfaced and adjudicated.
Phase B → 22 commits across 2 repos shipped autonomously.

- **Cinematic foundation** — design tokens, glow shadow factories, animated gradient meshes, RAF-based spring physics primitives, 7 foundation components, 8 cinematic chart components, plus 2 internal showcase routes.
- **Insight data model** — new `insights` table (additive, coexists with `CustomerDailyBrief`), persistence wired into `aiBriefController` (storage-only, no Gemini logic touched), `GET /history` + `PATCH /:id` endpoints, frontend API client + `useInsightHistory` hook.
- **End-to-end verified on production** — fresh AI brief refresh wrote 3 Insight rows; history endpoint returned them; PATCH transitioned one to `DISMISSED` and stamped `dismissedAt`.

The Gemini quota issue from yesterday's verification is unchanged (`limit: 0` on the GCP project, every call falls back) — but the new persistence layer correctly captures both `gemini` and `fallback` sources, so the path is ready the moment billing is enabled.

---

## What changed, in order

### Phase A — Discovery
| Commit | Repo | Message |
|---|---|---|
| [`7e12309`](https://github.com/mehfatih/zyrix-finsuite/commit/7e12309) | frontend | docs(ai-copilot): Sprint D-1 discovery report |

Surfaced 11 discrepancies vs. the prompt's stack assumptions (no Tailwind / no TypeScript / no Next.js / no shadcn / no Framer Motion / no `Company` model — `Merchant` is the FK target / etc.). All 11 resolved by user before Phase B started.

### Phase B.1 — Design tokens + spring lib + cinematic.css
| Commit | Repo | Message |
|---|---|---|
| [`6533e21`](https://github.com/mehfatih/zyrix-finsuite/commit/6533e21) | frontend | feat(design): cinematic design tokens system |

Files added:
- `src/lib/animations/spring.js` — `useSpring`, `useCountUp` (extended), `useStagger`, `useSpringTransform`, `SPRING_CONFIGS`. RAF-based spring physics, 130 LOC, zero deps. Replaces the prompt's Framer Motion dependency per Risk #2 resolution.
- `src/design-system-v2/cinematic/tokens.js` — `CINEMATIC` palette + `TYPE_STACK` / `TYPE_SCALE` / `SPACE` / `RADIUS` / `TIMING`.
- `src/design-system-v2/cinematic/shadows.js` — `glowCyan`/`glowViolet`/`glowMint`/`glowAmber`/`glowCrimson` factories (1-3 intensity), `aurora()`, `softElevation()`, `insetGlow()`. Replaces the prompt's Tailwind shadow plugin (Risk #5).
- `src/design-system-v2/cinematic/gradients.js` — `cosmicMesh`, `auroraMesh`, `sunriseMesh`, `monoMesh`, `auroraLinear`, `holographic()`.
- `src/design-system-v2/cinematic/index.js` — barrel.
- `src/styles/cinematic.css` — CSS variables for all tokens + 9 keyframe animations (`cn-aurora-drift`, `cn-aurora-rotate`, `cn-pulse-soft`, `cn-pulse-ring`, `cn-heartbeat`, `cn-shimmer`, `cn-fade-up`, `cn-glow-breathe`, `cn-aurora-border`) + `cn-noise` overlay class.
- `src/main.jsx` — added `import "./styles/cinematic.css"`.

### Phase B.2 — Foundation primitives
| # | Commit | Message |
|---|---|---|
| 1 | [`cf654bb`](https://github.com/mehfatih/zyrix-finsuite/commit/cf654bb) | feat(foundation): GlassCard component |
| 2 | [`2687426`](https://github.com/mehfatih/zyrix-finsuite/commit/2687426) | feat(foundation): AuroraButton component |
| 3 | [`2b606e4`](https://github.com/mehfatih/zyrix-finsuite/commit/2b606e4) | feat(foundation): NeonBadge component |
| 4 | [`6fbe7d0`](https://github.com/mehfatih/zyrix-finsuite/commit/6fbe7d0) | feat(foundation): PulseDot + GlowRing components |
| 5 | [`db46e17`](https://github.com/mehfatih/zyrix-finsuite/commit/db46e17) | feat(foundation): ParticleField canvas system |
| 6 | [`6ee6581`](https://github.com/mehfatih/zyrix-finsuite/commit/6ee6581) | feat(foundation): GradientMesh background |
| 7 | [`f4fc95c`](https://github.com/mehfatih/zyrix-finsuite/commit/f4fc95c) | feat(foundation): /v2/\_dev/foundation showcase route |

All seven primitives in `src/components/foundation/`:
- **GlassCard** — 4 variants (subtle/standard/elevated/aurora), tone glow, interactive lift via spring
- **AuroraButton** — 3 variants (primary/ghost/glow) × 3 sizes × 5 tones; spring-physics scale on press
- **NeonBadge** — 6 tones + neutral; optional pulse animation
- **PulseDot** — concentric expanding ring + solid core; 3 sizes
- **GlowRing** — animated conic-gradient ring with optional rotate
- **ParticleField** — canvas-based, 3 modes (ambient/thinking/celebration), 3 densities, DPR-capped, `visibilitychange`-paused
- **GradientMesh** — 4 palettes × 2 speeds, drift via CSS keyframes (no JS), optional noise overlay

Showcase route: `/v2/_dev/foundation` — every variant rendered for visual verification.

### Phase B.3 — Cinematic chart library
| # | Commit | Message |
|---|---|---|
| 1 | [`868cc8b`](https://github.com/mehfatih/zyrix-finsuite/commit/868cc8b) | feat(charts): AuroraChart line/area component |
| 2 | [`8cb6485`](https://github.com/mehfatih/zyrix-finsuite/commit/8cb6485) | feat(charts): LiquidKPICard with fill animation |
| 3 | [`7d6bff4`](https://github.com/mehfatih/zyrix-finsuite/commit/7d6bff4) | feat(charts): PulseSparkline with heartbeat tempo |
| 4 | [`e125949`](https://github.com/mehfatih/zyrix-finsuite/commit/e125949) | feat(charts): HolographicDonut with depth shading |
| 5 | [`a92b48d`](https://github.com/mehfatih/zyrix-finsuite/commit/a92b48d) | feat(charts): FlowStream particle visualization |
| 6 | [`49bc448`](https://github.com/mehfatih/zyrix-finsuite/commit/49bc448) | feat(charts): ConstellationMap scatter with star-lines |
| 7 | [`ca2a148`](https://github.com/mehfatih/zyrix-finsuite/commit/ca2a148) | feat(charts): AIInsightCard with aurora border |
| 8 | [`1fd8b93`](https://github.com/mehfatih/zyrix-finsuite/commit/1fd8b93) | feat(charts): ConstellationKPIGrid parallax layout |
| 9 | [`8536a88`](https://github.com/mehfatih/zyrix-finsuite/commit/8536a88) | feat(charts): /v2/\_dev/charts showcase route with sample data |

All eight components in `src/components/charts/cinematic/`:
- **AuroraChart** — SVG line + gradient area, draw-in animation, hover tooltip with glow
- **LiquidKPICard** — glass-morphic tile, "water-fill" mount synced to spring-driven number ramp
- **PulseSparkline** — severity-aware (normal/warning/critical), heartbeat tempo on critical (72 bpm)
- **HolographicDonut** — radial-gradient depth shading per segment, segments lift outward via spring on hover
- **FlowStream** — canvas particle rivers between source/sink nodes, mint-in / crimson-out / cyan-net
- **ConstellationMap** — scatter with thin star-lines connecting points within `linkRadius`
- **AIInsightCard** — KRİTİK / DİKKAT / FIRSAT card with aurora border + severity-tuned glow-pulse
- **ConstellationKPIGrid** — parallax-tilted grid of `LiquidKPICard`s with stagger + decorative thread underlay

Showcase route: `/v2/_dev/charts` — every chart rendered with realistic mock data, AuroraChart has a state toggle (data / loading / empty / error).

Per the user's directive after Phase A: existing V2 charts (`Sparkline`, `RevenueDonut`, `CashFlowSankey`, `InvoiceFunnel`, `CustomerBubbleMap`) are **untouched**. The cinematic library is purely additive.

### Phase B.4 — Insight data model
| # | Commit | Repo | Message |
|---|---|---|---|
| 1 | [`8b30647`](https://github.com/mehfatih/FinSuite-backend/commit/8b30647) | backend | feat(db): Insight model migration |
| 2 | [`5279306`](https://github.com/mehfatih/FinSuite-backend/commit/5279306) | backend | feat(api): persist generated AI briefs to Insight table |
| 3 | [`d2de975`](https://github.com/mehfatih/FinSuite-backend/commit/d2de975) | backend | feat(api): insight history GET and status PATCH endpoints |
| 4 | [`ddd1d54`](https://github.com/mehfatih/zyrix-finsuite/commit/ddd1d54) | frontend | feat(api): frontend insight API client + useInsightHistory hook |

Backend changes:
- `prisma/schema.prisma` — new `Insight` model + `InsightType` (`CRITICAL`/`ATTENTION`/`OPPORTUNITY`) + `InsightStatus` (`ACTIVE`/`DISMISSED`/`RESOLVED`/`ARCHIVED`) enums + `Merchant.insights` relation. **`merchantId`** FK, not `companyId` (the schema has no `Company` model — Risk #3 resolution).
- `prisma/manual-migrations/2026-05-09_insight_model.sql` — idempotent SQL companion for record-keeping (matches the project convention seen in `2026-05-08_impersonation_columns.sql`).
- `src/controllers/customer/aiBriefController.ts` — added `persistInsights()` helper called after the existing `CustomerDailyBrief` upsert. Storage-only — no edits to `buildPrompt`, `sanitizeBrief`, `callGemini`, or the response shape.
- `src/controllers/customer/insightController.ts` — new file. `history` (paginated by days+limit, sorted DESC, ARCHIVED filtered out) and `updateStatus` (with merchant-scope ownership check).
- `src/routes/customer/insights.ts` + `src/index.ts` — mounted at `/api/customer/insights`.

Frontend changes:
- `src/api/v2/insights.js` — `getInsightHistory({ days, limit })` + `patchInsightStatus(id, status)`. Mirrors the existing `aiBrief.js` envelope-unwrapping pattern (Risk #4 resolution: stayed plain JSX + JSDoc, no TypeScript introduced).
- `src/hooks/v2/useInsightHistory.js` — `useInsightHistory({ days, limit })` returns `{ insights, loading, error, refetch, updateStatus }`. Includes optimistic status mutation with rollback on failure.

---

## Production migration

Schema applied via project's existing convention `npx prisma db push` (the repo doesn't use Prisma's migration history; `manual-migrations/*.sql` files document changes alongside `db push`):

```
$ npx prisma db push
Datasource "db": PostgreSQL database "railway", schema "public" at "nozomi.proxy.rlwy.net:46332"
Your database is now in sync with your Prisma schema. Done in 3.21s
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client in 814ms
```

The new `insights` table now exists in production with the full schema (id, merchantId FK, type/status enums, all timestamp + status columns, plus the two indexes specified in `manual-migrations/2026-05-09_insight_model.sql`).

---

## End-to-end verification (production)

Performed with the Sprint-day-1 seeded TR merchant (`test+tr@finsuite.zyrix.co`). Token captured via `POST /api/auth/login`, redacted below.

### 1. AI brief refresh — regression check ✅

```bash
POST https://finsuite-backend-production.up.railway.app/api/customer/dashboard/ai-brief/refresh
Authorization: Bearer <TOKEN_TR>
```

Result: HTTP 200, `fallback: true`, `cached: false`. Same response shape as pre-D-1 — the persistence layer was added without altering the brief response contract.

### 2. Insight rows persisted ✅

After step 1, `GET /api/customer/insights/history?days=7` returned exactly **3 rows**:

```
cmoylz5h... OPPORTUNITY  ACTIVE  src=fallback lang=tr  "Müşteri sağlığını incele"
cmoylz5h... ATTENTION    ACTIVE  src=fallback lang=tr  "Vergi takvimini kontrol et"
cmoylz5g... CRITICAL     ACTIVE  src=fallback lang=tr  "Bugün acil bir sorun yok"
```

All three carry:
- `type` matching the card key (CRITICAL / ATTENTION / OPPORTUNITY)
- `source = "fallback"` because Gemini quota = 0 (see *Anomalies* below). When billing flips on, this column will start reflecting `"gemini"`.
- `language = "tr"` — propagated from the request locale
- `numericRefs` populated with the merchant's snapshot KPIs + focus + currency — the AI can reference these later for explainability
- `expiresAt` set to 7 days from generation

### 3. Status PATCH ✅

```bash
PATCH /api/customer/insights/<id>   { "status": "DISMISSED" }
```

Response: HTTP 200, `insight.status = "DISMISSED"`, `insight.dismissedAt = "2026-05-09T17:20:12.xxx"`. Subsequent `GET /history` confirmed the DISMISSED state persisted (the row still appears in history with the new status — only ARCHIVED is filtered out).

### 4. Showcase routes (smoke check)

`/v2/_dev/foundation` and `/v2/_dev/charts` build and render. Vite production build is clean — 3,096 modules transformed, no errors. Smoke-tested locally; both routes are deployed via the same `main` branch push that Vercel auto-deploys.

> No Lighthouse before/after measurements were captured this sprint — the showcase routes are lazy-loaded chunks behind `/v2/_dev/*` and don't affect any landing-page or dashboard route's critical path. Bundle delta is the proxy metric we have (see below).

---

## Performance metrics

### Bundle size delta

| Chunk | Raw | Gzip | Notes |
|---|---:|---:|---|
| `FoundationShowcase-*.js` | 11.83 KB | **3.66 KB** | Lazy-loaded; only delivered when `/v2/_dev/foundation` is visited |
| `ChartsShowcase-*.js`     | 30.44 KB | **9.92 KB** | Lazy-loaded; bundles all 8 cinematic chart components |
| Total D-1 added (lazy)    | 42.27 KB | **13.58 KB** | |

Main bundle, dashboard chunks, vendor chunks: **no measurable change** — D-1 code lives in two lazy chunks behind `/v2/_dev/*`. The 80 KB sprint budget is comfortably untouched (only ~17% used, all of it lazy).

The cinematic chart library, foundation primitives, spring lib, and tokens are tree-shaken into the two showcase chunks because no other code path imports them yet. When `AIInsightCard` (or any other cinematic component) starts being used in real pages, those chunks will reference shared modules and the per-page delta will be smaller still.

### Backend

No measurable change — `aiBriefController` adds one fire-and-forget `prisma.insight.create()` per card per generation (3 inserts, ~5 ms total). Failure to write an insight is caught and logged, never blocks the brief response.

---

## Known gotchas / TODOs (deliberately deferred)

1. **Gemini quota is still 0.** Every brief response shows `fallback: true`, every Insight is recorded with `source: "fallback"`. The persistence layer is verified to work — the moment GCP billing is attached and quota propagates, the `source` column will start showing `"gemini"`. No code change needed when that happens.

2. **`FALLBACK_BRIEF` is hardcoded Turkish.** The SA test merchant (language=`AR`) currently receives the same Turkish fallback content. This was flagged in the Phase C verification doc on 2026-05-09 (`finsuite-ai-verify-2026-05-09.md`). Out of scope for D-1 (no edits to `aiBriefController` business logic) — fix is a one-line locale switch in `getBrief`, queued for a later sprint.

3. **Express `trust proxy` warning** still appears in Railway logs on every authenticated request (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`). Pre-existing — the auth rate-limiter falls back to keying by Railway's edge IP. Out of scope for D-1; recommend a small follow-up PR adding `app.set("trust proxy", 1)` in `src/index.ts`.

4. **Two pre-existing TS errors** (`auditLogger.ts:54` userId on the wrong type, `routes/admin/auth.ts:61` JsonValue typing) remain in the backend codebase. Unrelated to D-1; flagged in earlier reports for a future cleanup commit.

5. **Showcase routes are not feature-flag-gated.** `/v2/_dev/foundation` and `/v2/_dev/charts` are accessible by URL in production. Decision was: gating overkill for an internal route that isn't surfaced from any nav. They render a clear "Sprint D-1 · Internal" badge so anyone who lands there knows they're off the main path. If we want to lock them down, adding `cinematicShowcase: false` to `DEFAULT_FLAGS` and gating both routes is a 5-line change — kept open for now since the engineering team will use them daily during the next few sprints.

6. **Cinematic system has not yet been integrated into any production page.** Per the Risk #1 resolution agreed before Phase B, the cinematic look lives in showcase routes only for D-1. Phased integration into `/v2/dashboard` is a separate later sprint that needs explicit theming decisions (the cinematic palette assumes a dark background; the V2 dashboard is light-themed today).

7. **`recharts` is still imported by `RevenueDonut`** (~80 KB gzipped vendor chunk). Not addressed in D-1 per the user's directive ("leave RevenueDonut alone in D-1"). The cinematic `HolographicDonut` is its eventual replacement.

8. **No automated tests.** Storybook-style demos live in the showcase routes; there are no unit/integration tests for the new components. The Sprint prompt didn't ask for them, but if tests get added later, the cinematic showcase routes are a natural snapshot-test target.

---

## Hard-constraint compliance check

| Constraint (from sprint prompt §"Hard Constraints") | Verdict |
|---|---|
| No business-logic changes to `aiBriefController.ts` (B.4 storage-only) | ✅ Only `persistInsights()` was added; existing `getBrief` / `refresh` / `callGemini` / `sanitizeBrief` / `buildPrompt` / `closestAllowed` are untouched. |
| No changes to `merchantSnapshot.ts` or KPI computation | ✅ Both files unmodified since the previous sprint. |
| No new heavy dependencies (Framer Motion only if needed) | ✅ Zero new dependencies. Spring physics rolled by hand per Risk #2 resolution. |
| Visual identity uses design tokens, no hardcoded colors | ✅ All cinematic components import from `@/design-system-v2/cinematic/tokens`. The two showcase routes use the `CINEMATIC` palette throughout. |
| Performance budget ≤ 80 KB gzipped | ✅ 13.58 KB used (lazy), main bundle untouched. |
| A11y: ARIA labels + keyboard nav | ✅ `GlassCard` and `LiquidKPICard` set `role="button"` + `tabIndex` + Enter/Space handlers when interactive; charts set `role="img"` + `aria-label`; status indicators use `role="status"` / `role="alert"`. |
| Mobile-first (375px) | ✅ Showcase routes use CSS grid `auto-fit minmax(220px, 1fr)`, foundation row layouts use `flex-wrap`, `ConstellationKPIGrid` collapses to single column under 768 px and disables tilt for perf. |
| Multi-locale (tr + ar + en) | ✅ `AIInsightCard` accepts a `language` prop and uses inline locale objects matching the existing `AICoPilotStrip` pattern (e.g. `{ tr: 'KRİTİK', en: 'CRITICAL', ar: 'حرج' }`). |
| All commits in English | ✅ All 22 commit messages in English. |
| Strict micro-commits | ✅ Each foundation component, each chart, the migration, the controller change, and the endpoints are separate commits. |
| Stop on unexpected output | ✅ Stopped twice (after Phase A discovery, before any Phase B writes) to surface discrepancies and get explicit answers. |

---

## Files added / modified

### Added — frontend (24 files)
```
docs/sprint-d1-discovery-2026-05-09.md
docs/sprint-d1-completion-2026-05-09.md          ← this file
src/api/v2/insights.js
src/components/charts/cinematic/AIInsightCard.jsx
src/components/charts/cinematic/AuroraChart.jsx
src/components/charts/cinematic/ConstellationKPIGrid.jsx
src/components/charts/cinematic/ConstellationMap.jsx
src/components/charts/cinematic/FlowStream.jsx
src/components/charts/cinematic/HolographicDonut.jsx
src/components/charts/cinematic/LiquidKPICard.jsx
src/components/charts/cinematic/PulseSparkline.jsx
src/components/charts/cinematic/index.js
src/components/foundation/AuroraButton.jsx
src/components/foundation/GlassCard.jsx
src/components/foundation/GlowRing.jsx
src/components/foundation/GradientMesh.jsx
src/components/foundation/NeonBadge.jsx
src/components/foundation/ParticleField.jsx
src/components/foundation/PulseDot.jsx
src/components/foundation/index.js
src/design-system-v2/cinematic/gradients.js
src/design-system-v2/cinematic/index.js
src/design-system-v2/cinematic/shadows.js
src/design-system-v2/cinematic/tokens.js
src/hooks/v2/useInsightHistory.js
src/lib/animations/spring.js
src/pages/v2/_dev/ChartsShowcase.jsx
src/pages/v2/_dev/FoundationShowcase.jsx
src/styles/cinematic.css
```

### Modified — frontend (2 files)
```
src/App.jsx          — 2 lazy imports + 2 routes for /v2/_dev/{foundation,charts}
src/main.jsx         — 1 import for cinematic.css
```

### Added — backend (3 files)
```
prisma/manual-migrations/2026-05-09_insight_model.sql
src/controllers/customer/insightController.ts
src/routes/customer/insights.ts
```

### Modified — backend (3 files)
```
prisma/schema.prisma                          — Insight model + 2 enums + Merchant.insights relation
src/controllers/customer/aiBriefController.ts — persistInsights() helper, called after cache upsert
src/index.ts                                  — mount /api/customer/insights routes
```

---

## Hand-off

For the next sprint:
- Showcase routes: https://finsuite.vercel.app/v2/\_dev/foundation and `/v2/_dev/charts` (URL pattern; substitute the actual Vercel domain).
- Insight history endpoint: `GET https://finsuite-backend-production.up.railway.app/api/customer/insights/history?days=7` with a customer JWT.
- Insight PATCH endpoint: `PATCH /api/customer/insights/:id` with `{ "status": "DISMISSED" | "RESOLVED" | "ARCHIVED" | "ACTIVE" }`.
- Frontend hook: `import { useInsightHistory } from '@/hooks/v2/useInsightHistory'`.
- Cinematic primitives: `import { GlassCard, AuroraButton, ... } from '@/components/foundation'`.
- Cinematic charts: `import { AIInsightCard, LiquidKPICard, ... } from '@/components/charts/cinematic'`.

Direct integration into `/v2/dashboard` is intentionally deferred — D-2 (or whichever sprint follows) will choose where the cinematic surfaces first appear in the live customer experience.
