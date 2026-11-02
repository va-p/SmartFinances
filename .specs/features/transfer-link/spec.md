# Transfer Link on RegisterTransaction Specification

## Problem Statement

Transfer transactions are stored as two linked legs (`TRANSFER_DEBIT` in the origin account, `TRANSFER_CREDIT` in the destination account, joined by `relatedTransactionId`). On the `RegisterTransaction` screen there is no visual element connecting them: when editing a transfer the user sees the origin and destination account selectors but nothing that surfaces the counterpart leg as a linked pair. This feature adds a link component for transfer transactions, positioned immediately before the `Accordion` in the form's `ContentScroll`.

## Goals

- [ ] When editing a transfer, the user can see and open its counterpart leg from a link placed immediately before the `Accordion`
- [ ] The link reuses existing screen patterns (no new backend endpoint, no new design language)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Backend/API changes (new fields or endpoints) | Counterpart data (`related_transaction_id`, `related_transaction.account`) is already returned by `GET /transaction/:id` and consumed at `RegisterTransaction/index.tsx:1388-1397` |
| Editing the counterpart inline (amount/account changes from the link) | Link is navigation/display only; edits happen through the existing edit flow |
| Bulk-edit support | Bulk edit touches only the selected leg per TR-6; link is hidden there |
| Recurring-transfer child linking | Generated children are unlinked by design (TR-7 accepted limitation) |
| Subscription accordion changes | The `Accordion` (subscription selectors) stays hidden for transfers; only the anchor position is shared |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Visibility rule | Link renders only when `transactionType === 'TRANSFER'` and the screen is not in bulk-edit mode | Transfers are the only paired transactions; bulk edit is per-leg by contract | n |
| Create mode (no counterpart exists yet) | Link is hidden on create; it appears once a linked leg is being edited | There is no counterpart id to open before the first save; a preview would duplicate the two account selectors directly above it | n |
| Tap behavior | Tapping the link opens the counterpart leg in edit mode (same `RegisterTransaction` editor, id swapped to `relatedTransactionID`) | "Link" implies navigation; reuses the existing edit flow with zero new screens | n |
| Data source | Counterpart account name comes from the already-fetched `transactionData.related_transaction.account`; no new query | D-08 already returns it; avoids a second fetch and loading state | n |
| Counterpart deleted or unlinked (`related_transaction` null) | Link is hidden | Nothing to open; avoids a dead-end row | n |
| Position when the `Accordion` is hidden for transfers | Link is inserted directly above the `Accordion` JSX block, so it occupies the accordion's anchor slot | Satisfies "immediately before the Accordion" in code order and keeps one stable anchor if the accordion is ever shown for transfers | n |

**Open questions:** none - all resolved or logged above (layout choice among the 3 design options is pending user pick in `design.md`).

---

## User Stories

### P1: Open the counterpart leg from a transfer ⭐ MVP

**User Story**: As a user editing a transfer, I want a visible link to the counterpart leg immediately before the Accordion so that I can see the pair is connected and jump to the other side.

**Why P1**: This is the whole feature: the missing visual connection between transfer legs.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the user edits a transaction whose type is a transfer leg THEN the system SHALL render the transfer-link component directly above the Accordion block and hide it for non-transfer types <!-- event-driven -->
2. WHILE the screen is in bulk-edit mode the system SHALL hide the transfer-link component <!-- state-driven -->
3. WHEN the user taps the transfer link THEN the system SHALL open the counterpart transaction (`relatedTransactionID`) in the same RegisterTransaction editor <!-- event-driven -->
4. IF the counterpart leg no longer exists (`related_transaction` is null) THEN the system SHALL hide the transfer-link component <!-- unwanted-behavior -->
5. The system SHALL render the transfer link without any new backend request, using only the linked-leg data already returned by `GET /transaction/:id` <!-- ubiquitous -->

**Independent Test**: Open a transfer for edit → link row visible between the tags list and the accordion slot → tap it → editor now shows the counterpart leg (id swapped).

---

### P2: Counterpart identity is recognizable

**User Story**: As a user editing a transfer, I want the link to name the counterpart account so that I know which side I will jump to.

**Why P2**: A bare "linked" row without identity is ambiguous when the user holds many accounts.

**Acceptance Criteria**:

1. WHEN the transfer link renders for a linked leg THEN the system SHALL display the counterpart account's name in the link <!-- event-driven -->
2. IF the counterpart account name is unavailable THEN the system SHALL fall back to the generic label "Transferência vinculada" <!-- unwanted-behavior -->

**Independent Test**: Edit a transfer leg → link shows the other side's account name; with the name missing → generic label.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF the detail query is still loading THEN the system SHALL render no link until `transactionData` resolves
- WHEN the screen is creating a new transaction (no id) THEN the system SHALL render no link
- IF the counterpart account was deleted THEN the system SHALL hide the link rather than render a dead row

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| TLINK-01 | P1: link renders above Accordion for transfers only | Implementing | Implementing |
| TLINK-02 | P1: hidden in bulk-edit mode | Implementing | Implementing |
| TLINK-03 | P1: tap opens counterpart in editor | Implementing | Implementing |
| TLINK-04 | P1: hidden when counterpart missing, no new request | Implementing | Implementing |
| TLINK-05 | P2: shows counterpart account name with fallback | Implementing | Implementing |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 5 total, 0 mapped to tasks, 5 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] Editing either leg of a transfer shows the link in the same position (directly above the Accordion slot)
- [ ] Tapping the link opens the counterpart leg for edit with no extra fetch
- [ ] Non-transfer transactions and bulk edit show no link and no layout shift
