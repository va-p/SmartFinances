# recurring-subscription-selectors Validation

**Date**: 2026-11-01
**Spec**: inline (verification brief RS-01..RS-04; no `spec.md` — small scope, one-liner/auto-sized)
**Diff range**:
- Frontend repo (`SmartFinances`), branch `feat/recurring-transaction-selectors`, commit `74a15a2` — `src/screens/RegisterTransaction/index.tsx` (+15/−5)
- Backend repo (`smart-finances-backend`), branch `feat/recurring-transaction-selectors`, commit `5efe46d` — `src/controllers/transaction.controller.ts` (+11/−4), `src/__tests__/transaction.controller.test.ts` (+4)
**Verifier**: independent sub-agent (author ≠ verifier), read-only over real tree; scratch mutants in `/private/tmp/sensor-scratch`, removed after use; tree porcelain matches pre-sensor baseline

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 — Frontend: keep both selectors enabled while series active + hydration fallback | ✅ Done | `74a15a2`, `src/screens/RegisterTransaction/index.tsx` |
| T2 — Backend: recurring child inherits series/subscription flags | ✅ Done | `5efe46d`, `src/controllers/transaction.controller.ts` |
| T3 — Backend: 3 new child-inheritance assertions on FX-06 | ✅ Done | `5efe46d`, `src/__tests__/transaction.controller.test.ts` |
| T4 — Gates: backend unit, frontend designation unit, full frontend suite | ✅ Done | counts in Gate Check |

No formal `tasks.md` (small scope — ≤3 files, implicit steps).

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| RS-01: WHILE a transaction is recurring OR a subscription THEN both selectors SHALL present enabled | `isEnabled === true` on both `Recorrente` and `Assinatura` toggles when `isRecurring \|\| isSubscription` | `SmartFinances/src/screens/RegisterTransaction/index.tsx:295` — `const selectorsEnabled = isRecurring \|\| isSubscription;` wired as `isEnabled={selectorsEnabled}` at `:1728` (`Recorrente`) and `:1770` (`Assinatura`) | ✅ PASS (implementation-verified; no jest harness covers screen wiring — see Sensor row 2 exemption) |
| RS-02: WHEN editing a transaction with `is_subscription` true THEN editor SHALL present subscription ON and recurring ON, defaulting missing/invalid period to MONTHLY | `setIsRecurring(true)` + `setIsSubscription(true)` + `setRecurrencePeriod('MONTHLY')` on missing/invalid period | `SmartFinances/src/screens/RegisterTransaction/index.tsx:1400-1403` — `const designated = Boolean(transactionData.is_subscription); const recurring = Boolean(transactionData.is_recurring) \|\| designated; if (recurring) { setIsRecurring(true); … }`; `:1420-1421` — `} else if (designated) { setRecurrencePeriod('MONTHLY'); }`; `:1428` — `setIsSubscription(designated);` | ✅ PASS (implementation-verified; same wiring-harness exemption) |
| RS-03: WHEN the backend generates a recurring child THEN the child SHALL inherit `isRecurring` true, the parent interval/period, `isSubscription`, `hideFromSubscriptionList`, with `parentTransactionId` set and `nextOccurrenceAt` null | child row carries parent series flags; stays a child (`parentTransactionId` set, `nextOccurrenceAt` null) | `smart-finances-backend/src/controllers/transaction.controller.ts:1051-1058` — `isRecurring: true, recurrenceInterval: parent.recurrenceInterval, recurrencePeriod: parent.recurrencePeriod, isSubscription: parent.isSubscription ?? false, hideFromSubscriptionList: parent.hideFromSubscriptionList ?? false, parentTransactionId: parent.id, nextOccurrenceAt: null`; asserted by `smart-finances-backend/src/__tests__/transaction.controller.test.ts:632` — `assert.equal(creates[0][1].data.parentTransactionId, 7)`; `:634` — `assert.equal(creates[0][1].data.isRecurring, true)`; `:635` — `assert.equal(creates[0][1].data.recurrenceInterval, 1)`; `:636` — `assert.equal(creates[0][1].data.recurrencePeriod, "MONTHLY")` | ✅ PASS (kill-verified; minor note: `isSubscription`/`hideFromSubscriptionList`/`nextOccurrenceAt` inherit lines `:1054-1058` have no dedicated assertion — ranked gap 1, Minor) |
| RS-04: Subscriptions read model SHALL still list only parents | `parentTransactionId: null` filter unchanged | `smart-finances-backend/src/controllers/subscription.controller.ts:32-39` — `subscriptionWhere` keeps `parentTransactionId: null` (with `isSubscription: true, hideFromSubscriptionList: false, isRecurring: true`); `:85-91` — `getSubscriptionById` keeps `parentTransactionId: null`; feature commit `5efe46d` touches only `transaction.controller.ts` + its test (`git show --name-only`), and `git log` shows the subscription controller last touched by `5db6e39` (prior feature) | ✅ PASS |

**Status**: ✅ All ACs covered (4/4; 0 spec-precision gaps — every criterion defines a precise value/state and each is traced above)

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `smart-finances-backend/src/controllers/transaction.controller.ts:1051` (scratch copy `verifier-tx-mutant.ts`, removed after) | Child inherit `isRecurring: true` → `false` (author's sensor; verifier re-ran on scratch copy + `node:assert` simulation) | ✅ Killed — `transaction.controller.test.ts:634` `assert.equal(data.isRecurring, true)` fails on the mutant (simulation: ORIGINAL passes, MUTANT fails) |
| 2 | `SmartFinances/src/screens/RegisterTransaction/index.tsx:295` (scratch copy `verifier-rt-mutant.tsx`, removed after) | Wiring `isRecurring \|\| isSubscription` → `isRecurring && isSubscription` | ❌ Survived — no jest harness imports `selectorsEnabled`/`isEnabled` wiring (`grep` over `src/__tests__/` + `src/utils/__tests__/` empty; only `registerTransactionSchema.spec.ts` touches the screen dir, schema-only). Truth table diverges exactly on the RS-01 single-flag cases (`rec=true/sub=false`, `rec=false/sub=true`), so the mutant is behaviorally real but undetectable → **exempted**: project convention (benefits-tiers precedent) exempts screen wiring; decision logic lives in unit-tested utils (`resolveSubscriptionSwitch`/`resolveRecurringSwitch`/`resolveRecurrenceSaved`, 17/17 green). Accepted, no fix task. |

**Sensor depth**: lightweight (2 targeted behavior-level mutations on highest-risk new code)
**Result**: 1/1 killable killed; 1 survived-with-exemption — PASS ✅
**Isolation**: real-tree porcelain matches pre-sensor baseline in both repos (frontend: `M .specs/LESSONS.md, M .specs/lessons.json, M android/app/build.gradle`; backend: `M .specs/project/PROJECT.md, M prisma.config.ts` — all pre-existing, untouched); scratch verifier copies removed, author backups (`rt-backup.tsx`, `tx-backup.ts`) left intact.

---

## Interactive UAT Results (if performed)

Not performed — backend flag inheritance + selector-wiring fix with automated gates; no complex user-facing flow requiring human judgment.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ — one derived boolean + hydration branch (frontend); one inherit block (backend) |
| Surgical changes | ✅ — 1 source file per repo + 4-line test addition; read model untouched |
| No scope creep | ✅ — no unrelated refactors; `BEN-15` image-null rule preserved at `transaction.controller.ts:1048-1050` |
| Matches patterns | ✅ — comments cite existing requirement IDs (`SD-20`, `SD-16..19`, `BEN-15`); `?? false` fallback matches file style |
| Spec-anchored outcome check (asserted values match spec) | ✅ — per AC table above |
| Per-layer Coverage Expectation met | ✅ — domain decision logic 1:1 via `subscriptionDesignation.test.ts`; backend behavior via FX-06 assertions |
| Every test in scope maps to a spec requirement | ✅ — 17 designation tests → SD-06/16..19/22..24; 3 new FX-06 assertions → RS-03 |
| Documented guidelines followed | ✅ — none found; strong defaults applied, existing file conventions followed |

---

## Edge Cases

- [x] Inconsistent row (`is_subscription` true + `is_recurring` false) hydrates recurring ON: `designated=true` forces `recurring=true` → `setIsRecurring(true)` (`index.tsx:1400-1403`), subscription stays ON (`:1428`); missing/invalid period falls back to `MONTHLY` (`:1420-1421`). Handled correctly.
- [x] Child of a transfer parent inherits false subscription flags — safe: transfer legs are never subscriptions (`transaction.service.ts:171-180` forces `isSubscription: false, hideFromSubscriptionList: false`; `transaction.controller.ts:360-366` excludes `TRANSFER_*` from auto-classification), so `parent.isSubscription ?? false` → `false`; the subscription UI is additionally hidden for transfers (`index.tsx:1755` `transactionType !== 'TRANSFER'`); the read model requires `isSubscription: true`, excluding transfer children. Safe.

---

## Gate Check

- **Gate commands**:
  - Backend: `yarn test:unit`
  - Frontend (targeted): `CI=true yarn jest src/utils/__tests__/subscriptionDesignation.test.ts --watchman=false`
  - Frontend (full): `CI=true yarn jest --watchman=false`
- **Result**:
  - Backend: **368 passed, 0 failed**, 0 skipped, 0 todo
  - Frontend targeted: **17 passed, 17 total** (`subscriptionDesignation.test.ts`)
  - Frontend full: **399 passed, 399 total**; suites 46 passed / 1 failed — the single failing suite is the pre-existing env-broken `src/__tests__/screens/profile.spec.tsx` (`react-native-device-info` `NativeEventEmitter` null argument, thrown at import). No test failures; no new failures.
- **Test count before/after**: backend 365 → 368 (+3 new RS-03 assertions folded into existing FX-06 test); frontend counts unchanged by this feature (wiring has no harness, exempted).
- **Skipped tests**: none.
- **Failures**: none (excluding the pre-existing env-broken suite load, unrelated to this diff).

---

## Fix Plans (if issues found)

### Fix 1 (Minor, optional follow-up): assert the remaining RS-03 inherit fields on FX-06

- **Root cause**: `transaction.controller.test.ts:632-636` asserts `parentTransactionId`/`isRecurring`/`recurrenceInterval`/`recurrencePeriod` but not `isSubscription`, `hideFromSubscriptionList`, or `nextOccurrenceAt` (`transaction.controller.ts:1054-1058`), so a fault there (e.g. `isSubscription: true` hardcoded) would survive.
- **Fix task**: add `assert.equal(creates[0][1].data.isSubscription, false)`, `assert.equal(creates[0][1].data.hideFromSubscriptionList, false)`, `assert.equal(creates[0][1].data.nextOccurrenceAt, null)` to the FX-06 test (parent fixture has no subscription flags, so `false`/`false`/`null` are the spec-defined expectations).
- **Priority**: Minor (primary outcome kill-verified; does not block PASS).

---

## Requirement Traceability Update

Spec is inline (no `spec.md` for this feature; auto-sized small scope). No `spec.md` statuses to update.

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| RS-01 | Implementing | ✅ Verified |
| RS-02 | Implementing | ✅ Verified |
| RS-03 | Implementing | ✅ Verified (Minor follow-up noted) |
| RS-04 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (PASS)

**Spec-anchored check**: 4/4 ACs matched spec outcome, 0 spec-precision gaps
**Sensor**: 1 killed + 1 survived-with-exemption (screen-wiring, convention-exempt)
**Gate**: backend 368/368; frontend targeted 17/17; frontend full 399/399 (1 pre-existing env-broken suite, no new failures)

**What works**:
- Both selectors stay enabled while the series is active (`selectorsEnabled = isRecurring || isSubscription`), for initial occurrences and generated children alike.
- Editing a designated subscription hydrates subscription ON + recurring ON, defaulting a missing/invalid period to MONTHLY.
- Generated children inherit the series + subscription flags while staying children (`parentTransactionId` set, `nextOccurrenceAt` null).
- Subscriptions read model unchanged — still parents only.

**Issues found**: one Minor optional follow-up (assert remaining RS-03 inherit fields in FX-06) — non-blocking.

**Next steps**: none required; optionally apply Fix 1 in a follow-up commit.
