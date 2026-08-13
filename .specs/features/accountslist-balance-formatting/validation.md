# Validation — AccountsList Balance Formatting

**Date**: 2026-08-12
**Result**: ✅ **PASS**

## Per-Requirement Evidence

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R1 | Balance formatted in account currency | `src/utils/processAccountsForList.ts:53` — `formatCurrency(account.currency.code, rawBalance, false)`; test `__tests__/processAccountsForList.test.ts:41-44` asserts `'R$\u00A01.234,50'` (BRL), `:47-49` asserts `'US$\u00A0100,00'` (USD) | ✅ |
| R2 | BRL-converted secondary line for non-BRL | `processAccountsForList.ts:34-48` — `convertCurrency({...toCurrency:'BRL'})` + `formatCurrency('BRL', converted, false)` into `totalAccountAmountConverted`, only when code ≠ BRL; test `:52-56` asserts `'R$\u00A0500,00'` (100 USD × 5), `:58-61` asserts `undefined` for BRL | ✅ |
| R3 | Processing at screen/util level; `AccountListItem` untouched | New pure util (no component change — confirmed via `git show --stat` on fbce430/230c5f2: only `processAccountsForList.*` + `AccountsList/index.tsx` touched); `AccountsList/index.tsx:75-83` applies it in `useMemo`, FlatList renders `sortedAccounts` (`:247-248`); test `:64-70` checks `AccountListItem` fields pass through | ✅ |
| R4 | Numeric `rawBalance` preserved | `processAccountsForList.ts:11,29,54` — `rawBalance: Number(account.balance)`; test `:73-77` asserts `toBe(100)` + `typeof === 'number'` | ✅ |

## Discrimination Sensor

Mutations injected one at a time into `src/utils/processAccountsForList.ts` (suite `processAccountsForList.test.ts`, 8 tests), file restored byte-identical (`cmp`) after each:

| # | Mutation | Killed? |
|---|----------|---------|
| M6 | Format with wrong currency code (`'USD'` always) | ✅ Killed (1 fail — BRL case) |
| M7 | Omit BRL conversion for non-BRL (`if (false)`) | ✅ Killed (1 fail) |
| M8 | Add secondary line for BRL too (`if (true)`) | ✅ Killed (1 fail) |
| M9 | `rawBalance` keeps raw string instead of `Number(...)` | ⚪ Survived — non-revealing: `AccountProps.balance` is typed `number` (`interfaces/accounts.ts:46`) and fixtures are numeric, so the mutant is behavior-preserving under the typed contract |

No surviving behavior-revealing mutants. Repo left clean: `git --no-optional-locks diff --stat` empty after restore.

## Gates

- `cd SmartFinances && npx jest --watchman=false src/utils` → **4 suites / 35 tests, all pass** (run twice: pre- and post-sensor).

## Spec-Precision Gaps

1. ~~BTC 8-decimal claim untested~~ ✅ **Resolved** (commit `6257943`) — `processAccountsForList.test.ts:52-62` now covers BTC and asserts 8 decimals: `expect(processed.balance).toBe('BTC\u00A00,12345678')`.
2. **Separator mismatch (cosmetic)** — spec R1 example shows a regular space (`R$ 1.234,50`); the implementation (Intl pt-BR) emits a non-breaking space (U+00A0) and the test correctly pins `'R$\u00A01.234,50'`. Test pins reality; spec example is imprecise. (Not a test defect; left as-is.)

## Post-Fix Re-verification (2026-08-12)

- `npx jest --watchman=false src/utils` → **4 suites / 36 tests, all pass**.
- Sensor: previously noted non-revealing mutant M9 (string `rawBalance`) remains behavior-preserving under the typed contract (`AccountProps.balance: number`) — not a defect.
- Final verdict unchanged: ✅ **PASS**.

## Commits

| Commit | Description |
|--------|-------------|
| `fbce430` | feat: format account balances per currency in AccountsList (processor + tests) |
| `230c5f2` | feat: render AccountsList balances formatted per account currency |

Range verified: `567d61b..6cc8392` (branch `fix/accounts-improvements`).

### Re-verification commits

| Commit | Description |
|--------|-------------|
| `6257943` | test: cover BTC 8-decimal formatting (verifier gap 3) |
