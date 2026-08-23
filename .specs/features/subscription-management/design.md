# Subscription Management — Design

**Date:** 2026-08-22
**Status:** Design for implementation

---

## 1. Architecture Overview

Subscriptions are a **derived view** over the existing recurrence
infrastructure. No new domain table; two boolean columns on `transactions`
(AD-033). The backend exposes a read model (`GET /subscription…`) and the
frontend renders the 6 wireframe screens.

```
┌─────────────────────────────── Backend ────────────────────────────────┐
│                                                                        │
│  transaction.controller (existing)      subscription.controller (new)  │
│   · create → auto-classify            ┌─────────────────────────────┐  │
│   · update → flags + nextOccurrenceAt │ GET /subscription           │  │
│   · GET responses include flags       │ GET /subscription/:id       │  │
│                                       │ GET /subscription/payments  │  │
│   transaction.schema (existing +flags)└──────────────┬──────────────┘  │
│   subscription.schema (new)                         │                  │
│                                                     ▼                  │
│                              subscription.service (pure functions)    │
│                                anchor/day/last/next/occurrence/DTO     │
└────────────────────────────────────────────────────────────────────────┘
                                     │ REST (axios)
┌─────────────────────────────── Frontend ───────────────────────────────┐
│                                                                        │
│  hooks (react-query)  →  utils (pure, unit-tested)  →  components      │
│  useSubscriptionsQuery   formatSubscriptionDate        SubscriptionList │
│  useSubscriptionDetail…  buildSubscriptionPeriodOpts  Item / Payment…  │
│  useSubscriptionPayments subscriptionDisplay           SubscriptionHelp │
│  useSubscriptionMutations subscriptionPaymentsSummary  Sheet            │
│                                                                        │
│  screens: Subscriptions (T1) · SubscriptionDetails (T3/4) ·            │
│           SubscriptionPayments (T5 + period sheet T6)                  │
│  routes: /options/subscriptions · subscriptionDetails ·                │
│          subscriptionPayments                                          │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Model

```prisma
model Transaction {
  // …existing fields…
  isSubscription          Boolean  @default(false) @map("is_subscription")
  hideFromSubscriptionList Boolean @default(false) @map("hide_from_subscription_list")
}
```

API naming: `is_subscription`, `hide_from_subscription_list` (snake_case,
mirroring `is_recurring`).

### Classification invariant (AD-034)

A row is a **visible subscription** iff:

```
isSubscription = true
AND hideFromSubscriptionList = false
AND isRecurring = true
AND parentTransactionId = null
AND recurrencePeriod IN ('MONTHLY','YEARLY')
```

Auto-classification at creation:
`is_subscription ?? (is_recurring && period ∈ {MONTHLY, YEARLY} && type ∉ {TRANSFER_CREDIT, TRANSFER_DEBIT})`.

## 3. API Contract

Base: `/api/v1/subscription` (all authenticated).

### 3.1 `GET /subscription`

200 → array of:

```jsonc
{
  "id": 123,                    // parent transaction id
  "description": "Amazon Prime",
  "amount": 19.9,
  "currency": { "id": 1, "name": "Real", "code": "BRL", "symbol": "R$" },
  "category": {
    "id": "uuid", "name": "Streaming",
    "icon": { "id": "uuid", "name": "play", "title": null },
    "color": { "id": "uuid", "color_code": "#FFAA29" }
  },
  "recurrence_period": "MONTHLY",
  "recurrence_interval": 1,
  "day": 6,
  "next_payment_at": "2026-08-06T00:00:00.000Z",
  "last_payment_at": "2026-07-06T00:00:00.000Z",
  "is_subscription": true,
  "hide_from_subscription_list": false
}
```

### 3.2 `GET /subscription/:id`

Same shape for a single parent row (owned by user); 404 otherwise. Returns the
row even when hidden/unclassified (details screen needs current flag state).

### 3.3 `GET /subscription/payments?month=YYYY-MM`

200 → array of occurrences in that month:

```jsonc
{
  "subscription_id": 123,
  "description": "Amazon Prime",
  "amount": 19.9,
  "currency": { "id": 1, "code": "BRL", … },
  "category": { … },
  "day": 6,
  "date": "2026-08-06T00:00:00.000Z",
  "recurrence_period": "MONTHLY",
  "is_paid": false
}
```

- `is_paid`: child with `parentTransactionId = subscription_id` and
  `transactionDate` inside the month exists.
- 400 for malformed `month`.

### 3.4 Mutations (existing endpoint)

`PATCH /transaction/edit` with `{ transaction_id, … }`:

| Action | Payload |
|---|---|
| Edit payment details | `{ transaction_id, amount, transaction_date, recurrence_interval, recurrence_period }` |
| Not a subscription | `{ transaction_id, is_subscription: false }` |
| Hide / unhide | `{ transaction_id, hide_from_subscription_list: true\|false }` |

Backend change (AC4.2): when `transaction_date` is provided and the target is
a recurring parent, recompute `nextOccurrenceAt` from the new date + effective
interval/period.

## 4. Recurrence Math (subscription.service.ts)

Anchor = `nextOccurrenceAt ?? transactionDate` (both are occurrence dates).

| period | day | occurrence in month M | interval |
|---|---|---|---|
| MONTHLY | anchor day | M's anchor-day (clamped to M's last day) | `monthsBetween(anchorMonth, M) % interval === 0` |
| YEARLY | anchor day | only when M == anchor month | `yearsBetween(anchorYear, M.year) % interval === 0` |

Last payment: latest child `transactionDate`, else parent `transactionDate`.
Next payment: `nextOccurrenceAt` if future; else
`calculateNextOccurrence(lastPayment, interval, period)`.

## 5. Frontend Structure

### 5.1 Screens & routes

| Screen | Route | Key contents |
|---|---|---|
| `Subscriptions` (T1) | `/options/subscriptions` | Header (back/title/+), section header + ?, FlatList, fixed footer, RegisterTransaction modal, help sheet |
| `SubscriptionDetails` (T3/4) | `/options/subscriptionDetails?id=` | Close header, payment rows, collapsible sections, edit sheet, classification actions |
| `SubscriptionPayments` (T5/6) | `/options/subscriptionPayments?month=` | Close header + ?, period row + sheet, totals, payments list, help sheet |

### 5.2 Components

- `SubscriptionListItem` — avatar circle (category icon + color; fallback first
  letter), name, frequency line, amount, chevron.
- `SubscriptionPaymentListItem` — same avatar, date label, amount, status icon
  (Clock/CheckCircle), DotsThree.
- `SubscriptionHelpSheet` — shared bottom-sheet content (T2) + "Entendi".
- Period radio list inside `ModalViewSelection` (T6) reusing `ListItem`.

### 5.3 State & data flow

- Server state: TanStack Query (`useSubscriptionsQuery`,
  `useSubscriptionDetailQuery`, `useSubscriptionPaymentsQuery`,
  `useUpdateSubscriptionMutation`).
- BRL totals: `subscriptionPaymentsSummary` utils + `useQuotes` (pattern from
  `processAccountsForList`).
- Editing/hide/un-classify → `useUpdateSubscriptionMutation` → invalidations →
  refetch; "Não é uma assinatura" navigates back after success.

### 5.4 Currency/totals

Items display native currency (`formatCurrency(currency.code, amount)`).
Totals (T1 footer, T5) BRL-converted via `convertCurrency`; unsupported
currency pairs are skipped per-item with try/catch (never crash).

## 6. Testing Strategy

- **Backend** (node:test, `yarn test:unit`):
  - `subscription.schema.test.ts` — payments query + id param validation.
  - `subscription.service.test.ts` — AC6.x math (anchor/day/last/next/
    occurrence modulo + clamping, DTO shape).
  - Extend `transaction.schema.test.ts` — flags pass through schemas.
- **Frontend** (jest-expo, `yarn test`):
  - `formatSubscriptionDate`, `buildSubscriptionPeriodOptions`,
    `subscriptionDisplay`, `subscriptionPaymentsSummary` — AC8–10, spec-anchored
    (assert spec-defined strings/sums, not implementation internals).
  - Screen-level tests skipped: pre-existing `phosphor-react-native` transform
    failure blocks render tests (STATE.md #13/#14).
- Type checks via diagnostics per changed file.

## 7. Execution Plan

15 tasks in 3 phase-batches (see `tasks.md`):

1. **Backend** T1–T5 (schema → schemas+flags → create → update → service+endpoints).
2. **Frontend data layer** T6–T9 (interfaces/utils/hooks).
3. **Frontend UI** T10–T14 + docs T15.
