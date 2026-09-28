# List Search Bar — Design

**Feature:** `list-search`
**Date:** 2026-09-28

No new architectural patterns: this feature composes the app's existing ones (compound components, co-located styled-components, pure utils, react-hook-form for inputs). The design's core decision is extraction — Home's screen-local search becomes three shared primitives.

## Components

### `SearchBar` (new — `src/components/SearchBar/`)

Extracted verbatim from Home's inline search block (`Home/index.tsx` L519-537):

```
Props: control: Control<any>   // RHF control, field name fixed to 'search'
       onClear: () => void     // clears the field (Home passes reset())
       style?: StyleProp<ViewStyle>  // overrides the container's default margins
Render: Animated.View (FadeInUp bounce 500ms / FadeOutUp linear)
        └ SearchInputContainer (row, 40px height, shape bg, radius, margin 8px 16px)
          ├ ControlledInputWithIcon (magnifying-glass icon, placeholder 'Pesquisar...', autoCorrect false)
          └ ClearSearchButton (X icon, absolute right 8px)
```

The RHF coupling matches Home exactly (screens hold `useForm()`, read `watch('search', '')`, clear via `reset()`), reusing `ControlledInputWithIcon` rather than duplicating its input styles. `style` exists for screens whose container already pads 16px (TransactionsByCategory, InstitutionDetails) so the bar's visual inset matches Home's.

### `Header.SearchButton` (new — `src/components/Header/HeaderSearchButton.tsx`)

Compound subcomponent, same shape as `HeaderBackButton` (`Button` + `ButtonShape` 32px circle, `MagnifyingGlassIcon` 20px, `theme.colors.primary`). Registered in `Header/index.tsx`. Stateless; takes `onPress`.

### Screen-local button styles (no new components)

- `Account/styles.ts` → `HeaderButtonGroup`: row + `column-gap: 16px` (the Header's own button spacing). Wraps `Header.SearchButton` + `Header.Icon` so `HeaderRoot` still counts 3 children (`space-between`): back left, title centered, button pair grouped top-right — search left of edit.
- `Accounts/styles.ts` → `SearchButton`: absolute `top: 4px; right: 48px` — Home-exact (`HideDataButton` stays at `right: 16px`). Follows the existing convention of per-screen header button styles (Home and Accounts already duplicate `HideDataButton`).

## Utils

```
filterItemsByQuery<T>(items, query, getSearchText): T[]   // flat lists
  - query length 0 → items unchanged
  - keep item iff getSearchText(item)?.toLowerCase().includes(query.toLowerCase())

filterSectionsByQuery<TSection extends { data: TItem[] }>(sections, query, getSearchText): TSection[]
  - query length 0 → sections unchanged
  - per section: filterItemsByQuery on data; drop sections left with 0 items
  - survivors keep title/total (spread), matching Home's behavior
```

## Hook (refactor, behavior-preserving)

`useTransactionFiltering` keeps its contract; its inline group-mapping is replaced by `filterSectionsByQuery` + unchanged `flattenTransactionsForFlashList`. Home and TransactionsByCategory share this one path.

## Screen wiring

| Screen | Button | Bar position | Filter call |
| ------ | ------ | ------------ | ----------- |
| Account | `Header.SearchButton` in `HeaderButtonGroup` (left of edit) | after animated header, before `Transactions` | `filterSectionsByQuery(sections, q, t => t.description)` → SectionList `sections` |
| TransactionsByCategory | `Header.SearchButton` (3rd Header child → `space-between`) | after PeriodRuler, before FlashList (`style={{ marginHorizontal: 0 }}`) | `useTransactionFiltering({ q, grouped })` → FlashList `data` |
| Accounts | local `SearchButton` absolute (Home positions) | after `HeaderContainer`, before `AccountsContainer` | `filterItemsByQuery(list, q, i => i.data.name)` + `filterItemsByQuery(creditCards, q, a => a.name)` |
| InstitutionDetails | `Header.SearchButton` (3rd Header child) | after `SummaryContainer`, before `AccountsList` (`marginHorizontal: 0`) | `filterSectionsByQuery(sections, q, a => a.name)` → SectionList `sections` |

All screens: `const [showSearchInput, setShowSearchInput] = useState(false)` + `useForm()`; button toggles state; bar renders conditionally; list reads the memoized filtered data. Sorting (Accounts) applies first, search filters after — no interaction.

## Behavior preservation (Home)

Only the inline block is replaced by `<SearchBar control={control} onClear={() => reset()} />`; the now-duplicated styles (`SearchInputContainer`, `ClearSearchButton`) move to `SearchBar/styles.ts` and are removed from `Home/styles.ts`; orphaned imports (`XIcon`, `ControlledInputWithIcon`, `Easing`) are dropped. `useTransactionFiltering`'s refactor keeps its memo early-return for empty queries.

## Test strategy

- Utils + hook: unit tests (`src/utils/__tests__/`, `src/hooks/__tests__/`, `@testing-library/react-native` renderHook for the hook) — spec-anchored: empty query, case-insensitive match, non-match exclusion, null/undefined field, section dropping, total/title preservation, flattened output.
- Components/screens: no render tests (pre-existing jest ESM/phosphor blocker, STATE.md #13/#18 — same gap class as `home-accounts-filter`). Gates: scoped `tsc` (0 new errors in feature files; baselines in tasks.md), scoped eslint (0 new errors), full jest (only the pre-existing `profile.spec.tsx` suite failure allowed).
- Manual QA covers the UI wiring ACs (toggle, placement, animations) — flagged as the known coverage boundary in `spec.md`.
