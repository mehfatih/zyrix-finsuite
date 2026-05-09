# Sprint D-3 — WhatsApp + Email Sharing: Discovery Report

**Date:** 2026-05-09
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend` (sharing service + endpoints)
**Branch:** `main`
**Scope:** Phase A of `sprint-d3-sharing.md` — read-only audit. One commit (this doc). Phase B awaits approval.

---

## TL;DR

The pieces D-3 needs are mostly already in the repo:

- **Resend SDK** is installed (`resend ^6.12.0`), the API key is set in production, and `src/services/emailService.ts` already exposes a working `sendRawEmail({ to, subject, html, from? })` helper. We extend that, no new email dep needed.
- **WhatsApp Business Cloud API** is *also* fully implemented (`src/services/whatsappService.ts`, Meta Graph API v20.0, supports text + media + templates). However, the production env doesn't have `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` set, so the service short-circuits with a "credentials not configured" error. **wa.me deep links are the right path for D-3** per your kickoff direction; the existing API stays dormant as a future "send-without-tap" option.
- **No file-storage infrastructure** exists anywhere in the backend (no S3, no Railway volume, no `aws-sdk`). The D-3 spec's "upload to S3 or Railway volume" path **would require new deps + env vars + dashboard config — all blocked by your new hard rule**. Two code-only alternatives that don't touch infrastructure are available; one is recommended.
- **PDF generation is currently RUNTIME BLOCKED** (D-2 verification gap). D-3's email-with-attached-PDF path inherits that block. The wa.me path can ship and be partially verified even with PDFs still broken.
- **A new `SharingRecipient` model is justified** — neither `MuhasebeciLink` nor `TeamMember` fits the "save my accountant's contact info to one-tap re-share insights" use case, and `Customer` is semantically wrong (it's the merchant's *own customers*, not their professional network).
- **Naming discrepancy** with the spec, same as D-1/D-2: spec uses `companyId`, schema has `merchantId`. Mapping is unambiguous.

Five small open questions for you to adjudicate before Phase B starts. They're at the bottom.

---

## A.1 — Existing email infrastructure

### Resend SDK

`package.json` (backend): `"resend": "^6.12.0"` — **already installed**, no new dep needed.

`.env` in production: `RESEND_API_KEY="re_ekVi7jzc_8y..."` — **set and active** (verified by checking the existing welcome-email flow works via that key).

### Sender domain

**The spec says `noreply@zyrix.co`. The actual sender is `Zyrix FinSuite <hello@zyrix.co>`** (`src/services/emailService.ts:6`). The existing welcome / trial-warning / suspension emails all ship from `hello@zyrix.co`. Confirming this is the correct domain for sharing emails too — see Open Q5.

### Existing email helpers

`src/services/emailService.ts` exports:

```ts
sendWelcomeEmail({ to, name, trialEndsAt })            // Sprint 1, branded
sendTrialExpiryWarning({ to, name, trialEndsAt })      // Sprint 1, branded
sendSuspensionWarning({ to, name })                    // Sprint 1, branded
sendRawEmail({ to, subject, html, from? })             // Stage 8 Phase B — generic raw-HTML send
```

`sendRawEmail` is the right primitive for D-3's `sendInsightEmail`: pass a custom subject + a string of HTML + (optional) `from` override and Resend handles delivery. No need to introduce `@react-email/components` — the existing template style is **plain HTML strings with inline styles** (e.g. `<div style="background:linear-gradient(135deg,#6C3AFF,#F43F8E);…">`), matching the D-2 PDF template approach. Also: the D-3 spec explicitly allows "inline templates" if the React-Email lib is bloated.

### Bounce / error handling

Currently **none.** `await resend.emails.send(...)` is fire-and-forget; errors propagate up the call stack but no webhook integration exists for delivery tracking. Resend webhooks (`email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.complained`) would need:
- A new public route, e.g. `POST /api/webhooks/resend`
- Webhook signature verification (Resend uses Svix-style HMAC)
- A new env var `RESEND_WEBHOOK_SECRET` — **infra change, requires your approval**

For D-3 we can ship the share path WITHOUT webhook tracking (the `InsightShare.status` starts at `'sent'` and stays there; `delivered` / `opened` columns remain null). D-4 (Notification system) is a natural place to add webhook-driven status updates. See Open Q4.

### Email attachments

Resend supports attachments natively: `{ attachments: [{ filename: 'insight.pdf', content: <Buffer> }] }`. Up to 40 MB total payload. **This is the cleanest way to ship PDFs with share emails — no hosting, no signed URLs, no infra.**

Limitation: the recipient gets the PDF in their email but cannot easily forward a link. For a "share-via-email" use case, this is fine — the person you emailed has the PDF; if they want others to see it, they can forward the email.

---

## A.2 — WhatsApp Business integration

### What exists today

`src/services/whatsappService.ts` is a **complete Meta WhatsApp Business Cloud API client** (Graph v20.0). It supports:

```ts
sendWhatsAppMessage({
  recipientPhone:   "+905551234567",   // E.164
  bodyText?:        string,
  templateName?:    string,
  templateParams?:  string[],
  mediaUrl?:        string,
  mediaType?:       "image" | "document" | "video",
  documentName?:    string,
  caption?:         string
})
```

Plus:
- `src/controllers/whatsappController.ts` — invoice send / list / detail endpoints
- `src/services/whatsappReminderService.ts` — automated invoice reminders (cron-driven)
- `prisma/schema.prisma` `WhatsAppMessage` model — full message log with status (`PENDING/QUEUED/SENT/DELIVERED/READ/FAILED`), provider message id, error reason, sent/delivered/read timestamps
- `Invoice.whatsappSentAt` / `whatsappStatus` columns

### What's actually configured in production

```
RESEND_API_KEY            ✅ set
WHATSAPP_TOKEN            ❌ not set
WHATSAPP_PHONE_ID         ❌ not set
WHATSAPP_BUSINESS_ID      ❌ not set
WHATSAPP_VERIFY_TOKEN     ❌ not set
```

`whatsappService.ts:46` early-returns `{ success: false, error: "WhatsApp credentials not configured." }` whenever any of those is missing. So all the WhatsApp infrastructure is dormant — the model rows are empty, the controller endpoints return errors, the cron reminder is a no-op.

Enabling the API would require all four env vars + a Meta Business Account with a WhatsApp Business phone number provisioned. That's a non-trivial onboarding (Meta verification, template approval, etc.) and is **explicitly an infrastructure change** per your hard rule.

### Recommendation: wa.me deep links for D-3 (per your kickoff)

Per the user kickoff: "WhatsApp uses wa.me deep links (no API needed). No new infrastructure should be required."

`wa.me` URLs are a public Meta-provided redirect:

```
https://wa.me/{phone_e164_no_plus}?text={url-encoded-text}
```

Tap on mobile → opens WhatsApp with the message pre-filled, recipient pre-selected, user taps "Send" themselves. Works on all platforms (iOS, Android, Web WhatsApp, WhatsApp Business).

**Trade-off vs the dormant API:**

| | wa.me (D-3 path) | Cloud API (dormant) |
|---|---|---|
| Setup | Zero — already works | Meta Business + 4 env vars + template approval |
| User taps "Send" | Yes (one extra tap) | No (fully automated) |
| Can attach PDF directly | No (link only — recipient clicks → downloads) | Yes (send media URL with caption) |
| Phone validation | Client-side regex | Server-side Meta API |
| Delivery tracking | None (we never see the message) | Full webhooks (sent/delivered/read) |
| Cost | Free | $0.005-$0.05 per conversation |
| Compliance | Recipient explicitly initiates send → minimal | Stricter Meta policies |

For D-3's "share an insight with my accountant" use case, **the extra tap is fine** — the merchant is choosing to share each time. The Cloud API would be appropriate for D-5 (daily auto-emailed brief) or D-9 (Slack/Teams autoposting), where automation matters.

### How the wa.me message will look

```
TR (default):
  📊 Bugünün Brifingi — Demir Tekstil
  
  KRİTİK: Gecikmiş alacaklar yüksek
  3 müşteriden ₺75.500 gecikmiş alacak. En büyük risk Yılmaz Holding.
  
  PDF: https://finsuite-backend-production.up.railway.app/share/abc123
  
  — Zyrix FinSuite

AR / EN: same shape, localized copy.
```

The PDF link is the elephant in the room. See A.4 + Open Q1.

---

## A.3 — Recipient / contact data audit

### Models that already store name + email + phone

| Model | Purpose | Has email | Has phone | Fit for "share with my accountant"? |
|---|---|:---:|:---:|---|
| `Customer` | Merchant's own customers (B2B/B2C clients) | ✅ optional | ✅ optional | ❌ Wrong semantics — accountant is not a customer of the merchant |
| `MuhasebeciLink` | Accountant access tokens (read-only login to merchant data) | ✅ required | ❌ | ❌ Auth-purpose — this grants dashboard access. Sharing an insight ≠ granting dashboard access |
| `TeamMember` | Internal employees of the merchant | ✅ required | ❌ | ⚠ Partial fit if sharing only with employees, but accountants/partners are external |

### Recommendation: new `SharingRecipient` model

The D-3 spec's proposed model is well-shaped. Adapted to our schema (merchantId, not companyId):

```prisma
model SharingRecipient {
  id           String   @id @default(cuid())
  merchantId   String                                      // NOT companyId — schema has Merchant only
  name         String
  email        String?
  phone        String?                                     // E.164 format, e.g. "+905551234567"
  role         String?                                     // free-text label
  avatarUrl    String?
  lastUsedAt   DateTime?
  shareCount   Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  merchant     Merchant       @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  shares       InsightShare[]

  @@index([merchantId, lastUsedAt])
  @@map("sharing_recipients")
}

model InsightShare {
  id                String    @id @default(cuid())
  merchantId        String
  insightId         String?
  reportType        String                                  // 'single_insight' | 'daily_brief' | 'range_report'
  channel           String                                  // 'email' | 'whatsapp'
  recipientId       String?
  recipientSnapshot Json                                    // captured name/email/phone at time of share
  message           String    @db.Text
  pdfShareToken     String?   @unique                       // signed JWT token for the share endpoint (replaces pdfUrl)
  status            String                                  // 'sent' | 'delivered' | 'opened' | 'failed' | 'pending'
  sentAt            DateTime  @default(now())
  deliveredAt       DateTime?
  openedAt          DateTime?
  errorMessage      String?

  merchant          Merchant            @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  insight           Insight?            @relation(fields: [insightId], references: [id], onDelete: SetNull)
  recipient         SharingRecipient?   @relation(fields: [recipientId], references: [id], onDelete: SetNull)

  @@index([merchantId, sentAt])
  @@index([recipientId, sentAt])
  @@index([pdfShareToken])
  @@map("insight_shares")
}
```

Two changes vs the spec:
1. `companyId` → `merchantId` (carry-over from D-1/D-2 — schema has no `Company` model).
2. `pdfUrl` → `pdfShareToken` — see A.4 / Open Q1 for why.

**Optional Phase B nicety:** seed `SharingRecipient` rows from existing `MuhasebeciLink` + `TeamMember` entries on first use, so merchants don't have to re-enter their accountant's contact info. Out of D-3's required scope; flag for later.

### Phone normalization

`whatsappService.ts:30-37` already has `normalizePhone(phone)` (strip non-digits, drop leading `+`). For the D-3 sharing flow we'll want a slightly stricter E.164 validator on input. Doable in code, no new dep — Node's `RegExp` is sufficient. The `wa.me` URL just needs digits-only.

---

## A.4 — Privacy & compliance + PDF hosting (the crux)

### GDPR / KVKK on stored recipient emails

Storing recipient PII (name + email + phone) is fine under both GDPR and KVKK on the legal basis of *legitimate interest* + the data subject's awareness (the merchant is the data controller; they're choosing to add their accountant to their address book). Standard requirements:

- **Right to erasure:** delete endpoint must exist (`DELETE /api/customer/recipients/:id`) — already in the D-3 spec ✅
- **Right to access:** the merchant can list their own recipients (`GET /api/customer/recipients`) — already ✅
- **Multi-tenant isolation:** every endpoint MUST filter by `req.merchant.id`. The shape we'll use is identical to D-1/D-2's pattern (`prisma.x.findFirst({ where: { id, merchantId } })`).
- **Audit log:** `InsightShare.recipientSnapshot` captures the name/email/phone at the moment of share — even if the recipient is later deleted, the audit trail shows who got what when. ✅

No new compliance work needed beyond the standard pattern.

### PDF hosting — three options, only one stays inside the hard rule

The recipient needs to be able to download the PDF without an app login. The D-3 spec proposes "Upload to Railway volume or S3-compatible storage". Both **require infrastructure changes** prohibited by the new hard rule:

| Option | What it needs | Inside hard rule? |
|---|---|---|
| **(α) S3 / R2 / Cloudflare object storage** | new dep (`@aws-sdk/client-s3` or `@cloudflare/workers-types`), 4 new env vars, sender bucket creation | ❌ NO — needs approval |
| **(β) Railway persistent volume** | Volume mount in Railway dashboard, `RAILWAY_VOLUME_MOUNT_PATH` env var, write access on disk | ❌ NO — needs approval (also Railway volumes don't survive redeploys cleanly) |
| **(γ) Signed-token share endpoint, code-only** | new public route + JWT token signed with existing `env.jwtSecret`; PDF regenerated on demand each time the token is hit | ✅ YES — pure code |

**Recommendation: (γ) signed-token share endpoint.** Mechanism:

1. When a merchant initiates a share, the API creates an `InsightShare` row with `pdfShareToken` = a JWT signed with `env.jwtSecret` containing `{ shareId, merchantId, exp: now + 7d }`.
2. The wa.me message / email link points to `https://finsuite-backend-production.up.railway.app/share/{pdfShareToken}`.
3. A new public route `GET /share/:token` (no auth middleware):
   - Verifies the JWT
   - Loads the `InsightShare` row
   - Loads the underlying `Insight` (or daily brief / range report params)
   - Calls the D-2 PDF service to generate the PDF on demand
   - Streams it back with `Content-Type: application/pdf` + `Content-Disposition: attachment`
   - Atomically increments a `downloadCount` column on `InsightShare` and stamps `firstDownloadedAt`

**Trade-offs vs (α/β):**
- **+ Zero infrastructure** — fits inside your hard rule.
- **+ No persistent PDF storage** — privacy bonus (recipient can re-download for 7 days, then it's gone).
- **+ Single source of truth** — every download regenerates from the latest insight content (e.g. if the merchant updates the insight, future downloads reflect the update).
- **− CPU cost** — every download regenerates the PDF (~1-2s per render once the runtime libs are sorted in D-2.5). Negligible at the share volume we expect (~10/merchant/hour, ~1-3 downloads each).
- **− Cold-cache cost** — first browser launch on each container is ~2s. Dropping after the pool warms up.
- **− Ties D-3 to D-2 runtime fix** — same as the email-attachment path.

For email shares specifically, we have a fourth option: **(δ) inline base64 attachment** — Resend's `attachments` field carries the PDF buffer right in the email payload, no URL needed at all. Saves the recipient one click and works even if the share endpoint is rate-limited or down. Recommendation: use (δ) for email + (γ) for WhatsApp link, both reuse the same D-2 renderer.

### What to do if D-2 PDF rendering is still blocked when D-3 ships

D-3's wa.me path can ship and be partially verified without working PDF rendering: the share link is created, the row is in the database, the recipient gets a wa.me message — they just hit a 500 when they tap the link. We should ship D-3 alongside or after D-2.5 so the end-to-end flow works.

If you want D-3 visible in the UI before D-2.5 lands, we can:
- Ship the recipient management + share modal UI immediately
- Have the share endpoints return success and create rows
- Have the share endpoint return a placeholder PDF or error page until D-2.5 fixes the runtime

I'd argue for **shipping D-3 in lockstep with D-2.5** — better merchant experience to launch the whole sharing story together once PDFs work. See Open Q3.

---

## Proposed architecture (Phase B)

### Backend (`zyrix-finsuite-backend`)

```
src/services/sharing/
├── shareService.ts            # createShare(), generateShareToken(), verifyShareToken()
├── recipientsService.ts       # CRUD against SharingRecipient
├── waLink.ts                  # buildWhatsAppShareLink({ phone, message, pdfUrl })
└── shareTemplates/
    ├── emailHtml.ts           # branded HTML for share emails (inline strings, no React-Email)
    ├── emailHtml.tr.ts        # locale variants if we factor them out
    ├── emailHtml.ar.ts
    ├── emailHtml.en.ts
    └── waMessage.ts           # locale-aware text templates for wa.me

src/controllers/customer/
├── sharingRecipientsController.ts   # CRUD for SharingRecipient
├── sharingController.ts             # POST /share/email + /share/whatsapp + GET /shares/history
└── publicShareController.ts         # GET /share/:token (NO auth; signed JWT validates)

src/routes/customer/
├── recipients.ts                    # mounts /api/customer/recipients
└── sharing.ts                       # mounts /api/customer/share + /api/customer/shares

src/routes/
└── publicShare.ts                   # mounts /share (TOP-LEVEL, no /api prefix → cleaner share links)

prisma/manual-migrations/
└── 2026-05-09_sharing_recipient_and_insight_share.sql
```

### Frontend (`zyrix-finsuite`)

```
src/components/v2/sharing/
├── ShareInsightModal.jsx              # the takeover modal
├── RecipientPicker.jsx                # autocomplete + chip selection
├── RecipientAvatarChip.jsx
├── RecipientCreateForm.jsx
├── ChannelToggle.jsx                  # Email/WhatsApp tabs with neon underline
├── MessagePreview.jsx
└── index.js

src/api/v2/
├── recipients.js                      # CRUD client
└── sharing.js                         # send-email / send-wa / history clients

src/hooks/v2/
└── useShareInsight.js                 # state machine for share flow

src/pages/v2/insights/
├── RecipientsPage.jsx                 # /insights/recipients management page
└── SharesPage.jsx                     # /insights/shares audit log page
```

### API endpoints (corrected for our schema)

```
GET    /api/customer/recipients               list saved recipients (filtered by merchantId from JWT)
POST   /api/customer/recipients               create
PATCH  /api/customer/recipients/:id           update (merchant-scoped)
DELETE /api/customer/recipients/:id           delete (merchant-scoped)

POST   /api/customer/share/email              send via email
  body: {
    insightId?:    string,                    // for single-insight share
    reportType?:   'daily_brief' | 'range_report',
    reportParams?: { date?, startDate?, endDate?, sections?, theme? },
    recipientId?:  string,                    // null if ad-hoc
    recipient?:    { name, email, phone? },   // if ad-hoc
    customMessage: string,
    locale:        'tr'|'ar'|'en'
  }
  returns: { shareId, status }

POST   /api/customer/share/whatsapp           build wa.me URL + create share row
  body: same shape
  returns: { shareUrl, shareId }              // shareUrl is the wa.me link

GET    /api/customer/shares/history?days=30   merchant-scoped audit log
  returns: { shares: [...], count, days }

GET    /share/:token                          public — no auth — token-validated PDF download
  returns: 200 application/pdf  OR  404/410 on bad/expired token
```

All authenticated endpoints rate-limited at **20 shares / merchant / hour** (shared bucket across all `share/*` endpoints).

### Email template structure

Inline HTML strings, mirroring `emailService.ts`'s existing pattern. One template file per locale (or one file with three locale objects — flip a coin). Sections:

- **Header** — gradient mesh image (data URI to avoid hosting an image), Zyrix wordmark
- **Hero** — single-line subject ("Bugünün Brifingi: Demir Tekstil — 9 Mayıs 2026")
- **Sender name + custom message** — "Mehmet Fatih şunu paylaştı:" + the merchant's optional custom message
- **Insight preview** — embedded HTML matching the `<AIInsightCard />` card style
- **PDF attachment indicator** — "📎 daily-brief-demir-tekstil-2026-05-09.pdf" with file size
- **Footer** — "Powered by Zyrix" + small CTA, unsubscribe-style language for compliance optics

Total HTML payload < 50 KB. PDF attached via `attachments: [{ filename, content }]`.

---

## Discrepancies vs prompt assumptions (consolidated)

| # | Spec assumption | Reality | Resolution |
|---|---|---|---|
| 1 | Sender domain `noreply@zyrix.co` | Existing emails ship from `Zyrix FinSuite <hello@zyrix.co>` | See Open Q5 |
| 2 | `companyId` FK in Prisma | Schema only has `Merchant` | Use `merchantId` (carries forward from D-1/D-2) |
| 3 | "WhatsApp Business API integration on Zyrix CRM that FinSuite could reuse" | FinSuite **already has its own** WhatsApp Cloud API integration — but env vars not set in production | wa.me path for D-3 (no infra). Cloud API stays dormant for future |
| 4 | "Upload to Railway volume or S3-compatible storage" | **No storage infrastructure exists**; both options need new deps + env vars | Code-only signed-token endpoint (option γ) — recommended |
| 5 | "Use `@react-email/components` if not bloated, otherwise inline templates" | Existing emails are inline HTML strings | Inline — no new dep |
| 6 | Resend webhooks for delivery tracking | No webhook integration exists | D-4 or later — `delivered/opened` columns null in D-3 |
| 7 | PDF download link inside the share | D-2 PDF runtime is currently blocked (libnspr4.so) | D-3 ships in lockstep with D-2.5 — see Open Q3 |
| 8 | Existing Contact / SharingRecipient model | None of `Customer`/`MuhasebeciLink`/`TeamMember` fits | New `SharingRecipient` model (per spec, shape adjusted) |

None require infrastructure changes beyond what the new hard rule explicitly prohibits, **provided** we go with the recommended options below.

---

## Risk register

### R1 — D-2 runtime block makes D-3 PDFs un-downloadable until D-2.5

The wa.me + email infrastructure can ship and be code-tested without working PDF generation. But the actual user-visible result (recipient clicks link → gets PDF) is broken until Chromium runtime libs are fixed. **Recommendation: D-3 is shipped in lockstep with D-2.5.**

### R2 — Email rate / spam bucket

Resend transactional emails have generous limits, but a merchant could share aggressively. The 20/hour rate limit is shared across email + WhatsApp endpoints, which means a merchant burning 20 shares (mostly WA links) could starve themselves of email shares. **Mitigation: no change, the limit is generous and we want a single throttle.** If it bites in practice, split per-channel later.

### R3 — Phone format inconsistency

We have phone-related code in three places: `authController.ts` (Turkish-only validator), `whatsappService.ts` (E.164 stripping), `Customer.phone` (free string). For D-3 we want strict E.164. **Mitigation:** new `normalizeE164(phone, defaultCountry?)` helper in `src/services/sharing/utils/phone.ts`; reuse `whatsappService.normalizePhone` semantics; reject non-E.164 input on `POST /recipients`. Code-only.

### R4 — wa.me URL length

URL-encoded `text=` parameter: practical limit ~ 4000 chars on most platforms before mobile WhatsApp truncates. Our message + PDF link will be < 1000 chars. No risk.

### R5 — Resend webhook signature env var

If we want to add delivery / opened tracking later (D-4), the Resend webhook needs a `RESEND_WEBHOOK_SECRET` env var. **Out of scope for D-3.** Surfacing now so it's on the radar for D-4 planning.

### R6 — Multi-tenant isolation boundary on the public share endpoint

The new `GET /share/:token` is **public** by design (recipient doesn't have a Zyrix login). Security depends entirely on the JWT signature being unforgeable. **Mitigation:** sign with `env.jwtSecret` (already secret), 7-day expiry hardcoded, every endpoint checks the JWT's `merchantId` matches the loaded `InsightShare.merchantId` before serving. Same threat model as a Stripe / Resend "view this email" link — the share token IS the credential.

### R7 — Cinematic dark theme on a light dashboard

D-3 spec mandates the share modal use D-1 cinematic primitives (`<GradientMesh palette="aurora">`, `<AuroraButton>`, `<NeonBadge>`). This is the **second** place cinematic dark surfaces enter live light-themed pages (the first was D-2's `ExportPdfMenu` button). Per the D-1 Risk #1 resolution this is allowed but worth flagging — by D-3 we'll have three cinematic UI surfaces (D-2 buttons, D-3 share modal, D-3 recipients management page) that all sit on the V2 dashboard's light background.

---

## Five small questions for explicit approval before Phase B

1. **PDF hosting** — go with code-only signed-token endpoint (γ) for WhatsApp + base64 inline attachment (δ) for email? Or do you want to greenlight S3 / Railway-volume infra? Recommend **γ + δ**.
2. **Recipient model** — confirm new `SharingRecipient` model with `merchantId` FK. Recommend **yes**.
3. **Ship coordination with D-2.5** — D-3 PDFs require D-2's runtime fix. Land D-3 alongside D-2.5 (combined verification), or land the D-3 *plumbing* now and accept that PDF downloads remain broken until D-2.5? Recommend **alongside D-2.5** so the merchant experience launches whole.
4. **Resend webhooks for delivered/opened tracking** — defer to D-4 (notification system). Recommend **yes**, ship D-3 with `delivered/opened` columns null.
5. **Sender domain for share emails** — reuse `hello@zyrix.co` (consistent with existing brand voice), or carve out `share@zyrix.co` (semantic, but needs a new DNS sender + Resend domain verification = infra). Recommend **`hello@zyrix.co`** — no infra, fits brand voice, recipient sees a recognizable address.

If those five answers are as recommended, I have everything I need for Phase B and there's **zero infrastructure work** in scope: no new deps, no new env vars, no Railway dashboard touches.

---

## Files read during this audit

Backend:
- `package.json` (Resend version, no other email/storage deps)
- `.env` (which env vars are set in production — RESEND_API_KEY only)
- `src/services/emailService.ts` (existing send helpers + inline HTML pattern)
- `src/services/whatsappService.ts` (Cloud API client, dormant)
- `src/controllers/whatsappController.ts` (existing send-invoice routes)
- `src/config/env.ts` (env var declarations)
- `prisma/schema.prisma` (Customer, MuhasebeciLink, TeamMember, WhatsAppMessage, Insight, Merchant)

Frontend: none read this audit; all D-3 frontend work is greenfield against the components/v2/ tree built in D-1.
