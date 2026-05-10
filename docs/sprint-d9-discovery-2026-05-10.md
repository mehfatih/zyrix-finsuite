# Sprint D-9 — Slack & Microsoft Teams Integration: Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of the open decisions in §10 before Phase B**

---

## TL;DR

Three structural findings up front, two of them shape-of-sprint:

1. **Slack and Teams are NOT symmetric features.** Slack ships in a week with raw HTTP calls, Bolt-free. Microsoft Teams full integration (Bot Framework + Azure AD app + Adaptive Cards + bot-framework JWT verification + manifest packaging + side-loading flow) is essentially a parallel sprint. Recommendation: **ship Slack only in V1; defer Teams to D-9.5 or V2** (decision §10.A).
2. **Zero new SDK dependencies needed** for the recommended path. Slack OAuth, Block Kit posting, slash-command verification, and interaction handling all reduce to `fetch` + `crypto.createHmac('sha256', …)`. `@slack/bolt` (~50 sub-deps, 8 MB) and `botbuilder` (~80 sub-deps, 25 MB) are both avoidable. The repo already has the relevant primitives (decision §10.B).
3. **Existing infra covers ~70% of the integration surface:**
   - `src/utils/encryption.ts` — AES-256-GCM via `ENCRYPTION_KEY` (already in prod for 2FA secrets) → encrypts Slack bot tokens at rest, no new key needed.
   - `src/controllers/webhooks/resendWebhookController.ts` — HMAC verification + `express.raw()` mount pattern → near-1:1 template for Slack `/commands` and `/interactions` endpoints.
   - `src/services/notifications/engine.ts` + `ChannelDriver` interface → drop-in slot for a `slack` channel driver. No parallel notification system needed (carry-over rule honoured).
   - `src/services/share/ogImageRenderer.ts` (D-7) — Puppeteer pool, 1200×630 PNG output → reusable as Slack image-block "header art" if §10.G option G2 is picked.
   - `src/controllers/customer/insightController.ts` + `KPI_COMPUTATIONS` registry (D-8) — slash-command targets `/zyrix mrr` etc. become thin shells over the existing tools.

Required new env vars: **5** for Slack V1 (all surfaced in §9 for one-batch approval). Required new dependencies: **0** if the recommendations are taken.

**12 open decisions** are surfaced in §10. None of them require new infrastructure beyond the 5 env vars and the cron-job.org webhook keepalive listed in §10.K.

---

## 1. Repo geography (recap)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Frontend (Vite + React 18, plain JSX, design tokens at `src/design-system-v2/cinematic/tokens.js`). |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma + Gemini + Puppeteer + Resend on Railway. Has the notification engine, encryption helpers, OG renderer, and Resend webhook template that D-9 reuses. |

**Hard rule reminder:** `merchantId` everywhere, NOT `companyId / userId`. The sprint spec's example schema (`SlackInstallation.companyId`, `installedBy: userId`) translates to `merchantId` and `installedByMerchantId` (or simply `merchantId` — there is no sub-user model in this codebase per D-7's discovery note).

---

## 2. A.1 — Slack app setup audit

### 2.1 Slack OAuth v2 surface

Slack apps register at https://api.slack.com/apps. The OAuth v2 flow is:

```
GET  /oauth/v2/authorize?client_id=…&scope=…&redirect_uri=…&state=…
POST /oauth/v2/access  (server-to-server, exchanges code → bot_token + team_id + bot_user_id)
```

`/oauth/v2/access` returns:
```json
{
  "ok": true,
  "access_token": "xoxb-…",
  "token_type": "bot",
  "scope": "chat:write,commands,…",
  "bot_user_id": "U…",
  "team": { "id": "T…", "name": "Acme Corp" },
  "authed_user": { "id": "U…" },
  "incoming_webhook": { "channel_id": "C…", "channel": "#general", "url": "https://hooks.slack.com/…" }
}
```

**No SDK needed** — this is one POST with `application/x-www-form-urlencoded` body. The bot token (`xoxb-…`) is the credential we encrypt + store.

### 2.2 OAuth scopes for V1

Minimum-viable scope set:

| Scope | Purpose |
|---|---|
| `chat:write` | Post messages to channels the bot is in |
| `chat:write.public` | Post to public channels without joining first |
| `incoming-webhook` | Get the channel-level webhook URL during install (lets the user pick a default channel inside Slack's auth screen — UX win) |
| `commands` | Receive slash-command invocations |
| `channels:read` | List public channels for the channel-mapping UI |
| `groups:read` | List private channels (only if user wants to map insights to a private channel) |

**Not requested for V1** (kept narrow per Slack's own "principle of least privilege" guidance):
- `app_mentions:read` / `chat:write` to threads — V1 is one-way (insight → Slack); two-way mention handling is V2
- `users:read` / `users:read.email` — we don't need user identity beyond `installed_by`
- `files:write` — we won't upload PDFs to Slack in V1; if user wants the PDF, they click the action button and download from FinSuite

### 2.3 Distribution mode

Slack apps have three states:
1. **Single-workspace install** — only works for the workspace where the app is registered. Useless for SaaS.
2. **Distribute internally** — public OAuth URL; any workspace can install; no Slack review. **This is V1**.
3. **Slack App Directory** — Slack reviews the app; takes weeks; required for the "Add to Slack" button on a marketing page. **V2**.

For V1 the user clicks a button in `/settings/integrations` → opens `https://slack.com/oauth/v2/authorize?…` in a new tab → completes Slack's auth UI → Slack redirects back to our callback with `?code=…&state=…`.

### 2.4 Slash command + interactions registration

Two URLs registered on the app config page (one-time, manual):
- **Slash command** `/zyrix` → request URL `https://<api-base>/api/integrations/slack/commands`
- **Interactivity** → request URL `https://<api-base>/api/integrations/slack/interactions`

Both are POSTs with `application/x-www-form-urlencoded` body and Slack's signing-secret header. Verification is HMAC-SHA256 over `v0:{timestamp}:{rawBody}`.

### 2.5 Signing secret verification (template ready)

Slack's algorithm:

```
basestring = "v0:" + req.headers['x-slack-request-timestamp'] + ":" + rawBody
expected   = "v0=" + hmacSha256(SLACK_SIGNING_SECRET, basestring).toString('hex')
constantTimeCompare(expected, req.headers['x-slack-signature'])
reject if abs(now - timestamp) > 5 minutes  (replay protection)
```

`resendWebhookController.ts:23-49` already implements the same shape (Svix flavour: `msgId.timestamp.body`, then base64 HMAC). Slack's variant is a 30-line copy with three differences: prefix `v0:`, hex output, and a single signature header (no rotation list). **Template-ready, zero new crypto code.**

`express.raw()` mount: required (same as Resend webhook). The `routes/webhooks/resend.ts` file is the pattern; D-9 mirrors with `routes/integrations/slack.ts`.

---

## 3. A.2 — Microsoft Teams app setup audit

### 3.1 Two integration models, both with sharp edges

| Model | What you get | What it costs |
|---|---|---|
| **Incoming Webhook (channel connector)** | Per-channel webhook URL; one-way; Adaptive-Card-capable but no buttons that round-trip back to us | Microsoft has **announced deprecation** (incoming webhooks via O365 connectors retire Aug 2024 → fully replaced by "Workflows" using Power Automate). Building V1 on top of a deprecated API is a non-starter. |
| **Bot Framework + Azure AD app** | Full two-way: messages, Adaptive Card buttons, slash-style invocations via `/zyrix` mention, install-per-tenant, channel selection | Heavy: Azure AD app registration, Bot Framework registration at dev.botframework.com, Microsoft Graph permissions request + admin consent, Adaptive Card schema, Bot Framework JWT validation against Microsoft's OpenID metadata, manifest.json packaging, AppSource listing OR organizational side-loading approval. |

### 3.2 What "JWT validation" means in practice

Bot Framework signs every inbound POST with a JWT in `Authorization: Bearer …`. Verification requires:
1. Fetch `https://login.botframework.com/v1/.well-known/openidconfiguration`
2. Resolve `jwks_uri`, fetch the JWKS
3. Match the JWT's `kid` against the JWKS, extract the RSA public key
4. Verify signature, `iss`, `aud` (= our bot's MicrosoftAppId), `exp`
5. Validate against the channel's `serviceUrl` claim

This is **not 30 lines**. `botbuilder` does it in a black box; doing it raw means ~150 LOC + a JWKS cache. Either way it's more work than Slack's HMAC.

### 3.3 The "Adaptive Cards alone" middle path

Adaptive Cards (https://adaptivecards.io) are JSON schemas that render in Teams, Outlook, Webex, and elsewhere. We could:
- Render an Adaptive Card on the FinSuite side
- Send via the deprecated Incoming Webhook (works until Aug 2024)
- OR via Microsoft Graph `chatMessage` (requires Azure AD app + delegated user permissions — same Azure AD work as Bot Framework, no easier)

There's no "lite" Teams path that skips Azure AD.

### 3.4 Recommendation

**Defer Teams to D-9.5 or V2.** Spec § B.8 already labels it a "stretch goal." V1 covers Slack thoroughly, ships predictably, and lets us validate the channel-mapping + notification-driver design under real merchant load before paying the Teams complexity tax.

If Mehmet wants Teams in V1, the fall-back middle ground is **incoming-webhook-only Teams** (one-way, no buttons) with a clear "deprecated by Microsoft Aug 2024 — upgrade by then" warning in the settings UI. Decision §10.A.

---

## 4. A.3 — Webhook persistence audit

### 4.1 Encryption helper exists; reuse without modification

`src/utils/encryption.ts:23-43` — AES-256-GCM, format `iv(hex):tag(hex):ciphertext(hex)`. Key from `process.env.ENCRYPTION_KEY` (32-byte hex). **Already used in production** for 2FA TOTP secrets. Slack bot tokens (`xoxb-…`, ~50 chars) fit this helper one-for-one:

```ts
import { encrypt, decrypt } from "../../utils/encryption";

await prisma.slackInstallation.create({
  data: {
    merchantId,
    workspaceId: result.team.id,
    workspaceName: result.team.name,
    botToken: encrypt(result.access_token),   // <-- encrypted at rest
    botUserId: result.bot_user_id,
    incomingWebhookUrl: result.incoming_webhook?.url ? encrypt(result.incoming_webhook.url) : null,
    installedAt: new Date()
  }
});
```

No new key, no new encryption code. The `ENCRYPTION_KEY` env var is already set on Railway (verified by 2FA functioning in prod).

### 4.2 Multi-workspace per merchant

Spec hard constraint. Schema satisfies via `@@unique([merchantId, workspaceId])` — a merchant can have N installations as long as each is on a distinct Slack workspace. UI in `/settings/integrations` lists all installations side-by-side.

### 4.3 Schema additions (translated `companyId → merchantId`)

```prisma
// Sprint D-9 — Slack workspace install + channel-mapping rules.
model SlackInstallation {
  id                  String     @id @default(cuid())
  merchantId          String                            // SPEC SAID companyId — translated.
  workspaceId         String                            // Slack team_id (T…)
  workspaceName       String
  botToken            String                            // AES-256-GCM ciphertext
  botUserId           String                            // U… for "is this me" filtering
  incomingWebhookUrl  String?                           // optional; encrypted; ONLY if user picked a channel during install
  scope               String                            // granted scopes string from /oauth/v2/access
  installedAt         DateTime  @default(now())
  uninstalledAt       DateTime?

  merchant            Merchant                  @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  channelMappings     SlackChannelMapping[]
  outboundLogs        SlackOutboundLog[]

  @@unique([merchantId, workspaceId])
  @@index([merchantId, uninstalledAt])
  @@map("slack_installations")
}

// One row per (installation, insight-type) — controls where each
// severity bucket gets posted. Defaults to disabled until the user
// configures (hard rule: no defaults to #general).
model SlackChannelMapping {
  id              String   @id @default(cuid())
  installationId  String
  insightType     String                                // 'CRITICAL' | 'ATTENTION' | 'OPPORTUNITY' | 'SHARE_EVENT' | 'all'
  channelId       String                                // C… or G…
  channelName     String                                // for display only; we re-fetch on use
  enabled         Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  installation    SlackInstallation @relation(fields: [installationId], references: [id], onDelete: Cascade)

  @@unique([installationId, insightType, channelId])
  @@map("slack_channel_mappings")
}

// Outbound message audit + idempotency. Lets us look up "did we
// already post this insight to Slack?" before fan-out.
model SlackOutboundLog {
  id              String   @id @default(cuid())
  installationId  String
  insightId       String?                               // null for slash-command replies
  notificationId  String?                               // links back to D-4 Notification row
  channelId       String
  slackTs         String?                               // Slack message ts ("1715300000.001234"); null if failed
  ok              Boolean
  errorCode       String?
  rawError        String?
  postedAt        DateTime @default(now())

  installation    SlackInstallation @relation(fields: [installationId], references: [id], onDelete: Cascade)

  @@index([installationId, postedAt])
  @@index([insightId])
  @@map("slack_outbound_logs")
}
```

Teams tables only added if §10.A picks an option that includes Teams; otherwise omitted from the migration entirely (saves ~20 LOC of dead schema).

### 4.4 Uninstall cleanup

Slack OAuth provides `POST /api/auth.revoke` with the bot token. On uninstall:
1. Call `auth.revoke` with the decrypted bot token (best-effort; ignore failure)
2. Set `SlackInstallation.uninstalledAt = now()` (soft-delete keeps the audit log; hard-delete would orphan `SlackOutboundLog`)
3. Cascade delete `SlackChannelMapping` rows
4. Notification driver checks `uninstalledAt IS NULL` before posting

Spec hard rule: "Uninstall must revoke and clean up — no orphan tokens." This satisfies it.

---

## 5. A.4 — Notification engine extension audit

### 5.1 Existing `ChannelDriver` interface (D-4, no modifications)

`src/services/notifications/types.ts:65-71`:

```ts
export interface ChannelDriver {
  readonly channel: NotificationChannel;
  send(args: {
    event:        NotificationEvent;
    notification: PersistedNotification | null;
  }): Promise<ChannelResult>;
}
```

`NotificationChannel` is currently `"inapp" | "email" | "webpush" | "mobilepush"`. D-9 widens it to add `"slack"` (and conditionally `"teams"`). Single type-edit; everything else uses the union polymorphically.

### 5.2 Driver shape (mirrors `webPushChannel.ts`)

```ts
// services/notifications/channels/slackChannel.ts
export const slackChannel: ChannelDriver = {
  channel: "slack",
  async send({ event, notification }) {
    // 1. Find active SlackInstallation rows for this merchant
    // 2. For each, find SlackChannelMappings matching event.severity
    // 3. Render Block Kit payload via blockRenderer.renderInsightAsBlocks
    // 4. POST to https://slack.com/api/chat.postMessage with decrypted bot token
    // 5. Log SlackOutboundLog row, return ChannelResult
  }
};
```

Registration: same one-line pattern as Web Push at `src/index.ts:159-161`:

```ts
if (configureSlackChannel()) {
  registerChannel(slackChannel);
}
```

`configureSlackChannel()` returns `false` if `SLACK_CLIENT_ID` is unset — i.e., Slack is fully optional, dev environments without env vars don't crash.

### 5.3 Severity → channel mapping

Add `slackChannels` and (optionally) `teamsChannels` to `NotificationPreference`:

```prisma
// additive to existing model
slackChannels    String[]  @default(["CRITICAL","ATTENTION"])
teamsChannels    String[]  @default([])
```

`routing.ts:35-47` extends with cases for new severities (already a switch, trivial). Default for `OPPORTUNITY` and `SHARE_EVENT` is opt-in (empty list) — most users won't want every share event ringing in Slack.

### 5.4 What does NOT change

`engine.ts` `dispatch()` flow, in-app driver, email driver, web-push driver — all untouched. The "in-app first, others in parallel" flow already handles N drivers. Slack just shows up in the parallel fan-out.

---

## 6. A.5 — Block Kit / Adaptive Card rendering audit

### 6.1 Block Kit (Slack)

JSON-only; no SDK. The renderer takes an `Insight` row + locale, returns:

```ts
type SlackBlocks = Array<
  | { type: "section";  text: { type: "mrkdwn"; text: string } }
  | { type: "context";  elements: Array<{ type: "mrkdwn" | "image"; ... }> }
  | { type: "divider" }
  | { type: "actions";  elements: Array<{ type: "button"; ... }> }
  | { type: "image";    image_url: string; alt_text: string }
  | { type: "header";   text: { type: "plain_text"; text: string } }
>;
```

A critical-insight card maps cleanly:

```ts
[
  { type: "header",  text: { type: "plain_text", text: "🔴 KRİTİK"} },
  { type: "section", text: { type: "mrkdwn",     text: `*${insight.title}*\n\n${insight.body}` } },
  { type: "section", fields: [
      { type: "mrkdwn", text: "*Toplam vadesi geçen:*\n32.000 ₺" },
      { type: "mrkdwn", text: "*Konsantrasyon:*\n%52" }
  ]},
  { type: "actions", elements: [
      { type: "button", text: { type: "plain_text", text: "View in FinSuite" }, url: deepLink, style: "primary" },
      { type: "button", text: { type: "plain_text", text: "Mark as Resolved" }, action_id: `resolve:${insight.id}`, style: "danger" }
  ]},
  { type: "context", elements: [
      { type: "mrkdwn", text: `Generated ${ago} • Powered by Zyrix AI Co-Pilot` }
  ]}
]
```

No image block in V1 (decision §10.G) — header text + emoji badge replicates the spec's mock without invoking the OG renderer.

### 6.2 Adaptive Cards (Teams) — only if Teams in V1

Adaptive Card schema is JSON; same shape, different keys (`type: "AdaptiveCard"`, `body: [{ type: "TextBlock", … }]`, `actions: [{ type: "Action.OpenUrl", … }]`). Renderer would mirror the Slack one. Skipped here — depends on §10.A.

### 6.3 D-7 OG renderer reuse decision

`renderOgImage(html)` returns a 1200×630 PNG. Slack image-blocks accept any HTTPS URL. Two options:

- **G1 (recommended)** — text-only Block Kit with emoji badge for severity. Zero render cost. Matches the spec mock 90%; loses "header gradient PNG."
- **G2 (stretch)** — render an OG-style header per insight on first post; cache by insight ID; serve from `/og/insight/:id.png`. Adds Puppeteer load per critical-insight burst (~3 sec per render, then cached).

Decision §10.G.

---

## 7. A.6 — Slash command + interactive ergonomics audit

### 7.1 Slash command flow

```
User types `/zyrix mrr` in Slack
→ Slack POSTs to /api/integrations/slack/commands with form-urlencoded body:
    token, team_id, channel_id, user_id, command="/zyrix", text="mrr",
    response_url, trigger_id
→ We verify signing secret (HMAC).
→ We must reply within 3 seconds OR push to response_url asynchronously.
→ Reply: { response_type: "ephemeral" | "in_channel", blocks: [...] }
```

V1 commands:
- `/zyrix today` → today's morning brief (cinema'd as Block Kit)
- `/zyrix mrr` → MRR + sparkline-as-text
- `/zyrix runway` → cash runway + comparison
- `/zyrix help` → command list
- (V2: `/zyrix ask <question>` would proxy to D-8 chat engine; deferred — D-8 streaming SSE doesn't fit Slack's 3-sec reply window)

### 7.2 KPI registry reuse

`KPI_COMPUTATIONS` from D-8 (`src/services/chat/tools.ts`-adjacent) is already a `(merchantId, prisma) → KpiResult` registry. The slash-command handler is a switch over `text` that calls the right registry entry. **Zero new KPI logic** — hard rule honoured.

### 7.3 Interactive components

`POST /api/integrations/slack/interactions` receives a single form field `payload` (URL-encoded JSON). For our action buttons:

```json
{
  "type": "block_actions",
  "team": { "id": "T…" },
  "user": { "id": "U…" },
  "actions": [{
    "action_id": "resolve:insight_xyz",
    "value": "insight_xyz"
  }],
  "response_url": "https://hooks.slack.com/actions/…"
}
```

Action allowlist (decision §10.E):
- `view:<insightId>` → returns ephemeral message with deep link (no DB write)
- `resolve:<insightId>` → updates `Insight.status = RESOLVED`; updates the original message via `response_url`
- `share:<insightId>` → opens Slack channel-picker modal (`views.open`); on submit, re-posts to selected channel

Every action handler:
1. Re-verifies signing secret (Slack signs interactivity payloads too)
2. Looks up `SlackInstallation` by `team.id`; rejects if uninstalled
3. Resolves `merchantId` from the installation row
4. Audit-logs to `MerchantAuditLog` with `action: "slack_action"`, `metadata: { actionId, …}`

---

## 8. A.7 — Rate limiting + reliability audit

### 8.1 Slack outbound rate limits

Slack publishes limits at https://api.slack.com/docs/rate-limits. Practical numbers:
- `chat.postMessage` → tier 1: ~1 req/sec/channel (burst tolerated)
- `auth.revoke`, `oauth.v2.access` → tier 4: 100+/min, never a problem

Slack returns `Retry-After: <seconds>` on 429. Strategy:
1. **Per-channel debounce**: in-memory Map keyed by `${installationId}:${channelId}` → last post timestamp; insert ≥1000 ms gap before next.
2. **Retry-After honour**: if Slack returns 429, wait the indicated time and retry once. Second 429 → log + drop (`SlackOutboundLog.ok=false, errorCode='rate_limit_giveup'`).
3. **No queue persistence** in V1 — the in-app channel already persists the row; Slack failure doesn't lose the merchant-visible notification.

### 8.2 Idempotency

If the engine fires the same event twice (cron retry, bug), we don't want duplicate Slack posts. Idempotency check before sending:

```ts
const existing = await prisma.slackOutboundLog.findFirst({
  where: { installationId, insightId: event.insightId, ok: true },
  select: { id: true }
});
if (existing) return { channel: "slack", success: true, refId: existing.id }; // no-op
```

Costs one indexed query per send; cheap.

### 8.3 Failure visibility

`SlackOutboundLog` rows with `ok=false` are queryable from the admin dashboard (D-10). For V1 we just log + audit; no merchant-visible "Slack failed" toast (would be noisy and the merchant can't fix it from FinSuite anyway — they need to re-auth Slack).

---

## 9. Required env vars — for one-batch approval

These are the **only** infrastructure changes D-9 needs. Per the carry-over rule, Phase B does not start until these are approved on Railway.

### 9.1 Slack (V1 — required)

| Var | Purpose | How obtained |
|---|---|---|
| `SLACK_CLIENT_ID` | Public app ID for OAuth start URL | Slack app config → Basic Information → "Client ID" |
| `SLACK_CLIENT_SECRET` | Server-to-server `oauth.v2.access` exchange | Slack app config → Basic Information → "Client Secret" (rotate-able) |
| `SLACK_SIGNING_SECRET` | HMAC verification of inbound Slack webhooks (commands + interactions) | Slack app config → Basic Information → "Signing Secret" |
| `SLACK_REDIRECT_URI` | OAuth callback URL — must EXACTLY match what's registered on the Slack app | `https://finsuite-backend-production.up.railway.app/api/integrations/slack/oauth-callback` |
| `SLACK_APP_ID` | App identifier — used in deep links like `slack://app?team=…&id=…` | Slack app config → Basic Information → "App ID" |

**5 new vars.** All need to be set on Railway before Phase B B.2 (OAuth flow).

### 9.2 Encryption — already exists, reused

| Var | Status |
|---|---|
| `ENCRYPTION_KEY` | **Already set in production**. Used by `utils/encryption.ts` for 2FA secrets. D-9 reuses for Slack bot token encryption. **No new var.** |

### 9.3 Teams (V2 — only if §10.A ships Teams in V1)

| Var | Purpose | When needed |
|---|---|---|
| `TEAMS_BOT_APP_ID` | Azure AD app ID (= Bot Framework MicrosoftAppId) | Bot Framework path |
| `TEAMS_BOT_APP_SECRET` | Azure AD client secret | Bot Framework path |
| `TEAMS_BOT_APP_TENANT` | Azure AD tenant for single-tenant; omit for multi-tenant | Bot Framework path, optional |

**Recommendation:** do not provision these in D-9. If Teams V1 is approved (§10.A option A2 or A3), surface them in a follow-up discovery doc once the Teams scope is clearer.

### 9.4 No new infra

- No new npm deps (decision §10.B)
- No nixpacks / Dockerfile changes
- No railway.toml changes
- No Node version bump
- One new cron-job.org schedule (§10.K) — same provider you already use; no platform change

---

## 10. Open decisions — BLOCKERS for Phase B

12 decisions; the recommendations on every one yield zero new deps and only the 5 env vars above.

### 10.A — Scope: Slack only vs Slack + Teams in V1?

| Option | Trade-off |
|---|---|
| **(A1) Slack only in V1; Teams deferred to D-9.5 or V2** (recommended) | Predictable ship; one auth model, one signing pattern, one render path. Teams is its own sprint. |
| (A2) Slack + Teams (incoming-webhook only) in V1 | One-way Teams that's deprecated by Microsoft Aug 2024 — ships fast but technical debt from day one. |
| (A3) Slack + Teams (full Bot Framework) in V1 | Doubles sprint scope; needs Azure AD admin work; full JWT validation; AppSource side-loading. Not realistic in 3-4 days. |

**Recommended: A1.** The "Enterprise tier unlock" goal is met by Slack alone — Slack + finance team is the dominant pattern; Teams + finance team is the secondary case. We ship value fast, validate the channel-mapping UX with real merchants, and revisit Teams once design has settled.

### 10.B — Dependency strategy

| Option | Trade-off |
|---|---|
| **(B1) Raw HTTP + `crypto.createHmac`** (recommended) | Zero new deps. ~250 LOC for the OAuth + slash + interaction + posting layer. Matches the Resend webhook precedent. |
| (B2) `@slack/bolt` | "Official" framework. ~50 sub-deps, ~8 MB. Provides middleware for signing-secret verification, slash-command routing, action handlers. Saves ~150 LOC. Adds package surface area + Bolt-specific patterns the rest of the codebase doesn't use. |
| (B3) `@slack/web-api` only | Lighter than Bolt (~10 sub-deps) but only covers outbound API calls — we'd still hand-roll OAuth + signing verification. Net: marginal savings, still a new dep. |

**Recommended: B1.** The repo's pattern is "raw + helpers" (Resend, VAPID, Iyzico, WhatsApp). Adding Bolt would be the only "framework" dep on the integration side and would spawn questions of "why Bolt for Slack but not Microsoft Graph SDK for X." Stays consistent.

### 10.C — Schema split (sprint spec uses `companyId`)

| Option | Trade-off |
|---|---|
| **(C1) `merchantId` everywhere; rename spec fields** (recommended) | Honours carry-over hard rule. Spec's `SlackInstallation.companyId` → `merchantId`; `installedBy: userId` → `installedByMerchantId` (or drop — there's no sub-user model per D-7). |
| (C2) Keep `companyId` for Slack-specific tables, alias to `merchantId` | Confusing dual-naming; no win. |

**Recommended: C1.** Same precedent set in D-3..D-8. Discovery doc explicitly translates the spec.

### 10.D — Token storage shape

| Option | Trade-off |
|---|---|
| **(D1) `botToken: String` (encrypted via `utils/encryption.ts`)** (recommended) | Reuses production-validated encryption helper. AES-256-GCM with auth tag. |
| (D2) Plaintext + DB-level encryption (Postgres pgcrypto) | Adds infra requirement (Postgres extension); doesn't compose with Prisma cleanly. |
| (D3) Token in env per merchant | Nonsense at scale. Listed for completeness. |

**Recommended: D1.** Zero new infra; one helper import.

### 10.E — Action button security model

| Option | Trade-off |
|---|---|
| **(E1) Allowlisted action_id prefixes** (recommended) | `view:<id>`, `resolve:<id>`, `share:<id>` — server parses prefix, rejects anything else. Audit-logged. |
| (E2) Free-form action_id → server-side dispatch table | Same end state, more surface area for bugs. |
| (E3) Reuse arbitrary controller endpoints | Bypasses audit; harder to trace chat-originated actions. |

**Recommended: E1.** Mirrors D-8 § 7.G (chat actions allowlist). Three actions in V1, expandable.

### 10.F — OAuth state parameter / CSRF protection

| Option | Trade-off |
|---|---|
| **(F1) Signed JWT in `state`** (recommended) | `state = jwt.sign({ merchantId, nonce }, JWT_SECRET, { expiresIn: '10m' })`. Callback verifies; rejects on bad/stale state. Reuses existing `JWT_SECRET`. |
| (F2) Random CSRF token in DB, looked up on callback | Extra round-trip; one row per OAuth start; stale-row cleanup needed. |
| (F3) No state | Vulnerable to CSRF. Slack will warn but won't reject. Unacceptable. |

**Recommended: F1.** Matches `streamToken.ts` (D-4) and unsubscribe-token patterns (D-5/D-6). Zero new code.

### 10.G — Card "header art" rendering

| Option | Trade-off |
|---|---|
| **(G1) Text-only Block Kit; emoji badge for severity** (recommended) | Zero render cost. ~95% of the spec mock's visual impact via header text + mrkdwn weight. |
| (G2) Generate per-insight gradient PNG via D-7 OG renderer | Visually richer; matches spec mock more literally. ~3 sec render time per cache miss; Puppeteer pool already in use for OG + PDF. Bandwidth: ~80 KB per render. |

**Recommended: G1.** V1 ships fast; we already validated PNG rendering ergonomics with OG share images, can promote to G2 in V2 if Slack-channel engagement metrics suggest visual upgrade matters.

### 10.H — Channel-mapping UX

| Option | Trade-off |
|---|---|
| **(H1) Per-severity dropdown** (recommended; per spec mock) | One dropdown each for CRITICAL / ATTENTION / OPPORTUNITY / SHARE_EVENT, plus an "all → single channel" override. Toggle to enable/disable each. |
| (H2) Per-insight-category mapping | More granular but explodes the UI. |
| (H3) Single "all insights → one channel" | Too coarse; fails the spec's #alerts vs #growth example. |

**Recommended: H1.** Spec-aligned; matches mental model of "severity = inbox priority."

### 10.I — "Test send" button behaviour

| Option | Trade-off |
|---|---|
| **(I1) Sends a real fake-data message to the selected channel** (recommended) | Round-trip proof. Body marked `🧪 Test message — please ignore`. |
| (I2) Returns a preview rendered in the FinSuite UI | No round-trip; doesn't prove the bot can post to the channel (private channels need invitation). Less useful. |

**Recommended: I1.** Spec § B.7 mandates "Send test insight to this channel"; I1 matches.

### 10.J — Rate-limit strategy

| Option | Trade-off |
|---|---|
| **(J1) In-memory per-channel debounce + Retry-After honour** (recommended) | ~30 LOC. Single-process safety; if we scale to multiple Express instances later, promote to Redis. V1 is fine on Railway's single-process default. |
| (J2) Redis-backed token bucket | Future-proof but adds Redis dependency for V1. |
| (J3) No throttling; trust Slack to 429 | Burst from a critical-insight cron could hit 429 instantly. |

**Recommended: J1.** Matches the codebase's "cron WhatsApp rate limit" pattern (200 ms `setTimeout` between sends in `cronController.ts:176`).

### 10.K — Channel-mapping validation cron

A periodic check that all `SlackChannelMapping.channelId` values still resolve in Slack — channels get archived, renamed, or the bot kicked. Runs daily.

| Option | Trade-off |
|---|---|
| **(K1) Daily cron-job.org → `POST /api/cron/slack-channel-validate`** (recommended) | 1 new schedule. Same auth pattern as D-5/D-6/D-7/D-8 (header `x-cron-secret`). On stale mapping → mark `enabled=false`, in-app notification to merchant ("#growth was renamed; remap in /settings/integrations"). |
| (K2) Lazy validate on every send | Adds latency to every send; repeated failures don't surface to merchant. |
| (K3) No validation | Stale mappings silently fail. |

**Recommended: K1.** You wired four cron-job.org schedules already; a fifth is no extra burden. Same `CRON_SECRET` env var.

### 10.L — Frontend route & lazy-load

| Option | Trade-off |
|---|---|
| **(L1) `/settings/integrations` lazy-loaded route + cards for Slack (Teams card greyed if §10.A picks A1)** (recommended) | Matches D-5..D-8 pattern (`React.lazy()` + `Suspense`). |
| (L2) Embed in existing `/settings/notifications` page | Mixes concerns; the notification preferences page already serves the channel toggles for inapp/email/webpush. |

**Recommended: L1.** Standalone page = standalone analytics + clear tier-gating ("Enterprise" badge per spec § Mission).

---

## 11. Hard-rule compliance checklist

| Rule | Status |
|---|---|
| **No infra change without approval** | ⚠️ Phase A surfaces 5 new env vars (§9.1) + 1 new cron-job.org schedule (§10.K). Phase B blocks until approved. **Zero new npm deps**, zero nixpacks/Dockerfile/railway.toml/Node-version changes. |
| **`merchantId` everywhere, NOT `companyId / userId`** | ✅ Spec's `SlackInstallation.companyId / userId` translated throughout (§4.3). Decision §10.C confirms. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, KPI logic** | ✅ Slash commands read from `KPI_COMPUTATIONS` registry as a pure function call. New file `services/integrations/slack/blockRenderer.ts` is sibling. |
| **Plain JSX + inline styles + design tokens — no Tailwind/TS/shadcn on frontend** | ✅ Frontend additions follow D-5..D-8 pattern: `src/pages/v2/integrations/IntegrationsPage.jsx`, design tokens from `src/design-system-v2/cinematic/tokens.js`, plain JSX. |
| **Reuse D-3 sharing infra for message formatting** | ✅ `services/share/ogImageRenderer.ts` reusable (decision §10.G option G2 if picked). Block-Kit renderer is a sibling, not a fork. |
| **Reuse D-4 notification engine — no parallel system** | ✅ `slackChannel: ChannelDriver` plugs into existing `engine.ts`. `NotificationChannel` union widened (one type-edit). `NotificationPreference.slackChannels` field added additively. |
| **Reuse D-7 OG image generator for unfurls** | ✅ Slack auto-unfurls any FinSuite share URL pasted into a message → Slack fetches the OG image from `/og/share/:slug.png` (already shipped in D-7). No new code needed for unfurl support; it's free. |
| **Webhook signature verification: Slack HMAC-SHA256 timestamp+secret; Teams Bot Framework JWT validation** | ✅ Slack template ready (`resendWebhookController.ts` is the prior art). Teams JWT validation is large enough to push Teams to V2 — see decision §10.A. |
| **Multi-tenant: merchantId-scoped + encrypted at rest** | ✅ All Slack tables key on `merchantId`. `botToken` encrypted via `utils/encryption.ts` AES-256-GCM. |
| **Avoid heavy SDKs (`@slack/bolt`, `botbuilder`)** | ✅ Recommended path is raw HTTP. Decision §10.B confirms. |
| **All commit messages in English** | ✅ Will follow per spec § Commit Sequence. |
| **Strict micro-commits with git diff review** | ✅ Phase B sequence in spec is 11 commits; will keep ordering and pause for review at each. |
| **Stop on unexpected output** | ✅ Will follow. |

---

## 12. Files to-be-added in Phase B

### Backend

```
prisma/manual-migrations/2026-05-1X_slack_d9.sql

src/services/integrations/slack/
├── client.ts                — minimal HTTP wrapper (oauth.v2.access, chat.postMessage,
│                              auth.revoke, conversations.list, views.open)
├── signature.ts             — verifySlackSignature(rawBody, headers, secret)
├── blockRenderer.ts         — renderInsightAsBlocks(insight, locale): SlackBlocks
├── slashCommandRouter.ts    — switch over /zyrix subcommands → KPI_COMPUTATIONS
└── interactionRouter.ts     — switch over action_id prefixes (view: / resolve: / share:)

src/services/notifications/channels/
└── slackChannel.ts          — ChannelDriver impl

src/controllers/integrations/
├── slackOAuthController.ts        — GET /install, GET /oauth-callback, POST /uninstall
├── slackCommandsController.ts     — POST /commands  (express.raw)
├── slackInteractionsController.ts — POST /interactions  (express.raw)
└── slackChannelMappingController.ts — CRUD on SlackChannelMapping (auth-required)

src/routes/integrations/slack.ts    — mount points (express.raw on the two webhook routes)

src/controllers/cronController.ts   — extend with runSlackChannelValidate()
src/routes/cronRoutes.ts            — POST /api/cron/slack-channel-validate
```

### Frontend

```
src/api/v2/integrations.js                                    — CRUD client (install URL, list, delete, channel mapping)
src/pages/v2/integrations/
├── IntegrationsPage.jsx              — landing page with Slack + Teams cards
├── SlackConnectFlow.jsx              — popup-based OAuth start
├── SlackChannelMappingPanel.jsx      — per-severity dropdown + toggle + test button
└── SlackInstallationCard.jsx         — show workspace name, connected since, disconnect

src/i18n/dashboard/integrations.{tr,en,ar}.json               — canonical translations

src/App.jsx                                                    — add /settings/integrations route (lazy)
```

### Database migration

One file, two tables (or three if Teams in V1):
- `slack_installations`
- `slack_channel_mappings`
- `slack_outbound_logs`

Plus an additive ALTER on `notification_preferences` for `slackChannels` (and `teamsChannels` only if §10.A includes Teams).

---

## 13. Phase B readiness

Phase A is complete. Phase B is blocked on:

1. **Env var approval** (§9.1) — 5 Slack vars on Railway.
2. **Decisions §10.A through §10.L** — recommended picks listed below; one explicit yes/no on each.

| Decision | Recommended | Notes |
|---|---|---|
| **10.A** Scope | A1 (Slack-only V1; Teams deferred) | Single biggest decision. A2 ships Teams-deprecated. |
| **10.B** Deps | B1 (raw HTTP) | Zero new deps; matches repo precedent. |
| **10.C** Schema | C1 (merchantId everywhere) | Hard-rule alignment. |
| **10.D** Token storage | D1 (AES-256-GCM via existing helper) | No new key; reuses ENCRYPTION_KEY. |
| **10.E** Action security | E1 (allowlisted action_id prefixes) | Mirrors D-8 §7.G. |
| **10.F** OAuth state | F1 (signed JWT) | Reuses JWT_SECRET. |
| **10.G** Card art | G1 (text + emoji) | V1 simplicity; G2 promote in V2 if metrics ask for it. |
| **10.H** Channel-mapping UX | H1 (per-severity dropdowns) | Spec-aligned. |
| **10.I** Test send | I1 (real fake-data send) | Spec-mandated. |
| **10.J** Rate limiting | J1 (in-memory debounce) | Promote to Redis in V2 if multi-process. |
| **10.K** Validation cron | K1 (daily cron-job.org) | One new schedule, same secret. |
| **10.L** Frontend route | L1 (`/settings/integrations` lazy) | Matches D-5..D-8. |

Once Mehmet confirms picks + sets the 5 env vars on Railway, Phase B proceeds per the spec's 11-commit sequence (translating `companyId/userId` → `merchantId`, deferring Teams, and keeping the protected files untouched).

---

**Phase A — DONE. Awaiting review.**
