# Base Currency Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/base-currency/design.md`
**Status**: Done (Verifier PASS incl. amendment — see `validation.md`)

---

## Test Coverage Matrix

> Generated from codebase sampling and `.specs/codebase/CONVENTIONS.md`. No AGENTS.md / CONTRIBUTING / CI workflows found - no external guidelines apply; sampled suites (`src/utils/__tests__/*` 29 suites, `src/__tests__/screens/profile.spec.tsx`, `src/__tests__/api/*`) set the floor for style/location/framework.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Pure domain/aggregation utils (`baseCurrency`, `processTransactions`, `groupTransactionsByDate`, `processAccountsForList`, `subscriptionPaymentsSummary`) | unit | All branches 1:1 to spec ACs; every listed edge case: BC-04 (missing/corrupt/unsupported restore), BC-05 (candidate filter), BC-16/BC-19 (base-code formatting + raw totals), BC-20 (unsupported pair skip, existing tests) | `src/utils/__tests__/*.test.ts` | `CI=true npx jest --watchman=false src/utils/__tests__` |
| Zustand store (`userConfigsStorage`) | unit | BC-01 default value; BC-02 set + MMKV persist (database module mocked) | `src/__tests__/stores/*.test.ts` | `CI=true npx jest --watchman=false src/__tests__/stores` |
| Light UI components renderable in jest (`WelcomeFlow`, `WelcomeBaseCurrency`, `CurrencySelect`) | unit (RNTL render) | BC-05..BC-13: bullets per step + active highlight, bullet tap navigation, Continuar advance, step-array extensibility, selection wiring (set + persist + dismiss), `items` override | `src/__tests__/screens/*.spec.tsx` | `CI=true npx jest --watchman=false src/__tests__/screens` |
| Heavy-native screens (`OptionsMenu`, `Home`, `Account`, `Accounts`, `InstitutionDetails`, `AccountsList`, `Overview`, `Goals`, `Subscriptions`, `SubscriptionPayments`, `TransactionsByCategory`, `BudgetDetails`) | none (env-blocked: clerk/onesignal/web-browser heavy trees cannot render in the current jest setup - precedent: pre-existing `profile.spec.tsx` suite failure) | Verified by full-suite regression gate (no new failures) + static wiring evidence (`file:line`) recorded in `validation.md` | - | full gate below |

## Gate Check Commands

> Generated from codebase. Jest needs `--watchman=false` in this environment (watchman crashes). Baseline: 267 tests passing, 2 pre-existing failures (`accountsFilter.test.ts` label text; `profile.spec.tsx` env breakage). `npx tsc --noEmit` has 827 pre-existing theme-typing errors and `yarn lint` has 18 pre-existing errors in `RegisterTransaction/index.tsx` - neither is a whole-repo gate; lint gates on touched files only.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `CI=true npx jest --watchman=false <touched test paths>` |
| Full | After tasks touching jest config or env-blocked screens | `CI=true npx jest --watchman=false` (zero NEW failures vs baseline) |
| Build | After phase completion | Full gate + `npx eslint <touched src files> --ext .ts,.tsx` (zero new issues) |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation - state, selection flow, entry points

```
T1 → T3 → T4
T3 → T5
T2 → T4
```

### Phase 2: Aggregation pipeline utils

```
T6
```

### Phase 3: Screen integration

```
T7 → T8
```

### Phase A (amendment 2026-10-05): Converted transaction-flow totals

```
A1 → A2 → A3
```

---

## Task Breakdown

### A1: `convertToBaseCurrency` helper + day-total/cash-flow conversion — ✅ Complete

**What**: Add `convertToBaseCurrency(amount, accountCurrency, baseCurrencyCode, quotes)` to `src/utils/baseCurrency.ts` (converts via `convertCurrency`; identity without touching quotes when account currency = base; returns null for unsupported pairs); rework `groupTransactionsByDate` to `(transactions, quotes, baseCurrencyCode = 'BRL')` converting each amount (`amount_in_account_currency ?? amount`, from the account's currency) before summing, skipping unsupported pairs; rework `processTransactions` to `(transactions, period, selectedDate, quotes, baseCurrencyCode = 'BRL')` converting in the per-period cash-flow loop (chart bars included) and passing quotes down to `groupTransactionsByDate`.
**Where**: `src/utils/groupTransactionsByDate.ts` (plus `processTransactions.ts`, `baseCurrency.ts`)
**Depends on**: T6
**Reuses**: `convertCurrency` identity path (from==to never touches quotes); `processAccountsForList` skip-on-unsupported pattern
**Requirement**: BC-21, BC-22, BC-23, BC-24 (day totals + cash flow + chart bars)

**Tools**: NONE

**Done when**:
- [x] Same-currency (account = base) sums are byte-identical to the pre-amendment values, including with all-zero quotes (identity never touches quotes)
- [x] Cross-currency: BRL amounts with base USD convert per amount before summing (day total, current cash flow and chart-bar values)
- [x] Unsupported account currencies (e.g. ETH) are skipped from totals, no crash; `amount_in_account_currency` preferred over `amount`
- [x] Gate check passes: `CI=true npx jest --watchman=false src/utils/__tests__/baseCurrency.test.ts src/utils/__tests__/groupTransactionsByDate.test.ts src/utils/__tests__/processTransactions.test.ts` (37 passed) + full gate 322 passing, zero new failures
- [x] Test count: existing assertions preserved on the identity path (fixtures gained quotes); 11 new tests pass (3 helper + 4 day-total + 4 cash-flow)

**Tests**: unit (extend the three suites)
**Gate**: quick

**Commit**: `feat(base-currency): convert flow totals to the base currency`

---

### A2: Net-worth evolution flow conversion — ✅ Complete

**What**: Add `quotes` + `baseCurrencyCode` to `buildNetWorthEvolution`; convert each period flow (`amount_in_account_currency ?? amount`, from `transaction.account.currency.code`) to the base before summing, skipping no-account and unsupported-pair items, so intermediate points are consistent with the base-converted seed.
**Where**: `src/utils/buildNetWorthEvolution.ts`
**Depends on**: A1
**Reuses**: A1 `convertToBaseCurrency` helper
**Requirement**: BC-25 (plus BC-22/BC-23/BC-24 applied to the series)

**Tools**: NONE

**Done when**:
- [x] Same-currency series unchanged (existing assertions preserved after fixtures gained account/quotes)
- [x] Cross-currency: BRL flows with base USD step the series in converted values consistent with the base-converted `totalAssets` (180 → 200 for −10/+20 USD flows)
- [x] No-account and unsupported-currency flows are skipped, no crash; `amount_in_account_currency` preferred
- [x] Gate check passes: `CI=true npx jest --watchman=false src/utils/__tests__/buildNetWorthEvolution.test.ts` (8 passed) + full gate 327 passing, zero new failures
- [x] Test count: existing assertions preserved; 5 new tests pass

**Tests**: unit (extend the suite)
**Gate**: quick

**Commit**: `feat(base-currency): convert net worth evolution flows to the base currency`

---

### A4: Welcome flow reorder + active-step dash slide animation (2026-10-05, user follow-up) — ✅ Complete

**What**: Commit the user's flow reorder (`[Welcome (intro, Continuar), WelcomeBaseCurrency (selection + auth CTAs)]`, auth actions moved to the terminal step; recorded as AD-004 superseding AD-003; BC-08/BC-11 reworded; tests realigned) — ce0a333. Then implement the active-step dash slide: uniform 8px bullets (no reflow) + an absolutely-positioned 24px `StepDash` centered on the active bullet, slid horizontally between bullet positions with `withSpring` on a reanimated shared value (BC-26); minimal reanimated mock in `jest.setup.js` so the shell renders in tests.
**Where**: `src/screens/WelcomeFlow/index.tsx` (plus `styles.ts`, `jest.setup.js`)
**Depends on**: A3
**Reuses**: `STEP_DASH_STRIDE` geometry shared by styles and component; reanimated shared-value + `useAnimatedStyle` pattern
**Requirement**: BC-26 (plus BC-08/BC-11 re-anchored to the user's reorder)

**Tools**: NONE

**Done when**:
- [x] All bullets are uniform dots; the active position is highlighted by the dash sliding to it (no width-swap reflow)
- [x] Dash renders centered over the active bullet at mount (translateX 0 for step 0)
- [x] On step change (bullet tap / onNext), the dash slides to the new position (stride 16: translateX 16 for step 1, 32 for step 2)
- [x] Bullet tap navigation (BC-10) and per-step bullets/selected state (BC-09) unchanged
- [x] Gate: `welcomeFlow.spec` + `welcomeBaseCurrency.spec` 17 passed; full gate 331 passing, zero new failures; eslint clean on touched files
- [x] Test count: +3 tests (2 dash tests + real-Welcome Continuar wiring) net of the realigned ones

**Tests**: unit (RNTL render + wiring; the spring interpolation itself is native-only — asserted via the wired translateX under the reanimated mock)
**Gate**: full

**Commit**: `feat(welcome): slide the active step dash between bullets`

---

### A3: Overview category totals conversion + screen wiring — ✅ Complete

**What**: Convert Overview's `calculateTotals` amounts (`amount_in_account_currency ?? amount`, from the account's currency, skip unsupported) so `curRevenues`/`curExpenses`, category `totalFormatted` and pie values are base-converted; pass `quotes` into `processTransactions` from `Home`, `Account`, `TransactionsByCategory`, `BudgetDetails`; pass `quotes` + `baseCurrencyCode` into `buildNetWorthEvolution` from `Accounts` and `Overview` (+ memo deps).
**Where**: `src/screens/Overview/index.tsx` (plus the six wiring screens)
**Depends on**: A1, A2
**Reuses**: A1/A2 util signatures; existing quotes destructuring on each screen
**Requirement**: BC-21 (category totals + pie), BC-22, BC-23, BC-24 (consumer side)

**Tools**: NONE

**Done when**:
- [x] Overview's category totals, Despesas/Receitas/Fluxo buttons and pie chart values sum converted amounts (both the denominator and category sums)
- [x] All six screens pass quotes (Accounts/Overview also the base code) into the reworked utils with memo deps updated
- [x] Full gate passes: 327 passing, zero new jest failures; `npx eslint` clean on the touched files
- [x] Wiring: `Overview/index.tsx:194-233` (calculateTotals conversion), `Overview/index.tsx:294-313` (buildNetWorthEvolution quotes+base), `Accounts/index.tsx:280-299`, `Home/index.tsx:308-315`, `Account/index.tsx:210-217`, `TransactionsByCategory/index.tsx:99-107`, `BudgetDetails/index.tsx:92-99`

**Tests**: none (env-blocked layer per matrix)
**Gate**: full

**Commit**: `feat(overview): convert category totals and wire quotes to the base currency flows`

---

### T1: Base currency domain helpers + store state + hydration — ✅ Complete

**What**: Create `src/utils/baseCurrency.ts` (DEFAULT_BASE_CURRENCY, SUPPORTED_BASE_CURRENCY_CODES, `isSupportedBaseCurrencyCode`, `filterBaseCurrencyCandidates`, `parseStoredBaseCurrency`); add `baseCurrency`/`setBaseCurrency` (MMKV write inside the action, key `config.baseCurrency`) to `useUserConfigs`; restore in `RootLayout` next to the `sortingOption` block.
**Where**: `src/utils/baseCurrency.ts` (plus `src/stores/userConfigsStorage.ts` and `src/app/_layout.tsx` per design)
**Depends on**: None
**Reuses**: `sortingOption` restore pattern (`src/app/_layout.tsx:149-160`); zustand store pattern (CONVENTIONS.md)
**Requirement**: BC-01, BC-02, BC-03, BC-04, BC-05 (helpers)

**Tools**: NONE

**Done when**:
- [x] `parseStoredBaseCurrency` returns the stored currency for valid/supported JSON, `DEFAULT_BASE_CURRENCY` (BRL, id 1) for missing/corrupt/shape-invalid/unsupported-code input
- [x] `setBaseCurrency` updates store state and writes JSON to `storageConfig` key `config.baseCurrency`
- [x] `RootLayout` restores the persisted value once at app start
- [x] Gate check passes: `CI=true npx jest --watchman=false src/utils/__tests__/baseCurrency.test.ts src/__tests__/stores/userConfigsStorage.test.ts`
- [x] Test count: 14 new tests pass (no silent deletions)

**Tests**: unit (new: `src/utils/__tests__/baseCurrency.test.ts`, `src/__tests__/stores/userConfigsStorage.test.ts`)
**Gate**: quick

**Commit**: `feat(base-currency): base currency state with MMKV persistence and restore`

---

### T2: WelcomeFlow step shell with bullet indicators + Welcome step refit — ✅ Complete

**What**: Create `src/screens/WelcomeFlow/` (steps array `WELCOME_STEPS`, `WelcomeStepProps { onNext?: () => void }`, `StepIndicator` with tappable active-state bullets, `Screen`+`Gradient` chrome, clamped `activeStep` state); refit `Welcome` to step content (drops its own `Screen`/`Gradient`, accepts `WelcomeStepProps`, content unchanged); point `(auth)/index.tsx` at `WelcomeFlow`. Plus a jest `moduleNameMapper` for `styled-components` → `styled-components/native` (mirrors Metro's `react-native` field so screen tests share one theme context).
**Where**: `src/screens/WelcomeFlow/index.tsx`
**Depends on**: None
**Reuses**: `Welcome` existing styles + handlers (unchanged content); `Screen`/`Gradient` components
**Requirement**: BC-08, BC-09, BC-10, BC-13 (shell mechanics)

**Tools**: NONE

**Done when**:
- [x] Injected-steps render shows one bullet per step, active bullet highlighted, bullet tap navigates, `onNext` advances and is absent on the last step
- [x] `WELCOME_STEPS` exported with the Welcome auth step as the terminal entry; adding a stub third step renders 3 bullets with no shell change (the extensibility test)
- [x] `Welcome` renders identically inside the shell (Login/Criar conta intact)
- [x] Gate check passes: `CI=true npx jest --watchman=false src/__tests__/screens/welcomeFlow.spec.tsx` + full-suite regression (jest config touched): 287 passing, zero new failures
- [x] Test count: 6 new tests pass (no silent deletions)

**Tests**: unit (new: `src/__tests__/screens/welcomeFlow.spec.tsx`, stub steps injected; no phosphor/bottom-sheet deps in the shell tree)
**Gate**: quick

**Commit**: `feat(welcome): step-based welcome flow with bullet indicators`

---

### T3: CurrencySelect items override + shared BaseCurrencySelectSheet — ✅ Complete

**What**: Add optional `items?: CurrencyProps[]` to `CurrencySelect` (default: store list, `RegisterAccount` untouched); create `src/components/BaseCurrencySelectSheet/` wiring `ModalViewSelection` + `CurrencySelect` to the base-currency store (`currency={baseCurrency}`, `setCurrency={setBaseCurrency}`, dismiss via ref, `items={filterBaseCurrencyCandidates(currencies)}`); extend jest `transformIgnorePatterns` (preset entries + `phosphor-react-native`) and `setupFiles` (gesture-handler `jestSetup.js`) so icon- and gesture-bearing trees render in tests.
**Where**: `src/components/BaseCurrencySelectSheet/index.tsx` (plus `src/screens/CurrencySelect/index.tsx` optional prop, `package.json` jest config)
**Depends on**: T1
**Reuses**: `RegisterAccount`'s `ModalViewSelection` + `CurrencySelect` modal pattern (`src/screens/RegisterAccount/index.tsx:553-563`); `ListItem` rows
**Requirement**: BC-05 (filter applied), BC-06 (shared selection flow)

**Tools**: NONE

**Done when**:
- [x] `CurrencySelect` renders `items` when provided, store list otherwise; tapping a row calls `setCurrency(item)` then `closeSelectCurrency()`
- [x] Sheet passes the filtered candidate list and the store setters (wiring verified in T4's render test)
- [x] Jest config change keeps the baseline suites passing (full gate: 291 passing, zero new failures)
- [x] Gate check passes: `CI=true npx jest --watchman=false src/__tests__/screens/currencySelect.spec.tsx` + full gate
- [x] Test count: 4 new tests pass; baseline tests stay green

**Tests**: unit (new: `src/__tests__/screens/currencySelect.spec.tsx`)
**Gate**: full (jest config touched)

**Commit**: `feat(base-currency): shared currency selection sheet`

---

### T4: WelcomeBaseCurrency education + selection step — ✅ Complete

**What**: Create `src/screens/WelcomeBaseCurrency/` (informative text about the default currency, `SelectButton` trigger showing current base currency via `CoinsIcon`, own `BottomSheetModal` ref hosting `BaseCurrencySelectSheet`, "Continuar" button calling `onNext`); register as the first `WELCOME_STEPS` entry. Plus jest infra (`jest.setup.js` + `jest/gestureButtonsMock.js`): children-friendly `RectButton` mock and inert `@gorhom/bottom-sheet` mock so native-bound trees render/complete in tests.
**Where**: `src/screens/WelcomeBaseCurrency/index.tsx`
**Depends on**: T2, T3
**Reuses**: T3 sheet; `SelectButton`; `RegisterAccount` ref/present pattern; `Button`
**Requirement**: BC-11, BC-12, BC-06 (wiring), BC-04 (default display)

**Tools**: NONE

**Done when**:
- [x] Step renders the informative message, current base currency name, and the selection trigger
- [x] Selecting a currency through the sheet wiring updates the store, persists to MMKV, calls dismiss, and the displayed current currency re-renders
- [x] "Continuar" advances the shell to the next step without requiring a selection
- [x] Gate check passes: `CI=true npx jest --watchman=false src/__tests__/screens/welcomeBaseCurrency.spec.tsx src/__tests__/screens/welcomeFlow.spec.tsx` (14 passed) + full gate: 299 passing, zero new failures, no hangs
- [x] Test count: 8 new tests pass (no silent deletions)

**Tests**: unit (new: `src/__tests__/screens/welcomeBaseCurrency.spec.tsx`; `ModalViewSelection` mocked to render children inline, `@database/database` mocked)
**Gate**: quick

**Commit**: `feat(welcome): base currency education and selection step`

---

### T5: OptionsMenu base currency entry — ✅ Complete

**What**: Add a "Moeda base" `SelectButton` to the Configurações section of `OptionsMenu` (`CoinsIcon`, `subTitle` = current base currency name) presenting a `BottomSheetModal` hosting the shared `BaseCurrencySelectSheet`.
**Where**: `src/screens/OptionsMenu/index.tsx`
**Depends on**: T3
**Reuses**: T3 sheet; existing `SelectButton` rows; `RegisterAccount` ref pattern
**Requirement**: BC-14, BC-15

**Tools**: NONE

**Done when**:
- [x] "Moeda base" row appears in Configurações and shows the current base currency name
- [x] Pressing it presents the shared sheet; selecting updates the base currency and dismisses (same store action as T4 - one flow, two entry points)
- [x] `npx eslint src/screens/OptionsMenu/index.tsx --ext .ts,.tsx` reports zero issues
- [x] Full gate passes: 299 passing, zero new jest failures vs baseline

**Tests**: none (env-blocked layer per matrix - clerk/onesignal-heavy tree; wiring recorded as file:line evidence in `validation.md`)
**Gate**: full

**Commit**: `feat(options): base currency entry in options menu`

---

### T6: Aggregation utils base-currency support with raw totals — ✅ Complete

**What**: Add `baseCurrencyCode: CurrencyCodes = 'BRL'` to `groupTransactionsByDate` (groups gain `rawTotal`; `total` formatted via `formatCurrency(baseCurrencyCode, rawTotal)`), `processTransactions` (sums `rawTotal`; result gains `currentCashFlowValue`; `currentCashFlow` formatted in base; drops the "R$"-string re-parse), `processAccountsForList` (conversion target + `totalAccountAmountConverted` formatted in base; `balanceConvertedToBRL` renamed `balanceConvertedToBase` — also in `sortAccountsByOption`), and `subscriptionPaymentsSummary` (`convertAmountToBRL` → `convertAmountToBase(amount, currencyCode, quotes, baseCurrencyCode)`; trailing param on `getUpcomingPaymentsSummary`/`computePaymentsTotal`).
**Where**: `src/utils/processTransactions.ts` (plus `groupTransactionsByDate.ts`, `processAccountsForList.ts`, `subscriptionPaymentsSummary.ts`, `sortAccountsByOption.ts`)
**Depends on**: T1
**Reuses**: existing `formatCurrency`/`convertCurrency`; existing test fixtures in the affected `__tests__` files
**Requirement**: BC-16 (utils side), BC-19, BC-20, BC-18 (secondary-line condition)

**Tools**: NONE

**Done when**:
- [x] Default-param call sites behave exactly as before (existing suites stay green unmodified except the mechanical `convertAmountToBRL`→`convertAmountToBase` import rename + `balanceConvertedToBRL`→`balanceConvertedToBase` field rename)
- [x] Base ≠ BRL: day totals + `currentCashFlow` formatted in the base code; `currentCashFlowValue` is the exact raw sum; `totalAccountAmountConverted` converts via the base target; subscription summaries total in base
- [x] Gate check passes: `CI=true npx jest --watchman=false src/utils/__tests__/` (161 passing + the pre-existing accountsFilter failure only) + full gate 311 passing, zero new failures
- [x] Test count: 13 new tests pass across the suites (no silent deletions)

**Tests**: unit (extend the four existing suites)
**Gate**: quick

**Commit**: `feat(base-currency): base currency support in aggregation utils`

---

### T7: Transaction screens display in base currency — ✅ Complete

**What**: Wire `Home`, `Account`, `TransactionsByCategory`, `BudgetDetails` to read `baseCurrency.code` from `useUserConfigs` and pass it to `processTransactions` (+ memo deps); `Home` loading fallback formats in base; `Account` derives `isCashFlowPositive` from `currentCashFlowValue` (drops its formatted-string re-parse) and formats its fallback in base.
**Where**: `src/screens/Home/index.tsx` (plus `Account`, `TransactionsByCategory`, `BudgetDetails`)
**Depends on**: T6
**Reuses**: T6 util params; existing screen memos
**Requirement**: BC-16 (transaction-family totals), BC-19 (sign detection consumer)

**Tools**: NONE

**Done when**:
- [x] All four screens pass the store's base code into `processTransactions` with memo deps including it
- [x] `Account` uses the raw value for sign; no formatted-currency string parsing remains in these screens
- [x] Full gate passes: 311 passing, zero new jest failures vs baseline; `npx eslint` clean on the four touched files
- [x] Wiring: `Home/index.tsx:286-315` (fallback + param + deps), `Account/index.tsx:191-231` (fallback + param + raw sign + deps), `TransactionsByCategory/index.tsx:93-101` (param + deps), `BudgetDetails/index.tsx:85-97` (param + deps)

**Tests**: none (env-blocked layer per matrix)
**Gate**: full

**Commit**: `feat(transactions): display totals in base currency`

---

### T8: Accounts, overview, goals and subscriptions totals in base currency — ✅ Complete

**What**: Wire `Accounts`, `InstitutionDetails`, `AccountsList`, `Overview`, `Goals`, `Subscriptions`, `SubscriptionPayments` to the base currency: inline `convertCurrency({ toCurrency: baseCurrency.code })`, `formatCurrency(baseCurrency.code, …)` for all app-wide aggregates, secondary converted lines shown when `account.currency.code !== baseCurrency.code`, `Goals` fast-path/convert in base, subscription summaries passed the base code (+ memo deps everywhere; `…ConvertedToBRL` → `…ConvertedToBase` in touched sites).
**Where**: `src/screens/Accounts/index.tsx` (plus `InstitutionDetails`, `AccountsList`, `Overview`, `Goals`, `Subscriptions`, `SubscriptionPayments`)
**Depends on**: T7
**Reuses**: T6 util params; existing conversion/format call sites
**Requirement**: BC-16, BC-17, BC-18 (consumer side), BC-07 (reactive re-render)

**Tools**: NONE

**Done when**:
- [x] No hardcoded `'BRL'` remains in any aggregate formatting/conversion path in the eight screens (entity-currency displays untouched)
- [x] Secondary converted lines appear only for accounts whose currency differs from base
- [x] Full gate passes: 311 passing, zero new jest failures vs baseline; `npx eslint` clean on the seven touched files
- [x] Wiring: `Accounts/index.tsx:141-316` (fallback/conversions/secondary line/institution + total formats/deps/sort key), `InstitutionDetails/index.tsx:145-252`, `AccountsList/index.tsx:73-90`, `Overview/index.tsx:158-351`, `Goals/index.tsx:89-118`, `Subscriptions/index.tsx:68-194`, `SubscriptionPayments/index.tsx:79-178`

**Tests**: none (env-blocked layer per matrix)
**Gate**: full

**Commit**: `feat(accounts): display balances and totals in base currency`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1 → Phase 2 → Phase 3 → Phase A (amendment)

Phase 1:
  T1 → T3 → T4
  T3 → T5
  T2 → T4
Phase 2:
  T6
Phase 3:
  T7 → T8
Phase A:
  A1 → A2 → A3

T1 → T6 (utils consume the domain helpers)
T6 → T7 (screens consume the utils params)
A1 depends on T6; A2 depends on A1; A3 depends on A1 + A2 (backward cross-phase deps)
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

8 tasks total fit a single task-budgeted batch - execution happens inline in the main window with no sub-agents spawned.

---

## Task Granularity Check

Before approving tasks, verify they are granular enough:

| Task | Scope | Status |
| --- | --- | --- |
| T1: domain utils + store + hydration | 1 concept (base currency state) across 3 tightly-coupled files | ✅ Granular (cohesive) |
| T2: WelcomeFlow shell + Welcome refit | 1 component (+ refit of the screen it hosts) | ✅ Granular |
| T3: CurrencySelect items + shared sheet | 1 shared component (+ optional prop on its child) | ✅ Granular |
| T4: WelcomeBaseCurrency step | 1 component | ✅ Granular |
| T5: OptionsMenu entry | 1 row + sheet wiring in 1 screen | ✅ Granular |
| T6: aggregation utils base support | 1 semantic unit (base-code param + raw totals) across 4 utils + their 4 test suites | ⚠️ Cohesive bundle (single deliverable: pipeline base support; defaults keep old behavior) |
| T7: transaction screens wiring | 4 screens, one mechanical wiring each (same param + deps) | ⚠️ Cohesive bundle (same deliverable repeated) |
| T8: accounts/overview/goals/subscriptions wiring | 7 screens, one mechanical wiring each | ⚠️ Cohesive bundle (fat but mechanical; split would push the feature past the single-batch threshold with no dependency seam) |

**Granularity check:**

- ✅ 1 component / 1 function / 1 endpoint = Good
- ⚠️ 2-3 related things in same file = OK if cohesive (T6/T7/T8 are same-deliverable mechanical bundles - flagged honestly)
- ❌ Multiple components or files = MUST split

---

## Diagram-Definition Cross-Check

For each task, check:

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | (no inbound arrows) | ✅ Match |
| T2 | None | (no inbound arrows) | ✅ Match |
| T3 | T1 | T1 → T3 | ✅ Match |
| T4 | T2, T3 | T3 → T4 and T2 → T4 | ✅ Match |
| T5 | T3 | T3 → T5 | ✅ Match |
| T6 | T1 | cross-phase (Phase 2 → Phase 1); parity check is intra-phase by design | ✅ Match |
| T7 | T6 | cross-phase (Phase 3 → Phase 2); parity check is intra-phase by design | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |

**Rules:**

- Every `Depends on` in a task body has a corresponding arrow in the diagram.
- Every arrow corresponds to a `Depends on` in the target task's body.
- No task depends on a task in a later phase.

---

## Test Co-location Validation

For each task, check: does the task create or modify a code layer that has a required test type in the coverage matrix? If yes, the task's `Tests` field MUST match.

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1: domain utils + store | pure utils + zustand store | unit | unit (2 new suites) | ✅ OK |
| T2: WelcomeFlow shell + refit | light UI component | unit (RNTL) | unit (new suite, stub steps) | ✅ OK |
| T3: CurrencySelect + sheet | light UI component | unit (RNTL) | unit (new suite) | ✅ OK |
| T4: WelcomeBaseCurrency step | light UI component | unit (RNTL) | unit (new suite + shell suite) | ✅ OK |
| T5: OptionsMenu entry | heavy-native screen | none (env-blocked) | none | ✅ OK (matrix documents the layer as none) |
| T6: aggregation utils | pure utils | unit | unit (4 extended suites) | ✅ OK |
| T7: transaction screens | heavy-native screens | none (env-blocked) | none | ✅ OK (matrix documents) |
| T8: accounts-family screens | heavy-native screens | none (env-blocked) | none | ✅ OK (matrix documents) |

**Rules:**

- "Tested in another task" is NOT a valid justification for `Tests: none` - T5/T7/T8 say none because the matrix defines those layers as none (env-blocked), with static wiring evidence + full-suite regression gate standing in.
- `Tests: none` is only valid when the coverage matrix says "none" for that layer. ✅ validated above.
- Any ❌ VIOLATION → restructure before proceeding. None found.
