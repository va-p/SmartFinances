# Screen Traces — Firebase Performance Custom Screen Traces

## Problem Statement

The app ships `@react-native-firebase/perf` (installed + native plugin configured) but records no per-screen performance data. There is no visibility into how long users keep the Home, Accounts, and RegisterTransaction screens open, per platform. Custom screen traces close that gap using the cross-platform trace API.

## Goals

- [ ] Record one Firebase Performance custom trace sample per visibility session of the Home, Accounts, and RegisterTransaction screens
- [ ] Traces work identically on Android and iOS
- [ ] Trace samples exclude time the app spends backgrounded

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| HTTP request metrics | Separate concern, not requested |
| Task-level traces (sync, submit, upload) | Not requested |
| `startScreenTrace` (native slow/frozen frames) | Android-only API, rejects on iOS — incompatible with the cross-platform requirement |
| Traces on other screens | Only the 3 named screens are in scope |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| What a "screen trace" measures | Screen visibility duration: starts when the screen becomes visible, stops when it leaves visibility or the app backgrounds | Matches Firebase's screen-trace semantics and the linked duration-trace docs (app start / foreground / background are lifecycle-duration traces). A load-time trace was the rejected alternative | n |
| Cross-platform API | Custom trace API (`getPerformance` + `trace`) | `startScreenTrace` rejects on iOS (verified in `node_modules/@react-native-firebase/perf/lib/ScreenTrace.js`) | y |
| Home/Accounts visibility signal | `useFocusEffect` from `expo-router` | Both are tab screens; tabs stay mounted after first visit, so mount/unmount cannot express visibility | y |
| RegisterTransaction visibility signal | Same hook; the gorhom `BottomSheetModal` mounts children on present and unmounts on dismiss (verified: `BottomSheetModal.tsx` returns `null` until `mount` is true), so the focus effect fires on present and cleans up on dismiss | y |
| Trace names | `home_screen`, `accounts_screen`, `register_transaction_screen` (snake_case) | Firebase naming rules: no leading underscore, max 100 chars; consistent suffix groups them in the console | n |
| Attributes | Single `platform` attribute (`ios` / `android`) per trace | Enables per-platform segmentation in the Firebase console; kept minimal | n |
| Backgrounded time | Trace stops on any non-`active` AppState and a new sample starts when the app returns to `active` while the screen is still visible | Keeps samples measuring actual on-screen time, mirroring native automatic traces | n |

**Open questions:** none — all resolved or logged above.

## User Stories

### P1: Screen traces on Home, Accounts, and RegisterTransaction ⭐ MVP

**User Story**: As the app maintainer, I want a Firebase Performance trace for each visibility session of the three main screens, so that I can analyze per-screen engagement duration per platform in the Firebase console.

**Why P1**: The entire request. No partial slice ships value without all three screens wired.

**Acceptance Criteria** (EARS):

1. WHEN the Home screen becomes visible THEN the system SHALL start a Firebase Performance custom trace named `home_screen`
2. WHEN the Home screen stops being visible (blur or unmount) THEN the system SHALL stop the `home_screen` trace
3. WHEN the Accounts screen becomes visible THEN the system SHALL start a Firebase Performance custom trace named `accounts_screen`
4. WHEN the Accounts screen stops being visible (blur or unmount) THEN the system SHALL stop the `accounts_screen` trace
5. WHEN the RegisterTransaction bottom sheet is presented THEN the system SHALL start a Firebase Performance custom trace named `register_transaction_screen`
6. WHEN the RegisterTransaction bottom sheet is dismissed THEN the system SHALL stop the `register_transaction_screen` trace
7. WHILE a screen trace is running, WHEN the app transitions to a non-active state (background or inactive) THEN the system SHALL stop the running trace
8. WHILE a traced screen is still visible, WHEN the app returns to the active state THEN the system SHALL start a new trace sample for that screen
9. The system SHALL attach a `platform` attribute whose value is `ios` or `android` to every screen trace
10. The system SHALL record the traces through the custom trace API (`getPerformance` / `trace`) so they work on both Android and iOS

**Independent Test**: Unit tests drive the hook through focus, blur, background, and foreground transitions against a mocked `@react-native-firebase/perf` and assert trace name, start/stop calls, and the `platform` attribute. Screen wiring is verified by TypeScript compilation and code inspection of the three call sites.

## Edge Cases

- WHEN a screen gains and loses visibility rapidly THEN the system SHALL produce one trace sample per visibility session without throwing
- IF a trace stop is requested twice for the same session THEN the system SHALL stop the trace at most once (idempotent stop)
- WHEN the app backgrounds before any screen is visible THEN the system SHALL not create a trace sample

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PERF-01 | P1: Home screen trace (AC 1–2) | Execute | ✅ Verified |
| PERF-02 | P1: Accounts screen trace (AC 3–4) | Execute | ✅ Verified |
| PERF-03 | P1: RegisterTransaction screen trace (AC 5–6) | Execute | ✅ Verified |
| PERF-04 | P1: Background/foreground handling (AC 7–8) | Execute | ✅ Verified |
| PERF-05 | P1: Platform attribute + cross-platform API (AC 9–10) | Execute | ✅ Verified |

**Coverage:** 5 total, 5 mapped to execution steps, 0 unmapped

## Success Criteria

- [ ] The three screens emit `home_screen`, `accounts_screen`, and `register_transaction_screen` traces visible in the Firebase Performance console on both Android and iOS builds
- [ ] No trace sample includes time spent with the app backgrounded
- [ ] `jest` hook tests pass and `tsc --noEmit` reports no errors on changed files
