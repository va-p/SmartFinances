# Validation: weekly-period-filter — PASS ✅

**Date**: 2026-09-27 (re-verified 2026-09-27, fix→re-verify iteration 1 of 3)
**Spec**: `.specs/features/weekly-period-filter/spec.md`
**Diff range**: `238fa64..HEAD` (11 commits on `feat/new-weekly-period-filter`, HEAD = `087e693`)
**Verifier**: independent sub-agent (author ≠ verifier)

**History**: iteration 0 verdict was FAIL (1 surviving sensor mutant — cross-year ISO-week discrimination gap). Fix 1 landed in `087e693` (`test(period): cover cross-year ISO week exclusion`, test-only, +19 lines). This report reflects re-verification after that fix.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 — "Semanas" option + `PeriodProps` union | ✅ Done | `src/screens/ChartPeriodSelect/index.tsx:9-44`; store default id `'2'` at `src/stores/selectedPeriodStorage.ts:13` |
| T2 — `isDateInSelectedPeriod` util | ✅ Done | `src/utils/isDateInSelectedPeriod.ts` + 7 tests |
| T3 — weeks grouping in `processTransactions` | ✅ Done | `src/utils/processTransactions.ts:49-55,186-187` + 5 new tests |
| T4 — weeks branch in `buildPeriodRulerDates` | ✅ Done | `src/utils/buildPeriodRulerDates.ts:40-52` + 3 new tests |
| T5 — weeks navigation in `useDateNavigation` | ✅ Done | `src/hooks/useDateNavigation.ts:39-48,86-89` + 3 new tests |
| T6 — weeks grouping in `buildNetWorthEvolution` | ✅ Done | `src/utils/buildNetWorthEvolution.ts:51-57` + new test file (3 tests) |
| T7 — Overview weeks filter case | ✅ Done | `src/screens/Overview/index.tsx:161-168` (shared util) |
| T8 — Home `PeriodRulerList` migration | ✅ Done | `src/screens/Home/components/PeriodRulerList.tsx:42-46` delegates to util |
| T9 — Account migration | ✅ Done | `src/screens/Account/index.tsx:158-162,215-232`; inline copies deleted |
| T10 — regression gate + STATE.md addendum | ✅ Done | `.specs/project/STATE.md` decision #32 update (2026-09-27) present |

All 10 tasks marked ✅ Complete in `tasks.md`; commit order matches the Execute-corrected plan (`T2→T3→T4→T6→T1→T5→T7→T8→T9→T10`), plus fix commit `087e693`.

---

## Spec-Anchored Acceptance Criteria

### P1: Filter transactions by week

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — modal on Home/Account/Overview/TransactionsByCategory shows "Semanas" first | "Semanas" is option #1 | Inspection (no component-render harness in repo): `src/screens/ChartPeriodSelect/index.tsx:23-28` — `{ id: '1', name: 'Semanas', period: 'weeks' }` first in `periods`; picker rendered at `src/screens/Home/index.tsx:626`, `src/screens/Account/index.tsx:502`, `src/screens/Overview/index.tsx:560`, `src/screens/TransactionsByCategory/index.tsx:228` | ✅ PASS (inspection-verified) |
| AC2 — selecting "Semanas" sets period `weeks` and closes modal | period = `weeks`; modal closed | Inspection: `src/screens/ChartPeriodSelect/index.tsx:46-49` — `handlePeriodSelect` calls `setSelectedPeriod(period)` then `closeSelectPeriod()` | ✅ PASS (inspection-verified) |
| AC3 — while `weeks`, list includes only transactions in the ISO week (Mon–Sun) containing the selected date | Monday 00:00 and Sunday 23:59 included; adjacent Monday excluded; same week number in a different ISO week-year excluded | `src/utils/__tests__/isDateInSelectedPeriod.test.ts:8-13` — `toBe(true)` for `2026-08-10 00:00:00` and `2026-08-16 23:59:59`; `:17-22` — `toBe(false)` for `2026-08-17` and `2026-08-09`; `:28-30` — `isDateInSelectedPeriod(new Date(2025, 7, 11), selectedDate, 'weeks')).toBe(false)` (w33/2025 vs w33/2026); `src/utils/__tests__/processTransactions.test.ts:112-116` — week-33 tx kept (`title).toBe('10/08/2026')`), week-34 tx dropped; `:153-159` — `2025-08-11` tx → `groupedTransactions).toHaveLength(0)`. Predicate: `src/utils/isDateInSelectedPeriod.ts:14-18` | ✅ PASS |
| AC4 — while `weeks`, group by calendar day, `dd/MM/yyyy` titles, newest day first | day sections titled `dd/MM/yyyy`, descending | `src/utils/__tests__/processTransactions.test.ts:113` — `expect(groupedTransactions[0].title).toBe('10/08/2026')`; newest-first via shared period-independent sort `src/utils/processTransactions.ts:203-207` (`secondDateParsed - firstDateParsed`) — inspection | ✅ PASS (title asserted; ordering inspection-verified on shared path) |
| AC5 — while `weeks`, Overview category totals use only selected-ISO-week transactions | totals filtered to ISO week | Wiring inspection: `src/screens/Overview/index.tsx:161-168` — `isDateInSelectedPeriod(transactionDate, selectedDate, selectedPeriod.period)`; weeks semantics pinned by `isDateInSelectedPeriod.test.ts:7-31` | ✅ PASS (inspection + predicate unit tests) |
| AC6 — months/years/all behavior preserved | existing tests pass unchanged | Pre-existing tests untouched and green: `processTransactions.test.ts:41-99` (5), `buildPeriodRulerDates.test.ts:7-67` (5), `useDateNavigation.test.ts:18-125` (6), `isDateInSelectedPeriod.test.ts:45-70` (3); full suite 217/217. Diff review: old inline predicate ≡ new util for months/years/all (incl. `default: return false`) | ✅ PASS |

### P1: Navigate between weeks

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — ruler shows one item per ISO week of the selected ISO week-year (52 or 53), newest-first | 53 items for 2026; 52 for 2025; newest-first | `src/utils/__tests__/buildPeriodRulerDates.test.ts:77-79` — `toHaveLength(53)`, `dates[0].date).toBe('Sem 53 \n 2026')`, `dates[52].date).toBe('Sem 1 \n 2026')`; `:86-95` — `toHaveLength(52)` for 2025. Source: `src/utils/buildPeriodRulerDates.ts:40-52` | ✅ PASS |
| AC2 — ruler items labeled `Sem N \n YYYY`, N unpadded ISO week, YYYY ISO week-year | `Sem 1 \n 2026` (unpadded), ISO week-year | `buildPeriodRulerDates.test.ts:79` — `'Sem 1 \n 2026'` (unpadded); `:106` — `dates.every(...endsWith('2026'))` at the 2025-12-29 boundary | ✅ PASS |
| AC3 — exactly the ruler item whose ISO week contains the selected date is active | exactly 1 active: `Sem 33 \n 2026` | `buildPeriodRulerDates.test.ts:81-83` — `active).toHaveLength(1)`, `active[0].date).toBe('Sem 33 \n 2026')` | ✅ PASS |
| AC4 — prev arrow moves selected date exactly 7 days back | 2026-08-15 → 2026-08-08 | `src/hooks/__tests__/useDateNavigation.test.ts:143-146` — `toHaveBeenLastCalledWith(new Date(2026, 7, 8))` | ✅ PASS |
| AC5 — next arrow moves selected date exactly 7 days forward | 2026-08-15 → 2026-08-22 | `useDateNavigation.test.ts:138-141` — `toHaveBeenLastCalledWith(new Date(2026, 7, 22))` | ✅ PASS |
| AC6 — tapping a week item sets selected date to that ISO week's Sunday | tap `Sem 10 \n 2026` → `new Date(2026, 2, 8)` (Sun 2026-03-08) | `useDateNavigation.test.ts:160-164` — `handlePressDate('Sem 10 \n 2026')` → `toHaveBeenLastCalledWith(new Date(2026, 2, 8))`. Source: `src/hooks/useDateNavigation.ts:86-89` (`startOfDay(endOfISOWeek(date))`) | ✅ PASS |
| AC7 — identical week navigation on every PeriodRuler screen (Home, Account, TransactionsByCategory) | same shared behavior everywhere | Inspection: all three screens consume the shared hook + util — `src/screens/Home/index.tsx:322-326` + `src/screens/Home/components/PeriodRulerList.tsx:42-46`; `src/screens/Account/index.tsx:158-162` + `:228-232`; `src/screens/TransactionsByCategory/index.tsx:65-69` + `:92-102` | ✅ PASS (inspection-verified) |

### P1: Weekly charts

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1 — cash-flow chart shows one bar-pair per ISO week with ≥1 transaction, across all history | 2 weeks → 4 bars (2 pairs) | `src/utils/__tests__/processTransactions.test.ts:130` — `toHaveLength(4)`; chart loop `src/utils/processTransactions.ts:76-122` iterates all transactions (no selectedDate filter = all history) | ✅ PASS |
| AC2 — weekly bar-pairs labeled `Sem N \n YYYY` | `Sem 33 \n 2026`, `Sem 34 \n 2026` | `processTransactions.test.ts:131,133` — `cashFlowChartData[0].label).toBe('Sem 33 \n 2026')`, `[2].label).toBe('Sem 34 \n 2026')` | ✅ PASS |
| AC3 — weekly bar-pairs ordered chronologically, oldest→newest | Sem 33 before Sem 34 | `processTransactions.test.ts:130-134` — index 0/1 = week 33 (older), index 2/3 = week 34 (newer) | ✅ PASS |
| AC4 — Overview net-worth evolution groups by ISO week and ends at current total assets | ends exactly at `totalAssets` (1000) | `src/utils/__tests__/buildNetWorthEvolution.test.ts:30-33` — `toEqual([{date:'Sem 33 \n 2026',total:900},{date:'Sem 34 \n 2026',total:1000}])` | ✅ PASS |
| AC5 — current-period cash flow total computed for the selected ISO week only | `-R$ 50,00` (−50 week only; −30 of next week excluded) | `processTransactions.test.ts:148` — `expect(currentCashFlow).toBe('-R$\u00A050,00')` | ✅ PASS |

**Status**: ✅ All ACs covered — 16/16 ACs matched spec outcome (4 screen-render ACs inspection-verified per repo test matrix); 0 spec-precision gaps.

---

## Discrimination Sensor

Scratch: `git worktree add $TMPDIR/<scratch> HEAD` (node_modules symlinked; jest run with `--rootDir` at the scratch). Real-tree `git status --porcelain` captured before and after every run — unchanged both iterations (all worktrees removed).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/isDateInSelectedPeriod.ts:17` | Dropped the `getISOWeekYear(date) === getISOWeekYear(selectedDate)` comparison (calendar-year bug) | ✅ **Killed (iteration 1)** — re-run against `087e693`: `isDateInSelectedPeriod.test.ts:30` fails (`toBe(false)` on w33/2025 vs w33/2026). Integration level `processTransactions.test.ts:159` also fails once the scratch's `@utils` alias is rewired to a relative import (babel resolves `@utils` from the process cwd = real repo, making alias-imported copies mutant-invisible in the scratch; in real-tree runs both paths resolve to the same file, so the discrimination holds). Iteration 0: survived full suite (215/215) — gap now closed |
| 2 | `src/utils/buildPeriodRulerDates.ts:46` | Off-by-one: `weeksInYear - index` → `weeksInYear - index - 1` | ✅ Killed (iteration 0) — 2 tests failed (53-week and 52-week cases) |
| 3 | `src/hooks/useDateNavigation.ts:88` | Wrong anchor: `startOfDay(endOfISOWeek(date))` → `startOfISOWeek(date)` (Monday instead of Sunday) | ✅ Killed (iteration 0) — 2 tests failed (both week-tap cases, incl. boundary) |

**Sensor depth**: lightweight (3 mutations, highest-risk new code)
**Result**: 3/3 killed — PASS ✅

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes (20 files + 1 test-only fix commit, all in declared scope) | ✅ |
| No scope creep | ✅ |
| Matches patterns (config-driven period maps mirror existing months/years shape) | ✅ |
| Spec-anchored outcome check (asserted values match spec: `Sem 33 \n 2026`, `new Date(2026, 2, 8)`, `-R$ 50,00`) | ✅ |
| Per-layer Coverage Expectation met (utils/hooks 1:1 ACs; screens = build gate per matrix) | ✅ |
| Every test maps to a spec AC / edge case / Done-when (all 21 new tests carry WEEK-xx or edge-case comments) | ✅ |
| Documented guidelines followed: none found — strong defaults applied | ✅ |

Diff-scoped tsc/eslint spot-check (baseline gates are broken repo-wide per Gate corrections): `npx tsc --noEmit` shows no errors in feature-touched files except `src/screens/Account/index.tsx:413` — that line exists byte-identically at baseline `238fa64:473` and is untouched by the diff (pre-existing). `npx eslint` on the new files: `isDateInSelectedPeriod.ts` clean; the new test files show only the repo-wide pre-existing `import/no-unresolved` / `import/extensions` resolver class, identical to pre-existing test files — no new error class. Claim "zero NEW tsc/eslint errors" holds.

---

## Edge Cases

- [x] ISO week-year ≠ calendar year (2025-12-29 = ISO week 1 of 2026) used in ruler labels, chart labels, grouping keys: `buildPeriodRulerDates.test.ts:98-111` (labels end `2026`, active `Sem 1 \n 2026`), `processTransactions.test.ts:162-171` (`cashFlows` = `['Sem 1 \n 2026']`), `buildNetWorthEvolution.test.ts:51-63`, `useDateNavigation.test.ts:168-183`, `isDateInSelectedPeriod.test.ts:33-42`. Filtering exclusion across same-week-number years now pinned: `isDateInSelectedPeriod.test.ts:25-31`, `processTransactions.test.ts:151-160`.
- [x] 53 ISO weeks (2026) → ruler displays all 53: `buildPeriodRulerDates.test.ts:77`.
- [x] Empty selected week → empty-list state + ruler still shows all weeks: ruler output is transaction-independent by construction (`buildPeriodRulerDates.ts:40-52`; tests pass no transactions); out-of-week exclusion pinned by `processTransactions.test.ts:102-117` and `:151-160`; empty state is the pre-existing `ListEmptyComponent` path.
- [x] Unparseable `created_at` excluded from grouping/filtering: period-independent guards `processTransactions.ts:81` and `:186` (untouched by diff), tested at `processTransactions.test.ts:91-99`; net-worth `isNaN` guard `buildNetWorthEvolution.ts:76` + weeks-mode test `:37-48`.
- [x] Switch `weeks` → other period → back: no stale week state by construction — store holds only `selectedPeriod` + `selectedDate` (`src/stores/selectedPeriodStorage.ts:12-20`); predicate/builders are pure functions (inspection-verified).

---

## Gate Check

- **Gate command**: `npx jest --watchman=false` (full, hard gate per Gate corrections)
- **Result**: 217 passed, 0 failed, 0 skipped — 26 suites: 25 passed, 1 failed to LOAD (`src/__tests__/screens/profile.spec.tsx`: pre-existing ESM transform blocker — `phosphor-react-native` ships untransformed ESM; import chain `profile.spec → SignUp → Header → HeaderIcon → phosphor-react-native` contains zero files from this diff; treated as baseline)
- **Test count before feature**: 196
- **Test count after feature**: 217
- **Delta**: +21 new tests (isDateInSelectedPeriod +7, processTransactions +5, buildPeriodRulerDates +3, buildNetWorthEvolution +3 new file, useDateNavigation +3) — no deletions
- **Skipped tests**: none
- **Failures**: none (executed tests)

---

## Fix Plans

### Fix 1: Strengthen weeks-predicate discrimination (Sensor #1 survivor) — ✅ RESOLVED in `087e693`

- **Root cause** (iteration 0): no test paired an equal ISO week number with a different ISO week-year; the Dec-29 boundary test was insensitive to the `getISOWeekYear` comparison (week numbers differ: 52 vs 1).
- **Fix landed**: `isDateInSelectedPeriod.test.ts:25-31` — `isDateInSelectedPeriod(new Date(2025, 7, 11), selectedDate, 'weeks')` → `toBe(false)`; `processTransactions.test.ts:151-160` — `2025-08-11T12:00:00.000Z` tx in weeks mode → `groupedTransactions).toHaveLength(0)`.
- **Re-verification**: mutation 1 re-injected in a fresh scratch worktree → killed at both levels (see Sensor table). Full gate green at 217.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| WEEK-01 (picker option) | Implementing | ✅ Verified |
| WEEK-02 (list filtering) | Implementing | ✅ Verified (iteration 1: cross-year exclusion pinned at predicate + integration level) |
| WEEK-03 (Overview totals) | Implementing | ✅ Verified |
| WEEK-04 (arrows ±1 week) | Implementing | ✅ Verified |
| WEEK-05 (ruler weeks of week-year) | Implementing | ✅ Verified |
| WEEK-06 (ruler tap → week Sunday) | Implementing | ✅ Verified |
| WEEK-07 (cash flow by week) | Implementing | ✅ Verified |
| WEEK-08 (net worth by week) | Implementing | ✅ Verified |
| WEEK-09 (no regressions + edge cases) | Pending | ✅ Verified (217/217 green; all edge cases covered) |

---

## Author-Declared Deviations — Verification

1. **Task reorder (T1 after shared modules)** — ✅ Verified OK: commit order `3055468 (T2) → 2916a60 (T3) → d018e0a (T4) → 6a0659f (T6) → 8c2e8cd (T1) → 6be7652 (T5) → …` matches the Execute-corrected plan; "Semanas" was never selectable without weeks support.
2. **Account years-ruler source fix (490fb23)** — ✅ Verified OK: diff confirms the old code parsed `created_at` as `dd/MM/yyyy` (`parse(item.created_at, 'dd/MM/yyyy', new Date())`) while the API returns ISO 8601 (STATE.md #31), so the years ruler only ever showed the selected year; new code uses `new Date(item.created_at)`. Matches `fix-period-ruler` AC-002.3 intent (Account years ruler = earliest transaction year → current, same as AC-002.2).
3. **Account ruler tap-to-jump enabled** — ✅ Verified OK: old `handlePressDate(): void {}` no-op deleted; Account now uses `useDateNavigation`. Recorded in spec.md Assumptions table ("Account screen tap-to-jump", spec.md:40).
4. **`default: return false` in `isDateInSelectedPeriod.ts:28-29`** — ✅ Verified OK: weeks/months/years/all cases all return before `default`; switch is exhaustive over `PeriodType` (airbnb rule compliance only).

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 ACs matched spec outcome (4 screen-render ACs inspection-verified per repo test matrix); 0 spec-precision gaps
**Sensor**: 3/3 mutations killed (mutation 1 killed in iteration 1 after fix `087e693`)
**Gate**: 217 passed, 0 failed (baseline load-failure of `profile.spec.tsx` unchanged)

**What works**: picker option + ordering; ISO-week filtering/grouping/labels (`Sem N \n YYYY`) with correct ISO week-year handling at boundaries **and** across same-week-number years; 53/52-week rulers newest-first with single active item; ±7-day arrows; Sunday-anchored ruler taps on all three ruler screens; weekly cash-flow bar-pairs oldest-first; weekly net-worth series ending at total assets; months/years/all behavior fully preserved; Home/Account consolidation to shared modules; STATE.md #32 addendum.

**Issues found**: iteration 0 — Sensor #1 survivor (cross-year discrimination gap); fixed in `087e693` and re-verified killed. No open issues.

**Next steps**: feature is verified; eligible for interactive UAT (user-facing) and merge.
