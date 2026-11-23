# Investment Group Rate Format Validation: PASS

**Date**: 2026-11-22
**Verdict**: PASS
**Spec**: Inline spec supplied with the verification request. This small-scoped feature intentionally has no `spec.md` or `tasks.md`.
**Diff range**: `uncommitted working tree vs HEAD`
**Diff surface**: `src/utils/groupInvestments.ts` and `src/utils/__tests__/groupInvestments.test.ts` only. Other working-tree modifications were excluded and untouched.
**Verifier**: independent Verifier (author ≠ verifier)
**Commit**: none created or claimed.

---

## Task Completion

No formal tasks exist for this small feature. The inline Done-when condition is met: focused tests assert all three exact labels, and the pre-existing missing-rate fallback remains passing.

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion expression | Result |
| --- | --- | --- | --- |
| Numeric rate `100` displays two decimals | `CDB · 100.00% CDI` | `src/utils/__tests__/groupInvestments.test.ts:156,160-162` — case `['100.0000', '100.00']`; `expect(buildInvestmentGroupLabel({ ...cdbData, rate })).toBe(`CDB · ${expectedRate}% CDI`)` | ✅ PASS |
| Numeric rate `115` displays two decimals | `CDB · 115.00% CDI` | `src/utils/__tests__/groupInvestments.test.ts:157,160-162` — case `['115.0000', '115.00']`; `expect(buildInvestmentGroupLabel({ ...cdbData, rate })).toBe(`CDB · ${expectedRate}% CDI`)` | ✅ PASS |
| Numeric rate `102.5` preserves its fractional digit | `CDB · 102.50% CDI` | `src/utils/__tests__/groupInvestments.test.ts:158,160-162` — case `['102.5000', '102.50']`; `expect(buildInvestmentGroupLabel({ ...cdbData, rate })).toBe(`CDB · ${expectedRate}% CDI`)` | ✅ PASS |
| Existing grouped-label assertion uses the new precise format | `CDB · 100.00% CDI` | `src/utils/__tests__/groupInvestments.test.ts:83` — `expect(groups[0].label).toBe('CDB · 100.00% CDI')` | ✅ PASS |
| Missing rate and rate type retain product-only fallback | `CDB` | `src/utils/__tests__/groupInvestments.test.ts:165-168` — `expect(buildInvestmentGroupLabel({ ...cdbData, rate: null, rateType: null })).toBe('CDB')` | ✅ PASS |
| Missing details retain generic fallback | `Investimento` | `src/utils/__tests__/groupInvestments.test.ts:169` — `expect(buildInvestmentGroupLabel(null)).toBe('Investimento')` | ✅ PASS |

**Status**: ✅ All three spec examples resolve to the exact asserted strings, not merely to test presence. Both pre-existing fallback assertions are unchanged by the diff and pass. Product selection remains subtype-first, then type, then `Investimento` at `src/utils/groupInvestments.ts:78-81`; that logic is untouched by the scoped diff. No speculative requirements added.

## Discrimination Sensor

| Mutation | File:line in scratch | Description | Killed? |
| --- | --- | --- | --- |
| 1 | `src/utils/groupInvestments.ts:85` | `numericRate.toFixed(2)` → `numericRate.toFixed(4)` | ✅ Killed |

- **Depth**: lightweight, one targeted behavior-level mutation.
- **Isolation**: copied package/config and `src` under `$TMPDIR`, symlinked `node_modules`, mutated only the scratch implementation, then deleted the scratch. No real source or test file was mutated; no stash or Git worktree was used.
- **Command**: `yarn --cwd <scratch> test src/utils/__tests__/groupInvestments.test.ts --runInBand --watchman=false`
- **Result**: 4 failed, 12 passed, 16 total. All three new parameterized cases failed with four-decimal output; the existing grouped-label assertion also failed. The fallback test remained passing.
- **Real-tree porcelain before and after**: identical:

```text
 M .specs/LESSONS.md
 M .specs/lessons.json
 M src/screens/InstitutionDetails/index.tsx
 M src/utils/__tests__/groupInvestments.test.ts
 M src/utils/groupInvestments.ts
```

**Sensor result**: 1/1 killed — PASS.

## Code Quality

| Principle | Status | Evidence |
| --- | --- | --- |
| Minimum code; no single-use abstraction or speculative flexibility | ✅ | One numeric conversion and one conditional `toFixed(2)` at `src/utils/groupInvestments.ts:83-85`. |
| Surgical changes; only necessary scoped files changed | ✅ | Scoped diff is 18 insertions and 3 deletions across the two requested files. |
| No scope creep or unrelated improvements | ✅ | Implementation comment and formatting logic only; out-of-scope working-tree files untouched. |
| Existing product selection and fallback preserved | ✅ | Selection code unchanged at `src/utils/groupInvestments.ts:78-81`; fallback assertions pass. |
| Matches existing patterns/style | ✅ | Uses existing label pipeline and Jest `it.each`; ESLint and `git diff --check` pass. |
| Tests map to the inline ACs and are non-shallow | ✅ | Exact full-string equality covers decimals, product, `%`, spacing, and `CDI`. |
| Spec-anchored outcome check | ✅ | Every asserted output above equals the inline spec outcome. |
| Per-layer coverage expectation | ✅ | Utility behavior has direct 1:1 assertions for the new examples and retained fallback. |
| No unclaimed feature tests | ✅ | The one updated assertion and three new parameterized cases all trace to the inline spec. |
| Documented guidelines followed | ✅ | `/Users/vap/.agents/skills/tlc-spec-driven-v3/references/coding-principles.md`. |

## Edge Cases

- [x] Whole-number rates gain `.00` (`100`, `115`).
- [x] One-decimal fractional rates gain a trailing zero (`102.50`).
- [x] Missing rate/rate type still returns the product label.
- [x] Missing details still return `Investimento`.

## Gate Check

- **Focused gate**: `yarn test src/utils/__tests__/groupInvestments.test.ts --runInBand --watchman=false`
- **Result**: 1 suite passed; **16 passed, 0 failed, 0 skipped**.
- **Test count before feature**: 13 at `HEAD`.
- **Test count after feature**: 16.
- **Delta**: +3, from the three new `it.each` cases at `src/utils/__tests__/groupInvestments.test.ts:155-163`.
- **Integrity**: no tests deleted, disabled, or skipped. The existing grouped-label assertion became more precise; the pre-existing fallback assertions were not modified.
- **Lint gate**: `yarn eslint src/utils/groupInvestments.ts src/utils/__tests__/groupInvestments.test.ts` — exit 0, no lint errors; dependency TypeScript-support and Node deprecation warnings only.
- **Whitespace gate**: `git --no-pager diff --check -- src/utils/groupInvestments.ts src/utils/__tests__/groupInvestments.test.ts` — exit 0.

## Interactive UAT

Not required. This is a utility-only change with focused automated coverage.

## Requirement Traceability

The inline spec has no requirement-ID status artifact to update. No `spec.md` was created.

## Lessons

None. This is a clean PASS with no grounded failure signal.

## Summary

**Overall**: ✅ Ready.

The implementation formats numeric rates to exactly two decimals, preserves existing selection and fallback behavior, passes both focused gates, and the exact-output tests kill the targeted regression mutant. No ranked gaps found.
