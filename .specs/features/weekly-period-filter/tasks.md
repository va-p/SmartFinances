# Weekly Period Filter Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/weekly-period-filter/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (no `AGENTS.md`, CONTRIBUTING, or CI workflows; jest config is `"jest": {"preset": "jest-expo"}` in `package.json`) - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Utils (domain logic: `processTransactions`, `buildPeriodRulerDates`, `buildNetWorthEvolution`, `isDateInSelectedPeriod`) | unit | All branches; 1:1 to spec ACs; every listed edge case has a test | `src/utils/__tests__/*.test.ts` | `npx jest src/utils` |
| Hooks (`useDateNavigation`) | unit | All branches; 1:1 to spec ACs | `src/hooks/__tests__/*.test.ts` | `npx jest src/hooks` |
| Screen components (`ChartPeriodSelect`, `Overview`, Home `PeriodRulerList`, `Account`) and zustand store | none | No component-render test harness exists in this repo (verified: tests only under `src/utils/__tests__` and `src/hooks/__tests__`) - build gate (tsc + lint) + interactive UAT | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npx jest --watchman=false <changed-test-file>` |
| Full | After tasks touching shared modules | `npx jest --watchman=false` |
| Build | After phase completion or config/entity-only tasks | `yarn lint && npx jest --watchman=false` + tsc diff-check (below) |

**Gate corrections (Execute):** (1) `--watchman=false` added to all jest invocations - watchman crashes in this environment; same runner, same tests. (2) `npx tsc --noEmit` demoted from hard gate to **diff-scoped check**: the repo has 669 lines of pre-existing tsc errors (styled-components `DefaultTheme` typing, etc.) and no typecheck script, so full-tsc was never a project gate. (3) `yarn lint` demoted the same way: `eslint-config-airbnb` was missing from node_modules (restored via `yarn install --frozen-lockfile`), and the repo carries 2835 pre-existing lint errors (mostly `import/no-unresolved` on `@` aliases) - lint is not enforced at baseline. The deterministic check for (2)+(3): zero NEW tsc/eslint errors in files touched by the task (verified per task via before/after comparison). Full jest remains the hard gate.

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Shared period modules

Week semantics added once to the shared utils/hook + the picker contract.

**Order note (corrected at Execute):** the picker option (T1) ships only after every shared module supports weeks - extending the `PeriodProps` union first would break `tsc` at call sites and make "Semanas" selectable while `processTransactions` had no weeks config. T5's `case 'weeks'` requires T1's union, so T5 immediately follows T1.

```
T2 → T3 → T4 → T6 → T1 → T5
```

### Phase 2: Screen integration

Screens consume the shared modules; inline duplicates are removed.

```
T7 → T8 → T9
```

### Phase 3: Close-out

Full regression + project memory.

```
T10
```

---

## Task Breakdown

### T1: Add "Semanas" option and extend `PeriodProps` union

**What**: Add `{ id: '1', name: 'Semanas', period: 'weeks' }` as the first picker option, renumber existing options to 2/3/4, extend `PeriodProps.period` with `'weeks'`, and align the store default id.
**Where**: `src/screens/ChartPeriodSelect/index.tsx`, `src/stores/selectedPeriodStorage.ts`
**Depends on**: T6
**Reuses**: existing `ListItem` rendering; zustand store pattern
**Requirement**: WEEK-01
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `PeriodProps.period` is `'weeks' | 'months' | 'years' | 'all'`
- [ ] Picker lists Semanas (id 1), Meses (id 2), Anos (id 3), Tudo (id 4) in that order
- [ ] Store default is `{ id: '2', name: 'Meses', period: 'months' }`
- [ ] Gate check passes: `npx tsc --noEmit && yarn lint && yarn test`
- [ ] Test count: 47+ existing tests pass (no silent deletions)

**Tests**: none (screen component + store - matrix says build gate only)
**Gate**: build

**Commit**: `feat(period): add weeks option to ChartPeriodSelect`

---

### T2: Create `isDateInSelectedPeriod` shared predicate util

**What**: New pure util `isDateInSelectedPeriod(date, selectedDate, period)` returning whether `date` falls in the period containing `selectedDate` (months/years/all semantics preserved exactly; weeks = ISO week + ISO week-year equality), with unit tests.
**Where**: `src/utils/isDateInSelectedPeriod.ts`, `src/utils/__tests__/isDateInSelectedPeriod.test.ts`
**Depends on**: None
**Reuses**: `getISOWeek`/`getISOWeekYear` from date-fns; predicate semantics mirrored from `processTransactions.isInSelectedPeriod`
**Requirement**: WEEK-02, WEEK-03
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Weeks: Monday and Sunday of the selected ISO week included; adjacent Monday excluded
- [ ] Edge case: ISO week-year boundary (2025-12-29 is ISO week 1 of 2026) handled via ISO week-year, not calendar year
- [ ] Months/years/all cases behave identically to the current `processTransactions` predicate
- [ ] Gate check passes: `npx jest src/utils/__tests__/isDateInSelectedPeriod.test.ts`
- [ ] Test count: new file with >=6 tests, all pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(period): add isDateInSelectedPeriod util with ISO week support`

---

### T3: Add weeks grouping to `processTransactions`

**What**: Extend `PeriodType` and `periodConfig` with weeks (`groupKey: format(date, 'R-II')`, `outputFormat: "'Sem' I '\n' R"`, `parseFormat: 'R-II'`), replace the internal `isInSelectedPeriod` closure with the T2 util, and add weeks unit tests.
**Where**: `src/utils/processTransactions.ts`, `src/utils/__tests__/processTransactions.test.ts`
**Depends on**: T2
**Reuses**: `isDateInSelectedPeriod` (T2); existing config-driven structure
**Requirement**: WEEK-02, WEEK-07
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Weeks mode filters list transactions to the selected ISO week and groups by day (`dd/MM/yyyy` titles, newest first)
- [ ] Weeks mode emits one chart bar-pair per ISO week with transactions across all history, labeled `Sem N \n YYYY`, chronological
- [ ] `currentCashFlow` reflects the selected ISO week only
- [ ] Edge case: transaction on 2025-12-29 groups under ISO week 1 of 2026 (`Sem 1 \n 2026`)
- [ ] Gate check passes: `npx jest src/utils/__tests__/processTransactions.test.ts`
- [ ] Test count: 5 existing + >=4 new tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(period): support weeks grouping in processTransactions`

---

### T4: Add weeks branch to `buildPeriodRulerDates`

**What**: Extend `PeriodType` with `'weeks'` and add the weeks branch (all ISO weeks of the selected ISO week-year via `getISOWeeksInYear`, newest-first, label `Sem N \n YYYY`, active = `getISOWeek(selectedDate) === N`), with unit tests.
**Where**: `src/utils/buildPeriodRulerDates.ts`, `src/utils/__tests__/buildPeriodRulerDates.test.ts`
**Depends on**: T3
**Reuses**: existing util contract (`PeriodRulerDate[]`); date-fns ISO helpers
**Requirement**: WEEK-05
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 2026 (53 ISO weeks) yields 53 items; 2025 yields 52
- [ ] Items are newest-first (`Sem 53 ... Sem 1`) with exactly one active item
- [ ] Edge case: selectedDate 2025-12-29 (ISO week 1 of 2026) yields labels with ISO week-year 2026
- [ ] Gate check passes: `npx jest src/utils/__tests__/buildPeriodRulerDates.test.ts`
- [ ] Test count: 5 existing + >=3 new tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(period): build ISO week ruler dates`

---

### T5: Add weeks navigation to `useDateNavigation`

**What**: Add `case 'weeks'` to `handleDateChange` (`subWeeks`/`addWeeks` ±1) and extend `handlePressDate` to parse `Sem N \n YYYY` labels (`'Sem' I R` format) anchoring on `startOfDay(endOfISOWeek(parsed))`, with unit tests.
**Where**: `src/hooks/useDateNavigation.ts`, `src/hooks/__tests__/useDateNavigation.test.ts`
**Depends on**: T1
**Reuses**: existing callback structure; date-fns `subWeeks`/`addWeeks`/`endOfISOWeek`/`startOfDay`
**Requirement**: WEEK-04, WEEK-06
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] next/prev move the selected date exactly ±7 days in weeks mode
- [ ] Tapping `Sem 10 \n 2026` sets the selected date to Sunday 2026-03-08 00:00 local
- [ ] Months/years/all navigation and parsing unchanged (existing tests pass)
- [ ] Gate check passes: `npx jest src/hooks/__tests__/useDateNavigation.test.ts`
- [ ] Test count: 6 existing + >=3 new tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(period): navigate ISO weeks in useDateNavigation`

---

### T6: Add weeks grouping to `buildNetWorthEvolution`

**What**: Extend `PeriodType` and `periodConfig` with weeks (same `R-II` / `'Sem' I '\n' R` shape as `processTransactions`) and create the missing test file covering weeks grouping plus the accumulation invariant.
**Where**: `src/utils/buildNetWorthEvolution.ts`, `src/utils/__tests__/buildNetWorthEvolution.test.ts` (new)
**Depends on**: T4
**Reuses**: existing config-driven structure; design-doc verified date-fns tokens
**Requirement**: WEEK-08
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Weeks mode groups net flows by ISO week with `Sem N \n YYYY` labels, oldest to newest
- [ ] Series ends exactly at `totalAssets` (accumulation invariant) in weeks mode
- [ ] Transfers and future-dated transactions excluded (existing rules preserved)
- [ ] Gate check passes: `npx jest src/utils/__tests__/buildNetWorthEvolution.test.ts`
- [ ] Test count: new file with >=3 tests, all pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(period): group net worth evolution by ISO week`

---

### T7: Add weeks case to Overview period filter

**What**: Replace the inline `isInSelectedPeriod` switch in Overview's `processedData` with the shared `isDateInSelectedPeriod` util (gains weeks support; months/years/all behavior identical).
**Where**: `src/screens/Overview/index.tsx`
**Depends on**: T5
**Reuses**: `isDateInSelectedPeriod` (T2)
**Requirement**: WEEK-03
**Status**: ✅ Complete

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Overview category totals filter by the selected ISO week when period is `weeks`
- [ ] Months/years/all filtering behavior unchanged (same predicate semantics via shared util)
- [ ] Gate check passes: `npx tsc --noEmit && yarn lint && yarn test`
- [ ] Test count: full suite passes (no silent deletions)

**Tests**: none (screen component - matrix says build gate only; predicate covered by T2 unit tests)
**Gate**: build

**Commit**: `feat(period): filter Overview totals by selected ISO week`

---

### T8: Migrate Home `PeriodRulerList` to `buildPeriodRulerDates`

**What**: Delete the inline months/years ruler-date building in Home's `PeriodRulerList` and delegate to `buildPeriodRulerDates`, extracting years from `cashFlows` labels exactly as today (behavior-preserving; gains weeks automatically).
**Where**: `src/screens/Home/components/PeriodRulerList.tsx`
**Depends on**: T7
**Reuses**: `buildPeriodRulerDates` (T4)
**Requirement**: WEEK-05, WEEK-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Inline `MONTH_ABBREVIATIONS`/years building removed; component delegates to the util
- [ ] Years mode ruler source unchanged (years from `cashFlows` labels + selected year)
- [ ] Weeks mode renders on Home via the shared util
- [ ] Gate check passes: `npx tsc --noEmit && yarn lint && yarn test`
- [ ] Test count: full suite passes (no silent deletions)

**Tests**: none (screen component - matrix says build gate only; util covered by T4 unit tests)
**Gate**: build

**Commit**: `refactor(period): migrate Home PeriodRulerList to buildPeriodRulerDates`

---

### T9: Migrate Account screen to shared ruler dates and date navigation

**What**: Replace Account's inline `_renderPeriodRuler` date building with `buildPeriodRulerDates` (years from `allTransactions`, same as today) and its inline `handleDateChange`/no-op `handlePressDate` with `useDateNavigation`; remove now-unused date-fns imports.
**Where**: `src/screens/Account/index.tsx`
**Depends on**: T8
**Reuses**: `buildPeriodRulerDates` (T4), `useDateNavigation` (T5)
**Requirement**: WEEK-04, WEEK-05, WEEK-06, WEEK-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `_renderPeriodRuler` delegates to the util; ruler behavior for months/years/all unchanged
- [ ] `handleDateChange`/`handlePressDate` come from `useDateNavigation` (tap-to-jump now active on Account - approved spec assumption)
- [ ] Unused date-fns imports removed; no lint errors
- [ ] Gate check passes: `npx tsc --noEmit && yarn lint && yarn test`
- [ ] Test count: full suite passes (no silent deletions)

**Tests**: none (screen component - matrix says build gate only; util/hook covered by T4/T5 unit tests)
**Gate**: build

**Commit**: `refactor(period): migrate Account screen to shared period modules`

---

### T10: Full regression gate + STATE.md addendum

**What**: Run the full build gate, confirm spec traceability (all WEEK-01..09 mapped and passing), and append the STATE.md decision #32 addendum recording that the Home/Account consolidation is done.
**Where**: `.specs/project/STATE.md`
**Depends on**: T9
**Reuses**: existing STATE.md decisions table format
**Requirement**: WEEK-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `npx tsc --noEmit && yarn lint && yarn test` all pass
- [ ] Every WEEK requirement maps to at least one completed task
- [ ] STATE.md #32 addendum notes the consolidation follow-up is complete
- [ ] Test count: full suite passes (no silent deletions)

**Tests**: none (project memory + gate)
**Gate**: build

**Commit**: `docs(period): record period-logic consolidation in STATE.md`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1:  T2 → T3 → T4 → T6 → T1 → T5
Phase 2:  T5 → T7 → T8 → T9
Phase 3:  T9 → T10
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Picker option + union + store default | 1 cohesive contract change (2 files) | ✅ Granular |
| T2: isDateInSelectedPeriod util | 1 function + its test file | ✅ Granular |
| T3: processTransactions weeks | 1 util + its test file | ✅ Granular |
| T4: buildPeriodRulerDates weeks | 1 util + its test file | ✅ Granular |
| T5: useDateNavigation weeks | 1 hook + its test file | ✅ Granular |
| T6: buildNetWorthEvolution weeks | 1 util + its test file | ✅ Granular |
| T7: Overview weeks case | 1 screen change | ✅ Granular |
| T8: Home PeriodRulerList migration | 1 component change | ✅ Granular |
| T9: Account migration | 1 screen change | ✅ Granular |
| T10: Regression gate + STATE.md | 1 doc + gate | ✅ Granular |

**Granularity check**:

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | T6 | T6 → T1 | ✅ Match |
| T2 | None | no incoming arrows | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T1 | T1 → T5 | ✅ Match |
| T6 | T4 | T4 → T6 | ✅ Match |
| T7 | T5 | T5 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |

**Rules:**

- Every `Depends on` in a task body must have a corresponding arrow in the diagram.
- Every arrow in the diagram must correspond to a `Depends on` in the target task's body.
- A task must never depend on a task in a later phase - dependencies point backward or within the same phase only.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: Picker option + union | Screen component + store | none | none | ✅ OK |
| T2: isDateInSelectedPeriod | Utils (domain logic) | unit | unit | ✅ OK |
| T3: processTransactions weeks | Utils (domain logic) | unit | unit | ✅ OK |
| T4: buildPeriodRulerDates weeks | Utils (domain logic) | unit | unit | ✅ OK |
| T5: useDateNavigation weeks | Hooks | unit | unit | ✅ OK |
| T6: buildNetWorthEvolution weeks | Utils (domain logic) | unit | unit | ✅ OK |
| T7: Overview weeks case | Screen component | none | none | ✅ OK |
| T8: Home PeriodRulerList migration | Screen component | none | none | ✅ OK |
| T9: Account migration | Screen component | none | none | ✅ OK |
| T10: Gate + STATE.md | Docs/config | none | none | ✅ OK |

**Rules:**

- "Tested in another task" is NOT a valid justification for `Tests: none`. That is test deferral - the exact anti-pattern this validation prevents.
- `Tests: none` is only valid when the coverage matrix says "none" for that code layer.
- If a task creates MULTIPLE code layers (e.g., service + controller), use the HIGHEST test type required by any of them.
- Any ❌ VIOLATION → restructure the task to include its required tests before proceeding.
