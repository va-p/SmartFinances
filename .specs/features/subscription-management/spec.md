# Subscription Management — Spec

**Status:** In progress
**Date:** 2026-08-22
**Scope:** Large (backend + frontend, 6 wireframe screens, 15 atomic tasks)
**Entry point:** OptionsMenu → "Minhas assinaturas" → `/options/subscriptions`

## Summary

Track every subscription automatically identified from the user's recurring
transactions. The feature reuses the existing recurrence infrastructure
(recurring parents + auto-generated children + `nextOccurrenceAt`):

- **Tela 1 — Minhas assinaturas:** list of classified subscriptions + fixed
  "Próximos pagamentos" footer + "+" (create via `RegisterTransaction`) + "?"
  help.
- **Tela 2 — Help sheet:** explains what is classified as a subscription, with
  service-category examples.
- **Tela 3/4 — Subscription details:** last/next payment, collapsible payment
  details with "Editar", and "Exibição na lista" actions ("Não é uma
  assinatura", "Ocultar da lista"/"Exibir na lista").
- **Tela 5 — Próximos pagamentos:** month view of occurrences with paid/pending
  states, BRL totals, and a period selector.
- **Tela 6 — Period bottom sheet:** radio list of months (last 12 → next 12).

Decisions: see `context.md` (AD-033…AD-038).

---

## Requirements

### R1 — Backend: Prisma model — subscription flags on Transaction

Add two boolean columns to `Transaction`.

**Acceptance criteria:**
- AC1.1: `isSubscription Boolean @default(false) @map("is_subscription")`
- AC1.2: `hideFromSubscriptionList Boolean @default(false) @map("hide_from_subscription_list")`
- AC1.3: Migration SQL creates both columns (`NOT NULL DEFAULT false`) and
  backfills `is_subscription = true` for existing rows where `is_recurring =
  true AND parent_transaction_id IS NULL AND recurrence_period IN ('MONTHLY',
  'YEARLY') AND type NOT IN ('TRANSFER_CREDIT','TRANSFER_DEBIT')`.
  (Migrations dir is gitignored by project convention; file is created for
  manual `prisma migrate deploy` on cPanel — see STATE.md #12.)

### R2 — Backend: transaction schemas accept the flags

**Acceptance criteria:**
- AC2.1: `createTransactionSchema` accepts optional `is_subscription`,
  `hide_from_subscription_list` (boolean).
- AC2.2: `updateTransactionSchema` accepts optional `is_subscription`,
  `hide_from_subscription_list` (boolean).
- AC2.3: Schema tests cover both (valid pass; omitted OK — defaults apply).

### R3 — Backend: create — auto-classify + persist flags

**Acceptance criteria:**
- AC3.1: `createTransaction` persists
  `isSubscription = is_subscription ?? (is_recurring && period ∈ {MONTHLY, YEARLY} && type ∉ {TRANSFER_CREDIT, TRANSFER_DEBIT})`
  and `hideFromSubscriptionList = hide_from_subscription_list ?? false`.
- AC3.2: `createTransferTransactions` persists both legs with
  `isSubscription=false` (no auto-classification for transfers).
- AC3.3: Create responses include `is_subscription` and
  `hide_from_subscription_list`.

### R4 — Backend: update — persist flags + recompute next occurrence

**Acceptance criteria:**
- AC4.1: `updateTransaction` conditionally persists `is_subscription` /
  `hide_from_subscription_list` when provided.
- AC4.2: When `transaction_date` is provided for a recurring parent
  (`existingTransaction.isRecurring && !parentTransactionId`),
  `nextOccurrenceAt` is recomputed as
  `calculateNextOccurrence(new Date(transaction_date), interval, period)`
  using effective `recurrence_interval`/`recurrence_period` (provided value or
  existing). Non-recurring transactions are unaffected.
- AC4.3: Update response includes the effective flags.

### R5 — Backend: GET transaction responses include flags

**Acceptance criteria:**
- AC5.1: `getTransactions` formatted items include `is_subscription`,
  `hide_from_subscription_list`.
- AC5.2: `getTransactionById` formatted item includes both.
- AC5.3: `getTransactionsByCategory` formatted items include both.

### R6 — Backend: subscription service (pure computation layer)

New `src/services/subscription.service.ts` — pure functions, unit-testable
without a DB (same pattern as `transaction.service.ts`).

**Acceptance criteria:**
- AC6.1: `getAnchorDate(parent)` = `nextOccurrenceAt ?? transactionDate`.
- AC6.2: `getSubscriptionDay(anchor)` = anchor day-of-month (1–31).
- AC6.3: `getLastPaymentDate(parent, children)` = latest child
  `transactionDate`; fallback parent `transactionDate` when no children.
- AC6.4: `getNextPaymentDate(parent)` = `nextOccurrenceAt` when it is in the
  future; otherwise next occurrence after the last payment computed as
  `calculateNextOccurrence(lastPayment, interval, period)`.
- AC6.5: `getOccurrenceInMonth(anchor, period, interval, monthStart)` returns
  the occurrence `Date` inside that month, or `null`:
  - MONTHLY: only when `monthsBetween(anchorMonth, month) % interval === 0`;
    day = anchor day clamped to the month's last day.
  - YEARLY: only when the month equals the anchor month and
    `yearsBetween(anchorYear, year) % interval === 0`; day = anchor day
    clamped.
  - Non-recurring or missing interval → `null`.
- AC6.6: `formatSubscription(parent, children)` returns the snake_case API DTO
  (id, description, amount, currency, category, recurrence_period,
  recurrence_interval, day, next_payment_at, last_payment_at, is_subscription,
  hide_from_subscription_list).

### R7 — Backend: subscription endpoints

**Acceptance criteria:**
- AC7.1: `GET /api/v1/subscription` (authenticated) returns visible
  subscriptions: `isSubscription=true`, `hideFromSubscriptionList=false`,
  `isRecurring=true`, `parentTransactionId=null`,
  `recurrencePeriod ∈ {MONTHLY, YEARLY}`, ordered by `description` asc. Each
  item matches the R6.6 DTO (with `category: {id, name, icon, color}`).
- AC7.2: `GET /api/v1/subscription/:id` (authenticated) returns one
  subscription by parent transaction id (owned by the user), including flags
  even when hidden/unclassified; 404 when not found/not owned.
- AC7.3: `GET /api/v1/subscription/payments?month=YYYY-MM` (authenticated)
  returns occurrences for the month: for each eligible subscription (same
  filters as AC7.1), `{ subscription_id, description, amount, currency,
  category, day, date, recurrence_period, is_paid }`; `is_paid` = a child
  transaction exists with `parentTransactionId = parent.id` and
  `transactionDate` inside the month; items sorted by `date` asc. Invalid
  `month` format → 400 (Zod).
- AC7.4: Routes registered under `/api/v1/subscription` in `server.ts`;
  `/payments` declared before `/:id`.

### R8 — Frontend: interfaces + subscription date format

**Acceptance criteria:**
- AC8.1: `src/interfaces/subscriptions.ts` exports `SubscriptionProps` (id,
  description, amount, currency, category, recurrence_period,
  recurrence_interval, day, next_payment_at, last_payment_at, is_subscription,
  hide_from_subscription_list) and `SubscriptionPaymentProps`
  (subscription_id, description, amount, currency, category, day, date,
  recurrence_period, is_paid).
- AC8.2: `formatSubscriptionDate('2026-08-06')` → `"06 AGO. 2026"`
  (PT-BR uppercase month abbreviation + trailing dot; day zero-padded).

### R9 — Frontend: period window + display utils

**Acceptance criteria:**
- AC9.1: `buildSubscriptionPeriodOptions(selectedMonthKey: 'YYYY-MM', today)`
  returns last 12 → next 12 months (25 options), ascending, each
  `{ key: 'YYYY-MM', label: 'Agosto 2026', isActive }`; the current month is
  `isActive` when no explicit selection.
- AC9.2: `monthLabel('2026-08')` → `'Agosto 2026'`;
  `subscriptionRecurrenceLabel('MONTHLY')` → `'Mensal'` ('YEARLY' →
  `'Anual'`); `subscriptionFrequencyText(subscription)` → `'Mensal · Dia 6'`.

### R10 — Frontend: payments summary utils (BRL)

**Acceptance criteria:**
- AC10.1: `convertAmountToBRL(amount, currencyCode, quotes)` wraps
  `convertCurrency` (accountCurrency = currencyCode, toCurrency BRL); throws
  for unsupported pairs (callers skip those items rather than crash).
- AC10.2: `getUpcomingPaymentsSummary(subscriptions, quotes, now)` → the
  earliest future month (by `next_payment_at`, months already started count as
  upcoming while any occurrence remains in the future) with
  `{ month: 'YYYY-MM', count, total }` (total = sum of BRL-converted amounts of
  that month's occurrences); `null` when there are no future occurrences.
- AC10.3: `computePaymentsTotal(payments, quotes)` → sum of BRL-converted
  amounts (skips unsupported currencies).

### R11 — Frontend: query/mutation hooks

**Acceptance criteria:**
- AC11.1: `useSubscriptionsQuery` → `GET subscription`, queryKey
  `['subscriptions']`.
- AC11.2: `useSubscriptionDetailQuery(id)` → `GET subscription/${id}`,
  queryKey `['subscription', id]`; disabled when id is empty.
- AC11.3: `useSubscriptionPaymentsQuery(month)` → `GET subscription/payments`
  with `{ params: { month } }`, queryKey `['subscription-payments', month]`.
- AC11.4: `useUpdateSubscriptionMutation` → `PATCH transaction/edit`; on
  success invalidates `['subscriptions']`, `['subscription', id]`,
  `['subscription-payments']`, `['transactions']`, `['accounts']`; on error
  shows an Alert.

### R12 — Frontend: list item components

**Acceptance criteria:**
- AC12.1: `SubscriptionListItem`: circular avatar with category icon + color
  (fallback: first letter of name), name, `'Mensal · Dia 6'` frequency line,
  native-currency amount, chevron; pressable (opens details).
- AC12.2: `SubscriptionPaymentListItem`: same avatar, name, `'6 AGO.'` date,
  native amount, `Clock` icon when pending / `CheckCircle` when paid, `DotsThree`
  trailing icon; pressable (opens subscription details).

### R13 — Frontend: help sheet (Tela 2)

**Acceptance criteria:**
- AC13.1: Bottom sheet (`ModalViewSelection`) with close (X), overlapping
  service icons row, explanation "Acompanhe aqui seus pagamentos classificados
  como \"Assinaturas\"", 4 category rows (Play → streaming, Download → cloud,
  Cart → retail, Monitor → software) with pt-BR examples, and an "Entendi"
  button that dismisses.
- AC13.2: Shared component reused by Tela 1 and Tela 5.

### R14 — Frontend: Subscriptions screen (Tela 1)

**Acceptance criteria:**
- AC14.1: Header: `Header.BackButton`, title "Minhas assinaturas", "+" button
  (right) opening the existing `RegisterTransaction` bottom sheet
  (`ModalViewWithoutHeader`, 100% snap point).
- AC14.2: Section header "Classificadas como assinaturas" with "?" opening the
  help sheet (R13).
- AC14.3: FlatList of `SubscriptionListItem`; tap navigates to
  `/options/subscriptionDetails?id=<id>`.
- AC14.4: Fixed footer button (orange/primary, above the tab bar):
  "Próximos pagamentos" + `"R$ {total} em {count} cobrança(s) prevista(s)"`
  (from R10.2), chevron; navigates to
  `/options/subscriptionPayments?month=<month>`; hidden when there are no
  upcoming payments.
- AC14.5: Empty state: "Nenhuma assinatura identificada…" + hint about
  recurring transactions.
- AC14.6: Subscriptions refetched when the RegisterTransaction sheet closes and
  on screen focus.

### R15 — Frontend: Subscription details screen (Tela 3/4)

**Acceptance criteria:**
- AC15.1: Header: `Header.CloseButton` (back) + subscription name as title.
- AC15.2: "Último pagamento" and "Próximo pagamento" rows with
  `formatSubscriptionDate` values and chevrons (display-only).
- AC15.3: "Detalhes sobre pagamento" section, collapsible (chevron v/^),
  showing valor, recorrência, dia de cobrança, conta; "Editar" opens the edit
  bottom sheet: amount input (native currency), day input (1–31, clamped to
  month length), recurrence pills (Mensal/Anual), "Salvar" → `PATCH
  transaction/edit` with `transaction_id`, `amount`, `transaction_date`
  (occurrence month base + new day), `recurrence_interval`, `recurrence_period`
  → refetch detail.
- AC15.4: "Exibição na lista" section: red `Lock` row "Não é uma assinatura"
  (confirm Alert → `is_subscription: false` → navigate back); `EyeSlash`/`Eye`
  row toggling "Ocultar da lista"/"Exibir na lista" via
  `hide_from_subscription_list`.
- AC15.5: Hidden state: after hiding, the row switches to "Exibir na lista"
  (undo available while on the screen).

### R16 — Frontend: Subscription payments screen (Tela 5/6)

**Acceptance criteria:**
- AC16.1: Header: `Header.CloseButton`, title "Próximos pagamentos", "?"
  opening the help sheet (R13).
- AC16.2: "Período" row showing the current month label with a chevron →
  `ModalViewSelection` "Selecione o período" with the R9.1 radio list; selecting
  a month refetches payments.
- AC16.3: "Total" row with BRL total (R10.3).
- AC16.4: Section header "Previstos" (current/future month) or "Tá pago!"
  (past month) + BRL total of that section.
- AC16.5: FlatList of `SubscriptionPaymentListItem` (paid → check icon,
  pending → clock icon); tap → subscription details.
- AC16.6: Empty state: "Nenhum pagamento previsto neste período."

### R17 — Routing + entry point

**Acceptance criteria:**
- AC17.1: New route files `subscriptions.tsx`, `subscriptionDetails.tsx`,
  `subscriptionPayments.tsx` under `src/app/(app)/options/`, each registered as
  a `Stack.Screen` in `options/_layout.tsx`.
- AC17.2: OptionsMenu gains a "Minhas assinaturas" `SelectButton` (placed after
  "Assinatura Premium") navigating to `/options/subscriptions`.

---

## Non-Requirements (out of scope)

- No standalone `Subscription` table (existing Prisma scaffold unused).
- No brand-logo service (avatar = category icon/color).
- No dedicated "create subscription" form (reuses `RegisterTransaction`).
- No unhide list/screen beyond the in-session "Exibir na lista" undo.
- No push notifications, no recurring-engine changes.
- No UI for re-classifying hidden items once the details screen is left.

---

## Affected Files

| File | Change |
|------|--------|
| **Backend** | |
| `smart-finances-backend/prisma/schema.prisma` | +2 boolean columns on Transaction |
| `smart-finances-backend/prisma/migrations/20260822000000_add_subscription_flags/migration.sql` | New (gitignored by convention) |
| `smart-finances-backend/src/schemas/transaction.schema.ts` | +flags on create/update |
| `smart-finances-backend/src/schemas/subscription.schema.ts` | New (id param + payments query) |
| `smart-finances-backend/src/services/subscription.service.ts` | New (pure computation layer) |
| `smart-finances-backend/src/controllers/transaction.controller.ts` | Persist flags; recompute nextOccurrenceAt on update; GET responses |
| `smart-finances-backend/src/controllers/subscription.controller.ts` | New |
| `smart-finances-backend/src/routes/subscription.routes.ts` | New |
| `smart-finances-backend/src/server.ts` | Register subscription routes |
| `smart-finances-backend/src/__tests__/subscription.schema.test.ts` | New |
| `smart-finances-backend/src/__tests__/subscription.service.test.ts` | New |
| **Frontend** | |
| `SmartFinances/src/interfaces/subscriptions.ts` | New |
| `SmartFinances/src/utils/formatSubscriptionDate.ts` (+test) | New |
| `SmartFinances/src/utils/buildSubscriptionPeriodOptions.ts` (+test) | New |
| `SmartFinances/src/utils/subscriptionDisplay.ts` (+test) | New |
| `SmartFinances/src/utils/subscriptionPaymentsSummary.ts` (+test) | New |
| `SmartFinances/src/hooks/useSubscriptionsQuery.ts` | New |
| `SmartFinances/src/hooks/useSubscriptionDetailQuery.ts` | New |
| `SmartFinances/src/hooks/useSubscriptionPaymentsQuery.ts` | New |
| `SmartFinances/src/hooks/useSubscriptionMutations.ts` | New |
| `SmartFinances/src/components/SubscriptionListItem/*` | New |
| `SmartFinances/src/components/SubscriptionPaymentListItem/*` | New |
| `SmartFinances/src/components/SubscriptionHelpSheet/*` | New |
| `SmartFinances/src/screens/Subscriptions/*` | New (Tela 1) |
| `SmartFinances/src/screens/SubscriptionDetails/*` | New (Tela 3/4) |
| `SmartFinances/src/screens/SubscriptionPayments/*` | New (Tela 5/6) |
| `SmartFinances/src/app/(app)/options/{subscriptions,subscriptionDetails,subscriptionPayments}.tsx` | New routes |
| `SmartFinances/src/app/(app)/options/_layout.tsx` | Register screens |
| `SmartFinances/src/screens/OptionsMenu/index.tsx` | "Minhas assinaturas" entry |

## Total Tasks Estimate

15 atomic tasks: backend (5) + frontend data layer (4) + frontend UI (5) + docs (1).
