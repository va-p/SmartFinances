# Endpoint Migration — Validation Report

**Date:** 2026-08-06
**Verifier:** Independent agent (not the implementer)
**Result:** PASS ✅

## Per-AC Evidence

### R1 — User Config Toggles

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC1.1 | All 5 calls use `PATCH user/{userId}/configs` with correct field name | **Home** L399-401: `api.patch(\`user/${userID}/configs\`, { hide_amount: !hideAmount })`<br>**OptionsMenu** L110-112: `api.patch(\`user/${userId}/configs\`, { hide_amount: !hideAmount })`<br>**OptionsMenu** L143-145: `api.patch(\`user/${userId}/configs\`, { insights: !insights })`<br>**OptionsMenu** L168-170: `api.patch(\`user/${userId}/configs\`, { use_local_authentication: !useLocalAuth })`<br>**Accounts** L284-286: `api.patch(\`user/${userID}/configs\`, { hide_amount: !hideAmount })` | ✅ |
| AC1.2 | `user_id` removed from request body | No `user_id` field in any of the 5 PATCH bodies. `userID`/`userId` only appears in the URL param. | ✅ |
| AC1.3 | Response status check `=== 200` | All 5 calls check `status === 200` (Home L403, OptionsMenu L114/L147/L172, Accounts L288) | ✅ |
| AC1.4 | MMKV storage + Zustand state preserved | All 5 have `storageConfig.set(...)` + corresponding state setter (e.g., `setHideAmount`, `setInsights`, `setUseLocalAuth`) | ✅ |
| AC1.5 | Alert/error handling preserved | All 5 have `catch (error)` blocks with `console.error` + `Alert.alert` with appropriate Portuguese messages | ✅ |

### R2 — Account Hide Toggle

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC2.1 | `PATCH account/{accountId}` with `{ hide: !hideAccount }` | RegisterAccount L240-242: `api.patch(\`account/${id}\`, { hide: !hideAccount })` | ✅ |
| AC2.2 | URL param `id` from component prop | L49: `type Props = { id: string \| null; ... }` — `id` is destructured at L63 from props. L240 uses `${id}` in URL. | ✅ |
| AC2.3 | Alert and state behavior preserved | L245-246: `Alert.alert(...); setHideAccount(prevState => !prevState)` — preserved | ✅ |

### R3 — Account Fetch

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC3.1 | `GET account/{id}` (URL param, not query) | RegisterAccount L220: `api.get(\`account/${id}\`)` | ✅ |
| AC3.2 | Response data destructuring preserved | L222-226: `setValue('name', data.name)`, `setValue('balance', data.balance)`, `setTypeSelected(data.type)`, `setCurrencySelected(data.currency)`, `setHideAccount(data.hide)` | ✅ |
| AC3.3 | Error handling preserved | L227-233: `catch (error)` with `console.error` + `Alert.alert('Conta', ...)` | ✅ |

### R4 — Account List

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC4.1 | `GET account` without query params | AccountsList L62: `api.get('account')` — no query params | ✅ |
| AC4.2 | Response data handling preserved | L63-65: `if (data) { setAccounts(data); }` | ✅ |
| AC4.3 | Loading/refreshing state preserved | L58-79: `setLoading(true/false)`, `setRefreshing(false)` in try/catch/finally. `RefreshControl` at L219-221 uses `onRefresh={fetchAccounts}`. | ✅ |

### R5 — Tag Update

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC5.1 | `PUT tag/{tag_id}` with `{ name }` in body | useTagMutations L48: `api.put(\`tag/${tagEdited.tag_id}\`, { name: tagEdited.name })` | ✅ |
| AC5.2 | `tag_id` removed from body | Body only contains `{ name: tagEdited.name }`; `tag_id` is in URL param only | ✅ |
| AC5.3 | Return signature preserved | L48: `return await api.put(...)` — return preserved | ✅ |
| AC5.4 | Callers unaffected | Function signature `updateTagFn(tagEdited: { tag_id: string; name: string })` unchanged | ✅ |

### R6 — Tag Delete

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC6.1 | `DELETE tag/{tagId}` (URL param) | useTagMutations L86: `api.delete(\`tag/${tagId}\`)` | ✅ |
| AC6.2 | Return signature preserved | L86: `return await api.delete(...)` | ✅ |

### R7 — Transaction Bulk Update

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC7.1 | `PATCH transaction/edit` (method + URL) | RegisterTransaction L458: `api.patch('transaction/edit', transactionEditedPayload)` — uses `api.patch` (PATCH) and 'transaction/edit' URL | ✅ |
| AC7.2 | Request body preserved | L440-456: payload contains `transaction_id`, `created_at`, `bank_transaction_id`, `date`, `description`, `amount`, `amount_in_account_currency`, `currency_id`, `type`, `account_id`, `category_id`, `tags`, `image_url`, `user_id` — all fields preserved | ✅ |
| AC7.3 | `Promise.all` + bulk alert preserved | L462: `await Promise.all(updatePromises)`; L463-475: bulk success alert with `${bulkTransactionsData.length} transações editadas` message | ✅ |

### R8 — Transaction Fetch

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC8.1 | `GET transaction/{id}` (URL param) | useBulkTransactionsQuery L13: `api.get(\`transaction/${id}\`)` | ✅ |
| AC8.2 | `Promise.all` and return signature preserved | L16: `const results = await Promise.all(promises)`; L17: `return results.map((result) => result.data) as TransactionProps[]` | ✅ |

### R9 — Transaction Sync

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC9.1 | `GET /banking-integration/sync` | useSyncTransactions L8: `api.get('/banking-integration/sync')` | ✅ |
| AC9.2 | React Query mutation config preserved | L14-28: `useMutation({ mutationFn, onSuccess, onError })` — `onSuccess` invalidates `['transactions']`, `onError` console.errors and shows Alert | ✅ |

### R10 — Profile Image Upload

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC10.1 | `PATCH user/{userID}` with `profile_image` field | Profile L106-108: `api.patch(\`user/${userID}\`, { profile_image: \`data:image/jpeg;base64,${image}\` })` | ✅ |
| AC10.2 | `user_id` removed from request body | Only `{ profile_image: "data:image/jpeg;base64,..." }` in body; `userID` in URL | ✅ |
| AC10.3 | FIXME comment present | L119-121: `// ⚠️ FIXME: handleSaveProfile builds profileEdited but never calls API to persist it.` — exact spec text present | ✅ |
| AC10.4 | Error handling preserved | L122-125: `catch (error)` with `console.error(error)` — preserved as-is | ✅ |

### R11 — Transaction Image Upload

| AC | Spec | Actual Code | Match? |
|----|------|-------------|--------|
| AC11.1 | Transaction model: `imageUrl String? @map("image_url") @db.Text` | schema.prisma L231: `imageUrl String? @map("image_url") @db.Text` — exact match | ✅ |
| AC11.2 | `POST /transaction/image`: validates base64 format/size (max 5MB), returns `{ url: "<base64>" }` | **Route:** L49-54 registered BEFORE `/:id` (L61-66)<br>**Schema:** L97-106 — `.refine(v => v.startsWith("data:image/"))`, `.refine(base64 size ≤ 5MB)`<br>**Controller:** L680-690 — `res.status(200).json({ url: file })` | ✅ |
| AC11.3 | Create/update schemas accept optional `image_url` | **createTransactionSchema** L43: `image_url: z.string().max(2_000_000).optional().nullable()`<br>**updateTransactionSchema** L81: `image_url: z.string().max(2_000_000).optional().nullable()`<br>**Create controller** L205/257: destructures `image_url`, stores `imageUrl: image_url \|\| null`<br>**Update controller** L432/479: destructures `image_url`, sets `updateData.imageUrl = image_url` | ✅ |
| AC11.4 | Frontend: `transaction_image_id = imageData.id` → `image_url = imageData.url` | **handleEditTransaction** L493: `let image_url: string \| null = null;` → L501: `image_url = uploadImage.data.url;`<br>**handleRegisterTransaction** L640: `let image_url: string \| null = null;` → L647: `image_url = data.url;` | ✅ |
| AC11.5 | Payload field renamed `transaction_image_id` → `image_url` | **handleEditTransaction** L567: `image_url,` (transfer payload) + L611: `image_url,` (plain payload)<br>**handleRegisterTransaction** L713: `image_url,` (transfer payload) + L776: `image_url,` (plain payload)<br>**handleBulkEditTransaction** L454: `image_url: null,` (bulk edit always null) | ✅ |
| AC11.6 | Image upload URL corrected to new backend route | **handleEditTransaction** L499: `api.post('transaction/image', { file: newImage.file })`<br>**handleRegisterTransaction** L645: `api.post('transaction/image', { file: newImage.file })` | ✅ |

---

## Spec-Precision Gaps

| # | Issue | Detail |
|---|-------|--------|
| G1 | AC2.1 body field | Spec says `{ hide: !hideAccount }`. Code at L241 uses `{ hide: !hideAccount }`. While functionally equivalent (given `hideAccount` state is managed by `setHideAccount`), the spec writer should be aware this toggles based on current state rather than passing an absolute value. This is the intended behavior per AC2.3 (state toggled via `setHideAccount(prevState => !prevState)` on success), but the spec wording could be more precise about whether the value is pre-toggled or post-toggled. **No deviation — just a precision note.** |
| G2 | AC10.1 — `handleSaveProfile` status check | The spec doesn't mention checking the `status` of the PATCH request. The code on L106 destructures `{ status }` but never checks it. The old code (pre-migration) likely had the same gap — this is preserved as-is per AC10.4, but worth noting. |
| G3 | R11 Backend schema `transactionImageSchema` — base64 size check | The schema refines `(base64Part.length * 3) / 4 <= 5 * 1024 * 1024` which is an approximation (base64 encoding inflates by ~33%, but not exactly 4/3). The actual decoded size check would be more precise. This is a spec-vs-implementation nuance, not a deviation. |
| G4 | R11 `image_url` max length in Zod schemas | The Zod schemas (L43, L81) use `.max(2_000_000)` — this is a string length limit (~2MB characters), not a byte-size check. This is distinct from the 5MB decoded-size check in `transactionImageSchema`. The spec only mentions the 5MB limit; this string-length cap is an implementation detail not in the spec. Not a deviation, but a spec gap. |
| G5 | AC11.2 — Route ordering | Spec says route "must be registered BEFORE `/:id`". Confirmed: L49-54 (`/image`) appears before L61-66 (`/:id`). ✅ |

---

## Discrimination Sensor

Not applicable. This is a static code verification only — no automated tests, no runtime tests, no integration tests exist in this project to run. All verification was performed by reading source code and comparing against the spec line-by-line.

---

## Issues Found

| # | Severity | Location | Description |
|---|----------|----------|-------------|
| — | — | — | **No issues found.** All 35 acceptance criteria (AC1.1 through AC11.6) are met. |

---

## Verdict

**PASS** ✅ — All 11 requirements and 35 acceptance criteria are satisfied.

### Summary of changes verified

| File | Endpoints Migrated | Status |
|------|-------------------|--------|
| `src/screens/Home/index.tsx` | `user_config/edit_hide_amount` → `PATCH user/{id}/configs` | ✅ |
| `src/screens/OptionsMenu/index.tsx` | 3 endpoints: `edit_hide_amount`, `edit_insights`, `edit_use_local_auth` → `PATCH user/{id}/configs` | ✅ |
| `src/screens/Accounts/index.tsx` | `user_config/edit_hide_amount` → `PATCH user/{id}/configs` | ✅ |
| `src/screens/RegisterAccount/index.tsx` | `user_config/edit_hide_account` → `PATCH account/{id}`, `account/single` → `GET account/{id}` | ✅ |
| `src/screens/AccountsList/index.tsx` | `account/manual_accounts` → `GET account` | ✅ |
| `src/screens/RegisterTransaction/index.tsx` | `transaction/update` → `PATCH transaction/edit`, `transaction/image` ×2 → `POST transaction/image`, `transaction_image_id` → `image_url` | ✅ |
| `src/screens/Profile/index.tsx` | `upload/user_profile_image` → `PATCH user/{id}`, FIXME comment added | ✅ |
| `src/hooks/useTagMutations.ts` | `tag/edit` → `PUT tag/{id}`, `tag/delete` → `DELETE tag/{id}` | ✅ |
| `src/hooks/useBulkTransactionsQuery.ts` | `transaction/single` → `GET transaction/{id}` | ✅ |
| `src/hooks/useSyncTransactions.ts` | `/banking_integration/fetch_transactions` → `/banking-integration/sync` | ✅ |
| `prisma/schema.prisma` | Added `imageUrl` to Transaction model | ✅ |
| `src/routes/transaction.routes.ts` | Added `POST /image` before `/:id` | ✅ |
| `src/controllers/transaction.controller.ts` | Added `uploadTransactionImage`, `image_url` in create/update | ✅ |
| `src/schemas/transaction.schema.ts` | Added `transactionImageSchema`, `image_url` in create/update | ✅ |
