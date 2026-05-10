# Sprint D-7 — Public Share Links: Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of the open decisions in §6 before Phase B**

---

## TL;DR

D-7 lands on top of D-2 (PDF), D-3 (private signed-token shares), and D-4 (notifications) — but it has **one structural problem the spec doesn't acknowledge**: the existing frontend is a Vite **SPA**, not Next.js. The spec's `app/(public)/i/[slug]/page.tsx` and `next/head` patterns don't apply. SPAs cannot serve OG meta tags to WhatsApp/Slack/Twitter crawlers because crawlers don't execute JavaScript — they parse the initial HTML response.

This forces the architecture: **public share pages must be server-rendered HTML, served from the Express backend** (the only host with HTML-rendering capability today). The good news — D-2's PDF template approach (`htmlShell` + inline CSS, embedded fonts) translates almost 1:1 into HTML page rendering. We get the cinematic look, OG tags, and per-share crawler previews in a single backend HTML route, with **zero new infrastructure dependencies**.

The remaining open questions are all genuine architecture choices — none require new infra deps if the recommended option is picked:

| Item | The reality |
|---|---|
| URL routing | Subdomain `share.zyrix.co` requires DNS work. Mehmet's path-based suggestion works via a single `vercel.json` rewrite — clean URL on existing domain, zero infra. |
| OG meta tags | Backend Express HTML route, mirroring D-2 PDF template pattern. |
| OG images | Reuse Puppeteer pool with `page.screenshot()` instead of `page.pdf()` — same browser pool, zero new deps. (Mehmet explicitly ruled out `@vercel/og` and `node-canvas`.) |
| Slug generation | `crypto.randomBytes(6).toString('base64url')` → 8 chars, 281T combinations. Zero new deps. |
| Spam / captcha | Honeypot field + tight per-IP rate limit + optional name/email gate. Zero new deps; promote to hCaptcha (which DOES need infra approval) only if production spam emerges. |
| Comment notifications | Reuse `SHARE_EVENT` severity (per D-3/D-4 precedent), new event type `share.comment_posted`. |
| Schema naming | Spec's `companyId / userId / createdBy` → translate everywhere to `merchantId`. |

Eight decisions captured in §6. None require infra changes if you accept the recommendations; one (hCaptcha as a deferred upgrade) is documented as a future option.

---

## 1. Repo geography (recap)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Frontend (Vite + React 18, plain JSX, no TS, no Next.js, no SSR). Deployed to Vercel; `vercel.json` rewrites `/(.*)` → `/index.html`. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma + Puppeteer + Resend on Railway. Already serves binary PDFs publicly via `/share/:token`; no HTML page rendering yet. |

Hard rule: **`merchantId` everywhere**. Spec uses `companyId` and `userId / createdBy` throughout the schema — those translate to `merchantId` in every model and column.

---

## 2. A.1 — Routing architecture audit

### 2.1 The OG-tag problem

The current Vite SPA serves a single `index.html` for every path (Vercel rewrite at `vercel.json`):

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

Social media crawlers (WhatsApp, Slack, Twitter, LinkedIn, iMessage) **do not execute JavaScript**. They fetch the initial HTML response and read `<meta property="og:*">` tags inline. The SPA returns the same blank shell for every URL, so `react-helmet` / dynamic JS-injected OG tags **cannot work** for previews.

### 2.2 Three URL routing options

| Option | URL shape | Infra burden | Trade-off |
|---|---|---|---|
| **(α) Subdomain** | `share.zyrix.co/i/{slug}` | **HIGH** — DNS CNAME + new Vercel project (or Vercel rewrite project) + SSL cert provisioning | Cleanest marketing URL. Spec-aligned. **Requires explicit infra approval.** |
| **(β) Frontend path with backend proxy** | `finsuite.zyrix.co/s/{slug}` | **ZERO** — single `vercel.json` rewrite to the Railway backend's HTML endpoint | Clean URL on existing domain; backend serves the HTML; frontend never gets the request. |
| **(γ) Backend direct** | `finsuite-backend-production.up.railway.app/share/i/{slug}` | **ZERO** — just a new Express route | Functional but ugly URL surfaces in shares; bad marketing. |

Option β is the sweet spot: zero infra change, clean URL, backend renders the HTML. The `vercel.json` rewrite is a config file in the frontend repo — Vercel rewrites can proxy to external URLs.

```json
// proposed vercel.json (vercel.json change is config, NOT infra)
{
  "rewrites": [
    { "source": "/s/:slug", "destination": "https://finsuite-backend-production.up.railway.app/share/i/:slug" },
    { "source": "/r/:slug", "destination": "https://finsuite-backend-production.up.railway.app/share/r/:slug" },
    { "source": "/(.*)",    "destination": "/index.html" }
  ]
}
```

The backend serves the full cinematic HTML (with OG tags, gradient mesh, comment widget). Crawlers and humans both see the same content; no client-side hydration needed for the SEO/preview pass.

### 2.3 Backend HTML rendering — feasibility

Today the backend serves zero HTML pages — only JSON (`/p/:slug` from `publicProfileController`) and binary (`/share/:token` PDF from D-3). But it has exactly the tools needed for HTML page generation:

- **Templating pattern**: D-2's `_layout.ts` already builds full HTML strings with embedded CSS, embedded `@font-face` (WOFF2 inlined), and `<style>` tags. Not React JSX, just template literals — same approach works for a public web page (just remove `@page A4`, add OG meta tags).
- **Express response**: `res.set('Content-Type', 'text/html').send(html)`. Trivial.
- **OG image URL**: backend can also serve `/og/share/:slug.png` (B.4 below).

This means the **public share page is built almost entirely from D-2 conventions** — design tokens, fonts, palette helpers, escape utility — applied to an HTML page instead of a PDF page.

### 2.4 D-3 share precedent

`GET /share/:token` (mounted at `src/index.ts:114`, controller at `src/controllers/publicShareController.ts`) is the closest existing pattern: public, no auth, token in URL is the credential, returns binary. D-7 follows the same pattern but:
- Different credential type (8-char nanoid slug vs JWT)
- Different output (HTML page vs PDF binary)
- Different lookup table (`PublicShareLink` vs `InsightShare`)

D-7 does NOT touch D-3. Both endpoints coexist; the share-link tables are independent.

---

## 3. A.2 — SEO / OG / image generation audit

### 3.1 OG meta tags

Once the backend renders HTML directly (§2), OG tags are inline:

```html
<meta property="og:title"       content="..." />
<meta property="og:description" content="..." />
<meta property="og:image"       content="https://api.finsuite.zyrix.co/og/share/{slug}.png" />
<meta property="og:url"         content="https://finsuite.zyrix.co/s/{slug}" />
<meta property="og:type"        content="article" />
<meta name="twitter:card"       content="summary_large_image" />
```

Privacy mode dictates what title/description say: full transparency includes numbers; `narrative_only` shows only a short title, etc. (§7.E privacy renderer).

### 3.2 OG image generation

Spec says `@vercel/og`. Mehmet's instructions: **do NOT introduce `@vercel/og` or `node-canvas` without approval**. Both are net-new infra deps.

**The puppeteer-pool answer**: D-2's renderer (`src/services/pdf/pdfRenderer.ts`) already maintains a Chromium browser pool that's been stable since D-2.5. Puppeteer's `page.screenshot({ type: 'png', clip: { width: 1200, height: 630 } })` produces PNG output using the **same browser pool**. We add a sibling file `src/services/share/ogImageRenderer.ts` (mirroring `pdfRenderer.ts` shape but calling `screenshot` instead of `pdf`) — zero new deps, zero infra.

This reuses the entire D-2.5 hardening work (Chromium libs in `nixpacks.toml`, the t64-suffix audit, the multi-process flag fix). One Puppeteer pool serves both PDFs and OG images.

Cache strategy: serve the PNG with `Cache-Control: public, max-age=86400, immutable` so the crawler/CDN/browser all cache it. No need to persist to disk (matches D-6's decision §6.B for PDFs — on-demand re-render with HTTP cache headers).

### 3.3 Robots.txt + sitemap

Hard requirement from spec: `/s/*` should be `noindex` by default; merchant can opt-in.

Two small additive changes:
- Backend serves `GET /robots.txt` returning `User-agent: *\nDisallow: /share/i/\nDisallow: /share/r/\n` (or per-slug guidance)
- HTML response per share page includes `<meta name="robots" content="noindex,nofollow">` UNLESS merchant has `discoverable: true` set on the share record

No sitemap for share pages. (Public share content is private-by-default — surfacing in sitemaps would defeat the link-credential model.)

---

## 4. A.3 — Comment moderation audit

### 4.1 Existing rate-limiting precedents

- `globalRateLimiter` (D-3 era, `src/middleware/rateLimiter.ts`): 500 reqs / 15 min per IP. Mounted on every route.
- D-3 sharing (`src/controllers/customer/sharingController.ts:37–52`): in-memory bucket, 20 share creations / merchant / hour.
- D-5 morning-brief test send (`controllers/customer/morningBriefController.ts`): 1/60s/merchant, in-memory map.
- D-6 weekly-report test send: same pattern.

No captcha, honeypot, or hCaptcha in the codebase today.

### 4.2 hCaptcha — explicit cost evaluation

Spec says hCaptcha. Mehmet's instruction: **surface this and propose alternatives if hCaptcha would add disproportionate weight.** Real cost:

| Item | What it adds |
|---|---|
| **Env vars** | `HCAPTCHA_SITEKEY` (frontend public), `HCAPTCHA_SECRET` (backend) — **2 new env vars = INFRA approval needed** |
| **Frontend dep** | Either `@hcaptcha/react-hcaptcha` (~30 KB) OR a script tag from `https://js.hcaptcha.com/1/api.js` + manual element (no new dep). Script tag is the "no new dep" path. |
| **Backend dep** | None — hCaptcha verification is a single `fetch()` call to `https://hcaptcha.com/siteverify`. ~20 lines of code. |
| **Free tier** | 1M challenges / month free. Sufficient for V1. |
| **UX cost** | Visible challenge appears on first comment per session. Adds friction. |

So hCaptcha costs **2 env vars + a script tag + 20 lines of backend code**. The 2 env vars are the only true infra ask.

### 4.3 Alternatives without env vars

| Option | Mechanism | Effectiveness |
|---|---|---|
| **(γ.1) Honeypot field + rate limit + optional email gate** | Hidden form field that bots fill, humans don't; combined with 5 comments/IP/hour and an optional `requireEmail` toggle on the share | Catches dumb bots; not skilled spammers; zero new deps; zero env vars |
| **(γ.2) Math challenge ("3 + 4 = ?")** | Simple inline arithmetic in the form | Trivially defeated by AI bots in 2026 — not worth the friction |
| **(γ.3) Cloudflare Turnstile** | Same profile as hCaptcha (env vars + script tag); free tier even larger | Same infra cost as hCaptcha; no advantage for V1 |
| **(γ.4) Time-of-form-render delay heuristic** | Server records form-render timestamp; rejects submissions < 3s after render | Catches scripted bots; zero env vars; weak alone |

**Recommended for V1**: γ.1 (honeypot + rate limit + optional email gate). If production sees real spam in the first 30 days post-launch, promote to hCaptcha as a follow-up. Documenting hCaptcha as the V2 upgrade path.

### 4.4 Notification on new comment — D-4 engine wiring

Notification engine (`src/services/notifications/engine.ts`) is unchanged. New event type:

```ts
await dispatch({
  merchantId,
  severity:   "SHARE_EVENT",
  type:       "share.comment_posted",
  title:      "Yeni yorum geldi",
  body:       `${authorName} bir yorum bıraktı.`,
  iconTone:   "cyan",
  ctaLabel:   "Görüntüle",
  ctaRoute:   `/insights/share-links?slug=${slug}`,
  data:       { shareLinkId, commentId, authorName }
});
```

The engine already routes to in-app + email per the merchant's `NotificationPreference.shareEventChannels`. No engine changes; no schema changes.

### 4.5 Profanity filter

Spec mentions "optional, basic word list per locale". Recommend: **deferred for V1**. Honeypot + rate limit + post-hoc admin moderation (hide button) is enough. A built-in word list creates locale-specific maintenance burden and false positives. If we see actual spam patterns, build a focused filter then.

---

## 5. A.4 — Adjacent infrastructure checks (added beyond spec scope)

### 5.1 Slug generation

Spec: "Slug: 8-char nanoid, no PII". `nanoid` is NOT in `package.json`.

**Zero-new-dep option**: `crypto.randomBytes(6).toString('base64url')` produces an exactly 8-character URL-safe string from 48 bits = 281 trillion combinations. Collision after ~16M slugs (birthday-paradox sqrt). For V1's expected ~thousands of shares: completely safe. We add a unique constraint on the slug column; if generation collides, retry once.

Alternative: `crypto.randomBytes(4).toString('hex')` → 8 hex chars but only 32 bits = 4.3B combinations (collision after ~65k). Less safe.

Recommend `randomBytes(6).toString('base64url')`. ~5 lines of Node code, no dep.

### 5.2 Existing public-route precedents on the frontend

D-5 `/unsubscribe` and D-6 `/unsubscribe-weekly` are SPA routes (no SSR, no OG tags) that work because **users click email links → land on SPA → JS reads URL token**. No crawler ever visits these.

D-7 share pages are different: **shared in messaging apps where crawlers DO visit first**. So they cannot be SPA routes; they must come from a server-rendered HTML response. (See §2.)

### 5.3 D-3 + D-7 schema relationship

`InsightShare` (D-3): JWT-signed token, recipient-specific email path, PDF attachment.
`PublicShareLink` (D-7, new): nanoid slug, anyone-with-link, full HTML page + comments.

These are **independent tables** — both can coexist on the same insight. Different join models, different lifecycle, different revocation semantics. The D-3 row tracks delivery to a known recipient; the D-7 row tracks public-page engagement.

D-7 does NOT migrate or modify any D-3 row.

---

## 6. Open decisions for Mehmet (BLOCKERS for Phase B)

These are not infrastructure changes per se — they're architecture and naming choices. None require new infra deps if the recommended option is picked.

### 6.A — URL routing strategy

| Option | Trade-off |
|---|---|
| **(A1) Subdomain** `share.zyrix.co/i/{slug}` (per spec) | Cleanest marketing URL. **Requires DNS CNAME + Vercel project setup (INFRA — needs explicit approval).** |
| **(A2) Frontend path with backend proxy** `finsuite.zyrix.co/s/{slug}` via `vercel.json` rewrite to backend HTML endpoint | Clean URL on existing domain. **Zero infra change** — `vercel.json` is a config file in this repo. |
| **(A3) Backend direct** `finsuite-backend-production.up.railway.app/share/i/{slug}` | Functional but ugly. No rebrand path. |

**Recommended: A2.** The `vercel.json` rewrite is a single 2-line addition; no DNS work; URL still says `finsuite.zyrix.co`. If you later want the `share.zyrix.co` brand, that's a follow-up sprint that adds DNS + a second Vercel rewrite.

### 6.B — Public page rendering

| Option | Trade-off |
|---|---|
| **(B1) Backend Express HTML template** (mirrors D-2's `_layout.ts` pattern, full HTML string with embedded CSS + OG tags + comment widget JS) | Zero new deps. Works in all crawlers. ~600 lines for the template + 200 lines for the comment widget JS. |
| **(B2) SPA route + react-helmet** | OG tags don't work for crawlers. **Won't satisfy the "shareable on WhatsApp" requirement.** |
| **(B3) Vite SSG prerender** | Not viable for dynamic links (would need a build per share). |
| **(B4) Vercel/Cloudflare edge function** | New infra. Also more complex than backend HTML. |

**Recommended: B1.** Same templating discipline as D-2 PDFs; one more route on the existing Express server.

### 6.C — Slug generation

| Option | Trade-off |
|---|---|
| **(C1) Add `nanoid` dep** (~3 KB) | Well-known, has standard URL-safe alphabet. **One new dep — needs approval per hard rule.** |
| **(C2) `crypto.randomBytes(6).toString('base64url')`** | Zero new deps; 8 chars; 281T combinations. Built into Node. |

**Recommended: C2.** Native Node primitive; no dep approval needed.

### 6.D — OG image generation

| Option | Trade-off |
|---|---|
| **(D1) Reuse Puppeteer pool** with `page.screenshot()` instead of `page.pdf()` (sibling file `services/share/ogImageRenderer.ts`) | Zero new deps. Reuses D-2.5 hardening work. ~80 lines. |
| **(D2) `@vercel/og`** | New dep. **Blocked by hard rule without approval.** |
| **(D3) `node-canvas`** | New dep + apt-package surface area expansion (we just hit the t64 problem with Chromium libs in D-2.5). Strongly de-recommended. |
| **(D4) No OG image; reuse a single brand image hosted in repo** | Zero new code. Loses per-insight personalization. |

**Recommended: D1.** Best of both: per-share polish, zero infra. Cache via HTTP `Cache-Control: max-age=86400` so each unique slug renders once and CDN/browser/crawler caches it.

### 6.E — Spam prevention

| Option | Trade-off |
|---|---|
| **(E1) Honeypot field + 5/IP/hour rate limit + optional name+email gate** | Zero new deps. Catches dumb bots. Vulnerable to skilled attackers. |
| **(E2) hCaptcha** | 2 env vars + script tag + ~20-line backend verifier. **Env vars need infra approval.** Free tier 1M/mo. |
| **(E3) Cloudflare Turnstile** | Same shape as hCaptcha; same approval cost; no V1 advantage. |

**Recommended: E1 for V1.** If production sees real spam, promote to E2 as a 1-day follow-up. The `commentForm` design includes the honeypot field from day one so we don't have to retrofit.

### 6.F — Schema naming + privacy field translation

Spec uses `companyId`, `userId`, `createdBy`. Hard rule: `merchantId` everywhere.

Proposed schema (with translations applied):

```prisma
model PublicShareLink {
  id            String   @id @default(cuid())
  slug          String   @unique     // crypto.randomBytes(6) base64url, 8 chars
  merchantId    String                // (NOT companyId)
  resourceType  String               // 'insight' | 'daily_brief' | 'weekly_report'
  resourceId    String
  privacyMode   String               // 'full' | 'masked' | 'narrative_only' | 'anonymous'
  expiresAt     DateTime?
  permanent     Boolean  @default(false)
  passwordHash  String?              // bcrypt; nullable
  allowComments Boolean  @default(true)
  requireEmail  Boolean  @default(false)
  discoverable  Boolean  @default(false)  // robots.txt opt-in
  viewCount     Int      @default(0)
  commentCount  Int      @default(0)
  lastViewedAt  DateTime?
  revoked       Boolean  @default(false)
  revokedAt     DateTime?
  createdAt     DateTime @default(now())
  createdBy     String                // merchantId (no sub-user model in current schema)
  merchant      Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  comments      ShareComment[]
  views         ShareView[]
  @@index([slug])
  @@index([merchantId, createdAt])
}

model ShareComment {
  id           String   @id @default(cuid())
  shareLinkId  String
  parentId     String?              // for 1-level-deep replies
  authorName   String
  authorEmail  String?
  body         String   @db.Text
  ipHash       String
  hidden       Boolean  @default(false)
  hiddenReason String?
  createdAt    DateTime @default(now())
  shareLink    PublicShareLink @relation(fields: [shareLinkId], references: [id], onDelete: Cascade)
  parent       ShareComment?   @relation("ShareCommentReplies", fields: [parentId], references: [id], onDelete: SetNull)
  replies      ShareComment[]  @relation("ShareCommentReplies")
  @@index([shareLinkId, createdAt])
}

model ShareView {
  id           String   @id @default(cuid())
  shareLinkId  String
  ipHash       String
  userAgent    String?
  referer      String?
  country      String?
  viewedAt     DateTime @default(now())
  shareLink    PublicShareLink @relation(fields: [shareLinkId], references: [id], onDelete: Cascade)
  @@index([shareLinkId, viewedAt])
}
```

Table names (`@@map`): `public_share_links`, `share_comments`, `share_views`.

**Recommended: confirm above shape.** If you'd rather have `createdBy` reference a separate user record, surface that — but the current schema has no sub-user model below `Merchant`, so `merchantId` is the only meaningful "who created this" field.

### 6.G — Notification severity for comment posted

| Option | Trade-off |
|---|---|
| **(G1) Reuse `SHARE_EVENT` severity** | No schema change. Routes via the merchant's `shareEventChannels` preference. Matches D-3 (share opened) and D-6 (weekly report ready) precedent. |
| **(G2) New severity `COMMENT`** | More semantic clarity. Requires a `commentChannels` column on `NotificationPreference`. |

**Recommended: G1.** V1 ships under `SHARE_EVENT`. If users complain that comment notifications spam them, promote later.

### 6.H — Comment threading depth

Spec: "Reply functionality (threaded, 1 level deep)". Schema supports nullable `parentId`; max-one-level enforced server-side: when posting a reply, reject if the parent itself has a non-null `parentId`. Recommend just confirming this is V1 scope.

---

## 7. Hard-rule compliance checklist

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Recommended path adds ZERO infra changes (no DNS, no env vars, no new deps, no Node version change). The `vercel.json` rewrite is a frontend repo config file, not infrastructure. hCaptcha is documented as a future option requiring approval. |
| **`merchantId` everywhere, NOT `companyId`** | ✅ All proposed schema fields use `merchantId`. Spec's `companyId / userId / createdBy` translated. |
| **No mods to `aiBriefController.ts` / `merchantSnapshot.ts` / KPI logic** | ✅ D-7 reads from `Insight` rows (not protected) and writes new `PublicShareLink` / `ShareComment` / `ShareView` rows. Zero touches to protected files. |
| **Plain JSX + inline styles + design tokens — no Tailwind / TS / shadcn / Next.js** | ✅ The single frontend page (`/insights/share-links` management) is plain JSX following the D-4/D-5 precedent. The public share page is **backend-rendered HTML** (template-literal strings; no JSX, no Vite, no Next.js). |
| **All commit messages in English** | ✅ Will follow. |
| **Strict micro-commits** | ✅ Phase B sequence in spec is 17 commits; will trim to ~15 by combining the two public pages (`/i` and `/r`) and combining DNS-config-alternative (vercel.json rewrite) with backend HTML template. |
| **Stop on unexpected output** | ✅ Will follow. |
| **D-3 sharing infra as foundation** | ✅ D-7 builds parallel public-share infra without touching `services/sharing/*` or D-3 schema. |
| **OG image via reused Puppeteer pool, not @vercel/og or node-canvas** | ✅ Sibling file `services/share/ogImageRenderer.ts` reuses the pool. |
| **D-4 notification engine fires comment events** | ✅ `dispatch({ severity: 'SHARE_EVENT', type: 'share.comment_posted', ... })`. No engine changes. |
| **Public pages SSR or static** | ✅ Backend Express HTML route (server-rendered every request, with HTTP cache headers for the OG image). |

---

## 8. Files to-be-added in Phase B

### Backend

```
prisma/manual-migrations/2026-05-1X_public_share_d7.sql

src/services/share/
├── slug.ts                  — generateSlug() via crypto.randomBytes(6).base64url
├── privacyRenderer.ts       — applyPrivacy(insight, mode) — masks/strips/anonymizes
├── ogImageRenderer.ts       — sibling to pdfRenderer; page.screenshot 1200×630 PNG
├── publicShareTemplate.ts   — full HTML page template (mirrors PDF templates structure)
└── ipHash.ts                — sha256(ip + per-day-salt) for view/comment dedup

src/controllers/customer/
└── publicShareLinksController.ts   — CRUD: list / create / get / patch / revoke

src/controllers/
└── publicShareLinkController.ts    — public: GET HTML page, GET OG image, POST/GET comments, POST track

src/routes/
├── customer/publicShareLinks.ts
└── publicShareLink.ts                — mounts /share/i/:slug, /share/r/:slug, /og/share/:slug.png, /api/public/share/:slug/comments
```

### Frontend

```
src/api/v2/publicShareLinks.js       — customer-side CRUD + comment fetch (for management page)
src/pages/v2/insights/ShareLinksManagementPage.jsx   — /insights/share-links archive + revoke + edit
src/components/v2/insights/ShareLinkModal.jsx        — generation modal (D-3 ShareInsightModal pattern)
src/i18n/dashboard/publicShare.{tr,en,ar}.json       — canonical translation source

vercel.json                          — add 2 rewrite rules (one for /s/, one for /r/)
```

The **public share page itself is NOT a frontend file** — it's served by the backend. No new SPA route needed (`/s/:slug` and `/r/:slug` proxy to backend via `vercel.json`).

---

## 9. Phase B readiness

Phase A is complete. Phase B is blocked on Mehmet's answers to the 8 questions in §6:

| Decision | Recommended | Impact if changed |
|---|---|---|
| **6.A** URL routing | **A2** (vercel.json rewrite, zero infra) | A1 needs DNS approval; A3 ships ugly URL. |
| **6.B** Public page rendering | **B1** (backend HTML template) | B2 breaks crawler previews; B4 needs new infra. |
| **6.C** Slug generation | **C2** (`crypto.randomBytes`) | C1 adds `nanoid` dep. |
| **6.D** OG image | **D1** (reuse Puppeteer pool) | D2/D3 blocked by hard rule. |
| **6.E** Spam prevention | **E1** (honeypot + rate limit; hCaptcha as documented future option) | E2 needs env-var approval. |
| **6.F** Schema naming | **Confirmed** (merchantId everywhere; createdBy = merchantId) | Different relation requires sub-user schema work. |
| **6.G** Notification severity | **G1** (reuse SHARE_EVENT) | G2 needs NotificationPreference column. |
| **6.H** Comment threading | **1-level deep, server-enforced** | Spec-aligned. |

Once Mehmet confirms the picks above, Phase B proceeds autonomously per the spec's commit sequence (translating `companyId/userId` → `merchantId`, swapping `next/head` for backend HTML, swapping `@vercel/og` for the Puppeteer-pool screenshot path).

---

**Phase A — DONE. Awaiting review.**
