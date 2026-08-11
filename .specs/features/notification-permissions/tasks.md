# Notification Permissions — Tasks

**Feature:** notification-permissions
**Date:** 2026-08-11
**Total tasks:** 11

## Phase 1: Backend — User Model + API

### T1: Add `notifications_enabled` to Prisma User model

**Project:** `smart-finances-backend`
**Dependencies:** None
**Files:** `prisma/schema.prisma`

- Add `notificationsEnabled Boolean @default(true)` to the `User` model
- Run `npx prisma migrate dev --name add_notifications_enabled`
- Verify migration SQL is generated

**Verification:**
- [ ] Prisma generate succeeds
- [ ] Migration file exists in `prisma/migrations/`
- [ ] TypeScript types include `notificationsEnabled` on User

---

### T2: Accept `notifications_enabled` in PATCH user validator

**Project:** `smart-finances-backend`
**Dependencies:** T1
**Files:** `schemas/user.schema.ts`

- Add `notifications_enabled: z.boolean().optional()` to `updateUserSchema`
- Export updated TypeScript type

**Verification:**
- [ ] Valid PATCH payload with `notifications_enabled: true` passes validation
- [ ] Valid PATCH payload with `notifications_enabled: false` passes validation
- [ ] PATCH payload without `notifications_enabled` passes (optional field)
- [ ] Invalid value (e.g., string `"yes"`) is rejected by Zod

---

### T3: Handle `notifications_enabled` in user update controller

**Project:** `smart-finances-backend`
**Dependencies:** T2
**Files:** `controllers/user.controller.ts`

- Destructure `notifications_enabled` from request body in the update handler
- Include in Prisma `update` call: `if (notifications_enabled !== undefined) { data.notificationsEnabled = notifications_enabled; }`
- Include `notifications_enabled` in response JSON

**Verification:**
- [ ] `PATCH /user/:id` with `notifications_enabled: false` persists correctly
- [ ] `GET /auth/me` response includes `notifications_enabled` field
- [ ] Existing PATCH calls (without the field) still work (backward compatible)

---

## Phase 2: Frontend — State & Persistence

### T4: Add `notificationsEnabled` to Zustand store + MMKV

**Project:** `SmartFinances`
**Dependencies:** None (can run in parallel with T1–T3)
**Files:** `src/stores/userConfigsStorage.ts`

- Add `notificationsEnabled: boolean` to `UserConfigs` type
- Add `setNotificationsEnabled: (v: boolean) => void` setter
- Add `notificationsEnabled: true` to initial state (default to enabled — user opts out)
- Add `setNotificationsEnabled` implementation

**Verification:**
- [ ] TypeScript compiles without errors
- [ ] `useUserConfigs((s) => s.notificationsEnabled)` returns default `true`
- [ ] `setNotificationsEnabled(false)` updates the value

---

### T5: Persist `notificationsEnabled` in MMKV on sign-in/sign-out

**Project:** `SmartFinances`
**Dependencies:** T4
**Files:** `src/providers/AuthProvider.tsx`

- In `storageUserDataAndConfig()`: read `userData.notifications_enabled` from backend and store in MMKV + Zustand
- In `signOut()`: reset `notificationsEnabled` to `false` in Zustand (alongside other config resets)
- Ensure `DATABASE_CONFIGS` key pattern is followed: `storageConfig.set('SmartFinances_Configs.notificationsEnabled', value)`

**Verification:**
- [ ] On sign-in, `notificationsEnabled` in Zustand matches backend value
- [ ] On sign-out, `notificationsEnabled` resets to `false`
- [ ] MMKV value is cleared on sign-out

---

## Phase 3: Frontend — Permission Hook + App Integration

### T6: Create `useNotificationPermission` hook

**Project:** `SmartFinances`
**Dependencies:** T4
**Files:** `src/hooks/useNotificationPermission.ts` (new)

- Import `OneSignal` from `react-native-onesignal`
- Export a hook that:
  1. On mount, reads `notificationsEnabled` from `useUserConfigs`
  2. If `notificationsEnabled` is `true`, calls `OneSignal.Notifications.requestPermission(true)`
  3. Reads back `OneSignal.Notifications.permission` to get actual OS permission state
  4. If OS denied but config says enabled, updates config to `false` (sync reality)
  5. Logs permission outcome (no user-facing alert on automatic request)
- Only fires once (useRef guard or similar)

**Verification:**
- [ ] Hook compiles without errors
- [ ] Does NOT crash if OneSignal is not initialized (try-catch safety)
- [ ] Only requests permission once per mount (ref guard)

---

### T7: Call hook from `(app)/_layout.tsx`

**Project:** `SmartFinances`
**Dependencies:** T6
**Files:** `src/app/(app)/_layout.tsx`, `src/app/(app)/_layout.ios.tsx`

- Import and call `useNotificationPermission()` at the top of `AppLayout()` in both layout files
- No conditional rendering — the hook handles its own guard logic

**Verification:**
- [ ] Hook is called when user enters `(app)` group after sign-in
- [ ] Permission dialog appears on first app open (iOS/Android)
- [ ] Subsequent app opens do NOT re-trigger the dialog
- [ ] Both `_layout.tsx` (Android) and `_layout.ios.tsx` (iOS) include the hook call

---

## Phase 4: Frontend — OptionsMenu Toggle

### T8: Add notification toggle to OptionsMenu

**Project:** `SmartFinances`
**Dependencies:** T4, T5
**Files:** `src/screens/OptionsMenu/index.tsx`

- Import `Bell` icon from `phosphor-react-native` (check if already imported or add)
- Add `notificationsEnabled` and `setNotificationsEnabled` from `useUserConfigs()`
- Add `ButtonToggle` row in "Configurações" section (after useLocalAuth toggle):
  ```tsx
  <ButtonToggle
    icon={<Bell color={theme.colors.primary} />}
    title="Notificações"
    onValueChange={handleChangeNotifications}
    value={notificationsEnabled}
    isEnabled={notificationsEnabled}
  />
  ```
- Implement `handleChangeNotifications`:
  1. If turning ON: call `OneSignal.Notifications.requestPermission(true)`, read back permission, update Zustand + MMKV, PATCH backend
  2. If turning OFF: update Zustand + MMKV, PATCH backend
- Follow existing error handling pattern (Alert on failure)

**Verification:**
- [ ] Toggle appears in OptionsMenu under "Configurações" section
- [ ] Toggling ON triggers OS permission dialog (if not already granted)
- [ ] Toggling OFF persists `false` to MMKV and backend
- [ ] Toggle state survives app restart (reads from MMKV)
- [ ] Error state shows user-friendly Alert
- [ ] Visual style matches existing toggles (icon, label, switch)

---

### T9: Add `notifications_enabled` to backend config sync on toggle change

**Project:** `SmartFinances`
**Dependencies:** T8 (part of the same handler)
**Files:** `src/screens/OptionsMenu/index.tsx`

- In `handleChangeNotifications`, call `api.patch('user/${userId}/configs', { notifications_enabled: !notificationsEnabled })`
- Follow existing pattern from `handleChangeHideAmount` and `handleChangeSmartInsights`
- Store result in MMKV + Zustand only on successful 200 response

**Verification:**
- [ ] `PATCH user/:id/configs` is called with `notifications_enabled`
- [ ] On HTTP 200, local state is updated
- [ ] On error, local state is NOT updated and Alert is shown

---

### T10: Update `DATABASE_CONFIGS` constant

**Project:** `SmartFinances`
**Dependencies:** T4, T5
**Files:** `src/database/database.ts`

- Add `notificationsEnabled` key pattern to usage (MMKV keys are strings, no constant enum needed — just ensure consistent key naming)

**Verification:**
- [ ] MMKV key used consistently across AuthProvider, OptionsMenu, and hook

---

## Phase 5: Acceptance Verification

### T11: End-to-end acceptance check

**Project:** `SmartFinances` + `smart-finances-backend`
**Dependencies:** T1–T10

Manual verification of all 13 acceptance criteria from spec.md:

- [ ] AC1.1: Permission dialog appears on first `(app)` entry after sign-in
- [ ] AC1.2: Dialog does NOT reappear after OS-level decision is made
- [ ] AC1.3: Dialog never appears during auth/welcome flow
- [ ] AC1.4: Permission result persisted to local `notificationsEnabled`
- [ ] AC2.1: Toggle row with bell icon visible in OptionsMenu
- [ ] AC2.2: Toggle reflects current state from Zustand
- [ ] AC2.3: Toggle ON requests permission + syncs to backend
- [ ] AC2.4: Toggle OFF persists to local + backend
- [ ] AC2.5: Visual pattern matches existing toggles
- [ ] AC3.1: Preference survives app restart (MMKV)
- [ ] AC3.2: `notificationsEnabled` in Zustand with setter
- [ ] AC3.3: Reset to `false` on sign-out
- [ ] AC3.4: Synced to backend via `PATCH user/:id/configs`

---

## Dependency Graph

```
Phase 1 (Backend)          Phase 2 (State)         Phase 3 (Hook)        Phase 4 (UI)
─────────────────          ──────────────          ──────────────        ──────────────
T1 ──→ T2 ──→ T3          T4 ──→ T5              T6 ──→ T7             T8 + T9 + T10

[Phases 1 & 2 can run in parallel]
                              ↓                        ↓
                           Phase 2 ─────────→ Phase 3 ──→ Phase 4
                                                           ↓
                                                        Phase 5 (T11)
```

**Batches for sub-agent delegation:** 11 tasks at ~7/batch = 2 batches.
- Batch 1: Phase 1 + Phase 2 (T1–T5, 5 tasks — backend + state)
- Batch 2: Phase 3 + Phase 4 (T6–T10, 5 tasks — hook + UI)

Or execute inline since both batches fit comfortably (~5 each). The total is 11 tasks which pushes into the "offer sub-agents" range (>8). Let me present the option.
