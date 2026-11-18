# Validation: investment-consolidation

**Feature:** investment account grouping + enriched cards (Layout 2)
**Verifier:** independent (did not write this code; no source/test/spec file modified)
**Date:** 2026-11-15 (iteration 2 — re-verification of the 2 test-only fix commits)
**Spec (ACs = source of truth):** `.specs/features/investment-consolidation/spec.md`
**Context (locked):** `.specs/features/investment-consolidation/context.md`
**Design (Layout 2 approved):** `.specs/features/investment-consolidation/design.md`
**Tasks:** `.specs/features/investment-consolidation/tasks.md`

**Verdict: PASS** (iteration 2 — both iteration-1 gaps closed by test-only commits
`9b4cb7f` + `1528782`; no source changes since iteration 1).
**Result: PASS**
Every AC INV-01..INV-09 has located assertion evidence, all 5 mutants were killed
(3 carried over from iteration 1 + 2 new sensor probes on the fixed edges),
and all gates are green. No remaining gaps.

---

## 1. Task Completion

`tasks.md` marks all 7 tasks ✅ Done — confirmed by reading the file.

| Task | Commit (frontend unless noted) | Done mark | Gate file present |
| ---- | ------------------------------ | --------- | ----------------- |
| T1 backend `investmentData` on accounts read | backend `2c0ecd7` | ✅ Done | `smart-finances-backend/src/__tests__/account.controller.test.ts` |
| T2 grouping + profit util | `6c09a10` | ✅ Done | `SmartFinances/src/utils/__tests__/groupInvestments.test.ts` |
| T3 group row Layout 2 | `e2e100d` | ✅ Done | `SmartFinances/src/__tests__/components/investmentGroupListItem.spec.tsx` |
| T4 store group payload | `d98de11` | ✅ Done | `SmartFinances/src/__tests__/stores/currentAccountSelected.spec.ts` |
| T5 InstitutionDetails wiring | `7ba9e50` | ✅ Done | `SmartFinances/src/__tests__/screens/institutionDetails.spec.tsx` |
| T6 Account group mode | `f86a447` | ✅ Done | `SmartFinances/src/__tests__/screens/accountGroupMode.spec.tsx` |
| T7 search + totals | `3effc02` (HEAD) | ✅ Done | `SmartFinances/src/utils/__tests__/filterSectionsByQuery.test.ts` |

---

## 2. Per-AC evidence (evidence-or-zero)

Conjunction/payload rule applied to `investmentData`: backend assertions check
**field values**, not call presence (`rate == "100"`, `rateType == "CDI"`,
`expiresAt == "2028-12-01T00:00:00.000Z"`, plus whitelist exclusion).

| AC | Spec outcome | Evidence (`file:line` + assertion) |
| -- | ------------ | ----------------------------------- |
| INV-01 group key `type\|subtype\|rateType\|rate` | Same product/rate collapses; different rate splits | `src/utils/__tests__/groupInvestments.test.ts:44` `expect(buildInvestmentGroupKey(a)).toBe(buildInvestmentGroupKey(b))` — identical legs share key; `:53` different `rate` splits; `:62` `' cdb '` normalizes to same key; `src/__tests__/screens/institutionDetails.spec.tsx:124` `getByText('CDB · 100% CDI (2)')` + `:126` flat names absent |
| INV-02 collapsed header sum + count | Header shows summed balance and position count | `src/__tests__/components/investmentGroupListItem.spec.tsx:60` `getByText('CDB · 100% CDI (2)')` + `:61` `getByText('R$ 950,08')`; `src/utils/__tests__/groupInvestments.test.ts:82` `count == 2` + `:84` `totalBalanceBase toBeCloseTo(950.08, 8)` |
| INV-03 expand reveals members | Expanding lists member positions with individual balances | `src/__tests__/screens/institutionDetails.spec.tsx:154` `getAllByText('CDB - NU …')` `toHaveLength(2)` after `fireEvent.press` on group; `:167-176` Ver-todas navigates `pathname: '/accounts/[accountId]'` with `id` matching `/^group:/` and store `accountGroupKey == 'FIXED_INCOME\|CDB\|CDI\|100'`, `accountGroupMemberIds == ['88','89']`; `src/__tests__/screens/accountGroupMode.spec.tsx:132-136` both member names + `R$ 700,06` / `R$ 250,02`; `src/__tests__/stores/currentAccountSelected.spec.ts:28-33` set/get key + ids |
| INV-04 totals preserved | Group sums equal pre-grouping flat sum | `src/__tests__/screens/institutionDetails.spec.tsx:144` `getByText('R$ 2.450,08')` (= 700.06+250.02+500+1000 fixture total, grouping on); `src/utils/__tests__/filterSectionsByQuery.test.ts:153` `groupedTotal toBeCloseTo(700.06+250.02+300, 8)`; `src/__tests__/screens/accountGroupMode.spec.tsx:124` header `R$ 950,08`; mixed-currency edge (iter-2, `1528782`) `src/utils/__tests__/groupInvestments.test.ts:149-150` `toHaveLength(1)` + `totalBalanceBase toBeCloseTo(700, 8)` for 100 USD @5 + 200 BRL via per-leg `toBase` |
| INV-05 card shows `rateType`, `rate`, maturity | Values exposed end-to-end (payload rule: values asserted) | backend `src/__tests__/account.controller.test.ts:412` `investmentData.rate == "100"` + `:413` `rateType == "CDI"` + `:414` `expiresAt == "2028-12-01T00:00:00.000Z"` + `:415-417` subtype/gross/original values + `:418` `!("extraUnknownField" in investmentData)`; `:461-462` same shape on `getAccountById`; frontend `src/__tests__/components/investmentGroupListItem.spec.tsx:75` `getByText('+R$ 100,12')` (net-preferred profit) + `:76` `getByText('NU FINANCEIRA S.A. · Venc 12/2028')`; rate visible in header label `:60` `'CDB · 100% CDI (2)'`; unparseable edge (iter-2, `9b4cb7f`) `:131-157` `expiresAt = 'not-a-date'` → uniform group `:145` `queryByText(/Venc/) == null` + `:146` `queryByText(/NaN/) == null`, mixed group `:156` `queryByText(/Venc/) == null` |
| INV-06 null fields omitted | No `"null"` text, no crash | backend `:447` `investmentData == null` for null metadata, `:448` `!("investmentData" in payload[1])` for `WALLET`; frontend `:108` `queryByText(/null/) == null` + `:109` `queryByText(/NaN/) == null` with all-null details, `:110` type fallback renders; unparseable-string variant (iter-2, `9b4cb7f`) `:131-157` — `Venc` chip omitted and no `NaN` text for `expiresAt: 'not-a-date'` (uniform `:145-146`, mixed `:156`) |
| INV-07 manual accounts unchanged | Manual bucket renders legacy card, never grouped/dropped | `src/utils/__tests__/groupInvestments.test.ts:87-96` two null-metadata accounts → `toHaveLength(2)` groups each `count == 1`; `src/__tests__/screens/institutionDetails.spec.tsx:137` singleton `Tesouro Direto` renders as today |
| INV-08 search surfaces whole groups | Member name/issuer/rate match → entire group | `src/utils/__tests__/filterSectionsByQuery.test.ts:128-131` `'especial'` → 1 group, `count == 2`, ids `[1,2]`; `:136-138` `'nu financeira'`/`'cdi'`/`'ipca'` each → length 1; `:158-163` search text contains label + name + issuer + rate; `src/__tests__/screens/institutionDetails.spec.tsx:185` query `'cdi'` keeps `'CDB · 100% CDI (2)'`; `:194-195` query `'tesouro'` hides the group, keeps `Tesouro Direto` |
| INV-09 counts stay consistent | True position count per group | `src/utils/__tests__/groupInvestments.test.ts:82` `count == 2`; `filterSectionsByQuery.test.ts:130-131` `count == 2` + member ids `[1,2]`; `src/__tests__/screens/accountGroupMode.spec.tsx:125` `getByText('2 contas')`; `institutionDetails.spec.tsx:173-176` store ids `['88','89']` |

---

## 3. Edge cases

| Spec edge | Evidence | Covered? |
| --------- | -------- | -------- |
| All positions share one key → single group, not empty list | `groupInvestments.test.ts:81` `groups toHaveLength(1)` for identical legs; `institutionDetails.spec.tsx:124` one group row | ✅ |
| `expiresAt` **unparseable** → omit maturity chip, no crash | Iter-2 `9b4cb7f` `investmentGroupListItem.spec.tsx:131-157`: `expiresAt = 'not-a-date'` → uniform group `:145` `Venc` absent + `:146` `NaN` absent; mixed (valid + bad) group `:156` `Venc` absent. Exercises the `Number.isNaN` guard (`InvestmentGroupListItem/index.tsx:93-96`) in the uniform case and the mixed-maturity `every(date === first)` branch in the mixed case | ✅ (was Gap 1, closed iter-2) |
| Mixed currencies → convert each leg via `convertCurrency` before sum | Iter-2 `1528782` `groupInvestments.test.ts:135-151`: 100 USD (×5 per-leg `toBase`) + 200 BRL → `:149` one group + `:150` `totalBalanceBase toBeCloseTo(700, 8)`. Exercises the per-leg `toBase(account)` accumulation (`groupInvestments.ts:149,161`) — the same injection point the screen feeds from `baseById` built via `convertCurrency` (`InstitutionDetails/index.tsx:234-262,332-335`, `(account) => baseById.get(...) ?? 0`) | ✅ (was Gap 2, closed iter-2) |
| `providerMetadata` missing → manual bucket, never dropped | `groupInvestments.test.ts:65-70` `manual:` unique keys; `:95-96` manuals stay singles; backend `:447` null mapping; `institutionDetails.spec.tsx:137` singleton renders | ✅ |

---

## 4. Gates

`tsc`/`eslint` are **not gated** (red at baseline and polluted by the foreign
uncommitted edits listed in §7 — stated per verification protocol, not executed).

### Frontend (`yarn jest --watchman=false <6 in-scope files>`, from `/Users/vap/00_code/JS/SmartFinances`)

`--watchman=false` was required: the sandbox blocks watchman's LaunchAgents
plist write, crashing `fb-watchman`. Plain `yarn jest` exits 1 on that
environment issue, unrelated to the feature.

| Suite | Tests |
| ----- | ----- |
| `src/utils/__tests__/groupInvestments.test.ts` | 13 passed (+1 iter-2 `1528782` mixed-currency sum) |
| `src/__tests__/components/investmentGroupListItem.spec.tsx` | 6 passed (+1 iter-2 `9b4cb7f` unparseable-`expiresAt`) |
| `src/__tests__/stores/currentAccountSelected.spec.ts` | 3 passed |
| `src/__tests__/screens/institutionDetails.spec.tsx` | 8 passed |
| `src/__tests__/screens/accountGroupMode.spec.tsx` | 4 passed |
| `src/utils/__tests__/filterSectionsByQuery.test.ts` | 12 passed (6 pre-existing SRCH + 6 new INV-08) |
| **Total** | **6 suites, 46/46 passed** |

Before/after delta: 5 new spec files (+32 tests at iter-1) and `filterSectionsByQuery.test.ts`
6 → 12 tests (+6 INV-08; pre-existing count read at `origin/fix/hidden-accounts`).
Iter-2 adds exactly 2 tests, both assertions for the former gaps (`9b4cb7f`, `1528782`);
44 → 46. No test deletions (in-scope diff adds only; `git diff … --stat` shows additions).

### Backend (`node --import tsx --test src/__tests__/account.controller.test.ts`, from `/Users/vap/00_code/JS/smart-finances-backend`)

| Result | Detail |
| ------ | ------ |
| **12/12 passed** (re-run at final tree state) | 9 pre-existing (AC-3/GOAL-42/49/50) + 3 new INV: `INV-05` list shape, `INV-06` null/omit, `INV-05` `getById` shape |

---

## 5. Discrimination sensor (mandatory, scratch-only)

Method: pristine `git archive HEAD` copy to `/private/tmp/inv-consolidation-sensor`
(no foreign edits, no `.git`), `node_modules` symlinked, `--watchman=false`.
Scratch baseline green (12/12 util). Mutants applied one at a time with `python3`,
covering suite re-run, mutant reverted, scratch deleted afterwards. The real tree
was never mutated by the sensor (all scratch edits under `/private/tmp/`).

| # | Mutant (behavior-level, new feature code) | Covering suite | Result |
| - | ---------------------------------------- | -------------- | ------ |
| M1 | `groupInvestments.ts:41` drop `.toUpperCase()` from `normalizePart` (key normalization flip) | `groupInvestments.test.ts` | **KILLED** — `normalizes case and whitespace…` fails, 1 failed / 11 passed |
| M2 | `groupInvestments.ts` `return gross - original` → `return gross` (profit term dropped) | `groupInvestments.test.ts` + `investmentGroupListItem.spec.tsx` | **KILLED** — `computes gross profit…` fails (expected 50.1, received 750.1). Component suite still passes, correctly: the header prefers net profit (`amountProfit`), so a gross-only mutant must not move the header — this also confirms the net-preference branch works |
| M3 | `filterSectionsByQuery.ts` `investmentGroupSearchText` reduced to member names only (issuer/rate/label dropped) | `filterSectionsByQuery.test.ts` + `institutionDetails.spec.tsx` | **KILLED** — 3 failures: `matches issuer and rate labels`, `builds search text…`, `surfaces the whole group on a rate-label search` |

**Sensor iter-1: 3 killed / 0 survived.**

### Iteration-2 probes (scratch-only, same method; real tree never mutated, scratch deleted)

| # | Mutant (behavior-level, fixed-edge code) | Covering suite | Result |
| - | ---------------------------------------- | -------------- | ------ |
| S1 | `InvestmentGroupListItem/index.tsx:94-96` drop the `Number.isNaN` guard (unparseable-date → chip renders) | `investmentGroupListItem.spec.tsx` (new `9b4cb7f` case) | **KILLED** — `omits the maturity chip when expiresAt is unparseable` fails at `:145` (`queryByText(/Venc/)` no longer null), 1 failed / 5 passed |
| S2 | `groupInvestments.ts:149,161` `toBase(account)` → `Number(account.balance)` (raw sum, ignore conversion) | `groupInvestments.test.ts` (new `1528782` case) | **KILLED** — `sums converted per-leg values…` fails at `:150` (received 300 raw vs expected 700, diff 400), 1 failed / 12 passed |

**Sensor iter-2: 2 killed / 0 survived. Cumulative: 5 killed / 0 survived.**

---

## 6. Code quality (vs coding principles)

| Check | Finding |
| ----- | ------- |
| Minimum, surgical | ✅ New code is additive: 1 util, 1 component, 1 store extension (3 fields), 1 search helper ×2 fns, screen branches. No existing behavior altered except the INVESTMENTS section path |
| Existing patterns | ✅ `convertCurrency` path reused, `AccountListItem` reused for preview/members, `filterSectionsByQuery` signature kept, synthetic `group:` id reuses existing Account route, zustand store conventions kept |
| Scope creep | ⚠️ Minor: docs commit `04d397a` also adds `.specs/features/credit-card-next-statement/spec.md` (docs-only, harmless but out of scope); `jest.setup.js` reanimated-chain fix + `HeaderSearchButton` `testID` are test-infra in direct support of the new suites (justified); backend T1 also widens `createAccount`/`updateAccount` responses beyond the tasks.md contract (`getAccounts`/`getAccountById` only) — consistent with the feature, but those two paths have **no test assertions** (observation, not an AC gap) |
| Tests 1:1 to ACs (matrix) | ✅ unit everywhere per matrix; strong defaults applied (no AGENTS.md/CONTRIBUTING.md found — consistent with tasks.md); no unclaimed tests (every new test carries an INV/SRCH/edge comment) |
| Layout | Layout 2 implemented as recommended; header tap toggles the inline preview while `Ver todas` opens Account group mode — satisfies AC INV-03 (expand reveals members) and the Q1 dual behavior via the affordance; the header row itself does not navigate (noted, matches the committed tests `:160-177`) |

---

## 7. Tree-integrity notes (foreign edits, concurrent commit)

- Iteration-2 status (recorded before AND after sensor work, identical): frontend `M src/components/TransactionListItem/index.tsx`, `M src/interfaces/accounts.ts`, `M src/interfaces/transactions.ts` (foreign to this feature, untouched, not counted) + `?? .specs/features/investment-consolidation/validation.md` (this report, untracked); backend clean (no porcelain output). Real tree confirmed unmutated by the verifier — sensor ran only in a `git archive` scratch copy, since deleted.
- Frontend branch is 7 commits ahead of `origin/feat/investment-consolidation` (local HEAD `1528782`; origin still at `6c09a10`) — pushing is the owner's call.
- Iter-1 note, retained: frontend porcelain identical before/after sensor work: `M src/components/TransactionListItem/index.tsx`, `M src/interfaces/accounts.ts`, `M src/interfaces/transactions.ts` — foreign to this feature, untouched, not counted.
- Backend porcelain **changed during verification through no verifier action**:
  baseline `M src/controllers/transaction.controller.ts, M src/services/bankingSync.service.ts`
  was committed mid-session by the repo owner as `5c8d9e3` + `b70c004`
  (`origin/feat/investment-consolidation` now points there). Both commits touch
  only the foreign files; feature files (`account.controller.ts`,
  `account.controller.test.ts`) are untouched (`git diff 2c0ecd7..HEAD --name-only`
  confirms). Backend gate was re-run at the final state: still 12/12.
  The feature diff surface now includes those 2 foreign commits on the branch —
  follow-up (rebase/split) is the owner's call.
- No source, test, or spec file was modified and nothing was committed by the verifier.

---

## 8. Traceability INV-01..INV-09

| ID | Story | Evidence section | Status |
| -- | ----- | ---------------- | ------ |
| INV-01 | P1 group key | §2 row INV-01; sensor M1 killed | Verified |
| INV-02 | P1 header sum+count | §2 row INV-02 | Verified |
| INV-03 | P1 expand + navigation state | §2 row INV-03 | Verified |
| INV-04 | P1 totals preserved | §2 row INV-04; mixed-currency edge §3 (`1528782` `:149-150` 700); sensor S2 killed; gate reconciliation | Verified |
| INV-05 | P2 card fields, payload values | §2 row INV-05; unparseable-maturity edge §3 (`9b4cb7f` `:131-157`); sensor M2 + S1 killed | Verified |
| INV-06 | P2 null omission | §2 row INV-06; unparseable-string variant §3 (`9b4cb7f` `:145-146,156`); sensor S1 killed | Verified |
| INV-07 | P2 manual unchanged | §2 row INV-07 | Verified |
| INV-08 | P3 whole-group search | §2 row INV-08; sensor M3 killed (3 fails) | Verified |
| INV-09 | P3 counts consistent | §2 row INV-09 | Verified |

---

## 9. Ranked gaps (none remaining — iteration 2)

Both iteration-1 gaps are closed by the two test-only fix commits (no source changes):

1. ~~No assertion for the unparseable-`expiresAt` edge~~ → **CLOSED** by `9b4cb7f`
   (`investmentGroupListItem.spec.tsx:131-157`). Note: the mixed-group half of the
   new case exercises the heterogeneous-date branch (`every(date === first)`),
   not the `isNaN` guard — the uniform half exercises the guard directly. The
   `Venc`-absent + `NaN`-absent assertions match the spec Edge Case
   ("omit the maturity chip rather than crashing"). Sensor S1 kills it.
2. ~~No mixed-currency group-sum assertion~~ → **CLOSED** by `1528782`
   (`groupInvestments.test.ts:135-151`): 100 USD @5 + 200 BRL = 700 asserted via
   the per-leg `toBase` injection point the screen feeds from `convertCurrency`
   (`InstitutionDetails/index.tsx:234-262,332-335`). Sensor S2 kills it.

No vague-outcome ACs found: P1-AC4 is pinned to `R$ 2.450,08` on a fixed
fixture; P3-AC2 to exact counts/ids; investmentData fields to exact values.

**Overall: Ready.** No follow-up verification needed; remaining item is the
owner's call from §7 (foreign commits on the branch / rebase-split).
