# OpenI connect feedback on session close

## Problem Statement

After the Connect widget finishes, the app often never receives the deep-link return (production shows a blank page with no redirect; the dev simulation has no redirect by design). Closing the view yields `params === null`, for which the screen silently returns: no feedback and a stale empty list, even though the backend usually bound the integration via webhook (`ensureBound`) in the meantime.

## Goals

- [ ] Closing the session without callback params produces a verdict alert based on reality (refetch + compare).
- [ ] A new integration updates the visible list immediately, without leaving and returning.
- [ ] The working deep-link path is unchanged.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Fixing the OpenI widget redirect itself | Provider-side; client plumbing (scheme, callback URL, `redirectUrl` forwarding) verified correct |
| Changing the `/banking-callback` route | Works when the deep link fires; kept as-is |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Success copy reuses the callback screen wording | Yes | User explicitly asked for those messages | y |
| Bounded polling (4 attempts × 3s) before the neutral verdict | Yes | Bind typically lands in ~2s (seen in logs); avoids an eternal spinner | y |
| Neutral (not error) alert when nothing appears | Yes | User may simply have given up; don't accuse failure | y |

**Open questions:** none.

---

## User Stories

### P1: Verdict after session close ⭐ MVP

**User Story**: As a user, after the bank view closes I want to know whether the connection worked, and see it in the list.

**Why P1**: Core friction in the connect flow on both prod and dev.

**Acceptance Criteria**:

1. WHEN the session closes without callback params AND a new integration appears on refetch THEN the app SHALL show the success alert ('Contas conectadas com sucesso!' + import notice) and update the list.
2. WHEN the session closes without callback params AND nothing new appears after bounded retries THEN the app SHALL show the neutral alert guiding to wait/pull-to-refresh.
3. WHEN callback params arrive THEN the app SHALL keep navigating to `/banking-callback` (existing behavior).
4. WHEN polling THEN the app SHALL stop after the attempt budget and never spin forever.

**Independent Test**: Screen tests with mocked session close (dismiss → new row → success alert + rendered item; dismiss → nothing → neutral alert; params → navigate). Unit tests for the polling helper (resolves on new id; null after budget; tolerates fetch failures).

---

## Edge Cases

- IF the user was already connected and adds a second account THEN only the new row triggers success (compare by id, not by non-empty).
- IF refetch fails transiently THEN polling continues until the budget runs out.
- IF the plan gate blocks (`canConnect` false) THEN nothing changes (subscription route as before).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CNX-01 | P1 verdict | Execute | Verified |
| CNX-02 | P1 verdict | Execute | Verified |
| CNX-03 | P1 verdict | Execute | Verified |
| CNX-04 | P1 verdict | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Tasks → Implementing → Verified

**Coverage:** 4 total, 4 verified via gates below ✅

---

## Success Criteria

- [ ] Manual close after real auth → success alert + item visible.
- [ ] Manual close with nothing done → neutral alert, no crash, no hang.
