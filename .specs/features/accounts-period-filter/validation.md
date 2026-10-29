# accounts-period-filter Validation

**Date**: 2026-10-29
**Spec**: inline (small scope, no `spec.md` — AC1–AC3 + edge per task brief)
**Diff range**: `c2ac37e..HEAD` on branch `feat/accounts-period-filter` (2 commits: `c2ac37e` feature + `c80f43c` tests)
**Verifier**: independent sub-agent (author ≠ verifier), iteration 2/3
**Baseline porcelain**: `M src/screens/RegisterTransaction/components/CurrencySelectButton/styles.ts` (pre-existing, untouched; identical before and after sensor)

---

## Task Completion

Two-commit feature; no `tasks.md`. Diff-scoped review only.

| Item | Status | Notes |
| ---- | ------ | ----- |
| FilterButton + modal wiring in Accounts | ✅ Done | Mirrors Overview pattern 1:1 (`c2ac37e`) |
| Chart re-render via `selectedPeriod.period` | ✅ Done | `useMemo` dep array updated (`c2ac37e`) |
| Style additions | ✅ Done | Identical to Overview styles (`c2ac37e`) |
| Unit coverage for months / years / all branches (Gap 1 fix) | ✅ Done | 3 new tests (`c80f43c`) |

---

## Spec-Anchored Acceptance Criteria

UI code counts as evidence (repo has no RN component tests — only hook/unit tests under `src/**/__tests__/`); period granularity is covered by `src/utils/__tests__/buildNetWorthEvolution.test.ts` (11 tests, was 8).

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| AC1: WHEN user opens Accounts THEN system shows FilterButton titled `Por ${selectedPeriod.name}` above the Net Worth chart | Button `title={`Por ${selectedPeriod.name}`}` rendered directly above `ChartContainer`, same pattern as Overview:460 / Home:455 | `src/screens/Accounts/index.tsx:724-727` — `<FilterButton title={`Por ${selectedPeriod.name}`} onPress={() => handleOpenPeriodSelectedModal()} />` inside `<FiltersContainer>` immediately preceding `<ChartContainer>` (`:731`); reference patterns `src/screens/Overview/index.tsx:460-463`, `src/screens/Home/index.tsx:455-458` identical | ✅ PASS |
| AC2: WHEN user taps FilterButton THEN system opens ChartPeriodSelect modal titled 'Selecione o período' | `ModalViewSelection` with `title='Selecione o período'` hosting `ChartPeriodSelect`, presented via bottom-sheet ref | `src/screens/Accounts/index.tsx:468-470` — `handleOpenPeriodSelectedModal()` → `chartPeriodSelectedBottomSheetRef.current?.present()`; `:911-919` — `<ModalViewSelection title='Selecione o período' bottomSheetRef={chartPeriodSelectedBottomSheetRef} snapPoints={['30%','50%']}><ChartPeriodSelect period={selectedPeriod} …/>`; store dispatch `src/screens/ChartPeriodSelect/index.tsx:42-45` (`setSelectedPeriod` + `closeSelectPeriod`); same snapPoints/title as Overview `:670-681` | ✅ PASS |
| AC3: WHEN user selects a period THEN system re-renders the LineChart via buildNetWorthEvolution with selectedPeriod.period | `buildNetWorthEvolution({…, period: selectedPeriod.period, …})` inside `useMemo` with `selectedPeriod.period` in deps; `LineChart key={chartData.length}` re-renders | `src/screens/Accounts/index.tsx:288-291` — `period: selectedPeriod.period` (was hardcoded `'months'`); `:320` — dep array `[…, selectedPeriod.period]`; `:731-742` — `<LineChart key={chartData.length} data={chartData.map(…)}>`; store hook `:122` `const { selectedPeriod } = useSelectedPeriod()` | ✅ PASS |
| Edge: default selectedPeriod is Meses/months so initial chart is unchanged | Initial store value `{ id:'2', name:'Meses', period:'months' }` ≡ previous hardcoded `'months'` | `src/stores/selectedPeriodStorage.ts:13` — `selectedPeriod: { id: '2', name: 'Meses', period: 'months' }`; diff hunk `-period: 'months'` → `+period: selectedPeriod.period` | ✅ PASS |
| Edge: months mode groups net flows by month ending at totalAssets | Two-month fixture → `[{ago 2026, 900},{set 2026, 1000}]` | `src/utils/__tests__/buildNetWorthEvolution.test.ts:206-222` — `expect(result).toEqual([{ date: 'ago \n 2026', total: 900 }, { date: 'set \n 2026', total: 1000 }])` (`:218-221`); impl `src/utils/buildNetWorthEvolution.ts:72-76` (months `groupKey`/`outputFormat`/`parseFormat`) | ✅ PASS |
| Edge: years mode groups net flows by year ending at totalAssets | Cross-year fixture → `[{2025, 900},{2026, 1000}]` | `src/utils/__tests__/buildNetWorthEvolution.test.ts:225-241` — `expect(result).toEqual([{ date: '2025', total: 900 }, { date: '2026', total: 1000 }])` (`:237-240`); impl `src/utils/buildNetWorthEvolution.ts:77-81` (years config) | ✅ PASS |
| Edge: 'all' period SHALL render single point 'Todo o histórico' | `period === 'all'` → `[{ date: 'Todo o \n histórico', total: totalAssets }]` | `src/utils/__tests__/buildNetWorthEvolution.test.ts:244-255` — `expect(result).toEqual([{ date: 'Todo o \n histórico', total: 1000 }])` (`:254`); impl `src/utils/buildNetWorthEvolution.ts:60-62` — `if (period === 'all') { return [{ date: 'Todo o \n histórico', total: totalAssets }]; }` | ✅ PASS |

**Status**: ✅ All ACs + edges covered with `file:line` assertions (Gap 1 from iteration 1 closed by `c80f43c`)

---

## Discrimination Sensor

Scratch-only: git worktree creation under `$TMPDIR` was blocked by the sandbox (`.git` metadata writes not permitted — `fatal: could not create leading directories of '.git/worktrees/wt'`), so the approved fallback ran: pristine + mutant copies of `buildNetWorthEvolution.ts` (+ `baseCurrency.ts`, `convertCurrency.ts`, type-only interfaces) under `$TMPDIR/sensor-accounts-period-iter2`, alias imports rewritten to relative, transpiled via repo `tsc`, executed with `NODE_PATH=<repo>/node_modules`. Real worktree never mutated; scratch dir removed after run; porcelain after cleanup matches baseline exactly.

Harness mirrors the new test `buildNetWorthEvolution.test.ts:244-255` (1× DEBIT 50 BRL, `totalAssets: 1000`, `period: 'all'`, zero-price quotes) asserting `toEqual([{ date: 'Todo o \n histórico', total: 1000 }])`.

| Mutation | Scratch location | Description | Killed? |
| -------- | ---------------- | ----------- | ------- |
| M3 (re-injection of iteration-1 survivor) | scratch `mutant/buildNetWorthEvolution.ts:60` | `period === 'all'` → `period === 'never'` (disables edge branch) | ✅ Killed — pristine returns `[{"date":"Todo o \n histórico","total":1000}]` (assertion PASSES, harness valid); mutant returns month-grouped `[{"date":"ago \n 2026","total":1000}]` (assertion FAILS). The exact regression that shipped undetectable in iteration 1 is now caught by `test.ts:254` |

**Sensor depth**: lightweight (1 targeted behavior-level mutation on the previously surviving branch, per brief)
**Result**: 1/1 killed — PASS ✅ (iteration-1 M1 screen-wiring limitation remains accepted/systemic: no RN component-test infra in repo; wiring verified by 1:1 Overview-pattern code review)

---

## Interactive UAT Results

Not performed (not requested in brief; UI change follows the existing Overview/Home pattern 1:1).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Feature 40-line diff + 53-line test-only fix commit, no extras |
| Surgical changes | ✅ Only the files required (`Accounts/index.tsx`, `Accounts/styles.ts`, `buildNetWorthEvolution.test.ts`) |
| No scope creep | ✅ No unrelated edits (pre-existing dirty file untouched) |
| Matches patterns | ✅ Imports, ref name, handler names, modal title/snapPoints, `ChartPeriodSelect` props identical to Overview `:354-362, :670-681`; styles identical to Overview (`FiltersContainer` margin-bottom 16px, `FilterButtonGroup` width 24%); new tests reuse existing `makeTransaction`/`quotes` fixtures and `ACCOUNTS-PERIOD` comment style |
| Spec-anchored outcome check | ✅ Every asserted value matches the spec-defined outcome (month labels, year labels, single-point date string + total) |
| Per-layer Coverage Expectation met | ✅ Domain `months`/`years`/`all` branches now have 1:1 AC mapping (weeks already had) |
| Every test maps to a spec requirement | ✅ 3 new tests each map to an Accounts-filter granularity edge; no unclaimed tests |
| Documented guidelines followed | ✅ Existing file patterns followed; no new deps |

---

## Edge Cases

- [x] Default Meses/months → initial chart unchanged (store default ≡ old hardcoded value)
- [x] `'all'` → single point `'Todo o \n histórico'` at `totalAssets` (impl + test `:254`, sensor-killed)
- [x] `'months'` grouping ending exactly at `totalAssets` (test `:218-221`)
- [x] `'years'` grouping ending exactly at `totalAssets` (test `:237-240`)

---

## Gate Check

- **Gate command**: `CI=true npx jest src/utils/__tests__/buildNetWorthEvolution.test.ts --watchman=false` + `npx eslint src/utils/__tests__/buildNetWorthEvolution.test.ts src/screens/Accounts/index.tsx src/screens/Accounts/styles.ts`
- **Result**: 11 passed, 0 failed, 0 skipped; eslint exit 0 (only upstream TS-version support warning + harmless `main`-field deprecation notice)
- **Test count before feature**: 8 (weeks-only coverage)
- **Test count after feature**: 11
- **Delta**: +3 new tests (`months`, `years`, `all`)
- **Failures**: none

---

## Fix Plans

None — iteration-1 Gap 1 (unguarded `months`/`years`/`all` branches) is closed by `c80f43c` and proven by the sensor above. The iteration-1 M1 observation (Accounts screen wiring has no component test) remains accepted as systemic: repo has no RN component-test setup, and wiring is a 1:1 copy of the Overview pattern. Revisit only if component-test infra is adopted repo-wide.

---

## Requirement Traceability Update

No `spec.md` (inline spec in brief); nothing to update.

---

## Summary

**Overall**: ✅ Ready (PASS)

**Spec-anchored check**: 7/7 evidenced ✅ (AC1–AC3 + default edge + months/years/all granularity edges, each with `file:line` + exact assertion)
**Sensor**: 1/1 mutations killed (M3 `'all'`→`'never'` re-injection caught by new test `:254`)
**Gate**: 11 passed, 0 failed; eslint clean

**What works**: FilterButton placement/title, modal open/close wiring, `selectedPeriod.period` threading with correct `useMemo` deps, unchanged default chart, exact Overview-pattern conformance, plus unit-guarded months/years/all granularity.

**Issues found**: none remaining.

**Next steps**: merge `feat/accounts-period-filter` (`c2ac37e` + `c80f43c`); no further fix iterations needed.
