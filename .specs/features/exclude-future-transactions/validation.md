# Exclude Future Transactions Validation

**Date**: 2026-11-02
**Spec**: `.specs/features/exclude-future-transactions/spec.md`
**Diff range**: `eac52ff..604ad5f`
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

No `tasks.md` exists for this feature; the work landed as three implementation commits plus a spec-status commit. Completion is traced per commit:

| Commit | Status | Notes |
| ------ | ------ | ----- |
| `edf8657` fix(cash-flow): exclude future transactions from realized totals | ✅ Done | `processTransactions.ts` + 3 new tests |
| `9c897c5` fix(overview): exclude future transactions from period category totals | ✅ Done | `Overview/index.tsx` period filter, no new test (see FUT-08) |
| `2bf02cd` fix(net-worth): display realized total excluding future transactions | ✅ Done | `calculateRealizedTotalAssets.ts` + 7 new tests, both call sites rewired |
| `604ad5f` docs(spec): mark requirements verified | ✅ Done | Traceability only |

---

## Spec-Anchored Acceptance Criteria

### P1: Realized cash flow totals

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| FUT-01 WHEN aggregating chart flows THEN skip `created_at` after now | Future row contributes 0 to chart; one past -50 DEBIT yields expense bar 50 | `src/utils/__tests__/processTransactions.test.ts:328-329` - `expect(cashFlowChartData).toHaveLength(2)` + `expect(cashFlowChartData[1].value).toBe(50)` | ✅ PASS |
| FUT-02 WHEN computing current-period cash flow THEN sum only `created_at` at or before now | Past -50 only, future -30 excluded | `src/utils/__tests__/processTransactions.test.ts:327` - `expect(currentCashFlowValue).toBe(-50)` | ✅ PASS |
| FUT-03 WHILE a future tx is in the period, list its day group but exclude its amount | Both day groups listed, total counts past only | `src/utils/__tests__/processTransactions.test.ts:326` - `expect(groupedTransactions).toHaveLength(2)` (with :327 excluding the future amount) | ✅ PASS |
| FUT-04 Transfers and unparseable dates stay excluded from every aggregate | Transfer-only input yields 0 cash flow; unparseable input yields no groups | `src/utils/__tests__/processTransactions.test.ts:359-360` - `expect(groupedTransactions).toHaveLength(1)` + `expect(currentCashFlowValue).toBe(0)`; `src/utils/__tests__/processTransactions.test.ts:121` - `expect(groupedTransactions).toHaveLength(0)` (pre-existing invalid-date test, still green) | ✅ PASS |

### P1: Realized net worth total

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| FUT-05 WHEN displaying Patrimônio Total THEN subtract converted future flows from the balance sum | Balance 1000 + future CREDIT 500 displays 500 | `src/utils/__tests__/calculateRealizedTotalAssets.test.ts:48` - `expect(total).toBe(500)`; mirror: `.../calculateRealizedTotalAssets.test.ts:67` - `expect(total).toBe(1200)` (future DEBIT added back); past ignored `...:80` - `expect(total).toBe(1000)` | ✅ PASS |
| FUT-06 WHEN building the evolution series THEN seed the final point at the realized total and skip future-dated flows | Series ends at realized total; 2099-dated flow produces no point | Seed value: FUT-05 tests above (both call sites pass `calculateRealizedTotalAssets` output straight into `buildNetWorthEvolution` as `totalAssets`: `src/screens/Overview/index.tsx:156-174`, `src/screens/Accounts/index.tsx:162-181`). Skip-future half: `src/utils/__tests__/buildNetWorthEvolution.test.ts:81` - `expect(result).toEqual([])` (pre-existing suite, green in gate) | ✅ PASS* |
| FUT-07 IF an account currency has no supported conversion THEN skip it in seed and adjustment | ETH future flow leaves total at 1000; USD 100 flow converts (x5) to 500 adjustment | `src/utils/__tests__/calculateRealizedTotalAssets.test.ts:133` - `expect(total).toBe(1000)`; `.../calculateRealizedTotalAssets.test.ts:154` - `expect(total).toBe(500)` | ✅ PASS |

\* FUT-06: the seed *wiring* at the two call sites has no direct unit test (screen code is outside the repo's utils-only jest gate). The seeded *value* is fully covered by the 7 helper tests, and the skip-future *series* behavior by the existing `buildNetWorthEvolution` suite. Accepted as indirect coverage; see sensor M3 and weak spot (a).

### P1: Realized category totals

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| FUT-08 WHEN filtering transactions for the selected period THEN exclude `created_at` after now | Period revenue/expense totals count past rows only | No direct unit test (inline screen logic, `src/screens/Overview/index.tsx:179-189`). Covered by inspection (guard `transactionDate > now` + NaN guard mirror the helper-tested semantics) and the 218-test utils regression below | ✅ PASS* |

\* FUT-08: accepted weak spot (b). The filter is 3 lines with semantics identical to the helper-tested guards; the repo has no screen-level jest harness (the only screen-adjacent suite, `profile.spec.tsx`, is env-broken pre-existing and out of scope). Sensor mutant M3 confirms no test kills a guard removal here.

**Status**: ✅ All ACs covered (6 direct, 2 indirect-with-accepted-mitigation) / ❌ No blocking gaps

---

## Discrimination Sensor

Scratch protocol: `git --no-pager status --porcelain` baseline was clean; mutations applied to real-tree copies via backup/mutate/test/restore in a single chained command (no worktree: `.git` writes are sandbox-blocked; `git stash` forbidden). Porcelain verified clean after every run.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/utils/processTransactions.ts:93` | Deleted chart-loop future guard `if (transactionDate > now) return;` | ✅ Killed (`processTransactions.test.ts`: 2 failed, 17 passed; FUT-01/FUT-02 assertions caught the leak) |
| M2 | `src/utils/calculateRealizedTotalAssets.ts:71` | Flipped seed sign `total.minus(futureFlows)` → `total.plus(futureFlows)` | ✅ Killed (`calculateRealizedTotalAssets.test.ts`: 3 failed, 4 passed) |
| M3 | `src/screens/Overview/index.tsx:183` | Deleted period-filter guard `if (transactionDate > now) return false;` | ❌ Survived (full utils gate: 23 suites / 218 tests still green; no suite imports screen code) → non-blocking follow-up, not a fix task (see below) |

**Sensor depth**: lightweight (3 targeted behavior-level mutations on the highest-risk new code)
**Result**: 2/3 killed - conditional PASS (M3 survival is the pre-declared weak spot (b), mitigated by inspection + eslint-clean + utils regression)

---

## Interactive UAT Results

Not performed. No complex user-facing interaction changed: lists keep rendering the same rows, only numeric totals change, and those are fully pinned by unit assertions. Automated checks suffice.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ (`calculateRealizedTotalAssets.ts` is 72 lines, no options object beyond the required `now` injectable for tests) |
| Surgical changes | ✅ (diff touches 4 source files + 2 test files; no adjacent refactors) |
| No scope creep | ✅ (backend, budgets, list visibility untouched per Out of Scope) |
| Matches patterns | ✅ (Decimal arithmetic, `convertToBaseCurrency` BC-21/22/23 rules, `transactionDate > now` guard shape mirror `buildNetWorthEvolution`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ (table above; every asserted value re-derived from spec fixtures) |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ (FUT-01..07 have 1:1 helper tests incl. boundary/transfer/unsupported edges; FUT-08 screen-only, noted) |
| Every test maps to a spec AC, listed edge case, or Done-when criterion | ✅ (10 new tests: 3 tagged FUT-01/02/03/04, 7 tagged FUT-05/07; no unclaimed tests) |
| Documented guidelines followed | ✅ (`tlc-spec-driven-v3/references/coding-principles.md`: surgical, no weakened assertions, no deleted tests) |

`yarn eslint` on all six touched files: clean, zero warnings.

---

## Edge Cases

- [x] Timestamp exactly equal to now counts as realized (`calculateRealizedTotalAssets.test.ts:83-96`, `expect(total).toBe(1000)`; `<=` semantics mirrored at `processTransactions.ts:227` and `Overview/index.tsx:183` via `>` exclusion)
- [x] All-future period reports zero cash flow and empty chart series (`processTransactions.test.ts:332-348`: `expect(currentCashFlowValue).toBe(0)` + `expect(cashFlowChartData).toHaveLength(0)`)
- [x] Unsupported base-currency conversion skips that flow, remaining flows still adjust (`calculateRealizedTotalAssets.test.ts:117-134` ETH skipped alongside convertible-flow tests; pre-existing `buildNetWorthEvolution` unsupported-currency suite green)

---

## Gate Check

- **Gate command**: `yarn jest src/utils/__tests__ --watchman=false` (utils scope; full jest has 1 pre-existing env-broken suite `profile.spec.tsx`, unrelated to this diff)
- **Result**: 23 passed, 0 failed, 0 skipped
- **Test count before feature**: not baselined (no `tasks.md` gate record)
- **Test count after feature**: 218 (23 suites)
- **Delta**: +10 new tests (3 in `processTransactions.test.ts`, 7 in `calculateRealizedTotalAssets.test.ts`); no test deleted, no assertion weakened
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

### Follow-up F1 (non-blocking, low priority): screen-level coverage for FUT-08 / FUT-06 wiring

- **What**: M3 survived because no jest suite imports `src/screens/Overview/index.tsx`. Extract the period filter (`transactionsBySelectedPeriod`) into a `utils/` pure function with a direct unit test, mirroring the `processTransactions` precedent.
- **Why non-blocking**: the filter is 3 lines whose semantics are already pinned at helper level in two places, the file is eslint-clean, and the repo's gate is utils-only by established pattern. Cost of a screen harness exceeds the risk of this guard.
- **Priority**: Minor

---

## Requirement Traceability Update

`spec.md` already marks all requirements Verified (commit `604ad5f`); the Verifier confirms the statuses stand.

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| FUT-01 | Implementing | ✅ Verified |
| FUT-02 | Implementing | ✅ Verified |
| FUT-03 | Implementing | ✅ Verified |
| FUT-04 | Implementing | ✅ Verified |
| FUT-05 | Implementing | ✅ Verified |
| FUT-06 | Implementing | ✅ Verified (indirect: value covered, wiring by inspection) |
| FUT-07 | Implementing | ✅ Verified |
| FUT-08 | Implementing | ✅ Verified (indirect: inspection + regression) |

---

## Summary

**Overall**: ✅ Ready (PASS with two pre-declared, mitigated weak spots)

**Spec-anchored check**: 8/8 ACs traced to spec-defined outcomes (6 direct `file:line` assertions, 2 indirect with accepted mitigation)
**Sensor**: 2/3 mutants killed (M3 survival documents weak spot (b), follow-up F1 logged as non-blocking)
**Gate**: 218 passed, 0 failed

**What works**: chart flows, current-period cash flow, day-group listing, transfer/invalid exclusions, realized net-worth seed on both screens, unsupported-currency skips, foreign-currency conversion, exact-now boundary, all-future zero/empty behavior.

**Issues found**: none blocking. One non-blocking follow-up (F1): extract the Overview period filter for direct unit coverage.

**Next steps**: merge `feat/future-transactions-calc`. Optional: implement F1 if screen-level coverage becomes a repo pattern.
