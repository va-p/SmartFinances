# Validation — fix-transactions-by-category

- **Verdict: PASS** (with ranked gaps; see below)
- **Verifier**: independent agent (evidence-or-zero; spec re-derived, author's mental model not inherited)
- **Diff range reviewed**: `4b215d9..3dc1557` — 4 commits (`5f60253`, `b73210a`, `cc09f7e`, `3dc1557`), 7 files
- **Date**: 2026-08-18

## Environment / runs

| Run | Command | Result |
|---|---|---|
| Full runnable suite | `CI=true yarn jest --no-watchman --watchAll=false --forceExit --testPathIgnorePatterns="src/__tests__/screens"` | 9 suites / 68 tests PASS |
| Targeted unit suites | `processTransactions.test.ts`, `formatTransactions.test.ts` | PASS (5 + 5 tests) |
| Type check | `npx tsc --noEmit` (full project) | Touched files: only pre-existing error classes (styled-components theme typing in `*.styles.ts`; `route.params` typed `object` — same class of error existed at base with `route.params?.id`). No new type errors introduced by this feature. |
| Excluded suite | `src/__tests__/screens/profile.spec.tsx` | Pre-existing failure (phosphor-react-native ESM, present at base `4b215d9`) — unrelated. Not run. |
| Lint | — | Not runnable (`.eslintrc.json` extends uninstalled `airbnb`; pre-existing). |

## Per-AC evidence (spec-anchored)

| AC | Spec outcome | Evidence (file:line) | Verdict |
|---|---|---|---|
| AC1 | ISO `created_at`, period `months` → one group titled `dd/MM/yyyy` containing the transaction | Test: `src/utils/__tests__/processTransactions.test.ts:41-53` ("groups an ISO-timestamp transaction…") asserts `groupedTransactions[0].title === '18/08/2026'`, `data[0].id === 9`, `data[0].created_at === '18/08/2026'` — PASS. Bonus: `:80-89` ISO + period `all`. Impl: `src/utils/processTransactions.ts:30-38` (`toTransactionDate` via `parseISO`), `:72`, `:188-203` (reduce normalizes `created_at` with `format(...,'dd/MM/yyyy')` before grouping). | **PASS** |
| AC2 | Same transaction with `dd/MM/yyyy` `created_at` → same grouping | Test: `src/utils/__tests__/processTransactions.test.ts:56-66` asserts group title `'18/08/2026'` for pre-formatted input — PASS. Impl: `processTransactions.ts:34-37` falls back to `parse(value,'dd/MM/yyyy',…)` when `parseISO` yields Invalid Date. | **PASS** |
| AC3 | `formatTransactions`: ISO → `dd/MM/yyyy`; `amount_formatted` / `amount_in_account_currency_formatted` as pt-BR currency strings | Tests: `src/utils/__tests__/formatTransactions.test.ts:40-44` (created_at), `:47-53` (`typeof === 'string'`, contains `R$` + `50,00`), `:55-62` (account currency, `US$` + `100,00`), `:64-68` (undefined when absent), `:71-80` (field pass-through). Impl: `src/utils/formatTransactions.ts:13-14` (`formatDatePtBr(created_at).short()`), `:16-25` (`formatCurrency`, shared util `formatCurrency.ts:22` uses `toLocaleString('pt-BR', …)`). | **PASS** |
| AC4 | TransactionsByCategory renders grouped transactions (no empty list); Home/Account output unchanged | Wiring (code inspection): `src/screens/TransactionsByCategory/index.tsx:69-73` calls `formatTransactions(transactionsForThisCategory)` **before** `processTransactions`; `:50` reads `route.params?.categoryId` (matches route file `src/app/(app)/overview/[categoryId].tsx`); `TransactionListItem` renders `amount_formatted` verbatim (`src/components/TransactionListItem/index.tsx:97-99,120-121`) so formatted strings now display. Home/Account: `src/screens/Home/index.tsx:287-293`, `src/screens/Account/index.tsx:201-208` — the shared mapper body is a field-for-field extraction of the removed inline mappers (diff-confirmed, identical field order and conditionals; both receive the same raw query data as before). **No automated test covers the screen wiring** — see Gap G1. | **PASS (inspection only)** |

Extras verified: no `console.*`/`debugger` remains anywhere in the diff range or in the current screen; period filter exclusion (`processTransactions.test.ts:69-77`) and unparseable-date drop (`:91-99`) hold.

## Discrimination sensor (mutants)

| Mutant | Injection | Expectation | Result |
|---|---|---|---|
| A — revert `toTransactionDate` to old `parse(item.created_at,'dd/MM/yyyy',…)` (both call sites) | `src/utils/processTransactions.ts:72,192` | `processTransactions.test.ts` fails | **KILLED** — 2 failures (`:48` length 0, `:87` length 0). dd/MM/yyyy compat test still passes, correctly isolating the ISO regression. |
| B — `formatTransactions` returns raw number for `amount_formatted` | `src/utils/formatTransactions.ts:16` | `formatTransactions.test.ts` fails | **KILLED** — 1 failure (`:50` typeof expected string, received number). |
| C — remove `created_at` → `dd/MM/yyyy` normalization in the reduce (`acc.push(item)`) | `src/utils/processTransactions.ts:196-199` | title failure | **KILLED** — 2 failures (`:49`, `:88`): titles revert to raw ISO strings, proving the day-title normalization requirement is behaviorally pinned. |
| D — unwire the screen: pass raw `transactionsForThisCategory` to `processTransactions` (drop `formatTransactions` wrapper) | `src/screens/TransactionsByCategory/index.tsx:70` | any test fails | **SURVIVED** — full runnable suite 68/68 PASS with the original bug's screen-level fix reverted. No test reaches the screen. |

All mutations were applied in scratch state and reverted; final `git diff` for the three mutated files is empty and `git status` matches the pre-verification state exactly (only the pre-existing staged `src/screens/Overview/index.tsx`, modified `ios/SmartFinances.xcodeproj/project.pbxproj`, untracked `.specs/` remain). No commits, no writes to other people's work.

Note: the prompt mentioned a modified `src/components/TransactionListItem/index.tsx` (user debug log); at verification time this file is **clean** (no diff vs HEAD, no `console.*`) — either already reverted or resolved before verification. Recorded for transparency.

## Ranked gaps

1. **G1 — AC4 screen wiring has zero automated coverage (surviving mutant D).** Unit tests prove the utils, but nothing proves `TransactionsByCategory` composes `formatTransactions → processTransactions`. Reverting the screen fix leaves 68/68 green. Recommend a composition/integration test for the screen memo (or at minimum a render smoke test) that fails when the mapper is unwired.
2. **G2 — Spec root cause is incomplete; implementation fixes a second, unspecified cause.** The screen also read `route.params?.id` while its route is `/overview/[categoryId]` (route file existed at base, commit `a65f7a1`). At base, `categoryID` was `undefined`, so the category filter returned `[]` even with date parsing fixed. Commit `cc09f7e` renames to `route.params?.categoryId` — essential for R1, but absent from the spec's root cause/ACs. Spec should record this root cause and pin the param name in an AC.
3. **G3 — End-to-end reachability depends on uncommitted, staged work outside the verified range.** The staged `src/screens/Overview/index.tsx` (other people's work) changes navigation from `/bankingIntegrationDetails` (param `id`) to `/overview/[categoryId]` (param `categoryId`). If that staged change is lost, no user path reaches the fixed screen with the right param. Feature-level UAT should be blocked until that change lands; it was deliberately not modified or verified in depth here.
4. **G4 — Scope creep in `cc09f7e` beyond spec (non-breaking, consistent with Home).** Includes: Hoje/Ontem/Amanhã header labels (`index.tsx:140-146` — matches Home's existing pattern at `src/screens/Home/index.tsx:521-527`), `onPress={() => null}` (`:155`), `estimatedItemSize` removal (`:164`), dead-import cleanup, `useTransactionsQuery(userID)` → `useTransactionsQuery()` (hook takes 0 args; base call was a latent type error). None violate R1–R4/AC1–AC4, but the header-label transform means the rendered title is no longer literally the `dd/MM/yyyy` data title (data title stays `dd/MM/yyyy`; only display changes). Flag for spec hygiene, not a defect.
5. **G5 — Timezone precision unspecified.** Spec says "group titled `dd/MM/yyyy`" but not in which timezone the day is derived; ISO inputs are grouped by **local** calendar day (`format(date,'dd/MM/yyyy')`). Tests deliberately use midday UTC (`processTransactions.test.ts:11-12`, `formatTransactions.test.ts:13`) to stay TZ-stable. Under UTC±14, AC1's pinned title and the AC2 equivalence could diverge. Minor, test-level note.
6. **G6 — AC3 assertions are substring-based** (`toContain('R$')`, `toContain('50,00')`) rather than exact pt-BR equality (e.g., `-R$ 50,00`). Adequate for discriminating the raw-number defect, weaker for regressions in sign/symbol placement.

## Lessons (inline — `lessons.py` absent in this install)

1. Composition bugs need at least one composition-level test: three util-level mutants were killed, but the exact screen-level regression the feature fixes (unwired mapper) survives everything runnable. Add the test at the layer where the bug lived.
2. Always cross-check route param reads against the route file's dynamic segment name; navigation param mismatches are silent (`undefined` filters to `[]` with no error) and easy to miss when the debug evidence points elsewhere. The feature had two root causes; the spec named one.
3. Keep verification scratch edits revert-verified: after each mutation, `git diff` on the touched files must be empty before moving on (used here as the discard proof).
