# Upgrade Play Billing Library to v9 Specification

## Problem Statement

Google Play Billing Library (PBL) v9 is the latest major version, required for all new apps and updates by August 2026. This project currently uses `react-native-purchases` v8.12.0 (RevenueCat), which uses an older PBL version. Upgrading is necessary for compliance and to leverage new billing features/stability.

## Goals

- [ ] Upgrade `react-native-purchases` to v10.x to support PBL v9.
- [ ] Ensure Android project meets SDK requirements for PBL v9 (`compileSdk 35`, etc.).
- [ ] Maintain existing subscription and one-time purchase functionality.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| New UI      | The upgrade should be transparent to the user. |
| iOS changes | This is focused on Android Play Billing Library. RevenueCat upgrade might affect iOS, but it's not the driver. |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| RevenueCat Version    | 10.14.0         | Latest version supporting PBL v9. | y |
| Android SDK Version   | 35              | Required by PBL v9. | y |
| Auto-reconnection     | Enabled         | Recommended by Google in PBL v9 migration guide. | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Upgrade RevenueCat SDK ⭐ MVP

**User Story**: As a developer, I want to upgrade the `react-native-purchases` dependency so that the app uses Play Billing Library v9.

**Why P1**: Core requirement for the task.

**Acceptance Criteria**:

1. The `react-native-purchases` dependency SHALL be updated to `^10.14.0` in `package.json`.
2. The project SHALL compile successfully with the new dependency.
3. WHEN the app starts, THEN the RevenueCat SDK SHALL initialize without errors.
4. The system SHALL use Play Billing Library v9 (verified via build logs/dependency tree).

**Independent Test**: Run `./gradlew :app:dependencies` and verify `com.android.billingclient:billing:9.x.x` is present.

---

### P1: Android Configuration Update ⭐ MVP

**User Story**: As a developer, I want to update the Android build configuration so that it is compatible with PBL v9.

**Why P1**: PBL v9 requires specific SDK versions.

**Acceptance Criteria**:

1. The `compileSdk` SHALL be set to 35 in `android/app/build.gradle`.
2. The `targetSdk` SHALL be at least 34 (recommended 35).
3. IF the build fails due to SDK mismatch, THEN the relevant versions SHALL be updated to meet PBL v9 requirements.

**Independent Test**: Build the app using `./gradlew assembleDebug`.

---

## Edge Cases

- IF Play Store is unavailable, THEN the system SHALL return `BILLING_UNAVAILABLE` (as per PBL v9 reclassification).
- IF a purchase fails due to insufficient funds, THEN the system SHALL receive the new `PAYMENT_DECLINED_DUE_TO_INSUFFICIENT_FUNDS` sub-response code.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story                       | Phase | Status   |
| -------------- | --------------------------- | ----- | -------- |
| BILL-01        | P1: Upgrade RevenueCat SDK  | Tasks | In Tasks |
| BILL-02        | P1: Android Config Update   | Tasks | In Tasks |

**ID format:** `BILL-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 2 total, 2 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

How we know the feature is successful:

- [ ] App builds and runs on Android with PBL v9.
- [ ] RevenueCat `Purchases.configure` succeeds.
- [ ] Existing purchase flows (fetch offerings, restore) work as expected.
