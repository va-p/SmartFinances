# Banking integration details + delete

## Problem Statement

The `BankingIntegrationDetails` screen never shows the item: the list logs the integration (id 28) but the details query resolves to `undefined`. Separately, the screen has no way to remove an integration; it needs a header trash icon with confirmation, following the other detail screens, and the backend delete must cascade to accounts and transactions.

Root cause (verified in code): the `validate` middleware replaces `req.params` with Zod-parsed data, so `id` arrives at the controller as a number; the local `pstr` helper only accepts strings, so every `GET /:id` (and reconnect) falls into 400 "ID is required" and the app renders its empty state.

## Goals

- [ ] Details screen shows bank name, status, last sync date, and linked accounts.
- [ ] Details header has a trash icon; confirmed delete removes provider item (best-effort), accounts, transactions, and the integration.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Backfill of wrong-date rows | Separate decision, recorded earlier |
| `fix/banking-integration-rout` branch | Stale and unrelated, ignored |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Fix `pstr` to accept finite numbers (single point) | Yes | Fixes detail + reconnect at once; matches `z.coerce.number()` contract | y |
| Cascade via explicit ordered deletes in one Prisma `$transaction` | Yes | No production migration needed; `SetNull` on `Account.bankingIntegration` would otherwise orphan accounts | y |
| Goal reserve accounts are never banking-linked | Delete proceeds; a reserve conflict rolls the transaction back | Reserves are created virtual by the goal flow, never by imports | y |
| Budgets on deleted accounts stay, unlinked (`SetNull`) | Yes | Schema behavior; matches account-delete semantics | y |

**Open questions:** none.

---

## User Stories

### P1: Details shows the integration ⭐ MVP

**User Story**: As a user, I want the details screen to show my connection info so that I can verify status and accounts.

**Why P1**: Core screen is blank today.

**Acceptance Criteria**:

1. WHEN opening details with a valid integration id THEN the app SHALL show bank name, status, last sync date, and linked accounts.
2. IF the backend receives a validated numeric route id THEN it SHALL resolve the integration instead of answering 400.
3. IF the detail fetch fails THEN the app SHALL show the standard error state (header + "Não foi possível carregar…") instead of a silent blank.

**Independent Test**: Backend test calls `getBankingIntegrationById` with numeric `params.id` (post-validation shape) and asserts 200 with accounts; app test renders the error branch.

---

### P1: Delete integration with cascade

**User Story**: As a user, I want to delete a connection from its details header so that its accounts and transactions leave the app.

**Why P1**: Requested; stale connections cannot be removed otherwise.

**Acceptance Criteria**:

1. WHEN the details screen renders THEN the header SHALL show a trash icon (`Header.DeleteButton`).
2. WHEN tapping trash THEN the app SHALL ask for confirmation warning that accounts and transactions are deleted too; cancel SHALL abort.
3. WHEN confirming THEN the app SHALL delete the provider item best-effort, then all accounts, all their transactions, and the integration in one transaction; on success it SHALL confirm and navigate back.
4. IF the provider delete fails THEN the local cascade SHALL still complete.
5. WHEN the integration is deleted THEN no transaction of its accounts SHALL remain.

**Independent Test**: Backend test seeds integration + accounts + transactions, deletes, asserts all gone and provider called; provider-failure variant still deletes locally.

---

## Edge Cases

- IF the detail id param is missing THEN the query stays disabled and the error state shows.
- IF delete is confirmed with no network THEN the error alert shows and the user stays on details.
- IF an account were a goal reserve THEN the DB transaction rolls back and the user sees the error alert (documented, not handled).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| BID-01 | P1 details | Execute | Verified |
| BID-02 | P1 details | Execute | Verified |
| BID-03 | P1 details | Execute | Verified |
| BDEL-01 | P1 delete | Execute | Verified |
| BDEL-02 | P1 delete | Execute | Verified |
| BDEL-03 | P1 delete | Execute | Verified |
| BDEL-04 | P1 delete | Execute | Verified |
| BDEL-05 | P1 delete | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Tasks → Implementing → Verified

**Coverage:** 8 total, 8 verified via gates below ✅

---

## Success Criteria

- [ ] Details renders real integration data for id 28-shape input.
- [ ] Confirmed delete empties accounts + transactions and goes back.
