# Account Sorting — Sort Options for the Accounts Screen

## Summary

Add a sorting modal to the Accounts screen so users can reorder the account list by name or balance. A funnel icon button next to the "Contas" section title opens a bottom sheet with sorting options. The selected option is visually indicated and persists within the session (reset on screen leave).

## Requirements

### R1 — Sorting State
A `sortingOption` state variable on the `Accounts` screen with type:
```ts
type SortingOption = 'name-asc' | 'name-desc' | 'balance-asc' | 'balance-desc';
```
Default: `'name-asc'` (current behavior — alphabetical A-Z).

### R2 — Sorting Options UI (`SortingOptions` screen)
The `SortingOptions` component renders 4 tappable rows, one per option:
1. Nome (A → Z)
2. Nome (Z → A)
3. Saldo (menor → maior)
4. Saldo (maior → menor)

Each row shows:
- The option label
- A radio/check indicator showing which one is currently selected

Props:
- `selectedOption: SortingOption`
- `onSelect: (option: SortingOption) => void`
- `handleClose: () => void`

### R3 — Sorting Logic
The `accountsListData` `useMemo` dependency array gains `sortingOption`. Within the memo:
- `standaloneAccounts` are sorted by the selected criterion
- Institution cards are also re-sorted by the same criterion (using their aggregate BRL balance for balance sort; using institution name for name sort)
- The two-group structure (institutions first, then standalone) is preserved

For balance sorting: the current `processedAccounts` mapping overrides `balance` with a formatted string. A `rawBalance` field must be added to the mapped object so the sort comparator has a numeric value to compare.

### R4 — Balance Sort Is BRL-Normalized
Standalone accounts are sorted by their `accountBalanceConvertedToBRL` value (already computed during data processing), not their native-currency `rawBalance`. This ensures fair cross-currency comparison — e.g., a USD 1,000 account sorts correctly against a BRL 5,000 account. Institution cards already aggregate in BRL, so they use `totalRaw` (BRL sum).

### R4b — `rawBalance` and `totalRaw` Fields
A `rawBalance: number` field is added to each item in `processedAccounts` (preserving the original native-currency balance for future use). `InstitutionCardData` gains a `totalRaw: number` field for the aggregate BRL balance of the institution group.

### R5 — Visual Feedback
The selected option shows a checkmark (e.g., `Check` icon from phosphor-react-native) on the `SortingOptions` row. Tapping an already-selected option dismisses the modal (no-op sort).

### R6 — Modal Dismiss on Select
Tapping a sorting option calls `onSelect(option)`, which updates state in `Accounts`. After selection, `handleClose()` is called to dismiss the bottom sheet automatically.

### R7 — Persistence via Zustand + MMKV
The selected `sortingOption` is persisted to MMKV via `storageConfig.set()` and restored on app init from `storageConfig.getString()` in `_layout.tsx`. The `useUserConfigs` Zustand store holds the in-memory value; `Accounts` reads it via `useUserConfigs()` and writes both to the store and MMKV on change.

### R8 — Use `ListItem` Component for Selection Rows
The `SortingOptions` screen uses the existing `<ListItem>` component (`src/components/ListItem/index.tsx`) for its selection rows. This component is the standard pattern for plain-list selection items throughout the app (provides `RectButton` touch handling + active-state checkmark styling).

## Non-Requirements

- **Credit card carousel sorting**: The credit card list at the bottom maintains its existing sort (institution → name). Sorting options only affect the main accounts list.
- **Filtering**: Out of scope for this feature. The modal is designed to accommodate filtering options in a future iteration.

## Affected Files

| File | Change |
|------|--------|
| `src/screens/Accounts/index.tsx` | Add sorting from store; expose raw/total balance fields; wire BRL-normalized sorting into `useMemo`; persist on change |
| `src/screens/SortingOptions/index.tsx` | Implement option rows using `ListItem` component, selection handling |
| `src/screens/SortingOptions/styles.ts` | Minimal container styles (rows styled by `ListItem`) |
| `src/stores/userConfigsStorage.ts` | Add `sortingOption` + `setSortingOption` to Zustand store |
| `src/app/_layout.tsx` | Restore persisted sorting preference from MMKV on app init |
| `src/components/InstitutionCard/index.tsx` | Add `totalRaw: number` to `InstitutionCardData` type |

## Decisions

**Sorting scope**: Only the main accounts list (`accountsListData`) is sorted. Institutions stay before standalone accounts. Within each group, all items (both institution cards and standalone accounts) are sorted by the same criterion. For institution cards, "balance" means aggregate BRL balance; "name" means institution name (A-Z, Z-A still works).

**Default sort**: `name-asc` — preserves backward compatibility with current alphabetical default.
