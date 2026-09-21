# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Put acceptance-criteria behavior in pure modules (utils, form schemas) and rely on code inspection plus interactive UAT for render-only criteria, since this repo has no working component-render test harness
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `frontend-testing` · harmful: 0
- features: register-credit-card-fields
- evidence: CC-01/CC-02 render halves - src/screens/RegisterAccount/index.tsx:475-514 (no component-render harness in repo) (frontend-testing)
- last seen: 2026-09-14T23:13:22Z

### L-002 - When a masking requirement depends on a third-party component, verify the exact prop combination against the library's render code or a rendered probe — an always-on sibling prop (showValuesAsDataPointsText) can invert a conditional mask (showTextOnFocus)
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `frontend-components` · harmful: 0
- features: financial-goals
- evidence: SmartFinances/src/screens/GoalDetails/components/GoalProjectionChart/index.tsx:131-132 (GOAL-53 chart AC-7) (frontend-components)
- last seen: 2026-09-15T01:29:12Z

### L-003 - react-native-gifted-charts prop regressions in screen components pass the entire jest suite because no chart-layer test can render under the current ESM transform blocker — verify chart prop wiring against the library's dist render code and device UAT, never the suite alone
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `frontend-components` · harmful: 0
- features: financial-goals
- evidence: SmartFinances/src/screens/GoalDetails/components/GoalProjectionChart/index.tsx:133 (mutation 9, fix-regression probe) (frontend-components)
- last seen: 2026-09-15T01:38:27Z

### L-004 - When a spec pins which API must produce a call argument, assert that exact value instead of expect.anything()
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: screen-traces
- evidence: src/hooks/__tests__/useScreenTrace.test.ts:70 (AC10) (tests)
- last seen: 2026-09-21T17:20:57Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
