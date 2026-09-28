# list-search Validation

**Date**: 2026-09-28
**Spec**: `.specs/features/list-search/spec.md`
**Design**: `.specs/features/list-search/design.md`
**Tasks**: `.specs/features/list-search/tasks.md`
**Diff range**: `bc1728e..HEAD` (8 feature commits + docs commit `18e8c3c` + fix commits `5c506a4`/`4144497` at the tip; the user's own commits `36dd59a` and `1709d5e` also sit inside the range — see Observations)
**Verifier**: independent sub-agent (author ≠ verifier) — read-only over the real tree; sensor mutations ran in a backup/restore cycle only
**Re-verification**: round 1 (2026-09-28) verdict FAIL — 1 gap (SRCH-11); fix routed → commit **`4144497`** `refactor(search): point Home at the shared useTransactionFiltering hook` (deleted `src/screens/Home/hooks/useTransactionFiltering.ts`, re-pointed `src/screens/Home/index.tsx:33` to `@hooks/useTransactionFiltering`); this round re-verified all gates + the closed gap → PASS

## Validation verdict: PASS ✅ (re-verified 2026-09-28 after fix round 1 — commit 4144497 closed gap 1; all 22 criteria evidenced)

---

## Task Completion

| Task | Status | Notes |
| ---- | ---------- | ------- |
| T1 — filter utils | ✅ Done | 12/12 tests (6+6); tsc 0 in both utils + tests; every done-when item re-derived from tests |
| T2 — hook composes `filterSectionsByQuery` | ✅ Done | Round 1: ⚠️ Partial — new shared hook + 5/5 tests done, but the old screen-local hook was left in place and Home un-re-pointed. **Closed by F1 (`4144497`)**: old hook deleted, Home import re-pointed; single implementation at `src/hooks/useTransactionFiltering.ts` confirmed |
| F1 — consolidate Home on the shared hook (Verifier fix task) | ✅ Done | Commit `4144497`: deleted `src/screens/Home/hooks/useTransactionFiltering.ts` (54 lines); `src/screens/Home/index.tsx:33` now imports `@hooks/useTransactionFiltering`; exactly one implementation remains (verified: `find src -name 'useTransactionFiltering*'` → only `src/hooks/`); importers = Home + TransactionsByCategory; F1 recorded in tasks.md |
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
| The system SHALL filter lists client-side through shared utils (`filterItemsByQuery`, `filterSectionsByQuery`) composed by `useTransactionFiltering` and the screens | Every list screen filters through the shared utils/hook — design.md:50 "Home and TransactionsByCategory share this one path"; Goal 3 "single source of truth … after consolidation" | Account `src/screens/Account/index.tsx:229`; Accounts `src/screens/Accounts/index.tsx:373,383`; InstitutionDetails `src/screens/InstitutionDetails/index.tsx:252`; **Home `src/screens/Home/index.tsx:33` imports `@hooks/useTransactionFiltering`** (re-pointed by `4144497`; single implementation at `src/hooks/useTransactionFiltering.ts` — `find src -name 'useTransactionFiltering*'` returns only it; old screen-local copy deleted; importers = Home `:33` + TransactionsByCategory `:8`); hook behavior 1:1 unit-tested (`src/hooks/__tests__/useTransactionFiltering.test.ts:58-123`) | ✅ PASS (re-verified post-fix — round-1 gap closed) |
| The compound `Header` SHALL expose a `SearchButton` with the standard button shape (32px circle, primary icon) | 32px `ButtonShape`, primary `MagnifyingGlassIcon`, takes `onPress` | `src/components/Header/HeaderSearchButton.tsx:12-21` — `Button` + `ButtonShape` + `MagnifyingGlassIcon size={20} color={theme.colors.primary}`; `src/components/Header/styles.ts:36-42` — `width/height: 32px; border-radius: 16px`; registered: `src/components/Header/index.tsx:5,14` | ✅ PASS (inspection; structure identical to `HeaderBackButton`) |

**Status**: ✅ All 22 criteria covered with `file:line` evidence — 17 automatable outcomes unit-tested, 5 UI-level criteria inspection-verified under the documented coverage boundary (spec.md "Known coverage boundary", STATE.md #13/#18). Round-1 gap (SRCH-11 / P2 AC3 as applied to Home) closed by `4144497`.

---

## Discrimination Sensor

Scratch discipline: `$TMPDIR` file backups, in-place mutation of the real file, scoped jest run, byte-identical restore (verified: `git diff` empty per file + porcelain back to the pre-sensor baseline ` M src/screens/Home/index.tsx` after every cycle; `src/screens/Home/index.tsx` never touched). No `git stash` used.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/filterItemsByQuery.ts:18-22` | Case-sensitivity fault — removed both `.toLowerCase()` calls (query + item text) | ✅ Killed — 9 tests failed across all 3 suites (case-mismatch queries `'mErCaDo'`/`'uBeR'`/`'pouP'`/`'nU'` no longer match) |
| 2 | `src/utils/filterSectionsByQuery.ts:27-32` | Orphan-header fault — removed `.filter((section) => section.data.length > 0)` | ✅ Killed — 8 tests failed across 2 suites (empty sections survive: "drops sections with no matching transactions", "returns an empty array when no transaction matches", hook's group-drop tests) |
| 3 | `src/hooks/useTransactionFiltering.ts:33-45` | Passthrough fault — bypassed `filterSectionsByQuery`, returned `flattenedTransactions` for every query | ✅ Killed — 4 tests failed (`useTransactionFiltering.test.ts`: filtered-match, group-drop, case-insensitive, no-match-empty all break; only the empty-query test still passes) |
| 3-R2 (re-verify probe) | `src/hooks/useTransactionFiltering.ts:33-45` (post-fix tree, same mutation) | Passthrough fault re-injected after the fix rewired Home onto the shared hook — confirms the consolidated path stays discriminating | ✅ Killed — 4 tests failed (identical kill set); restored byte-identical, scoped suite re-green 17/17 |

**Sensor depth**: lightweight (default tier — client-side list filtering, not a P0 path)
**Outcome**: 3 mutations injected (round 1), 3 killed, 0 survived + 1 post-fix confirmation probe killed — PASS ✅
**Isolation**: verified — after each restore `git status --porcelain` = ` M src/screens/Home/index.tsx` exactly; final scoped run re-green (17/17). The fix's only code changes (import re-point + file deletion) carry no new mutation surface: the full-suite re-run doubles as the dangling-import probe (a stale import would fail suites at module resolution — none did).

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
| Would senior engineer approve? | ✅ (post-fix — the duplicated `useTransactionFiltering` was the only senior-bounce item; resolved by `4144497`: one shared hook, two importers, old copy deleted) |
| Tests map to ACs and are non-shallow (spot-check) | ✅ (case-insensitivity tests use mixed-case query **and** data; totals test asserts the exact `'R$ 100,00'`; group-drop test asserts both surviving title and dropped section) |
| Spec-anchored outcome check | ✅ for all 17 tested outcomes + Home's filter path (post-fix wiring verified) |
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

- **Gate commands** (tasks.md Gate Check Commands; `--watchman=false` per local watchman breakage) — re-run post-fix in this round:
  - Scoped: `npx jest --watchman=false --ci src/utils/__tests__/filterItemsByQuery.test.ts src/utils/__tests__/filterSectionsByQuery.test.ts src/hooks/__tests__/useTransactionFiltering.test.ts` → **17/17 passed, exit 0**
  - Full: `npx jest --watchman=false --ci` → **241 passed / 241 tests, 30 suites: 29 passed + 1 failed** (`src/__tests__/screens/profile.spec.tsx` — the pre-existing, ALLOWED phosphor-react-native ESM transform failure, STATE.md #13; failure class unchanged). No dangling-import failures anywhere post-deletion of the old hook.
  - tsc: `npx tsc --noEmit` → **537 errors total (≤ 538 baseline)**; `Home/index.tsx` 0; 0 in new files; every feature baseline held
  - eslint: `npx eslint <18 feature files> --format compact` → **0 new error classes** (delta detail below)
- **Outcome**: 241 passed, 0 failed (excluding the 1 documented pre-existing suite failure), 0 skipped
- **Test count before feature**: 224 (per tasks.md baseline)
- **Test count after feature**: 241
- **Delta**: **+17** (6 `filterItemsByQuery` + 6 `filterSectionsByQuery` + 5 `useTransactionFiltering`) — no tests deleted, no assertions weakened (all 17 additions; the 224 pre-existing all still pass)
- **Skipped tests**: none
- **tsc per-file baselines (tasks.md) vs measured (post-fix round)**: `Home/index.tsx` 0=0, `Home/styles.ts` 0=0, `Account/index.tsx` 1=1, `Account/styles.ts` 16=16, `Accounts/index.tsx` 0=0, `Accounts/styles.ts` 13=13, `InstitutionDetails/index.tsx` 8=8, `InstitutionDetails/styles.ts` 9=9, `TransactionsByCategory/index.tsx` 1=1, `TransactionsByCategory/styles.ts` 1=1, `components/Header/styles.ts` 6 ≤ 7 baseline (−1 from the user's own `1709d5e` deletion — outside the feature surface; feature adds 0), `hooks/useTransactionFiltering.ts` 0=0; **new files 0** (targeted grep of the full tsc output → zero matches). Total 537 ≤ 538: the feature contributes 0 new tsc errors.
- **eslint delta detail — round 1 (base `bc1728e` scratch copies vs round-1 state, rule-by-rule)**: every non-resolver rule count is IDENTICAL for all modified files (`Account/index.tsx` jsx-no-bind 14=14, arrow-body 1=1, indent 2=2, no-nested-ternary 1=1, no-underscore-dangle 4=4 …; `Accounts/index.tsx` jsx-no-bind 10=10, object-shorthand 3=3, no-nested-ternary 5=5 …; `Home/index.tsx` jsx-no-bind 7=7, arrow-body 4=4, import/order 6=6, no-unstable-nested 1=1 …; `InstitutionDetails/index.tsx` and `TransactionsByCategory/index.tsx` identical across the board). The only additions were instances of the repo-universal resolver class (`import/no-unresolved`/`import/extensions`) on the feature's new import lines: Account +2 (`@components/SearchBar`, `@utils/filterSectionsByQuery`), Accounts +3 (+ `@utils/filterItemsByQuery`, phosphor `MagnifyingGlass`), TBC +2 (+ `@hooks/useTransactionFiltering`), InstitutionDetails +2, `Header/index.tsx` +1 (`./HeaderSearchButton`), Home −1 (net import removals). `react-hook-form` resolves cleanly (0 instances). This setup's `react/jsx-no-bind` fires on function references but not arrow props (pre-existing behavior, confirmed on pre-feature lines) — so the feature's arrow-based wiring adds zero instances. New files show only classes carried by pre-existing siblings: `HeaderSearchButton.tsx` is class-and-count identical to `HeaderBackButton.tsx` (import/order 1, react-in-jsx-scope 3, resolver 3+1); `SearchBar/index.tsx`'s single `react/require-default-props` (optional `style` prop) is carried by ~25 pre-existing components (incl. its own dependency `ControlledInputWithIcon` and `HeaderTitle`); utils/hook test files match the `accountsFilter.test.ts`/`useDateNavigation.test.ts` sibling classes.
- **eslint delta detail — re-verify round (vs round-1 measurements)**: the fix's only eslint change on `src/screens/Home/index.tsx` is the re-pointed import line — `import/extensions` 6→5 and `import/order` 6→5 (the relative `'./hooks/useTransactionFiltering'` import carried both classes; the alias replacement carries only the resolver class), `import/no-unresolved` 43→43 (net instance swap); every other rule identical (jsx-no-bind 5=5, arrow-body 2=2, no-unstable-nested 1=1, warnings identical) — a net reduction, all pre-existing classes. All other 17 feature files byte-stable at their round-1 distributions. **0 new error classes, 0 non-resolver-class new instances — PASS** (same standard as the `home-accounts-filter` precedent)

---

## Fix Plans

### Fix 1: Consolidate Home onto the shared `useTransactionFiltering` (completes T2 / SRCH-11) — ✅ APPLIED & VERIFIED (commit `4144497`)

- **Status**: applied by the implementer as commit **`4144497`** `refactor(search): point Home at the shared useTransactionFiltering hook` (old hook deleted — 54 lines; `src/screens/Home/index.tsx:33` re-pointed to `@hooks/useTransactionFiltering`) and verified by this re-verification round: single implementation at `src/hooks/useTransactionFiltering.ts` (`find src -name 'useTransactionFiltering*' -not -path '*__tests__*'` returns only it); importers = Home (`Home/index.tsx:33`) + TransactionsByCategory (`TransactionsByCategory/index.tsx:8`); no copy left under `src/screens/Home/hooks/` (dir now holds only `useHomeAnimations.ts`, `useTransactionHandlers.ts`); shared hook byte-identical to the round-1 validated state (`git diff 5c506a4..HEAD -- src/hooks/` empty); full gates re-run green (241 pass / tsc 537 with Home 0 / eslint net reduction); post-fix sensor probe killed. F1 recorded in tasks.md.
- **Root cause (round 1)**: tasks.md T2 listed the hook path as `src/hooks/useTransactionFiltering.ts` ("modify"), but that path did not exist at the range base — the hook actually lived (screen-local) at `src/screens/Home/hooks/useTransactionFiltering.ts`. T2 created a correct, unit-tested shared hook at the new path but never deleted the old screen-local hook nor re-pointed Home's import, so the "replace the hook's inline group-mapping" half of the task never executed.
- **Fix task (as executed)**: delete `src/screens/Home/hooks/useTransactionFiltering.ts`; re-point `Home/index.tsx:33` to `@hooks/useTransactionFiltering`; re-run gates.
- **Behavior risk (assessed)**: none realized — the shared hook is behavior-equivalent (identical contract; inline group-mapping replaced by `filterSectionsByQuery`, covered 1:1 by `src/hooks/__tests__/useTransactionFiltering.test.ts`), Home's call site unchanged (`src/screens/Home/index.tsx:314-317`), full suite 241 green.
- **Priority**: Major (was: incompletely executed design refactor leaving duplicated live logic + stale spec status)

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
| SRCH-11 | Implementing (T1 done; T2 pending) — stale, never advanced after T2 → round 1: ❌ Needs Fix | ✅ Verified (post-`4144497`; wiring `src/screens/Home/index.tsx:33` + existing hook tests) |
| SRCH-12 | Implementing (T1 done) | ✅ Verified |

---

## Observations (not defects)

1. **User width tweak inside the diff range**: `Home/styles.ts:60-63` (`AccountFilterButtonContainer` `min-width: 24%; max-width: 40%`) entered the range via the user's **own** commit `36dd59a` ("fix: fixes account filter button container width", between the docs commit and T1) — not inside feature commit `587f3ac`, whose `Home/styles.ts` change is purely the search-style removals (15 deletions, verified). Known, user-owned, non-feature: recorded as the documented anomaly, evidence-corrected attribution.
2. **Extra commits in range**: `36dd59a` (width tweak, above) and `1709d5e` ("fix: fixes button background color" — 1 deletion in `src/components/Header/styles.ts`) are the only commits in `bc1728e..HEAD` outside the feature + fix commits; `1709d5e` does not touch any search behavior (side note: it is what moved `components/Header/styles.ts` from its 7-error to its 6-error tsc baseline — user-owned, not feature-attributable).
3. **User's uncommitted Home tweaks preserved**: the working tree's single modification ` M src/screens/Home/index.tsx` (import order, useAnimatedStyle refactors, `_renderEmpty`→`renderEmpty`, render-prop wrappers) was left untouched; porcelain was byte-stable at ` M src/screens/Home/index.tsx` before, during, and after every sensor/eslint-baseline cycle.
4. **T2/T3 commit hygiene**: spec/tasks status bookkeeping rode along in `029f3e4`/`587f3ac` (feature's own lifecycle artifacts — fine), but SRCH-11's status was left stale ("T2 pending") after T2 — consistent with the consolidation gap.

---

## Summary

**Overall**: ✅ Ready (re-verified after fix round 1 — commit `4144497` closed the single round-1 gap; verdict PASS)

**Spec-anchored check**: 22/22 criteria matched spec outcomes with `file:line` evidence (17 automatable outcomes unit-tested, 5 UI-level criteria inspection-verified under the documented coverage boundary); 0 spec-precision gaps; 0 gaps remaining
**Sensor**: 3/3 round-1 mutations killed + 1 post-fix confirmation probe killed (4 tests failed, restored byte-identical)
**Gate**: scoped jest 17/17; full jest 241 passed / 30 suites with only the allowed pre-existing `profile.spec.tsx` failure (+17 tests vs the 224 baseline, none deleted); tsc 537 ≤ 538 baseline with 0 errors in new files and all per-file baselines held (the −1 vs baseline is the user's own `1709d5e` deletion); eslint 0 new error classes (net reduction post-fix)

**What works**: all four screens (Account, TransactionsByCategory, Accounts, InstitutionDetails) plus Home filter their lists through the single shared path — `SearchBar` + `filterItemsByQuery`/`filterSectionsByQuery` composed by the one `useTransactionFiltering` hook at `src/hooks/` (importers: Home + TransactionsByCategory); every AC and edge case evidenced; the suite is mutation-discriminating; gates clean at every baseline.

**Issues found**: none remaining. Round-1 gap 1 (Home on the duplicated screen-local hook) is closed and verified by this round.

**Next steps**: optional manual QA pass of the five screens' search flows (toggling, typing, clearing, no-match empty states, Accounts carousel hiding) — the documented UI coverage boundary still applies; feature is ready to merge pending that.
