# register-credit-card-fields Validation

**Date**: 2026-09-14
**Spec**: `.specs/features/register-credit-card-fields/spec.md`
**Diff range**: frontend `72b3056^..91e4a81` (SmartFinances, branch `goals-target-savings`); backend `79bb11b` (smart-finances-backend)
**Verifier**: standalone fallback (author = verifier) — the fresh Verifier sub-agent could not be dispatched (platform usage limit); per `sub-agents.md` the validate.md checklist was executed as an independent fresh-eyes pass over the spec and diff, including the spec-anchored check and discrimination sensor.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T0: spec | ✅ Done | `validate_spec.py` exit 0; commit `72b3056` |
| T1: payload/date builder + tests | ✅ Done | commit `4bac549`; 14 tests |
| T2: schema extraction + screen integration | ✅ Done | commit `00e0631`; 19 tests; spec statuses commit `91e4a81` |
| T3: backend null-guard + contract tests | ✅ Done | commit `79bb11b`; 11 tests |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CC-01 WHEN type CREDIT THEN display 4 inputs | 4 inputs rendered only for CREDIT | `src/screens/RegisterAccount/index.tsx:475` — `{isCreditCard && (` with `credit_card_brand` (L481 'Bandeira do cartão'), `credit_card_close_day` (L490), `credit_card_credit_limit` (L499), `credit_card_available_credit_limit` (L508) | ⚠️ Code-evidence only — no component-render harness in this repo (the only render test, `profile.spec.tsx`, fails pre-existing); pending interactive UAT |
| CC-02 WHEN type not CREDIT THEN no card input | fields hidden; card validation not applied | Validation half automated: `src/__tests__/screens/registerAccountSchema.spec.ts:145-147` — `expect(schema.validateSync(validWalletAccount)).toBeTruthy()` (WALLET form with no card fields passes; killed by sensor mutant 2). Render half: same conditional as CC-01 (code evidence) | ⚠️ Partially automated |
| CC-03 WHILE type CREDIT require brand/day/total limit | submission rejected without them | `registerAccountSchema.spec.ts:39-40` — `toThrow('Digite a bandeira do cartão')`; `:48-49` — `toThrow('dia de fechamento')`; `:57-58` — `toThrow('limite total')`; `:67` — `toThrow('não pode ser negativo')` | ✅ PASS |
| CC-04 IF day not integer 1-31 THEN reject | validation message, bounds enforced | `registerAccountSchema.spec.ts:78-85` — `toThrow('entre 1 e 31')` for 0 and 32; `:87-94` — `toThrow('número inteiro')` for 8.5; `:96-103` — non-numeric rejected; `:72-76` — boundary days 1 and 31 accepted | ✅ PASS |
| CC-05 IF available limit empty THEN accept; WHEN filled THEN non-negative | optional field, no negatives | `registerAccountSchema.spec.ts:116-123` — empty string accepted; `:125-132` — `toThrow('não pode ser negativo')` for -50; `:134-141` — non-numeric rejected | ✅ PASS |
| CC-06 WHEN editing existing card THEN pre-fill 4 fields | values from stored creditData; null/0 limits pre-fill as empty | Extraction logic automated: `src/__tests__/utils/creditCardData.spec.ts:51-66` — `getClosingDayFromDate('2026-10-08T00:00:00.000Z')` → 8, Date instance → UTC day, null/''/invalid → null. setValue wiring: `index.tsx:317-333` (code evidence: `brand || ''`, `creditLimit || undefined`, `availableCreditLimit > 0 ? … : null`) | ⚠️ Logic automated; screen wiring code-inspected |
| CC-07 WHEN CREDIT submitted THEN creditData payload | brand string, ISO-8601 UTC datetime with entered day, creditLimit number, availableCreditLimit number|null | Builder: `creditCardData.spec.ts:82-87` — `toEqual({ brand: 'Visa', balanceCloseDate: '2026-10-08T00:00:00.000Z', creditLimit: 5000, availableCreditLimit: 700 })`; `:96-99` — ISO regex + exact literal. Backend persistence: `smart-finances-backend/src/__tests__/account.controller.test.ts:429-436` — `assert.equal(data.creditCardBrand, 'Visa')`, `data.creditCardBalanceCloseDate?.toISOString()` = `'2026-10-08T00:00:00.000Z'`, `data.creditCardCreditLimit?.toString()` = `'5000'`, `assert.equal(data.creditCardAvailableCreditLimit, null)` | ✅ PASS (payload/conjunction rule: values and persisted state asserted, not call counts) |
| CC-08 WHEN non-CREDIT submitted THEN no creditData key | key omitted | `creditCardData.spec.ts:123-135` — `buildCreditCardDataPayload(...)` → `toBeNull()` for each incomplete input (caller omits); screen: `index.tsx:248-255` — `isCreditCard ? … ?? undefined : undefined` (code evidence) | ✅ Logic automated; wiring code-inspected |
| CC-09 WHEN day missing from month/passed THEN roll forward | next month containing the day, at UTC midnight | `creditCardData.spec.ts:13-17` — `toBe('2026-10-08T00:00:00.000Z')`; `:19-23` — current month kept; `:31-47` — day-31, Feb-30 overflow, Feb-29 non-leap cases with exact literals; killed by sensor mutant 1 | ✅ PASS |
| CC-10 Backend schemas accept manual creditData; reject non-datetime close date | zod contract pinned | `smart-finances-backend/src/__tests__/account.schema.test.ts:101-104` — manual payload accepted; `:106-112` — `availableCreditLimit: null` accepted; `:114-121` — key omitted accepted; `:123-132` — date-only `'2026-10-08'` rejected; `:134-140` — negative creditLimit rejected; `:142-151` — 51-char brand rejected; `:153-163` — update with null limits accepted; `:166-172` — update date-only rejected | ✅ PASS |
| CC-11 IF null limits on update THEN persist null, no error | null persisted, no 500 | `account.controller.test.ts:460-464` — `assert.equal(updates[0][1].data.creditCardAvailableCreditLimit, null)` + Decimal `'5000'`; `:492-494` — `creditCardCreditLimit` null persisted; killed by sensor mutant 3 | ✅ PASS |

**Status**: ✅ All logic-bearing ACs covered with assertion evidence; ⚠️ render-layer halves of CC-01/CC-02/CC-06 are code-inspected (no render harness in repo) — interactive UAT offered to the user.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/utils/creditCardData.ts:69` | Off-by-one: roll-forward guard `candidate.getTime() < todayUtcMs` → `<=` (same-day closing rolls to next month) | ✅ Killed — 1 test failed ('edge: same-day closing is kept') |
| 2 | `src/screens/RegisterAccount/schema.ts:44,53,63,71` | All four credit `.when('type')` conditionals flipped `is: CREDIT_TYPE` → `is: 'WALLET'` (rules never fire for CREDIT) | ✅ Killed — 10 tests failed (all conditional rejections + WALLET acceptance) |
| 3 | `smart-finances-backend/src/controllers/account.controller.ts:452` | Null-guard disabled: `creditData.availableCreditLimit === null` → `=== 42` (null reaches `new Decimal` and throws) | ✅ Killed — 2 CC-11 tests failed (no `account.update` call, 500 path) |

**Sensor depth**: lightweight (3 behavior-level mutations on the highest-risk new code)
**Scratch method**: file backup → mutate → run → restore → `git diff --stat` empty per file → `git status --porcelain` identical to pre-sensor baseline in both repos (no `git stash` used)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not yet performed (automation-covered ACs verified above). Render-layer ACs (CC-01, CC-02, CC-06 wiring) offered to the user as a post-validation walkthrough.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ No speculative fields; integration-only card columns untouched |
| Surgical changes | ✅ Screen changes limited to the feature; the Yup schema moved verbatim to `schema.ts` (co-located module) solely to make CC-03..05 unit-testable |
| No scope creep | ✅ Backend change is the spec'd CC-11 contract fix (zod allows `.nullable()`, controller threw) |
| Matches patterns | ✅ Util + payload-builder pattern mirrors `transactionPayload.ts`; backend tests follow existing `node:test` mock style; pt-BR copy matches app language |
| Spec-anchored outcome check | ✅ Exact literals asserted (ISO strings, messages, values); no vague assertions |
| Every test maps to a spec requirement | ✅ 14 + 19 + 8 + 3 tests all trace to CC-02..CC-11, listed edge cases, or the cited account-institutions regression anchors (AC11.3/11.4) |
| Documented guidelines followed | ✅ `.specs/codebase/CONVENTIONS.md` (utils camelCase, named exports, RHF+Yup, `api` instance) |

Pre-existing issues surfaced, not fixed (out of scope): `eslint` fails repo-wide (`.eslintrc.json` extends uninstalled `airbnb` config); `profile.spec.tsx` and `buildGoalProjection.spec.ts` fail on `main`-line history before this feature; frontend `tsc --noEmit` has ~100 pre-existing errors project-wide (unchanged count in touched files).

---

## Edge Cases

- [x] Closing day 29/30/31 in short months rolls forward (never month-overflow): `creditCardData.spec.ts:37-47` — exact ISO literals for Feb-30 → Mar-30, Feb-29 → Mar-29
- [x] Type switched away from CREDIT: card validation relaxed (automated `registerAccountSchema.spec.ts:145-147`); `creditData` omitted from payload (code-inspected `index.tsx:248-255`)
- [x] Available limit cleared on edit sends null and persists null: `creditCardData.spec.ts:102-109` + `account.controller.test.ts:443-464`
- [x] Stored card without limits pre-fills empty, not 0: code-inspected `index.tsx:324-333` (`creditLimit || undefined`, `availableCreditLimit > 0 ? … : null`)

---

## Gate Check

- **Frontend gate** (`yarn jest --watchman=false`, SmartFinances): 181 tests, 180 pass, 1 fail — the failure and both failing suites (`profile.spec.tsx`, `buildGoalProjection.spec.ts`) are pre-existing on the baseline before this feature. New suites: `creditCardData.spec.ts` 14/14, `registerAccountSchema.spec.ts` 19/19.
  - Test count before feature: 148 (147 pass / 1 pre-existing fail)
  - Test count after feature: 181 (180 pass / same 1 pre-existing fail)
  - Delta: +33 new tests, 0 deleted, 0 skipped
- **Backend gate** (`yarn test:unit`, smart-finances-backend): 202 tests, 202 pass, 0 fail, 0 skipped. Before: 191. Delta: +11.
- **Type safety**: frontend `tsc --noEmit` — touched files show exactly the 6 pre-existing errors present at baseline (no new); backend `tsc --noEmit` exit 0.

---

## Requirement Traceability Update

spec.md statuses were set to Verified with commit `91e4a81`. No changes required by this validation; CC-01/CC-02/CC-06 render wiring remains flagged for interactive UAT.

---

## Summary

**Overall**: ✅ Ready (render-layer AC pending interactive UAT by the user)

**Spec-anchored check**: 8/11 ACs fully matched by automated assertions; 3 ACs partially automated (render/wiring halves code-inspected — no component-test harness in this repo)
**Sensor**: 3/3 mutations killed
**Gate**: frontend 180/181 (1 pre-existing fail), backend 202/202

**What works**: conditional credit-card fields with validation on create and edit; payload building with next-occurrence UTC closing date; create/edit persistence through the `creditData` contract; null limits persist as null (backend contract bug fixed).

**Issues found**: none blocking. Render-layer verification requires interactive UAT (offered).

**Next steps**: user runs the interactive UAT walkthrough; optionally re-dispatch the independent Verifier sub-agent once available (usage limit resets) if a fresh-eyes re-check is wanted.

**Lessons distilled**: 1 (see `.specs/LESSONS.md`) — signal `ac_gap` for render-layer ACs in a repo without a component-render harness.
