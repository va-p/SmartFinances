# Account Institutions — Tasks

**Feature:** account-institutions
**Date:** 2026-08-09
**Total tasks:** 25 (across 7 phases, 2 repos)
**Sub-agents needed:** Yes (25 > 8 tasks)

One implementation-level naming fix versus `design.md`: the aggregated card
on the Accounts screen is named **`InstitutionCard`**, distinct from
**`InstitutionListItem`** (the plain name-row used on the `Institutions`
management screen) — `design.md` used `InstitutionListItem` for both, which
would collide.

---

## Phase Dependency Graph

```
Phase 1 (Schema & Migration) ─┐
Phase 2 (Institution CRUD API)│──→ Phase 3 (Account API + Pluggy link + backfill)
                               │           │
                               └───────────┼──→ Phase 4 (Frontend data layer)
                                            │           │
                                            │           ├──→ Phase 5 (Institution mgmt + picker)
                                            │           │
                                            │           └──→ Phase 6 (Accounts screen + details)
                                            │                       │
                                            │                       └──→ Phase 7 (Credit card label/sort)
```

Phase 1 → 2 → 3 are sequential within backend (2 and 3 both touch schema
output from 1; 3 depends on 2 only insofar as both need the `Institution`
model to exist — not on each other's code). Phase 4 depends on the full
backend API contract being final (Phases 1-3). Phases 5 and 6 both depend on
Phase 4 but are independent of **each other** (disjoint files). Phase 7 is
small and depends only on Phase 4 (needs `AccountProps.institution`) — it's
batched after Phase 6 for worker-count efficiency, not because of a real
code dependency on it.

## Batching (sub-agent delegation)

| Batch | Phases | Tasks | Repo |
|---|---|---|---|
| 1 | 1, 2, 3 | T1–T9 (9) | Backend |
| 2 | 4 | T10–T14 (5) | Frontend |
| 3 | 5 | T15–T19 (5) | Frontend |
| 4 | 6, 7 | T20–T25 (6) | Frontend |

Batches run sequentially (1 → 2 → 3 → 4). Batches 3 and 4 have disjoint
write sets and have no code dependency on each other — if you'd rather
run them concurrently instead of strictly sequentially, that's safe, but
the default execution model here is sequential handoff.

---

## Phase 1 — Backend: Schema & Migration

### T1 — Add `Institution` Model + Relations to Prisma Schema

**Files:** `smart-finances-backend/prisma/schema.prisma`

**Changes:**
- Add `Institution` model: `id` (`String @id @default(uuid())`), `userId`, `name`, `createdAt`, `updatedAt`; relations `user`, `accounts Account[]`, `bankingIntegrations BankingIntegration[]`; `@@unique([userId, name])`; `@@map("institutions")`
- Add `institutionId String? @map("institution_id")` + `institution Institution? @relation(fields: [institutionId], references: [id], onDelete: SetNull)` to `Account`
- Add the same `institutionId`/`institution` pair to `BankingIntegration`
- Add `institutions Institution[]` to `User`'s relations block
- Run `npx prisma migrate dev --name add_institutions`
- Run `npx prisma generate`

**Verification:**
- [ ] `institutions` table exists in the dev database with `user_id`, `name`, `created_at`, `updated_at` columns and a unique index on `(user_id, name)`
- [ ] `accounts.institution_id` and `banking_integrations.institution_id` columns exist, nullable
- [ ] `npx prisma generate` completes without errors; `Institution` type is available from `@prisma/client`
- [ ] Existing seed/dev data unaffected (`institution_id` is `NULL` on all pre-existing rows)

**AC refs:** AC1.1–AC1.6, AC2.1–AC2.2
**Dependencies:** none

---

## Phase 2 — Backend: Institution CRUD API

### T2 — Institution Zod Schemas

**Files:** `smart-finances-backend/src/schemas/institution.schema.ts` (new)

**Changes:**
- `createInstitutionSchema`: `{ name: z.string().min(1, "Institution name is required").max(50) }`
- `updateInstitutionSchema`: same, `.optional()`
- `institutionIdParamSchema`: `{ id: z.string().uuid("Institution ID must be a valid UUID") }`
- Export inferred types (`CreateInstitutionInput`, `UpdateInstitutionInput`)

**Verification:**
- [ ] TypeScript compiles
- [ ] `createInstitutionSchema.safeParse({ name: "" })` fails; `{ name: "Itaú" }` passes
- [ ] `institutionIdParamSchema.safeParse({ id: "not-a-uuid" })` fails

**AC refs:** (supports AC3.1–AC3.6)
**Dependencies:** T1

---

### T3 — Institution Controller (Full CRUD)

**Files:** `smart-finances-backend/src/controllers/institution.controller.ts` (new)

**Changes:** mirror `tag.controller.ts` structure exactly (auth check via `req.user?.userId`, `AppError` for expected failures, `logger` calls):
- `getInstitutions` — `prisma.institution.findMany({ where: { userId }, orderBy: { name: "asc" } })`, returns `[{ id, name }]`
- `getInstitutionById` — `findFirst({ where: { id, userId } })`, 404 via `AppError` if not found
- `createInstitution` — validates `name` present, attempts `prisma.institution.create`; on Prisma `P2002` (unique violation on `(userId, name)`), catch it and respond `409` with `{ error: "Institution with this name already exists" }` instead of a generic 500
- `updateInstitution` — ownership check (`findFirst` by `id`+`userId`) then `update`
- `deleteInstitution` — ownership check then `delete` (relies on `onDelete: SetNull` for linked accounts/integrations — no manual unlinking code)

**Verification:**
- [ ] All 5 handlers scope every query by `req.user.userId` (no cross-user data leakage)
- [ ] `createInstitution` returns `409` (not `500`) when `(userId, name)` already exists
- [ ] `deleteInstitution` succeeds even when accounts still reference the institution (confirms `SetNull` fires — check `account.institutionId` is `null` afterward in a manual/dev test)
- [ ] `updateInstitution`/`getInstitutionById`/`deleteInstitution` return `404` for another user's institution ID (not `403` — matches existing `tag`/`category` behavior of not leaking existence)

**AC refs:** AC3.1–AC3.6
**Dependencies:** T2

---

### T4 — Institution Routes + Registration

**Files:**
- `smart-finances-backend/src/routes/institution.routes.ts` (new)
- `smart-finances-backend/src/server.ts`

**Changes:**
- Routes file mirrors `tag.routes.ts`: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`, all behind `authenticate`, `validate(...)` for body/params, wrapped in `asyncHandler`
  - Note: use `PATCH` (not `PUT`) for update — Institution is a new resource with no legacy frontend consumer, so it can follow the project's forward-looking convention (AD-024: "PATCH for frontend updates") from day one, unlike `Tag` which kept `PUT` for backward compatibility
- `server.ts`: import `institutionRoutes`, add `app.use(\`${API_PREFIX}/institution\`, institutionRoutes);` alongside the existing route registrations (~L178-183)

**Verification:**
- [ ] `GET /api/v1/institution` (with valid auth token) returns `200` and an array
- [ ] `POST /api/v1/institution` with `{ name: "Itaú" }` returns `201`
- [ ] Repeating the same `POST` returns `409`
- [ ] `PATCH /api/v1/institution/:id` and `DELETE /api/v1/institution/:id` work against the created record
- [ ] Requests without an auth token return `401` on every route

**AC refs:** AC3.1–AC3.6
**Dependencies:** T3

---

## Phase 3 — Backend: Account API + Pluggy Auto-Linking + Backfill

### T5 — Account Schema: Accept `institution_id`

**Files:** `smart-finances-backend/src/schemas/account.schema.ts`

**Changes:**
- Add `institution_id: z.string().uuid().nullable().optional()` to both `createAccountSchema` and `updateAccountSchema`

**Verification:**
- [ ] Schema accepts a valid UUID, `null`, and omission — all pass
- [ ] Schema rejects a non-UUID string for `institution_id`

**AC refs:** AC4.1
**Dependencies:** T1

---

### T6 — Account Controller: Persist + Return `institution`

**Files:** `smart-finances-backend/src/controllers/account.controller.ts`

**Changes:**
- `createAccount`/`updateAccount`: destructure `institution_id` from body, include it in the Prisma `data` payload as `institutionId`
- Add `include: { institution: { select: { id: true, name: true } } }` alongside the existing `bankingIntegration` include in all 4 relevant Prisma calls: `getAccounts` (~L18-30), `getAccountById` (~L102-117), `createAccount` (~L240-244), `updateAccount` (~L392-397)
- Add `institution: account.institution ? { id: account.institution.id, name: account.institution.name } : null` to all 4 corresponding `formattedAccount` objects (~L36-80, ~L124-166, ~L249-289, ~L402-441)

**Verification:**
- [ ] Creating an account with `institution_id` set returns that account with a populated `institution: { id, name }` in the response
- [ ] Creating an account without `institution_id` returns `institution: null`
- [ ] `GET /account` and `GET /account/:id` both include the `institution` field for every account
- [ ] Updating an account's `institution_id` to a different institution reflects in the next `GET`
- [ ] Existing account create/update/get behavior (balance, credit data, currency, bankingIntegration) is unchanged — no regressions

**AC refs:** AC4.1–AC4.3
**Dependencies:** T5

---

### T7 — Auto-Link `BankingIntegration` to an `Institution` on Connect

**Files:** `smart-finances-backend/src/controllers/bankingIntegration.controller.ts`

**Changes:**
- In `createBankingIntegration` (~L136-194), before `prisma.bankingIntegration.create`:
  - `let institution = await prisma.institution.findFirst({ where: { userId, name: bankName } })`
  - If not found, attempt `prisma.institution.create({ data: { userId, name: bankName } })`; catch a Prisma `P2002` unique-violation (race with a concurrent request) and re-fetch by `(userId, name)` instead of throwing
  - Include `institutionId: institution.id` in `bankingIntegrationData`

**Verification:**
- [ ] Connecting a new bank via Pluggy creates exactly one `Institution` row for `(userId, bankName)`
- [ ] Connecting a second account at the same bank (same `bankName`, same user) does **not** create a second `Institution` — the existing one is reused
- [ ] A manually-created `Institution` with the same name as a bank the user later connects via Pluggy is reused (not duplicated) — confirms the find-or-create matches manually-created institutions too
- [ ] Simulated concurrent `POST /banking-integration` for a brand-new bank name (two near-simultaneous requests) results in exactly one `Institution` row, not a crash

**AC refs:** AC5.1–AC5.3
**Dependencies:** T1 (schema), independent of T2–T6

---

### T8 — New Pluggy-Sourced Accounts Inherit `institutionId`

**Files:** `smart-finances-backend/src/services/webhook.service.ts`

**Changes:**
- `createAccountFromPluggy` (~L281-326): add a 4th parameter `institutionId: string | null`; include `institutionId` in the `prisma.account.create` data
- `handleItemUpdated` (~L65-204): the `integration` object it already fetches includes all scalar fields by default — confirm `institutionId` is present (no `select` clause restricts it at ~L70-76) and pass `integration.institutionId` through to `createAccountFromPluggy` at ~L113-117
- `handleItemCreated` (~L243-276): its `select: { id: true, userId: true }` (~L258-261) must be extended to `select: { id: true, userId: true, institutionId: true }`; pass `integration?.institutionId ?? null` through to `createAccountFromPluggy` at ~L267-269

**Verification:**
- [ ] A brand-new account discovered during a webhook sync (`item/created` or `item/updated` creating a not-yet-seen account) has `institutionId` matching its parent `BankingIntegration`'s `institutionId`
- [ ] Existing accounts already linked to a `BankingIntegration` are untouched by this change (this task only affects newly-created accounts)
- [ ] If `BankingIntegration.institutionId` is `null` (shouldn't happen post-T7, but defensively), the new account is created with `institutionId: null` rather than throwing

**AC refs:** AC6.1–AC6.3
**Dependencies:** T7

---

### T9 — Backfill Script for Existing Pluggy-Connected Users

**Files:**
- `smart-finances-backend/prisma/backfill-institutions.ts` (new)
- `smart-finances-backend/package.json` (add `"backfill:institutions": "tsx prisma/backfill-institutions.ts"`)

**Changes:**
- Script logic (see `design.md` §5): find distinct `(userId, bankName)` pairs from `BankingIntegration` rows with `institutionId IS NULL`; `upsert` an `Institution` per pair on `(userId, name)`; update matching `BankingIntegration.institutionId`; update `Account.institutionId` for every account whose `bankingIntegrationId` points at one of those integrations
- Log a per-user summary; the script must be safe to re-run (all updates guarded by `institutionId IS NULL` / `upsert`)

**Verification:**
- [ ] Running the script against a dev database with pre-existing `BankingIntegration` rows (created before T1's migration) results in: one `Institution` per distinct `(userId, bankName)`, all matching `BankingIntegration`s linked, all their accounts linked
- [ ] Running the script a second time immediately after makes no further changes (idempotent) and doesn't error
- [ ] Manually-created accounts (`bankingIntegrationId: null`) are untouched — still `institutionId: null` after the script runs

**AC refs:** AC7.1–AC7.5
**Dependencies:** T7 (needs the find-or-create pattern's target shape to exist), T1

---

## Phase 4 — Frontend: Data Layer

### T10 — `InstitutionProps` Interface

**Files:** `SmartFinances/src/interfaces/institutions.ts` (new)

**Changes:** `export interface InstitutionProps { id: string; name: string; }`

**Verification:**
- [ ] TypeScript compiles; importable from `@interfaces/institutions`

**AC refs:** AC8.1
**Dependencies:** T4, T6 (API contract must be final)

---

### T11 — `AccountProps` Interface Update

**Files:** `SmartFinances/src/interfaces/accounts.ts`

**Changes:** add `institution?: { id: string; name: string } | null;` to `AccountProps` (~L40-52)

**Verification:**
- [ ] TypeScript compiles with no new errors in existing consumers of `AccountProps`

**AC refs:** AC9.1
**Dependencies:** T6

---

### T12 — `useInstitutionsQuery` Hook

**Files:** `SmartFinances/src/hooks/useInstitutionsQuery.ts` (new)

**Changes:** mirrors `useCategoriesQuery.ts` shape — `useQuery({ queryKey: ['institutions'], queryFn: () => api.get('institution').then(res => res.data) })`, returning `{ data, isLoading, refetch, isRefetching, isError }`

**Verification:**
- [ ] Hook returns institutions from the live/dev backend
- [ ] `isLoading`/`isError` states behave as expected (manually toggle network to verify `isError`)

**AC refs:** AC8.2
**Dependencies:** T10, T4

---

### T13 — Institution Mutation Hooks

**Files:** `SmartFinances/src/hooks/useInstitutionMutations.ts` (new)

**Changes:** three named exports mirroring `useTagMutations.ts` exactly (`useCreateInstitutionMutation`, `useUpdateInstitutionMutation`, `useDeleteInstitutionMutation`), each with optimistic `onMutate`/`onError` rollback/`onSettled: invalidateQueries(['institutions'])`. Additionally: `useCreateInstitutionMutation`'s `mutationFn` must surface the backend's `409` response distinctly (not swallow it as a generic error) so `InstitutionSelect`'s inline quick-add (T18) can branch on it per AC11.5.

**Verification:**
- [ ] Create/update/delete each optimistically update the `['institutions']` cache and roll back on error
- [ ] A `409` from `createInstitution` is distinguishable by the caller (e.g., check `error.response?.status === 409`) rather than only triggering the generic `onError` Alert

**AC refs:** AC8.3
**Dependencies:** T10, T4

---

### T14 — `useCurrentInstitutionSelected` Store

**Files:** `SmartFinances/src/stores/currentInstitutionSelectedStorage.ts` (new)

**Changes:** Zustand store mirroring `currentAccountSelectedStorage.ts`'s pattern: `{ institutionId: string | null; setInstitutionId; institutionName: string | null; setInstitutionName; clearInstitution: () => void }`

**Verification:**
- [ ] Setting and clearing state works as expected in isolation (basic store test or manual verification via a temporary console log in a screen)

**AC refs:** (supports AC14.2)
**Dependencies:** none (independent of T10-T13, but grouped in this phase for batching)

---

## Phase 5 — Frontend: Institution Management + Picker

### T15 — `InstitutionListItem` Component (Management List Row)

**Files:** `SmartFinances/src/components/InstitutionListItem/index.tsx` + `styles.ts` (new)

**Changes:** simple name-only row (no icon/color swatch), structurally closer to a hypothetical `TagListItem` than `CategoryListItem` — name + chevron, `onPress` prop

**Verification:**
- [ ] Renders institution name; tappable; matches existing list-item visual rhythm (padding, font, chevron)

**AC refs:** (supports AC10.1)
**Dependencies:** T10

---

### T16 — `RegisterInstitution` Screen (Create/Edit Form)

**Files:** `SmartFinances/src/screens/RegisterInstitution/index.tsx` + `styles.ts` (new)

**Changes:** single-field form (name only — no icon/color state, unlike `RegisterCategory`), React Hook Form + Yup (`name: Yup.string().required('Digite o nome da instituição')`), `useCreateInstitutionMutation`/`useUpdateInstitutionMutation`, props `{ id: string; closeInstitution: () => void }` mirroring `RegisterCategory`'s prop shape

**Verification:**
- [ ] Creating a new institution with a valid name succeeds and closes the form
- [ ] Editing an existing institution pre-fills its current name
- [ ] Submitting an empty name shows the Yup validation error, does not call the mutation
- [ ] Submitting a duplicate name surfaces the backend's `409` as a user-facing `Alert` (distinct message from a generic network-error alert)

**AC refs:** (supports AC10.2)
**Dependencies:** T13, T15

---

### T17 — `Institutions` Management Screen + Entry Point

**Files:**
- `SmartFinances/src/screens/Institutions/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/screens/OptionsMenu/index.tsx` (add entry row)
- `SmartFinances/src/app/(app)/options/_layout.tsx` (register route, same pattern as `categories`/`tags` at ~L23-24)
- New route file `SmartFinances/src/app/(app)/options/institutions.tsx` (default-exports `Institutions`, mirrors `categories.tsx`/`tags.tsx`)

**Changes:**
- `Institutions` screen: `FlatList` of `InstitutionListItem`s via `useInstitutionsQuery`, `ListFooterComponent` "Criar Nova Instituição" button, `ModalView` bottom sheet hosting `RegisterInstitution` (exact structural mirror of `Categories/index.tsx`, including delete confirmation `Alert` warning that accounts become ungrouped, not deleted — per AC10.3)
- `OptionsMenu`: add a `SelectButton` row ("Instituições") near the existing "Categorias"/"Etiquetas" rows (~L252-262), with a `handleOpenInstitutions` navigator function mirroring `handleOpenCategories`/`handleOpenTags`

**Verification:**
- [ ] "Instituições" row visible in `OptionsMenu`, navigates to the new screen
- [ ] List shows all institutions; tapping one opens the edit bottom sheet pre-filled
- [ ] "Criar Nova Instituição" opens an empty create bottom sheet
- [ ] Deleting an institution shows the "accounts become ungrouped" confirmation, and on confirm removes it from the list

**AC refs:** AC10.1, AC10.3, AC10.4
**Dependencies:** T15, T16, T12

---

### T18 — `InstitutionSelect` Picker + Inline Quick-Add

**Files:** `SmartFinances/src/screens/InstitutionSelect/index.tsx` + `styles.ts` (new)

**Changes:**
- `FlatList` of institutions from `useInstitutionsQuery`, single-column text rows (not `CategorySelect`'s icon-grid layout), props `{ institutionSelected, setInstitution, closeSelectInstitution }` mirroring `CategorySelect`
- `ListFooterComponent`: a "+ Nova instituição" row; tapping it swaps to a local `TextInput` + confirm button (local `useState`, no navigation); submitting calls `useCreateInstitutionMutation`
  - On success: select the new institution, close the inline input
  - On `409` (per T13's distinguishable error): call `refetch()` on `useInstitutionsQuery`, find the institution whose `name` matches case-insensitively, select it — do **not** show an error alert (per AC11.5)
  - On any other error: show a generic `Alert`, keep the inline input open for retry

**Verification:**
- [ ] Selecting an existing institution from the list calls `setInstitution` and closes the picker
- [ ] Creating a brand-new institution inline selects it immediately without leaving `RegisterAccount`
- [ ] Attempting to create a name that already exists (simulate by creating it twice in a row) silently resolves to selecting the existing one, no error shown to the user

**AC refs:** AC11.1, AC11.2, AC11.5
**Dependencies:** T13, T12

---

### T19 — Institution Field in `RegisterAccount`

**Files:** `SmartFinances/src/screens/RegisterAccount/index.tsx` (+ `styles.ts` if new styled rows are needed)

**Changes:**
- New `SelectButton` row "Instituição financeira" (label becomes "Instituição financeira (opcional)" when `typeSelected` is `WALLET`/`CRYPTOCURRENCY_WALLET`/`OTHER`, per AC11.4), opening a `ModalViewSelection` → `InstitutionSelect`, wired the same way as the existing currency/account-type selector rows in this screen
- Yup schema: add `institution_id` validated via `.when('type', { is: (t) => ['BANK','INVESTMENTS','CREDIT'].includes(t), then: (s) => s.required('Selecione a instituição financeira') })`
- `handleRegisterAccount`/`handleEditAccount` payloads include `institution_id: institutionSelected?.id ?? null`
- On edit (`fetchAccount`/`accountData` effect), pre-fill `institutionSelected` from `accountData.institution`

**Verification:**
- [ ] Selecting type `BANK`/`INVESTMENTS`/`CREDIT` and submitting without an institution shows the Yup error, blocks submission
- [ ] Selecting type `WALLET`/`CRYPTOCURRENCY_WALLET`/`OTHER` allows submission with no institution selected
- [ ] Creating an account with an institution selected persists it (verify via `GET /account/:id` showing the `institution` field)
- [ ] Editing an existing account shows its current institution pre-selected in the picker

**AC refs:** AC11.3, AC11.4, AC11.6, AC11.7
**Dependencies:** T18, T11

---

## Phase 6 — Frontend: Accounts Screen Grouping + Institution Details

### T20 — Group & Aggregate Accounts in `processedData`

**Files:** `SmartFinances/src/screens/Accounts/index.tsx` (~L117-235)

**Changes:**
- After computing `processedAccounts`, partition non-credit-card accounts (`type !== 'CREDIT'`) by `institutionId` into a `Map<string, AccountProps[]>`, plus a `standalone: AccountProps[]` array for `institutionId: null` accounts
- Reclassify any institution group of length 1 into `standalone` (bypass rule, AC12.3) — single pass inside the existing `useMemo`
- For each remaining group (length ≥ 2), compute an aggregated total by summing each account's existing `totalAccountAmountConverted` figure (reusing the conversion already computed at ~L132-151 — no new conversion logic), producing `{ id, name, totalFormatted, accountCount }` per institution
- Return these alongside the existing `processedAccounts` from the memo (e.g., new `institutionCards` and `standaloneAccounts` fields)

**Verification:**
- [ ] An institution with 2+ non-credit accounts produces one aggregated entry with the correct summed total (verify against manual sum of the individual account balances shown in `InstitutionDetails`, once T22 exists — or verify via temporary logging in the interim)
- [ ] An institution with exactly 1 non-credit account does NOT appear in `institutionCards` — it appears in `standaloneAccounts` instead
- [ ] Accounts with `institutionId: null` appear in `standaloneAccounts`
- [ ] Credit card accounts are excluded from both partitions (unaffected — they still flow through the existing separate carousel logic untouched)
- [ ] Multi-currency institutions (accounts in different currencies) aggregate to the correct converted total

**AC refs:** AC12.1–AC12.3, AC13.1–AC13.3
**Dependencies:** T11 (needs `AccountProps.institution`)

---

### T21 — `InstitutionCard` Component + Merged/Sorted List Rendering

**Files:**
- `SmartFinances/src/components/InstitutionCard/index.tsx` + `styles.ts` (new)
- `SmartFinances/src/screens/Accounts/index.tsx` (~L306-374 `_renderItem`, ~L478-499 `FlatList`)

**Changes:**
- `InstitutionCard`: visually similar to `AccountListItem` (name, aggregated balance) plus an account-count badge/subtext (e.g., "3 contas")
- In `Accounts/index.tsx`: merge `institutionCards` and `standaloneAccounts` into one array with a type discriminator, sorted as two concatenated alphabetical blocks — institutions first (by `name`), then standalone (by `name`) — per AC12.4, not one combined comparator
- `_renderItem` branches on the discriminator: `InstitutionCard` → `onPress` sets `useCurrentInstitutionSelected` (`institutionId`, `institutionName`) and navigates to `institutionDetails` (added in T23); existing account branch → unchanged `handleOpenAccount` call

**Verification:**
- [ ] Main list shows institution cards for multi-account institutions and plain account rows for everything else, in the correct sorted order (institutions block alphabetical, then standalone block alphabetical)
- [ ] Tapping an `InstitutionCard` does NOT call `handleOpenAccount` (verify no navigation to the `Account` screen occurs)
- [ ] Tapping a standalone account row behaves exactly as before (unchanged regression check)

**AC refs:** AC12.2, AC12.4, AC12.5
**Dependencies:** T20, T14

---

### T22 — `InstitutionDetails` Screen

**Files:** `SmartFinances/src/screens/InstitutionDetails/index.tsx` + `styles.ts` (new)

**Changes:**
- Read `institutionId`/`institutionName` from `useCurrentInstitutionSelected`
- Filter the existing `useAccountsQuery` cache client-side by `account.institution?.id === institutionId` (no new network call) — **including** credit card accounts this time (unlike the main screen's list)
- Group into sections by type/subtype: "Contas" (BANK/CHECKING_ACCOUNT), "Poupança" (SAVINGS_ACCOUNT), "Investimentos" (INVESTMENTS), "Carteira" (WALLET), "Criptomoedas" (CRYPTOCURRENCY_WALLET), "Cartões de Crédito" (CREDIT/CREDIT_CARD) — omit empty sections; render via `SectionList`
- Header shows `institutionName` and the same non-credit aggregated total computed in T20 (recompute client-side from the filtered list here, rather than threading it through the store, to avoid staleness)
- Tapping any account row navigates to the existing `Account` screen exactly as `handleOpenAccount` does on the main Accounts screen

**Verification:**
- [ ] Navigating from an `InstitutionCard` shows all of that institution's accounts, correctly grouped by type, including its credit card(s)
- [ ] The header total matches the `InstitutionCard`'s total on the main screen (both exclude credit cards)
- [ ] Tapping an account here navigates to the same `Account` screen as tapping it would from the main list
- [ ] Empty type sections (e.g., no credit cards at this institution) are not rendered

**AC refs:** AC14.1, AC14.3–AC14.5
**Dependencies:** T20, T14

---

### T23 — Route Registration for `InstitutionDetails`

**Files:**
- `SmartFinances/src/app/(app)/accounts/institutionDetails.tsx` (new route file, default-exports `InstitutionDetails`, mirrors `bankingIntegrationDetails.tsx`)
- `SmartFinances/src/app/(app)/accounts/_layout.tsx` (register the new `Stack.Screen`, alongside the existing `bankingIntegrations`/`bankingIntegrationDetails` entries)

**Changes:** wire `router.navigate({ pathname: '/accounts/institutionDetails' })` into `InstitutionCard`'s tap handler from T21 (if not already done there — confirms end-to-end navigation)

**Verification:**
- [ ] Tapping an `InstitutionCard` navigates to a working `InstitutionDetails` screen (not a 404/blank route)
- [ ] Back navigation returns to the Accounts screen correctly

**AC refs:** AC14.1
**Dependencies:** T22, T21

---

## Phase 7 — Frontend: Credit Card Label + Sort

### T24 — Institution Label on `CreditCardListItem`

**Files:** `SmartFinances/src/components/CreditCardListItem/index.tsx` (+ `styles.ts`)

**Changes:** when `data.institution` is present, render a small label above/below the account name, styled compactly (smaller than `AccountConnectedListItem`'s "Inst. Financeira:" line, given the card's limited horizontal space); render nothing extra when absent

**Verification:**
- [ ] A credit card with an institution shows the label; one without shows the card exactly as it does today (no layout regression)

**AC refs:** AC15.1
**Dependencies:** T11

---

### T25 — Sort Credit Card Carousel by Institution

**Files:** `SmartFinances/src/screens/Accounts/index.tsx` (~L509-513, the credit-card `FlatList`'s `data` prop)

**Changes:** sort the filtered credit-card array by `institution?.name` ascending (accounts without an institution sort last), with account `name` as a tiebreaker/fallback — a flat sort, no sub-grouping or headers

**Verification:**
- [ ] Multiple credit cards across institutions appear grouped together by institution name in carousel order (visually adjacent, even without a header)
- [ ] Credit cards with no institution appear after all institution-labeled ones
- [ ] No subtotal, header, or carousel restructuring was introduced (explicitly out of scope per AC15.3)

**AC refs:** AC15.2, AC15.3
**Dependencies:** T24

---

## Task Summary

| Phase | Tasks | Repo | Batch |
|---|---|---|---|
| 1 — Schema & Migration | T1 | Backend | 1 |
| 2 — Institution CRUD API | T2, T3, T4 | Backend | 1 |
| 3 — Account API + Pluggy + Backfill | T5, T6, T7, T8, T9 | Backend | 1 |
| 4 — Frontend Data Layer | T10, T11, T12, T13, T14 | Frontend | 2 |
| 5 — Institution Mgmt + Picker | T15, T16, T17, T18, T19 | Frontend | 3 |
| 6 — Accounts Screen + Details | T20, T21, T22, T23 | Frontend | 4 |
| 7 — Credit Card Label/Sort | T24, T25 | Frontend | 4 |

**Total: 25 tasks, 7 phases, 4 batches**
