# Subscription Designation Validation

**Date**: 2026-10-28
**Spec**: `.specs/features/subscription-designation/spec.md` (SD-01..SD-26)
**Tasks**: `.specs/features/subscription-designation/tasks.md` (T1–T5, all complete)
**Diff range**: `d1b14f4..e853f1c` (full feature; T1 `d1b14f4` pre-merge in history, T2–T5 = `ae99c5e..HEAD`)
**Verifier**: independent sub-agent (author ≠ verifier); read-only over the real tree, sensor mutations in an isolated scratch worktree only

---

## Validation: subscription-designation — PASS ✅

All 26 acceptance criteria re-derived independently with evidence-or-zero. Automated layers are covered by 26 feature tests (17 util + 4 component + 5 screen); heavy-screen layers (RegisterTransaction, Subscriptions) have no component harness by project convention (coverage matrix in `tasks.md`; precedent `.specs/features/account-institutions/validation.md`) and are verified by file:line inspection evidence below.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | Designation rules util + interface flags + 17 tests (commit `d1b14f4`) |
| T2 | ✅ Done | Accordion component + 4 tests (commit `5788efd`) |
| T3 | ✅ Done | TransactionSelect screen + 5 tests (commit `ed61c85`) |
| T4 | ✅ Done | RegisterTransaction wiring — inspection + build gate (commit `8b3416c`) |
| T5 | ✅ Done | Subscriptions entry flow — inspection + build gate (commit `e853f1c`) |

---

## Spec-Anchored Acceptance Criteria

### P1: Subscription entry choice (SD-01..SD-05) — inspection layer (heavy screen)

| Criterion | Spec-defined outcome | `file:line` + assertion / implementation | Result |
| --------- | -------------------- | ---------------------------------------- | ------ |
| SD-01 WHEN tap "+" THEN choice modal, NOT editor sheet directly | "Adicionar assinatura" choice modal presented | `src/screens/Subscriptions/index.tsx:184` — `onPress={() => handleOpenAddSubscription()}`; `index.tsx:119-121` presents `addSubscriptionSheetRef` (choice modal mounted `index.tsx:255-260`); editor sheet only reachable via `index.tsx:123-126` → `index.tsx:113-116` | ✅ PASS (inspection) |
| SD-02 Choice modal offers exactly two options with exact copy | Titles + subtitles exact | `src/screens/Subscriptions/index.tsx:267` `Selecionar transação existente`; `:269` `Inclui transações importadas de contas sincronizadas`; `:279` `Criar nova transação`; `:281` `Cadastre uma nova transação recorrente`; exactly two `OptionRow`s at `:262` and `:274` | ✅ PASS (inspection) |
| SD-03 WHEN choose "Criar nova transação" THEN dismiss choice modal + editor in create mode (empty id) | Choice dismissed, empty id, editor presented | `src/screens/Subscriptions/index.tsx:123-126` — dismiss choice + `handleOpenRegisterTransaction()`; `:114` `setTransactionId('')`; `:116` presents editor | ✅ PASS (inspection) |
| SD-04 WHEN choose "Selecionar transação existente" THEN picker stacked over still-presented choice modal | Picker pushed on top, choice beneath | `src/screens/Subscriptions/index.tsx:128-130` presents picker without dismissing choice; `src/components/Modals/ModalViewSelection/index.tsx:40` `stackBehavior='push'` keeps the choice sheet mounted beneath; picker mounted `Subscriptions/index.tsx:289-294` | ✅ PASS (inspection) |
| SD-05 WHEN dismiss picker (pan-down or backdrop) THEN return to choice modal still presented, no editor open | Choice modal still presented, editor not opened | `src/components/Modals/ModalViewSelection/index.tsx:41` `enablePanDownToClose` + backdrop; push stack pops only the top sheet; `src/screens/Subscriptions/index.tsx:299-301` `closeSelectTransaction` only dismisses the picker sheet — no path presents RegisterTransaction on dismissal | ✅ PASS (inspection) |

### P1: Transaction picker (SD-06..SD-11) — util + screen test layers

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| SD-06 Picker lists only designation candidates: CREDIT/DEBIT and not `is_subscription` (transfers + already-designated incl. hidden excluded) | Exactly that filter | `src/utils/__tests__/subscriptionDesignation.test.ts:87` — `expect(candidates).toEqual([debit, credit])` with TRANSFER_CREDIT/TRANSFER_DEBIT, `is_subscription: true` and hidden designated excluded (`:68-84`); empty case `:91-97`; screen wiring `src/__tests__/screens/transactionSelect.spec.tsx:99-103` — rows 1/3 present, transfer+designated rows null; impl `src/utils/subscriptionDesignation.ts:88-92` | ✅ PASS |
| SD-07 WHEN tap candidate THEN `setTransaction` + `closeSelectTransaction`; Subscriptions dismisses picker+choice, sets edit id, presents editor with accordion expanded | Selection contract + screen flow | `src/__tests__/screens/transactionSelect.spec.tsx:131` — `expect(setTransaction).toHaveBeenCalledWith(debit)`; `:132` — `expect(closeSelectTransaction).toHaveBeenCalledTimes(1)`; screen half `src/screens/Subscriptions/index.tsx:132-137` (set id, `setOpenAdvancedSelectors(true)`, dismiss both, present editor) + `:248` prop pass | ✅ PASS (test + inspection) |
| SD-08 WHEN no candidate THEN exact empty-state copy | Exact string | `src/__tests__/screens/transactionSelect.spec.tsx:147-151` — `getByText('Nenhuma transação elegível. Apenas transações de crédito ou débito ainda não classificadas como assinatura podem ser selecionadas.')`; impl `src/screens/TransactionSelect/index.tsx:32` | ✅ PASS |
| SD-09 WHILE query loading THEN loading indicator | `Load` indicator shown | `src/__tests__/screens/transactionSelect.spec.tsx:166` — `expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()`; impl `src/screens/TransactionSelect/index.tsx:63-65` | ✅ PASS |
| SD-10 IF query fails THEN alert "Transações" / exact retry copy | Exact alert strings | `src/__tests__/screens/transactionSelect.spec.tsx:183-186` — `expect(alertSpy).toHaveBeenCalledWith('Transações', 'Não foi possível buscar as suas transações. Verifique sua conexão com a internet e tente novamente.')`; impl `src/screens/TransactionSelect/index.tsx:68-71` | ✅ PASS |
| SD-11 Picker list supports pull-to-refresh | Refresh wired to refetch | `src/screens/TransactionSelect/index.tsx:91-96` — `refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => handleRefresh()} />}`; `handleRefresh` → `refetch()` at `:54-56` | ✅ PASS (inspection wiring; refresh not in the coverage matrix's tested-behavior list) |

### P1: Designation selector in accordion (SD-12..SD-21)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| SD-12 Selector hidden behind collapsed accordion by default; header = rule line + chevron + rule line; chevron rotates 180°; content mounts/unmounts with fade transitions | Collapsed default, structure, 0°↔180°, fades | `src/__tests__/components/accordion.spec.tsx:43-44` — `queryByTestId('accordion-content')` null when collapsed; `:54-55` present when expanded; `:85-86` — `expect(getCaretRotation(collapsed)).toBe('0deg')` / `expect(getCaretRotation(expanded)).toBe('180deg')`; structure `src/components/Accordion/index.tsx:56-60` (`Line`, caret, `Line`; rule lines `src/components/Accordion/styles.ts:19-23`); fades `src/components/Accordion/index.tsx:66-67` `entering={FadeInUp}` `exiting={FadeOutUp}` (inspection); collapsed default `src/screens/RegisterTransaction/index.tsx:289-290` `useState(initiallyOpenAdvancedSelectors)`, prop default `false` at `:166` | ✅ PASS (tests + inspection) |
| SD-13 WHEN tap header THEN toggle expanded + mount/unmount selector | `onToggle` called once, controlled state | `src/__tests__/components/accordion.spec.tsx:69` — `expect(onToggle).toHaveBeenCalledTimes(1)`; mount/unmount assertions `:43-44`/`:54-55`; wiring `src/screens/RegisterTransaction/index.tsx:1682-1684` | ✅ PASS |
| SD-14 Accordion renders only for plain transactions (not Transfer tab, not bulk edit) | Hidden on TRANSFER and bulk | `src/screens/RegisterTransaction/index.tsx:1679` — `{!isBulkEdit && transactionType !== 'TRANSFER' && (<Accordion …>)}` | ✅ PASS (inspection) |
| SD-15 Picker path → accordion starts expanded; every other path → collapsed | Expanded only via picker | `src/screens/RegisterTransaction/index.tsx:166` (prop default `false`) + `:289-290` (initial state from prop); `src/screens/Subscriptions/index.tsx:134` `setOpenAdvancedSelectors(true)` only in `handleSelectTransaction` (`:132-137`), `false` on create path `:115`, passed at `:248`; all other call sites pass no prop (Account `:570`, BudgetDetails `:311`, Home `:639`, TransactionsByCategory `:273`) → default collapsed | ✅ PASS (inspection) |
| SD-16 WHEN "Assinatura" on THEN designation on, `isRecurring` true, period kept if MONTHLY/YEARLY else MONTHLY | Exact state transition | `src/utils/__tests__/subscriptionDesignation.test.ts:105-107` — `isSubscription`/`isRecurring` true, period `'MONTHLY'` when not recurring; `:121-124` DAILY/WEEKLY → `'MONTHLY'`; `:133-134` MONTHLY kept; `:143-144` YEARLY kept; wiring `src/screens/RegisterTransaction/index.tsx:320-326` | ✅ PASS |
| SD-17 WHEN "Assinatura" on while recurrence does not qualify THEN also open RecurrenceSelect modal | Modal only when prior state unqualified | `src/utils/__tests__/subscriptionDesignation.test.ts:108` `needsRecurrenceModal` true (not recurring); `:122`/`:124` true (DAILY/WEEKLY); `:134`/`:144` false (already MONTHLY/YEARLY); wiring `src/screens/RegisterTransaction/index.tsx:327-329` | ✅ PASS |
| SD-18 WHEN "Recorrente" off THEN designation also off | `isRecurring` false + `isSubscription` false | `src/utils/__tests__/subscriptionDesignation.test.ts:167-168` — `expect(next.isRecurring).toBe(false)` + `expect(next.isSubscription).toBe(false)`; wiring `src/screens/RegisterTransaction/index.tsx:1664-1669` | ✅ PASS |
| SD-19 WHILE designated WHEN save DAILY/WEEKLY in RecurrenceSelect THEN designation off | Un-designate on non-qualifying save | `src/utils/__tests__/subscriptionDesignation.test.ts:203-206` — DAILY/WEEKLY saves → `isSubscription` false with period persisted; MONTHLY/YEARLY keep it `:188-191`; undesignated stays `:214`; wiring `src/screens/RegisterTransaction/index.tsx:305-311` | ✅ PASS |
| SD-20 WHEN edit mode for `is_subscription` true THEN toggle on; false/absent THEN off | Hydration from stored flag | `src/screens/RegisterTransaction/index.tsx:1391` — `setIsSubscription(Boolean(transactionData.is_subscription))` (absent → `Boolean(undefined)` → false → off); default false `:287` | ✅ PASS (inspection) |
| SD-21 "Assinatura" subtitle 'Aparece em "Minhas assinaturas"' while on, none while off | Exact copy on/off | `src/screens/RegisterTransaction/index.tsx:333` — `return isSubscription ? 'Aparece em "Minhas assinaturas"' : ''`; wired `:1691` `subTitle={getSubscriptionSubtitle()}` | ✅ PASS (inspection) |

### P1: Designation payload wiring (SD-22..SD-26)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| SD-22 WHEN create with toggle on THEN payload includes `is_subscription: true` | Explicit true on create | `src/utils/__tests__/subscriptionDesignation.test.ts:220-222` — `expect(buildSubscriptionDesignationPayload(true, 'create')).toEqual({ is_subscription: true })`; spread into create payload `src/screens/RegisterTransaction/index.tsx:1127` | ✅ PASS |
| SD-23 Create payload omits `is_subscription` when toggle off (auto-classification preserved) | Field absent, not false | `src/utils/__tests__/subscriptionDesignation.test.ts:228-229` — `expect(payload).toEqual({})` + `expect('is_subscription' in payload).toBe(false)`; spread `src/screens/RegisterTransaction/index.tsx:1127` (returns `{}`) | ✅ PASS |
| SD-24 WHEN edit THEN payload includes `is_subscription` with toggle value (true keeps/sets, false un-designates) | Always the toggle value on edit | `src/utils/__tests__/subscriptionDesignation.test.ts:233-235` — `{ is_subscription: true }` on edit; `:239-241` — `{ is_subscription: false }` on edit; spread into edit payload `src/screens/RegisterTransaction/index.tsx:974` | ✅ PASS |
| SD-25 Transfer create/edit payloads do not include `is_subscription` | No designation field on transfers | Transfer branches return before the plain-payload spreads: `src/screens/RegisterTransaction/index.tsx:901-938` (edit) / `:1034-1064` (create); transfer builders in `src/utils/transactionPayload.ts:207-211` carry only `is_recurring`/recurrence fields (no `is_subscription` anywhere in that file — grep-verified); accordion hidden on Transfer tab `RegisterTransaction/index.tsx:1679` | ✅ PASS (inspection) |
| SD-26 WHEN a designated transaction is saved THEN payload also carries `is_recurring: true` + MONTHLY/YEARLY `recurrence_period` | Matches subscriptions read model | Invariant: designation forces `isRecurring: true` + MONTHLY/YEARLY period (SD-16, unit-tested `src/utils/__tests__/subscriptionDesignation.test.ts:105-144`); payload emits `is_recurring: isRecurring` and `recurrence_period: isRecurring ? recurrencePeriod : null` at `src/screens/RegisterTransaction/index.tsx:969-971` (edit) / `:1122-1124` (create) | ✅ PASS (test-anchored invariant + inspection) |

**Status**: ✅ All 26 ACs covered — evidence-or-zero satisfied (every criterion has a `file:line` citation; no criterion relies on prose alone). No spec-precision gaps: every spec-defined outcome (exact copy strings, exact payload shapes, exact state transitions) is asserted or implemented verbatim. Inspection-only rows are the documented convention for the heavy-screen layers that have no component harness (coverage matrix, `tasks.md` L25).

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/subscriptionDesignation.ts:45` | Normalization fallback changed `'MONTHLY'` → `'WEEKLY'` in `resolveSubscriptionSwitch` | ✅ Killed (2 tests failed: `turning on without recurrence designates, recurs monthly and opens the modal`; `turning on normalizes DAILY and WEEKLY periods to MONTHLY and opens the modal` — 15 passed) |
| 2 | `src/utils/subscriptionDesignation.ts:88-92` | Dropped the `!transaction.is_subscription` exclusion from `selectSubscriptionCandidates` | ✅ Killed (2 tests failed: `keeps only credit/debit transactions not yet designated`; `returns an empty list when nothing qualifies` — 15 passed) |
| 3 | `src/utils/subscriptionDesignation.ts:108` | `buildSubscriptionDesignationPayload` create-when-off returned `{ is_subscription: false }` instead of `{}` | ✅ Killed (1 test failed: `omits is_subscription on create when undesignated (auto-classification stands)` — 16 passed) |

**Sensor depth**: lightweight (3 behavior-level mutations on the highest-risk new code, per the default tier)
**Isolation**: mutations ran in a throwaway git worktree at HEAD inside the thread temp dir (`git worktree add` / `git worktree remove --force`); real worktree `git status --porcelain` identical before and after (baseline: the user's unrelated `android/app/build.gradle`, `ios/Podfile.lock`, `ios/SmartFinances.xcodeproj/project.pbxproj` modifications and untracked `.specs/features/upgrade-pbl-v9/validation.md` — untouched). No `git stash` used.
**Result**: 3/3 killed, 0 survived — PASS ✅

---

## Interactive UAT Results

Not performed in this Verifier session (user-facing judgment stays with the user per the flow). Inspection evidence above covers the wiring; the suggested manual script is the spec's Independent Tests: synced DEBIT → "+" → "Selecionar transação existente" → tap row → editor opens in edit mode with accordion expanded → toggle "Assinatura" → recurrence becomes monthly + RecurrenceSelect opens → save → row appears in "Minhas assinaturas" after refetch.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ (accordion is reusable, which the spec itself requests) |
| No abstractions for single-use code | ✅ (each util fn maps to ACs; Accordion API is 3 controlled props) |
| No unnecessary "flexibility" added | ✅ |
| Only touched files required for task | ✅ (diff surface = the 13 in-scope files; `RegisterTransaction` hunks are wiring-only) |
| Didn't "improve" unrelated code | ✅ (lint error set identical pre/post; no unrelated refactors in the diffs) |
| Matches existing patterns/style | ✅ (TransactionSelect mirrors AccountSelect; Accordion follows the SubscriptionDetails `RotatingCaret` reanimated pattern; tests reuse the stepIndicator style-array transform assertion pattern) |
| Would senior engineer approve? | ✅ (SD-referenced comments, minimal diff, exact-copy strings) |
| Tests map to ACs and are non-shallow (spot-check: SD-23 asserts both `toEqual({})` and `'is_subscription' in payload` absence) | ✅ |
| Spec-anchored outcome check (asserted values match spec) | ✅ (exact strings for empty state, alert, subtitles, payload shapes) |
| Per-layer Coverage Expectation met (utils 1:1 to designation ACs; component/screen behavior ACs; heavy screens = none per matrix, inspection supplied) | ✅ |
| Every test maps to a spec requirement — no unclaimed tests | ✅ (26 tests annotated with SD ids in-file) |
| Documented guidelines followed: none found (no AGENTS.md/CONTRIBUTING/CI gates) — strong defaults applied per repo conventions (documented in `tasks.md` Test Coverage Matrix) | ✅ |

---

## Edge Cases

- [x] No picker candidates → empty state explains eligibility rules (SD-08): `src/__tests__/screens/transactionSelect.spec.tsx:147-151`
- [x] WEEKLY recurring designated → period normalizes to MONTHLY: `src/utils/__tests__/subscriptionDesignation.test.ts:116-124`
- [x] Designated transaction's recurrence later saved DAILY/WEEKLY → designation drops: `src/utils/__tests__/subscriptionDesignation.test.ts:200-206`
- [x] Picker query fails → alert with retry hint: `src/__tests__/screens/transactionSelect.spec.tsx:183-186`
- [x] Sheet re-presented after a session → designation state resets to fresh-mount defaults: designation state is plain `useState` (`src/screens/RegisterTransaction/index.tsx:287-290`) and `RegisterTransaction` renders inside `ModalViewWithoutHeader`'s `BottomSheetModal` (`src/components/Modals/ModalViewWithoutHeader/index.tsx:33-45`), which unmounts content on dismiss → fresh mount defaults each session (inspection, heavy-screen layer)

---

## Gate Check

- **Gate command**: `yarn jest --watchman=false` (build gate per `tasks.md` Gate Check Commands)
- **Result**: 41 test suites — 40 passed + 1 failed (`src/__tests__/screens/profile.spec.tsx`, pre-existing env-broken: `react-native-device-info` `NativeEventEmitter` invariant; its tests never run — identical to the documented baseline); **365/365 tests passed**. Exit 1 is attributable solely to the pre-existing broken suite.
- **Feature files individually**: `src/utils/__tests__/subscriptionDesignation.test.ts` 17/17, `src/__tests__/components/accordion.spec.tsx` 4/4, `src/__tests__/screens/transactionSelect.spec.tsx` 5/5 — **26/26 feature tests**.
- **Test count before feature**: 338 passing + 2 pre-existing broken suites (accountsFilter flake; profile env-broken) — documented baseline
- **Test count after feature**: 365 passing, 1 pre-existing broken suite (profile)
- **Delta**: +27 = 26 feature tests + 1 from the user's pre-feature-range accountsFilter fix (commit `68d0cfb`). No tests deleted; all feature tests are new files; no assertions weakened.
- **Skipped tests**: none.
- **Failures**: only the pre-existing env-broken `profile.spec.tsx` suite (never ran its tests before this feature either).
- **Lint** (scoped to the 12 feature files, per baseline policy): clean on all files except `src/screens/RegisterTransaction/index.tsx`'s 17 pre-existing errors at L434-440 (6), L890-897 (6), L1088-1092 (5) — all outside the feature hunks (feature hunks: L54-59, 87-91, 99-101, 143-144, 166, 287-290, 303-313, 316-334, 969-976, 1122-1129, 1389-1393, 1656-1697). Pre-change count measured empirically in a scratch worktree at `ae99c5e`: the same 17 content errors at shifted equivalents (L390-396, L846-853, L1041-1045) → **0 new errors**. Note: the task notes recorded "19 pre-existing"; measured value is 17 both before and after — the discrepancy is in the notes' count, not the code. (The `@api/api` `import/no-unresolved` error seen only in the scratch run is a worktree node_modules-symlink artifact; it does not appear in real-repo runs and the import is untouched by this feature.)

---

## Fix Plans

None — no gaps found, no surviving mutants.

---

## Requirement Traceability Update

Verifier writes only `validation.md`; the in-place `spec.md` status updates below are left to the orchestrator/user to apply.

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SD-01..SD-05 | Implementing (wired in Subscriptions) | ✅ Verified (inspection) |
| SD-06 | Implementing (filter + screen done) | ✅ Verified (test) |
| SD-07..SD-11 | Implementing (screen done) | ✅ Verified (SD-07 test + inspection; SD-08/09/10 test; SD-11 inspection) |
| SD-12, SD-13 | Implementing (wired in RegisterTransaction) | ✅ Verified (component tests + inspection) |
| SD-14, SD-15, SD-20, SD-21 | Implementing (wired in RegisterTransaction) | ✅ Verified (inspection) |
| SD-16..SD-19 | Implementing (wired in RegisterTransaction) | ✅ Verified (util tests + wiring) |
| SD-22..SD-24 | Implementing (wired in RegisterTransaction) | ✅ Verified (util tests + wiring) |
| SD-25, SD-26 | Implementing (wired in RegisterTransaction) | ✅ Verified (inspection) |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 26/26 ACs matched the spec-defined outcome; 0 spec-precision gaps
**Sensor**: 3/3 mutations killed (lightweight depth; isolation verified via porcelain before/after)
**Gate**: 365/365 tests passed (40/41 suites; 1 pre-existing env-broken suite unchanged from baseline); 26/26 feature tests; eslint clean on feature files (RegisterTransaction's 17 pre-existing errors unchanged, none in feature hunks)

**What works**: designation rules util (17 tests) with exact payload semantics for create/edit; minimalist Accordion with rotating chevron and fade mount/unmount (4 tests); TransactionSelect picker with candidate filter, exact empty/error copy, loading and selection contract (5 tests); RegisterTransaction wiring (accordion below "Recorrente", plain-only visibility, picker-path expansion, toggle coupling, hydration, subtitle, payload spreads, transfer isolation); Subscriptions entry flow (choice modal with exact copy, picker stacking via `stackBehavior='push'`, editor presentation in create/edit modes).

**Issues found**: none blocking. Two honest observations, neither a gap: (1) SD-11 pull-to-refresh and SD-05 dismiss-return-to-choice are inspection-verified wiring, not automated assertions — consistent with the feature's coverage matrix; (2) the task notes' "19 pre-existing eslint errors" measured as 17 both pre- and post-change (notes miscount; no code impact).

**Next steps**: apply the SD-01..SD-26 status updates in `spec.md` (table above); optional user-facing UAT using the spec's Independent Test scripts; no fix tasks required.
