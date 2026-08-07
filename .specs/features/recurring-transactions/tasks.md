# Recurring Transactions — Tasks

**Feature:** recurring-transactions
**Date:** 2026-08-07
**Total tasks:** 8

## Dependency Order

```
T1 (Zod schemas)
  ├── T2 (Controller: create + transfer)
  ├── T3 (Controller: update)
  └── T4 (Controller: GET responses)
        │
T5 (Frontend: TransactionProps interface)
  │
T6 (Frontend: Recurrence selector UI)
  ├── T7 (Frontend: API payloads)
  └── T8 (Frontend: Pre-fill on edit)
```

## Tasks

---

### T1 — Backend: Add Recurrence Fields to Zod Schemas

**File:** `smart-finances-backend/src/schemas/transaction.schema.ts`

**Description:** Add `is_recurring` and `recurrence_rule` to both `createTransactionSchema` and `updateTransactionSchema`. Add a custom refinement that validates `recurrence_rule` JSON shape when `is_recurring` is true.

**Changes:**
- Add `is_recurring: z.boolean().optional().default(false)` to create schema
- Add `recurrence_rule: z.string().optional().nullable()` to create schema
- Add `.superRefine` or `.refine` that validates recurrence_rule JSON: `{ period: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY", date: number|null }`
- Add `is_recurring: z.boolean().optional()` and `recurrence_rule: z.string().optional().nullable()` to update schema
- Update exported types

**Verification:**
- Schema validation test: valid `{ is_recurring: true, recurrence_rule: '{"period":"MONTHLY","date":15}' }` passes
- Schema validation test: `{ is_recurring: true }` without recurrence_rule fails
- Schema validation test: `{ is_recurring: false }` without recurrence_rule passes
- Schema validation test: invalid period value ("HOURLY") fails

**Dependencies:** none
**Estimated effort:** 1 commit

---

### T2 — Backend: Handle Recurrence in createTransaction + createTransferTransactions

**File:** `smart-finances-backend/src/controllers/transaction.controller.ts`

**Description:** Update `createTransaction` and `createTransferTransactions` to destructure `is_recurring` and `recurrence_rule` from the request body, persist them in the Prisma create call, and return them in the response.

**Changes:**
- Destructure `is_recurring`, `recurrence_rule` from `req.body` in `createTransaction`
- Add `isRecurring: is_recurring ?? false` and `recurrenceRule: recurrence_rule ?? null` to `tx.transaction.create` data
- Add `is_recurring` and `recurrence_rule` to the response JSON
- Same changes in `createTransferTransactions` for both debit and credit transactions

**Verification:**
- POST /transaction with `is_recurring: true, recurrence_rule: '{"period":"WEEKLY","date":1}'` → persisted in DB, returned in response
- POST /transaction without recurrence fields → `isRecurring: false`, `recurrenceRule: null` persisted
- Transfer transaction with recurrence → both legs get recurrence fields

**Dependencies:** T1

---

### T3 — Backend: Handle Recurrence in updateTransaction

**File:** `smart-finances-backend/src/controllers/transaction.controller.ts`

**Description:** Update `updateTransaction` to destructure and conditionally persist recurrence fields.

**Changes:**
- Destructure `is_recurring`, `recurrence_rule` from `req.body`
- Conditionally include `isRecurring` and `recurrenceRule` in `updateData` only when provided
- Include in response

**Verification:**
- PATCH /transaction/edit with `{ transaction_id: X, is_recurring: true }` → only isRecurring updated
- PATCH /transaction/edit with `{ transaction_id: X }` → recurrence fields unchanged

**Dependencies:** T1

---

### T4 — Backend: Return Recurrence Fields in GET Responses

**File:** `smart-finances-backend/src/controllers/transaction.controller.ts`

**Description:** Update `getTransactions`, `getTransactionById`, and `getTransactionsByCategory` to include `is_recurring` and `recurrence_rule` in the formatted response objects.

**Changes:**
- Add `is_recurring: transaction.isRecurring` and `recurrence_rule: transaction.recurrenceRule` to the formattedTransaction objects in all three GET handlers
- Ensure the Prisma `select`/`include` doesn't exclude the new fields (they're already in the model, so they should be returned)

**Verification:**
- GET /transaction returns transactions with `is_recurring` and `recurrence_rule` fields
- GET /transaction/:id returns the fields
- GET /transaction/by-category returns the fields

**Dependencies:** T1

---

### T5 — Frontend: Update TransactionProps Interface

**File:** `SmartFinances/src/interfaces/transactions.ts`

**Description:** Add `is_recurring` and `recurrence_rule` to the `TransactionProps` TypeScript interface.

**Changes:**
- Add `is_recurring?: boolean` to `TransactionProps`
- Add `recurrence_rule?: string | null` to `TransactionProps`

**Verification:**
- TypeScript compilation passes
- No breaking changes to existing consumers of `TransactionProps`

**Dependencies:** none

---

### T6 — Frontend: Recurrence Selector UI in RegisterTransaction

**Files:**
- `SmartFinances/src/screens/RegisterTransaction/index.tsx`
- `SmartFinances/src/screens/RegisterTransaction/styles.ts`

**Description:** Add a recurrence toggle row below the date picker. When toggled ON, show period selector (daily/weekly/monthly/yearly) as a row of pill buttons, then a contextual date selector.

**State management:**
```ts
const [isRecurring, setIsRecurring] = useState(false);
const [recurrencePeriod, setRecurrencePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
const [recurrenceDate, setRecurrenceDate] = useState<number | null>(null);
```

**UI spec:**
1. **Toggle row:** `SelectButton` style with `Repeat` icon (from phosphor-react-native), label "Recorrente", and a Switch/toggle on the right
2. **When ON — Period selector:** Row of 4 `TransactionTypeButton`-style pills: "Diário", "Semanal", "Mensal", "Anual"
3. **When ON — Date selector (contextual):**
   - DAILY: no date selector needed
   - WEEKLY: Bottom sheet or horizontal scroll with day names ("Domingo", "Segunda", ..., "Sábado")
   - MONTHLY: Bottom sheet with numbers 1-31 or a simple numeric input
   - YEARLY: A date picker (month + day)

**Approach:** Use a `BottomSheetModal` for the date selector to keep the UI clean. When the user selects a period, if a date selector is needed, present a bottom sheet with options.

**Simplified approach for iteration 1:**
- Toggle row with Switch
- Period selector: 4 pill buttons
- Date: Use the existing `DateTimePicker` (iOS/Android native) with appropriate mode:
  - WEEKLY: not supported natively → use a custom bottom sheet with 7 day options
  - MONTHLY: use `DateTimePicker` with `mode="date"` but only use the day
  - YEARLY: use `DateTimePicker` with `mode="date"`

Actually, let me think about the simplest approach:
- Use a bottom sheet for all date selections to keep consistency
- For WEEKLY: present 7 buttons in the bottom sheet
- For MONTHLY: present a grid of 1-31
- For YEARLY: present month selector then day selector, or reuse monthly logic

**Final approach decision:** Use a `BottomSheetModal` for the date selection. Show it when the user taps a "Selecionar data" button that appears after selecting a period that requires a date.

**Changes to index.tsx:**
- Add new state variables
- Add `recurrenceBottomSheetRef`
- Add recurrence toggle row in the JSX
- Add period selector row in the JSX (conditional on `isRecurring`)
- Add date selector button + bottom sheet (conditional on period != DAILY)
- Add imports for icons (`Repeat` from phosphor)

**Changes to styles.ts:**
- Add `RecurrenceContainer`, `RecurrenceToggleRow`, `PeriodSelectorRow`, `PeriodPill`, `PeriodPillText`, `DateSelectorButton` styled components

**Verification:**
- Toggle turns recurrence ON/OFF, showing/hiding the period selector
- Selecting "Diário" hides date selector
- Selecting "Semanal" shows day-of-week bottom sheet
- Selecting "Mensal" shows 1-31 grid bottom sheet
- Selecting "Anual" shows month+day picker
- All states render correctly on both iOS and Android

**Dependencies:** T5

---

### T7 — Frontend: Include Recurrence in API Payloads

**File:** `SmartFinances/src/screens/RegisterTransaction/index.tsx`

**Description:** Update `handleRegisterTransaction` and `handleEditTransaction` to include `is_recurring` and `recurrence_rule` in the payload objects.

**Changes:**
- In `handleRegisterTransaction`:
  - Add `is_recurring, recurrence_rule` to `transactionPayload` (plain transaction, ~line 763)
  - Add `is_recurring, recurrence_rule` to `transferPayload` (transfer, ~line 700)
- In `handleEditTransaction`:
  - Add `is_recurring, recurrence_rule` to `transactionEditedPayload` (~line 595)
  - Add `is_recurring, recurrence_rule` to `transferEditedPayload` (~line 551)
- Build `recurrence_rule` as `JSON.stringify({ period: recurrencePeriod, date: recurrenceDate })` only when `isRecurring` is true
- Do NOT add recurrence fields to `handleBulkEditTransaction` payloads

**Verification:**
- Creating a transaction with recurrence → payload includes `is_recurring: true` and valid `recurrence_rule` JSON string
- Creating without recurrence → payload omits recurrence fields or sends `is_recurring: false`
- Editing adds recurrence to existing transaction → payload includes recurrence fields
- Bulk edit → no recurrence fields in payload

**Dependencies:** T6

---

### T8 — Frontend: Pre-fill Recurrence on Edit

**File:** `SmartFinances/src/screens/RegisterTransaction/index.tsx`

**Description:** When editing an existing transaction (id prop is set), parse the `recurrence_rule` from the fetched transaction data and pre-populate the recurrence UI state.

**Changes:**
- Add a `useEffect` that watches `transactionData`:
  - If `transactionData?.is_recurring` is true:
    - Set `isRecurring = true`
    - Parse `recurrence_rule` JSON → set `recurrencePeriod` and `recurrenceDate`
  - If false/undefined: leave as defaults
- Handle edge case: invalid JSON in `recurrence_rule` → silently default to off

**Verification:**
- Edit a recurring transaction → toggle is ON, period and date pre-filled
- Edit a non-recurring transaction → toggle is OFF
- Edit a transaction with malformed `recurrence_rule` → toggle is OFF (graceful degradation)

**Dependencies:** T6, T7

---

## Execution Order

```
Batch 1 (backend, independent of frontend):
  T1 → T2 → T3 → T4

Batch 2 (frontend, depends on Batch 1 for types but can run in parallel with mock data):
  T5 → T6 → T7 → T8
```

All 8 tasks in a single batch ≤ 8 → execute inline.
