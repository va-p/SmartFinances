# Upgrade Play Billing Library to v9 Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: N/A (Skipped - straightforward library upgrade)
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase - strong defaults applied (no explicit testing guidelines found).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Dependencies | none | Correct version set | `package.json` | `yarn install` |
| Native Config | build | Successful compilation | `android/` | `./gradlew assembleDebug` |
| JS Integration | unit | Billing provider compiles & works | `src/providers/__tests__/` | `yarn test` |

## Gate Check Commands

> Generated from codebase.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After JS changes | `yarn test` |
| Full | After dependency changes | `./gradlew :app:dependencies` |
| Build | After native/SDK config changes | `./gradlew clean assembleDebug` |

---

## Execution Plan

Phases are ordered and run sequentially.

### Phase 1: Migration

```
T1 → T2 → T3 → T4 → T5
```

---

## Task Breakdown

### T1: Update RevenueCat SDK Version

**What**: Update `react-native-purchases` to `^10.14.0` in `package.json`
**Where**: `package.json`
**Depends on**: None
**Reuses**: None
**Requirement**: BILL-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Update `package.json` has `"react-native-purchases": "^10.14.0"`
- [x] `yarn install` runs successfully

**Tests**: none
**Gate**: quick

---

### T2: Update Android SDK Configuration

**What**: Verify `compileSdk` is at least 35 in `android/app/build.gradle` (currently evaluated to 36)
**Where**: `android/app/build.gradle`
**Depends on**: T1
**Reuses**: None
**Requirement**: BILL-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `compileSdk` is evaluated to >= 35 (evaluated to 36 via rootProject)
- [x] `targetSdk` is evaluated to >= 35 (evaluated to 36 via rootProject)

**Tests**: build
**Gate**: build

---

### T3: Verify Play Billing Library Dependency Version

**What**: Verify `com.android.billingclient:billing` is at version 9.x.x
**Where**: `android/app/build.gradle`
**Depends on**: T2
**Reuses**: None
**Requirement**: BILL-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `./gradlew :app:dependencies` shows PBL v9

**Tests**: build
**Gate**: full

---

### T4: Check RevenueCat JS API Compatibility

**What**: Verify `src/providers/RevenueCatProvider.tsx` compiles with no errors
**Where**: `src/providers/RevenueCatProvider.tsx`
**Depends on**: T3
**Reuses**: None
**Requirement**: BILL-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `yarn lint` or TypeScript checks pass for `RevenueCatProvider.tsx`

**Tests**: unit
**Gate**: quick

---

### T5: Build and Verify Native App

**What**: Perform a clean assembleDebug build
**Where**: `android/`
**Depends on**: T4
**Reuses**: None
**Requirement**: BILL-01, BILL-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `./gradlew clean assembleDebug` finishes with success

**Tests**: build
**Gate**: build

---

## Phase Execution Map

```
Phase 1:  T1 ------→ T2 ------→ T3 ------→ T4 ------→ T5
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Update RevenueCat SDK Version | 1 file change | ✅ Granular |
| T2: Update Android SDK Configuration | 1 file change | ✅ Granular |
| T3: Verify PBL Dependency | 1 command check | ✅ Granular |
| T4: Check RevenueCat JS API | 1 file check | ✅ Granular |
| T5: Build and Verify Native App | 1 build action | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1   | None                   | None          | ✅ Match |
| T2   | T1                     | T1 -> T2      | ✅ Match |
| T3   | T2                     | T2 -> T3      | ✅ Match |
| T4   | T3                     | T3 -> T4      | ✅ Match |
| T5   | T4                     | T4 -> T5      | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1   | Dependencies                | none            | none      | ✅ OK |
| T2   | Native Config               | build           | build     | ✅ OK |
| T3   | Native Config               | build           | build     | ✅ OK |
| T4   | JS Integration              | unit            | unit      | ✅ OK |
| T5   | Native Config               | build           | build     | ✅ OK |
