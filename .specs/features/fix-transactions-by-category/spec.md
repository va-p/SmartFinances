# Fix: TransactionsByCategory lists no transactions

## Problem

`src/screens/TransactionsByCategory/index.tsx` renders an empty list. Debug evidence:
`processTransactions` returns `groupedTransactions: []` even though the selected
category has a transaction (`created_at: 2026-08-18T18:43:44.447Z`) inside the
selected period (`months`, selectedDate `2026-08-18T21:48:33.669Z`).

## Root cause

`processTransactions` parses `created_at` with
`parse(created_at, 'dd/MM/yyyy', new Date())`. Home and Account pre-format
`created_at` to `dd/MM/yyyy` in inline mappers before calling it.
TransactionsByCategory passes **raw API items** whose `created_at` is ISO 8601
(`2026-08-18T18:43:44.447Z`) → `parse` yields Invalid Date → `isValid` fails →
every transaction is filtered out.

Secondary defect: the screen also passes raw `amount_formatted` (API returns a
number, e.g. `-50`) to `TransactionListItem`, which renders it verbatim instead
of formatted currency. Home/Account avoid this via the same inline mappers.

Third cause (found during verification): the screen read `route.params?.id`
while its route is `/overview/[categoryId]`, so `categoryID` was `undefined`
and the category filter returned `[]` even with date parsing fixed. The fix
renames the read to `route.params?.categoryId` (included in commit `cc09f7e`).

## Requirements

- **R1** — TransactionsByCategory lists the selected category's transactions,
  grouped by day, for the selected period.
- **R2** — Listed amounts render formatted in the transaction currency,
  consistent with Home/Account.
- **R3** — `processTransactions` accepts `created_at` as ISO 8601 (raw API) or
  `dd/MM/yyyy` (pre-formatted) — no hidden pre-formatting contract. Grouped day
  titles are always `dd/MM/yyyy`.
- **R4** — Home and Account keep identical output (no behavior change).

## Verification status

PASS — see `validation.md` (independent verifier, 2026-08-18). Known open gap
G1: the screen-level composition (`formatTransactions → processTransactions`)
has no automated coverage; deferred — see Known Issues in
`.specs/project/STATE.md`.

## Out of scope

- Behavior of `processTransactions` beyond date handling (cash flow math,
  sorting semantics).
- Fixing the API returning numeric `amount_formatted`.

## Acceptance criteria

- **AC1** — Given a transaction with ISO `created_at` inside the selected month
  (period `months`), `processTransactions(...).groupedTransactions` contains one
  group titled `dd/MM/yyyy` containing that transaction.
- **AC2** — The same transaction with `dd/MM/yyyy` `created_at` yields the same
  grouping (backward compatibility).
- **AC3** — `formatTransactions` maps ISO `created_at` → `dd/MM/yyyy` and
  formats `amount_formatted` / `amount_in_account_currency_formatted` as pt-BR
  currency strings.
- **AC4** — TransactionsByCategory renders grouped transactions (no empty list),
  and Home/Account mapping output is unchanged.
- **AC5** — TransactionsByCategory reads the route param `categoryId` (matching
  `/overview/[categoryId]`).
