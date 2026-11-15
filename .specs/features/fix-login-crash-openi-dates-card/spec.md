# Fix login crash, OpenI dates, card labels

## Problem Statement

Three defects ship on `feat/openi-integration`: the iOS app crashes right after login with "Element type is invalid ... got: undefined"; every OpenI-imported transaction is persisted with today's date instead of its real date; the credit-card list item shows the invoice balance and the available limit with no labels, so users cannot tell them apart.

## Goals

- [ ] iOS app stays mounted after login on a production build (no redbox/crash).
- [ ] OpenI imports persist the provider's real transaction date in `transaction.transactionDate`.
- [ ] `CreditCardListItem` labels both money figures ("Fatura atual", "Limite disponível").

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Backfill of already-imported wrong dates | Needs a migration decision, separate task |
| Widget native changes | Unrelated to these three defects |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Crash root is a JS undefined component in the post-login tree, not a native module | Fix definite undefined-adjacent bugs found in audit (function-as-child, misnamed skeleton export) and audit remaining post-login imports | Matches the exact "got: undefined" signature and the after-login timing | n |
| OpenI real date field differs from `transactionAt` or `transactionAt` carries sync time | Resolve date from multiple candidate raw fields with priority, validate, never silently fall back to now | Prisma `@default(now())` masks invalid dates as today; sandbox tests only assert the stub shape | n |
| Card labels in Portuguese, values keep existing formatting/hide behavior | "Fatura atual" over balance, "Limite disponível" over available limit | Matches user request wording | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Fix iOS post-login crash ⭐ MVP

**User Story**: As a user, I want the app to stay open after login so that I can use it.

**Why P1**: Crash blocks all usage; nothing else matters until this passes.

**Acceptance Criteria**:

1. WHEN the user signs in on iOS THEN the app SHALL mount the `(app)` tabs without throwing "Element type is invalid".
2. WHEN the app renders any screen in the post-login tree THEN the app SHALL resolve every named component import (a static import/export audit reports zero runtime-undefined component imports).
3. The system SHALL NOT render a function reference as a Text child in `BankingIntegrationDetails` (call the formatter).

**Independent Test**: Sign in on an iOS production build; tabs mount, no redbox.

---

### P1: Persist real OpenI transaction dates

**User Story**: As a user, I want imported transactions dated on their real date so that history and budgets are correct.

**Why P1**: Wrong dates corrupt history, budgets, and cash-flow.

**Acceptance Criteria**:

1. WHEN OpenI returns a transaction with any known date field THEN the system SHALL persist that real date in `transaction.transactionDate`.
2. IF no known date field is present or parseable THEN the system SHALL skip the record with a warning log instead of persisting today's date.
3. WHEN the provider payload uses an alternate date key THEN the system SHALL still resolve it (multi-field resolution).

**Independent Test**: Unit test feeds raw payloads with alternate date keys; asserts stored `transactionDate` equals the real date, and missing-date records are skipped.

---

### P2: Label card invoice and limit

**User Story**: As a user, I want "Fatura atual" and "Limite disponível" labels on credit cards so that I know which figure is which.

**Why P2**: Clarity, not blocking.

**Acceptance Criteria**:

1. WHEN a credit card item renders THEN the system SHALL show "Fatura atual" above the balance figure.
2. WHEN a credit card item renders THEN the system SHALL show "Limite disponível" above the available-limit figure.
3. WHILE `hideAmount` is true the system SHALL mask both values but keep both labels visible.

**Independent Test**: Render `CreditCardListItem` with and without `hideAmount`; labels present, values masked/unmasked accordingly.

---

## Edge Cases

- IF `hideAmount` is true THEN system SHALL show "•••••" for both values with labels intact.
- IF `creditData.availableCreditLimit` is missing THEN system SHALL show "—" under "Limite disponível" instead of crashing.
- IF OpenI sends an unparseable date THEN system SHALL skip + warn, never default to now.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CRASH-01 | P1: crash | Execute | Verified |
| CRASH-02 | P1: crash | Execute | Verified |
| CRASH-03 | P1: crash | Execute | Verified |
| DATE-01 | P1: dates | Execute | Pending |
| DATE-02 | P1: dates | Execute | Pending |
| DATE-03 | P1: dates | Execute | Pending |
| CARD-01 | P2: labels | Execute | Verified |
| CARD-02 | P2: labels | Execute | Verified |
| CARD-03 | P2: labels | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Tasks → Implementing → Verified

**Coverage:** 9 total, 0 mapped to tasks, 9 unmapped ⚠️

---

## Success Criteria

- [ ] iOS sign-in mounts `(app)` without "Element type is invalid".
- [ ] Imported transactions carry their real dates in the DB.
- [ ] Card items show both labels with correct hide/missing behavior.
