# Synced Subscriptions Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/synced-subscriptions/design.md`
**Status**: Approved

**Repository mirrors**: This file and the feature artifacts are mirrored in `SmartFinances/.specs/features/synced-subscriptions/` and `smart-finances-backend/.specs/features/synced-subscriptions/`. Each task belongs to one repository. Its atomic commit includes the code, tests, checkbox, and traceability update in that repository's mirror. Never include unrelated user changes.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (`AGENTS.md`, contributor guides, docs, and CI coverage gates absent); strong defaults applied. Samples: `categorization.provider.test.ts`, `bankingSync.service.test.ts`, `subscription.service.test.ts`, `subscription.schema.test.ts`, `transaction.controller.test.ts`, `transactionSelect.spec.tsx`, `subscriptionDesignation.test.ts`, `subscriptionDisplay.test.ts`, and `useTransferDirection.spec.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Backend domain/provider services | unit (`node:test`) | All branches; 1:1 to spec ACs; every listed edge case | `smart-finances-backend/src/__tests__/*.test.ts` | `node --import tsx --test <task-test-files>` |
| Backend routes/controllers | integration (`node:test`, mocked Prisma boundary) | Every route in scope: happy path, ownership, validation, and failure paths | `smart-finances-backend/src/__tests__/*controller.test.ts` | `node --import tsx --test <task-test-files>` |
| Backend Prisma/entity/config contracts | none | Prisma generation and TypeScript build only | `prisma/schema.prisma`, provider interface files | build gate only |
| Frontend utils/domain logic | unit (Jest) | All branches; 1:1 to spec ACs; every listed edge case | `SmartFinances/src/utils/__tests__/*.test.ts` | `yarn jest <task-test-files> --runInBand --watchman=false --forceExit` |
| Frontend hooks/screens/components | unit (React Native Testing Library with mocked navigation, API, hooks, and heavy native dependencies) | Selection, loading/error/success, account-aware state, details actions, and actual/forecast rendering | `SmartFinances/src/__tests__/{hooks,screens,components}/*.spec.tsx` | `yarn jest <task-test-files> --runInBand --watchman=false --forceExit` |
| Frontend interfaces/type-only call sites | none | Existing affected Jest tests plus diagnostics/build evidence | `src/interfaces`, type-only call-site edits | build gate only |

**Baselines:**

- Backend: `yarn test:unit` is red before this feature because `transaction.controller.test.ts` has four pre-existing `HIDE-06` failures (34/38 pass in that file). All other backend tests and every new test must pass; the full-suite comparison must retain exactly those four failures and no new ones.
- Frontend: `yarn test --runInBand --watchman=false --forceExit` starts at 69 suites / 581 tests, with 5 failed suites, 10 failed tests, 64 passed suites, and 571 passed tests. The full-suite comparison must not add failures. Every targeted new or changed suite must exit 0.
- Frontend lint has no clean repo-wide baseline. Run ESLint only on touched files and require no new findings. Backend has no lint script; `yarn build` is its static gate.

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick (backend) | After each backend unit/integration task | `node --import tsx --test <task-test-files>`; exit 0 required |
| Quick (frontend) | After each frontend tested task | `yarn jest <task-test-files> --runInBand --watchman=false --forceExit`; exit 0 required |
| Full (backend) | After Phases 1 and 2 | `yarn test:unit`; only the four documented pre-existing `HIDE-06` failures are accepted |
| Full (frontend) | After Phases 3 and 4 | `yarn test --runInBand --watchman=false --forceExit`; no failures beyond the documented baseline |
| Build (backend) | T1, T2, and after Phases 1 and 2 | `yarn prisma:generate && yarn build`; exit 0 required |
| Build (frontend) | After each frontend task | `yarn eslint <files-touched-by-task>`; no new findings, plus targeted tests where required |

---

## Execution Plan

Phases are ordered and run sequentially. Tasks within a phase run in order.

### Phase 1: Backend analysis and series foundation

```
T1 → T6
T2 → T3
T2 → T4
T2 → T5
T2 → T6
T5 → T6
```

### Phase 2: Backend endpoints and Openi integration

```
T6 → T7
T6 → T8
T6 → T9
T9 → T10
T9 → T11
T5 → T11
T3 → T12
T4 → T12
T6 → T12
T7 → T13
```

### Phase 3: Frontend contracts and designation flow

```
T9 → T15
T10 → T15
T11 → T15
T14 → T18
T15 → T16
T15 → T17
T16 → T18
T17 → T18
```

### Phase 4: Frontend editor, details, and payments

```
T14 → T19
T16 → T20
T17 → T20
T16 → T21
```

---

## Task Breakdown

### T1: Add synced-series Prisma model

**What**: Add the series enum/table, transaction FK, inverse relations, unique identity, indexes, and reviewed local migration SQL.
**Where**: `smart-finances-backend/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Existing `TransactionType`, `RecurrencePeriod`, and subscription flags
**Requirement**: SSI-02, SSI-03, SSI-13..22, SSI-33..35

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Schema matches the approved model and no existing manual row is backfilled or changed.
- [x] Local migration contains only the new enum/table/FK/indexes.
- [x] Build gate passes: `yarn prisma:generate && yarn build`.
- [x] Test count: no test changes; existing backend baseline preserved.

**Tests**: none
**Gate**: build
**Commit**: `feat(subscriptions): add synced series persistence model`

---

### T2: Add enriched analysis contract

**What**: Add provider-neutral enriched result, series candidate, context, and single-chunk `AnalysisProvider` types while retaining current callers compilable.
**Where**: `smart-finances-backend/src/services/categorization.provider.ts`
**Depends on**: None
**Reuses**: `MinimalTransaction` and `CategoryOption`
**Requirement**: SSI-23, SSI-24, SSI-30, SSI-31, SSI-42

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Contract exposes all approved enriched fields and accepts at most 25 rows per `analyze` call by convention.
- [x] Existing `CategorizationProvider` remains available until import migration.
- [x] Build gate passes: `yarn prisma:generate && yarn build`.
- [x] Test count: no test changes; existing backend baseline preserved.

**Tests**: none
**Gate**: build
**Commit**: `feat(analysis): add enriched provider contract`

---

### T3: Implement resilient batch analysis

**What**: Implement chunking, timeout, pacing, ordered results, one optional fallback attempt, final default-category results, and sanitized logging.
**Where**: `smart-finances-backend/src/services/resilientAnalysis.provider.ts`
**Depends on**: T2
**Reuses**: Existing default-category and 25-item/1-second batching conventions
**Requirement**: SSI-28, SSI-29, SSI-30, SSI-40, SSI-41

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Primary success never calls fallback; primary failure calls fallback exactly once; total failure returns unclassified defaults.
- [x] Tests cover timeout, malformed provider failure, chunk order, pacing, and logs without sensitive payloads.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/resilientAnalysis.provider.test.ts`.
- [x] Test count: at least 8 new tests pass with no silent deletions.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `feat(analysis): add resilient provider fallback`

---

### T4: Enrich Gemini analysis

**What**: Implement the single-chunk contract with structured subscription fields, candidate-aware prompt, strict top-level parsing, and sanitized optional-field handling.
**Where**: `smart-finances-backend/src/services/gemini.service.ts`
**Depends on**: T2
**Reuses**: Existing Gemini SDK configuration and category fallback
**Requirement**: SSI-23, SSI-24, SSI-27, SSI-29, SSI-31, SSI-32

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Gemini returns all enriched fields and throws unusable responses for resilient failover.
- [x] Prompt excludes prohibited personal fields and historical scanning is not introduced.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/categorization.provider.test.ts`.
- [x] Test count: at least 10 tests in the updated suite pass with no silent deletions.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `feat(analysis): enrich Gemini subscription detection`

---

### T5: Add synced forecast calculations

**What**: Add pure next-forecast and month-forecast functions with interval 1, short-month clamping, null periodicity, and actual-month exclusion.
**Where**: `smart-finances-backend/src/services/syncedSubscriptionForecast.ts`
**Depends on**: T2
**Reuses**: `calculateNextOccurrence` and month semantics from `subscription.service.ts`
**Requirement**: SSI-33, SSI-34, SSI-35, SSI-37, SSI-38

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests pin monthly/yearly forecasts, leap years, day 31, old payments, null periods, and selected-month boundaries.
- [x] No function writes recurrence or transactions.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/syncedSubscriptionForecast.test.ts`.
- [x] Test count: at least 9 new tests pass.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `feat(subscriptions): add synced forecast calculations`

---

### T6: Implement synced-series persistence service

**What**: Implement merchant normalization, validated imported-series resolution, idempotent designation, dismissal, reactivation, visibility, and flag synchronization.
**Where**: `smart-finances-backend/src/services/syncedSubscription.service.ts`
**Depends on**: T1, T2, T5
**Reuses**: Prisma P2002 pattern from import and institution creation
**Requirement**: SSI-02, SSI-03, SSI-08..22, SSI-25, SSI-26

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests prove recurrence preservation, no child creation, unique matching, P2002 refetch, dismissed suppression, explicit reactivation, hide behavior, and deletion-safe preferences.
- [x] Model-suggested series IDs are accepted only from same-account/direction candidates.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/syncedSubscription.service.test.ts`.
- [x] Test count: at least 14 new tests pass.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `feat(subscriptions): add synced series service`

---

### T7: Add synced designation endpoint

**What**: Add authenticated `POST /subscription/synced/designate` with strict body validation and 200/404/422 behavior.
**Where**: `smart-finances-backend/src/controllers/subscription.controller.ts`
**Depends on**: T6
**Reuses**: Existing subscription router, authentication, async handler, and Zod validation
**Requirement**: SSI-01, SSI-02, SSI-03, SSI-08, SSI-10, SSI-11, SSI-12, SSI-19

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Route is declared before `/:id` and delegates all state changes to T6.
- [x] Tests cover success, retry idempotency, invalid body, unauthenticated, not-owned, transfer, and unsynced target.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/subscription.controller.test.ts src/__tests__/subscription.schema.test.ts`.
- [x] Test count: at least 7 new tests pass.

**Tests**: integration
**Gate**: quick, then full
**Commit**: `feat(subscriptions): add synced designation endpoint`

---

### T8: Add synced-series state endpoint

**What**: Add authenticated `PATCH /subscription/synced/:id` for series dismissal and visibility with strict at-least-one-field validation.
**Where**: `smart-finances-backend/src/routes/subscription.routes.ts`
**Depends on**: T6
**Reuses**: T6 dismissal/visibility operations and existing route middleware
**Requirement**: SSI-17, SSI-18, SSI-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Dismissal affects the whole series; hide does not disable future matching.
- [x] Tests cover both actions, invalid/empty body, invalid UUID, and not-owned 404.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/subscription.controller.test.ts src/__tests__/subscription.schema.test.ts`.
- [x] Test count: at least 6 new tests pass in addition to T7 coverage.

**Tests**: integration
**Gate**: quick, then full
**Commit**: `feat(subscriptions): add synced series state endpoint`

---

### T9: Combine manual and synced subscription lists

**What**: Extend `GET /subscription` with visible nonempty synced series, latest-charge representatives, string IDs, and combined sorting.
**Where**: `smart-finances-backend/src/controllers/subscription.controller.ts`
**Depends on**: T6
**Reuses**: Existing manual `formatSubscription` and Prisma latest-row query patterns
**Requirement**: SSI-13, SSI-14, SSI-15, SSI-16, SSI-21, SSI-22, SSI-35, SSI-39

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Manual entries remain unchanged semantically; synced entries appear once and empty/dismissed/hidden series are excluded.
- [x] Latest deletion-derived representative and null forecast are covered.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/subscription.controller.test.ts src/__tests__/subscription.service.test.ts`.
- [x] Test count: at least 7 new tests pass with existing manual tests updated only for the approved string ID/source DTO.

**Tests**: integration
**Gate**: quick, then full
**Commit**: `feat(subscriptions): include synced series in list`

---

### T10: Support synced subscription details

**What**: Extend `GET /subscription/:id` to numeric manual IDs and synced UUIDs, including hidden/dismissed state and latest-charge DTO values.
**Where**: `smart-finances-backend/src/schemas/subscription.schema.ts`
**Depends on**: T9
**Reuses**: Combined DTO formatter from T9
**Requirement**: SSI-14, SSI-15, SSI-17, SSI-18, SSI-35, SSI-36

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Numeric IDs and UUIDs work; invalid IDs and cross-user access return the specified errors.
- [x] Details expose null periodicity and `next_payment_at=null` when no reliable forecast exists.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/subscription.controller.test.ts src/__tests__/subscription.schema.test.ts`.
- [x] Test count: at least 6 new tests pass.

**Tests**: integration
**Gate**: quick, then full
**Commit**: `feat(subscriptions): support synced series details`

---

### T11: Return actual synced charges and forecasts

**What**: Extend `GET /subscription/payments` with actual synced charges and nonduplicated pending forecasts while retaining manual schedules.
**Where**: `smart-finances-backend/src/controllers/subscription.controller.ts`
**Depends on**: T5, T9
**Reuses**: T5 forecast math and existing manual occurrence generation
**Requirement**: SSI-33, SSI-34, SSI-37, SSI-38, SSI-39

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Actual rows use actual amounts/dates; forecast rows are omitted when an actual exists in that month; multiple actual charges remain distinct.
- [x] Tests cover null periodicity, short months, sorting, and unchanged manual payments.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/subscription.controller.test.ts`.
- [x] Test count: at least 7 new tests pass.

**Tests**: integration
**Gate**: quick, then full
**Commit**: `feat(subscriptions): add synced payment forecasts`

---

### T12: Classify subscriptions during Openi import

**What**: Switch fresh bank/card imports to resilient enriched analysis, load account candidates once, persist validated memberships, and exclude investments and historical duplicates.
**Where**: `smart-finances-backend/src/services/bankingSync.service.ts`
**Depends on**: T3, T4, T6
**Reuses**: Existing provider dedup, category fallback, notifications, and import pipelines
**Requirement**: SSI-13, SSI-16, SSI-23..32, SSI-40, SSI-41, SSI-42

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests cover active/dismissed matching, invalid candidate IDs, DEBIT-only detection, investments, retries, concurrent identity, and total provider failure.
- [x] No extra request per transaction is introduced and imported recurrence remains untouched.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/bankingSync.service.test.ts src/__tests__/categorization.provider.test.ts src/__tests__/resilientAnalysis.provider.test.ts`.
- [x] Test count: at least 10 new import tests pass with no silent deletions.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `feat(openi): classify imported subscriptions`

---

### T13: Bridge synced subscription edits without recurrence

**What**: Route explicit `is_subscription` changes in `PATCH /transaction/edit` through the series service while preserving all transaction recurrence fields.
**Where**: `smart-finances-backend/src/controllers/transaction.controller.ts`
**Depends on**: T7
**Reuses**: T6/T7 designation and dismissal operations inside the existing transaction boundary
**Requirement**: SSI-02, SSI-03, SSI-09, SSI-17, SSI-18, SSI-19

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Synced ON/OFF affects the whole series and creates no child; manual edit behavior remains unchanged.
- [x] Failure rolls back the surrounding edit and no series/flag partial state remains.
- [x] Quick gate passes: `node --import tsx --test src/__tests__/transaction.subscription.test.ts`.
- [x] Test count: at least 6 new tests pass; the four existing `HIDE-06` failures remain isolated and untouched.

**Tests**: unit
**Gate**: quick, then full
**Commit**: `fix(transactions): decouple synced subscription edits`

---

### T14: Add account-aware selector transitions

**What**: Extend subscription selector helpers so synced designation never enables/changes recurrence and manual transitions retain current rules.
**Where**: `SmartFinances/src/utils/subscriptionDesignation.ts`
**Depends on**: None
**Reuses**: Existing pure selector helpers and test fixtures
**Requirement**: SSI-02, SSI-03, SSI-04, SSI-05, SSI-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests cover synced ON/OFF, recurrence OFF, DAILY/WEEKLY saves, hydration inputs, and every existing manual branch.
- [x] Quick gate passes: `yarn jest src/utils/__tests__/subscriptionDesignation.test.ts --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 7 new tests pass and all existing selector tests remain enabled.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `fix(subscriptions): decouple synced selector state`

---

### T15: Apply mixed-source subscription DTO contract

**What**: Change public subscription/payment IDs to strings, add source/manual transaction/forecast fields, expose `banking_integration`, and make type-only call-site adjustments.
**Where**: `SmartFinances/src/interfaces/subscriptions.ts`
**Depends on**: T9, T10, T11
**Reuses**: Backend DTO from T9..T11 and existing navigation params
**Requirement**: SSI-14, SSI-35, SSI-36, SSI-37, SSI-38

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] IDs and route params accept both sources without numeric coercion of UUIDs.
- [x] Existing summary/display tests are updated only for approved DTO types and pass.
- [x] Quick gate passes: `yarn jest src/utils/__tests__/subscriptionPaymentsSummary.test.ts src/utils/__tests__/subscriptionDisplay.test.ts --runInBand --watchman=false --forceExit`.
- [x] Test count: all pre-existing tests in both suites pass with no silent deletions.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `feat(subscriptions): support mixed source identifiers`

---

### T16: Add no-forecast display behavior

**What**: Render the exact friendly no-forecast message in the shared display helper and subscription list item while preserving normal recurrence labels.
**Where**: `SmartFinances/src/utils/subscriptionDisplay.ts`
**Depends on**: T15
**Reuses**: `SubscriptionListItem` and existing frequency text helper
**Requirement**: SSI-35, SSI-36

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Null synced periodicity shows `Sem previsão da próxima cobrança`; MONTHLY/YEARLY output and manual empty behavior remain spec-compliant.
- [x] Quick gate passes: `yarn jest src/utils/__tests__/subscriptionDisplay.test.ts src/__tests__/components/subscriptionListItem.spec.tsx --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 4 new tests pass.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `feat(subscriptions): add no forecast display`

---

### T17: Add synced subscription mutation hooks

**What**: Add designation and series-state mutations with the approved API payloads, invalidations, pending states, and error propagation.
**Where**: `SmartFinances/src/hooks/useSubscriptionMutations.ts`
**Depends on**: T15
**Reuses**: Existing React Query mutation and alert conventions
**Requirement**: SSI-01, SSI-06, SSI-07, SSI-08, SSI-17, SSI-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests verify endpoints, payload, cache invalidations, no account invalidation on designation, and failure propagation.
- [x] Quick gate passes: `yarn jest src/__tests__/hooks/subscriptionMutations.spec.tsx --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 6 new tests pass.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `feat(subscriptions): add synced mutation hooks`

---

### T18: Branch the subscription picker by account source

**What**: Designate synced selections directly, retain manual editor navigation, disable repeated presses, dismiss only on success, and preserve the picker with the specified alert on failure.
**Where**: `SmartFinances/src/screens/Subscriptions/index.tsx`
**Depends on**: T14, T16, T17
**Reuses**: Existing choice/picker modals and RegisterTransaction manual path
**Requirement**: SSI-01, SSI-04, SSI-06, SSI-07, SSI-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Screen tests prove synced success/error/retry behavior and unchanged manual editor presentation.
- [x] No synced selection opens RegisterTransaction or RecurrenceSelect.
- [x] Quick gate passes: `yarn jest src/__tests__/screens/subscriptions.spec.tsx --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 6 new tests pass.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `fix(subscriptions): designate synced picker transactions`

---

### T19: Preserve synced recurrence in RegisterTransaction

**What**: Wire account-aware helpers and hydration into the editor and keep explicit subscription flags in edit payloads without recurrence side effects.
**Where**: `SmartFinances/src/screens/RegisterTransaction/index.tsx`
**Depends on**: T14
**Reuses**: T14 transitions, existing `accountBankingIntegration` state, and backend T13 bridge
**Requirement**: SSI-02, SSI-03, SSI-05, SSI-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Synced toggles do not open RecurrenceSelect or alter recurrence; manual toggles retain legacy behavior.
- [x] Synced hydration does not infer recurrence from `is_subscription`.
- [x] Quick gate passes: `yarn jest src/__tests__/screens/registerTransactionSubscriptions.spec.tsx src/utils/__tests__/subscriptionDesignation.test.ts --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 5 new editor tests pass with all T14 tests.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `fix(transactions): preserve synced recurrence on edit`

---

### T20: Manage synced series in SubscriptionDetails

**What**: Use synced dismissal/visibility mutations, hide the legacy recurrence editor for synced series, and render forecast/no-forecast details.
**Where**: `SmartFinances/src/screens/SubscriptionDetails/index.tsx`
**Depends on**: T16, T17
**Reuses**: Existing details layout and manual mutation branch
**Requirement**: SSI-17, SSI-18, SSI-20, SSI-35, SSI-36

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Synced dismissal/hide use series IDs; manual actions still use transaction IDs.
- [x] Synced legacy edit controls are absent and no-forecast copy is visible.
- [x] Quick gate passes: `yarn jest src/__tests__/screens/subscriptionDetails.spec.tsx --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 6 new tests pass.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `feat(subscriptions): manage synced series details`

---

### T21: Display actual and forecast payments

**What**: Support string series navigation and distinct actual/forecast rows in SubscriptionPayments without changing paid/pending visual semantics.
**Where**: `SmartFinances/src/screens/SubscriptionPayments/index.tsx`
**Depends on**: T16
**Reuses**: Existing payment list item, totals, period selector, and `is_forecast` DTO field
**Requirement**: SSI-37, SSI-38, SSI-39

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Actual rows remain paid and forecast rows pending; keys distinguish multiple actual charges; UUID navigation is preserved.
- [x] Empty/manual behavior remains unchanged.
- [x] Quick gate passes: `yarn jest src/__tests__/screens/subscriptionPayments.spec.tsx src/__tests__/components/subscriptionPaymentListItem.spec.tsx --runInBand --watchman=false --forceExit`.
- [x] Test count: at least 5 new tests pass.

**Tests**: unit
**Gate**: quick, then build
**Commit**: `feat(subscriptions): display actual and forecast payments`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1: T1, T2, T3, T4, T5, T6 (execution order; dependencies above)
Phase 2: T7, T8, T9, T10, T11, T12, T13 (execution order; dependencies above)
Phase 3: T14, T15, T16, T17, T18 (execution order; dependencies above)
Phase 4: T19, T20, T21 (execution order; dependencies above)
```

Execution is sequential within a phase. The 21 tasks pack into more than one batch, so Execute must offer batch sub-agents before dispatch. The Verifier still runs automatically after T21. Interactive UAT follows implementation for synced/manual selection, import classification, dismissal, forecasts, and failure states; production migration and push remain excluded.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | One Prisma model contract and migration | ✅ Granular |
| T2 | One provider contract | ✅ Granular |
| T3 | One resilient provider component | ✅ Granular |
| T4 | One provider implementation | ✅ Granular |
| T5 | One pure forecast module | ✅ Granular |
| T6 | One persistence service | ✅ Granular |
| T7 | One designation endpoint | ✅ Granular |
| T8 | One state endpoint | ✅ Granular |
| T9 | One list endpoint | ✅ Granular |
| T10 | One detail contract/endpoint | ✅ Granular |
| T11 | One payments endpoint | ✅ Granular |
| T12 | One import pipeline integration | ✅ Granular |
| T13 | One controller bridge | ✅ Granular |
| T14 | One selector helper module | ✅ Granular |
| T15 | One DTO contract and required type adjustments | ✅ Granular |
| T16 | One display behavior | ✅ Granular |
| T17 | One mutation hook module | ✅ Granular |
| T18 | One picker flow | ✅ Granular |
| T19 | One editor integration | ✅ Granular |
| T20 | One details screen | ✅ Granular |
| T21 | One payments screen behavior | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | No incoming arrow | ✅ Match |
| T2 | None | No incoming arrow | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T2 | T2 → T4 | ✅ Match |
| T5 | T2 | T2 → T5 | ✅ Match |
| T6 | T1, T2, T5 | T1/T2/T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T6 | T6 → T8 | ✅ Match |
| T9 | T6 | T6 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |
| T11 | T5, T9 | T5/T9 → T11 | ✅ Match |
| T12 | T3, T4, T6 | T3/T4/T6 → T12 | ✅ Match |
| T13 | T7 | T7 → T13 | ✅ Match |
| T14 | None | No incoming arrow | ✅ Match |
| T15 | T9, T10, T11 | T9/T10/T11 → T15 | ✅ Match |
| T16 | T15 | T15 → T16 | ✅ Match |
| T17 | T15 | T15 → T17 | ✅ Match |
| T18 | T14, T16, T17 | T14/T16/T17 → T18 | ✅ Match |
| T19 | T14 | T14 → T19 | ✅ Match |
| T20 | T16, T17 | T16/T17 → T20 | ✅ Match |
| T21 | T16 | T16 → T21 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Prisma/entity | none | none | ✅ OK |
| T2 | Provider/entity contract | none | none | ✅ OK |
| T3 | Backend provider service | unit | unit | ✅ OK |
| T4 | Backend provider service | unit | unit | ✅ OK |
| T5 | Backend domain service | unit | unit | ✅ OK |
| T6 | Backend domain service | unit | unit | ✅ OK |
| T7 | Backend route/controller | integration | integration | ✅ OK |
| T8 | Backend route/controller | integration | integration | ✅ OK |
| T9 | Backend route/controller | integration | integration | ✅ OK |
| T10 | Backend route/schema | integration | integration | ✅ OK |
| T11 | Backend route/controller | integration | integration | ✅ OK |
| T12 | Backend import service | unit | unit | ✅ OK |
| T13 | Backend controller | unit with mocked boundary, plus integration coverage in T7 | unit | ✅ OK |
| T14 | Frontend domain util | unit | unit | ✅ OK |
| T15 | Frontend DTO and affected utils tests | unit regression + type gate | unit | ✅ OK |
| T16 | Frontend util/component | unit | unit | ✅ OK |
| T17 | Frontend hook | unit | unit | ✅ OK |
| T18 | Frontend screen | unit | unit | ✅ OK |
| T19 | Frontend screen | unit | unit | ✅ OK |
| T20 | Frontend screen | unit | unit | ✅ OK |
| T21 | Frontend screen/component | unit | unit | ✅ OK |

---

## Requirement Coverage

All SSI-01..42 requirements map to at least one task. No task implements behavior outside the approved spec and design. The spec traceability table moves to `In Tasks` with 42 mapped and 0 unmapped when this plan is approved.
