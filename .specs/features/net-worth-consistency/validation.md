# net-worth-consistency Validation

**Date**: 2026-10-30
**Spec**: `.specs/features/net-worth-consistency/spec.md`
**Diff range**: `f1365f3..HEAD` (branch `fix/total-net-worth-calcs`, 4 commits: `e5872c9`, `5eb2ba8`, `028ce7a`, `d9771b8`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Result: PASS**

---

## Task Completion

Tasks phase was skipped (small scope, steps implicit in Execute). The 4 atomic local commits cover the fix:

| Commit | Subject | Status |
| ------ | ------- | ------ |
| `e5872c9` | feat(net-worth): add shared total assets calculation | ✅ Done |
| `5eb2ba8` | fix(net-worth): round chart points to currency fraction digits | ✅ Done |
| `028ce7a` | fix(net-worth): unify accounts chart seed and refresh on quotes | ✅ Done |
| `d9771b8` | fix(net-worth): unify overview chart seed and refresh on quotes | ✅ Done |

No tasks.md exists for this feature, so no checkboxes to reconcile. Diff surface is 7 files (1 spec + 6 code/test), all in scope.

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| NW-01: system SHALL compute the seed via one shared `calculateTotalAssets` helper used by both screens | Both screens call the same helper; same-currency sums are Decimal-exact | `src/utils/__tests__/calculateTotalAssets.test.ts:36` - `expect(total).toBe(0.3)`; `src/screens/Accounts/index.tsx:161` - `calculateTotalAssets({ accounts: rawAccounts, ... })`; `src/screens/Overview/index.tsx:154` - `calculateTotalAssets({ accounts, ... })` | ✅ PASS |
| NW-02: WHEN monthly filter active THEN both screens plot identical totals every month | Months group oldest-to-newest and the last point equals the seed; both screens use the same seed plus the same builder so series are byte-identical for identical inputs | `src/utils/__tests__/buildNetWorthEvolution.test.ts:218` - `expect(result).toEqual([{ date: 'ago \n 2026', total: 900 }, { date: 'set \n 2026', total: 1000 }])`; `src/screens/Accounts/index.tsx:307` - `buildNetWorthEvolution({ transactions, totalAssets: totalAccountsBalance.toNumber(), ... })`; `src/screens/Overview/index.tsx:282` - `buildNetWorthEvolution({ transactions, totalAssets, ... })` | ✅ PASS |
| NW-03: WHILE base is fiat the system SHALL round every chart point to 2 fraction digits | Fiat points carry at most 2 decimals; quote-multiplication noise is rounded | `src/utils/__tests__/buildNetWorthEvolution.test.ts:271` - `expect(result).toEqual([{ date: 'ago \n 2026', total: 102.01 }, { date: 'set \n 2026', total: 100 }])`; `src/utils/buildNetWorthEvolution.ts:154` - `total: accumulatedTotal.toDecimalPlaces(fractionDigits).toNumber()` | ✅ PASS |
| NW-04: IF float noise THEN display rounded to the currency standard | The reported Overview noise `36955.469999999994` charts as `36955.47` | `src/utils/__tests__/buildNetWorthEvolution.test.ts:288` - `expect(result).toEqual([{ date: 'ago \n 2026', total: 36955.47 }])` | ✅ PASS |
| NW-05: WHEN quotes finish loading THEN recompute seed and series | Both memos depend on all 12 quote objects, so async quote arrival recomputes | `src/screens/Accounts/index.tsx:344` - memo deps list `brlQuoteBtc, brlQuoteEur, brlQuoteUsd, btcQuoteBrl, btcQuoteEur, btcQuoteUsd, eurQuoteBrl, eurQuoteBtc, eurQuoteUsd, usdQuoteBrl, usdQuoteBtc, usdQuoteEur`; `src/screens/Overview/index.tsx:316` - same 12-quote deps | ✅ PASS |

**Status**: ✅ All 5 ACs covered with spec-defined outcomes. Note on NW-05: memo invalidation is declarative and has no jest assertion target in `src/utils`; coverage is by code inspection of both deps arrays (all 12 quotes present in each). No spec-precision gap: the spec outcome (recompute on quotes load) is directly observable in the deps.

---

## Discrimination Sensor

Scratch: temp worktree `git worktree add /tmp/nw-verify HEAD`, `node_modules` symlinked, faults applied only to scratch copies, each run via `node .../jest/bin/jest.js --rootDir /tmp/nw-verify --runInBand --watchman=false <covering suite>`. Baseline `git status --porcelain` was empty (0 lines); after `git worktree remove --force /tmp/nw-verify` the real-tree porcelain diffed clean against baseline.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/utils/buildNetWorthEvolution.ts:154` | Removed rounding: `accumulatedTotal.toDecimalPlaces(fractionDigits).toNumber()` → `accumulatedTotal.toNumber()` | ✅ Killed (evo suite: 2 failed, 12 passed; fiat `102.01` and noisy-seed `36955.47` assertions tripped) |
| M2 | `src/utils/calculateTotalAssets.ts:33` | Include hidden: `.filter((account) => !account.hide)` → `.filter((account) => true)` | ✅ Killed (seed suite: 1 failed, 3 passed; `expect(total).toBe(100)` got `1099`) |
| M3 | `src/utils/buildNetWorthEvolution.ts:88` | Swapped digits: `=== 'BTC' ? 8 : 2` → `=== 'BTC' ? 2 : 8` | ❌ Survived (evo suite: 14 passed) — fixtures carry at most 2 decimals so `toNumber()` erases the 2-vs-8 difference; see hardening task below |
| M3b | `src/utils/buildNetWorthEvolution.ts:88` | Zeroed fiat digits: `=== 'BTC' ? 8 : 2` → `=== 'BTC' ? 8 : 0` | ✅ Killed (evo suite: 2 failed; `36955.47` became `36955`) — proves the digit path is enforced |

**Sensor depth**: lightweight (4 targeted behavior-level mutations on the new code).
**Sensor outcome**: 3 of 4 killed; the 1 survived is an exploratory digit-swap exposing a fixture-strength limit, not a spec violation (core rounding proved enforced by M1 and M3b).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ New helper is 50 lines (`src/utils/calculateTotalAssets.ts:1`); rounding is 1 line plus 1 const (`src/utils/buildNetWorthEvolution.ts:88`, `src/utils/buildNetWorthEvolution.ts:154`) |
| Surgical changes | ✅ Only the seed blocks and memo deps changed in both screens; unrelated list/institution/category logic untouched |
| No scope creep | ✅ Out-of-scope respected: hide/virtual rules unchanged (GOAL-25 kept, `useAccountsQuery(true)` callers intact), no chart redesign, quotes consumed as-is |
| Matches patterns | ✅ `Decimal` accumulation matches existing `buildNetWorthEvolution`/`Overview` style; `try/catch` skip mirrors BC-23 flow skipping; `convertCurrency` reuse, no new dependency |
| Would senior engineer approve? | ✅ Yes |
| Tests map to ACs, non-shallow | ✅ Each new test names its NW/BC AC; noisy-seed test uses the exact reported value `36955.469999999994` |
| Spec-anchored outcome check | ✅ Asserted values equal spec outcomes (0.3 exact, 100/150 seeds, 102.01, 36955.47) |
| Per-layer coverage met | ✅ Domain logic 1:1 (seed + series + rounding); no routes in scope |
| Every test maps to a requirement | ✅ 4 seed tests → NW-01/NW-02/edge; 3 new series tests → NW-03/NW-04/BTC edge; pre-existing tests untouched |
| Documented guidelines followed | ✅ Coding principles applied (surgical, test integrity, decided voice); no separate project testing doc — strong defaults |

---

## Edge Cases

- [x] BTC 8dp: `src/utils/__tests__/buildNetWorthEvolution.test.ts:305` - `expect(result).toEqual([{ date: 'ago \n 2026', total: 0.9 }, { date: 'set \n 2026', total: 1 }])` with `baseCurrencyCode: 'BTC'`; impl `src/utils/buildNetWorthEvolution.ts:88` selects 8 digits. Handled. Hardening note: the fixture value `0.9` is also correct at 2dp, so it does not discriminate 8-vs-2 (see M3); a future fixture with 3-8 significant decimals (e.g. `0.12345678`) would lock the digit count.
- [x] Unsupported currency skipped: `src/utils/__tests__/calculateTotalAssets.test.ts:78` - `expect(total).toBe(100)` with an `ETH` account; `src/utils/__tests__/buildNetWorthEvolution.test.ts:188` - `expect(result).toEqual([{ date: 'Sem 33 \n 2026', total: 1000 }])` with an `ETH` flow; impl catches `convertCurrency` throw (`src/utils/convertCurrency.ts:85`) in `src/utils/calculateTotalAssets.ts:44` and skips `null` in `src/utils/buildNetWorthEvolution.ts:120`. Handled.
- [x] Series ends exactly at net worth: `src/utils/__tests__/buildNetWorthEvolution.test.ts:63` weeks (`total: 1000`), `src/utils/__tests__/buildNetWorthEvolution.test.ts:218` months (Sep `total: 1000`), `src/utils/__tests__/buildNetWorthEvolution.test.ts:288` noisy seed (single point equals rounded seed). Handled.

---

## Gate Check

- **Gate command**: `npx jest src/utils --watchman=false`
- **Gate outcome**: 22 suites passed, 206 tests passed, 0 failed, 0 skipped, 0 snapshots
- **Test count before feature** (`f1365f3`): `buildNetWorthEvolution` suite 11 `it(` blocks; `calculateTotalAssets` suite did not exist
- **Test count after feature** (`HEAD`): 22 suites / 206 tests total; `buildNetWorthEvolution` suite 14 `it(` (+3 new: fiat 2dp, noisy seed, BTC 8dp); `calculateTotalAssets` suite 4 `it(` (new file)
- **Delta**: +7 new tests, 0 deleted. One line re-encoded (`Todo o \n histórico`, same value, unicode escape vs literal — not a weakening)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

### Hardening 1 (non-blocking): strengthen the BTC/fiat digit fixtures

- **Observation**: M3 swapped `? 8 : 2` to `? 2 : 8` and all 14 tests still passed, because every asserted total carries at most 2 decimals and `toNumber()` strips trailing zeros.
- **Fix task**: add one discriminating case per currency class, e.g. a fiat flow whose unrounded total has a 3rd decimal (asserts 2dp rounding) and a BTC flow whose total needs 3-8 decimals (asserts 8dp is kept, e.g. total `0.12345678` rather than `0.9`).
- **Priority**: Minor (core rounding is proved enforced by M1/M3b; this only locks the 2-vs-8 boundary).

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| NW-01 | Implementing | ✅ Verified |
| NW-02 | Implementing | ✅ Verified |
| NW-03 | Implementing | ✅ Verified |
| NW-04 | Implementing | ✅ Verified |
| NW-05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: Ready.

**Spec-anchored check**: 5 of 5 ACs matched spec outcomes, 0 precision gaps.
**Sensor**: 3 of 4 mutations killed (required set 3 of 3 killed; 1 exploratory digit-swap survived with a Minor hardening task).
**Gate**: 206 passed, 0 failed.

**What works**: One shared Decimal seed (`src/utils/calculateTotalAssets.ts:25`) feeds both charts; every plotted point is rounded to the base currency standard (`src/utils/buildNetWorthEvolution.ts:154`); the reported August/September divergence and fiat noise are covered by exact-value tests; both memos recompute on all 12 quote arrivals.

**Issues found**: One Minor hardening suggestion (digit-swap fixture strength, Fix Plans Hardening 1). No blocking gaps.

**Next steps**: Optional — apply Hardening 1 in a follow-up; no re-verification required for this fix. `validate_state.py` gate to confirm this report, then the feature is done.
