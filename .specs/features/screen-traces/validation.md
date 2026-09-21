# Screen Traces Validation

**Date**: 2026-09-21
**Spec**: `.specs/features/screen-traces/spec.md`
**Diff range**: `26203de..HEAD` on branch `perf/firebase-perf-monitor-screen-trace` (4 commits: c4d1112 hook+tests+spec, f3c4c83 Home, 4af58ca Accounts, 261bdc4 RegisterTransaction)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

No `tasks.md` exists in `.specs/features/screen-traces/` (spec-only feature folder). Diff surface matches the stated scope exactly: 6 files, +296 lines, no deletions (`git --no-pager diff --stat 26203de..HEAD`).

| Deliverable | Status | Notes |
| ----------- | ------ | ----- |
| `useScreenTrace` hook | ✅ Done | `src/hooks/useScreenTrace.ts` (new, 63 lines) |
| Hook tests (11) | ✅ Done | `src/hooks/__tests__/useScreenTrace.test.ts` (new, 143 lines) |
| Home wiring | ✅ Done | one-line call `src/screens/Home/index.tsx:124` |
| Accounts wiring | ✅ Done | one-line call `src/screens/Accounts/index.tsx:89` |
| RegisterTransaction wiring | ✅ Done | one-line call `src/screens/RegisterTransaction/index.tsx:166` |

---

## Spec-Anchored Acceptance Criteria

Tests live in `src/hooks/__tests__/useScreenTrace.test.ts`; the `describe.each` at L63 parameterizes the lifecycle tests over `['home_screen']`, `['accounts_screen']`, `['register_transaction_screen']`. Screen wiring is verified per the spec's own Independent Test ("Screen wiring is verified by TypeScript compilation and code inspection of the three call sites").

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| AC1: WHEN Home visible THEN start trace | custom trace named `home_screen` started | `src/hooks/__tests__/useScreenTrace.test.ts:70` — `expect(trace).toHaveBeenCalledWith(expect.anything(), screenName)` + L72 — `expect(mockTraces[0].start).toHaveBeenCalledTimes(1)` (iteration `home_screen`, L63); wiring `src/screens/Home/index.tsx:124` — `useScreenTrace('home_screen')` | ✅ PASS |
| AC2: WHEN Home stops being visible THEN stop trace | `home_screen` trace stopped | `src/hooks/__tests__/useScreenTrace.test.ts:76-82` — `unmount(); expect(mockTraces[0].stop).toHaveBeenCalledTimes(1)` (L81) | ✅ PASS |
| AC3: WHEN Accounts visible THEN start trace | custom trace named `accounts_screen` started | same assertions as AC1, iteration `accounts_screen` (L63, L70, L72); wiring `src/screens/Accounts/index.tsx:89` — `useScreenTrace('accounts_screen')` | ✅ PASS |
| AC4: WHEN Accounts stops being visible THEN stop trace | `accounts_screen` trace stopped | `src/hooks/__tests__/useScreenTrace.test.ts:76-82` — L81 (iteration `accounts_screen`) | ✅ PASS |
| AC5: WHEN RegisterTransaction sheet presented THEN start trace | custom trace named `register_transaction_screen` started | same assertions as AC1, iteration `register_transaction_screen` (L63, L70, L72); wiring `src/screens/RegisterTransaction/index.tsx:166` — `useScreenTrace('register_transaction_screen')`. Present⇒mount independently verified: `node_modules/@gorhom/bottom-sheet/src/components/bottomSheetModal/BottomSheetModal.tsx:30-33` (`INITIAL_STATE mount:false`), L536-564 (`return mount ? ... : null`), L249-252 (present sets `mount:true`); all 5 render sites wrap it in `ModalViewWithoutHeader`→`BottomSheetModal` (`src/screens/Home/index.tsx:632-642`, `src/screens/Account/index.tsx:582-591`, `src/screens/BudgetDetails/index.tsx:294-303`, `src/screens/Subscriptions/index.tsx:200-209`, `src/screens/TransactionsByCategory/index.tsx:234-243`; wrapper at `src/components/Modals/ModalViewWithoutHeader/index.tsx:28-38`) | ✅ PASS |
| AC6: WHEN RegisterTransaction sheet dismissed THEN stop trace | `register_transaction_screen` trace stopped | `src/hooks/__tests__/useScreenTrace.test.ts:76-82` — L81 (iteration `register_transaction_screen`); dismiss⇒unmount verified: `BottomSheetModal.tsx:106-134` (`unmount()` → `setState(INITIAL_STATE)` → render returns `null`) | ✅ PASS |
| AC7: WHILE trace running, WHEN app → non-active THEN stop | running trace stopped on background/inactive | `src/hooks/__tests__/useScreenTrace.test.ts:97-105` — `appStateChangeHandler?.('background')` then L104 — `expect(mockTraces[0].stop).toHaveBeenCalledTimes(1)`; impl `src/hooks/useScreenTrace.ts:49-54` | ✅ PASS |
| AC8: WHILE still visible, WHEN app returns to active THEN new sample | new trace sample started | `src/hooks/__tests__/useScreenTrace.test.ts:108-121` — L118 `expect(mockTraces).toHaveLength(2)`, L119 `expect(mockTraces[0].stop).toHaveBeenCalledTimes(1)`, L120 `expect(mockTraces[1].start).toHaveBeenCalledTimes(1)` | ✅ PASS |
| AC9: attach `platform` attribute `ios`\|`android` to every trace | attribute key `platform`, value domain exactly `ios` or `android` | `src/hooks/__tests__/useScreenTrace.test.ts:87-94` — L90-93 `expect(mockTraces[0].putAttribute).toHaveBeenCalledWith('platform', expect.stringMatching(/^(ios|android)$/))`; impl `src/hooks/useScreenTrace.ts:32` — `newTrace.putAttribute('platform', Platform.OS)` | ✅ PASS |
| AC10: record via custom trace API (`getPerformance`/`trace`) cross-platform | custom `trace()` API used (not `startScreenTrace`) | `src/hooks/__tests__/useScreenTrace.test.ts:70` — `expect(trace).toHaveBeenCalledWith(expect.anything(), screenName)` (mocked module has no `startScreenTrace`; using it would throw and fail the test); impl `src/hooks/useScreenTrace.ts:30` — `trace(getPerformance(), screenName)`; iOS rejection of `startScreenTrace` verified at `node_modules/@react-native-firebase/perf/lib/ScreenTrace.js:32-34` | ✅ PASS (⚠️ minor precision note below) |

**Status**: ✅ All 10 ACs covered and matched to spec-defined outcomes — 1 minor spec-precision note flagged (non-blocking)

**Spec-precision notes (flagged, not silently passed):**

1. ⚠️ AC10: the first argument of `trace()` is asserted as `expect.anything()` (test L70), not pinned to the `getPerformance()` result. The essential outcome (custom trace API used, exact trace name) is discriminated; the `getPerformance()` conjunction is verified by code inspection (`useScreenTrace.ts:30`) instead of by assertion. The spec's Independent Test explicitly scopes unit assertions to "trace name, start/stop calls, and the platform attribute", so this is within spec — noted for the record.
2. ⚠️ AC9 quantifier "every trace": the attribute is asserted on `mockTraces[0]` only. Coverage of "every" is by construction (single `startTrace()` path at `useScreenTrace.ts:32` fires for all screens and all samples, including the second sample in the AC8 test). A hypothetical mutation attaching the attribute only to the first sample would survive; judged contrived and out of proportion for the lightweight sensor tier.
3. ⚠️ AC2/4/6 blur path: the test emulates blur via unmount (test L8-10 comment). In the real tab navigator, blur fires the `useFocusEffect` cleanup without unmounting; the hook's cleanup is the same code path in both cases, so the emulation is faithful, but it is an emulation.

---

## Discrimination Sensor

**Isolation**: scratch = temp copy of the repo (config + `src/`, `node_modules` symlinked) at `$TMPDIR/sf-sensor`, run via `npx jest --watchman=false --config <scratch>/jest.config.js` from the real root. Real tree never mutated. Baseline `git status --porcelain` before sensor: **empty**; after scratch discard: **empty** — matches baseline. Scratch deleted.

**Sanity**: unmutated scratch passed 11/11 before injection.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/hooks/useScreenTrace.ts:50` | Flipped AppState condition `nextState === 'active'` → `nextState !== 'active'` | ✅ Killed — 2 failed: "stops the running trace when the app leaves the active state" (AC7), "starts a new trace sample when the app returns to active while visible" (AC8) |
| 2 | `src/hooks/useScreenTrace.ts:59` | Removed side effect `stopTrace()` from the effect cleanup | ✅ Killed — 3 failed: "stops the trace when the screen stops being visible" × 3 screens (AC2/4/6) |
| 3 | `src/hooks/useScreenTrace.ts:32` | Removed `newTrace.putAttribute('platform', Platform.OS)` | ✅ Killed — 1 failed: "attaches the platform attribute to the trace" (AC9) |

**Sensor depth**: lightweight (3 targeted behavior-level mutations, default tier)
**Result**: 3/3 killed — PASS ✅

**Payload/conjunction rule (AC9 assertion)**: SATISFIED. `toHaveBeenCalledWith('platform', expect.stringMatching(/^(ios|android)$/))` asserts attribute key and value domain atomically on the same invocation (no cross-call false pass); the anchored regex pins the exact domain `ios|android` (rejects `iOS`, substrings, `web`/`macos`/other `Platform.OS` values); M3 proves the assertion discriminates removal. Under jest-expo `Platform.OS` is `ios`, so the exercised value is in-domain; the `android` value is correct by construction (`Platform.OS` passthrough).

---

## Interactive UAT Results

Not performed — instrumentation feature with no user-facing UI flow; automated checks are sufficient per the validation checklist.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ 63-line hook + 3 one-line wirings |
| Surgical changes | ✅ diff touches only the 6 in-scope files, +296/−0 |
| No scope creep | ✅ no features beyond the 3 named screens |
| Matches patterns | ✅ hook colocated under `src/hooks` with `__tests__`, alias imports (`@hooks/...`) match codebase style |
| Spec-anchored outcome check | ✅ asserted values match spec (trace names, `platform` domain, start/stop counts); 3 minor notes flagged above |
| Per-layer Coverage Expectation met | ✅ hook (domain logic) has 1:1 AC mapping; screen wiring per spec's Independent Test (tsc + inspection) |
| Every test maps to a spec requirement — no unclaimed tests | ✅ 6 lifecycle tests → AC1–6; L87-94 → AC9; L97-105 → AC7; L108-121 → AC8; L124-130 → edge case "background before visible"; L133-142 → edge case "idempotent stop" |
| Documented guidelines followed | ✅ none found in repo — strong defaults applied |

---

## Edge Cases

- [x] Rapid visibility gain/loss → one sample per session without throwing: covered by construction (per-session `screenTrace` guard `useScreenTrace.ts:26-28` prevents intra-session duplicate starts; each effect/cleanup pair yields exactly one start + one stop as shown by the lifecycle tests and the AC8 two-sample test). No dedicated rapid-toggle test — partial direct evidence, noted.
- [x] Idempotent stop (stop requested twice → at most once): `src/hooks/__tests__/useScreenTrace.test.ts:133-142` — background then unmount ⇒ `expect(mockTraces[0].stop).toHaveBeenCalledTimes(1)` (L141); guard at `useScreenTrace.ts:36-43`.
- [x] App backgrounds before any screen visible → no sample: `src/hooks/__tests__/useScreenTrace.test.ts:124-130` — `AppState.currentState = 'background'` then render ⇒ `expect(mockTraces).toHaveLength(0)` (L129); guard at `useScreenTrace.ts:45-47`.

---

## Gate Check

- **Gate command**: `npx jest --watchman=false` (watchman broken in this sandbox; `--watchman=false` required)
- **Hook suite**: `npx jest --watchman=false src/hooks/__tests__/useScreenTrace.test.ts` → **11 passed, 0 failed**
- **Full suite**: **196 passed, 0 failed**; Test Suites: 23 passed, 1 failed of 24 — the single failure is `src/__tests__/screens/profile.spec.tsx` failing to parse `node_modules/phosphor-react-native` (missing `transformIgnorePatterns`), **pre-existing at base 26203de** per orchestrator verification; failure signature matches exactly.
- **tsc**: `npx tsc --noEmit` → **no errors in feature files** (`useScreenTrace.ts`, test file, Home, Accounts). The only hit in a touched file is `src/screens/RegisterTransaction/index.tsx(69,29)` TS7016 (`@hookform/resolvers/yup` missing declarations) — **pre-existing**: the same import sits at line 68 in base `26203de` (`git show 26203de:src/screens/RegisterTransaction/index.tsx`), shifted +1 by this feature's added import line; other tsc errors are in unrelated files and also pre-existing.
- **Test count before feature**: 185 (196 − 11 new; diff range adds exactly one new test file and modifies/deletes no existing tests — integrity holds by diff inspection)
- **Test count after feature**: 196
- **Delta**: +11 new tests
- **Skipped tests**: none
- **Failures**: none caused by this feature

---

## Fix Plans

None required — no failed ACs, no surviving mutants. Optional hardening (not blocking): pin `trace()`'s first argument to the `getPerformance()` result in the AC1/3/5 test (spec-precision note 1).

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PERF-01 | Pending | ✅ Verified |
| PERF-02 | Pending | ✅ Verified |
| PERF-03 | Pending | ✅ Verified |
| PERF-04 | Pending | ✅ Verified |
| PERF-05 | Pending | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 10/10 ACs matched spec outcome (3 minor spec-precision notes flagged, non-blocking)
**Sensor**: 3/3 mutations killed
**Gate**: 196 passed, 0 failed (only pre-existing `profile.spec.tsx` suite parse failure); hook suite 11/11; tsc clean on feature files

**What works**: `useScreenTrace` starts a correctly named custom trace on visibility for all three screens, stops on blur/unmount/dismiss and on backgrounding, starts a fresh sample on foreground, attaches the `platform` attribute from the exact `ios|android` domain, and uses the cross-platform custom trace API (iOS rejection of `startScreenTrace` independently verified in the installed package). RegisterTransaction's present⇒mount / dismiss⇒unmount premise independently verified against `@gorhom/bottom-sheet` v5.2.14 source and all 5 call sites.

**Issues found**: none blocking. Minor: AC10 test does not pin `trace()`'s first arg to `getPerformance()`; AC9 asserts the attribute on the first sample only; blur is emulated via unmount in tests.

**Next steps**: requirement statuses updated to Verified in `spec.md`; feature ready to merge.
