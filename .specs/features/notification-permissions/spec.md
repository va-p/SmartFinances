# Notification Permissions — Specification

**Status:** Specify → Discuss (gray areas identified)
**Scope:** Medium
**Date:** 2026-08-11

## Problem

OneSignal push notifications are configured in the project (dependency installed, backend flows use them), but the app **never requests notification permission** from the user. Without the OS-level permission grant, notifications are silently disabled and will never work. Users have no way to enable or disable notifications — there's no UI toggle.

## Requirements

### R1 — Permission Request on First App Open

**As a** user opening the app for the first time after sign-in,
**I want** to be prompted to allow notifications,
**So that** I can receive push notifications from SmartFinances.

**Acceptance Criteria:**

- **AC1.1:** When a signed-in user enters the `(app)` group for the first time (no prior permission decision recorded), the system calls `OneSignal.Notifications.requestPermission(true)` to trigger the native OS permission dialog.
- **AC1.2:** The permission request is made exactly once per install — if the user has already granted or denied permission (persisted by the OS), the dialog is not shown again.
- **AC1.3:** The permission request is deferred until after sign-in completes and the user is on an `(app)` screen — never shown on the auth/welcome flow.
- **AC1.4:** The user's permission decision (granted/denied) is read back from OneSignal and persisted to the local `notificationsEnabled` config flag.

### R2 — Notification Toggle in OptionsMenu

**As a** user who wants control over notifications,
**I want** a toggle switch in the OptionsMenu screen,
**So that** I can enable or disable notifications at will.

**Acceptance Criteria:**

- **AC2.1:** A `ButtonToggle` row labeled "Notificações" appears in the "Configurações" section of OptionsMenu, using a notification/bell icon.
- **AC2.2:** The toggle reflects the current `notificationsEnabled` state from the Zustand store.
- **AC2.3:** Toggling ON triggers `OneSignal.Notifications.requestPermission(true)` if permission is not yet granted; syncs the result to local state + backend.
- **AC2.4:** Toggling OFF disables notifications via OneSignal (`OneSignal.Notifications.clearAll()` or equivalent opt-out) and persists to local state + backend.
- **AC2.5:** The toggle follows the same visual pattern as existing toggles (hideAmount, darkMode, insights, useLocalAuth).

### R3 — Persistence

**As a** returning user,
**I want** my notification preference to survive app restarts,
**So that** I don't need to reconfigure it every time.

**Acceptance Criteria:**

- **AC3.1:** `notificationsEnabled` is stored in MMKV (`DATABASE_CONFIGS.notificationsEnabled`) and loaded on app start.
- **AC3.2:** `notificationsEnabled` is added to the Zustand `useUserConfigs` store with `setNotificationsEnabled`.
- **AC3.3:** On sign-out, `notificationsEnabled` is reset to `false` in Zustand (consistent with other configs in `signOut()`).
- **AC3.4:** The preference is synced to the backend via `PATCH user/:id/configs` with field `notifications_enabled`.

## Gray Areas (Require Discussion)

### GA1: Where exactly to request permission?

**Options:**
- **A)** In `RootNavigationLayout` (inside `_layout.tsx`), in a `useEffect` that fires when `isSignedIn` becomes true and the user enters `(app)`.
- **B)** In the `(app)/_layout.tsx` component, on mount.
- **C)** In a dedicated `useNotificationPermission` hook called from `(app)/_layout.tsx`.

**Recommendation:** Option C — a dedicated hook keeps concerns separated and is easy to test/reuse if needed later.

### GA2: What does "toggling OFF" actually do?

**Options:**
- **A)** Call `OneSignal.User.removeObserver()` / `OneSignal.Notifications.clearAll()` to fully disable — notifications stop completely, but the OS permission remains granted. Toggling ON again would re-subscribe without re-prompting.
- **B)** Just set a flag — backend respects it by not sending push notifications to users with `notifications_enabled: false`. The OS permission stays as-is.
- **C)** Both: set the flag (for backend) + remove the OneSignal subscription (for client-side safety).

**Recommendation:** Option B for the MVP — the backend already needs to check this flag before sending. Option A or C adds complexity (re-subscription flow) without proven need. The toggle is primarily a user preference flag.

### GA3: Should notification preference be synced to backend?

**Options:**
- **A)** Yes — `PATCH user/:id/configs` with `notifications_enabled`. Matches the pattern of `insights` and `hide_amount` which are already synced.
- **B)** No — keep it client-only. No backend changes needed.

**Recommendation:** Option A — this is consistent with the existing config pattern, and the backend needs this information to decide whether to send push notifications to a given user. Without it, the backend has no way to honor the user's preference.

### GA4: Is the toggle worth adding?

The user explicitly asked to analyze and discuss this. Relevant considerations:

**Pros:**
- Gives users control — some users find notifications annoying and want to disable them
- Consistent UX — other preferences (insights, hideAmount) already have toggles
- Required for the feature to be useful — without a way to disable, users who deny the initial prompt have no path to re-enable

**Cons:**
- Adds another toggle to an already busy OptionsMenu
- Requires backend schema change (`notifications_enabled` column on User)
- OneSignal subscription management adds complexity

**Verdict:** Worth adding. It's a standard expectation for any app with push notifications. Without it, users who accidentally deny the initial prompt are locked out permanently, and users who change their mind have no recourse.

## Out of Scope

- Backend notification-sending logic (already exists — this feature only gates it behind a user preference flag)
- Rich notification content (images, actions)
- Notification categories/channels customization
- Deep-linking from notifications
