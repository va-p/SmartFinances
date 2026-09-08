# Financial Goals / Savings Targets Tasks

**Status**: In Progress

## Batch Completion Log

- **Batch 1 (Phase 1: T1–T5)** — ✅ Complete. Backend branch `goals-target-savings`: `d0c8310` (T1), `beb9923` (T2), `7606dbb` (T3), `14a7908` (T4), `a792f99` (T5). Tests: 62 passed, 0 failed (goal.schema + goal.service). Build gate green. Deviation: T5 test file initially used a non-existent `@services/` import alias (project has no tsconfig paths) — fixed to relative import by orchestrator before commit. Migration `20260825085131_add_financial_goals` generated via `prisma migrate diff` (dev DB unreachable) — pending `migrate deploy` on cPanel (STATE.md issue #16).

- **Batch 2 (Phase 2: T6–T10)** — ✅ Complete. Backend branch `goals-target-savings`: `5051016` (T6), `e6851c7` (T7), `0a2b331` (T8), `edcc33c` (T9), `ac5d789` (T10). Full gate: 174 passed, 0 failed, 12 files; build green. 8 endpoints under `/api/v1/goal` registered. Notes: `deleteAccount` isVirtual guard's AppError(400) surfaces as 401 due to that controller's pre-existing catch-all (out-of-scope tech debt, documented in commit); GET /goal/:id includes reserve `transactions` newest-first (GOAL-17).

- **Batch 3 (Phase 3: T11–T14)** — ✅ Complete. App branch `goals-target-savings`: `39c170f` (T11), `597ba72` (T12), `5329ddd` (T13), `59b7e92` (T14). Tests: 8 passed (goalCalculations). Pre-existing gate conditions (unchanged, verified byte-identical): 626 tsc errors (styled-components theme typings), eslint broken (missing `eslint-config-airbnb`). Orchestrator follow-up commit `b74c169`: delete mutation now also invalidates `['accounts']`/`['transactions']` (transfer-back side effect, GOAL-37).

- **Batch 4 (Phases 4+5: T15–T21)** — ✅ Complete. App branch `goals-target-savings`: `42a24f0` (T15), `2a28dc7` (T16), `1528379` (T17), `76d50a9` (T18), `5ebfd19` (T19), `d581114` (T20), `edcd8b9` (T21). Tests: 137 passed, 0 failed (`profile.spec.tsx` red but pre-existing phosphor-transform issue, proven on clean baseline). tsc: 0 new errors vs 615 baseline. Notes: new styles files cast `(theme as ThemeProps)` to dodge the repo-wide broken DefaultTheme augmentation; T21 audit table + GOAL-27 net-worth reasoning in commit body; RegisterTransaction needed no edit (pickers filtered at AccountSelect/AccountDestinationSelect). Batch interrupted twice by billing 429s; resumed cleanly.

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven-v3` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/financial-goals/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase sampling and spec - confirm before Execute. Guidelines found: none (no AGENTS.md, no coverage thresholds, no CI test gates). Strong defaults applied on top of repo floor. Provenance: backend `package.json` scripts (`test:unit` = `node --import tsx --test` with an **explicit file list** — new test files must be appended to that script), backend `src/__tests__/transaction.service.test.ts` (node:test + fake-tx pattern), `transaction.controller.test.ts` / `account.controller.test.ts` (mocked req/res), `transaction.schema.test.ts` (zod); frontend `package.json` (`jest` preset `jest-expo`, `lint` = eslint), `src/__tests__/utils/transactionPayload.spec.ts`, `src/__tests__/screens/profile.spec.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Backend service (`goal.service.ts`) | unit (node:test + fake tx) | All branches; 1:1 to spec ACs; every listed edge case | `smart-finances-backend/src/__tests__/goal.service.test.ts` | `node --import tsx --test src/__tests__/goal.service.test.ts` |
| Backend zod schemas (`goal.schema.ts`) | unit | Happy + every rejection path | `smart-finances-backend/src/__tests__/goal.schema.test.ts` | `node --import tsx --test src/__tests__/goal.schema.test.ts` |
| Backend controller/routes | unit (mocked req/res + fake tx) | All routes in scope: happy + edge + error paths | `smart-finances-backend/src/__tests__/goal.controller.test.ts` | `yarn test:unit` |
| Prisma schema / migration | none | Build gate only (`prisma generate` + `tsc`) | - | build gate only |
| Frontend utils (`goalCalculations.ts`) | unit (jest-expo) | All branches; 1:1 to spec ACs (progress, conversion, `isAmountReached`) | `SmartFinances/src/__tests__/utils/goalCalculations.spec.ts` | `npx jest src/__tests__/utils/goalCalculations.spec.ts` |
| Frontend utils (`buildGoalProjection.ts`) (amendment 2026-09-08) | unit (jest-expo) | All branches; 1:1 to chart ACs (month buckets, average, projection, guards, 60-month cap, labels) | `SmartFinances/src/__tests__/utils/buildGoalProjection.spec.ts` | `npx jest src/__tests__/utils/buildGoalProjection.spec.ts` |
| Frontend hooks / screens / components / interfaces | none | No repo pattern beyond 1 screen test; verified by build gate (tsc + eslint) + Verifier spec-check + UAT | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick (backend) | After backend tasks with unit tests | `cd /Users/vap/00_code/JS/smart-finances-backend && node --import tsx --test <task's test file(s)>` |
| Quick (frontend) | After frontend tasks with unit tests | `cd /Users/vap/00_code/JS/SmartFinances && npx jest src/__tests__/utils/goalCalculations.spec.ts` |
| Quick (frontend, amendment) | After A2 | `cd /Users/vap/00_code/JS/SmartFinances && npx jest src/__tests__/utils/buildGoalProjection.spec.ts` |
| Full | After tasks touching shared test suites | Backend: `cd /Users/vap/00_code/JS/smart-finances-backend && yarn test:unit && yarn build` — Frontend: `cd /Users/vap/00_code/JS/SmartFinances && npx jest` |
| Build | After phase completion or config/entity-only tasks | Backend: `yarn build` — Frontend: `npx tsc --noEmit && yarn lint` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Backend — Schema, Service & Validation (backend repo)

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Backend — API Wiring (backend repo)

```
T5 → T6 → T7 → T8 → T9 → T10
```

### Phase 3: Frontend — Data Layer (app repo)

```
T10 → T11 → T12 → T13 → T14
```

### Phase 4: Frontend — Screens (app repo)

```
T14 → T15 → T16 → T17 → T18 → T19 → T20
```

### Phase 5: Frontend — Visibility Audit (app repo)

```
T20 → T21
```

### Phase A (amendment 2026-09-08): Frontend — Evolution & Projection Chart (app repo)

```
T21 → A1 → A2 → A3 → A4 → A5
```

---

## Task Breakdown

### T1: Prisma schema — Goal models + Account.isVirtual + migration

**What**: Add `GoalStatus` enum, `Goal`, `GoalLinkedAccount`, `Account.isVirtual`/`goalReserve` relation per design; create and apply migration; `prisma generate`.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Budget model conventions (`schema.prisma:315`)
**Requirement**: GOAL-07, GOAL-24, GOAL-25

**Tools**: NONE

**Done when**:
- [ ] Schema compiles: `npx prisma generate` exits 0
- [ ] Migration file created (`prisma migrate dev --name add_financial_goals`; if dev DB unreachable, generate via `prisma migrate diff` and note it in the commit)
- [ ] `yarn build` (tsc) passes
- [ ] Junction FKs are `onDelete: Cascade` both ways; `reserveAccountId` is `@unique`

**Tests**: none
**Gate**: build

**Commit**: `feat(goal): add Goal, GoalLinkedAccount and Account.isVirtual to schema`

---

### T2: Zod schemas for goal endpoints

**What**: Create `goal.schema.ts` (create/update/id-param/status/deposit/withdraw/delete schemas) per design, plus `goal.schema.test.ts` covering happy path and every rejection path (empty name, target ≤ 0, past deadline, non-positive amount, invalid action enum, bad uuid). Append test file to `test:unit` script.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/schemas/goal.schema.ts`
**Depends on**: T1
**Reuses**: `src/schemas/transaction.schema.ts` coercion style
**Requirement**: GOAL-08, GOAL-10

**Tools**: NONE

**Done when**:
- [ ] All 7 schemas exported and validate per design field rules
- [ ] Schema tests pass: `node --import tsx --test src/__tests__/goal.schema.test.ts`
- [ ] Test count: ≥ 12 tests pass (no silent deletions)
- [ ] File added to `test:unit` in `package.json`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add zod validation schemas`

---

### T3: goal.service — creation & category resolution

**What**: Create `goal.service.ts` with `createGoalWithReserve(tx, userId, data)` (reserve Account `isVirtual: true`, type `OTHER`, name `Reserva: {name}`, zero balance, goal currency; Goal row; junction rows — all via injected tx) and `resolveGoalTransferCategory(tx, userId, categoryId?)` (ownership check → "Sem categoria" → first category → AppError 400). Tests with fake-tx pattern: reserve created with correct fields, links inserted, category fallback chain, ownership rejection.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/services/goal.service.ts`
**Depends on**: T2
**Reuses**: `transaction.service.ts` fake-tx test pattern (`src/__tests__/transaction.service.test.ts`)
**Requirement**: GOAL-07, GOAL-09

**Tools**: NONE

**Done when**:
- [ ] Both functions implemented, all writes through injected `tx`
- [ ] Tests pass: `node --import tsx --test src/__tests__/goal.service.test.ts`
- [ ] Test count: ≥ 8 tests for this task's functions (cumulative file count stated in commit)
- [ ] File added to `test:unit` in `package.json`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add goal creation service with reserve account`

---

### T4: goal.service — deposit & withdraw

**What**: Add `depositToGoal(tx, goal, data)` and `withdrawFromGoal(tx, goal, data)`: guards (goal ACTIVE else AppError 400 — GOAL-22/34; amount > 0; source/destination account owned by user and `!isVirtual`), withdraw reserve-balance bound via Prisma `Decimal` comparison (GOAL-14), multi-currency pass-through of `amount_in_account_currency` (GOAL-16), both delegating pair creation to `createTransferPair`. Tests: happy paths, status guard, over-withdrawal rejection (GOAL-14), virtual/foreign account rejection, exact balance deltas.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/services/goal.service.ts`
**Depends on**: T3
**Reuses**: `createTransferPair` from `transaction.service.ts`
**Requirement**: GOAL-12, GOAL-13, GOAL-14, GOAL-16, GOAL-22, GOAL-34

**Tools**: NONE

**Done when**:
- [ ] Deposit creates TRANSFER_DEBIT on source + TRANSFER_CREDIT on reserve; withdraw reversed
- [ ] Over-withdrawal rejected before any write (no transaction created)
- [ ] Tests pass: `node --import tsx --test src/__tests__/goal.service.test.ts`
- [ ] Test count: ≥ 8 new tests (cumulative file count stated in commit)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add deposit and withdraw service via transfer pairs`

---

### T5: goal.service — status machine & delete with transfer-back

**What**: Add `transitionGoalStatus(goal, action)` (conclude: ACTIVE→COMPLETED + `completedAt`; archive: ACTIVE|COMPLETED→ARCHIVED + `previousStatus`; unarchive: ARCHIVED→`previousStatus ?? ACTIVE`, clears it; invalid → AppError 400 — GOAL-20/31/33) and `deleteGoalWithTransferBack(tx, goal, destinationAccountId?)` (balance > 0 requires destination + transfer-back pair via `createTransferPair`; delete Goal → junction cascade; delete reserve Account → legs cascade, counterparts SetNull — GOAL-36/37/38/39; failure aborts everything — GOAL-40). Tests: every valid/invalid transition, zero-balance delete, transfer-back delete, abort propagation.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/services/goal.service.ts`
**Depends on**: T4
**Reuses**: `createTransferPair`, `AppError`
**Requirement**: GOAL-20, GOAL-31, GOAL-33, GOAL-36, GOAL-37, GOAL-38, GOAL-39, GOAL-40

**Tools**: NONE

**Done when**:
- [ ] All transitions per state machine; invalid ones return 400
- [ ] Delete with balance creates transfer-back pair before row deletions; all writes via injected tx
- [ ] Tests pass: `node --import tsx --test src/__tests__/goal.service.test.ts`
- [ ] Test count: ≥ 10 new tests (cumulative file count stated in commit)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add status transitions and delete with transfer-back`

---

### T6: goal controller/routes — CRUD + server registration

**What**: Create `goal.controller.ts` (getGoals, getGoalById, createGoal, updateGoal — snake_case DTOs, user-scoped `findFirst`, ownership of linked accounts verified, `$transaction` wrapping, AppError+logger pattern) and `goal.routes.ts` for `GET /`, `GET /:id`, `POST /`, `PATCH /:id`; register `app.use('/api/v1/goal', goalRoutes)` in `server.ts` (merged here so route wiring ships with its first consumers). Controller tests (mocked req/res + fake prisma): happy paths + ownership 404 + validation 400.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/controllers/goal.controller.ts`
**Depends on**: T5
**Reuses**: `budget.controller.ts` layering, `transaction.controller.ts` error style
**Requirement**: GOAL-02, GOAL-07, GOAL-28, GOAL-30

**Tools**: NONE

**Done when**:
- [ ] 4 endpoints wired with `authenticate` + `validate` + `asyncHandler`
- [ ] Update allows name/target/deadline/linked accounts only (currency immutable); ACTIVE-only edits (GOAL-22/34)
- [ ] `server.ts` registers `/goal` routes; `yarn build` passes
- [ ] Tests pass; count: ≥ 10 tests (no silent deletions)
- [ ] Test file added to `test:unit` in `package.json`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add goal CRUD endpoints`

---

### T7: goal controller/routes — status transitions

**What**: Add `PATCH /:id/status` (action enum via `goalStatusSchema`, delegates to `transitionGoalStatus`, wraps in `$transaction`) + tests: conclude/archive/unarchive happy paths + invalid transition 400 + foreign goal 404.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/controllers/goal.controller.ts`
**Depends on**: T6
**Reuses**: T5 service, T6 patterns
**Requirement**: GOAL-20, GOAL-31, GOAL-33

**Tools**: NONE

**Done when**:
- [ ] Endpoint wired and validated
- [ ] Tests pass; count: ≥ 5 new tests (cumulative stated in commit)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add status transition endpoint`

---

### T8: goal controller/routes — deposit & withdraw

**What**: Add `POST /:id/deposit` and `POST /:id/withdraw` (validate, load goal+reserve user-scoped, `$transaction` → service, formatted response) + tests: happy paths, over-withdrawal 400, COMPLETED/ARCHIVED goal 400, virtual source account 400.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/controllers/goal.controller.ts`
**Depends on**: T7
**Reuses**: T4 service, T6 patterns
**Requirement**: GOAL-12, GOAL-13, GOAL-14, GOAL-16, GOAL-22, GOAL-34

**Tools**: NONE

**Done when**:
- [ ] Both endpoints wired and validated
- [ ] Tests pass; count: ≥ 8 new tests (cumulative stated in commit)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add deposit and withdraw endpoints`

---

### T9: goal controller/routes — delete

**What**: Add `DELETE /:id` (optional `destination_account_id`; delegates to `deleteGoalWithTransferBack`) + tests: zero-balance delete, transfer-back delete, missing destination 400 when balance > 0, foreign goal 404.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/controllers/goal.controller.ts`
**Depends on**: T8
**Reuses**: T5 service, T6 patterns
**Requirement**: GOAL-36, GOAL-37, GOAL-38, GOAL-39, GOAL-40

**Tools**: NONE

**Done when**:
- [ ] Endpoint wired and validated
- [ ] Tests pass; count: ≥ 5 new tests (cumulative stated in commit)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goal): add delete endpoint with transfer-back`

---

### T10: Account guard + backend full gate

**What**: Add `isVirtual` rejection to `deleteAccount` in `account.controller.ts` (AppError 400 "Conta virtual de meta") + test in `account.controller.test.ts`; run full backend gate.
**Where**: `/Users/vap/00_code/JS/smart-finances-backend/src/controllers/account.controller.ts`
**Depends on**: T9
**Reuses**: existing `account.controller.test.ts`
**Requirement**: GOAL-42

**Tools**: NONE

**Done when**:
- [ ] Virtual account deletion rejected; regular account deletion still works (junction cascade unlinks goals — GOAL-41 by schema)
- [ ] Full gate passes: `yarn test:unit && yarn build` (total suite count stated in commit, no silent deletions)

**Tests**: unit
**Gate**: full

**Commit**: `feat(goal): guard virtual reserve accounts from account deletion`

---

### T11: Frontend interfaces & types

**What**: Create `src/interfaces/goals.ts` (`GoalProps`, `GoalStatus` union, DTO field names snake_case per design); add `isVirtual?: boolean` to `AccountProps`.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/interfaces/goals.ts`
**Depends on**: T10
**Reuses**: `src/interfaces/accounts.ts`, `src/interfaces/budgets.ts` style
**Requirement**: GOAL-24

**Tools**: NONE

**Done when**:
- [ ] Types match backend DTO exactly
- [ ] `npx tsc --noEmit` passes

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add goal interfaces and Account.isVirtual flag`

---

### T12: goalCalculations util + tests

**What**: Create `src/utils/goalCalculations.ts` — `computeGoalProgress(goal, quotes)` returning `{ currentAmount, currentFormatted, percentage, isAmountReached }` using `convertCurrency` for reserve + each linked account into goal currency (GOAL-02/19/29; multi-currency per context). Unit tests: same-currency, multi-currency conversion, 0%, exactly 100%, >100%, zero linked accounts.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/utils/goalCalculations.ts`
**Depends on**: T11
**Reuses**: `src/utils/convertCurrency.ts`, `useQuotes` quote shapes
**Requirement**: GOAL-02, GOAL-19, GOAL-29

**Tools**: NONE

**Done when**:
- [ ] Pure function, Decimal-safe arithmetic consistent with `budgetCalculations.ts`
- [ ] Tests pass: `npx jest src/__tests__/utils/goalCalculations.spec.ts`
- [ ] Test count: ≥ 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(goals): add goal progress calculation util`

---

### T13: Goals query hooks

**What**: Create `useGoalsQuery.ts` (`['goals']`, `GET goal`) and `useGoalDetailQuery.ts` (`['goal', goalID]`, `GET goal/{id}`) per CONVENTIONS hook pattern.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/hooks/useGoalsQuery.ts`
**Depends on**: T12
**Reuses**: `src/hooks/useBudgetsQuery.ts`, `useBudgetDetailQuery.ts`
**Requirement**: GOAL-02, GOAL-17

**Tools**: NONE

**Done when**:
- [ ] Hooks follow TanStack pattern with typed responses (`GoalProps`)
- [ ] `npx tsc --noEmit` passes

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add goals query hooks`

---

### T14: Goals mutation hooks

**What**: Create `useGoalMutations.ts` (create/update/delete/status with optimistic create + rollback-on-error + `['goals']` invalidation — GOAL-11) and `useGoalMovementMutations.ts` (deposit/withdraw; on success invalidate `['goals']`, `['goal', id]`, `['accounts']`, `['transactions']` — GOAL-18; expose `isPending` for CTA disable — GOAL-15).
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/hooks/useGoalMutations.ts`
**Depends on**: T13
**Reuses**: `src/hooks/useBudgetMutations.ts`, `useTransactionMutations.ts` invalidation set
**Requirement**: GOAL-11, GOAL-15, GOAL-18

**Tools**: NONE

**Done when**:
- [ ] Optimistic create with temp id + rollback + error Alert per CONVENTIONS.md
- [ ] Movement mutations invalidate all four query keys
- [ ] `npx tsc --noEmit` passes

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add goal mutation hooks`

---

### T15: Options entry + goals route stack

**What**: Add "Metas & Objetivos" `SelectButton` (`Target` phosphor icon) to OptionsMenu "Conta" section navigating to `/options/goals` (GOAL-01); create `src/app/(app)/options/goals/_layout.tsx` (Stack, `headerShown: false`, pt-BR titles for `index`, `[goalId]`, `completed`, `archived`).
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/OptionsMenu/index.tsx`
**Depends on**: T14
**Reuses**: `src/app/(app)/budgets/_layout.tsx`
**Requirement**: GOAL-01, GOAL-06

**Tools**: NONE

**Done when**:
- [ ] Menu item navigates to goals stack
- [ ] `npx tsc --noEmit` passes

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add options menu entry and goals route stack`

---

### T16: GoalListItem + Goals list screen

**What**: Create `GoalListItem` component (name, current/target formatted, progress bar modeled on `BudgetPercentBar`, deadline, "Meta atingida" badge — GOAL-19) and `Goals` screen (summary card, FlashList of ACTIVE goals — GOAL-02, empty state with CTA — GOAL-03, FAB — GOAL-04, hideAmount masking — GOAL-05, header icons to Completed/Archived — GOAL-06); plus `src/app/(app)/options/goals/index.tsx` re-export route.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/Goals/index.tsx`
**Depends on**: T15
**Reuses**: `src/components/BudgetListItem`, `src/screens/Budgets/index.tsx` structure
**Requirement**: GOAL-02, GOAL-03, GOAL-04, GOAL-05, GOAL-06, GOAL-19

**Tools**: NONE

**Done when**:
- [ ] Screen renders active goals with correct progress from `computeGoalProgress`
- [ ] Empty state + FAB + completed/archived navigation present
- [ ] `npx tsc --noEmit && yarn lint` pass

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add goals list screen and goal list item`

---

### T17: RegisterGoal form (create/edit bottom sheet)

**What**: Create `RegisterGoal` screen (react-hook-form + yup: name, target amount, currency, optional deadline, account multi-select via `ModalViewSelection` + new `goalAccountsSelected` zustand store; client validation GOAL-08/10 before API; create + edit modes) wired into Goals screen FAB via `ModalView`.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/RegisterGoal/index.tsx`
**Depends on**: T16
**Reuses**: `src/screens/RegisterBudget/index.tsx`, `src/stores/budgetCategoriesSelected.ts`
**Requirement**: GOAL-07, GOAL-08, GOAL-09, GOAL-10, GOAL-28, GOAL-30

**Tools**: NONE

**Done when**:
- [ ] Create calls `useCreateGoalMutation` with linked account ids; edit pre-fills and PATCHes
- [ ] Validation blocks empty name / amount ≤ 0 / past deadline without API call
- [ ] `npx tsc --noEmit && yarn lint` pass

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add register/edit goal bottom sheet form`

---

### T18: GoalDetails screen + lifecycle actions

**What**: Create `GoalDetails` screen (progress header, linked accounts, contribution/withdrawal history from reserve account transactions newest-first — GOAL-17; Deposit/Withdraw CTAs hidden unless ACTIVE — GOAL-22/34; "Concluir" action with confirmation — GOAL-20; edit opens `RegisterGoal`; archive with confirmation — GOAL-31; delete flow with destination-account picker when balance > 0 — GOAL-36/37) plus `[goalId].tsx` route.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/GoalDetails/index.tsx`
**Depends on**: T17
**Reuses**: `src/screens/BudgetDetails/index.tsx` header/edit-sheet pattern
**Requirement**: GOAL-17, GOAL-20, GOAL-22, GOAL-31, GOAL-34, GOAL-36, GOAL-37

**Tools**: NONE

**Done when**:
- [ ] Details render progress + history; all lifecycle actions wired to mutations
- [ ] Delete with balance requires destination account; zero-balance delete one-tap confirm
- [ ] `npx tsc --noEmit && yarn lint` pass

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add goal details screen with lifecycle actions`

---

### T19: RegisterGoalMovement sheet (deposit/withdraw)

**What**: Create `RegisterGoalMovement` parameterized sheet (`type: 'deposit' | 'withdraw'`): amount input, account picker excluding `isVirtual` accounts, multi-currency conversion display per existing transfer flow (GOAL-16), withdraw-over-balance client validation (GOAL-14), CTA disabled while `isPending` (GOAL-15); wire into GoalDetails CTAs.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/RegisterGoalMovement/index.tsx`
**Depends on**: T18
**Reuses**: `AccountDestinationSelect` pattern, transfer tab of `RegisterTransaction`
**Requirement**: GOAL-12, GOAL-13, GOAL-14, GOAL-15, GOAL-16

**Tools**: NONE

**Done when**:
- [ ] Deposit/withdraw call movement mutations and close on success
- [ ] Over-balance withdrawal blocked client-side with message
- [ ] `npx tsc --noEmit && yarn lint` pass

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add deposit/withdraw bottom sheet`

---

### T20: Completed & Archived screens

**What**: Create `CompletedGoals` (list with completion date — GOAL-21, empty state — GOAL-23) and `ArchivedGoals` (list — GOAL-32, unarchive action — GOAL-33, empty state — GOAL-35) screens plus their route files.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/CompletedGoals/index.tsx`
**Depends on**: T19
**Reuses**: `GoalListItem`, list/empty-state patterns
**Requirement**: GOAL-06, GOAL-21, GOAL-23, GOAL-32, GOAL-33, GOAL-35

**Tools**: NONE

**Done when**:
- [ ] Both screens render from `useGoalsQuery` filtered by status
- [ ] Unarchive restores previous status via status mutation
- [ ] `npx tsc --noEmit && yarn lint` pass

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): add completed and archived goals screens`

---

### T21: Account visibility audit (isVirtual filtering)

**What**: Audit every account list/picker renderer and add `!account.isVirtual` filtering where missing — `src/screens/Accounts/index.tsx` (list + institution groupings ONLY; the total/`processedData` balance math stays untouched — GOAL-25), `src/screens/AccountsList/index.tsx`, account pickers in `RegisterTransaction` / `AccountDestinationSelect` / Home filters (GOAL-24/26). Verify net worth identical before/after a deposit (GOAL-27) via reasoning over `buildNetWorthEvolution` + note in commit.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/Accounts/index.tsx`
**Depends on**: T20
**Reuses**: existing `.filter((account) => !account.hide)` sites
**Requirement**: GOAL-24, GOAL-25, GOAL-26, GOAL-27

**Tools**: NONE

**Done when**:
- [ ] Grep audit table in commit message: every `accounts.map`/`filter` site classified as filter-virtual / keep-in-total
- [ ] Accounts tab renders no virtual accounts; pickers exclude them; total unchanged
- [ ] Full frontend gate passes: `npx tsc --noEmit && yarn lint && npx jest` (count stated, no silent deletions)

**Tests**: none
**Gate**: full

**Commit**: `feat(goals): filter virtual reserve accounts from account UIs`

---

## Amendment 2026-09-08: Goal Evolution & Projection Chart (A1–A5)

> Spec: "P2: Goal Evolution & Projection Chart" (spec.md). Design: D1–D5 in design.md §"Evolution & projection chart". Frontend-only, app repo. D3 corrected 2026-09-08 after dist verification of `react-native-gifted-charts` 1.4.7: `interpolateMissingValues` defaults to `true` (must be passed as `false` explicitly) and the dashed projection uses the native second dataset (`data2` + `strokeDashArray2` + `showArrow2`/`arrowConfig2`) instead of the single-array undefined trick.

### A1: buildGoalProjection util

**What**: Create `src/utils/buildGoalProjection.ts` — pure `buildGoalProjection({ goal, now? })` → `{ points, averageMonthlyProgress, targetAmount } | null`. History: one cumulative bucket per calendar month from the first movement month to the current month inclusive, from `goal.transactions` (goal-side legs in goal currency; `TRANSFER_CREDIT` adds, anything else subtracts; date = `transaction_date ?? created_at`; movements dated after `now` ignored; months without movements repeat the previous cumulative) (D1, AC-1). Average = (last cumulative − first cumulative) / (elapsed month buckets − 1) (AC-3). Projection: one point per future month at that average from the last cumulative until the target is reached, capped at 60 points, only when the average is > 0 (AC-2/4/5). `null` when fewer than 2 distinct movement months (AC-4). `now` injectable for deterministic tests. Labels: pt-BR abbreviated month, year appended on the first and last bucket of each year (AC-6).
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/utils/buildGoalProjection.ts`
**Depends on**: T18 (goal detail shape)
**Reuses**: month-bucket + Decimal pattern from `src/utils/buildNetWorthEvolution.ts`
**Requirement**: GOAL-51, GOAL-52

**Tools**: NONE

**Done when**:
- [x] Pure function, `now` injectable, Decimal accumulation, null guard for < 2 movement months
- [x] `npx tsc --noEmit` introduces 0 new errors vs baseline

**Tests**: none (A2 delivers)
**Gate**: build

**Commit**: `feat(goals): add goal projection builder util`

---

### A2: buildGoalProjection spec tests

**What**: Create `src/__tests__/utils/buildGoalProjection.spec.ts` — spec-anchored tests derived from the amendment ACs, not the implementation: Independent Test (500/500/500 Sep–Nov, target 2000 → cumulatives 500/1000/1500 + projection reaching 2000 one month later); month-gap repetition; average formula incl. trailing repeat-months denominator; single movement month → null; negative average → history only (no projection); 60-month cap renders the capped projection; debit legs subtract; year-boundary labels (year only on first/last bucket of each year); future-dated movements ignored.
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/__tests__/utils/buildGoalProjection.spec.ts`
**Depends on**: A1
**Reuses**: builder pattern from `goalCalculations.spec.ts`
**Requirement**: GOAL-51, GOAL-52, GOAL-53 (data aspects)

**Tools**: NONE

**Done when**:
- [x] `npx jest src/__tests__/utils/buildGoalProjection.spec.ts` green
- [x] ≥ 8 tests; every test maps to an amendment AC / edge case

**Tests**: unit
**Gate**: quick (frontend, amendment)

**Commit**: `test(goals): add spec-anchored tests for goal projection builder`

---

### A3: GoalProjectionChart component

**What**: Create `GoalProjectionChart` (+ `styles.ts`) modeled on `BudgetDetails/components/BudgetHistoryChart`: one gifted-charts `LineChart`; `data` = history (solid, primary); `data2` = projection overlay (null over history indices, last real value repeated at the connect index, `strokeDashArray2`, textPlaceholder color); `interpolateMissingValues={false}`; `showArrow2` + `arrowConfig2` arrowhead at the final projection point; `maxValue = max(target, highest point)` as the top Y reference with compact-k `formatYLabel` (locale-safe parse per Accounts chart); pt-BR month labels via `xAxisLabelTexts`; `adjustToWidth` for few months, fixed spacing + `scrollToEnd` beyond; legend "Evolução atual" / "Projeção (média atual)"; renders nothing when the builder returns null (D3/D4, AC-1/2/6).
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/GoalDetails/components/GoalProjectionChart/index.tsx` (+ `styles.ts`)
**Depends on**: A1
**Reuses**: `BudgetDetails/components/BudgetHistoryChart` layout + legend, Accounts chart `formatYLabel`, `buildGoalProjection` labels
**Requirement**: GOAL-51, GOAL-52, GOAL-53 (chart rendering)

**Tools**: NONE

**Done when**:
- [x] Evolution solid line + dashed projection + arrowhead render from builder output; null → renders nothing
- [x] `npx tsc --noEmit` introduces 0 new errors vs baseline

**Tests**: none (component layer per Test Coverage Matrix)
**Gate**: build

**Commit**: `feat(goals): add goal evolution and projection chart component`

---

### A4: GoalDetails integration + hideAmount masking

**What**: Render `GoalProjectionChart` in GoalDetails directly below the progress `HeaderCard` (after the read-only note when present), above "Contas vinculadas"; existing layout untouched (D5). Gate every value-revealing text on `!hideAmount` — focused values disabled when hidden (AC-7, GOAL-53).
**Where**: `/Users/vap/00_code/JS/SmartFinances/src/screens/GoalDetails/index.tsx`
**Depends on**: A3
**Reuses**: existing screen layout/flows untouched
**Requirement**: GOAL-53

**Tools**: NONE

**Done when**:
- [x] Chart renders below the HeaderCard for goals with ≥ 2 movement months; nothing otherwise
- [x] `hideAmount` masks focused values
- [x] `npx tsc --noEmit` introduces 0 new errors vs baseline

**Tests**: none
**Gate**: build

**Commit**: `feat(goals): render evolution chart on goal details screen`

---

### A5: Amendment gates + docs sync

**What**: Run the full frontend gate (`npx jest` green vs 137-test baseline; `npx tsc --noEmit` 0 new errors vs 615-error baseline); record Batch 5 in the Batch Completion Log; refresh `.specs/project/STATE.md` Active Context (chart amendment shipped, pending Verifier). Requirement statuses stay "Implementing" until the Verifier pass per feature convention.
**Where**: `/Users/vap/00_code/JS/SmartFinances/.specs/features/financial-goals/tasks.md`, `/Users/vap/00_code/JS/SmartFinances/.specs/project/STATE.md`
**Depends on**: A4
**Reuses**: -
**Requirement**: GOAL-51, GOAL-52, GOAL-53

**Tools**: NONE

**Done when**:
- [ ] `npx jest` full suite green, count stated (baseline 137 + new)
- [ ] tsc delta vs baseline = 0 new errors
- [ ] Batch log + STATE.md updated in the same commit

**Tests**: none (verification task)
**Gate**: full

**Commit**: `docs(goals): record chart amendment gates and batch log`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase A (amendment)

Phase 1:  T1 → T2 → T3 → T4 → T5
Phase 2:  T5 → T6 → T7 → T8 → T9 → T10
Phase 3:  T10 → T11 → T12 → T13 → T14
Phase 4:  T14 → T15 → T16 → T17 → T18 → T19 → T20
Phase 5:  T20 → T21
Phase A:  T21 → A1 → A2 → A3 → A4 → A5
```

Execution is strictly sequential - one task at a time, in order. Batch packing for Execute: Phase 1 (5) = batch 1; Phase 2 (5) = batch 2; Phase 3 (4) = batch 3; Phases 4+5 (6+1=7) = batch 4; amendment Phase A (5) = batch 5 → 5 sequential batches if sub-agents are accepted. Phase A fits a single inline batch (5 ≤ 8).

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1–T2 | 1 schema file / 1 zod module + its tests | ✅ Granular |
| T3–T5 | 2 cohesive functions each in one service file + tests | ✅ Granular (cohesive split of one file, sequential) |
| T6–T9 | 1–4 endpoints in controller/routes pair + tests | ✅ Granular (same-file sequential slices) |
| T10 | 1 guard + 1 test | ✅ Granular |
| T11, T13, T14 | 1–2 hook/interface files, one concept | ✅ Granular |
| T12 | 1 util + tests | ✅ Granular |
| T15–T21 | 1 screen/component deliverable each (with its thin route file) | ✅ Granular |
| A1, A2 | 1 pure util / 1 spec test file | ✅ Granular (T12 pattern split: impl then tests, sequential) |
| A3, A4 | 1 component (chart + styles) / 1 integration render site | ✅ Granular |
| A5 | gates + docs sync only | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 (phase boundary) | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |
| T11 | T10 | T10 → T11 (phase boundary) | ✅ Match |
| T12 | T11 | T11 → T12 | ✅ Match |
| T13 | T12 | T12 → T13 | ✅ Match |
| T14 | T13 | T13 → T14 | ✅ Match |
| T15 | T14 | T14 → T15 (phase boundary) | ✅ Match |
| T16 | T15 | T15 → T16 | ✅ Match |
| T17 | T16 | T16 → T17 | ✅ Match |
| T18 | T17 | T17 → T18 | ✅ Match |
| T19 | T18 | T18 → T19 | ✅ Match |
| T20 | T19 | T19 → T20 | ✅ Match |
| T21 | T20 | T20 → T21 (phase boundary) | ✅ Match |
| A1 | T21 (goal detail shape) | T21 → A1 (amendment boundary) | ✅ Match |
| A2 | A1 | A1 → A2 | ✅ Match |
| A3 | A1 | A1 → A3 | ✅ Match |
| A4 | A3 | A3 → A4 | ✅ Match |
| A5 | A4 | A4 → A5 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Prisma schema/migration | none | none | ✅ OK |
| T2 | Backend zod schema | unit | unit | ✅ OK |
| T3–T5 | Backend service | unit | unit | ✅ OK |
| T6–T9 | Backend controller/routes | unit | unit | ✅ OK |
| T10 | Backend controller (account guard) | unit | unit | ✅ OK |
| T11 | Frontend interfaces | none | none | ✅ OK |
| T12 | Frontend utils | unit | unit | ✅ OK |
| T13–T14 | Frontend hooks | none | none | ✅ OK |
| T15–T21 | Frontend screens/components/routes | none | none | ✅ OK |
| A1 | Frontend utils | unit (delivered by A2) | none (A2 delivers) | ✅ OK (sequential pair, T12 pattern) |
| A2 | Frontend utils tests | unit | unit | ✅ OK |
| A3–A4 | Frontend component/screen | none | none | ✅ OK |
| A5 | Docs/gates | none | none | ✅ OK |
