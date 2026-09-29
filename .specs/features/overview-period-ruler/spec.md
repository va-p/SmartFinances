# Overview — Period Ruler Specification

## Problem Statement

The Overview screen follows the shared selected period/date (its category totals,
cash-flow chart and net-worth evolution already filter by `selectedDate` via
`isDateInSelectedPeriod`), but it exposes no UI to change the selected date.
Home, Account and TransactionsByCategory all render the shared `PeriodRuler`
component for this; Overview is the only period-driven screen without one.

## Goals

- [ ] Overview renders the shared `PeriodRuler` directly below its
  `FiltersContainer`, wired to the shared navigation, so date navigation on
  Overview is identical to the other three screens.
- [ ] Ruler date changes drive Overview's existing data pipeline (no
  data-layer changes) with zero regressions (tsc delta 0, existing suite green).

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Changes to `PeriodRuler`, `buildPeriodRulerDates`, `useDateNavigation`, `ChartPeriodSelect`, `selectedPeriodStorage` | Shared modules are complete and tested (STATE.md #32); this feature only consumes them |
| Animated wrapper / scroll-linked animations for the ruler | Overview has no scroll-linked animations (unlike Home/Account) |
| Overview layout or section redesign beyond inserting the ruler | Not requested |
| New unit tests for the shared modules | Already covered by their own suites; no component-render harness exists in this repo (weekly-period-filter Test Coverage Matrix precedent) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| `horizontalPadding` prop value | `16` | Account precedent: Overview's `Container` has no screen-level horizontal padding (unlike TransactionsByCategory's, which passes `0` because its container pads 16). `16` aligns the ruler with `CashFlowSection`/`CategoriesSection`'s `padding: 0 16px` rhythm. | n |
| Years source for the `'years'` ruler | All transactions from `useTransactionsQuery`, extracted only when `selectedPeriod.period === 'years'` | Account precedent (same source of truth); guard avoids iterating all transactions in the other modes. Invalid/missing `created_at` entries are skipped (fix-period-ruler FR-001). | n |
| Wrapper around `<PeriodRuler>` | None (rendered directly) | Home/Account wrap in `Animated.View` only because they have scroll-linked animations; Overview does not (TransactionsByCategory precedent). | n |
| Tests for this feature | None — build gate (`tsc --noEmit` delta 0 new errors + `eslint` on the touched file + full jest suite unchanged) + inspection | Repo has no component-render harness (tests exist only under `src/utils/__tests__` and `src/hooks/__tests__`); screen wiring verified by gate + inspection, per weekly-period-filter T7/T9 precedent. | n |
| Pre-existing uncommitted change in `src/screens/Overview/index.tsx` (date-fns import reorder) | Rides along in the task's commit | Same file, trivial import-order fix consistent with the repo's lint-fix work; not reverted, per user-work-safety rules. | n |

**Open questions:** none — all decisions resolved from codebase precedents (STATE.md #32, Account/TransactionsByCategory implementations).

Remaining implicit-requirement dimensions (input validation beyond the years guard, failure/partial-failure, idempotency, auth, concurrency, lifecycle, observability, external-dependency failure, state transitions) are N/A for this scope: the feature is pure UI wiring of existing, tested shared modules; no new state, persistence, or external calls are introduced.

---

## User Stories

### P1: Navigate Overview by period ⭐ MVP

**User Story**: As a user, I want the same period ruler below the Overview
filters as on Home/Account/TransactionsByCategory, so that I can jump to any
week/month/year and see Overview's totals and charts for that period.

**Why P1**: This is the entire feature — the data pipeline is already driven by
`selectedDate`; only the navigation UI is missing.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHILE the Overview screen is rendered the system SHALL render the shared `PeriodRuler` directly below the `FiltersContainer` and above the `CashFlowSection`, in every period mode (`'weeks'`, `'months'`, `'years'`, `'all'`). <!-- state-driven -->
2. WHILE period mode is `'years'` the ruler SHALL receive the year set derived from the user's transactions (invalid/missing `created_at` entries skipped, plus the selected year) via `buildPeriodRulerDates`; WHILE any other mode the ruler SHALL receive `buildPeriodRulerDates` output unchanged for that mode. <!-- state-driven -->
3. WHEN the user taps a ruler item THEN the system SHALL set the shared selected date to that period's last day (week → its Sunday, month → last day of month, year → last day of year) via `useDateNavigation`, and Overview's category totals and charts SHALL recompute for the new selected date. <!-- event-driven -->
4. WHEN the user taps the prev/next arrow THEN the system SHALL move the shared selected date by exactly one period step (`'weeks'` ±7 days, `'months'`/`'all'` ±1 month, `'years'` ±1 year). <!-- event-driven -->
5. IF a transaction has an invalid or missing `created_at` THEN the system SHALL skip it when deriving ruler years (no crash, no NaN year). <!-- unwanted-behavior -->
6. The system SHALL leave the existing `ChartPeriodSelect` period-picker modal and its `FilterButton` wiring unchanged. <!-- ubiquitous -->
7. The system SHALL add zero new `tsc --noEmit` errors and keep the existing jest suite passing unchanged. <!-- ubiquitous -->

**Independent Test**: Open Overview → ruler visible below the filter button → tap a month (or use arrows) → category totals, cash-flow chart and net-worth evolution recompute for the tapped period; behavior identical to Account's ruler.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------- |
| OVR-01 | P1 | Execute | ✅ Verified (task gate) |
| OVR-02 | P1 | Execute | ✅ Verified (task gate) |
| OVR-03 | P1 | Execute | ✅ Verified (task gate) |
| OVR-04 | P1 | Execute | ✅ Verified (task gate) |
| OVR-05 | P1 | Execute | ✅ Verified (task gate) |
| OVR-06 | P1 | Execute | ✅ Verified (task gate) |
| OVR-07 | P1 | Execute | ✅ Verified (task gate) |

**Coverage:** 7 total, 7 mapped to the single wiring task, 0 unmapped.

---

## Success Criteria

- [x] Overview shows and navigates the period ruler identically to Home/Account/TransactionsByCategory (manual UAT pending — no component-render harness; inspection + shared-module suites green).
- [x] `npx tsc --noEmit`: zero new errors vs the pre-change baseline (433 total, 6 in Overview files — all pre-existing).
- [x] Full jest suite passes unchanged (same suite count/pass count as baseline; 1 pre-existing failure at HEAD in `accountsFilter.test.ts`, unrelated and untouched by this feature's diff).
