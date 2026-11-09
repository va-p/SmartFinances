# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-004 - When a spec pins which API must produce a call argument, assert that exact value instead of expect.anything()
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: screen-traces
- evidence: src/hooks/__tests__/useScreenTrace.test.ts:70 (AC10) (tests)
- last seen: 2026-09-21T17:20:57Z

### L-005 - Boundary-date tests alone do not discriminate period-equality predicates: pair an equal period key (e.g., ISO week 33) from a DIFFERENT period-year (2025 vs 2026) and assert exclusion, or dropping the year comparison survives the full suite.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `src/utils` · harmful: 0
- features: weekly-period-filter
- evidence: src/utils/isDateInSelectedPeriod.ts:17 (src/utils)
- last seen: 2026-09-28T00:39:06Z

### L-006 - When a task extracts a module to a shared path, delete the old copy and re-point every importer in the same commit, then grep the tree to confirm only the shared path remains.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/hooks` · harmful: 0
- features: list-search
- evidence: SRCH-11 / src/screens/Home/index.tsx:33 (src/hooks)
- last seen: 2026-09-28T16:31:10Z

### L-007 - Screen-wiring value faults (mode guards, optional prop values) pass every automated gate because no gate renders screens - verify screen wiring value-by-value against the precedent screen; only missing required props are caught (tsc)
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `frontend-screens` · harmful: 0
- features: overview-period-ruler
- evidence: mutations M1-M3 - src/screens/Overview/index.tsx:268,271,406 (frontend-screens)
- last seen: 2026-09-29T02:01:35Z

### L-008 - Jest mocks of animation libraries must be behaviorally faithful (stateful useSharedValue via useRef, not per-render re-initialization) or wiring tests silently pass without the wiring under test.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `jest-infra/react-native-reanimated` · harmful: 0
- features: base-currency
- evidence: AM-M5 (StepIndicator slide effect drop) (jest-infra/react-native-reanimated)
- last seen: 2026-10-05T22:44:08Z

### L-009 - Absolute-positioned overlays must anchor to a shrink-wrapped sibling row (testID'd), never a full-width padded container - jest wiring tests pass while the on-device layout is wrong, so pin the structural anchor in a test and verify the reference on device.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `frontend-components/absolute-positioning` · harmful: 0
- features: base-currency
- evidence: BC-26 layout (StepDash absolute anchor) (frontend-components/absolute-positioning)
- last seen: 2026-10-05T22:52:45Z

### L-010 - Centered step content columns that overflow their slot spill transparent full-width children over sibling UI (swallowing taps invisibly) - bound each step in an overflow:hidden slot, z-order the indicator above it, and give small tap targets hitSlop; jest cannot see layout or hit-testing, so verify taps on device.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `frontend-components/layout` · harmful: 0
- features: base-currency
- evidence: BC-10 (bullet taps, first screen) (frontend-components/layout)
- last seen: 2026-10-05T23:10:42Z

### L-011 - When asserting fraction-digit rounding, use fixtures with more decimals than either candidate precision so 2dp and 8dp assertions cannot both pass.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `src/utils/buildNetWorthEvolution.ts` · harmful: 0
- features: net-worth-consistency
- evidence: src/utils/buildNetWorthEvolution.test.ts:305 (src/utils/buildNetWorthEvolution.ts)
- last seen: 2026-10-30T14:28:40Z

### L-012 - When a generated child inherits several parent flags, assert every inherited field in the generator test, not just the primary flag
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `backend-tests` · harmful: 0
- features: recurring-subscription-selectors
- evidence: validation (backend-tests)
- last seen: 2026-11-01T20:32:40Z

### L-013 - Keep period-filtering logic in testable utils instead of inline screen code so the jest gate can kill guard-removal mutants
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `screens` · harmful: 0
- features: exclude-future-transactions
- evidence: M3 src/screens/Overview/index.tsx:183 (screens)
- last seen: 2026-11-02T20:51:41Z

### L-014 - Give every optional component prop an explicit default so react/require-default-props stays green
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `lint` · harmful: 0
- features: transfer-link
- evidence: src/screens/RegisterTransaction/index.tsx:174 (lint)
- last seen: 2026-11-02T21:52:39Z

### L-015 - Screen-wiring acceptance criteria with no render harness get explicit manual-QA items in the validation report instead of unit-test claims
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `screens` · harmful: 0
- features: transfer-link
- evidence: TLINK-03 (screens)
- last seen: 2026-11-02T21:52:39Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
