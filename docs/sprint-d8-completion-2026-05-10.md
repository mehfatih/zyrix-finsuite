# Sprint D-8 — AI Chat ("Ask Anything"): Completion Report

**Date:** 2026-05-10
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **CODE COMPLETE — Phase A discovery + Phase B implementation shipped end-to-end**
**Awaiting:** cron-job.org schedule for `POST /api/cron/chat-cleanup` (4th cron, daily; you wire it manually after verification, same pattern as D-5/D-6/D-7).

---

## TL;DR

The full Gemini-powered AI chat surface shipped in 17 commits (1 discovery + 7 backend + 8 frontend + 1 completion report). Two pre-existing chat systems (`aiController` Gemini-backed and `aiAssistantController` Anthropic-backed) coexist untouched; D-8 lives in fresh `ChatConversation` + `ChatMessage` tables with no migration risk.

End-to-end paths now live:

- **Conversation persistence** — fresh tables with `merchantId` everywhere, 90-day retention default, JSON columns capture toolCalls / toolResults / citations / charts / actions, plus `tokensUsed` / `inputTokens` / `outputTokens` / `latencyMs` for D-10's per-merchant cost tracking.
- **Function calling** — Gemini SDK's tool-calling API (zero new deps) with 9 server-side implementations (8 read-only + 1 mutating proposal). Every tool takes `(args, merchantId)` from the trusted JWT context; never trusts model- or client-supplied merchantId. `KPI_COMPUTATIONS` registry called as a public read API (protected file unchanged).
- **Streaming** — `model.generateContentStream()` consumed by an `AsyncGenerator<ChatChunk>` that yields token / tool_call / tool_result / chart / action / citation / done events. Function-call loop iterates up to 5x per turn until Gemini emits a terminal text response. 45s hard timeout per turn. Locale-aware system prompt (TR/EN/AR).
- **SSE transport** — two-step flow per decision §7.D: `POST /messages` persists user message + returns 5-min JWT streamToken; `GET /stream?token=...` consumes streamToken and writes SSE events. Reuses D-4's writeSseMessage / writeSseKeepalive helpers. 20s heartbeat keeps Cloudflare/Vercel/Railway edge proxies from closing idle connections. Client disconnect detected via `req.on('close')`.
- **Multi-tenant isolation** — every Prisma query filters by `merchantId` from JWT. updateMany/deleteMany used over findUnique to prevent leaking existence info on cross-tenant ids. Action endpoints require resource ownership before mutating.
- **Action security** — allowlisted `POST /api/customer/chat/actions/:type` (decision §7.G). V1: `create_reminder`, `dismiss_insight`, `mark_invoice_paid`. Each action audit-logged in `MerchantAuditLog` with `metadata.source='chat'` so the admin dashboard can group by chat-originated mutations.
- **Frontend** — floating ChatBubble (lazy-loaded, auth-gated, mounted in app shell), bottom-right slide-in ChatPanel (480-540px), full-page `/chat` route with permanent sidebar (mobile drawer). Cmd+J / Ctrl+J global hotkey (decision §7.B; CmdKContext keeps Cmd+K). Esc closes when open.
- **Voice input** — `VoiceMicButton` reuses the existing Web Speech API pattern from `VoiceCommandRecorder.jsx` (decision §7.H). TR/EN/AR locale codes (ar-SA / en-US / tr-TR). Only renders on supported desktop browsers; mobile relies on system keyboard mic per spec.
- **Markdown** — hand-rolled `markdownLite.js` (~3KB inline) per decision §7.E covers headings, bold/italic, inline code, code blocks, links (http/https/mailto/relative; javascript: blocked), unordered + ordered lists, blockquotes, paragraphs.
- **Title auto-gen** — fire-and-forget Gemini call after 2+ user/assistant pairs persisted; replaces "New Conversation" / first-line-truncated default with a 5-word summary. Skipped if user has hand-edited the title.
- **Retention** — `POST /api/cron/chat-cleanup` (gated by `x-cron-secret`) hard-deletes ChatConversation rows where `expiresAt < now()`. Conversations with `retentionDays=0` (forever) are never touched.

Decisions §7.A–§7.K from the Phase A discovery doc were honored exactly as approved.

---

## What landed (Phase B execution log)

### Backend (`zyrix-finsuite-backend`)

| Commit | Message |
|---|---|
| [`4f655ba`](https://github.com/mehfatih/FinSuite-backend/commit/4f655ba) | feat(db): ChatConversation + ChatMessage migrations |
| [`e1b8a83`](https://github.com/mehfatih/FinSuite-backend/commit/e1b8a83) | feat(chat): tools + memory + streamToken foundation |
| [`2f709bc`](https://github.com/mehfatih/FinSuite-backend/commit/2f709bc) | feat(chat): streaming engine with function calling |
| [`2943b93`](https://github.com/mehfatih/FinSuite-backend/commit/2943b93) | feat(api): chat stream endpoints (POST persists + GET streams via SSE) |
| [`fd97af5`](https://github.com/mehfatih/FinSuite-backend/commit/fd97af5) | feat(api): conversation CRUD + messages list endpoints |
| [`838d006`](https://github.com/mehfatih/FinSuite-backend/commit/838d006) | feat(api): action endpoints + cron cleanup |
| [`0d59465`](https://github.com/mehfatih/FinSuite-backend/commit/0d59465) | feat(chat): conversation title auto-generation |

### Frontend (`zyrix-finsuite`)

| Commit | Message |
|---|---|
| [`ee413f8`](https://github.com/mehfatih/zyrix-finsuite/commit/ee413f8) | docs(ai-copilot): Sprint D-8 discovery report |
| [`70e61eb`](https://github.com/mehfatih/zyrix-finsuite/commit/70e61eb) | feat(chat-ui): API client + ChatContext + markdownLite |
| [`5ca38b4`](https://github.com/mehfatih/zyrix-finsuite/commit/5ca38b4) | feat(chat-ui): ChatBubble floating entry + Cmd+J hotkey |
| [`0689071`](https://github.com/mehfatih/zyrix-finsuite/commit/0689071) | feat(chat-ui): core message components |
| [`d891dab`](https://github.com/mehfatih/zyrix-finsuite/commit/d891dab) | feat(chat-ui): InlineChart + Citation + Action real impls |
| [`c71943b`](https://github.com/mehfatih/zyrix-finsuite/commit/c71943b) | feat(chat-ui): SuggestedPrompts + VoiceMicButton |
| [`739c127`](https://github.com/mehfatih/zyrix-finsuite/commit/739c127) | feat(chat-ui): ChatPanel + ConversationSidebar + useChatStream |
| [`4fbc2cf`](https://github.com/mehfatih/zyrix-finsuite/commit/4fbc2cf) | feat(chat-ui): /chat full-page route |
| [`e6c935d`](https://github.com/mehfatih/zyrix-finsuite/commit/e6c935d) | feat(i18n): chat UI translations (TR/EN/AR) |

(Plus this completion-report commit.)

---

## Files added

### Backend

```
prisma/manual-migrations/2026-05-10_chat_d8.sql

src/services/chat/
├── streamToken.ts           — chat-scoped 5-min JWT (mirrors D-4
│                              streamToken; distinct issuer)
├── memory.ts                — 8K token cap; drop-oldest pair strategy
│                              (decision §7.F option F1)
├── tools.ts                 — Gemini function declarations (8 read +
│                              1 mutating proposal)
├── toolImpls.ts             — server-side tool execution; every tool
│                              takes (args, merchantId) from JWT;
│                              every Prisma query filters by merchantId
├── engine.ts                — streamChat() AsyncGenerator: history
│                              trim → Gemini stream → tool call loop
│                              → terminal response → persist + title gen
└── titleGen.ts              — fire-and-forget Gemini 5-word summary
                               after 2+ user/assistant pairs

src/controllers/customer/
├── chatStreamController.ts          — POST /messages + GET /stream
├── chatConversationsController.ts   — list / create / get / patch /
│                                       delete + listMessages
└── chatActionsController.ts         — allowlisted POST /actions/:type
                                       (create_reminder / dismiss_insight /
                                       mark_invoice_paid)

src/routes/customer/chat.ts          — mount points

src/controllers/cronController.ts    — runChatCleanup() handler
src/routes/cronRoutes.ts              — POST /chat-cleanup
src/index.ts                          — /api/customer/chat mount
```

### Frontend

```
src/api/v2/chat.js                                          — CRUD + stream + actions client
src/contexts/ChatContext.jsx                                — open/close/active state + Cmd+J hotkey
src/hooks/v2/useChatStream.js                               — SSE consumer hook
src/pages/v2/chat/ChatPage.jsx                              — full-page /chat route
src/components/v2/chat/
├── ChatBubble.jsx                  — floating gradient orb (auth-gated)
├── ChatPanel.jsx                   — bottom-right slide-in panel
├── ConversationSidebar.jsx          — history list + new chat
├── MessageThread.jsx                — message list + smart auto-scroll
├── UserMessage.jsx                  — right-aligned violet glass tint
├── AssistantMessage.jsx             — markdown body + chart/citation/action slots
├── TypingIndicator.jsx              — three cyan pulse dots
├── ChatInput.jsx                    — auto-grow textarea + voice slot
├── SuggestedPrompts.jsx             — three rotating chips per locale
├── InlineChart.jsx                  — sparkline + cash_forecast SVG renderers
├── CitationChip.jsx                 — type-aware deep-link button
├── ActionButton.jsx                 — idle → loading → done|error state machine
├── VoiceMicButton.jsx               — lightweight Web Speech API mic
└── markdownLite.js                  — hand-rolled minimal MD renderer (~3 KB)

src/i18n/dashboard/chat.{tr,en,ar}.json                     — canonical translations
src/App.jsx                                                  — ChatProvider + ChatBubble + /chat route mounts
docs/sprint-d8-discovery-2026-05-10.md                      — Phase A doc
docs/sprint-d8-completion-2026-05-10.md                      — this file
```

The legacy `aiController.ts` (Gemini-backed) and `aiAssistantController.ts` (Claude-backed) and the existing `cmdkController.ts` (palette) — **all untouched**. D-8 coexists with them.

---

## Decisions honored (from Phase A §7)

| ID | Decision | How it shipped |
|---|---|---|
| **7.A** | New `ChatConversation` + `ChatMessage` tables; legacy `AiConversation` untouched | Two new Prisma models, 7-column + 13-column shape with JSON columns for tool calls / results / citations / charts / actions. Legacy `AiConversation` row + the `aiController` `POST /api/ai/chat` endpoint still works unchanged. |
| **7.B** | Chat hotkey = `Cmd+J` / `Ctrl+J`; existing palette keeps `Cmd+K` | `ChatContext.jsx` binds `(metaKey OR ctrlKey) + 'j'` (no shift, no alt). `CmdKContext.jsx` keeps its existing `Cmd+K` binding for the command palette. Both contexts coexist; toggle handlers don't interfere. |
| **7.C** | Thin tool wrappers V1; period-aware V2 | `services/chat/toolImpls.ts` wraps `KPI_COMPUTATIONS` directly. `period` parameter on `get_kpi_value` is documented but ignored; `compare_periods` is a V2 stub returning `{ notImplemented: true, hint }`. |
| **7.D** | Two-step POST persists, GET streams via streamToken JWT | `POST /api/customer/chat/messages` returns `{ conversationId, userMessageId, assistantMessageId, streamToken, locale }`. Frontend opens `EventSource(streamUrl(token))`. EventSource limitation (no custom headers) honored. |
| **7.E** | Hand-rolled minimal markdown subset (~3KB inline, no new dep) | `src/components/v2/chat/markdownLite.js` covers headings, bold, italic, inline code, code blocks (with optional `lang`), links (http/https/mailto/relative; `javascript:` URIs blocked), unordered + ordered lists, blockquotes, paragraphs with `<br>`. |
| **7.F** | Drop-oldest pairs V1; summarization V2 | `services/chat/memory.ts` exports `trimMemoryToCap()` — drops whole turns (user + following assistant + tool messages) by `createdAt` order until under 6K soft cap. Token estimator uses 3.8 chars-per-token (conservative for TR/AR). |
| **7.G** | Allowlisted `POST /api/customer/chat/actions/:type` | `chatActionsController.execute` checks `ALLOWED_ACTIONS` set. Each handler verifies resource ownership before mutating. Audit row written to `MerchantAuditLog` with `action` mapped to the closest enum value (CREATE/UPDATE) + `metadata.source='chat'` + `metadata.chatAction='<original>'`. |
| **7.H** | Wrap existing `VoiceCommandRecorder` | `VoiceMicButton.jsx` uses the SAME Web Speech API pattern (`webkitSpeechRecognition`, `interimResults: true`, `continuous: true`, error handlers) but in a chat-flavored shim — small icon button slot that fits `ChatInput.leftSlot`. Mobile detection skips it (rely on system keyboard mic per spec). |
| **7.I** | Daily cron-job.org cleanup | Backend endpoint `POST /api/cron/chat-cleanup` lives. You wire the cron-job.org schedule manually (4th cron alongside morning brief / weekly report / WhatsApp reminders). Until wired, expired conversations accumulate but harmlessly. |
| **7.J** | Auto-resolved by 7.B | Mobile keeps the floating ChatBubble; no global hotkey needed because mobile keyboards don't have Cmd/Ctrl modifiers. |
| **7.K** | Lazy-load chat components | `ChatBubble` is the only chat component in the initial bundle (~5KB after the lucide icon). `ChatPanel` (and everything it imports) is `React.lazy()`'d. `/chat` route is `React.lazy()`'d. Vite's chunk splitter naturally pulls the chat bundle into a separate chunk. |

---

## Hard-rule compliance

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero edits to `nixpacks.toml`, `railway.toml`, `package.json`, Node version, env vars. The cron-job.org schedule is the single ops step (Mehmet wires manually). |
| **`merchantId` everywhere** | ✅ Every new column, query, JWT payload, audit row uses `merchantId`. Spec's `userId / companyId` translated. Tools take `merchantId` from JWT and add it to every Prisma query. |
| **No mods to `aiBriefController.ts` / `merchantSnapshot.ts` / KPI logic** | ✅ Verified by `git diff 2a99b7c..HEAD -- <three protected files>` → 0 lines output. Tools call `KPI_COMPUTATIONS[id](merchantId, prisma)` as a public read-only API; the protected file's exports are unchanged. |
| **Reuse existing Gemini SDK** | ✅ Same `@google/generative-ai@0.21.0`. Engine uses `model.generateContentStream({ contents, tools })`; titleGen uses `model.generateContent()`. Both are SDK 0.21.0 features — no version bump. |
| **Streaming via SSE (not WebSocket)** | ✅ `text/event-stream` response with `event: X\ndata: {...}\n\n` chunks. Reuses D-4's `writeSseMessage` + `writeSseKeepalive` helpers. Token in `?token=` query param matches D-4 EventSource limitation. |
| **Voice via Web Speech API** | ✅ `VoiceMicButton.jsx` uses `webkitSpeechRecognition || SpeechRecognition`. Zero new deps. Mobile detection skips it; mobile users get the system keyboard mic. |
| **Tool calls SCOPED to merchantId** | ✅ Every tool implementation in `toolImpls.ts` takes `(args, merchantId)` and adds `merchantId` to every Prisma `where`. Mutating tool `create_reminder` returns a PROPOSAL only; actual side effects via the allowlisted `/actions/:type` endpoints which re-verify merchantId from JWT. |
| **Cmd+K conflict avoided** | ✅ Chat uses Cmd+J / Ctrl+J; existing CmdKContext keeps Cmd+K for the palette. Both contexts coexist. |
| **90-day retention** | ✅ `ChatConversation.retentionDays @default(90)` + nightly cleanup endpoint. |
| **Cost tracking per message** | ✅ `ChatMessage.tokensUsed` + `inputTokens` + `outputTokens` + `latencyMs` columns. Engine populates from Gemini's `usageMetadata.promptTokenCount` and `candidatesTokenCount`. D-10 admin dashboard sums these per merchant per day. |
| **Plain JSX + inline styles + design tokens** | ✅ All chat components plain JSX + inline styles + `@/design-system-v2/cinematic/tokens` + lucide icons. No new UI libs. |
| **All commit messages in English** | ✅ All 17 commits English. |
| **Strict micro-commits** | ✅ Each commit is one concern: schema → services → engine → endpoints (split into 3 commits) → API client → context → bubble → core components → richer components → suggestions+voice → panel+sidebar → full-page route → title gen → i18n → completion report. Every commit leaves the build green. |
| **Stop on unexpected output** | ✅ Every TS check passed; 2 minor errors caught and fixed inline (Expense field name, generator yield-in-forEach). |

---

## Database changes

One additive migration matching the project convention:

```
prisma/manual-migrations/2026-05-10_chat_d8.sql
```

Schema additions (idempotent via `IF NOT EXISTS`):

- **`chat_conversations`**: `id`, `merchantId → merchants(id) CASCADE`, `title` (default 'New Conversation'), `pinned`, `archived`, `retentionDays` (default 90), `expiresAt`, `lastMessageAt`, `createdAt`, `updatedAt`. Indexes on `(merchantId, lastMessageAt DESC)`, `(merchantId, archived)`, `(expiresAt)` — last one is the cron cleanup query path.
- **`chat_messages`**: `id`, `conversationId → chat_conversations(id) CASCADE`, `role` (`user`|`assistant`|`tool`), `content` (TEXT), `toolCalls` / `toolResults` / `citations` / `charts` / `actions` (JSONB nullable), `tokensUsed` / `inputTokens` / `outputTokens` / `latencyMs` (Int nullable for D-10 cost dashboard), `createdAt`. Index on `(conversationId, createdAt DESC)` for the messages list endpoint.

Existing tables touched: zero. The `Merchant` model gains one new relation (`chatConversations ChatConversation[]`).

---

## API surface added

### Customer (Bearer auth)

```
POST   /api/customer/chat/messages                        — persist user message, return streamToken
GET    /api/customer/chat/conversations                   — paginated list
POST   /api/customer/chat/conversations                   — create empty
GET    /api/customer/chat/conversations/:id               — single
PATCH  /api/customer/chat/conversations/:id               — rename / pin / archive / retentionDays
DELETE /api/customer/chat/conversations/:id               — hard delete (cascade messages)
GET    /api/customer/chat/conversations/:id/messages      — paginated message list
POST   /api/customer/chat/actions/:type                   — allowlisted (create_reminder / dismiss_insight / mark_invoice_paid)
```

### Customer (no Bearer; streamToken IS the credential)

```
GET    /api/customer/chat/stream?token=<jwt>              — SSE stream of token / tool_call / tool_result / chart / action / citation / done events
```

### Cron (`x-cron-secret` header)

```
POST   /api/cron/chat-cleanup                             — nightly: deletes ChatConversation rows where expiresAt < now()
```

---

## Known follow-ups (out of D-8 scope)

1. **cron-job.org schedule registration** — you wire it manually. Daily POST to `https://api.finsuite.zyrix.co/api/cron/chat-cleanup` with header `x-cron-secret: $CRON_SECRET`. Until wired, expired conversations accumulate but cause no harm (they just stop appearing in the user-visible UI when filtered, and the count shows in `prisma.chatConversation.count({ where: { expiresAt: { lte: new Date() } } })`).
2. **D-7 share-conversation reuse** — `PublicShareLink.resourceType` already accepts arbitrary strings; adding `'chat_conversation'` to the customer create allowlist + a public render path would let merchants share a chat with anyone via the existing slug system. V2 enhancement; one new commit.
3. **Period-aware tools (V2)** — promote `compare_periods` from stub to real WoW/MoM helpers; promote `get_kpi_value`'s `period` parameter from documented-but-ignored to honored. Likely a sibling `services/chat/kpiTools.ts` (~150 LOC) per discovery doc §7.C option C2.
4. **Token-cap summarization (V2)** — promote `memory.ts` from drop-oldest to side-summarize (one extra Gemini call per overflow) per decision §7.F option F2. Apply when users complain about lost context.
5. **hCaptcha on actions** — currently the action endpoints rely on Bearer auth. If users complain about accidental clicks (or if logs show abuse), add hCaptcha or a confirm modal to the high-stakes mutations (`mark_invoice_paid` especially).
6. **Inline "Share via WhatsApp" action** — wire `create_share_link` (D-7 PublicShareLink) as a chat tool so the AI can propose "share this insight with your accountant?". Same security model as `create_reminder` (proposal → user click → audit log).
7. **D-10 cost dashboard wiring** — D-10 should sum `ChatMessage.tokensUsed` grouped by `merchantId` + day. The data is already there (every assistant message stores Gemini's `usageMetadata.promptTokenCount + candidatesTokenCount`).
8. **Voice transcript privacy badge** — current implementation persists transcripts as plain user messages (same as typed text). If a merchant wants extra privacy guarantees, add a `usedVoice` boolean to `ChatMessage` so the UI can show "🎙 voice" tag and the merchant can audit.

---

## Verification matrix (post-cron registration)

| Check | How |
|---|---|
| **Migration applied** | `\d chat_conversations` returns the 9-column shape; `\d chat_messages` returns the 13-column shape. |
| **Stream token works end-to-end** | TR merchant logs in; opens chat (Cmd+J or floating bubble); types "Bu ayki MRR ne kadar?"; expect streaming text response within ~2s, then a sparkline chart, then `done`. Verify ChatMessage row's tokensUsed > 0. |
| **Function calling works** | Type "Hangi müşterim en çok satın aldı?"; expect Gemini to emit `get_top_customers` tool call → tool_result event with up to 5 customers → assistant text answer → citation chips for each customer. |
| **Action button works** | Type "Bana 3 gün sonra için hatırlatıcı oluştur: vergi ödemesi"; expect `create_reminder` tool call → action event → action button rendered. Click → `POST /api/customer/chat/actions/create_reminder` → Task row created → button flips to mint check + "Done". Verify MerchantAuditLog row exists with `metadata.chatAction='create_reminder'`. |
| **Multi-tenant isolation** | Create a chat as Merchant A; copy the conversationId; log in as Merchant B; try `GET /api/customer/chat/conversations/:that-id` → expect 404. Try `POST /messages` with that conversationId → expect 404. |
| **Cmd+J hotkey** | On any authenticated page, press Cmd+J (Mac) or Ctrl+J (Win/Linux); expect chat panel to open. Press Esc; expect chat panel to close. Press Cmd+K; expect command palette (NOT chat) to open. |
| **Voice mic** | On Chrome desktop, click the mic icon in chat input; speak "merhaba"; expect transcript to appear in textarea (interim → final). Click mic again to stop. |
| **Markdown rendering** | Trigger an assistant response that contains `**bold**`, `_italic_`, `` `inline code` ``, a fenced code block, and a `[link](https://example.com)`; verify each renders correctly in AssistantMessage. |
| **Title auto-gen** | Have a 4-message conversation (2 user + 2 assistant) on a fresh chat; reload the sidebar; expect the title to have changed from "New Conversation" / first-line-truncated to a 5-word Gemini summary. |
| **8K cap drop-oldest** | Manually insert 30 long messages into a conversation; send a new user message; check the engine's `priorMessages` debug log (or a spot-check via `memorySnapshot()` in a unit test) — expect older turns dropped before the new one is processed. |
| **/chat full-page route** | Navigate to `/chat` directly; expect the full-page layout (sidebar left, thread + input right). On mobile (<720px), expect the sidebar to collapse to a drawer triggered by the sidebar button in the header. |
| **Action error path** | Trigger `mark_invoice_paid` with a bad invoiceId in the action payload; expect 400 + the button flips to crimson "Error" state with the server message in the title attribute. |
| **Cron cleanup** | Manually create a ChatConversation with `expiresAt: yesterday`; POST `https://api.finsuite.zyrix.co/api/cron/chat-cleanup -H "x-cron-secret: $CRON_SECRET"` → expect `{ deleted: 1 }`. Verify the row + its messages are gone. |

---

## What this unlocks for the next sprint

D-8 establishes the **conversational interface** as a first-class surface:

- Function calling + multi-tenant tool isolation pattern is reusable for any future "AI does something with merchant data" feature (D-9 voice agents, D-10 admin AI assistant).
- Streaming SSE pattern (postMessage → streamToken → EventSource) is now a proven precedent for any future generative surface.
- The action allowlist + audit log pattern lets us safely expand mutating actions over time without losing audit trail.
- The 8K token cap memory module is reusable for any future LLM context-window management.
- The lazy-loaded chat-bundle pattern means we can add more heavy AI surfaces (voice agents, etc.) without bloating the initial app bundle.

D-9 and D-10 can build on this: e.g., **AI voice agent** is a direct extension (Web Speech API streaming → Gemini → text-to-speech response, with the same tool-calling backbone), and **admin AI assistant** uses the same engine wrapper but with admin-scoped tools (cross-merchant queries, ops actions).

---

**Sprint D-8: SHIPPED.**
