# Sprint D-6 — Weekly Performance Report Auto-PDF: Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of the open decisions in §6 before Phase B**

---

## TL;DR

Most of D-6 lands cleanly on infrastructure already shipped:

| Layer | State | What D-6 needs |
|---|---|---|
| PDF renderer (Puppeteer pool, multi-page A4 via `@page` CSS) | ✅ Stable since D-2.5; `rangeReport.ts` is a near-perfect precedent for a cover + sections + closing layout | One new template `weeklyReport.ts` modeled on `rangeReport.ts` |
| Cron pattern | ✅ D-5 just shipped `/api/cron/morning-brief-tick` with `x-cron-secret`; cron-job.org confirmed firing | One more endpoint: `/api/cron/weekly-report-tick`, fired hourly Sunday (or every 15 min like D-5) |
| Email dispatch | ✅ Resend + `services/morningBrief/sendBrief.ts` is the proven pattern; `services/sharing/sendShareEmail.ts` already accepts arbitrary `pdfBuffer` | Either extend the share template or build dedicated weekly email (decision §6.E) |
| Notification engine | ✅ D-4 engine accepts arbitrary `event.type` strings; existing severities cover this | Fire `weekly_report_ready` under `SHARE_EVENT` (no new severity needed) |
| Timezone helpers | ✅ `services/morningBrief/tz.ts` returns local hour + day-of-week from native `Intl.DateTimeFormat` | Reuse verbatim |
| AI narrative | ✅ `@google/generative-ai` SDK already a dep, working in production | NEW file `services/weeklyReport/narrative.ts` with its own Gemini call (per spec — must NOT touch `aiBriefController.ts`) |
| Insight history filtering | ✅ `Insight.generatedAt` is indexed | Direct query for the week's insights |

Three things genuinely new in D-6:

1. **No "arbitrary date-window" KPIs.** The protected `kpiComputations.ts` only computes for fixed calendar windows (current month, last 30 days). Week-over-week deltas need new helpers — built outside the protected file. Decision §6.A.
2. **No blob storage.** D-2 PDFs are returned as on-demand buffers; nothing is persisted. The spec proposes `pdfUrl` with 90-day expiry. Three viable storage options without new infra; one option needs approval. Decision §6.B.
3. **No PDF viewer dep.** Frontend has no `react-pdf` or similar. Options: iframe (no new dep) vs. introduce `react-pdf` (new dep, needs approval). Decision §6.D.

Six decisions captured in §6. None of them require Mehmet to read code; each has a recommended default.

---

## 1. Repo geography (recap)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\` | Frontend (Vite + React 18, plain JSX). All UI work + this discovery doc live here. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\` | Express + Prisma + Resend + Puppeteer backend. Schema, scheduler, generator, narrative, template, controllers, routes. |

Hard rule: **`merchantId` everywhere** — the spec's example schema uses `companyId / userId`, but the actual data model is `merchantId` on every related table. Spec must be translated.

---

## 2. A.1 — Data availability audit

### 2.1 Existing KPI registry

`src/services/customer/kpiComputations.ts` (PROTECTED) ships 12 KPIs. The four the report needs are all available **as point-in-time current values**, but only one ships with a built-in delta:

| Spec needs | KPI fn | Has built-in delta? |
|---|---|---|
| MRR with WoW delta | `computeMrr()` (line 75) | Current month vs. prior month — NOT 7-day |
| Net Cash Position with WoW delta | `computeCashBalance()` (line 126) | No delta — only point value |
| Gross Margin with WoW delta | `computeGrossMargin()` (line 245) | No delta — current month only |
| Cash Runway with WoW delta | `computeCashRunway()` (line 138) | Has `trend` (prior 30-day vs. current 30-day burn) — close but not 7-day |

### 2.2 The window-mismatch problem

Every KPI in the protected file is hard-coded to a fixed calendar window (`startOfMonth`, `daysAgo(30)`, etc.). **None** accepts an arbitrary `startDate / endDate`. So WoW deltas — fundamental to the weekly report — can't come from `kpiComputations.ts` without modification.

Per the hard rule, modifying that file is forbidden without explicit approval.

### 2.3 Resolution path

Build a **sibling** module `src/services/weeklyReport/weeklyKpis.ts` that:
- Reads the same Prisma tables `kpiComputations.ts` reads (`Invoice`, `BankTransaction`, `Expense`, `Customer`, `TaxEvent`)
- Accepts an arbitrary `{ start: Date; end: Date }` window
- Computes the four needed KPIs for that window AND for the prior 7-day window
- Returns `{ mrr, mrrDelta, netCash, netCashDelta, grossMargin, marginDelta, runway, runwayDelta }`

Costs: ~200 lines of duplication-by-design (different aggregation windows ⇒ different SQL). Benefits: protected file untouched; deltas are first-class; the weekly report stays self-contained and testable.

### 2.4 First-week handling

Spec calls out "Foundation Week" simplified report when `<7 days` of data. The codebase has no dedicated helper, but `Merchant.createdAt` is available (schema line 383).

Recommended check: `now - merchant.createdAt < 7 days` → render a simplified 1-page "Welcome" variant (welcome message + setup CTA). KPI numbers will be 0/null/empty for new merchants and the report would otherwise look broken.

---

## 3. A.2 — AI narrative generation audit

### 3.1 Existing Gemini integration

`src/controllers/customer/aiBriefController.ts` (PROTECTED) imports `GoogleGenerativeAI` from `@google/generative-ai` (line 15), instantiates a global `genAI` client (line 23), and uses `gemini-2.0-flash` (line 285) with an 8-second timeout. The prompt structure is daily-brief-shaped (3 short cards, ~150 words total).

### 3.2 Why we can't extend that controller

- The hard rule says no modifications to `aiBriefController.ts`.
- A weekly narrative is a different shape: 2 paragraphs (~400 words), interpretive ("the week was…"), no structured card output, no route allowlist.
- Sharing the same Gemini client instance is fine, but it lives in module scope inside the protected file.

### 3.3 Resolution path

Build `src/services/weeklyReport/narrative.ts` that:
- Imports `GoogleGenerativeAI` independently
- Takes a `WeeklyKpiSnapshot` + insights + merchant locale
- Calls Gemini with a long-form prompt designed for executive-summary tone
- Validates output (length cap, no hallucinated metrics) and falls back to a canned narrative on timeout/parse failure
- Caches output on the `WeeklyReport` row (per-merchant per-week — see §4)

Token budget: ~400 words ≈ 600 input tokens + 600 output tokens per generation. One call per merchant per week. Easy to bound spend.

### 3.4 Refresh / regeneration semantics

Per the spec's hard constraint: "Narrative caching: Gemini call once per week per merchant; subsequent regenerations reuse the narrative unless manually triggered". The `WeeklyReport.narrative` column is the single source of truth. A force-regenerate flag on the generation endpoint (admin-only or rate-limited) clears the cell and re-prompts.

---

## 4. A.3 — PDF performance audit

### 4.1 Renderer state

`src/services/pdf/pdfRenderer.ts` (post-D-2.5):
- Pool of up to `PDF_MAX_BROWSERS` Chromium instances (default 2, max 4)
- Each browser recycled after 50 renders (`MAX_RENDERS_PER_BROWSER`) to bound memory drift
- Launch args: `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`, `--no-first-run`, `--no-zygote`, `--disable-extensions`, etc.
- **`--single-process` was REMOVED** in D-2.5 (caused "Navigating frame was detached" errors). Multi-process is the stable default now.
- `page.setContent(html, { waitUntil: 'networkidle0', timeout: 20s })`
- `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true, margin: '16mm' })`
- Returns a single `Buffer`; no per-page calls

### 4.2 Multi-page support

Native CSS `@page` and `page-break-before / page-break-after` directives are respected by Puppeteer when `preferCSSPageSize: true` is set (which it is). The existing `rangeReport.ts` template proves this works in production today — it generates multi-page A4 documents with cover, body, and final pages.

### 4.3 Will 6 pages OOM?

Idle Chromium ≈ 280-360 MB (two browsers); peak +50-100 MB per render. A 6-page report with inline SVG charts would push the per-render peak to maybe +150-200 MB. On Railway's default container, this is well within budget.

The bigger concern is **render time**: the spec says "PDF must render under 15s end-to-end on Railway production". The 20s page-timeout is generous; a 6-page render with ~6-8 inline SVG charts is realistic in 4-8s based on D-2 benchmarks. We should measure during Phase B and have a fallback if a chart's complexity causes spikes.

### 4.4 Inline SVG strategy

Spec says "Pre-render charts as separate images, embed → faster than rendering everything in single HTML". We disagree with the spec's premise: D-2 already proves inline SVG renders fine. Pre-rendering to PNG would require:
- A new "render chart to image" pipeline (probably another Puppeteer call per chart — slower not faster)
- Or `node-canvas` / `@vercel/og` (new deps, blocked by hard rule without approval)

Recommendation: stick with inline SVG (matches D-2). Revisit only if production p95 render times exceed 12s.

### 4.5 Asset inlining

Fonts on disk at `src/services/pdf/assets/fonts/` (WOFF2: IBM Plex Sans Arabic, Inter Latin/Ext). All fonts and CSS are embedded inline in the HTML string via `_layout.ts` `htmlShell()` `<style>` tag. No external CSS/image fetches at render time — fully self-contained. Same approach for D-6.

---

## 5. A.4 — Adjacent infrastructure audit (added beyond spec scope)

### 5.1 PDF serving / storage

D-2 PDFs are returned **as on-demand HTTP attachments**:

```
POST /api/customer/pdf/insight/:insightId   → renderPdf() → Buffer → res.send()
POST /api/customer/pdf/daily-brief          → same
POST /api/customer/pdf/range-report         → same
```

Headers: `Content-Type: application/pdf`, `Content-Disposition: attachment`, `Cache-Control: no-store`. Rate-limited at 10 PDFs/merchant/hour.

**Nothing is persisted.** No filesystem storage, no S3, no signed URLs.

The spec proposes `WeeklyReport.pdfUrl String?` ("signed URL with 90-day expiry"). This is not currently possible without introducing storage infrastructure. Decision §6.B.

### 5.2 Notification engine reuse

D-4 engine (`services/notifications/engine.ts`) accepts arbitrary `event.type` strings. Existing `NotificationSeverity` values: `CRITICAL | ATTENTION | OPPORTUNITY | SHARE_EVENT | SYSTEM`. The "Haftalık raporun hazır" notification fits cleanly under `SHARE_EVENT` (or a new value if we want — decision §6.F). No engine changes needed.

### 5.3 D-3 share-email template

`src/services/sharing/shareEmailTemplate.ts` has hardcoded enum: `document.type: "single_insight" | "daily_brief" | "range_report"`. No `weekly_report` case. Either add one (small diff to a D-3 file) or ship a dedicated weekly email template (mirrors D-5's `services/morningBrief/emailTemplate.ts` pattern). Decision §6.E.

### 5.4 D-5 patterns directly reusable

| File | Reusable for D-6? | Notes |
|---|---|---|
| `services/morningBrief/scheduler.ts` | YES (adapt) | Swap hour-match for `(localDow === 0 && localHour === 18)` |
| `services/morningBrief/tz.ts` | YES (verbatim) | `localPartsIn()` returns hour + dow; both needed |
| `services/morningBrief/sendBrief.ts` | YES (adapt) | Same Resend wiring; replace generator + template |
| `services/morningBrief/unsubscribeToken.ts` | NO | Per-merchant token; weekly report needs same flow but distinct endpoint, OR can reuse same token for both flows (decision §6.G) |
| `services/morningBrief/generator.ts` | PARTIAL | HTTP-loopback pattern useful but daily brief was about cards; weekly is its own data shape |

---

## 6. Open decisions for Mehmet (BLOCKERS for Phase B)

These are not infrastructure changes per se — they're architecture + naming choices that materially shape the commit sequence and require your call.

### 6.A — Where do the WoW KPI deltas come from?

`kpiComputations.ts` is protected and computes only for fixed calendar windows. We need 7-day-window KPIs with prior-7-day deltas.

| Option | Description | Trade-off |
|---|---|---|
| **(A1) New `services/weeklyReport/weeklyKpis.ts`** (~200 lines) | Reads same Prisma tables; computes for arbitrary `{ start, end }` window | Duplication-by-design with parts of `kpiComputations.ts`. Preserves protected file. Self-contained and testable. |
| **(A2) Approve a one-time edit** to add `computeForWindow(merchantId, start, end)` exports inside the protected file | One source of truth | Touches the protected file — requires explicit approval. Even with approval, the protected file gets bigger and the prompt-injection attack surface grows. |
| **(A3) Promote sub-KPIs to a new shared module** `services/customer/kpiPrimitives.ts` | Both `kpiComputations.ts` and the new `weeklyKpis.ts` consume primitives | Cleanest architecturally — but requires touching `kpiComputations.ts` to refactor it onto the primitives. Same hard-rule blocker as A2. |

**Recommended: (A1)** — duplicates ~150 lines of aggregation but keeps the protected file untouched. Once Phase B ships, we have a clean precedent for any future "give me KPIs for an arbitrary window" need (D-7 monthly reports? D-8 quarterly?). Cleanup to A3 can be a future approved sprint.

### 6.B — Where do generated PDFs live?

The current architecture ships PDFs as on-demand HTTP buffers and persists nothing. The spec wants `pdfUrl String?` (90-day signed URL). Four viable paths:

| Option | Storage | Ops cost | Trade-off |
|---|---|---|---|
| **(B1) On-demand only** | None — `WeeklyReport` row stores everything *except* PDF; the viewer/email re-renders from the persisted narrative + KPI snapshot + insight IDs each time | Zero infra change | Slowest path: every "View" click re-runs Puppeteer (4-8s). Email send re-renders too. But the data is deterministic so output is identical. |
| **(B2) Postgres BLOB (`bytea`)** column on `WeeklyReport` | Database | Zero infra change; Postgres on Railway is already provisioned | Simple. ~1-3 MB per row × N merchants × 52 weeks/year. A 1000-merchant tenant accumulates ~1.5 GB/year. Acceptable for V1, ugly long-term, makes backups heavier. |
| **(B3) Railway volume** (filesystem at `/data/weekly-reports/<merchantId>/<weekStart>.pdf`) | Disk | Needs Railway volume provisioned (one-time dashboard step, no in-repo config) | Cheap, fast. **Volumes are NOT shared across container redeploys** in some Railway plans — the data IS persistent on the volume but if the volume is detached/recreated, files are lost. Confirm Railway plan first. |
| **(B4) External blob (S3 / R2 / GCS)** | Cloud | Requires `@aws-sdk/client-s3` (or similar) + env vars + bucket + signed-URL plumbing | Production-grade. **NEW INFRASTRUCTURE — explicitly blocked by the hard rule without approval.** |

**Recommended: (B1) for V1, then upgrade to (B2) in V2 when we have data on viewing patterns.** Rationale: re-rendering is deterministic (Insight IDs + KPI snapshot + narrative are all on the row), Puppeteer is already pooled, and zero new infra is the cleanest landing. If users complain about the click-to-PDF latency, B2 is a 30-line follow-up commit.

### 6.C — Naming: `WeeklyReport*` schema names + collision check

Schema needs three new tables. Names must use `merchantId`, NOT `companyId`. No naming collisions in the existing schema (verified).

```prisma
model WeeklyReport {            // NOT WeeklyReport.companyId — use merchantId
  id          String   @id @default(cuid())
  merchantId  String
  weekStart   DateTime @db.Date  // Monday 00:00 in merchant's local tz, stored as Date
  weekEnd     DateTime @db.Date  // Sunday 23:59 in merchant's local tz
  narrative   String   @db.Text
  insightIds  String[]
  kpiSnapshot Json     // { mrr, mrrDelta, netCash, netCashDelta, margin, marginDelta, runway, runwayDelta }
  pdfBytes    Bytes?   // ONLY if §6.B = B2; absent for B1
  status      String   @default("ready")   // 'ready' | 'failed'
  generatedAt DateTime @default(now())
  merchant    Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  @@unique([merchantId, weekStart])
  @@index([merchantId, weekStart])
}

model WeeklyReportSubscription {
  id            String   @id @default(cuid())
  merchantId    String   @unique
  enabled       Boolean  @default(true)
  sendDayLocal  Int      @default(0)   // 0=Sunday..6=Saturday
  sendHourLocal Int      @default(18)
  lastSentAt    DateTime?
  bounceCount   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  merchant      Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  @@map("weekly_report_subscriptions")
}

model WeeklyReportSend {        // matches D-5 MorningBriefSend
  id                  String   @id @default(cuid())
  merchantId          String
  reportId            String
  subject             String
  providerMessageId   String?
  status              String   @default("sent")
  sentAt              DateTime @default(now())
  deliveredAt         DateTime?
  openedAt            DateTime?
  clickedAt           DateTime?
  bouncedAt           DateTime?
  bounceReason        String?
  merchant            Merchant     @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  report              WeeklyReport @relation(fields: [reportId],   references: [id], onDelete: Cascade)
  @@index([merchantId, sentAt])
  @@index([providerMessageId])
}
```

Note: `Merchant.timezone` is the source of truth (NO `WeeklyReportSubscription.timezone` column — same decision as D-5 made for `MorningBriefSubscription`).

### 6.D — In-app PDF viewer: iframe vs. `react-pdf`?

Spec says "use `react-pdf` or native iframe".

| Option | Cost | Trade-off |
|---|---|---|
| **(D1) Native `<iframe src="/api/.../pdf">`** | Zero new deps | Browser-native PDF viewer; works in Chrome/Edge/Safari. Mobile-friendly (most mobile browsers offer "open in PDF viewer"). Limited UX customization. |
| **(D2) `react-pdf` (`@react-pdf/renderer` viewer)** | New dep (~700 KB), needs PDF.js worker setup | Cinematic in-page experience. More work, more bundle weight. |

**Recommended: (D1)** — exactly per the rangeReport precedent. The browser PDF viewer is good enough for V1 and can be promoted later if user feedback justifies it.

### 6.E — Email template: extend D-3 share template OR build a dedicated weekly one?

| Option | Trade-off |
|---|---|
| **(E1) Extend `services/sharing/shareEmailTemplate.ts`** with a `"weekly_report"` case | Smallest diff; reuses D-3 chrome (which is the same chrome D-5 used as inspiration). Couples weekly with insights/share template. |
| **(E2) New `services/weeklyReport/emailTemplate.ts`** mirroring D-5's `services/morningBrief/emailTemplate.ts` pattern | Self-contained; weekly's content (cover thumbnail + KPI summary + narrative excerpt + "Open report" CTA) is meaningfully different from a "here's a doc I shared with you" template. |

**Recommended: (E2)** — matches the D-5 precedent (each scheduled email surface gets its own template under its own service folder). The two templates can share visual chrome via copy-paste; that was the explicit decision in D-5 §6.E too.

### 6.F — Notification severity for `weekly_report_ready`?

| Option | Trade-off |
|---|---|
| **(F1) Reuse `SHARE_EVENT`** | Zero schema change. The notification engine already handles SHARE_EVENT routing, channels prefs, etc. |
| **(F2) New severity `WEEKLY_REPORT`** | More semantic clarity; lets users disable weekly-report notifications independently in `/settings/notifications`. Requires a small `NotificationPreference.weeklyReportChannels` column addition. |

**Recommended: (F1)** — V1 ships under SHARE_EVENT; if users complain that weekly-report notifications spam them, we promote to F2 in a follow-up sprint.

### 6.G — Unsubscribe: reuse D-5's signed token OR a new one?

D-5's `services/morningBrief/unsubscribeToken.ts` mints `morning-brief-unsub:<merchantId>` JWTs. Two options for D-6:

| Option | Trade-off |
|---|---|
| **(G1) New token namespace** `weekly-report-unsub:<merchantId>` + new endpoint `/api/weekly-report/unsubscribe` | Independent — unsubscribing from weekly doesn't touch morning brief. Clean separation. Two unsubscribe pages or one shared `/unsubscribe?type=weekly` page. |
| **(G2) Single token** with a `flow` claim (`morning_brief` / `weekly_report` / both) | One unsubscribe page handles all flows. Smaller footprint. Requires touching D-5's token shape (additive). |

**Recommended: (G1)** for V1 — keeps D-5 untouched; adds ~30 lines of mirror code; cleanest. We can consolidate to G2 in a future cleanup sprint if both unsubscribe flows ship and feel duplicative.

---

## 7. Files inventoried

### Backend (`zyrix-finsuite-backend`)

```
PROTECTED — do not modify:
  src/controllers/customer/aiBriefController.ts
  src/services/customer/merchantSnapshot.ts
  src/services/customer/kpiComputations.ts

REUSE AS-IS:
  src/services/pdf/pdfRenderer.ts              (Puppeteer pool — multi-page A4 ready)
  src/services/pdf/templates/_layout.ts        (htmlShell + fonts + CSS)
  src/services/pdf/templates/charts.ts         (SVG sparklines, donuts, KPI grids)
  src/services/pdf/templates/rangeReport.ts    (multi-page precedent — closest model)
  src/services/morningBrief/tz.ts              (localPartsIn — verbatim)
  src/services/morningBrief/scheduler.ts       (adapt — swap firing rule)
  src/services/morningBrief/sendBrief.ts       (adapt — swap generator + template)
  src/services/notifications/engine.ts         (dispatch verbatim)
  src/services/notifications/types.ts          (event shape verbatim)
  src/controllers/cronController.ts            (add one new handler `runWeeklyReport`)
  src/routes/cronRoutes.ts                     (add one new route mount)
  prisma/schema.prisma                         (additive: 3 new models + 2 new Merchant relations)
```

### What does NOT exist yet (will land in Phase B)

```
backend:
  prisma/manual-migrations/2026-05-1X_weekly_report_d6.sql
  src/services/weeklyReport/
    weeklyKpis.ts                  (per §6.A — new file outside protected scope)
    narrative.ts                   (per §3.3 — separate Gemini call)
    generator.ts                   (composes WeeklyReport row from KPIs + narrative + insights)
    scheduler.ts                   (Sunday 18:00 firing logic)
    sendWeeklyReport.ts            (renders PDF + email + creates Send row + fires notification)
    emailTemplate.ts               (per §6.E option E2)
    unsubscribeToken.ts            (per §6.G option G1)
  src/services/pdf/templates/weeklyReport.ts          (6-page cinematic template)
  src/controllers/customer/weeklyReportController.ts  (GET list, GET by id, POST regenerate)
  src/controllers/weeklyReportUnsubscribeController.ts
  src/controllers/admin/adminWeeklyReportController.ts (optional — engagement stats)
  src/routes/customer/weeklyReport.ts
  src/routes/weeklyReportUnsubscribe.ts

frontend:
  src/api/v2/weeklyReport.js
  src/pages/v2/reports/ReportsArchivePage.jsx          (/reports/weekly)
  src/pages/v2/reports/ReportViewerPage.jsx            (/reports/weekly/:id — iframe)
  src/components/v2/reports/WeeklyReportBanner.jsx     (dashboard banner — dismissible)
  src/pages/v2/notifications/WeeklyReportPanel.jsx    (settings panel — sibling to D-5 MorningBriefPanel)
  src/i18n/dashboard/weeklyReport.{tr,en,ar}.json
```

---

## 8. Hard-rule compliance checklist

| Rule | Status |
|---|---|
| No infra change without approval | ✅ This phase: zero changes. Phase B as scoped (with §6 recommendations) adds ZERO new deps and uses Railway dashboard only for cron registration. |
| `merchantId` everywhere, NOT `companyId` | ✅ All schema and controller proposals translate the spec's `companyId / userId` to `merchantId`. |
| No mods to `aiBriefController.ts` / `merchantSnapshot.ts` / KPI logic | ⚠️ §6.A surfaces this — recommended A1 keeps protected files untouched by duplicating ~200 lines of KPI aggregation in a sibling module. A2/A3 require explicit approval. |
| Plain JSX + inline styles + design tokens — no Tailwind/TS/shadcn | ✅ All frontend proposals follow the existing `MorningBriefPanel.jsx` + `UnsubscribePage.jsx` patterns. |
| All commit messages in English | ✅ Will follow. |
| Strict micro-commits | ✅ Phase B sequence in spec §"Commit Sequence" is a 14-commit plan; will follow. |
| Stop on unexpected output | ✅ Will follow. |

---

## 9. Phase B readiness

Phase A is complete. Phase B is blocked on Mehmet's answers to the 7 questions in §6:

| Decision | Recommended | Impact if changed |
|---|---|---|
| **6.A** WoW KPI deltas | A1 (new sibling `weeklyKpis.ts`) | A2/A3 require approval to touch protected files |
| **6.B** PDF storage | B1 (on-demand re-render) for V1; upgrade to B2 if needed | B2 needs schema field; B3 needs Railway volume; B4 is blocked by hard rule |
| **6.C** Schema names | `WeeklyReport`, `WeeklyReportSubscription`, `WeeklyReportSend` (all `merchantId`) | Names final; only collision-free option |
| **6.D** PDF viewer | D1 (iframe) | D2 needs new dep approval |
| **6.E** Email template | E2 (dedicated template, mirrors D-5) | E1 couples weekly with D-3 share chrome |
| **6.F** Notification severity | F1 (reuse `SHARE_EVENT`) | F2 needs schema additive |
| **6.G** Unsubscribe token | G1 (new `weekly-report-unsub` namespace) | G2 touches D-5 token shape |

Once Mehmet confirms the picks above, Phase B proceeds autonomously per the spec's commit sequence (translating `companyId/userId` → `merchantId` throughout).

---

**Phase A — DONE. Awaiting review.**
