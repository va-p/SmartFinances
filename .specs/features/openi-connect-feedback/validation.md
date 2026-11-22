# OpenI connect feedback — Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/openi-connect-feedback/spec.md`
**Diff range (app)**: `f457f74..328869a` (3 commits: `911072f`, `328869a` + card rename `267827d` nearby)
**Verifier**: standalone fresh-eyes pass (author ran gates; sensor in disposable worktrees, real trees verified clean after)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| Polling helper + unit tests | ✅ Done | `911072f` |
| Dismiss verdict + list refresh + screen tests | ✅ Done | `328869a` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CNX-01: silent close + new row → success + list | success alert + item rendered | `src/__tests__/screens/bankingIntegrations.spec.tsx:124` — `findByText('Instituição de Teste')`; `:126` — `toHaveBeenCalledWith('Contas conectadas com sucesso!', …'importadas')` | ✅ PASS |
| CNX-02: silent close + nothing → neutral | guidance alert, no hang | `src/__tests__/screens/bankingIntegrations.spec.tsx:145` — `toHaveBeenCalledWith('Conexão bancária', …'Nenhuma nova conexão')` | ✅ PASS |
| CNX-03: params → callback route | navigate preserved | `src/__tests__/screens/bankingIntegrations.spec.tsx:164` — `toHaveBeenCalledWith({ pathname: '/banking-callback', … })` | ✅ PASS |
| CNX-04: bounded polling | resolves on new id; null after budget; tolerates failures | `src/utils/__tests__/waitForNewIntegration.test.ts:13` (resolve), `:30` (null), `:43` (tolerate), `:59` (known-only) | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | app `BankingIntegrations/index.tsx:handlePressConnectNewAccount` | Reverted dismiss path to bare `return` (old silent behavior) | ✅ Killed — CNX-01 + CNX-02 fail, others pass |
| 2 | (covered in prior feature cycle for shared infra) | — | — |

**Sensor depth**: lightweight (1 targeted behavior-level mutation; helper covered by 4 unit tests incl. budget/id-shape cases)
**Result**: killed — PASS ✅

---

## Interactive UAT Results

Not performed. Needs a real connect flow (prod blank-page case + dev manual-close case).

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Manual close after real auth → success + item | ⏭️ Skip | needs live flow |
| 2 | Manual close with nothing done → neutral | ⏭️ Skip | needs live flow |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (user `Account`/`Home` WIP untouched; pre-existing mods untouched) |
| No scope creep | ✅ (widget redirect + callback route untouched) |
| Matches patterns | ✅ (existing Alert/confirm copy; repo test + disable-comment precedents) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | ✅ (repo patterns) |

---

## Edge Cases

- [x] Second account for an already-connected user (id-compare, not non-empty)
- [x] Transient refetch failure during polling (consumes attempt, retries)
- [x] Plan gate blocks (unchanged subscription route)
- [x] `profile.spec.tsx` env-broken suite unchanged (pre-existing)

---

## Gate Check

- **App gate**: `yarn jest --watchman=false` → 486 passed, 0 failed; 1 suite fails to load (`profile.spec.tsx`, pre-existing)
- **App lint (touched files)**: 0 errors
- **Test count**: +4 util tests, +3 screen tests (2 pre-existing focus tests unchanged)

---

## Fix Plans

None. No gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CNX-01..04 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (code) + live-flow UAT pending.

**Spec-anchored check**: 4/4 ACs matched with `file:line` evidence.
**Sensor**: 1/1 mutations killed.
**Gate**: app 486 pass, lint clean.

**What works**: silent session close now ends in a verdict (success + updated list, or neutral guidance); deep-link path untouched.

**Issues found**: none blocking. Reminder: client plumbing (scheme, callback URL, `redirectUrl` forwarding) verified correct — if prod still never redirects, that's OpenI-widget-side.

**Next steps**: live connect test in dev (manual close) and prod (blank page → close); push branches on explicit go-ahead.
