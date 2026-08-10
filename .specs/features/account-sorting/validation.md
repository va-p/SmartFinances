# Validation — Account Sorting

**Date**: 2026-08-10
**Result**: ✅ **PASS**

## Per-AC Evidence

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R1 | Sorting state with 4 modes | `userConfigsStorage.ts` — `SortingOption` type + `sortingOption: 'name-asc'` default in Zustand store | ✅ |
| R2 | SortingOptions UI with 4 rows | `SortingOptions/index.tsx` — renders 4 `ListItem` components with labels and active-state checkmark | ✅ |
| R3 | Sorting wired into `accountsListData` | `Accounts/index.tsx:334-370` — comparator factories per sort mode, `sortingOption` in dep array | ✅ |
| R4 | BRL-normalized balance sort | Standalone accounts use `accountBalanceConvertedToBRL`; institution cards use `totalRaw` (already BRL) | ✅ |
| R4b | `rawBalance` + `totalRaw` fields | `rawBalance: Number(account.balance)` on processedAccounts; `totalRaw: totalConverted.toNumber()` on institution cards | ✅ |
| R5 | Checkmark on selected option | `ListItem` component renders `CheckCircle` icon (weight=fill, primary color) when `isActive={true}` | ✅ |
| R6 | Modal dismiss on select | `handlePress` calls `onSelect(option)` then `handleClose()` — one function handles both | ✅ |
| R7 | Persistence via Zustand + MMKV | Store updated via `setSortingOption`; MMKV persisted via `storageConfig.set()`; restored in `_layout.tsx` on init | ✅ |
| R8 | Uses `ListItem` component | `SortingOptions` imports `ListItem` from `@components/ListItem`; rows use `RectButton` + active-state `CheckCircle` | ✅ |

## Sorting Logic Verification

| Sort mode | Institution cards | Standalone accounts |
|-----------|-------------------|---------------------|
| `name-asc` | `a.name.localeCompare(b.name)` | `a.name.localeCompare(b.name)` |
| `name-desc` | `b.name.localeCompare(a.name)` | `b.name.localeCompare(a.name)` |
| `balance-asc` | `a.totalRaw - b.totalRaw` (BRL) | `a.accountBalanceConvertedToBRL - b.accountBalanceConvertedToBRL` (BRL) |
| `balance-desc` | `b.totalRaw - a.totalRaw` (BRL) | `b.accountBalanceConvertedToBRL - a.accountBalanceConvertedToBRL` (BRL) |

Cross-currency comparison is fair: all balance sorts use BRL-normalized values.

## Commits

| Commit | Description |
|--------|-------------|
| `380fb1b` | feat: add sorting options to Accounts screen (initial implementation) |
| `69fe996` | feat: BRL-normalized balance sort + persisted sorting preference |
