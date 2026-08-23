# Subscription Management — Tasks

**Feature:** subscription-management
**Date:** 2026-08-22
**Total tasks:** 15 (3 phase-batches: backend 5 / frontend-data 4 / frontend-ui+docs 6)

## Dependency Order

```
T1 (Prisma model + migration)
  ├── T2 (transaction schemas + flags) ── T3 (create/update controller + GET responses)
  └── T4 (subscription service + schema + tests)
        └── T5 (subscription controller + routes + server.ts)
              │
T6 (interfaces + formatSubscriptionDate)
  ├── T7 (period window + display utils)
  ├── T8 (payments summary utils — BRL)
  └── T9 (react-query hooks + mutation)      ← depends on backend contract (T5)
        │
T10 (list item components) ← T6/T7
T11 (help sheet)           ← independent UI
T12 (Subscriptions screen + route + OptionsMenu entry) ← T9/T10/T11
T13 (SubscriptionDetails screen + route)     ← T9/T10
T14 (SubscriptionPayments screen + route)    ← T9/T10/T11
T15 (STATE.md + ROADMAP.md update)
```

---

### T1 — Backend: Prisma model + migration SQL

**Files:** `smart-finances-backend/prisma/schema.prisma`,
`smart-finances-backend/prisma/migrations/20260822000000_add_subscription_flags/migration.sql` (new)

**Description:** Add `isSubscription` + `hideFromSubscriptionList` to
`Transaction` (AC1.1–1.2) and the migration SQL with the backfill for existing
recurring parents (AC1.3).

**Verification:** schema review; migration SQL matches AC1.3 (columns +
backfill where clause). `yarn prisma:generate` succeeds.

**Dependencies:** none

---

### T2 — Backend: flags in transaction schemas + tests

**Files:** `smart-finances-backend/src/schemas/transaction.schema.ts`,
`smart-finances-backend/src/__tests__/transaction.schema.test.ts`

**Description:** Optional `is_subscription` / `hide_from_subscription_list`
booleans on create + update schemas (AC2.1–2.2). Add schema tests: flags pass;
omitted OK.

**Verification:** `yarn test:unit` — all schema tests pass (existing + new).

**Dependencies:** T1

---

### T3 — Backend: controller — auto-classify on create, flags on update, GET responses

**File:** `smart-finances-backend/src/controllers/transaction.controller.ts`

**Description:**
- `createTransaction`: persist flags with auto-classification default (AC3.1);
  include in response (AC3.3).
- `createTransferTransactions`: legs with `isSubscription: false` (AC3.2).
- `updateTransaction`: conditional flag persistence (AC4.1) + recompute
  `nextOccurrenceAt` when `transaction_date` provided for a recurring parent
  (AC4.2) + response flags (AC4.3).
- `getTransactions` / `getTransactionById` / `getTransactionsByCategory`:
  include both flags (AC5.1–5.3).

**Verification:** `yarn test:unit` passes; existing transaction tests still
green (regression).

**Dependencies:** T1, T2

---

### T4 — Backend: subscription service + schema + tests

**Files:**
- `smart-finances-backend/src/services/subscription.service.ts` (new)
- `smart-finances-backend/src/schemas/subscription.schema.ts` (new)
- `smart-finances-backend/src/__tests__/subscription.service.test.ts` (new)
- `smart-finances-backend/src/__tests__/subscription.schema.test.ts` (new)

**Description:** Pure functions per AC6.x (`getAnchorDate`, `getSubscriptionDay`,
`getLastPaymentDate`, `getNextPaymentDate`, `getOccurrenceInMonth`,
`formatSubscription`). Zod: `subscriptionIdParamSchema`,
`subscriptionPaymentsQuerySchema` (`month` as `YYYY-MM` regex + range check).
Tests: spec-anchored cases for each function (modulo intervals, clamping,
fallbacks, DTO shape) and schema validation (valid month, invalid rejected).

**Verification:** `yarn test:unit` — new service/schema tests pass.

**Dependencies:** T1 (types), independent of T2/T3

---

### T5 — Backend: subscription controller + routes + registration

**Files:**
- `smart-finances-backend/src/controllers/subscription.controller.ts` (new)
- `smart-finances-backend/src/routes/subscription.routes.ts` (new)
- `smart-finances-backend/src/server.ts`

**Description:** `getSubscriptions` (AC7.1), `getSubscriptionById` (AC7.2),
`getSubscriptionPayments` (AC7.3: occurrences via service +
`is_paid` via children-in-month query). Routes `/`, `/payments` (before
`/:id`), `/:id` — all `authenticate` + `asyncHandler`; register in `server.ts`
(AC7.4).

**Verification:** `yarn test:unit` + `yarn build` (tsc) succeed.

**Dependencies:** T4 (T3 for consistent flags in read model)

---

### T6 — Frontend: interfaces + subscription date format

**Files:**
- `SmartFinances/src/interfaces/subscriptions.ts` (new)
- `SmartFinances/src/utils/formatSubscriptionDate.ts` (new)
- `SmartFinances/src/utils/__tests__/formatSubscriptionDate.test.ts` (new)

**Description:** `SubscriptionProps` + `SubscriptionPaymentProps` (AC8.1);
`formatSubscriptionDate` producing `"06 AGO. 2026"` (AC8.2: zero-padded day,
uppercase PT-BR month abbreviation + dot, 4-digit year; accepts Date or ISO
string).

**Verification:** `yarn test` on the new test file passes.

**Dependencies:** none (backend contract known)

---

### T7 — Frontend: period window + display utils

**Files:**
- `SmartFinances/src/utils/buildSubscriptionPeriodOptions.ts` (new)
- `SmartFinances/src/utils/subscriptionDisplay.ts` (new)
- `SmartFinances/src/utils/__tests__/buildSubscriptionPeriodOptions.test.ts` (new)
- `SmartFinances/src/utils/__tests__/subscriptionDisplay.test.ts` (new)

**Description:** AC9.1 (25 ascending month options, `isActive` on selection/
current month) and AC9.2 (`monthLabel`, `subscriptionRecurrenceLabel`,
`subscriptionFrequencyText`).

**Verification:** `yarn test` on the new test files passes.

**Dependencies:** T6 (types)

---

### T8 — Frontend: payments summary utils (BRL)

**Files:**
- `SmartFinances/src/utils/subscriptionPaymentsSummary.ts` (new)
- `SmartFinances/src/utils/__tests__/subscriptionPaymentsSummary.test.ts` (new)

**Description:** AC10.1 `convertAmountToBRL`; AC10.2
`getUpcomingPaymentsSummary` (earliest upcoming month from `next_payment_at`,
count + BRL total, `null` when none); AC10.3 `computePaymentsTotal`.
Unsupported currency pairs are skipped, never thrown.

**Verification:** `yarn test` on the new test file passes (spec values
asserted: e.g. 19.90 + 59.90 → 79.80).

**Dependencies:** T6 (types)

---

### T9 — Frontend: react-query hooks

**Files:**
- `SmartFinances/src/hooks/useSubscriptionsQuery.ts` (new)
- `SmartFinances/src/hooks/useSubscriptionDetailQuery.ts` (new)
- `SmartFinances/src/hooks/useSubscriptionPaymentsQuery.ts` (new)
- `SmartFinances/src/hooks/useSubscriptionMutations.ts` (new)

**Description:** AC11.1–11.4 (query keys, disabled-when-empty detail query,
month param, PATCH mutation with invalidations + Alert on error).

**Verification:** `yarn test` (existing suite unaffected) + diagnostics clean
on new files.

**Dependencies:** T5 (contract), T6 (types)

---

### T10 — Frontend: list item components

**Files:**
- `SmartFinances/src/components/SubscriptionListItem/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/components/SubscriptionPaymentListItem/index.tsx` + `styles.ts` (new)

**Description:** AC12.1/AC12.2. Avatar circle (category icon + color, first-
letter fallback), frequency/date lines, native-currency amounts, chevron /
status icon / DotsThree, pressable.

**Verification:** diagnostics clean; visual consistency with `AccountListItem`.

**Dependencies:** T6/T7 (types + display utils)

---

### T11 — Frontend: help sheet (Tela 2)

**Files:** `SmartFinances/src/components/SubscriptionHelpSheet/index.tsx` +
`styles.ts` (new)

**Description:** AC13.1 content (overlapping icons, explanation, 4 category
rows with phosphor icons: Play, Download, ShoppingCart, Monitor; pt-BR
examples) + "Entendi" dismiss; reusable wrapper `ModalViewSelection` (AC13.2).

**Verification:** diagnostics clean; shared component used by T12 and T14.

**Dependencies:** none

---

### T12 — Frontend: Subscriptions screen (Tela 1) + route + entry point

**Files:**
- `SmartFinances/src/screens/Subscriptions/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/app/(app)/options/subscriptions.tsx` (new)
- `SmartFinances/src/app/(app)/options/_layout.tsx`
- `SmartFinances/src/screens/OptionsMenu/index.tsx`

**Description:** AC14.1–14.6 (header + "+" → RegisterTransaction sheet, section
header + ?, FlatList, fixed footer with upcoming summary → payments route,
empty state, refetch on sheet close/focus). Route registration (AC17.1) and
OptionsMenu "Minhas assinaturas" entry after "Assinatura Premium" (AC17.2).

**Verification:** diagnostics clean; jest utils suite still green; manual
route list shows the 3 new screens.

**Dependencies:** T9, T10, T11

---

### T13 — Frontend: SubscriptionDetails screen (Tela 3/4) + route

**Files:**
- `SmartFinances/src/screens/SubscriptionDetails/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/app/(app)/options/subscriptionDetails.tsx` (new)
- `SmartFinances/src/app/(app)/options/_layout.tsx`

**Description:** AC15.1–15.5: close header + name; last/next payment rows;
collapsible payment details with edit sheet (amount, day 1–31 clamped,
Mensal/Anual pills, Salvar → PATCH + refetch); "Exibição na lista" section
(red "Não é uma assinatura" with confirm, "Ocultar/Exibir na lista" toggle).

**Verification:** diagnostics clean.

**Dependencies:** T9, T10

---

### T14 — Frontend: SubscriptionPayments screen (Tela 5/6) + route

**Files:**
- `SmartFinances/src/screens/SubscriptionPayments/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/app/(app)/options/subscriptionPayments.tsx` (new)
- `SmartFinances/src/app/(app)/options/_layout.tsx`

**Description:** AC16.1–16.6: header + ?; "Período" row + radio bottom sheet
(T6) with refetch; "Total" BRL row; "Previstos"/"Tá pago!" section; payments
list with status icons; empty state.

**Verification:** diagnostics clean.

**Dependencies:** T9, T10, T11

---

### T15 — Docs: STATE.md + ROADMAP.md

**Files:**
- `SmartFinances/.specs/project/STATE.md`
- `SmartFinances/.specs/project/ROADMAP.md`

**Description:** Add AD-033…AD-038 to Decisions; note the unapplied migration
(Known Issues, cPanel deploy step); mark "Subscription management" implemented
in the roadmap.

**Verification:** docs consistent with implementation.

**Dependencies:** T14

---

## Execution Order (phase-batches)

```
Batch 1 (backend):        T1 → T2 → T3 → T4 → T5   (5 tasks)
Batch 2 (frontend data):  T6 → T7 → T8 → T9        (4 tasks)
Batch 3 (frontend UI):    T10 → T11 → T12 → T13 → T14 → T15  (6 tasks)
```

Each task: implement → gate (tests) → one atomic commit on
`feat/subscription-management` (per repo). After T15: independent Verifier
(fresh agent, author ≠ verifier) → `validation.md`.
