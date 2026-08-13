# Default Account — Pre-select when Adding a Transaction

## Summary

Add a "default account" option to the **RegisterAccount** screen. When the user adds a new transaction and no account context is already selected, the default account is pre-selected. This spans backend (persistence/API contract) and frontend (form + pre-selection).

## Requirements

### AC-1 — Default flag persisted on Account
Backend `Account` model gains `isDefault Boolean @default(false)` (column `is_default`). API responses expose it as `isDefault` in: `GET /account`, `GET /account/:id`, `POST /account`, `PATCH /account/edit` (and `PUT/PATCH /account/:id`).

### AC-2 — Create/update accept `is_default`
`createAccountSchema` and `updateAccountSchema` accept optional boolean `is_default`. `POST /account` stores it; update routes apply it when present.

### AC-3 — At most one default per user
When an account is created/updated with `is_default: true`, all other accounts of the same user have `is_default` reset to `false`. Both operations run inside a `prisma.$transaction`. Setting `is_default: false` never clears other accounts' flags (no-op on siblings).

### AC-4 — Toggle in RegisterAccount (create and edit)
RegisterAccount shows a `ButtonToggle` "Definir como conta padrão" (default off). On create it sends `is_default` in `POST /account`; on edit it sends `is_default` in `PATCH /account/edit`. Editing an existing account pre-fills the toggle from `GET /account/:id` (`isDefault`).

### AC-5 — Pre-selection when adding a transaction
When `RegisterTransaction` is open in create mode (`id === ''`, not bulk edit) and no account is selected (`accountId` null/empty in `useCurrentAccountSelected`), the default account (first with `isDefault === true` from `useAccountsQuery`) is pre-selected: `accountId`, `accountName`, `accountCurrency`, `accountType`, `accountInitialAmount` and the form's `currencySelected` are set from it.

### AC-6 — No override of explicit context
If an account is already selected (e.g. the screen was opened from an account's detail screen) or the transaction is being edited / bulk-edited, the default-account pre-selection must not run.

### AC-7 — No default configured → current behavior
When no account is flagged default, the account field remains "Selecione a conta" as today.

## Non-Requirements

- Visual "default" badge on account lists.
- Changing the account selector UI inside RegisterTransaction (only the pre-selected value).
- A dedicated endpoint to set/unset the default account (PATCH /account/edit covers it).

## Affected Files

| File | Change |
|------|--------|
| `smart-finances-backend/prisma/schema.prisma` | `isDefault` field on Account |
| `smart-finances-backend/prisma/migrations/20260812000000_add_account_is_default/migration.sql` | Manual migration SQL (DB not runnable locally — see STATE Known Issues) |
| `smart-finances-backend/src/schemas/account.schema.ts` | `is_default` in create/update schemas |
| `smart-finances-backend/src/controllers/account.controller.ts` | Persist flag; transactional uniqueness; `isDefault` in responses |
| `smart-finances-backend/src/__tests__/account.schema.test.ts` | New — schema accepts/rejects `is_default` |
| `smart-finances-backend/src/__tests__/account.controller.test.ts` | New — default-uniqueness transactions |
| `smart-finances-backend/package.json` | Register new tests in `test:unit` |
| `SmartFinances/src/interfaces/accounts.ts` | `isDefault?: boolean` on `AccountProps` |
| `SmartFinances/src/utils/pickDefaultAccount.ts` | New pure helper + Jest test |
| `SmartFinances/src/screens/RegisterAccount/index.tsx` | Toggle + payloads + prefill |
| `SmartFinances/src/screens/RegisterTransaction/index.tsx` | Pre-selection effect (AC-5/AC-6) |

## Decisions

**Uniqueness invariant (AC-3)**: one default per user — enforced transactionally on the backend (single source of truth), not client-side.

**Pre-selection trigger**: only in create mode with no selected account (AC-5/AC-6). Screens that open RegisterTransaction with an account context (Account detail) keep that context; Home/BudgetDetails benefit from the default.

**Field naming**: API/DB use snake_case `is_default`; API responses use camelCase `isDefault` (matches `initialAmount`/`hide` conventions).

**Manual accounts only?** The toggle appears in RegisterAccount, which registers/edits manual accounts. The pre-selection logic does not discriminate by account origin — a Pluggy-connected account flagged default (via edit) would also pre-select; acceptable and simpler.
