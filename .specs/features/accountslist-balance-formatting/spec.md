# AccountsList Balance Formatting

## Summary

Account balances inside `AccountListItem` cards on the **AccountsList** screen ("Contas Manuais") are rendered raw (e.g. `1234.5`). Format them according to the account's currency, matching the pattern already used by the Accounts and InstitutionDetails screens.

## Requirements

### R1 — Balance formatted in the account's currency
Each list item shows the account balance formatted with `formatCurrency(account.currency.code, Number(account.balance), false)` — e.g. `R$ 1.234,50` for BRL, `US$ 100,00` for USD, BTC with 8 decimal places.

### R2 — BRL-converted secondary line for non-BRL accounts
For accounts whose currency is not BRL, a secondary line shows the converted BRL value via `convertCurrency({ ... })` (quotes from `useQuotes`), formatted with `formatCurrency('BRL', converted, false)`. BRL accounts show no secondary line. This mirrors `Accounts/index.tsx` (`totalAccountAmountConverted`).

### R3 — Processing stays at the screen/util level, not in the shared component
`AccountListItem` is shared with the Accounts and InstitutionDetails screens, which pass pre-formatted `balance` strings. Formatting is therefore applied in a pure processing function (new `src/utils/processAccountsForList.ts`), keeping `AccountListItem` untouched so existing screens are unaffected.

### R4 — Raw numeric balance preserved for later consumers
The processed item keeps a numeric `rawBalance` field (`Number(account.balance)`) alongside the formatted `balance` string, so downstream features (e.g. sorting) have a numeric value to compare.

## Non-Requirements

- `hideAmount` behavior: AccountsList does not currently expose hide-amount; not part of this feature.
- Currency conversion math: unchanged — reuses existing `convertCurrency`/`useQuotes`.

## Affected Files

| File | Change |
|------|--------|
| `src/utils/processAccountsForList.ts` | New pure processor (format + BRL conversion) |
| `src/utils/__tests__/processAccountsForList.test.ts` | New Jest tests (spec-anchored: R1–R4) |
| `src/screens/AccountsList/index.tsx` | Use processor via `useMemo` + `useQuotes`; FlatList renders processed data |

## Decisions

**Format at data level, not component level** (R3): `AccountListItem` receives strings on other screens; double-formatting would occur if formatting moved into the component.

**`false` for `isConverted`**: the account's native balance is not a conversion, so `formatCurrency(..., false)` is used (same call as `Accounts/index.tsx`).
