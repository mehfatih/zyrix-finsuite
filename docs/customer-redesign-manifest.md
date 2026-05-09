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

## Deviations from Prompt 1 spec
- **Prisma client import path**: spec used `'../../lib/prisma'`; this codebase uses `'../../config/database'`. Followed the codebase.
- **Customer auth middleware**: spec used `authMiddleware` reading `req.user.userId`; this codebase uses `authenticate` reading `req.merchant.id`. Followed the codebase.
- **Pill placement**: spec said "next to the PRODUCTION badge in the customer header"; that badge actually lives in `AdminTopBar.jsx` (admin-only). Per user direction, mounted as a top-right floating pill on `/dashboard` and `/v2/dashboard` only.
- **Animations.js useCountUp hook**: spec used a conditional `require('react')` for SSR safety; rewrote with standard ESM imports and `useState`/`useEffect` since this is a client-only Vite app.
- **Response envelope**: spec used `{ ok: true, ... }`; aligned with the rest of this codebase's `{ success: true, data: { ... } }`.
