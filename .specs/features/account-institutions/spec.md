# Account Institutions — Grouping Accounts by Financial Institution

**Status:** Specify
**Date:** 2026-08-09
**Scope:** Complex (~24 requirements across backend schema/migration/API + frontend UI, two repos)

## Summary

Introduce an `Institution` model that groups peer `Account` rows by financial
institution (e.g., "Itaú", "Nubank"), decoupled from the existing
`BankingIntegration` model (which represents a Pluggy sync connection, not a
user-facing label). On the Accounts screen, institutions with 2+ non-credit
accounts collapse into a single card showing the aggregated balance; tapping
it opens a new `InstitutionDetails` screen listing every account there,
grouped by type. Single-account institutions and ungrouped accounts render
exactly as they do today. Full rationale and rejected alternatives are in
`context.md`.

---

## Requirements

### Backend — Schema & Migration

#### R1 — Prisma Schema: `Institution` Model

Add a new `Institution` model plus optional FKs from `Account` and
`BankingIntegration`.

**Acceptance criteria:**
- AC1.1: `Institution` model has `id` (`String @id @default(uuid())`, matching the `Category`/`Tag`/`Budget` uuid convention), `userId`, `name`, `createdAt`, `updatedAt`
- AC1.2: `Institution` has `@@unique([userId, name])` (case-sensitive is acceptable for phase 1) to prevent duplicates and to support find-or-create-by-name lookups
- AC1.3: `Institution.user` relation to `User` with `onDelete: Cascade`; `User` gains an `institutions Institution[]` relation field
- AC1.4: `Account` gains `institutionId String? @map("institution_id")` (nullable) and an `institution Institution? @relation(fields: [institutionId], references: [id], onDelete: SetNull)` relation
- AC1.5: `BankingIntegration` gains `institutionId String? @map("institution_id")` (nullable) and the equivalent `onDelete: SetNull` relation
- AC1.6: `Institution` model maps to table `institutions` via `@@map`

#### R2 — Prisma Migration

**Acceptance criteria:**
- AC2.1: A new migration creates the `institutions` table and adds
  `institution_id` (nullable) columns to `accounts` and `banking_integrations`
- AC2.2: Existing rows are unaffected (`institution_id` defaults to `NULL`
  everywhere) — no data loss, no required backfill to apply the migration
  itself (backfill is a separate, explicit step — see R7)

#### R7 — Data Backfill for Existing Pluggy-Connected Users

**Acceptance criteria:**
- AC7.1: A one-off script (or idempotent migration-time logic) creates one
  `Institution` per distinct `(userId, bankName)` pair found across existing
  `BankingIntegration` rows
- AC7.2: Each existing `BankingIntegration` is updated to reference its
  matching `Institution` via `institutionId`
- AC7.3: Every `Account` currently linked via `bankingIntegrationId` is
  backfilled with the same `institutionId` as its parent `BankingIntegration`
- AC7.4: Manually-created accounts (`bankingIntegrationId: null`) are left
  with `institutionId: null` — no forced grouping, per decision #2 in context.md
- AC7.5: Script is idempotent (safe to re-run without creating duplicate
  Institutions, guarded by the `@@unique([userId, name])` constraint)

---

### Backend — Institution API

#### R3 — Institution CRUD Endpoints

New `institution.schema.ts`, `institution.controller.ts`, `institution.routes.ts`
following the existing pattern used by `tag`/`category` (auth-scoped to
`req.user.userId`, Zod validation via the `validate` middleware).

**Acceptance criteria:**
- AC3.1: `GET /institution` returns the authenticated user's institutions,
  each with `{ id, name, createdAt }` — ordered alphabetically by `name`
- AC3.2: `POST /institution` accepts `{ name }`, creates and returns the new
  institution; returns `409`/validation error if `(userId, name)` already
  exists (support find-or-create semantics needed by R11's inline quick-add:
  a duplicate-name conflict response is expected and handled gracefully by
  the frontend, not treated as a hard failure — see AC11.4)
- AC3.3: `GET /institution/:id` returns one institution scoped to the
  authenticated user (404 if not found or not owned)
- AC3.4: `PATCH /institution/:id` updates `name`
- AC3.5: `DELETE /institution/:id` deletes the institution; accounts and
  banking integrations previously linked to it have `institutionId` set to
  `null` (via the `onDelete: SetNull` relation — verify Prisma applies this
  correctly for manual deletes, not just cascading FK deletes)
- AC3.6: All routes registered under `/api/v1/institution` and require
  authentication (same middleware stack as `tag.routes.ts`)

#### R4 — Account API: Accept & Return `institution_id`

Update `account.schema.ts` and `account.controller.ts`.

**Acceptance criteria:**
- AC4.1: `createAccountSchema` and `updateAccountSchema` accept optional
  `institution_id` (string, nullable)
- AC4.2: `createAccount` and `updateAccount` controllers persist
  `institutionId` when provided
- AC4.3: `getAccounts`, `getAccountById`, `createAccount`, `updateAccount` all
  include `institution: { id, name } | null` in their formatted response,
  fetched via a Prisma `include` (mirroring the existing `bankingIntegration:
  { select: { id, bankName, bankImageUrl, status } }` pattern at
  `account.controller.ts` ~L22-29)

---

### Backend — Pluggy Auto-Linking

#### R5 — Auto-Link `BankingIntegration` to an `Institution` on Connect

Update `createBankingIntegration` in `bankingIntegration.controller.ts`
(~L136-194).

**Acceptance criteria:**
- AC5.1: Before creating the `BankingIntegration` row, find an existing
  `Institution` for `(userId, bankName)`; create one if none exists
  (find-or-create, guarded by the `@@unique([userId, name])` constraint from
  R1)
- AC5.2: The new `BankingIntegration` is created with `institutionId` set to
  that Institution's id
- AC5.3: Connecting a second `BankingIntegration` with the same `bankName`
  for the same user reuses the existing `Institution` — no duplicate created

#### R6 — New Accounts Created From Pluggy Inherit `institutionId`

Update `createAccountFromPluggy` in `webhook.service.ts` (~L281-326) and its
two call sites (`handleItemUpdated` ~L113-117, `handleItemCreated` ~L267-269).

**Acceptance criteria:**
- AC6.1: `createAccountFromPluggy` receives (or looks up) the parent
  `BankingIntegration.institutionId` and sets it as the new `Account`'s
  `institutionId` at creation time
- AC6.2: `handleItemCreated` (which currently only selects `{ id, userId }`
  from the integration at ~L258-261) is updated to also select
  `institutionId` so it can be passed through
- AC6.3: Existing accounts already linked to a `BankingIntegration` are
  **not** touched by this requirement (that's covered by the one-off backfill
  in R7) — this requirement only governs newly-created accounts going forward

---

### Frontend — Data Layer

#### R8 — Institution Interface & Query/Mutation Hooks

**Acceptance criteria:**
- AC8.1: New `src/interfaces/institutions.ts` exports `InstitutionProps { id: string; name: string; createdAt?: string }`
- AC8.2: New `useInstitutionsQuery` hook (mirrors `useAccountsQuery` shape: `data`, `isLoading`, `refetch`, `isRefetching`), calling `GET institution`
- AC8.3: New `useInstitutionMutations` hook (mirrors `useTagMutations`) exposing `createInstitution`, `updateInstitution`, `deleteInstitution`, each invalidating the `institutions` and `accounts` query caches on success

#### R9 — `AccountProps` Interface Update

**Acceptance criteria:**
- AC9.1: `AccountProps` (`src/interfaces/accounts.ts` ~L40-52) gains `institution?: { id: string; name: string } | null`

---

### Frontend — Institution Management

#### R10 — Institutions Management Screen + Register Screen

Mirrors the existing `Categories` / `RegisterCategory` pattern structurally
(list screen + create/edit screen), reachable from `OptionsMenu` (or wherever
`Categories`/`Tags` are currently reachable from — match that entry point).

**Acceptance criteria:**
- AC10.1: New `screens/Institutions` lists all institutions via
  `useInstitutionsQuery`, each row navigable to edit
- AC10.2: New `screens/RegisterInstitution` — a name-only form (create/edit),
  using `useInstitutionMutations`
- AC10.3: Deleting an institution shows a confirmation `Alert` warning that
  its accounts will become ungrouped (not deleted)
- AC10.4: New routes registered under `app/(app)/accounts/` (or the
  equivalent location used for `Categories`), following existing route
  conventions in that `_layout.tsx`

---

### Frontend — Account Registration

#### R11 — Institution Picker in `RegisterAccount`

**Acceptance criteria:**
- AC11.1: `RegisterAccount` gains an institution `SelectButton` row (visual
  pattern consistent with the existing account-type selector), opening a
  `ModalViewSelection` bottom sheet listing institutions from
  `useInstitutionsQuery`
- AC11.2: The picker includes a "+ Nova instituição" row at the bottom (below
  the list) that reveals an inline name input; submitting it calls
  `createInstitution`, selects the newly created institution, and closes the
  inline input
- AC11.3: When `typeSelected` is `BANK`, `INVESTMENTS`, or `CREDIT`, the
  institution field is required — form validation blocks submission with an
  inline error if left empty
- AC11.4: When `typeSelected` is `WALLET`, `CRYPTOCURRENCY_WALLET`, or
  `OTHER`, the institution field is optional and the row may be visually
  de-emphasized (e.g., labeled "Instituição financeira (opcional)")
- AC11.5: If the inline quick-add (AC11.2) hits the `409`/duplicate-name
  response from AC3.2 (race condition: another request created the same name
  first), the frontend re-fetches institutions and selects the existing match
  by name, rather than surfacing an error to the user
- AC11.6: `handleRegisterAccount`/`handleEditAccount` payloads include
  `institution_id` (or `null`) when submitting
- AC11.7: Editing an existing account pre-fills the institution picker from
  `accountData.institution`

---

### Frontend — Accounts Screen

#### R12 — Group Accounts by Institution in the Main List

Update `processedData` and `_renderItem`/list rendering in
`screens/Accounts/index.tsx` (~L117-235, ~L306-374, ~L478-499).

**Acceptance criteria:**
- AC12.1: Non-credit-card accounts (`type !== 'CREDIT'`, same filter already
  used at ~L328/L482-484) are partitioned by `institutionId`
- AC12.2: For each institution with **2 or more** accounts in that partition,
  render a single new `InstitutionListItem` (name, aggregated balance,
  account count) in place of the individual account rows
- AC12.3: For institutions with **exactly 1** account in that partition, and
  for accounts with `institutionId: null`, render the existing
  `AccountListItem` unchanged (including tapping straight into the account
  via `handleOpenAccount`)
- AC12.4: The combined list (institution cards + standalone account cards) is
  sorted alphabetically by display name, with institution cards ordered
  before standalone account cards when names would otherwise interleave
  (i.e., two separate sort groups concatenated: institutions first, then
  standalone)
- AC12.5: Tapping an `InstitutionListItem` navigates to the new
  `InstitutionDetails` screen (R14) — it does **not** call `handleOpenAccount`

#### R13 — Institution Aggregated Balance Calculation

**Acceptance criteria:**
- AC13.1: An institution's aggregated balance is the sum of its non-credit-
  card accounts' `totalAccountAmountConverted` values (i.e., reusing the
  existing per-account currency-conversion logic at ~L132-151, applied before
  aggregation — no new conversion logic is written)
- AC13.2: The aggregated figure is formatted with `formatCurrency` the same
  way `totalBalanceFormatted` is today
- AC13.3: Credit card accounts belonging to the institution are excluded from
  this sum even though they carry the same `institutionId` (per context.md
  decision #6)

#### R14 — `InstitutionDetails` Screen

**Acceptance criteria:**
- AC14.1: New screen `screens/InstitutionDetails`, new route registered in
  `app/(app)/accounts/_layout.tsx` (mirroring the existing
  `bankingIntegrationDetails` route registration)
- AC14.2: New lightweight Zustand store `useCurrentInstitutionSelected`
  (mirrors `useCurrentAccountSelected`) carries `institutionId` and
  `institutionName` across the navigation, set by `InstitutionListItem`'s tap
  handler — no new network round-trip
- AC14.3: The screen filters the already-fetched `useAccountsQuery` cache
  client-side by `institutionId`, including credit card accounts (unlike the
  main Accounts screen list)
- AC14.4: Accounts are grouped into sections by `type`/`subtype`: "Contas"
  (BANK/CHECKING_ACCOUNT), "Poupança" (SAVINGS_ACCOUNT), "Investimentos",
  "Carteira" (WALLET), "Criptomoedas" (CRYPTOCURRENCY_WALLET), "Cartões de
  Crédito" (CREDIT/CREDIT_CARD) — omit empty sections
  Header shows the institution name and the same non-credit-card aggregated
  total computed in R13 (passed via the store or recomputed client-side from
  the filtered list — either is acceptable as long as the figure matches the
  main screen's card)
- AC14.5: Tapping an account row in this screen navigates to the existing
  `Account` screen exactly as `handleOpenAccount` does today

---

### Frontend — Credit Cards

#### R15 — Institution Label + Sort on Credit Card Carousel

Update `components/CreditCardListItem` and the credit-card `FlatList` in
`screens/Accounts/index.tsx` (~L500-546).

**Acceptance criteria:**
- AC15.1: `CreditCardListItem` displays the institution name as a small label
  (visually similar to how `AccountConnectedListItem` shows "Inst.
  Financeira: {bankName}") when `data.institution` is present; renders
  nothing extra when absent
- AC15.2: The credit card carousel's data is sorted alphabetically by
  `institution.name` (accounts without an institution sort after those with
  one, then alphabetically by account `name` as a tiebreaker/fallback) —
  this is a flat sort, not a grouped/sectioned carousel
- AC15.3: No subtotal, header, or visual sub-grouping is added to the
  carousel (explicitly deferred per context.md decision #5)

---

## Non-Requirements (out of scope for this feature)

- **Hierarchical/nested sub-accounts** — rejected approach, see context.md
- **Institution logos/branding/color** — phase 2; no `imageUrl` column is
  added speculatively now
- **Credit card carousel sub-grouping by institution with subtotals** —
  phase 2 candidate; phase 1 only adds a label + sort
- **Persisted collapse/expand UI state** — moot; superseded by navigation to
  `InstitutionDetails`
- **Institution rollups on any screen other than Accounts** (Home, Budgets,
  Reports) — explicitly out of scope per context.md decision #10
- **Belvo integration** — not built yet; this feature only ensures the
  `Institution` model and auto-linking logic are provider-agnostic in naming,
  not that Belvo is wired up
- **Forced backfill/grouping of manually-created accounts** — existing
  accounts stay ungrouped unless the user edits them

---

## Decisions

### AD-028 — `Institution` Decoupled From `BankingIntegration`

**Decision:** `Institution` is a new, standalone model — not an extension or
repurposing of `BankingIntegration`. They link via an optional
`institutionId` FK on `BankingIntegration`.

**Rationale:** `BankingIntegration`'s identity is "a Pluggy sync connection"
(required `pluggyIntegrationId`, `health`/`status`/`executionStatus` fields
describing connector state). Overloading it to also mean "a user-facing
grouping label" would conflate two independent lifecycles — a sync
connection can be deleted/re-authed without the user losing their "Itaú"
grouping, and manually-created accounts (no Pluggy connection at all) still
need to join an institution.

### AD-029 — Institution Uses UUID, Not Autoincrement Int

**Decision:** `Institution.id` is `String @id @default(uuid())`.

**Rationale:** `Institution` is user-owned reference/taxonomy data, matching
`Category`/`Tag`/`Budget` (all uuid) rather than transactional/integration
entities like `Account`/`Transaction`/`BankingIntegration` (all autoincrement
Int).

### AD-030 — Institution Rollup Excludes Credit Card Balances

**Decision:** An institution's aggregated balance (shown on its card and at
the top of `InstitutionDetails`) sums only non-credit-card accounts.

**Rationale:** A credit card's `balance` field represents debt, a different
unit of meaning than an asset balance. Folding it into one number would
either misrepresent "what I have" or require net-position framing the user
did not ask for. Matches the existing UI's treatment of credit cards as a
structurally separate concern.

### AD-031 — Single-Account Institutions Bypass the Card Wrapper

**Decision:** An institution with exactly one non-credit-card account
renders as a plain `AccountListItem`, not an `InstitutionListItem`.

**Rationale:** Wrapping a single account in an institution card adds a
mandatory extra tap (main list → details screen → account) for the common
case of "I only have one account there," with no grouping benefit.

---

## Affected Files

| File | Change |
|------|--------|
| **Backend — Schema** | |
| `smart-finances-backend/prisma/schema.prisma` | Add `Institution` model; add `institutionId` to `Account` and `BankingIntegration`; add `institutions` relation to `User` |
| `smart-finances-backend/prisma/migrations/*` | New migration for `institutions` table + FK columns |
| **Backend — API** | |
| `smart-finances-backend/src/schemas/institution.schema.ts` | New — create/update validation |
| `smart-finances-backend/src/controllers/institution.controller.ts` | New — CRUD handlers |
| `smart-finances-backend/src/routes/institution.routes.ts` | New — route registration |
| `smart-finances-backend/src/schemas/account.schema.ts` | Add optional `institution_id` |
| `smart-finances-backend/src/controllers/account.controller.ts` | Persist + return `institution_id` / `institution` in all formatted responses |
| `smart-finances-backend/src/controllers/bankingIntegration.controller.ts` | `createBankingIntegration` — find-or-create Institution, link it |
| `smart-finances-backend/src/services/webhook.service.ts` | `createAccountFromPluggy` + `handleItemCreated` — inherit `institutionId` |
| `smart-finances-backend/src/server.ts` (or route index) | Register `institution` routes |
| **Backend — Migration script** | |
| `smart-finances-backend/scripts/backfill-institutions.ts` (or equivalent) | New — one-off backfill for existing Pluggy users |
| **Frontend — Data layer** | |
| `SmartFinances/src/interfaces/institutions.ts` | New — `InstitutionProps` |
| `SmartFinances/src/interfaces/accounts.ts` | Add `institution?` to `AccountProps` |
| `SmartFinances/src/hooks/useInstitutionsQuery.ts` | New |
| `SmartFinances/src/hooks/useInstitutionMutations.ts` | New |
| `SmartFinances/src/stores/currentInstitutionSelectedStorage.ts` | New — Zustand store |
| **Frontend — Institution management** | |
| `SmartFinances/src/screens/Institutions/index.tsx` + `styles.ts` | New |
| `SmartFinances/src/screens/RegisterInstitution/index.tsx` + `styles.ts` | New |
| **Frontend — Account registration** | |
| `SmartFinances/src/screens/RegisterAccount/index.tsx` | Institution picker + inline quick-add + conditional required validation + payload fields |
| `SmartFinances/src/components/InstitutionSelect/` | New — picker list component (mirrors `CategorySelect`) |
| **Frontend — Accounts screen** | |
| `SmartFinances/src/screens/Accounts/index.tsx` | Grouping logic in `processedData`, new render branch, sort order |
| `SmartFinances/src/components/InstitutionListItem/index.tsx` + `styles.ts` | New |
| `SmartFinances/src/components/CreditCardListItem/index.tsx` | Institution label |
| `SmartFinances/src/screens/InstitutionDetails/index.tsx` + `styles.ts` | New |
| `SmartFinances/src/app/(app)/accounts/_layout.tsx` | Register `institutionDetails` (+ `institutions`/`registerInstitution` if not nested elsewhere) route(s) |
| `SmartFinances/src/app/(app)/accounts/institutionDetails.tsx` | New route file |

## Total Requirements / Estimated Tasks

16 requirements (R1–R15, with R7 numbered alongside schema work), ~30-35
atomic tasks once broken down — backend (~12) + frontend (~20). Given this
exceeds the ~8-task single-batch threshold, Execute should use sub-agent
delegation split along the backend/frontend boundary (each repo's tasks are
largely independent except for the API contract in R4/R8/R9, which should
land before frontend consumption tasks begin).
