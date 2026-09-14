# Manual Credit Card Fields on Account Registration — Specification

## Problem Statement

When registering a manual account of type `CREDIT` (credit card), the form only captures name/balance/currency/institution — none of the credit-card-specific columns that already exist in the Prisma `Account` model (`credit_card_brand`, `credit_card_balance_close_date`, `credit_card_credit_limit`, `credit_card_available_credit_limit`). Manual credit cards therefore persist with empty card data, while the Account screen already expects `creditData.availableCreditLimit` to show "Limite disponível". The remaining `creditCard*` columns are integration-only (Pluggy/Belvo) and stay out of scope.

## Goals

- [ ] A manually registered credit card persists brand, statement closing date, total limit, and (optionally) available limit via the existing `creditData` API contract
- [ ] The credit-card fields appear only when the selected account type is `CREDIT` (create and edit flows)
- [ ] All validation and payload logic is extracted into a pure, unit-tested util (screen stays orchestration-only)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Integration-only card fields (`level`, `balanceDueDate`, `minimumPayment`, `status`, `holderType`, `balanceForeignCurrency`, `isLimitFlexible`) | Populated only by Pluggy/Belvo integrations, per feature request |
| New backend endpoints / schema (Prisma or zod) changes for create | `createAccountSchema`/`updateAccountSchema` already accept `creditData` |
| Displaying brand or closing date on other screens | Account screen already displays available limit; no other consumer exists yet |
| Cross-field rule "available ≤ total limit" | Flexible-limit cards (`creditCardIsLimitFlexible`) legitimately exceed it |
| Brand picker with fixed brand list | No brand enum exists in the schema; free text avoids excluding brands |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Is "Available Limit" optional? (user asked to evaluate) | Optional | Fluctuates with every purchase (instantly stale snapshot); derivable from total limit − balance for manual cards; backend schema is already `.optional().nullable()`; Account screen degrades gracefully when 0 (shows card balance instead) | n — evaluation delegated to agent by requester |
| Closing-date input shape | Day of month (1–31), stored as the next occurrence of that day as a UTC ISO-8601 datetime | Manual users know "my card closes on the 8th", not a calendar date; satisfies the `DateTime` column while keeping the recurring day extractable | n |
| Brand input shape | Free text (≤ 50 chars) | DB column is a free string; no enum; matches existing `ControlledInputWithIcon` pattern | n |
| API returns `0` for a null available limit | Edit pre-fill treats `0` as empty | Backend formats null limits as `0`; pre-filling `0` would imply "no credit available" | n |
| Backend update null-guard | Fix `updateAccount` to persist `null` limits instead of throwing | zod schema promises `.nullable()` but `new Decimal(null)` throws (verified) — latent contract bug hit by the edit flow | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Conditional credit-card fields with validation ⭐ MVP

**User Story**: As a user registering a credit card manually, I want card-specific inputs (brand, closing day, limits) to appear when I select "Cartão de Crédito", so that my card data is captured accurately.

**Why P1**: Without display + validation there is nothing to save; this is the visible slice of the feature.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the selected account type is `CREDIT` THEN the form SHALL display the inputs "Bandeira do cartão", "Dia de fechamento da fatura (1-31)", "Limite total do cartão" and "Limite disponível (opcional)" — event-driven
2. WHEN the selected account type is not `CREDIT` THEN the form SHALL NOT display any credit-card input — event-driven
3. WHILE the account type is `CREDIT` the form SHALL require brand, closing day, and total limit before submission — state-driven
4. IF the closing day is not an integer between 1 and 31 THEN the form SHALL reject submission with a validation message — unwanted-behavior
5. IF the available limit is left empty THEN the form SHALL accept submission, and WHEN it is filled THEN it SHALL be a non-negative number — unwanted-behavior
6. WHEN an existing credit card is opened for editing THEN the form SHALL pre-fill the four fields from the stored `creditData` (closing day extracted from the stored close date; null/0 available limit pre-filled as empty) — event-driven

**Independent Test**: Select "Cartão de Crédito" in RegisterAccount → the four inputs appear; switch to "Carteira" → they disappear; submit a CREDIT form with an empty brand → validation error appears.

---

### P1: Card data persisted through the creditData contract ⭐ MVP

**User Story**: As a user, I want the card fields I entered to be saved on create and edit, so that the Account screen can show my available limit and the card record stays accurate.

**Why P1**: The requester's core requirement — "ensure these fields are saved for credit card accounts".

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN a `CREDIT` account is submitted THEN the payload SHALL include `creditData` with `brand` (string), `balanceCloseDate` (ISO-8601 UTC datetime whose day-of-month equals the entered closing day), `creditLimit` (non-negative number) and `availableCreditLimit` (number when filled, `null` when empty) — event-driven
2. WHEN a non-`CREDIT` account is submitted THEN the payload SHALL NOT include a `creditData` key — event-driven
3. WHEN the entered closing day does not exist in the current/next month or its next occurrence has already passed THEN the date builder SHALL roll forward month-by-month until the day exists in the target month — event-driven (boundary)
4. The backend create and update schemas SHALL accept the manual `creditData` payload (brand ≤ 50 chars, full ISO-8601 datetime with offset for `balanceCloseDate`, non-negative limits, `availableCreditLimit` optional and nullable) — ubiquitous
5. IF `balanceCloseDate` is not a full ISO-8601 datetime (e.g. a date-only string) THEN the backend schemas SHALL reject it — unwanted-behavior
6. IF an update payload contains `creditData.availableCreditLimit` or `creditData.creditLimit` as `null` THEN the backend SHALL persist `null` for that column instead of returning an error — unwanted-behavior

**Independent Test**: Create a credit card with brand "Visa", day 8, total 5000, available 700 → `creditCardBrand`/`creditCardBalanceCloseDate`/`creditCardCreditLimit`/`creditCardAvailableCreditLimit` reach `prisma.account.create`; the Account screen then shows "Limite disponível" 700.

---

## Edge Cases

- IF the closing day is 29/30/31 and the target month is shorter THEN the builder SHALL roll to the next month that contains that day (never `Date` month-overflow)
- IF the user fills the card fields and then switches the type away from `CREDIT` THEN the fields SHALL be hidden and `creditData` SHALL be omitted from the payload (stale values are never sent)
- WHEN the available limit is cleared on edit THEN the payload SHALL send `availableCreditLimit: null` (persists null after the backend guard)
- WHEN the stored card has no limits (legacy/integration data) THEN edit pre-fill SHALL leave the limit inputs empty rather than pre-fill `0`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------- |
| CC-01 | P1: Conditional fields | - | Pending |
| CC-02 | P1: Conditional fields | - | Pending |
| CC-03 | P1: Conditional fields | - | Pending |
| CC-04 | P1: Conditional fields | - | Pending |
| CC-05 | P1: Conditional fields | - | Pending |
| CC-06 | P1: Conditional fields | - | Pending |
| CC-07 | P1: Persist card data | - | Pending |
| CC-08 | P1: Persist card data | - | Pending |
| CC-09 | P1: Persist card data | - | Pending |
| CC-10 | P1: Persist card data | - | Pending |
| CC-11 | P1: Persist card data | - | Pending |

**ID mapping:** CC-01..06 = Story 1 ACs 1-6; CC-07..11 = Story 2 ACs 1-6 (CC-07 = AC-1, CC-08 = AC-2, CC-09 = AC-3, CC-10 = AC-4+5 contract, CC-11 = AC-6 null-guard).

**Coverage:** 11 total, 11 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] A manual credit card saves with all four fields persisted (create and edit); Account screen shows "Limite disponível" from the saved available limit
- [ ] Frontend `yarn test` and backend `yarn test:unit` pass, including new spec-anchored tests
- [ ] `tsc`/ESLint introduce no new errors in changed files
