# Endpoint Migration — Context & Decisions

**Date:** 2026-08-06

---

## Gray Areas Requiring User Input

### GA-1: Transaction Image Upload (`POST transaction/image`)

**Decision:** Option B — Add backend support (DECIDED by user)

**Implementation:**
- Add `imageUrl String? @map("image_url") @db.Text` to Transaction Prisma model
- Create `POST /api/v1/transaction/image` endpoint (validates base64, returns `{ url }`)
- Add `image_url` optional field to create/update transaction schemas
- Frontend: update image upload URL and change `transaction_image_id` → `image_url` field mapping

---

### GA-2: Profile Save — Update URLs Only, Flag Deeper Issues

**Decision:** Update only the outdated endpoint URL; flag the missing API call as a known issue (DECIDED by user).

**This pass:**
- Replace `POST upload/user_profile_image` with `PATCH user/{userId}` including `profile_image` as a field
- Remove `user_id` from image upload body (derived from URL param)

**Flagged for follow-up:**
- `handleSaveProfile()` builds `profileEdited` but never calls an API to persist it (lines 120–128)
- `email` and `password` fields are in the payload but shouldn't be sent to the user update endpoint
- No success/error Alert for the profile save operation
- ⚠️ Profile editing is functionally broken — needs a dedicated fix pass

---

### GA-3: PUT vs PATCH — Keep Both in Backend?

**User's question:** "Is it worth keeping PUT-type endpoints in the backend, since PATCH-type HTTP methods are safer in terms of data loss?"

**Analysis:**

| Aspect | PUT | PATCH |
|--------|-----|-------|
| Semantic | Full resource replacement | Partial update |
| Risk | High — omitted fields → nullified | Low — only sent fields change |
| Mobile safety | Dangerous (incomplete forms) | Safe (partial submissions) |
| Backend effort to keep | Zero (already implemented) | Zero (already implemented) |
| Use case | External API consumers, admin tools | Mobile/web frontends |

**Recommendation:** Keep both. BACKEND: Retain both PUT and PATCH for all resources that already have them. FRONTEND: Use PATCH exclusively for all updates (except Tags which only have PUT). The backend routes cost nothing to maintain, and having PUT available could serve future use cases (admin panel, public API, third-party integrations).

**Exception — Tags:** The backend only has `PUT /tag/:id` (no PATCH). The frontend must use PUT for tag updates. Consider adding `PATCH /tag/:id` in a future backend update for consistency.

---

## Decision Log

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-024 | Frontend uses PATCH for all updates; backend keeps both PUT + PATCH | Safety for mobile clients; zero cost to retain PUT for external consumers |
| AD-025 | Transaction images: remove from frontend (Option A) | No backend support; can be re-added as dedicated feature later |
| AD-026 | Profile save: fix both the image upload and the missing API call | Both are broken; fixing one without the other still leaves profile editing non-functional |
| AD-027 | Tags: use PUT since backend only provides PUT | Can't use PATCH where it doesn't exist; add PATCH route in future backend update |
