# Device Fingerprint (Rate-Limit Budget)

**Date:** 2026-08-12
**Scope:** Small — frontend only (backend already supports the header)
**Status:** Implemented

## Problem

The backend's global rate limiter grants **100 req/15min** per client when the
request carries an `X-Device-Fingerprint` header, and only **30 req/15min**
without it (`src/middlewares/rateLimiter.ts`, backend). The app never sends the
header, so real devices run on the strict budget and can hit `429 Too Many
Requests` during normal usage (screen loads + query invalidations after writes).

## Requirements

### R1 — Stable device fingerprint on every API request

The app must attach a stable, device-scoped identifier to **every** outgoing API
request via the `X-Device-Fingerprint` header so the backend grants the full
budget.

### Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC1.1 | A device identifier is obtained via `react-native-device-info`'s `getUniqueIdSync()` (iOS: persisted Keychain UUID; Android: `ANDROID_ID`) and memoized in-memory so the native call happens once per process. |
| AC1.2 | The axios request interceptor (`src/api/api.ts`) sets `X-Device-Fingerprint` on every request. |
| AC1.3 | If the native call throws, a non-empty fallback value is returned and requests still proceed (no crash, no missing header). |
| AC1.4 | The tracked template `src/api/api_example.ts` documents the wiring so a fresh clone (where `api.ts` is gitignored) reproduces it. |
| AC1.5 | A unit test covers memoization (single native call) and the fallback path. |
| AC1.6 | The interceptor wiring itself is covered by a test that asserts the `X-Device-Fingerprint` header is attached to an outgoing request (against the tracked `api_example.ts`, the canonical copy of the gitignored `api.ts`). |

## Notes

- `src/api/api.ts` is intentionally **gitignored** (contains env-specific base
  URLs); the tracked canonical copy of the interceptor wiring lives in
  `src/api/api_example.ts`.
- The header is a rate-limit bucket key only (backend MemoryStore); it is not
  persisted server-side. Backend docs explicitly suggest a stable device
  identifier (SecureStore UUID / device-info) for this purpose.
- No backend changes required — `rateLimiter.ts` already switches budgets based
  on header presence.
