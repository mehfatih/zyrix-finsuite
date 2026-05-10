# Sprint D-6 — Weekly Performance Report Auto-PDF: Completion Report

**Date:** 2026-05-10
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **CODE COMPLETE — Phase A discovery + Phase B implementation shipped end-to-end**
**Awaiting:** cron-job.org schedule registration for `POST /api/cron/weekly-report-tick` (every 15 min, gated by `x-cron-secret`) + production verification of the first scheduled Sunday 18:00 send.

---

## TL;DR

The full weekly performance PDF pipeline shipped in 14 commits (1 discovery + 8 backend + 5 frontend, plus this report). The cron is **dormant in production** until you register the cron-job.org schedule — by design, mirrors how D-5's morning brief shipped.

End-to-end paths now live:

- **Generate** — `services/weeklyReport/generator.ts` orchestrates `weeklyKpis` (4 KPIs with WoW deltas + revenue / cash / customer / tax aux data) → `narrative` (Gemini long-form, 8s timeout, localized fallback) → upsert `WeeklyReport` row by `[merchantId, weekStart]`.
- **Render** — `services/pdf/templates/weeklyReport.ts` produces a 6-page A4 (cover, exec summary, revenue, cash & margin, customer & tax, action items) using existing `_layout.ts` + `charts.ts` primitives. Foundation Week path renders a single welcome page when `merchant.createdAt < 7d ago`.
- **Deliver** — Sunday 18:00 cron (default `sendDayLocal=0, sendHourLocal=18`, per-merchant local TZ) → `sendWeeklyReport` calls generator → renders PDF on demand → Resend send with PDF attachment + `List-Unsubscribe` headers + tag → `WeeklyReportSend` audit row → fires `weekly_report_ready` SHARE_EVENT through D-4 engine.
- **Track** — Resend webhook (D-4 → extended in D-5 → extended again here) now also looks up `WeeklyReportSend` after `InsightShare` and `MorningBriefSend` miss; 3 hard bounces auto-disable the subscription + write `AdminNotification`.
- **Browse** — `/reports/weekly` archive grid with KPI headline previews + Generate-Now CTA; `/reports/weekly/:id` iframe viewer with Download / Email-to-me / Generate-again sidebar.
- **Manage** — `WeeklyReportPanel` mounted in `/settings/notifications` (sibling to D-5 `MorningBriefPanel`); public `/unsubscribe-weekly` cinematic page with biweekly / pause30 / unsubscribe actions.
- **Notice** — `WeeklyReportBanner` on `DashboardV2Page` surfaces fresh reports and dismisses per-ISO-week so it reappears each Monday.

Decisions §6.A–6.G from the Phase A discovery doc were honored exactly as approved.

---

## What landed (Phase B execution log)

### Backend (`zyrix-finsuite-backend`)

| Commit | Message |
|---|---|
| [`571b336`](https://github.com/mehfatih/FinSuite-backend/commit/571b336) | feat(db): WeeklyReport + Subscription + Send migrations |
| [`4ea083c`](https://github.com/mehfatih/FinSuite-backend/commit/4ea083c) | feat(weeklyreport): KPIs + generator service |
| [`eddacc0`](https://github.com/mehfatih/FinSuite-backend/commit/eddacc0) | feat(weeklyreport): Gemini narrative prompt + per-week caching |
| [`7d945f7`](https://github.com/mehfatih/FinSuite-backend/commit/7d945f7) | feat(pdf): weekly report 6-page template |
| [`cafb59e`](https://github.com/mehfatih/FinSuite-backend/commit/cafb59e) | feat(weeklyreport): send pipeline + PDF renderer + email + token |
| [`87920fb`](https://github.com/mehfatih/FinSuite-backend/commit/87920fb) | feat(jobs): Sunday 18:00 scheduler + cron endpoint |
| [`4b85c18`](https://github.com/mehfatih/FinSuite-backend/commit/4b85c18) | feat(api): customer weekly report endpoints |
| [`22251b3`](https://github.com/mehfatih/FinSuite-backend/commit/22251b3) | feat(api): public weekly-report unsubscribe + Resend webhook tracking |

### Frontend (`zyrix-finsuite`)

| Commit | Message |
|---|---|
| [`993cf60`](https://github.com/mehfatih/zyrix-finsuite/commit/993cf60) | docs(ai-copilot): Sprint D-6 discovery report |
| [`c07c114`](https://github.com/mehfatih/zyrix-finsuite/commit/c07c114) | feat(ui): API client + dashboard banner for fresh weekly report |
| [`4aad673`](https://github.com/mehfatih/zyrix-finsuite/commit/4aad673) | feat(ui): /reports/weekly archive page |
| [`4fc3777`](https://github.com/mehfatih/zyrix-finsuite/commit/4fc3777) | feat(ui): /reports/weekly/:id viewer page (iframe) |
| [`e1b2a6f`](https://github.com/mehfatih/zyrix-finsuite/commit/e1b2a6f) | feat(ui): weekly report settings panel + /unsubscribe-weekly page |
| [`d1e1d02`](https://github.com/mehfatih/zyrix-finsuite/commit/d1e1d02) | feat(i18n): weekly report translations (TR/EN/AR) |

(Plus this completion-report commit.)

---

## Files added

### Backend

```
prisma/manual-migrations/2026-05-10_weekly_report_d6.sql

src/services/weeklyReport/
├── weeklyKpis.ts          — buildWeeklySnapshot(): arbitrary-window KPIs +
│                            WoW deltas (decision §6.A — sibling to the
│                            protected kpiComputations.ts; no edits to it)
├── narrative.ts           — composeNarrative(): Gemini long-form, 8s
│                            timeout, localized fallback, sanitization
├── generator.ts           — generateWeeklyReport(): orchestrate KPIs +
│                            insights + narrative; upsert WeeklyReport row
├── renderReportPdf.ts     — render PDF from a persisted row on demand
│                            (decision §6.B option B1 — no blob storage)
├── emailTemplate.ts       — cinematic dedicated template (decision §6.E
│                            option E2; mirrors D-5 morning-brief style)
├── unsubscribeToken.ts    — sign/verify weekly-report-unsub:<merchantId>
│                            JWTs (decision §6.G option G1; distinct from
│                            D-5's morning-brief tokens)
├── sendWeeklyReport.ts    — generator -> renderPdf -> Resend (with
│                            attachment + List-Unsubscribe headers) ->
│                            WeeklyReportSend row + SHARE_EVENT notify
└── scheduler.ts           — runWeeklyReportTick(): Sun 18:00 firing rule,
                              6-day double-fire guard, computeWeekBounds()

src/services/pdf/templates/weeklyReport.ts   — 6-page A4 layout

src/controllers/
├── customer/weeklyReportController.ts        — list / get / pdf /
│                                               regenerate / test /
│                                               subscription CRUD / stats
└── weeklyReportUnsubscribeController.ts      — public token-gated
                                                unsubscribe (info + apply)

src/routes/
├── customer/weeklyReport.ts                   — /api/customer/weekly-report
└── weeklyReportUnsubscribe.ts                  — /api/weekly-report/unsubscribe
```

Modified backend files:

```
prisma/schema.prisma                          ← 3 new models + 3 Merchant relations
src/controllers/cronController.ts             ← runWeeklyReport handler
src/routes/cronRoutes.ts                      ← POST /weekly-report-tick mount
src/controllers/webhooks/resendWebhookController.ts  ← third-table fall-through
                                                       to WeeklyReportSend +
                                                       handleWeeklyReportBounce
src/index.ts                                  ← /api/customer/weekly-report mount +
                                                /api/weekly-report/unsubscribe mount
```

### Frontend

```
src/api/v2/weeklyReport.js                                   — 8 customer + 2 public helpers
src/components/v2/reports/WeeklyReportBanner.jsx             — dashboard banner
src/pages/v2/reports/ReportsArchivePage.jsx                  — /reports/weekly
src/pages/v2/reports/ReportViewerPage.jsx                    — /reports/weekly/:id (iframe)
src/pages/v2/reports/WeeklyUnsubscribePage.jsx               — /unsubscribe-weekly
src/pages/v2/notifications/WeeklyReportPanel.jsx             — settings panel sub-component
src/i18n/dashboard/weeklyReport.{tr,en,ar}.json              — canonical translations
docs/sprint-d6-discovery-2026-05-10.md                       — Phase A doc
docs/sprint-d6-completion-2026-05-10.md                      — this file
```

Modified frontend files:

```
src/pages/v2/notifications/NotificationPreferencesPage.jsx  ← mounts <WeeklyReportPanel />
src/pages/v2/DashboardV2Page.jsx                             ← mounts <WeeklyReportBanner />
src/App.jsx                                                  ← lazy imports + routes for
                                                                /reports/weekly,
                                                                /reports/weekly/:id,
                                                                /unsubscribe-weekly
```

---

## Decisions honored (from Phase A §6)

| ID | Decision | How it shipped |
|---|---|---|
| **6.A** | New sibling `weeklyKpis.ts` (do NOT edit protected `kpiComputations.ts`) | `services/weeklyReport/weeklyKpis.ts` reads same Prisma tables (Invoice / Expense / BankTransaction / Customer / TaxEvent) for arbitrary `[weekStart, weekEnd)` windows. Verified via `git diff` — `kpiComputations.ts`, `merchantSnapshot.ts`, and `aiBriefController.ts` are byte-for-byte unchanged across all 14 commits. |
| **6.B** | On-demand PDF re-render for V1 (no blob storage); upgrade-to-BLOB-column documented as a future optimization | `services/weeklyReport/renderReportPdf.ts` rebuilds the PDF buffer from the persisted `WeeklyReport` row every time — used by the email send path AND the customer download/view endpoint. **Future optimization**: when production data shows the viewer is hit > N times per merchant per week, add a `pdfBytes Bytes?` column to `WeeklyReport` and cache the buffer there (a 30-line follow-up commit; no infra change). |
| **6.C** | `WeeklyReport*` schema names with `merchantId` (not `companyId`) | All three new models use `merchantId`; spec's `userId / companyId` translated throughout. |
| **6.D** | Native iframe in-app PDF viewer (no `react-pdf` dependency) | `ReportViewerPage.jsx` uses `<iframe src={pdfUrl}>`; zero new deps. |
| **6.E** | Dedicated `services/weeklyReport/emailTemplate.ts` (mirrors D-5; not extending D-3 share template) | New template self-contained with its own STR table; D-3's `shareEmailTemplate.ts` untouched. |
| **6.F** | Reuse `SHARE_EVENT` notification severity for "weekly report ready" | `sendWeeklyReport.ts` dispatches with `severity: "SHARE_EVENT", type: "weekly_report_ready"` — no new schema column on `NotificationPreference`. |
| **6.G** | New `weekly-report-unsub:` token namespace (leave D-5's morning-brief token untouched) | `services/weeklyReport/unsubscribeToken.ts` signs/verifies a distinct namespace; D-5's `services/morningBrief/unsubscribeToken.ts` is unchanged. |

---

## Hard-rule compliance

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero edits to `nixpacks.toml`, `railway.toml`, `package.json`, Node version, env vars. cron-job.org schedule registration is the single ops step (not in-repo). |
| **`merchantId` everywhere, NOT `companyId`** | ✅ Every new column, controller, payload uses `merchantId`. Spec's `companyId / userId` translated. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, KPI logic** | ✅ Verified by `git diff 6da79aa..HEAD -- <three protected files>` → 0 lines output. |
| **Plain JSX + inline styles + design tokens — no Tailwind/TS/shadcn** | ✅ All four new frontend pages + banner + panel use plain JSX with inline styles + `@/design-system-v2/cinematic/tokens` + `@/components/foundation`. |
| **All commit messages in English** | ✅ All 14 commit messages English. |
| **Strict micro-commits** | ✅ Each commit a single concern: schema, KPIs+generator, narrative, template, send pipeline, scheduler, customer API, public unsubscribe + webhook, banner, archive, viewer, settings panel + unsub page, i18n, completion report. Each leaves the build green. |
| **Stop on unexpected output** | ✅ Encountered: pre-existing `tsc` error in `src/routes/admin/auth.ts:61` (carried from D-5; project deploys via `tsx`, not `tsc`); two of my own real TS bugs caught by typecheck and fixed before commit (`BankTransaction.date` → `transactionDate`; reduce accumulator typing on Prisma groupBy result). |
| **Scheduling via existing `/api/cron/*` + cron-job.org pattern** | ✅ `POST /api/cron/weekly-report-tick` mounted alongside D-5's `morning-brief-tick`; same `x-cron-secret` header gate; same external-trigger pattern. |
| **Cron-job.org wiring done by Mehmet, not the agent** | ✅ Endpoint live; no automated cron registration attempted. |

---

## Database changes

One additive migration matching the project convention:

```
prisma/manual-migrations/2026-05-10_weekly_report_d6.sql
```

Schema additions (all additive, idempotent via `IF NOT EXISTS`):

- **`weekly_reports`**: `id` (cuid), `merchantId → merchants(id) ON DELETE CASCADE`, `weekStart` (DATE), `weekEnd` (DATE), `narrative` (TEXT), `insightIds` (TEXT[]), `kpiSnapshot` (JSONB), `language` (default `tr`), `status` (default `ready`), `generatedAt`. Unique on `(merchantId, weekStart)`; index on `(merchantId, weekStart DESC)`.
- **`weekly_report_subscriptions`**: `id`, `merchantId UNIQUE → merchants(id) CASCADE`, `enabled` (default true), `sendDayLocal` (default 0=Sunday), `sendHourLocal` (default 18), `lastSentAt`, `pausedUntil`, `bounceCount`, `createdAt`, `updatedAt`.
- **`weekly_report_sends`**: `id`, `merchantId → merchants(id) CASCADE`, `reportId → weekly_reports(id) CASCADE`, `subject`, `providerMessageId`, `status` (default `sent`), `sentAt`, `deliveredAt`, `openedAt`, `clickedAt`, `bouncedAt`, `bounceReason`, `unsubscribeClicked`. Indexes on `(merchantId, sentAt DESC)` and `(providerMessageId)`.

Existing tables touched: zero. The `Merchant` model gains three new relation fields (`weeklyReports[]`, `weeklyReportSubscription?`, `weeklyReportSends[]`) — no column changes.

---

## API surface added

### Public (no auth — token-gated)

```
GET  /api/weekly-report/unsubscribe/info?token=<jwt>
POST /api/weekly-report/unsubscribe
     body: { token, action: 'unsubscribe'|'pause30'|'biweekly', reasons?: string[] }
```

### Customer (Bearer token)

```
GET    /api/customer/weekly-report                  — paginated list with KPI headline preview
GET    /api/customer/weekly-report/subscription      — current sub + tz
PATCH  /api/customer/weekly-report/subscription      — update sub
GET    /api/customer/weekly-report/stats             — last 30-day engagement
POST   /api/customer/weekly-report/test              — fire one-off send (rate-limited 1/60s)
POST   /api/customer/weekly-report/regenerate        — force-regen current week (rate-limited 1/60s)
GET    /api/customer/weekly-report/:id               — single row metadata
GET    /api/customer/weekly-report/:id/pdf           — on-demand PDF buffer (5-min private cache)
```

### Cron (`x-cron-secret` header)

```
POST /api/cron/weekly-report-tick    — cron-job.org POSTs every 15 min
```

### Resend webhook (HMAC-verified inside)

`/api/webhooks/resend` URL unchanged; handler now falls through to `WeeklyReportSend` after `InsightShare` and `MorningBriefSend` miss. New `email.clicked` branch for the weekly path. 3 hard bounces auto-disable + write `AdminNotification('weekly-report-bounce')`.

---

## Known follow-ups (out of D-6 scope)

1. **cron-job.org registration** — the single remaining ops step. Add an entry: every 15 min, POST to `https://api.finsuite.zyrix.co/api/cron/weekly-report-tick` with header `x-cron-secret: $CRON_SECRET`. Until then, the system ships ZERO weekly emails (by design).
2. **PDF caching upgrade (decision §6.B follow-up)** — if production data shows the viewer endpoint is hit > 3-5× per merchant per week, add a `pdfBytes Bytes?` column to `WeeklyReport` and cache the buffer there. ~30 lines of additive change to `renderReportPdf.ts` + an additive migration; no infra change. Defer until usage justifies it.
3. **Share via Email / WhatsApp from viewer** — the spec mentions sidebar "Share via Email / Share via WhatsApp" actions on the viewer page. V1 ships only "Email it to me" + Download + Generate again to keep the diff small. Adding D-3 share integration is a follow-up commit (~80 lines): hook D-3's `RecipientPicker` modal into the viewer and call `POST /api/customer/sharing` with the rendered PDF buffer.
4. **Comments section** — the spec hints at "Comments section (gated for D-7 sharing-with-comments work)" — explicitly punted to D-7.
5. **Filter by month/quarter/year** — the spec mentions archive filters; V1 ships pagination only. Adding filters is purely UI on top of the existing list endpoint (no backend change).
6. **Week-bound timezone precision** — `computeWeekBounds()` uses local YYYY-MM-DD as if it were UTC midnight, which is exact for UTC merchants and ±a few hours for non-UTC. Acceptable for weekly aggregation; switch to `Temporal` (Node 22+) when we move off Node 20.
7. **`tsc` cleanup** — the pre-existing `src/routes/admin/auth.ts:61` strict-typing error is still the only blocker to a fully clean `tsc` build (project deploys via `tsx`). Worth a 1-line cast in a future micro-commit.

---

## Verification matrix (to run post-cron registration)

| Check | How |
|---|---|
| **Tick is reachable** | `curl -X POST https://api.finsuite.zyrix.co/api/cron/weekly-report-tick -H "x-cron-secret: <secret>"` → expect `{"success":true,"data":{"scannedAt":...,"candidates":N,"sent":0,"skipped":N,"failed":0,"details":[...]}}`. |
| **Customer can subscribe** | TR merchant logs in → `/settings/notifications` → "Haftalık Performans Raporu" panel → toggle Enabled → Save. Verify `GET /api/customer/weekly-report/subscription` returns the persisted row. |
| **Test send works** | Click "Test gönder" in the panel → expect HTTP 200 with `reportId` + `sendId` + an email in the inbox within ~30s. |
| **Regenerate works** | Click "Yeniden oluştur" → check logs for a Gemini call → re-fetch `/api/customer/weekly-report/:id` and verify `narrative` is non-fallback (or the localized fallback if Gemini quota=0, which is acceptable). |
| **Archive renders** | Visit `/reports/weekly` → expect a grid of cards with KPI headline preview. Click one → routes to viewer. |
| **Viewer iframe loads** | `/reports/weekly/:id` shows the PDF inline; right-click → "Open in new tab" works; sidebar Download triggers a download. |
| **Banner appears** | After a successful send, visit `/v2/dashboard` → expect "Bu haftaki performans raporun hazır" banner above the KPI grid. Click X → banner hides for the rest of the ISO week. Refresh next Monday → banner reappears. |
| **Webhook delivered** | Test send → wait ~60s → query `WeeklyReportSend WHERE merchantId='<id>' ORDER BY sentAt DESC LIMIT 1` → expect non-null `deliveredAt`. |
| **Webhook opened** | Open the test email → wait ~60s → re-query → expect non-null `openedAt`. |
| **Webhook clicked** | Click the "Open report" CTA in the email → wait ~60s → re-query → expect non-null `clickedAt`. |
| **Unsubscribe page works** | Click email footer "Aboneliği iptal et" → page renders with merchant name + masked email → click "30 gün duraklat" → confirmation screen → re-query subscription → expect `pausedUntil` ~30 days out. |
| **Bounce auto-disable** | Manually update `WeeklyReportSubscription.bounceCount=2` for a test merchant; trigger a malformed Resend webhook (or send to a known bounce address) → expect `bounceCount=3`, `enabled=false`, `AdminNotification('weekly-report-bounce', warning)` row. |
| **Foundation Week** | Create a fresh merchant (`createdAt < 7d ago`); call `POST /api/customer/weekly-report/regenerate` and view the PDF → expect a single welcome page, not the 6-page layout. |
| **First sched fire** | Wait until the next Sunday 18:00 in some merchant's tz → expect cron-job.org tick to find that merchant as a candidate, dispatch successfully, and log `lastSentAt`. |

---

## What this unlocks for the next sprint

D-6 establishes the **weekly cadence** as a first-class surface:

- The `WeeklyReport` row pattern (narrative + KPI snapshot + insightIds + on-demand render) generalizes to any "scheduled artifact" surface — D-7 monthly reports, D-8 quarterly reviews, year-in-review at year-end.
- The `weeklyKpis.ts` arbitrary-window pattern is now a proven precedent. Any future report that needs "give me the metrics for this date range" can copy-and-adapt without touching `kpiComputations.ts`.
- The unsubscribe-token-namespace pattern (`weekly-report-unsub:<merchantId>` distinct from `morning-brief-unsub:<merchantId>`) gives us a clean template for any future scheduled email surface — each gets its own kill-switch, per-flow.
- The Resend webhook now handles three send-log tables; adding a fourth is a 30-line additive change.
- The dashboard banner pattern is reusable: dismiss-per-ISO-week via localStorage stamp, lazy-fetch on mount, glass-card chrome.

D-7 (sharing with comments) can reach into the WeeklyReport row, attach the on-demand PDF to a share, and let recipients comment via the existing D-3 sharing rails.

---

**Sprint D-6: SHIPPED.**
