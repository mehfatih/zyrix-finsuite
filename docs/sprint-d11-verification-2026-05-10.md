# Sprint D-11 — Localization + Country-Aware Behavior: Verification Matrix

**Date:** 2026-05-10
**Scope:** 12-step manual smoke checklist run after backend deploy + frontend deploy + the migration in `prisma/manual-migrations/2026-05-10_d11_localization.sql`.

This is the gate before the D-11 completion report. None of these steps require new env vars (Sentry / Slack / V2 rollout) to be live; D-11 only adds one new database table + 3 nullable Invoice columns + 1 new auth-required endpoint.

---

## Pre-flight

- [ ] Backend `npx tsc --noEmit` clean (pre-existing errors in `auditLogger.ts:54` + `admin/auth.ts:61` are out of scope and were present before D-11).
- [ ] Frontend `npx vite build --mode production` clean.
- [ ] Migration applied on Railway Postgres:
      `psql $DATABASE_URL -f prisma/manual-migrations/2026-05-10_d11_localization.sql`
- [ ] `prisma generate` re-run on backend so the Prisma client carries the new `taxRateVersion` model + `Invoice.zatcaQrTlv/zatcaInvoiceHash/zatcaIsSimplified` columns.

## Step 1 — Geo-context endpoint (B.6)

- [ ] Hit `GET /api/users/me/geo-context` with a valid customer JWT.
- [ ] Response shape: `{ ipCountry, registeredCountry, language, mismatch }`.
- [ ] When called from a TR IP with a TR-registered merchant: `mismatch === false`.
- [ ] When called via curl spoofing `cf-ipcountry: SA` against a TR merchant: `mismatch === true` and `ipCountry === "SA"`.

## Step 2 — TR test merchant default surface

- [ ] Log in as `test+tr` (TR / TR / TRY).
- [ ] Top-right floating switcher visible. Click → TR / AR / EN dropdown opens.
- [ ] Pick AR → `document.documentElement.dir` flips to `rtl`. Pick EN → flips to `ltr`. Pick TR → back to `ltr`.
- [ ] Refresh page → language preference survives (localStorage `zyrix_lang`).
- [ ] Geo-mismatch banner does NOT appear (TR IP → TR merchant).

## Step 3 — SA test merchant default surface

- [ ] Log in as `test+sa` (SA / AR / SAR).
- [ ] Top-right floating switcher visible (now positioned for RTL — `document.documentElement.dir === "rtl"` from boot).
- [ ] Switcher already shows AR as the active language.
- [ ] Switching to TR or EN keeps merchant data consistent (currency stays SAR — language ≠ country).

## Step 4 — Geo-mismatch banner (B.12)

- [ ] Log in as TR merchant from a Saudi VPN (or curl with `cf-ipcountry: SA` against the geo-context endpoint, then reload the dashboard).
- [ ] Banner appears top-center with title "Farklı bir ülkeden bağlanıyorsun" (TR locale) or matching EN/AR copy.
- [ ] Click [Tamam] → banner disappears. Reload → banner does NOT reappear (sessionStorage `zyrix_geo_mismatch_dismissed` = "1").
- [ ] Open a new tab in the same session → banner stays dismissed (same sessionStorage).
- [ ] Sign out + sign in again → sessionStorage cleared by browser; banner reappears once per fresh session.

## Step 5 — TaxRateVersion CRUD via admin UI (B.13)

- [ ] As admin, visit `/admin/compliance/regulatory-profiles`.
- [ ] Empty state: "No tax rate versions yet — invoices fall back to the static profile defaults".
- [ ] Create a TR/KDV/18% row with `effectiveFrom = 2020-01-01, effectiveTo = 2023-07-10` → row appears in the timeline.
- [ ] Create a TR/KDV/20% row with `effectiveFrom = 2023-07-10, effectiveTo = null` → row appears.
- [ ] Try to create a TR/KDV/19% row with `effectiveFrom = 2024-01-01` (overlaps the open-ended row). 409 + error banner shows the conflicting row id + dates.
- [ ] Click [Close] on the open-ended row → `effectiveTo` set to today.
- [ ] Click [Delete] on the historical row → confirm prompt → row gone.
- [ ] Hit `GET /api/admin/regulatory/tax-rates` → response carries the rows + `profiles` array (TR/KDV defaultRate=20, SA/VAT defaultRate=15).
- [ ] Check `MerchantAuditLog` for entries with `resource = "tax_rate_version"` and `action = "CREATE"/"UPDATE"/"DELETE"`. `metadata.adminId` carries the actor.

## Step 6 — Resolver-driven invoice creation (B.8)

- [ ] As TR merchant, hit `POST /api/invoices` with a body that omits `vatRate` and `currency`. The created invoice should carry `vatRate = 20` (from the TR profile defaultRate, or whatever active TaxRateVersion covers today) + `currency = "TRY"`.
- [ ] Same with explicit `vatRate: 10` → invoice carries `vatRate = 10` (caller wins).
- [ ] As SA merchant, hit `POST /api/invoices` with no `vatRate` → invoice carries `vatRate = 15` + `currency = "SAR"`.
- [ ] Pre-D-11 invoices (created before the deploy) still render with their original stamped `vatRate` / `currency` — no retroactive recomputation.

## Step 7 — Effective-dated rate switchover

- [ ] Create a TR/KDV/18% row with `effectiveFrom = 2020-01-01, effectiveTo = 2026-05-10T12:00:00Z`.
- [ ] Create a TR/KDV/20% row with `effectiveFrom = 2026-05-10T12:00:00Z, effectiveTo = null`.
- [ ] Programmatically call `resolveProfile({ merchantId: TR_TEST, asOf: new Date('2026-05-10T11:59:00Z') })` → `activeRate === 18`, `rateSource === "tax_rate_version"`.
- [ ] Same call with `asOf: new Date('2026-05-10T13:00:00Z')` → `activeRate === 20`, `rateSource === "tax_rate_version"`.
- [ ] Delete both rows → `resolveProfile` falls back to `activeRate === 20` (static), `rateSource === "static_default"`.

## Step 8 — Country-aware AI persona (B.9)

- [ ] As TR merchant, open `/chat` and ask "How is my business doing?". The response should reference KDV / TRY / Turkish accounting terms.
- [ ] As SA merchant, open `/chat` and ask the same. The response should reference VAT / SAR / ZATCA / Saudi accounting terms.
- [ ] Verify in backend logs that the persona prefix landed in the system prompt: `[chat/engine] persona prefix failed, ...` should NOT appear under normal conditions.
- [ ] Confirm `aiBriefController.ts` is byte-for-byte unchanged: `git log -- src/controllers/customer/aiBriefController.ts | head -5` shows no D-11 commit touching it.

## Step 9 — ZATCA Phase 2 XML + QR (B.4 + B.5)

- [ ] Programmatically build a sample SA invoice with `buildZatcaInvoiceXml`. Expected outputs:
  - `<cbc:ProfileID>reporting:1.0</cbc:ProfileID>`
  - `<cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>`
  - For total < 1000 SAR with no buyer VAT: `<cbc:InvoiceTypeCode name="0200000">`
  - For total ≥ 1000 SAR: `<cbc:InvoiceTypeCode name="0100000">`
- [ ] Verify line totals, tax subtotal, and `LegalMonetaryTotal` add up. Two-decimal precision throughout.
- [ ] Build a sample QR via `encodeZatcaQr(...)`. Round-trip via `decodeZatcaQr(base64)` returns the 5 fields with the correct seller name (UTF-8 Arabic OK), VAT number, ISO timestamp, total, and VAT amount.
- [ ] `Buffer.from(base64, "base64")` produces a binary buffer that starts with `0x01` (tag 1) and the seller-name length.

## Step 10 — Backwards compatibility

- [ ] Pull a pre-D-11 TR invoice from the database. Confirm it has:
  - `vatRate` stamped on the row (e.g. 18 or 20 based on when it was created)
  - `currency = "TRY"` stamped
  - `zatcaQrTlv = NULL` / `zatcaInvoiceHash = NULL` / `zatcaIsSimplified = false` (defaults from B.1 migration).
- [ ] PDF rendering of a pre-D-11 invoice produces a sensible output (no QR code where one isn't expected).

## Step 11 — Decoupling check

- [ ] Update a TR merchant's `language` to `AR` directly via Prisma studio (`merchant.language = 'AR'`).
- [ ] Refresh the dashboard → UI flips to AR. `country` stays `TR`. `currency` stays `TRY`. Tax terminology still says KDV.
- [ ] Update an SA merchant's `language` to `EN` → UI flips to EN. `country` stays `SA`. `currency` stays `SAR`. Tax terminology still says VAT / ZATCA.

## Step 12 — Slack / email / PDF respect both axes

- [ ] If Slack env vars are live (D-9 deferred): a TR merchant with AR language gets Slack insight cards with AR severity badges (🔴 حرج) + TRY currency formatting.
- [ ] An SA merchant with EN language gets Slack cards with EN severity badges (🔴 CRITICAL) + SAR currency formatting.
- [ ] The morning brief email (D-5) and weekly report (D-6) honor `merchant.language` for narrative + `merchant.currency` for amounts.
- [ ] Generated invoice PDFs (D-2) honor `invoice.currency` (stamped at creation per B.8).

---

## Pass criteria

All 12 steps green → Sprint D-11 is verified and the completion report (B.16) can ship.

If steps 7 or 11 fail → stop. The decoupling rule or the resolver lookup is broken; debug before continuing.

If only steps 8 or 12 partial → the persona / Slack wiring needs polishing but D-11 can ship; the affected items move to a post-D-11 follow-up.

If step 9 fails → the ZATCA XML produced needs to pass an external offline validator (e.g. `zatca-einvoicing-sdk` from ZATCA's developer portal). V1 doesn't ship live submission so a passing-XML-only verification is sufficient; structural compliance with the schema is the bar.
