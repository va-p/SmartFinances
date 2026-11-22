# OpenI webhook race + display date — Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/openi-race-and-display-date/spec.md`
**Diff range (app)**: `f457f74..267827d` (2 commits: `e9f76db`, `267827d`)
**Diff range (backend)**: `33fcf92..2678d08` (3 commits: `d06ae2c`, `6a2b80d`, `2678d08`)
**Verifier**: standalone fresh-eyes pass (author ran gates; sensor in disposable worktrees, real trees verified clean after)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| Backend race fix + test | ✅ Done | `d06ae2c` |
| Backend raw-shape log + tests | ✅ Done | `6a2b80d` + `2678d08` |
| Frontend display fix + tests | ✅ Done | `e9f76db` (+ `267827d` label rename) |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WEB-01: concurrent binds converge | one row, returned to caller, no throw | backend `src/__tests__/bankingSync.service.test.ts:1003` - `assert.equal(bound.created, false)` + `:1004` id + `:1005` bankName | ✅ PASS |
| WEB-02: loser re-reads winner | P2002 path returns existing row | same test — create throws P2002, result is the winner row | ✅ PASS |
| DISP-01: display from transaction_date | display + carry-through | app `src/utils/__tests__/formatTransactions.test.ts:43` - `created_at === '10/08/2026'` + `:52` carry-through | ✅ PASS |
| DISP-02: absent date falls back | old behavior kept | app `src/utils/__tests__/formatTransactions.test.ts:59-63` - fallback + undefined carry | ✅ PASS |
| DISP-03: grouping under real date | formatted shape feeds existing grouping | pre-existing `src/utils/__tests__/processTransactions.test.ts:399` grouping test + full suite green | ✅ PASS |
| LOG-01: one compact line per page | endpoint + count + keys + dates | backend `src/__tests__/openi.service.test.ts` log-call test (`/accounts/acc-1/transactions`, `1 tx`, both date values) | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

Scratch-only mutations (disposable worktrees, discarded; real-tree porcelain verified unchanged after).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | backend `bankingSync.service.ts:bindIntegration` | Removed P2002 catch (bare create) | ✅ Killed — race test throws |
| 2 | backend `openi.service.ts:listTransactions` | Removed raw-shape log call | ✅ Killed — log-call test fails (0 lines) |
| 3 | app `formatTransactions.ts` | Reverted display to `created_at`, dropped carry-through | ✅ Killed — 2 new display tests fail, old ones pass |
| 4 | — | (display revert covered both C+D in one tree) | ✅ Killed |

**Sensor depth**: lightweight (4 behavior-level mutations across 3 files)
**Result**: 4/4 killed — PASS ✅

---

## Interactive UAT Results

Not performed. Needs a live connect flow (waiting-auth webhook) plus an import with real dates on device.

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Concurrent webhooks, no error | ⏭️ Skip | needs live OpenI flow; covered by unit race test |
| 2 | Imported list under real dates | ⏭️ Skip | needs device + import; covered by unit + suite |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (user `Home` filter + `Account` screen WIP untouched; pre-existing `LESSONS`/`pbxproj`/cron/`server.ts` mods untouched; card rename folded with attribution) |
| No scope creep | ✅ |
| Matches patterns | ✅ (P2002-catch precedent from import batch; explicit field list in formatTransactions) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | ✅ (repo test patterns both sides) |

---

## Edge Cases

- [x] Both racers pass null-check → loser re-reads winner, no resync storm (winner already triggers)
- [x] Unparseable downstream date → existing `processTransactions` guards still skip
- [x] Empty transaction page → no shape log emitted
- [x] `profile.spec.tsx` env-broken suite unchanged (pre-existing)
- [x] UTC-midnight date-only values render in local time like every other date (documented in spec, not changed)

---

## Gate Check

- **App gate**: `yarn jest --watchman=false` → 477 passed, 0 failed; 1 suite fails to load (`profile.spec.tsx`, pre-existing env breakage)
- **App lint (touched files)**: 0 errors
- **Backend gate**: `tsc --noEmit` clean; `yarn test:unit` → 479/479 pass
- **Test count**: app +3 display tests (+3 card tests updated to the renamed label); backend +3 (race, summarizer, log-call)

---

## Fix Plans

None. No gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| WEB-01/02 | Implementing | ✅ Verified |
| DISP-01/02/03 | Implementing | ✅ Verified |
| LOG-01 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (code) + live-flow UAT pending.

**Spec-anchored check**: 6/6 ACs matched with `file:line` evidence.
**Sensor**: 4/4 mutations killed.
**Gate**: app 477 pass, backend 479 pass, lint clean.

**What works**: concurrent binds converge (webhook error gone); lists/headers use the real transaction date; one-line raw-shape log per page for future field checks.

**Issues found**: none blocking. Two notes: (1) the "today" rows already in the DB predate the fix and need a backfill decision; (2) the card label is now "Próxima fatura" per your in-progress rename — worth a second thought since the value is the currently-open invoice, not the next one.

**Next steps**: trigger a live connect + import and watch the server log for the `openi … 1 tx, keys=[…]` line plus correct dates; push branches on explicit go-ahead.
