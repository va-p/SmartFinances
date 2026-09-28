# Home Accounts Filter Validation

**Date**: 2026-09-28
**Spec**: `.specs/features/home-accounts-filter/spec.md`
**Diff range**: `70557d2..cf39e70` (5 commits: accounts filter utils + tests, store, AccountFilterSelect, AccountFilterButton, Home wiring)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

No `tasks.md` was persisted in the feature dir (only `spec.md` exists). Work units are the 5 feature commits, all inspected against the spec:

| Commit | Status | Notes |
| ------ | ------ | ----- |
| `54e5bd2` accounts filter + label utils with tests | ✅ Done | `src/utils/accountsFilter.ts` + 7 tests |
| `4768c48` selected accounts filter store | ✅ Done | Session-only zustand store, matches period-selector pattern |
| `8b688de` AccountFilterSelect modal content | ✅ Done | GoalAccountSelect pattern |
| `92c5d2c` AccountFilterButton pill + modal | ✅ Done | Reuses FilterButton + ModalViewSelection |
| `cf39e70` wire accounts filter into Home | ✅ Done | Filter applied before format/process; pill left of period pill |

---

## Spec-Anchored Acceptance Criteria

### P1: Accounts filter pill + multi-select modal

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — Home renders accounts filter pill (FilterButton) left of the period selector pill | pill is a FilterButton, placed left | Inspection (no render harness, known issue #13): `src/screens/Home/index.tsx:447-457` — `AccountFilterButtonContainer` (:449-451) is the first child of `FilterButtonGroup`, `PeriodFilterButtonContainer` (:452-457) second; row layout `src/screens/Home/styles.ts:53-58` (`flex-direction: row`); the pill is the same FilterButton: `src/components/AccountFilterButton/index.tsx:30-33` | ✅ PASS (inspection-verified) |
| AC2 — tap pill → ModalViewSelection bottom sheet titled "Selecione as contas" listing accounts | title exactly "Selecione as contas"; account list | Inspection: `src/components/AccountFilterButton/index.tsx:24-26` (`present()`) wired at `:32` (`onPress`); `:35-38` — `title='Selecione as contas'`, `snapPoints={['75%']}` (spec assumption: 75%); list content `src/screens/AccountFilterSelect/index.tsx:29` (`useAccountsQuery()`) + `:70-81` (FlatList) | ✅ PASS (inspection-verified) |
| AC3 — tap listed account → toggles immediately, modal stays open | selection updated synchronously; no dismiss on toggle | Inspection: `src/screens/AccountFilterSelect/index.tsx:38-50` — `handleToggleAccount` concat/remove by id, calls `setSelectedAccountsFilter` (zustand synchronous set, `src/stores/selectedAccountsFilterStorage.ts:18-19`); wired `:79`; **no dismiss call in the toggle path** — dismissal only via `ModalViewSelection` pan/backdrop (`src/components/Modals/ModalViewSelection/index.tsx:33-34`); check mark on selected `src/components/ListItem/index.tsx:27-28` via `isActive` `AccountFilterSelect/index.tsx:76-78` | ✅ PASS (inspection-verified) |
| AC4 — exclude virtual goal reserve accounts from modal list | no virtual account listed | Inspection: `src/screens/AccountFilterSelect/index.tsx:63-66` — `(accounts ?? []).filter((account) => !account.isVirtual)`; plus plain query `:29` → `src/hooks/useAccountsQuery.ts:22` (`includeVirtual = false` default; `:10-12` sends the param only when true) — server-side exclusion too | ✅ PASS (inspection-verified) |
| AC5 — no accounts → empty-list state | empty state rendered | Inspection: `src/screens/AccountFilterSelect/index.tsx:82-84` — `ListEmptyComponent={() => <ListEmptyComponent text='Nenhuma conta criada ainda.' />}` | ✅ PASS (inspection-verified) |

### P1: Pill label logic

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — no account selected → label "Todas..." | exact string "Todas..." | `src/utils/__tests__/accountsFilter.test.ts:61-63` — `expect(getAccountsFilterLabel([])).toBe('Todas...')` | ✅ PASS |
| AC2 — exactly one selected → that account's name | the account's name | `src/utils/__tests__/accountsFilter.test.ts:66-68` — `expect(getAccountsFilterLabel([accountItau])).toBe('Itaú PF')` (accountItau = `makeAccount(14, 'Itaú PF')`, `:21`) | ✅ PASS |
| AC3 — two or more selected → "X Contas", X = count | exact count form | `src/utils/__tests__/accountsFilter.test.ts:71-78` — `toBe('2 Contas')` and `toBe('3 Contas')` | ✅ PASS |
| AC4 — single long name truncates to one line with tail ellipsis | single line, tail ellipsis, pill height fixed | Inspection: `src/components/FilterButton/index.tsx:20` — `<Title numberOfLines={1}>` (RN `Text` defaults `ellipsizeMode='tail'`); fixed pill height `src/components/FilterButton/styles.ts:5-8` (min/max 25px) | ✅ PASS (inspection-verified) |

### P1: Filtered Home data

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — no account selected → include transactions from all accounts (no filter) | full list untouched | `src/utils/__tests__/accountsFilter.test.ts:84-92` — `filtered.map(id)` `toEqual([1, 2, 3, 4, 5])` (all 5 fixtures incl. the account-less one) | ✅ PASS |
| AC2 — one or more selected → only transactions whose account id is among selected, in list, cash flow total and chart | all three surfaces filtered | Predicate: `src/utils/__tests__/accountsFilter.test.ts:95-101` — single account → `toEqual([1, 2])`; `:104-111` — union → `toEqual([1, 2, 3])`. Wiring (list + total + chart): `src/screens/Home/index.tsx:299-302` — `filterTransactionsByAccounts(transactions, selectedAccountsFilter)` applied **before** `formatTransactions` (`:304-306`) and `processTransactions` (`:308-312`), whose outputs feed chart (`cashFlowChartData`, consumed `:463`), total (`currentCashFlow`) and list (`groupedTransactions` → `:318-325`) | ✅ PASS (predicate unit-tested; three-surface wiring inspection-verified) |
| AC3 — transaction with no account data → excluded while a filter is active | excluded from filtered view | `src/utils/__tests__/accountsFilter.test.ts:115-123` — `filterTransactionsByAccounts([txWithoutAccount], [accountNubank])` `toEqual([])` | ✅ PASS |
| AC4 — existing period filtering, search and navigation unchanged | zero regressions | Gate: all 217 pre-feature tests green (224 total = 217 baseline + 7 new, no deletions); diff inspection `src/screens/Home/index.tsx` — additions only (imports, store hook `:155-157`, filter call `:299-302`, pill JSX `:447-459`); period modal handlers `:349-355`, `useTransactionFiltering` `:322-325`, `useDateNavigation` `:339-340` call signatures untouched | ✅ PASS (gate + diff inspection) |

**Status**: ✅ All ACs covered — 13/13 ACs matched spec outcome (6 test-asserted, 1 hybrid predicate-test + wiring-inspection, 6 inspection-verified: 5 Story-1 UI-wiring ACs + Story-2 AC4; screen-level render harness blocked by known issue #13 in `.specs/project/STATE.md`, same repo precedent as `weekly-period-filter`); 0 spec-precision gaps — every AC has a precise spec-defined outcome (exact strings, positions, exclusions) and each asserted value matches it.

---

## Discrimination Sensor

Scratch: `git worktree add $TMPDIR/verify-accflt HEAD` (detached at `cf39e70`), `node_modules` symlinked in; jest run from inside the scratch so the test's relative `../accountsFilter` import binds to the mutated scratch copy; file restored between mutations via `git show HEAD:src/utils/accountsFilter.ts >`. Real-tree `git status --porcelain` captured before sensor work (empty) and after cleanup (empty, identical); `git worktree list` shows no leftovers. No `git stash` used; the real tree was never mutated.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/accountsFilter.ts:15` | Flipped empty-selection early return: `selectedAccounts.length === 0` → `!== 0` (filters with an empty Set when nothing is selected; returns unfiltered when something is) | ✅ Killed — 4 failed / 3 passed: all four `filterTransactionsByAccounts` tests fail (`:84-92` gets `[]` instead of `[1,2,3,4,5]`; the three active-filter tests get unfiltered lists); the 3 label tests pass (line 39's guard untouched) |
| 2 | `src/utils/accountsFilter.ts:43` | Broke the single-vs-multi label boundary: `length === 1` → `length > 1` (single → "1 Contas"; multi → first account's name) | ✅ Killed — 2 failed / 5 passed: `accountsFilter.test.ts:67` expects `'Itaú PF'`, `:74` expects `'2 Contas'` — both assert the exact spec strings |
| 3 | `src/utils/accountsFilter.ts:27` | Inverted the Set-membership predicate: `selectedAccountIds.has(...)` → `!selectedAccountIds.has(...)` | ✅ Killed — 3 failed / 4 passed: single (`:95-101`), union (`:104-111`) and no-account-data exclusion (`:115-123`) all fail; empty-selection test passes (early return intact — mutation correctly isolated to the predicate) |
| probe (unscored) | `src/utils/accountsFilter.ts:43` | Literal suggested boundary mutation `=== 1` → `<= 1` | ⚪ Survived 7/7 — **provably equivalent mutant**, excluded from the kill count: line 39's `=== 0` guard returns first, so `<= 1` differs from `=== 1` only at length 0, which is unreachable at line 43. No test can kill it; it carries no test-quality signal. Boundary discrimination is instead proven by mutation 2, which is non-equivalent and killed by both boundary tests |

**Sensor depth**: lightweight (3 scored mutations on the highest-risk new code + 1 unscored equivalence probe)
**Result**: 3/3 scored mutations killed — PASS ✅

---

## Interactive UAT Results

Not performed — this is sub-agent validation. Screen-level jest rendering is blocked by known issue #13 (pre-existing `phosphor-react-native` ESM transform failure, `profile.spec.tsx` fails to load at baseline); UI-wiring ACs were inspection-verified per the repo precedent (`.specs/features/weekly-period-filter/validation.md`). A human QA pass of the modal flow (open, toggle, dismiss, label transitions) remains available to the orchestrator.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code (48-line util, 21-line store, single-purpose; no speculative options) | ✅ |
| Surgical changes (10 files, exactly the declared diff surface; additions only except the pill-wrapper refactor the placement required) | ✅ |
| No scope creep (no persistence — session-only per spec; no confirm button; no account CRUD; Home-only) | ✅ |
| Matches patterns (GoalAccountSelect modal pattern; period-selector store pattern; Account-screen filter-before-format precedent) | ✅ |
| Spec-anchored outcome check (asserted values match spec exactly: "Todas...", "Itaú PF", "2 Contas"/"3 Contas", `[1,2,3,4,5]`, `[1,2]`, `[1,2,3]`, `[]`) | ✅ |
| Per-layer Coverage Expectation met (domain util 1:1 with Story 2/3 ACs; UI wiring inspection per known issue #13) | ✅ |
| Every test maps to a spec AC — all 7 tests carry ACCFLT/story/AC comments; no unclaimed tests | ✅ |
| Documented guidelines followed: repo gate standard from `.specs/features/weekly-period-filter/validation.md` (zero new tsc/eslint errors in feature-touched files, no new lint error class) — verified below | ✅ |

---

## Edge Cases

- [x] Deselect every account → default state ("Todas...", no filter): `accountsFilter.test.ts:61-63` ("Todas..." on `[]`) + `:84-92` (all transactions on `[]`) + toggle-off path `src/screens/AccountFilterSelect/index.tsx:46-48` (remove by id)
- [x] Select every account → label keeps count form: `accountsFilter.test.ts:75-77` — all 3 fixture accounts selected → `toBe('3 Contas')`; no all-selected special case exists in `src/utils/accountsFilter.ts:39-47`
- [x] Transaction with no account object → included when no filter active, excluded when active: `accountsFilter.test.ts:84-92` (id 5 present unfiltered) + `:115-123` (excluded under `[accountNubank]`)
- [x] Selected account deleted elsewhere → stale entry inert: by construction `src/utils/accountsFilter.ts:26-28` — Set membership on `transaction.account?.id`, a stale id matches no transactions; deselection by id wired at `src/screens/AccountFilterSelect/index.tsx:39-49`. Note (non-normative): no in-app account-deletion flow exists (repo grep: zero matches), so "deleted elsewhere" is server-side only; after an accounts refetch the deleted row leaves the modal list, so the count-decrement tap exists only while the cached row persists. The normative inertness SHALL holds; the spec's remedy clause is satisfied whenever the row is listed.

---

## Gate Check

- **Gate command**: `npx jest --watchman=false --silent` (watchman broken in this environment — repo standard)
- **Result**: 224 passed, 0 failed, 0 skipped — 26/27 suites passed; 1 failed to LOAD: `src/__tests__/screens/profile.spec.tsx` (pre-existing `phosphor-react-native` ESM transform blocker, known issue #13; chain `profile.spec → SignUp:26 → Header:2 → HeaderIcon:5 → phosphor` contains zero files from this diff)
- **Test count before feature**: 217
- **Test count after feature**: 224
- **Delta**: +7 (exactly the 7 tests in `src/utils/__tests__/accountsFilter.test.ts` — 3 label + 4 filter); no deletions, no weakened assertions (pre-existing suites untouched by the diff)
- **Failures**: none among executed tests
- **tsc spot-check**: `yarn tsc --noEmit 2>&1 | grep -E "accountsFilter|AccountFilterButton|AccountFilterSelect|selectedAccountsFilter|screens/Home"` → **empty** (repo-wide tsc remains RED at its pre-existing styled-components DefaultTheme baseline; zero errors in feature-touched files)
- **eslint diff-scoped check**: `src/screens/Home/index.tsx` 68 → 71 error instances, +3 exactly on the 3 new alias-import lines (`:42` `@utils/accountsFilter`, `:80` `@components/AccountFilterButton`, `:105` `@stores/selectedAccountsFilterStorage`), all rule `import/no-unresolved` — the pre-existing resolver class shown by every sibling import line; rule-by-rule distribution otherwise identical (jsx-no-bind 7=7, import/order 6=6, import/extensions 6=6, arrow-body-style 4=4, all others 1=1). `Home/styles.ts` 2=2, `FilterButton/index.tsx` 8=8 (unchanged). New files show only the resolver class identical to pre-existing siblings (`processTransactions.test.ts:1-3`, `selectedPeriodStorage.ts:3`); the new store avoids its sibling's `object-shorthand` class. Zero new lint errors, zero new error classes.

---

## Fix Plans

None — no gaps found.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| ACCFLT-01 | Implementing | ✅ Verified |
| ACCFLT-02 | Implementing | ✅ Verified |
| ACCFLT-03 | Implementing | ✅ Verified |
| ACCFLT-04 | Implementing | ✅ Verified |

Per Verifier role constraints this report is the only file written; the orchestrator applies the status update in `spec.md`.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 13/13 ACs matched spec outcome (6 test-asserted, 1 hybrid, 6 inspection-verified); 0 spec-precision gaps
**Sensor**: 3/3 scored mutations killed (+1 equivalence probe survived as provably equivalent, excluded from the kill count)
**Gate**: 224 passed, 0 failed, 0 skipped; 26/27 suites (1 pre-existing load failure, known issue #13); no new tsc/eslint errors in feature files

**What works**: pill sits left of the period pill and opens the "Selecione as contas" 75% bottom sheet; multi-select toggles live with check marks, virtual goal reserves excluded, empty state rendered; label follows the exact three-state logic ("Todas..." / name / "X Contas") with single-line tail-ellipsis truncation; list, cash flow total and chart all derive from the account-filtered stream; period, search and navigation behavior preserved (full baseline suite green).

**Issues found**: none. One non-blocking observation recorded under Edge Cases (stale-selection count decrement depends on the deleted account's row still being cached in the modal list — no in-app deletion flow exists to exercise it).

**Next steps**: orchestrator applies the ACCFLT-01..04 status updates in `spec.md` and commits this report; optional human QA pass of the modal flow.
