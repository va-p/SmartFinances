# Validation — Default Account (Pre-select when Adding a Transaction)

**Date**: 2026-08-12
**Result**: ✅ **PASS**

## Per-AC Evidence

| AC | Description | Evidence | Status |
|----|-------------|----------|--------|
| AC-1 | `isDefault` persisted + exposed in API responses | `prisma/schema.prisma:163` — `isDefault Boolean @default(false) @map("is_default")`; gitignored migration `prisma/migrations/20260812000000_add_account_is_default/migration.sql` exists locally and matches (`ALTER TABLE "accounts" ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT false;`); controller responses: `GET /account` → `account.controller.ts:58`, `GET /account/:id` → `:156`, `POST /account` → `:321`, `PATCH /account/edit` + `PUT/PATCH /account/:id` (same `updateAccount`) → `:515` | ✅ |
| AC-2 | Create/update schemas accept optional boolean `is_default` | `schemas/account.schema.ts:54` (create), `:68` (update) — `is_default: z.boolean().optional()`; tests `__tests__/account.schema.test.ts:28-53` (create accepts true/false/absent, rejects `"yes"`), `:55-71` (update accepts true/false/absent) | ✅ |
| AC-3 | At most one default per user, transactionally | Create: `account.controller.ts:283-295` — `$transaction(updateMany({where:{userId}, data:{isDefault:false}}) + create)` only when `is_default` truthy; `else` plain create (`:296-301`, no sibling reset). Update: `:475-488` — `$transaction(updateMany({where:{userId, id:{not: accountId}}}) + update)`; `else` plain update (`:489-495`). Tests `account.controller.test.ts:62-92` (create unsets others), `:94-125` (create `false` skips reset), `:127-157` (update unsets others excluding self), `:159-184` (update without `is_default` no-op) | ✅ |
| AC-4 | Toggle in RegisterAccount (create + edit, prefilled) | `screens/RegisterAccount/index.tsx:454-471` — `ButtonToggle` "Definir como conta padrão"; payloads include `is_default: isDefault` on edit (`:195-204`) and create (`:256-265`); prefill `setIsDefault(data.isDefault ?? false)` from `GET account/:id` (`:294-304`) | ✅ |
| AC-5 | Pre-select default account on transaction create | `screens/RegisterTransaction/index.tsx:1192-1209` — effect: create mode (`id === ''`), not bulk edit, no `accountID` → `pickDefaultAccount(accountsData)` (from `useAccountsQuery`, `:282-283`) → sets `accountId/accountName/accountCurrency/accountType/accountInitialAmount` + `currencySelected`; helper `utils/pickDefaultAccount.ts:13` — `accounts.find(a => a.isDefault === true)`; tests `__tests__/pickDefaultAccount.test.ts` (6 cases incl. first-wins, explicit-false ignored) | ✅ |
| AC-6 | No override of explicit context | Same effect guards: early return on `id !== '' || isBulkEdit` (`:1193-1195`) and on `accountID` (`:1196-1198`) | ✅ |
| AC-7 | No default → current behavior | `pickDefaultAccount` returns `undefined` (no account / none flagged) → effect returns early (`:1199-1202`); test `pickDefaultAccount.test.ts:27-37` | ✅ |

## Discrimination Sensor

Frontend: 1 mutation in `src/utils/pickDefaultAccount.ts` (suite `pickDefaultAccount.test.ts`, 6 tests):

| # | Mutation | Killed? |
|---|----------|---------|
| M5 | Pick `isDefault === false` account | ✅ Killed (3 fails) |

Backend: 3 mutations (gate `npm run test:unit`, 51 tests):

| # | Mutation | Killed? |
|---|----------|---------|
| M10 | Controller create: remove `updateMany` unsets-others | ✅ Killed (1 fail) |
| M11 | Controller update: `where: { userId, id }` instead of `id: { not }` | ✅ Killed (1 fail) |
| M12 | Schema: accept `is_default: "yes"` (union with string) | ✅ Killed (1 fail) |

All files restored byte-identical (`cmp`); `git --no-optional-locks diff --stat` empty in both repos after the sensor.

## Gates

- `cd smart-finances-backend && npm run test:unit` → **51 tests, all pass** (run twice: pre- and post-sensor).
- `npx tsc --noEmit` → **clean** (exit 0).
- `npx prisma validate` → **valid** (exit 0).

## Spec-Precision Gaps

1. ~~AC-1 response exposure untested~~ ✅ **Resolved** (commit `977a515`) — controller tests now assert `isDefault` in the JSON payload: create-default `:89-91` (`true`), create-non-default `:125-127` (`false`), update-false `:191-193` (`false`).
2. ~~AC-3 explicit `is_default: false` on update untested~~ ✅ **Resolved** (commit `977a515`) — new test "updating with is_default false does not clear sibling defaults" (`account.controller.test.ts:167-199`): asserts no `updateMany`, `update.data.isDefault === false`, response `isDefault === false`.
3. ~~`updateAccountSchema` rejects non-boolean `is_default` untested~~ ✅ **Resolved** (commit `9dde45d`) — `account.schema.test.ts:74-80` rejects `is_default: 1` on update.
4. **AC-4 toggle and AC-5/AC-6 effect have no automated UI tests** — only the `pickDefaultAccount` helper is tested; the `ButtonToggle` and the `useEffect` wiring rely on manual QA. (Open by design.)
5. **Migration gitignored by convention** — `prisma/migrations/20260812000000_add_account_is_default/migration.sql` is excluded from git (repo convention; DB not runnable locally). Verified present and matching the schema, but it will not ship with the branch.

## Post-Fix Re-verification (2026-08-12)

- `npm run test:unit` → **53/53 tests, all pass**.
- `npx tsc --noEmit` → **clean**.
- No new mutants injected on the backend this round (the fix commits only added tests; behavior unchanged and previously verified).
- Final verdict unchanged: ✅ **PASS**.

## Commits

| Commit | Description |
|--------|-------------|
| `047729a` | feat: add is_default column to Account model |
| `3b85f75` | feat: accept is_default in account create/update schemas + tests |
| `c5bd501` | feat: enforce single default account transactionally on create/update + tests |
| `c62aa31` | test: register account schema/controller tests in test:unit script |

Frontend commits: `cfa6ca4` (toggle + helper + tests), `dfc4820` (pre-selection effect). Range verified: backend `2be76b9..977a515` (branch `feat/default-account`); frontend `567d61b..6cc8392`.

### Re-verification commits

| Commit | Description |
|--------|-------------|
| `9dde45d` | test: reject non-boolean is_default on update (verifier gap 6) |
| `977a515` | test: assert isDefault in API responses + update is_default:false no-op (verifier gaps 2/4) |
