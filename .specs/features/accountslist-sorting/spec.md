# AccountsList Sorting — Sort Filter for "Contas Manuais"

## Summary

Add a sort filter button to the **AccountsList** screen ("Contas Manuais"), mirroring the implementation on the Accounts screen: a funnel button opens a bottom sheet with 4 sorting options (name asc/desc, balance asc/desc). The implementation is componentized so both screens share one sort control and one pure sorting utility.

## Requirements

### R1 — Shared sort control component
New `src/components/SortFilterButton/index.tsx`: renders the funnel icon button, the `ModalViewSelection` bottom sheet ("Selecione a ordenação") and the existing `SortingOptions` screen. Props: `selectedOption: SortingOption`, `onSelect: (option) => void`. The bottom sheet ref lives inside the component.

### R2 — Reuse `SortingOptions` as-is
No changes to the option list or labels (Nome A→Z, Nome Z→A, Saldo menor→maior, Saldo maior→menor). `SortingOption` type is exported from `src/stores/userConfigsStorage.ts` (single source of truth) and imported by `SortingOptions` and `SortFilterButton`.

### R3 — Pure sorting utility
New `src/utils/sortAccountsByOption.ts`: pure function `(accounts, option)` returning a sorted copy, with the same comparators as the Accounts screen:
- name: `localeCompare` on `name` (asc/desc)
- balance: BRL-normalized numeric comparison (`balanceConvertedToBRL` field from `processAccountsForList`), never the formatted string
Includes Jest tests (spec-anchored, all 4 modes + cross-currency fairness).

### R4 — Wired into AccountsList
AccountsList reads `sortingOption`/`setSortingOption` from `useUserConfigs` and persists to MMKV (`config.sortingOption`, same key as Accounts — one global account-sort preference, restored in `_layout.tsx`). The processed list is sorted via `sortAccountsByOption` in a `useMemo`. The funnel button is placed in the screen's `Header.Root` row (back button + title + funnel, same third-child pattern as `Header.Icon` on Account/BudgetDetails).

### R5 — Accounts screen refactored to use the shared control
`Accounts/index.tsx` replaces its local `sortingBottomSheetRef`, `handleSortingPress`, `handleCloseSortingModal` and the `ModalViewSelection` block with `<SortFilterButton selectedOption={sortingOption} onSelect={handleSelectSorting} />`. Behavior unchanged (verified by existing sorting tests + manual check).

## Non-Requirements

- Separate sort preference per screen (shared preference is a deliberate simplification).
- Filtering by account type/currency.
- Sorting institutions (AccountsList has no institution grouping).

## Affected Files

| File | Change |
|------|--------|
| `src/stores/userConfigsStorage.ts` | Export `SortingOption` type |
| `src/components/SortFilterButton/index.tsx` | New shared control |
| `src/screens/SortingOptions/index.tsx` | Import shared `SortingOption` type |
| `src/utils/sortAccountsByOption.ts` | New pure util + Jest test |
| `src/utils/processAccountsForList.ts` | Expose `balanceConvertedToBRL` per item (R3 input) |
| `src/screens/AccountsList/index.tsx` | Sort state + memo + header-row button |
| `src/screens/Accounts/index.tsx` | Use `SortFilterButton` (R5) |

## Decisions

**Shared, persisted preference**: reuse `useUserConfigs.sortingOption` + the `config.sortingOption` MMKV key already used by the Accounts screen. One global account-list sort order, consistent with how the Accounts screen persists its preference today.

**BRL-normalized balance sort**: same as the Accounts screen (its spec R4) — cross-currency fairness; `processAccountsForList` already computes the BRL-converted value for the secondary line (feature accountslist-balance-formatting R2), reused here.
