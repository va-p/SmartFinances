# Subscription Designation Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (Medium scope, follows existing patterns; no `design.md`)
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase sampling and spec. Guidelines found: none (no AGENTS.md/CONTRIBUTING/CI coverage gates) - repo conventions inferred from existing tests (24 util/hook/store test files + 6 RTL spec files under `src/__tests__/`). Baseline documented in `.specs/STATE.md` (jest: 338 passing + 2 pre-existing broken suites; Watchman broken - always `--watchman=false`; lint fails at baseline with 22 pre-existing errors).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Utils / domain logic (`src/utils/subscriptionDesignation.ts`) | unit | All branches; 1:1 to designation ACs; all listed edge cases | `src/utils/__tests__/*.test.ts` | `yarn jest <file> --watchman=false` |
| Reusable components (`src/components/Accordion`) | unit (RTL render) | Behavior ACs: mount/unmount on toggle, chevron rotation transform, controlled props | `src/__tests__/components/*.spec.tsx` | `yarn jest <file> --watchman=false` |
| Select screens (`src/screens/TransactionSelect`) | unit (RTL render, mocked query hook + mocked list item) | Candidate filter wiring, selection contract, empty state, loading state | `src/__tests__/screens/*.spec.tsx` | `yarn jest <file> --watchman=false` |
| Heavy screens (`RegisterTransaction`, `Subscriptions`) | none | No component harness exists (env-broken deps: `api` -> device-info NativeEventEmitter; convention: logic extracted to utils). Wiring verified by build gate + inspection evidence at validation + interactive UAT | - | build gate only |
| Interfaces (`src/interfaces/transactions.ts`) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from the repo's own scripts (`yarn test` = jest; `yarn lint` = eslint). No typecheck script exists (tsc fails at baseline on `jest.setup.js`).

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `yarn jest <task's new test file(s)> --watchman=false` - exit 0 required |
| Build | After every task (phase completion; no-test tasks) | `yarn jest --watchman=false` with result = baseline + only the 2 pre-existing broken suites (`accountsFilter.test.ts` label assertion; `profile.spec.tsx` env-broken NativeEventEmitter) and 1 pre-existing test failure (accountsFilter), every new suite passing; AND `yarn eslint <files touched by the task>` with no new errors vs the file's pre-change error count |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Designation rules (pure, testable) and the accordion primitive.

```
T1        T2
```

### Phase 2: Picker

The transaction picker screen.

```
T1 → T3
```

### Phase 3: Integration

Editor wiring, then the Subscriptions entry flow.

```
T4 → T5
```

---

## Task Breakdown

### T1: Designation rules util + interface flags + tests — ✅ Complete (17 tests)

**What**: Pure designation rules (`isSubscriptionRecurrencePeriod`, `selectSubscriptionCandidates`, `resolveSubscriptionSwitch`, `resolveRecurringSwitch`, `resolveRecurrenceSaved`, `buildSubscriptionDesignationPayload`) + `is_subscription` / `hide_from_subscription_list` on `TransactionProps` + jest tests derived from the ACs.
**Where**: `src/utils/subscriptionDesignation.ts`, `src/utils/__tests__/subscriptionDesignation.test.ts`, `src/interfaces/transactions.ts`
**Depends on**: None
**Reuses**: `src/utils/subscriptionPaymentsSummary.ts` + its test (structure), `TransactionProps` (extends)
**Requirement**: SD-06, SD-16, SD-17, SD-18, SD-19, SD-22, SD-23, SD-24

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `selectSubscriptionCandidates` keeps only `type` CREDIT/DEBIT and `!is_subscription` (SD-06)
- [x] `resolveSubscriptionSwitch` on: `isSubscription: true`, `isRecurring: true`, period kept when MONTHLY/YEARLY else set to MONTHLY, `needsRecurrenceModal: true` only when the prior state did not qualify (not recurring or DAILY/WEEKLY) (SD-16, SD-17)
- [x] `resolveSubscriptionSwitch` off: `isSubscription: false`, nothing else changed (SD-21 toggle-off half)
- [x] `resolveRecurringSwitch` off: `isRecurring: false` and `isSubscription: false` (SD-18)
- [x] `resolveRecurrenceSaved` with DAILY/WEEKLY while designated: `isSubscription: false`; MONTHLY/YEARLY keeps it (SD-19)
- [x] `buildSubscriptionDesignationPayload`: `{is_subscription: true}` when on (create or edit); `{}` when off on create (field omitted - auto-classification stands); `{is_subscription: false}` when off on edit (SD-22, SD-23, SD-24)
- [x] Quick gate passes: `yarn jest src/utils/__tests__/subscriptionDesignation.test.ts --watchman=false` (17/17)
- [x] Test count: 17 tests pass (no silent deletions; 16 planned + 1 for the exported period predicate)
- [x] Build gate passes (356 tests: 355 passed + 1 pre-existing accountsFilter; suites 39: 37 passed + 2 pre-existing; eslint clean on the 3 files)

**Tests**: unit (per coverage matrix - utils layer, 1:1 to ACs)
**Gate**: quick, then build

**Commit**: `feat(subscriptions): add designation rules util with tests`

---

### T2: Accordion component + component test — ✅ Complete (4 tests)

**What**: Reusable `Accordion` (controlled `expanded`/`onToggle`, children) with the minimalist header: rule line + chevron + rule line (———v———); the chevron rotates 180 degrees (reanimated, collapsed v to expanded ^) and the content mounts/unmounts with fade transitions.
**Where**: `src/components/Accordion/index.tsx`, `src/components/Accordion/styles.ts`, `src/__tests__/components/accordion.spec.tsx`
**Depends on**: None
**Reuses**: `SubscriptionDetails` `RotatingCaret` pattern (reanimated interpolate rotation), `StepIndicator` spec's style-array transform assertions
**Requirement**: SD-12 (header visual + rotation + fades), SD-13 (tap toggles + mount/unmount)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Collapsed by default via controlled props: children absent when `expanded: false`, present when `expanded: true` (SD-12, SD-13)
- [x] Tapping the header calls `onToggle` exactly once (SD-13)
- [x] Collapsed chevron transform rotate 0 deg; expanded rotate 180 deg (SD-12)
- [x] Header renders as line + chevron + line (testIDs `accordion-header`, `accordion-caret`, `accordion-content`; line structure inspection-verified in styles.ts)
- [x] Quick gate passes: `yarn jest src/__tests__/components/accordion.spec.tsx --watchman=false` (4/4)
- [x] Test count: 4 tests pass (no silent deletions)
- [x] Build gate passes (40 suites: 39 passed + 1 pre-existing profile env-broken; 360/360 tests; the flaky pre-existing accountsFilter failure passed this run; eslint clean on the 3 files after fixing 4 new-file errors)

**Tests**: unit (per coverage matrix - reusable components, RTL render)
**Gate**: quick, then build

**Commit**: `feat(ui): add minimalist accordion component with rotating chevron`

---

### T3: TransactionSelect screen + screen test

**What**: Picker screen listing `selectSubscriptionCandidates(transactions)` via `useTransactionsQuery`, rows rendered with `TransactionListItem` (hideAmount from user configs), `Load` while loading, error `Alert`, `ListEmptyComponent` empty state, `RefreshControl`; selection contract `setTransaction` + `closeSelectTransaction` (AccountSelect pattern).
**Where**: `src/screens/TransactionSelect/index.tsx`, `src/screens/TransactionSelect/styles.ts`, `src/__tests__/screens/transactionSelect.spec.tsx`
**Depends on**: T1
**Reuses**: `src/screens/AccountSelect/index.tsx` (screen structure), `selectSubscriptionCandidates` (T1), `TransactionListItem`, `ListSeparator`, `Load`, `ListEmptyComponent`
**Requirement**: SD-06 (wiring), SD-07 (picker half: setTransaction + closeSelectTransaction), SD-08, SD-09, SD-10, SD-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Renders only candidates from a mixed list (CREDIT/DEBIT kept; TRANSFER_CREDIT/TRANSFER_DEBIT and `is_subscription: true` excluded) (SD-06)
- [ ] Tapping a candidate calls `setTransaction` with that transaction then `closeSelectTransaction` (SD-07)
- [ ] No candidates: renders the exact empty-state copy from SD-08 spec text
- [ ] Loading state renders the `Load` indicator (SD-09)
- [ ] Quick gate passes: `yarn jest src/__tests__/screens/transactionSelect.spec.tsx --watchman=false`
- [ ] Test count: 4 tests pass (no silent deletions)
- [ ] Build gate passes (full jest at baseline + eslint on the touched files adds no new errors)

**Tests**: unit (per coverage matrix - select screens, RTL render with mocked `useTransactionsQuery` + mocked `TransactionListItem`)
**Gate**: quick, then build

**Commit**: `feat(subscriptions): add transaction picker screen with tests`

---

### T4: RegisterTransaction designation wiring

**What**: Wire the designation into RegisterTransaction: `isSubscription` state + `advancedSelectorsExpanded` state (collapsed default, `initiallyOpenAdvancedSelectors` prop), the Accordion placed below the "Recorrente" toggle wrapping the "Assinatura" `ButtonToggle` (subtitle per SD-21), transition handlers via the T1 utils, `is_subscription` in create/edit payloads via `buildSubscriptionDesignationPayload`, hydration from `transactionData.is_subscription`, accordion hidden on Transfer tab and bulk edit.
**Where**: `src/screens/RegisterTransaction/index.tsx`
**Depends on**: T1, T2
**Reuses**: `ButtonToggle`, `RecurrenceSelect` modal (existing), `resolveSubscriptionSwitch`/`resolveRecurringSwitch`/`resolveRecurrenceSaved`/`buildSubscriptionDesignationPayload` (T1), `Accordion` (T2)
**Requirement**: SD-12 (placement + collapsed default), SD-14 (plain-only visibility), SD-15 (picker-path expansion), SD-16, SD-17, SD-18, SD-19 (wiring), SD-20 (hydration), SD-21 (subtitle), SD-22, SD-23, SD-24, SD-25, SD-26 (payload wiring)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Accordion renders right below the "Recorrente" toggle, collapsed by default, only when `!isBulkEdit && transactionType !== 'TRANSFER'` (SD-12, SD-14)
- [ ] `initiallyOpenAdvancedSelectors` prop starts the accordion expanded (SD-15)
- [ ] "Assinatura" toggle on: designation on, recurrence on, DAILY/WEEKLY period normalized to MONTHLY, RecurrenceSelect modal opens only when the prior state did not qualify (SD-16, SD-17)
- [ ] "Recorrente" toggle off also un-designates; RecurrenceSelect saving DAILY/WEEKLY while designated un-designates (SD-18, SD-19)
- [ ] Edit hydration sets the toggle from `transactionData.is_subscription` (SD-20)
- [ ] Subtitle 'Aparece em "Minhas assinaturas"' while on, none while off (SD-21)
- [ ] Create payload: `is_subscription: true` only when on (omitted when off); edit payload: always the toggle value; transfer payloads unchanged (SD-22, SD-23, SD-24, SD-25, SD-26)
- [ ] Build gate passes (full jest at baseline; eslint on the file adds no new errors vs its 17 pre-existing)

**Tests**: none (per coverage matrix - heavy screen layer: logic already unit-tested in T1; wiring verified by build gate + inspection at validation + interactive UAT)
**Gate**: build

**Commit**: `feat(transactions): add subscription designation selector behind accordion`

---

### T5: Subscriptions entry flow

**What**: Rewire "+" to present the "Adicionar assinatura" choice modal (`ModalViewSelection`, two option rows with the exact SD-02 copy); "Criar nova transação" dismisses it and opens the editor (create mode); "Selecionar transação existente" presents the "Selecione a transação" picker modal stacked over the choice modal; picking a transaction dismisses picker + choice, sets the edit id, and presents RegisterTransaction with `initiallyOpenAdvancedSelectors`.
**Where**: `src/screens/Subscriptions/index.tsx`, `src/screens/Subscriptions/styles.ts`
**Depends on**: T3, T4
**Reuses**: `ModalViewSelection` (`stackBehavior: 'push'`), `TransactionSelect` (T3), `RegisterTransaction` sheet (existing, `transactionId` state pre-wired)
**Requirement**: SD-01, SD-02, SD-03, SD-04, SD-05, SD-07 (screen half: dismiss + set id + present editor)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] "+" presents the choice modal, not the editor sheet directly (SD-01)
- [ ] The two options render with the exact SD-02 copy (titles + subtitles) (SD-02)
- [ ] "Criar nova transação": choice dismissed, editor presented with empty id (SD-03)
- [ ] "Selecionar transação existente": picker presented over the still-presented choice modal (SD-04)
- [ ] Picking a transaction: picker + choice dismissed, editor presented in edit mode with the accordion pre-expanded (SD-07 screen half)
- [ ] Build gate passes (full jest at baseline; eslint on the 2 touched files adds no new errors)

**Tests**: none (per coverage matrix - heavy screen layer: sheet presentation has no component harness; verified by build gate + inspection at validation + interactive UAT)
**Gate**: build

**Commit**: `feat(subscriptions): route add-subscription through choice modal and picker`

---

## Phase Execution Map

```
Phase 1:  T1 (designation rules)      T2 (accordion)
Phase 2:  T3 (picker)
Phase 3:  T4 (editor wiring) → T5 (subscriptions flow)

T1 → T3      (picker uses the designation rules)
T1 → T4      (editor wires the rules)
T2 → T4      (editor renders the accordion)
T3 → T5      (subscriptions flow presents the picker)
T4 → T5      (subscriptions flow opens the wired editor)
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent works one task at a time, in order (T1, T2, T3, T4, T5).

**Batching:** 5 tasks = single batch (<= ~8) - executed inline, no sub-agents. After T5 the Verifier runs automatically (author != verifier).

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks per worker, whole phases). When the whole feature fits a single batch (<= ~8 tasks), execution happens inline in the main window with no sub-agents spawned.

**The orchestrating agent's role during Execute:**
1. Count total tasks and pack phases into ~7-task batches - offer batch sub-agents if that yields more than one batch and the user accepts
2. Dispatch the next batch (to a worker, or execute inline)
3. Receive the compact batch summary
4. Update tasks.md with results
5. If the batch summary shows all tasks complete: proceed to the next batch
6. If a task failed: decide fix/escalate before dispatching the next batch

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Designation rules util + interface + tests | 1 util + its tests + 2 interface fields | ✅ Granular (cohesive logic layer; tests co-located per matrix) |
| T2: Accordion component + test | 1 component + its test | ✅ Granular |
| T3: TransactionSelect screen + test | 1 screen + its test | ✅ Granular |
| T4: RegisterTransaction designation wiring | 1 file change (wiring only; logic from T1, UI from T2) | ✅ Granular |
| T5: Subscriptions entry flow | 2 files (screen + styles, one flow) | ✅ Granular (cohesive single flow) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | no incoming arrows | ✅ Match |
| T2 | None | no incoming arrows | ✅ Match |
| T3 | T1 | `T1 → T3` (Phase 2 line) | ✅ Match |
| T4 | T1, T2 | `(T1, T2) ──→ T4` (Phase 3 line) | ✅ Match |
| T5 | T3, T4 | `T4 ──→ T5` + `T3 ↗` (Phase 3 line) | ✅ Match |

No dependency points to a later phase (T1, T2 are Phase 1; T3 Phase 2; T4, T5 Phase 3 - all dependencies point backward).

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | utils (subscriptionDesignation) + interfaces | unit (utils); none (interfaces) | unit | ✅ OK |
| T2 | reusable component (Accordion) | unit (RTL) | unit | ✅ OK |
| T3 | select screen (TransactionSelect) | unit (RTL, mocked deps) | unit | ✅ OK |
| T4 | heavy screen (RegisterTransaction) | none | none (build gate + inspection + UAT) | ✅ OK |
| T5 | heavy screen (Subscriptions) | none | none (build gate + inspection + UAT) | ✅ OK |

No task defers its required tests to another task; `Tests: none` appears only where the coverage matrix says none.

---

## Task Verification Standards

Every task follows `Done when` + `Tests` + `Gate` from its definition. Each `Done when` entry is binary pass/fail and references the gate commands above. Test counts are stated per task to prevent silent deletions.
