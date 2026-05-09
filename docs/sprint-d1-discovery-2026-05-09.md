# Sprint D-1 — Foundation: Discovery Report

**Date:** 2026-05-09
**Repo:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend` (Prisma + Insight model only)
**Branch:** `main`
**Scope:** Phase A of `sprint-d1-foundation.md` — read-only audit of design system, charts, AI brief flow, and component library. One commit (this doc). Phase B awaits approval.

---

## TL;DR

The repo's stack diverges from the sprint prompt's assumptions in several load-bearing ways. **Phase B is still doable**, but several path/tooling/format decisions need confirmation before we start writing code:

- **No Tailwind, no TypeScript, no Next.js, no shadcn/ui, no framer-motion, no Storybook.** The repo is **Vite + plain JSX + inline `style={{…}}`**, with two parallel hand-rolled design systems already in place (`src/design-system/` for admin, `src/design-system-v2/` for the customer dashboard). All charts in the existing dashboards are already custom SVG; only one component (`RevenueDonut`) uses `recharts`.
- **The `<GlassCard />` + cinematic primitives don't exist yet, but their analogues do.** `Card.jsx`, `KPICard.jsx`, and `AICoPilotStrip.jsx` already implement non-cinematic versions (light theme, no glassmorphism, no glow shadows). Phase B is greenfield for the foundation components, but it will need to coexist with these.
- **The cinematic palette is dark-themed** (`#0A0E27` background) while the V2 customer dashboard is **light-themed** (`#F8FAFC` background). This is the biggest open question — see Risk #1.
- **No `Insight` model in Prisma.** What exists is `CustomerDailyBrief` — a per-day, per-merchant cache that overwrites on refresh. The prompt's `Insight` model would be a new addition. Plus the prompt's `companyId` FK must be `merchantId` (no `Company` model in this schema; same conclusion as the prior discovery report).

The rest of this document is the actual audit.

---

## A.1 — Existing design system

### Stack reality vs prompt assumptions

| Prompt assumes | Repo actually has | Implication |
|---|---|---|
| `tailwind.config.ts` with custom shadow plugin | **No Tailwind.** Vite + plain JSX, all styling via inline `style={{…}}` objects | The prompt's "expose tokens as Tailwind colors" / "custom Tailwind plugin for `shadow-glow-cyan`" must be re-expressed as either: (a) a JS module exporting style objects/factories (`shadows.js` with `glowCyan(intensity)` etc.), or (b) global CSS variables + utility classes in a single hand-written stylesheet. No Tailwind plugin is possible. |
| `app/globals.css` (Next.js) | `src/index.css` (49 lines, anti-blur typography only) | Global CSS file exists but is minimal. New tokens go in a new stylesheet. |
| `lib/design/tokens.ts` | `src/design-system/colors.js` + `src/design-system-v2/{colors,animations,typography}.js` | Two hand-rolled JS systems already present. Cinematic tokens should land in a new `src/design-system-v2/cinematic/` subfolder, additive — not a replacement. |
| `components/ui/` (shadcn) | `src/components/ui.jsx` — a single 312-line file exporting `Skeleton`, `Spinner`, `Toast`, `Modal`, `Badge`, `Input`, `LineChart`, `GlobalStyles`. Uses an inline `C` color object hardcoded to a dark admin theme | This is a parallel "primitive library" but is **admin-themed (`#0f1117` bg)** and unused by `pages/v2/`. New foundation components should not extend `ui.jsx`. |
| TypeScript everywhere | Plain JSX (`.jsx` files). `package.json` has no `typescript` dep, no `tsconfig.json` exists | New components will be `.jsx` with PropTypes-style JSDoc, NOT `.tsx`. The prompt's "TypeScript prop types exported" needs to be re-read as JSDoc `@typedef` annotations. |
| Framer Motion already present | **Not installed.** Animations today are CSS keyframes + `requestAnimationFrame` (`AnimatedNumber` in `Card.jsx`, `useCountUp` in `design-system-v2/animations.js`) | Framer Motion is an explicit allowed addition per prompt § "Hard Constraints". If approved, will land in a separate dep-add commit before any component using it. |

### Existing token modules

**`src/design-system/colors.js`** — Admin design system (used by `pages/admin/*`).
- `KPI_COLORS` — 4-position positional palette (Wine `#E30A17`, Gold `#F59E0B`, Cyan `#22D3EE`, Violet `#7C3AED`)
- `ANALYTICS_COLORS` — distribution / geographic / risk / ranking themes
- `SEMANTIC` — success / warning / danger / info / ai
- `ARCHETYPE_PALETTES` — 7 sub-page archetypes (explorer, profile, console, configurator, lab, monitor, gallery)

**`src/design-system-v2/colors.js`** — Customer V2 dashboard (used by `pages/v2/*` and `components/v2/*`).
```
CUSTOMER_PALETTE = {
  bg:     { primary '#F8FAFC', secondary '#FFF', tertiary '#F1F5F9', sidebar '#0A1530', sidebarHover '#112044', inverse '#0F172A' },
  brand:  { wine '#E30A17',   wineSoft, wineBorder, wineGlow },
  accent: { cyan '#22D3EE',   cyanSoft, cyanGlow,
            violet '#7C3AED', violetSoft,
            mint '#2DD4BF',   mintSoft,
            amber '#F59E0B',  amberSoft,
            gold '#F59E0B' },
  text:   { primary '#0F172A', secondary '#475569', tertiary '#94A3B8', inverse '#F9FAFB', onSidebar, onSidebarMuted },
  border: { subtle, default, strong },
  status: { healthy '#10B981', info '#22D3EE', warning '#F59E0B', critical '#E30A17', neutral '#94A3B8' }
}
KPI_SLOT_COLORS = ['cyan', 'amber', 'mint', 'violet']
```

**`src/design-system-v2/animations.js`** — `TIMING { micro 150, short 250, medium 400, data 800, story 1200 }`, `EASING { default, energetic, decelerate, accelerate }`, `useCountUp(target, duration)` hook, `KEYFRAMES` string with `fadeInUp`, `pulse`, `drawLine`, `shimmer`.

**`src/design-system-v2/typography.js`** — `TYPE { heroNumber 36px/800, pageTitle 24px/800, sectionTitle 16px/700, body 14px/500, … }`, `SPACING { xs 4 … 4xl 48 }`, `RADIUS { sm 6 … full 9999 }`, `FONT_STACK 'Plus Jakarta Sans, Inter, …'`, `FONT_STACK_AR 'IBM Plex Sans Arabic, …'`.

### Cinematic palette comparison

The prompt's cinematic tokens overlap conceptually with `CUSTOMER_PALETTE.accent` but are **brighter, more saturated, on a dark background**:

| Prompt cinematic | Existing v2 token | Delta |
|---|---|---|
| `--color-electric-cyan #00D9FF` | `accent.cyan #22D3EE` | Cinematic is ~22% brighter / more saturated |
| `--color-plasma-violet #9D4EDD` | `accent.violet #7C3AED` | Cinematic is lighter & more pink |
| `--color-neon-mint #06FFA5` | `accent.mint #2DD4BF` | Cinematic is dramatically more neon |
| `--color-solar-amber #FFB800` | `accent.amber #F59E0B` | Close, cinematic is slightly warmer |
| `--color-crimson-glow #FF3D5A` | `brand.wine #E30A17` | Cinematic is lighter, more orange-leaning |
| `--color-deep-space #0A0E27` | `bg.sidebar #0A1530` (closest match) | The cinematic primary background is **darker than any current bg**; closest is the sidebar bg |
| `--color-pearl-white #F8FAFC` | `bg.primary #F8FAFC` | Identical (note: in cinematic, this is text on dark; in v2, this is page bg) |

**This is Risk #1 below.** The cinematic palette presupposes a dark canvas; today's V2 customer dashboard uses the same hex values but inverted (light bg, dark text). Phase B needs an explicit decision on whether the cinematic primitives:
- (a) introduce a **new dark-themed surface** layered over the existing light dashboard (e.g., AI insight cards become dark glass-morphic cards on a light page — visually striking but tonally inconsistent),
- (b) trigger a **re-skin of the entire V2 dashboard to dark mode** (much larger scope; out of D-1's stated boundaries),
- (c) the cinematic look applies **only inside `/_dev/foundation` and `/_dev/charts` showcase routes** for D-1, and integration into the live dashboard is deferred to a later sprint.

### Hardcoded color tech debt — V2 dashboard scope

`src/components/v2/`:
- `#FFFFFF` × 4
- `#F1F5F9` × 3
- `#F8FAFC` × 1
- `#22D3EE` × 1

Total: 9 hex literals across all V2 components, mostly trivial defaults (white, neutral fills). Migrating these to tokens is a one-pass cleanup. Light tech debt overall — the team has been disciplined about CUSTOMER_PALETTE.

`src/components/ui.jsx`: heavily hardcoded, but unused in V2 — flagging for archival, not for migration.

`src/components/dashboard/`: legacy admin dashboard, out of D-1 scope.

---

## A.2 — Chart inventory

### Customer V2 (`src/components/v2/charts/`)

| File | Library | Type | Data shape | Notes |
|---|---|---|---|---|
| `Sparkline.jsx` | none (custom SVG) | Mini line w/ filled area | `data: number[]` | Has draw-in animation (stroke-dashoffset). 70 LOC. **Already cinematic-feeling** — a great seed for the new Pulse Sparkline. |
| `RevenueDonut.jsx` | **recharts** (`PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Tooltip`) | Donut | `[{ name, value }]` | The only recharts user in the codebase. Mock data. |
| `CashFlowSankey.jsx` | none (custom SVG) | Sankey (3-in / 1-net / 4-out) | hardcoded `inflows[]`, `outflows[]` | Fully custom geometry, no library. |
| `InvoiceFunnel.jsx` | none (CSS animation) | Funnel | hardcoded stages | Pure CSS, no SVG. |
| `CustomerBubbleMap.jsx` | none (custom SVG) | Stylized "Turkey" bubble map | hardcoded `CITIES[]` with `cx, cy, revenue` | Not a real GIS projection — info-graphic with rough city positions. |

### Legacy Admin (`src/components/dashboard/charts/`) — 18 files

All custom SVG/React, **zero recharts usage**. Files: `AreaChart`, `BarChart`, `BulletChart`, `CalendarHeatmap`, `ConfidenceBand`, `DonutChart`, `ForceGraph`, `Gauge`, `MapHeatmap`, `PulseRings`, `RadarChart`, `SankeyDiagram`, `ScatterChart`, `Sparkline`, `StepChart`, `Sunburst`, `Treemap`, `Waterfall`. Plus an `index.js` barrel. Out of D-1 scope but useful as a reference — `PulseRings` and `Gauge` already implement effects similar to the prompt's "Pulse Sparkline" and "Holographic Donut".

### One-off

`src/components/ui.jsx` exports `<LineChart>` (admin-themed dark, custom SVG). Not used in V2.

### Implication for B.3

The existing custom-SVG style is exactly what the prompt's Phase B.3 prescribes ("custom SVG + framer-motion (no recharts)"). We're 75% of the way there architecturally. The cinematic versions in `components/charts/cinematic/` will be additive, not replacements — the legacy `dashboard/charts/` can stay where it is.

The single recharts dependency (`RevenueDonut`) can either:
- Stay (recharts is already in the bundle, in its own chunk)
- Be rewritten as `HolographicDonut` and the recharts dep removed (saves ~80 KB gzipped — tempting)

I recommend keeping recharts in for D-1 (out of scope to remove), revisiting in a later sprint.

---

## A.3 — AI brief flow & insight persistence

### Backend (recap from prior discovery doc, `zyrix-finsuite-backend/docs/finsuite-discovery-2026-05-09.md`)

- Route: `POST /api/customer/dashboard/ai-brief/refresh` and `GET /api/customer/dashboard/ai-brief?focus=&language=` (mounted in `src/index.ts:92` → `routes/customer/dashboardPrefs.ts`)
- Controller: `src/controllers/customer/aiBriefController.ts` — `getBrief` checks `CustomerDailyBrief` cache, calls `buildMerchantSnapshot` + `callGemini`, falls back to canned `FALLBACK_BRIEF` on any failure (verified yesterday)
- Persistence today: **`CustomerDailyBrief`** model — one row per `(customerUserId, briefDate)`. Stores `criticalCard`, `attentionCard`, `opportunityCard` as `Json?`, `focusArea`, `generatedAt`, `expiresAt` (next 06:00 local). **Overwrites on refresh.** No history is preserved.

### Frontend

- API client: `src/api/v2/aiBrief.js` — exports `getAIBrief(focus, language)` and `refreshAIBrief()`. Reads JWT from `localStorage.zyrix_token`.
- Renderer: `src/components/v2/dashboard/AICoPilotStrip.jsx` — three side-by-side cards (`SEVERITY_STYLE = { critical, attention, opportunity }`) with hardcoded TR/EN/AR badge labels (`KRİTİK`/`CRITICAL`/`حرج` etc.). Uses `CUSTOMER_PALETTE` tokens. Mobile: horizontal scroll-snap carousel. No glow shadows, no aurora borders, no glassmorphism — flat soft-color cards.
- Consumer page: `src/pages/v2/DashboardV2Page.jsx:120,134,230` — calls `getAIBrief` on mount + `refreshAIBrief` on user click, passes brief into `<AICoPilotStrip>`.

### What "ephemeral" means here

- Calling `refresh` invokes `prisma.customerDailyBrief.deleteMany` (today's row) → regenerates → upserts the same row. Yesterday's brief is never seen again unless manually queried.
- There is no concept of "dismissed" or "resolved" insights.
- There is no insight category, no numeric refs payload, no language attribute on the row (locale is reconstructed from the request).
- Therefore every analytical question — "what insights did this merchant get last week?", "which insights tend to be dismissed without action?", "did the warning about overdue receivables ever appear?" — is unanswerable from the current schema.

### What's required to persist

The prompt's `Insight` model is the right abstraction. Adapted to the actual schema:

```prisma
// In zyrix-finsuite-backend/prisma/schema.prisma
model Insight {
  id            String        @id @default(cuid())
  merchantId    String        // NOT companyId — schema has no Company model, only Merchant
  type          InsightType   // CRITICAL | ATTENTION | OPPORTUNITY
  category      String        // 'cash_flow' | 'customer_concentration' | 'tax' | etc.
  title         String
  body          String        @db.Text
  ctaLabel      String?
  ctaRoute      String?
  numericRefs   Json?         // KPI ids and values referenced
  language      String        // 'tr' | 'ar' | 'en'
  source        String        // 'gemini' | 'fallback' | 'manual'
  status        InsightStatus @default(ACTIVE)  // ACTIVE | DISMISSED | RESOLVED | ARCHIVED
  generatedAt   DateTime      @default(now())
  expiresAt     DateTime?
  dismissedAt   DateTime?
  resolvedAt    DateTime?
  merchant      Merchant      @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@index([merchantId, status, generatedAt])
  @@index([merchantId, type, status])
  @@map("insights")
}

enum InsightType   { CRITICAL  ATTENTION  OPPORTUNITY }
enum InsightStatus { ACTIVE    DISMISSED  RESOLVED   ARCHIVED }
```

**Coexistence with `CustomerDailyBrief`:** `CustomerDailyBrief` is a *cache* (one row, expires at 06:00, regenerated on refresh). `Insight` is a *log* (immutable rows, status transitions, indefinite history). They don't conflict — keep `CustomerDailyBrief` for the same-day cache, `Insight` for the history. The `aiBriefController` modification is additive: each generated card → one `Insight` row, plus the existing cache write. Three cards per refresh = three insight rows.

This matches the prompt's commit "feat(api): persist generated AI briefs to Insight table".

---

## A.4 — Component library inventory

### Customer V2 (`src/components/v2/`)

| File | Tokens? | Variants | Notes |
|---|---|---|---|
| `CustomerLayoutV2.jsx` | yes (CUSTOMER_PALETTE) | — | Page shell. |
| `DashboardSwitchPill.jsx` | yes | — | V1↔V2 dashboard toggle. |
| `FeatureFlagDrawer.jsx` | yes | — | Dev drawer. |
| `sidebar/SidebarV2.jsx` | yes | — | Sidebar. |
| `dashboard/AICoPilotStrip.jsx` | yes | severity (critical/attention/opportunity) | Renders the 3 AI cards. |
| `dashboard/KPICard.jsx` | yes | colorSlot (cyan/amber/mint/violet/wine, auto-promotes to wine when critical) | Hero KPI w/ animated number, sparkline, drilldown. |
| `dashboard/KPISwapDrawer.jsx` | yes | — | KPI picker. |
| `dashboard/TaxIntelligenceCalendar.jsx` | yes | — | Tax calendar widget. |
| `charts/Sparkline.jsx` | passed `color` prop | filled/unfilled | Custom SVG, draw-in animation. |
| `charts/RevenueDonut.jsx` | yes | — | Recharts donut. |
| `charts/CashFlowSankey.jsx` | yes | — | Custom Sankey. |
| `charts/InvoiceFunnel.jsx` | yes | — | CSS funnel. |
| `charts/CustomerBubbleMap.jsx` | yes | — | Stylized map. |
| `cmdk/...` | (not opened) | (cmd-k palette) | TBD. |

### Legacy dashboard (`src/components/dashboard/`)

`Card`, `ConfirmDialog`, `DataTable`, `DrawerForm`, `EmptyState`, `KpiCard`, `PageHeader`, `SkeletonScreen`, `SupportChatWidget`, `ToastSystem`. All use `dashboardPalette` resolver + admin tokens. Light theme. **Out of D-1 scope** but `Card.jsx` is a reasonable reference implementation for `<GlassCard />` (it already does animated mount + hover lift with inline styles).

### Single-file mega-module (`src/components/ui.jsx`)

312 LOC, 11 exports: `Skeleton`, `CardSkeleton`, `TableRowSkeleton`, `Spinner`, `Toast` (+ `toast()` fn + `ToastContainer`), `EmptyState`, `ErrorBanner`, `Badge`, `Modal`, `ConfirmModal`, `Input`, `LineChart`, `GlobalStyles`. Hardcoded admin-dark `C` color object (`#0f1117`, `#1a1d27`, `#6C5DD3` etc.). **Not** used by V2; appears to be an early admin-page primitive set that V2 superseded with per-component inline-styled components.

**Recommendation:** D-1's foundation components live in a fresh `src/components/foundation/` folder, *not* extending `ui.jsx`. `ui.jsx` is technical debt for a future cleanup sprint.

### What's missing (the gap Phase B fills)

The prompt's primitives — `<GlassCard />`, `<AuroraButton />`, `<NeonBadge />`, `<PulseDot />`, `<GlowRing />`, `<ParticleField />`, `<GradientMesh />` — **none exist today** in any form. The closest analogue is `Card.jsx` (light, soft-shadow, animated number) → `GlassCard` (dark, glass-morphic, glow-shadow, aurora-borderable).

---

## Discrepancies vs prompt (consolidated)

| # | Prompt assumption | Reality | Resolution |
|---|---|---|---|
| 1 | `tailwind.config.ts` + custom Tailwind plugin for `shadow-glow-*` | No Tailwind. Inline `style={{}}` + JS token modules. | Phase B.1 ships `src/design-system-v2/cinematic/{tokens.js, shadows.js, gradients.js}` — JS factories that produce `box-shadow` strings and gradient CSS. Plus a CSS variables file `src/styles/cinematic.css` for runtime use. No Tailwind plugin. |
| 2 | Next.js conventions (`app/globals.css`, file-based `/_dev/foundation` routing) | Vite + react-router-dom v6 with code-split lazy routes | Phase B routes are added to `src/App.jsx` as `<Route path="/v2/_dev/foundation" element={<FoundationShowcase />} />` and `/v2/_dev/charts`. Gated by a feature flag (existing `FeatureFlagsProvider`). |
| 3 | TypeScript with exported prop types | Plain JSX, no TS dep, no tsconfig | New components are `.jsx` with JSDoc `@typedef` + `@param` annotations. **No** new TS introduction in D-1. |
| 4 | `components/ui/` shadcn-style primitives | `src/components/ui.jsx` mega-file (admin-dark, unused in V2) | New foundation components land in `src/components/foundation/`. `ui.jsx` is left alone. |
| 5 | Framer Motion already a dep | Not installed | Add as the first commit of Phase B.1 (allowed by prompt's "Hard Constraints"). |
| 6 | `Insight` model with `companyId` FK | No `Company` model — only `Merchant`; `customerUserId` is the merchant.id | Migration uses `merchantId` instead, mapped to existing `Merchant`. |
| 7 | `CustomerDailyBrief` history is what the prompt would call "ephemeral" | Confirmed — overwrites on refresh, expires at 06:00 | New `Insight` model coexists; cache stays. Controller writes one Insight row per card per generation. |
| 8 | Dashboard is dark cinematic by default | V2 dashboard is light-themed (bg `#F8FAFC`) | **See Risk #1 — needs explicit decision.** |
| 9 | Custom Tailwind shadow utilities (`shadow-glow-cyan`) | n/a | Replaced with `shadows.glowCyan(intensity)` JS factory. Output is a multi-layer `box-shadow` string. |
| 10 | "Storybook-style demo page" (no Storybook dep) | No Storybook tooling at all | A pair of plain React showcase pages mounted at `/v2/_dev/foundation` and `/v2/_dev/charts`, gated by feature flag. |

---

## A.5 — Proposed Phase B file structure

### Frontend (`zyrix-finsuite/`)

```
src/
├── design-system-v2/
│   └── cinematic/
│       ├── tokens.js           # all cinematic color/spacing/timing constants
│       ├── shadows.js          # JS factories: glowCyan(i), aurora(), etc.
│       ├── gradients.js        # gradient mesh / aurora gradient builders
│       └── index.js            # re-exports
├── styles/
│   └── cinematic.css           # CSS variables + @keyframes for aurora/drift/heartbeat
├── components/
│   ├── foundation/
│   │   ├── GlassCard.jsx
│   │   ├── AuroraButton.jsx
│   │   ├── NeonBadge.jsx
│   │   ├── PulseDot.jsx
│   │   ├── GlowRing.jsx
│   │   ├── ParticleField.jsx
│   │   ├── GradientMesh.jsx
│   │   └── index.js
│   └── charts/
│       └── cinematic/
│           ├── AuroraChart.jsx
│           ├── LiquidKPICard.jsx
│           ├── PulseSparkline.jsx
│           ├── HolographicDonut.jsx
│           ├── FlowStream.jsx
│           ├── ConstellationMap.jsx
│           ├── AIInsightCard.jsx
│           ├── ConstellationKPIGrid.jsx
│           └── index.js
├── pages/
│   └── v2/
│       └── _dev/
│           ├── FoundationShowcase.jsx   # /v2/_dev/foundation
│           └── ChartsShowcase.jsx       # /v2/_dev/charts
├── api/
│   └── v2/
│       └── insights.js                  # getInsightHistory, patchInsightStatus
└── hooks/
    └── v2/
        └── useInsightHistory.js         # the hook
```

### Backend (`zyrix-finsuite-backend/`)

```
prisma/
└── schema.prisma                        # Insight model + InsightType + InsightStatus enums (additive migration)

src/
├── controllers/
│   └── customer/
│       └── aiBriefController.ts         # MINIMAL edit: write 3 Insight rows per generation
├── controllers/
│   └── customer/
│       └── insightController.ts         # NEW — history + status PATCH
└── routes/
    └── customer/
        └── insights.ts                  # NEW — GET /history, PATCH /:id
```

The `aiBriefController.ts` change is **storage-only** — no Gemini/snapshot/sanitize logic touched, per the hard constraint.

### Commit plan (per the prompt's strategy, adapted)

```
chore(deps): add framer-motion          # B.1.0 — allowed addition, separate so it's reviewable
feat(design): cinematic tokens module   # B.1 — tokens.js, shadows.js, gradients.js, cinematic.css
feat(foundation): GlassCard component   # B.2.a
feat(foundation): AuroraButton          # B.2.b
feat(foundation): NeonBadge             # B.2.c
feat(foundation): PulseDot + GlowRing   # B.2.d  (small, paired)
feat(foundation): ParticleField         # B.2.e
feat(foundation): GradientMesh          # B.2.f
feat(foundation): /v2/_dev/foundation showcase route
feat(charts): AuroraChart               # B.3.a
feat(charts): LiquidKPICard             # B.3.b
feat(charts): PulseSparkline            # B.3.c
feat(charts): HolographicDonut          # B.3.d
feat(charts): FlowStream                # B.3.e
feat(charts): ConstellationMap          # B.3.f
feat(charts): AIInsightCard             # B.3.g
feat(charts): ConstellationKPIGrid      # B.3.h
feat(charts): /v2/_dev/charts showcase route
feat(db): Insight model migration       # B.4 (BACKEND)
feat(api): persist briefs to Insight table   (BACKEND)
feat(api): insight history GET endpoint      (BACKEND)
feat(api): insight status PATCH endpoint     (BACKEND)
feat(api): frontend insight client + hook    (FRONTEND)
docs(ai-copilot): Sprint D-1 completion report
```

Total: ~25 commits across two repos. Maps cleanly to the prompt's commit list.

---

## Risk register (needs Mehmet's input before Phase B)

### Risk #1 — Cinematic dark vs existing light theme **(blocking decision)**

The cinematic palette assumes a dark background (`#0A0E27`); the live V2 dashboard uses a light background (`#F8FAFC`). Three resolutions:

- **(a) Cinematic surfaces on light pages.** `GlassCard` and chart components self-render dark surfaces, sitting on the light page like a "cinema screen." Visually striking, but tonally inconsistent with the rest of the page. Lower scope; D-1 ships as designed.
- **(b) Re-skin V2 to dark mode.** Largest scope — every page, every existing component, plus locale-specific contrast checks. Not a D-1 sprint task; would derail the schedule.
- **(c) Cinematic stays on `/v2/_dev/foundation` and `/v2/_dev/charts` only for D-1.** Showcase routes display the new system in its native dark theme; integration into the live dashboard is a follow-up sprint with an explicit theming pass.

**My recommendation: (c) for D-1, with (a) reserved for incremental rollout in D-2+** — the AI Insight Cards in `AICoPilotStrip` could be the first "cinematic surface" on a light page, since they're already visually distinct.

### Risk #2 — Framer Motion bundle cost vs the 80 KB performance budget

Framer Motion adds **~30-40 KB gzipped** (depends on tree-shaking and which APIs you import). The prompt's budget is 80 KB total for D-1. If we use:
- only `motion.div`, `useSpring`, basic transitions → ~25-30 KB
- the full `LayoutGroup`, `AnimatePresence`, drag system → ~45-50 KB

**My recommendation:** narrow imports (`framer-motion/dist/es/render`, or just the main `motion`) and avoid `AnimatePresence` for D-1. We can revisit as the chart components are built.

Alternative — **build without Framer Motion entirely**, using `useSpring` from React Spring (same author, ~12 KB) or rolling our own spring-easing helpers on top of `requestAnimationFrame` (which the codebase already does — see `useCountUp` in `design-system-v2/animations.js`). This keeps the budget completely free.

### Risk #3 — `companyId` → `merchantId` in Insight model

The prompt's `Insight` Prisma block assumes a `Company` model with `companyId` FK. The schema only has `Merchant`. **Resolution:** rename to `merchantId String` with `Merchant` relation, matching how `CustomerDailyBrief.customerUserId` is wired today. No actual change in semantics; just nomenclature alignment with the rest of the codebase.

### Risk #4 — TypeScript expectations across the prompt

The prompt repeatedly references `lib/design/tokens.ts`, `tailwind.config.ts`, "TypeScript prop types exported", JSDoc-as-typedoc. The repo is plain JSX. **My approach for D-1:** plain JSX with rich JSDoc (`@typedef`, `@param`, `@returns`). This is consistent with the rest of the codebase; introducing TypeScript would require setup work that isn't in scope here.

If the long-term direction is "we'd like to migrate to TypeScript anyway," then a future sprint should be dedicated to that conversion — not D-1.

### Risk #5 — Custom Tailwind shadow utilities

Without Tailwind, the prompt's "`shadow-glow-cyan`, `shadow-glow-violet`, …" cannot be className utilities. **Replacement:** a JS module `shadows.js` with named factories:

```js
import { glowCyan, glowViolet, aurora } from '@/design-system-v2/cinematic/shadows';

<div style={{ boxShadow: glowCyan(2) }} />     // intensity 1-3
<div style={{ boxShadow: aurora() }} />        // animated multi-layer
```

The output is a multi-layer `box-shadow` string. Same effect as the proposed Tailwind utilities, just consumed via inline style instead of className.

### Risk #6 — `<GradientMesh />` "no JS, CSS-only" + multi-locale RTL

The prompt asks for slow-drift CSS animations. CSS-only is fine, but: in RTL mode (Arabic locale), `transform: translate(x, y)` directions get visually flipped only if we use logical properties. **Resolution:** use `inset-block-start` / `inset-inline-start` for positioning where possible, and avoid bidirectional `transform` semantics. Trivial to handle but worth flagging.

### Risk #7 — Existing one recharts user (`RevenueDonut`)

The prompt's Phase B.3 builds a `HolographicDonut`. If we deprecate `RevenueDonut` and remove recharts, we save ~80 KB gzipped — this would more than cover Framer Motion's cost in Risk #2. Out of D-1 scope to remove a dep, but worth flagging — Phase B.3's `HolographicDonut` is the natural replacement.

---

## Open questions for explicit approval before Phase B

1. **Risk #1 resolution** — pick (a), (b), or (c). I recommend (c) for D-1.
2. **Risk #2 resolution** — Framer Motion (narrow imports), or roll-our-own spring helpers? Recommend Framer Motion if budget allows; reassess after Risk #1 is settled.
3. **Risk #4 resolution** — confirm plain JSX + JSDoc is acceptable for D-1 (no TS introduction).
4. **Risk #6 / locale** — confirm `tr` + `ar` + `en` translations are still the locale set. The existing `AICoPilotStrip` already handles all three; assume yes unless you say otherwise.
5. **Insight model location** — confirm `merchantId` (not `companyId`) is the correct FK for the new Insight model. Recommended.

Once approved, Phase B proceeds autonomously through the commit plan above.

---

## Files read during this audit

Frontend:
- `package.json`, `vite.config.js`, `src/index.css`
- `src/design-system/colors.js`
- `src/design-system-v2/{colors,animations,typography}.js`
- `src/components/ui.jsx`
- `src/components/dashboard/Card.jsx` (reference)
- `src/components/v2/dashboard/AICoPilotStrip.jsx`
- `src/components/v2/dashboard/KPICard.jsx`
- `src/components/v2/charts/{Sparkline,RevenueDonut,CashFlowSankey,InvoiceFunnel,CustomerBubbleMap}.jsx`
- `src/api/v2/aiBrief.js`
- `src/App.jsx` (route imports + V2 mount)
- Directory listings for `src/components/`, `src/components/v2/`, `src/components/dashboard/`, `src/pages/`, `src/pages/v2/`, `src/pages/dashboard/`, `src/pages/admin/`, `src/styles/`, `src/theme/`

Backend (referenced from prior discovery):
- `prisma/schema.prisma`
- `src/controllers/customer/aiBriefController.ts`
- `src/services/customer/{kpiComputations,merchantSnapshot}.ts`
- `src/routes/customer/dashboardPrefs.ts`, `src/routes/auth.ts`, `src/index.ts`
