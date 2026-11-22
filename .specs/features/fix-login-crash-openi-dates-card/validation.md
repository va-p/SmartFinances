# Fix login crash, OpenI dates, card labels — Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/fix-login-crash-openi-dates-card/spec.md`
**Diff range (app)**: `6b344b4..fb47436` (4 commits: `8695b48`, `8a1d297`, `5ffa460`, `fb47436`)
**Diff range (backend)**: `423f339..68fa251` (1 commit: `68fa251`)
**Verifier**: standalone fresh-eyes pass (no sub-agents dispatched; sensor run in disposable worktrees, real trees verified clean after)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| Crash root fix + card labels | ✅ Done | `8695b48` |
| Details formatter call | ✅ Done | `8a1d297` |
| Skeleton rename | ✅ Done | `5ffa460` |
| Backend date resolution + validation | ✅ Done | `68fa251` |
| Spec traceability | ✅ Done | `fb47436` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CRASH-01: sign in mounts `(app)` without "Element type is invalid" | zero runtime-undefined component imports; missing `AmountGroup` export reproduced the exact reported error, fixed code renders | `src/__tests__/components/creditCardListItem.spec.tsx:42` - `expect(screen.getByText('Fatura atual')).toBeTruthy()` (renders only if `AmountGroup` import resolves) | ✅ PASS |
| CRASH-02: every post-login import resolves | static audit over full `src` reports no other runtime-undefined component import | audit run 2026-11-15: 1 finding (`AmountGroup`), fixed; `src/components/CreditCardListItem/styles.ts:28` - `export const AmountGroup` | ✅ PASS |
| CRASH-03: no function-as-child in details | formatter called, date string renders | `src/screens/BankingIntegrationDetails/index.tsx:152` - `{formattedLastSyncDate()}` | ✅ PASS |
| DATE-01: real date persisted | stored `transactionDate` equals provider real date | `src/__tests__/bankingSync.service.test.ts:555` - `assert.equal(new Date(...transactionDate).toISOString(), "2026-11-13T10:00:00.000Z")` | ✅ PASS |
| DATE-02: unparseable date skipped, never today | bad row skipped, only good row imported | `src/__tests__/bankingSync.service.test.ts:549` - `assert.equal(result.imported, 1)` + `:558-561` - only `t-good` stored | ✅ PASS |
| DATE-03: alternate date key resolved | `date` wins over sync-time `transactionAt` | `src/__tests__/openi.service.test.ts:398` - `assert.equal(result.transactions[0].transactionAt, "2026-10-05T14:00:00.000Z")` | ✅ PASS |
| CARD-01: "Fatura atual" over balance | label present with value | `src/__tests__/components/creditCardListItem.spec.tsx:42` + `:44` | ✅ PASS |
| CARD-02: "Limite disponível" over limit | label present with value | `src/__tests__/components/creditCardListItem.spec.tsx:43` + `:45` | ✅ PASS |
| CARD-03: hidden mode masks values, keeps labels | 2+ masks, labels present, value absent | `src/__tests__/components/creditCardListItem.spec.tsx:54-57` | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

Scratch-only mutations (disposable worktrees, discarded; real-tree porcelain verified unchanged after).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | backend `src/services/openi.service.ts:resolveTransactionDate` | Short-circuit to `transactionAt` first (old priority) | ✅ Killed — `prefers the real date key…` fails, other 22 pass |
| 2 | backend `src/services/bankingSync.service.ts:importTransactionBatch` | `if (isNaN(...))` → `if (false)` (disable skip) | ✅ Killed — `skips rows with unparseable dates…` fails (imports 2, not 1) |
| 3 | app `src/components/CreditCardListItem/index.tsx:34` | `"Fatura atual"` → `"Fatura errada"` | ✅ Killed — 2 label tests fail |
| 4 | app `src/components/CreditCardListItem/styles.ts:28` | `AmountGroup` export removed (original crash shape) | ✅ Killed — all 3 tests fail with the exact reported error: "Element type is invalid … got: undefined" |

**Sensor depth**: lightweight (4 targeted behavior-level mutations)
**Result**: 4/4 killed — PASS ✅

---

## Interactive UAT Results

Not performed. The iOS device crash needs a production install run by the user (sandbox has no simulator/EAS build). Requested user check: sign in on iOS → tabs mount, open Contas → credit-card items show both labels.

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | iOS sign-in, no crash | ⏭️ Skip | needs device build |
| 2 | Card labels visible | ⏭️ Skip | needs device build |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (pre-existing `LESSONS.md`/`lessons.json`/`pbxproj` mods untouched, uncommitted) |
| No scope creep | ✅ |
| Matches patterns | ✅ (RNTL + ThemeProvider, node:test + assert) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | ✅ (repo test patterns; "none - strong defaults applied" for backend date logic) |

---

## Edge Cases

- [x] `hideAmount` masks values, labels stay (CARD-03 test)
- [x] Missing `availableCreditLimit` renders `—`, no crash (edge test)
- [x] Unparseable provider date skips with warn, never `now()` default (DATE-02 test)
- [x] `profile.spec.tsx` env-broken suite unchanged (pre-existing, documented in `STATE.md`, native-module load failure unrelated to this diff)

---

## Gate Check

- **App gate**: `yarn jest --watchman=false` → 470 passed, 0 failed; 1 suite fails to load (`profile.spec.tsx`, pre-existing env breakage)
- **App lint (touched files)**: 0 errors
- **App bundle**: `expo export --platform ios` succeeds
- **Backend gate**: `tsc --noEmit` clean; `openi.service` 23/23 pass; `bankingSync.service` 30/30 pass
- **Test count before**: app 449 pass (per STATE baseline, + env-broken suite); after: 470 pass (incl. 3 new card tests; suite growth from branch). Backend: +3 new date tests, all green.

---

## Fix Plans

None. No gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CRASH-01/02/03 | Implementing | ✅ Verified |
| DATE-01/02/03 | Implementing | ✅ Verified |
| CARD-01/02/03 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (code) + device UAT pending for the iOS crash confirmation.

**Spec-anchored check**: 9/9 ACs matched with `file:line` evidence.
**Sensor**: 4/4 mutations killed.
**Gate**: app 470 pass, backend suites green, lint/bundle clean.

**What works**: crash root removed (`AmountGroup` defined; audit clean), card labels shipped, real OpenI dates resolved with skip-on-invalid, two latent render bugs fixed.

**Issues found**: none blocking. The already-imported wrong-date rows still need a backfill decision (out of scope).

**Next steps**: user installs an iOS build from this branch and confirms sign-in + Contas screen; on pass, push branches (needs explicit go-ahead — local commits only so far).
