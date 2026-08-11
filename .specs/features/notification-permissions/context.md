# Notification Permissions — Context (User Decisions)

**Date:** 2026-08-11

## Gray Area Resolutions

### GA1: Permission Request Location
**Decision:** Option C — Dedicated `useNotificationPermission` hook, called once from `(app)/_layout.tsx`.
**Rationale:** Clean separation, follows existing hooks pattern, reusable.

### GA2: Toggle OFF Behavior
**Decision:** Option B — Just set a flag. Backend checks `notifications_enabled` before sending push notifications.
**Rationale:** Lowest complexity for MVP. Backend already needs this flag. Client-side subscription management can be added later if needed.

### GA3: Backend Sync
**Decision:** Option A — Sync `notifications_enabled` to backend via `PATCH user/:id/configs`.
**Rationale:** Backend needs this information to decide whether to send push notifications. Consistent with existing `insights` and `hide_amount` pattern.

### GA4: Include Toggle
**Decision:** Yes — add the toggle to OptionsMenu.
**Rationale:** Essential UX for users to re-enable after initial denial. Standard expectation for notification-enabled apps.
