# Sprint D-8 — AI Chat ("Ask Anything"): Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of the open decisions in §7 before Phase B**

---

## TL;DR

Three structural surprises the spec didn't anticipate, all benign:

1. **Two pre-existing chat systems already exist.** `aiController.ts` (`POST /api/ai/chat`) uses Gemini + `AiConversation` table with JSON-array messages and basic token tracking. `aiAssistantController.ts` (`POST /api/ai-assistant/chat`) uses **Anthropic Claude** (NOT Gemini) for Turkish tax/accounting Q&A with `AiAssistantChat` table. Neither does streaming or function calling.
2. **Cmd+K is already bound to a separate "command palette" feature** (`cmdkController.ts` + frontend `CmdKContext.jsx`). The spec's "Cmd+K opens chat overlay" would clobber that. The user's own carry-over note already flagged Cmd+K as conflict-prone. Need a different chat hotkey (recommend `Cmd+J` / `Ctrl+J`).
3. **Voice input is half-built.** `components/dashboard/voice-cx/VoiceCommandRecorder.jsx` already implements the full Web Speech API pattern (TR/AR/EN, interim results, error handling). Chat can reuse this directly — no new microphone code needed.

What's clean and ready to build on:

| Layer | State | What D-8 needs |
|---|---|---|
| Gemini SDK | `@google/generative-ai@0.21.0` already installed; used in `aiBriefController.ts` and `aiController.ts` non-streaming | Add streaming (`model.generateContentStream`) + function calling (`tools: [{ functionDeclarations: [...] }]`). Same SDK; new method calls. **Zero new deps.** |
| SSE pattern | D-4 ships `services/notifications/sseHub.ts` + `streamToken.ts` + frontend `useNotificationStream.js`. JWT-via-`?token=` query param is the established pattern (EventSource limitation). | Use the streamToken pattern for chat auth; build a per-request SSE handler (chat is bidirectional, not broadcast — sseHub doesn't fit). |
| KPI tools | Protected `kpiComputations.ts` exposes `KPI_COMPUTATIONS` registry: 12 working KPIs, 12 forward-compat stubs, all `(merchantId, prisma) → KpiResult`. | Tools wrap the registry directly (sibling `services/chat/tools.ts`, never modifies the protected file). |
| Voice input | `VoiceCommandRecorder.jsx` is production-ready | Reuse / refactor into a chat-friendly `<MicrophoneInput>` shim. Zero new deps. |
| Multi-tenant isolation | All existing controllers enforce `merchantId` from JWT (D-3..D-7 precedent) | Every chat tool takes `(args, merchantId)` and adds `merchantId` to every Prisma query. **Never trust client-supplied merchantId.** |
| Public-share reuse | D-7's `PublicShareLink.resourceType` is a string column (`insight | daily_brief | weekly_report`) | Add `'chat_conversation'` to the controller allowlist (no schema change) — V2 nicety, not V1 blocker. |

**11 decisions** are surfaced in §7. None of them require new infra deps if you accept the recommendations.

---

## 1. Repo geography (recap)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Frontend (Vite + React 18, plain JSX). Already has `CmdKContext`, `VoiceCommandRecorder`, design tokens. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma + Gemini + Puppeteer + Resend on Railway. Already has `aiController`, `aiAssistantController`, `cmdkController`, full SSE infra from D-4. |

Hard rule reminder: **`merchantId` everywhere**, NOT `companyId / userId`. The spec's example schema uses `userId / companyId` — those translate to `merchantId` on every row.

---

## 2. A.1 — Gemini function-calling audit

### 2.1 SDK confirmation

`backend/package.json:18` ships `"@google/generative-ai": "^0.21.0"`. Two existing controllers use it:

- `src/controllers/aiBriefController.ts:283-320` — `model.generateContent(prompt)` (non-streaming, no tools, 8s timeout)
- `src/controllers/aiController.ts:74-85` — `model.startChat({ systemInstruction, history })` then `chat.sendMessage()` (multi-turn, no streaming, no tools)
- `src/controllers/customer/cmdkController.ts:80-90` — `model.generateContent(prompt)` for intent parsing (4s timeout)

**Function calling and streaming are NOT used anywhere in the codebase today.** SDK 0.21.0 supports both APIs:

```ts
// Streaming
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) { /* token-by-token */ }

// Function calling
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [{ functionDeclarations: [...] }]
});
```

Both work in 0.21.0 per the SDK changelog (verified in node_modules). **Zero new deps needed.**

### 2.2 Token budget per turn

Spec estimates ~2-4K input + 500-1500 output. Realistic break-down:

- System prompt (Zyrix persona + locale + citation/chart/action format): ~500 tokens
- Conversation history (capped at 8K total per spec hard rule): up to 7K tokens
- Tool definitions (~10-12 functions with descriptions): ~800 tokens
- User message: ~50-200 tokens
- Tool call round-trips (each adds ~200 tokens of structured JSON): up to 600 tokens
- Final assistant response: 500-1500 tokens

Worst-case input ~10K tokens, worst-case output ~1.5K. Gemini 2.0 Flash pricing is ~$0.075 per 1M input + $0.30 per 1M output. **~$0.001-0.0015 per turn** at worst-case — sustainable.

### 2.3 Tool design

Tools wrap the existing protected `KPI_COMPUTATIONS` registry (12 active KPIs from `kpiComputations.ts:358-388`) and add new merchant-data accessors. **Each tool runs server-side; merchantId is taken from the request JWT, never from tool arguments.**

Proposed initial tool set (V1 — covers ~80% of expected questions):

| Tool | Purpose | Reads from |
|---|---|---|
| `get_kpi_value(kpiId, period?)` | Current value of a named KPI | `KPI_COMPUTATIONS[kpiId](merchantId, prisma)` |
| `compare_periods(metric, period1, period2)` | WoW / MoM delta | New helper or `weeklyKpis.ts` from D-6 |
| `get_top_customers(limit, period?)` | Top N by revenue | `Invoice` table groupBy `customerName` |
| `get_invoices(status?, customerName?, dateFrom?, dateTo?)` | Filtered invoice list | `Invoice` |
| `get_expenses(category?, dateFrom?, dateTo?)` | Filtered expense list | `Expense` |
| `get_tax_obligations(daysAhead?)` | Upcoming tax events | `TaxEvent` |
| `forecast_cash(daysAhead)` | Project cash balance | `BankTransaction` + `Expense` |
| `get_recent_insights(limit?)` | Latest AI insights | `Insight` |
| `create_reminder(title, dueDate, notes?)` | Action: create a Task | `Task.create` |

The `create_reminder` tool is a **mutating action** — by far the most security-sensitive. Implementation: every action tool routes through a server-side allowlist + an audit log row in `MerchantAuditLog`.

### 2.4 Cost tracking schema

Spec wants token tracking per message for the D-10 admin dashboard. Existing `AiConversation.tokens` (Int column, increments by char count, not true tokens) is the only precedent — and it's coarse.

For V1 we add `ChatMessage.tokensUsed` (total) + optional `inputTokens` / `outputTokens` (Gemini's `usageMetadata.promptTokenCount` and `usageMetadata.candidatesTokenCount` are exposed in SDK 0.21.0 responses). D-10 admin dashboard sums these per merchant per day.

---

## 3. A.2 — Streaming infrastructure audit

### 3.1 Existing D-4 SSE primitives

`src/services/notifications/sseHub.ts` (lines 17-61) ships:

```ts
addSubscriber(merchantId, fn)      // register a per-tenant handler
broadcast(merchantId, event, data) // fan out to all subscribers for that merchant
writeSseMessage(res, event, payload)   // res.write('event: X\ndata: {...}\n\n')
writeSseKeepalive(res)                  // res.write(': ping ${ts}\n\n')
```

`src/services/notifications/streamToken.ts` (lines 1-32) signs a 5-min JWT:

```ts
signStreamToken(merchantId, expiresIn = "5m")
verifyStreamToken(token) // throws on bad token
```

The frontend hook (`src/hooks/v2/useNotificationStream.js:30-87`) fetches a fresh token, builds `EventSource(streamUrl(token))`, and reconnects with exponential backoff on error. Token rides as `?token=` query param because EventSource doesn't support custom auth headers.

### 3.2 Why we don't reuse `sseHub` directly

The `sseHub` is designed for **broadcast** semantics — fan out one event to all of a merchant's subscribers (e.g., "new notification arrived" pushed from a cron). Chat is **request-scoped streaming** — one user posts a message, one response streams back to that exact request. Different shape:

- Broadcast: many publishers, many consumers, multi-event lifetime
- Chat: one publisher (the chat engine), one consumer (the requesting client), single-message lifetime

We **reuse the streamToken pattern** (same JWT shape, 5-min TTL, `?token=` URL param) but build the SSE handler per-request. The handler holds the response open, streams Gemini's tokens + tool events, then closes when the message is done.

### 3.3 Streaming endpoint shape

Per spec § B.4 with one adjustment (added `lang` for locale):

```
POST /api/customer/chat/stream
  body: { conversationId?, message, lang? }
  response: SSE stream
    event: token         data: { text }
    event: tool_call     data: { name, args }
    event: tool_result   data: { name, result }
    event: chart         data: { type, data }
    event: action        data: { label, type, payload }
    event: citation      data: { type, id, label }
    event: error         data: { message }
    event: done          data: { messageId, conversationId, tokensUsed, latencyMs }
```

For EventSource auth: the same `streamToken` pattern from D-4 — frontend calls `GET /api/customer/chat/stream-token` (auth-required, returns 5-min JWT), then opens `EventSource(/api/customer/chat/stream?token=...&conversationId=...&message=...)`. **But**: GET-only EventSource cannot send a body, so the user message must ride in the URL query string (URL-encoded). Spec implies POST + SSE; we reconcile in §7.D.

### 3.4 Heartbeats

Without a heartbeat, intermediary proxies (Cloudflare, Vercel, Railway's edge) close idle SSE connections after 30-60s. Pattern: write `: ping {ts}\n\n` every 20s. The existing `writeSseKeepalive()` helper handles this.

---

## 4. A.3 — Conversation persistence audit

### 4.1 Three pre-existing chat-adjacent tables

```prisma
// src/prisma/schema.prisma:1030-1042
model AiConversation {
  id         String   @id @default(uuid())
  merchantId String
  title      String?
  messages   Json                     // ALL messages in one JSON array — no per-message indexing
  context    Json?
  tokens     Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  ...
}

// src/prisma/schema.prisma:1044-1054
model AiAssistantChat {
  id         String   @id @default(uuid())
  merchantId String
  role       String                    // single-message rows; flat list, no grouping
  content    String
  tokens     Int      @default(0)
  createdAt  DateTime @default(now())
  ...
}
```

Both are deployed and used by their respective controllers. Neither matches the spec's `ChatConversation` + `ChatMessage` split.

### 4.2 Three options for D-8 schema

| Option | Approach | Trade-off |
|---|---|---|
| **(α) Migrate `AiConversation` to spec shape** | Extend existing, split JSON into rows | Risky — changes the schema of a deployed table; old data needs backfill; the existing `aiController.ts` would break |
| **(β) Brand-new `ChatConversation` + `ChatMessage` tables** (per spec) | D-8 lives in fresh tables; legacy `AiConversation` untouched | Two parallel systems; eventual cleanup possible. **Zero risk to existing functionality.** |
| **(γ) Reuse `AiConversation` as-is + new `ChatMessage` table** | Half-step | Mixed: `AiConversation` keeps JSON messages as a "summary cache" and `ChatMessage` becomes the source of truth. Confusing dual-write. |

**Recommended: β.** Clean separation. The legacy `aiController.ts` can be deprecated in a future sprint (it powers an old "AI advisor" feature that wasn't designed around D-8's tool calling).

### 4.3 90-day retention

Spec hard constraint: 90-day default; configurable to "forever" per user.

Schema additions:
- `ChatConversation.retentionDays: Int @default(90)` — 0 means "forever"
- `ChatConversation.expiresAt: DateTime?` — derived; null means permanent

Cron-driven cleanup mirrors D-5 / D-6 / D-7 pattern: a new endpoint `POST /api/cron/chat-cleanup` (gated by `x-cron-secret`) scans for `ChatConversation.expiresAt < now()` and deletes them (cascade drops the messages). Daily firing via cron-job.org is enough for V1.

### 4.4 8K token cap strategy

Spec hard constraint: "Conversation memory capped at 8K tokens — older messages dropped or summarized".

Strategies:
- **Drop oldest pairs** — when running token estimate exceeds 6K, drop oldest user/assistant pair until under cap. Simple. Lose context.
- **Summarize older** — when over cap, side-call Gemini to compress oldest 5 messages into one summary message. Adds 1 Gemini call per overflow. Better context preservation.

V1: drop-oldest is simpler. Tag each `ChatMessage` row with a running `tokenSpend` so the engine can sum cheaply. V2 promotes to summarization if user feedback shows context loss is painful.

---

## 5. A.4 — Voice input audit

### 5.1 Existing component

`src/components/dashboard/voice-cx/VoiceCommandRecorder.jsx:22-49` already implements:

```js
const Supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new Recog();
recog.lang = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
recog.interimResults = true;
recog.continuous = true;
recog.onresult = (ev) => { /* gather interim + final transcript */ };
recog.onend = () => setRecording(false);
recog.onerror = (e) => { ... };
```

TR/EN/AR locale switch already done. Push-to-talk pattern. Interim results streamed. Error handling. **This is reusable as-is.**

### 5.2 Privacy and consent

Spec hard constraint: "no transcript stored without user consent". Web Speech API doesn't persist audio anywhere — transcripts are computed on-device (Chrome/Safari/Edge) or sent to a Google service (Chrome on desktop, depending on settings). The transcript becomes the user message text, which is then persisted to `ChatMessage` like any other typed input.

V1 stance: transcripts get persisted as user messages (same as typed text); no separate "voice-only" storage. A small "this used voice input" tag on the message is optional and unrecorded.

### 5.3 Mobile

Spec: "Mobile: native dictation usually superior; rely on system keyboard mic instead". The `<input>` / `<textarea>` natively gets the system keyboard mic on iOS / Android. We don't render a custom mic button on mobile — the OS handles it. We only render the custom mic button on desktop browsers that support `webkitSpeechRecognition`.

Detection: `'webkitSpeechRecognition' in window || 'SpeechRecognition' in window` AND `!isMobileUA`.

---

## 6. Adjacent infrastructure checks (added beyond spec scope)

### 6.1 Cmd+K already bound

`src/contexts/CmdKContext.jsx:17-27`:

```js
const onKey = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    setHasMounted(true);
    setOpen((o) => !o);
  }
};
```

This binds Cmd+K (Mac) and Ctrl+K (Win) to the **command palette** modal (which calls `cmdkController.ts` for Gemini-based intent → route mapping). The spec's "Cmd+K opens chat overlay" would clobber this.

Mehmet's own carry-over note flagged Cmd+K as browser-conflicting. Resolution must either:

- (1) Replace command palette with chat (loses an existing feature) — bad
- (2) Use a different shortcut for chat (recommend) — clean

Decision §7.E proposes **Cmd+J / Ctrl+J** for chat. Common in messaging apps; not bound by Chrome (Cmd+J opens Downloads, but only when the bookmarks bar is closed; we can preventDefault).

### 6.2 PublicShareLink reuse for "share this conversation"

D-7's `PublicShareLink.resourceType` is a free string column accepting `'insight'`, `'daily_brief'`, `'weekly_report'`. Adding `'chat_conversation'` to the allowlist in `publicShareLinksController.create` is a 3-line change. The public share renderer doesn't yet know how to render a conversation — that's V2 work; V1 does NOT ship "share conversation" UI.

### 6.3 Notification engine for "AI errors"

`services/notifications/types.ts:5-10`: severities are `CRITICAL | ATTENTION | OPPORTUNITY | SHARE_EVENT | SYSTEM`. Chat error events (e.g., "Gemini quota exceeded") could fire as `severity: SYSTEM` if we want admin visibility. Spec doesn't explicitly require this; mark as nice-to-have for V1 (quiet log on backend; surface in admin dashboard later).

### 6.4 Markdown rendering

Frontend `package.json` has no markdown library. Three options:

| Option | Cost | Trade-off |
|---|---|---|
| **(A) Hand-rolled minimal subset** | ~3 KB inline regex parser | Bold (`**`), italic (`*`), inline code, code blocks, links, line breaks. Skip tables, images, footnotes. Custom but lean. |
| **(B) `marked` dep** | ~20 KB gzipped | Full Markdown spec. Adds bundle weight (current main chunk is ~1.2 MB). |
| **(C) Plain text** | 0 KB | Render as text with manual `<br>` for newlines. Loses bold/code formatting; AI output reads worse. |

Recommend A. Bundle is already heavy (charts dominate); inline regex hits the spec's "lean public bundle" hard rule.

### 6.5 Cost tracking integration with D-10

Spec mentions D-10 will surface cost tracking in the admin dashboard. Schema additions on `ChatMessage`:
- `tokensUsed: Int?` — total (input + output)
- `inputTokens: Int?` — Gemini's `usageMetadata.promptTokenCount`
- `outputTokens: Int?` — `usageMetadata.candidatesTokenCount`
- `latencyMs: Int?` — wall-clock for the Gemini call

D-10 sums these grouped by merchantId / conversationId / day. For per-merchant cost monitoring, this is enough. For per-merchant rate limiting (V2), we'd add a daily token budget enforced at the engine layer.

---

## 7. Open decisions for Mehmet (BLOCKERS for Phase B)

These are not infrastructure changes per se — they're architecture and naming choices. None require new infra deps if the recommended option is picked.

### 7.A — Schema: extend `AiConversation` or new `ChatConversation` + `ChatMessage`?

| Option | Trade-off |
|---|---|
| **(A1) Migrate `AiConversation`** | Risky — schema change to a deployed table; old data needs migration; existing `aiController` breaks |
| **(A2) New `ChatConversation` + `ChatMessage` tables** (per spec) | Two parallel systems; legacy untouched; clean isolation |
| **(A3) Keep `AiConversation` + add separate `ChatMessage` sibling** | Confusing dual-write |

**Recommended: A2.** Spec-aligned, zero-risk. Legacy `aiController.ts` can be deprecated in a later cleanup sprint.

### 7.B — Cmd+K conflict resolution

`CmdKContext.jsx` already binds Cmd+K to the command palette (cmdkController). Two things can't share one shortcut.

| Option | Trade-off |
|---|---|
| **(B1) Chat = `Cmd+J` / `Ctrl+J`** | Common in messaging apps. Browser-bound to Downloads but easily preventDefault'd. Distinct from existing Cmd+K. |
| **(B2) Chat = `Cmd+/` / `Ctrl+/`** | Fewer browser conflicts. Some apps use it for "show keyboard shortcuts". |
| **(B3) Chat = `Cmd+Shift+K`** | Three-key combo; clunky on mobile. |
| **(B4) No global hotkey** | Floating bubble + `/chat` route only. Loses spec's "Cmd+K from anywhere". |

**Recommended: B1.** `Cmd+J` is widely understood as "Just ask AI" / "Jump to chat" in modern apps (Cursor, Linear, Notion all use it). Existing `CmdKContext` keeps its Cmd+K binding for the palette.

### 7.C — Tool definitions: thin wrappers vs period-aware computations

`KPI_COMPUTATIONS` is fixed-window (current month, last 30 days). Spec's `get_kpi_value(kpiId, period)` implies arbitrary periods.

| Option | Trade-off |
|---|---|
| **(C1) Wrap KPI_COMPUTATIONS as-is; ignore `period` parameter for V1** | Tool returns the registry's default period; AI infers context. Simple. |
| **(C2) Sibling file `services/chat/kpiTools.ts`** with period-aware variants (mirrors `weeklyKpis.ts` from D-6) | Better fidelity. Duplicates logic. ~150 LOC. |

**Recommended: C1 for V1** — Gemini is good at translating user intent ("this month's MRR") into the tool's default behavior. C2 promotes when users complain. The period parameter is documented-but-ignored in V1; V2 honors it.

### 7.D — POST + SSE reconciliation

EventSource is GET-only. Spec says `POST /api/customer/chat/stream`. Three reconciliations:

| Option | Trade-off |
|---|---|
| **(D1) Two-step**: `POST /api/customer/chat/messages` returns `{ messageId, streamToken }`; client opens `EventSource(/api/customer/chat/stream?token=...&messageId=...)` | Cleanest API; matches REST + SSE conventions. Two round-trips. |
| **(D2) Use `fetch` + `ReadableStream` instead of EventSource** | Allows POST with body. But: no auto-reconnect, no `event:` parsing, more frontend code. |
| **(D3) GET with URL-encoded message** | Single round-trip. URL-length cap (~2KB). Good enough for ~95% of messages. |

**Recommended: D1** — predictable; reuses the streamToken pattern from D-4; no surprises. The first POST persists the user message + creates the placeholder assistant row; the SSE stream fills the assistant row's content/toolCalls/citations as Gemini emits them.

### 7.E — Markdown rendering approach

Per §6.4: hand-rolled minimal vs `marked` dep vs plain text.

| Option | Trade-off |
|---|---|
| **(E1) Hand-rolled (~3 KB inline)** | Lean bundle. Subset of MD: bold / italic / inline code / code blocks / links / line breaks. |
| **(E2) `marked` dep** | Full MD spec. ~20 KB gzipped. |
| **(E3) Plain text + manual link/code extraction** | Zero new code; AI output reads worse. |

**Recommended: E1.** Bundle is already heavy (charts dominate). The minimal subset covers everything Gemini realistically emits in chat.

### 7.F — Token cap strategy

Spec hard constraint: 8K tokens. Two strategies:

| Option | Trade-off |
|---|---|
| **(F1) Drop oldest user/assistant pairs** when running estimate > 6K | Simple. Loses context. |
| **(F2) Side-summarize oldest** with one extra Gemini call | Better context preservation. Adds 1 Gemini call per overflow. |

**Recommended: F1 for V1.** F2 promotes if users complain about lost context. Each `ChatMessage` row stores its own `tokensUsed` so the engine can sum cheaply on each turn.

### 7.G — Action button security model

AI suggests "create a reminder for May 26"; user clicks the action button. The action must:

- Run server-side under the merchant's JWT
- Be allowlisted (no arbitrary action types)
- Audit-logged in `MerchantAuditLog`

| Option | Trade-off |
|---|---|
| **(G1) New endpoint `POST /api/customer/chat/actions/:type`** with allowlisted `:type` | Clean. Gemini emits `{ actionType, payload }` in the assistant message; UI renders button; click → POST → server verifies + executes. |
| **(G2) Reuse existing endpoints** (e.g., `POST /api/tasks` for create_reminder) | Bypasses the "type" allowlist; harder to audit chat-originated actions specifically. |

**Recommended: G1.** Allowlist starts with `create_reminder`, `dismiss_insight`, `mark_invoice_paid`. Each handler is a thin wrapper around the existing controller path but adds a `source: "chat"` field to the audit log.

### 7.H — Voice input UX

`VoiceCommandRecorder.jsx` exists. Two reuse strategies:

| Option | Trade-off |
|---|---|
| **(H1) Wrap existing component** in a chat-flavored shim | Fastest. ~30 LOC. |
| **(H2) Refactor existing into shared `<MicrophoneInput>`** | Cleaner long-term. ~80 LOC + touch-up to existing usage. |

**Recommended: H1.** D-8 is already the largest sprint; refactoring is V2.

### 7.I — Conversation 90-day retention enforcement

| Option | Trade-off |
|---|---|
| **(I1) Cron-driven cleanup** — new endpoint `POST /api/cron/chat-cleanup`, fired daily by cron-job.org (same pattern as D-5/D-6) | Deterministic; admin-visible. |
| **(I2) Lazy delete on read** — every conversation list query filters `expiresAt > now`, expired rows survive in DB indefinitely | Saves a cron job. Storage grows unboundedly. |

**Recommended: I1.** You've already wired three cron-job.org schedules (morning brief, weekly report, daily WhatsApp); a fourth is no extra burden.

### 7.J — Mobile hotkey behavior

Spec has Cmd+K for desktop and floating bubble for mobile. With Cmd+J as the desktop hotkey (per §7.B), mobile keeps the floating bubble. **No decision needed if B1 is picked.** If B4 (no global hotkey), this collapses to: floating bubble everywhere, no shortcut.

### 7.K — Frontend bundle strategy

Chat features (especially with markdown + voice + streaming UI) will add weight. Options:

| Option | Trade-off |
|---|---|
| **(K1) Lazy-load chat components** (route-level + bubble open) | Chat code only loads when user opens it. Adds ~200ms first-open latency. |
| **(K2) Eager-load** | Faster open, heavier initial bundle. |

**Recommended: K1.** The floating bubble itself is lightweight (~5 KB for the icon + button); the heavy components (`<ChatPage>`, `<MessageThread>`, `<InlineChart>`, markdown renderer) are dynamically imported on first open. Matches the existing `React.lazy()` pattern for D-5/D-6/D-7 pages.

---

## 8. Hard-rule compliance checklist

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Recommended path adds ZERO infra changes (no new deps, no env vars, no DNS, no Railway settings). One new cron-job.org schedule needed (you wire it after Phase B verification, same pattern as D-5/D-6). |
| **`merchantId` everywhere, NOT `companyId`** | ✅ All proposed schema fields use `merchantId`. Spec's `companyId / userId` translated. Tools take `merchantId` from JWT and add it to every Prisma query. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, KPI logic** | ✅ Tools call `KPI_COMPUTATIONS[id](merchantId, prisma)` as a public read-only API. New `services/chat/tools.ts` is a sibling file. |
| **Reuse existing Gemini SDK** | ✅ Same `@google/generative-ai@0.21.0` already used by `aiBriefController.ts` and `aiController.ts`. New methods (`generateContentStream`, `tools` config) are SDK 0.21.0 features, no version bump. |
| **SSE over WebSocket** | ✅ Reuses D-4's streamToken pattern (5-min JWT via `?token=` query param). |
| **Voice via Web Speech API** | ✅ Reuses existing `VoiceCommandRecorder.jsx`. No new deps. |
| **Tool calls SCOPED to merchantId** | ✅ Tools take `(args, merchantId)` from JWT. Every Prisma query includes `where: { merchantId }`. Never trust client. |
| **Cmd+K conflict avoided** | ✅ Decision §7.E recommends Cmd+J / Ctrl+J for chat; existing CmdKContext keeps Cmd+K for the command palette. |
| **90-day retention** | ✅ Decision §7.I recommends cron-driven cleanup. |
| **Cost tracking per message** | ✅ ChatMessage.tokensUsed + inputTokens + outputTokens + latencyMs columns. |
| **Plain JSX + inline styles + design tokens** | ✅ All frontend components follow the D-4..D-7 pattern (plain JSX, `@/design-system-v2/cinematic/tokens`, `@/components/foundation`). |
| **All commit messages in English** | ✅ Will follow. |
| **Strict micro-commits** | ✅ Phase B sequence in spec is 19 commits; will keep that ordering. |
| **Stop on unexpected output** | ✅ Will follow. |
| **Stop after Phase A if session limits looming** | ⚠️ Sprint is large (~5-7 days est). After Phase A is committed, Phase B will be its own session. Confirming this in the doc per Mehmet's note. |

---

## 9. Files to-be-added in Phase B

### Backend

```
prisma/manual-migrations/2026-05-1X_chat_d8.sql

src/services/chat/
├── tools.ts                 — Gemini function declarations + server impls (V1: ~10 tools)
├── engine.ts                — streamChat() generator: history → Gemini stream → tool calls → final assist
├── memory.ts                — token counter + drop-oldest pair strategy (8K cap)
├── streamToken.ts           — chat-scoped 5-min JWT (mirrors D-4 streamToken)
├── markdown.ts              — server-side sanitizer for assistant content (output is later rendered client-side)
└── titleGen.ts              — background "summarize this in 5 words" Gemini call

src/controllers/customer/
├── chatStreamController.ts        — POST /api/customer/chat/messages + GET /api/customer/chat/stream
├── chatConversationsController.ts — GET / POST / PATCH / DELETE /api/customer/chat/conversations
├── chatMessagesController.ts      — GET /api/customer/chat/conversations/:id/messages
└── chatActionsController.ts       — POST /api/customer/chat/actions/:type (allowlisted)

src/routes/customer/chat.ts        — mount points

src/controllers/cronController.ts  — extend with runChatCleanup()
src/routes/cronRoutes.ts           — POST /api/cron/chat-cleanup
```

### Frontend

```
src/api/v2/chat.js                                          — CRUD + stream + actions client
src/contexts/ChatContext.jsx                                — global open/close + active conversation state
src/hooks/v2/useChatStream.js                                — SSE consumer (mirrors useNotificationStream shape)
src/components/v2/chat/
├── ChatBubble.jsx                  — floating bubble (gradient orb + violet pulse)
├── ChatPanel.jsx                   — bottom-right slide-in panel
├── ChatPage.jsx                    — full-page route /chat
├── ConversationSidebar.jsx          — history list + new chat
├── MessageThread.jsx                — message list + auto-scroll
├── UserMessage.jsx                  — right-aligned glass tint
├── AssistantMessage.jsx             — markdown + charts + actions + citations
├── TypingIndicator.jsx              — 3 cyan dots pulse
├── ChatInput.jsx                    — auto-grow textarea + voice + suggested prompts
├── SuggestedPrompts.jsx             — context-aware chip row
├── InlineChart.jsx                  — wraps D-1 chart components
├── CitationChip.jsx                 — small reference link
├── ActionButton.jsx                 — one-click execution UI
├── VoiceMicButton.jsx               — wraps existing VoiceCommandRecorder
└── markdownLite.js                  — hand-rolled minimal MD renderer (~3 KB)

src/pages/v2/chat/ChatPage.jsx                              — full-page route at /chat (lazy-loaded)
src/i18n/dashboard/chat.{tr,en,ar}.json                      — canonical translations
```

The public share page is NOT touched — D-8 doesn't add a public surface.

---

## 10. Phase B readiness

Phase A is complete. Phase B is blocked on Mehmet's answers to the 11 questions in §7. **Sprint scope warning** per Mehmet's carry-over note: D-8 is the largest sprint in the program; expect Phase B to take its own session.

| Decision | Recommended | Impact if changed |
|---|---|---|
| **7.A** Schema design | A2 (new ChatConversation + ChatMessage) | A1/A3 risk legacy controller breakage |
| **7.B** Cmd+K conflict | B1 (chat = Cmd+J / Ctrl+J) | B4 loses spec's "Cmd+K from anywhere" |
| **7.C** Tool design | C1 (thin wrappers, V2 adds period-aware) | C2 ~150 extra LOC |
| **7.D** POST + SSE | D1 (two-step: POST persists, GET streams) | D2/D3 are workable but uglier |
| **7.E** Markdown | E1 (hand-rolled minimal) | E2 adds ~20KB to bundle |
| **7.F** Token cap | F1 (drop-oldest) | F2 adds 1 Gemini call per overflow |
| **7.G** Action security | G1 (allowlisted /actions/:type) | G2 less auditable |
| **7.H** Voice reuse | H1 (wrap existing component) | H2 ~50 extra LOC |
| **7.I** Retention enforcement | I1 (cron-job.org schedule) | I2 unbounded storage |
| **7.J** Mobile hotkey | (auto-resolved if 7.B = B1) | — |
| **7.K** Bundle strategy | K1 (lazy-load chat) | K2 heavier first paint |

Once Mehmet confirms picks, Phase B proceeds per the spec's 19-commit sequence (translating `companyId/userId` → `merchantId`, swapping `next/head` for nothing — D-8 is fully behind auth — and the protected files stay untouched).

---

**Phase A — DONE. Awaiting review.**
