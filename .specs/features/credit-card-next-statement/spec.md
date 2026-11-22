# Credit Card Next Statement Specification

## Problem Statement

The Account screen (`src/screens/Account/index.tsx`) and `CreditCardListItem` (`src/components/CreditCardListItem/`) display "Próxima fatura" as `creditLimit - availableCreditLimit`. That difference is total committed credit (including future installment legs that already block the limit), not the amount due on the next closing. For installment purchases the displayed value overstates the next bill. The Openi integration does not currently expose a next-statement field: `getCreditCard` maps only `limits.{total,used,available}` (see `smart-finances-backend/src/services/openi.service.ts`, `upsertCreditCard` comment that card detail carries limits only). The fix must derive the next-statement amount from imported card transactions.

## Goals

- [ ] Next-statement amount on Account screen and CreditCardListItem equals the sum due on the next closing, including only the current installment legs.
- [ ] No regression for manual cards (no transactions) or cards without close/due dates: value stays explainable and never blank-crashes.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Openi bills/invoices endpoint integration | No bills endpoint is wired today; provider docs differ by sandbox; transaction-sum fix ships first, bills endpoint is a follow-up |
| Past-statement history / bill detail screen | Only the next-statement total is fixed; per-bill drill-down is separate work |
| Minimum-payment / due-date sync | `minimumPayment`, close/due dates stay as-is; only the total changes |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Openi next-statement field availability | No dedicated field is available; compute from transactions | `getCreditCard` returns only limits; no bills endpoint in `openi.service.ts` or `bankingProvider.ts` | y |
| Billing-cycle window source | Use `creditData.balanceCloseDate` / `balanceDueDate` when present; else fall back to calendar month of close day | Close/due dates are the only cycle anchors the app stores for manual and synced cards | y |
| Installment leg selection | Each imported transaction row counts once at its `transactionDate` with `amountInAccountCurrency ?? amount`; a `2/10` row contributes only its own leg | Matches `importTransactionBatch` storage: installment legs arrive as individual rows with `installmentNumber/Total` | y |
| Limit-difference fallback | WHEN cycle dates or transactions are unavailable THEN the display falls back to `creditLimit - availableCreditLimit` with no crash | Manual cards have no transactions; synced cards may lack close dates | y |
| Currency of the total | Statement total is rendered in the account currency | `CreditCardListItem` and Account screen already format with `account.currency.code` | y |

**Open questions:** none - all resolved above.

---

## User Stories

### P1: Correct next-statement total ⭐ MVP

**User Story**: As a card holder, I want the "Próxima fatura" value to equal what I actually owe next month so that I trust the app over my bank app.

**Why P1**: Core defect; current value is wrong for every installment purchase.

**Acceptance Criteria**:

1. WHEN the Account screen renders a CREDIT/CREDIT_CARD account THEN the system SHALL display the next-statement total derived from the billing-cycle transaction sum instead of `creditLimit - availableCreditLimit`.
2. WHEN `CreditCardListItem` renders a synced or manual card THEN the system SHALL display the same next-statement total as the Account screen for that account.
3. WHILE a card has an installment purchase (e.g. 2/10 of R$ 89,90) the system SHALL include only the current leg amount in the next-statement total, not the full purchase amount.
4. The system SHALL keep the "Limite disponível" value sourced from `availableCreditLimit` unchanged.
5. IF close/due dates or cycle transactions are unavailable THEN the system SHALL fall back to `creditLimit - availableCreditLimit` rather than showing a blank or crashing.

**Independent Test**: Open a synced card with a 10x installment; next-statement grows by one leg only, while available-limit reflects the full block.

---

### P2: Manual and edge cards stay sane

**User Story**: As a manual-card user, I want a sensible fatura value even with no synced transactions so that the screen never looks broken.

**Why P2**: Manual cards have no import pipeline; fallback must be defined.

**Acceptance Criteria**:

1. WHEN a CREDIT card has no `creditData.limits` THEN the system SHALL render "—" for the next-statement total instead of NaN or a crash.
2. IF a transaction lacks `amountInAccountCurrency` THEN the system SHALL use its `amount` magnitude for the cycle sum.
3. WHERE a card is manual (no `bankingIntegrationId`) the system SHALL apply the same cycle-sum-then-fallback rule using locally created transactions.

**Independent Test**: Create a manual card with no limits; Account screen shows "—" and list item shows "—".

---

## Edge Cases

- IF a card has `creditLimit` but null `availableCreditLimit` THEN system SHALL treat the total as unavailable ("—") under the current `hasInvoice` guard, unchanged by this feature.
- IF `transactionDate` falls exactly on the close date THEN system SHALL assign it to the cycle that contains the close instant consistently on both surfaces.
- WHEN a refund/credit leg (CREDIT type) lands inside the cycle THEN the system SHALL subtract it from the total.
- IF amounts arrive in foreign currency THEN system SHALL prefer `amountInAccountCurrency` (already converted) over raw `amount`.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| CCST-01 | P1: next-statement on Account screen | Design | Pending |
| CCST-02 | P1: same total in CreditCardListItem | Design | Pending |
| CCST-03 | P1: installment leg only, not full amount | Design | Pending |
| CCST-04 | P1: available limit unchanged | Design | Pending |
| CCST-05 | P1: fallback to limit difference | Design | Pending |
| CCST-06 | P2: missing limits render placeholder | Design | Pending |
| CCST-07 | P2: amount fallback and manual cards | Design | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 7 total, 0 mapped to tasks, 7 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Card with a 10x R$ 89,90 purchase shows +R$ 89,90 (one leg) on next fatura, not +R$ 899,00.
- [ ] Account screen and list item agree for the same card in the same sync state.
- [ ] Manual card with no data renders "—", no crash; synced card without dates falls back to limit difference.
