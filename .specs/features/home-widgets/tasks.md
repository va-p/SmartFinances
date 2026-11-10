# Home Widgets Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/home-widgets/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` jest config (`jest-expo` preset, `--watchman=false` required per STATE.md - Watchman is broken), existing suites under `src/utils/__tests__/` + `src/__tests__/stores|screens|utils`, `yarn lint` (pre-existing repo-wide errors - scope eslint to touched files).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Pure domain utils (`src/widgets/build*.ts`) | unit | All branches; 1:1 to spec ACs; every listed edge case (ordering, truncation, masking, empty states) | `src/widgets/__tests__/*.test.ts` | `CI=true npx jest --watchman=false src/widgets/__tests__` |
| Hook (`useWidgetSnapshotSync`) | unit | Sync triggers, debounce, clear-on-signout, hidden flag threading | `src/widgets/__tests__/*.test.ts` | `CI=true npx jest --watchman=false src/widgets/__tests__` |
| Native bridge / extension / providers / config plugin (`modules/widget-bridge/`, `targets/`, `plugins/withHomeWidgets/`) | none | - (build gate only; no native widget test harness in repo) | - | build gate only |
| App wiring (`src/app/_layout.tsx` modify) | none | - (heavy-tree precedent: no render harness; verified by full-suite regression + static `file:line` evidence) | - | full gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test tasks (T2, T3, T4, T10) | `CI=true npx jest --watchman=false src/widgets/__tests__` |
| Full | After wiring/QA tasks (T7, T12) | `CI=true npx jest --watchman=false` (known pre-existing env failure: `profile.spec.tsx`; must show zero *new* failures) |
| Build | After native/config-only tasks (T1, T5, T6, T8, T9, T11) | `npx tsc --noEmit` + `yarn eslint <touched files>` + Quick gate |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Snapshot foundation

Pure, testable snapshot logic. No native code.

```
T1 -> T2 -> T3 -> T4
```

### Phase 2: Bridge + config

Shared-storage pipe, prebuild plugin, root-layout wiring.

```
T5 -> T6 -> T7
```

### Phase 3: Native UI + QA

iOS views, Android providers, tap wiring, device QA + docs.

```
T8 -> T9 -> T10 -> T11 -> T12
```

### Phase 4: Layout polish + Overview merge (user QA round 2026-11-10)

iOS + Android in each task; device QA by user after.

```
T13 -> T14 -> T15
```

Cross-phase dependencies (backward only):

```
T12 -> T13
T13 -> T14
T14 -> T15
```

---

## Task Breakdown

### T1: WidgetSnapshot types — ✅ Complete

**What**: Define the `WidgetSnapshot` / `SnapshotInput` interfaces (design §Data Models).
**Where**: `SmartFinances/src/widgets/widgetSnapshotTypes.ts`
**Depends on**: None
**Reuses**: `src/interfaces/budget`, `src/interfaces/accounts`, `src/interfaces/transactions` shapes
**Requirement**: WDG-01..WDG-41 (schema backbone)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Interfaces exported exactly per design schema (version, budgets, cashFlow, overview, netWorth, institutions, hidden, signedIn)
- [ ] `npx tsc --noEmit` passes

**Tests**: none (matrix: entity/config - build gate only)
**Gate**: build

---

### T2: Budgets snapshot slice — ✅ Complete

**What**: Pure builder for the budgets array: current-period % via `formatBudgetInfo`, sort desc by percentage, `over` flag + `Estourado!`/`restantes` strings via `formatCurrency`.
**Where**: `SmartFinances/src/widgets/buildBudgetsSnapshot.ts`
**Depends on**: T1
**Reuses**: `src/utils/budgetCalculations.ts` (`formatBudgetInfo`, AD-001 calendar months)
**Requirement**: WDG-01, WDG-02, WDG-03, WDG-05, WDG-06, WDG-07, WDG-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Budgets sorted by spend % desc, Medium takes 3 / Large takes 6 (native slices; builder returns full ordered list)
- [ ] Over-limit rows carry `Estourado! -R$ Y`, in-limit rows `R$ X restantes`
- [ ] Empty input yields empty-list state payload
- [ ] Gate check passes: `CI=true npx jest --watchman=false src/widgets/__tests__`

**Tests**: unit
**Gate**: quick

---

### T3: Full snapshot composer — ✅ Complete

**What**: Compose cash-flow month totals + bars, overview/critical budget, net worth + sparkline + donut, top-2 institutions, hidden/signedIn flags, pre-formatted strings.
**Where**: `SmartFinances/src/widgets/buildWidgetSnapshot.ts`
**Depends on**: T2
**Reuses**: `calculateTotalAssets`, `buildNetWorthEvolution`, `processTransactions` month filter, `formatCurrency`, T2 budgets slice
**Requirement**: WDG-11, WDG-12, WDG-13, WDG-14, WDG-16, WDG-17, WDG-18, WDG-19, WDG-22, WDG-23, WDG-25, WDG-29, WDG-30, WDG-31, WDG-32, WDG-33, WDG-34, WDG-36, WDG-39, WDG-40, WDG-41

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Cash-flow uses current device-local month, realized transactions only (`created_at <= now`)
- [ ] Critical budget = highest % among non-archived; alert hidden when none > 80%
- [ ] Institutions top-2 by balance desc; hidden masks all balances; short-list yields no fillers
- [ ] Gate check passes: `CI=true npx jest --watchman=false src/widgets/__tests__`

**Tests**: unit
**Gate**: quick

---

### T4: Snapshot sync hook — ✅ Complete

**What**: Hook that rewrites the snapshot on query/store change (debounced ~1s) and foreground, clears on sign-out.
**Where**: `SmartFinances/src/widgets/useWidgetSnapshotSync.ts`
**Depends on**: T3
**Reuses**: `useFormattedBudgets` data shape, `useUserConfigs` (hideAmount/baseCurrency), `useAuth`
**Requirement**: WDG-35, WDG-37, WDG-38

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Snapshot rewritten within 5s of data/hideAmount change; `clearSnapshot()` called on sign-out
- [ ] No network call in the hook (reads caches only)
- [ ] Gate check passes: `CI=true npx jest --watchman=false src/widgets/__tests__`

**Tests**: unit
**Gate**: quick

---

### T5: WidgetBridge native module — ✅ Complete

**What**: Local Expo module exposing `setSnapshot/clearSnapshot/reloadTimelines` over App Group UserDefaults (iOS) / SharedPreferences (Android).
**Where**: `SmartFinances/modules/widget-bridge/`
**Depends on**: T1
**Reuses**: Nothing existing; new thin bridge (no business logic per design)
**Requirement**: WDG-35, WDG-38, WDG-39

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] JS interface + iOS Swift + Android Kotlin stubs implemented against the T1 schema
- [ ] `reloadTimelines` nudges WidgetKit timelines + `AppWidgetManager` updates
- [ ] `npx tsc --noEmit` passes (JS side)

**Tests**: none (matrix: native bridge - build gate only)
**Gate**: build

---

### T6: Config plugin withHomeWidgets — ✅ Complete

**What**: Prebuild plugin injecting the iOS Widget extension target + App Group entitlement and the Android providers/receivers so committed `android/`+`ios/` stay reproducible.
**Where**: `SmartFinances/plugins/withHomeWidgets/`
**Depends on**: T5
**Reuses**: Existing `app.config.ts` plugin-array pattern
**Requirement**: WDG-10, WDG-13, WDG-14 (platform targets that carry the sizes/orientations)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `npx expo prebuild --no-install` reproduces extension target, group entitlement `group.com.vap.smartfinances.widgets`, and all 9 Android provider entries with no manual Xcode/Gradle edits
- [ ] No drift: second prebuild run is a no-op diff

**Tests**: none (matrix: config - build gate only)
**Gate**: build

---

### T7: Root-layout snapshot wiring — ✅ Complete

**What**: Mount the sync hook at app root so foreground + data changes flow to the bridge.
**Where**: `SmartFinances/src/app/_layout.tsx`
**Depends on**: T4, T6
**Reuses**: Existing `RootLayout` provider tree; T4 hook; T5 bridge
**Requirement**: WDG-35, WDG-36, WDG-37

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Hook mounted once at root; no extra renders or query refetch loops (verify with React DevTools/profiler or memo audit)
- [ ] Full suite shows zero new failures vs baseline (`profile.spec.tsx` pre-existing env failure excluded)
- [ ] Static evidence recorded (`file:line` of mount + sign-out clear path)

**Tests**: none (matrix: app wiring - full gate + static evidence only)
**Gate**: full

---

### T8: iOS WidgetKit views — ✅ Complete (`swiftc -typecheck` clean; simulator render deferred to T12)

**What**: SwiftUI views for all 5 families + sizes (incl. Overview Small AppIntent Variant A/B) reading the shared snapshot read-only.
**Where**: `SmartFinances/targets/widgets/`
**Depends on**: T5
**Reuses**: T1 schema (mirrored `Decodable` struct); pre-formatted strings verbatim
**Requirement**: WDG-01..WDG-10, WDG-11, WDG-12, WDG-13, WDG-15, WDG-17, WDG-18, WDG-19, WDG-20, WDG-21, WDG-23, WDG-24, WDG-25, WDG-26, WDG-27, WDG-28, WDG-29, WDG-30, WDG-31, WDG-33, WDG-40, WDG-41

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Small/Medium/Large render per mocks (3-row Medium / 6-row Large budgets; vertical diverging cash-flow bars; Variant A card vs B plain bar via intent)
- [ ] Placeholder views for signed-out / corrupt / empty states
- [ ] Debug-build widget renders on simulator with fixture snapshot

**Tests**: none (matrix: native UI - build gate + device QA in T12)
**Gate**: build

---

### T9: Android widget providers — ✅ Complete (emulator render + release verification deferred to T12: local Gradle blocked by pre-existing expo-constants/babel env failure)

**What**: 9 Glance/RemoteViews providers with pinned `targetCell` sizes, pt-BR descriptions, and Android-Medium horizontal cash-flow bars.
**Where**: `SmartFinances/targets/widgets-android/`
**Depends on**: T8
**Reuses**: T1 schema + T8-proven snapshot contract; pre-formatted strings verbatim
**Requirement**: WDG-10, WDG-11, WDG-12, WDG-14, WDG-15, WDG-17, WDG-18, WDG-19, WDG-20, WDG-21, WDG-23, WDG-24, WDG-25, WDG-26, WDG-27, WDG-28, WDG-29, WDG-30, WDG-31, WDG-32, WDG-33, WDG-40, WDG-41

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] All 9 size entries installed (budgets 4x2/4x4, cash-flow 2x2/4x2, overview 2x2, control 4x2/4x4, patrimony 2x2/4x2)
- [ ] Android Medium cash-flow uses horizontal bars; release build keeps providers (ProGuard keep-rules)
- [ ] Debug-build widgets render on emulator with fixture snapshot

**Tests**: none (matrix: native UI - build gate + device QA in T12)
**Gate**: build

---

### T10: Deep-link builder — ✅ Complete

**What**: Pure URL builder mapping every widget tap target to `com.vap.smartfinances://` routes.
**Where**: `SmartFinances/src/widgets/buildWidgetDeepLink.ts`
**Depends on**: T9
**Reuses**: `com.vap.smartfinances` scheme from `AndroidManifest.xml` / `app.json`
**Requirement**: WDG-15, WDG-27, WDG-28 (plus budget-row → detail, header → home)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Routes covered: budget detail (`budgets/{id}`), add transaction, overview/reports, budgets home, accounts home
- [ ] Unknown targets fall back to app home (never a dead tap)
- [ ] Gate check passes: `CI=true npx jest --watchman=false src/widgets/__tests__`

**Tests**: unit
**Gate**: quick

---

### T11: Native tap wiring — ✅ Complete (cold-tap verification deferred to T12 device QA)

**What**: Attach T10 URLs as `widgetURL` (iOS) / PendingIntents (Android) on every tappable widget region.
**Where**: `SmartFinances/src/app/(app)/transactions/new.tsx` (+ `src/app/(app)/_layout.tsx` registration; native attach points already in `targets/widgets/WidgetTheme.swift` + `targets/widgets-android/.../BaseWidgetProvider.kt` from T8/T9)
**Depends on**: T10
**Reuses**: T8 views, T9 providers, T10 builder output
**Requirement**: WDG-15, WDG-27, WDG-28

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Every mock affordance is tappable: budget rows, +, Adicionar Despesa, Relatórios, headers
- [ ] Taps open the matching in-app screen from a cold widget tap on both platforms

**Tests**: none (matrix: native UI - build gate + device QA in T12)
**Gate**: build

---

### T12: Device QA + docs — ✅ Docs complete (device QA handed to user UAT; ROADMAP stays unchecked until QA passes)

**What**: Full device matrix QA, ROADMAP check-off, release notes for the native binary bump.
**Where**: `SmartFinances/.specs/project/ROADMAP.md`
**Depends on**: T11
**Reuses**: Spec Success Criteria as the QA checklist
**Requirement**: WDG-01..WDG-41 (acceptance sweep)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Release notes + device QA matrix recorded below (docs shippable)
- [ ] Real iOS + Android devices: all sizes render spec'd values (budgets incl. `Estourado!`, R$ 6.450,00 / -R$ 4.890,12, R$ 27.540,00, Moradia 102,48%, Nubank/Itaú rows); Variant A/B both selectable and persistent; taps verified; offline / signed-out / corrupt states verified
- [ ] ROADMAP `Widgets (iOS / Android home screen)` checked off (only after the matrix above passes on device)
- [x] Full suite shows zero new failures (447 pass; only pre-existing `profile.spec.tsx` env failure)

**Device QA matrix (manual — run on real iOS 17+ and Android devices):**

| # | Check | Spec | Pass |
| - | ----- | ---- | ---- |
| 1 | Budgets Medium shows 3 rows, Large shows 6, ordered by % desc | WDG-05/06 | ☐ |
| 2 | Over-limit row reads `Estourado! -R$ …` on coral-red; in-limit `R$ … restantes` on green | WDG-02/03 | ☐ |
| 3 | Cash-flow shows Novembro, R$ 6.450,00 / -R$ 4.890,12; iOS Medium vertical bars, Android Medium horizontal bars | WDG-11/13/14 | ☐ |
| 4 | Overview Small offers Variant A (card) and B (plain bar); choice persists | WDG-18/19/20 | ☐ |
| 5 | Control Medium (card + Relatórios) and Large (sparkline + donut + labeled actions) | WDG-23/24/25/26 | ☐ |
| 6 | Patrimony Small 2 rows, Medium adds sparkline; Nubank 5 contas / Itaú 3 contas | WDG-30/31/32 | ☐ |
| 7 | Every + opens add-transaction; Relatórios opens Overview; rows open details | WDG-15/27/28 | ☐ |
| 8 | Airplane mode keeps last snapshot; sign-out shows locked placeholder | WDG-36/37 | ☐ |
| 9 | Eye toggle masks to `R$ ••••` in all widgets | WDG-21/33 | ☐ |

**Release notes (store binary required — Revopush OTA cannot ship native widget UI):**

- First online `yarn install` (new `widget-bridge` file: dep + `@expo/config-plugins` entry), then `expo prebuild` regenerates `android/` + `ios/` from `targets/` + `plugins/withHomeWidgets` (committed outputs included for review).
- Apple Developer portal: enable App Group `group.com.vap.smartfinances.widgets` on the App ID and the Widgets extension; extension requires iOS 17+ (AppIntent configuration).
- Android `targetCellWidth/Height` pins exact 2x2/4x2/4x4 cells on API 31+; older versions approximate by dp.
- Local-build caveat: `./gradlew` is blocked in this sandbox by a pre-existing `expo-constants:createExpoConfig` babel failure under Node 24 (unrelated to widget code — `expo config` evaluates cleanly); use EAS build or Node 20.
- Known behavior: after an app kill without re-auth (in-memory session), widgets keep the last snapshot until the next foreground refresh; sign-out always clears to the locked placeholder.

**Tests**: none (matrix: QA/docs - full gate only)
**Gate**: full

---

### T13: Overview merge + consistent IDs — ✅ Complete

**What**: Rename Control Panel widgets into the Overview group with consistent IDs on both platforms.
**Where**: `SmartFinances/targets/widgets/`
**Depends on**: T12
**Reuses**: Existing views unchanged (title/ID-only change)
**Requirement**: WDG-42

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] iOS: three widgets titled "Overview" with kinds `OverviewSmallWidget`, `OverviewMediumWidget`, `OverviewLargeWidget`; Medium/Large render ex-Control Panel content unchanged
- [ ] Android: providers renamed to match (`OverviewMediumWidgetProvider`, `OverviewLargeWidgetProvider`), labels "Overview", manifest + res + strings updated
- [ ] Gallery shows one Overview entry with 3 size variations
- [ ] `swiftc -typecheck` clean; `:widget-bridge` untouched; jest suite still green

**Tests**: none (matrix: native UI - build gate + device QA)
**Gate**: build

---

### T14: Budgets Medium compaction

**What**: Compact Budgets Medium rows so header + 3 rows fit 169pt on iOS (+ tighten Android).
**Where**: `SmartFinances/targets/widgets/`
**Depends on**: T13
**Reuses**: Existing row views, reduced metrics only
**Requirement**: WDG-43

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] iOS Medium: smaller header font, bar height ≤20pt, row spacing ≤6pt, smaller name/status fonts — header, icon, and all 3 rows fully visible at 169pt
- [ ] Android Medium rows tightened to match
- [ ] Large unchanged (correctly shows up to 6; short lists leave empty space)
- [ ] `swiftc -typecheck` clean

**Tests**: none (matrix: native UI - build gate + device QA)
**Gate**: build

---

### T15: Cash-flow Small + Medium layout fixes

**What**: Fix Small clipping and Medium alignment per the to-be mock (iOS + Android).
**Where**: `SmartFinances/targets/widgets/`
**Depends on**: T14
**Reuses**: Existing chart views with flexible sizing
**Requirement**: WDG-44, WDG-45

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] iOS Small: header fits one line (scaled), values auto-shrink, chart flexible height, + button 40pt — nothing clipped in 2x2
- [ ] iOS Medium: chart fills right-side full height, + overlaid bottom-right, left totals vertically centered
- [ ] Android Small/Medium match the same fixes
- [ ] `swiftc -typecheck` clean

**Tests**: none (matrix: native UI - build gate + device QA)
**Gate**: build

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ------→ T2 ------→ T3 ------→ T4
Phase 2:  T5 ------→ T6 ------→ T7
Phase 3:  T8 ------→ T9 ------→ T10 ------→ T11 ------→ T12
```

Cross-phase dependencies (backward only):

```
T1 -> T5
T4 -> T7
T5 -> T8
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**Batch packing (~7 tasks/worker, whole phases):** Phase 1 (T1-T4) + Phase 2 (T5-T7) = 7 tasks → batch 1; Phase 3 (T8-T12) = 5 tasks → batch 2. Two batches → sub-agent offer required before Execute.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Snapshot types | 1 file | ✅ Granular |
| T2: Budgets slice | 1 file + its tests | ✅ Granular |
| T3: Snapshot composer | 1 file + its tests | ✅ Granular |
| T4: Sync hook | 1 file + its tests | ✅ Granular |
| T5: Bridge module | 1 module dir | ✅ Granular |
| T6: Config plugin | 1 plugin dir | ✅ Granular |
| T7: Root wiring | 1 file modify | ✅ Granular |
| T8: iOS views | 1 target dir | ✅ Granular |
| T9: Android providers | 1 target dir | ✅ Granular |
| T10: Deep-link builder | 1 file + its tests | ✅ Granular |
| T11: Tap wiring | 1 concern (URLs → native) | ✅ Granular |
| T12: QA + docs | 1 file modify + manual QA | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | chain head | ✅ Match |
| T2 | T1 | T1 -> T2 | ✅ Match |
| T3 | T2 | T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T1 (cross-phase) | T1 -> T5 (cross-phase block) | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |
| T7 | T4 (cross-phase) + T6 | T4 -> T7 (cross-phase block) + T6 -> T7 | ✅ Match |
| T8 | T5 (cross-phase) | T5 -> T8 (cross-phase block) | ✅ Match |
| T9 | T8 | T8 -> T9 | ✅ Match |
| T10 | T9 | T9 -> T10 | ✅ Match |
| T11 | T10 | T10 -> T11 | ✅ Match |
| T12 | T11 | T11 -> T12 | ✅ Match |

**Rules:** cross-phase dependencies (T1→T5, T4→T7, T5→T8) point backward and are drawn in the cross-phase block; all intra-phase edges match 1:1.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: types | Entity / config | none | none | ✅ OK |
| T2: budgets slice | Pure domain util | unit | unit | ✅ OK |
| T3: composer | Pure domain util | unit | unit | ✅ OK |
| T4: sync hook | Hook | unit | unit | ✅ OK |
| T5: bridge | Native bridge | none | none | ✅ OK |
| T6: plugin | Config | none | none | ✅ OK |
| T7: wiring | App wiring | none | none | ✅ OK |
| T8: iOS views | Native UI | none | none | ✅ OK |
| T9: Android providers | Native UI | none | none | ✅ OK |
| T10: link builder | Pure domain util | unit | unit | ✅ OK |
| T11: tap wiring | Native UI | none | none | ✅ OK |
| T12: QA + docs | QA/docs | none | none | ✅ OK |

---

## Tips

- **Phases are ordered** - Each phase completes before the next; tasks run in order within a phase
- **Reuses = Token saver** - Every task references existing code
- **Tools per task** - MCPs and Skills prevent wrong approaches
- **Dependencies are gates** - Clear what blocks what
- **Done when = Testable** - If you can't verify it, rewrite it
- **Requirement ID = Traceable** - Every task traces back to spec requirements
- **One commit per task** - Plan the commit message format in advance
