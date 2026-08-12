# Validation Report — Device Fingerprint (Rate-Limit Budget)

**Date:** 2026-08-12 (updated after gap-fix commit `25621f6`)
**Verdict:** **PASS** — all gaps closed or non-blocking (see ranked gap list)
**Diff range verified:** `23384b6..f3edfba` (implementation, commit `f3edfba`) and `23384b6..25621f6` (implementation + test hardening, commit `25621f6`)
**Author of this report:** Independent verifier (did not author the code)
**Environment:** macOS, jest via `yarn jest --watchman=false`

## Gate

`yarn jest --watchman=false src/__tests__/api src/__tests__/utils`

| Suite | Result |
|-------|--------|
| `src/__tests__/api/apiExampleInterceptor.spec.ts` | PASS (2 tests) |
| `src/__tests__/utils/deviceFingerprint.spec.ts` | PASS (3 tests) |
| `src/__tests__/utils/transactionPayload.spec.ts` | PASS (14 tests, unaffected) |

**Total: 3 suites, 19 tests, all passed.** `src/__tests__/screens/profile.spec.tsx` was not run (known environment hang, unrelated — per instructions not judged).

Working tree confirmed back at committed state after sensor runs (`git --no-pager diff -- src/` empty; `git --no-optional-locks status --short` shows only this untracked report).

## Per-AC Evidence

| AC | Spec outcome | Evidence | Satisfied |
|----|--------------|----------|-----------|
| AC1.1 — memoized `getUniqueIdSync()` | Native call happens once per process | `src/utils/deviceFingerprint.ts:15-19` module-level cache; test asserts return value **and** `toHaveBeenCalledTimes(1)` after two calls (`deviceFingerprint.spec.ts:24-26`) — asserts the outcome, not the cache variable. | ✅ |
| AC1.2 — interceptor sets header on every request | `api.ts` attaches `X-Device-Fingerprint` per request | Local `src/api/api.ts:31` and tracked `src/api/api_example.ts:15` both set `config.headers!['X-Device-Fingerprint'] = getDeviceFingerprint()` inside the request interceptor; assignment precedes the only throwing statement in the same try-block. **Tested** by `apiExampleInterceptor.spec.ts:36-47` (mock util, invoke interceptor handler, assert header present on every request). | ✅ |
| AC1.3 — non-empty fallback, requests proceed | Native throw → fallback, no crash/no missing header | `deviceFingerprint.ts:22-28` try/catch returns `fallback-${Date.now()}-${random}`; unit test throws in mock and asserts string + non-empty + prefix (`deviceFingerprint.spec.ts:41-46`). **Interceptor path tested** by `apiExampleInterceptor.spec.ts:49-59` (request proceeds with the fallback value attached as the header). | ✅ |
| AC1.4 — `api_example.ts` documents wiring | Fresh clone reproduces the wiring | `src/api/api_example.ts:15` — identical line to local `api.ts:31`, plus explanatory comment (lines 12-14). Wiring now pinned by a test against the tracked template (see AC1.6). | ✅ |
| AC1.5 — unit test for memoization + fallback | Test covers both paths | Tests 1 & 2 of `deviceFingerprint.spec.ts`; jest.mock of `react-native-device-info`; `jest.isolateModules` resets module cache per test. | ✅ |
| AC1.6 — interceptor wiring itself tested (added in `25621f6`) | Test asserts header attached to outgoing request via tracked `api_example.ts` | `src/__tests__/api/apiExampleInterceptor.spec.ts` — mocks `react-native-mmkv` and `@utils/deviceFingerprint`, invokes `api.interceptors.request.handlers[0].fulfilled(config)`, asserts `config.headers['X-Device-Fingerprint']` set (normal and fallback values) and config passthrough. | ✅ |

Backend cross-check: `smart-finances-backend/src/middlewares/rateLimiter.ts:103-104` grants `MAX_REQUESTS` (100) when `x-device-fingerprint` present, else `STRICT_MAX_REQUESTS` (30); header read at `:60-63`. Matches spec claim; no backend changes in this diff.

## Discrimination Sensor (behavior-level mutants, one at a time, always reverted)

| # | Mutant | Result | Evidence |
|---|--------|--------|----------|
| a | Removed memoization cache (early return deleted — native call every invocation) | **Killed** | 2/3 tests failed: AC1.1 `toHaveBeenCalledTimes(1)` fails; AC1.3 second-call stability fails (different random fallback). |
| b | Removed try/catch fallback (native throw propagates) | **Killed** | 1/3 tests failed: AC1.3 test throws `native module failure`. |
| c | Fallback prefix `'fallback-'` → `'session-'` | **Killed** | 1/3 tests failed: AC1.3 `/^fallback-/` regex mismatch. |
| d | Deleted `config.headers!['X-Device-Fingerprint'] = getDeviceFingerprint();` from `api_example.ts` | **Killed** (re-run after gap-fix `25621f6`) | 2/2 tests in `apiExampleInterceptor.spec.ts` failed: both assert the header (`device-xyz` and `fallback-123abc`), got `undefined`. |

After each mutant: restored from scratch backup and verified `git --no-pager diff --stat -- src/` empty before proceeding.

## Ranked Gaps

1. **G-1 — Interceptor wiring (AC1.2/AC1.4) is untested** — **CLOSED** by commit `25621f6`. `src/__tests__/api/apiExampleInterceptor.spec.ts` (spec AC1.6) pins the header wiring in the tracked template; mutant (d) now killed 2/2. Residual (non-blocking): the real gitignored `api.ts` itself cannot be tested in CI, so `api.ts` ↔ `api_example.ts` parity still rests on inspection (verified identical in this pass: both set the header at the top of the interceptor try-block).
2. **G-2 — "Requests still proceed" (AC1.3) verified only at function level** — **CLOSED** by commit `25621f6`. The interceptor test invokes the real `api_example.ts` handler and asserts the request proceeds with the fallback value attached (`apiExampleInterceptor.spec.ts:49-59`). Residual (non-blocking): the test mocks `getDeviceFingerprint` to *return* the fallback rather than walking the real native-throw path through the interceptor, and the interceptor's silent catch would still hide a future reorder of the header assignment after a throwing statement; the tested assertions (header present on config, config returned) would catch header *removal*, not a *reorder* that skips it on the throw path.
3. **G-3 — Fallback stability beyond spec, pinned by test** (minor). Spec AC1.3 requires only "non-empty fallback"; the test also pins that the fallback is stable across calls within a process (native call not retried after first failure — `deviceFingerprint.spec.ts:46-47`). Sensible design (avoids hammering a downed native module) but it is an asserted behavior not stated in the spec; flagging for spec-update or conscious acceptance.
4. **G-4 — Cache check is truthiness-based** (cosmetic). `if (cachedFingerprint)` instead of `!== null` — functionally safe because all cached values are non-empty strings, but marginally less intent-revealing.
5. **G-5 — Interceptor test uses a type-bypass and internal reach** (cosmetic). `(api.interceptors.request as any).handlers[0]` reaches into axios internals instead of driving a request through a mocked `adapter`. Functionally fine and it is what made mutant (d) detectable, but a full-request test (adapter mock) would also cover the interceptor registration itself (e.g., `api.interceptors.request.use(...)` never being called).

No real defects found: all spec-mandated behavior verified present, all api/utils tests pass, sensor killed 4/4 mutants (including the re-run of mutant (d) after the gap-fix).
