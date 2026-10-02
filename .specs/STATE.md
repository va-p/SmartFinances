# STATE

## Decisions

### AD-001
- **Decision**: Monthly budget periods are calendar-aligned in device local time: the first period runs from `start_date` to the end of that month; every later period runs from 00:00:00.000 on the 1st to 23:59:59.999 on the last day of the month.
- **Reason**: `getFirstPeriodEnd` already ends the first monthly period at `endOfMonth`; mixing that with an anniversary start (`addMonths(startDate, 1)`) opened a gap at every month boundary and dropped transactions created early on the 1st, so every monthly budget showed 0 spent after a month rollover. Calendar months match the product's period labels and user expectation.
- **Trade-off**: Anniversary-aligned contiguous periods were rejected: they would keep 1st-of-the-month transactions inside the previous period, leaving the reported defect unfixed. Non-monthly recurrences stay anniversary-aligned (already contiguous, no data loss).
- **Scope**: `src/utils/budgetCalculations.ts` period generation, `src/utils/buildBudgetHistory.ts` (consumes it), any future budget period logic.
- **Date**: 2026-10-02
- **Status**: active

## Handoff

- **Feature**: fix-monthly-budget-period-gap (`.specs/features/fix-monthly-budget-period-gap/`)
- **Phase / Task**: Execute complete (inline, single task); Verifier pending
- **Completed**: spec, tests (red→green), fix, full-suite gate, atomic commit
- **In-progress**: none
- **Next step**: dispatch Verifier sub-agent, write `validation.md`, run `validate_state.py`
- **Blockers**: none
- **Uncommitted files**: none from this feature (user's unrelated iOS/yarn.lock modifications left untouched)
- **Branch**: feat/exchange-rate-input
