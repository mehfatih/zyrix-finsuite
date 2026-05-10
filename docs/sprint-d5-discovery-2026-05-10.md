# Sprint D-5 — Daily AI Briefing Email Digest: Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of the open decisions in §6 before Phase B begins**

---

## TL;DR

Most of the plumbing D-5 needs is **already deployed** by D-2 / D-2.5 / D-3 / D-4. The remaining work is composition, not net-new infrastructure:

| Layer | State | What D-5 needs to add |
|---|---|---|
| Resend SDK | v6.12.0, verified in prod (D-2.5) | A new email template + send call. **No new dep.** |
| Cron trigger pattern | HTTP endpoints + `x-cron-secret`, 4 endpoints already mounted at `/api/cron` | One more endpoint: `/api/cron/daily-brief-tick`, called every 15 min by Railway cron. **No new dep, no in-process scheduler needed.** |
| Timezone | `Merchant.timezone` (default `Europe/Istanbul`), exercised by `quietHours.ts` via native `Intl.DateTimeFormat` | Reuse the `localHourIn(tz, when)` pattern. **No new dep (no `date-fns-tz` needed).** |
| Email deliverability | D-4 webhook at `/api/webhooks/resend`, HMAC-verified, handles `delivered/opened/bounced/complained` | Extend the handler to ALSO look up the new `DailyBriefSend` row (currently only checks `InsightShare`). |
| Daily brief content | Generated in-app today by `aiBriefController.ts` and cached in `customer_daily_brief` table | A separate **dispatch path** that pulls the cached brief (or asks the controller to generate one) and renders it as email-shaped HTML. |
| Notification engine (D-4) | Multi-channel dispatch with quiet-hours, mute, prefs | **Bypass** for V1: the daily brief is its own pipeline, not a notification event. (Discussed in §6.D.) |

There are **5 decisions** that need explicit answers from Mehmet before Phase B, captured in §6. None of them are infrastructure changes per the hard rule, but two of them (`@vercel/og` vs. Puppeteer-for-hero, schema-alignment with the existing `customer_daily_brief` table) materially shape the schema and commit sequence.

---

## 1. Repo geography

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Frontend (Vite + React 18, plain JSX, no TS). All UI work for D-5 lands here. Discovery doc lives in `docs/`. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma + Resend backend. All scheduler / generator / template / webhook / migration work for D-5 lands here. |

Hard rule reminder: **`merchantId` everywhere**, NOT `companyId` — the spec's example uses `userId/companyId`, but the actual data model is `merchantId` on every related table (verified §3 below).

---

## 2. A.1 — Scheduling infrastructure audit

### 2.1 What exists today

```
backend/src/controllers/cronController.ts
backend/src/routes/cronRoutes.ts        →  mounted at /api/cron
```

Four endpoints, each gated by an `x-cron-secret` header check against `process.env.CRON_SECRET`:

```
POST /api/cron/reminders/overdue-invoices
POST /api/cron/reminders/installments
POST /api/cron/reminders/tax-calendar
POST /api/cron/process-recurring
```

Each handler is a self-contained query → loop → `resend.emails.send()` → DB update, with a 200 ms throttle between sends. They are **stateless**, **idempotent-ish** (rely on row-level state like `isSubmitted` / `reminderSent` flags), and meant to be hit by an external scheduler.

### 2.2 What the trigger looks like

The repo doesn't ship a scheduler — it depends on an external one:

- **Railway native cron** (preferred, free on the Pro plan, configured via the Railway dashboard, no in-repo config file needed)
- Or **cron-job.org** (free fallback, the comment in `cronRoutes.ts` mentions it explicitly: `// يتم استدعاؤها من Railway Cron أو Cron-job.org`)

Neither path requires changes to `nixpacks.toml`, `railway.toml`, `package.json`, the Node version, or env vars beyond setting `CRON_SECRET` (already set in prod).

### 2.3 Dependency check

Backend `package.json` deps grep:

| Package | Present? | Notes |
|---|---|---|
| `bull` | ❌ | Good — spec rules it out. |
| `agenda` | ❌ | Good — spec rules it out. |
| `node-cron` | ❌ | Available as an option for V1; would require an approved infra change. |
| `node-schedule` | ❌ | Same as above. |

### 2.4 D-5 recommendation

Add **one new HTTP endpoint** to the existing pattern:

```
POST /api/cron/daily-brief-tick   (gated by x-cron-secret, fires every 15 min)
```

Handler logic:
1. Find every `DailyBriefSubscription` where `enabled=true` and the next `sendHourLocal` in the merchant's timezone falls inside the last 15 minutes
2. Honor `frequency` (`daily` / `weekdays` / `weekly` / `never`)
3. Guard double-sends with `lastSentAt` (yesterday-or-earlier)
4. Generate brief → render email → call Resend → log `DailyBriefSend` row with `providerMessageId`
5. Throttle (e.g. 200 ms between sends, matching the existing pattern)

**Trigger**: configure Railway cron in the dashboard to POST `/api/cron/daily-brief-tick` every 15 min with the `x-cron-secret` header. **No `nixpacks.toml` / `railway.toml` change** — Railway cron is dashboard-configured.

**No new dependency. No in-process job runner.** This decision keeps the hard rule (no infra change without approval) intact.

---

## 3. A.2 — Email rendering pipeline audit

### 3.1 Three established render patterns in the backend

```
backend/src/services/emailService.ts                          ← D-1 era (welcome / trial / suspension)
backend/src/services/sharing/shareEmailTemplate.ts            ← D-3 share-by-email (cinematic gradient mesh)
backend/src/services/notifications/templates/notificationEmail.ts  ← D-4 in-app→email mirror (severity-keyed)
```

All three follow the same conventions:

- **Plain template literals**, no `@react-email/components`. (Resolved D-3 question; not in `package.json`. The only `@react-email/render` mention in `package-lock.json` is an Iyzipay transitive, not a real dep.)
- **Inline styles only** (Gmail/Outlook compatibility).
- **Three locales** — `tr` / `en` / `ar`, with `dir="rtl"` on `<html>` for Arabic and IBM Plex Sans Arabic font stack.
- **From address**: D-3/D-4 both use `Zyrix FinSuite <hello@zyrix.co>`. The older `cronController.ts` uses `noreply@zyrix.co`, but the new D-3/D-4 convention is the established one — D-5 will follow it.
- **Cinematic header**: solid-fill `radial-gradient` mesh as inline CSS in the table header — works in modern clients (Gmail web, Apple Mail, Outlook Mac, Outlook 365 web), degrades to a solid dark band on Outlook Desktop. This is exactly the constraint the spec calls out in §"How we keep cinematic feel within these limits".

### 3.2 Reusable D-3 components

The D-3 share email already has the visual chrome the daily brief needs:

- Gradient mesh header (`radial-gradient` × 2 + `linear-gradient` base)
- Cyan glow status pill
- Severity badges (`critical` / `attention` / `opportunity`) with matched color tokens (`#FF3D5A` / `#FFB800` / `#06A87E`)
- CTA button with violet→cyan gradient
- Footer chrome
- Locale switching helper `T(key, locale)`

Recommend D-5's email template **reuses this chrome** (extract the shared parts into a tiny helper, e.g. `services/dailyBrief/sharedChrome.ts`, OR just copy-and-adapt to keep micro-commits small — TBD in B.6).

### 3.3 Subject line plan (matches spec)

```
TR default:  Bugün için 3 önemli içgörü • {Şirket Adı}
TR critical: 🔴 Kritik: {Brief title} • Zyrix Sabah Brifingi
EN default:  3 insights for {Company} today • Zyrix Morning Brief
AR default:  ثلاث رؤى مهمة لشركتك اليوم • {اسم الشركة}
```

Variant column on `DailyBriefSend` for future A/B (V1 ships only `v1`).

### 3.4 Pre-header text

Spec calls out pre-header text as required. None of the current templates set one explicitly — they all show the first body line in inbox previews. D-5 will add the standard `<div style="display:none; max-height:0; overflow:hidden;">` pre-header pattern to make the inbox preview deliberate.

---

## 4. A.3 — Timezone audit

### 4.1 Where TZ is stored

```prisma
model Merchant {
  ...
  timezone String @default("Europe/Istanbul")   // line 376 of schema.prisma
  ...
}
```

**Authoritative on `Merchant`, not `User`, not `Company` (no `Company` model exists).** All scheduler logic must read `merchant.timezone`.

Hard rule reminder: spec's `DailyBriefSubscription.timezone` field is unnecessary — denormalizing TZ would let the merchant's TZ edit silently desync from their digest schedule. Recommend the new model **omits its own `timezone` column** and reads from `Merchant.timezone` at tick time.

### 4.2 Reusable TZ helper

`backend/src/services/notifications/quietHours.ts` already implements the exact primitive the scheduler needs:

```ts
function localHourIn(tz: string, when: Date = new Date()): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", hour12: false, timeZone: tz
  });
  const parts = fmt.formatToParts(when);
  const h = parts.find((p) => p.type === "hour")?.value ?? "0";
  return parseInt(h, 10) % 24;
}
```

Native `Intl.DateTimeFormat` is sufficient — **no `date-fns-tz` or `luxon` needed**. Recommend the scheduler imports this helper directly (small refactor: move it from `quietHours.ts` into a sibling `tz.ts` so both can use it without a circular dep). That is a refactor, not net-new infra; deferred to a B-phase call.

### 4.3 Defaults

- **TR merchants**: `Europe/Istanbul` (matches schema default).
- **SA merchants** (when they sign up): currently still get `Europe/Istanbul` because the default fires at row insert. **This is a pre-existing data quality bug, not a D-5 problem** — flag it for a future follow-up (likely Sprint D-6 or later) to backfill `Asia/Riyadh` for `country='SA'` merchants. **Not in D-5 scope; documenting only.**

### 4.4 Send-time spread

Recommend the scheduler runs every **15 min** (matching spec §B.2). Tick window = 15 min. A merchant with `sendHourLocal=7` is matched by the tick that fires between 06:45 and 07:00 local time, and `lastSentAt` guard prevents re-fire on the next tick.

---

## 5. A.4 — Deliverability tracking audit

### 5.1 Existing webhook (D-4)

```
POST /api/webhooks/resend
   ↳ src/routes/webhooks/resend.ts  (mounted with express.raw() so HMAC verify gets the raw body)
   ↳ src/controllers/webhooks/resendWebhookController.ts
```

The handler:

1. Reads `svix-id`, `svix-timestamp`, `svix-signature` headers
2. Rejects if `RESEND_WEBHOOK_SECRET` is unset (503), missing headers (400), or stale signature > 5 min old (401)
3. Verifies HMAC using base64-decoded `whsec_…` secret
4. Looks up `prisma.insightShare.findFirst({ where: { providerMessageId: emailId } })`
5. On `email.delivered` → stamps `deliveredAt`
6. On `email.opened` → stamps `openedAt`, sets `status='opened'`
7. On `email.bounced` / `email.complained` → sets `status='failed'`, records `errorMessage`
8. Emits a `share.*` notification event into the D-4 engine

**Already deployed in production**, env var `RESEND_WEBHOOK_SECRET` confirmed set per D-4 completion report.

### 5.2 What D-5 must change in the webhook

The webhook is currently **single-table** — only updates `InsightShare`. With D-5, a Resend `email_id` could now refer to either an `InsightShare` row OR a `DailyBriefSend` row.

**Two options**, both backwards-compatible:

| Option | Approach | Trade-off |
|---|---|---|
| **(α) Try-then-fall-through** | After `findFirst({ providerMessageId })` on `InsightShare`, if no match, also try `DailyBriefSend`. | Simple; one extra query per webhook event for daily-brief sends; assumes message IDs never collide across tables (Resend IDs are globally unique, so this holds). |
| **(β) Type discriminator on payload** | Resend supports `tags` on `emails.send()`. Tag every D-5 send with `{ tag: 'daily-brief' }`. Webhook reads the tag and routes accordingly. | Cleaner, but requires Resend to surface tags in the webhook payload (need to verify — Resend docs say `data.tags` is delivered on event payloads, so yes). Slightly more code for the type discriminator. |

**Recommend (α)** for V1: minimal change, no payload-shape dependency, easy to migrate to (β) later if message-ID lookup becomes a hot path. Documented decision.

### 5.3 Bounce handling (spec §B.5)

Spec: "3 hard bounces → auto-disable subscription + notify admin."

Implementation: add a `bounceCount` counter to `DailyBriefSubscription`. On `email.bounced` event in the webhook, increment; if `>= 3`, set `enabled=false`, write a row to `AdminNotification` with `severity='warning'`. The existing notification engine fires no email here (admin sees it in the Ops Center).

### 5.4 SPF / DKIM / DMARC

D-3 completion report confirms `zyrix.co` domain authentication passed Gmail / Outlook tests in prod. D-2.5 verification (B.6) confirmed Resend accepted real production sends with stamped `providerMessageId`. **No DNS work needed for D-5.**

### 5.5 Inbound webhook configuration

The `RESEND_WEBHOOK_SECRET` is set in Railway. The webhook URL `https://api.finsuite.zyrix.co/api/webhooks/resend` should already be registered with Resend (per D-4 completion). **D-5 doesn't need to touch the Resend dashboard** unless we discover the registration is missing — flag check for B.0.

---

## 6. Open decisions for Mehmet (BLOCKERS for Phase B)

These are not infrastructure changes — they're schema and architecture choices that materially change the commit sequence in the spec. None of them require Mehmet to read code; each has a recommended default.

### 6.A — Subscription model: separate table OR extend `NotificationPreference`?

`NotificationPreference` (D-4) **already has** `digestFrequency: 'instant'|'hourly'|'daily'|'never'` per merchant. The daily-brief subscription is conceptually a fifth digest mode.

| Option | Schema impact | Trade-off |
|---|---|---|
| **(A1) New `DailyBriefSubscription` table** (per spec §B.1) | One new table, FK to Merchant, `merchantId @unique`. | Clean isolation; lets `enabled / frequency / sendHourLocal / weeklyDay / lastSentAt / bounceCount` evolve independently of D-4 prefs. |
| **(A2) Extend `NotificationPreference`** with `dailyBriefEnabled / dailyBriefHourLocal / dailyBriefFrequency / dailyBriefWeeklyDay / dailyBriefLastSentAt / dailyBriefBounceCount` columns | No new table; six columns added to existing model. | Couples two concerns; harder to reason about; spec's `engagement stats` UI ("Last 30 days: 28 sent, 24 opened…") needs a separate `DailyBriefSend` log table anyway, so the table-count savings are small. |

**Recommended: (A1)**, exactly per spec §B.1, with one change: `merchantId` instead of `userId`.

### 6.B — Naming collision with `customer_daily_brief`

There is **already** a `CustomerDailyBrief` table (line 1904 of `schema.prisma`) — it caches the in-app brief content (the 3 cards) per customer per day, expires next 6 AM local. Created earlier in Phase 16 / D-1.

The spec's proposed `DailyBriefSubscription` and `DailyBriefSend` will sit next to it. The names will **collide in code grep** and **confuse future maintainers**.

| Option | Naming |
|---|---|
| **(B1) Spec-as-written**: `DailyBriefSubscription` + `DailyBriefSend` | Risk: greppin' "daily brief" returns three different concerns. |
| **(B2) Email-prefixed**: `DailyBriefEmailSubscription` + `DailyBriefEmailDispatch` | Verbose but unambiguous. |
| **(B3) Morning-Brief naming**: `MorningBriefSubscription` + `MorningBriefSend` (matches the user-visible "Morning Brief" subject line in EN) | Clean separation from in-app `customer_daily_brief` cache. |

**Recommended: (B3)** — also matches the spec's user-facing copy ("Zyrix Morning Brief"). Will change commit messages from `feat(brief): …` to `feat(morning-brief): …`.

### 6.C — Hero image generation: which renderer?

Spec §B.4 proposes `node-canvas` OR `@vercel/og`. Both are **net-new infrastructure deps** and require explicit approval per the hard rule.

| Option | Cost | Trade-off |
|---|---|---|
| **(C1) `@vercel/og`** | Adds `@vercel/og` (~6 MB), pulls in `satori` + `yoga-wasm`. Server-side React→PNG with display-md font support. | Fast (~50–100 ms per render), supports custom fonts, modern. Adds infra deps. |
| **(C2) `node-canvas`** | Adds `canvas` (~30 MB native module), needs `libcairo2` + `libjpeg62-turbo` apt packages. **Ubuntu Noble t64 risk** (we just hit this in D-2.5 with Chromium libs). | Powerful, but the apt-package surface area expansion is exactly the failure mode D-2.5 closed. Strongly de-recommended. |
| **(C3) Reuse Puppeteer** (already deployed, post-D-2.5 stable) | Zero new deps. Render a 1200×400 HTML page → PNG via the same `pdfRenderer` we built for D-2. | Slower (~2–3 s per render vs. ~100 ms), but **fits perfectly inside the 15-min cron tick**. Caches per-merchant per-day so cost is amortized. |
| **(C4) No hero image — pure CSS gradient header** | Zero new deps, zero new code. Header text becomes inline `<h1>` over CSS `radial-gradient` mesh, exactly as the D-3 share email already does. | Loses the "name overlaid in display-md with cyan glow" effect on Outlook Desktop (where CSS gradients fall back to solid). Saves a meaningful amount of work and storage. |

**Recommended: (C4) for V1**, with a clean upgrade path to (C3) later. Rationale: the D-3 share email already proves that a pure-CSS gradient header reads as cinematic in Gmail / Apple Mail / Outlook Mac. If retention data shows we want the photographic hero, we can promote to (C3) without changing the schema or the send pipeline. (C1) and (C2) require explicit infra approval first.

### 6.D — Wire daily-brief through D-4 notification engine OR build its own pipeline?

The D-4 engine (`services/notifications/engine.ts`) handles per-channel routing with quiet hours, mute, and prefs. The daily brief **could** be modeled as a new event severity ("DAILY_BRIEF") that fires through the engine.

| Option | Trade-off |
|---|---|
| **(D1) New severity, route through engine** | Free quiet-hours / mute support; per-merchant channel matrix. But: the engine persists every event to the in-app `Notification` table, which would create one notification row per daily brief — noisy. Would need an opt-out flag on event types. |
| **(D2) Daily brief is its own pipeline** (per spec) | Simple: scheduler → generator → renderer → `resend.emails.send()` → `DailyBriefSend` log. Honors the dedicated `DailyBriefSubscription.enabled` toggle. Doesn't pollute the in-app notification feed. |

**Recommended: (D2)** — exactly per spec. The daily brief is intentionally a different surface from notifications (it's a ritual, not an alert). The two systems share Resend but no other state.

### 6.E — Brief content: trigger fresh AI generation OR reuse cached?

`aiBriefController.getBrief` caches in `customer_daily_brief` for the day (expires next 6 AM local). If the merchant has opened the in-app dashboard today, the cache is warm. If not, the row is missing.

| Option | Trade-off |
|---|---|
| **(E1) If cache miss, generate fresh** (per spec §B.3 step 2) | Best content. But `aiBriefController.getBrief` is the protected file ("no modifications without approval") — this is fine because we'd be **calling** it (or factoring out the generation helper), not editing it. Costs one Gemini call per cache miss per morning. |
| **(E2) If cache miss, fall back to last available brief** | Cheaper. Lower content quality on quiet days. |
| **(E3) Skip the email entirely on cache miss** | Cheapest. But spec calls for daily delivery — defeats the purpose. |

**Recommended: (E1)**, with the implementation extracting the generator function from `aiBriefController.ts` into a shared `services/customer/dailyBriefGenerator.ts`. **This refactor touches `aiBriefController.ts`** — ⚠️ **needs explicit approval** per the hard rule. Alternative: leave the controller alone and have the scheduler hit the controller's HTTP endpoint internally with a service token. Less elegant, but zero changes to the protected file.

---

## 7. Files inventoried

### Backend (`zyrix-finsuite-backend`)

```
src/index.ts                                     ← route registration (line 80, 124, 160 relevant)
src/config/env.ts                                ← env vars: RESEND_API_KEY, CRON_SECRET present
src/controllers/cronController.ts                ← existing cron handler pattern (200-line reference)
src/routes/cronRoutes.ts                         ← /api/cron mount; D-5 adds one route
src/controllers/customer/aiBriefController.ts    ← PROTECTED — generates brief content
src/services/customer/merchantSnapshot.ts        ← PROTECTED — KPI snapshot for AI grounding
src/services/customer/kpiComputations.ts         ← PROTECTED — KPI registry
src/services/emailService.ts                     ← legacy email helper; SHA: stable since stage 8B
src/services/sharing/sendShareEmail.ts           ← D-3 send wrapper; reusable as send-call template
src/services/sharing/shareEmailTemplate.ts       ← D-3 cinematic email chrome; reusable
src/services/notifications/engine.ts             ← D-4 multi-channel dispatcher; D-5 bypasses
src/services/notifications/quietHours.ts         ← localHourIn(tz, when) — REUSE in scheduler
src/services/notifications/templates/notificationEmail.ts  ← D-4 email shell reference
src/services/notifications/channels/emailChannel.ts        ← D-4 Resend driver reference
src/services/pdf/templates/dailyBrief.ts         ← PDF template (different surface — kept for parity)
src/routes/webhooks/resend.ts                    ← D-4 webhook route (express.raw)
src/controllers/webhooks/resendWebhookController.ts        ← D-4 HMAC-verified handler; D-5 EXTENDS lookup
prisma/schema.prisma                             ← line 362 Merchant; 1132 Notification; 1169 NotificationPreference; 1904 CustomerDailyBrief; 2040 InsightShare
nixpacks.toml                                    ← UNCHANGED in D-5
railway.toml                                     ← UNCHANGED in D-5 (Railway cron is dashboard-configured)
package.json                                     ← UNCHANGED in D-5 (no new deps proposed)
```

### Frontend (`zyrix-finsuite`)

```
src/App.jsx                                      ← line 22, 295 — NotificationPreferencesPage at /settings/notifications
src/pages/v2/notifications/NotificationPreferencesPage.jsx  ← D-4 prefs UI; D-5 ADDS a "Daily Brief" section
src/api/v2/notifications.js                      ← D-4 API helpers; D-5 may add daily-brief CRUD helpers next to it OR a new src/api/v2/morningBrief.js
src/components/v2/notifications/                 ← D-4 cinematic notification components — design tokens reference
docs/sprint-d{1..4,2.5}-{discovery,completion}-*.md  ← prior sprint docs (this file follows the same format)
```

### What does NOT exist yet (will land in Phase B)

```
backend:
  prisma/manual-migrations/2026-05-1X_morning_brief_d5.sql   (or whichever B.1 commit chooses)
  src/jobs/dailyBriefScheduler.ts          (per spec §B.2)
  src/services/dailyBrief/generator.ts     (per spec §B.3) — naming TBD per §6.B
  src/services/dailyBrief/emailTemplate.ts (per spec §B.6 of email design)
  src/controllers/customer/morningBriefSubscriptionController.ts  (settings panel CRUD)
  src/controllers/publicUnsubscribeController.ts                  (signed JWT, no auth)
  src/routes/customer/morningBrief.ts
  src/routes/unsubscribe.ts                  (PUBLIC — like /share)
  src/controllers/admin/emailEngagementController.ts
  src/routes/admin/emailEngagement.ts

frontend:
  src/pages/v2/notifications/MorningBriefPanel.jsx           (sub-component of NotificationPreferencesPage)
  src/pages/v2/morningBrief/UnsubscribePage.jsx              (cinematic gradient + glass card)
  src/pages/v2/admin/EmailEngagementPage.jsx
  src/i18n/dashboard/morningBrief.{tr,en,ar}.json
```

(Names assume §6.B = B3 — "Morning Brief". If Mehmet picks B1 or B2, swap `morningBrief` for `dailyBriefEmail` everywhere above.)

---

## 8. Hard-rule compliance checklist

| Rule | Status |
|---|---|
| No infra change without approval | ✅ This phase: zero changes to `nixpacks.toml`, `railway.toml`, `package.json`, Node version, env vars. Phase B as scoped also adds zero new infra deps (decision §6.C recommends C4 = no renderer addition). |
| `merchantId` everywhere, NOT `companyId` | ✅ All schema and controller proposals in this doc use `merchantId`. |
| No mods to `aiBriefController.ts` / `merchantSnapshot.ts` / KPI logic without approval | ⚠️ §6.E asks for explicit approval to extract a generator helper from `aiBriefController.ts`. If declined, we use the alternate (HTTP-loopback) approach. |
| Plain JSX + inline styles + design tokens — no Tailwind / TS / shadcn | ✅ Frontend pages will follow the existing `NotificationPreferencesPage.jsx` pattern (plain JSX, `@/design-system-v2/cinematic/tokens`, `GlassCard / GradientMesh / NeonBadge` from `@/components/foundation`). |
| All commit messages in English | ✅ Will follow. |
| Strict micro-commits | ✅ Phase B sequence in spec §"Commit Sequence" is already a 13-commit plan; will follow line-by-line. |
| Stop on unexpected output | ✅ Will follow. |

---

## 9. Phase B readiness

Phase A is complete. Phase B is blocked on Mehmet's answers to the 5 questions in §6:

| Decision | Recommended | Impact if changed |
|---|---|---|
| **6.A** Subscription model shape | A1 (new dedicated table) | A2 reshapes B.1 commit; UI panel reads from `NotificationPreference` instead. |
| **6.B** Naming | B3 (`MorningBrief…`) | B1 or B2 changes commit messages and ~20 file names. |
| **6.C** Hero image renderer | C4 (pure-CSS, no new dep) | C1 or C2 needs explicit infra approval; C3 adds a `services/dailyBrief/heroImage.ts` Puppeteer call but no new dep. |
| **6.D** Engine routing | D2 (own pipeline, per spec) | D1 changes the entire dispatch architecture. |
| **6.E** AI brief generator extraction | E1 (extract helper) — needs approval to touch `aiBriefController.ts` | If declined → use HTTP-loopback alternative (slightly slower, no protected-file edit). |

Once Mehmet confirms the picks above, Phase B proceeds autonomously per the spec's commit sequence.

---

**Phase A — DONE. Awaiting review.**
