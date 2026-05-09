# Customer Redesign — File Manifest (Prompt 1)

## Frontend (zyrix-finsuite, branch: feature/customer-redesign)
- `docs/customer-dashboard-bible.md` (new)
- `docs/customer-redesign-manifest.md` (this file)
- `src/design-system-v2/colors.js` (new)
- `src/design-system-v2/animations.js` (new)
- `src/design-system-v2/typography.js` (new)
- `src/contexts/FeatureFlagsContext.jsx` (new)
- `src/components/v2/FeatureFlagDrawer.jsx` (new)
- `src/components/v2/DashboardSwitchPill.jsx` (new — top-right floating pill, only visible on /dashboard or /v2/dashboard)
- `src/pages/v2/DashboardV2Page.jsx` (new placeholder)
- `src/api/v2/dashboardPreferences.js` (new)

## Frontend (touched, not redesigned)
- `src/App.jsx`: wrapped existing app with `<FeatureFlagsProvider>`; rendered `<DashboardSwitchPill />` and `<FeatureFlagDrawer />` next to `<ImpersonationBanner />`; added `/v2/dashboard` route alongside the existing `/dashboard/*`.

## Backend (zyrix-finsuite-backend, branch: feature/customer-redesign)
- `prisma/schema.prisma`: added `CustomerDashboardPreference` and `CustomerDailyBrief` models (mapped to `customer_dashboard_preferences` and `customer_daily_brief` tables).
- `src/controllers/customer/customerDashboardPrefsController.ts` (new): `getPreferences`, `updatePreferences`, `listAvailableKpis`. Reads `req.merchant.id` from the standard `authenticate` middleware.
- `src/routes/customer/dashboardPrefs.ts` (new): `GET /preferences`, `PATCH /preferences`, `GET /preferences/kpis`.
- `src/index.ts`: mounted router at `app.use('/api/customer/dashboard', customerDashboardPrefsRoutes)`.

## Database (Railway Postgres — manual SQL on the user)
The user runs the following in Railway → Postgres → Database → Query:

```sql
CREATE TABLE IF NOT EXISTS "customer_dashboard_preferences" (
  "id"                   TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerUserId"       TEXT NOT NULL,
  "kpiSlots"             JSONB NOT NULL DEFAULT '["mrr","cash_runway","customer_health_pct","tax_burden"]'::jsonb,
  "aiCoPilotFocus"       TEXT NOT NULL DEFAULT 'all',
  "sidebarCollapsed"     JSONB NOT NULL DEFAULT '{}'::jsonb,
  "language"             TEXT NOT NULL DEFAULT 'tr',
  "role"                 TEXT,
  "createdAt"            TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "customer_dashboard_preferences_user_unique" UNIQUE ("customerUserId")
);

CREATE INDEX IF NOT EXISTS "customer_dashboard_preferences_customer_idx"
  ON "customer_dashboard_preferences"("customerUserId");

CREATE TABLE IF NOT EXISTS "customer_daily_brief" (
  "id"                  TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerUserId"      TEXT NOT NULL,
  "briefDate"           DATE NOT NULL,
  "criticalCard"        JSONB,
  "attentionCard"       JSONB,
  "opportunityCard"     JSONB,
  "focusArea"           TEXT NOT NULL DEFAULT 'all',
  "generatedAt"         TIMESTAMP NOT NULL DEFAULT now(),
  "expiresAt"           TIMESTAMP NOT NULL,
  CONSTRAINT "customer_daily_brief_user_date_unique" UNIQUE ("customerUserId", "briefDate")
);

CREATE INDEX IF NOT EXISTS "customer_daily_brief_customer_idx"
  ON "customer_daily_brief"("customerUserId", "briefDate");

CREATE INDEX IF NOT EXISTS "customer_daily_brief_expires_idx"
  ON "customer_daily_brief"("expiresAt");
```

Verify after running:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'customer_dashboard_preferences' ORDER BY ordinal_position;
```

## Feature flags introduced
- `customerDashboardV2` (off)
- `newSidebarV2` (off)
- `cmdKPalette` (off)
- `aiCoPilotStrip` (off)
- `customizableKpis` (off)
- `taxIntelligenceCal` (off)
- `universalUndo` (off)

All flags default OFF. The legacy `/dashboard` works exactly as before. Nothing user-visible changes until the user explicitly enables a flag via the violet gear at bottom-left, or clicks the "Yeni Panoyu Dene" pill at top-right.

## Prompt 2 additions

### Frontend (zyrix-finsuite, branch: feature/customer-redesign)
- `src/config/v2/sidebarRegistry.js` (registry + flat list + legacy redirects)
- `src/components/v2/sidebar/SidebarV2.jsx` (premium navy 3-tier sidebar)
- `src/components/v2/cmdk/CommandPalette.jsx` (Cmd+K modal — parses `data.suggestion` envelope)
- `src/contexts/CmdKContext.jsx` (provider + global ⌘K listener, lazy-mounts the modal)
- `src/components/v2/CustomerLayoutV2.jsx` (sidebar + main wrapper, gated by `newSidebarV2` flag)
- Touched: `src/pages/v2/DashboardV2Page.jsx` — now wraps content in `CustomerLayoutV2`, hydrates user from `zyrix_user` localStorage, signs out by clearing `zyrix_token` + `zyrix_user`.
- Touched: `src/App.jsx` — wrapped existing tree with `<CmdKProvider>` between `FeatureFlagsProvider` and `BrowserRouter`.

### Backend (zyrix-finsuite-backend, branch: feature/customer-redesign)
- `src/controllers/customer/cmdkController.ts` (Gemini 2.0 Flash intent classifier; uses `req.merchant.id`; returns `{ success: true, data: { suggestion } }`; 4s timeout with graceful null fallback).
- `src/routes/customer/cmdk.ts` (`POST /cmdk-intent` behind the standard `authenticate` middleware).
- Touched: `src/index.ts` — mounted at `app.use('/api/customer', customerCmdkRoutes)` so the final URL is `POST /api/customer/cmdk-intent`.

### Feature flags now functional
- `newSidebarV2` — when ON, V2 pages render the new navy sidebar via `CustomerLayoutV2`.
- `cmdKPalette` — Cmd+K listener is always-on globally once the provider mounts; the toggle is informational for now (no UI hides it).

### Behavioral changes
- New keyboard shortcut: ⌘K / Ctrl+K opens command palette globally (lazy-mounts on first use).
- `/v2/dashboard` renders the new layout when `customerDashboardV2` + `newSidebarV2` are both ON.
- Legacy entries (Faturalar/E-Fatura/Bankalar/Çek/Stok eski) hidden from sidebar but discoverable in Cmd+K with `→ <new route>` hint.

### Prompt 2 deviations from spec
- **Customer token storage**: spec read `customerToken` / `token`; this codebase actually uses `zyrix_token` (and `zyrix_user`). Frontend reads `zyrix_token` first, falls back to the legacy keys.
- **Backend response envelope**: spec returned `{ ok: true, suggestion }`; aligned with project convention `{ success: true, data: { suggestion } }`. Frontend parses `json.data.suggestion`.
- **Customer auth middleware**: spec referenced `authMiddleware`; used the actual `authenticate` from `src/middleware/auth.ts` consistent with Prompt 1.
- **Gemini API key**: read from `env.geminiApiKey` (existing wrapper) instead of `process.env.GEMINI_API_KEY` directly.
- **Emoji removal in palette section header**: dropped the ✨ from "AI ÖNERİSİ" section title to match Bible §11 (Lucide icons in chrome, no emojis). The Sparkles icon next to the row already conveys AI.

## Prompt 3 additions

### Frontend (zyrix-finsuite, branch: feature/customer-redesign)
- `src/config/v2/kpiLibrary.js` — 25 KPIs with formatters, labels, drill routes, critical thresholds.
- `src/hooks/v2/useCountUp.js` — ease-out cubic count-up hook.
- `src/components/v2/charts/Sparkline.jsx` — animated SVG sparkline (left-to-right draw).
- `src/components/v2/charts/RevenueDonut.jsx` — Recharts pie + tier bars (centripetal).
- `src/components/v2/charts/CashFlowSankey.jsx` — custom SVG, 3 inflows → net → 4 outflows (left-to-right).
- `src/components/v2/charts/CustomerBubbleMap.jsx` — stylized Turkey map, bubbles by city revenue (multi-directional).
- `src/components/v2/charts/InvoiceFunnel.jsx` — stage-by-stage animated funnel with conversion rates (top-to-bottom).
- `src/components/v2/dashboard/KPICard.jsx` — hero card with count-up + sparkline + drill-down + slot edit.
- `src/components/v2/dashboard/KPISwapDrawer.jsx` — 4-slot picker × 4-category KPI library, click-to-swap.
- `src/components/v2/dashboard/AICoPilotStrip.jsx` — 3 daily cards (critical/attention/opportunity) with skeleton loaders.
- `src/components/v2/dashboard/TaxIntelligenceCalendar.jsx` — month view with mint/amber/wine/gray cash-readiness chips, hover tooltip with AI suggestion.
- `src/contexts/UndoContext.jsx` — global UndoProvider with bottom-center toast stack (last 3, 30s auto-dismiss, countdown progress bar).
- `src/api/v2/kpiData.js` — mock KPI fetcher (swap for backend KPI endpoint when available).
- `src/api/v2/aiBrief.js` — `getAIBrief` / `refreshAIBrief` — parses `data.brief` envelope, reads `zyrix_token`.
- Replaced: `src/pages/v2/DashboardV2Page.jsx` — full Pano with greeting, KPIs, AI strip, 4 charts, tax calendar.
- Touched: `src/App.jsx` — wrapped existing tree with `<UndoProvider>` between `CmdKProvider` and `BrowserRouter`.

### Backend (zyrix-finsuite-backend, branch: feature/customer-redesign)
- `src/controllers/customer/aiBriefController.ts` — Gemini 2.0 Flash brief generator with daily cache.
- Touched: `src/routes/customer/dashboardPrefs.ts` — added `GET /ai-brief` and `POST /ai-brief/refresh` behind `authenticate`.

### Final URL surface (added in Prompt 3)
- `GET  /api/customer/dashboard/ai-brief?focus=&language=`
- `POST /api/customer/dashboard/ai-brief/refresh`

### Pano composition (Bible §3-§6 / §9)
- 4 KPIs (positional, customizable, animated count-up + sparkline, critical → wine override)
- AI Co-Pilot Strip (3 cards, Gemini-cached daily, refresh button, fallback if Gemini unavailable)
- 4 distinct chart shapes:
  - Donut + tier bars (centripetal)
  - Custom Sankey (left → right)
  - Bubble map (multi-directional)
  - Animated funnel (top → bottom)
- Tax Intelligence Calendar (mint/amber/wine/gray chips by cash readiness)
- KPI Swap Drawer (click slot → pick from 25 KPI library across 4 categories)
- Universal Undo (30-second toast with countdown progress bar)

### Behavioral changes
- `/v2/dashboard` now renders the full Pano when `customerDashboardV2` + dependent flags ON.
- KPI changes go through Universal Undo so the user always has 30s to reverse.
- AI brief generates lazily, caches per-customer per-day in `customer_daily_brief`, expires at next 6am.

### Prompt 3 deviations from spec
- **Backend prisma client import**: spec used `'../../lib/prisma'`; this codebase uses `'../../config/database'` (consistent with Prompts 1 + 2).
- **Customer auth middleware**: spec referenced `req.user.userId` and helper functions `unauthorized()`/`badRequest()`; used the actual `authenticate` middleware which attaches `req.merchant.id`, and inlined error responses with `res.status(...).json(...)` since this codebase has no error helper module.
- **Backend response envelope**: spec returned `{ ok: true, brief, cached?, fallback? }`; aligned to project convention `{ success: true, data: { brief, cached, fallback } }`. Frontend client parses `json.data.brief`.
- **Gemini API key**: read from `env.geminiApiKey` (existing wrapper) rather than `process.env.GEMINI_API_KEY` direct.
- **Customer token storage**: spec read `customerToken` / `token`; frontend reads `zyrix_token` first (this codebase's actual key from `AuthContext`), with the legacy keys as fallback.
- **User profile hydration**: spec read `customerUser` / `user` from localStorage; uses `zyrix_user` (the actual key written by `AuthContext`).
- **Sign-out keys**: spec cleared `customerToken` / `customerUser`; clears `zyrix_token` / `zyrix_user`.
- **Section header emoji**: dropped the ✨ from the AI Co-Pilot Strip section header (Bible §11 — Lucide-only chrome). The Sparkles icon already conveys AI.
- **Brief on AI failure**: when Gemini fails entirely (timeout / parse error / quota), the GET endpoint returns `200` with the canned fallback brief (still wrapped in `success: true`) so the UI never shows a broken state. Spec used `next(err)` which would have surfaced a 500.
- **Counter-tick re-render**: `UndoContext.jsx` calls a no-op `forceTick` setter every second so the countdown progress bar reflects elapsed time without each consumer needing its own clock.

## Deviations from Prompt 1 spec
- **Prisma client import path**: spec used `'../../lib/prisma'`; this codebase uses `'../../config/database'`. Followed the codebase.
- **Customer auth middleware**: spec used `authMiddleware` reading `req.user.userId`; this codebase uses `authenticate` reading `req.merchant.id`. Followed the codebase.
- **Pill placement**: spec said "next to the PRODUCTION badge in the customer header"; that badge actually lives in `AdminTopBar.jsx` (admin-only). Per user direction, mounted as a top-right floating pill on `/dashboard` and `/v2/dashboard` only.
- **Animations.js useCountUp hook**: spec used a conditional `require('react')` for SSR safety; rewrote with standard ESM imports and `useState`/`useEffect` since this is a client-only Vite app.
- **Response envelope**: spec used `{ ok: true, ... }`; aligned with the rest of this codebase's `{ success: true, data: { ... } }`.

## Prompt 4 patch — V2 sidebar route reconciliation

Audited V2 `sidebarRegistry.js` against the actual router on 2026-05-09. Of
55 original entries: 1 KEEP, 43 REDIRECT to `/dashboard`, 11 hub-level HIDE
(covering 35 children + 2 single-route hubs).

### Tier 1 — REDIRECT (43)
All children of Satış / Alış / Müşteriler / Nakit & Banka / E-Fatura & Vergi /
Stok & Ürün / Raporlar now point to `/dashboard`. The legacy CustomerDashboard
shell renders, so no 404 — but each click currently lands on the dashboard
home rather than the originally-intended sub-page. A future prompt will
teach CustomerDashboard.jsx to read URL → internal `page` state and re-point
these to their real targets.

### Tier 2 — HIDE entire hubs (Zekâ)
- ai-copilot, tahminler, musteri-dna, risk-saglik, sesli-iletisim
The underlying features are mostly implemented inside CustomerDashboard but
are not URL-addressable. Per patch guidance for Tier 2 ai-flagged entries,
HIDE rather than dead-link. Re-enable when URL routing is wired.

### Tier 3 — HIDE entire hubs (Büyüme)
- pazar-yeri, ekosistem, capital, universite

### Code changes
- `src/config/v2/sidebarRegistry.js`: Tier 1 child `route` fields rewritten
  to `/dashboard`; `hidden: true` on all Tier 2/3 hubs and 2 single-route
  hubs (capital, universite); `flattenSidebar()` now skips hidden entries.
- `src/components/v2/sidebar/SidebarV2.jsx`: tier-level filter drops hidden
  hubs and hubs whose children are all hidden; `Hub` child loop filters
  hidden children.

### User-facing rule
The V2 sidebar now never offers a click that 404s. Only the OPERASYON tier
is visible until URL routing is implemented for the AI/Growth tiers.

## Prompt 5 — Real KPI data

### Backend (zyrix-finsuite-backend, branch: main)
- `src/services/customer/kpiComputations.ts` (new — 12 real KPI computations + registry)
- `src/controllers/customer/kpiValuesController.ts` (new)
- Touched: `src/routes/customer/dashboardPrefs.ts` (added `GET /kpi-values`)

### Frontend (zyrix-finsuite, branch: main)
- Touched: `src/api/v2/kpiData.js` (mock body replaced with real fetch)

### Schema mapping (real → spec placeholders)
- `Invoice.totalAmount` → **`Invoice.total`**
- `Invoice.paidAt` → **`Invoice.paidDate`**
- `Invoice.customerId` (FK) → **not present** — `top_customer_revenue` groups by `customerName` (string)
- `Customer.status` → **not present** — no filter applied; ARPU and ai/health KPIs use total customer count
- `Customer.lifetime` → **`Customer.totalSpent`** (aggregate field)
- `Expense.incurredAt` → **`Expense.date`**
- `PurchaseInvoice` → **not present** — `Expense` used as COGS proxy for `gross_margin`
- `CashAccount.balance` → **derived** from sum(BankTransaction IN) − sum(BankTransaction OUT)
- `TaxObligation` → **`TaxEvent`** with `isSubmitted: false` filter (no status enum)
- `unauthorized()` / `badRequest()` helpers → **not present** — inline `res.status().json()`

### KPIs computed from real data (12)
`mrr`, `mrr_growth_pct`, `top_customer_revenue`, `arpu`, `gross_margin`,
`new_customers_30d`, `cash_balance`, `cash_runway`, `overdue_receivables`,
`pending_invoices`, `customer_health_pct`, `tax_burden`

### KPIs returning EMPTY
- **`payable_30d`** — no `PurchaseInvoice` model and `Expense` lacks `dueDate`/`status`
- `churn_rate`, `nrr` — no subscription analytics for merchants's customers
- `ai_actions_taken_today`, `predictions_accuracy_30d`, `automation_savings_hours` — no AI ops log
- `crisis_risk_score`, `hidden_cash_found_30d` — no risk/intelligence model
- `inventory_turnover`, `service_utilization` — no operations metrics
- `kdv_load`, `vat_load`, `zatca_compliance` — placeholder until detailed tax computations land

### Perf
Typical 4-KPI request fans out via `Promise.all` to 4 parallel queries. Read-only. No new indexes — existing FK indexes on `merchantId` cover the queries.

### Safety guarantees
- Read-only — no mutations
- Per-KPI try/catch — single failure returns EMPTY for that id, never breaks the response
- Frontend coerces `null`/missing → `0` so cards render zeros instead of crashing
- Token: frontend tries `zyrix_token` (codebase actual) → `customerToken` → `token` (legacy fallbacks)

## Prompt 7 — Mobile polish for V2

### Frontend
- `src/hooks/v2/useIsMobile.js` (new — viewport hook with `useViewport()` and default `useIsMobile()` export)
- 13 components updated with viewport branching:
  - `src/components/v2/sidebar/SidebarV2.jsx` — early-return mobile branch with hamburger trigger + off-canvas drawer
  - `src/components/v2/CustomerLayoutV2.jsx` — `paddingTop: 64px` on mobile main
  - `src/pages/v2/DashboardV2Page.jsx` — `clamp(16px, 4vw, 28px)` padding; KPI grid uses `min(100
## Prompt 7 — Mobile polish for V2

### Frontend
- src/hooks/v2/useIsMobile.js (new — viewport hook with useViewport() and default useIsMobile() export)
- 13 components updated with viewport branching:
  - src/components/v2/sidebar/SidebarV2.jsx — early-return mobile branch with hamburger trigger + off-canvas drawer
  - src/components/v2/CustomerLayoutV2.jsx — paddingTop: 64px on mobile main
  - src/pages/v2/DashboardV2Page.jsx — clamp(16px, 4vw, 28px) padding; KPI grid uses min(100%, 240px); charts grid uses min(100%, 380px)
  - src/components/v2/dashboard/AICoPilotStrip.jsx — horizontal swipe carousel on mobile (flex + scroll-snap), grid on desktop
  - src/components/v2/dashboard/KPISwapDrawer.jsx — full-screen on mobile, slot picker becomes horizontal scroller, library cards stack 1-column
  - src/components/v2/cmdk/CommandPalette.jsx — modal sits at top:4vh, full-width minus 4vw insets, input font 16px on mobile (iOS zoom-on-focus prevention)
  - src/components/v2/DashboardSwitchPill.jsx — minHeight 44px on mobile (tap target)
  - src/components/v2/FeatureFlagDrawer.jsx — gear bumped to 48x48 on mobile (44 on desktop unchanged)
  - src/contexts/UndoContext.jsx — toast width clamped to min(320px, calc(100vw - 32px)) and maxWidth: calc(100vw - 32px)
  - src/components/v2/charts/RevenueDonut.jsx — donut + list stack vertically on mobile
  - src/components/v2/charts/CashFlowSankey.jsx — wrapped in horizontal scroller, SVG minWidth: 480px
  - src/components/v2/charts/CustomerBubbleMap.jsx — same horizontal scroller pattern
  - src/components/v2/charts/InvoiceFunnel.jsx — stage-label width 60px on mobile (was 76px), added flex-shrink: 0
  - src/components/v2/dashboard/TaxIntelligenceCalendar.jsx — colored dot instead of type code on mobile, onClick opens tooltip (was hover-only)

### Behavioral changes (mobile <768px only)
- Sidebar to off-canvas drawer triggered by top-left hamburger; backdrop dismisses; body scroll locked while open; auto-close on route change
- KPI cards stack 1-column at narrow widths
- Charts stack 1-column; Sankey + Bubble Map scroll horizontally inside their cards
- AI Co-Pilot becomes swipe carousel with snap-to-start; cards take 86vw
- KPI swap drawer goes full-screen; slot picker becomes horizontal scroller above library list
- Cmd+K modal goes near-full-width with iOS-zoom-safe 16px input font
- Tax Calendar shows colored dots instead of type codes; tap to open tooltip
- All tap targets >=44px
- Undo toast clamped to viewport - 32px

### Skipped from spec
- Step 9.3 swipe-to-dismiss bonus on undo toast (X button covers it)

### Tested viewports
- iPhone SE (375x667), Pixel 5 (393x851), iPad Mini (768x1024), iPad Pro (1024x1366), 1920x1080 desktop

### No new dependencies. Desktop layout at >=1024px remains pixel-identical.
