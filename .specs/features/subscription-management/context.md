# Subscription Management — Context & Decisions

**Date:** 2026-08-22
**Status:** Decisions confirmed by user (all GA items)

---

## Gray Areas Resolved (user-confirmed)

| # | Gray area | Decision (confirmed) |
|---|---|---|
| GA-1 | Data model | **Option A — Flags on Transaction.** Subscriptions are recurring parents (`isRecurring=true`, `parentTransactionId=null`). New columns `is_subscription` + `hide_from_subscription_list`. The unconnected `Subscription` Prisma scaffold is NOT used. |
| GA-2 | Auto-classification | Any recurring parent with `recurrencePeriod ∈ {MONTHLY, YEARLY}` defaults to `is_subscription=true`. DAILY/WEEKLY excluded. **Refinement (flagged in spec):** recurring transfer legs (`TRANSFER_CREDIT`/`TRANSFER_DEBIT`) are internal movements, not service payments → excluded from auto-classification. User can un-classify via "Não é uma assinatura". |
| GA-3 | "+" button (Tela 1) | Opens the existing `RegisterTransaction` bottom sheet (already has the "Recorrente" selector). A new monthly/yearly recurring transaction auto-appears as a subscription. No new create form. |
| GA-4 | Service logos | Circular avatar with the transaction **category icon + color**; fallback = first letter of the name. No network-based brand-logo service. |
| GA-5 | "Editar" (Tela 3/4) | Small edit bottom sheet: amount + due day (1–31) + recurrence (Mensal/Anual). Persisted via existing `PATCH /transaction/edit` on the parent. "Último/Próximo pagamento" rows are display-only. |
| GA-6 | Period selector (Tela 6) | Fixed window **last 12 months → next 12 months** (from today), default current month, ascending radio list in a `ModalViewSelection` bottom sheet. |
| GA-7 | "Tá pago!" (Tela 5) | Past month → label "Tá pago!" + check icons; current/future → "Previstos" + clock icons. Paid = child transaction exists in that month. |
| GA-8 | "Ocultar da lista" | Hidden subscriptions disappear from BOTH Tela 1 and Tela 5. Underlying transaction untouched. **Refinement:** the details screen row toggles to "Exibir na lista" after hiding (in-session undo) so the user is never permanently locked out from the UI. |
| GA-9 | Footer "Próximos pagamentos" (Tela 1) | Aggregates the **next upcoming month's** occurrences: BRL-converted total + count ("R$ 79,80 em 2 cobranças previstas"). Tap → Tela 5 with that month selected. |
| GA-10 | Totals currency | Totals BRL-converted client-side via existing `convertCurrency` + quotes store; list items show native currency. |

---

## Decision Log

| ID | Decision | Rationale |
|---|---|---|
| AD-033 | Subscriptions = recurring parents with two new boolean flags on `transactions` (`is_subscription`, `hide_from_subscription_list`) | Single source of truth; always in sync with the recurrence engine; no drift/duplication. Roadmap: "automatic identification based on transactions". |
| AD-034 | Auto-classification rule: `is_recurring && parent==null && period ∈ {MONTHLY, YEARLY} && type ∉ {TRANSFER_CREDIT, TRANSFER_DEBIT}` → `is_subscription=true` at creation | Subscriptions are periodic *payments* for services; transfers are internal movements. Escape hatch exists in the UI. |
| AD-035 | Backend computes month occurrences and paid status (`GET /subscription/payments?month=YYYY-MM`) | The backend owns child-transaction data; paid status cannot be derived client-side without it. |
| AD-036 | BRL conversion of totals stays client-side (quotes store + `convertCurrency`) | Follows the existing `processAccountsForList` pattern; backend stays currency-agnostic. |
| AD-037 | Detail navigation by id; hidden rows only reachable before leaving the details screen | In-session undo ("Exibir na lista") avoids a permanent UI lock-out; no separate unhide screen in this iteration. |
| AD-038 | Payment row `⋮` opens the same subscription detail as row tap | The wireframe doesn't define menu actions; avoids inventing an undefined menu. |
