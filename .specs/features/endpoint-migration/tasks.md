# Endpoint Migration — Tasks

**Date:** 2026-08-06
**Total tasks:** 14 (across 6 phases)
**Sub-agents needed:** Yes (14 > 8 tasks)

---

## Phase Dependency Graph

```
Phase 1 (Backend: Image) ────┐
                              ├──→ Phase 5 (Frontend: Txn image, depends on Phase 1)
Phase 2 (User Configs) ──────┤
Phase 3 (Account List) ──────┼──→ All independent, can run in parallel
Phase 4 (Tags) ──────────────┤
Phase 6 (Profile) ───────────┘
```

**Key:** Phase 5's transaction image tasks depend on Phase 1 (backend endpoint must exist). All other phases are independent.

---

## Phase 1 — Backend: Transaction Image Support

### T1: Add imageUrl to Transaction Prisma model

**Files:** `prisma/schema.prisma`
**Depends on:** —
**Verification:**
- [ ] `imageUrl String? @map("image_url") @db.Text` field exists on Transaction model
- [ ] `npx prisma migrate dev --name add_transaction_image_url` runs successfully
- [ ] `npx prisma generate` regenerates client without errors
- [ ] Database column `image_url` (TEXT, nullable) exists on `transactions` table

### T2: Add image validation schema + update transaction schemas

**Files:** `src/schemas/transaction.schema.ts`
**Depends on:** T1
**Verification:**
- [ ] `transactionImageSchema` validates: non-empty string, starts with `data:image/`, ≤5MB
- [ ] `createTransactionSchema` has optional `image_url` field
- [ ] `updateTransactionSchema` has optional `image_url` field
- [ ] TypeScript compilation passes for schema file

### T3: Create uploadTransactionImage controller + route

**Files:** `src/controllers/transaction.controller.ts`, `src/routes/transaction.routes.ts`
**Depends on:** T2
**Verification:**
- [ ] `POST /api/v1/transaction/image` route registered BEFORE `/:id` route
- [ ] `uploadTransactionImage` controller: validates base64, returns `{ url }`
- [ ] 400 error for invalid base64 format
- [ ] 400 error for images >5MB
- [ ] 401 error when no auth token
- [ ] Route uses `authenticate` middleware + `validate(transactionImageSchema)`

### T4: Update create/update transaction controllers for image_url

**Files:** `src/controllers/transaction.controller.ts`
**Depends on:** T3
**Verification:**
- [ ] `createTransaction` reads `image_url` from body, stores in `imageUrl`
- [ ] `updateTransaction` reads `image_url` from body, stores in `imageUrl`
- [ ] `formatTransaction` helper includes `image_url` in response
- [ ] Existing transaction create/update flows unchanged when `image_url` is absent

---

## Phase 2 — Frontend: User Config Toggles

### T5: Fix Home screen hide_amount endpoint

**Files:** `src/screens/Home/index.tsx`
**Depends on:** —
**AC refs:** AC1.1, AC1.2, AC1.3, AC1.4, AC1.5
**Verification:**
- [ ] `handleHideData` uses `api.patch('user/${userID}/configs', { hide_amount: !hideAmount })`
- [ ] `user_id` removed from request body
- [ ] Status check, MMKV storage, Zustand setter, Alert — all unchanged

### T6: Fix OptionsMenu screen config endpoints (3 toggles)

**Files:** `src/screens/OptionsMenu/index.tsx`
**Depends on:** —
**AC refs:** AC1.1, AC1.2, AC1.3, AC1.4, AC1.5
**Verification:**
- [ ] `handleChangeHideAmount` uses `api.patch('user/${userId}/configs', { hide_amount: !hideAmount })`
- [ ] `handleChangeSmartInsights` uses `api.patch('user/${userId}/configs', { insights: !insights })`
- [ ] `handleChangeUseLocalAuth` uses `api.patch('user/${userId}/configs', { use_local_authentication: !useLocalAuth })`
- [ ] All three: `user_id` removed from body, local storage + Alert preserved

### T7: Fix Accounts screen hide_amount endpoint

**Files:** `src/screens/Accounts/index.tsx`
**Depends on:** —
**AC refs:** AC1.1, AC1.2, AC1.3, AC1.4, AC1.5
**Verification:**
- [ ] `handleHideData` uses `api.patch('user/${userID}/configs', { hide_amount: !hideAmount })`
- [ ] All existing behavior preserved

### T8: Fix RegisterAccount — hide_account + fetchAccount

**Files:** `src/screens/RegisterAccount/index.tsx`
**Depends on:** —
**AC refs:** AC2.1-2.3, AC3.1-3.3
**Verification:**
- [ ] `handleHideAccount` uses `api.patch('account/${id}', { hide: !hideAccount })`
- [ ] `fetchAccount` uses `api.get('account/${id}')` (URL param, not query)
- [ ] Both: existing state setters, Alerts, loading states preserved

---

## Phase 3 — Frontend: Account List

### T9: Fix AccountsList manual_accounts endpoint

**Files:** `src/screens/AccountsList/index.tsx`
**Depends on:** —
**AC refs:** AC4.1-4.3
**Verification:**
- [ ] `fetchAccounts` uses `api.get('account')` without query params
- [ ] Loading/refreshing state preserved
- [ ] Response data handling preserved

---

## Phase 4 — Frontend: Tag Endpoints

### T10: Fix useTagMutations — update + delete

**Files:** `src/hooks/useTagMutations.ts`
**Depends on:** —
**AC refs:** AC5.1-5.4, AC6.1-6.2
**Verification:**
- [ ] `updateTagFn` uses `api.put('tag/${tagEdited.tag_id}', { name: tagEdited.name })`
- [ ] `tag_id` removed from body (moved to URL)
- [ ] `deleteTagFn` uses `api.delete('tag/${tagId}')` (no query params)
- [ ] Return signatures preserved — callers unaffected

---

## Phase 5 — Frontend: Transaction Endpoints

### T11: Fix RegisterTransaction — bulk edit + image upload (×2)

**Files:** `src/screens/RegisterTransaction/index.tsx`
**Depends on:** T1-T4 (image endpoint must exist in backend), T6 (same file, but independent sections)
**AC refs:** AC7.1-7.3, AC11.4-11.6
**Verification:**
- [ ] `handleBulkEditTransaction`: `api.put('transaction/update', ...)` → `api.patch('transaction/edit', ...)`
- [ ] `handleEditTransaction` (line ~500): image upload → `api.post('transaction/image', { file })`; `transaction_image_id = data.id` → `image_url = data.url`
- [ ] `handleRegisterTransaction` (line ~649): same image upload changes
- [ ] Transaction create/edit payload field: `transaction_image_id` → `image_url` in both flows
- [ ] Bulk alert + `Promise.all` preserved

### T12: Fix useBulkTransactionsQuery — single transaction fetch

**Files:** `src/hooks/useBulkTransactionsQuery.ts`
**Depends on:** —
**AC refs:** AC8.1-8.2
**Verification:**
- [ ] Each promise uses `api.get('transaction/${id}')` (URL param, not query)
- [ ] `Promise.all` + return signature preserved

### T13: Fix useSyncTransactions — sync URL

**Files:** `src/hooks/useSyncTransactions.ts`
**Depends on:** —
**AC refs:** AC9.1-9.2
**Verification:**
- [ ] Uses `api.get('/banking-integration/sync')`
- [ ] React Query mutation config preserved

---

## Phase 6 — Frontend: Profile

### T14: Fix Profile image upload + flag missing API call

**Files:** `src/screens/Profile/index.tsx`
**Depends on:** —
**AC refs:** AC10.1-10.4
**Verification:**
- [ ] `POST upload/user_profile_image` → `PATCH user/{userID}` with `{ profile_image: file }`
- [ ] `user_id` removed from body
- [ ] Code comment added: `// ⚠️ FIXME: handleSaveProfile builds profileEdited but never calls API to persist it`
- [ ] Error handling preserved as-is

---

## Task Summary

| Phase | Tasks | Files | Can Parallelize? |
|-------|-------|-------|------------------|
| 1 — Backend Image | T1 → T2 → T3 → T4 | 4 backend | Sequential (dependencies) |
| 2 — User Configs | T5, T6, T7, T8 | 4 screens | Yes (independent files) |
| 3 — Account List | T9 | 1 screen | Yes |
| 4 — Tags | T10 | 1 hook | Yes |
| 5 — Transactions | T11, T12, T13 | 2 screens + 2 hooks | T12, T13 parallel; T11 after Phase 1 |
| 6 — Profile | T14 | 1 screen | Yes |

**Total: 14 tasks, 6 phases**
