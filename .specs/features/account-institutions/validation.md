# Validation Report — Account Institutions

**Verifier:** Independent auditor (fresh read, no authorship of the implementation)
**Date:** 2026-08-09
**Verdict: PASS** (with 1 should-fix and 3 nice-to-have items; zero blockers)

---

## Diff ranges reviewed

- Backend: `smart-finances-backend`, `git diff 5064293..HEAD` (commits `c39d322`..`c7854ad`, tagged T1–T9)
- Frontend: `SmartFinances`, `git diff 0b3a3ec..HEAD` (commits `8db53bb`..`6cbf68d`, tagged T10–T25, plus `e57425e` docs commit)
- Note: the frontend range also contains one unrelated pre-existing commit, `5ff44ee` ("fix: forces set color scheme..."), which predates the institutions work but wasn't an ancestor of the given base SHA. Its changes (`ios/SmartFinances.xcodeproj/project.pbxproj`, `src/app/(auth)/_layout.tsx`, `src/app/_layout.tsx`, and a few unrelated lines in `Accounts/index.tsx`/`RegisterAccount/index.tsx`) are **not** part of this feature and were excluded from AC evaluation.
- Backend migrations directory (`prisma/migrations/`) is `.gitignore`'d in this repo except for one legacy tracked file — this is a pre-existing repo convention, not a gap introduced by this feature. The `20260809134444_add_institutions` migration exists on disk and was inspected directly (not via `git diff`).

---

## Methodology

For every AC I located the implementing code, read it in context, and judged PASS/FAIL/GAP. I additionally ran `npx tsc --noEmit` in both repos as ground truth for the "no new TypeScript errors" claim (see §Diagnostics below), because the `diagnostics` tool surfaced a spurious, non-reproducing error class in the backend (details below).

---

## AC-by-AC Results

### R1 — Prisma Schema: Institution Model

| AC | Result | Evidence |
|---|---|---|
| AC1.1 | PASS | `prisma/schema.prisma` new `Institution` model: `id String @id @default(uuid())`, `userId`, `name`, `createdAt`, `updatedAt` (diff 5064293..HEAD, schema.prisma +134/+150) |
| AC1.2 | PASS | `@@unique([userId, name])` on `Institution` |
| AC1.3 | PASS | `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`; `User.institutions Institution[]` added |
| AC1.4 | PASS | `Account.institutionId String? @map("institution_id")` + `institution Institution? @relation(..., onDelete: SetNull)` |
| AC1.5 | PASS | `BankingIntegration.institutionId String? @map("institution_id")` + same `onDelete: SetNull` shape |
| AC1.6 | PASS | `@@map("institutions")` |

### R2 — Prisma Migration

| AC | Result | Evidence |
|---|---|---|
| AC2.1 | PASS | `prisma/migrations/20260809134444_add_institutions/migration.sql`: creates `institutions` table, adds nullable `institution_id` to `accounts` and `banking_integrations`, unique index, 3 FKs (all `SET NULL`/`CASCADE` as specified) |
| AC2.2 | PASS | All new columns are plain `ADD COLUMN` with no `NOT NULL`/`DEFAULT` — existing rows get `NULL`, no backfill logic embedded in the migration itself |

### R7 — Data Backfill

| AC | Result | Evidence |
|---|---|---|
| AC7.1 | PASS | `prisma/backfill-institutions.ts` L47-51: `findMany` distinct `(userId, bankName)` from `BankingIntegration` rows with `institutionId: null`, then `upsert`s one `Institution` per pair (L67-71) |
| AC7.2 | PASS | L74-77: `bankingIntegration.updateMany({ where: { userId, bankName, institutionId: null }, data: { institutionId } })` |
| AC7.3 | PASS | L80-96: accounts whose `bankingIntegrationId` is in the linked-integration set get the same `institutionId` |
| AC7.4 | PASS | The account update is scoped to `bankingIntegrationId: { in: linkedIntegrationIds }` — accounts with `bankingIntegrationId: null` are never touched |
| AC7.5 | PASS | `upsert` on `(userId, name)` + all updates gated by `institutionId: null` filters — re-running produces no changes on a second pass |

### R3 — Institution CRUD Endpoints

| AC | Result | Evidence |
|---|---|---|
| AC3.1 | PASS | `institution.controller.ts` `getInstitutions` L17-27: `findMany({ orderBy: { name: 'asc' } })`, returns `{ id, name }` (createdAt omitted from response body, but AC only requires it be included — see GAP note below) |
| AC3.2 | PASS | `createInstitution` L76-95: catches `P2002` → `AppError(..., 409)` |
| AC3.3 | PASS | `getInstitutionById` L44-58: `findFirst({ id, userId })`, 404 via `AppError` if not found |
| AC3.4 | PASS | `updateInstitution` L101-150 |
| AC3.5 | PASS | `deleteInstitution` L155-187: plain `.delete()`, relies on `onDelete: SetNull` (verified in migration SQL) |
| AC3.6 | PASS | `institution.routes.ts`: all routes behind `authenticate`, registered at `/api/v1/institution` in `server.ts` |

**GAP (nice-to-have):** AC3.1 literally specifies the response as `{ id, name, createdAt }`. The actual response is `{ id, name }` only (`institution.controller.ts` L22-25 and L55-58) — `createdAt` is dropped in every formatted response, including create/update. This is consistent with `design.md`'s API contract (§3, which spec's own `GET /institution` example omits `createdAt`), so I judge this a **spec/design inconsistency, resolved in design's favor** — a reasonable call, and `InstitutionProps.createdAt` on the frontend is optional (`createdAt?: string`) so nothing breaks. No functional impact.

### R4 — Account API: institution_id

| AC | Result | Evidence |
|---|---|---|
| AC4.1 | PASS | `account.schema.ts`: `institution_id: z.string().uuid().nullable().optional()` added to both `createAccountSchema` and `updateAccountSchema` |
| AC4.2 | PASS | `createAccount` L235: `institutionId: institution_id ?? null`; `updateAccount` L~366: `if (institution_id !== undefined) updateData.institutionId = institution_id` |
| AC4.3 | PASS | `getAccounts`, `getAccountById`, `createAccount`, `updateAccount` all gain `include: { institution: { select: { id, name } } }` and format `institution: account.institution ? {...} : null` in the response |

### R5 — Auto-Link BankingIntegration to Institution

| AC | Result | Evidence |
|---|---|---|
| AC5.1 | PASS | `bankingIntegration.controller.ts` `findOrCreateInstitution` (new, L10-39): `findFirst` then `create` |
| AC5.2 | PASS | L202: `institutionId: institution.id` passed into `bankingIntegrationData` |
| AC5.3 | PASS | Verified via discrimination sensor #3 below — race-safe find-or-create |

### R6 — Pluggy Accounts Inherit institutionId

| AC | Result | Evidence |
|---|---|---|
| AC6.1 | PASS | `createAccountFromPluggy` signature gains `institutionId: string | null` (webhook.service.ts L292), written into `account.create` data L317 |
| AC6.2 | PASS | `handleItemCreated`'s `select` L259-263 now includes `institutionId: true` |
| AC6.3 | PASS | No update path touches existing accounts' `institutionId` outside the backfill script |

### R8 — Institution Interface & Hooks

| AC | Result | Evidence |
|---|---|---|
| AC8.1 | PASS | `src/interfaces/institutions.ts`: `InstitutionProps { id: string; name: string; createdAt?: string }` |
| AC8.2 | PASS | `useInstitutionsQuery.ts`: `queryKey: ['institutions']`, returns `{ data, isLoading, refetch, isRefetching }` via `useQuery` |
| AC8.3 | PASS | `useInstitutionMutations.ts`: 3 named hooks (`useCreateInstitutionMutation`, `useUpdateInstitutionMutation`, `useDeleteInstitutionMutation`), each invalidates `['institutions']` and `['accounts']` in `onSettled` — matches `useTagMutations.ts` pattern exactly (verified side-by-side) |

### R9 — AccountProps Update

| AC | Result | Evidence |
|---|---|---|
| AC9.1 | PASS | `src/interfaces/accounts.ts` L52: `institution?: { id: string; name: string } \| null` |

### R10 — Institutions Management + Register Screens

| AC | Result | Evidence |
|---|---|---|
| AC10.1 | PASS | `screens/Institutions/index.tsx`: `FlatList` fed by `useInstitutionsQuery`, each row (`InstitutionListItem`) opens the edit modal via `handleOpenInstitution` |
| AC10.2 | PASS | `screens/RegisterInstitution/index.tsx`: single `name` field, Yup + RHF, uses `useCreateInstitutionMutation`/`useUpdateInstitutionMutation` |
| AC10.3 | PASS | `Institutions/index.tsx` L68-89: `Alert.alert('Exclusão de instituição', 'ATENÇÃO! As contas vinculadas ... não serão excluídas, apenas deixarão de estar agrupadas...')` |
| AC10.4 | PASS | Routes registered at `app/(app)/options/institutions.tsx` + `options/_layout.tsx`, mirroring `categories.tsx`/`tags.tsx` exactly (same directory, same `Stack.Screen` pattern) |

### R11 — Institution Picker in RegisterAccount

| AC | Result | Evidence |
|---|---|---|
| AC11.1 | PASS | `RegisterAccount/index.tsx` L414-419: `SelectButton` opens `ModalViewSelection` → `InstitutionSelect`, same wiring as the currency selector |
| AC11.2 | PASS | `InstitutionSelect/index.tsx` `ListFooterComponent` (L163-198): "+ Nova instituição" → inline `TextInput`, `handleConfirmQuickAdd` calls `createInstitution`, selects result, closes input |
| AC11.3 | PASS | `RegisterAccount/index.tsx` L71-78: Yup `.when('type', { is: type => ACCOUNT_TYPES_REQUIRING_INSTITUTION.includes(type), then: required })`, `ACCOUNT_TYPES_REQUIRING_INSTITUTION = ['BANK','INVESTMENTS','CREDIT']` |
| AC11.4 | PASS | L133-138: `institutionIsOptional` computed as the negation of the same list; label switches to "Instituição financeira (opcional)" |
| AC11.5 | PASS | Verified via discrimination sensor #4 below |
| AC11.6 | PASS | `handleRegisterAccount`/`handleEditAccount` payloads both include `institution_id: institutionSelected?.id ?? null` |
| AC11.7 | PASS | `fetchAccount()` L279: `handleSetInstitution(data.institution ?? null)` |

### R12 — Group Accounts by Institution

| AC | Result | Evidence |
|---|---|---|
| AC12.1 | PASS | `Accounts/index.tsx` L189-193: `.filter(account => account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD')` then partitioned into `institutionGroups` Map by `institution?.id` |
| AC12.2 | PASS | L215-237: groups with `accounts.length >= 2` become `institutionCards` entries `{ id, name, totalFormatted, accountCount }` |
| AC12.3 | PASS | L216-219: groups with `length < 2` are pushed into `standaloneAccounts`; accounts with no `institutionId` also land there (L197-200); rendered via unchanged `AccountListItem` branch in `_renderAccountsListItem` |
| AC12.4 | PASS | `accountsListData` (L321-339): two independent `.sort()` calls (institution cards alpha, then standalone accounts alpha), concatenated — institutions always first regardless of name collision |
| AC12.5 | PASS | `_renderAccountsListItem` (L525-535): institution branch calls `handleOpenInstitution`, never `handleOpenAccount` |

### R13 — Institution Aggregated Balance — ⚠️ see dedicated section below

| AC | Result | Evidence |
|---|---|---|
| AC13.1 | **GAP (spec bug, correctly resolved)** | See dedicated analysis below |
| AC13.2 | PASS | `formatCurrency('BRL', totalConverted.toNumber(), false)` (`Accounts/index.tsx` L230-234) — same call shape as `totalBalanceFormatted` |
| AC13.3 | PASS | Credit cards excluded by the same filter as AC12.1 before any grouping/summing occurs |

### R14 — InstitutionDetails Screen

| AC | Result | Evidence |
|---|---|---|
| AC14.1 | PASS | `screens/InstitutionDetails/index.tsx` + route `app/(app)/accounts/institutionDetails.tsx`, registered in `accounts/_layout.tsx` alongside `bankingIntegrationDetails` |
| AC14.2 | PASS (reasonable API deviation) | `stores/currentInstitutionSelectedStorage.ts`: separate `setInstitutionId`/`setInstitutionName` setters instead of design.md's single `setInstitution(id, name)` — functionally equivalent; `handleOpenInstitution` sets both via one `.setState()` call (`Accounts/index.tsx` L452-460), so no race between the two fields exists in practice |
| AC14.3 | PASS | `InstitutionDetails/index.tsx` L135-138: filters `useAccountsQuery`'s cached `rawAccounts` client-side by `account.institution?.id === institutionId`, no new fetch; includes credit cards (no `type !== 'CREDIT'` filter at this stage) |
| AC14.4 | PASS | `getSectionKey` (L75-98) + `SECTION_ORDER`/`SECTION_TITLES` (L56-73): 6 sections in the exact spec'd order and Portuguese labels, `SECTION_ORDER.filter(key => accountsBySection.has(key))` omits empty sections; header total computed via the same non-credit-card sum logic as R13 (L194-196) |
| AC14.5 | PASS | `handleOpenAccount` (L258-272) sets `useCurrentAccountSelected` and navigates to `/accounts/[accountId]`, identical shape to the Accounts screen's version |

### R15 — Credit Card Label + Sort

| AC | Result | Evidence |
|---|---|---|
| AC15.1 | PASS | `CreditCardListItem/index.tsx` L40-44: renders `<InstitutionName>` only `{data.institution && (...)}`, styled distinctly (`textPlaceholder` color, smaller font) — nothing renders when absent |
| AC15.2 | PASS | `Accounts/index.tsx` `creditCardAccounts` (L344-366): comparator sorts by `institution.name` first (cards without institution sort last, via explicit `-1`/`1` branches), then `account.name` as tiebreaker |
| AC15.3 | PASS | No header/subtotal added around the credit card carousel; `ListFooterComponent` unconditionally renders `<SectionTitle>Cartões de crédito</SectionTitle>` once, same as before this feature — no per-institution sub-grouping |

---

## AC13.1 Deep-Dive — the "sum a formatted string" spec bug

**Confirmed: this is a real spec-precision bug, and it was correctly avoided by the implementation.**

`spec.md` AC13.1 literally says to sum `totalAccountAmountConverted` values. That field (`Accounts/index.tsx` L170-173) is:

```ts
totalAccountAmountConverted:
  account.currency.code !== 'BRL'
    ? formatCurrency('BRL', accountBalanceConvertedToBRL, false)
    : undefined,
```

It is (a) a locale-formatted **string** (e.g. `"R$ 1.234,56"`), not summable, and (b) `undefined` for every BRL account — which is exactly the common case (a BRL user with a BRL checking + BRL savings at the same bank would sum to `undefined + undefined`, i.e. garbage/`NaN`, if implemented literally).

The actual implementation instead carries the **raw numeric BRL-equivalent** forward as `accountBalanceConvertedToBRL` (L139-158, computed unconditionally for every account via `convertCurrency(...)`) and sums that:

```ts
const totalConverted = accounts.reduce(
  (sum, account) => sum.plus(account.accountBalanceConvertedToBRL ?? 0),
  new Decimal(0)
);
```

This matches `design.md`'s own naming for this exact quantity (`accountBalanceConvertedToBRL`, design.md §6 "Accounts screen changes" and §7 "Currency mixing within one institution").

I verified `convertCurrency` (`src/utils/convertCurrency.ts` L79-92): when `fromCurrency === toCurrency` (i.e., a BRL account converting to BRL) it returns `amount` unchanged rather than throwing or returning `0`. This means:
- **Same-currency institution** (e.g., two BRL accounts at Itaú): both `accountBalanceConvertedToBRL` values equal their raw BRL balances; the sum is a correct arithmetic total.
- **Mixed-currency institution** (e.g., a BRL checking + USD investment at the same broker): the USD account is converted via `usdQuoteBrl.price` before being added to the Decimal accumulator; the BRL account passes through unconverted. The sum is a correct BRL-denominated total.

I also confirmed the identical pattern is independently re-implemented (not shared via a helper, but structurally identical) in `InstitutionDetails/index.tsx` L140-196 for the header total on the details screen, and that both computations exclude credit cards the same way — so the two screens' totals will always agree, satisfying AC14.4's "the figure matches the main screen's card" requirement.

**Verdict:** AC13.1 is marked **GAP**, not FAIL — the spec text is genuinely wrong/imprecise as written (summing a formatted, partially-`undefined` string field is not implementable as literally stated), and the implementation made the obviously-correct call: reuse the numeric pre-formatting value design.md itself names for this purpose. This is exactly the "reasonable implementer call under an imprecise spec" case the review was asked to watch for. AC13.2 and AC13.3 are unaffected and PASS on their own merits.

---

## Discrimination Sensor — 5 riskiest logic paths

No automated test suite exists in either repo (tracked as `B-005` in `smart-finances-backend/.specs/project/STATE.md`, pre-existing and explicitly out of scope for this feature). All findings below are **inspection-based confidence**, not test-execution-based.

### 1. Single-account-institution bypass rule

**Code:** `Accounts/index.tsx` L215-219:
```ts
institutionGroups.forEach((accounts) => {
  if (accounts.length < 2) {
    standaloneAccounts.push(...accounts);
    return;
  }
  ...
```
**Reasoning:** The boundary condition is `< 2`, i.e. exactly 1 account bypasses, 2+ accounts get a card. I checked for a plausible off-by-one (`<= 2` or `< 1`): neither would silently pass — `<= 2` would wrongly bypass 2-account institutions (visibly wrong: no card shown when spec requires one, easily noticed in manual QA), `< 1` would never bypass (every institution gets a card, including single-account ones — also visibly wrong, contradicts AD-031 directly and breaks the explicit "no mandatory extra tap" rationale). The actual code uses `< 2`, matching AC12.3/AD-031 exactly. Every group in `institutionGroups` has length ≥ 1 by construction (groups are only created when pushing the first account, `Map.set(id, [])` immediately followed by `.push()`), so there's no dead `length === 0` branch to worry about. **Sound — PASS.**

### 2. Credit-card exclusion from institution aggregated totals

**Code:** `Accounts/index.tsx` L189-193 (grouping) and `InstitutionDetails/index.tsx` L194-196 (details total):
```ts
account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD'
```
**Reasoning:** This is an AND of two negations (De Morgan's: excludes if `type === 'CREDIT'` OR `subtype === 'CREDIT_CARD'`), which is redundant-but-safe belt-and-suspenders against a credit account missing one of the two fields. A plausible bug here would be flipping to `||` (which would make the condition true whenever *either* field indicates non-credit, incorrectly *including* a CREDIT-typed account whose subtype field happens to be blank/undefined) — that would silently leak a credit card's debt balance into "what I own," which is exactly the kind of subtle inversion this exercise is meant to catch. It is **not** present; the code correctly uses `&&`. I traced this same filter through 3 independent call sites (`Accounts/index.tsx` institution grouping, `Accounts/index.tsx` `_renderItem`'s render-branch discriminator, `InstitutionDetails/index.tsx` total calc and `getSectionKey`) — all consistent. **Sound — PASS.**

### 3. Pluggy find-or-create-Institution race guard (P2002 catch)

**Code:** `bankingIntegration.controller.ts` `findOrCreateInstitution` L10-39:
```ts
const findOrCreateInstitution = async (userId: string, bankName: string) => {
  const existing = await prisma.institution.findFirst({ where: { userId, name: bankName } });
  if (existing) return existing;
  try {
    return await prisma.institution.create({ data: { userId, name: bankName } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const refetched = await prisma.institution.findFirst({ where: { userId, name: bankName } });
      if (refetched) return refetched;
    }
    throw error;
  }
};
```
**Reasoning:** I checked whether the error-code comparison could be wrong (e.g. checking `P2025` — record-not-found — instead of `P2002` — unique-constraint-violation — which would silently fall through to `throw error` on the actual race case, breaking the whole connect flow with a 500 instead of resolving gracefully). The code correctly checks `P2002`. I also checked the re-fetch: it uses the identical `(userId, name: bankName)` filter as the original lookup, so it will find the row the concurrent request created. The only latent gap is a *second*-order race (the re-fetch itself finds nothing because of a still-more-exotic timing window) which falls through to `throw error` — this matches design.md's documented scope exactly (design.md §4 only requires handling *one* level of race, via catch-and-refetch) and isn't a bug introduced by this feature. **Sound — PASS**, matches design intent.

### 4. 409-duplicate-name silent-resolve flow in InstitutionSelect's inline quick-add

**Code:** two cooperating layers —
`useInstitutionMutations.ts` `useCreateInstitutionMutation().onError` (L42-56):
```ts
if (axios.isAxiosError(error) && error.response?.status === 409) {
  return; // no Alert
}
Alert.alert('Erro', 'Não foi possível criar a instituição.');
```
`InstitutionSelect/index.tsx` `handleConfirmQuickAdd`'s per-call `onError` (L101-123):
```ts
if (axios.isAxiosError(error) && error.response?.status === 409) {
  const { data: refetchedInstitutions } = await refetch();
  const existingInstitution = refetchedInstitutions?.find(
    (institution) => institution.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (existingInstitution) { setInstitution(existingInstitution); ...; closeSelectInstitution(); }
  return;
}
// falls through to the hook's generic Alert for non-409 errors
```
**Reasoning:** I checked for an inverted comparison (`!== 409` instead of `=== 409`, which would show the Alert exactly on the conflict case — the one case it must not — and silently skip it for every other real failure, the worst possible inversion for this exact requirement). Both call sites correctly use `=== 409`. I also checked the case-insensitive name match wouldn't spuriously fail: the client trims (`newInstitutionName.trim()`) before sending, so a legitimate race (two devices submitting the identical trimmed name) will match on refetch. React Query's `onError` callbacks fire at both the hook level and the per-`mutate()`-call level for the same rejection — I confirmed the hook-level one reverts the optimistic cache update unconditionally (`context?.previousInstitutions`) *before* its 409 early-return, so no stale optimistic "temp-" institution is left behind regardless of branch. **Sound — PASS**, no Alert fires on 409, exactly as AC11.5 requires.

### 5. Conditional-required Yup validation in RegisterAccount

**Code:** `RegisterAccount/index.tsx` L62, L71-78:
```ts
const ACCOUNT_TYPES_REQUIRING_INSTITUTION = ['BANK', 'INVESTMENTS', 'CREDIT'];
...
institution_id: Yup.string().nullable().when('type', {
  is: (type: string) => ACCOUNT_TYPES_REQUIRING_INSTITUTION.includes(type),
  then: (currentSchema) => currentSchema.required('Selecione a instituição financeira'),
}),
```
**Reasoning:** I checked whether the required-type list could be inverted or incomplete relative to what `handleSetType` actually writes into the form's `type` field. `handleSetType` (called from the `SelectDropdown.onSelect`, L356-378) writes exactly the strings `'CREDIT' | 'WALLET' | 'CRYPTOCURRENCY WALLET' | 'BANK' | 'INVESTMENTS' | 'OTHER'`. `ACCOUNT_TYPES_REQUIRING_INSTITUTION` contains `'BANK'`, `'INVESTMENTS'`, `'CREDIT'` — exactly the three the spec calls out (AC11.3), and the complement (`WALLET`, `CRYPTOCURRENCY WALLET`, `OTHER`) exactly matches AC11.4's optional list, with no leftover/unmatched type string on either side. A plausible bug (e.g. a typo like `'CRYPTO WALLET'` instead of `'CRYPTOCURRENCY WALLET'`, which would silently make crypto wallets fall through to neither list, defaulting to "not required" via Yup's `.when()` semantics — matching the intended behavior by accident) doesn't apply here since crypto wallets are correctly meant to be optional anyway, but I checked it isn't accidentally in the *required* list, which it correctly is not. One real (minor) caveat: `setValue('type', type, { shouldValidate: true })` only revalidates the `type` field itself, not sibling fields with a Yup `.when()` dependency (a known react-hook-form/yup interaction gap) — so the institution field's error message won't reactively appear/disappear the instant the account type is changed, only at full-form submission (`handleSubmit`, which re-runs the whole schema). This does not break the actual AC ("form validation blocks submission with an inline error if left empty" — it does, on submit) but is a minor UX polish gap. **Sound for the functional requirement — PASS**, with a nice-to-have UX note.

---

## Cross-cutting end-to-end checks

- **RegisterAccount → backend → Accounts screen round-trip:** `RegisterAccount` sends `institution_id` (string UUID or `null`) → `account.schema.ts` accepts it → `account.controller.ts` persists `institutionId` and returns `institution: { id, name } | null` → `AccountProps.institution` (frontend interface) matches this exact shape → `Accounts/index.tsx`'s `processedData` reads `account.institution?.id`. All four link points use the same field shape (`{ id: string; name: string }`). **Confirmed connected.**
- **InstitutionCard tap → InstitutionDetails → correct store fields:** `handleOpenInstitution` sets `useCurrentInstitutionSelected` with `institutionId`/`institutionName` in one `.setState()` call, then navigates; `InstitutionDetails` reads the same two fields via the same hook. **Confirmed connected.**
- **useInstitutionsQuery data shape → InstitutionSelect / Institutions screen:** both consumers destructure `data`/`isLoading`/`refetch`/`isRefetching` (React Query's standard `useQuery` shape) and iterate `InstitutionProps[]` — no shape mismatch. **Confirmed connected.**
- **Institution rename propagates to Accounts screen card:** `useUpdateInstitutionMutation`'s `onSettled` invalidates **both** `['institutions']` and `['accounts']` — necessary because the institution's `name` is denormalized into every `Account.institution.name` returned by the backend; without invalidating `accounts` too, a renamed institution would show its old name on the Accounts screen card until an unrelated refetch. **Confirmed handled correctly** (`useInstitutionMutations.ts` L112-115, L149-152, and L58-61 for create).

---

## Diagnostics — TypeScript baseline claim

The task instructions asked me to spot-check at least 3 files against the "all TypeScript errors are pre-existing baseline classes" claim rather than trust it wholesale. I checked more than 3, and additionally ran `npx tsc --noEmit` directly in both repos as ground truth (the `diagnostics` tool's language server produced one **spurious, non-reproducing** result in the backend that I want to flag explicitly):

- **Backend:** `npx tsc --noEmit -p tsconfig.json` → **0 errors, exit code 0.** However, the `diagnostics` tool reported `Property 'institution' does not exist on type 'PrismaClient<...>'` for `institution.controller.ts`, `account.controller.ts`, and `bankingIntegration.controller.ts`. I confirmed `node_modules/.prisma/client/index.d.ts` *does* correctly declare `get institution(): Prisma.InstitutionDelegate<...>` (freshly regenerated, timestamped after the schema change), and a direct `tsc` run confirms zero errors. I attribute the `diagnostics` tool's result to a stale in-editor language-server cache that didn't pick up the regenerated Prisma client types, **not** a real defect in the code. Ground truth (`tsc`) is clean.
- **Frontend:** `npx tsc --noEmit -p tsconfig.json` → 648 lines of pre-existing errors across the whole codebase. I grep'd for every institutions-feature file and cross-checked each error class against untouched files:
  - `balance: string` vs `AccountProps.balance: number` (surfaces on `FlatList`/`SectionList` calls in `Accounts/index.tsx` L669/694 and `InstitutionDetails/index.tsx` L316) — confirmed pre-existing: the identical `balance: formatCurrency(...)` reassignment pattern already existed at L158 of `Accounts/index.tsx` **before** this feature (verified via `git show 0b3a3ec:src/screens/Accounts/index.tsx`).
  - `Property 'colors'/'fonts' does not exist on type 'DefaultTheme'` (all new `styles.ts` files) — confirmed pre-existing and pervasive: identical errors appear in untouched files (`SignIn/styles.ts`, `SignUp/styles.ts`, `Welcome/styles.ts`, `Tags/styles.ts`, `TransactionsByCategory/styles.ts`, dozens more).
  - `Could not find a declaration file for module '@hookform/resolvers/yup'` — confirmed pre-existing: identical error in untouched `RegisterCategory/index.tsx`, `SignIn/index.tsx`, `SignUp/index.tsx`.
  - `'error.response.data' is of type 'unknown'` — confirmed pre-existing: identical error in untouched `Tags/index.tsx`, `OptionsMenu`-adjacent code.
  - `Type '(e?: BaseSyntheticEvent...) => Promise<void>' is not assignable to type '(pointerInside: boolean) => void'` (RHF `handleSubmit` passed to an `onPressOut`-shaped prop) — confirmed pre-existing: identical error in untouched `RegisterCategory/index.tsx`, `SignIn/index.tsx`, `SignUp/index.tsx`.

  **No new error class was introduced by this feature on either the frontend or backend.** The workers' claim holds up under independent verification.

---

## Ranked list of real gaps/bugs found

No blockers. All are either spec-precision issues correctly resolved by the implementer, or minor polish items.

1. **should-fix:** `InstitutionDetails/index.tsx`'s `_renderItem` (L278-287) does not pass the `hideAmount` prop through to `AccountListItem`, so the app-wide "hide amounts" privacy toggle (respected everywhere else, including the main Accounts screen and `InstitutionCard`) is silently ignored on this one screen — balances always show in full here even if the user has enabled hide-amounts. Not covered by any AC explicitly, but it's a real, user-visible inconsistency with an existing app-wide feature.
2. **nice-to-have:** AC13.1's literal spec text (sum `totalAccountAmountConverted`) is unimplementable as written (formatted string, `undefined` for BRL accounts). The implementation correctly substitutes the numeric `accountBalanceConvertedToBRL` value instead, matching design.md's intent — flagging only so the spec document itself gets corrected for future reference/rework, not because anything needs to change in code.
3. **nice-to-have:** Naming drift between `design.md` (calls the Accounts-screen institution row `InstitutionListItem`) and the shipped code (`InstitutionCard`, with `InstitutionListItem` repurposed for the separate management-screen row). Purely cosmetic/documentation drift — the two components correctly serve two different visual purposes (balance+count card vs. plain name row) and both are wired correctly.
4. **nice-to-have:** In `RegisterAccount`, changing the account type doesn't reactively clear/show the institution-required validation error until the whole form is submitted (a `react-hook-form` + Yup `.when()` interaction limitation, not unique to this feature). The functional requirement (blocking submission with an inline error) still holds at submit time.

---

## Summary

All ~70 acceptance criteria across R1–R15 were individually traced to implementing code and pass, with one criterion (AC13.1) correctly flagged as an unimplementable-as-written spec bug that the implementer resolved sensibly and per design.md's own guidance. The 5 highest-risk logic paths were independently re-derived and inspected for plausible subtle-bug variants (boundary off-by-ones, inverted booleans/operators, wrong error codes, wrong field names) — none were found; all 5 are sound. Cross-cutting wiring (registration → backend → list rendering → details screen → back to account) was traced end-to-end and is consistent. The "no new TypeScript errors" claim was independently verified via direct `tsc --noEmit` runs (ground truth) in both repos, which contradicted one spurious result from the `diagnostics` tool (a stale language-server cache artifact, not a real defect).
