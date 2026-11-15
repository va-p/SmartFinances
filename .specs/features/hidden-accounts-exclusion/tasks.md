# Hidden Accounts Exclusion Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/hidden-accounts-exclusion/design.md`
**Status**: Draft

**Repo note:** T1 lands in `smart-finances-backend` (its own commit there); T2–T12 land in `SmartFinances` (one atomic commit each there). Never batch tasks into one commit.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied (no AGENTS.md/CONTRIBUTING.md, no coverage thresholds in jest config; existing depth: unit tests for utils/widgets, node:test controller tests in backend, sparse screen specs).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Frontend pure util (math, filters, selectors) | unit | All branches; 1:1 to spec ACs; every listed edge case has a test | `SmartFinances/src/utils/__tests__/*.test.ts` | `yarn jest <file> --watchman=false` (from `SmartFinances/`) |
| Widget composer | unit | Hidden rows excluded from cash-flow/spark/donut; visible rows byte-identical | `SmartFinances/src/widgets/__tests__/*.test.ts` | `yarn jest <file> --watchman=false` (from `SmartFinances/`) |
| Backend controller | integration (node:test + tsx) | Every touched endpoint: `hide: true` row, `hide: false` row, missing-account row | `smart-finances-backend/src/__tests__/*.test.ts` | `node --import tsx --test <file>` (from `smart-finances-backend/`) |
| Screen wiring (one-line pre-filter/conjunction; behavior asserted at util layer) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. Baseline: frontend `yarn jest` is 449 pass + 1 pre-existing env-broken suite (`profile.spec.tsx`, unrelated); `yarn lint` is baseline-red repo-wide, so lint runs scoped to touched files only. Jest always runs with `--watchman=false` (Watchman broken in this env).

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `yarn jest <touched-test-file> --watchman=false` (from `SmartFinances/`) |
| Full | After the backend task | `node --import tsx --test src/__tests__/transaction.controller.test.ts` (from `smart-finances-backend/`) |
| Build | After each phase completion | Frontend `yarn jest --watchman=false` + backend `yarn test:unit`, plus `npx eslint <touched-files>` scoped to the phase's files |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Backend exposes the flag; shared predicate lands. T1 and T2 are independent (different repos).

```
Phase 1: T1, T2 (independent)
```

### Phase 2: Core aggregation guards

Each task depends on T2. Execution order is T3, T4, T5, T6, T7, T8.

```
Phase 2: T3, T4, T5, T6, T7, T8 (each depends on T2)
```

### Phase 3: Screens, widgets, pickers

T9 depends on T4 and T5; T10, T11, T12 depend on T2.

```
Phase 3: T9, T10, T11, T12 (see edge list below)
```

### Dependency edge list (source of truth for the cross-check)

```
T2 -> T3
T2 -> T4
T2 -> T5
T2 -> T6
T2 -> T7
T2 -> T8
T2 -> T10
T2 -> T11
T2 -> T12
T4 -> T9
T5 -> T9
```

---

## Task Breakdown

### T1: Expose `account.hide` on transaction payloads

**What**: Add `hide` to the account object in `getTransactions`, `getTransactionsByCategory`, and `getTransactionById` (including the related leg).
**Where**: `smart-finances-backend/src/controllers/transaction.controller.ts`
**Depends on**: None
**Reuses**: `account.controller.ts` formatted payloads that already expose `hide`
**Requirement**: HIDE-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `GET /transaction` rows carry `account.hide` (boolean) matching the account's stored flag
- [x] `GET /transaction/by-category` rows carry `account.hide` (boolean)
- [x] `GET /transaction/:id` row (and its related leg) carries `account.hide`
- [x] Missing-account row returns without `hide` instead of failing
- [x] Gate check passes: `node --import tsx --test src/__tests__/transaction.controller.test.ts` (from `smart-finances-backend/`)
- [x] Test count: controller suite grows by ≥3 cases (hide-true row, hide-false row, missing-account row), 0 failures

**Tests**: integration
**Gate**: full

**Commit**: `feat(transactions): expose account hide flag on transaction payloads`

---

### T2: Add shared hidden-account predicate

**What**: Create `isHiddenAccountTransaction` + `excludeHiddenAccountTransactions` with unit tests.
**Where**: `SmartFinances/src/utils/hiddenAccounts.ts`
**Depends on**: None
**Reuses**: `calculateTotalAssets.ts` filter semantics (strict `=== true`; absent flag/account means visible)
**Requirement**: HIDE-01, HIDE-03 (enabler for all guards)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `isHiddenAccountTransaction` returns true only for `account.hide === true`; false for `hide: false`, missing flag, missing/null account
- [x] `excludeHiddenAccountTransactions` returns a new array with hidden rows removed, order preserved, input unmutated
- [x] Gate check passes: `yarn jest src/utils/__tests__/hiddenAccounts.test.ts --watchman=false`
- [x] Test count: ≥6 cases pass, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `feat(hidden-accounts): add shared hidden-account transaction predicate`

---

### T3: Exclude hidden rows in `processTransactions`

**What**: Pre-filter hidden transactions at the top of `processTransactions` so Home, TransactionsByCategory, and BudgetDetails lists plus cash-flow inherit the fix.
**Where**: `SmartFinances/src/utils/processTransactions.ts`
**Depends on**: T2
**Reuses**: Existing `if (!item.account?.type) return;` early-return style; new predicate from T2
**Requirement**: HIDE-01, HIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden-account rows appear in neither `groupedTransactions` nor cash-flow/chart aggregates
- [ ] Visible rows produce byte-identical output vs before the change
- [ ] Gate check passes: `yarn jest src/utils/__tests__/processTransactions.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥2 new hidden-row cases, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): exclude hidden transactions from processTransactions`

---

### T4: Skip hidden rows in `buildNetWorthEvolution`

**What**: Skip hidden-account transactions in the per-period net-worth loop.
**Where**: `SmartFinances/src/utils/buildNetWorthEvolution.ts`
**Depends on**: T2
**Reuses**: Existing `!accountCurrency` skip-guard style at the same loop
**Requirement**: HIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden rows contribute nothing to any period point; series still ends exactly at `totalAssets`
- [ ] Gate check passes: `yarn jest src/utils/__tests__/buildNetWorthEvolution.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥1 new hidden-row case, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): skip hidden transactions in net-worth evolution`

---

### T5: Skip hidden rows in `calculateRealizedTotalAssets` future back-out

**What**: Skip hidden-account transactions in the future-flow back-out loop (balance seed already excludes hidden via `calculateTotalAssets`).
**Where**: `SmartFinances/src/utils/calculateRealizedTotalAssets.ts`
**Depends on**: T2
**Reuses**: `buildNetWorthEvolution` sign/conversion/skip rules mirrored in this file
**Requirement**: HIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A future transaction on a hidden account no longer moves the realized total
- [ ] Gate check passes: `yarn jest src/utils/__tests__/calculateRealizedTotalAssets.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥1 new hidden future-flow case, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): skip hidden transactions in realized-total back-out`

---

### T6: Skip hidden rows in `groupTransactionsByDate`

**What**: Drop hidden rows from day groups and day totals (defense in depth; idempotent with the T3 pre-filter).
**Where**: `SmartFinances/src/utils/groupTransactionsByDate.ts`
**Depends on**: T2
**Reuses**: Existing no-account/transfer skip style in `calculateGroupTotal`
**Requirement**: HIDE-01, HIDE-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden rows appear in no group and contribute 0 to every `rawTotal`
- [ ] Gate check passes: `yarn jest src/utils/__tests__/groupTransactionsByDate.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥1 new hidden-row case, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): drop hidden transactions from date grouping`

---

### T7: Exclude hidden rows from budget spend

**What**: Pre-filter hidden transactions in `formatBudgetInfo` before category/period matching; add a regression test pinning that `account.hide` survives `formatTransactions`.
**Where**: `SmartFinances/src/utils/budgetCalculations.ts`
**Depends on**: T2
**Reuses**: New predicate from T2; `formatTransactions` spreads `account` by reference (no code change there, test only)
**Requirement**: HIDE-02, HIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden rows contribute 0 to `amount_spent`/`percentage` and never appear in `budget_transactions`
- [ ] New regression assertion proves `formatTransactions` preserves `account.hide`
- [ ] Gate check passes: `yarn jest src/utils/__tests__/budgetCalculations.test.ts src/utils/__tests__/formatTransactions.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥2 new cases, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): exclude hidden transactions from budget spend`

---

### T8: Exclude hidden rows from subscription candidates

**What**: Filter hidden-account transactions out of `selectSubscriptionCandidates`.
**Where**: `SmartFinances/src/utils/subscriptionDesignation.ts`
**Depends on**: T2
**Reuses**: Existing `(type === CREDIT || DEBIT) && !is_subscription` conjunction style
**Requirement**: HIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A credit/debit unclassified transaction on a hidden account is not offered as a candidate
- [ ] Gate check passes: `yarn jest src/utils/__tests__/subscriptionDesignation.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥1 new hidden-row case, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): exclude hidden transactions from subscription candidates`

---

### T9: Pre-filter hidden rows in Overview

**What**: Pre-filter hidden transactions once at the top of Overview `processedData` so category totals and the evolution chart inherit the fix.
**Where**: `SmartFinances/src/screens/Overview/index.tsx`
**Depends on**: T4, T5
**Reuses**: `excludeHiddenAccountTransactions` from T2; guards in T4/T5 cover the chart seed
**Requirement**: HIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] No new util logic; single pre-filter line plus passing the filtered array to `calculateRealizedTotalAssets`, the period filter, and `buildNetWorthEvolution`
- [ ] Behavior asserted at the util layer (T4/T5/T7); no new screen test file (per matrix screen-wiring layer)
- [ ] Gate check passes: Build gate (frontend full jest + scoped eslint on the touched file)

**Tests**: none
**Gate**: build

**Commit**: `fix(hidden-accounts): pre-filter hidden transactions in Overview`

---

### T10: Pre-filter hidden rows in widget snapshot

**What**: Pre-filter hidden transactions in the `buildWidgetSnapshot` composer before cash-flow/net-worth/donut builders.
**Where**: `SmartFinances/src/widgets/buildWidgetSnapshot.ts`
**Depends on**: T2
**Reuses**: Existing `buildInstitutions` hide filter in the same file; new predicate from T2
**Requirement**: HIDE-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden rows contribute nothing to widget cash-flow, net-worth spark, or category donut; visible rows byte-identical
- [ ] Gate check passes: `yarn jest src/widgets/__tests__/buildWidgetSnapshot.test.ts --watchman=false`
- [ ] Test count: existing cases pass plus ≥1 new hidden-row case, 0 failures

**Tests**: unit
**Gate**: quick

**Commit**: `fix(hidden-accounts): exclude hidden transactions from widget snapshot`

---

### T11: Exclude hidden accounts from transaction pickers

**What**: Add `&& !account.hide` next to `!account.isVirtual` in the three transaction-flow pickers.
**Where**: `SmartFinances/src/screens/AccountSelect/index.tsx`
**Depends on**: T2
**Reuses**: `InstitutionDetails` `!account.hide && ...` conjunction precedent (same one-line edit repeated in `AccountFilterSelect/index.tsx` and `AccountDestinationSelect/index.tsx`)
**Requirement**: HIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden accounts are not selectable in AccountSelect, AccountFilterSelect, or AccountDestinationSelect
- [ ] No other picker behavior changes (virtual filter, toggle logic untouched)
- [ ] Gate check passes: Build gate (frontend full jest proves no regressions; per matrix screen-wiring layer carries no unit tests)

**Tests**: none
**Gate**: build

**Commit**: `fix(hidden-accounts): hide hidden accounts in transaction pickers`

---

### T12: Exclude hidden accounts from goal pickers

**What**: Add `&& !account.hide` next to `!account.isVirtual` in the three goal-flow account lists.
**Where**: `SmartFinances/src/screens/GoalAccountSelect/index.tsx`
**Depends on**: T2
**Reuses**: Same conjunction precedent as T11 (same one-line edit repeated in `RegisterGoalMovement/index.tsx` selectable list and `GoalDetails/index.tsx` delete destinations)
**Requirement**: HIDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hidden accounts are not offered in GoalAccountSelect, RegisterGoalMovement, or GoalDetails destinations
- [ ] Goal reserve (`isVirtual`) handling unchanged
- [ ] Gate check passes: Build gate (frontend full jest proves no regressions; per matrix screen-wiring layer carries no unit tests)

**Tests**: none
**Gate**: build

**Commit**: `fix(hidden-accounts): hide hidden accounts in goal pickers`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase order: 1, then 2, then 3

Phase 1: T1, T2 (independent)
Phase 2: T3, T4, T5, T6, T7, T8 (each depends on T2)
Phase 3: T9, T10, T11, T12 (T9 needs T4 and T5; others need T2)
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks
per worker, whole phases - the benchmarked sweet spot is ~20 tasks → ~3 workers). A **phase** is the
semantic/dependency unit; a **batch** is one or more *consecutive whole phases* assigned to one
worker. The cut only ever lands on a phase boundary - a phase is never split across workers. When
packing yields more than one batch (> ~8 tasks), the agent offers to dispatch batch sub-agents.
Batches run sequentially: each worker executes ALL its tasks in order, then reports a compact summary
before the next batch starts. This right-sizes the worker count by workload instead of by phase
count (one-per-phase is too fragmented; expensive and slow). See [sub-agents.md](sub-agents.md) for
the full model - packing algorithm, offer-then-confirm, worker payload, compact summary contract,
failure handling, and context sizing guidance.

When the whole feature fits a single batch (≤ ~8 tasks), execution happens inline in the main window
with no sub-agents spawned.

**The orchestrating agent's role during Execute:**
1. Count total tasks and pack phases into ~7-task batches - offer batch sub-agents if that yields more than one batch and the user accepts
2. Dispatch the next batch (to a worker, or execute inline)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If the batch summary shows all tasks complete: proceed to the next batch
6. If a task failed: decide fix/escalate before dispatching the next batch

---

## Task Granularity Check

Before approving tasks, verify they are granular enough:

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: backend payload | 1 controller + its test | ✅ Granular |
| T2: shared predicate | 1 new util + its test | ✅ Granular |
| T3: processTransactions guard | 1 util + its test | ✅ Granular |
| T4: net-worth evolution guard | 1 util + its test | ✅ Granular |
| T5: realized-total guard | 1 util + its test | ✅ Granular |
| T6: date-grouping guard | 1 util + its test | ✅ Granular |
| T7: budget spend guard | 1 util + its tests | ✅ Granular |
| T8: subscription candidates guard | 1 util + its test | ✅ Granular |
| T9: Overview pre-filter | 1 screen (wiring only) | ✅ Granular |
| T10: widget composer filter | 1 composer + its test | ✅ Granular |
| T11: transaction pickers (3 screens, same 1-line edit) | 3 one-line conjunctions, 1 deliverable | ⚠️ Multi-file - accepted: single cohesive deliverable, identical edit, single verification; splitting would triple commits for zero isolation gain |
| T12: goal pickers (3 screens, same 1-line edit) | 3 one-line conjunctions, 1 deliverable | ⚠️ Multi-file - accepted: same rationale as T11 |

---

## Diagram-Definition Cross-Check

Before approving tasks, verify the execution diagram is consistent with the task definitions.

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | Phase 1, no edges | ✅ Match |
| T2 | None | Phase 1, no edges | ✅ Match |
| T3 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match (cross-phase excluded from parity) |
| T4 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match |
| T5 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match |
| T6 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match |
| T7 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match |
| T8 | T2 (cross-phase) | Phase 2, no intra-phase edges | ✅ Match |
| T9 | T4, T5 (cross-phase) | Phase 3, no intra-phase edges | ✅ Match |
| T10 | T2 (cross-phase) | Phase 3, no intra-phase edges | ✅ Match |
| T11 | T2 (cross-phase) | Phase 3, no intra-phase edges | ✅ Match |
| T12 | T2 (cross-phase) | Phase 3, no intra-phase edges | ✅ Match |

---

## Test Co-location Validation

Before approving tasks, verify EVERY task's `Tests` field is consistent with the **Test Coverage Matrix** generated above.

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Backend controller | integration | integration | ✅ OK |
| T2 | Frontend pure util | unit | unit | ✅ OK |
| T3 | Frontend pure util | unit | unit | ✅ OK |
| T4 | Frontend pure util | unit | unit | ✅ OK |
| T5 | Frontend pure util | unit | unit | ✅ OK |
| T6 | Frontend pure util | unit | unit | ✅ OK |
| T7 | Frontend pure util | unit | unit | ✅ OK |
| T8 | Frontend pure util | unit | unit | ✅ OK |
| T9 | Screen wiring | none | none | ✅ OK |
| T10 | Widget composer | unit | unit | ✅ OK |
| T11 | Screen wiring | none | none | ✅ OK |
| T12 | Screen wiring | none | none | ✅ OK |

---

## Tips

- **Phases are ordered** - Each phase completes; tasks run in order within a phase
- **Reuses = Token saver** - Every component references existing patterns
- **Tools per task** - MCPs and Skills prevent wrong approaches
- **Dependencies are gates** - Clear what blocks what
- **Done when = Testable** - If you can't verify it, rewrite it
- **Requirement ID = Traceable** - Every task traces back to a spec requirement
- **One commit per task** - Plan the commit message format in advance
