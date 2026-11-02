# Exclude Future Transactions from Totals Specification

## Problem Statement

Scheduled transactions with a future `created_at` are included in period totals. Cash flow, current cash flow, category revenue/expense totals, and the displayed net worth seed all count money that has not moved yet, so users see inflated totals for the current period.

## Goals

- [ ] Period cash flow totals count only transactions with `created_at <= now`.
- [ ] Displayed net worth (Patrimônio Total) reflects only realized effects, excluding future transactions.
- [ ] Existing transaction lists keep showing future rows; only numeric totals change.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Backend balance changes | Account balances keep updating on create; frontend subtracts future effects only for display |
| Hiding future rows from lists | Lists keep future transactions visible for planning; only totals are filtered |
| Budget spent rules change | Budget `amount_spent` keeps its period-window semantics; this feature covers cash flow and net worth totals |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Future definition | `created_at > new Date()` at call time is future; equal to now counts as realized | Matches the requested `new Date(now)` filter and avoids excluding transactions created this instant | y |
| List visibility | Grouped day lists keep future rows; only aggregates exclude them | Totals are the reported defect; hiding scheduled rows would remove planning visibility | y |
| Transfers | Transfers stay excluded from flows, as before | They move money between accounts without changing net worth | y |
| Net worth seed | Realized net worth equals `calculateTotalAssets` minus converted future flows (transfers excluded, unsupported currencies skipped) | Account balances already include future effects, so the display must back them out with the same BC-21/BC-22/BC-23 conversion rules | y |
| Invalid dates | Unparseable `created_at` values are skipped, as before | Existing behavior preserved | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Realized cash flow totals ⭐ MVP

**User Story**: As a user, I want cash flow totals to count only transactions that already happened so that current period numbers reflect real money movement.

**Why P1**: Future scheduled transactions inflate the current cash flow and mislead spending decisions.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN aggregating chart flows THEN the system SHALL skip transactions with `created_at` after now.  <!-- event-driven -->
2. WHEN computing the current-period cash flow THEN the system SHALL sum only transactions with `created_at` at or before now.  <!-- event-driven -->
3. WHILE a future transaction is inside the selected period the system SHALL still list its day group but SHALL exclude its amount from the current cash flow total.  <!-- state-driven -->
4. The system SHALL keep excluding transfers and unparseable dates from every aggregate.  <!-- ubiquitous -->

**Independent Test**: Feed one past and one future transaction in the selected month; assert the current cash flow equals only the past amount while both day groups remain listed.

---

### P1: Realized net worth total ⭐ MVP

**User Story**: As a user, I want the Patrimônio Total and its evolution chart to exclude future transactions so that my net worth reflects money I actually hold.

**Why P1**: Account balances already include scheduled future effects, so the displayed total is inflated until those dates arrive.

**Acceptance Criteria**:

1. WHEN displaying Patrimônio Total THEN the system SHALL subtract converted future flows from the balance sum so the result counts only realized effects.  <!-- event-driven -->
2. WHEN building the net worth evolution series THEN the system SHALL seed the final point at the realized total and SHALL skip future-dated flows.  <!-- event-driven -->
3. IF an account currency has no supported conversion THEN the system SHALL skip it in both the seed and the future-flow adjustment.  <!-- unwanted-behavior -->

**Independent Test**: Seed accounts with balance 1000 plus one future CREDIT of 500; assert the displayed total is 500 and the evolution series ends at 500 with no future point.

---

### P1: Realized category totals ⭐ MVP

**User Story**: As a user, I want Overview revenue and expense totals for the selected period to exclude future transactions so that category breakdowns match the realized cash flow.

**Why P1**: Category totals feed the same current-period cash flow view; including future rows keeps the mismatch.

**Acceptance Criteria**:

1. WHEN filtering transactions for the selected period THEN the system SHALL exclude transactions with `created_at` after now.  <!-- event-driven -->

**Independent Test**: Place one past and one future DEBIT in the selected month; assert expenses equal only the past amount.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF a transaction timestamp equals exactly now THEN the system SHALL include it as realized.
- IF every transaction in a period is future THEN the system SHALL report a zero current cash flow and an empty chart series for that aggregation.
- WHEN the base currency conversion for a future flow is unsupported THEN the system SHALL skip that flow and still adjust by the remaining future flows.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| FUT-01      | P1: cash flow chart | Implementing | Verified |
| FUT-02      | P1: current cash flow | Implementing | Verified |
| FUT-03      | P1: list-keeps-future | Implementing | Verified |
| FUT-04      | P1: transfers/invalid preserved | Implementing | Verified |
| FUT-05      | P1: realized net worth | Implementing | Verified |
| FUT-06      | P1: evolution seed | Implementing | Verified |
| FUT-07      | P1: unsupported skip | Implementing | Verified |
| FUT-08      | P1: category totals | Implementing | Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 8 total, 0 mapped to tasks, 8 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] A fixture with one past and one future transaction in the selected month yields a current cash flow of only the past amount on Home, Account, and Overview paths.
- [ ] A fixture with balance 1000 plus a future +500 CREDIT displays Patrimônio Total 500 with the evolution series ending at 500.
- [ ] Existing `processTransactions`, `buildNetWorthEvolution`, `calculateTotalAssets`, and budget test suites still pass.
