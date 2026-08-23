# Subscription Management — Validation Report

**Date:** 2026-08-22
**Verifier:** Independent validation pass (standalone fallback — sub-agent
dispatch unavailable this session: model API returned 402; the skill's
`scripts/lessons.py` is also not installed in this environment, so no lesson
distillation was recorded)
**Result:** PASS ✅ (with 5 notes/gaps, none blocking)

## Test Gates (run fresh by verifier)

| Gate | Command | Result |
|---|---|---|
| Backend unit | `cd smart-finances-backend && yarn test:unit` | **78/78 pass** |
| Backend types | `yarn build` (tsc) | clean |
| Frontend feature tests | `yarn jest src/utils/__tests__ src/hooks/__tests__` | **107/107 pass** (14 suites) |
| Frontend full suite | `yarn jest` | 17/18 suites; **only failure is the pre-existing** `src/__tests__/screens/profile.spec.tsx` (phosphor transform failure at suite load — documented STATE.md #13/#14, unrelated to this feature) |

## Per-AC Evidence (spec-anchored)

### Backend (R1–R7)

| AC | Spec expectation | Evidence | Match |
|---|---|---|---|
| AC1.1–1.2 | `isSubscription` / `hideFromSubscriptionList` booleans, snake_case mapped | `prisma/schema.prisma` Transaction model (`@default(false)`, `@map("is_subscription")`, `@map("hide_from_subscription_list")`) | ✅ |
| AC1.3 | Migration SQL: columns + backfill (recurring parents, MONTHLY/YEARLY, non-transfer) | `prisma/migrations/20260822000000_add_subscription_flags/migration.sql` exists on disk (migrations dir gitignored by convention); backfill WHERE clause matches spec | ✅ |
| AC2.1–2.3 | Flags optional on create/update schemas + tests | `schemas/transaction.schema.ts`; 5 new tests in `transaction.schema.test.ts` (AC2.1 ×3, AC2.2 ×2) — all pass | ✅ |
| AC3.1–3.3 | Auto-classify on create (recurring + MONTHLY/YEARLY + non-transfer); response includes flags | `transaction.controller.ts` create: `isSubscription: is_subscription ?? (Boolean(is_recurring) && (period MONTHLY/YEARLY) && type not transfer)`, `hideFromSubscriptionList: … ?? false`; response L389-391 | ✅ |
| AC3.2 | Transfer legs never auto-classified | `services/transaction.service.ts` `recurrenceData` adds `isSubscription: false, hideFromSubscriptionList: false` for both legs | ✅ |
| AC4.1–4.3 | Update persists flags; recomputes `nextOccurrenceAt` when `transaction_date` changes on recurring parents; response includes effective flags | `transaction.controller.ts` updateData flags + recompute block (guarded by `isRecurring && !parentTransactionId` + effective interval/period) + response fallbacks | ✅ |
| AC5.1–5.3 | Flags in all three GET transaction responses | `getTransactions`, `getTransactionById`, `getTransactionsByCategory` formatted items | ✅ |
| AC6.1–6.6 | Pure service: anchor/day/last/next/occurrence (modulo + clamping)/DTO | `services/subscription.service.ts`; 16 tests in `subscription.service.test.ts` — all pass | ✅ |
| AC7.1 | GET /subscription: visible filters + description asc + DTO | `subscription.controller.ts` `subscriptionWhere` (isSubscription, hide=false, isRecurring, parent=null, period in [MONTHLY, YEARLY]), `orderBy: description asc` | ✅ |
| AC7.2 | GET /subscription/:id owned + includes hidden rows; 404 | controller findFirst (owned, recurring parent) → `AppError 404` | ✅ |
| AC7.3 | GET /subscription/payments?month=YYYY-MM: occurrences, `is_paid` (child in month OR parent as first occurrence), date asc, 400 on bad month | controller + `subscription.schema.ts` (regex + tests); `/payments` declared before `/:id` | ✅ |
| AC7.4 | Routes registered | `server.ts` `app.use("/api/v1/subscription", subscriptionRoutes)` | ✅ |

### Frontend (R8–R17)

| AC | Spec expectation | Evidence | Match |
|---|---|---|---|
| AC8.1–8.2 | Interfaces + "06 AGO. 2026" format | `interfaces/subscriptions.ts` matches backend DTO 1:1 (verified field-by-field); `formatSubscriptionDate.ts` + 4 tests | ✅ |
| AC9.1–9.2 | 25-month window asc + labels + recurrence text | `buildSubscriptionPeriodOptions.ts` (4 tests), `subscriptionDisplay.ts` (5 tests) | ✅ |
| AC10.1–10.3 | BRL conversion/summary (79.80 example asserted) | `subscriptionPaymentsSummary.ts` + 12 tests (incl. wireframe example 19.90+59.90=79.80, 2 cobranças) | ✅ |
| AC11.1–11.4 | Query hooks + mutation invalidations | `useSubscriptionsQuery`, `useSubscriptionDetailQuery` (enabled guard), `useSubscriptionPaymentsQuery`, `useSubscriptionMutations` (invalidates subscriptions/subscription:id/subscription-payments/transactions/accounts; Alert on error) | ✅ |
| AC12.1–12.2 | List items: avatar (icon/color, letter fallback), frequency/date lines, amounts, chevron/status/⋮ | `SubscriptionAvatar`, `SubscriptionListItem`, `SubscriptionPaymentListItem` | ✅ |
| AC13.1–13.2 | Help sheet content + shared reuse | `SubscriptionHelpSheet` (4 category rows + Entendi); used by `Subscriptions` and `SubscriptionPayments` | ✅ |
| AC14.1–14.6 | Tela 1: header/+→RegisterTransaction sheet, section header + ?, list→detail, footer (hidden when none), empty state, refetch on close/focus | `screens/Subscriptions/index.tsx` | ✅ |
| AC15.1–15.5 | Tela 3/4: close header, payment rows, collapsible sections + edit sheet (amount/day/period, clamp), red "Não é uma assinatura" (confirm), hide/unhide toggle | `screens/SubscriptionDetails/index.tsx` | ✅ |
| AC16.1–16.6 | Tela 5/6: header + ?, period row + radio sheet (25 options), Total, "Previstos"/"Tá pago!", paid/pending icons, empty state | `screens/SubscriptionPayments/index.tsx` | ✅ |
| AC17.1 | 3 routes registered | `app/(app)/options/{subscriptions,subscriptionDetails,subscriptionPayments}.tsx` + `_layout.tsx` Stack.Screen entries | ✅ |
| AC17.2 | OptionsMenu entry | Entry exists — **but positioned after "Etiquetas", not after "Assinatura Premium"** (user-authored reposition, staged between sessions). See G1. | ⚠️ |

## Discrimination Sensor (behavior-level mutants, scratch state)

Each mutant: backup → inject fault → run targeted test → expect FAIL → restore → confirm PASS + clean tree.

| # | Mutant | Target test | Killed? |
|---|---|---|---|
| M1 | Backend `getOccurrenceInMonth`: monthly modulo `!== 0` → `=== 0` | `subscription.service.test.ts` | ✅ KILLED (3 failures) → restore 16/16 |
| M2 | Frontend `formatSubscriptionDate`: uppercase → lowercase month | `formatSubscriptionDate.test.ts` | ✅ KILLED (4 failures) → restore 4/4 |
| M3 | Frontend `getUpcomingPaymentsSummary`: earliest month `.sort()[0]` → `.at(-1)` | `subscriptionPaymentsSummary.test.ts` | ✅ KILLED (1 failure) → restore 12/12 |
| M4 | Frontend `buildSubscriptionPeriodOptions`: window `<= 12` → `<= 11` | `buildSubscriptionPeriodOptions.test.ts` | ✅ KILLED (1 failure) → restore 4/4 |

**Result: 4/4 mutants killed.** No surviving mutants.

## Ranked Gaps

| # | Severity | Gap | Disposition |
|---|---|---|---|
| G1 | Low (user decision) | AC17.2 position: "Minhas assinaturas" moved from after "Assinatura Premium" to after "Etiquetas" (user-staged change) | Accepted user change; spec wording should be updated on next spec pass |
| G2 | Low (found + fixed during verification) | `SubscriptionPayments` crashed when opened without `month` param (`monthLabel(undefined)`) | **Fixed**: falls back to current month key (`month ?? monthKey(new Date())`); diagnostics clean |
| G3 | Precision note | `SubscriptionProps.recurrence_period` typed `MONTHLY\|YEARLY\|null`, but the detail endpoint could return DAILY/WEEKLY if a user edits recurrence to those periods | Harmless: `subscriptionRecurrenceLabel` returns '' for those; consider widening the union later |
| G4 | Precision note | `is_paid` month comparison uses local-time bounds; a child at month-boundary UTC midnight can land on the previous local day | Consistent with the app-wide local/UTC looseness (e.g. `formatDatePtBr`); not addressed in this feature |
| G5 | Open (pre-existing infra) | No screen-level render tests (phosphor transform blocker, STATE.md #13/#14); wiring of screen handlers untested — same class as Known Issue #14 | Follow-up when screen-test infra is fixed |

## Verdict

**PASS** ✅ — All requirements R1–R17 implemented; 78 backend + 107 feature-frontend tests pass; discrimination sensor 4/4; cross-repo DTO contract verified field-by-field; no surviving mutants. Remaining items are one accepted user deviation (G1), one fixed gap (G2), and precision/infra notes (G3–G5).

## Diff Range

- Backend: `57e83ab` → `5db6e39` (T1–T5)
- Frontend: `5ab8cbe` → `a61f197` (T6–T15), plus closing commits for the spec docs, the user's menu reposition, and the G2 fix.
