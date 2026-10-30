# Net Worth Consistency Specification

## Problem Statement

The Total Net Worth LineCharts on the Accounts and Overview screens plot different values for the same period (e.g. August: 36801.83 vs 36955.469999999994; September: 34109.25 vs 34262.88999999 with a monthly filter). The Overview chart also renders values with many decimal places instead of the standard two. Both charts claim to show the same quantity, so users cannot trust either one.

## Goals

- [ ] Both charts plot the identical total for every period point, derived from one shared calculation.
- [ ] Every chart point equals the user's true net worth at period end (sum of all non-hidden assets, base-converted), rounded to the current base currency's standard fraction digits.
- [ ] Both screens format chart values with the current base currency rules (two decimals for fiat).

## Out of Scope

Explicitly excluded to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Changing which accounts count toward net worth (hide/virtual rules) | Existing GOAL-25 behavior is kept as-is |
| New chart interactions or visual redesign | Only values and formatting change |
| Backend or quote-source changes | Conversion rates are consumed as-is |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Net worth definition | Sum of balances of all non-hidden accounts converted to the base currency | Matches both screens' current seed intent and GOAL-25 (virtual reserves included) | y |
| Rounding for chart points | 2 fraction digits for BRL/USD/EUR, 8 for BTC | Mirrors `formatCurrency` with `isConverted=false` so chart numbers and formatted totals agree | y |
| Single source of truth | New `calculateTotalAssets` util plus existing `buildNetWorthEvolution` | One calc path guarantees both screens plot the same values | y |
| Memo staleness | Add quote prices to both screens' memo deps | Quotes load async from price 0; without deps the chart never recomputes | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Consistent net worth charts ⭐ MVP

**User Story**: As a user, I want the Accounts and Overview net worth charts to show the same values so that I trust the evolution of my net worth.

**Why P1**: Conflicting numbers for the same quantity destroy trust in the product.

**Acceptance Criteria** (each line is one EARS pattern):

1. The system SHALL compute the net worth seed via one shared `calculateTotalAssets` helper used by both screens. <!-- ubiquitous -->
2. WHEN the monthly filter is active THEN the system SHALL plot identical totals on both screens for every month. <!-- event-driven -->
3. WHILE the base currency is a fiat currency the system SHALL round every chart point to 2 fraction digits. <!-- state-driven -->
4. IF a chart point has floating-point noise (e.g. 36955.469999999994) THEN the system SHALL display it rounded to the currency standard (e.g. 36955.47). <!-- unwanted-behavior -->
5. WHEN quotes finish loading THEN the system SHALL recompute both the seed and the chart series. <!-- event-driven -->

**Independent Test**: Seed both screens' inputs with the same accounts/transactions/quotes and assert identical chart arrays; assert a noisy float input renders with 2 decimals.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF the base currency is BTC THEN the system SHALL round chart points to 8 fraction digits.
- IF an account currency has no supported conversion THEN the system SHALL skip it in both the seed and the flows.
- WHEN there are no transactions for a period THEN the system SHALL still end the series exactly at the current net worth.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NW-01 | P1: shared seed helper | Implementing | Verified |
| NW-02 | P1: identical monthly totals | Implementing | Verified |
| NW-03 | P1: fiat 2-decimal rounding | Implementing | Verified |
| NW-04 | P1: noise rounded on display | Implementing | Verified |
| NW-05 | P1: recompute on quotes load | Implementing | Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 5 total, 5 mapped to tests, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Same fixture data through both screens' data path yields byte-identical chart series.
- [ ] No chart point carries more than the currency-standard fraction digits.
- [ ] Existing `buildNetWorthEvolution` tests still pass, plus new rounding/seed tests pass.
