# OpenI webhook race + display date

## Problem Statement

Two defects with production evidence:

1. Webhook race: `ITEM_CREATED` and `ITEM_WAITING_USER_INPUT` for the same item are processed concurrently. Both pass the `findFirst` null-check in `bindIntegration`/`ensureBound` and race into `prisma.bankingIntegration.create`, so one throws P2002 (`provider_integration_id`) and the webhook logs an unhandled error.
2. Display date: imported transactions carry correct `transaction_date` values (proven by the `fresh` log: 2026-08 through 2026-11 dates), but `formatTransactions` drops `transaction_date` and formats `created_at` (import day). Grouping, section headers, and item dates all show "today" for fresh imports.

## Goals

- [ ] Concurrent binds for the same item are idempotent: exactly one row, no unhandled error.
- [ ] Lists, groupings, and headers show `transaction_date`, falling back to `created_at` for old payloads.
- [ ] A compact raw-payload shape log survives terminal scroll for future field debugging.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Backfill of old wrong-date rows | Needs a migration decision |
| Per-item status sync on `ITEM_WAITING_USER_INPUT` | Status is already set at bind time; event stays ignored |
| UTC-midnight day rendering | `T00:00:00.000Z` date-only values render in local time like every other date in the app (consistent); real bank dates carry real times |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| P2002-catch in `bindIntegration` (existing-row pattern) is enough; no per-item mutex | Yes | Matches the transaction-import precedent; losers behave like late bind calls | y |
| Display keeps the app convention (format instants in local time) | Yes | Group keys, headers, and items stay mutually consistent | y |
| Raw-shape log is one compact `info` line per first page | Yes | Survives fast terminal scroll; bounded noise | y |

**Open questions:** none.

---

## User Stories

### P1: Concurrent binds are idempotent ⭐ MVP

**User Story**: As the system, I want concurrent binds for the same item to converge on one row so that webhooks never log unhandled errors.

**Why P1**: Production error on every connect flow that races.

**Acceptance Criteria**:

1. WHEN two binds race for the same `(userId, providerIntegrationId)` THEN the system SHALL persist exactly one row and return it to both callers without throwing.
2. WHEN the loser's create hits P2002 THEN the system SHALL re-read the winner row and return it with `created: false`.

**Independent Test**: Unit test stubs `findFirst` null then P2002 on create; asserts no throw and the returned row.

---

### P1: Lists show the real transaction date

**User Story**: As a user, I want imported transactions under their real date so that history and budgets read correctly.

**Why P1**: The visible half of the reported bug.

**Acceptance Criteria**:

1. WHEN formatting a transaction with `transaction_date` THEN the system SHALL derive the display date from it and carry the raw value through the formatted shape.
2. WHEN `transaction_date` is absent THEN the system SHALL keep the previous `created_at` behavior.
3. WHEN grouping formatted transactions THEN the system SHALL place them under the real date.

**Independent Test**: `formatTransactions` test with `transaction_date` asserts display + carry-through; existing fallback tests keep passing; full app suite green.

---

### P2: Raw-shape log for future field debugging

**User Story**: As a developer, I want one compact log line per fetch with raw keys and date-ish values so that field mapping can be verified without catching a scrolling terminal.

**Why P2**: Diagnosability; the user could not capture the raw log.

**Acceptance Criteria**:

1. WHEN a transaction page is fetched THEN the system SHALL log one line with the endpoint, count, first-item keys, and first-item date-ish values.

**Independent Test**: Unit test on the pure summarizer asserts keys and date values appear in one line.

---

## Edge Cases

- IF both racers pass the null check THEN the loser re-reads (no second resync storm: winner already triggers).
- IF `transaction_date` is unparseable downstream THEN existing `processTransactions` validity guards still skip.
- IF the raw page is empty THEN no shape log is emitted.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| WEB-01 | P1 race | Execute | Verified |
| WEB-02 | P1 race | Execute | Verified |
| DISP-01 | P1 display | Execute | Verified |
| DISP-02 | P1 display | Execute | Verified |
| DISP-03 | P1 display | Execute | Verified |
| LOG-01 | P2 log | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Tasks → Implementing → Verified

**Coverage:** 6 total, 6 verified via gates below ✅

---

## Success Criteria

- [ ] No unhandled webhook error on concurrent binds.
- [ ] Fresh imports list under their real dates.
