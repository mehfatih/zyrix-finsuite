# Sprint D-5 — Daily AI Briefing Email Digest: Completion Report

**Date:** 2026-05-10
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **CODE COMPLETE — Phase A discovery + Phase B implementation shipped end-to-end**
**Awaiting:** Railway cron registration for `POST /api/cron/morning-brief-tick` (15-min interval) + production verification of the first scheduled send.

---

## TL;DR

The full daily AI briefing email pipeline shipped in 13 commits (1 discovery + 12 implementation). The cron is **dormant in production** until the Railway dashboard registers the `morning-brief-tick` endpoint — by design, so no merchant gets surprise email until you flip it on.

End-to-end paths now live:

- **Schedule** — `/api/cron/morning-brief-tick` (gated by `x-cron-secret`); finds enabled subscriptions whose merchant-local hour matches `sendHourLocal`, honors frequency rules + 23-hour double-fire guard.
- **Generate** — Reads today's cached brief from `customer_daily_brief`; on cache miss, mints a 5-min merchant JWT and HTTP-loopbacks to `/api/customer/dashboard/ai-brief/refresh` (decision §6.E in the discovery doc; **`aiBriefController.ts` and `merchantSnapshot.ts` were not modified**).
- **Render** — Pure-CSS gradient mesh header (no `@vercel/og`, no `node-canvas`), three severity cards, 2×2 KPI grid, signed-JWT unsubscribe URL, List-Unsubscribe RFC 8058 headers, TR/EN/AR with `dir="rtl"` for Arabic. Final size ~14 KB.
- **Track** — Resend webhook (D-4) extended to fall through to `MorningBriefSend` after `InsightShare` misses; updates delivered/opened/clicked timestamps; auto-disables subscriptions on 3 hard bounces and writes an `AdminNotification`.
- **Manage** — Customer-side panel inside `/settings/notifications` (enabled toggle, frequency, weekly day, send hour, timezone display, "send a test" button, 30-day stats); public `/unsubscribe` page with reasons checkboxes + 3 actions (pause 30d / weekly / unsubscribe).
- **Observe** — `/admin/ops/email-engagement` shows aggregate / per-locale / top-subjects / bounced list with one-click re-enable.

Decisions §6.A–6.E from the Phase A discovery doc were honored without modification.

---

## What landed (Phase B execution log)

### Backend (`zyrix-finsuite-backend`)

| Commit | Message |
|---|---|
| [`3b283b5`](https://github.com/mehfatih/FinSuite-backend/commit/3b283b5) | feat(db): MorningBriefSubscription + Send migrations |
| [`aa25c79`](https://github.com/mehfatih/FinSuite-backend/commit/aa25c79) | feat(jobs): morning brief scheduler with timezone matching |
| [`823ee78`](https://github.com/mehfatih/FinSuite-backend/commit/823ee78) | feat(brief): morning brief generator service |
| [`785fc26`](https://github.com/mehfatih/FinSuite-backend/commit/785fc26) | feat(brief): cinematic email template (TR/AR/EN) and Resend wiring |
| [`5a01f6c`](https://github.com/mehfatih/FinSuite-backend/commit/5a01f6c) | feat(api): Resend webhook handles MorningBriefSend events |
| [`c75fad7`](https://github.com/mehfatih/FinSuite-backend/commit/c75fad7) | feat(api): unsubscribe endpoint with signed-token gate |
| [`572006c`](https://github.com/mehfatih/FinSuite-backend/commit/572006c) | feat(api): customer morning-brief preferences CRUD + test + stats |
| [`6da79aa`](https://github.com/mehfatih/FinSuite-backend/commit/6da79aa) | feat(admin): morning brief email engagement endpoints |

### Frontend (`zyrix-finsuite`)

| Commit | Message |
|---|---|
| [`490663d`](https://github.com/mehfatih/zyrix-finsuite/commit/490663d) | docs(ai-copilot): Sprint D-5 discovery report |
| [`4dc8dbc`](https://github.com/mehfatih/zyrix-finsuite/commit/4dc8dbc) | feat(ui): morning brief settings panel |
| [`e520f36`](https://github.com/mehfatih/zyrix-finsuite/commit/e520f36) | feat(ui): /unsubscribe cinematic page |
| [`32b9386`](https://github.com/mehfatih/zyrix-finsuite/commit/32b9386) | feat(admin): morning brief email engagement dashboard |
| [`36de655`](https://github.com/mehfatih/zyrix-finsuite/commit/36de655) | feat(i18n): morning brief email + UI translations (TR/EN/AR) |

(Plus this completion-report commit.)

---

## Files added

### Backend

```
prisma/
├── manual-migrations/2026-05-10_morning_brief_d5.sql        (B.1)
└── manual-migrations/2026-05-10_morning_brief_pause.sql     (B.6 — pausedUntil column)

src/services/morningBrief/
├── tz.ts                  — local hour + day-of-week from Intl.DateTimeFormat
├── scheduler.ts           — runMorningBriefTick(), shouldSendNow(), findEnabledSubscriptions()
├── generator.ts           — generateBrief() with cache + HTTP-loopback fallback
├── emailTemplate.ts       — renderMorningBriefHtml() / renderMorningBriefText()
├── unsubscribeToken.ts    — sign/verify + buildUnsubUrl()
└── sendBrief.ts           — generator → renderer → Resend → MorningBriefSend row

src/controllers/
├── customer/morningBriefController.ts         — GET/PATCH/test/stats
├── morningBriefUnsubscribeController.ts        — public token-gated unsubscribe
└── admin/adminEmailEngagementController.ts    — admin engagement dashboard

src/routes/
├── customer/morningBrief.ts                   — /api/customer/morning-brief
└── morningBriefUnsubscribe.ts                  — /api/morning-brief/unsubscribe
```

Modified backend files:

```
prisma/schema.prisma                          ← MorningBriefSubscription + MorningBriefSend models + Merchant relations
src/controllers/cronController.ts             ← runMorningBrief handler
src/routes/cronRoutes.ts                      ← POST /morning-brief-tick mount
src/controllers/webhooks/resendWebhookController.ts  ← MorningBriefSend fall-through + bounce auto-disable
src/services/morningBrief/scheduler.ts        ← pausedUntil honored (added in B.6 alongside the schema column)
src/routes/admin/index.ts                     ← /email-engagement, /email-engagement/bounced, /email-engagement/:merchantId/re-enable
src/index.ts                                  ← mounts for /api/morning-brief/unsubscribe + /api/customer/morning-brief
```

### Frontend

```
src/api/v2/morningBrief.js                                    — customer + public unsub API client
src/api/admin/emailEngagement.js                              — admin API client (uses zyrix_admin_token)
src/pages/v2/notifications/MorningBriefPanel.jsx              — settings panel sub-component
src/pages/v2/morningBrief/UnsubscribePage.jsx                 — public cinematic /unsubscribe page
src/pages/admin/ops/EmailEngagementPage.jsx                   — live admin dashboard
src/i18n/dashboard/morningBrief.{tr,en,ar}.json               — canonical translation source-of-truth
docs/sprint-d5-discovery-2026-05-10.md                        — Phase A discovery report
docs/sprint-d5-completion-2026-05-10.md                        — this file
```

Modified frontend files:

```
src/pages/v2/notifications/NotificationPreferencesPage.jsx  ← imports + mounts <MorningBriefPanel />
src/App.jsx                                                  ← lazy imports + route mounts for /unsubscribe and /admin/ops/email-engagement
```

---

## Decisions honored (from Phase A §6)

| ID | Decision | How it shipped |
|---|---|---|
| **6.A** | New dedicated subscription table (not extending NotificationPreference) | `MorningBriefSubscription` model (`merchantId @unique`); separate `MorningBriefSend` log. |
| **6.B** | `MorningBrief*` naming prefix to avoid collision with `customer_daily_brief` | Every new model, table, file, and route uses `morningBrief` / `MorningBrief` / `morning_brief` consistently. The existing `customer_daily_brief` cache table is untouched. |
| **6.C** | Pure-CSS gradient header (no `@vercel/og`, no `node-canvas`) | `services/morningBrief/emailTemplate.ts` builds the gradient mesh inline via two `radial-gradient` layers + a `linear-gradient` base. **Zero new infrastructure deps.** |
| **6.D** | Daily brief is its own pipeline (not routed through D-4 notification engine) | `services/morningBrief/sendBrief.ts` calls `resend.emails.send()` directly. The in-app notification feed is not polluted with daily-brief events. |
| **6.E** | HTTP-loopback fallback (NOT helper extraction) | `services/morningBrief/generator.ts` mints a 5-min merchant JWT and POSTs internally to `/api/customer/dashboard/ai-brief/refresh`. **`aiBriefController.ts` and `merchantSnapshot.ts` are byte-for-byte unchanged** (verified via `git diff HEAD~12 -- src/controllers/customer/aiBriefController.ts src/services/customer/merchantSnapshot.ts` → no output). |

---

## Hard-rule compliance

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero edits to `nixpacks.toml`, `railway.toml`, `package.json`, Node version, or env vars added. The cron is registered via the **Railway dashboard** (the sole D-5 ops step), not via in-repo config. |
| **`merchantId` everywhere, NOT `companyId`** | ✅ Every new schema column, controller, and request payload uses `merchantId`. The existing `CustomerDailyBrief.customerUserId` (legacy naming) is consumed but not renamed. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, KPI logic** | ✅ Verified by `git diff` — both files are unchanged. The generator calls `buildMerchantSnapshot` as an exported public API (read-only consumption), and refreshes the cache via the controller's HTTP endpoint, not by editing the controller. |
| **Plain JSX + inline styles + design tokens — no Tailwind/TS/shadcn** | ✅ `MorningBriefPanel.jsx`, `UnsubscribePage.jsx`, and `EmailEngagementPage.jsx` are plain JSX with inline styles, importing `CINEMATIC` / `RADIUS` / `TYPE_STACK` / `TYPE_SCALE` / `SPACE` from the existing `@/design-system-v2/cinematic/tokens` and the `@/components/foundation` library. |
| **All commit messages in English** | ✅ All 12 commit messages English. |
| **Strict micro-commits** | ✅ Each commit is a single concern: schema, scheduler, generator, template, webhook extension, unsubscribe, customer CRUD, settings panel, unsubscribe page, admin dashboard, i18n, completion report. Each leaves the build green. |
| **Stop on unexpected output** | ✅ No unexpected output encountered. The pre-existing `tsc` error in `src/routes/admin/auth.ts:61` was confirmed unrelated to D-5 changes (the project deploys via `tsx`, not `tsc`, and the error existed before this sprint). |

---

## Database changes

Two additive migrations, both idempotent (every statement guarded with `IF NOT EXISTS`), matching the project convention from D-3/D-4:

```
2026-05-10_morning_brief_d5.sql        — adds morning_brief_subscriptions + morning_brief_sends
2026-05-10_morning_brief_pause.sql     — adds morning_brief_subscriptions.pausedUntil column
```

Both must be applied in production via the project's standard manual-migration flow before the cron is enabled. Schema additions:

- `morning_brief_subscriptions`: `id`, `merchantId @unique → merchants(id) ON DELETE CASCADE`, `enabled`, `frequency` (`daily|weekdays|weekly|never`), `weeklyDay` (0-6), `sendHourLocal` (0-23), `lastSentAt`, `pausedUntil`, `bounceCount`, `variant` (`v1` for now), `createdAt`, `updatedAt`.
- `morning_brief_sends`: `id`, `merchantId → merchants(id) ON DELETE CASCADE`, `variant`, `subject`, `insightIds` (`TEXT[]`), `providerMessageId`, `status` (`sent|delivered|opened|failed`), `sentAt`, `deliveredAt`, `openedAt`, `clickedAt`, `bouncedAt`, `bounceReason`, `unsubscribeClicked`. Indexes on `(merchantId, sentAt DESC)` and `(providerMessageId)` to support the engagement dashboard and webhook lookups.

Existing tables touched: zero. The `Merchant` model gains two new relation fields (`morningBriefSubscription?`, `morningBriefSends[]`) — no column changes.

---

## API surface added

### Public (no auth — token-gated)

```
GET  /api/morning-brief/unsubscribe/info?token=<jwt>
POST /api/morning-brief/unsubscribe
     body: { token, action: 'unsubscribe'|'pause30'|'weekly', reasons?: string[] }
```

### Customer (Bearer token)

```
GET   /api/customer/morning-brief
PATCH /api/customer/morning-brief
POST  /api/customer/morning-brief/test       — rate-limited 1/60s/merchant
GET   /api/customer/morning-brief/stats      — last-30-day aggregates
```

### Admin (admin Bearer token)

```
GET   /api/admin/email-engagement                              — aggregate stats
GET   /api/admin/email-engagement/bounced                      — bounced list
POST  /api/admin/email-engagement/:merchantId/re-enable        — manual override
```

### Cron (`x-cron-secret` header)

```
POST /api/cron/morning-brief-tick    — Railway cron triggers every 15 min
```

### Resend webhook (HMAC-verified inside)

`/api/webhooks/resend` is **unchanged URL-wise** but its handler now falls through to `MorningBriefSend` lookup when `InsightShare` doesn't match, and adds:
- `email.clicked` branch (D-3 share emails don't track clicks; morning brief does)
- 3-bounce auto-disable + `AdminNotification` write

---

## Known follow-ups (out of D-5 scope)

1. **Railway cron registration** — Mehmet to add the dashboard entry: every 15 min, POST to `https://api.finsuite.zyrix.co/api/cron/morning-brief-tick` with header `x-cron-secret: $CRON_SECRET`. Until done, the system ships ZERO emails (by design).
2. **SA merchant timezone backfill** — flagged in Phase A §4.3: merchants with `country='SA'` still get the `Europe/Istanbul` schema default. Fix is a one-time `UPDATE merchants SET timezone='Asia/Riyadh' WHERE country='SA' AND timezone='Europe/Istanbul'` — schedule into a future sprint when the SA rollout is closer.
3. **A/B variant infrastructure** — schema supports it (`variant` column on both tables) but only `v1` is shipped. When we want to test v2, add a small variant-picker to `sendBrief.ts` (~10 lines) and a per-variant rate filter to the admin dashboard.
4. **Engagement dashboard charts** — current admin page uses tile + table layout to keep the diff small. Sprint D-X could promote it to use the `AnimatedFunnel` / `AnimatedHeatmap` components from `pages/admin/analytics/AnalyticsOverviewPage.jsx`.
5. **`tsc` cleanup** — the pre-existing `src/routes/admin/auth.ts:61` strict-typing error (`Record<string,unknown>` vs `Prisma.InputJsonValue`) wasn't caused by D-5 but is the only thing standing between us and a clean `tsc` build. Worth a 1-line cast in a future micro-commit.

---

## Verification matrix (to run post-cron-registration)

| Check | How |
|---|---|
| **Tick is reachable** | `curl -X POST https://api.finsuite.zyrix.co/api/cron/morning-brief-tick -H "x-cron-secret: <secret>"` → expect `{"success":true,"data":{"scannedAt":...,"candidates":N,"sent":0,"skipped":N,"failed":0,"details":[...]}}`. |
| **Customer can subscribe** | TR merchant logs in → `/settings/notifications` → "Sabah Brifingi" panel → toggle Enabled → Save. Verify `GET /api/customer/morning-brief` returns the persisted row. |
| **Test send works** | Click "Test gönder" in the panel → expect HTTP 200 + Resend message ID in the inbox within ~30s. |
| **Cache hit path** | Open the dashboard so today's `customer_daily_brief` row exists, then test-send → check logs for "morning-brief/sendBrief" with no loopback warning. |
| **Cache miss path** | `DELETE FROM customer_daily_brief WHERE customerUserId='<merchantId>'` then test-send → check logs for the loopback POST → expect the email to ship with real cards regenerated by Gemini. |
| **Webhook delivered** | Test send → wait ~60s → query `MorningBriefSend WHERE merchantId='<merchantId>' ORDER BY sentAt DESC LIMIT 1` → expect non-null `deliveredAt`. |
| **Webhook opened** | Open the test email in a webmail client → wait ~60s → re-query → expect non-null `openedAt`. |
| **Unsubscribe page works** | Click the footer "Unsubscribe" link → page renders with merchant name + masked email → click "Pause 30 days" → confirmation screen → re-query subscription → expect `pausedUntil` ~30 days out. |
| **Admin dashboard renders** | Login as admin → navigate to `/admin/ops/email-engagement` → expect totals, per-locale table, top subjects (after 5+ sends), and bounced list (likely empty). |
| **Bounce auto-disable** | Manually update a `MorningBriefSubscription` to `bounceCount=2`, send a malformed email (or simulate via webhook payload) → expect `bounceCount=3`, `enabled=false`, and an `AdminNotification` row with `type='morning-brief-bounce'`. |

---

## What this unlocks for the next sprint

The morning brief is the **first scheduled, push-style content surface** in the product. The plumbing now in place — generator + scheduler + dispatcher + tracking — generalizes to:

- Weekly performance digests (per-merchant rollups; same scheduler, different generator)
- Sector-benchmark monthly reports (different content payload, same render+send pipeline)
- AI-discovered opportunity alerts (event-driven, not scheduled — could re-enter via the existing notification engine instead)

D-5 deliberately did NOT extend D-4's notification engine to handle the daily brief (decision §6.D), but the option remains open: a future sprint can convert the daily brief to a `severity: 'DAILY_BRIEF'` event type if usage patterns suggest the unification is worth it.

---

**Sprint D-5: SHIPPED.**
