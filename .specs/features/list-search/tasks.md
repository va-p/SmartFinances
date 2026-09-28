# List Search Bar — Tasks

**Feature:** `list-search`
**Date:** 2026-09-28
**Total tasks:** 8 (2 phases)
**Sub-agents needed:** No (8 ≤ 8 tasks — single batch, inline execution)

## Execution Protocol (MANDATORY — do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/list-search/design.md`
**Spec**: `.specs/features/list-search/spec.md`
**Status**: Approved (user directive 2026-09-28; assumptions logged in spec.md) — **In Progress** (T1 done)

---

## Test Coverage Matrix

> Generated from codebase sampling. Guidelines found: none (no `AGENTS.md`/`CONTRIBUTING.md`/coverage config) — strong defaults applied, floored by existing repo depth: hooks/utils unit tests only (`src/hooks/__tests__/`, `src/utils/__tests__/`, `@testing-library/react-native`); no component/screen render tests exist in the repo (pre-existing jest ESM/phosphor transform blocker, `.specs/project/STATE.md` #13/#18).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Utils (`filterItemsByQuery`, `filterSectionsByQuery`) | unit | 1:1 to spec ACs + every listed edge case (empty query, case-insensitive, non-match, null/undefined field, section drop, title/total preservation) | `src/utils/__tests__/<util>.test.ts` | `npx jest --watchman=false --ci src/utils/__tests__/<util>.test.ts` |
| Hook (`useTransactionFiltering`) | unit (renderHook) | All spec ACs it serves: empty query passthrough, filtered flatten, case-insensitivity, no orphan headers, non-match empty | `src/hooks/__tests__/useTransactionFiltering.test.ts` | `npx jest --watchman=false --ci src/hooks/__tests__/useTransactionFiltering.test.ts` |
| Components (`SearchBar`, `Header.SearchButton`) | none (render-test blocker) | Gate = tsc/lint/jest gates + manual QA (known boundary, spec.md) | - | build gate only |
| Screens (Account, TransactionsByCategory, Accounts, InstitutionDetails) | none (render-test blocker) | Gate = tsc/lint gates + manual QA (known boundary, spec.md) | - | build gate only |

## Gate Check Commands

> Generated from codebase. Jest needs `--watchman=false` (watchman spawn fails locally). Full-suite baseline: 224 tests pass, 26/27 suites, the 1 failing suite is the pre-existing `src/__tests__/screens/profile.spec.tsx` (STATE.md #13 — allowed, must remain the only one). tsc baseline: 538 errors repo-wide (styled-components theme typing); per-file baselines below. eslint: repo-wide pre-existing errors; feature files must add 0.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After T1, T2 (unit-tested code) | `npx jest --watchman=false --ci <task test files>` — exit 0 |
| Build | After T3-T8 (no direct tests) + last task | (a) `npx jest --watchman=false --ci` → ≥224 tests pass, only `profile.spec.tsx` suite fails; (b) `npx tsc --noEmit` → 0 new errors in feature files (baselines: `Home/index.tsx` 0, `Home/styles.ts` 0, `Account/index.tsx` 1, `Account/styles.ts` 16, `Accounts/index.tsx` 0, `Accounts/styles.ts` 13, `InstitutionDetails/index.tsx` 8, `InstitutionDetails/styles.ts` 9, `TransactionsByCategory/index.tsx` 1, `TransactionsByCategory/styles.ts` 1, `components/Header/styles.ts` 7, `hooks/useTransactionFiltering.ts` 0; NEW files: 0); (c) `npx eslint <changed files>` → 0 new errors |

---

## Execution Plan

Phases are ordered and run sequentially; tasks within a phase execute in order. 8 tasks = one batch → inline execution (no sub-agents).

### Phase 1 — Shared foundation

```
T1 → T2 → T3 → T4
```

### Phase 2 — Screen integration

```
T5 → T6 → T7 → T8
```

```
Phase 1:  T1 (utils) → T2 (hook) → T3 (SearchBar + Home) → T4 (Header.SearchButton)
Phase 2:  T5 (Account) → T6 (TransactionsByCategory) → T7 (Accounts) → T8 (InstitutionDetails)
```

**Pre-execution note:** the two uncommitted Home tweaks on `feat/search-bar` (render-prop wrappers + `max-width`) are stashed before T1 and popped after T8 (assumption in spec.md) so task commits stay atomic.

---

## Task Breakdown

### T1 — Search filter utils (`filterItemsByQuery`, `filterSectionsByQuery`) ✅ DONE (12/12 tests, tsc clean)

**What**: Add the two pure query-filter utils (flat items + grouped sections) with unit tests covering every spec AC/edge they serve.
**Where**: `src/utils/filterItemsByQuery.ts`, `src/utils/filterSectionsByQuery.ts`, `src/utils/__tests__/filterItemsByQuery.test.ts`, `src/utils/__tests__/filterSectionsByQuery.test.ts` (new)
**Depends on**: None
**Reuses**: `src/utils/accountsFilter.ts` test style; Home's inline filter logic (moved, not invented)
**Requirement**: SRCH-11, SRCH-12 (empty query, case-insensitive, non-match, null field, section drop, title/total preservation)

**Done when**:

- [x] Empty query (length 0) returns the input items/sections unchanged
- [x] Non-empty query keeps only items whose `getSearchText` contains it, case-insensitively; order preserved
- [x] Null/undefined search text excluded without throwing
- [x] `filterSectionsByQuery` drops sections with 0 surviving items and preserves `title`/`total` of survivors
- [x] Quick gate passes; test count ≥ 12 new cases (12/12)

**Tests**: unit
**Gate**: quick (`npx jest --watchman=false --ci src/utils/__tests__/filterItemsByQuery.test.ts src/utils/__tests__/filterSectionsByQuery.test.ts`)
**Commit**: `feat(search): add query filter utils for lists`

---

### T2 — `useTransactionFiltering` composes `filterSectionsByQuery`

**What**: Replace the hook's inline group-mapping with the shared util (behavior-preserving) and add the hook's first unit tests.
**Where**: `src/hooks/useTransactionFiltering.ts` (modify), `src/hooks/__tests__/useTransactionFiltering.test.ts` (new)
**Depends on**: T1
**Reuses**: `src/hooks/__tests__/useDateNavigation.test.ts` renderHook pattern
**Requirement**: SRCH-04 (TransactionsByCategory filtering), SRCH-11, SRCH-12

**Done when**:

- [ ] Empty query → all flattened items (headers + rows) unchanged
- [ ] Non-empty query → only matching descriptions + their section headers (no orphan headers)
- [ ] Non-matching query → empty array
- [ ] Case-insensitive match verified
- [ ] Quick gate passes; test count ≥ 5 new cases

**Tests**: unit (renderHook)
**Gate**: quick (`npx jest --watchman=false --ci src/hooks/__tests__/useTransactionFiltering.test.ts`)
**Commit**: `refactor(search): compose useTransactionFiltering from filterSectionsByQuery`

---

### T3 — Extract `SearchBar` from Home

**What**: Create the shared `SearchBar` component (Home-exact visuals/animation/props) and adopt it in Home, removing the duplicated styles and orphaned imports.
**Where**: `src/components/SearchBar/index.tsx`, `src/components/SearchBar/styles.ts` (new); `src/screens/Home/index.tsx`, `src/screens/Home/styles.ts` (modify)
**Depends on**: None (independent of T1/T2; ordered after them for commit hygiene)
**Reuses**: Home's search block (`Home/index.tsx` L519-537) — moved verbatim; `ControlledInputWithIcon`
**Requirement**: SRCH-09

**Done when**:

- [ ] `SearchBar` renders Home's exact bar (icon, placeholder, clear button, animations) with `control`/`onClear`/`style` props
- [ ] Home uses `<SearchBar control={control} onClear={() => reset()} />`; its search behavior is unchanged
- [ ] `SearchInputContainer`/`ClearSearchButton` removed from `Home/styles.ts`; orphaned imports removed (`XIcon`, `ControlledInputWithIcon`, `Easing`)
- [ ] Build gate passes (tsc 0 new errors in all 4 files — Home baseline 0; jest full suite unchanged)

**Tests**: none (component — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `refactor(home): extract search bar into shared SearchBar component`

---

### T4 — `Header.SearchButton` compound subcomponent

**What**: Add the magnifying-glass button to the compound `Header` component, in the standard Header button shape.
**Where**: `src/components/Header/HeaderSearchButton.tsx` (new), `src/components/Header/index.tsx` (modify)
**Depends on**: None
**Reuses**: `HeaderBackButton` structure (`Button` + `ButtonShape`), `HeaderIcon` registration pattern
**Requirement**: SRCH-10

**Done when**:

- [ ] `Header.SearchButton` renders a 32px shape circle with `MagnifyingGlassIcon` (20px, primary color), takes `onPress`
- [ ] Registered in the `Header` compound export
- [ ] Build gate passes (tsc 0 new errors; `components/Header/styles.ts` stays at its 7-error baseline)

**Tests**: none (component — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `feat(search): add Header.SearchButton compound subcomponent`

---

### T5 — Account screen search

**What**: Wire search into the Account screen: `HeaderButtonGroup` (search left of edit) + `SearchBar` + `filterSectionsByQuery` on the day-groups.
**Where**: `src/screens/Account/index.tsx`, `src/screens/Account/styles.ts` (modify)
**Depends on**: T1, T3, T4
**Reuses**: `SearchBar`, `Header.SearchButton`, `filterSectionsByQuery`; Home's state pattern (`useState` + `useForm`/`watch`/`reset`)
**Requirement**: SRCH-01, SRCH-02

**Done when**:

- [ ] Header shows `Header.SearchButton` left of `Header.Icon` inside `HeaderButtonGroup` (16px gap); `HeaderRoot` still counts 3 children (back left, title centered, pair right)
- [ ] `SearchBar` renders below the animated header when toggled
- [ ] SectionList `sections` = `filterSectionsByQuery(processedData.transactionsFormattedBySelectedPeriod, searchQuery, t => t.description)`
- [ ] Build gate passes (tsc: `Account/index.tsx` ≤ 1, `Account/styles.ts` ≤ 16 errors)

**Tests**: none (screen — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `feat(account): add search bar to account transactions list`

---

### T6 — TransactionsByCategory screen search

**What**: Wire search into TransactionsByCategory: `Header.SearchButton` (3rd header child) + `SearchBar` (marginHorizontal 0) + `useTransactionFiltering`.
**Where**: `src/screens/TransactionsByCategory/index.tsx` (modify)
**Depends on**: T2, T3, T4
**Reuses**: `SearchBar`, `Header.SearchButton`, `useTransactionFiltering` (Home's exact filter path)
**Requirement**: SRCH-03, SRCH-04

**Done when**:

- [ ] `Header.Root` renders [BackButton, Title, SearchButton] → `space-between` (search top right)
- [ ] Memo split: grouped transactions → `useTransactionFiltering` → FlashList `data={filteredTransactions}`; `flattenTransactionsForFlashList` import dropped (type import kept)
- [ ] `SearchBar` sits between PeriodRuler and FlashList with `style={{ marginHorizontal: 0 }}`
- [ ] Build gate passes (tsc: `TransactionsByCategory/index.tsx` ≤ 1 error)

**Tests**: none (screen — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `feat(transactions-by-category): add search bar to category transactions list`

---

### T7 — Accounts screen search

**What**: Wire account-name search into Accounts: local absolute `SearchButton` (Home positions) + `SearchBar` + `filterItemsByQuery` on the merged list and the credit-card carousel.
**Where**: `src/screens/Accounts/index.tsx`, `src/screens/Accounts/styles.ts` (modify)
**Depends on**: T1, T3
**Reuses**: `SearchBar`, `filterItemsByQuery`; Home's `SearchButton`/`HideDataButton` absolute-position convention (right 48/16, top 4)
**Requirement**: SRCH-05, SRCH-06

**Done when**:

- [ ] `SearchButton` (absolute `top: 4px; right: 48px`) renders left of `HideDataButton`; toggles the bar between `HeaderContainer` and `AccountsContainer`
- [ ] Main FlatList data = `filterItemsByQuery(accountsListData, q, i => i.data.name)`; credit-card FlatList data = `filterItemsByQuery(creditCardAccounts, q, a => a.name)`
- [ ] Credit-card footer hidden when no card matches (existing `length > 0` conditional)
- [ ] Build gate passes (tsc: `Accounts/index.tsx` ≤ 0, `Accounts/styles.ts` ≤ 13 errors)

**Tests**: none (screen — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `feat(accounts): add search bar to accounts list`

---

### T8 — InstitutionDetails screen search

**What**: Wire account-name search into InstitutionDetails: `Header.SearchButton` (3rd header child) + `SearchBar` (marginHorizontal 0) + `filterSectionsByQuery` on sections.
**Where**: `src/screens/InstitutionDetails/index.tsx` (modify)
**Depends on**: T1, T3, T4
**Reuses**: `SearchBar`, `Header.SearchButton`, `filterSectionsByQuery`
**Requirement**: SRCH-07, SRCH-08

**Done when**:

- [ ] `Header.Root` renders [BackButton, Title, SearchButton] → `space-between` (search top right)
- [ ] `SearchBar` sits between `SummaryContainer` and `AccountsList` with `style={{ marginHorizontal: 0 }}`
- [ ] SectionList `sections` = `filterSectionsByQuery(sections, searchQuery, a => a.name)`; empty sections dropped
- [ ] Build gate passes (tsc: `InstitutionDetails/index.tsx` ≤ 8 errors)

**Tests**: none (screen — render-test blocker; covered by build gate + manual QA)
**Gate**: build
**Commit**: `feat(institution-details): add search bar to institution accounts list`

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: filter utils + tests | 2 composed utils (flat + sections) + tests | ✅ Granular (cohesive util layer, one deliverable) |
| T2: hook refactor + tests | 1 hook + tests | ✅ Granular |
| T3: extract SearchBar + Home adoption | 1 extract-component refactor | ✅ Granular (atomic, revertable) |
| T4: Header.SearchButton | 1 component | ✅ Granular |
| T5-T8: one screen each | 1 screen integration | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | none | phase-start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | none (ordered after T1/T2 for hygiene) | T2 → T3 | ✅ Match (diagram edge is ordering, not a code dependency — noted) |
| T4 | none | T3 → T4 | ✅ Match (same note as T3) |
| T5 | T1, T3, T4 | T4 → T5 | ✅ Match |
| T6 | T2, T3, T4 | T5 → T6 | ✅ Match |
| T7 | T1, T3 | T6 → T7 | ✅ Match |
| T8 | T1, T3, T4 | T7 → T8 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | ---------------- | --------- | ------ |
| T1 | utils | unit | unit | ✅ OK |
| T2 | hook | unit (renderHook) | unit | ✅ OK |
| T3 | component + screen | none (blocker) | none | ✅ OK |
| T4 | component | none (blocker) | none | ✅ OK |
| T5-T8 | screens | none (blocker) | none | ✅ OK |

---

## Phase Execution Map

```
Phase 1 → Phase 2
Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T5 → T6 → T7 → T8
```

8 tasks, single batch → inline execution; Verifier sub-agent dispatches after T8 (always-on, author ≠ verifier).
