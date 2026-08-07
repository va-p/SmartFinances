# Endpoint Migration — Frontend API Alignment with Backend

**Status:** Specify → Design
**Date:** 2026-08-06
**Scope:** Large (16 outdated endpoint calls across 10+ files, + backend changes for transaction images)

## Summary

After migrating from Xano BaaS to a custom Node.js/Express backend, many frontend API calls still use the old Xano-style URL patterns (e.g., `user_config/edit_hide_amount`, `account/single?account_id=x`, `tag/edit`). These calls will 404 against the new backend. Additionally, several `POST` calls should be `PATCH`/`PUT` to match the backend's RESTful routes, and one endpoint (`transaction/image`) has no backend equivalent and needs to be created.

---

## Requirements

### R1 — User Config Toggles (hide_amount, insights, use_local_authentication)

**Current (broken):**
- `POST user_config/edit_hide_amount` with `{ user_id, hide_amount }` (Home, OptionsMenu, Accounts)
- `POST user_config/edit_insights` with `{ user_id, insights }` (OptionsMenu)
- `POST user_config/edit_use_local_auth` with `{ user_id, use_local_authentication }` (OptionsMenu)

**Target:** `PATCH /user/:id/configs` with the relevant toggle field in the body.

**Affected files:**
- `src/screens/Home/index.tsx` — `handleHideData()` (line ~399)
- `src/screens/OptionsMenu/index.tsx` — `handleChangeHideAmount()` (line ~110), `handleChangeSmartInsights()` (line ~144), `handleChangeUseLocalAuth()` (line ~170)
- `src/screens/Accounts/index.tsx` — `handleHideData()` (line ~284)

**Acceptance criteria:**
- AC1.1: All 5 calls use `PATCH user/{userId}/configs` with the correct field name matching the backend schema
- AC1.2: `user_id` is removed from request body (derived from `:id` URL param)
- AC1.3: Response status check remains `=== 200`
- AC1.4: Local MMKV storage update and Zustand state setter calls are preserved unchanged
- AC1.5: Alert messages and error handling are preserved unchanged

### R2 — Account Hide Toggle (hide_account)

**Current (broken):**
- `POST user_config/edit_hide_account` with `{ account_id, hide }` (RegisterAccount)

**Target:** `PATCH /account/:id` with `{ hide: boolean }` in the body.

**Affected files:**
- `src/screens/RegisterAccount/index.tsx` — `handleHideAccount()` (line ~248)

**Acceptance criteria:**
- AC2.1: Call uses `PATCH account/{accountId}` with `{ hide: !hideAccount }` in body
- AC2.2: URL param `accountId` derived from the component's `id` prop
- AC2.3: Alert and state behavior preserved unchanged

### R3 — Account Fetch (single account by ID)

**Current (broken):**
- `GET account/single?account_id=x` (RegisterAccount)

**Target:** `GET /account/:id`

**Affected files:**
- `src/screens/RegisterAccount/index.tsx` — `fetchAccount()` (line ~220)

**Acceptance criteria:**
- AC3.1: Call uses `GET account/{id}` (URL param, not query param)
- AC3.2: Response data destructuring preserved (`setValue` calls)
- AC3.3: Error handling preserved unchanged

### R4 — Account List (manual accounts)

**Current (broken):**
- `GET account/manual_accounts?user_id=x` (AccountsList)

**Target:** `GET /account` (user filtered server-side via auth token)

**Affected files:**
- `src/screens/AccountsList/index.tsx` — `fetchAccounts()` (line ~62)

**Acceptance criteria:**
- AC4.1: Call uses `GET account` without query params
- AC4.2: Response data handling preserved unchanged
- AC4.3: Loading/refreshing state preserved unchanged

### R5 — Tag Update

**Current (broken):**
- `PATCH tag/edit` with `{ tag_id, name }` (useTagMutations)

**Target:** `PUT /tag/:id` with `{ name }` in body (backend has PUT, not PATCH for tags)

**Affected files:**
- `src/hooks/useTagMutations.ts` — `updateTagFn()` (line ~48)

**Acceptance criteria:**
- AC5.1: Call uses `PUT tag/{tag_id}` with `{ name }` in body
- AC5.2: `tag_id` is removed from body (moved to URL param)
- AC5.3: Return signature preserved (`return await api.put(...)`)
- AC5.4: Callers unaffected (interface unchanged)

### R6 — Tag Delete

**Current (broken):**
- `DELETE tag/delete?tag_id=x` (useTagMutations)

**Target:** `DELETE /tag/:id`

**Affected files:**
- `src/hooks/useTagMutations.ts` — `deleteTagFn()` (line ~86)

**Acceptance criteria:**
- AC6.1: Call uses `DELETE tag/{tagId}` (URL param, not query param)
- AC6.2: Return signature preserved

### R7 — Transaction Bulk Update

**Current (broken):**
- `PUT transaction/update` with `{ transaction_id, ...fields }` (RegisterTransaction — bulk edit)

**Target:** `PATCH /transaction/edit` with `{ transaction_id, ...fields }` in body.

**Affected files:**
- `src/screens/RegisterTransaction/index.tsx` — `handleBulkEditTransaction()` (line ~458)

**Acceptance criteria:**
- AC7.1: Call uses `PATCH transaction/edit` (method and URL both changed)
- AC7.2: Request body preserved unchanged (backend schema expects `transaction_id` in body for this route)
- AC7.3: `Promise.all` pattern and bulk alert preserved unchanged

### R8 — Transaction Fetch (single by ID)

**Current (broken):**
- `GET transaction/single?transaction_id=x` (useBulkTransactionsQuery)

**Target:** `GET /transaction/:id`

**Affected files:**
- `src/hooks/useBulkTransactionsQuery.ts` — `fetchBulkTransactions()` (line ~12)

**Acceptance criteria:**
- AC8.1: Each promise uses `GET transaction/{id}` (URL param, not query param)
- AC8.2: `Promise.all` and return signature preserved

### R9 — Transaction Sync (fetch_transactions)

**Current (broken):**
- `GET /banking_integration/fetch_transactions` (useSyncTransactions)

**Target:** `GET /banking-integration/sync`

**Affected files:**
- `src/hooks/useSyncTransactions.ts` — `syncAndFetchTransactions()` (line ~8)

**Acceptance criteria:**
- AC9.1: Call uses `GET /banking-integration/sync`
- AC9.2: React Query mutation config preserved unchanged

### R10 — Profile Image Upload

**Current (broken):**
- `POST upload/user_profile_image` with `{ file, user_id }` (Profile)

**Decision:** Update URL only; flag deeper issues (missing API call for profile save) as known issue.

**Target:** `PATCH /user/:id` with `{ profile_image: "data:image/jpeg;base64,..." }`.

**Affected files:**
- `src/screens/Profile/index.tsx` — `handleSaveProfile()` (line ~111)

**Acceptance criteria:**
- AC10.1: Replace `POST upload/user_profile_image` with `PATCH user/{userID}` — sends `profile_image` field in body
- AC10.2: Remove `user_id` from request body (derived from URL param)
- AC10.3: Flag in code comment: `// ⚠️ FIXME: handleSaveProfile builds profileEdited but never calls API to persist it`
- AC10.4: Error handling preserved as-is

**Known issue (follow-up):** `handleSaveProfile()` builds `profileEdited` (lines 120–128) but never calls an API to save it. Profile editing is functionally broken and needs a dedicated fix.

### R11 — Transaction Image Upload (Backend + Frontend)

**Decision:** Option B — Add backend support (new endpoint + model change + schema update).

**Current (broken):**
- `POST transaction/image` with `{ file, user_id }` — no backend route exists (RegisterTransaction ×2)

**Backend changes:**
- `prisma/schema.prisma` — add `imageUrl String? @map("image_url") @db.Text` to Transaction model
- `src/routes/transaction.routes.ts` — add `POST /image` route (must be registered BEFORE `/:id`)
- `src/controllers/transaction.controller.ts` — add `uploadTransactionImage` handler
- `src/schemas/transaction.schema.ts` — add `transactionImageSchema` + `image_url` to create/update schemas

**Frontend changes:**
- `src/screens/RegisterTransaction/index.tsx` — `handleEditTransaction()` (line ~500) and `handleRegisterTransaction()` (line ~649)

**Acceptance criteria:**
- AC11.1: Backend Transaction model gains `imageUrl String? @map("image_url") @db.Text`
- AC11.2: Backend `POST /transaction/image` endpoint: accepts `{ file: "data:image/jpeg;base64,..." }`, validates base64 format/size (max 5MB), returns `{ url: "<base64>" }`
- AC11.3: Backend create/update transaction schemas accept optional `image_url` field
- AC11.4: Frontend changes `transaction_image_id = imageData.id` → `image_url = imageData.url`
- AC11.5: Frontend transaction payload field renamed from `transaction_image_id` to `image_url` in both create and edit flows
- AC11.6: Image upload URL corrected to match new backend route

---

## PUT vs PATCH Analysis (R12)

### Analysis

| Aspect | PUT | PATCH |
|--------|-----|-------|
| Semantic | Full resource replacement | Partial update |
| Risk | High — omitted fields → nullified | Low — only sent fields change |
| Mobile safety | Dangerous (incomplete forms) | Safe (partial submissions) |
| Backend effort to keep | Zero (already implemented) | Zero (already implemented) |
| Use case | External API consumers, admin tools | Mobile/web frontends |

### Decision — AD-024

- **Keep both PUT and PATCH in the backend** — PUT may serve external API consumers or admin tools
- **Use PATCH exclusively in the frontend** for all updates going forward
- **Exception — Tags:** backend only has `PUT /tag/:id`. Frontend uses PUT for tags. Consider adding `PATCH /tag/:id` in a future backend update.

---

## Non-Requirements (out of scope)

- Modifying existing backend routes/controllers (except adding transaction image endpoint)
- Changing delete Account/Transaction controller logic (already backward-compatible)
- Fixing the Profile save missing API call (flagged as known issue)
- Updating tests (frontend has no API-level tests)
- Updating the React Query cache invalidation patterns
- Adding `PATCH /tag/:id` to backend (deferred)

---

## Affected Files Summary

| File | Endpoints to fix | Count |
|------|-----------------|-------|
| `src/screens/Home/index.tsx` | `user_config/edit_hide_amount` | 1 |
| `src/screens/OptionsMenu/index.tsx` | `user_config/edit_hide_amount`, `edit_insights`, `edit_use_local_auth` | 3 |
| `src/screens/Accounts/index.tsx` | `user_config/edit_hide_amount` | 1 |
| `src/screens/RegisterAccount/index.tsx` | `user_config/edit_hide_account`, `account/single` | 2 |
| `src/screens/AccountsList/index.tsx` | `account/manual_accounts` | 1 |
| `src/screens/RegisterTransaction/index.tsx` | `transaction/update`, `transaction/image` (×2) | 3 |
| `src/screens/Profile/index.tsx` | `upload/user_profile_image` + flag missing API call | 1 |
| `src/hooks/useTagMutations.ts` | `tag/edit`, `tag/delete` | 2 |
| `src/hooks/useBulkTransactionsQuery.ts` | `transaction/single` | 1 |
| `src/hooks/useSyncTransactions.ts` | `/banking_integration/fetch_transactions` | 1 |
| **Backend files** | | |
| `prisma/schema.prisma` | Add `imageUrl` to Transaction | 1 |
| `src/routes/transaction.routes.ts` | Add `POST /image` route | 1 |
| `src/controllers/transaction.controller.ts` | Add `uploadTransactionImage` handler | 1 |
| `src/schemas/transaction.schema.ts` | Add image schemas + update create/update | 1 |
| **Total** | | **16 call sites + 4 backend files** |
