# Sprint D-2.5 — Railway Runtime Hardening: Discovery Report

**Date:** 2026-05-10
**Type:** Infrastructure hardening (interlock between D-2 and D-5)
**Status:** **Phase A complete — awaiting per-strategy approval before any Phase B step**

---

## TL;DR

The Puppeteer Chromium that ships with `puppeteer@24.41.0` cannot launch on Railway because the runtime container — built from `ghcr.io/railwayapp/nixpacks:ubuntu-1745885067` — has been stripped of the standard X11/GTK shared libraries Chromium needs. The first missing lib that surfaces is `libglib-2.0.so.0`; downstream there are ~30 more in the standard Chromium dep chain.

The blocker is real and reproducible (verified just now by hitting `/api/customer/pdf/insight/:id` against the post-revert main branch — still 500s with `libglib-2.0.so.0: cannot open shared object file`).

Three actionable strategies, with one strong recommendation contingent on the Railway dashboard finding (§A.1).

This doc has one open section — **A.1: Mehmet's Railway dashboard findings** — that needs to be filled in before any Phase B step is approved. The repo audit (§A.2) and strategy comparison (§A.3) are complete.

---

## A.1 — Railway dashboard findings

Mehmet inspected the dashboard at `Project alert-warmth → Service FinSuite-backend → Settings → Build & Deploy` on 2026-05-10:

| Setting | Value | Notes |
|---|---|---|
| **Builder** | **`NIXPACKS`** | Matches `railway.toml`. **No override.** |
| Builder shows "Override" / "Custom" badge? | **No** | Confirmed |
| Custom Build Command | **Empty** | `nixpacks.toml`'s `[phases.build].cmds` is being respected |
| Custom Start Command | **Empty** | `nixpacks.toml`'s `[start].cmd` is being respected |
| Watch Paths | (not flagged) | — |
| Root Directory | **Empty** | Default (repo root) |
| Dockerfile Path | n/a | Builder is Nixpacks, not Dockerfile |

**Conclusion:** the toml is being honored at every layer. The D-2 finding that `railway.toml builder = "DOCKERFILE"` was ignored must have been a transient propagation issue (or the dashboard cached an older value at the time). **Today the dashboard and toml agree on NIXPACKS** — no dashboard-level override is in play.

**Critical implication for strategy choice:** Strategy A (`nixpacks.toml` `aptPkgs`) can be tested cleanly. If `aptPkgs` is still silently dropped by Nixpacks 1.41, that's a Nixpacks-version issue, not a dashboard-override issue. Strategy B (Dockerfile) becomes a real fallback option since the dashboard is willing to honor a builder switch — we'd just need to switch `railway.toml` to `builder = "DOCKERFILE"` and add a `Dockerfile` in the same commit.

Env vars (presence-only, no values):

- `DATABASE_URL` ✓
- `JWT_SECRET` ✓
- `RESEND_API_KEY` ✓
- `GEMINI_API_KEY` ✓
- `VAPID_PUBLIC_KEY` ✓ (D-4)
- `VAPID_PRIVATE_KEY` ✓ (D-4)
- `VAPID_SUBJECT` ✓ (D-4)
- `RESEND_WEBHOOK_SECRET` ✓ (D-4)
- No `NIXPACKS_*` overrides
- No `RAILPACK_*` env vars
- No `PUPPETEER_*` env vars (no `PUPPETEER_EXECUTABLE_PATH`, no `PUPPETEER_SKIP_DOWNLOAD` — note: the latter is set inside `nixpacks.toml` `[variables]` instead, scoped to build only)

---

## A.2 — Current runtime audit (repo side)

### Current build configs

**`nixpacks.toml`** (post-D-2 revert, exactly at end-of-D-1 state):

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm-9_x", "openssl"]
aptPkgs = []                                       # ← empty by design

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm install && npx prisma generate"]

[start]
cmd = "npx tsx src/index.ts"

[variables]
PUPPETEER_SKIP_DOWNLOAD = "false"
```

**`railway.toml`**:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npx prisma generate"

[deploy]
startCommand = "npx tsx src/index.ts"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

**No `Dockerfile` in the repo** (deleted during D-2 reverts).

### Build environment (from Railway logs)

- **Base image:** `ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d8…` (Ubuntu-based, dated 2025-04-29)
- **Nix packages installed at setup:** `nodejs_20`, `npm-9_x`, `openssl` only — no Chromium libs
- **Build runs 10 stages:** copy nixpkgs file → `nix-env -if` → COPY src → `npm ci` → COPY src → `npm install && npx prisma generate` → PATH printf → COPY → start
- **No `apt-get install` step appears in any build log**, even when `nixpacks.toml` previously had `aptPkgs = [a long list]` (commit `a5390b2`, reverted). This is the D-2 finding: **Nixpacks 1.41 silently drops `aptPkgs` when `nixPkgs` is also customised** — a known behavior of the version Railway is on.

### Node runtime

- **`package.json` engines field:** unset
- **Nix package set installs Node 20** (`nodejs_20` in nixpacks.toml)
- **`npx tsx src/index.ts`** is the start command — runs TS directly via tsx, no compile step. This is intentional (avoids two pre-existing TS errors in `auditLogger.ts:54` and `routes/admin/auth.ts:61` that would fail `tsc`).
- **Note:** `package.json`'s `"start"` script (`node dist/index.js`) is unused on Railway — it'd require the build to run `tsc`, which currently fails on those two TS errors. Out of scope to fix in D-2.5.

### Puppeteer details

- **Version:** `puppeteer@24.41.0` (already installed)
- **Chromium binary:** ships its own at `/root/.cache/puppeteer/chrome/linux-147.0.7727.56/chrome-linux64/chrome`
- **`PUPPETEER_SKIP_DOWNLOAD = "false"`** in nixpacks.toml `[variables]` — confirms Railway downloads Chromium during install
- **`web-push@3.6.7`** also installed (D-4) — unrelated to PDF rendering, but noted because future Web Push expansion may want a system service worker

### Failure surface — current

Just-reproduced live. Hit `POST /api/customer/pdf/insight/:id` for the TR test merchant at 00:18 UTC:

```
Failed to launch the browser process:  Code: 127

stderr:
/root/.cache/puppeteer/chrome/linux-147.0.7727.56/chrome-linux64/chrome:
  error while loading shared libraries: libglib-2.0.so.0:
  cannot open shared object file: No such file or directory
```

`libglib-2.0.so.0` is the **first** missing lib. Once that's installed, the next missing one surfaces — during D-2 we saw `libnspr4.so` after switching to `@sparticuz/chromium` (which carries glib but not nspr4). The full Chromium dep chain on Debian/Ubuntu is well-known:

```
ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0
libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1
libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0
libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1
libxext6 libxfixes3 libxi6 libxkbcommon0 libxrandr2 libxrender1 libxshmfence1
libxss1 libxtst6 lsb-release wget xdg-utils
```

(36 packages, ~150 MB unpacked when installed.)

---

## A.3 — Strategy comparison

Each strategy maps the runtime fix to a different layer (Nix vs apt vs custom container vs sidecar service vs managed service).

| | A. Nixpacks `aptPkgs` retry | B. Dockerfile + apt-get install | C. `@sparticuz/chromium` + Node ≥22 | D. Browserless.io managed | E. Different builder (Railpack) |
|---|---|---|---|---|---|
| **What it does** | Re-add the 36-package list to `nixpacks.toml` `aptPkgs` field; verify apt-get step now appears | Add a `Dockerfile` based on `node:20-bookworm-slim`, run `apt-get install` for the libs, `CMD ["npx", "tsx", ...]` | Switch from `puppeteer` to `puppeteer-core` + `@sparticuz/chromium` (self-contained Chromium variant); requires Node 22+ for v148+ | Replace local Puppeteer with calls to Browserless.io's hosted Chromium | Switch builder to Railway's newer "Railpack" which may have different lib defaults |
| **Install size** | +150 MB image | +150 MB image | +50 MB npm dep, no new system libs (sparticuz bundles them) | 0 (sidecar) | Unknown — Railpack docs sparse |
| **Memory impact** | ~+150-180 MB idle (Chromium overhead) | Same | Same (sparticuz still spawns Chromium) | 0 | Unknown |
| **Complexity** | Low | Medium | Medium-high (touches 3 files + dep change + Node bump) | Low | Unknown — would require dashboard-level builder change |
| **Known to fail in this repo?** | **Yes during D-2** — `aptPkgs` was silently dropped. Re-trying in isolation might work if it was a one-off, but the same Nixpacks 1.41 base image is still in use. | **Yes during D-2** — railway.toml `builder = DOCKERFILE` was ignored. Requires §A.1 dashboard fix first. | **Yes during D-2** — `@sparticuz/chromium@148` requires Node ≥22.17, Railway runs Node 20. Reverting Node bump worked but lost the `@sparticuz` benefit. | Not tried | Not tried |
| **Blast radius if it fails** | Empty `aptPkgs` again → same starting state. Clean. | New image base, npm install runs from clean → could fail compile somewhere. Medium. | Three-file rewrite; if engine mismatch resurfaces or Node 22 has unexpected breakage in other parts of the app, large. | Outage during transition (need to update PDF service to call out). Medium. | Whole build pipeline changes. Large. |
| **Reverts cleanly?** | Yes (one commit) | Yes (delete Dockerfile, revert railway.toml + dashboard) | Yes — D-2 revert pattern (3 commits → 3 reverts, plus possible Node 20 restore) | Yes if we keep the Puppeteer code path as fallback. | Probably — unsure |
| **Cost** | $0 | $0 | $0 + Node 22 audit (other code might break on bump) | **~$0.005-0.05 per render**, paid | $0 |
| **Maintains hard rule "no autonomous infra"** | All changes in `nixpacks.toml` only (one file) | Adds `Dockerfile` + edits `railway.toml` + likely dashboard change | Adds 2 deps + edits 2 files + Node version bump + nixpacks change | Adds 1 dep + new env vars + service architecture change | Dashboard change + likely toml change |
| **Privacy / 3rd-party data exposure** | None | None | None | **PDFs flow through Browserless** — privacy concern for AI insight content + merchant numbers | None |

### Strategies not seriously considered

- **D (Browserless.io)** — paid service that takes our PDFs through their infrastructure. Out of scope per the sprint spec ("No 3rd-party notification SaaS" extends in spirit to this).
- **E (Railpack)** — too unknown; would substitute one mystery for another.

### Recommended strategy

**Conditional on §A.1 dashboard findings.**

- **If the Railway dashboard Builder is set to NIXPACKS (matches `railway.toml`):** start with **Strategy A** (Nixpacks `aptPkgs` retry).
  - It's the simplest and lowest-risk option. The D-2 failure of `aptPkgs` may have been due to the now-known interaction with custom `[phases.install]` cmds. By keeping nixpacks.toml minimal (only `aptPkgs`, no install-phase override) we test Nixpacks's standard apt-install path cleanly.
  - If Strategy A fails (apt-get step still doesn't appear in build logs), fall back to **Strategy B**.

- **If the Railway dashboard Builder is overridden** (set to something like `Custom`, `Auto`, or has an "Override" badge): the override is what blocked Strategy B during D-2. Mehmet first switches the dashboard to "Use Config File" or directly to "Dockerfile", we verify the next deploy actually picks up the change, **then** Strategy B becomes viable.
  - Strategy B is more reliable than A (explicit RUN commands always run) but requires the dashboard issue to be fixed first.

**Strategy C is deferred** — it requires a Node version bump that the hard rules explicitly forbid without separate sign-off. Even if approved, the install size and complexity make it the wrong call when A or B can solve the problem cleanly.

### Approval matrix

The Phase B steps below each require explicit per-step approval. Listing them here so you can authorize all-at-once or step-by-step.

| Step | Awaiting approval to | Risk | Reversible? |
|---|---|---|---|
| B.1 | Capture pre-fix snapshot doc | Zero — read-only | n/a |
| B.2 (A) | Edit `nixpacks.toml` to add `aptPkgs` (36 packages); push as one commit | Low — if it doesn't work, revert one commit | Yes |
| B.2 (B) | Add `Dockerfile`, edit `railway.toml`, push; assumes dashboard fix done first | Medium — new builder behavior | Yes (delete Dockerfile + revert toml) |
| B.3 | Watch Railway deploy, confirm `/health` 200 + ai-brief still works | Zero — read-only | n/a |
| B.4 | Hit `/api/invoices/:id/pdf` for a real invoice, confirm PDF returned | Zero — read-only | n/a |
| B.5 | Generate the 18-PDF sample matrix via `/api/customer/pdf/*` endpoints | Low — same endpoints we've been calling, just expecting success | n/a |
| B.6 | Trigger a real D-3 share email send | Low — sends to TR test merchant address only | n/a |
| B.7 | Write completion report | Zero | n/a |

---

## A.4 — Verification plan

### After each B-step

| Step | What we verify | Expected output |
|---|---|---|
| B.1 | Pre-fix state captured | `docs/d2.5-pre-fix-state.md` contains nixpacks.toml content + commit SHA + ai-brief baseline 200 |
| B.2 | Push commit succeeds | Single commit on main; CI / Railway deploy starts |
| B.3 | Deploy succeeds + boot logs clean | `Starting Container` → `Database connected` → `[ai-brief] startup: GEMINI_API_KEY present` → `[webPushChannel] VAPID configured.`; no `error while loading shared libraries` |
| B.3 | `GET /health` | 200 OK |
| B.3 | `POST /api/customer/dashboard/ai-brief/refresh` | 200 OK, same response shape as today |
| B.4 | `GET /api/invoices/:id/pdf` (legacy endpoint) | `Content-Type: application/pdf`, non-zero body, no errors in logs |
| B.5 | 18 PDFs generated | All 18 saved locally in `docs/d2.5-pdf-samples/`; each ≥ 30 KB; logs show no Chromium errors |
| B.5 | Memory metrics | Per-render Chromium peak < 300 MB (per D-2 hard constraint). If >300 MB, report and stop. |
| B.6 | TR test merchant share email | Email sent successfully; recipient sees message + PDF attached |
| B.6 | Resend webhook fires | `email.delivered` (and possibly `email.opened`) hits `/api/webhooks/resend`; `InsightShare.deliveredAt` stamped |

### Final exit criteria

D-2.5 is complete only when:
- All 18 PDFs render correctly with no Chromium errors
- Existing functionality (AI brief, login, share endpoints, notifications, web-push registration) all confirmed working
- Memory peak per render stays under 300 MB
- Cleanup test recipient is removed via `npm run cleanup:test-merchants`

---

## A.5 — Rollback plan

Rollback procedure is **per-strategy** since they touch different files.

### If Strategy A is in production and needs rollback

Single revert restores baseline:
```bash
git revert <commit-sha-of-aptPkgs-addition>
git push origin main
```

Railway redeploys from clean nixpacks.toml. Total downtime: ~2-3 min. Backend returns to current state (PDFs broken, everything else working).

### If Strategy B is in production and needs rollback

Two-step:
```bash
# 1. Revert the railway.toml + Dockerfile changes
git revert <commit-sha-of-strategy-B>
git push origin main

# 2. If the dashboard builder is set to DOCKERFILE, Mehmet flips it back
#    to NIXPACKS in Railway dashboard before the next push lands
#    (otherwise next build will look for Dockerfile that no longer exists)
```

Total downtime: ~3-5 min. Backend returns to current state.

### Catastrophic rollback (any strategy fails to deploy at all)

Railway's UI offers "Redeploy from previous deployment" — instant cutover to the last successful image. Use that as the emergency lever rather than git revert + wait-for-deploy. Per the runbook, Mehmet has access; agent does not.

---

## A.6 — Hard-constraint reminders

Per sprint spec:

- **No autonomous Phase B execution.** Every B-step is an explicit checkpoint requiring a "go" message.
- **Single-purpose commits.** Each B-step is one commit at most.
- **No deps additions** without sign-off (Strategy C would add `puppeteer-core` + `@sparticuz/chromium` — flagged in §A.3 as needing separate approval).
- **No Node version changes** without sign-off (Strategy C would bump from 20 → 22 — same).
- **No `package.json` engines additions** without approval.
- **If any step fails, stop.** Capture the failure log verbatim, report, await direction.
- **Rollback path tested.** Both A and B reversion paths above are clean single-revert flows. We pre-stamp the rollback commit's parent SHA before pushing the fix so we can revert by SHA, not by commit message.

---

## Approvals (resolved)

Per Mehmet's reply on 2026-05-10:

1. **Railway dashboard Builder** — confirmed `NIXPACKS`, no override. Recorded in §A.1.
2. **Strategy A approved as default first attempt.** Single focused commit adding the 36-package list to `nixpacks.toml` `[phases.setup].aptPkgs`, no unrelated changes.
3. **Strategy B approved as fallback** — if A fails (Nixpacks silently drops `aptPkgs` again, OR build succeeds but Chromium still can't load shared libs), proceed to add a `Dockerfile` + flip `railway.toml` `builder` to `DOCKERFILE`. Same single-focused-commit discipline.
4. **Strategy C deferred indefinitely.** No Node 22 bump in this sprint. If both A and B fail, **stop and ask** before touching the Node version.
5. **Test invoice for B.4** — any of the 12 seeded `test+tr@finsuite.zyrix.co` merchant invoices (from D-1's seed). Agent picks the first available at B.4 time.

## Phase B execution plan (pending per-step "go" messages)

| Step | Action | Awaiting "go" message |
|---|---|---|
| B.1 | Capture pre-fix snapshot doc + verify ai-brief baseline | "go on B.1" |
| B.2 | Apply Strategy A: edit `nixpacks.toml` to add the 36 `aptPkgs`, push as one commit | "go on B.2" |
| B.3 | Watch Railway deploy, confirm `/health` 200 + ai-brief unchanged + no shared-library errors | "go on B.3" |
| B.4 | Hit `/api/invoices/:id/pdf` with first seeded test+tr invoice; expect PDF buffer | "go on B.4" |
| B.5 | Generate the 18-PDF sample matrix, capture sizes/timings/memory | "go on B.5" |
| B.6 | Trigger D-3 share email end-to-end, confirm Resend webhook fires + InsightShare timestamps stamp | "go on B.6" |
| B.7 | Write completion report + cleanup test recipient | "go on B.7" |

If Strategy A fails at B.3 (deploy succeeds but Chromium still missing libs) or B.4/B.5 (still 500s), agent stops and reports verbatim. Mehmet then approves Strategy B fallback as a fresh single commit (delete `aptPkgs` re-add, replace with `Dockerfile` + `railway.toml builder = "DOCKERFILE"`).

Status: **Phase A complete. Awaiting "go on B.1" before any Phase B work begins.**
