# Sprint D-11 — Localization Switcher + Country-Aware Behavior: Discovery Report

**Date:** 2026-05-10
**Repos audited:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE A COMPLETE — awaiting Mehmet's review of decisions in §10 before Phase B**

---

## TL;DR

Three structural findings reshape the spec's 22-commit plan:

1. **The schema work is already done.** `Merchant` already has `language: Language @default(TR)`, `country: String @default("TR")`, `currency: Currency @default(TRY)`, `timezone: String @default("Europe/Istanbul")`. The `Language` enum exists (TR / AR / EN). The `Currency` enum exists (TRY / SAR / USD / EUR). Test merchants are already correctly tagged: TR test merchant has `(TR, TR, TRY)`, SA test merchant has `(SA, AR, SAR)`. **B.1 (schema migration) collapses to ZERO core-field migrations.** What is genuinely new: a `TaxRateVersion` table for effective-dated rate history, and a few additive fields on `Invoice` for ZATCA Phase 2 (QR TLV, simplified-invoice flag, hash-chain pointer).

2. **`countryProfiles.js` is mature for V1 — TR + SA + 8 GCC/MENA neighbors are already modeled.** Each profile has tax (name, rate, additionalRates), compliance (eInvoice, eInvoiceAuthority), currency (code + symbol + name), dateFormat, weekStart, regions. **What it lacks:** tax-rate VERSIONING (single `rate` field, no effective-date history), ZATCA Phase 2 metadata (cryptographic stamp, QR TLV format, simplified-vs-standard flag), and the e-Fatura threshold (TR; ~5M TRY annual revenue triggers mandatory e-Fatura). The spec's "extend country-profiles.ts or create regulatory-profiles.ts" reduces to an additive extension on the existing file plus a fresh **backend** `services/regulatory/profiles.ts` (currently nonexistent — backend has no country-aware code path).

3. **The Cloudflare CF-IPCountry header is reaching the backend but is consumed in exactly two lines** — `publicShareLinkController.ts:289` and `:416`, both for share-view country tracking. **It is NOT plumbed for login / locale / mismatch detection.** The frontend `useCountry` hook explicitly says "Why timezone, not IP" because the previous IP attempt hit `ipwho.is` (which 403'd from many client networks). For D-11 we add `GET /api/users/me/geo-context` (auth-required) that reads `req.headers['cf-ipcountry']` and returns `{ ipCountry, registeredCountry, language, mismatch }` — the frontend `useCountry` extends its detection chain with this endpoint as the first hop.

The spec's 22-commit Phase B sequence collapses to a tighter ~16 with the recommendations in §10. **Zero new dependencies** as locked (Intl.NumberFormat + Intl.DateTimeFormat cover everything; no dayjs / numbro / luxon). **Zero new env vars.** The only Phase B decision that scales work is §10.I — whether ZATCA Phase 2 ships full Phase 2 XML schema (with TLV QR + crypto stamp placeholder) or just the simplified UBL extension. Recommended: full Phase 2 XML on the merchant's request, deferred live-gateway submission per spec § 7.

---

## 1. Repo geography (recap + D-11-specific)

| Path | Role |
|---|---|
| `D:\Zyrix Hub\zyrix-finsuite\src\i18n\` | Custom-rolled (NOT i18next) i18n: `i18n.jsx` carries the `translations` map + `I18nProvider`; `dashboard/*.{tr,en,ar}.json` carries 24 namespace files (one per surface × 3 langs) |
| `src\utils\countryProfiles.js` | Single source of truth for country profiles (frontend). 10 countries modeled. |
| `src\hooks\useCountry.jsx` | Country detection hook: localStorage → timezone → fallback. NO IP detection (ipwho.is removed). |
| `src\components\LanguageSwitcher.jsx` | Existing TR/AR/EN dropdown component. Currently mounted ONLY on `AdminLoginPage`. |
| `D:\Zyrix Hub\zyrix-finsuite-backend\src\controllers\eFaturaController.ts` | Turkish UBL 2.1 serializer (CustomizationID = TR1.2, ProfileID = TICARIFATURA). Not extensible to ZATCA. |
| `src\controllers\eIrsaliyeController.ts` | Turkish UBL-TR delivery note serializer. |
| `src\services\customer\merchantSnapshot.ts` (PROTECTED) | currency = "TRY" default. Resolver can call this read-only without modifying it. |
| `src\controllers\customer\publicShareLinksController.ts:289,416` | The only two CF-IPCountry consumers in the codebase. |

**Hard-rule reminder:** the spec consistently says "User row" — translate to **Merchant row** per the carry-over rule. There is no separate User model on this codebase; merchant === tenant === user-account. (`MerchantUser` exists but it's a sub-user RBAC model that doesn't carry locale.)

---

## 2. A.1 — i18n infrastructure audit

### 2.1 What exists

`src\i18n\i18n.jsx` (512 lines):
- Hand-rolled `translations` object keyed by `{ TR, AR, EN }` × `nav.* / common.* / invoice.* / dashboard.* / auth.* / personnel.* / tax.* / adminLogin.*` (~150 keys × 3 langs).
- Merges `landingV2.translations` from `landingV2.translations.js` (marketing-side).
- `I18nProvider` resolution chain (lines 442-458):
  ```js
  localStorage.zyrix_lang
    → user.language (from zyrix_user)
    → getLangForCountry(localStorage.zyrix_country)
    → navigator.language
    → 'TR'
  ```
- `setLang()` writes to localStorage and flips `document.documentElement.dir = 'rtl'` for AR. Hot-swap, no reload.
- Exports `useI18n()` hook + standalone `t()` for outside-React use.
- `SUPPORTED_LANGS` has `[{ code: 'TR', flag: '🇹🇷' }, { code: 'AR', flag: '🇸🇦' }, { code: 'EN', flag: '🇬🇧' }]`.

**Already supports D-11 hot-swap + RTL flipping.** No infrastructure rebuild needed.

### 2.2 Dashboard namespace files

`src\i18n\dashboard\*.{tr,en,ar}.json` — 24 files across 8 namespaces (chat, integrations, helpCenter, morningBrief, notifications, weeklyReport, publicShare, etc., plus the marketing-side knowledge-base `help.*.json`). Per-surface, dot-keyed paths. Components currently inline most strings; the JSON files are the translator's source of truth.

For D-11: no new namespaces required if we extend `i18n.jsx` directly with `tax.*` / `country.*` keys (or — cleaner — add `dashboard/locale.{tr,en,ar}.json` for the new mismatch banner + language switcher labels).

### 2.3 LanguageSwitcher already exists

`src\components\LanguageSwitcher.jsx` (64 lines) — TR/AR/EN dropdown with flags, calls `useI18n().setLang()`. **Currently mounted only on `AdminLoginPage.jsx:409`.** Not on customer dashboard layout, not on admin layout. B.7 of the spec ("extract or build LanguageSwitcher") is **already done — just needs mounting**, which is B.8/B.9.

### 2.4 Verdict

**B.7 collapses to zero LOC.** B.8 + B.9 are 2-3 LOC each (one import + one JSX placement). The spec's Layer 3 (3-4 commits) collapses to **1 commit** — a single mount-in-layouts commit covering both customer + admin headers.

---

## 3. A.2 — Merchant schema audit

### 3.1 Current state (Prisma schema lines 362-384)

```prisma
model Merchant {
  ...
  language       Language       @default(TR)         // enum: AR | TR | EN
  currency       Currency       @default(TRY)        // enum: SAR | TRY | USD | EUR
  country        String         @default("TR")
  timezone       String         @default("Europe/Istanbul")
  ...
}
```

`Language` and `Currency` are real enums; `country` is a string (good — accommodates GCC/MENA expansion without migration). `timezone` is also a string (IANA zone names).

### 3.2 What's stored on test merchants

From `prisma/seeds/testMerchants.ts:97-138`:

| Merchant | language | currency | country |
|---|---|---|---|
| TR test (Demir Tekstil A.Ş.) | `TR` | `TRY` | `"TR"` |
| SA test (Al-Fahad) | `AR` | `SAR` | `"SA"` |

**Test merchants are already correctly tagged for D-11.** No backfill needed.

### 3.3 What's missing for D-11

The locked decisions ("Tax rates must be versionable" + "configurable by admin with effective dates") need a new table. Schema additions:

```prisma
// Sprint D-11 — Effective-dated tax rate history per (country, taxName).
// The profileResolver picks the active row at invoice creation time.
// Existing Invoice.vatRate column is preserved as the historical
// snapshot; the version table feeds NEW invoices, not retroactive
// recomputation.
model TaxRateVersion {
  id              String    @id @default(cuid())
  country         String                                       // 'TR' | 'SA' | …
  taxName         String                                       // 'KDV' | 'VAT' | …
  rate            Decimal   @db.Decimal(5, 2)                  // 20.00 / 15.00 / 18.00
  effectiveFrom   DateTime                                     // inclusive
  effectiveTo     DateTime?                                    // exclusive; null = open-ended
  createdBy       String                                       // admin user id (from JWT)
  notes           String?                                      // optional admin note ("KDV raised from 18 to 20 by 2023 reform")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([country, taxName, effectiveFrom])
  @@map("tax_rate_versions")
}
```

Plus optional ZATCA-Phase-2 fields on `Invoice`:

```prisma
// Sprint D-11 — ZATCA Phase 2 fields. All nullable so non-SA merchants
// don't carry them. Existing TR invoices are untouched.
zatcaQrTlv       String?   @db.Text                            // base64 TLV blob
zatcaInvoiceHash String?                                       // Phase 2 hash chain pointer
zatcaIsSimplified Boolean? @default(false)                     // simplified vs standard
```

That's it. **One new table + 3 nullable columns on Invoice.** Idempotent SQL migration matching the D-3..D-10 convention.

---

## 4. A.3 — Tax / currency / regulatory hotspots audit

### 4.1 Frontend `countryProfiles.js` (the good news)

10 countries already modeled with full tax + compliance shape:

| Code | Tax name | Rate | eInvoice | Notes |
|---|---|---:|---|---|
| TR | KDV | 20% | e-Fatura (GİB) | additionalRates [1, 10, 20] |
| SA | VAT | 15% | ZATCA | additionalRates [0, 15] |
| AE | VAT | 5% | FTA | additionalRates [0, 5] |
| EG | VAT | 14% | ETA | additionalRates [0, 5, 10, 14] |
| KW | Tax | 0% | KFAS | (no VAT yet) |
| QA | Tax | 0% | GTA | (no VAT yet) |
| BH | VAT | 10% | NBR | additionalRates [0, 10] |
| OM | VAT | 5% | OTA | additionalRates [0, 5] |
| JO | Sales Tax | 16% | ISTD | additionalRates [0, 4, 10, 16] |
| US | Sales Tax | 0% | Standard | fallback for "Other" |

`VISIBLE_COUNTRIES = ['TR', 'SA', 'AE']` already gates the user-facing dropdown to TR + SA (+ AE for soft-launch readiness). D-11 keeps this — nothing to change.

### 4.2 What's missing in `countryProfiles.js`

| Field | TR needs | SA needs |
|---|---|---|
| `tax.versionedRates: TaxRateVersion[]` | Effective-dated rate timeline | Same shape |
| `regulatory.efaturaRevenueThreshold` | ~5M TRY/year (GİB-mandated) | n/a |
| `regulatory.zatcaPhase` | n/a | `'phase2'` |
| `regulatory.zatcaQrFormat` | n/a | TLV (5-tag) per ZATCA spec |
| `regulatory.zatcaSimplifiedThreshold` | n/a | Below 1000 SAR → simplified invoice |

### 4.3 Backend has zero country awareness

There is **no backend equivalent** of `countryProfiles.js`. Currency hardcodes scattered across:

| File | Line | Hardcoded |
|---|---|---|
| `services/aiCfoVoiceService.ts:158` | `currency: (merchant as any)?.currency \|\| "TRY"` | falls back to TRY |
| `services/bankCsvImportService.ts:239` | `currency: "TRY"` | hard-coded TRY |
| `services/bankProviderRegistry.ts:54` | `currency: "TRY"` | hard-coded |
| `services/bankSyncService.ts:63` | `currency: t.currency \|\| conn.currency \|\| "TRY"` | falls back |
| `services/eIrsaliyeXmlService.ts:70,364` | `currency = "TRY"` (default param) | TR-specific |
| `services/integrations/slack/slashCommandRouter.ts:127,172` | `currency \|\| "TRY"` | falls back |
| Invoice model `vatRate: Decimal @default(20)` | always 20 | TR-specific |

These all use `merchant.currency` correctly when available; the hardcoded "TRY" is only the **fallback** path. For D-11, the resolver fixes the fallback by reading the merchant's profile.

### 4.4 KDV hardcoding (mostly in AI prompts, not logic)

`aiAssistantController.ts` has Turkish-only AI prompt strings about KDV (lines 17, 24, 25, 30, 36, 82, 83, 95, 98). `aiCfoVoiceService.ts:189` mentions KDV in the AI persona. `receiptScanService.ts:63-64` lists "VAT/KDV" in its OCR extraction prompt. **None of these are tax-calculation logic** — they're AI persona scripts. They will continue working for TR merchants. For SA merchants, the AI assistant prompt should switch to VAT/ZATCA terminology when `merchant.country === 'SA'`. Decision §10.O.

The protected file `services/customer/kpiComputations.ts:385` has `kdv_load: async () => EMPTY` (a stub). **Leave untouched per the carry-over hard rule.**

### 4.5 e-Fatura UBL serializer is TR-specific

`eFaturaController.ts:22-58` builds UBL 2.1 with `CustomizationID = TR1.2` and `ProfileID = TICARIFATURA`. **No ZATCA equivalent exists.** ZATCA Phase 2 requires:
- Different UBL `CustomizationID` (`reporting:1.0`)
- Different `ProfileID` (`reporting:1.0`)
- Cryptographic stamp via XAdES (skip live signing in V1; emit a placeholder)
- QR code as TLV-encoded base64 (5 tags: seller name, VAT registration number, timestamp, total amount, VAT amount)
- Simplified vs Standard invoice flag (B2C ≤1000 SAR ⇒ simplified)

**Net new work in B.18.** Estimated: 1 controller (sa-zatca-controller.ts) + 1 service (services/regulatory/zatcaXml.ts) + 1 helper (services/regulatory/zatcaQr.ts) + ~150 LOC.

---

## 5. A.4 — IP geolocation usage map

### 5.1 Where CF-IPCountry is read today

**Two places, both for share-view tracking:**
- `controllers/publicShareLinkController.ts:289` — public `/share/i/:slug` GET handler → records `ShareView.country`.
- `controllers/publicShareLinkController.ts:416` — same handler for the OG-image route.

Both fall back to `x-vercel-ip-country` if CF-IPCountry is missing.

### 5.2 Where it is NOT read

- Login / signup flows — `RegisterPage` uses `useCountry` (timezone-based) for the country defaulter; no backend signal.
- Frontend i18n bootstrap — `i18n.jsx:442-458` uses localStorage + `getLangForCountry(localStorage.zyrix_country)` + browser language. No CF.
- `useCountry` hook — explicitly removed `ipwho.is` due to 403s; uses `Intl.DateTimeFormat().resolvedOptions().timeZone` for offline detection.

### 5.3 What D-11 needs

A new auth-required endpoint:

```
GET /api/users/me/geo-context
  →  {
       ipCountry:         string | null,   // 'TR' / 'SA' / 'US' / null
       registeredCountry: string,          // from Merchant.country
       language:          string,          // from Merchant.language
       mismatch:          boolean          // ipCountry && ipCountry !== registeredCountry
     }
```

Frontend `useCountry` adds this as the FIRST step of its detection chain (before timezone), but only when authenticated. Unauthenticated users keep the timezone path (login / signup don't have a JWT yet).

### 5.4 Mismatch UX

Decision §10.H: subtle banner once per session ("You're connecting from {ipCountry} but your account is in {registeredCountry} — this is normal if you're traveling. [Report] [Dismiss]"). Stored in `sessionStorage` so it doesn't reappear on every navigation.

---

## 6. Architectural shape

### 6.1 Where the resolver lives

**Backend:** `src/services/regulatory/profileResolver.ts`. Takes `(merchantId, asOf?: Date)` → returns:

```ts
interface ResolvedProfile {
  country:       'TR' | 'SA' | …;
  countryName:   { tr, en, ar };
  language:      'TR' | 'AR' | 'EN';
  currency:      'TRY' | 'SAR' | …;
  currencySymbol: string;
  dateFormat:    string;
  weekStart:     'monday' | 'sunday';
  tax: {
    name:        'KDV' | 'VAT' | …;
    rate:        number;                 // resolved at asOf via TaxRateVersion lookup
    additionalRates: number[];
  };
  regulatory: {
    eInvoiceSystem: 'e-Fatura' | 'ZATCA' | …;
    eInvoiceAuthority: string;
    eFaturaThreshold?: number;           // TR only; null for others
    zatcaPhase?: 'phase1' | 'phase2';    // SA only
    zatcaSimplifiedThreshold?: number;   // SA only
  };
  intl: {
    numberFormat: { decimal: '.' | ','; thousands: '.' | ',' | ' ' };
    locale:       string;                // 'tr-TR' / 'ar-SA' / 'en-US' (for Intl APIs)
  };
}
```

The `tax.rate` field is dynamic — `profileResolver(merchantId, invoiceDate)` looks up the active `TaxRateVersion` row for `(country, taxName, effectiveFrom <= invoiceDate < effectiveTo OR effectiveTo IS NULL)`. If no version row exists, falls back to the static `countryProfiles[country].tax.rate` (the historical default).

### 6.2 Where the resolver is called

| Call site | Use |
|---|---|
| `invoiceController.create` | Stamp `vatRate` + `currency` on the new invoice based on resolver(`invoice.issueDate`) |
| `eFaturaController.buildEFaturaXML` | Pull currency code (already does — `invoice.currency \|\| "TRY"`) |
| New ZATCA controller | Build SA-specific XML with the resolver's regulatory bundle |
| `aiCfoVoiceService` | Switch prompt persona based on resolver.country |
| `aiAssistantController` | Same |
| `slashCommandRouter` | Currency formatting (already partly wired — uses `merchant.currency`) |
| Morning brief / weekly report email templates | Currency / date formatting |

The protected files (`aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`) **stay byte-for-byte unchanged.** The resolver is a public read-only function those files can pass through without edits — but they don't need to call it; the change happens in the surrounding services.

### 6.3 Frontend mirror

`src/utils/countryProfiles.js` already has the static profile data. For D-11 we add:
- `getResolvedProfile(merchant, asOf?)` that reads merchant.country and applies effective-dated overrides from a context-fetched `TaxRateVersion` cache (loaded once at app boot via `GET /api/regulatory/tax-rates`).
- A new `<RegulatoryProvider>` context wraps the dashboard subtree so child components can do `const { profile } = useRegulatory()` rather than threading merchant prop everywhere.

### 6.4 Backwards compatibility

**Critical hard-rule: existing invoices keep rendering correctly.**

The mechanism: `Invoice.vatRate` and `Invoice.currency` are stored on the row at creation time. The resolver only feeds NEW invoices. Old TR invoices stay at 20% (or 18% if pre-2023), old SA invoices stay at 15%. PDFs render from the row, not the live profile.

Edge cases:
- An invoice created before D-11 has no `zatcaQrTlv` / `zatcaInvoiceHash` / `zatcaIsSimplified`. Those are nullable. SA PDF rendering checks `if (zatcaQrTlv) renderQr() else renderLegacyFooter()`. Pre-D-11 SA invoices keep their old footer.
- An invoice created before D-11 doesn't carry a `regulatory.eInvoiceSystem` field. Resolver returns the historical default for the merchant's country (e-Fatura for TR, ZATCA for SA).

---

## 7. The "language ≠ country" decoupling — already enforced by schema

`Merchant.language` and `Merchant.country` are **already independent fields with independent enums.** The codebase has not made the mistake of deriving one from the other, except as a **default during signup** (per `useCountry` + `getLangForCountry` — which is the correct shape).

| Scenario | Current behavior | D-11 confirms |
|---|---|---|
| Arabic-speaking SME in Istanbul | `country='TR', language='AR'` | KDV terminology + TRY + Arabic UI |
| English-speaking expat in Riyadh | `country='SA', language='EN'` | VAT terminology + SAR + English UI |
| Turkish trader expanding to Saudi | Today: must change country (loses TR data integrity) | D-11 V2: `merchant.secondaryCountries: String[]` (deferred) |

**No decoupling work required at the data layer — it already exists.** What D-11 enforces:
- The resolver reads `country` for tax / currency / e-invoice system.
- The i18n provider reads `language` for UI strings.
- Neither field falls back to the other after V1 default-during-signup.
- The Slack / morning brief / weekly report / chat outputs already honor `merchant.language`; D-11 verifies they ALSO read `merchant.currency` from the resolver instead of hardcoding "TRY". Half-done already (per §4.3).

---

## 8. Hard-rule compliance preview

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero new env vars, zero npm deps, zero Dockerfile / nixpacks / Node version changes. Single new database table (`TaxRateVersion`) + 3 nullable columns on Invoice; idempotent migration. |
| **`merchantId` everywhere** | ✅ The spec says "User row" but Merchant is the tenant boundary — translate throughout. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`** | ✅ Resolver lives outside; protected files keep their existing read-only access to merchant fields. |
| **Plain JSX + inline styles + design tokens** | ✅ Mismatch banner + admin regulatory page follow D-1..D-10 conventions. |
| **All commit messages in English** | ✅ |
| **Strict micro-commits** | ✅ See §12 (~16 commits). |
| **Stop on unexpected output** | ✅ |
| **Decoupling is sacred** | ✅ Schema already enforces it; V1 doesn't introduce a mistake. |
| **Backwards compatible** | ✅ Existing invoices read their stored vatRate/currency; resolver only feeds new invoices. |
| **Versionable tax rates** | ✅ `TaxRateVersion` table. |
| **Zero new dependencies** | ✅ Intl.NumberFormat + Intl.DateTimeFormat cover everything. |
| **Slack/email/PDF respect language AND country independently** | ✅ Audit confirms language is wired; currency wiring needs the resolver replacing `\|\| "TRY"` fallbacks. ~5 LOC each in 7 files. |

---

## 9. Files to be added in Phase B

### Backend (~9 files, ~600 LOC)

```
prisma/manual-migrations/2026-05-1X_d11_localization.sql

src/services/regulatory/
├── profiles.ts                          — backend mirror of frontend countryProfiles (TR + SA full)
├── profileResolver.ts                   — resolveProfile(merchantId, asOf?) + tax-rate version lookup
├── zatcaXml.ts                          — Phase 2 UBL builder (CustomizationID reporting:1.0)
└── zatcaQr.ts                           — TLV encoder for the ZATCA QR code (zero deps)

src/controllers/
├── geoContextController.ts              — GET /api/users/me/geo-context (auth-required)
└── admin/
    └── adminTaxRatesController.ts       — admin CRUD on TaxRateVersion (audit-logged)

src/routes/
├── customer/geoContext.ts               — mount point (mounted under /api/users/me)
└── admin/                               — extend admin/index.ts with /tax-rates routes

src/types/regulatory.ts                  — TypeScript interfaces shared between services
```

### Frontend (~6 files, ~300 LOC)

```
src/components/v2/feedback/
└── GeoMismatchBanner.jsx                — subtle banner shown once per session

src/contexts/
└── RegulatoryContext.jsx                — boot-fetches resolved profile + tax-rate cache; exposes useRegulatory()

src/api/v2/
├── regulatory.js                        — getResolvedProfile + getMyGeoContext clients
└── (admin) src/api/admin/taxRates.js    — admin CRUD client

src/pages/admin/
└── compliance/
    └── TaxRatesPage.jsx                 — /admin/regulatory-profiles editor with effective-date timeline

src/utils/
└── intlFormatters.js                    — formatCurrency / formatDate / formatNumber wrappers around Intl APIs
```

### Translation files

`src/i18n/dashboard/locale.{tr,en,ar}.json` — new namespace for D-11 strings (mismatch banner, language switcher tooltips, regulatory editor labels). ~25 keys × 3 langs.

---

## 10. Open decisions — BLOCKERS for Phase B

15 decisions; the recommendations together yield zero new infra and the compressed ~16-commit Phase B.

### 10.A — Schema: extend Merchant or new locale-prefs table?

| Option | Trade-off |
|---|---|
| **(A1) Use existing `Merchant.{language, country, currency, timezone}` — NO migration** (recommended) | Zero schema risk; fields already there; tests already use them. |
| (A2) New `MerchantLocalePreference` table | Pointless — would just duplicate existing columns. |

**Recommended: A1.** Already done by previous sprints.

### 10.B — Backend regulatory profiles location

| Option | Trade-off |
|---|---|
| **(B1) New `src/services/regulatory/profiles.ts` mirroring the frontend file** (recommended) | Single backend source of truth; can be JSON-imported by services without browser-only runtime. ~120 LOC for TR + SA. |
| (B2) Reuse the frontend `countryProfiles.js` via shared package | Adds package surface area; not justified at 2-merchant scale. |

**Recommended: B1.**

### 10.C — Tax-rate versioning shape

| Option | Trade-off |
|---|---|
| **(C1) `TaxRateVersion(country, taxName, rate, effectiveFrom, effectiveTo?)`** (recommended) | Allows multiple concurrent taxes per country (e.g. TR has KDV [%1, %10, %20]); future-proof for new tax types. |
| (C2) `TaxRate(country, rate)` with one row per country | Doesn't model TR's multi-rate KDV cleanly. |

**Recommended: C1.** Resolver picks the row with `effectiveFrom <= invoice.date AND (effectiveTo IS NULL OR invoice.date < effectiveTo)`.

### 10.D — Default-locale resolution order

| Option | Trade-off |
|---|---|
| **(D1) localStorage → user.language (DB) → CF-IPCountry → timezone → browser → 'TR'** (recommended) | Adds CF-IPCountry as a step BETWEEN user-saved and timezone. Authenticated users get the geo-context endpoint; unauth users keep timezone path. |
| (D2) Keep current chain (no CF-IPCountry) | Misses the spec's "language detection from CF-IPCountry" requirement. |

**Recommended: D1.**

### 10.E — Language change UX

| Option | Trade-off |
|---|---|
| **(E1) Hot-swap (no reload)** (recommended; current behavior) | Already works via `setLang()` flipping `document.documentElement.dir`. |
| (E2) Force reload on switch | Conservative but worse UX. |

**Recommended: E1.** No code change.

### 10.F — Admin language default

| Option | Trade-off |
|---|---|
| **(F1) Admin pages default to EN; per-admin override stored on Admin row** (recommended) | Ops staff often work in EN; matches the existing AdminLoginPage convention. |
| (F2) Admin uses customer's language | Wrong scope — admin is internal. |
| (F3) Admin always TR | Excludes English-speaking ops. |

**Recommended: F1.** Trivial to implement: AdminAuthRequest → fetch `admin.locale` → bind I18nProvider for the admin subtree.

### 10.G — `Accept-Language` header parsing

| Option | Trade-off |
|---|---|
| (G1) Parse Accept-Language as final fallback | More accurate than current browser detection. |
| **(G2) Defer; CF-IPCountry + zyrix_lang covers 99%** (recommended) | Yagni for V1. |

**Recommended: G2.**

### 10.H — IP-mismatch warning UX

| Option | Trade-off |
|---|---|
| **(H1) Subtle banner once per session, dismissible, with [Report] action** (recommended) | Low-friction; the user can dismiss; "report this if you didn't expect it" routes to support. |
| (H2) Modal blocking interaction | Annoying for travelers. |
| (H3) Silent log only | Misses the "let the user know" intent. |

**Recommended: H1.** Banner mounts in `RegulatoryProvider`'s effect, stored in `sessionStorage.zyrix_mismatch_dismissed`.

### 10.I — ZATCA Phase 2 scope

| Option | Trade-off |
|---|---|
| **(I1) Generate full Phase 2 XML on demand (UBL CustomizationID = reporting:1.0, TLV QR, simplified-vs-standard flag, hash-chain pointer placeholder)** (recommended) | Matches the locked-decision "full regulatory engine." Live submission to ZATCA gateway is **deferred to a separate sprint** (matches the spec § 7 hint). The XML produced will pass ZATCA's offline schema validator. |
| (I2) Phase 1 only (simplified UBL extension) | Doesn't match the locked decision. |
| (I3) Live submission to ZATCA gateway in V1 | Production cert + onboarding with ZATCA portal needed; out of scope. |

**Recommended: I1.** ~150 LOC for the XML builder + 60 LOC for the QR TLV encoder.

### 10.J — Configurable tax rate admin UI

| Option | Trade-off |
|---|---|
| **(J1) `/admin/regulatory-profiles/tax-rates` — list view + create-with-effective-date form, audit-logged** (recommended) | Spec § B.4 / B.10. Admin can set "VAT 15% effective until 2027-01-01, then 20%". Existing admin layout + ADMIN_BRAND palette. |
| (J2) Direct DB edit by ops only | Loses audit trail; doesn't match the "configurable rates" locked decision. |

**Recommended: J1.**

### 10.K — Currency / date / number formatting library

| Option | Trade-off |
|---|---|
| **(K1) `Intl.NumberFormat` + `Intl.DateTimeFormat` (zero deps)** (locked) | Browser-native; covers TR/SA/EN locale conventions out-of-the-box. |
| (K2) dayjs / numbro / luxon | Locked-out per the spec. |

**Recommended: K1.** Wrappers in `src/utils/intlFormatters.js` (frontend) + `src/utils/intl.ts` (backend).

### 10.L — Backend country profile mirror

| Option | Trade-off |
|---|---|
| **(L1) `src/services/regulatory/profiles.ts` with TR + SA full profiles** (recommended) | Single backend file; can be imported by any service. ~120 LOC for V1 (8 GCC/MENA neighbors deferred). |
| (L2) JSON file at `prisma/regulatory-profiles.json` | Keeps profile data versioned alongside schema; harder to type. |

**Recommended: L1.** TypeScript file with full type signatures so consumers get autocomplete.

### 10.M — ZATCA QR code generator

| Option | Trade-off |
|---|---|
| **(M1) Hand-rolled TLV encoder (~50 LOC, zero deps)** (recommended) | ZATCA QR is a 5-tag TLV blob, base64-encoded. Encoding is trivial; the QR image itself is rendered client-side via existing `qrcode.react` (frontend) for display, and as a data URL for PDF embedding. |
| (M2) `qrcode` npm dep | Banned per locked decision. |

**Recommended: M1.** Matches the carry-over rule "raw HTTP + crypto, no SDKs" pattern from D-9.

### 10.N — e-Fatura threshold (TR)

| Option | Trade-off |
|---|---|
| **(N1) Add `efaturaThresholdRevenueTRY: 5_000_000` to TR profile; resolver flags `mustUseEfatura: boolean`** (recommended) | GİB threshold is 5M TRY annual revenue (current rule). Surfacing this lets the UI show a "you must switch to e-Fatura" banner. Threshold is updatable via the same admin UI as tax rates (versioned). |
| (N2) No threshold tracking | Loses a real customer-value feature. |

**Recommended: N1.**

### 10.O — AI prompt locale switching

| Option | Trade-off |
|---|---|
| **(O1) `aiAssistantController` + `aiCfoVoiceService` switch persona based on `merchant.country`: TR → Turkish accounting persona; SA → Saudi accounting persona; non-TR/SA → generic English MENA persona** (recommended) | Matches the carry-over "Slack/email/PDF outputs respect both language AND country" instruction. ~30 LOC each in 2 files. None of these files is a protected file. |
| (O2) Keep Turkish-only AI persona | SA merchants get inappropriate KDV references. |

**Recommended: O1.**

---

## 11. Phase B commit sequence — recommended

Spec § Phase B has 22 commits across 8 layers; with the recommendations applied this collapses to **~16 commits**. Skipped: schema migration for core fields (already done), LanguageSwitcher build (already done), most of the translation completeness sweep (D-8/D-9 already covered most surfaces).

```
docs(localization): Sprint D-11 discovery report                (this commit)

# Layer 1: schema + admin tax rate versioning
feat(db): TaxRateVersion table + Invoice ZATCA columns          [B.1]

# Layer 2: backend regulatory profiles + resolver
feat(regulatory): backend country profiles + profileResolver    [B.2]
feat(regulatory): tax-rate version lookup + Intl helpers        [B.3]

# Layer 3: ZATCA Phase 2 XML + QR
feat(regulatory): ZATCA UBL Phase 2 serializer                  [B.4]
feat(regulatory): ZATCA TLV QR code encoder                     [B.5]

# Layer 4: API surface
feat(api): /api/users/me/geo-context endpoint                   [B.6]
feat(api): admin tax-rate CRUD + audit log                      [B.7]

# Layer 5: invoice + AI wiring
feat(invoices): resolver-driven vatRate + currency stamping     [B.8]
feat(ai): country-aware prompt persona for chat + cfo voice     [B.9]

# Layer 6: frontend integration
feat(ui): RegulatoryProvider context + boot-fetch               [B.10]
feat(ui): mount LanguageSwitcher in customer + admin layouts    [B.11]
feat(ui): GeoMismatchBanner (subtle, once per session)          [B.12]
feat(ui): /admin/regulatory-profiles tax-rate editor            [B.13]

# Layer 7: i18n + verification
feat(i18n): D-11 locale namespace (TR/EN/AR)                    [B.14]
test: 12-step verification matrix (manual smoke checklist)       [B.15]

# Layer 8: completion
docs(localization): Sprint D-11 completion report               [B.16]
```

**16 commits across both repos.** Backend gets 8 (schema + regulatory + resolver + ZATCA + 2 controllers + invoice wiring + AI wiring), frontend gets 8 (provider + layouts + banner + admin page + i18n + tests + 2 docs).

---

## 12. Phase B readiness

Phase A is complete. Phase B is blocked on Mehmet's confirmation of the §10 decisions.

| Decision | Recommended | Notes |
|---|---|---|
| **10.A** Schema | A1 (use existing Merchant fields) | No migration on core fields. |
| **10.B** Backend profiles | B1 (services/regulatory/profiles.ts) | New file, zero deps. |
| **10.C** Tax versioning | C1 (TaxRateVersion table) | Effective-dated rows. |
| **10.D** Locale resolution | D1 (CF-IPCountry inserted into chain) | Existing chain extended. |
| **10.E** Language change | E1 (hot-swap) | Already works. |
| **10.F** Admin language | F1 (EN default + per-admin override) | Trivial. |
| **10.G** Accept-Language | G2 (defer) | Yagni. |
| **10.H** Mismatch UX | H1 (subtle banner once per session) | Low friction. |
| **10.I** ZATCA scope | I1 (full Phase 2 XML; gateway submission deferred) | Matches locked decision. |
| **10.J** Tax rate admin UI | J1 (/admin/regulatory-profiles editor) | Audit-logged. |
| **10.K** Formatting | K1 (Intl APIs only) | Locked. |
| **10.L** Backend profile mirror | L1 (.ts file) | Type-safe. |
| **10.M** ZATCA QR | M1 (hand-rolled TLV encoder) | Zero deps. |
| **10.N** e-Fatura threshold | N1 (5M TRY tracked) | Real customer value. |
| **10.O** AI persona | O1 (country-aware persona switch) | Matches carry-over rule. |

Once Mehmet confirms picks, Phase B proceeds per the §11 commit sequence. Estimated effort: ~6 working hours (matches the spec's 4-6 hour estimate).

---

**Phase A — DONE. Awaiting review.**
