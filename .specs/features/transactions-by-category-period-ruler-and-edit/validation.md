# Validation — transactions-by-category-period-ruler-and-edit

- **Verdict: PASS** (iteration 1 — the AC-001.3/AC-001.4 `'all'`-period gap from iteration 0 is fixed by `67ebd49`; all ACs now pass.)
- **Diff range verified:** `5a5700b..67ebd49` (5 commits: `ee2e4cd`, `15f043c`, `37bd460`, `02b81c4`, fix `67ebd49`), branch `fix/transactions-by-category`, local/unpushed.
- **Re-verification date:** 2026-08-18 (iteration 1)
- **Verifier:** independent (evidence-or-zero; no inheritance of author's model)

## Test environment

- Suite: `CI=true yarn jest --no-watchman --watchAll=false --forceExit --testPathIgnorePatterns="src/__tests__/screens"` → **79/79 pass** at `67ebd49` (11 suites; 73 prior + 6 new hook tests). Hook suite standalone: `src/hooks/__tests__/useDateNavigation.test.ts` → 6/6 pass.
- `src/__tests__/screens/profile.spec.tsx` excluded (pre-existing phosphor-react-native ESM transform failure, present at base).
- `npx tsc --noEmit`: zero errors referencing `useDateNavigation` (hook + its tests type-clean); `TransactionsByCategory/index.tsx(57,36)` `categoryId` and `styles.ts(6,44)` DefaultTheme remain the only touched-file errors — both pre-existing classes.
- ESLint unavailable (`.eslintrc.json` extends uninstalled airbnb).
- Working tree: other people's changes untouched (`src/screens/Overview/index.tsx`, `ios/SmartFinances.xcodeproj/project.pbxproj`, and `src/screens/Overview/styles.ts` — the latter appeared since iteration 0). All sensor mutations were scratch-only; final `git diff` on `src/hooks/useDateNavigation.ts` is empty and `git status` matches the pre-verification baseline. No git write commands were used.

## Per-AC evidence

| AC | Verdict | Evidence |
|----|---------|----------|
| AC-001.1 — 12 months newest-first, active month, for `months` **and** `all` | **PASS** | `src/utils/buildPeriodRulerDates.ts:43-60` (months/all fall-through, `.reverse()` at :60, `isActive` :51-54). Tests `src/utils/__tests__/buildPeriodRulerDates.test.ts:7-21` and `:23-34`. Unchanged since iteration 0. |
| AC-001.2 — years: sparse set from the category's transactions + selected year, newest-first, active | **PASS** | Spec wording updated to sparse-set ("years in which this category has transactions ... plus the selected year"). Implementation matches: `src/screens/TransactionsByCategory/index.tsx:92-106` (Set of years from raw `created_at`, NaN-guarded) + `buildPeriodRulerDates.ts:33` (adds selected year) + `:36` (desc sort). Tests `buildPeriodRulerDates.test.ts:36-68`. |
| AC-001.3 — arrows: one month in `months`/`all`, one year in `years` | **PASS** (was FAIL) | `src/hooks/useDateNavigation.ts:36-37`: `case 'months':` **and** `case 'all':` share the sub/addMonths branch; `'years'` → sub/addYears (:47-56). Hook test "moves one month on next/prev in 'all' mode" (`useDateNavigation.test.ts:59-74`) pins it. |
| AC-001.4 — tapping a ruler item jumps (last-day semantics) | **PASS** (was FAIL for `'all'`) | `useDateNavigation.ts:68-77`: dateFormat is `'yyyy'` only for `'years'`, `'MMM yyyy'` otherwise; last-day selection `lastDayOfYear` only for `'years'`, else `lastDayOfMonth`. Tests: months tap (:76-91), `'all'` tap (:93-108), year tap (:109-120). The iteration-0 `Invalid Date` defect is gone (verified by tests; `'all'` tap asserts `new Date(2026, 7, 31)`). |
| AC-001.5 — MonthSelect/Month/MonthSelectButton styles and usages removed | **PASS** | `src/screens/TransactionsByCategory/styles.ts` diff removes all three; grep: zero usages left in the screen. Unchanged since iteration 0. |
| AC-001.6 — ChartPeriodSelect modal (D1) | **PASS** | `index.tsx:159-164` `FilterButton` → `handleOpenPeriodSelectedModal` (:108-110); `ModalViewSelection` + `ChartPeriodSelect` at `:225-235`. Still no automated test reaches this wiring (see sensor (d)). |
| AC-002.1 — tap → set id + `ModalViewWithoutHeader` 100% with `RegisterTransaction` id/resetId/closeRegisterTransaction | **PASS** | `index.tsx:116-119`, wiring `:198`, modal `:237-246`; props contract `src/screens/RegisterTransaction/index.tsx:103-109`. Unchanged since iteration 0. |
| AC-002.2 — loads tapped transaction via `useTransactionDetailQuery` | **PASS** | `src/screens/RegisterTransaction/index.tsx:285-286`; `src/hooks/useTransactionDetailQuery.ts:10-16`. Unchanged. |
| AC-002.3 — list refreshes via `['transactions']` invalidation | **PASS** | `src/hooks/useTransactionMutations.ts:9` + `onSettled` invalidations (:68-72, :111-115, :144-148); reader key `src/hooks/useTransactionsQuery.ts:14`. Unchanged. |
| AC-002.4 — close clears id and dismisses | **PASS** | `index.tsx:121-124` wired at `:244`; `resetId` at `:243`; RegisterTransaction close paths (`RegisterTransaction/index.tsx:1194-1197`, `:997-1000`). Unchanged. |
| AC-002.5 — no bulk-selection behavior (D3) | **PASS** | No `isBulkEdit`/`selectedTransactionIds` passed (`index.tsx:241-245`), no `onLongPress`, no selection store in the screen. Unchanged. |
| AC-002.6 — *(new)* app-internal close clears id + dismisses; backdrop-swipe keeping id accepted (Home-consistent) | **PASS** | App-internal close paths clear id and dismiss (`index.tsx:121-124`; `RegisterTransaction/index.tsx:1194-1197`, `:997-1000`). Backdrop/gesture dismissal does not route through the handler, so the id persists there — explicitly accepted by the updated AC as Home-consistent. |
| FR-003 — Home keeps working after hook promotion | **PASS** | Promotion remains a pure rename (100%, shasum-identical at `ee2e4cd`); Home import updated (`src/screens/Home/index.tsx:25`). The `67ebd49` hook change intentionally alters Home's `'all'`-mode behavior (previously no-op arrows / Invalid-Date taps — a latent Home bug); this is now sanctioned by the spec's design note ("`useDateNavigation` treats `all` like `months`") and improves Home. No Home tests exist, but the hook contract is now covered by its own suite. |

## Discrimination sensor (scratch mutations, all reverted)

Iteration 0 (unchanged results, re-confirmed files untouched by `67ebd49`):

| # | Mutant | Location | Result |
|---|--------|----------|--------|
| a | Drop `yearsSet.add(getYear(selectedDate))` | `buildPeriodRulerDates.ts:33` | **KILLED** (2 failures: selected-year-inclusion + empty-source fallback) |
| b1 | Remove `.reverse()` | `buildPeriodRulerDates.ts:60` | **KILLED** (2 failures: months + 'all' newest-first) |
| b2 | `getMonth(...) + 1` active-month break | `buildPeriodRulerDates.ts:54` | **KILLED** (active shifted 'Ago'→'Jul') |
| c | Early `return []` for 'all' | `buildPeriodRulerDates.ts` | **KILLED** ('all' length 12→0) |
| d | Unwire `FilterButton` onPress + `TransactionListItem` onPress | `index.tsx:162`, `:198` | **SURVIVED** (suite green) — screen wiring untested |

Iteration 1 (fix `67ebd49`):

| # | Mutant | Location | Result |
|---|--------|----------|--------|
| e | Remove `case 'all':` fallthrough (arrows no-op in 'all' again) | `useDateNavigation.ts:37` | **KILLED** — "moves one month on next/prev in 'all' mode" fails (0 calls, `useDateNavigation.test.ts:74`) |
| f | Revert dateFormat to `period === 'months' ? 'MMM yyyy' : 'yyyy'` | `useDateNavigation.ts:68-69` | **KILLED** — "jumps to the tapped month for month labels in 'all' mode" fails (`useDateNavigation.test.ts:108`) |

Mutant (d) still stands as surviving: no test in the suite imports `TransactionsByCategory`, `RegisterTransaction`, `FilterButton`, or `ModalViewWithoutHeader` (grep across `src/**/__tests__/**` → zero matches), and `67ebd49` added no screen-level tests.

## Ranked gaps (remaining)

1. **Screen-level wiring remains untested** (surviving mutant d, partially mitigated). The hook navigation logic is now well covered, but AC-001.6 (period-modal open), AC-002.1 (card tap → edit modal), AC-002.4/AC-002.6 (close/clear-id paths), and the category-years derivation (`index.tsx:92-106`) still have zero automated coverage. A component-level test (`@testing-library/react-native`) for `TransactionsByCategory` would close this.
2. **Test precision (low).** `buildPeriodRulerDates` newest-first assertions pin only endpoints (`dates[0]`, `dates[11]`) — a middle-month reorder mutant would survive. Also the screen's years derivation uses `new Date(created_at)` + NaN guard, which silently drops raw `dd/MM/yyyy` strings (unlike `processTransactions.toTransactionDate`, which handles both) — a robustness asymmetry, not a current defect (backend serializes ISO).
3. **Observation (no action):** the shared-hook fix changed Home's `'all'`-mode behavior (previously broken: no-op arrows, Invalid-Date taps). Sanctioned by the updated design note and strictly an improvement, but it is a Home-visible behavior change from a "promote byte-identical" refactor — worth a QA pass on Home's `'all'` mode since no Home tests exist.

Closed from iteration 0: AC-001.3/AC-001.4 `'all'` navigation (gap #1 — fixed + tested by `67ebd49`); `horizontalPadding` deviation (gap #3 — spec updated to `horizontalPadding={0}` with Container-provided 16px, matching `index.tsx:171`); AC-001.2 range-vs-sparse wording (gap #4 — spec updated to sparse set, matching implementation); backdrop-dismissal id retention (gap #5 — codified as AC-002.6, Home-consistent accepted).

## Lessons (inline — lessons.py not installed)

- The fix loop worked: spec was updated to match implementation where the behavior was acceptable (sparse years, `horizontalPadding={0}`, backdrop dismissal) and implementation was updated to match the spec where the AC was normative (`'all'` navigation), with regression tests pinning both mutants.
- "Promote byte-identical" refactors can still change user-visible behavior when the promoted code is later fixed; note Home's `'all'`-mode change for QA.
- Hook-level tests with `renderHook` are cheap and discriminated both regression mutants; screen-level wiring (modal open, tap → present, close → clear) is still the largest untested surface.
