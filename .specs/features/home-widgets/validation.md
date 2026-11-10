# Validation Report — home-widgets

**Result: FAIL** — code-pass, ship blocked on device UAT (UAT-1..UAT-11 pending on real hardware).

**Feature**: home-widgets (iOS / Android home-screen widgets)
**Diff range**: `49c7e0c..HEAD` (branch `feat/widgets`, 15 commits: 13 `feat/docs(widgets)` + 2 fix commits `6fd01c8`, `2cf2586`)
**Verifier**: independent sub-agent (author ≠ verifier). Read-only review; no code changed (this report file excepted).
**Date**: 2026-11-10 (UTC) — **iteration 2** (re-verifies iteration-1 fix plans F1–F4 + precision pins P1–P6)

---

## 1. Task Completion (T1–T12, from tasks.md)

| Task | Claimed | Verifier evidence | Verdict |
| ---- | ------- | ----------------- | ------- |
| T1 Snapshot types (`src/widgets/widgetSnapshotTypes.ts`) | ✅ | Unchanged since iteration 1. | COMPLETE |
| T2 Budgets slice (`src/widgets/buildBudgetsSnapshot.ts`) | ✅ | Unchanged since iteration 1. | COMPLETE |
| T3 Full composer (`src/widgets/buildWidgetSnapshot.ts`) | ✅ + hardened | +2 assertions in `src/widgets/__tests__/buildWidgetSnapshot.test.ts`: literal-mask test (`:193-205`, F1) and non-BRL USD test (`:209-222`, F2). Source untouched. | COMPLETE |
| T4 Sync hook (`src/widgets/useWidgetSnapshotSync.ts`) | ✅ + hardened | `try/catch` around debounce write (`src/widgets/useWidgetSnapshotSync.ts:102-111`, F3) + throw-and-retry test (`useWidgetSnapshotSync.test.ts:167-211`). | COMPLETE |
| T5 Bridge (`modules/widget-bridge/`) | ✅ | + `modules/widget-bridge/.gitignore` (`build/` + `node_modules/` hygiene; side effect: `git status --porcelain` is now fully clean — the untracked `android/build/` baseline from iteration 1 is gone). | COMPLETE |
| T6 Config plugin (`plugins/withHomeWidgets/`) | ✅ | Unchanged. | COMPLETE* |
| T7 Root wiring (`src/app/_layout.tsx`) | ✅ | Unchanged. | COMPLETE |
| T8 iOS WidgetKit (`targets/widgets/`) | ✅ | Unchanged; same sandbox-blocked `swiftc` caveat as iteration 1. | COMPLETE* |
| T9 Android providers (`targets/widgets-android/` + `android/app/...`) | ✅ | Unchanged; same Gradle-env caveat as iteration 1. | COMPLETE* |
| T10 Deep-link builder (`src/widgets/buildWidgetDeepLink.ts`) | ✅ | Unchanged. | COMPLETE |
| T11 Native tap wiring | ✅ deviation FIXED | tasks.md T11 `Where` now lists the actual locations (`src/app/(app)/transactions/new.tsx` + `_layout.tsx` registration; native attach points `targets/widgets/WidgetTheme.swift` + `targets/widgets-android/.../BaseWidgetProvider.kt`) — F4 closed, no more `targets/widget-taps/` phantom. | COMPLETE |
| T12 Device QA + docs | ✅ docs only | Unchanged; device matrix all ☐ (user UAT). | DOCS-COMPLETE, QA-PENDING |

`*` = code complete per inspection; execution proof (render, prebuild reproduce, release) is UAT-only (§6).

---

## 2. Spec-Anchored AC Check (41 requirements, WDG-01..WDG-41)

Legend: **TEST** = executed unit assertion cited `file:line` · **STATIC** = native code present, needs device UAT · **UAT** = cannot pass without a device.
Evidence-or-zero was applied: every row cites a file:line; anything without an executed assertion is marked STATIC/UAT, never a silent pass.
Rows changed vs iteration 1 are marked **(iter-2)**.

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
| WDG-11 | Month name + "Fluxo de Caixa", green `R$ X`, red `-R$ Y` | `buildWidgetSnapshot.test.ts:75-88` (`'Novembro'`, `'R$ 6.450,00'`, `'-R$ 4.890,12'`); future/transfer exclusion `test.ts:91-109` **(iter-2: + USD conversion `'US$\u00A020,00'` income from 100 BRL @0.2, `test.ts:219`)** | TEST-PASS |
| WDG-12 | Small: compact paired mini chart + orange + button | `CashFlowWidget.swift:MiniCashFlowChart` + `addButton` (`:98-105`); `CashFlowWidgets.kt:14-26` `drawMiniBars` + `cashflow_add` PendingIntent | STATIC → UAT-3 |
| WDG-13 | iOS Medium vertical diverging bars | `CashFlowWidget.swift:39-55` `DivergingCashFlowChart` (income above / expenses below axis) | STATIC → UAT-3 |
| WDG-14 | Android Medium horizontal bars | `CashFlowWidgets.kt:31-49` `drawHorizontalBars` + orientation comment | STATIC → UAT-3 |
| WDG-15 | + deep-links to add-transaction | URL: `buildWidgetDeepLink.test.ts:4-9` (`com.vap.smartfinances://transactions/new`); attach: `CashFlowWidget.swift` `addButton→WidgetLinks.addTransaction`, `CashFlowWidgets.kt` `URL_ADD_TRANSACTION` PendingIntent; cold-start route `(app)/transactions/new.tsx:1-34` + `Tabs.Screen transactions/new` | TEST-PASS (builder) + STATIC (attach) → UAT-7 |
| WDG-16 | Empty month → R$ 0,00 totals, empty-chart placeholder, no error | `buildWidgetSnapshot.test.ts:112-117` (`'R$ 0,00'`/`'R$ 0,00'`); `drawMiniBars` early-returns blank bitmap on empty (`WidgetCharts.kt:42-52`) | TEST-PASS + STATIC |

### P1 — Overview Small (WDG-17..WDG-22)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-17 | Header "Overview" + eye, "Patrimônio Total" + total | `OverviewWidget.swift:88-106` header/title/total; `overview.total` threaded from net worth (masked-path asserted `buildWidgetSnapshot.test.ts:202-204` literal; non-hidden literal value not asserted — P-note) | TEST-PASS (part) + STATIC → UAT-4 |
| WDG-18 | Variant A: coral-red alert card "Alerta: {name}" "{percent}%" + outlined mini pill | `OverviewWidget.swift:30-60` `OverviewAlertCard`; Android `widget_overview_small_a` layout | STATIC → UAT-4 |
| WDG-19 | Variant B: plain "Alerta: {name}" + "{percent}%" + full-width coral-red bar, no card | `OverviewWidget.swift:63-86` `OverviewAlertPlainBar`; Android `widget_overview_small_b` layout | STATIC → UAT-4 |
| WDG-20 | Variant choice persists across refreshes | iOS `OverviewVariantIntent` default `.card` (`OverviewWidget.swift:22-27`); Android `overviewVariant()` default `"card"` + `OverviewSmallConfigureActivity` (`OverviewWidgets.kt:16-20,74-90`) | STATIC → UAT-4 |
| WDG-21 | hide-amounts masks total + alert values (both variants) | **(iter-2, F1 closed)** `buildWidgetSnapshot.test.ts:201-204` asserts the **literal** `'R$\u00A0••••'` (netWorth.total, overview.total, institutions[0].balance) against `WIDGET_MASKED_VALUE` defined literally at `buildWidgetSnapshot.ts:30`; `useWidgetSnapshotSync.test.ts:162-164` asserts the same literal through the hook payload | TEST-PASS |
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
| WDG-29 | "Patrimônio Total" + eye + formatted total | `PatrimonyWidget.swift:40-50` title + `netWorth.total`; total math `buildWidgetSnapshot.test.ts:159` (`'R$ 6.240,55'`) **(iter-2: + USD `'US$\u00A0200,00'` from 1000 BRL @0.2, `test.ts:220`)** | TEST-PASS + STATIC → UAT-6 |
| WDG-30 | Institution rows: bank icon, name, "{n} contas", balance (e.g. Nubank 5 / Itaú 3) | `buildWidgetSnapshot.test.ts:147-165` (Nubank 2 accts top, Itaú second — fixture uses 2 Nubank accounts, same shape); `PatrimonyWidgets.kt:39-50` binds name/count/balance **(iter-2: + USD `institutions[0].balance 'US$\u00A0200,00'`, `test.ts:221`)** | TEST-PASS + STATIC → UAT-6 |
| WDG-31 | Small: exactly top 2, no chart | Builder `slice(0,2)` (`buildWidgetSnapshot.ts:259-261`) asserted via names `[Nubank, Itaú]`; Swift `prefix(2)` (`PatrimonyWidget.swift:60-68`); Kotlin `take(2)` (`PatrimonyWidgets.kt:29-33`) | TEST-PASS + STATIC → UAT-6 |
| WDG-32 | Medium: same rows + orange sparkline | Swift `family == .systemMedium` sparkline branch; Android `patrimony_medium` layout | STATIC → UAT-6 |
| WDG-33 | hide-amounts masks total + every institution balance | **(iter-2, F1 closed)** literal `'R$\u00A0••••'` at `buildWidgetSnapshot.test.ts:202-204` (`institutions[0].balance`) vs constant `buildWidgetSnapshot.ts:30` | TEST-PASS |
| WDG-34 | No accounts → total R$ 0,00 + empty-accounts prompt | `buildWidgetSnapshot.test.ts:168-173`; Swift `"Nenhuma conta criada ainda."` (`PatrimonyWidget.swift:60-68`) | TEST-PASS + STATIC → UAT-6 |

### P2 — Freshness/privacy/resilience (WDG-35..WDG-39)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-35 | Refresh → shared snapshot rewritten ≤ 5s | `useWidgetSnapshotSync.test.ts:78-100` (write + `reloadTimelines` after 1s debounce, `SYNC_DEBOUNCE_MS=1000` in `useWidgetSnapshotSync.ts:27`) **(iter-2, F3 closed: + throw-and-retry `test.ts:167-211` — throwing `setSnapshot` never escapes the timer (`:182-186` `not.toThrow`), `reloadTimelines` skipped on the failed tick (`:187`), retry after payload change succeeds (`:206-210`))** | TEST-PASS (+UAT timing) |
| WDG-36 | Offline → keep rendering last snapshot, no error | No network in hook (reads TanStack caches only) or timelines (UserDefaults/SharedPreferences reads); no-write-while-loading test covers the blank-guard | STATIC (by construction) → UAT-8 |
| WDG-37 | Signed out → locked placeholder, no financial values | `useWidgetSnapshotSync.test.ts:102-119` (`clearSnapshot`, no `setSnapshot`) + `buildWidgetSnapshot.test.ts:225-229` (`signedIn=false`); native `LockedWidgetView` (`SnapshotTimelineProvider.swift:29-44`) / `lockedViews` (`BaseWidgetProvider.kt:66-77`) | TEST-PASS + STATIC → UAT-8 |
| WDG-38 | OS timeline refresh < 2s, no network | `getTimeline` re-reads UserDefaults synchronously, hourly policy (`SnapshotTimelineProvider.swift:20-26`); Android `updateWidget` reads prefs; bridge `reloadTimelines` nudges only | STATIC (by construction) → UAT timing |
| WDG-39 | Missing/corrupt snapshot → setup placeholder prompting app open | Kotlin `parseSnapshot` catch→null (`WidgetSnapshot.kt:144-147`, comment cites WDG-39); Swift `try?`→nil→`LockedWidgetView`. No executed test (native-only per matrix). | STATIC → UAT-8 |

### P3 — Visual fidelity (WDG-40..WDG-41)

| ID | Spec-defined outcome | Evidence | Verdict |
| -- | -------------------- | -------- | ------- |
| WDG-40 | Dark card, white primary, green in-limit, coral-red over-limit, orange +/eye | `WidgetTheme.swift:4-11` palette (`cardBackground` dark, `incomeGreen`, `overrunRed`, `accentOrange`); Android `widget_card`/`widget_alert_card` drawables + `WidgetCharts.kt` green/red canvas paints | STATIC → UAT (visual) |
| WDG-41 | Long budget names truncate with tail ellipsis, one line | iOS `lineLimit(1)` (`BudgetsWidget.swift:12`, also Overview `lineLimit(1)`); Android layout `singleLine`/ellipsize presumed — not line-verified here | STATIC (iOS confirmed; Android verify in UAT) |

**Spec-anchored counts**: 41/41 ACs have file:line evidence. **Executed unit assertions: 19 ACs** (WDG-02,03,05-sort,06-sort,08-JS,09-JS,11,15-builder,16,17-part,21,22,27-builder,28-builder,29-math,30,31-JS,33,34-JS,35-JS,37-JS). **22 ACs are STATIC-only** (all native render/size/variant/placeholder/visual ACs) → explicit UAT items in §6, not passes. **Iter-2 strengthening (no new ACs, deeper assertions on the same ACs)**: F1 literal-mask ×4 sites, F2 USD conversion ×3 values, F3 throw-and-retry.

---

## 3. Discrimination Sensor (mandatory, scratch-only)

Scratch method (iter-2): this thread's sandbox denies writes to bare `/tmp`, so copies went to the thread temp dir (`$TMPDIR/hw-sensor2/a`, `/b`) — full-tree copies sans `.git`/`node_modules` + `node_modules` symlink (same layout iteration 1 used under `/tmp/hw-sensor`). Mutants applied with `sed` to scratch copies only; widget suites run with `--rootDir <scratch>`. Real tree untouched: `git status --porcelain` empty before AND after (scratch deleted afterwards).

| # | Mutant (scratch-only) | Closest suite | Expected killer | Result |
| - | --------------------- | ------------- | --------------- | ------ |
| M3′ | `buildWidgetSnapshot.ts:30` mask `'R$ ••••'` → `'R$ XXXX'` (F1 re-run) | `buildWidgetSnapshot.test.ts` | Literal mask test `:202` | **KILLED by the closest suite itself** (1 failed / 10 — `Expected: "R$ ••••", Received: "R$ XXXX"` at `test.ts:202`; the other 9 pass). The iteration-1 weakness is gone: no neighboring-suite rescue needed. |
| M4 | `useWidgetSnapshotSync.ts:103,106-110` delete `try/catch` (new F3 mutant: throwing bridge) | `useWidgetSnapshotSync.test.ts` | Throw-and-retry test `:169-211` | **KILLED** (1 failed / 6 — the `not.toThrow` at `:182-186` reddens; stack shows the throw escaping `advanceTimersByTime` via `useWidgetSnapshotSync.ts:103`). The surviving 5 tests prove the mutant is surgical. |

**Sensor: 2/2 killed, both by their closest suites.** No new weak-assertion findings.

---

## 4. UAT / Manual-QA Section (CANNOT pass here — explicit items, not silent passes)

Prerequisites (from T12 release notes): first online `yarn install` (new `widget-bridge` file-dep + `@expo/config-plugins`), `expo prebuild` to regenerate `android/`+`ios/` from `targets/`+`plugins/withHomeWidgets`, Apple Developer App Group `group.com.vap.smartfinances.widgets` on app + extension, iOS 17+ (AppIntent config), EAS build (local `./gradlew` blocked by pre-existing `expo-constants`/babel env failure under Node 24; `expo config` evaluates cleanly; release-minify keep-rules added but release-build verification pending).

| # | Check (from tasks.md T12 matrix) | Spec | Gate here |
| - | -------------------------------- | ---- | --------- |
| UAT-1 | Real iOS+Android: Budgets Medium 3 rows / Large 6, `%`-desc, `Estourado! -R$ …` coral-red vs `R$ … restantes` green, iOS chevrons, empty state, stale-while-loading | WDG-01..10, edge truncation | code STATIC only |
| UAT-2 | Cold-tap every target (+, Adicionar Despesa, Relatórios, budget rows, headers) from a killed app on both platforms | WDG-15,27,28 | builder TEST-PASS; attach STATIC; cold-tap unverified (new `(app)/transactions/new.tsx` route not render-tested) |
| UAT-3 | Cash-flow Novembro R$ 6.450,00 / −R$ 4.890,12; iOS Medium vertical vs Android Medium horizontal; Small mini chart; empty-month placeholder | WDG-11..16 | totals TEST-PASS; orientation STATIC |
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
| No unclaimed tests | All 26 tests cite their WDG/edge in comments. The unknown-link fallback test (`buildWidgetDeepLink.test.ts:36-40`) covers behavior the spec never pins — defensive extra, justified, flagged as precision item P5 rather than creep. |
| No scope creep | The 2 fix commits (`6fd01c8`, `2cf2586`) touch ONLY: `src/widgets/useWidgetSnapshotSync.ts` (try/catch, F3), 2 widget test files (F1/F2/F3 assertions), `modules/widget-bridge/.gitignore` (build hygiene), and `.specs/` docs (P1–P6 pins, T11 fix, L-016/L-017 lessons, this report's predecessor). `git diff b11e538..2cf2586 --name-only` confirms 9 files, zero unrelated source touched. |
| Root-cause fixes, minimal diff | Fix diff is +94/−6 lines, all inside the widget seam; try/catch keeps the existing timer-chain design, literals reuse `formatCurrency` semantics (no new formatting logic). |
| Non-obvious code commented | Mask comment (NBSP parity with `formatCurrency`), F3 catch comment (retain-and-retry rationale), USD test comment (1 BRL = 0.2 USD fixture parity) all present where they live. |

---

## 6. Edge Cases (from spec)

| Edge | Spec outcome | Evidence | Verdict |
| ---- | ------------ | -------- | ------- |
| Snapshot write fails | Retain previous, retry next refresh | **(iter-2, F3 closed)** `try/catch` in hook (`useWidgetSnapshotSync.ts:102-111`) + explicit throw-and-retry test (`useWidgetSnapshotSync.test.ts:167-211`): throw swallowed, timer chain survives, next payload change retries and calls `reloadTimelines` exactly once. | TEST-PASS |
| More budgets than fit | Truncate to 3/6, no scroll | `prefix(6/3)` Swift, `take(slots.size)` Kotlin, full-list builder + slice-at-render | STATIC → UAT-1 |
| Non-BRL base currency | Display pre-formatted strings unchanged | **(iter-2, F2 closed)** USD test (`buildWidgetSnapshot.test.ts:209-222`): 100 BRL CREDIT @0.2 → `'US$\u00A020,00'` income; 1000 BRL balance → `'US$\u00A0200,00'` totals — matches `convertToBaseCurrency` (100×0.2=20, 1000×0.2=200) piped through `formatCurrency('USD',·)` (`pt-BR` `US$ 20,00`/`US$ 200,00`) | TEST-PASS |
| Institution overflow | Top 2 by balance | `buildWidgetSnapshot.test.ts:147-165` (3 institutions → Nubank, Itaú) | TEST-PASS |
| Critical budget changes | Alert + critical card update next refresh | `buildOverview` re-derives max each compose; hook dependency on `budgets`; alert present/absent both asserted | TEST-PASS |

---

## 7. Gate Check (counts)

- **Quick gate** (re-run by this verifier): `CI=true npx jest --watchman=false src/widgets/__tests__` → **4/4 suites, 26/26 tests pass** (was 24/24; +2 new: USD conversion, throw-and-retry).
- **Full gate** (re-run by this verifier): `CI=true npx jest --watchman=false` → **449 passed, 1 failed SUITE: `src/__tests__/screens/profile.spec.tsx`** (env-broken `device-info` NativeEventEmitter, pre-existing per `.specs/STATE.md` handoff). **This is the ONLY failure** — 54/55 suites green, zero new failures.
- **Test deletions/weakenings**: none. Fix commits add 2 tests and strengthen 1 existing test (mask assertions constant→literal, strictly stronger); zero existing tests modified otherwise, zero deleted.
- **tsc**: not re-run (no source-signature change in scope beyond a `try/catch` + comments; iteration-1 scoped `tsc` was 0 under `src/widgets`, `modules/widget-bridge`, `plugins/withHomeWidgets`, `src/app/(app)`, `src/app/_layout.tsx`).
- **Swift**: author's `swiftc -typecheck` clean claim still could not be re-executed here (sandbox denies the compiler ModuleCache); schema/URLs/colors/slices verified 1:1 by inspection (§2, §5).
- **Kotlin**: not compiled here (pre-existing Gradle env block); 9 provider class names verified byte-identical to `widget-manifest.js` `toClassName` output (§5).

---

## 8. Fix Plans (ranked; verifier implements nothing)

1. **F1 — Tautological mask assertions — DONE.** `buildWidgetSnapshot.test.ts:202-204` + `useWidgetSnapshotSync.test.ts:164` now assert the literal `'R$\u00A0••••'`, byte-identical to `WIDGET_MASKED_VALUE` (`buildWidgetSnapshot.ts:30`). Sensor M3′ proves the closest suite now kills the mutant independently.
2. **F2 — Non-BRL coverage — DONE.** USD test (`buildWidgetSnapshot.test.ts:209-222`) with real quotes asserts `US$ 20,00` income / `US$ 200,00` totals from 100/1000 BRL @0.2 — consistent with `convertToBaseCurrency` × `formatCurrency` semantics.
3. **F3 — Bridge write-failure hardening — DONE.** `try/catch` (`useWidgetSnapshotSync.ts:102-111`) + throw-and-retry test (`useWidgetSnapshotSync.test.ts:167-211`). Sensor M4 proves the test reddens without the guard.
4. **F4 — T11 traceability — DONE.** tasks.md T11 `Where` lists actual files; phantom `targets/widget-taps/` reference gone.
5. **Remaining (ship-blocking): UAT-1..UAT-11 device matrix** — handed to user per T12; ROADMAP stays unchecked until it passes. No code-side fix plans remain. P1–P6 precision pins are in the spec Assumptions table (verified present); P4 confirmed (`y`), P1–P3/P5–P6 recorded as chosen defaults pending release-notes finalization.

---

## 9. Requirement Traceability Update

Per spec table statuses (`Implementing` → proposed `Verified` / `UAT-pending`):

- **Verified (executed assertions)**: WDG-02, WDG-03, WDG-08(JS), WDG-11, WDG-16, WDG-21, WDG-22, WDG-33, WDG-34(JS), WDG-35(JS), WDG-37(JS), WDG-30/31(JS math), deep-link URL builders (WDG-15/27/28 builder half). **Iter-2 upgrades within this set**: WDG-21/33 full literal-mask (F1), WDG-11/29/30 +USD conversion coverage (F2), WDG-35 +throw-and-retry (F3).
- **UAT-pending (STATIC, needs device)**: WDG-01, WDG-04, WDG-05/06/07/10 (render half), WDG-12, WDG-13, WDG-14, WDG-17..20, WDG-23..26, WDG-29/32 (layout half), WDG-36, WDG-38, WDG-39, WDG-40, WDG-41 (Android half).
- **Spec-precision**: P1–P6 pins verified present in spec.md Assumptions table (donut window, bar bucketing, percent decimals, order wording, unknown-link fallback, non-BRL rendering). No open precision gaps.

---

## 10. Summary

- **Overall verdict: CODE-PASS + UAT-PENDING (ship blocked on device QA only).** All four code-fixable gaps (F1–F4) are closed with executed-assertion evidence, the sensor kills 2/2 via the closest suites, and both gates are green with zero new failures. The remaining FAIL ground — if the team wants the word — is exactly UAT-1..UAT-11, which *cannot* pass in this environment by design (native render, prebuild reproduce, wall-clock timing) and is explicitly handed to the user in T12. Reasoning for code-PASS rather than FAIL: nothing further is provable or fixable here; re-failing would conflate "unverifiable-here-by-design" with "broken", and iteration 1 already established this is not a code-rejection.
- **Spec-anchored**: 41/41 ACs evidenced; 19 with executed assertions (strengthened: literal mask ×4 sites, USD ×3 values, throw-and-retry), 22 STATIC-only → UAT.
- **Gate**: quick 26/26; full 449 passed with the single pre-existing `profile.spec.tsx` env failure; no test deletions/weakenings.
- **Sensor**: M3′ (mask) killed by closest suite; M4 (try/catch removal) killed by new retry test. No weak-assertion findings remain.
- **Scope**: fix commits touch only the 9 listed files (§5); no scope creep.
- **Lessons**: none recorded this iteration — the only candidate lessons (mask-literal L-016, chart-contract pin L-017) are already in `.specs/lessons.json`; no new grounded failures were found, so no duplicates were added.
- **Verifier: independent sub-agent (author ≠ verifier)**. Worktree holds only this report as a modification (`git status --porcelain` empty before the write; scratch sensor dirs deleted afterwards).

## Addendum — F10 (orchestrator, user-reported empty widgets on device)

- **F10 — Main app had no App Group entitlement, so no snapshot ever reached the extension.** The bridge module was linked and the extension side entitled, but `ios/SmartFinances/SmartFinances.entitlements` was an empty dict (the `withWidgetAppGroup` plugin output only lands on prebuild, which never re-ran). `UserDefaults(suiteName:)` without the entitlement returns nil, so every write silently vanished and widgets correctly showed the Locked placeholder forever. Fixed by writing the group into the app entitlements; added a dev-only `console.warn` when the native bridge is absent so this class of failure is never silent again. Remaining user-side prerequisites: App Group enabled for both App IDs with refreshed profiles (automatic signing usually handles it), then rebuild + reinstall + open the app once so the first snapshot writes.

## Addendum — F5 (orchestrator, post-verification)

- **F5 — Extension signing + Info.plist were missing.** The xcode lib's name-based `updateBuildProperty` silently no-ops on quoted target names, so the committed extension had no `CODE_SIGN_ENTITLEMENTS` (App Group access would fail closed → permanent Locked view) and referenced a nonexistent `Widgets/Widgets-Info.plist`. Fixed: `targets/widgets/Widgets-Info.plist` source + direct per-config `CODE_SIGN_ENTITLEMENTS = Widgets/Widgets.entitlements` write (verified via `xcodebuild -showBuildSettings -target Widgets`); plugin's `withWidgetExtensionTarget` rewritten to the same direct path. Xcode's canonical reordering + the Embed App Extensions copy phase it added were adopted as-is. This was invisible to the sensor (native, uncompilable here) and is covered by UAT-1/UAT-10 on device.

## Addendum — F6/F7 (orchestrator, user-reported Xcode build error)

- **F6 — Widget Swift files compiled into the app target, extension Sources phase empty.** `addSourceFile`'s comment-based phase lookup silently falls back to the first Sources phase. Fixed by moving all 9 files into a dedicated extension Sources phase and setting `SWIFT_VERSION 5.0`, `IPHONEOS_DEPLOYMENT_TARGET 17.0`, `TARGETED_DEVICE_FAMILY 1,2` directly per config. Plugin rewritten to direct-hash membership (`internals` test seam); verified on a scratch copy (damage → exact repair, no duplicates, `xcodebuild -list` clean).
- **F7 — Xcode Release build cycle** (`Cycle inside SmartFinances`): the trailing Embed App Extensions phase fused with the RNFB Crashlytics script (dSYM + Info.plist inputs, no outputs) under Xcode 16+. Fixed by moving the Embed phase to right after Resources (Xcode template order). **Verified end-to-end: workspace Release `BUILD SUCCEEDED`, all 9 Swift files compile in the Widgets target, `SmartFinances.app/PlugIns/Widgets.appex` embeds correctly.** Remaining failure surface is device-only (signing identity, on-device rendering/taps — UAT-1..UAT-11).

## Addendum — F8 (orchestrator, user-reported install failure on device)

- **F9 — Widgets missing from iOS gallery + Android bridge compile error.** The `WidgetBundle` lacked `@main`, so the extension had no entry point and the system listed no widgets (verified by code inspection against the WidgetKit contract; the appex otherwise built and embedded fine). Fixed with `@main` on `WidgetsBundle` (both `targets/widgets/` source and the `ios/Widgets/` build copy). On Android, `?: return@Function` returned Unit against the Expo `() -> Any?` function contract (error at `WidgetBridgeModule.kt:35:48`); fixed with explicit `return@Function null`. **Verified: workspace Release `BUILD SUCCEEDED`, `:widget-bridge:compileDebugKotlin` `BUILD SUCCESSFUL`.** Remaining step is the user's on-device reinstall (iOS) and dev-build rerun (Android).
- **F8 — `MissingBundleExecutable` at install + latent bundle-ID collision.** The extension `Info.plist` lacked `CFBundleExecutable` (fatal at installd validation) and `PRODUCT_BUNDLE_IDENTIFIER` resolved to the app's own ID. Fixed: full extension plist keys (`CFBundleExecutable`, `CFBundleIdentifier=$(PRODUCT_BUNDLE_IDENTIFIER)`, `CFBundlePackageType=XPC!`, versions) in `targets/widgets/Widgets-Info.plist`, and suffixed the extension configs to `com.vap.smartfinances.Widgets`. **Verified on the built product: Release `BUILD SUCCEEDED`, embedded `PlugIns/Widgets.appex/Info.plist` carries `CFBundleExecutable=Widgets` + `CFBundleIdentifier=com.vap.smartfinances.Widgets`, executable binary present.** Plugin pins the suffixed bundle ID for future prebuilds. Remaining step is the user's on-device install (signing/profiles are theirs).
