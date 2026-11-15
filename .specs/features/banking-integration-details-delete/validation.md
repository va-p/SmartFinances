# Banking integration details + delete — Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/banking-integration-details-delete/spec.md`
**Diff range (app)**: `77f4c99..c784c67` (1 commit: `c784c67`)
**Diff range (backend)**: `68fa251..33fcf92` (2 commits: `c17e6f6`, `33fcf92`)
**Verifier**: standalone fresh-eyes pass (author ran gates; sensor in disposable worktrees, real trees verified clean after)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| Backend pstr + cascade + tests | ✅ Done | `c17e6f6` (+ `33fcf92` legacy-test stubs) |
| Frontend details/delete + tests | ✅ Done | `c784c67` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| BID-01: details shows info | bank name, status, accounts rendered | `src/__tests__/screens/bankingIntegrationDetails.spec.tsx:91` - `getAllByText(/Instituição de Teste/).length >= 1` + `:92` account name | ✅ PASS |
| BID-02: numeric route id resolves | 200 with accounts, not 400 | `src/__tests__/bankingIntegration.detail.test.ts:395` - `assert.equal(statuses[0], 200)` on `params: { id: 28 }` | ✅ PASS |
| BID-03: fetch failure shows error state | 'Erro' + standard message | `src/__tests__/screens/bankingIntegrationDetails.spec.tsx:103-108` - `getByText('Erro')`, `getByText('Não foi possível carregar…')` | ✅ PASS |
| BDEL-01: header trash icon | delete button present | `src/__tests__/screens/bankingIntegrationDetails.spec.tsx:93` - `getByTestId('header-delete-button')` | ✅ PASS |
| BDEL-02: confirm warns, cancel aborts | alert text + mutate only on confirm | `src/__tests__/screens/bankingIntegrationDetails.spec.tsx:119-139` confirm path; `:155-161` cancel path (`not.toHaveBeenCalled`) | ✅ PASS |
| BDEL-03: confirmed delete cascades + back | provider + tx + accounts + integration removed | backend `src/__tests__/bankingIntegration.detail.test.ts:549-560` - 200, `deleteItem` called, all three wheres asserted | ✅ PASS |
| BDEL-04: provider failure still deletes locally | 200 + local deletes executed | `src/__tests__/bankingIntegration.detail.test.ts:585-596` | ✅ PASS |
| BDEL-05: no transactions remain | `transaction.deleteMany` scoped to integration accounts | `src/__tests__/bankingIntegration.detail.test.ts:558` - `where: { accountId: { in: [10, 11] } }` | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

Scratch-only mutations (disposable worktrees, discarded; real-tree porcelain verified unchanged after).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | backend `bankingIntegration.controller.ts:pstr` | Removed numeric branch (old behavior) | ✅ Killed — BID-02 + BID-01 fail (400 instead of 200/404) |
| 2 | backend `bankingIntegration.controller.ts:delete` | Deleted cascade, kept only integration delete | ✅ Killed — BDEL-03 fails (no tx/account deletes) |
| 3 | app `BankingIntegrationDetails/index.tsx` | Removed `Header.DeleteButton` | ✅ Killed — 3 delete/render tests fail |
| 4 | app `BankingIntegrationDetails/index.tsx` | `if (error …)` → `if (false)` | ✅ Killed — error-state test fails |

**Sensor depth**: lightweight (4 targeted behavior-level mutations)
**Result**: 4/4 killed — PASS ✅

---

## Interactive UAT Results

Not performed. Needs a device build with an integration present (id 28-shape): open details → info shows; trash → confirm → back to list.

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Details renders info | ⏭️ Skip | needs device + seeded integration |
| 2 | Delete with cascade | ⏭️ Skip | needs device; backend covered by unit tests |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (user WIP in `Home`/`Account` untouched except the card NaN guard folded into the commit; pre-existing `LESSONS`/`pbxproj` mods untouched) |
| No scope creep | ✅ (stale `fix/banking-integration-rout` branch ignored per request) |
| Matches patterns | ✅ (Account/BudgetDetails confirm + error patterns; `useAccountMutations` hook pattern; node:test + assert) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | ✅ (repo test patterns) |

---

## Edge Cases

- [x] Missing detail id → error state (disabled query + `!bankingIntegrationID` branch)
- [x] Delete cancelled → no mutation call
- [x] Provider delete fails → local cascade still completes (BDEL-04)
- [x] Goal-reserve conflict → transaction rolls back, error alert (documented in spec assumptions)
- [x] `profile.spec.tsx` env-broken suite unchanged (pre-existing)
- [x] `showHeader` unused-var warning in `BankingIntegrations` unchanged (pre-existing)

---

## Gate Check

- **App gate**: `yarn jest --watchman=false` → 474 passed, 0 failed; 1 suite fails to load (`profile.spec.tsx`, pre-existing env breakage)
- **App lint (touched files)**: 0 errors (1 pre-existing warning)
- **Backend gate**: `tsc --noEmit` clean; `yarn test:unit` → 476/476 pass
- **Test count**: app +4 new (details spec), backend +5 new (detail spec); 3 legacy delete tests adapted with cascade stubs (assertions unchanged)

---

## Fix Plans

None. No gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| BID-01/02/03 | Implementing | ✅ Verified |
| BDEL-01..05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (code) + device UAT pending.

**Spec-anchored check**: 8/8 ACs matched with `file:line` evidence.
**Sensor**: 4/4 mutations killed.
**Gate**: app 474 pass, backend 476 pass, lint clean.

**What works**: details loads via numeric-id fix; header trash with confirm deletes provider item, accounts, transactions, and integration atomically, then goes back; error state replaces the silent blank.

**Issues found**: none blocking. User WIP (`Home` hidden-accounts filter, `Account` invoice label) left uncommitted and untouched.

**Next steps**: device check with a real integration; push branches on explicit go-ahead.
