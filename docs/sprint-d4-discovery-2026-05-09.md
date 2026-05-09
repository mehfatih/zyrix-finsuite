# Sprint D-4 — Notification System: Discovery Report

**Date:** 2026-05-09
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Branch:** `main`
**Scope:** Phase A of `sprint-d4-notifications.md` — read-only audit. One commit (this doc). Phase B awaits approval.

---

## TL;DR

A surprising amount of D-4 plumbing is already in the repo:

- **`Notification` model exists** in Prisma — used by 8+ existing controllers (tax calendar, stock alerts, factoring, installments, etc.). Simpler than the D-4 spec but enough to extend, not replace.
- **`/api/notifications`** is mounted with three working endpoints: `list`, `markRead`, `markAllRead` (`src/controllers/notificationController.ts`).
- **`NotificationsPage.jsx`** already exists (legacy V1 dashboard) — admin-styled, used inside `CustomerDashboard.jsx`. The cinematic V2 archive page in D-4 spec will be a new page; the V1 stays untouched.
- **`ToastSystem.jsx`** exists with a working `ToastProvider` Context — currently mounted per-page, not globally. We'll either lift it to App level or build a fresh cinematic toast.
- **Service worker present** at `public/sw.js` (cache-first; doesn't handle push). For Web Push we'd add a new `notification-sw.js` or extend the existing one.
- **`Merchant.timezone`** carries the user's TZ (`Europe/Istanbul` default); good enough for quiet-hours logic.
- **No SSE/WebSocket usage anywhere** — both backend and frontend are clean. SSE is doable code-only (Express supports it natively, Railway preserves long-lived connections); no new deps needed.

**Three items DO require your explicit approval before Phase B starts** (per the new hard rule on infrastructure):

1. **`web-push` npm dependency** on backend (~50 KB) — required to send Web Push messages
2. **VAPID keys** as Railway env vars (`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`) — required by Web Push protocol; can generate locally and propose values
3. **`RESEND_WEBHOOK_SECRET`** env var on Railway — required to verify Resend webhooks for D-3's `deliveredAt`/`openedAt` columns

If any of those three are blocked, the affected paths can be deferred (similar to how D-2.5 will catch up D-2's runtime block). The rest of D-4 — in-app notification center + SSE real-time delivery + email channel + smart batching + preferences — has zero infrastructure dependencies and ships clean.

A fourth small adjudication: D-4 spec §B.9 says "hook into `aiBriefController` after generating insights → fire `insight_critical` event." The carry-over hard rule says no modifications to `aiBriefController.ts`. Discovery doc proposes the cleanest interpretation; see Open Q4.

The rest of this is the actual audit.

---

## A.1 — Existing notification infrastructure

### Backend

**Existing `Notification` model** (`prisma/schema.prisma:1130-1142`):

```prisma
model Notification {
  id         String           @id @default(uuid())
  merchantId String
  title      String
  message    String?
  body       String?
  type       NotificationType @default(INFO)   // INFO | WARNING | SUCCESS | ERROR
  isRead     Boolean          @default(false)
  data       Json?                              // arbitrary payload — currently used to carry context
  createdAt  DateTime         @default(now())
  merchant   Merchant         @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

**Currently used by 8 controllers:** `taxCalendarController`, `stockController`, `installmentController`, `factoringController`, `checkController`, `customerScoreController`, `adminMerchantsController`, plus the dedicated `notificationController.ts`.

**Existing `notificationController.ts` endpoints:**
```
GET   /api/notifications              → list 50 most recent + unread count
PATCH /api/notifications/:id/read     → mark single read
PATCH /api/notifications/read-all     → mark all read
```
Mounted in `src/index.ts:111` as `app.use("/api/notifications", notificationRoutes)`.

**What it's missing vs D-4 spec:**

| D-4 spec field | In existing model? | Plan |
|---|---|---|
| `id`, `merchantId`, `title`, `body` | ✅ (note: spec uses `userId`+`companyId`, ours uses `merchantId`) | Keep `merchantId` (carry-over rule) |
| `type` | ✅ enum `INFO/WARNING/SUCCESS/ERROR` | Repurpose values: `WARNING` → critical, `INFO` → opportunity, etc. OR add new enum values |
| `insightId`, `shareId` direct relations | ❌ but `data: Json?` can carry IDs | Recommend ADDING optional FK columns for indexability |
| `ctaLabel`, `ctaRoute` | ❌ | Add columns |
| `iconTone` | ❌ | Add column |
| `channelsSent String[]` | ❌ | Add column |
| `read` flag | ✅ as `isRead` | Use existing |
| `readAt` timestamp | ❌ | Add column |
| `archived` flag | ❌ | Add column |

**Recommendation: extend the existing `Notification` model.** Backward compatible with all 8 existing controllers (they keep working — they just don't populate the new fields). The D-4 cinematic notification center reads the new fields but defaults gracefully when they're missing. Single source of truth for notifications across the app.

Same pattern as D-1's `Insight` model addition — additive, non-breaking.

### Frontend

**`src/components/dashboard/ToastSystem.jsx`** — full Context-based `ToastProvider` + `useToast()` hook with success/error/warning/info variants. ~200 LOC. Currently used inside individual dashboard pages (`NotificationsPage`, `CustomerDashboard`), NOT mounted globally in `App.jsx` or `main.jsx`.

**`src/pages/dashboard/NotificationsPage.jsx`** — V1 legacy admin-styled list of notifications. Lives inside `CustomerDashboard.jsx`'s tab system at `/dashboard/notifications` (within the V1 customer dashboard). It uses `ToastProvider` locally, fetches `/api/notifications`, and applies category filters. Out of scope to modify; D-4 V2 archive is a new page.

**`src/i18n/dashboard/notifications.{tr,en,ar}.json`** — pre-built translations for the V1 page. Not directly reusable by V2 (different copy needs) but a useful reference.

### Real-time delivery

**Backend:** Express ≥ 4 supports SSE natively — no new dep. Set `Content-Type: text/event-stream`, write `data: {…}\n\n` on the response, leave the connection open with `res.flushHeaders()`. Railway's HTTP edge keeps long-lived connections alive (their default idle timeout is 5 min, but periodic keepalive comments `: ping\n\n` solve that).

**Frontend:** browser-native `EventSource` — no dep. Wrap in a `useNotificationStream()` hook that auto-reconnects with exponential backoff on close.

**No WebSocket / Socket.IO infrastructure exists.** Per spec, prefer SSE. Confirmed feasible.

### Frontend toast wiring

`ToastProvider` is NOT mounted at App level. Per-page mount means a new toast emitted from one page disappears when the user navigates. For D-4's "real-time toast on incoming notification anywhere in the app", we need to lift the provider to App.jsx or build a fresh cinematic toast component (recommended — the existing ToastSystem uses dashboard admin palette, not cinematic tokens).

---

## A.2 — Push notification options

### Web Push (V1 priority)

**Required infrastructure:**
- Backend: `web-push` npm dependency (~50 KB)
- VAPID key pair (P-256 ECDSA): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto)
- DB: `WebPushSubscription` model storing `endpoint`, `p256dh`, `auth` per device
- Service worker: dedicated `public/notification-sw.js` (or extend existing `public/sw.js`)

**Cost:** zero ongoing — VAPID + browser native APIs, no third-party (FCM, OneSignal etc. forbidden per spec).

**Approval required for:**
- The `web-push` npm dep (infra change per new hard rule)
- The 3 VAPID env vars on Railway (infra change)

**If approved, Phase B work:**
- Generate VAPID keys locally with `npx web-push generate-vapid-keys`, propose values for you to paste into Railway secrets
- Add `web-push` dep
- Build subscription endpoints + service-worker push handler

**If not approved for D-4:** ship the in-app + email + SSE channels; queue Web Push as a separate "D-4.5: Web Push enablement" mini-sprint once you sign off on the dep + env vars.

### Mobile push

**No mobile app exists in this repo or any sibling directory I can see.** No `react-native`/`expo` dependencies in `package.json`. No `zyrix-app-tr` or `finsuite-mobile` repo accessible from this Claude Code session. Per discovery direction in the spec, **mobile push is "infrastructure for future"** — zero D-4 work; the `mobilePushEnabled` field in `NotificationPreference` exists as a forward-looking flag but no driver is implemented.

### Existing service worker

`public/sw.js` (~50 LOC) is a cache-first SW for the PWA. It registers on app load via... let me check.

---

## A.3 — User preferences storage

### Existing

**`CustomerDashboardPreference`** (`prisma/schema.prisma:1819`):
```prisma
model CustomerDashboardPreference {
  id                String   @id @default(uuid())
  customerUserId    String   @unique
  kpiSlots          Json     @default("[\"mrr\",\"cash_runway\",\"customer_health_pct\",\"tax_burden\"]")
  aiCoPilotFocus    String   @default("all")
  sidebarCollapsed  Json     @default("{}")
  language          String   @default("tr")
  role              String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([customerUserId])
  @@map("customer_dashboard_preferences")
}
```

Used by D-1's preferences endpoint. Scope is dashboard layout + AI focus + role.

### Recommendation

**Add a separate `NotificationPreference` model** (per D-4 spec) rather than extending `CustomerDashboardPreference`. Reasons:
- Different lifecycle (notification prefs change rarely, dashboard prefs change often)
- Cleaner indexability for the notification engine ("find prefs for users who opted in to email digest")
- Keeps `CustomerDashboardPreference` focused on its purpose
- Spec-aligned

Adapted to our schema (`merchantId`, not `userId`):

```prisma
model NotificationPreference {
  id                  String    @id @default(cuid())
  merchantId          String    @unique

  // Per-channel master toggles
  inappEnabled        Boolean   @default(true)
  emailEnabled        Boolean   @default(true)
  webPushEnabled      Boolean   @default(false)
  mobilePushEnabled   Boolean   @default(false)   // V0 — no driver yet, kept for forward compat

  // Per-event-type subscription matrix (which channels for which severity)
  criticalChannels    String[]  @default(["inapp", "email", "webpush"])
  attentionChannels   String[]  @default(["inapp", "email"])
  opportunityChannels String[]  @default(["inapp"])
  shareEventChannels  String[]  @default(["inapp"])

  // Smart batching
  digestFrequency     String    @default("instant")  // 'instant' | 'hourly' | 'daily' | 'never'
  quietHoursStart     Int?                            // 0-23 in user's tz; null = no quiet hours
  quietHoursEnd       Int?
  // timezone NOT duplicated here — read from Merchant.timezone (single source of truth)

  // Mute kill-switch
  mutedUntil          DateTime?

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  merchant            Merchant  @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

Default behavior on first read: if no row exists for the merchant, treat the defaults above as the implicit pref set. The actual row is created the first time the merchant edits a setting.

---

## A.4 — Quiet hours / timezone awareness

**`Merchant.timezone String @default("Europe/Istanbul")`** — already exists, set at registration. Saudi merchants get `Asia/Riyadh`. We use this as the single source of truth; **no duplication into `NotificationPreference`**.

### Quiet hours logic

For a non-critical event:
1. Load `Merchant.timezone`
2. Compute current local hour in that TZ via `Intl.DateTimeFormat(..., { hour: 'numeric', hour12: false, timeZone })`
3. If `quietHoursStart`/`quietHoursEnd` is set and current hour falls inside the range → defer to next "active" hour
4. Critical events override quiet hours by default (with an opt-out toggle via the same channels matrix)

### "Send during business hours only"

Sprint mentions this loosely. Recommend interpreting as: a separate boolean `businessHoursOnly` (extension to the model — flag if you want; otherwise users get quiet-hours fine-grained control). Out of scope for D-4 V1; users with strict "9-17 only" needs configure quiet-hours `17 → 9`.

### TR vs SA business hours

- TR: 09-18 work hours, lunch 12-13. Friday is a normal workday.
- SA: 08-17 work hours (or 09-18), Friday is the weekend (work week is Sun-Thu); shorter hours during Ramadan.

Encoding all of this into "business hours only" is out of scope. Use `quietHoursStart`/`quietHoursEnd` as the universal mechanism; merchants set their own preferred range.

---

## A.5 — D-3 webhook handoff (Resend deliveredAt/openedAt)

D-3 closed with `InsightShare.deliveredAt` and `openedAt` columns nullable, awaiting D-4. Resend's webhook posts `email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.complained` events to a public webhook URL.

**To wire:**
- New public route: `POST /api/webhooks/resend` (no auth middleware)
- Verify the webhook signature using Svix-style HMAC over the raw body
- Map event types → `InsightShare.deliveredAt` / `openedAt` updates (find by `recipientSnapshot.providerMessageId` which we stored at send time)
- Also fire `share.delivered` / `share.opened` events into the notification engine (D-3's `shareEvents.ts` reserved these event types)

**Requires:**
- New env var `RESEND_WEBHOOK_SECRET` on Railway (needs your approval)
- One new route + one new controller (code only, ~150 LOC)
- Resend dashboard config: register the webhook URL, copy the signing secret

**Note:** the `providerMessageId` from D-3 is currently stored in the share-send result but NOT persisted on the InsightShare row. To enable webhook → row mapping, we'd need to add `InsightShare.providerMessageId` (additive column). Trivial migration.

---

## Architecture summary (Phase B)

### Backend

```
src/services/notifications/
├── engine.ts                    # dispatch(event) — entry point
├── routing.ts                   # which channels to use given prefs + event severity
├── batching.ts                  # digest + quiet-hours scheduler
├── timezones.ts                 # tz-aware "now hour" helper
├── channels/
│   ├── inappChannel.ts          # writes Notification row + emits SSE
│   ├── emailChannel.ts          # builds branded email via Resend (3 templates)
│   ├── webPushChannel.ts        # web-push lib (ONLY if approved)
│   └── _types.ts                # ChannelDriver interface
├── sseHub.ts                    # in-memory map of connected clients per merchantId
└── templates/
    ├── criticalEmail.ts         # urgent feel, glow accents (digital + print themes via D-2 palette)
    ├── attentionEmail.ts        # informational
    └── opportunityEmail.ts      # positive

src/controllers/customer/
├── notificationsV2Controller.ts # GET/list, GET/unread-count, GET/stream (SSE),
│                                # PATCH/:id/read, PATCH/bulk-read, PATCH/:id/archive
├── notificationPrefsController.ts  # GET/PATCH preferences
└── webPushController.ts         # POST /subscribe, DELETE /unsubscribe (if web-push approved)

src/controllers/
└── webhooks/
    └── resendWebhookController.ts  # POST /api/webhooks/resend (D-3 follow-up)

src/routes/customer/notificationsV2.ts
src/routes/customer/preferences.ts
src/routes/customer/webPush.ts
src/routes/webhooks/resend.ts

prisma/manual-migrations/
└── 2026-05-09_notification_d4.sql  # extends notifications table + adds notification_preferences + (optionally) web_push_subscriptions
```

### Frontend

```
src/components/v2/notifications/
├── NotificationBell.jsx               # header bell + pulse-dot badge
├── NotificationDropdown.jsx           # glass panel with Yeni / Bu hafta / Daha eski sections
├── NotificationToast.jsx              # cinematic real-time toast (replaces dashboard ToastSystem for V2)
├── NotificationListItem.jsx           # compact + full variants
├── WebPushPermissionPrompt.jsx        # cinematic consent UI (only mounts if web-push approved)
├── NotificationSoundToggle.jsx
└── index.js

src/hooks/v2/
├── useNotificationStream.js           # EventSource wrapper with auto-reconnect
├── useNotificationsList.js            # paginated list + mark-read
├── useNotificationPrefs.js
└── useNotificationCount.js            # unread-count poll/stream

src/api/v2/
├── notifications.js
└── webPush.js                         # only if approved

src/pages/v2/notifications/
├── NotificationArchivePage.jsx        # /notifications
└── NotificationPreferencesPage.jsx    # /settings/notifications

src/main.jsx                           # mount cinematic ToastProvider at app root
```

### API endpoints (corrected for `merchantId` convention)

```
GET    /api/customer/notifications              list (paginated by ?page&limit&filter=type|status)
GET    /api/customer/notifications/unread-count badge count
GET    /api/customer/notifications/stream       SSE stream (auth via JWT in query OR cookie since EventSource can't set headers)
PATCH  /api/customer/notifications/:id/read     mark single read
PATCH  /api/customer/notifications/bulk-read    mark all read (or filtered subset via body)
PATCH  /api/customer/notifications/:id/archive  archive

GET    /api/customer/preferences/notifications  get prefs (or defaults if no row)
PATCH  /api/customer/preferences/notifications  update prefs

POST   /api/customer/web-push/subscribe         persist endpoint+keys (only if web-push approved)
DELETE /api/customer/web-push/unsubscribe

POST   /api/webhooks/resend                     no auth; HMAC-verified; updates D-3 InsightShare delivered/openedAt
```

**SSE auth note:** the browser `EventSource` API cannot send custom headers (no `Authorization: Bearer …`). Two options:
- Pass JWT as a query string param (e.g. `?token=…`) — short-lived risk if logged
- Use a short-lived signed "stream token" issued via a separate endpoint, single-use against the SSE endpoint

Recommend a short-lived JWT approach with 5-minute expiry, signed with the existing `env.jwtSecret` and issuer `"zyrix-finsuite-d4-stream"`. Same pattern as D-3's `shareToken.ts`.

### Triggers (where notifications fire)

- **D-1 insight generation** — when `aiBriefController` finishes `persistInsights()`, it should also emit a `notifications.insight_critical` event for any CRITICAL row. **See Open Q4** for how to do this without modifying business logic.
- **D-3 share events** — `shareEvents.ts` already exists with the right event taxonomy (`share.sent`, `share.failed`, `share.delivered`, `share.opened`, `share.downloaded`). The notification engine subscribes there directly — no controller changes needed.
- **System events** — subscription changes, payment failures: hooked at the relevant existing controllers (out of scope for first D-4 cut; can add later).

---

## Discrepancies vs prompt assumptions (consolidated)

| # | Prompt | Reality | Resolution |
|---|---|---|---|
| 1 | `companyId` + `userId` FKs | Schema: `merchantId` only | Use `merchantId` (carry-over) |
| 2 | "any existing Notification model in Prisma schema?" | **Yes**, model + enum + 8 active consumers + controller + route | Extend, don't replace |
| 3 | "Existing in-app toast/snackbar system?" | **Yes**, `ToastSystem.jsx` (dashboard admin palette, not cinematic) | Build a new cinematic `NotificationToast.jsx`; lift global provider to `main.jsx`. Legacy ToastSystem stays for V1 pages |
| 4 | "WebSocket/SSE infrastructure?" | **None.** Express supports SSE natively, no dep. | Use SSE — code-only addition |
| 5 | "React Native / native app?" | **No mobile repo accessible.** | mobilePush is V-future; only flag in `NotificationPreference` |
| 6 | "Existing UserPreferences model?" | `CustomerDashboardPreference` exists (dashboard layout scope) | Add separate `NotificationPreference` model |
| 7 | "Where is user timezone stored?" | `Merchant.timezone` (already exists) | Reuse — single source of truth |
| 8 | aiBriefController hook for insight_critical event | Hard rule: no modifications | See Open Q4 |
| 9 | "Generate VAPID keys + store in Railway secrets" | Env var addition | **Requires approval** — see Open Q1 |
| 10 | `web-push` lib | Not installed | **Requires approval** — see Open Q1 |
| 11 | Resend webhooks for D-3 deliveredAt/openedAt | Not wired | Q3: approve `RESEND_WEBHOOK_SECRET` env var? |

---

## Risk register

### R1 — Web Push depends on env vars + a new dep (Open Q1)

If approval is delayed, defer Web Push entirely; ship D-4 with in-app + email + SSE. The `WebPushSubscription` model + `webPushEnabled` flag are present but no driver runs.

### R2 — SSE auth via query-string JWT (Open Q2)

EventSource doesn't allow auth headers. Acceptable mitigations:
- (a) Short-lived stream JWT (5 min, separate issuer claim) — recommend this
- (b) Cookie-based session (would require auth-cookie infrastructure we don't have)
- (c) WebSocket with handshake auth (rejected per spec preference)

### R3 — SSE keepalive on Railway

Railway's HTTP edge has a default ~5 min idle timeout. Mitigation: every 30s the SSE handler writes `: ping\n\n` (a comment, ignored by EventSource clients) to keep the connection alive. Adds ~120 bytes/min/client. Trivial.

### R4 — Notification storm during onboarding

A merchant who first signs up could trigger many notifications at once (welcome, daily brief, tax events, etc.). Without batching/throttling, this fatigues immediately. Mitigation: the `digestFrequency = "instant"` default still goes through the batcher's burst-suppression logic (collapse N events of the same type within 5 min into one notification with a count). Implement in `batching.ts`.

### R5 — Resend webhook spam

Resend webhooks fire many events per email (sent + delivered + opened + bounced + complained). For 100 emails/month that's ~500 webhook calls. Negligible CPU; ensure idempotency (multiple `delivered` events for the same email shouldn't double-stamp `deliveredAt`).

### R6 — aiBriefController edit (Open Q4)

The hard rule says no modifications to `aiBriefController.ts`. The simplest D-4 implementation adds one line at the end of the existing `persistInsights()` helper (which we already added in D-1) to fire a notification event. That's storage/event emission, not business logic — same precedent. But it does mean editing the file; want explicit approval.

Alternative: a polling worker that watches `Insight.createdAt > lastCheck` every 30s and fires events for new CRITICAL rows. Decoupled but adds a background job + DB load.

### R7 — Mobile push without an app

The `mobilePushEnabled` flag in `NotificationPreference` exists for forward compat. If a mobile app appears later, the channel slot is reserved. Zero D-4 implementation work.

---

## Four small questions for explicit approval before Phase B

1. **Web Push enablement** — approve `web-push` npm dep + 3 VAPID env vars on Railway? If yes, I generate keys locally during Phase B and propose values for you to paste into Railway secrets. If no, defer Web Push to a "D-4.5" mini-sprint and ship D-4 without it. **Recommend: yes — it's the most-requested notification channel for desktop merchants and there's no other way to do browser push.**
2. **SSE auth strategy** — confirm short-lived stream-JWT (5-min expiry, separate issuer) is acceptable, OR pick a different mechanism. **Recommend: short-lived stream-JWT** (matches D-3's `shareToken.ts` pattern).
3. **Resend webhook for D-3 follow-up** — approve adding `RESEND_WEBHOOK_SECRET` env var so we can wire `InsightShare.deliveredAt`/`openedAt` and fire `share.delivered` / `share.opened` notifications? **Recommend: yes — D-3 explicitly deferred this to D-4.**
4. **`aiBriefController.ts` notification trigger** — approve a one-line addition inside the existing `persistInsights()` helper (call `notificationEngine.dispatch({ type: "insight_critical", … })` after the prisma create for any CRITICAL row)? Same precedent as D-1's persistInsights addition. Alternative is a 30s polling worker (decoupled but adds load). **Recommend: yes, single line in `persistInsights()`** — no business-logic change.

If those four answers go as recommended, Phase B proceeds with: 1 dep added + 4 env vars added (3 VAPID + 1 Resend webhook) + ~25 commits across two repos. **Without (1) and (3), the dep set and env-var set stay exactly as today** and we ship a smaller "D-4 V1" without Web Push and without Resend webhook tracking.

---

## Files read during this audit

Backend:
- `prisma/schema.prisma` (Notification, NotificationType, CustomerDashboardPreference, AdminNotification, Merchant.timezone)
- `src/controllers/notificationController.ts` + `src/routes/notifications.ts`
- `src/index.ts` (route mounts)
- `package.json` (dep audit: no web-push, no SSE/WS deps)

Frontend:
- `src/components/dashboard/ToastSystem.jsx` (legacy V1 toast)
- `src/pages/dashboard/NotificationsPage.jsx` (legacy V1 page; mounted inside CustomerDashboard tabs)
- `src/App.jsx` (no notification route at app level today)
- `public/sw.js` (cache-only service worker, no push handler)
- `package.json` (no react-native, no expo, no push deps)

External:
- D-3's `shareEvents.ts` (event taxonomy reserved for D-4 subscriber)
- D-3's `InsightShare.deliveredAt` + `openedAt` columns (nullable, awaiting webhook)
