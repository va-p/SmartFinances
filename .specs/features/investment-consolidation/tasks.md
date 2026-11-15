# Investment Consolidation Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/investment-consolidation/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied (no AGENTS.md/CONTRIBUTING.md; jest config via package.json `test: jest`, backend `test:unit: node --import tsx --test`).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Backend controller (account read) | unit | All branches; 1:1 to spec ACs; every listed edge case | `smart-finances-backend/src/__tests__/account.controller.test.ts` | `yarn test:unit` (backend) |
| Frontend util (grouping/profit) | unit | All branches; 1:1 to spec ACs; all listed edge cases | `SmartFinances/src/utils/__tests__/groupInvestments.test.ts` | `yarn jest src/utils/__tests__/groupInvestments.test.ts` |
| Frontend component (group row) | unit | Happy + edge + null-field paths | `SmartFinances/src/__tests__/components/investmentGroupListItem.spec.tsx` | `yarn jest src/__tests__/components/investmentGroupListItem.spec.tsx` |
| Frontend screen (InstitutionDetails/Account) | unit | Happy + group/expand/search paths per spec | `SmartFinances/src/__tests__/screens/*.spec.tsx` | `yarn jest src/__tests__/screens/` |
| Store (zustand selected account) | unit | Group payload set/clear branches | `SmartFinances/src/__tests__/stores/*.spec.ts` | `yarn jest src/__tests__/stores/` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `yarn jest <task test file>` (frontend) / `node --import tsx --test <file>` (backend) |
| Full | After tasks with e2e/integration tests | N/A - no e2e in scope |
| Build | After phase completion or config/entity-only tasks | `yarn tsc --noEmit && yarn lint <touched>` + all task tests |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Contract

Backend payload plus the grouping contract.

```
T1 -> T2
```

### Phase 2: Group UI

Group row, list wiring, navigation state.

```
T3 -> T4 -> T5
```

### Phase 3: Group destination and search

Account group mode plus group-aware search and final gate.

```
T6 -> T7
```

---

## Task Breakdown

### Phase 1: Contract

#### T1: Expose investmentData on accounts read ✅ Done

**What**: Whitelist-map `providerMetadata` to `investmentData` in accounts read responses.
**Where**: `smart-finances-backend/src/controllers/account.controller.ts`
**Depends on**: None
**Reuses**: `upsertInvestmentAccount` metadata shape in `bankingSync.service.ts`
**Requirement**: INV-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `getAccounts` and `getAccountById` return `investmentData` with the 12 whitelisted fields iff `type == INVESTMENTS`, else omit the key
- [ ] Manual/non-investment accounts unchanged; null metadata yields `investmentData: null`, never a crash
- [ ] Gate check passes (backend unit file)
- [ ] Test count: 6+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): expose investmentData on accounts read`

---

#### T2: Add grouping and profit util ✅ Done

**What**: Pure `groupInvestments` plus profit helpers implementing the locked group key and Layout 2 data.
**Where**: `SmartFinances/src/utils/groupInvestments.ts`
**Depends on**: T1
**Reuses**: `convertCurrency` path, `decimal.js` sums
**Requirement**: INV-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `buildInvestmentGroupKey` implements `investmentType|investmentSubtype|rateType|rate` normalized; missing metadata returns `manual` bucket
- [ ] `groupInvestments` returns collapsed groups with summed base-currency balance + count; singletons stay ungrouped affordance-free
- [ ] `grossProfitOf` / `netProfitOf` implement Q2 formulas with null-safe fallbacks
- [ ] Gate check passes: `yarn jest src/utils/__tests__/groupInvestments.test.ts`
- [ ] Test count: 12+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): add grouping and profit util`

---

### Phase 2: Group UI

#### T3: Build InvestmentGroupListItem in Layout 2 ✅ Done

**What**: Collapsible group row in the approved Financial-highlight layout.
**Where**: `SmartFinances/src/components/InvestmentGroupListItem/index.tsx`
**Depends on**: T2
**Reuses**: `AccountListItem` for preview rows, theme tokens, `FadeInUp`
**Requirement**: INV-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Collapsed header shows label, summed balance, count, rate badge, profit delta, maturity chip per Layout 2
- [ ] Null rate/profit/maturity omitted, never "null"; single-member groups render without expand affordance
- [ ] Gate check passes: `yarn jest src/__tests__/components/investmentGroupListItem.spec.tsx`
- [ ] Test count: 8+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): add collapsible group row in Layout 2`

---

#### T4: Extend selected-account store with group payload ✅ Done

**What**: Optional group fields on the navigation store.
**Where**: `SmartFinances/src/stores/currentAccountSelectedStorage.ts`
**Depends on**: T3
**Reuses**: Existing zustand store shape
**Requirement**: INV-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Store gains `accountGroupKey` and `accountGroupMemberIds` with set/clear actions; defaults null so single mode is unaffected
- [ ] Gate check passes: `yarn jest src/__tests__/stores/currentAccountSelected.spec.ts`
- [ ] Test count: 4+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): extend selected-account store with group payload`

---

#### T5: Wire grouping into InstitutionDetails ✅ Done

**What**: Grouped INVESTMENTS section with expand state and group navigation payload.
**Where**: `SmartFinances/src/screens/InstitutionDetails/index.tsx`
**Depends on**: T4
**Reuses**: `getSectionKey`, `SECTION_ORDER`, existing `handleOpenAccount` navigate pattern
**Requirement**: INV-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] INVESTMENTS section renders groups from T2 via `useMemo`; other sections byte-identical
- [ ] Chevron toggles 3-row preview; tap sets group payload and navigates to `/accounts/[accountId]` with `group:<hash>`
- [ ] Institution total unchanged vs pre-grouping sum for the same fixture
- [ ] Gate check passes: `yarn jest src/__tests__/screens/institutionDetails.spec.tsx`
- [ ] Test count: 6+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): wire grouping into institution details`

---

### Phase 3: Group destination and search

#### T6: Add Account screen group mode ✅ Done

**What**: Group-member list reusing the Account chrome; single mode untouched.
**Where**: `SmartFinances/src/screens/Account/index.tsx`
**Depends on**: T5
**Reuses**: `AccountListItem`, `useAccountsQuery` cache filter by member ids
**Requirement**: INV-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `accountId.startsWith('group:')` renders group label + summed balance + member rows; edit/delete/FAB hidden in group mode
- [ ] Member tap navigates to real single id with full transaction view
- [ ] Gate check passes: `yarn jest src/__tests__/screens/accountGroupMode.spec.tsx`
- [ ] Test count: 6+ assertions pass, no deletions

**Tests**: unit
**Gate**: quick

**Commit**: `feat(investments): add account screen group mode`

---

#### T7: Make search group-aware and reconcile totals

**What**: Whole-group search match plus totals parity guard.
**Where**: `SmartFinances/src/utils/filterSectionsByQuery.ts`
**Depends on**: T6
**Reuses**: Existing matcher for non-investment sections
**Requirement**: INV-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Query matching member name/issuer/rate label surfaces the entire group auto-expanded; other sections keep exact behavior
- [ ] Group sums reconcile to institution total to the cent on the 38-row fixture
- [ ] Gate check passes: build gate (`yarn tsc --noEmit`, lint touched, all task tests)
- [ ] Test count: 6+ assertions pass, no deletions

**Tests**: unit
**Gate**: build

**Commit**: `feat(investments): make search group-aware and reconcile totals`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order.

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 -> T2
Phase 2:  T3 -> T4 -> T5
Phase 3:  T6 -> T7
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

---

## Task Granularity Check

Before approving tasks, verify they are granular enough:

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: expose investmentData | 1 controller file | ✅ Granular |
| T2: grouping util | 1 util file | ✅ Granular |
| T3: group row component | 1 component file | ✅ Granular |
| T4: store extension | 1 store file | ✅ Granular |
| T5: InstitutionDetails wiring | 1 screen file | ✅ Granular |
| T6: Account group mode | 1 screen file | ✅ Granular |
| T7: group-aware search | 1 util file | ✅ Granular |

**Granularity check**:

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

Before approving tasks, verify the execution diagram is consistent with the task definitions.

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | Phase 1 start | ✅ Match |
| T2 | T1 | T1 -> T2 | ✅ Match |
| T3 | T2 (cross-phase) | Phase 2 start (cross-phase excluded) | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T4 -> T5 | ✅ Match |
| T6 | T5 (cross-phase) | Phase 3 start (cross-phase excluded) | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |

Cross-phase edges (T2 -> T3, T5 -> T6) are validated by dependency order and need no diagram arrow per phase-scoped diagrams.

---

## Test Co-location Validation

Before approving tasks, verify EVERY task's `Tests` field is consistent with the **Test Coverage Matrix** generated above.

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Backend controller | unit | unit | ✅ OK |
| T2 | Frontend util | unit | unit | ✅ OK |
| T3 | Frontend component | unit | unit | ✅ OK |
| T4 | Store | unit | unit | ✅ OK |
| T5 | Frontend screen | unit | unit | ✅ OK |
| T6 | Frontend screen | unit | unit | ✅ OK |
| T7 | Frontend util | unit | unit | ✅ OK |

---

## Tips

- **Phases are ordered** - Each phase completes before the next; tasks run in order within a phase
- **Reuses = Token saver** - Always reference existing code
- **Tools per task** - MCPs and Skills prevent wrong approaches
- **Dependencies are gates** - Clear what blocks what
- **Done when = Testable** - If you can't verify it, rewrite it
- **Requirement ID = Traceable** - Every task traces back to a spec requirement
- **One commit per task** - Plan the commit message format in advance
