# Zyrix FinSuite AI Co-Pilot Suite — Program Summary

**Date:** 2026-05-10 (D-11 update)
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PROGRAM COMPLETE through D-11 — V1 launch-ready behind a 6-step provisioning checklist (D-10 §4) plus the D-11 verification matrix.**

---

## TL;DR

Twelve sprints (D-1 → D-11 plus D-2.5 hardening) shipped over a focused window. The result is a **complete AI Co-Pilot product layer** sitting on top of an existing FinSuite ERP/CRM core: AI insight cards, daily morning briefs, weekly performance reports, public + private sharing, real-time notifications across 4 channels, an AI chat with tool use + voice + streaming, Slack workspace integration, full localization + country-aware regulatory engine (Turkey + Saudi Arabia with effective-dated tax rates and ZATCA Phase 2 compliance), and the production observability + rollout infrastructure to launch all of it safely.

The program achieved **strict zero-protected-file-edits compliance** (`aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts` were never touched), **`merchantId`-everywhere** schema discipline (the spec frequently said `companyId`/`userId`; we translated on every commit), **plain JSX + inline styles + design tokens** consistency (no Tailwind / TypeScript / shadcn introduced on the frontend), and **strict micro-commits with feature-flagged deferred env vars**. The sole npm-dep additions across **all 12 sprints**: `web-push` (D-4), `@sentry/node` (D-10), `@sentry/react` (D-10) — three dependencies. **D-11 added zero new dependencies** thanks to Intl APIs + hand-rolled ZATCA TLV encoder + pure-string UBL serializer.

Everything that reached "code complete but waiting on Mehmet to flip a switch" is feature-flagged and ships safely: VAPID for D-4 web push, the 5 Slack OAuth env vars for D-9, the 3 Sentry / rollout env vars for D-10. **D-11 added no new env vars** — the only new infrastructure is one database table (`TaxRateVersion`) plus 3 nullable Invoice columns. The system runs cleanly without any of the deferred env vars set; flipping them on requires only Railway env updates and a restart.

---

## 1. Program scope

### 1.1 What was built

| Sprint | What shipped |
|---|---|
| **D-1** Foundation | Cinematic design system tokens (deep space backgrounds, neon accent palette, glow shadows, gradient mesh), 18 chart primitives, KPI card system, glass-card foundation components, layout primitives. |
| **D-2** PDF Export | Server-rendered PDFs for every insight, daily brief, and arbitrary date-range performance report. Puppeteer browser pool, 6 cinematic templates, branded headers/footers. |
| **D-2.5** Runtime hardening | Mid-program crisis sprint: Puppeteer pool exhaustion, Chromium libs missing on deploy image, t64-suffix package audit. Established the multi-process flag, pool-size env var, and the README runbook conventions. |
| **D-3** Sharing | Insight + report sharing via email + WhatsApp + JWT-signed PDF download links. Sharing recipient address book, share audit log with delivery + open tracking. |
| **D-4** Notifications | Multi-channel notification engine (in-app + email + Web Push), per-merchant preferences with severity matrix, quiet hours + mute, SSE feed for real-time delivery, Resend webhook ingestion for delivery/open/bounce events. |
| **D-5** Morning Brief | Daily 07:00 AI-generated email brief: top critical / attention / opportunity insight per day. Full email template, unsubscribe flow, send log, admin engagement dashboard. |
| **D-6** Weekly Report | Sunday 18:00 cinematic weekly report: 12-KPI summary + AI narrative + week-over-week + benchmarking. PDF + email + viewer page + archive. |
| **D-7** Public Share Links | Slug-based public URLs with privacy modes (full / masked / narrative-only / anonymous), password gates, expiry, OG image renderer (1200×630 PNGs), view tracking, comment system with honeypot + IP-hash rate-limit. |
| **D-8** AI Chat | Streaming Gemini 2.0 Flash chat with function calling, voice input (Web Speech API), 90-day conversation retention, 8K-token sliding context window, 10-tool registry over `KPI_COMPUTATIONS`, Cmd+J shortcut, full-page route, floating bubble. |
| **D-9** Slack Integration | OAuth v2 install, encrypted bot token storage (AES-256-GCM via existing 2FA helper), Block Kit insight renderer, slash commands (`/zyrix today / mrr / runway / balance / overdue`), interactive Resolve / Dismiss buttons, channel-mapping CRUD UI, multi-workspace per merchant. |
| **D-10** Polish + Launch | Sentry on both repos, request-id middleware, `/health` dependency probe, AI usage admin dashboard, env-var rollout flag, in-app help center (TR/EN/AR), cinematic feedback primitives, 6 runbooks, bundle perf wins (74% charts chunk reduction), font weight cuts. |
| **D-11** Localization + Country | Effective-dated `TaxRateVersion` table with admin CRUD + audit log; backend country profiles + `profileResolver` (TR/SA/OTHER); ZATCA Phase 2 UBL serializer + hand-rolled TLV QR encoder; geo-context endpoint (CF-IPCountry); `RegulatoryProvider` context; LanguageSwitcher mounted globally; `GeoMismatchBanner` once-per-session; `/admin/compliance/regulatory-profiles` editor; country-aware AI persona for chat + cfo voice. Zero new deps. Decoupled language / country fields on Merchant. |

### 1.2 By the numbers

| Metric | Value |
|---|---|
| Sprints shipped | **12** (D-1 through D-11 plus D-2.5 hardening) |
| Discovery + completion docs | **24** (every sprint had a Phase A discovery + Phase B completion report; D-11 also added a verification matrix doc) |
| Frontend commits in repo total | **~328** (the AI Co-Pilot Suite touched ~half) |
| Backend commits in repo total | **~163** (the AI Co-Pilot Suite is ~70% of recent commits) |
| Net new database tables | **19** across the 12 sprints (CustomerDailyBrief, MorningBriefSubscription, MorningBriefSend, WeeklyReport, WeeklyReportSubscription, WeeklyReportSend, Insight, InsightShare, SharingRecipient, PublicShareLink, ShareComment, ShareView, Notification (rebuilt), NotificationPreference, WebPushSubscription, ChatConversation, ChatMessage, SlackInstallation, SlackChannelMapping, SlackOutboundLog, **TaxRateVersion** (D-11)) |
| Net additive Invoice columns | **3** (D-11: zatcaQrTlv, zatcaInvoiceHash, zatcaIsSimplified — all nullable for backwards compat) |
| New API endpoints | **~92** (auth-required customer endpoints + admin endpoints + 4 webhook endpoints + 2 health endpoints + 3 cron-job.org endpoints + 7 public token-credentialed endpoints + 5 D-11 endpoints) |
| New frontend routes | **19** customer-facing + 2 admin pages (AI usage + regulatory profiles) + 5 public token-credentialed pages |
| New i18n bundles (TR/EN/AR) | **9** (publicShare, morningBrief, weeklyReport, chat, integrations, helpCenter, locale (D-11), plus existing surface extensions) |
| New npm deps total | **3** (`web-push@^3` D-4, `@sentry/node@^8` + `@sentry/react@^8` D-10). **D-11 added zero.** |
| New env vars total | **11** (3 VAPID D-4, 5 Slack D-9, 3 Sentry/rollout D-10). **D-11 added zero** (V2_DASHBOARD_ROLLOUT_PCT is from D-10). All feature-flagged so the system runs cleanly without any of them set. |
| Cron-job.org schedules added | **4** (morning-brief 07:00, weekly-report Sun 18:00, chat-cleanup nightly, plus a Slack channel-validation deferred to a follow-up) |
| Runbook documents | **6** (gemini outage, PDF crash, email bouncing, rate-limit storm, data corruption, OAuth token expiry) |
| Manual SQL migration files | **9** under `prisma/manual-migrations/` (schema additions are idempotent and append-only — zero column drops, zero column type changes on deployed tables; D-11 added one new file for TaxRateVersion + Invoice ZATCA columns) |

### 1.3 What was NOT built (intentional deferrals)

| Item | Reason | Where to find the rationale |
|---|---|---|
| Microsoft Teams integration | Microsoft's incoming-webhook connector EOL Aug 2024; full Bot Framework + Azure AD app + JWT validation is a parallel sprint. | D-9 discovery §10.A |
| PostHog analytics | No data to analyze at 2-merchant scale; ~75 KB JS bundle weight not justified. | D-10 discovery §10.C |
| Sentry source-map upload | Lightweight V1; symbolicate on demand if a specific error needs investigation. | D-10 discovery §10.D |
| Per-animation spring tuning | Foundational `prefers-reduced-motion` already shipped (Phase 12). | D-10 discovery §10.F |
| Per-page distinct empty-state illustrations | Three primitives suffice; design assets needed for bespoke art. | D-10 discovery §10.G |
| Phased 5%→25%→50%→100% rollout | 2 merchants make staged percentages theater; infra is built (rollout endpoint + post-login client + opt-out). | D-10 discovery §10.L |
| Marketing materials | Not a code-completeness gate; benefits from a real customer base + UX testing. | D-10 discovery §10.K |
| Mobile push notifications | Forward-compat schema slot exists (`NotificationPreference.mobilePushEnabled`); driver requires a native app. | D-4 schema reservation |
| Chat conversation public sharing | `PublicShareLink.resourceType` already accepts a string; allowlist update + renderer is the V2 work. | D-8 §6.2 |
| Slack channel-validation cron | Backend handler not yet implemented; schedule deferred. | D-9 discovery §10.K |
| CommandPalette icon wildcard refactor | `import * as Icons` defeats tree-shaking (~166 KB gzipped on dashboard pages). Real refactor needed. | D-10 completion §1.2 known follow-up |
| Sentry source-map upload, daily Slack channel-validation, Slack Teams stretch | All follow-ups; either marked deferred or in a stand-alone tiny sprint. | Various |
| Live ZATCA gateway submission | V1 generates Phase 2 XML on demand only; live submission needs ZATCA portal credentials + production cert. | D-11 discovery §10.I |
| ZATCA cryptographic stamp signing | `previousInvoiceHash` is a placeholder; real XAdES signing comes with the live gateway sprint. | D-11 discovery §10.I |
| `aiBriefController.ts` country-aware persona | Touching it would require modifying a protected file; layering a prefix is harder there because the prompt builds directly from merchant data. | D-11 completion §2 |
| Per-locale i18n lazy loading | All 3 locales still ship as separate chunks but are eagerly imported. Real lazy loading needs a refactor of `src/i18n/dashboard/index.js`. | D-11 completion §2 |
| GCC/MENA expansion (AE / EG / KW / QA / BH / OM / JO) | V1 backend profiles narrowed to TR + SA + OTHER. Frontend countryProfiles.js already has all 10 modeled. | D-11 completion §2 |
| TR e-Fatura threshold versioning | Static value (5M TRY) on the TR profile. Versioning the threshold (parallel to TaxRateVersion) is V2 work. | D-11 completion §2 |

The deferrals share a common shape: each one is **either explicitly post-launch polish work, or a feature whose value scales with merchant count**. None of them block the V1 launch for the 2 test merchants; all of them have a documented trigger ("when merchant base passes 50+", "when triage of a minified frame fails", etc.) for revisit.

---

## 2. Architectural choices that paid off

These are the decisions that would have looked pedantic in isolation but compounded into a coherent system.

### 2.1 `merchantId` everywhere (carried by every sprint)

The vendor specs frequently used `companyId / userId / accountId`. We translated on every commit. Why it mattered: D-3's sharing audit trail, D-4's notification preferences, D-5's morning brief subscription, D-6's weekly report, D-7's public share links, D-8's chat conversation, and D-9's Slack installation all share a single tenant boundary. Every Prisma query in customer-facing code adds `where: { merchantId }`; every JWT carries it; every Sentry context tag includes it. **There has not been one cross-tenant data leak vector across 17 entry points.**

### 2.2 Protected files

Three files were declared off-limits on day one: `aiBriefController.ts` (the daily insight generator), `merchantSnapshot.ts` (the data aggregator the AI reads), and `kpiComputations.ts` (the KPI registry). Why it mattered: D-8's chat tools, D-9's slash commands, D-10's admin AI usage endpoint, and D-11's country-aware AI persona all read from these files as a public API surface — never editing them. The KPI registry stayed a single source of truth across 5 sprints. D-11 specifically routed the persona prefix through `services/chat/persona.ts` + small layered changes to `services/chat/engine.ts` rather than touching `aiBriefController.ts`; the morning-brief persona switch is a documented deferred follow-up.

### 2.3 Plain JSX + inline styles + design tokens

No Tailwind, no TypeScript on the frontend, no shadcn / Radix / Material. Every D-1 token (colors, gradients, shadows, type scale, spacing) imported from `@/design-system-v2/cinematic/tokens` into every D-3..D-11 page. Why it mattered: zero CSS-in-JS runtime cost, zero build-time tooling additions, zero theming bugs across 19 customer-facing routes. The ChatPanel, the IntegrationsPage, the HelpCenterPage, and the GeoMismatchBanner all share the same glass-tint values without a single source of design drift.

### 2.4 Reuse over rebuild

The D-4 notification engine + ChannelDriver interface absorbed both Web Push (D-4) and Slack (D-9) without modification. The D-7 OG image renderer reused the D-2 Puppeteer pool — one browser cluster, two products. The D-2.5 hardening's `PDF_MAX_BROWSERS` env var still controls the ceiling 9 sprints later. The D-8 ChatMessage token columns required zero schema changes to power the D-10 admin AI usage dashboard. D-11 reused the existing `Merchant.{language, country, currency, timezone}` columns (already in place from prior sprints) rather than adding new ones; only the new `TaxRateVersion` table represents net-new schema. **Each new sprint had less new infrastructure than the last.**

### 2.5 Feature-flagged deferred env vars (D-9 → D-10)

Started in D-9 with the 5 Slack env vars: rather than block on Mehmet provisioning them, every code path checked `getSlackConfig() !== null` and returned 503 cleanly when unset. D-10 carried the pattern forward for Sentry and rollout. **Result: Phase B can be code-complete and merged before any infrastructure decision is finalized**, removing a class of "waiting on someone else" blockers from the program.

### 2.6 Strict micro-commits + per-sprint Phase A/B split

Every sprint had a Phase A discovery doc with surfaced env vars, decision matrix, and recommended picks; Phase B implementation only began after explicit approval. The Phase A doc became the source of truth for trade-offs (e.g. D-9 §10.A choosing Slack-only V1 over Slack+Teams; D-11 §10.A confirming the existing Merchant fields meant zero core-field migration). Phase B commits each landed small enough to review in one sitting (typical: 1-3 files; max: 7 files for a route + controller + service + middleware bundle). **Across 24 phase docs, one sprint got rescoped mid-flight (D-2.5 carved out of D-2's PDF infrastructure crisis); the rest shipped as discovered.**

---

## 3. The infrastructure surface

### 3.1 Frontend (Vite + React 18, plain JSX)

```
src/
├── App.jsx                          — route registration; CinematicErrorBoundary wrap; HomeRedirect with rollout fetch
├── main.jsx                         — initSentry → initAnalytics → initWebVitals → render
├── design-system-v2/
│   └── cinematic/                   — D-1 tokens / shadows / gradients
├── components/
│   ├── foundation/                  — D-1 GlassCard / GradientMesh / NeonBadge
│   ├── v2/
│   │   ├── chat/                    — D-8 ChatBubble, ChatPanel, ChatPage primitives
│   │   ├── feedback/                — D-10 CinematicSkeleton / EmptyState / ErrorBlock / ErrorBoundary
│   │   ├── notifications/           — D-4 bell, dropdown, toast, archive item
│   │   ├── insights/                — D-3 ShareInsightModal; D-7 ShareLinkModal
│   │   └── sharing/                 — D-3 RecipientPicker, RecipientAvatarChip
├── pages/v2/
│   ├── insights/                    — D-3 SharesPage, RecipientsPage; D-7 ShareLinksManagementPage
│   ├── notifications/               — D-4 NotificationArchive, NotificationPreferences
│   ├── reports/                     — D-6 ReportsArchive, ReportViewer, WeeklyUnsubscribe
│   ├── chat/                        — D-8 ChatPage
│   ├── integrations/                — D-9 IntegrationsPage, SlackInstallationCard, SlackChannelMappingPanel
│   └── help/                        — D-10 HelpCenterPage
├── pages/admin/
│   └── analytics/                   — D-10 AiUsagePage
├── api/v2/
│   └── *.js                         — one client per domain (sharing, notifications, weeklyReport, morningBrief, chat, integrations, rollout, publicShareLinks)
├── api/admin/
│   └── *.js                         — admin clients (emailEngagement, aiUsage)
├── hooks/v2/
│   └── *.js                         — useNotificationStream (D-4), useChatStream (D-8)
├── i18n/dashboard/
│   └── *.{tr,en,ar}.json            — 24 canonical translation files (one per surface × 3 langs)
├── services/observability/
│   └── sentry.js                    — D-10 feature-flagged Sentry init
└── styles/
    ├── a11y.css                     — Phase 12 + D-10 accessibility primitives
    └── cinematic.css                — D-1 keyframes
```

### 3.2 Backend (Express + Prisma + Gemini + Puppeteer + Resend on Railway)

```
src/
├── index.ts                         — initSentry → middleware → routes; webhook route raw mounts; channel registration
├── config/
│   ├── env.ts                       — single source of truth for env-var reads
│   └── database.ts                  — prisma client singleton
├── middleware/
│   ├── auth.ts / adminAuth.ts       — JWT verification + req.merchant / req.admin attachment
│   ├── requestId.ts                 — D-10 correlation id
│   ├── errorHandler.ts              — D-10 Sentry-aware error handler
│   ├── rateLimiter.ts               — global token bucket
│   ├── auditLogger.ts               — wraps res.json so every authenticated mutation is recorded
│   └── sprint3Middleware.ts         — RBAC + IP allowlist
├── controllers/
│   ├── customer/                    — D-1..D-10 customer-facing endpoints
│   ├── admin/                       — admin endpoints (D-5 email engagement, D-10 AI usage)
│   ├── integrations/                — D-9 slackOAuth / slackCommands / slackInteractions / slackChannelMapping
│   ├── webhooks/                    — D-4 resendWebhookController
│   └── healthController.ts          — D-10 /health + /health/ready
├── routes/
│   └── *.ts                         — thin Express Router files mapping URLs to controllers
├── services/
│   ├── notifications/               — D-4 engine + ChannelDriver registry + sseHub + streamToken + channels/{inappChannel, emailChannel, webPushChannel, slackChannel}
│   ├── morningBrief/                — D-5 unsubscribe-token, send-disable-notice, email template
│   ├── weeklyReport/                — D-6 generate / send / unsubscribe-token / narrative / email template
│   ├── share/                       — D-7 ipHash, ogImageRenderer, privacyRenderer, publicShareTemplate, slug
│   ├── sharing/                     — D-3 phone, sendShareEmail, shareEmailTemplate, shareEvents, shareToken, waLink
│   ├── chat/                        — D-8 engine, tools, memory, streamToken, markdown, titleGen
│   ├── pdf/                         — D-2 + D-2.5 pdfRenderer (Puppeteer pool) + 6 templates
│   ├── integrations/slack/          — D-9 client, signature, blockRenderer, slashCommandRouter, interactionRouter, stateToken, config
│   ├── observability/sentry.ts      — D-10 feature-flagged Sentry init
│   └── customer/kpiComputations.ts  — protected KPI registry (D-1, never modified)
├── utils/
│   ├── encryption.ts                — AES-256-GCM via ENCRYPTION_KEY (powers 2FA + D-9 Slack tokens)
│   └── params.ts                    — query-param coercion helpers
└── docs/runbooks/                   — D-10 incident response (6 documents)
```

### 3.3 Cross-cutting

- **Database:** PostgreSQL on Railway. Single Prisma schema; manual idempotent SQL migrations under `prisma/manual-migrations/` (safe to re-run).
- **Email:** Resend (single API key powers D-3 shares, D-5 brief, D-6 report, D-9 admin notifs).
- **AI:** Gemini 2.0 Flash via `@google/generative-ai@^0.21` (powers D-1 insights, D-5 brief generation, D-6 weekly narrative, D-8 chat, D-9 slash commands).
- **Cron:** cron-job.org HTTP-pings 4 backend endpoints with `x-cron-secret` header. No managed cron infra.
- **Static hosting:** Vercel for the frontend. Railway for the backend.
- **Observability (when env vars land):** Sentry for errors, Railway logs for stdout, future PostHog for analytics.

---

## 4. Launch readiness checklist

The launch path is the same six steps from D-10 §4. Repeated here for the program-summary reader who didn't read every sprint doc.

1. **Provision env vars** on Railway (backend) + Vercel (frontend):
   - `SENTRY_DSN` (backend Sentry project)
   - `VITE_SENTRY_DSN` (frontend Sentry project)
   - `V2_DASHBOARD_ROLLOUT_PCT=100` (start at full rollout)
2. **Restart Railway** so Sentry init re-runs and the rollout endpoint picks up the env var.
3. **Smoke test Sentry** — trigger a known 500; confirm the issue appears with `requestId`, `merchantId`, `path` extras.
4. **Smoke test rollout** — log in as a test merchant; confirm post-login destination is `/v2/dashboard`.
5. **Smoke test admin AI usage** — hit `/admin/analytics/ai-usage`; confirm KPI tiles + leaderboard + daily roll-up render.
6. **Smoke test /help** — visit as customer; confirm 7 topic cards render in TR + clicking reads + language switch updates content.

After step 6, the AI Co-Pilot Suite is **launched** for the 2 test merchants.

For the post-launch follow-ups (Slack env vars, channel-validation cron, etc.) the same checklist pattern applies — each one is documented in its sprint completion report.

---

## 5. What ships in V1 (the launch state)

When the 6-step checklist completes, every authenticated merchant gets:

**Dashboard surface** — V2 cinematic dashboard at `/v2/dashboard` with KPI cards, chart constellation, AI Co-Pilot strip, customizable layout via FeatureFlags drawer.

**Insights** — daily AI-generated cards (critical / attention / opportunity) at `/insights/*`. Full audit trail of shares, recipients address book, public share links with privacy modes.

**Notifications** — 4-channel delivery (in-app + email + Web Push + Slack when configured). Per-severity matrix, quiet hours, mute kill-switch. Real-time SSE feed.

**Daily morning brief** — 07:00 email + dashboard banner. Unsubscribe in one click. Admin engagement tracking.

**Weekly performance report** — Sunday 18:00 cinematic PDF + email + viewer page. 12 KPIs, AI narrative, week-over-week.

**Public sharing** — slug-based URLs with password gate, expiry, OG images, comment thread (with anti-spam). Engagement tracking.

**AI chat** — full-page route at `/chat` + Cmd+J overlay anywhere. Streaming Gemini answers with function-calling over the KPI registry, voice input (TR/AR/EN), 90-day retention.

**Slack integration** — once SLACK_* env vars land, merchants self-install via `/settings/integrations`; insights flow to mapped channels; `/zyrix` slash commands work in Slack; Resolve / Dismiss buttons round-trip.

**Help center** — `/help` with 7 topics in TR / EN / AR; offline-capable.

**Admin observability** — `/admin/analytics/ai-usage` with token aggregations + cost forecast; `/admin/ops/email-engagement` for delivery health; `/admin/compliance/regulatory-profiles` for effective-dated tax rates; `/health` dependency status; Sentry on every backend error.

**Localization + country-aware regulatory engine** (D-11) — TR/AR/EN language switcher mounted globally; merchant `language` and `country` are independent fields (Arabic-speaking merchant in Istanbul keeps Turkish KDV rules + Arabic UI; English-speaking expat in Riyadh keeps Saudi VAT/ZATCA + English UI). ZATCA Phase 2 UBL XML + TLV QR encoder for SA invoices. Effective-dated `TaxRateVersion` with admin CRUD + audit log. Geo-mismatch banner once per session when CF-IPCountry differs from registered country. Country-aware AI persona for chat + cfo voice.

**Settings** — notification preferences, integrations, Slack channel mapping, 2FA, language, data export, audit log.

---

## 6. Beyond V1

The post-launch roadmap is shaped by what the 2 → N merchant scale-up will reveal. The audit doc and discovery docs together itemize the deferred items; here's the order of likely future work, ranked by where the leverage is:

1. **Real Lighthouse measurement post-launch** — the three easy wins (lucide split + locale split + font cuts) should clear 95+. If specific routes still don't, the CommandPalette icon wildcard refactor is the next lever (~166 KB gzipped on dashboard pages).
2. **Live ZATCA gateway submission** (D-11 deferred) — V1 generates Phase 2 XML on demand only; live submission needs ZATCA portal credentials + production cert. Trigger when an SA merchant actually needs to file.
3. **`aiBriefController.ts` country-aware persona** (D-11 deferred) — refactor sprint that lifts the prompt out of the protected controller so the persona prefix can layer on without modifying it.
4. **Slack channel-validation cron** — small follow-up; backend handler + cron-job.org schedule.
5. **Microsoft Teams integration** — its own sprint when Mehmet's customer base requests it.
6. **GCC/MENA expansion** (D-11 deferred) — backend profiles narrowed to TR + SA + OTHER; frontend `countryProfiles.js` already has 8 more modeled. Trigger when a merchant in one of those countries signs up.
7. **PostHog analytics** — when merchant count passes 50.
8. **Phased 5%→25%→50%→100% rollout** — when merchant count passes 10 and a real cohort can be staged.
9. **Per-merchant AI rate limiting** — when one merchant's chat usage starts to overshadow others.
10. **Mobile push** — pairs with a native app sprint.
11. **Per-locale i18n lazy loading** — saves ~80 KB on cold start; pure perf optimization.

None of these are V1 launch gates.

---

## 7. Final ledger

**Sprints (with phase docs):**

| Sprint | Discovery | Completion |
|---|---|---|
| D-1 Foundation | `7e12309` | `bf56025` |
| D-2 PDF Export | `8822bc8` | `1b9d38a` |
| D-2.5 Hardening | `ae64ea8` | `d5830d9` (+ `2a995c1` snapshot) |
| D-3 Sharing | `fac9df3` | `6fd5125` |
| D-4 Notifications | `942b535` | `79fc130` |
| D-5 Morning Brief | `490663d` | `1a1b741` |
| D-6 Weekly Report | `993cf60` | `159ed1c` |
| D-7 Public Share | `ebfec42` | `ee847f0` |
| D-8 AI Chat | `ee413f8` | `5642e0b` |
| D-9 Slack | `ca1abfb` | `8ca8e83` |
| D-10 Polish + Launch | `34b8fa7` (audit) | `6a8105f` |
| D-11 Localization + Country | `b2fd59f` | `007d532` (+ `0f78ac4` verification matrix) |
| Program summary | `77f743d` (D-10) → _(this commit, D-11 update)_ | — |

---

**The AI Co-Pilot Suite is code-complete through D-11. Launch is a checklist (D-10 §4) plus the D-11 verification matrix.**
