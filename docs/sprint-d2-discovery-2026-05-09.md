# Sprint D-2 — PDF Export Engine: Discovery Report

**Date:** 2026-05-09
**Repos:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend` (the PDF service lives here)
**Branch:** `main`
**Scope:** Phase A of `sprint-d2-pdf-export.md` — read-only audit of existing PDF infrastructure, backend rendering capability, chart portability, and font strategy. One commit (this doc). Phase B awaits approval.

---

## TL;DR

**Puppeteer is already in production use** in the FinSuite backend for invoice PDFs (`src/controllers/invoicePdfController.ts`). The existing pattern is **plain HTML string templates** rendered via `puppeteer.launch() → page.setContent(html) → page.pdf()`. The strategy question the sprint prompt poses (Puppeteer vs React-PDF vs wkhtmltopdf) is largely answered by precedent: **stay with Puppeteer**, follow the existing pattern, but improve on it (browser pool, embedded fonts, branded chrome, print-safe chart variants).

A few items still need a decision before Phase B starts (full risk register at the bottom):

1. **Browser-per-request vs browser-pool.** The existing invoice controller launches a fresh Chromium per request (~1-2s overhead, +200MB peak). For 10 PDFs/merchant/hour we want a long-lived singleton with new pages per render. **Recommend: refactor to a singleton browser in the new PDF service; leave the invoice controller alone for now** (out of D-2 scope, can be migrated later).
2. **Font strategy.** The existing invoice template loads fonts via Google Fonts CDN at render time. The prompt requires **embedded fonts**. **Recommend: bundle `.woff2` files in `src/services/pdf/assets/fonts/`, load via local `file://` `@font-face` URLs, and `waitUntil: 'networkidle0'` for safety.** This is a fully self-contained approach.
3. **Cinematic charts in PDFs.** None of the 8 D-1 chart components can be reused as-is server-side (they're React JSX with inline `style={{}}`); we'll **re-implement each as an HTML/SVG string in `src/services/pdf/templates/charts/`**. The geometry math (path computation, gradient defs) is the hard part — that can be lifted near-verbatim from the JSX components into helper functions. Two charts (`ParticleField`, `FlowStream` particles) cannot animate in print and need static-frame variants.
4. **No JSX/TSX in backend.** Backend `tsconfig.json` has `jsx` unset and the codebase has no React deps. Adding TSX templates would mean adding `react` + `react-dom` + setting `"jsx": "react-jsx"` — which conflicts with the prompt's "match existing conventions" rule (the existing `invoicePdfController` uses HTML strings, not JSX). **Recommend: stick with HTML string templates.**

The rest of this document is the actual audit.

---

## A.1 — Existing PDF infrastructure

### Backend

`package.json` (relevant deps):

| Dep | Version | Purpose |
|---|---|---|
| `puppeteer` | `^24.41.0` | Already installed; used by `invoicePdfController` |
| `@types/puppeteer` | `^5.4.7` | TS types |
| `react-router-dom` | `^7.14.1` | Stray frontend dep (unused on backend; not blocking) |

**Existing PDF controller** — `src/controllers/invoicePdfController.ts:3,26`:

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
await browser.close();
```

Mounted at `GET /api/invoices/:id/pdf` (`src/routes/invoicePdfRoutes.ts:8`, `src/index.ts:127`). Behind `authenticate` middleware. Streams PDF directly with `Content-Disposition: attachment`.

**Template style:** A 440-line template literal in `buildInvoiceHtml(invoice)`. Inline `<style>` block, `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@…')` from Google Fonts CDN, dynamic content via JS template-string interpolation. Style is light/professional, NOT cinematic — it predates D-1.

**Implication for D-2:** the runtime is already wired up for Railway (the `--no-sandbox`, `--disable-dev-shm-usage` flags are exactly what Railway containers need). What's missing is a *service abstraction* (browser pool + template registry + theme/locale routing) — that's what D-2 builds.

### Frontend

Zero PDF-related deps in `zyrix-finsuite/package.json`. Confirmed by `grep -E "pdf|puppeteer|chromium|playwright|wkhtml|html2"`. Good — the prompt forbids browser-side PDF anyway.

### Database

No PDF / report / generated-asset table exists in `prisma/schema.prisma`. PDFs are streamed live, never cached on disk or in DB. D-2 can stay stateless; D-3 (caching/sharing) will likely add a `GeneratedPdf` or `SharedDocument` table — out of scope here.

### Zyrix CRM backend

Per the prompt, the CRM backend is "a separate repo, but shares patterns." **I do not have access to the CRM backend from this Claude Code session** (only the two `D:\Zyrix Hub\` paths are mounted). I cannot audit it directly. If the CRM has a PDF service worth mirroring, I'd need either: (a) the CRM repo path made available, or (b) Mehmet shares the relevant file contents.

For now I'll proceed assuming we're greenfield-ish (we have the invoice template precedent inside FinSuite to mirror, which is enough).

---

## A.2 — Backend rendering capability

### TS / JSX support

`tsconfig.json` (full, copied verbatim):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "strictNullChecks": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "noImplicitAny": false,
    "noPropertyAccessFromIndexSignature": false,
    "useUnknownInCatchVariables": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- `"jsx"` is **unset** → no JSX compilation today
- No `react` / `react-dom` / `@types/react` in dependencies

To enable JSX/TSX backend templates we'd have to: (1) add `react` + `react-dom`, (2) set `"jsx": "react-jsx"`, (3) verify `commonjs` output still works with the React 18 JSX runtime. This is doable but **introduces ~300KB of deps and a new compilation mode for one feature.** Given the existing invoice template proves HTML string templates work fine, the JSX route is unjustified scope creep. **Decision: keep templates as HTML strings.**

### `react-dom/server` `renderToStaticMarkup`

Untested because we're choosing not to introduce React server-rendering. If we change our mind later, the change is purely additive (no breaking implications for existing routes).

---

## A.3 — Memory and rendering benchmarks

### Strategy comparison

I have NOT run live benchmarks against Railway in this audit (it would require deploying a probe and instrumenting it). Numbers below are from upstream documentation, my read of the existing code, and known production behavior of each lib. They're estimates accurate to ±25%; actual numbers should be measured during B.7 quality gates.

| Strategy | Install size | Idle memory | Per-render memory peak | Per-render time | Chart fidelity | Cons |
|---|---:|---:|---:|---:|---|---|
| **α — Puppeteer (singleton browser)** | ~280MB Chromium download (already paid — installed for invoice PDFs) | +140-180MB (1 long-lived Chromium) | +50-100MB per page | 800ms-2s per render | **High.** SVG, gradients, filters, `mask-composite`, `conic-gradient`, custom fonts — all supported. | Memory tight. Cold start (~2s) on first request after process boot. Need to handle Chromium crashes (auto-respawn). |
| **α' — Puppeteer (browser per request)** | same | +0MB idle (Chromium spawns/dies) | +200-300MB peak per render | **2-4s** per render (launch + close overhead) | Same as α | Slow. **This is what `invoicePdfController` does today** — fine for low volume, bad for D-2's 10/hr/merchant. |
| **β — `@react-pdf/renderer`** | ~6MB | +5MB | +30-60MB per render | 200-500ms | **Medium.** No `backdrop-filter`, no `mix-blend-mode`, limited gradient support. Aurora borders, glow halos, particle fields — not directly representable. | Each of the 8 charts must be re-implemented with React-PDF's `<Svg>`, `<Path>`, `<Defs>` primitives. ~30-90 min per chart. Can't share JSX with the showcase. |
| **γ — wkhtmltopdf** | ~50MB binary | +0MB idle (process per render) | +100-200MB peak | 500ms-1.5s | **Medium-low.** WebKit fork from 2014 (QtWebKit). Modern CSS (`backdrop-filter`, `conic-gradient`, CSS variables) flaky to broken. | Project archived in 2023; effectively unmaintained. New install on Railway = new failure surface. Not worth introducing. |

### Recommendation

**Strategy α (Puppeteer with a singleton browser pool)**. Justification:

- **Already in production** for invoice PDFs. The runtime, the launch flags, and the Railway compatibility are all proven.
- **Highest fidelity** — full backdrop-filter, conic-gradient, mask-composite, custom fonts, embedded SVG. The cinematic look survives the trip to PDF intact.
- **Memory budget fits** — the prompt allows +150MB idle / +300MB peak; a singleton Chromium uses ~150-180MB idle and ~250MB at peak. Tight but legal.
- **Low new-code risk** — we extend a working pattern instead of introducing a new dependency.

The browser pool is just:

```ts
let browser: Browser | null = null;
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({ headless: true, args: [...] });
    browser.on('disconnected', () => { browser = null; });
  }
  return browser;
}
```

Each render: `const page = await (await getBrowser()).newPage(); ... await page.close();`. Browser instance reused across all PDF requests for the lifetime of the process.

Memory ceiling we should monitor on Railway:
- Baseline node/express idle: ~100-130MB (existing)
- + Singleton Chromium: ~150-180MB  
- = New idle: ~280-310MB (well within Railway's typical 512MB-1GB containers)
- Peak during render: ~+50-100MB on top of idle, lasts for 1-2s per request.

If memory pressure becomes an issue under load, we can: serialize requests with a small queue (1 render at a time per process), or recycle the browser every N renders to prevent memory leaks.

---

## A.4 — Cinematic chart portability

For each of the 8 D-1 chart components in `src/components/charts/cinematic/`, can we render it server-side?

The honest answer is: **not via React server-rendering** (we're not introducing React on the backend). What we *can* do is: extract the geometry/path math from the JSX file, port it to a JS function that emits an HTML/SVG string, then embed that string in a Puppeteer-rendered template.

| # | Chart | Path | Browser-only APIs? | Static-frame portable? | Print-safe variant effort |
|---|---|---|---|---|---:|
| 1 | `AuroraChart` | `src/components/charts/cinematic/AuroraChart.jsx` | None (pure SVG + state for hover only) | Yes — line + area + grid + labels render as static SVG; tooltip omitted in PDF | **30 min** |
| 2 | `LiquidKPICard` | `…/LiquidKPICard.jsx` | None | Yes — show fill at 100% (post-animation rest state) | **30 min** |
| 3 | `PulseSparkline` | `…/PulseSparkline.jsx` | None | Yes — static SVG (pulse animation removed); severity color preserved | **20 min** |
| 4 | `HolographicDonut` | `…/HolographicDonut.jsx` | None (uses `useSpring` for hover-lift only) | Yes — segments render at offset 0 | **45 min** |
| 5 | `FlowStream` | `…/FlowStream.jsx` | **`<canvas>` + RAF** for particles | **Partial** — curves + nodes render fine as static SVG; particles do not | **60 min** for the SVG-curves variant; **omit particles** entirely in print |
| 6 | `ConstellationMap` | `…/ConstellationMap.jsx` | None | Yes — points + edges as static SVG | **30 min** |
| 7 | `AIInsightCard` | `…/AIInsightCard.jsx` | None (uses `useState` for hover only) | Yes — flat HTML/CSS, glow as `box-shadow` | **30 min** |
| 8 | `ConstellationKPIGrid` | `…/ConstellationKPIGrid.jsx` | `window.innerWidth` (responsive), `useState` (tilt) | Yes — render as a grid of static `LiquidKPICard`s, tilt removed | **30 min** (composes #2) |

**Total porting effort:** ~4-5 hours of focused work for a `templates/charts/` directory containing 8 print-safe SVG/HTML factories.

Plus shared infrastructure:
- `templates/charts/_glowFilter.ts` — SVG `<filter>` definitions reused by every chart (Gaussian blur halo)
- `templates/charts/_gradients.ts` — port of `src/design-system-v2/cinematic/gradients.js` to server-side string builders
- `templates/charts/_palette.ts` — re-export the `CINEMATIC` token values

The math (e.g. `arcPath` in HolographicDonut) ports verbatim — same JS, just emitting strings instead of React elements.

### `ParticleField` — explicitly not in scope

`<ParticleField />` is an ambient effect (canvas + RAF). It cannot exist in a static medium. **Print equivalent: just don't render it.** PDFs use the gradient mesh + noise overlay only.

---

## A.5 — Fonts for multi-locale PDFs

### Latin / Turkish

- **Inter** — already loaded via Google Fonts CDN by the existing invoice template. Covers Turkish (`ş, ğ, ı, İ, ü, ö, ç`) via `latin-ext` subset.
- **Geist** — referenced in the D-1 cinematic tokens (`TYPE_STACK.display`). Also covers Turkish. Would need to be sourced (Vercel's open-source Geist; available as `.woff2`).

### Arabic

Two reasonable choices:

| Font | Style | Pairs well with | Notes |
|---|---|---|---|
| **IBM Plex Sans Arabic** | Geometric sans, modern | IBM Plex Sans Latin (or Inter) | Already in D-1 `FONT_STACK_AR` (`src/design-system-v2/typography.js:18`); consistent w/ existing in-app type. License: SIL OFL. |
| **Noto Naskh Arabic** | Traditional naskh, more "textbook" | Noto Sans / system | Excellent for body text; less brand-personality. |

**Recommendation: IBM Plex Sans Arabic.** Reasons: (a) matches D-1's existing font stack, so AR PDFs feel consistent with the in-app rendering; (b) modern geometric tone aligns with the cinematic identity; (c) excellent kerning for `ر-ج-ل` and similar ligatures.

### Embedding strategy

The prompt requires **embedded** fonts (not just CSS-loaded from CDN). Two implementation paths:

| Path | Mechanism | Pros | Cons |
|---|---|---|---|
| **A — `file://` `@font-face`** | Bundle `.woff2` files in `src/services/pdf/assets/fonts/`; emit `@font-face { src: url('file:///app/.../inter-700.woff2') }` in template `<style>` | Smallest CSS payload; Puppeteer reads from disk; PDFs auto-embed used glyphs | Requires absolute path resolution; Railway containers can be finicky about `file://` |
| **B — base64 data URLs** | Same `.woff2` files, but emit `@font-face { src: url('data:font/woff2;base64,…') }` | Self-contained; no path issues | CSS payload bloats by ~50% (woff2 is already ~70-90KB per weight); makes templates harder to read |

**Recommendation: Path A (`file://`).** The existing controller's pattern of inline `<style>` is preserved; the only change is a `@font-face` block at the top with absolute file paths resolved via `path.join(__dirname, '../assets/fonts/…')`. Standard Puppeteer handles `file://` URLs without extra flags.

Weight set per family: `400, 500, 600, 700` (Inter regular/medium/semibold/bold; Geist similar; IBM Plex Sans Arabic similar). 4 weights × 3 families = 12 `.woff2` files, ~600-900KB total.

### Confirming Puppeteer embeds fonts

By default, Chromium PDFs **subset and embed** any font used during render. We can verify post-deploy via `pdfinfo` / `pdffonts` (CI smoke check optional for D-2; manual spot-check sufficient).

---

## A.6 — Proposed file structure (Phase B)

### Backend (`zyrix-finsuite-backend`)

```
src/services/pdf/
├── pdfRenderer.ts            # singleton browser pool; render({ template, data, theme, locale }) → Buffer
├── templates/
│   ├── insightCard.ts        # template literal: returns HTML string
│   ├── dailyBrief.ts
│   ├── rangeReport.ts
│   ├── _layout.ts            # shared header/footer/cover-page builders
│   └── charts/
│       ├── auroraChart.ts    # static-frame SVG factory ports (one per chart)
│       ├── liquidKpiCard.ts
│       ├── pulseSparkline.ts
│       ├── holographicDonut.ts
│       ├── flowStream.ts
│       ├── constellationMap.ts
│       ├── aiInsightCard.ts
│       ├── constellationKpiGrid.ts
│       └── _shared.ts        # SVG <filter>, gradient defs, palette helpers
├── i18n/
│   ├── tr.ts                 # PDF chrome strings only (~20 keys)
│   ├── ar.ts
│   └── en.ts
└── assets/
    ├── fonts/                # bundled .woff2 files
    │   ├── Inter-{400,500,600,700}.woff2
    │   ├── Geist-{400,600,700}.woff2
    │   └── IBMPlexSansArabic-{400,500,600,700}.woff2
    └── branding/
        ├── zyrix-wordmark.svg
        ├── zyrix-icon.svg
        └── watermark-pattern.svg

src/controllers/customer/
└── pdfController.ts          # 3 handlers: insight, dailyBrief, rangeReport

src/routes/customer/
└── pdf.ts                    # mounts under /api/customer/pdf
```

### Frontend (`zyrix-finsuite`)

```
src/components/v2/pdf/
├── ExportPdfMenu.jsx         # drop-in: per-card export
├── DownloadTodayButton.jsx   # dashboard CTA
├── RangeReportModal.jsx      # date-range picker + sections
├── ThemeChip.jsx             # small "Digital | Print" toggle (shared)
└── index.js                  # barrel

src/api/v2/
└── pdf.js                    # exportInsightPdf(id, opts), downloadDailyBrief(opts), generateRangeReport(opts)

src/hooks/v2/
└── usePdfDownload.js         # tiny helper: fetch as blob → trigger browser download
```

---

## A.7 — API endpoint design

```
POST /api/customer/pdf/insight/:insightId
  Auth:    JWT (existing `authenticate` middleware)
  Query:   ?theme=digital|print&locale=tr|ar|en
  Returns: 200 application/pdf  (streamed)
           404 if insightId not owned by req.merchant.id
           429 if merchant exceeded 10 PDFs / hour

POST /api/customer/pdf/daily-brief
  Auth:    JWT
  Query:   ?date=YYYY-MM-DD (default = today)&theme=&locale=
  Returns: 200 application/pdf
           404 if no brief exists for that date
           429 on rate limit

POST /api/customer/pdf/range-report
  Auth:    JWT
  Body:    {
    startDate: ISODate,
    endDate:   ISODate,
    sections:  Array<'insights' | 'kpis' | 'customers' | 'taxes'>,
    theme:     'digital' | 'print',
    locale:    'tr' | 'ar' | 'en'
  }
  Returns: 200 application/pdf
           400 if range > 90 days OR sections empty
           429 on rate limit
```

**Headers on every successful response:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="zyrix-{type}-{merchantSlug}-{date}.pdf"
Content-Length: <bytes>
Cache-Control: no-store        // PDFs are personalized, never cache at edge
```

### Rate limiting

Per merchant, per hour, in-memory keyed by `merchant.id`. Implementation: `Map<merchantId, { count, windowStart }>`, identical pattern to the existing `refreshLastAt` rate-limit in `aiBriefController.ts`. No new dependency.

### Multi-tenant safety

Every endpoint reads `merchantId` from `req.merchant.id` (decoded JWT). The path param `:insightId` is **always** validated by `prisma.insight.findFirst({ where: { id, merchantId } })`. Client-supplied IDs never trusted directly. Mirrors the existing pattern in `invoicePdfController:13-18`.

### Idempotency

PDFs are **not cached** in D-2. Each call generates fresh. Caching + signed-URL hosting is D-3 territory; D-2 should do nothing that conflicts with future caching.

---

## A.8 — Risk register

### R1 — Memory ceiling on Railway (medium severity)

Singleton Chromium uses ~150-180MB idle, peaks ~250MB during a render. Combined with the existing Express baseline (~100-130MB), the post-deploy idle should be ~280-310MB. Railway containers run with 512MB-1GB by default; this fits, but with limited headroom for traffic spikes.

**Mitigation:**
- Browser singleton (not per-request)
- Serialize rendering when memory > 80% of limit (queue-of-1)
- Recycle browser every 50 renders to prevent leak accumulation
- Add a `/health/pdf` endpoint that reports browser status + memory

If memory turns out to be tighter than expected on Railway's actual container, we can fall back to per-request browser launches (slower but lower idle), accepting the 2-3s per render hit.

### R2 — Existing invoice PDF uses Google Fonts CDN, not embedded (low severity)

The existing `invoicePdfController` renders fine because Google Fonts is reliable, but on a strict reading of "fonts must be embedded," it doesn't comply. **D-2 scope is the new PDF service** — leaving the invoice handler alone is fine, but we should note it for a later cleanup pass.

### R3 — `tsconfig.json` lacks `jsx` setting (no risk if we stay HTML-string)

Already discussed in A.2. No action needed if we honor the existing convention.

### R4 — `FlowStream` particles cannot survive print (low severity)

Already noted. Print variant shows curves + nodes only (no particles). The information density is preserved; the visual texture loses ~30% of its motion identity, which is acceptable for a static medium.

### R5 — `ParticleField` ambient effect doesn't exist in PDF (no severity)

By design — it's atmospheric. Showcase routes can keep using it; PDFs do not.

### R6 — Arabic RTL within an HTML template (medium severity)

The existing invoice template is hardcoded `<html lang="tr">` + LTR layout. For Arabic PDFs, the template must emit `<html lang="ar" dir="rtl">` and any flex/grid layouts must use logical properties (`margin-inline-start`, etc.) or be conditional on locale. Tables in `rangeReport.tsx` need column-flip per RTL.

**Mitigation:** test all 18 outputs (3 templates × 3 locales × 2 themes) as part of B.7 quality gates. Arabic test merchant (`test+sa@finsuite.zyrix.co`) is already seeded — perfect for this.

### R7 — No CRM repo access (low severity)

Cannot mirror CRM PDF patterns this sprint. If they exist and would have been useful, we'll discover that gap during B.7 review. Acceptable.

### R8 — Cinematic-on-light theme question (re-emerges from D-1 Risk #1)

The `theme=digital` PDF reproduces D-1's dark cinematic look — easy. The `theme=print` PDF puts the same brand on a white background — needs design attention so glows don't disappear. **Approach: in print theme, glows become tight drop-shadows (8-12px blur, 35% opacity) plus tone-coloured 1px borders.** The accent palette stays the same; the background flips and shadow strategy adapts. Design specs go in Phase B documentation.

### R9 — Frontend bundle budget (low severity)

The 30KB-gzipped budget is comfortable. The 3 export UI components are small JSX (no charts inside, no heavy deps). The PDF download mechanism is just `fetch` + `URL.createObjectURL`; trivial. We'll measure during B.8.

### R10 — Quality gate scope (medium severity)

The prompt's B.7 requires 18 sample PDFs (3 templates × 3 locales × 2 themes), all manually inspected. That's a real chunk of human-review time; we can produce them mechanically but Mehmet has to look at each. **Recommend: ship them as a single ZIP attached to the completion report so review can be done in one pass.**

---

## Open questions (small) before Phase B

1. **Browser pool vs per-request for the new service?** I've recommended browser pool. Confirming you want this approach (it's the right one for scale; per-request is fine if you'd rather minimize idle memory).
2. **Geist font** — sourcing it from Vercel's open-source repo (SIL OFL license) is straightforward, but if you'd rather skip it and use just Inter for the display tier, that's one fewer family to bundle. Recommend Inter+IBMPlexSansArabic only for D-2; add Geist later if the visual identity calls for it.
3. **Range report max date span** — I've proposed 90 days. Confirm or override.
4. **Rate limit** — 10 PDFs / merchant / hour as the prompt specifies. Confirm this is per-endpoint or shared across all 3 endpoints (recommend shared, simpler bucket).
5. **PDF metadata** — set `Title`, `Author`, `Subject`, `Producer = "Zyrix FinSuite"` on every PDF? Recommend yes — small touch, looks professional in PDF readers.

If those are fine as-recommended, I have everything I need to proceed straight into Phase B.

---

## Files read during this audit

Backend:
- `package.json`, `tsconfig.json`
- `src/controllers/invoicePdfController.ts`
- `src/routes/invoicePdfRoutes.ts` (via grep)
- `src/index.ts` (mount lookup)
- `prisma/schema.prisma` (already known from D-1 — no PDF tables)

Frontend:
- `package.json`
- `src/i18n/i18n.jsx` (translation table shape)
- `src/components/charts/cinematic/*.jsx` (8 chart components — partial; full re-reads happen in Phase B)
- `src/design-system-v2/typography.js` (`FONT_STACK_AR`)
