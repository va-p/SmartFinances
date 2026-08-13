# Validation — AccountsList Sorting

**Date**: 2026-08-12
**Result**: ✅ **PASS**

## Per-Requirement Evidence

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R1 | Shared `SortFilterButton` component | `src/components/SortFilterButton/index.tsx` — funnel `TouchableOpacity` (`:38-41`), `ModalViewSelection` title "Selecione a ordenação" + internal `sortingBottomSheetRef` (`:43-53`); props `selectedOption`/`onSelect` (`:15-18`) | ✅ |
| R2 | Reuse `SortingOptions`; shared `SortingOption` type | `stores/userConfigsStorage.ts:3-7` exports `SortingOption`; `screens/SortingOptions/index.tsx:6` imports it, `:13-18` keeps the 4 labels (Nome A→Z, Z→A, Saldo menor→maior, maior→menor); `SortFilterButton/index.tsx:13,48-52` imports type + renders `SortingOptions` | ✅ |
| R3 | Pure sorting utility | `utils/sortAccountsByOption.ts` — `[...accounts].sort(...)` copy (`:34`); name via `localeCompare` (`:9-12`), balance via `balanceConvertedToBRL` numeric diff (`:13-16`), never a formatted string (type has no string field); tests `__tests__/sortAccountsByOption.test.ts`: all 4 modes (`:16-49`), cross-currency fairness (`:53-61`), no-mutation (`:64-69`), empty list (`:71-73`) | ✅ |
| R4 | Wired into AccountsList + persisted | `AccountsList/index.tsx:71` reads `useUserConfigs`; `:80-83` `useMemo(sortAccountsByOption(processedAccounts, sortingOption))`; `:85-88` `handleSelectSorting` → `setSortingOption` + `storageConfig.set('${DATABASE_CONFIGS}.sortingOption', ...)`; restored in `src/app/_layout.tsx:150-160` (`getString` → `setSortingOption`); funnel in `Header.Root` third-child slot (`:238-245`); FlatList renders `sortedAccounts` (`:248`) | ✅ |
| R5 | Accounts screen refactored | `screens/Accounts/index.tsx:753-756` uses `<SortFilterButton>`; local `sortingBottomSheetRef`/`handleSortingPress`/`handleCloseSortingModal`/`ModalViewSelection` block removed (grep confirms zero remaining occurrences); comparators unchanged (`:341-357`), `handleSelectSorting` retained (`:493-498`) | ✅ |

## Discrimination Sensor

Mutations injected one at a time into `src/utils/sortAccountsByOption.ts` (suite `sortAccountsByOption.test.ts`, 7 tests), file restored byte-identical (`cmp`) after each:

| # | Mutation | Killed? |
|---|----------|---------|
| M1 | Invert balance comparators | ✅ Killed (3 fails) |
| M2 | Compare by `name` in balance modes | ✅ Killed (3 fails) |
| M3 | Sort in place (`accounts.sort(...)`, mutate input) | ✅ **Killed after fix** — full-suite run now fails (1 fail: "returns a sorted copy without mutating the input", `:66-82`, plus `sorted).not.toBe(input)` at `:81`). Commit `6cc8392` replaced the shared module-level `input` with per-test `makeFixtures()` and strengthened the no-mutation assertions |
| M4 | Invert name comparators | ✅ Killed (2 fails) |

**M3 re-run (post-fix)**: with per-test fixtures the full suite now kills the in-place-sort mutant — the R3 "sorted copy" guarantee is properly guarded. No survivors remain.

Repo left clean: `git --no-optional-locks diff --stat` empty after restore.

## Gates

- `cd SmartFinances && npx jest --watchman=false src/utils` → **4 suites / 35 tests, all pass** (run twice: pre- and post-sensor).

## Spec-Precision Gaps

1. ~~In-place-mutation regression not reliably killed by the full suite~~ ✅ **Resolved** (commit `6cc8392`) — per-test `makeFixtures()`; M3 now killed in the full-suite run.
2. **R4 wiring has no automated test** — `SortFilterButton` usage, header placement, MMKV persistence and `_layout.tsx` restore are code-verified only; rely on manual QA.
3. **R5 "behavior unchanged"** — existing Accounts-sorting tests: the repo has no screen-level Accounts tests in the jest suite (only util tests), so refactor equivalence is verified by diff inspection + manual check, as the spec itself anticipates.

## Post-Fix Re-verification (2026-08-12)

- `npx jest --watchman=false src/utils` → **4 suites / 36 tests, all pass** (BTC case added by `6257943`).
- Sensor M3 re-run → **killed** (see table).
- Final verdict unchanged: ✅ **PASS**.

## Commits

| Commit | Description |
|--------|-------------|
| `5c556a2` | feat: extract shared SortFilterButton component for account sorting |
| `8a5e685` | feat: add sortAccountsByOption util with BRL-normalized balance sort + tests |
| `bfb413f` | feat: add sort filter to AccountsList screen |
| `36708a0` | refactor: use shared SortFilterButton on Accounts screen |

Range verified: `567d61b..6cc8392` (branch `fix/accounts-improvements`).

### Re-verification commit

| Commit | Description |
|--------|-------------|
| `6cc8392` | test: per-test fixtures so no-mutation guard discriminates (verifier gap 1) |
