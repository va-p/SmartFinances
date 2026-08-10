# Validation — Account Sorting

**Date**: 2026-08-10
**Result**: ✅ **PASS**

## Per-AC Evidence

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R1 | Sorting state with 4 modes | `Accounts/index.tsx:113-114` — `SortingOption` type + `useState<'name-asc'>` | ✅ |
| R2 | SortingOptions UI with 4 rows | `SortingOptions/index.tsx` — renders 4 `TouchableOpacity` rows with labels and checkmark | ✅ |
| R3 | Sorting wired into `accountsListData` | `Accounts/index.tsx:334-370` — comparator factories + sorted arrays, `sortingOption` in dep array | ✅ |
| R4 | Raw balance for numeric sort | `rawBalance: Number(account.balance)` on processedAccounts; `totalRaw: totalConverted.toNumber()` on institution cards | ✅ |
| R5 | Checkmark on selected option | `Check` icon from phosphor rendered when `isSelected` is true; bold + primary color on selected label | ✅ |
| R6 | Modal dismiss on select | `handlePress` calls both `onSelect(option)` and `handleClose()` | ✅ |

## Sorting Logic Verification

| Sort mode | Institution cards | Standalone accounts |
|-----------|-------------------|---------------------|
| `name-asc` | `a.name.localeCompare(b.name)` | `a.name.localeCompare(b.name)` |
| `name-desc` | `b.name.localeCompare(a.name)` | `b.name.localeCompare(a.name)` |
| `balance-asc` | `a.totalRaw - b.totalRaw` | `a.rawBalance - b.rawBalance` |
| `balance-desc` | `b.totalRaw - a.totalRaw` | `b.rawBalance - a.rawBalance` |

Institutions-first ordering is preserved: both groups are sorted independently, then concatenated — institutions first, standalone accounts second.

## Caveats

1. **Balance sorting is non-normalized**: Standalone accounts are sorted by their `rawBalance` (in the account's native currency). An account with 1000 USD sorts below one with 5000 BRL even though 1000 USD ≈ 5500 BRL. This is acceptable for MVP — cross-currency normalization would require fetching exchange rates in the sort comparator.
2. **No persistence**: Sorting preference resets on navigation away. Future iteration could persist to Zustand/AsyncStorage.
3. **Pre-existing type error**: `balance` field in `processedAccounts` is overridden from `number` to `string` (formatted), causing a type mismatch with `AccountProps`. Not introduced by this feature.

## Commit

`380fb1b` feat: add sorting options to Accounts screen
