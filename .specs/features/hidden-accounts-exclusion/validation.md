# Hidden Accounts Exclusion Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/hidden-accounts-exclusion/spec.md`
**Diff range**: Frontend `69a02b4..HEAD` (branch `fix/hidden-accounts`, 11 commits T2–T12); backend `c829fbe` (branch `fix/hidden-accounts`, 1 commit T1)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 backend payload (`hide` on 3 endpoints + related leg) | ✅ Done | 4 new integration cases, backend `yarn test:unit` 493/493 |
| T2 shared predicate | ✅ Done | 9 unit cases pass |
| T3 `processTransactions` pre-filter | ✅ Done | 2 new hidden-row cases pass |
| T4 `buildNetWorthEvolution` skip | ✅ Done | 1 new hidden-row case passes |
| T5 `calculateRealizedTotalAssets` back-out skip | ✅ Done | 1 new hidden-future-flow case passes |
| T6 `groupTransactionsByDate` skip | ✅ Done | 1 new hidden-row case passes |
| T7 budget spend + `formatTransactions` regression pin | ✅ Done | 2 new cases pass |
| T8 subscription candidates | ✅ Done | 1 new hidden-row case passes |
| T9 Overview pre-filter | ✅ Done | Wiring only per matrix (no screen test); build gate green |
| T10 widget snapshot pre-filter | ✅ Done | 1 new hidden-row case passes |
| T11 transaction pickers (3 × one-line conjunction) | ✅ Done | Wiring only per matrix (no unit test); build gate green |
| T12 goal pickers (3 × one-line conjunction) | ✅ Done | Wiring only per matrix (no unit test); build gate green |

All 12 tasks complete. Every `Done when` checkbox in `tasks.md` is checked and was re-verified against the diff and test files.

---

## Spec-Anchored Acceptance Criteria

### P1: Hidden transactions disappear from every transaction list

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Home list renders THEN exclude rows with `account.hide = true` | Zero hidden rows in `groupedTransactions` | `src/utils/__tests__/processTransactions.test.ts:476-477` — `expect(groupedTransactions).toHaveLength(1)` + `expect(groupedTransactions[0].data.map((t) => t.id)).toEqual([1])`; impl `src/utils/processTransactions.ts:88` | ✅ PASS |
| WHEN TransactionsByCategory list renders THEN exclude rows with `hide = true` | Zero hidden rows (routes through `processTransactions` per design) | Same util contract as above (`processTransactions.ts:88` pre-filter feeds all category lists); wiring layer per matrix (build gate only) | ✅ PASS |
| WHEN BudgetDetails history renders THEN exclude rows with `hide = true` | Hidden rows absent from `budget_transactions` | `src/utils/__tests__/budgetCalculations.test.ts:406` — `expect(result.budget_transactions.map((t) => t.id)).toEqual([1])`; impl `src/utils/budgetCalculations.ts:133-135` | ✅ PASS |
| WHEN TransactionSelect + subscription candidates render THEN exclude rows with `hide = true` | Hidden credit/debit row not offered | `src/utils/__tests__/subscriptionDesignation.test.ts:117-119` — `expect(selectSubscriptionCandidates([visible, hiddenAccount])).toEqual([visible])`; impl `src/utils/subscriptionDesignation.ts:94`; existing screen spec `src/__tests__/screens/transactionSelect.spec.tsx` still green (no regression) | ✅ PASS |
| WHILE `hide = true` keep listing on AccountsList (manual) + BankingIntegrationDetails | Management surfaces unchanged | No-change verified: neither file appears in `69a02b4..HEAD --name-only`; full gate green | ✅ PASS |
| WHILE `hide = true` exclude from Accounts list, InstitutionDetails list, every picker | Hidden accounts not selectable anywhere except management screens | Pickers: `src/screens/AccountSelect/index.tsx:62`, `src/screens/AccountFilterSelect/index.tsx:71`, `src/screens/AccountDestinationSelect/index.tsx:55`, `src/screens/GoalAccountSelect/index.tsx:45`, `src/screens/GoalDetails/index.tsx:137`, `src/screens/RegisterGoalMovement/index.tsx:101` — each `!account.isVirtual && !account.hide`; Accounts/InstitutionDetails: pre-existing exclusion untouched (absent from diff); wiring layer per matrix (inspection + build gate, no unit assertion) | ✅ PASS |

### P1: Hidden transactions leave every balance and chart

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Home cash-flow total + chart aggregate THEN exclude hidden flows | Hidden `-100` contributes 0; `currentCashFlowValue === -50`; visible output byte-identical | `src/utils/__tests__/processTransactions.test.ts:478` — `expect(currentCashFlowValue).toBe(-50)`; `:505-507` — `after.groupedTransactions/currentCashFlowValue/cashFlowChartData` `toEqual(before…)` | ✅ PASS |
| WHEN Accounts realized total + net-worth chart aggregate (incl. future back-out) THEN exclude hidden | Future hidden flow moves nothing; hidden period flow contributes 0; series still ends at `totalAssets` | `src/utils/__tests__/calculateRealizedTotalAssets.test.ts:173` — `expect(total).toBe(1000)`; impl `:55`; `src/utils/__tests__/buildNetWorthEvolution.test.ts:366-369` — hidden +500 ignored, `toEqual([{…900},{…1000}])`; impl `src/utils/buildNetWorthEvolution.ts:112` | ✅ PASS |
| WHEN Overview category totals + patrimonial evolution aggregate THEN exclude hidden | Category totals and chart inherit the pre-filter | Impl `src/screens/Overview/index.tsx:155-156` (`visibleTransactions`), `:186` (period filter on visible), `:164` + `:297` (visible into realized-total seed and evolution); behavior asserted at util layer (T4/T5/T7 tests above); wiring layer per matrix (no screen test) | ✅ PASS |
| WHEN budget spent + percentage compute THEN exclude hidden | `amount_spent === 100`, `percentage === 10` (hidden −500 contributes 0) | `src/utils/__tests__/budgetCalculations.test.ts:404-405` — `expect(result.amount_spent).toBe(100)` + `expect(result.percentage).toBe(10)` | ✅ PASS |
| WHEN widget snapshot aggregates THEN exclude hidden from cash-flow, spark, donut | Income `6.450,00`, expenses `-50,00`, spark `[-6400, 0]`, donut only visible `50` | `src/widgets/__tests__/buildWidgetSnapshot.test.ts:295-296` income/expenses; `:299` spark; `:300-302` donut; impl `src/widgets/buildWidgetSnapshot.ts:288-290` | ✅ PASS |
| Keep excluding hidden balances from `calculateTotalAssets` + widget institutions | Hidden balance `999` never counts; hidden accounts absent from institution groups | `src/utils/__tests__/calculateTotalAssets.test.ts:50` — `expect(total).toBe(100)` (pre-existing, still green); `src/widgets/buildWidgetSnapshot.ts:247` — `.filter((account) => !account.hide)` (pre-existing, untouched) | ✅ PASS |

### P1: Backend exposes the hide flag on transaction payloads

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN `GET /transaction` returns rows THEN include `account.hide` boolean | `true` on hidden row, `false` on visible row | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1180-1181` — `assert.equal(body[0].account.hide, true)` + `assert.equal(body[1].account.hide, false)`; impl `src/controllers/transaction.controller.ts:118` | ✅ PASS |
| WHEN `GET /transaction/by-category` returns rows THEN include `account.hide` | Same `true`/`false` pair | `transaction.controller.test.ts:1200-1201` — identical pair assertions; impl `transaction.controller.ts:1099` | ✅ PASS |
| WHEN `GET /transaction/:id` returns a row THEN include `account.hide` on row + related leg | Row `true`, related leg `false` | `transaction.controller.test.ts:1241-1242` — `assert.equal(body.account.hide, true)` + `assert.equal(body.related_transaction.account.hide, false)`; impl `transaction.controller.ts:209,241` | ✅ PASS |
| IF account missing THEN return row without `hide`, no failure | `account?.hide === undefined`, 1 row returned | `transaction.controller.test.ts:1259` — `assert.equal(body[0].account?.hide, undefined)` (with `:1258` length 1); impl null-safe ternaries at `transaction.controller.ts:106-121,203-214,234-246,1094-1102` | ✅ PASS |

**Status**: ✅ All ACs covered, every asserted value matches the spec-defined outcome exactly. No spec-precision gaps (all outcomes in the spec are exact).

---

## Discrimination Sensor

Scratch-only: each mutant injected into a same-dir backup copy workflow (backup → mutate → test → `cp` restore → `diff -q` byte-identical → `rm` backup). `git --no-optional-locks status --porcelain` was empty before the first mutation and empty after the last, on both repos.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/utils/hiddenAccounts.ts:17` | Flipped `hide === true` → `hide !== true` | ✅ Killed — `hiddenAccounts.test.ts`: 8 failed / 1 passed |
| M2 | `src/utils/processTransactions.ts:88` | Dropped `excludeHiddenAccountTransactions` pre-filter (`= transactions`) | ✅ Killed — `processTransactions.test.ts`: 1 failed (`byte-identical` chart assertion). Note: the *list* assertions survived because the T6 `groupTransactionsByDate` guard redundantly drops hidden rows from groups/day totals — defense-in-depth working as designed; the `cashFlowChartData` assertion is the discriminating one for this site |
| M3 | `src/utils/subscriptionDesignation.ts:94` | Replaced `!isHiddenAccountTransaction(transaction)` with `true` | ✅ Killed — `subscriptionDesignation.test.ts`: 1 failed (`excludes transactions on hidden accounts`) |
| M4 | `src/utils/budgetCalculations.ts:133-135` | Dropped `excludeHiddenAccountTransactions` pre-filter | ✅ Killed — `budgetCalculations.test.ts`: 1 failed (`amount_spent`/history assertion) |
| M5 | `smart-finances-backend/src/controllers/transaction.controller.ts:118,209,241,1099` | Returned `hide: false` constant on all four payload sites | ✅ Killed — `transaction.controller.test.ts`: 3 failed (the three `hide === true` assertions; AC4 missing-account case still passes as specified) |

**Sensor depth**: lightweight fault-injection (4 frontend + 1 backend targeted behavior-level mutations on the highest-risk new code)
**Result**: 5/5 killed — ✅ PASS, no surviving mutants.

---

## Interactive UAT Results (if performed)

Not performed — no complex user-facing flow changes (one-line wiring + util guards); automated checks per matrix are the specified verification. No UAT required.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One 29-line predicate + one-line guards per site; backend additive field only |
| Surgical changes | ✅ Diff surface = 8 util/widget/screen-logic files + 6 picker one-liners + backend controller; `AccountsList`/`BankingIntegrationDetails`/`InstitutionDetails`/`Accounts` correctly untouched |
| No scope creep | ✅ No toggle-UX, deletion, linking, or server-filter changes (all out-of-scope items respected) |
| Only touched files required for task | ✅ (+ `tasks.md` checkbox bookkeeping, which is process metadata, not product code) |
| Didn't "improve" unrelated code | ✅ Backend `account: … ? {…} : …` null-safe shape is required by AC4, not a drive-by |
| Matches existing patterns/style | ✅ Skip-guard style mirrors adjacent guards; picker `&& !account.hide` mirrors `InstitutionDetails` precedent; `HIDE-xx` comments at every site |
| Would senior engineer approve? | ✅ |
| Tests map to acceptance criteria and are non-shallow | ✅ Spot-check: `processTransactions` byte-identical test asserts all three outputs; widget test asserts exact spark array `[-6400, 0]` |
| Spec-anchored outcome check (asserted values match spec) | ✅ All exact-value assertions match spec outcomes (tables above) |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Utils/widget 1:1 per matrix; backend 3 endpoints + missing-account; wiring layers inspection + gate per matrix |
| Every test maps to a spec AC, listed edge case, or Done-when criterion | ✅ All 18 new frontend + 4 new backend cases carry `HIDE-xx` tags; no unclaimed tests |
| Documented project quality/testing guidelines followed | ✅ none - strong defaults applied (no AGENTS.md/CONTRIBUTING.md; per tasks.md matrix) |

---

## Edge Cases

- [x] All accounts hidden → zero totals + empty lists, no errors: `src/utils/__tests__/hiddenAccounts.test.ts:59` — `expect(excludeHiddenAccountTransactions([hidden])).toEqual([])` (empty in, empty out); zero-total paths covered by existing empty-state tests (widget zero totals, `buildNetWorthEvolution` empty series) with the full gate green.
- [x] Unhidden → included in next computation, no restart: filters are stateless pure functions (no cache anywhere in the diff); inclusion proven by `hiddenAccounts.test.ts:46-48` (order-preserving inclusion of visible rows) + `processTransactions.test.ts:505-507` (visible output identical with/without hidden rows present).
- [ ] Transfer with one leg hidden → per-leg filtering: **no dedicated `TRANSFER_*` × `hide: true` assertion exists** (all hidden-row fixtures use CREDIT/DEBIT). Behavior holds by construction — the pre-filter in `processTransactions`/`budgetCalculations`/widget/Overview is type-agnostic (proven by `hiddenAccounts` fixtures that carry no `type` at all), and the in-loop skip-guards sit alongside the existing transfer exclusions — but it is not pinned. Non-blocking hardening; see Fix 1.
- [x] No account data → existing handling unchanged: `hiddenAccounts.test.ts:22-28` (null/missing → visible); `buildNetWorthEvolution.test.ts:191-202` (null account skipped); backend `transaction.controller.test.ts:1248-1259` (missing account, no failure).

---

## Gate Check

- **Frontend**: `yarn jest --watchman=false` (from `SmartFinances/`) → **504 passed, 0 failed**; suites 61 passed / 1 failed: `src/__tests__/screens/profile.spec.tsx` fails at require time on `NativeEventEmitter` env grounds with **0 tests affected** — the documented pre-existing baseline, unrelated to this diff.
- **Backend**: `yarn test:unit` (from `smart-finances-backend/`) → **493 passed, 0 failed**, 22 suites, 0 skipped.
- **Test count before feature**: not re-measured in this session; plan-time baseline in `tasks.md` is 449 passed + the same 1 env-broken suite (stale — intervening features have since grown the suite).
- **Test count after feature**: frontend 504 passed; backend 493 passed.
- **Delta in this diff**: +18 frontend cases (9 hiddenAccounts + 2 processTransactions + 1 net-worth + 1 realized-total + 1 date-grouping + 1 budget + 1 formatTransactions + 1 subscription + 1 widget) and +4 backend cases (HIDE-06 ×4). Counted from the diff; no test files were deleted and no assertion was weakened.
- **Skipped tests**: none.
- **Failures**: none (outside the known env-broken suite).

---

## Fix Plans (if issues found)

### Fix 1 (hardening, non-blocking): pin TRANSFER × hidden-account combos

- **What**: Add one hidden-leg transfer fixture to `src/utils/__tests__/processTransactions.test.ts` (hidden `TRANSFER_DEBIT` excluded from `groupedTransactions`, visible `TRANSFER_CREDIT` leg still listed per existing transfer-listing behavior) and one to `src/utils/__tests__/groupTransactionsByDate.test.ts` (hidden transfer row in no group).
- **Where**: the two test files above; no source change expected.
- **Verify**: `yarn jest src/utils/__tests__/processTransactions.test.ts src/utils/__tests__/groupTransactionsByDate.test.ts --watchman=false` — new cases pass; then re-run sensor M2 to confirm the list assertion now also discriminates the pre-filter.
- **Priority**: Minor (behavior verified by construction + sensor; closes the only unpinned spec edge case).
- **Done when**: both new cases assert exact ids/totals matching the per-leg rule in spec Assumptions.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| HIDE-01 transaction lists (Home) | Design | ✅ Verified |
| HIDE-02 transaction lists (category/budget/selectors) | Design | ✅ Verified |
| HIDE-03 balances + charts (Home/Accounts cash-flow + net worth) | Design | ✅ Verified |
| HIDE-04 balances + charts (Overview/budgets/widgets) | Design | ✅ Verified |
| HIDE-05 management surfaces unchanged | Design | ✅ Verified |
| HIDE-06 backend hide flag on payloads | Design | ✅ Verified |

(Note: `spec.md` statuses were not edited — the Verifier may only write this report. Maintainer to flip HIDE-01..HIDE-06 to ✅ Verified.)

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 ACs match spec outcomes exactly; 3/4 edge cases directly asserted, 1 (transfer per-leg) holds by construction with a non-blocking hardening fix proposed. No spec-precision gaps.

**Sensor**: 5/5 mutations killed (4 frontend utils + 1 backend).

**Gate**: frontend 504 passed / 0 failed (1 pre-existing env-broken suite, 0 tests affected); backend 493 passed / 0 failed.

**What works**: hiding an account now removes its transactions from every list (Home/category/budget/subscription-candidates), every total and chart (cash-flow, realized total, net-worth evolution, Overview totals, budget spend, widget cash-flow/spark/donut), and every picker, while AccountsList/BankingIntegrationDetails keep showing the account; backend payloads carry `account.hide` on all three endpoints with null-safe missing-account handling.

**Issues found**: one minor hardening item (Fix 1: pin TRANSFER × hidden combos in tests). No blocking gaps, no surviving mutants, no regressions.

**Next steps**: apply Fix 1 at convenience; flip HIDE-01..HIDE-06 to ✅ Verified in `spec.md`; merge `fix/hidden-accounts` on both repos.
