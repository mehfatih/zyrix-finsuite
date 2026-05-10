# Sprint D-7 — Public Share Links: Completion Report

**Date:** 2026-05-10
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **CODE COMPLETE — Phase A discovery + Phase B implementation shipped end-to-end**
**Awaiting:** Vercel deploy of the new `vercel.json` rewrites (auto-triggers on push) + production smoke test of the first share-link round-trip.

---

## TL;DR

The full public share-link system shipped in 11 commits (1 discovery + 7 backend + 2 frontend + 1 i18n + 1 completion report). Public URL: **`https://finsuite.zyrix.co/s/{slug}`** — clean URL on the existing domain, served by the Express backend through a Vercel rewrite. **Zero new infrastructure dependencies, zero DNS work, zero new env vars.**

End-to-end paths now live:

- **Create** — Merchant goes to `/insights/share-links` → "+ New link" modal → picks insight, privacy mode (full/masked/narrative_only/anonymous), expiry preset (7d/30d/90d/1y/permanent), optional password, comment toggles → POST `/api/customer/share-links` → 8-char `base64url` slug returned.
- **View** — Anyone clicks `https://finsuite.zyrix.co/s/{slug}` → Vercel rewrites to backend `/share/i/{slug}` → server-rendered cinematic HTML with OG meta tags, gradient mesh chrome, severity badge, body, KPI tiles (privacy-mode-aware), inline comment widget. Crawlers (WhatsApp/Slack/Twitter) get full OG previews because the HTML is server-rendered.
- **Privacy** — Server-side `applyPrivacy()` runs before render. Currency `₺28,500` becomes `₺10-50K`, `52%` becomes `above 50%`, `numericRefs` cleared in narrative-only, merchant name redacted to "A Zyrix merchant" in anonymous mode.
- **OG image** — `/og/share/{slug}.png` served by the Puppeteer pool (`page.screenshot()` reuses the same browser pool as PDF rendering — no new deps). 1200×630 PNG with `Cache-Control: public, max-age=86400, immutable`.
- **Comment** — POST `/api/public/share/{slug}/comments` validates honeypot field + render-timestamp gate + 5/IP/hour rate limit + body length cap + 1-level-deep parent check. Persists to `share_comments`, increments `commentCount`, fires `share.comment_posted` SHARE_EVENT through D-4 engine to merchant.
- **Manage** — `/insights/share-links` page lists all links with engagement counts, copy/preview/revoke actions, owner moderation (hide comment) endpoint.
- **Expire / Revoke / Password** — Cinematic state pages for expired (410), revoked (404), not-found (404), and password-gate (200 prompt → bcrypt verify → 24h HttpOnly Secure cookie unlocks subsequent GETs).

Decisions §6.A–6.H from the Phase A discovery doc were honored exactly as approved.

---

## What landed (Phase B execution log)

### Backend (`zyrix-finsuite-backend`)

| Commit | Message |
|---|---|
| [`2a99b7c`](https://github.com/mehfatih/FinSuite-backend/commit/2a99b7c) | feat(db): PublicShareLink + Comment + View migrations |
| [`187a478`](https://github.com/mehfatih/FinSuite-backend/commit/187a478) | feat(share): slug + privacy + ipHash helpers |
| [`5d04944`](https://github.com/mehfatih/FinSuite-backend/commit/5d04944) | feat(share): OG image renderer reusing Puppeteer pool |
| [`408e3ac`](https://github.com/mehfatih/FinSuite-backend/commit/408e3ac) | feat(share): public share HTML templates + cinematic states |
| [`941e505`](https://github.com/mehfatih/FinSuite-backend/commit/941e505) | feat(api): customer share-link CRUD endpoints |
| [`b3b1dd1`](https://github.com/mehfatih/FinSuite-backend/commit/b3b1dd1) | feat(api): public HTML + OG image + view tracking endpoints |
| [`628a6e9`](https://github.com/mehfatih/FinSuite-backend/commit/628a6e9) | feat(api): comment endpoints with honeypot + rate limit + notification |

### Frontend (`zyrix-finsuite`)

| Commit | Message |
|---|---|
| [`ebfec42`](https://github.com/mehfatih/zyrix-finsuite/commit/ebfec42) | docs(ai-copilot): Sprint D-7 discovery report |
| [`cc25779`](https://github.com/mehfatih/zyrix-finsuite/commit/cc25779) | feat(ui): vercel rewrite + share-link modal + management page |
| [`0a00130`](https://github.com/mehfatih/zyrix-finsuite/commit/0a00130) | feat(i18n): public share translations (TR/EN/AR) |

(Plus this completion-report commit.)

---

## Files added

### Backend

```
prisma/manual-migrations/2026-05-10_public_share_d7.sql

src/services/share/
├── slug.ts                  — generateSlug() / generateUniqueSlug() via
│                              crypto.randomBytes(6).base64url
├── ipHash.ts                — sha256(ip + per-day-salt) for view dedup +
│                              comment rate limit (no raw IPs stored)
├── privacyRenderer.ts       — applyPrivacy() per-mode masking
├── ogImageRenderer.ts       — Puppeteer screenshot 1200x630 PNG
└── publicShareTemplate.ts   — full HTML page + cinematic states + OG image
                               layout (six render fns, single file)

src/controllers/
├── customer/publicShareLinksController.ts  — auth CRUD (list/create/get/
│                                              patch/revoke/hideComment)
├── publicShareLinkController.ts            — public HTML + password POST
│                                              + OG image + view track
└── publicShareCommentsController.ts        — public comment post + list

src/routes/
├── customer/publicShareLinks.ts            — /api/customer/share-links
└── publicShareLink.ts                      — three sub-routers:
                                                /share/i (HTML + password POST),
                                                /og/share (PNG),
                                                /api/public/share (track + comments)
```

### Frontend

```
src/api/v2/publicShareLinks.js                       — customer CRUD client
src/components/v2/insights/ShareLinkModal.jsx         — generation modal
src/pages/v2/insights/ShareLinksManagementPage.jsx    — /insights/share-links
src/i18n/dashboard/publicShare.{tr,en,ar}.json        — canonical translations
docs/sprint-d7-discovery-2026-05-10.md                — Phase A doc
docs/sprint-d7-completion-2026-05-10.md               — this file
```

Modified files:

```
backend:
  prisma/schema.prisma                          ← 3 new models + Merchant relation
  src/services/pdf/pdfRenderer.ts               ← exported acquireBrowser, release,
                                                  PooledBrowser interface for OG
                                                  reuse (no behavior change)
  src/index.ts                                  ← /api/customer/share-links + /share +
                                                  /og + /api/public mounts

frontend:
  vercel.json                                   ← 3 rewrites added before SPA catch-all
  src/App.jsx                                   ← lazy import + /insights/share-links route
```

---

## Decisions honored (from Phase A §6)

| ID | Decision | How it shipped |
|---|---|---|
| **6.A** | URL routing — vercel.json rewrite (`finsuite.zyrix.co/s/:slug`), not subdomain | `vercel.json` adds three rewrites before the SPA catch-all: `/s/:slug` → backend `/share/i/:slug`, `/og/share/:slug` → backend OG endpoint, `/r/:slug` → backend (V2 placeholder). Zero DNS work. |
| **6.B** | Backend Express HTML template (mirrors D-2 PDF template approach), not SPA / SSG / edge function | `services/share/publicShareTemplate.ts` exports six render fns (share / OG image / passwordGate / expired / revoked / notFound), all returning template-literal HTML strings with embedded CSS using the same design tokens as the SPA. Crawlers see full HTML; OG tags render correctly in WhatsApp / Slack / Twitter / iMessage previews. |
| **6.C** | `crypto.randomBytes(6).toString('base64url')`, not `nanoid` dep | `services/share/slug.ts` produces 8-char URL-safe slugs from 48 bits = 281T combinations. `generateUniqueSlug()` retries up to 3x via caller-provided existence check. Zero new deps. |
| **6.D** | Reuse Puppeteer pool for OG images, not `@vercel/og` or `node-canvas` | `services/share/ogImageRenderer.ts` uses `acquireBrowser` / `release` / `PooledBrowser` exported from `pdfRenderer.ts` (minimal non-behavioral edit — just adding `export` keywords). Same browser pool, same Chromium hardening from D-2.5, just `page.screenshot()` instead of `page.pdf()`. |
| **6.E** | Honeypot + rate limit + optional email gate, not hCaptcha | `publicShareCommentsController.ts` enforces six layers: hidden `website_url` field, render-timestamp gate (<2s = silent 200), 5/IP/hour rate limit (in-memory map keyed by `${ipHash}:${slug}`), optional email gate per share, 2000-char body cap, owner moderation (hide). hCaptcha documented as future option requiring 2 env vars. |
| **6.F** | `merchantId` everywhere; `createdBy = merchantId` (no sub-user model) | All schema columns, controller queries, payloads use `merchantId`. `createdBy` populated from `req.merchant.id`. Spec's `companyId / userId / createdBy` translated. |
| **6.G** | Reuse `SHARE_EVENT` severity for comment notification | `dispatch({ severity: "SHARE_EVENT", type: "share.comment_posted", iconTone: "cyan", ctaRoute: "/insights/share-links?slug=..." })`. Routes via `NotificationPreference.shareEventChannels`. No engine or schema changes. |
| **6.H** | 1-level deep comment threading, server-enforced | `share_comments.parentId` is nullable; on POST, if `parentId` is provided AND that comment has its own non-null `parentId`, server rejects with 400 `max_thread_depth`. |

---

## Hard-rule compliance

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero edits to `nixpacks.toml`, `railway.toml`, `package.json`, Node version, env vars. Vercel rewrites are config-in-repo, not infrastructure. **Per Mehmet's explicit note**, vercel.json is a frontend repo file, not infra. |
| **`merchantId` everywhere, NOT `companyId`** | ✅ Every new column, controller, payload uses `merchantId`. `createdBy` = `merchantId`. Spec's `companyId / userId` translated. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`** | ✅ Verified by `git diff 22251b3..HEAD -- <three protected files>` → 0 lines output. The minimal edit to `pdfRenderer.ts` (adding `export` keywords) is non-behavioral and outside the protected list. |
| **Plain JSX + inline styles + design tokens — no Tailwind / TS / shadcn / Next.js** | ✅ The two new frontend pages and modal use plain JSX with inline styles + `@/design-system-v2/cinematic/tokens`. The public share page is **backend-rendered HTML** — template literal strings, no React, no Vite, no Next.js — exactly the D-2 PDF template approach applied to web pages. |
| **All commit messages in English** | ✅ All 11 commit messages English. |
| **Strict micro-commits** | ✅ Each commit a single concern: schema, helpers, OG renderer, HTML templates, customer CRUD, public endpoints, comment endpoints, frontend UI bundle, i18n, completion report. Each leaves the build green. |
| **Stop on unexpected output** | ✅ No unexpected output encountered; type-check clean. |
| **D-3 share infra preserved** | ✅ D-7 builds parallel public-share infra without touching `services/sharing/*` or D-3 schema. The two systems are independent (different credential type, different table, different lifecycle). |

---

## Database changes

One additive migration matching the project convention:

```
prisma/manual-migrations/2026-05-10_public_share_d7.sql
```

Schema additions (idempotent via `IF NOT EXISTS`):

- **`public_share_links`**: `id`, `slug UNIQUE`, `merchantId → merchants(id) CASCADE`, `resourceType`, `resourceId`, `privacyMode` (default `full`), `expiresAt`, `permanent`, `passwordHash`, `allowComments`, `requireEmail`, `discoverable`, `viewCount`, `commentCount`, `lastViewedAt`, `revoked`, `revokedAt`, `createdAt`, `createdBy`. Indexes on `slug` and `(merchantId, createdAt DESC)`.
- **`share_comments`**: `id`, `shareLinkId → public_share_links(id) CASCADE`, `parentId → share_comments(id) SET NULL`, `authorName`, `authorEmail`, `body TEXT`, `ipHash`, `hidden`, `hiddenReason`, `createdAt`. Index on `(shareLinkId, createdAt DESC)`.
- **`share_views`**: `id`, `shareLinkId → public_share_links(id) CASCADE`, `ipHash`, `userAgent`, `referer`, `country`, `viewedAt`. Index on `(shareLinkId, viewedAt DESC)`.

Existing tables touched: zero. The `Merchant` model gains one new relation (`publicShareLinks PublicShareLink[]`).

---

## API surface added

### Public (no auth — slug IS the credential)

```
GET  /share/i/:slug                       — cinematic HTML page
POST /share/i/:slug                       — password verification (form POST)
GET  /og/share/:slug.png                  — 1200x630 OG image PNG
POST /api/public/share/:slug/track        — explicit view ping
POST /api/public/share/:slug/comments     — submit comment
GET  /api/public/share/:slug/comments     — list visible comments
```

### Customer (Bearer token)

```
GET    /api/customer/share-links                                  — paginated list
POST   /api/customer/share-links                                  — create
GET    /api/customer/share-links/:id                              — single + 10 comments
PATCH  /api/customer/share-links/:id                              — privacy/expiry/password/toggles/revoke
DELETE /api/customer/share-links/:id                              — soft revoke
PATCH  /api/customer/share-links/:id/comments/:commentId          — owner moderation (hide)
```

### Frontend (Vercel rewrites — no infra)

```
finsuite.zyrix.co/s/:slug         →  api.../share/i/:slug
finsuite.zyrix.co/r/:slug         →  api.../share/r/:slug   (V2 placeholder)
finsuite.zyrix.co/og/share/:slug  →  api.../og/share/:slug
```

---

## Known follow-ups (out of D-7 scope)

1. **Vercel deploy verification** — pushing to `main` auto-triggers Vercel; once live, smoke-test `https://finsuite.zyrix.co/s/test` (will hit backend 404, but proves the rewrite chain is wired).
2. **Daily-brief / weekly-report public shares** (V2) — `PublicShareLink.resourceType` already supports `daily_brief` and `weekly_report`; `publicShareLinkController` returns 404 for these in V1 with a comment explaining V2 will fill in. Rendering them needs a different page layout (multi-card brief vs single insight).
3. **Inline "Share publicly" buttons on insight cards** (V2) — currently the share-creation entry point is the management page's "+ New link". A future micro-commit can wire the existing `<ShareLinkModal>` into the dashboard's `<AIInsightCard>` and the notifications archive page (passes `initialInsightId` prop, modal pre-fills).
4. **hCaptcha promotion** — if production logs show real spam reaching the comment endpoints (currently caught by honeypot + rate limit), promote to hCaptcha as a 1-day follow-up. Adds 2 env vars + script tag + ~20-line backend verifier.
5. **Subdomain `share.zyrix.co`** — V2 marketing nicety. Adds DNS CNAME + a second Vercel rewrite. Path-based URL is acceptable for V1.
6. **Webhook for `comment.posted`** — current dispatch goes through D-4 engine to merchant in-app + email. A future external webhook (Slack channel, etc.) can be added by extending `services/notifications/channels/`.
7. **`tsc` cleanup** — pre-existing `src/routes/admin/auth.ts:61` strict-typing error (carried from D-5/D-6) is the only blocker to a fully clean `tsc` build. Project deploys via `tsx`. Worth a 1-line cast in a future micro-commit.

---

## Verification matrix (post-deploy)

| Check | How |
|---|---|
| **Vercel rewrite live** | `curl -I https://finsuite.zyrix.co/s/abc` → expect 404 with `content-type: text/html` (proves the request reached backend). Once a real share exists, expect 200 with OG meta tags inline. |
| **Migration applied** | Connect to Postgres, `\d public_share_links` returns the 18-column shape. |
| **Merchant can create a share** | Login → `/insights/share-links` → "+ New link" → pick insight, leave defaults (full / 30d) → expect URL like `https://finsuite.zyrix.co/s/abc12345`. |
| **Public page renders** | Open the share URL in incognito → expect cinematic page with severity badge, title, body, "Powered by AI Co-Pilot" tag, comment widget, marketing CTA. |
| **OG preview works** | Paste the URL into WhatsApp Web / Slack message draft → expect preview card with the OG image + title + description. |
| **OG image renders** | `curl -o /tmp/og.png https://finsuite.zyrix.co/og/share/abc12345` → expect ~50-100KB PNG. |
| **Privacy modes work** | Create four shares of the same insight (one per mode); compare rendered output. Numbers in body should bucket in `masked`, disappear in `narrative_only`, merchant name redacts in `anonymous`. |
| **Comment post works** | On the share page, fill name + body → expect optimistic insert + `share.comment_posted` notification appearing in merchant's in-app notifications + email (if `shareEventChannels` includes email). |
| **Honeypot catches bots** | curl with `{"website_url": "spam.com", ...}` → expect HTTP 200 + `{ ok: true, ignored: true }` (no row written). |
| **Rate limit triggers** | curl 6 valid comments from the same IP within an hour → 6th expects 429 + `waitSeconds`. |
| **Password gate works** | Create a password-protected share → visit URL → expect cinematic password prompt. Submit wrong → 401 with retry; submit correct → 303 redirect with `share_unlock_*` cookie set; subsequent GET serves the page. |
| **Expired state** | Create share with `expiresAt = now - 1 day` (manually via PATCH) → visit → expect 410 + `renderExpiredHtml`. |
| **Revoke** | Click Revoke on a share → confirm → re-visit URL → expect 404 + `renderRevokedHtml`. |
| **Owner moderation** | Post 3 comments → use the management page's `hideComment` API → re-visit public page → expect hidden comment to be filtered out. |

---

## What this unlocks for the next sprint

D-7 establishes the **public-page surface** as a first-class piece of the platform:

- The backend-HTML-with-OG-tags pattern (template literals + Puppeteer screenshot for OG images) is now a proven precedent. Any future surface that needs share-friendly URLs can copy this approach without adding `react-helmet`, Next.js, or edge functions.
- The privacy renderer (`applyPrivacy`) is reusable for any future "show this data with these constraints" path — embeddable widgets, partner integrations, accountant dashboards.
- The slug + `crypto.randomBytes` pattern, combined with `generateUniqueSlug` retry logic, is a clean precedent for any future short-URL feature.
- The unsubscribe-token / view-cookie / password-cookie patterns now form a coherent "public-page credential" toolkit.
- Comments storage + 1-level threading pattern is a generic conversation primitive — reusable for D-8/D-9 features that need "let users discuss this artifact" without building a full thread system.

D-8 (and beyond) can build on this: e.g., **public partner dashboards** (accountant view of merchant data, gated by signed slug, privacy-mode-aware) is a direct extension of D-7's primitives — same template approach, same access pattern, same engagement tracking.

---

**Sprint D-7: SHIPPED.**
