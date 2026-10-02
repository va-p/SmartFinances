# Fix Monthly Budget Period Gap Specification

## Problem Statement

Monthly budget periods are generated with two conflicting boundary rules: the first period ends at the calendar end of its month (`endOfMonth`), but every later period starts exactly one month after the previous period's start date (`addMonths(startDate, 1)`), preserving the budget's creation time-of-day. Consecutive periods are therefore disjoint, with a gap at every month boundary. Transactions created inside the gap — for a budget created at 19:03 local, everything on the 1st before 19:03 — belong to no period, so after the September → October rollover every monthly budget shows 0 spent and no transactions.

## Goals

- [ ] Monthly budget periods are contiguous: no transaction instant falls between two consecutive periods
- [ ] A budget created on the 1st at a non-midnight local time counts transactions created on the 1st of the current month

## Out of Scope

| Feature     | Reason         |
| ----------- | -------------- |
| Non-monthly recurrences (daily, weekly, biweekly, semiannually, annually) | Already contiguous — the next period starts exactly at the previous period's end; realigning them is a behavior change nobody reported |
| UTC-normalizing `start_date` on the backend | Period math is client-side; local calendar months are the product semantic (AD-001). UTC strings parse to the same instant either way |
| `buildGoalProjection` / `buildSubscriptionPeriodOptions` | Both anchor month stepping on `startOfMonth` consistently; no gap exists there |
| Switching the transaction date basis away from `created_at` | Existing convention; not part of the reported defect |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Monthly periods are calendar-aligned | First period `[start_date, end of that month]`; later periods `[1st 00:00:00.000, last day 23:59:59.999]`, device local time | `getFirstPeriodEnd` already ends the first month at `endOfMonth`, period labels and existing test titles describe month-end boundaries, and users expect "October budget = October". Anniversary-anchored periods would keep 1st-of-month transactions inside the previous period, leaving the reported defect unfixed | n |
| Existing assertions that pinned the old disjoint monthly boundaries are updated | Update the monthly assertions in `budgetCalculations.test.ts` and `buildBudgetHistory.test.ts` to calendar boundaries | They were regression pins from the budget-details-history-chart refactor (AC-002.1: "same period boundaries `formatBudgetInfo` computes today") — they mirrored the then-current behavior instead of asserting month semantics; this spec supersedes them | n |
| Debug `console.log`s added during this investigation are removed | Remove from `budgetCalculations.ts` and `useFormattedBudgets.ts` | Uncommitted investigation scaffolding, not production logging | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Contiguous monthly budget periods ⭐ MVP

**User Story**: As a user with monthly budgets, I want each budget period to cover the whole calendar month so that every transaction I create is counted in the right period.

**Why P1**: This is the reported defect — after a month rollover, budgets show 0 spent and no transactions.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN `getBudgetPeriods` is called with a MONTHLY budget THEN the system SHALL return periods where every period after the first starts at 00:00:00.000 on the 1st of a month and ends at 23:59:59.999 on the last day of that month, in device local time. <!-- BUDGET-01, event-driven -->
2. WHILE a monthly budget's periods are listed consecutively the system SHALL keep each period's start exactly 1 ms after the previous period's end (no gaps, no overlaps). <!-- BUDGET-02, state-driven -->
3. WHEN a transaction's `created_at` falls on the 1st of the current month before the budget start's time-of-day and its category belongs to the budget THEN `formatBudgetInfo` SHALL include it in the current period's `budget_transactions` and add its signed amount to `amount_spent`. <!-- BUDGET-03, event-driven -->
4. WHEN `upTo` falls within any month after the budget's start month THEN the system SHALL return a final period whose `startDate` is at or before `upTo` and whose `endDate` is at or after `upTo`. <!-- BUDGET-04, event-driven -->
5. WHEN the recurrence is daily, weekly, biweekly, semiannually or annually THEN the system SHALL keep the existing period boundaries unchanged. <!-- BUDGET-05, event-driven -->

**Independent Test**: `yarn jest src/utils/__tests__/budgetCalculations.test.ts src/utils/__tests__/buildBudgetHistory.test.ts` passes.

---

## Edge Cases

- WHEN the budget starts mid-month THEN the first period SHALL span `[start_date, end of that month]`, with full calendar months after it.
- WHEN the budget starts in the future THEN the system SHALL return the single first period `[start_date, end of its month]` (unchanged).
- WHEN the recurrence is unknown THEN the system SHALL return the single first period without looping (unchanged).
- WHEN a period step crosses a year boundary THEN the next period SHALL start on January 1 of the following year.

---

## Requirement Traceability

| Requirement ID | Story       | Phase   | Status    |
| -------------- | ----------- | ------- | --------- |
| BUDGET-01      | P1: Contiguous monthly budget periods | Execute | Verified |
| BUDGET-02      | P1: Contiguous monthly budget periods | Execute | Verified |
| BUDGET-03      | P1: Contiguous monthly budget periods | Execute | Verified |
| BUDGET-04      | P1: Contiguous monthly budget periods | Execute | Verified |
| BUDGET-05      | P1: Contiguous monthly budget periods | Execute | Verified |

**Coverage:** 5 total, 5 mapped to tests, 0 unmapped

---

## Success Criteria

- [ ] A monthly budget created on the 1st at a non-midnight local time includes transactions created on the 1st of the current month (`amount_spent` > 0)
- [ ] Full jest suite green, with no test weakened, deleted or skipped
