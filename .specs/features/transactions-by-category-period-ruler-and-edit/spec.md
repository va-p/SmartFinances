# TransactionsByCategory — PeriodRuler + transaction edit modal

## Goal

Standardize period navigation on `src/screens/TransactionsByCategory/index.tsx`
with the shared `PeriodRuler` (as on Home/Account) and allow viewing/editing a
transaction by tapping its card (modal with `RegisterTransaction`, as on Home).

## Requirements

- **FR-001** — Replace the `MonthSelect`/`MonthSelectButton` arrows with the
  shared `PeriodRuler` component.
- **FR-002** — Tapping a transaction card opens `RegisterTransaction` in a
  bottom-sheet modal in view/edit mode.
- **FR-003** — Home/Account keep working after the shared-code promotion
  (regression-free).

## Acceptance criteria

- **AC-001.1** — With period `months` (and `all`), the ruler shows the 12
  months of the selected year, newest-first (Dez → Jan), with the selected
  month highlighted.
- **AC-001.2** — With period `years`, the ruler shows the years in which this
  category has transactions (sparse set, newest-first) plus the selected year
  (always included), with the selected year highlighted.
- **AC-001.3** — Prev/Next arrows move one month in `months`/`all`, one year in
  `years`.
- **AC-001.4** — Tapping a ruler item jumps to that month/year (last-day
  semantics, same as Home's `useDateNavigation`).
- **AC-001.5** — The screen's `MonthSelect`, `Month`, `MonthSelectButton`
  styles and their usages are removed.
- **AC-001.6** — *(pending gray-area decision D1)* A period selector modal
  (`ChartPeriodSelect`) switches between `months`/`years`/`all`.
- **AC-002.1** — Tapping a card sets the transaction id and presents
  `ModalViewWithoutHeader` (snap point `100%`) containing `RegisterTransaction`
  with `id`, `resetId`, `closeRegisterTransaction`.
- **AC-002.2** — The form loads the tapped transaction (existing
  `useTransactionDetailQuery`).
- **AC-002.3** — After edit/delete, the list refreshes via the existing
  `['transactions']` query invalidation in the mutation hooks.
- **AC-002.4** — Closing the modal clears the id and dismisses the sheet.
- **AC-002.5** — *(pending gray-area decision D3)* No bulk-selection behavior
  on this screen.
- **AC-002.6** — Dismissing the edit sheet via app-internal close clears the id
  and dismisses (backdrop-swipe dismissal keeping the id is the same behavior
  as Home — accepted).

## Design (inline)

- Promote `useDateNavigation` from `src/screens/Home/hooks/` to
  `@hooks/useDateNavigation` (Home keeps using it via the new path).
- Extract the ruler dates builder into `src/utils/buildPeriodRulerDates`
  (avoids a third inline copy of the months/years logic). Home/Account
  migration to it is an optional follow-up (out of scope here).
- Modal wiring follows Home's pattern without the selection-mode branch:
  local `transactionId` state + `registerTransactionBottomSheetRef` +
  `ModalViewWithoutHeader`.
- Column width: `(SCREEN_WIDTH - 32) / 6`, `horizontalPadding={0}` — the
  screen's `Container` already provides the 16px horizontal padding.
- `useDateNavigation` treats `all` like `months` (the ruler shows month labels
  for `all`), so arrows and taps work in every period.

## Out of scope

- Migrating Home/Account dates builders to the new util.
- Bulk edit / long-press selection on this screen.
- PeriodRuler behavior changes (scrolling, styling).
