# fix-budget-spending-sign Validation

**Result: PASS**

**Date**: 2026-11-17
**Spec**: Small-feature inline spec supplied by the orchestrator, AC1-AC4
**Diff range**: `0c1a10a^..0c1a10a` (`e91286dbb05817924e695abab9429ce7b338f59a..0c1a10a94dde1edf7b3dbc334056225e93385b20`)
**Reviewed HEAD**: `0c1a10a94dde1edf7b3dbc334056225e93385b20` (`fix(budgets): derive spending from transaction type`)
**Verifier**: Independent Verifier; author != verifier

## Scope and Task Completion

The small feature used an inline spec and no formal `tasks.md`. The declared diff surface was independently checked and contains exactly:

- `src/utils/budgetCalculations.ts`
- `src/utils/__tests__/budgetCalculations.test.ts`
- `src/utils/__tests__/buildBudgetHistory.test.ts`

The implementation replacement at `src/utils/budgetCalculations.ts:121-122` is `const magnitude = Math.abs(amount); return transaction.type === 'CREDIT' ? -magnitude : magnitude;`. The prior account-dependent return was removed. No implementation or test files were changed during validation.

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` and assertion evidence | Result |
| --- | --- | --- | --- |
| AC1: DEBIT contributes positive absolute effective amount for BANK and CREDIT accounts | BANK DEBIT `-50` -> `50`; credit-card DEBIT `-50` -> `50`; categorized current-period Food DEBIT total -> `780.68` | `src/utils/__tests__/budgetCalculations.test.ts:245-248` - BANK fixture assertion `expect(getTransactionSpentAmount(...amount: -50)).toBe(50)`; `src/utils/__tests__/budgetCalculations.test.ts:251-256` - credit-card fixture assertion `expect(getTransactionSpentAmount(...amount: -50)).toBe(50)`; `src/utils/__tests__/budgetCalculations.test.ts:425-450` - mixed-account current-period fixture and `expect(result.amount_spent).toBeCloseTo(780.68, 2)` | PASS |
| AC2: ordinary CREDIT contributes negative absolute amount for either account; transfers remain zero | BANK CREDIT `200` -> `-200`; credit-card CREDIT `200` -> `-200`; transfer types -> `0` | `src/utils/__tests__/budgetCalculations.test.ts:259-274` - two value assertions, `expect(...BANK CREDIT...).toBe(-200)` and `expect(...creditCardAccount CREDIT...).toBe(-200)`; `src/utils/__tests__/budgetCalculations.test.ts:276-282` - `expect(...TRANSFER_CREDIT...).toBe(0)` and `expect(...TRANSFER_DEBIT...).toBe(0)` | PASS |
| AC3: current-period inclusion uses `transaction_date ?? created_at`; exact Leisure and Food totals | Leisure raw net `-33.22`, displayed spending `33.22`; Food negative-DEBIT sum displayed as `780.68`; original mixed-account reproduction was `700.36` | `src/utils/__tests__/budgetCalculations.test.ts:403-422` - amounts `[-74.7, -81.52, 200, -65, -12]`, credit-card account, current-period `transaction_date`, out-of-period `created_at`, five included rows, and `expect(result.amount_spent).toBeCloseTo(33.22, 2)`; `src/utils/__tests__/budgetCalculations.test.ts:425-451` - fourteen current-period Food rows and `expect(result.amount_spent).toBeCloseTo(780.68, 2)`; `src/utils/budgetCalculations.ts:141-142` - both boundaries evaluate `transaction.transaction_date ?? transaction.created_at` | PASS |
| AC4: history shares corrected sign and foreign-currency semantics | Credit-card `-30` DEBIT plus foreign-currency `-55` DEBIT -> `85` | `src/utils/__tests__/buildBudgetHistory.test.ts:183-205` - the exact two-transaction February fixture and `expect(history[1].amountSpent).toBe(85)`; shared-helper call at `src/utils/buildBudgetHistory.ts:41` - `amountSpent += getTransactionSpentAmount(transaction)` | PASS |

**Spec-anchored status**: 4/4 ACs matched the precise spec outcomes. No spec-precision gaps.

### Preserved Behavior and Edge Evidence

| Required preserved behavior | Evidence | Result |
| --- | --- | --- |
| `created_at` fallback and current-period filtering | `src/utils/__tests__/budgetCalculations.test.ts:301-375` - transactions without `transaction_date` use `created_at`; July `-500` is excluded, current rows total `expect(result.amount_spent).toBe(215)`, and included IDs are `[1, 3, 4, 5, 7]` | PASS |
| Boundary/date fallback | `src/utils/__tests__/budgetCalculations.test.ts:377-400` - September row is selected by `created_at`, with exact `expect(result.amount_spent).toBe(80)`; `src/utils/__tests__/buildBudgetHistory.test.ts:133-152` - period boundary rows total `100` | PASS |
| Other-category and out-of-period exclusion | `src/utils/__tests__/budgetCalculations.test.ts:309-337` and `src/utils/__tests__/budgetCalculations.test.ts:366-374` - previous-period and other-category rows contribute zero; `src/utils/__tests__/buildBudgetHistory.test.ts:155-180` - transfers, other category, and before-budget rows yield every period `amountSpent === 0` | PASS |
| Hidden-account exclusion | `src/utils/__tests__/budgetCalculations.test.ts:455-474` - `expect(result.amount_spent).toBe(100)` and `expect(result.budget_transactions.map((t) => t.id)).toEqual([1])` | PASS |
| Foreign-currency effective amount selection | `src/utils/__tests__/budgetCalculations.test.ts:285-294` - `amount: -10`, `amount_in_account_currency: -55`, exact `expect(...).toBe(55)`; `src/utils/__tests__/buildBudgetHistory.test.ts:183-205` - history includes `55` in exact `85` total | PASS |
| Transfers contribute zero | `src/utils/__tests__/budgetCalculations.test.ts:276-282` - both transfer types assert exact zero; the integration checks above also exclude transfer contributions | PASS |

## Necessary and Reverse Coverage

Every changed/new test maps to an AC or a named preservation requirement. No unclaimed test changes were found.

| Changed/new test | Reverse mapping | Assessment |
| --- | --- | --- |
| `src/utils/__tests__/budgetCalculations.test.ts:251-256` - credit-card purchase changed from `-50` to `50` | AC1 positive DEBIT magnitude on CREDIT account | Necessary and spec-precise; strengthens the old account-based expectation |
| `src/utils/__tests__/budgetCalculations.test.ts:259-274` - new BANK and credit-card CREDIT checks | AC2 negative CREDIT contribution independent of account type | Necessary and spec-precise |
| `src/utils/__tests__/budgetCalculations.test.ts:403-422` - new Leisure scenario | AC1-AC3, exact `33.22`, current `transaction_date` overriding out-of-period `created_at` | Necessary and spec-precise |
| `src/utils/__tests__/budgetCalculations.test.ts:425-451` - new Food mixed-account scenario | AC1 and AC3, exact `780.68`; original mutant reproduces `700.36` | Necessary and spec-precise |
| `src/utils/__tests__/buildBudgetHistory.test.ts:183-205` - history expectation changed from `25` to `85` | AC4 shared corrected sign plus preserved foreign-currency selection | Necessary and spec-precise; not assertion weakening |

The three net new tests explain the full `25 -> 28` delta. Existing transfer, hidden-account, category, period, and foreign-currency tests remain present and active. No test was deleted, skipped, or made less precise to accommodate the implementation.

## Gate Check

**Gate result: PASS**

- **Command**: `yarn test src/utils/__tests__/budgetCalculations.test.ts src/utils/__tests__/buildBudgetHistory.test.ts --runInBand --watchman=false`
- **Independent result**: exit `0`; 2 suites passed, 28 tests passed, 0 failed, 0 skipped, 0 snapshots.
- **Static baseline count**: 25 test declarations at `0c1a10a^` (15 in `budgetCalculations.test.ts`, 10 in `buildBudgetHistory.test.ts`).
- **Current count**: 28 tests (18 and 10 respectively), measured by Jest and cross-checked by static declaration counts.
- **Delta**: +3 tests, matching the three new test blocks.
- **Scoped quality gate**: `yarn eslint src/utils/budgetCalculations.ts src/utils/__tests__/budgetCalculations.test.ts src/utils/__tests__/buildBudgetHistory.test.ts --no-cache` exited `0`. ESLint printed its existing TypeScript 6.0.3 support warning but no lint errors.

### Full-Suite Limitation

The author-reported full Jest phase had 574 passing and 4 failing tests in unrelated environment/baseline suites: `bankingIntegrationDetails.spec.tsx` (SafeAreaProvider) and `profile.spec.tsx` (DeviceInfo native mock). Jest then hung on handles and hit its timeout. The Verifier did not rerun that non-terminating full phase and does not claim a repository-wide green suite. Only the independently rerun focused gate is this feature's completion gate.

## Discrimination Sensor

**Sensor depth**: Lightweight, three behavior-level mutants plus an unmutated scratch control.

**Isolation**: File-copy scratch at `/tmp/fix-budget-spending-sign-verifier`; the real source tree was never mutated. No worktree, stash, commit, push, or history operation was used.

**Setup commands**:

```sh
cp -R src package.json yarn.lock babel.config.js jest.setup.js tsconfig.json jest /tmp/fix-budget-spending-sign-verifier/
ln -s /Users/vap/00_code/JS/SmartFinances/node_modules /tmp/fix-budget-spending-sign-verifier/node_modules
```

**Control and per-mutant test command**:

```sh
yarn --cwd /tmp/fix-budget-spending-sign-verifier test src/utils/__tests__/budgetCalculations.test.ts src/utils/__tests__/buildBudgetHistory.test.ts --runInBand --watchman=false
```

The unmutated control exited `0`: 2 suites and 28 tests passed. Before each mutant, the scratch implementation was restored with `cp src/utils/budgetCalculations.ts /tmp/fix-budget-spending-sign-verifier/src/utils/budgetCalculations.ts`.

| Mutation | Scratch `file:line` and exact injected change | Command used to inject | Result |
| --- | --- | --- | --- |
| M1: restore original account-based sign | `src/utils/budgetCalculations.ts:121-122` - replace absolute/type-based return with `return transaction.account.type === 'CREDIT' ? amount : -amount;` | `sed -i '' -e "s/  const magnitude = Math.abs(amount);/  return transaction.account.type === 'CREDIT' ? amount : -amount;/" -e "/return transaction.type === 'CREDIT' ? -magnitude : magnitude;/d" /tmp/fix-budget-spending-sign-verifier/src/utils/budgetCalculations.ts` | KILLED: exit `1`, 5 failed / 23 passed. Leisure became `-33.22`, Food became the documented pre-fix `700.36`, history became `25`; BANK CREDIT became `200` instead of `-200`. |
| M2: invert transaction-type sign semantics | `src/utils/budgetCalculations.ts:122` - `CREDIT ? -magnitude : magnitude` -> `CREDIT ? magnitude : -magnitude` | `sed -i '' "s/return transaction.type === 'CREDIT' ? -magnitude : magnitude;/return transaction.type === 'CREDIT' ? magnitude : -magnitude;/" /tmp/fix-budget-spending-sign-verifier/src/utils/budgetCalculations.ts` | KILLED: exit `1`, 12 failed / 16 passed across both suites. |
| M3: reverse foreign-currency selection predicate | `src/utils/budgetCalculations.ts:117` - `isTransactionInAnotherCurrency && ...` -> `!isTransactionInAnotherCurrency && ...` | `sed -i '' "s/isTransactionInAnotherCurrency && transaction.amount_in_account_currency/!isTransactionInAnotherCurrency \\&\\& transaction.amount_in_account_currency/" /tmp/fix-budget-spending-sign-verifier/src/utils/budgetCalculations.ts` | KILLED: exit `1`, 3 failed / 25 passed. Direct foreign amount became `10` instead of `55`, current total `170` instead of `215`, history `40` instead of `85`. |

**Sensor result: PASS** - 3/3 attempted mutants killed, 0 survived.

**Cleanup and real-tree isolation proof**:

```sh
rm -rf /tmp/fix-budget-spending-sign-verifier
test ! -e /tmp/fix-budget-spending-sign-verifier
git --no-optional-locks status --porcelain=v1 -uall
```

The scratch path was absent after cleanup. Real-tree porcelain was empty both before and after the sensor, exactly matching the baseline. SHA-256 hashes also matched before and after for all three real changed files:

- `src/utils/budgetCalculations.ts`: `fdc48f58380f6f647bf1c60f99dd09186deb487a893d165a11faf590f555a25f`
- `src/utils/__tests__/budgetCalculations.test.ts`: `a185bcb686cd1769b47224f6825b97aed02d68b3e307f38b44dbf8933ac5167c`
- `src/utils/__tests__/buildBudgetHistory.test.ts`: `3587fe11e6b31ae6aa32b78cf2f0eef4d9c91885799b3b0818b6e6b36b26d2fb`

## Code Quality

| Check | Assessment |
| --- | --- |
| Minimum code | PASS - one magnitude calculation and one type-based return implement the fix. |
| Surgical changes and scope | PASS - only the three declared files changed; no unrelated refactor or feature was added. |
| Existing patterns | PASS - the shared helper remains the single amount-rule source for current budget and history calculations. |
| Test integrity | PASS - old expectations changed only to the new spec outcomes; no deletion, skip, or broadened matcher. |
| Payload/conjunction rule | PASS - numerical values, aggregate arrays, and included row IDs are asserted directly; no call-only assertions substitute for state. |
| Domain coverage | PASS - AC1-AC4 map to exact domain assertions, with preservation edges retained. |
| Project guidelines | PASS - focused Jest and scoped ESLint follow `package.json:33-35` and the existing test conventions; strong defaults applied to the inline small-feature spec. |
| Interactive UAT | Not required - pure calculation bug fix with deterministic automated coverage, no complex interactive flow. |

## Limitations and Ranked Gaps

- **Feature gaps**: None. All 4 ACs passed and all 3 mutants were killed.
- **Repository-wide limitation**: The unrelated full-suite failures and Jest handle hang prevent claiming a green full repository test run, as detailed above. They do not alter this feature's focused-gate PASS.
- **Lessons**: None recorded because this is a clean PASS with no grounded feature failure or surviving mutant.
