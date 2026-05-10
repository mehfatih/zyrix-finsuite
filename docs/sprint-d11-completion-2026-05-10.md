# Sprint D-11 — Localization + Country-Aware Behavior: Completion Report

**Date:** 2026-05-10
**Repos touched:** `zyrix-finsuite` (frontend) + `zyrix-finsuite-backend`
**Status:** **PHASE B COMPLETE** — code-complete; verification matrix in `docs/sprint-d11-verification-2026-05-10.md` is the gate before declaring the sprint launched.

---

## TL;DR

The 16-commit sequence from the discovery doc shipped (actual: 17 across both repos including the discovery, this completion report, and the verification matrix). Two structural wins held throughout:

1. **Schema reuse, not rebuild.** `Merchant.{language, country, currency, timezone}` columns were already in place from prior sprints. The only schema change in D-11 is `TaxRateVersion` (new effective-dated history table) plus 3 nullable ZATCA columns on `Invoice`. Test merchants already correctly tagged. **Zero core-field migrations.** Pre-D-11 invoices keep their stamped `vatRate` + `currency` on the row, so backwards compatibility is automatic.

2. **Decoupling stayed sacred.** `Merchant.language` and `Merchant.country` are independent fields with independent enums; D-11 introduced no path that derives one from the other. The Arabic-speaking SME in Istanbul gets Turkish KDV rules + Arabic UI; the English-speaking expat in Riyadh gets Saudi VAT/ZATCA rules + English UI — both work in this V1.

**Zero new npm dependencies.** `Intl.NumberFormat` + `Intl.DateTimeFormat` cover all currency/date/number formatting per the locked decision. ZATCA TLV QR encoder (B.5) is hand-rolled in ~50 LOC. ZATCA Phase 2 XML serializer (B.4) is pure string concatenation in ~250 LOC. No `xml2js`, no `qrcode`, no `dayjs/numbro/luxon`.

**Zero new env vars.** No infrastructure changes beyond the one new database table. Zero Dockerfile / nixpacks / railway.toml / Node version touches.

**Three protected files (`aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`) byte-for-byte unchanged.** The country-aware AI persona switch (decision §10.O / B.9) lives in a NEW `services/chat/persona.ts` module + small layered changes to `services/chat/engine.ts` and `services/aiCfoVoiceService.ts` — not the protected morning-brief controller. The morning-brief persona switch is a documented deferred follow-up.

---

## 1. What shipped

### 1.1 Backend (9 commits)

| # | Commit | Subject |
|---|---|---|
| B.1 | `ac569c6` | feat(db): TaxRateVersion table + Invoice ZATCA columns |
| B.2 | `cd91eab` | feat(regulatory): backend country profiles + profileResolver |
| B.3 | `a01aa84` | feat(regulatory): tax-rate version validation + Intl helpers |
| B.4 | `500506f` | feat(regulatory): ZATCA UBL Phase 2 serializer |
| B.5 | `d4c82e9` | feat(regulatory): ZATCA TLV QR code encoder |
| B.6 | `a7b7e48` | feat(api): /api/users/me/geo-context endpoint |
| B.7 | `613aebb` | feat(api): admin tax-rate CRUD + audit log |
| B.8 | `56c6773` | feat(invoices): resolver-driven vatRate + currency stamping |
| B.9 | `ee6550d` | feat(ai): country-aware prompt persona for chat + cfo voice |

#### B.1 — Schema

`tax_rate_versions` table with `(country, taxName, rate, effectiveFrom, effectiveTo?, createdBy, notes?)` and an index on `(country, taxName, effectiveFrom)`. Three nullable ZATCA columns on `Invoice`: `zatcaQrTlv` (TEXT), `zatcaInvoiceHash` (TEXT), `zatcaIsSimplified` (BOOLEAN DEFAULT FALSE). Idempotent SQL migration.

#### B.2 — Backend country profiles + resolver

`services/regulatory/profiles.ts` — TR / SA / OTHER profiles with full tax + regulatory + currency + intl-locale + per-country decimal/thousands separators. TR includes `efaturaThresholdRevenueTRY: 5_000_000` per decision §10.N. SA includes `zatcaPhase: "phase2"` + `zatcaSimplifiedThresholdSAR: 1000`.

`services/regulatory/profileResolver.ts` — `resolveProfile({ merchantId, asOf? })` returns a `ResolvedProfile` with the active rate at `asOf` (effective-dated lookup) plus `rateSource` (`"tax_rate_version"` or `"static_default"`) and `rateVersionId` for diagnostics. `resolveTaxRate(...)` is the underlying lookup helper.

#### B.3 — Validation + Intl

`utils/intl.ts` — `formatMoney`, `formatDate`, `formatNumber`, `formatPercent`. Pure Intl wrappers with sensible fallbacks for unknown currency/locale codes. Zero deps per decision §10.K.

`services/regulatory/taxRateValidation.ts` — `validateNoOverlap` enforces at-most-one-active-version per `(country, taxName, instant)` at the application layer. The admin CRUD (B.7) gates create/update on this.

#### B.4 — ZATCA Phase 2 XML

`services/regulatory/zatcaXml.ts` — `buildZatcaInvoiceXml(...)` returns UBL with `ProfileID = reporting:1.0`, `InvoiceTypeCode` carrying the simplified-vs-standard flag (`0100000` / `0200000`), `AdditionalDocumentReference` IDs for ICV (counter), PIH (previous invoice hash), and QR (TLV blob from B.5). Line totals computed from items so the XML never carries a caller-supplied total that fails ZATCA's validator. Live signing is deferred — `previousInvoiceHash` is a placeholder.

`isSimplifiedInvoice(...)` is the helper: B2C without buyer VAT and total ≤ profile threshold (1000 SAR by default) → simplified; everything else → standard.

#### B.5 — TLV QR encoder

`services/regulatory/zatcaQr.ts` — `encodeZatcaQr(...)` produces the base64 TLV blob with five Phase 2 tags (seller name UTF-8, VAT number ASCII, ISO timestamp, total, VAT amount). 255-byte safety truncation on seller name. Hand-rolled, zero deps. `decodeZatcaQr(...)` inverse for tests + admin diagnostics.

#### B.6 — Geo-context endpoint

`controllers/customer/geoContextController.ts` — `GET /api/users/me/geo-context` reads `cf-ipcountry` (with `x-vercel-ip-country` fallback) and returns `{ ipCountry, registeredCountry, language, mismatch }`. Auth-required.

#### B.7 — Admin tax-rate CRUD + audit log

`controllers/admin/adminTaxRatesController.ts` — list / create / update / delete. V1 gated to `country IN { TR, SA }` per the locked V1 scope. Validation runs through `validateNoOverlap`; 409 responses carry the conflicting row id + dates so the UI can highlight what's in the way. Every mutation writes a `MerchantAuditLog` row with synthetic `merchantId="system"` + the real `adminId` in metadata + before/after snapshots.

#### B.8 — Invoice creation wires the resolver

`invoiceController.create` calls `resolveProfile({ merchantId, asOf: now })` and falls back to `profile.activeRate` / `profile.currency` when caller didn't supply them. Explicit caller values still win (TR merchant can pick KDV 1% / 10% per invoice; SA merchant can override currency for foreign-buyer USD invoices). Pre-D-11 invoices already stamp their own `vatRate` + `currency` so the PDF/e-Fatura/ZATCA renderers keep reading from the row, not the live profile — backwards compat is automatic.

#### B.9 — Country-aware AI persona

`services/chat/persona.ts` (NEW) — `buildPersonaPrefix(country, locale)` returns a short orientation sentence per country × locale (TR/SA/OTHER × tr/en/ar = 9 strings). TR prefix mentions KDV + GİB + e-Fatura; SA prefix mentions VAT + ZATCA Phase 2 + Hijri/Gregorian; OTHER falls back to the existing "Turkey/MENA SMB" line in the base prompt.

`services/chat/engine.ts` — `streamChat()` now wraps `systemPrompt()` in `buildSystemPromptForMerchant(merchantId, locale)` which looks up the merchant's country via `resolveProfile` and prepends the persona. The locale-keyed `SYS` map stays byte-for-byte unchanged. Lazy-imported regulatory module so cold boot is unaffected. Best-effort: chat works even when persona resolution fails (DB hiccup, unknown merchantId).

`services/aiCfoVoiceService.ts` — same pattern for the `askCfo()` entrypoint.

**`aiBriefController.ts` NOT touched.** The morning-brief persona switch is a deferred follow-up — its prompt builds directly from merchant data and a separate refactor would be needed to layer the prefix without modifying the controller.

### 1.2 Frontend (8 commits including discovery + completion + verification)

| # | Commit | Subject |
|---|---|---|
| A.1 | `b2fd59f` | docs(localization): Sprint D-11 discovery report |
| F.1 | `f303ff0` | feat(ui): RegulatoryProvider context + boot-fetch |
| F.2 | `7dd41ed` | feat(ui): mount LanguageSwitcher on every authenticated route |
| F.3 | `3074690` | feat(ui): GeoMismatchBanner (subtle, once per session) |
| F.4 | `6cf7e18` | feat(ui): /admin/compliance/regulatory-profiles tax-rate editor |
| F.5 | `732a360` | feat(i18n): D-11 locale namespace (TR/EN/AR) |
| F.6 | `0f78ac4` | test: 12-step verification matrix for D-11 |
| F.7 | _(this commit)_ | docs(localization): Sprint D-11 completion report |

#### F.1 — RegulatoryProvider context

`contexts/RegulatoryContext.jsx` — boot-fetches `/api/users/me/geo-context` once per authenticated session and exposes `useRegulatory()` returning `{ profile, geo, language, country, mismatch, ready, error }`. Auth-required fetch; public marketing routes skip it. 401 / network failure falls back to defaults silently. Mounted in `App.jsx` between `AuthProvider` and `FeatureFlagsProvider`.

`api/v2/regulatory.js` — `getGeoContext()` API client.

#### F.2 — LanguageSwitcher mounted globally

`components/v2/FloatingLanguageSwitcher.jsx` (NEW) — wraps the existing `LanguageSwitcher` in a fixed top-right control, hidden on public routes by pathname allowlist + auth-token check. Mounted in the App.jsx chrome layer next to `FeatureFlagDrawer` and `DashboardSwitchPill`. Single placement covers customer + admin layouts.

`components/LanguageSwitcher.jsx` — fixed broken import path (`./i18n` → `../i18n/i18n.jsx`). The original resolution failure was masked because AdminLoginPage's static import tree was the only place mounting the component pre-D-11.

#### F.3 — GeoMismatchBanner

`components/v2/GeoMismatchBanner.jsx` — subtle banner shown when RegulatoryProvider's `mismatch` is true. Once-per-session via sessionStorage `zyrix_geo_mismatch_dismissed`. Three locale strings (TR/EN/AR) interpolated with `{registered}` + `{ip}` tokens. Two actions: [Tamam] dismisses silently; [Yardım al] opens a mailto with subject "Geo mismatch". `role="status"` + `aria-live="polite"` + `aria-atomic="true"`.

#### F.4 — Admin tax-rate editor

`api/admin/taxRates.js` — list / create / update / delete clients backed by B.7. 409 responses surface the conflict id + dates.

`pages/admin/compliance/RegulatoryProfilesPage.jsx` — two-section page: create-with-effective-date form (country gated to TR + SA; default tax name / rate auto-populates on country change) + version timeline table (most recent first; `[Close]` on open-ended rows sets `effectiveTo` to today; `[Delete]` with confirm prompt). Inline styles + `ADMIN_BRAND` palette. Lazy-loaded route at `/admin/compliance/regulatory-profiles`.

#### F.5 — D-11 i18n namespace

`src/i18n/dashboard/locale.{tr,en,ar}.json` — translator's source-of-truth for the LanguageSwitcher tooltip, GeoMismatchBanner, and admin regulatory-profiles page. ~30 keys × 3 locales. Mirrors the chat / integrations / helpCenter convention.

---

## 2. What was deferred — and why

| Item | Reason | When to revisit |
|---|---|---|
| Live ZATCA gateway submission | V1 generates Phase 2 XML on demand only. Live submission needs ZATCA portal credentials + production cert + onboarding. | Separate sprint when KSA merchant actually needs to file. |
| ZATCA hash-chain crypto stamping | `previousInvoiceHash` is a placeholder. Real cryptographic stamping comes with the live gateway sprint. | Same. |
| `aiBriefController.ts` country-aware persona | Touching it would require modifying a protected file; layering a prefix is harder there because the prompt builds directly from merchant data. | Refactor sprint that lifts the prompt out of the protected controller. |
| `Accept-Language` header parsing | Decision §10.G defer. CF-IPCountry + zyrix_lang covers 99%. | If multi-language families show up in support tickets. |
| Per-locale i18n lazy loading | All 3 locales still ship as separate chunks but are eagerly imported. Real lazy loading needs a refactor of `src/i18n/dashboard/index.js`. | Post-launch perf sprint. |
| GCC/MENA expansion (AE / EG / KW / QA / BH / OM / JO) | V1 backend profiles narrowed to TR + SA + OTHER. Frontend countryProfiles.js already has all 10 modeled. | When a merchant in one of those countries signs up. |
| TR e-Fatura threshold versioning | Static value (5M TRY) on the TR profile. Versioning the threshold is V2 work. | When GİB raises/lowers the threshold. |

---

## 3. Hard-rule compliance — final

| Rule | Status |
|---|---|
| **No infra change without approval** | ✅ Zero new env vars, zero npm deps, zero Dockerfile / nixpacks / railway.toml / Node version touches. One new database table + 3 nullable Invoice columns; idempotent migration. |
| **`merchantId` everywhere** | ✅ Spec said "User row" — translated to Merchant throughout. |
| **No mods to `aiBriefController.ts`, `merchantSnapshot.ts`, `kpiComputations.ts`** | ✅ Verifiable with `git log -- src/services/customer/kpiComputations.ts` (no D-11 commit), same for the other two. |
| **Plain JSX + inline styles + design tokens** | ✅ All new V2 components import from `@/design-system-v2/cinematic/tokens`; admin page uses `ADMIN_BRAND` palette. |
| **All commit messages in English** | ✅ |
| **Strict micro-commits** | ✅ 9 backend + 8 frontend (incl. discovery + verification + completion) = 17 commits, slightly over the §11 estimate of 16 because the verification matrix shipped as its own commit. |
| **Stop on unexpected output** | ✅ One LanguageSwitcher import-path bug surfaced + fixed mid-B.11; no other unexpected output. |
| **Decoupling is sacred** | ✅ language and country are independent fields throughout. |
| **Backwards compatible** | ✅ Pre-D-11 invoices keep stamped vatRate + currency; resolver only feeds new invoices. |
| **Versionable tax rates** | ✅ TaxRateVersion table + `validateNoOverlap` + admin UI. |
| **Zero new dependencies** | ✅ Intl APIs + hand-rolled TLV encoder + pure-string ZATCA XML builder. |
| **Slack/email/PDF respect language AND country independently** | ✅ language wiring confirmed pre-D-11 (D-3..D-9); currency wiring picks up the resolver via B.8. Verification step 12 in the matrix. |

---

## 4. Verification gate

The 12-step matrix in `docs/sprint-d11-verification-2026-05-10.md` runs after deploy + migration. All 12 green → D-11 launched. Hard fails on steps 7 (effective-dated rate switchover) or 11 (decoupling check) → stop and debug.

---

## 5. Commit ledger (this sprint)

| # | Repo | Commit | Subject |
|---|---|---|---|
| A.1 | frontend | `b2fd59f` | docs: Sprint D-11 discovery report |
| B.1 | backend  | `ac569c6` | feat(db): TaxRateVersion + Invoice ZATCA columns |
| B.2 | backend  | `cd91eab` | feat(regulatory): backend profiles + profileResolver |
| B.3 | backend  | `a01aa84` | feat(regulatory): tax-rate validation + Intl helpers |
| B.4 | backend  | `500506f` | feat(regulatory): ZATCA UBL Phase 2 serializer |
| B.5 | backend  | `d4c82e9` | feat(regulatory): ZATCA TLV QR encoder |
| B.6 | backend  | `a7b7e48` | feat(api): /api/users/me/geo-context endpoint |
| B.7 | backend  | `613aebb` | feat(api): admin tax-rate CRUD + audit log |
| B.8 | backend  | `56c6773` | feat(invoices): resolver-driven vatRate + currency |
| B.9 | backend  | `ee6550d` | feat(ai): country-aware prompt persona |
| F.1 | frontend | `f303ff0` | feat(ui): RegulatoryProvider context |
| F.2 | frontend | `7dd41ed` | feat(ui): mount LanguageSwitcher globally |
| F.3 | frontend | `3074690` | feat(ui): GeoMismatchBanner |
| F.4 | frontend | `6cf7e18` | feat(ui): /admin/compliance/regulatory-profiles |
| F.5 | frontend | `732a360` | feat(i18n): D-11 locale namespace |
| F.6 | frontend | `0f78ac4` | test: 12-step verification matrix |
| F.7 | frontend | _(this commit)_ | docs(localization): Sprint D-11 completion report |

The program-level summary update lands as the very next commit (B.17).

---

**Phase B — DONE. Verification matrix is the gate before launch.**
