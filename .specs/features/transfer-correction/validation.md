# Transfer Correction Validation

**Date**: 2026-11-16 (re-verify, fix→re-verify iteration 3/3 — FINAL)
**Spec**: `.specs/features/transfer-correction/spec.md`
**Diff range**: worktree vs `HEAD` (uncommitted feature changes; frontend `SmartFinances` + backend `smart-finances-backend`). Backend also carries the pre-existing unrelated `category.controller.ts` modification (excluded from this validation).
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1: Lock cash-flow transfer exclusion for null-link legs | ✅ Done | unchanged since iteration 1 |
| T2: Null-link render safety for the list item | ✅ Done | unchanged |
| T3: Conversion-direction and single-leg payload helpers | ✅ Done | unchanged |
| T4: Counterpart candidate predicate + link-id type field | ✅ Done | unchanged |
| T5: Filterable transaction picker | ✅ Done | unchanged |
| T6: Transfer direction mode with swap control | ✅ Done | unchanged |
| T7: Counterpart chooser and save branching | ✅ Done | unchanged |
| T8: Additive link id on the transaction list DTO | ✅ Done | unchanged |
| T9: Synced-balance guard plus conversion gates | ✅ Done | unchanged |
| T10: Link single-leg to an existing transaction | ✅ Done | unchanged |
| Fix 1a (TRC-13 pin): `buildBulkEditPayload` extraction + 3 tests | ✅ Done | `transactionPayload.ts:451`–`:566` + `transactionPayload.spec.ts:603`–`:681`; bulk handler delegates (`RegisterTransaction/index.tsx:896`–`:925`); iteration-2 `btcQuoteBtc` typo fixed in iteration 3 (see Fix 2) |
| Fix 1b (Edge-4 pin): neither-field backend test | ✅ Done | `transaction.controller.test.ts:1151`–`:1173` |
| Fix 1c (Edge-5 pin): missing-destination backend test | ✅ Done | `transaction.controller.test.ts:1175`–`:1197` |
| Fix 2 (iteration-3 one-token fix): `btcQuoteBtc` → `btcQuoteEur` at call site `:916` | ✅ Done & verified | `grep -rn btcQuoteBtc src/` = zero hits; 12-key literal matches `useQuotes()`/`Quotes`; quick gate 56/56 green |

---

## Spec-Anchored Acceptance Criteria

### P1: Repair a one-sided imported transfer with the right direction

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| TRC-01: open edit for unlinked CREDIT → transfer tab defaults to source mode, label "Selecione a conta de origem", pending `TRANSFER_CREDIT` | `source` mode for `CREDIT` | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:471` - `expect(resolveConversionDirection('CREDIT')).toBe('source')` | ✅ PASS |
| TRC-02: open edit for unlinked DEBIT → transfer tab defaults to destination mode, label "Selecione a conta de destino", pending `TRANSFER_DEBIT` | `destination` mode for `DEBIT` | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:475` - `expect(resolveConversionDirection('DEBIT')).toBe('destination')` | ✅ PASS |
| TRC-03: tap swap → toggle mode and swap pending primary type | `source`↔`TRANSFER_CREDIT`, `destination`↔`TRANSFER_DEBIT`; toggle flips state | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:486` - `expect(resolveConversionPrimaryType('source')).toBe('TRANSFER_CREDIT')`; `SmartFinances/src/__tests__/hooks/useTransferDirection.spec.tsx:37` - `expect(result.current.transferDirection).toBe('destination')` (after toggle from `source`) | ✅ PASS |
| TRC-04: save conversion with counterpart → primary stays in current account with pending type, opposite-typed counterpart created cross-linked | counterpart `TRANSFER_CREDIT` in account 30 linked to primary 1; payload carries pending type + counterpart account | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1075` - `assert.equal(creates[0][1].data.type, "TRANSFER_CREDIT")` + `:1079` - `assert.equal(creates[0][1].data.relatedTransactionId, 1)`; `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:314` - `expect(payload.type).toBe('TRANSFER_DEBIT')` + `:317` - `expect(payload.related_transaction_account_id).toBe(20)` | ✅ PASS |
| TRC-05: synced counterpart account → counterpart row created with NO balance increment | zero `account.update` calls for synced destination 30 | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1120` - `assert.equal(destIncrements.length, 0)` | ✅ PASS |
| TRC-06: manual counterpart account → standard increment applies | destination delta includes `500` | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1085` - `assert.ok(destDelta.includes("500"))` | ✅ PASS |
| TRC-07: primary balance net unchanged across conversion | reverse + apply deltas cancel on primary account | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1125` - `assert.deepEqual(primaryDeltas, ["-99.9", "99.9"])` | ✅ PASS |
| TRC-08: counterpart == current account → reject with validation message | `400` | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1142` - `await assert.rejects(updateTransaction(req, res), (err) => err instanceof AppError && err.statusCode === 400)` (same-account `related_transaction_account_id: 10`) | ✅ PASS |

### P2: Mark RDB movements as transfers without a counterparty

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| TRC-09: save unlinked CREDIT as transfer with no counterpart → unlinked `TRANSFER_CREDIT`, null link | `type === TRANSFER_CREDIT`, no counterpart fields | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:514` - `expect(payload.type).toBe('TRANSFER_CREDIT')` + `:520` - `expect(payload).not.toHaveProperty('related_transaction_account_id')` | ✅ PASS |
| TRC-10: save unlinked DEBIT as transfer with no counterpart → unlinked `TRANSFER_DEBIT`, null link | `type === TRANSFER_DEBIT`, converted `1500 @ 5`, no counterpart fields | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:534` - `expect(payload.type).toBe('TRANSFER_DEBIT')` + `:536` - `expect(payload.amount_in_account_currency).toBe(1500)` + `:539` - `expect(payload).not.toHaveProperty('related_transaction_account_id')` | ✅ PASS |
| TRC-11: unlinked leg shows "Sem conta vinculada", hides link row | slot title `Sem conta vinculada`; `shouldShowTransferLink === false` for null link; crash-free icon render | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:581` - `).toBe('Sem conta vinculada')`; `SmartFinances/src/utils/__tests__/transferLink.test.ts:39` - `expect(shouldShowTransferLink({ ...base, relatedTransactionId: null })).toBe(false)`; `SmartFinances/src/__tests__/components/transactionListItem.spec.tsx:66` - `expect(screen.UNSAFE_queryByProps({ name: 'arrow-up-outline' })).toBeTruthy()` (null-link `TRANSFER_DEBIT` renders without touching link data) | ✅ PASS |
| TRC-12: unlinked legs excluded from income/expense totals like linked legs | `currentCashFlowValue === 0`, no chart bars | `SmartFinances/src/utils/__tests__/processTransactions.test.ts:380` - `expect(currentCashFlowValue).toBe(0)` (unlinked `TRANSFER_DEBIT` + `related_transaction_id: null`); `:396` - `expect(currentCashFlowValue).toBe(0)` + `:397` - `expect(cashFlowChartData).toHaveLength(0)` (unlinked `TRANSFER_CREDIT`) | ✅ PASS |
| TRC-13: bulk edit offers NO single-leg conversion | bulk payload never carries `updateRelated`/counterpart/single-leg fields, even on the transfer tab | `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:639` - `expect(payload).not.toHaveProperty('updateRelated')` + `:640`–`:641` (no `counterpartTransactionId`/`related_transaction_account_id`); `:644` - `TRC-13: never emits single-leg conversion fields even on the transfer tab` with `:663` - `expect(payload.type).toBe('TRANSFER')` + `:664` - `expect(payload).not.toHaveProperty('updateRelated')` | ✅ PASS |

### P3: Link a single-leg transfer to an already-existing transaction

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| TRC-14: link unlinked `TRANSFER_CREDIT` to existing unlinked `DEBIT` → pick flips to `TRANSFER_DEBIT`, both cross-linked | primary `{type TRANSFER_CREDIT, related 8}` + pick `{type TRANSFER_DEBIT, related 5}` | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1254` - `assert.deepEqual(txUpdates[1][1], { where: { id: 5 }, data: { type: "TRANSFER_CREDIT", relatedTransactionId: 8 } })` + `:1258` - pick flips to `TRANSFER_DEBIT` linked to `5` | ✅ PASS |
| TRC-15: link unlinked `TRANSFER_DEBIT` to existing unlinked `CREDIT` → pick flips to `TRANSFER_CREDIT`, both cross-linked | mirror of TRC-14 | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1300` - `assert.deepEqual(txUpdates[1][1], { where: { id: 1 }, data: { type: "TRANSFER_DEBIT", relatedTransactionId: 8 } })` + `:1304` - pick flips to `TRANSFER_CREDIT` linked to `1` | ✅ PASS |
| TRC-16: pick account from single-leg → opposite-typed counterpart created under synced-balance rule | `TRANSFER_CREDIT` created in account 30; manual destination increments `500` | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1221` - `assert.equal(creates[0][1].data.type, "TRANSFER_CREDIT")` + `:1226` - `assert.deepEqual(destDelta, ["500"])` | ✅ PASS |
| TRC-17: link (or single-leg counterpart creation) moves no balances on either account for the link itself | link path: primary nets zero, counterpart account untouched | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1266` - `assert.deepEqual(primaryDeltas, ["-99.9", "99.9"])` + `:1271` - `assert.equal(pickUpdates.length, 0)` (TRC-14 case; TRC-15 mirrors at `:1311`/`:1315`) | ✅ PASS |
| TRC-18: linked / same-account / wrong-type pick → reject with error, change nothing | `409` linked, `400` same-account, `422` wrong-type | `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1358` - `await assert.rejects(updateTransaction(req, res), (err) => err instanceof AppError && err.statusCode === status)` across all three bad cases | ✅ PASS |
| TRC-19: picker shows only unlinked opposite-type rows from other accounts | `TRANSFER_CREDIT` base keeps only unlinked `DEBIT` from other accounts; list DTO carries `related_transaction_id` | `SmartFinances/src/utils/__tests__/transferLink.test.ts:71` - `expect(selectCounterpartCandidates({ existingSide: 'TRANSFER_CREDIT', ... })).toEqual([candidate()])`; `SmartFinances/src/__tests__/screens/transactionSelect.spec.tsx:160` - `expect(screen.queryByTestId('transaction-row-1')).toBeNull()` + `:161` - custom filter keeps only `CREDIT`; `smart-finances-backend/src/__tests__/transaction.controller.test.ts:689` - `assert.equal(body[0].related_transaction_id, 9)` + `:690` - null stays null | ✅ PASS |

**Status**: ✅ All 19 ACs traced to spec-matching assertions; no gaps.

---

## Discrimination Sensor

Scratch-only fault injection (backups in `$TMPDIR/trc-sensor2`; real trees briefly overlaid per run then restored; `git status --porcelain` in both repos matches the pre-sensor baseline afterwards). No `git stash` used. All three mutations are NEW (no repeat of iteration-1 targets) and aim at the new/changed code.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `SmartFinances/src/utils/transactionPayload.ts:560` (`image_url` line of `buildBulkEditPayload`) | Added `updateRelated: true` to the bulk-builder return (bulk path must never emit linkage fields) | ✅ Killed — `transactionPayload.spec.ts`: exactly the 2 TRC-13 pin tests fail (`preserves the plain bulk payload shape`, `never emits single-leg conversion fields`), 51 pass |
| 2 | `smart-finances-backend/src/controllers/transaction.controller.ts:897` | Weakened Edge-5 guard `Destination account not found` `404` → `400` | ✅ Killed — `Edge-5` test fails (asserts `statusCode === 404`); file run 33 pass / 5 fail (4 pre-existing HIDE-06 + Edge-5) |
| 3 | `smart-finances-backend/src/controllers/transaction.controller.ts:687` | Flipped single-leg-base gate `relatedTransactionId === null` → `!== null` (TRC-16/TRC-14/TRC-15 share this gate) | ✅ Killed — TRC-16 + TRC-14 + TRC-15 fail (single-leg bases rejected with 422); Edge-4 (plain base) still passes, proving discrimination |

**Sensor depth**: lightweight (3 targeted behavior-level mutations on the new/changed code: bulk builder, Edge-5 guard, single-leg-base gate)
**Result**: 3/3 killed - PASS ✅

### Iteration-3 token-fix proof (scratch-only, no worktree mutation)

The iteration-3 change is a single identifier token (`btcQuoteBtc` → `btcQuoteEur`) restoring the pre-fix key set — no behavior to mutate. Verified instead by identifier-resolution proof plus re-green gates:

| Check | Evidence | Result |
| ----- | -------- | ------ |
| `btcQuoteBtc` eradicated | `grep -rn "btcQuoteBtc" SmartFinances/src/` → zero hits (exit 1) | ✅ PASS |
| Call-site literal has exactly the 12 `Quotes` keys | `RegisterTransaction/index.tsx:911`–`:924` lists brl×3 / btc×3 / eur×3 / usd×3, each present in the `useQuotes()` destructure (`:483`–`:496`), the assembled `quotes` (`:500`–`:513`), the `Quotes` type (`transactionPayload.ts:21`–`:34`), and the `quotesStorage.ts` store | ✅ PASS |
| Typo class is fatal (old token) vs resolving (new token) | scratch `node` script: 12-key fixed literal resolves (`keys: 12`); old-token literal throws `ReferenceError` → mutant killed | ✅ Killed |
| Targeted gates re-green | `yarn jest transactionPayload.spec.ts useTransferDirection.spec.tsx` → 56/56 pass | ✅ PASS |
| Nothing else changed | `git status --porcelain` identical to iteration-2 baseline in both repos (only the one-token diff) | ✅ PASS |

---

## Interactive UAT Results (if performed)

Not performed. The feature is user-facing (direction swap toggle, create-vs-link chooser, "Sem conta vinculada" slot state), but no device or simulator is available in this sandbox (no interactive session, no iOS/Android runtime). Marking UAT as not-performed with reason — NOT a failure.

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Swap toggle + chooser + bulk-edit flow on a real device | ⏭️ Skip | No device/simulator in sandbox; automated unit coverage stands in |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ (extraction moves code, doesn't duplicate it; removed `convertCurrency` import is now unused anywhere in the screen — verified by grep) |
| Surgical changes | ✅ (bulk hunk is a verbatim move: same field accesses, same `date \|\| new Date(...)` default now passed as `date:` arg, same `resolvedType`/tags/recurrence logic) |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check (asserted values match spec) | ✅ (19/19; TRC-13 pins assert absence of exactly the right fields) |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed | ✅ (none found in either repo — strong defaults applied) |
| **No new lint errors from this iteration** | ✅ (`transactionPayload.ts` + spec lint-clean; the 11 eslint errors on `RegisterTransaction/index.tsx` — `:535` nested ternary, `:1008`–`:1012`/`:1282`–`:1286` indent — are all outside the iteration-2 hunks, i.e. pre-existing feature-branch style drift; repo-wide lint is baseline-red) |
| **No runtime regression** | ✅ (Fix 2 verified: zero `btcQuoteBtc` hits; 12-key literal matches hook/type/store; scratch proof + 56/56 quick gate) |

---

## Edge Cases

- [x] Convert already-linked plain row → blocked: `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:637` - `expect(canSelectTransferTab({ isEditing: true, storedType: 'DEBIT', relatedTransactionId: 9 })).toBe(false)` + backend `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1396` - already-linked primary rejected with `409`. Handled correctly.
- [x] Move primary account during conversion → rejected: `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1383` - moving-accounts case rejected with `400`. Handled correctly.
- [x] Single-leg re-edit keeps unlinked unless link/account-pick/type-flip: `SmartFinances/src/__tests__/utils/transactionPayload.spec.ts:520` - single-leg payload carries no `related_transaction_account_id`/`counterpartTransactionId`; screen branches on `relatedTransactionID === null` (`RegisterTransaction/index.tsx:1104`-area). Handled correctly.
- [x] Neither counterpart id nor account → single-leg, no counterpart row: `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1165` - `assert.equal(txUpdates.length, 1)` + `:1166` - `assert.equal(txUpdates[0][1].data.type, "TRANSFER_DEBIT")` + `:1169` - `assert.equal(creates.length, 0)`. Handled correctly (iteration-1 gap now closed).
- [x] Counterpart account no longer exists → 404, change nothing: `smart-finances-backend/src/__tests__/transaction.controller.test.ts:1187` - `await assert.rejects(..., err.statusCode === 404)` + `:1193` - `assert.equal(creates.length, 0)` (atomic block rolls back). Handled correctly (iteration-1 gap now closed).

---

## Gate Check

- **Frontend gate command**: `yarn jest --watchman=false` (from `SmartFinances/`)
- **Result**: Test Suites 1 failed (pre-existing env), 68 passed, 69 total; Tests 575 passed (+3 new TRC-13 tests vs 572), 0 failed, 0 skipped.
- **Backend gate command**: `yarn test:unit` = `node --import tsx --test` (from `smart-finances-backend/`)
- **Result**: tests 506 (+2 Edge tests vs 504), pass 502, fail 4, cancelled 0, skipped 0, suites 22. All 4 failures are the known pre-existing HIDE-06 cases (`:1478`–`:1479`, `:1498`–`:1499`, `:1539`–`:1540`, `:1556`–`:1557` — HEAD controller exposes no `account.hide`; verified via `git show HEAD` returning 0 matches, unrelated to this feature).
- **Backend build gate**: `yarn build` (`tsc`) — clean, exit 0.
- **ESLint (touched frontend files)**: 11 errors, all in `RegisterTransaction/index.tsx` outside the iteration-2 hunks (pre-existing); `transactionPayload.ts` and the spec are clean. Notably, eslint does NOT flag Gap 1 (`no-undef` is off for TS) — the gates are blind to it; only review catches it.
- **Test count delta this iteration**: +3 frontend, +2 backend, no deletions.
- **Skipped tests**: none.
- **Failures**: frontend `profile.spec.tsx` suite fails to load (`react-native-device-info` `NativeEventEmitter` env issue, documented pre-existing); backend 4× HIDE-06 (pre-existing, unrelated).

---

## Fix Plans (if issues found)

### Fix 2: `btcQuoteBtc` → `btcQuoteEur` in the bulk-edit call site — APPLIED & VERIFIED ✅

- **Root cause**: (as before) the moved quotes literal at `SmartFinances/src/screens/RegisterTransaction/index.tsx:911`–`:924` mistyped `btcQuoteEur` as `btcQuoteBtc` (`:916`).
- **Resolution this iteration**: single-token fix to `btcQuoteEur`. Verified by: `grep -rn "btcQuoteBtc" SmartFinances/src/` → zero hits; 12-key literal cross-checked against `useQuotes()` destructure (`RegisterTransaction/index.tsx:483`–`:496`), assembled `quotes` (`:500`–`:513`), `Quotes` type (`transactionPayload.ts:21`–`:34`), `quotesStorage.ts` store; scratch node proof (fixed literal resolves 12 keys, old token throws `ReferenceError`); quick gate 56/56 green; both worktree porcelains unchanged vs iteration-2 baseline.
- **Priority**: Blocker → resolved. No further fix tasks.
- **Original diagnosis (iteration 2, kept for audit)**: the typo was a use-without-definition (single `src/` occurrence) throwing `ReferenceError` on every bulk save → generic failure alert, no patch sent; the move was otherwise verbatim, so the token was the only semantic change.

---

## Requirement Traceability Update

Traceability application is the orchestrator's (verifier is read-only except this report). Needed updates in `spec.md` Requirement Traceability table + coverage line:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| TRC-01 | Implementing | ✅ Verified |
| TRC-02 | Implementing | ✅ Verified |
| TRC-03 | Implementing | ✅ Verified |
| TRC-04 | Implementing | ✅ Verified |
| TRC-05 | Implementing | ✅ Verified |
| TRC-06 | Implementing | ✅ Verified |
| TRC-07 | Implementing | ✅ Verified |
| TRC-08 | Implementing | ✅ Verified |
| TRC-09 | Implementing | ✅ Verified |
| TRC-10 | Implementing | ✅ Verified |
| TRC-11 | Implementing | ✅ Verified |
| TRC-12 | Implementing | ✅ Verified |
| TRC-13 | Implementing | ✅ Verified (tests added this iteration; runtime regression tracked as Fix 2, not a coverage gap) |
| TRC-14 | Implementing | ✅ Verified |
| TRC-15 | Implementing | ✅ Verified |
| TRC-16 | Implementing | ✅ Verified |
| TRC-17 | Implementing | ✅ Verified |
| TRC-18 | Implementing | ✅ Verified |
| TRC-19 | Implementing | ✅ Verified |

Coverage line: `**Coverage:** 19 total, 19 mapped to tasks (T1-T10), 0 unmapped` (unchanged).

---

## Summary

**Overall**: ✅ Ready — 19/19 ACs verified, 5/5 edge cases handled, sensor 6/6 across iterations (3+3), gates green modulo pre-existing red; Fix 2 verified, no open gaps

**Spec-anchored check**: 19/19 ACs matched spec outcome | 0 gaps
**Sensor**: iteration 2: 3/3 killed; iteration 3: token-fix proof (resolve-vs-ReferenceError) + 56/56 gate
**Gate**: frontend 575 passed (1 pre-existing env suite failure); backend 502 passed / 4 pre-existing HIDE-06 failures; backend `tsc` clean (iteration 2); iteration-3 quick gate 56/56 green

**What works**: (unchanged from iteration 2, plus) bulk-edit path constructs its payload against the correct 12-key quotes — the one-token regression is gone.

**Issues found**: none open. Fix 2 applied and verified (see above).

**Next steps**: Orchestrator applies the spec.md traceability update below, then ships. Interactive UAT (swap/chooser/bulk flows on device) remains pending for a hardware session — recorded as skipped (sandbox, no device), not a failure.
