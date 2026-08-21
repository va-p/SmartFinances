# Validation Report — BudgetDetails Budget History Bar Chart

**Verdict: PASS** (no remaining gaps — see Re-verification section)

- **Branch/range reviewed:** `feat/budget-history`, commits `2a976c5` (docs), `117a75c` (helper extraction), `b6b8486` (history util), `8802526` (chart + wiring). Diff range: `git diff 73881c1..HEAD --stat` → 8 files, +980/−64 (spec.md +57, BudgetHistoryChart/index.tsx +149, styles.ts +41, BudgetDetails/index.tsx +8, budgetCalculations.ts +168/−64ish, buildBudgetHistory.ts +72, two test files +326/+223).
- **Verifier note:** independent verification, evidence-or-zero. The refactor in `117a75c` was additionally diffed against the pre-refactor `formatBudgetInfo` at `73881c1` — period stepping and amount math are line-for-line equivalent for all six recurrences.
- **Test command:** `CI=true yarn jest --watchman=false --testRegex='src/utils/__tests__/(buildBudgetHistory|budgetCalculations)\.test\.ts$' --testPathIgnorePatterns 'screens/profile.spec.tsx'` → **2 suites, 20 tests, all passing** (baseline confirmed 3×).
- Screen-level render tests are out of scope per issue #13 and AC-004 (chart rendering verified by component code review + installed library `gifted-charts-core@0.1.76` types, which declare `strokeDashArray?: number[]` and `hideDataPoints?: boolean` on the BarChart line config).

## 1. Spec-anchored outcome check (per-AC evidence)

| AC | Evidence location | Pass |
|----|-------------------|------|
| AC-001.1 | `buildBudgetHistory.ts:13-21,31-50` return type matches `{startDate,endDate,amountSpent}[]`; `buildBudgetHistory.test.ts:86-103` pins 4 monthly periods, last endDate `endOfMonth(Apr 15) >= upTo Apr 10` | PASS (edge note) |
| AC-001.2 | `budgetCalculations.test.ts:86-214` pins period boundaries for all 6 recurrences (daily 3×1d, weekly, biweekly 15d, monthly ends last day of month, semiannually, annually) + future-start + unknown-recurrence guard | PASS |
| AC-001.3 | `buildBudgetHistory.test.ts:105-159` — Jan 18→period 0 (100), Feb 16→period 1 (50), Apr 16→period 3 (25), Mar/Feb/Jan exclusions all zero | PASS |
| AC-001.4 | `buildBudgetHistory.test.ts:161-184` — credit card −30 kept as-is, foreign-currency +55 negated, sum 25; transfers→0 pinned in `budgetCalculations.test.ts:232-239` and `buildBudgetHistory.test.ts:133-159` | PASS |
| AC-001.5 | `buildBudgetHistory.test.ts:186-196` (JSON before/after); no React import, no side effects in source | PASS |
| AC-002.1 | `getBudgetPeriods` extracted; same boundary tests as above | PASS |
| AC-002.2 | `getTransactionSpentAmount` tests: debit→+50, credit→−50, transfers→0, foreign→55 (`budgetCalculations.test.ts:217-252`) | PASS |
| AC-002.3 | `formatBudgetInfo` regression: `amount_spent=205`, `percentage=20.5`, current period [Aug 15, Aug 31], `budget_transactions=[1,3,4,5]` (`budgetCalculations.test.ts:254-325`); verified equal to pre-refactor logic | PASS |
| AC-003.1 | `BudgetHistoryChart/index.tsx:55-63` value=amountSpent, `frontColor=theme.colors.primary`, `roundedTop` (line 110) | PASS |
| AC-003.2 | `index.tsx:65-68,116-124` — `lineData` one entry per bar at `average`, `strokeDashArray:[6,4]`, `hideDataPoints:true`, `color=textPlaceholder` | PASS |
| AC-003.3 | `index.tsx:59` `label: formatBudgetHistoryLabel(period.startDate)`; label fn tested (`buildBudgetHistory.test.ts:199-206`, "JUN 26"/"DEZ 26"/"JAN 27"/"MAI 26") | PASS |
| AC-003.4 | `index.tsx:137-146` — "Valor gasto no período" / "Média de gastos dos períodos exibidos" (pt-BR) with `LegendSquare`/`LegendDash` | PASS |
| AC-003.5 | `index.tsx:99` `<SectionTitle>Histórico do orçamento</SectionTitle>` — same `SectionTitle` from `@screens/Overview/styles` used by "Transações" on the screen | PASS |
| AC-003.6 | `index.tsx:119,130-134` line/axis labels `textPlaceholder`; `formatYLabel` (125-129) appends "k" for values ≥ 1000 | PASS |
| AC-004.1 | Both test files cover all FR-001/FR-002 outcomes listed | PASS |
| AC-004.2 | Tests assert spec outcomes (absolute dates, "last day of March"-style boundaries), not internals | PASS |

**Edge note (not a failure):** AC-001.1's "last entry is the in-progress period whose `endDate >= upTo`" does not literally hold when the budget starts after `upTo` — `getBudgetPeriods` returns the single future period (endDate < upTo). This mirrors pre-existing `formatBudgetInfo` behavior, is pinned by `budgetCalculations.test.ts:195-205`, and is reasonable for a budget with no "current" period yet. Worth a spec clarification (D-decision) if strictness matters.

## 2. Discrimination sensor (mutation testing, scratch copy in $TMPDIR — project tree untouched, scratch restored & byte-identical after run)

Each mutation applied one-at-a-time to `src/utils/budgetCalculations.ts` / `src/utils/buildBudgetHistory.ts` in a scratch repo copy; the 2 relevant suites were run per mutation (same command as baseline).

| # | Mutation | Result |
|---|----------|--------|
| M1 | Flip CREDIT sign rule (CREDIT gets negated instead of kept) | KILLED (6 tests) |
| M2 | Monthly step from previous `endDate` instead of `startDate` (drift) | KILLED (5) |
| M3 | Remove transfer→0 rule | KILLED (2) |
| M4 | Invert category filter in `buildBudgetHistory` | KILLED (2) |
| M5 | `formatBudgetInfo`: `>= startDate` → `< startDate` | KILLED (1) |
| M6 | Label: drop `.toUpperCase()` | KILLED (1) |
| M7 | Label: drop year | KILLED (1) |
| M9 | Average: return total instead of mean | KILLED (1) |
| M10 | Period loop `endDate < upTo` → `<=` | KILLED (1) |
| M11 | Period assignment `>= period.startDate` → `>` (boundary excluded) | **SURVIVED (20 passed)** |
| M12 | Biweekly step 15→14 days | KILLED (1) |
| M13 | Foreign-currency detection `!==` → `===` | KILLED (3) |
| M14 | Sign rule keyed on BANK instead of CREDIT | KILLED (6) |
| M15 | Period assignment `<= period.endDate` → `>=` | KILLED (2) |
| M16 | `formatBudgetInfo`: force-count transfers | KILLED (1) |

**14/15 killed. 1 survivor → M11: the inclusive `startDate` boundary is not pinned by any test** (no fixture transaction lands exactly on a period start). Note the harness also re-verified: unknown-recurrence guard, future-start, and all recurrence steps.

## 3. Ranked gaps → fix tasks

1. **[Low] Missing boundary pin for period-start inclusion (AC-001.3).** ~~No test asserts a transaction whose `created_at` *equals* `period.startDate` is included. M11 (exclusive `>` boundary) survives.~~ **CLOSED in commit 167242d** — see Re-verification.
2. **[Nit] Spec wording vs. future-start budgets (AC-001.1).** ~~Either amend the spec or add a dedicated test.~~ **CLOSED in commit 167242d** — AC-001.1 wording updated and future-start behavior now pinned by a dedicated test — see Re-verification.

No other gaps. No mutation survived; no AC lacks code/test evidence.

## 3b. Re-verification (commit 167242d, 2026-08-21)

Re-verified as independent verifier after the author's follow-up commit `167242d` (`test(budget): pin period boundaries and clarify future-start semantics`).

**Baseline at HEAD:** `CI=true yarn jest --watchman=false --testRegex='src/utils/__tests__/(buildBudgetHistory|budgetCalculations)\.test\.ts$' --testPathIgnorePatterns 'screens/profile.spec.tsx'` → **2 suites, 22 tests, all passing** (was 20; +2 new tests).

**Gap 1 (M11 re-run): CLOSED.** Mutation M11 (`transactionDate >= period.startDate` → `>`) is now **KILLED (1 failing test)** — the new boundary test (`buildBudgetHistory.test.ts`, 'includes transactions exactly on a period start or end boundary') pins a transaction at exactly `2026-01-15T12:00:00` (period 0 start) and one at `endOfMonth` (period 0 end), asserting both contribute 40 + 60 = 100. Companion mutation M19 (`<= period.endDate` → `<`) also **KILLED**, so the end boundary is equally pinned. The `formatBudgetInfo` regression now includes a transaction at exactly `2026-08-15T12:00:00` (current-period start): `amount_spent` 215, `percentage` 21.5, `budget_transactions` `[1,3,4,5,7]`; mutation M5 (`>= startDate` → `<`) re-run and **KILLED**.

**Gap 2 (future-start semantics): CLOSED.** AC-001.1 now explicitly states the future-start case (single future first period; `endDate` may be `< upTo`). New test 'returns a single future first period when the budget starts after upTo' pins `history.length === 1`, `startDate === 2026-12-01T12:00:00`, `endDate === endOfMonth(Dec 2026)`. Mutation M17 (return empty array for future starts) **KILLED (2 tests)**; mutation M18 (monthly first-period end `endOfMonth` → `startDate`) **KILLED (6 tests)**.

**Re-verification verdict:** PASS — both previously flagged gaps are closed. 0 survivors across the re-verified mutation set (M11, M17, M18, M19, M5). Scratch copy restored to byte-identical state; project tree untouched (only the user's pre-existing modifications plus this validation.md remain uncommitted).

## 4. Environment / process notes (from initial verification)

- `python3 scripts/lessons.py` does **not** exist relative to `/Users/vap/.agents/skills/tlc-spec-driven-v3/` (only `SKILL.md` present) — lessons not recorded.
- Pre-existing blockers honored and excluded: `profile.spec.tsx` (phosphor transform), styled-components `DefaultTheme` typing errors, BudgetDetails TS errors at lines 86/206 (the latter touched by the user's still-uncommitted work).
- No commits made; working tree left exactly as found (only the user's pre-existing modifications to `src/screens/BudgetDetails/index.tsx` and `android/app/build.gradle`).
