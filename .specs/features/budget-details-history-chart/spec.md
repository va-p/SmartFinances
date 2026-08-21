# BudgetDetails — Budget History Bar Chart

## Overview

Add a bar chart to the `BudgetDetails` screen showing the budget's spending history: one bar per period (from the budget's start through the current in-progress period), plus a dashed horizontal line at the average of the displayed periods. The chart sits between the `PeriodContainer` and the `TransactionsContainer` components and uses `react-native-gifted-charts` (already in the project).

## Context / Decisions

- **D1 — History is computed client-side.** The backend `GET /budget/:id` returns only budget metadata (no period history). All user transactions are already available via `useTransactionsQuery` (TanStack cache, query key `['transactions']` — re-using it on `BudgetDetails` causes no extra fetch). History is derived in a pure util from budget + transactions.
- **D2 — Shared budget math.** The period-stepping and per-transaction amount rules currently live inside `formatBudgetInfo` (`src/utils/budgetCalculations.ts`). They are extracted into reusable helpers so the history util and the existing formatter use identical logic.
- **D3 — Dashed average line.** `BarChart` `showLine` + `lineData` (constant value = average, one entry per bar) + `lineConfig.strokeDashArray` renders a dashed horizontal line spanning all bars (verified against the installed library source: `lineData[i]` x-position maps to bar `i`).
- **D4 — Bar sizing.** ≤12 periods: bars sized to fill the chart width evenly (matches the reference drawing). >12 periods: fixed bar width/spacing + horizontal scroll (`scrollToEnd`), same pattern as the Home screen chart.
- **D5 — Labels.** Each bar is labeled with its period start as pt-BR abbreviated month + 2-digit year, uppercased (e.g. "JUN 26"). For non-monthly recurrences labels may repeat; accepted trade-off for this feature.

## FR-001 — Pure budget history utility

Create `src/utils/buildBudgetHistory.ts` exporting a pure function `buildBudgetHistory(budget, transactions, upTo?)` that returns one entry per budget period, chronologically ordered, from the budget start date through the current period.

**Acceptance Criteria:**

- AC-001.1: Return type is `{ startDate: Date; endDate: Date; amountSpent: number }[]`; the last entry is the in-progress period whose `endDate >= upTo` (default `upTo` = now).
- AC-001.2: Period boundaries match the recurrence logic used by `formatBudgetInfo` for `daily`, `weekly`, `biweekly`, `monthly`, `semiannually`, `annually`.
- AC-001.3: Only transactions whose `category.id` is in the budget's categories and whose `created_at` falls within the period's `[startDate, endDate]` contribute to that period.
- AC-001.4: Amount rules are identical to `formatBudgetInfo`: transfers (`TRANSFER_CREDIT`/`TRANSFER_DEBIT`) contribute 0; foreign-currency transactions use `amount_in_account_currency`; credit-card accounts add the amount, other accounts subtract it.
- AC-001.5: The util is pure — no React imports, no side effects, no mutation of inputs.

## FR-002 — Extract shared helpers without behavior change

Extract the period-stepping and per-transaction amount logic from `formatBudgetInfo` into exported helpers in `src/utils/budgetCalculations.ts`.

**Acceptance Criteria:**

- AC-002.1: `getBudgetPeriods(budget, upTo?)` returns the same period boundaries `formatBudgetInfo` computes today (first period from `start_date` stepped by recurrence until `endDate >= upTo`).
- AC-002.2: `getTransactionSpentAmount(transaction)` returns the exact signed contribution `formatBudgetInfo` adds to `amount_spent` today.
- AC-002.3: `formatBudgetInfo` keeps producing identical results (same current period bounds and `amount_spent`) after the refactor — pinned by regression tests.

## FR-003 — Chart on BudgetDetails

Render a `BudgetHistoryChart` component between `PeriodContainer` and `TransactionsContainer` on `BudgetDetails`, with a caption legend below the chart.

**Acceptance Criteria:**

- AC-003.1: One bar per period; bar height = the period's `amountSpent`; bars use the theme `primary` color and `roundedTop` (visual parity with Home).
- AC-003.2: A dashed horizontal line is drawn at the mean of the displayed period values, spanning the first to the last bar, with no data points on the line.
- AC-003.3: Bars are labeled with the period start formatted per D5.
- AC-003.4: A caption below the chart explains the legend: filled bar = amount spent in the period; dashed line = average spending of the displayed periods (pt-BR text).
- AC-003.5: The chart section has a `SectionTitle` ("Histórico do orçamento") consistent with the "Transações" section title on the same screen.
- AC-003.6: Chart uses theme colors (`primary` bars, `textPlaceholder` line/axis labels); Y-axis labels are "k"-formatted for values ≥ 1000 (parity with Home).

## FR-004 — Tests derived from acceptance criteria

Unit tests cover the pure logic; chart rendering stays in the component (screen-level render tests are blocked by the known `phosphor-react-native` transform issue, project issue #13).

**Acceptance Criteria:**

- AC-004.1: Tests assert FR-001/FR-002 outcomes (period boundaries per recurrence, period assignment, category/transfer/currency/sign rules, average, label formatting, `formatBudgetInfo` regression).
- AC-004.2: Tests never mirror implementation internals — they assert spec-defined outcomes (e.g. "period 3 of a monthly budget ends on the last day of March").
