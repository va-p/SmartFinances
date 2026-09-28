# list-search Validation

**Date**: 2026-09-28
**Spec**: `.specs/features/list-search/spec.md`
**Design**: `.specs/features/list-search/design.md`
**Tasks**: `.specs/features/list-search/tasks.md`
**Diff range**: `bc1728e..37473b8` (8 feature commits + docs commit `18e8c3c`; the user's own width-fix commit `36dd59a` also sits inside the range — see Observations)
**Verifier**: independent sub-agent (author ≠ verifier) — read-only over the real tree; sensor mutations ran in a backup/restore cycle only

## Validation verdict: FAIL ❌ (one gap: SRCH-11 — Home not consolidated onto the shared `useTransactionFiltering`; duplicate screen-local hook still live)

---

## Task Completion

| Task | Status | Notes |
| ---- | ---------- | ------- |
| T1 — filter utils | ✅ Done | 12/12 tests (6+6); tsc 0 in both utils + tests; every done-when item re-derived from tests |
| T2 — hook composes `filterSectionsByQuery` | ⚠️ Partial | New shared hook `src/hooks/useTransactionFiltering.ts` + 5/5 tests done and correct; but the task's stated "Replace the hook's inline group-mapping" was executed against a path that never existed — the real hook lived at `src/screens/Home/hooks/useTransactionFiltering.ts`, which was **left in place and still imported by Home** (`src/screens/Home/index.tsx:33`). The inline group-mapping now exists twice. → Fix 1 |
| T3 — extract `SearchBar` | ✅ Done | Verbatim move of Home's inline block; Home adopted (`src/screens/Home/index.tsx:511-513`); styles + orphaned imports removed; gates green |
| T4 — `Header.SearchButton` | ✅ Done | 32px `ButtonShape` circle + primary icon; registered in compound export (`src/components/Header/index.tsx:5,14`) |
| T5 — Account screen | ✅ Done | Wiring verified by inspection (`src/screens/Account/index.tsx:416-421, 477-479, 483, 227-235`); tsc at baseline (index 1 / styles 16) |
| T6 — TransactionsByCategory | ✅ Done | Wiring verified (`src/screens/TransactionsByCategory/index.tsx:170-172, 190-196, 199, 100-103`); tsc at baseline (index 1 / styles 1) |
| T7 — Accounts screen | ✅ Done | Wiring verified (`src/screens/Accounts/index.tsx:636-648, 725-727, 733, 762, 766` + `styles.ts:42-52`); tsc at baseline (index 0 / styles 13) |
| T8 — InstitutionDetails | ✅ Done | Wiring verified (`src/screens/InstitutionDetails/index.tsx:366-368, 380-386, 390, 251-254`); tsc at baseline (index 8 / styles 9) |

---

## Spec-Anchored Acceptance Criteria

### P1: Search transactions on the Account screen (SRCH-01, SRCH-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN user taps the magnifying-glass icon in the account header THEN system toggles the search bar below the header | Bar visibility toggles; bar sits below the account (animated) header | `src/screens/Account/index.tsx:417-418` — `Header.SearchButton onPress={() => setShowSearchInput((prevState) => !prevState)}`; `:104` — `useState(false)` (hidden on mount); `:477-479` — `{showSearchInput && (<SearchBar … />)}` between the animated header (`:411-475`) and `Transactions` (`:481`) | ✅ PASS (inspection-verified; documented UI coverage boundary — spec.md "Known coverage boundary", STATE.md #13/#18) |
| WHILE a non-empty query is active THEN only transactions whose description contains the query, case-insensitively | Only matching day-group transactions remain, original order | Logic: `src/utils/__tests__/filterSectionsByQuery.test.ts:31-41` — `filterSectionsByQuery(sections, 'mErCaDo', t => t.description)` → `toHaveLength(1)`, `result[0].data` `toEqual([{id: 1, description: 'Mercado do Bairro'}])`. Wiring: `src/screens/Account/index.tsx:227-235` — `filterSectionsByQuery(processedData.transactionsFormattedBySelectedPeriod, searchQuery, t => t.description)` → `:483` `sections={filteredTransactions}` | ✅ PASS (logic unit-tested; wiring inspection + tsc/eslint gates) |
| WHEN the query is empty or cleared with X THEN all transactions of the selected period | Unfiltered sections | `src/utils/__tests__/filterSectionsByQuery.test.ts:24-28` — empty query → `toEqual(sections)`; `src/utils/__tests__/filterItemsByQuery.test.ts:11-13` — `toEqual(items)`. Clear path: `src/screens/Account/index.tsx:478` — `onClear={() => reset()}` (RHF reset zeroes `watch('search','')`, `:165-166`) | ✅ PASS |
| The search button SHALL render inside the Header, left of the edit button, in a top-right group with the Header's 16px spacing | Search left of edit; 16px gap; HeaderRoot keeps 3 children | `src/screens/Account/index.tsx:416-421` — `HeaderButtonGroup` wraps `Header.SearchButton` then `Header.Icon`; children of `Header.Root` = [BackButton `:414`, Title `:415`, group] → `space-between` intact; `src/screens/Account/styles.ts:16-20` — `flex-direction: row; column-gap: 16px` | ✅ PASS (inspection; tsc baseline held) |

### P1: Search transactions on TransactionsByCategory (SRCH-03, SRCH-04)

| Criterion | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| --------- | -------------------- | ---------------------------------- | ------ |
| WHEN user taps the magnifying-glass icon THEN the bar toggles between the period ruler and the list | Bar between PeriodRuler and FlashList | `src/screens/TransactionsByCategory/index.tsx:170-172` — `Header.SearchButton onPress={() => setShowSearchInput(…)}`; `:55` — `useState(false)`; `:182-188` PeriodRuler → `:190-196` `{showSearchInput && <SearchBar style={{ marginHorizontal: 0 }} />}` → `:198` FlashList | ✅ PASS (inspection; documented boundary) |
| WHILE a non-empty query THEN only matching descriptions, case-insensitively | Matching transactions + their section headers only | `src/hooks/__tests__/useTransactionFiltering.test.ts:72-87` — query `'mercado'` → `toHaveLength(2)`, `filteredTransactions[0].isHeader` `toBe(true)`, `headerTitle` `toBe('18/08/2026')`, `[1].id` `toBe(1)`; `:103-114` — `'uBeR'` → `[1].description` `toBe('Uber')`. Wiring: `src/screens/TransactionsByCategory/index.tsx:100-103` → `:199` `data={filteredTransactions}` | ✅ PASS |
| WHEN the query is empty or cleared THEN all transactions of the selected period | Full flattened list (headers + rows) | `src/hooks/__tests__/useTransactionFiltering.test.ts:58-69` — empty query → `toHaveLength(5)`, 2 headers, ids `toEqual([1, 2, 3])`; clear: `TransactionsByCategory/index.tsx:193` — `onClear={() => reset()}` | ✅ PASS |
| The search button SHALL render in the compound Header at the top right | 3rd header child → `space-between` | `src/screens/TransactionsByCategory/index.tsx:167-173` — `Header.Root` renders [BackButton, Title, SearchButton] | ✅ PASS (inspection) |

### P1: Search accounts on the Accounts screen (SRCH-05, SRCH-06)

| Criterion | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| --------- | -------------------- | ---------------------------------- | ------ |
| WHEN user taps the magnifying-glass icon at the top right THEN the bar toggles between the header and the accounts list | Bar between `HeaderContainer` and `AccountsContainer` | `src/screens/Accounts/index.tsx:636-640` — local `SearchButton` toggle; `:119` — `useState(false)`; `:723-729` — `HeaderContainer` closes, `:725-727` `{showSearchInput && <SearchBar … />}`, `:729` `AccountsContainer` | ✅ PASS (inspection; documented boundary) |
| WHILE a non-empty query THEN only institution cards and standalone accounts whose name contains the query, case-insensitively | Merged list filtered by `data.name` | Logic: `src/utils/__tests__/filterItemsByQuery.test.ts:16-19` — `'mErCaDo'` → `toEqual([{id: 1, name: 'Mercado do Bairro'}])`; `:33-42` — nested selector `item.data.name`, `'nU'` → only the Nubank institution entry. Wiring: `src/screens/Accounts/index.tsx:330-338` (merged `accountsListData` kinds institution/account) + `:371-379` — `filterItemsByQuery(accountsListData, searchQuery, item => item.data.name)` → `:733` `data={filteredAccountsListData}` | ✅ PASS |
| WHILE a non-empty query THEN the credit-card carousel filters by the same name match | Carousel filtered; hidden when no card matches | `src/screens/Accounts/index.tsx:381-389` — `filterItemsByQuery(creditCardAccounts, searchQuery, account => account.name)`; `:762` — `filteredCreditCardAccounts.length > 0 ?` (footer/section hidden on no match); `:766` — `data={filteredCreditCardAccounts}` | ✅ PASS |
| WHEN the query is empty or cleared THEN all institutions, standalone accounts, and credit cards | Unfiltered lists | `src/utils/__tests__/filterItemsByQuery.test.ts:11-13` — `toEqual(items)`; clear: `src/screens/Accounts/index.tsx:726` — `onClear={() => reset()}` | ✅ PASS |
| The search button SHALL render top right, left of the hide-data button, Home-exact absolute positions | `top: 4px; right: 48px` vs hide `right: 16px` | `src/screens/Accounts/styles.ts:42-46` — `SearchButton`: `position: absolute; top: 4px; right: 48px`; `:48-52` — `HideDataButton`: `top: 4px; right: 16px`; JSX `:636-648` (search button rendered immediately left of the hide button) | ✅ PASS (inspection) |

### P1: Search accounts on InstitutionDetails (SRCH-07, SRCH-08)

| Criterion | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| --------- | -------------------- | ---------------------------------- | ------ |
| WHEN user taps the magnifying-glass icon in the header THEN the bar toggles between the summary and the accounts list | Bar between `SummaryContainer` and `AccountsList` | `src/screens/InstitutionDetails/index.tsx:366-368` — `Header.SearchButton` toggle; `:114` — `useState(false)`; `:371-378` SummaryContainer → `:380-386` `{showSearchInput && <SearchBar style={{ marginHorizontal: 0 }} />}` → `:388` `AccountsList` | ✅ PASS (inspection; documented boundary) |
| WHILE a non-empty query THEN only accounts of the institution whose name contains the query, case-insensitively | Sections filtered by `account.name` | Logic: `src/utils/__tests__/filterSectionsByQuery.test.ts:65-84` — query `'pouP'` → `toEqual([{title: 'Contas', data: [{id: 2, name: 'Poupança'}]}])` (sections without a `total` field, the InstitutionDetails shape). Wiring: `src/screens/InstitutionDetails/index.tsx:251-254` — `filterSectionsByQuery(sections, searchQuery, account => account.name)` → `:390` `sections={filteredSections}` | ✅ PASS |
| WHEN the query is empty or cleared THEN all of the institution's accounts | Unfiltered sections | `src/utils/__tests__/filterSectionsByQuery.test.ts:24-28` — `toEqual(sections)`; clear: `InstitutionDetails/index.tsx:383` — `onClear={() => reset()}` | ✅ PASS |
| The search button SHALL render in the compound Header at the top right | 3rd header child → `space-between` | `src/screens/InstitutionDetails/index.tsx:363-369` — `Header.Root` renders [BackButton, Title, SearchButton] | ✅ PASS (inspection) |

### P2: Shared implementation (SRCH-09, SRCH-10, SRCH-11)

| Criterion | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| --------- | -------------------- | ---------------------------------- | ------ |
| The search bar SHALL render identically to Home's bar (icon, `Pesquisar...` placeholder, X clear button, same fade in/out) | Home-exact bar | `src/components/SearchBar/index.tsx:38-54` — `FadeInUp.easing(Easing.bounce).duration(500)` / `FadeOutUp.easing(Easing.linear)`, `ControlledInputWithIcon` + `MagnifyingGlassIcon color={theme.colors.primary}`, `placeholder='Pesquisar...'`, `autoCorrect={false}`, `ClearSearchButton` + `XIcon size={20}`; `src/components/SearchBar/styles.ts:7-21` — moved verbatim from Home (commit `587f3ac` removes the identical block from `Home/index.tsx` L519-537 and `Home/styles.ts`) | ✅ PASS (inspection: verbatim move; tsc 0; eslint class-identical to siblings) |
| WHEN Home's inline search bar is replaced by the shared `SearchBar` THEN Home's search behavior SHALL remain unchanged | Toggling, filtering, clearing unchanged | `src/screens/Home/index.tsx:511-513` — `{showSearchInput && <SearchBar control={control} onClear={() => reset()} />}`; toggle state `:141`; query `:145`; `useTransactionFiltering` call `:314-317`; full suite 241 passing (only the pre-existing `profile.spec.tsx` suite failure) | ✅ PASS |
| The system SHALL filter lists client-side through shared utils (`filterItemsByQuery`, `filterSectionsByQuery`) composed by `useTransactionFiltering` and the screens | Every list screen filters through the shared utils/hook — design.md:50 "Home and TransactionsByCategory share this one path"; Goal 3 "single source of truth … after consolidation" | Account `src/screens/Account/index.tsx:229`; Accounts `src/screens/Accounts/index.tsx:373,383`; InstitutionDetails `src/screens/InstitutionDetails/index.tsx:252`; TransactionsByCategory `src/screens/TransactionsByCategory/index.tsx:8,100-103` — all ✅. **Home ✗**: `src/screens/Home/index.tsx:33` still imports `'./hooks/useTransactionFiltering'` — the pre-feature screen-local hook at `src/screens/Home/hooks/useTransactionFiltering.ts:37-46`, whose inline `.map(...).filter((group) => group.data.length > 0)` group-mapping is exactly the logic `filterSectionsByQuery` replaced. No commit in `bc1728e..37473b8` touched `src/screens/Home/hooks/` (empty `git log` for the path). The new shared hook is wired only into TransactionsByCategory | ❌ GAP (SRCH-11 / Goal 3 / design §Hook / T2 replace-intent) → Fix 1 |
| The compound `Header` SHALL expose a `SearchButton` with the standard button shape (32px circle, primary icon) | 32px `ButtonShape`, primary `MagnifyingGlassIcon`, takes `onPress` | `src/components/Header/HeaderSearchButton.tsx:12-21` — `Button` + `ButtonShape` + `MagnifyingGlassIcon size={20} color={theme.colors.primary}`; `src/components/Header/styles.ts:36-42` — `width/height: 32px; border-radius: 16px`; registered: `src/components/Header/index.tsx:5,14` | ✅ PASS (inspection; structure identical to `HeaderBackButton`) |

**Status**: ❌ Gaps present — 1 of 22 criteria (P2 AC3 as it applies to Home / SRCH-11). All 21 others evidenced.

---

## Discrimination Sensor

Scratch discipline: `$TMPDIR` file backups, in-place mutation of the real file, scoped jest run, byte-identical restore (verified: `git diff` empty per file + porcelain back to the pre-sensor baseline ` M src/screens/Home/index.tsx` after every cycle; `src/screens/Home/index.tsx` never touched). No `git stash` used.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/filterItemsByQuery.ts:18-22` | Case-sensitivity fault — removed both `.toLowerCase()` calls (query + item text) | ✅ Killed — 9 tests failed across all 3 suites (case-mismatch queries `'mErCaDo'`/`'uBeR'`/`'pouP'`/`'nU'` no longer match) |
| 2 | `src/utils/filterSectionsByQuery.ts:27-32` | Orphan-header fault — removed `.filter((section) => section.data.length > 0)` | ✅ Killed — 8 tests failed across 2 suites (empty sections survive: "drops sections with no matching transactions", "returns an empty array when no transaction matches", hook's group-drop tests) |
| 3 | `src/hooks/useTransactionFiltering.ts:33-45` | Passthrough fault — bypassed `filterSectionsByQuery`, returned `flattenedTransactions` for every query | ✅ Killed — 4 tests failed (`useTransactionFiltering.test.ts`: filtered-match, group-drop, case-insensitive, no-match-empty all break; only the empty-query test still passes) |

**Sensor depth**: lightweight (default tier — client-side list filtering, not a P0 path)
**Outcome**: 3 mutations injected, 3 killed, 0 survived — PASS ✅
**Isolation**: verified — after each restore `git status --porcelain` = ` M src/screens/Home/index.tsx` exactly; final scoped run re-green (17/17).

---

## Interactive UAT Results

Not performed — the Verifier is read-only/automated; UI-level ACs (toggle → visibility → placement) were inspection-verified with the pre-existing render-test blocker cited (spec.md "Known coverage boundary"; STATE.md #13/#18 — same class as the `home-accounts-filter` / `fix-transactions-by-category` documented gaps). Manual QA pass of the five screens recommended after Fix 1 lands (toggling, typing, clearing, no-match empty states, Accounts carousel hiding).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ (no server API, no accent folding, no persistence — Out-of-Scope list respected) |
| No abstractions for single-use code | ✅ (`SearchBar` × 5 screens, `Header.SearchButton` × 3, `filterSectionsByQuery` × Account+InstitutionDetails+hook, `filterItemsByQuery` × Accounts+sections util) |
| No unnecessary "flexibility" added | ✅ (`style` prop serves a documented 2-screen need (design §SearchBar); generics serve the 4 actual data shapes) |
| Only touched files required for task | ✅ (per-commit diffs are exactly the wiring; the docs-status rides in T2/T3 commits are the feature's own bookkeeping) |
| Didn't "improve" unrelated code | ✅ (Accounts sorting untouched — filter applies after sort; existing modals/footer structure reused) |
| Matches existing patterns/style | ✅ (Home's `useState`+`useForm`/`watch`/`reset` pattern on every screen; compound `Header` registration; `BorderlessButton` absolute-position convention; co-located styled-components; utils test style from `accountsFilter.test.ts`) |
| Would senior engineer approve? | ❌ — the duplicated `useTransactionFiltering` (old screen-local copy left live next to the new shared one) is exactly what a senior would bounce; → Fix 1 |
| Tests map to ACs and are non-shallow (spot-check) | ✅ (case-insensitivity tests use mixed-case query **and** data; totals test asserts the exact `'R$ 100,00'`; group-drop test asserts both surviving title and dropped section) |
| Spec-anchored outcome check | ✅ for all 17 tested outcomes; ❌ for Home's filter path (the gap — not a test weakness, an implementation gap) |
| Per-layer Coverage Expectation met | ✅ (utils/hook 1:1 to ACs + edges per the tasks.md matrix; components/screens gated by tsc/eslint/jest + manual QA per the documented blocker) |
| Every test maps to a spec requirement — no unclaimed tests | ✅ (17/17 tests carry SRCH-xx/edge citations; zero unclaimed) |
| Documented guidelines followed | ✅ none found (verified: no `AGENTS.md`/`CONTRIBUTING.md`) — strong defaults per the tasks.md matrix + the repo gate standard from `.specs/features/home-accounts-filter/validation.md` (zero new tsc/eslint error classes, jest full-suite parity) |

---

## Edge Cases

- [x] No item matches the query → existing empty-list state, no group/section headers without items: `src/utils/__tests__/filterSectionsByQuery.test.ts:58-62` (`toEqual([])`), `src/hooks/__tests__/useTransactionFiltering.test.ts:117-123`; screens render the pre-existing `ListEmptyComponent` (e.g. `src/screens/Account/index.tsx:487`)
- [x] Null/undefined search field → excluded from non-empty-query results without crashing: `src/utils/__tests__/filterItemsByQuery.test.ts:50-58` (null + undefined dropped, id 1 kept — `?.` optional chain in `src/utils/filterItemsByQuery.ts:21`)
- [x] Query of length 0 → unfiltered list: `src/utils/__tests__/filterItemsByQuery.test.ts:11-13`, `src/utils/__tests__/filterSectionsByQuery.test.ts:24-28`, `src/hooks/__tests__/useTransactionFiltering.test.ts:58-69`
- [x] Surviving groups/sections keep `title` and `total` unchanged while filtering: `src/utils/__tests__/filterSectionsByQuery.test.ts:51-55` (`title` `'18/09/2026'`, `total` `'R$ 100,00'`) + `src/hooks/__tests__/useTransactionFiltering.test.ts:83-84` (`headerTotal` `'R$ 100,00'`)

---

## Gate Check

- **Gate commands** (tasks.md Gate Check Commands; `--watchman=false` per local watchman breakage):
  - Scoped: `npx jest --watchman=false --ci src/utils/__tests__/filterItemsByQuery.test.ts src/utils/__tests__/filterSectionsByQuery.test.ts src/hooks/__tests__/useTransactionFiltering.test.ts` → **17/17 passed, exit 0**
  - Full: `npx jest --watchman=false --ci` → **241 passed / 241 tests, 30 suites: 29 passed + 1 failed** (`src/__tests__/screens/profile.spec.tsx` — the pre-existing, ALLOWED phosphor-react-native ESM transform failure, STATE.md #13; failure class re-confirmed: `import { type Icon } … SyntaxError: Cannot use import statement outside a module` via `HeaderIcon.tsx`)
  - tsc: `npx tsc --noEmit` → **538 errors total — exactly the repo baseline (≤ 538); 0 in new files; every touched file at or below its baseline**
  - eslint: `npx eslint <18 feature files> --format compact` → **0 new error classes**; see delta detail below
- **Outcome**: 241 passed, 0 failed (excluding the 1 documented pre-existing suite failure), 0 skipped
- **Test count before feature**: 224 (per tasks.md baseline)
- **Test count after feature**: 241
- **Delta**: **+17** (6 `filterItemsByQuery` + 6 `filterSectionsByQuery` + 5 `useTransactionFiltering`) — no tests deleted, no assertions weakened (all 17 additions; the 224 pre-existing all still pass)
- **Skipped tests**: none
- **tsc per-file baselines (tasks.md) vs measured**: `Home/index.tsx` 0=0, `Home/styles.ts` 0=0, `Account/index.tsx` 1=1, `Account/styles.ts` 16=16, `Accounts/index.tsx` 0=0, `Accounts/styles.ts` 13=13, `InstitutionDetails/index.tsx` 8=8, `InstitutionDetails/styles.ts` 9=9, `TransactionsByCategory/index.tsx` 1=1, `TransactionsByCategory/styles.ts` 1=1, `components/Header/styles.ts` 7=7, `hooks/useTransactionFiltering.ts` 0=0; **new files 0** (verified by targeted grep of the full tsc output for `filterItemsByQuery|filterSectionsByQuery|components/SearchBar|HeaderSearchButton|useTransactionFiltering|hooks/__tests__` → zero matches)
- **eslint delta detail (base `bc1728e` copies vs current, rule-by-rule; scratch-copy method)**: every non-resolver rule count is IDENTICAL for all modified files (`Account/index.tsx` jsx-no-bind 14=14, arrow-body 1=1, indent 2=2, no-nested-ternary 1=1, no-underscore-dangle 4=4 …; `Accounts/index.tsx` jsx-no-bind 10=10, object-shorthand 3=3, no-nested-ternary 5=5 …; `Home/index.tsx` jsx-no-bind 7=7, arrow-body 4=4, import/order 6=6, no-unstable-nested 1=1 …; `InstitutionDetails/index.tsx` and `TransactionsByCategory/index.tsx` identical across the board). The only additions are instances of the repo-universal resolver class (`import/no-unresolved`/`import/extensions`) on the feature's new import lines: Account +2 (`@components/SearchBar`, `@utils/filterSectionsByQuery`), Accounts +3 (+ `@utils/filterItemsByQuery`, phosphor `MagnifyingGlass`), TBC +2 (+ `@hooks/useTransactionFiltering`), InstitutionDetails +2, `Header/index.tsx` +1 (`./HeaderSearchButton`), Home −1 (net import removals). `react-hook-form` resolves cleanly (0 instances). This setup's `react/jsx-no-bind` fires on function references but not arrow props (pre-existing behavior, confirmed on pre-feature lines) — so the feature's arrow-based wiring adds zero instances. New files show only classes carried by pre-existing siblings: `HeaderSearchButton.tsx` is class-and-count identical to `HeaderBackButton.tsx` (import/order 1, react-in-jsx-scope 3, resolver 3+1); `SearchBar/index.tsx`'s single `react/require-default-props` (optional `style` prop) is carried by ~25 pre-existing components (incl. its own dependency `ControlledInputWithIcon` and `HeaderTitle`); utils/hook test files match the `accountsFilter.test.ts`/`useDateNavigation.test.ts` sibling classes. **0 new error classes, 0 non-resolver-class new instances — PASS** (same standard as the `home-accounts-filter` precedent)

---

## Fix Plans

### Fix 1: Consolidate Home onto the shared `useTransactionFiltering` (completes T2 / SRCH-11)

- **Root cause**: tasks.md T2 listed the hook path as `src/hooks/useTransactionFiltering.ts` ("modify"), but that path did not exist at the range base — the hook actually lived (screen-local) at `src/screens/Home/hooks/useTransactionFiltering.ts` (created pre-feature, 2026-02-08). T2 created a correct, unit-tested shared hook at the new path but never deleted the old screen-local hook nor re-pointed Home's import, so the "replace the hook's inline group-mapping" half of the task never executed: the inline group-mapping (`src/screens/Home/hooks/useTransactionFiltering.ts:37-46`) now coexists with the shared implementation — the duplication this feature was meant to remove (spec Problem Statement, Goal 3, design §Hook "Home and TransactionsByCategory share this one path").
- **Fix task**:
  1. Delete `src/screens/Home/hooks/useTransactionFiltering.ts` (its only importer is `src/screens/Home/index.tsx:33` — verified via tree-wide grep).
  2. In `src/screens/Home/index.tsx:33`, change `import { useTransactionFiltering } from './hooks/useTransactionFiltering';` → `from '@hooks/useTransactionFiltering'`.
  3. Re-run gates: full jest (≥241, only `profile.spec.tsx` fails), `npx tsc --noEmit` (538 total; `Home/index.tsx` stays 0), scoped eslint on `Home/index.tsx` (only resolver-class change).
- **Done when**: Home renders through the single shared hook; the old hook file is gone; `grep -rn "useTransactionFiltering" src/` shows exactly two non-test hits (`src/hooks/useTransactionFiltering.ts` + its two importing screens); gates green; SRCH-11 flips to ✅ Verified on re-verify.
- **Behavior risk**: none expected — the new hook is behavior-equivalent to the old one (identical contract; the only difference is the inline group-mapping replaced by `filterSectionsByQuery`, covered 1:1 by `src/hooks/__tests__/useTransactionFiltering.test.ts`), and Home's call site (`src/screens/Home/index.tsx:314-317`) is unchanged.
- **Priority**: Major (no user-visible defect — Home's behavior is unchanged either way; it is an incompletely executed design refactor leaving duplicated live logic and a stale spec status)

---

## Requirement Traceability Update

(spec.md statuses updated in place by the Verifier)

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SRCH-01 | Implementing (T5 done) | ✅ Verified |
| SRCH-02 | Implementing (T5 done; logic covered by T1/T2 tests) | ✅ Verified |
| SRCH-03 | Implementing (T6 done) | ✅ Verified |
| SRCH-04 | Implementing (T2 done; screen wiring pending) | ✅ Verified |
| SRCH-05 | Implementing (T7 done) | ✅ Verified |
| SRCH-06 | Implementing (T7 done; logic covered by T1 tests) | ✅ Verified |
| SRCH-07 | Implementing (T8 done) | ✅ Verified |
| SRCH-08 | Implementing (T8 done; logic covered by T1 tests) | ✅ Verified |
| SRCH-09 | Implementing (T3 done) | ✅ Verified |
| SRCH-10 | Pending → Implementing (T4 done) | ✅ Verified |
| SRCH-11 | Implementing (T1 done; T2 pending) — stale, never advanced after T2 | ❌ Needs Fix (Home still on the screen-local hook — see Fix 1) |
| SRCH-12 | Implementing (T1 done) | ✅ Verified |

---

## Observations (not defects)

1. **User width tweak inside the diff range**: `Home/styles.ts:60-63` (`AccountFilterButtonContainer` `min-width: 24%; max-width: 40%`) entered the range via the user's **own** commit `36dd59a` ("fix: fixes account filter button container width", between the docs commit and T1) — not inside feature commit `587f3ac`, whose `Home/styles.ts` change is purely the search-style removals (15 deletions, verified). Known, user-owned, non-feature: recorded as the documented anomaly, evidence-corrected attribution.
2. **Extra commit in range**: `36dd59a` (above) is the only commit in `bc1728e..37473b8` outside the 8 feature commits + `18e8c3c`.
3. **User's uncommitted Home tweaks preserved**: the working tree's single modification ` M src/screens/Home/index.tsx` (import order, useAnimatedStyle refactors, `_renderEmpty`→`renderEmpty`, render-prop wrappers) was left untouched; porcelain was byte-stable at ` M src/screens/Home/index.tsx` before, during, and after every sensor/eslint-baseline cycle.
4. **T2/T3 commit hygiene**: spec/tasks status bookkeeping rode along in `029f3e4`/`587f3ac` (feature's own lifecycle artifacts — fine), but SRCH-11's status was left stale ("T2 pending") after T2 — consistent with the consolidation gap.

---

## Summary

**Overall**: ❌ Not Ready — one Major gap; route Fix 1 to an implementer, then re-verify (iteration 1 of the 3-round fix→re-verify budget).

**Spec-anchored check**: 21/22 criteria matched spec outcomes with `file:line` evidence (17 automatable outcomes unit-tested, 4 UI-level criteria inspection-verified under the documented coverage boundary); 1 ❌ GAP (P2 AC3 as applied to Home / SRCH-11 / Goal 3)
**Sensor**: 3/3 mutations killed
**Gate**: scoped jest 17/17; full jest 241 passed / 30 suites with only the allowed pre-existing `profile.spec.tsx` failure (+17 tests vs the 224 baseline, none deleted); tsc exactly 538 baseline with 0 errors in new files and all per-file baselines held; eslint 0 new error classes (resolver-class instances only, identical to the repo precedent)

**What works**: all four screens (Account, TransactionsByCategory, Accounts, InstitutionDetails) are wired with the toggle → `SearchBar` → shared-filter path and verified against every AC and edge case; the filter utils and shared hook are fully unit-tested and mutation-discriminating; Home's search bar is the shared `SearchBar` with behavior preserved; `Header.SearchButton` follows the compound pattern exactly; gates are clean at every baseline.

**Issues found**: 1 — Home still filters through its pre-feature screen-local hook (`src/screens/Home/index.tsx:33` → `src/screens/Home/hooks/useTransactionFiltering.ts:37-46`) instead of the new shared `src/hooks/useTransactionFiltering.ts` (wired only into TransactionsByCategory). The inline group-mapping the feature was meant to replace is now duplicated. How to fix: Fix 1 (delete the old hook, re-point Home's import, re-run gates) — small, behavior-safe (the shared hook is behavior-equivalent and unit-tested).

**Next steps**: orchestrator routes Fix 1 to an implementer; re-verify (expect SRCH-11 → ✅ and the verdict to flip to PASS); optional manual QA pass of the five screens' search flows after the fix.
