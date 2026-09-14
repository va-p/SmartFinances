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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
