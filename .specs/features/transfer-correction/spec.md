# Transfer Correction Specification

## Problem Statement

Openi imports misfire in two ways. First, a real transfer arrives with only one leg (the counterpart never imported), so the user sees a plain CREDIT/DEBIT; converting it to a transfer is broken for CREDIT legs because the editor always builds a `TRANSFER_DEBIT` in the current account and only lets the user pick a destination. Second, Nubank RDB movements ("Aplicação RDB" as expense, "Resgate RDB" as income) are really transfers between checking and investment pockets, but the 38 identical "CDB - NU FINANCEIRA" rows make picking a counterparty impossible, so users cannot fix the misclassification and income/expense totals stay wrong.

## Goals

- [ ] An imported CREDIT can be repaired into a transfer whose counterparts point the right way, without moving the primary leg to another account.
- [ ] Creating the missing counterpart leg never corrupts a bank-synced account balance; manual counterparts keep today's balance behavior.
- [ ] An RDB-style row can be marked as transfers with no counterparty ("Sem conta vinculada") so income/expense totals stop counting internal movements.
- [ ] A single-leg transfer can later be linked to an already-existing transaction (late-arriving counterpart or a row the user picks).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Investment picker disambiguation (rate/maturity chips in `AccountDestinationSelect`) | Deferred by user decision; ships as a separate soon-follow-up (see context.md Deferred Ideas) |
| Auto-detecting Aplicação/Resgate as transfers at import | Classification heuristics are a separate import-pipeline change |
| Bulk conversion of many rows at once | Bulk edit stays per-leg by existing contract; edit-only flow covers the reported pain |
| Widening the Openi auto-linker to match single-leg rows | The strict auto-matcher (`transferMatcher`) stays plain/plain-only; late counterparts are linked manually. Auto-heal is a separate follow-up |
| Changing provider balance overwrite for synced accounts | `upsertBankAccount` stays the balance owner for synced accounts |
| Recurring-transfer children linking | Generated children stay unlinked by existing accepted limitation |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Direction control shape | Circular swap button toggling the second selector between destination and source mode | User explicitly proposed this control in Scenario 1 | y |
| Default direction per stored type | Unlinked DEBIT defaults to destination mode (`TRANSFER_DEBIT`); unlinked CREDIT defaults to source mode (`TRANSFER_CREDIT`) | Matches money flow: a debit left the account, a credit arrived into it | y |
| Swap scope | Swap control appears only for unlinked plain → transfer conversion; linked-transfer edit keeps today's counterpart selector | Flipping sides of an already-linked pair is a different operation with its own balance semantics | y |
| Synced-counterpart balance | Counterpart creation on an account with a banking integration writes the row with no balance increment; manual counterparts increment as today | Provider owns synced balances and overwrites them each sync; incrementing double-counts until the next sync (user chose Option A) | y |
| Single-leg storage | Unlinked `TRANSFER_CREDIT` (from CREDIT) or `TRANSFER_DEBIT` (from DEBIT) with `relatedTransactionId = null` | Preserves sign convention so the primary balance effect is net zero; no new transfer model needed | y |
| Single-leg scope | Edit-only; bulk edit cannot create single-leg transfers | Bulk edit contract is per-leg; keeps this change surgical | y |
| Single-leg label | Counterpart slot shows "Sem conta vinculada"; transfer-link row stays hidden while unlinked | Reuses existing selector + link-visibility rules | y |
| Same-account transfer | Saving a transfer whose counterpart account equals the current account is rejected | A transfer within one account is a no-op that would create a self-linked pair | y |
| Single-leg linking | Manual link to an existing unlinked plain opposite-type row in another account moves no balances (mirrors `linkPair`); create-counterpart-from-single-leg via the account picker follows the same synced-balance rule as P1 | Linking is the same zero-balance-move operation the auto-linker already performs, so it adds no new balance risk | y |
| Link candidate list | `GET /transaction` list gains additive `related_transaction_id` so the picker shows only unlinked rows; `TransactionSelect` gains an optional filter prop defaulting to today's subscription candidates | No existing caller changes behavior; additive only | y |
| Link UI entry | Tapping the counterpart slot while unlinked offers "Selecionar conta" (create) or "Vincular transação existente" (link) via the existing alert-options pattern | Reuses `ModalViewSelection` + `TransactionSelect` instead of a new screen | y |

**Open questions:** none - all resolved or logged above (link-existing added per user request 2026-11-16).

---

## User Stories

### P1: Repair a one-sided imported transfer with the right direction ⭐ MVP

**User Story**: As an Openi user with a transfer leg whose counterpart never imported, I want to convert the plain row into a transfer pointing at the right side so that the pair is repaired without corrupting balances.

**Why P1**: This is Scenario 1 — the reported dead end for imported CREDIT rows.

**Acceptance Criteria**:

1. WHEN the user opens edit for an unlinked CREDIT row and selects the transfer tab THEN the system SHALL default to source mode with the counterpart label "Selecione a conta de origem" and a pending primary type of `TRANSFER_CREDIT`.
2. WHEN the user opens edit for an unlinked DEBIT row and selects the transfer tab THEN the system SHALL default to destination mode with the counterpart label "Selecione a conta de destino" and a pending primary type of `TRANSFER_DEBIT`.
3. WHEN the user taps the swap control THEN the system SHALL toggle between source and destination mode and swap the pending primary type between `TRANSFER_CREDIT` and `TRANSFER_DEBIT`.
4. WHEN the user saves a conversion with a counterpart selected THEN the system SHALL keep the primary leg in its current account with the pending primary type and create the opposite-typed counterpart leg in the selected account with both rows cross-linked.
5. IF the selected counterpart account has a bank integration THEN the system SHALL create the counterpart row without changing that account's stored balance.
6. IF the selected counterpart account has no bank integration THEN the system SHALL apply the standard counterpart balance increment.
7. The system SHALL keep the primary account balance net unchanged across a conversion (reverse old effect then apply new effect on the same account).
8. IF the selected counterpart account equals the current account THEN the system SHALL reject the save with a validation message.

**Independent Test**: Edit an imported CREDIT "Resgate RDB" R$500 → transfer tab defaults to source mode → pick checking → save → primary becomes linked `TRANSFER_CREDIT`, checking gains `TRANSFER_DEBIT`, synced balances untouched.

---

### P2: Mark RDB movements as transfers without a counterparty

**User Story**: As a Nubank user with Aplicação/Resgate RDB rows, I want to mark them as transfers with no counterparty so that internal pocket movements stop skewing income and expense totals.

**Why P2**: This is Scenario 2 — picking among 38 identical CDB rows is impossible, so requiring a counterparty blocks the fix entirely.

**Acceptance Criteria**:

1. WHEN the user saves an unlinked CREDIT as a transfer with no counterpart selected THEN the system SHALL store it as an unlinked `TRANSFER_CREDIT` with a null link.
2. WHEN the user saves an unlinked DEBIT as a transfer with no counterpart selected THEN the system SHALL store it as an unlinked `TRANSFER_DEBIT` with a null link.
3. WHILE a transfer leg is unlinked the system SHALL display "Sem conta vinculada" in the counterpart slot and hide the counterpart link row.
4. The system SHALL exclude unlinked transfer legs from income and expense totals exactly like linked transfer legs.
5. WHERE bulk edit is active the system SHALL NOT offer single-leg transfer conversion.

**Independent Test**: Edit "Aplicação RDB" −R$300 (DEBIT) → transfer → save with no counterpart → row becomes unlinked `TRANSFER_DEBIT`, disappears from expense totals, balance net unchanged.

---

## User Stories

### P3: Link a single-leg transfer to an already-existing transaction

**User Story**: As a user whose missing counterpart finally imported (or who found the right row), I want to link my single-leg transfer to that existing transaction so that the pair is complete without re-creating anything.

**Why P3**: Single-legs would otherwise be dead ends; late-arriving Openi legs must be attachable with zero balance risk.

**Acceptance Criteria**:

1. WHEN the user edits an unlinked `TRANSFER_CREDIT` leg and picks an existing unlinked `DEBIT` row in another account THEN the system SHALL flip the picked row to `TRANSFER_DEBIT` and cross-link both rows.
2. WHEN the user edits an unlinked `TRANSFER_DEBIT` leg and picks an existing unlinked `CREDIT` row in another account THEN the system SHALL flip the picked row to `TRANSFER_CREDIT` and cross-link both rows.
3. WHEN the user edits an unlinked transfer leg and picks an account THEN the system SHALL create the opposite-typed counterpart in that account under the same synced-balance rule as P1 (no increment when synced).
4. WHEN a single-leg link or single-leg counterpart creation succeeds THEN the system SHALL move no balances on either account for the link itself.
5. IF the picked transaction is already linked, in the same account, or of the wrong type THEN the system SHALL reject with an error and change nothing.
6. WHERE the link picker lists candidates THEN the system SHALL show only unlinked plain rows of the opposite type from other accounts.

**Independent Test**: Single-leg `TRANSFER_CREDIT` Resgate RDB + late-imported plain `DEBIT` in checking → link → checking row becomes `TRANSFER_DEBIT`, both cross-linked, both account balances untouched.

---

## Edge Cases

- IF the user tries to convert an already-linked plain row into a transfer THEN the system SHALL block with the existing conversion error alert.
- IF the user changes the primary account (moves the row) during a conversion THEN the system SHALL reject with the existing without-moving-accounts error (backend 400 contract).
- WHEN a single-leg transfer is edited again THEN the system SHALL keep it unlinked unless the user links an existing transaction, picks an account for a new counterpart, or flips the type back to plain (un-transfer path).
- IF the conversion payload carries neither an existing counterpart id nor a counterpart account THEN the system SHALL treat it as a single-leg conversion and create no counterpart row.
- WHEN the counterpart account no longer exists THEN the system SHALL reject with a not-found error and change nothing.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| TRC-01 | P1: CREDIT defaults to source mode with TRANSFER_CREDIT | Verified | ✅ Verified |
| TRC-02 | P1: DEBIT defaults to destination mode with TRANSFER_DEBIT | Verified | ✅ Verified |
| TRC-03 | P1: swap toggles mode and pending primary type | Verified | ✅ Verified |
| TRC-04 | P1: save with counterpart creates cross-linked opposite leg | Verified | ✅ Verified |
| TRC-05 | P1: synced counterpart gets no balance increment | Verified | ✅ Verified |
| TRC-06 | P1: manual counterpart keeps standard increment | Verified | ✅ Verified |
| TRC-07 | P1: primary balance net unchanged on conversion | Verified | ✅ Verified |
| TRC-08 | P1: same-account counterpart rejected | Verified | ✅ Verified |
| TRC-09 | P2: CREDIT with no counterpart becomes unlinked TRANSFER_CREDIT | Verified | ✅ Verified |
| TRC-10 | P2: DEBIT with no counterpart becomes unlinked TRANSFER_DEBIT | Verified | ✅ Verified |
| TRC-11 | P2: unlinked leg shows Sem conta vinculada and hides link row | Verified | ✅ Verified |
| TRC-12 | P2: unlinked transfers excluded from income/expense totals | Verified | ✅ Verified |
| TRC-13 | P2: bulk edit offers no single-leg conversion | Verified | ✅ Verified |
| TRC-14 | P3: link TRANSFER_CREDIT to existing unlinked DEBIT | Verified | ✅ Verified |
| TRC-15 | P3: link TRANSFER_DEBIT to existing unlinked CREDIT | Verified | ✅ Verified |
| TRC-16 | P3: create counterpart from single-leg via account picker | Verified | ✅ Verified |
| TRC-17 | P3: link/create moves no balances on either account | Verified | ✅ Verified |
| TRC-18 | P3: reject linked/same-account/wrong-type picks unchanged | Verified | ✅ Verified |
| TRC-19 | P3: picker shows only unlinked opposite-type other-account rows | Verified | ✅ Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 19 total, 19 mapped to tasks (T1-T10), 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] An imported CREDIT converts to a linked `TRANSFER_CREDIT` with the counterpart `TRANSFER_DEBIT` in the user-picked source account.
- [ ] Converting with a synced counterpart leaves that account's stored balance untouched; manual counterparts still move.
- [ ] An RDB row saved with no counterpart becomes an unlinked transfer, leaves income/expense totals, and shows "Sem conta vinculada".
- [ ] A single-leg transfer links to a picked existing transaction with both rows cross-linked and zero balance movement on either account.
