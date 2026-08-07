# Endpoint Migration — Design

**Date:** 2026-08-06

---

## 1. Architecture Overview

This feature spans both frontend and backend:

```
┌─────────────────────────────────────┐
│ FRONTEND (SmartFinances)            │
│ 10 files, 16 API call sites updated │
│ Method: PATCH for updates (except   │
│ tags → PUT), URL params not query   │
└──────────────┬──────────────────────┘
               │ HTTP (Axios)
               ▼
┌─────────────────────────────────────┐
│ BACKEND (smart-finances-backend)    │
│ 4 files changed                     │
│ + Transaction.imageUrl field        │
│ + POST /transaction/image endpoint  │
│ + image_url in create/update schema │
└─────────────────────────────────────┘
```

## 2. Backend Design — Transaction Image Support

### 2.1 Prisma Schema Change

```prisma
model Transaction {
  // ... existing fields ...
  imageUrl  String?  @map("image_url") @db.Text  // ← ADDED
  // ... rest unchanged ...
}
```

**Rationale:** `@db.Text` for unlimited-length base64 data URLs. Nullable (images are optional). Matches the pattern already used by `User.profileImage`.

### 2.2 Migration

```sql
ALTER TABLE "transactions" ADD COLUMN "image_url" TEXT;
```

### 2.3 New Endpoint: `POST /api/v1/transaction/image`

**Route registration order is critical:** Must be registered BEFORE `/:id` route to avoid "image" being matched as a transaction ID.

```typescript
// In transaction.routes.ts — registered AFTER /by-category, BEFORE /:id
router.post(
  "/image",
  authenticate,
  validate(transactionImageSchema),
  asyncHandler(uploadTransactionImage),
);
```

**Controller logic (`uploadTransactionImage`):**
1. Extract `file` from request body
2. Validate base64 format (must start with `data:image/`)
3. Validate size (max 5MB decoded)
4. Return `{ url: "<validated-base64>" }` — the frontend stores this URL in `image_url` when creating/updating the transaction

**Schema (`transactionImageSchema`):**
```typescript
export const transactionImageSchema = z.object({
  file: z.string()
    .min(1, "Image file is required")
    .refine((v) => v.startsWith("data:image/"), "Must be a valid base64 image data URL")
    .refine((v) => {
      // Base64 size check: ~4/3 of decoded size, plus data URI prefix
      const base64Part = v.split(",")[1] || "";
      const sizeInBytes = (base64Part.length * 3) / 4;
      return sizeInBytes <= 5 * 1024 * 1024; // 5MB max
    }, "Image must be under 5MB"),
});
```

### 2.4 Schema Updates for Create/Update Transaction

Add optional `image_url` to both schemas:

```typescript
// createTransactionSchema — add:
image_url: z.string().max(2_000_000).optional().nullable(),

// updateTransactionSchema — add:
image_url: z.string().max(2_000_000).optional().nullable(),
```

**Note:** The `max(2_000_000)` is a Zod string length cap, not a byte-size cap. At ~2M chars, this accommodates ~1.5MB base64 images. The `/image` endpoint enforces the stricter 5MB limit pre-upload.

### 2.5 Controller Updates for Create/Update

In `createTransaction` and `updateTransaction`:
- Read `image_url` from body
- If present, store in `imageUrl` field on the Transaction record
- Return `image_url` in the response (for `formatTransaction` helper)

---

## 3. Frontend Design — Endpoint Migration Map

### 3.1 URL Pattern Changes

| # | Requirement | Old Pattern | New Pattern | Method Change |
|---|------------|-------------|-------------|---------------|
| 1-3 | User configs | `POST user_config/edit_hide_amount` | `PATCH user/{userId}/configs` | POST→PATCH |
| 4 | User configs | `POST user_config/edit_insights` | `PATCH user/{userId}/configs` | POST→PATCH |
| 5 | User configs | `POST user_config/edit_use_local_auth` | `PATCH user/{userId}/configs` | POST→PATCH |
| 6 | Account hide | `POST user_config/edit_hide_account` | `PATCH account/{id}` | POST→PATCH |
| 7 | Account fetch | `GET account/single?account_id=x` | `GET account/{id}` | — |
| 8 | Account list | `GET account/manual_accounts?user_id=x` | `GET account` | — |
| 9 | Tag update | `PATCH tag/edit` | `PUT tag/{tag_id}` | PATCH→PUT |
| 10 | Tag delete | `DELETE tag/delete?tag_id=x` | `DELETE tag/{tagId}` | — |
| 11 | Txn bulk update | `PUT transaction/update` | `PATCH transaction/edit` | PUT→PATCH |
| 12 | Txn fetch | `GET transaction/single?id=x` | `GET transaction/{id}` | — |
| 13 | Txn sync | `GET /banking_integration/fetch_transactions` | `GET /banking-integration/sync` | — |
| 14 | Profile image | `POST upload/user_profile_image` | `PATCH user/{userId}` | POST→PATCH |
| 15-16 | Txn image | `POST transaction/image` (broken) | `POST transaction/image` (new backend) | — |

### 3.2 Request Body Changes

**User configs (R1):**
```diff
- { user_id: "xxx", hide_amount: true }
+ { hide_amount: true }   // user_id from URL param
```
Field names must match backend schema: `hide_amount`, `insights`, `use_local_authentication`.

**Tags (R5):**
```diff
- PATCH tag/edit  { tag_id: "x", name: "New" }
+ PUT tag/{tag_id}  { name: "New" }
```

**Transaction image (R11):**
```diff
- transaction_image_id = imageData.id
+ image_url = imageData.url

// In transaction payload:
- transaction_image_id: X
+ image_url: "<base64>"
```

### 3.3 Files NOT Changed (Already Compatible)

These endpoints use backward-compatible routes that the backend explicitly supports:
- `DELETE account/delete?account_id=x` — controller reads `req.query.account_id`
- `DELETE transaction/delete?transaction_id=x` — controller reads `req.query.transaction_id`
- `PATCH account/edit` — exact route exists in backend
- `PATCH transaction/edit` — exact route exists in backend (used by `useTransactionMutations.updateTransactionFn`)

---

## 4. Data Flow — Transaction Image

```
┌──────────┐    POST /transaction/image     ┌──────────┐
│ Frontend │ ─── { file: "data:image/..." } ─→ │ Backend  │
│          │ ←── { url: "data:image/..." }  ── │          │
└──────────┘                                  └──────────┘
     │                                              │
     │  POST /transaction                           │
     │  { ..., image_url: "<base64>" }              │
     ├─────────────────────────────────────────────→│
     │                                              │ Stores in
     │                                              │ Transaction.imageUrl
     │ ←── { ..., image_url: "<base64>" }           │
     │                                              │
```

**Key change from old Xano flow:** Old flow returned a numeric `id` (separate image record). New flow returns the base64 `url` directly, and the transaction stores it in `image_url`. This eliminates the need for a separate images table.

---

## 5. Error Handling Strategy

All frontend changes preserve existing error handling:
- `console.error` for logging
- `Alert.alert` with user-friendly Portuguese messages
- Same try/catch structure

The new backend `/transaction/image` endpoint uses the standard error pattern:
- 400: Invalid base64 format or size exceeded
- 401: Not authenticated
- 500: Server error (caught by `asyncHandler`)

## 6. Migration Safety

- **No database migration needed for existing data** — `imageUrl` is nullable, existing transactions get `NULL`
- **Frontend changes are backward-compatible** — new URL patterns match existing backend routes
- **Auth unchanged** — all routes already use the `authenticate` middleware
- **No dependency changes** — no new npm packages needed
