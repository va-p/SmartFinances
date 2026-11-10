# Validation Report — home-widgets

**Feature**: home-widgets (iOS / Android home-screen widgets)
**Diff range**: `49c7e0c..HEAD` (branch `feat/widgets`, 13 commits, all `feat(widgets)`/`docs(widgets)`)
**Verifier**: independent sub-agent (author ≠ verifier). Read-only review; no code changed.
**Date**: 2026-11-10 (UTC)

---

## 1. Task Completion (T1–T12, from tasks.md)

| Task | Claimed | Verifier evidence | Verdict |
| ---- | ------- | ----------------- | ------- |
| T1 Snapshot types (`src/widgets/widgetSnapshotTypes.ts`) | ✅ | File exists; interfaces match design §Data Models (version, budgets, cashFlow, overview, netWorth, institutions, hidden, signedIn). `tsc` clean in scope. | COMPLETE |
| T2 Budgets slice (`src/widgets/buildBudgetsSnapshot.ts`) | ✅ | Sort-desc + `Estourado!`/`restantes` strings present; 5 unit tests. | COMPLETE |
| T3 Full composer (`src/widgets/buildWidgetSnapshot.ts`) | ✅ | Cash-flow / overview / net-worth / institutions all present; 9 unit tests. | COMPLETE |
| T4 Sync hook (`src/widgets/useWidgetSnapshotSync.ts`) | ✅ | Debounce 1s, clear-on-signout, foreground listener; 5 unit tests. | COMPLETE |
| T5 Bridge (`modules/widget-bridge/`) | ✅ | `api.ts` (setSnapshot/clearSnapshot/reloadTimelines) + iOS Swift + Android Kotlin stubs present; wired in `package.json` (`file:./modules/widget-bridge`) and `app.config.ts` plugin entry. | COMPLETE |
| T6 Config plugin (`plugins/withHomeWidgets/`) | ✅ | `withHomeWidgets.js` + `widget-manifest.js` (9 providers, App Group `group.com.vap.smartfinances.widgets`); 9 manifest classNames match 9 Kotlin provider classes exactly (§5). | COMPLETE* |
| T7 Root wiring (`src/app/_layout.tsx`) | ✅ | `setWidgetBridge(WidgetBridge)` + `useWidgetSnapshotSync()` mounted in `RootNavigationLayout` (diff `49c7e0c..HEAD`). Full gate shows zero new failures. | COMPLETE |
| T8 iOS WidgetKit (`targets/widgets/`) | ✅ | 5 families + sizes, AppIntent Variant A/B, placeholders, deep links; committed `ios/Widgets/*` mirrors `targets/widgets/*`. `swiftc -typecheck` re-run here was sandbox-blocked (ModuleCache `Operation not permitted`), so clean-typecheck is taken from the author's claim + inspection (structs mirror TS 1:1). | COMPLETE* |
| T9 Android providers (`targets/widgets-android/` + `android/app/...`) | ✅ | 9 providers, horizontal Medium cash-flow bars, configure activity, ProGuard keep-rules. Kotlin could NOT be compiled here (pre-existing `expo-constants`/babel env failure under Node 24 blocks Gradle) — reviewed by inspection only. | COMPLETE* |
| T10 Deep-link builder (`src/widgets/buildWidgetDeepLink.ts`) | ✅ | 5 routes + home fallback; 5 unit tests. | COMPLETE |
| T11 Native tap wiring | ✅ w/ deviation | Every mock affordance is wired (`widgetURL` iOS / PendingIntents Android + cold-start route `(app)/transactions/new.tsx`). **Deviation**: tasks.md says `Where: targets/widget-taps/` but that directory was never created — wiring lives inline in `WidgetTheme.swift` (`WidgetLinks`), `BaseWidgetProvider.kt` (`URL_*`), and the new route. Behavior correct; traceability off. Fix F4. | COMPLETE (location deviation) |
| T12 Device QA + docs | ✅ docs only | Release notes + 9-row QA matrix recorded in tasks.md; ROADMAP correctly still unchecked; device matrix all ☐ (user UAT). | DOCS-COMPLETE, QA-PENDING |

`*` = code complete per inspection; execution proof (render, prebuild reproduce, release) is UAT-only (§6).

---

## 2. Spec-Anchored AC Check (41 requirements, WDG-01..WDG-41)

Legend: **TEST** = executed unit assertion cited `file:line` · **STATIC** = native code present, needs device UAT · **UAT** = cannot pass without a device.
Evidence-or-zero was applied: every row cites a file:line; anything without an executed assertion is marked STATIC/UAT, never a silent pass.

### P1 — Budgets (WDG-01..WDG-10)

| ID | Spec-defined outcome | Evidence (file:line + assertion) | Verdict |
| -- | -------------------- | -------------------------------- | ------- |
| WDG-01 | Header "Orçamentos" + target icon | `targets/widgets/BudgetsWidget.swift:55-59` `header(title:"Orçamentos", systemImage:"target")` · `android/.../BudgetWidgets.kt:40-45` sets `budgets_title "Orçamentos"` | STATIC → UAT-1 |
| WDG-02 | In-limit → green bar, percent, "R$ X restantes" | `src/widgets/__tests__/buildBudgetsSnapshot.test.ts:35-43` (`over=false`, `percentLabel='30,8%'`, `statusText='R$ 692,00 restantes'`) over `src/widgets/buildBudgetsSnapshot.ts:24-27` | TEST-PASS |
| WDG-03 | Over 100% → coral-red bar, percent, "Estourado! -R$ Y" | `buildBudgetsSnapshot.test.ts:46-53` (`over=true`, `'Estourado! -R$ 24,00'`) | TEST-PASS |
| WDG-04 | iOS chevron per row | `targets/widgets/BudgetsWidget.swift` `BudgetRowView` uses `chevron.right` | STATIC → UAT-1 |
| WDG-05 | Medium exactly first 3 | Sort: `buildBudgetsSnapshot.test.ts:24-31`; slice: `targets/widgets/BudgetsWidget.swift:49-51` `prefix(large?6:3)` + `BudgetWidgets.kt:38-41` `take(slots.size)`/3-slot `MEDIUM_SLOTS` | TEST-PASS (sort) + STATIC (slice) → UAT-1 |
| WDG-06 | Large exactly first 6 | Same as WDG-05 with 6-slot `LARGE_SLOTS` (`BudgetWidgets.kt:27-31`) | TEST-PASS + STATIC → UAT-1 |
| WDG-07 | Short list → no filler rows | Builder returns only existing rows (`buildBudgetsSnapshot.test.ts:57-59`); native `getOrNull` per slot (`BudgetWidgets.kt:44-48`) — empty-slot hiding verified only by inspection | STATIC → UAT-1 (P7) |
| WDG-08 | No budgets → create-in-app empty state | `buildBudgetsSnapshot.test.ts:57-59` (`[]`); `BudgetsWidget.swift:61-63` `"Nenhum orçamento criado. Crie orçamentos no app."` | TEST-PASS + STATIC → UAT-1 |
| WDG-09 | Stale/loading → keep last snapshot, never blank | `useWidgetSnapshotSync.test.ts:121-142` (no write while queries loading) + timeline returns last entry (`SnapshotTimelineProvider.swift:20-26`) | TEST-PASS (JS) + STATIC |
| WDG-10 | Identical content iOS/Android per snapshot+size | Same snapshot feeds both; 9 manifest providers ↔ 9 Kotlin classes (§5); families match (Medium/Large budgets both sides) | STATIC → UAT-1/3 |

### P1 — Cash flow (WDG-11..WDG-16)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-11 | Month name + "Fluxo de Caixa", green `R$ X`, red `-R$ Y` | `buildWidgetSnapshot.test.ts:75-88` (`'Novembro'`, `'R$ 6.450,00'`, `'-R$ 4.890,12'`); future/transfer exclusion `test.ts:91-109` | TEST-PASS |
| WDG-12 | Small: compact paired mini chart + orange + button | `CashFlowWidget.swift:MiniCashFlowChart` + `addButton` (`:98-105`); `CashFlowWidgets.kt:14-26` `drawMiniBars` + `cashflow_add` PendingIntent | STATIC → UAT-3 |
| WDG-13 | iOS Medium vertical diverging bars | `CashFlowWidget.swift:39-55` `DivergingCashFlowChart` (income above / expenses below axis) | STATIC → UAT-3 |
| WDG-14 | Android Medium horizontal bars | `CashFlowWidgets.kt:31-49` `drawHorizontalBars` + orientation comment | STATIC → UAT-3 |
| WDG-15 | + deep-links to add-transaction | URL: `buildWidgetDeepLink.test.ts:4-9` (`com.vap.smartfinances://transactions/new`); attach: `CashFlowWidget.swift` `addButton→WidgetLinks.addTransaction`, `CashFlowWidgets.kt` `URL_ADD_TRANSACTION` PendingIntent; cold-start route `(app)/transactions/new.tsx:1-34` + `Tabs.Screen transactions/new` | TEST-PASS (builder) + STATIC (attach) → UAT-7 |
| WDG-16 | Empty month → R$ 0,00 totals, empty-chart placeholder, no error | `buildWidgetSnapshot.test.ts:112-117` (`'R$ 0,00'`/`'R$ 0,00'`); `drawMiniBars` early-returns blank bitmap on empty (`WidgetCharts.kt:42-52`) | TEST-PASS + STATIC |

### P1 — Overview Small (WDG-17..WDG-22)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-17 | Header "Overview" + eye, "Patrimônio Total" + total | `OverviewWidget.swift:88-106` header/title/total; `overview.total` threaded from net worth (masked-path asserted `buildWidgetSnapshot.test.ts:184-187`; non-hidden literal value not asserted — P-note) | TEST-PASS (part) + STATIC → UAT-4 |
| WDG-18 | Variant A: coral-red alert card "Alerta: {name}" "{percent}%" + outlined mini pill | `OverviewWidget.swift:30-60` `OverviewAlertCard`; Android `widget_overview_small_a` layout | STATIC → UAT-4 |
| WDG-19 | Variant B: plain "Alerta: {name}" + "{percent}%" + full-width coral-red bar, no card | `OverviewWidget.swift:63-86` `OverviewAlertPlainBar`; Android `widget_overview_small_b` layout | STATIC → UAT-4 |
| WDG-20 | Variant choice persists across refreshes | iOS `OverviewVariantIntent` default `.card` (`OverviewWidget.swift:22-27`); Android `overviewVariant()` default `"card"` + `OverviewSmallConfigureActivity` (`OverviewWidgets.kt:16-20,74-90`) | STATIC → UAT-4 |
| WDG-21 | hide-amounts masks total + alert values (both variants) | `buildWidgetSnapshot.test.ts:176-188` + `useWidgetSnapshotSync.test.ts:145-165` (`hidden=true`, `'R$ ••••'`) | TEST-PASS* (*mask-literal weakness F1) |
| WDG-22 | No budget > 80% → alert hidden, total only | `buildWidgetSnapshot.test.ts:137-144` (`alertName/Percent` null) over threshold `buildWidgetSnapshot.ts:148` | TEST-PASS |

### P1 — Control Panel (WDG-23..WDG-28)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-23 | Medium: "Overview", total left, "Orçamento Crítico: {name}" card + "{percent}% utilizado" bar right | `ControlPanelWidget.swift:112-135` `ControlPanelMediumView` + `CriticalBudgetCard` | STATIC → UAT-5 |
| WDG-24 | Medium bottom row: + and "Relatórios" | `ControlPanelWidget.swift:136-139` `addButton` + `reportsButton` | STATIC → UAT-5 |
| WDG-25 | Large: "Painel de Controle", total, orange sparkline, critical card, expenses donut | `ControlPanelWidget.swift:151-192` `ControlPanelLargeView` (SparklineView + DonutChartView); `ControlWidgets.kt:41-55` `drawSparkline` + `drawDonut` | STATIC → UAT-5 |
| WDG-26 | Large bottom row: "+ Adicionar Despesa", "Relatórios" | `ControlPanelWidget.swift:182-192` labeled links | STATIC → UAT-5 |
| WDG-27 | +/Adicionar Despesa → add-transaction | URL `buildWidgetDeepLink.test.ts:4-9`; attach both platforms (`ControlWidgets.kt:28-36,60-69`, Swift `addTransaction`) | TEST-PASS (builder) + STATIC → UAT-7 |
| WDG-28 | Relatórios → Overview/Reports | URL `buildWidgetDeepLink.test.ts:11-16`; attach both platforms | TEST-PASS (builder) + STATIC → UAT-7 |

### P1 — Patrimony (WDG-29..WDG-34)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-29 | "Patrimônio Total" + eye + formatted total | `PatrimonyWidget.swift:40-50` title + `netWorth.total`; total math `buildWidgetSnapshot.test.ts:159` (`'R$ 6.240,55'`) | TEST-PASS + STATIC → UAT-6 |
| WDG-30 | Institution rows: bank icon, name, "{n} contas", balance (e.g. Nubank 5 / Itaú 3) | `buildWidgetSnapshot.test.ts:147-165` (Nubank 2 accts top, Itaú second — fixture uses 2 Nubank accounts, same shape); `PatrimonyWidgets.kt:39-50` binds name/count/balance | TEST-PASS + STATIC → UAT-6 |
| WDG-31 | Small: exactly top 2, no chart | Builder `slice(0,2)` (`buildWidgetSnapshot.ts:259-261`) asserted via names `[Nubank, Itaú]`; Swift `prefix(2)` (`PatrimonyWidget.swift:60-68`); Kotlin `take(2)` (`PatrimonyWidgets.kt:29-33`) | TEST-PASS + STATIC → UAT-6 |
| WDG-32 | Medium: same rows + orange sparkline | Swift `family == .systemMedium` sparkline branch; Android `patrimony_medium` layout | STATIC → UAT-6 |
| WDG-33 | hide-amounts masks total + every institution balance | `buildWidgetSnapshot.test.ts:176-188` (`institutions[0].balance` masked) | TEST-PASS* (*F1) |
| WDG-34 | No accounts → total R$ 0,00 + empty-accounts prompt | `buildWidgetSnapshot.test.ts:168-173`; Swift `"Nenhuma conta criada ainda."` (`PatrimonyWidget.swift:60-68`) | TEST-PASS + STATIC → UAT-6 |

### P2 — Freshness/privacy/resilience (WDG-35..WDG-39)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-35 | Refresh → shared snapshot rewritten ≤ 5s | `useWidgetSnapshotSync.test.ts:78-100` (write + `reloadTimelines` after 1s debounce, `SYNC_DEBOUNCE_MS=1000` in `useWidgetSnapshotSync.ts:27`) | TEST-PASS (+UAT timing) |
| WDG-36 | Offline → keep rendering last snapshot, no error | No network in hook (reads TanStack caches only) or timelines (UserDefaults/SharedPreferences reads); no-write-while-loading test covers the blank-guard | STATIC (by construction) → UAT-8 |
| WDG-37 | Signed out → locked placeholder, no financial values | `useWidgetSnapshotSync.test.ts:102-119` (`clearSnapshot`, no `setSnapshot`) + `buildWidgetSnapshot.test.ts:191-195` (`signedIn=false`); native `LockedWidgetView` (`SnapshotTimelineProvider.swift:29-44`) / `lockedViews` (`BaseWidgetProvider.kt:66-77`) | TEST-PASS + STATIC → UAT-8 |
| WDG-38 | OS timeline refresh < 2s, no network | `getTimeline` re-reads UserDefaults synchronously, hourly policy (`SnapshotTimelineProvider.swift:20-26`); Android `updateWidget` reads prefs; bridge `reloadTimelines` nudges only | STATIC (by construction) → UAT timing |
| WDG-39 | Missing/corrupt snapshot → setup placeholder prompting app open | Kotlin `parseSnapshot` catch→null (`WidgetSnapshot.kt:144-147`, comment cites WDG-39); Swift `try?`→nil→`LockedWidgetView`. No executed test (native-only per matrix). | STATIC → UAT-8 |

### P3 — Visual fidelity (WDG-40..WDG-41)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-40 | Dark card, white primary, green in-limit, coral-red over-limit, orange +/eye | `WidgetTheme.swift:4-11` palette (`cardBackground` dark, `incomeGreen`, `overrunRed`, `accentOrange`); Android `widget_card`/`widget_alert_card` drawables + `WidgetCharts.kt` green/red canvas paints | STATIC → UAT (visual) |
| WDG-41 | Long budget names truncate with tail ellipsis, one line | iOS `lineLimit(1)` (`BudgetsWidget.swift:12`, also Overview `lineLimit(1)`); Android layout `singleLine`/ellipsize presumed — not line-verified here | STATIC (iOS confirmed; Android verify in UAT) |

**Spec-anchored counts**: 41/41 ACs have file:line evidence. **Executed unit assertions: 19 ACs** (WDG-02,03,05-sort,06-sort,08-JS,09-JS,11,15-builder,16,17-part,21,22,27-builder,28-builder,29-math,30,31-JS,33,34-JS,35,37-JS). **22 ACs are STATIC-only** (all native render/size/variant/placeholder/visual ACs) → explicit UAT items in §6, not passes.

---

## 3. Discrimination Sensor (mandatory, scratch-only)

Scratch method: full-tree file copy (sans `.git`/`node_modules`) to `/tmp/hw-sensor/full` + `node_modules` symlink (git worktrees were sandbox-blocked: `.git` writes are `Operation not permitted`). Real tree untouched: `git status --porcelain` before and after both exactly `?? modules/widget-bridge/android/build/`. Mutants applied with `sed` to scratch copies only; widget suite run with `--rootDir /tmp/hw-sensor/full`. Scratch deleted afterwards.

| # | Mutant (new pure code) | Expected killer | Result |
| - | ---------------------- | --------------- | ------ |
| M1 | `buildBudgetsSnapshot.ts:14` sort `b−a` → `a−b` (ascending) | `buildBudgetsSnapshot.test.ts:31` order assertion | **KILLED** (1 failed, 4 passed) |
| M2 | `buildWidgetSnapshot.ts:32` `ALERT_THRESHOLD_PERCENT` 80 → 200 | `buildWidgetSnapshot.test.ts:130` alert assertion | **KILLED** (1 failed, 8 passed) |
| M3 | `buildWidgetSnapshot.ts:30` mask `'R$ ••••'` → `'R$ XXXX'` | mask assertions | **KILLED** (suite red: 1 failed / 24) — but the failure came from `useWidgetSnapshotSync.test.ts` (hardcoded literal), while `buildWidgetSnapshot.test.ts` went **9/9 green** because its mask assertions compare against the imported `WIDGET_MASKED_VALUE` itself (tautology). Sensor exposes weak assertion → fix F1. |

**Sensor: 3/3 killed.** One precision finding (F1) where the kill came from a neighboring suite, not the closest one.

---

## 4. UAT / Manual-QA Section (CANNOT pass here — explicit items, not silent passes)

Prerequisites (from T12 release notes): first online `yarn install` (new `widget-bridge` file-dep + `@expo/config-plugins`), `expo prebuild` to regenerate `android/`+`ios/` from `targets/`+`plugins/withHomeWidgets`, Apple Developer App Group `group.com.vap.smartfinances.widgets` on app + extension, iOS 17+ (AppIntent config), EAS build (local `./gradlew` blocked by pre-existing `expo-constants`/babel env failure under Node 24; `expo config` evaluates cleanly; release-minify keep-rules added but release-build verification pending).

| # | Check (from tasks.md T12 matrix) | Spec | Gate here |
| - | -------------------------------- | ---- | --------- |
| UAT-1 | Real iOS+Android: Budgets Medium 3 rows / Large 6, `%`-desc, `Estourado! -R$ …` coral-red vs `R$ … restantes` green, iOS chevrons, empty state, stale-while-loading | WDG-01..10, edge truncation | code STATIC only |
| UAT-2 | Cold-tap every target (+, Adicionar Despesa, Relatórios, budget rows, headers) from a killed app on both platforms | WDG-15,27,28 | builder TEST-PASS; attach STATIC; cold-tap unverified (new `(app)/transactions/new.tsx` route not render-tested) |
| UAT-3 | Cash-flow Novembro R$ 6.450,00 / −R$ 4.890,12; iOS Medium vertical vs Android Medium horizontal; Small mini chart; empty-month placeholder | WDG-11..14,16 | totals TEST-PASS; orientation STATIC |
| UAT-4 | Overview Small Variant A card vs B plain bar side-by-side; choice persists after timeline refresh + app restart; masked totals/alerts in both variants | WDG-17..22 | STATIC |
| UAT-5 | Control Medium (card + Relatórios) and Large (sparkline + donut + labeled actions) | WDG-23..26 | STATIC |
| UAT-6 | Patrimony Small 2 rows (Nubank 5 contas / Itaú 3 contas), Medium adds sparkline; empty prompt; masked balances | WDG-29..34 | math TEST-PASS; layout STATIC |
| UAT-7 | Airplane-mode keeps last snapshot; sign-out shows locked placeholder with zero value leakage | WDG-36,37 | JS TEST-PASS; native render STATIC |
| UAT-8 | Corrupt/missing snapshot → setup placeholder prompting app open | WDG-39 | STATIC (no executed test by matrix design) |
| UAT-9 | Dark-theme fidelity vs mocks on device; 40-char budget name one-line truncation both platforms (Android `singleLine` not line-verified) | WDG-40,41 | STATIC |
| UAT-10 | `expo prebuild --no-install` reproduces extension target + all 9 Android receivers with no diff on second run; release build keeps providers (ProGuard) | WDG-10,13,14 (T6) | NOT run here (network/sandbox) |
| UAT-11 | Snapshot ≤ 5s after foreground/pull-to-refresh/mutation; timeline tick < 2s | WDG-35,38 | debounce TEST-PASS; wall-clock unverified |

---

## 5. Code Quality (per coding principles)

| Principle | Finding |
| --------- | ------- |
| Spec-anchored outcomes, 1:1 AC mapping | Pure logic maps 1:1 (tests cite WDG IDs in comments). Native ACs map to views 1:1 but without executed assertions — correctly recorded as UAT, not claimed. |
| No unclaimed tests | All 24 tests cite their WDG in comments; no orphan assertions. The unknown-link fallback test (`buildWidgetDeepLink.test.ts:36-40`) covers behavior the spec never pins — defensive extra, justified, flagged as precision item P5 rather than creep. |
| No scope creep | Diff is feature-scoped: snapshot/bridge/plugin/targets/deep-link/route + `Tabs.Screen` registration for the cold-start route, one `.eslintrc.json` `mod` globs addition (config-plugin `dangerousMod` arg), ProGuard keep-rules. No unrelated files touched. |
| Root-cause fixes, minimal diff | Reuses existing utils (`budgetCalculations`, `calculateTotalAssets`, `buildNetWorthEvolution`, `processTransactions` filter shape, `formatCurrency`, `useUserConfigs`, deep-link scheme) per design; no logic duplicated natively. |
| Non-obvious code commented | Mask constant, debounce rationale, Android-horizontal-vs-iOS-vertical, App Group sharing, and the in-memory-session staleness limitation are all commented where they live. |

---

## 6. Edge Cases (from spec)

| Edge | Spec outcome | Evidence | Verdict |
| ---- | ------------ | -------- | ------- |
| Snapshot write fails | Retain previous, retry next refresh | By construction: native overwrites only on successful write (UserDefaults/SharedPreferences atomic set); hook rewrites on every data/foreground change so the next refresh retries. No explicit `try/catch` around `setSnapshot` in the hook — a throwing bridge would propagate to the debounce timer. | STATIC/by-construction → UAT (F3 hardens) |
| More budgets than fit | Truncate to 3/6, no scroll | `prefix(6/3)` Swift, `take(slots.size)` Kotlin, full-list builder + slice-at-render | STATIC → UAT-1 |
| Non-BRL base currency | Display pre-formatted strings unchanged | `baseCurrencyCode` threaded through every formatter; but **no non-BRL unit test exists** (all fixtures BRL, empty `QUOTES`) | PRECISION/COVERAGE GAP → F2 |
| Institution overflow | Top 2 by balance | `buildWidgetSnapshot.test.ts:147-165` (3 institutions → Nubank, Itaú) | TEST-PASS |
| Critical budget changes | Alert + critical card update next refresh | `buildOverview` re-derives max each compose; hook dependency on `budgets`; alert present/absent both asserted | TEST-PASS |

---

## 7. Gate Check (counts)

- **Quick gate** (run by this verifier): `CI=true npx jest --watchman=false src/widgets/__tests__` → **4/4 suites, 24/24 tests pass**.
- **Full gate** (run by this verifier): `CI=true npx jest --watchman=false` → **447 passed, 1 failed SUITE: `src/__tests__/screens/profile.spec.tsx`** (env-broken `device-info` NativeEventEmitter, pre-existing per `.specs/STATE.md` handoff). **This is the ONLY failure** — matches the author's claim exactly.
- **Test deletions/weakenings**: none. Diff adds 4 new test files (+479 lines), modifies zero existing test files.
- **tsc**: 507 total errors = pre-existing baseline; **`tsc` errors under `src/widgets`, `modules/widget-bridge`, `plugins/withHomeWidgets`, `src/app/(app)`, `src/app/_layout.tsx`: 0** (scoped grep empty).
- **Swift**: author's `swiftc -typecheck` clean claim could not be re-executed here (sandbox denies the compiler ModuleCache); schema/URLs/colors/slices verified 1:1 by inspection (§2, §5).
- **Kotlin**: not compiled here (pre-existing Gradle env block); 9 provider class names verified byte-identical to `widget-manifest.js` `toClassName` output (§5).

---

## 8. Fix Plans (ranked; verifier implements nothing)

1. **F1 — Tautological mask assertions** (`src/widgets/__tests__/buildWidgetSnapshot.test.ts:184-187`): assert the literal `'R$\u00A0••••'` instead of the imported `WIDGET_MASKED_VALUE` (sensor M3 proved the suite is blind to mask changes; only the sync suite caught it). Small, test-only.
2. **F2 — Non-BRL coverage**: add a composer test with non-BRL `baseCurrencyCode` + real `quotes` asserting pre-formatted strings pass through unchanged (spec edge, currently untested).
3. **F3 — Bridge write-failure hardening** (optional): wrap the debounce write in `try/catch` (or `.catch`) so a throwing bridge can never break the timer chain; document retain-and-retry explicitly.
4. **F4 — T11 traceability**: either create the documented `targets/widget-taps/` contract or amend tasks.md T11 `Where` to the actual inline locations (`WidgetTheme.WidgetLinks`, `BaseWidgetProvider.URL_*`, `(app)/transactions/new.tsx`).

---

## 9. Requirement Traceability Update

Per spec table statuses (`Implementing` → proposed `Verified` / `UAT-pending`):

- **Verified (executed assertions)**: WDG-02, WDG-03, WDG-08(JS), WDG-11, WDG-16, WDG-21, WDG-22, WDG-33, WDG-34(JS), WDG-35(JS), WDG-37(JS), WDG-30/31(JS math), deep-link URL builders (WDG-15/27/28 builder half).
- **UAT-pending (STATIC, needs device)**: WDG-01, WDG-04, WDG-05/06/07/10 (render half), WDG-12, WDG-13, WDG-14, WDG-17..20, WDG-23..26, WDG-29/32 (layout half), WDG-36, WDG-38, WDG-39, WDG-40, WDG-41 (Android half).
- **Spec-precision gaps flagged** (implementation picks a reasonable reading; spec should pin): donut time-window (P1), bar bucketing/caps (P2), percent decimals 1dp-vs-2dp (P3), "list order" wording vs %-desc decision (P4), unknown-link fallback (P5), non-BRL path (P6). None blocks ship; P1–P3 should be one-line spec amendments before release notes are finalized.

---

## 10. Summary

- **Overall verdict: FAIL** (pending device UAT + minor fixes — not a code-rejection: pure logic is green and native code matches the contract on inspection).
- **Spec-anchored**: 41/41 ACs evidenced; 19 with executed assertions, 22 STATIC-only → UAT.
- **Gate**: quick 24/24; full 447 passed with the single pre-existing `profile.spec.tsx` env failure; `tsc` +0 in scope; no test deletions.
- **Sensor**: 3/3 mutants killed (sort direction, 80% threshold, mask constant), with one weak-assertion finding (F1).
- **Ranked gaps**: UAT-1..UAT-11 device matrix (blocks ship) → F1 tautological mask test → F2 non-BRL test → P1–P6 spec-precision amendments → F3/F4 hardening/traceability.
- **Scope**: no scope creep; diff `49c7e0c..HEAD` is feature-contained.
- **Verifier: independent sub-agent (author ≠ verifier)**. Worktree left untouched (`git status --porcelain` baseline `?? modules/widget-bridge/android/build/` verified identical after scratch cleanup).
