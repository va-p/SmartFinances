# Weekly Period Filter Specification

## Problem Statement

The period filter (`ChartPeriodSelect`) only offers months, years, and all-history. Users who want to review their spending and income at a finer grain — "what did I spend this week?" — cannot. This adds a `weeks` period option that works consistently across all four screens that consume the filter (Home, Account, Overview, TransactionsByCategory).

## Goals

- [ ] Users can select "Semanas" in the period filter on all four screens and see transactions filtered to the selected ISO 8601 week
- [ ] Users can navigate weeks via ruler taps and ±1-week arrows, with the ruler showing all ISO weeks of the selected week-year
- [ ] Charts (cash flow, net-worth evolution) group by ISO week when the period is `weeks`
- [ ] Zero regressions in existing months/years/all behavior (full existing test suite passes unchanged)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Backend/API changes | Period filtering is entirely client-side |
| Week-based budgets, reports, or insights | Separate features; this is list/chart filtering only |
| Custom week start (user setting) | Fixed to ISO 8601 Monday start per user decision |
| Subscription/recurring screens | They do not consume `ChartPeriodSelect` |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Week start day | ISO 8601 Monday–Sunday | User decision (context.md) | y |
| Ruler content in weeks mode | All ISO weeks of the selected ISO week-year, newest-first, labeled `Sem N \n YYYY` | User decision (context.md) | y |
| Cash-flow chart in weeks mode | One bar-pair per ISO week with transactions, across all history | User decision (context.md) | y |
| Picker option order | "Semanas" first (Semanas, Meses, Anos, Tudo) | Natural smallest→largest progression | n |
| Arrow navigation step | ±7 days (`subWeeks`/`addWeeks`) | Mirrors months ±1 month, years ±1 year | n |
| Ruler tap target | Last day of the tapped ISO week (Sunday) | Mirrors months → `lastDayOfMonth`, years → `lastDayOfYear` | n |
| Overview behavior | Category totals filtered to selected ISO week; net-worth evolution grouped by ISO week | Overview has no ruler/arrows of its own; follows the shared selected period/date | n |
| Account screen tap-to-jump | Migrating Account to the shared `useDateNavigation` hook enables ruler tap-to-jump (currently a no-op there) | Consolidation per STATE.md #32; makes Account consistent with Home/TransactionsByCategory | n |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Filter transactions by week ⭐ MVP

**User Story**: As a user, I want to select "Semanas" in the period filter so that I see only the transactions of the selected week on any screen that has the filter.

**Why P1**: This is the core capability; without it the feature does not exist.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the user opens the period selection modal on the Home, Account, Overview, or TransactionsByCategory screen THEN the system SHALL display "Semanas" as the first option in the period list. <!-- event-driven -->
2. WHEN the user selects "Semanas" THEN the system SHALL set the selected period to `weeks` and close the modal. <!-- event-driven -->
3. WHILE the selected period is `weeks` THEN the system SHALL include in the transaction list only transactions whose date falls within the ISO 8601 week (Monday through Sunday) containing the selected date. <!-- state-driven -->
4. WHILE the selected period is `weeks` THEN the system SHALL group the filtered transactions by calendar day with `dd/MM/yyyy` section titles, newest day first. <!-- state-driven -->
5. WHILE the selected period is `weeks` THEN the Overview screen SHALL compute revenue and expense category totals using only transactions within the ISO week containing the selected date. <!-- state-driven -->
6. The system SHALL preserve the existing months, years, and all-history filtering behavior unchanged. <!-- ubiquitous -->

**Independent Test**: Select "Semanas" on Home → list shows only this week's transactions grouped by day; switch to a week with no transactions → empty state renders; re-select "Meses" → previous behavior intact.

---

### P1: Navigate between weeks ⭐ MVP

**User Story**: As a user, I want to move between weeks with the ruler and the arrow buttons so that I can inspect any week, not just the current one.

**Why P1**: A period filter without navigation only ever shows the current week — not demo-able as complete.

**Acceptance Criteria**:

1. WHILE the selected period is `weeks` THEN the PeriodRuler SHALL display one item per ISO week of the selected date's ISO week-year (52 or 53 items), ordered newest-first. <!-- state-driven -->
2. The system SHALL label each week ruler item `Sem N \n YYYY` where N is the unpadded ISO week number and YYYY is the ISO week-year. <!-- ubiquitous -->
3. WHILE the selected period is `weeks` THEN the system SHALL mark active exactly the ruler item whose ISO week contains the selected date. <!-- state-driven -->
4. WHEN the user presses the previous arrow in weeks mode THEN the system SHALL move the selected date exactly 7 days backward. <!-- event-driven -->
5. WHEN the user presses the next arrow in weeks mode THEN the system SHALL move the selected date exactly 7 days forward. <!-- event-driven -->
6. WHEN the user taps a week item in the ruler THEN the system SHALL set the selected date to the last day (Sunday) of that ISO week. <!-- event-driven -->
7. The system SHALL provide identical week navigation behavior on every screen that renders the PeriodRuler (Home, Account, TransactionsByCategory). <!-- ubiquitous -->

**Independent Test**: In weeks mode, press next/prev → selected week shifts by one; tap `Sem 10 \n 2026` → list filters to Mar 2–8 2026 and that item is the only active one.

---

### P1: Weekly charts ⭐ MVP

**User Story**: As a user, I want the cash-flow and net-worth charts to group by week when the period is "Semanas" so that the charts stay consistent with the filtered lists.

**Why P1**: The charts render period-grouped data; without a weeks grouping they would break or show stale groupings when the new period is selected.

**Acceptance Criteria**:

1. WHILE the selected period is `weeks` THEN the cash-flow chart SHALL display one revenue/expense bar-pair per ISO week containing at least one transaction, across all history. <!-- state-driven -->
2. The system SHALL label each weekly bar-pair `Sem N \n YYYY` with the ISO week number and ISO week-year. <!-- ubiquitous -->
3. The system SHALL order weekly bar-pairs chronologically, oldest to newest. <!-- ubiquitous -->
4. WHILE the selected period is `weeks` THEN the Overview net-worth evolution chart SHALL group net flows by ISO week and SHALL end at the current total assets. <!-- state-driven -->
5. The system SHALL compute the current-period cash flow total for the selected ISO week only. <!-- ubiquitous -->

**Independent Test**: With transactions in multiple weeks, select "Semanas" on Home → chart shows one bar-pair per week with transactions, labeled `Sem N \n YYYY`; Overview net-worth chart ends at the same total assets as in other periods.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- WHEN the selected date's ISO week-year differs from its calendar year (e.g., 2025-12-29 belongs to ISO week 1 of 2026) THEN the system SHALL use the ISO week-year in ruler labels, chart labels, and grouping keys.
- WHEN the selected date's ISO week-year has 53 ISO weeks (e.g., 2026) THEN the PeriodRuler SHALL display all 53 week items.
- IF no transactions exist in the selected week THEN the system SHALL render the existing empty-list state and the PeriodRuler SHALL still display all weeks of the selected week-year.
- IF a transaction's `created_at` is unparseable THEN the system SHALL exclude it from weekly grouping and filtering (existing behavior preserved).
- WHEN the user switches from `weeks` to another period and back THEN the system SHALL filter by the ISO week containing the current selected date (no stale week state).

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| WEEK-01 | P1: Filter by week — picker option (AC 1–2) | Execute | Implementing |
| WEEK-02 | P1: Filter by week — list filtering (AC 3–4) | Execute | Implementing |
| WEEK-03 | P1: Filter by week — Overview totals (AC 5) | Execute | Implementing |
| WEEK-04 | P1: Navigate — arrow ±1 week (AC 4–5, 7) | Design | Pending |
| WEEK-05 | P1: Navigate — ruler weeks of week-year (AC 1–3) | Execute | Implementing |
| WEEK-06 | P1: Navigate — ruler tap jumps to week end (AC 6) | Design | Pending |
| WEEK-07 | P1: Charts — cash flow by week (AC 1–3, 5) | Execute | Implementing |
| WEEK-08 | P1: Charts — net worth by week (AC 4) | Execute | Implementing |
| WEEK-09 | P1: Filter by week — no regressions (AC 6) + edge cases | Design | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 9 total, 9 mapped to stories, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] "Semanas" appears and works identically on all four screens (Home, Account, Overview, TransactionsByCategory)
- [ ] Week filtering is exact: a transaction on Monday 00:00 and one on Sunday 23:59 of the selected ISO week are both included; one on the adjacent Monday is excluded
- [ ] All existing unit tests pass unchanged, plus new tests cover weeks logic in `processTransactions`, `buildPeriodRulerDates`, and `useDateNavigation`
- [ ] Ruler and chart labels render `Sem N \n YYYY` correctly at ISO year boundaries (week 52/53 → week 1 transitions)
