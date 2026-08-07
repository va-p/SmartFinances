# Recurring Transactions — UI + Backend Plumbing

**Status:** Specify
**Date:** 2026-08-07
**Scope:** Large (frontend UI + backend schemas/controllers, ~8-10 tasks)

## Summary

The Prisma schema already defines recurrence fields on the Transaction model (`isRecurring`, `recurrenceRule`, `parentTransactionId`), but the backend validation schemas (Zod), controllers, and the frontend RegisterTransaction screen don't expose or handle them. This feature adds the full plumbing: Zod validation for recurrence fields, controller handling, and a recurrence selector UI in the RegisterTransaction form.

The recurrence **engine** (auto-generating future child transactions) is explicitly **out of scope** — this feature only stores the user's recurrence choice alongside the transaction.

---

## Requirements

### R1 — Backend: Zod Schema — Recurrence Fields on Create

Add optional recurrence fields to `createTransactionSchema` so the POST /transaction endpoint accepts them.

**Fields:**
- `is_recurring`: boolean, optional, defaults to false
- `recurrence_rule`: string, optional, nullable. Stores a JSON object with `{ period: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY", date: number }` where `date` is the day-of-month (1-31), day-of-week (0-6), or null for DAILY.

**Acceptance criteria:**
- AC1.1: `createTransactionSchema` accepts optional `is_recurring` (boolean, default false) and `recurrence_rule` (string, optional, nullable)
- AC1.2: `recurrence_rule` is validated: if `is_recurring` is true, `recurrence_rule` must be a valid JSON string parseable to `{ period, date }` where period is one of DAILY/WEEKLY/MONTHLY/YEARLY
- AC1.3: If `is_recurring` is false, `recurrence_rule` is ignored (no validation error if missing)
- AC1.4: Schema exports updated TypeScript types

### R2 — Backend: Zod Schema — Recurrence Fields on Update

Add optional recurrence fields to `updateTransactionSchema`.

**Acceptance criteria:**
- AC2.1: `updateTransactionSchema` accepts optional `is_recurring` (boolean) and `recurrence_rule` (string, optional, nullable)
- AC2.2: Same validation rules as create: if `is_recurring` is true and `recurrence_rule` is provided, it must be valid JSON with correct shape
- AC2.3: Schema exports updated TypeScript types

### R3 — Backend: Controller — Handle Recurrence on Create

Update `createTransaction` controller to accept and persist `is_recurring` and `recurrence_rule`.

**Acceptance criteria:**
- AC3.1: Controller destructures `is_recurring` and `recurrence_rule` from `req.body`
- AC3.2: `prisma.transaction.create` data includes `isRecurring: is_recurring ?? false` and `recurrenceRule: recurrence_rule ?? null`
- AC3.3: Response JSON includes `is_recurring` and `recurrence_rule` fields in the returned transaction object
- AC3.4: Transfer transactions (createTransferTransactions) also accept and persist recurrence fields

### R4 — Backend: Controller — Handle Recurrence on Update

Update `updateTransaction` controller to accept and persist recurrence fields when provided.

**Acceptance criteria:**
- AC4.1: Controller destructures `is_recurring` and `recurrence_rule` from `req.body`
- AC4.2: `prisma.transaction.update` data conditionally includes recurrence fields only when provided in the request
- AC4.3: Response includes updated recurrence fields

### R5 — Backend: Controller — Return Recurrence in GET Responses

Update `getTransactions`, `getTransactionById`, and `getTransactionsByCategory` to include recurrence fields in the formatted response.

**Acceptance criteria:**
- AC5.1: `getTransactions` formatted response includes `is_recurring` and `recurrence_rule`
- AC5.2: `getTransactionById` formatted response includes `is_recurring` and `recurrence_rule`
- AC5.3: `getTransactionsByCategory` formatted response includes `is_recurring` and `recurrence_rule`

### R6 — Frontend: Transaction Interface Update

Add recurrence fields to the `TransactionProps` TypeScript interface.

**Acceptance criteria:**
- AC6.1: `TransactionProps` gains `is_recurring?: boolean` and `recurrence_rule?: string | null`

### R7 — Frontend: Recurrence Selector UI in RegisterTransaction

Add a toggle/selector to the RegisterTransaction screen that lets the user mark a transaction as recurring and choose the period + date.

**States:**
1. **Default (off):** Show a button/row labeled "Recorrente" (Recurring) with toggle OFF
2. **Toggled ON:** Expand to show:
   - Period selector: Daily / Weekly / Monthly / Yearly (horizontal pills or bottom sheet)
   - Date selector (contextual):
     - **Daily:** No date selector needed
     - **Weekly:** Day-of-week picker (Sunday–Saturday)
     - **Monthly:** Day-of-month numeric input or picker (1–31)
     - **Yearly:** Month + day picker (e.g., "January 15")

**Acceptance criteria:**
- AC7.1: A "Recorrente" toggle row is visible in the form (below the date picker row)
- AC7.2: Toggling ON reveals the period selector (daily/weekly/monthly/yearly)
- AC7.3: Selecting a period shows the appropriate date selector
- AC7.4: The selected recurrence choice is stored in component state as `{ isRecurring: boolean, period: string, date: number | null }`
- AC7.5: Toggling OFF hides the period/date selectors and clears recurrence state
- AC7.6: The recurrence row uses the same visual pattern as existing selectors (SelectButton style)

### R8 — Frontend: Include Recurrence in API Payloads

Update `handleRegisterTransaction` and `handleEditTransaction` to include `is_recurring` and `recurrence_rule` in the payloads sent to the backend.

**Acceptance criteria:**
- AC8.1: `transactionPayload` (line ~763) includes `is_recurring` and `recurrence_rule` when recurrence is enabled
- AC8.2: `transferPayload` (line ~700) includes `is_recurring` and `recurrence_rule` when recurrence is enabled
- AC8.3: `transactionEditedPayload` (line ~595) includes recurrence fields
- AC8.4: `transferEditedPayload` (line ~551) includes recurrence fields
- AC8.5: `handleBulkEditTransaction` does NOT send recurrence fields (recurrence is per-transaction, not bulk)
- AC8.6: `recurrence_rule` is serialized as `JSON.stringify({ period, date })`

### R9 — Frontend: Pre-fill Recurrence on Edit

When editing an existing transaction, pre-fill the recurrence UI from the fetched transaction data.

**Acceptance criteria:**
- AC9.1: When `transactionData` loads and contains `is_recurring: true`, the recurrence toggle is set ON
- AC9.2: The period and date selectors are pre-populated from the parsed `recurrence_rule` JSON

---

## Non-Requirements (out of scope)

- **Recurrence engine** — auto-generating future child transactions based on `recurrenceRule` is NOT part of this feature
- **Transaction list UI** — showing recurrence indicators on transaction cards in the list view
- **Bulk recurrence editing** — recurrence fields are not included in bulk edit payloads
- **Recurrence-specific routes** — no new backend routes (e.g., `GET /recurring-transactions`); recurrence data is embedded in existing transaction endpoints
- **Database migration** — Prisma schema already has the fields; no migration needed

---

## Decisions

### AD-025 — Recurrence Rule Format

**Decision:** Store recurrence rule as a JSON string in `recurrenceRule` field with shape `{ "period": "MONTHLY", "date": 15 }`.

- `period`: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
- `date`: number — day-of-month (1-31) for MONTHLY, day-of-week (0=Sunday...6=Saturday) for WEEKLY, month (1-12) for YEARLY (with date being the day), null for DAILY

**Rationale:** Simple, self-describing, easy to parse on both frontend and backend. RRULE format would be overengineered for the current scope and harder to validate/mutate in the UI.

### AD-026 — Recurrence Date Semantics

- **WEEKLY:** `date` = day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
- **MONTHLY:** `date` = day of month (1-31)
- **YEARLY:** `date` = day of month (1-31) — month is not stored separately; the parent transaction's `transaction_date` month is the anchor
- **DAILY:** `date` = null (not used)

**Rationale:** For YEARLY, the month is implicit from the transaction date itself. If the user creates a transaction on January 15 and marks it YEARLY with date=15, it recurs every January 15. The recurrence engine (future) would use the parent transaction's date as the anchor.

---

## Affected Files

| File | Change |
|------|--------|
| **Backend** | |
| `smart-finances-backend/src/schemas/transaction.schema.ts` | Add recurrence fields to create + update schemas |
| `smart-finances-backend/src/controllers/transaction.controller.ts` | Handle recurrence in create, update, transfer, and GET responses |
| **Frontend** | |
| `SmartFinances/src/interfaces/transactions.ts` | Add `is_recurring`, `recurrence_rule` to `TransactionProps` |
| `SmartFinances/src/screens/RegisterTransaction/index.tsx` | Add recurrence toggle + period/date selectors + payload updates |
| `SmartFinances/src/screens/RegisterTransaction/styles.ts` | Add recurrence-related styled components |

## Total Tasks Estimate

~8-10 atomic tasks across backend (4) + frontend (5-6)
