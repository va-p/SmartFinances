# base-currency Validation

**Date**: 2026-10-05 (amended 2026-10-05 — BC-21..BC-25 converted transaction-flow totals; amended again 2026-10-05 — user's flow reorder (AD-004) + BC-26 dash slide)
**Spec**: `.specs/features/base-currency/spec.md`
**Diff range**: `3428aca..149e000` on `feat/change-base-currency` (9 commits: 9957b9d docs, 6ef7378 T1, 9325068 T2, 56d58d5 T3, 5c601ee T4, 05e4c01 T5, e07789f T6, dabeca6 T7, 149e000 T8)
**Amendment diff range**: `bca668d..77913ba` (5 commits: cb56306 A1, 7867e37 A2, 21721e8 A3, 77913ba coverage test, plus the docs commit)
**Amendment 2 diff range**: `ce0a333..cdeeeb9` (ce0a333 reorder + realigned tests, 93ad24f dash slide animation, cdeeeb9 faithful reanimated mock + navigate-mock rename; the user's b0d51bf Welcome-visuals fix sits between, out of feature scope)
**Verifier**: independent sub-agent for BC-01..BC-20 (author ≠ verifier). The amendment re-verification was started by the same sub-agent but it died mid-sensor on a model usage limit after completing the call-site inspection; per the skill's standalone fallback the orchestrator ran the remaining sensor + report (noted as a deviation from author ≠ verifier — the sensor mutations + evidence re-derivation below were re-run from scratch, and the AC evidence is evidence-or-zero, not inherited from the dead run).

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | Domain helpers + store state + hydration (`src/utils/baseCurrency.ts`, `src/stores/userConfigsStorage.ts`, `src/app/_layout.tsx:163-170`) |
| T2 | ✅ Done | WelcomeFlow shell + Welcome refit (`src/screens/WelcomeFlow/`, `(auth)/index.tsx`) |
| T3 | ✅ Done | CurrencySelect `items` override + shared `BaseCurrencySelectSheet` |
| T4 | ✅ Done | WelcomeBaseCurrency step + jest infra (`jest.setup.js`, `jest/gestureButtonsMock.js`) |
| T5 | ✅ Done | OptionsMenu "Moeda base" entry (static wiring, env-blocked layer) |
| T6 | ✅ Done | Aggregation utils base-currency support with raw totals |
| T7 | ✅ Done | Transaction-family screens wired (static wiring, env-blocked layer) |
| T8 | ✅ Done | Accounts/overview/goals/subscriptions wired (static wiring, env-blocked layer) |
| A1 | ✅ Done | `convertToBaseCurrency` helper + day-total/cash-flow conversion (`groupTransactionsByDate`, `processTransactions`) — cb56306 |
| A2 | ✅ Done | Net-worth evolution flow conversion (`buildNetWorthEvolution`) — 7867e37 |
| A3 | ✅ Done | Overview category totals conversion + quotes wiring on six screens — 21721e8 |
| A4 | ✅ Done | User's flow reorder (AD-004) + test realignment — ce0a333; active-step dash slide animation (BC-26) + reanimated jest mock — 93ad24f, cdeeeb9 |
| A5 | ✅ Done | Dash layout-anchor fix: the dash was absolutely positioned against the full-width padded container (landed top-left, above the bullets — device-found); anchored to a new shrink-wrapped `StepBulletsRow` + regression test |
| A6 | ✅ Done | Bullet-tap fix (device-found, first screen only): step content now renders inside a bounded slot (`StepContent`, `overflow: hidden`) so no step's content can paint over or steal taps from the indicator; indicator z-ordered above the slot; bullets gained `hitSlop` 12 (8px dots alone are far below a reliable tap target); includes the user's bullet-margin tweak (6px, stride 20) with the slide test now asserting the `active × stride` invariant |
| A7 | ✅ Done | `StepIndicator` extracted to `src/components/StepIndicator/` as a reusable component (testID-prefix prop keeps instance IDs unique; geometry constants moved with it; component contract suite added; shell keeps integration + bounded slot) |

---

## Spec-Anchored Acceptance Criteria

Heavy-native screens (`OptionsMenu`, `Home`, `Account`, `Accounts`, `InstitutionDetails`, `AccountsList`, `Overview`, `Goals`, `Subscriptions`, `SubscriptionPayments`, `TransactionsByCategory`, `BudgetDetails`, `RootLayout`) are env-blocked per the tasks.md Test Coverage Matrix; for those ACs the screen-wiring halves cite static diff evidence (`file:line` where the screen reads `baseCurrency` from the store and passes it to the util/conversion).

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| BC-01 store holds base currency, default BRL id 1 | `CurrencyProps` in `useUserConfigs`, default `{id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$'}` | `src/utils/__tests__/baseCurrency.test.ts:21-26` - `expect(DEFAULT_BASE_CURRENCY).toEqual({id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$'})`; `src/__tests__/stores/userConfigsStorage.test.ts:41-45` - `expect(...baseCurrency.id).toBe(1)`, `.code).toBe('BRL')`; impl `src/stores/userConfigsStorage.ts:37`, `src/utils/baseCurrency.ts:5-10` | ✅ PASS |
| BC-02 WHEN user selects THEN store updates + persists full JSON under `config.baseCurrency` | store update + `storageConfig.set('config.baseCurrency', JSON.stringify(currency))` | `src/__tests__/stores/userConfigsStorage.test.ts:52` - `expect(useUserConfigs.getState().baseCurrency).toEqual(usd)`; `:59-62` - `expect(storageConfig.set).toHaveBeenCalledWith(`${DATABASE_CONFIGS}.baseCurrency`, JSON.stringify(usd))` (key + payload conjunction); integration `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:135-139`; impl `src/stores/userConfigsStorage.ts:50-56` | ✅ PASS |
| BC-03 WHILE valid supported value in MMKV at start THEN restored into store | `parseStoredBaseCurrency` returns stored object as-is; `RootLayout` hydrates before first render | `src/utils/__tests__/baseCurrency.test.ts:58` - `expect(parseStoredBaseCurrency(stored)).toEqual(usd)`; static wiring (env-blocked layout tree): `src/app/_layout.tsx:165-170` - reads `storageConfig.getString(`${DATABASE_CONFIGS}.baseCurrency`)` then `useUserConfigs.setState({baseCurrency: parseStoredBaseCurrency(...)})`, placed with the `sortingOption` restore before theme/render | ✅ PASS |
| BC-04 IF persisted value missing/unparseable/unsupported THEN fall back to default BRL | `DEFAULT_BASE_CURRENCY` for missing, corrupt JSON, shape-invalid, unsupported code | `src/utils/__tests__/baseCurrency.test.ts:62-63` (undefined/''), `:68` ('not-json{'), `:73-80` (id:'1', missing fields, empty name), `:85-86` (`JSON.stringify(usdt)` → default) - all `toEqual(DEFAULT_BASE_CURRENCY)` | ✅ PASS |
| BC-05 selection list contains only codes in `CurrencyCodes` ('BRL','BTC','EUR','USD') | exactly those 4 codes as candidates | `src/utils/__tests__/baseCurrency.test.ts:31` - `expect(SUPPORTED_BASE_CURRENCY_CODES).toEqual(['BRL', 'BTC', 'EUR', 'USD'])`; `:47` - `expect(filterBaseCurrencyCandidates([brl, eth, usd, usdt, eur, btc])).toEqual([brl, usd, eur, btc])` (ETH/USDT dropped, order kept); `:51` - `toEqual([])` when none supported; UI `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:116-122` - offered BTC/EUR/USD, `queryByText('Ethereum')).toBeNull()`, `queryByText('Tether')).toBeNull()`; `src/__tests__/screens/currencySelect.spec.tsx:60-66` - `items` override renders only provided candidates | ✅ PASS |
| BC-06 WHEN picked in shared sheet THEN applied via same store action from both entry points + sheet dismissed | one write path (`setBaseCurrency`) for welcome step + OptionsMenu; select → set + persist + dismiss | `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:135-140` - store `toEqual(usd)` + `storageConfig.set` with exact key/payload + `dismissMock` called 1×; `:200-207` (sheet wiring block, same assertions); `src/__tests__/screens/currencySelect.spec.tsx:117-122` - `setCurrency).toHaveBeenCalledWith(usd)` then `closeSelectCurrency` with call-order check; idempotent reselect edge `src/__tests__/stores/userConfigsStorage.test.ts:70-75`; entry-point parity (OptionsMenu env-blocked): `src/screens/OptionsMenu/index.tsx:417` hosts the same `BaseCurrencySelectSheet` (`src/components/BaseCurrencySelectSheet/index.tsx:20-37` binds `setBaseCurrency` — the single write path) | ✅ PASS |
| BC-07 WHILE changed from OptionsMenu THEN aggregates re-render in new currency without reload | zustand reactivity re-renders; no app reload | `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:173-178` - `act(() => setBaseCurrency(eur))` → displayed currency re-renders (label count 1→2) without remount; static wiring: memo deps include `baseCurrency.code` — `src/screens/Accounts/index.tsx:298`, `Home/index.tsx:317`, `Overview/index.tsx:270`, `InstitutionDetails/index.tsx:245`, `TransactionsByCategory/index.tsx:104`, `BudgetDetails/index.tsx:100`, `SubscriptionPayments/index.tsx:83`, `Subscriptions/index.tsx:75`, `AccountsList/index.tsx:86`, `Goals/index.tsx:117` | ✅ PASS |
| BC-08 step shell driven by ordered steps array, last step is existing Welcome | steps array of `{key, Component}`; terminal entry = `Welcome` | `src/__tests__/screens/welcomeFlow.spec.tsx:125-127` - `WELCOME_STEPS[last].key).toBe('welcome')`, `.Component).toBe(Welcome)`; `:99` - last step receives no `onNext` (`'NO_NEXT'`); first entry `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:161-163` - `WELCOME_STEPS[0].Component).toBe(WelcomeBaseCurrency)`; impl `src/screens/WelcomeFlow/index.tsx:26-29`; `(auth)/index.tsx` re-exports `WelcomeFlow` | ✅ PASS |
| BC-09 one bullet per step, active highlighted | N bullets for N steps, active one highlighted | `src/__tests__/screens/welcomeFlow.spec.tsx:56-61` - bullet-0/bullet-1 present, bullet-2 null, `getBulletSelected(0)).toBe(true)`, `(1)).toBe(false)` (via `accessibilityState.selected`) | ✅ PASS |
| BC-10 (re-verified after device-found fault) WHEN a bullet is tapped THEN the flow navigates to that step | taps land on the bullets on EVERY screen, forward and backward | component contract: `src/__tests__/components/stepIndicator.spec.tsx:68` ('calls onSelect with the tapped index' - `onSelect).toHaveBeenCalledWith(2)`), `:83` ('gives every bullet an enlarged tap target' - `hitSlop).toEqual({top:12,...})` on every bullet); shell integration: `src/__tests__/screens/welcomeFlow.spec.tsx:88` ('navigates to a step when its bullet is tapped' - tap bullet 1 → step-two-marker + selected flip); device fault (screen 1 only): the first step's content column (tallest in the flow) centered with overflow spilled its transparent full-width children over the indicator row, swallowing taps — invisible in jest (no layout/hit-testing in the test renderer). Fix guards: bounded `StepContent` slot (`src/screens/WelcomeFlow/styles.ts:10-18`, `index.tsx:46-50`) + regression test 'renders the active step inside the bounded step slot' (`welcomeFlow.spec.tsx:148`) asserting the step renders inside the slot and the bullets row stays outside it; `zIndex/elevation` on the indicator container (`src/components/StepIndicator/styles.ts:16-17`); `hitSlop` 12 on every bullet (`src/components/StepIndicator/index.tsx:51`, effective ≥32px target; covers the inter-bullet margin dead zones); layout verified on device by the user | ✅ PASS (component contract + shell integration + structural guards; device-verified) |
| BC-11 WHEN "Continuar" tapped THEN advance without requiring selection | advance with zero selection side effects | `src/__tests__/screens/welcomeFlow.spec.tsx:85-88` - `onNext` press advances + bullet 1 selected; step-level `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:151-156` - Continuar → `onNext` called 1×, store still `brl`, `expect(storageConfig.set).not.toHaveBeenCalled()` | ✅ PASS |
| BC-12 currency step shows informative message, current base currency, shared sheet trigger | message + current currency name + trigger presenting shared sheet | `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:97-98` - `getByText(/definir uma moeda padrão/i)` + `getAllByText('Brazilian Real')`; `:107` - trigger press → `presentMock` called 1× | ✅ PASS |
| BC-13 WHEN step added to array THEN bullet + content render, no shell change | third step → 3 bullets + content, shell unchanged | `src/__tests__/screens/welcomeFlow.spec.tsx:115-120` - bullet-2 renders; tap → `step-three-marker` + bullet 2 selected (shell API unchanged — steps prop only) | ✅ PASS |
| BC-14 OptionsMenu offers "Moeda base" in Configurações showing current base currency | entry in Configurações section with current name as subTitle | static (env-blocked per matrix): `src/screens/OptionsMenu/index.tsx:341-347` - `<Title>Configurações</Title>` immediately followed by `SelectButton title='Moeda base' subTitle={baseCurrency.name}` | ✅ PASS (static wiring) |
| BC-15 WHEN entry tapped THEN shared CurrencySelect sheet presented with current marked active | shared `BaseCurrencySelectSheet`; current currency row active | static: `src/screens/OptionsMenu/index.tsx:341-347` `onPress → handleOpenSelectCurrencyModal` + `:417` `<BaseCurrencySelectSheet bottomSheetRef={currencyBottomSheetRef} />`; sheet binds `currency={baseCurrency}` (`src/components/BaseCurrencySelectSheet/index.tsx:33`); active-mark behavior tested `src/__tests__/screens/currencySelect.spec.tsx:96-98` - `getByTestId('currency-row-5-active')` present, `queryByTestId('currency-row-1-active')).toBeNull()` | ✅ PASS |
| BC-16 WHEN aggregate computed THEN converted to base + formatted with base code | day totals, cash flow, converted secondary lines, subscription totals in base code (format-in-base for sum aggregates; quote conversion where conversion exists — spec out-of-scope note keeps sum-mixing unchanged) | `src/utils/__tests__/groupTransactionsByDate.test.ts:41,49` - `'-R$\u00A050,00'` default / `'-US$\u00A050,00'` with `'USD'`; `src/utils/__tests__/processTransactions.test.ts:184-186` - `currentCashFlow` `'-US$\u00A050,00'` + day total in base; `src/utils/__tests__/processAccountsForList.test.ts:128-129` - EUR account → `balanceConvertedToBase` 125 + `'US$\u00A0125,00'`; `src/utils/__tests__/subscriptionPaymentsSummary.test.ts:90` - `convertAmountToBase(10,'USD',quotes,'EUR')).toBe(8)`, `:209` - summary `{total: 63.88}` in USD, `:272` - payments total 13.98 in USD; sort key `src/utils/__tests__/sortAccountsByOption.test.ts:37-39`; screen halves (env-blocked): `Home/index.tsx:289-310`, `Account/index.tsx:196-213`, `TransactionsByCategory/index.tsx:97-104`, `BudgetDetails/index.tsx:90-100`, `Accounts/index.tsx:140-298`, `InstitutionDetails/index.tsx:144-251`, `Overview/index.tsx:160-359`, `Goals/index.tsx:92-117`, `Subscriptions/index.tsx:71-75,193-196`, `SubscriptionPayments/index.tsx:81-84,173-180`; no hardcoded base remains: `grep "formatCurrency('BRL'\|toCurrency: 'BRL'" src/screens src/components src/hooks` → 0 matches (remaining `'BRL'` literals are entity-currency selection defaults in `RegisterAccount`/`RegisterTransaction`, out of scope per spec) | ✅ PASS |
| BC-17 per-entity amounts displayed in entity's own currency | account's own balance formatted in its own code | `src/utils/__tests__/processAccountsForList.test.ts:52` - BRL balance `'R$\u00A01.234,50'`; `:57` - USD account balance `'US$\u00A0100,00'` (own currency, not base); impl `src/utils/processAccountsForList.ts:61` - `formatCurrency(account.currency.code, rawBalance, false)`; entity-row formats untouched in the screen diffs | ✅ PASS |
| BC-18 WHEN secondary converted line shown THEN only for accounts whose currency differs from base, formatted in base | conditional secondary line in base code | `src/utils/__tests__/processAccountsForList.test.ts:77` - USD account (base BRL) → `'R$\u00A0500,00'`; `:82` - BRL account → `toBeUndefined()`; `:135-136` - USD account with base USD → undefined + `balanceConvertedToBase` 100; `:144-145` - BRL account with base EUR → converted line present; impl `src/utils/processAccountsForList.ts:34-38`; screens `src/screens/Accounts/index.tsx:186-192`, `InstitutionDetails/index.tsx:166-172` - `account.currency.code !== baseCurrency.code ?` | ✅ PASS |
| BC-19 processTransactions exposes raw current-cash-flow value; Account screen uses it for sign, no string re-parse | `currentCashFlowValue` = exact raw sum; `isCashFlowPositive` from raw value | `src/utils/__tests__/processTransactions.test.ts:185` - `currentCashFlowValue)).toBe(-50)`; `:202-203` - `toBe(-25.25)` exact cents + formatted `'-US$\u00A025,25'`; `src/utils/__tests__/groupTransactionsByDate.test.ts:64-65` - `rawTotal)).toBe(69.5)`; impl `src/utils/processTransactions.ts:216-228` (sums `rawTotal`, no parse); consumer (env-blocked): `src/screens/Account/index.tsx:215-217` - `const isCashFlowPositive = currentCashFlowValue >= 0;` — no formatted-string parsing in the screen | ✅ PASS |
| BC-20 IF currency pair unsupported by quotes matrix THEN aggregation skips item, no crash | skip + omit, never throw to caller | `src/utils/__tests__/processAccountsForList.test.ts:118-119` - GBP account → balance defined, converted line `toBeUndefined()`; `src/utils/__tests__/subscriptionPaymentsSummary.test.ts:94` - `convertAmountToBase` throws for GBP (matrix boundary); `:188` - summary skips GBP subscription (`{count: 1, total: 19.9}`); `:253` - payments total skips GBP (`toBe(0)`); impl `src/utils/processAccountsForList.ts:53-56`, `subscriptionPaymentsSummary.ts:76-78,112-114`; Goals screen static `src/screens/Goals/index.tsx:111-113` (catch → return sum) | ✅ PASS |

**Status**: ✅ All 20 ACs covered with evidence; asserted values match the spec-defined outcomes (BC-01 exact BRL id 1; BC-02 key + JSON payload conjunction; BC-04 all four fallback classes; BC-05 exact 4-code list; BC-09 per-step bullets with active highlight; BC-11 advance with zero side effects; BC-19 raw numeric assertion; BC-20 skip-not-crash).

### Spec-Anchored Acceptance Criteria — Amendment (BC-21..BC-25)

Same env-blocked convention: screen-wiring halves cite static diff evidence; every util-side assertion cites `file:line` + the asserted value.

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| BC-21 WHEN a day total / cash flow / chart-bar aggregate sums transaction amounts THEN each amount is converted to the base currency BEFORE summing | converted sums, not relabeled raw sums | `src/utils/__tests__/baseCurrency.test.ts:58-59` - `convertToBaseCurrency(-50,'BRL','USD',quotes)).toBe(-10)`, `(100)).toBe(20)`; `src/utils/__tests__/groupTransactionsByDate.test.ts:122` - +100/−30 BRL base USD → `rawTotal)).toBe(14)` + `total 'US$\u00A014,00'`; `:134` - mixed day: BRL 100 + USD 20 (×5) → `toBe(200)`; `src/utils/__tests__/processTransactions.test.ts:212-214` - `currentCashFlow '-US$\u00A010,00'` + `currentCashFlowValue).toBe(-10)`; `:264-265` - mixed: BRL 100 ×0.2 + USD 20 identity → `toBe(40)`; `:282-283` - chart bars `value 20`/`10`; `src/utils/__tests__/buildNetWorthEvolution.test.ts:115-117` - series `[180, 200]` for −10/+20 USD flows; screen halves (env-blocked): `Overview/index.tsx:194-233` (calculateTotals converts denominator + category sums via `convertToBaseCurrency`), `Accounts/index.tsx:280-299` + `Overview/index.tsx:294-313` (buildNetWorthEvolution quotes+base), `Home/index.tsx:308-315`, `Account/index.tsx:210-217`, `TransactionsByCategory/index.tsx:99-107`, `BudgetDetails/index.tsx:92-99` (processTransactions quotes) | ✅ PASS |
| BC-22 aggregation uses `amount_in_account_currency` when present, converted from the ACCOUNT's currency | account-currency value wins over the transaction-currency amount | `groupTransactionsByDate.test.ts:153` - amount 100/aic 50, account BRL → `rawTotal)).toBe(50)`; `processTransactions.test.ts:305-306` - same shape base USD → `currentCashFlowValue)).toBe(10)` + `'US$\u00A010,00'` (50 BRL ×0.2, not 100 USD); `buildNetWorthEvolution.test.ts:160-162` - aic 50 in the last week → intermediate `950` (`900` if `amount` used) | ✅ PASS |
| BC-23 IF account currency has no supported quote to base THEN skip that amount, no crash | skip from totals, rows still render, no exception | `baseCurrency.test.ts:64` - `convertToBaseCurrency(10,'ETH','USD',quotes)).toBeNull()`; `groupTransactionsByDate.test.ts:176-179` - ETH tx skipped: `rawTotal)).toBe(100)`, `data).toHaveLength(2)`; `processTransactions.test.ts:335-339` - ETH tx contributes nothing: `currentCashFlowValue -10`, `rawTotal -10`, chart expense 10, `data).toHaveLength(2)`; `buildNetWorthEvolution.test.ts:188` - ETH week skipped: series exactly `[{total: 1000}]` | ✅ PASS |
| BC-24 WHEN account currency equals base THEN pass through unchanged without touching quotes | identity path immune to unloaded (zero-price) quotes — default BRL behavior identical | `baseCurrency.test.ts:52-53` - `convertToBaseCurrency(19.9,'BRL','BRL',zeroQuotes)).toBe(19.9)`, `(-50.5,'USD','USD',zeroQuotes)).toBe(-50.5)`; `groupTransactionsByDate.test.ts:165` - BRL tx base BRL zeroQuotes → `rawTotal -50` + `'-R$\u00A050,00'`; `buildNetWorthEvolution.test.ts:134-136` - BRL flows base BRL zeroQuotes → `[900, 1000]`; impl short-circuit `src/utils/baseCurrency.ts:89-91` (`if (accountCurrency === baseCurrencyCode) return amount;`) | ✅ PASS |
| BC-25 net-worth evolution series converts period flows so intermediate points match the base-converted seed | every intermediate point consistent with the base-converted `totalAssets` | `buildNetWorthEvolution.test.ts:115-117` - −50/+100 BRL flows, `totalAssets 200` USD, base USD → exactly `[{total: 180}, {total: 200}]` (raw flows would give `[100, 200]`); no-account skip `:201` (`account: null` → `[]`); callers pass quotes+base: `Accounts/index.tsx:280-299`, `Overview/index.tsx:294-313` | ✅ PASS |

**Status**: ✅ All 5 amendment ACs covered with evidence; asserted values match spec-defined outcomes (exact converted numerics; identity-with-zero-quotes; skip-not-crash with rows preserved; series consistency).

### Spec-Anchored Acceptance Criteria — Amendment 2 (user reorder + BC-26 dash slide)

The user reordered the flow themselves (AD-004 supersedes AD-003): `[Welcome (intro, Continuar), WelcomeBaseCurrency (selection + auth CTAs)]`; BC-08/BC-11 were reworded and the realigned tests re-anchor them.

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| BC-08 (reworded) flow starts with the intro step, ends with the selection+auth step | `WELCOME_STEPS[0]` = welcome/`Welcome`, last = base-currency/`WelcomeBaseCurrency` | `src/__tests__/screens/welcomeFlow.spec.tsx` - `WELCOME_STEPS[0].key).toBe('welcome')` + `.Component).toBe(Welcome)` + last key 'base-currency'; `src/__tests__/screens/welcomeBaseCurrency.spec.tsx` - `WELCOME_STEPS[WELCOME_STEPS.length - 1].Component).toBe(WelcomeBaseCurrency)`; impl `src/screens/WelcomeFlow/index.tsx:26-29` | ✅ PASS |
| BC-11 (reworded) intro step Continuar advances without requiring selection | Continuar → `onNext`, zero selection side effects | `welcomeFlow.spec.tsx` ('advances from the real Welcome step Continuar through onNext' - `onNext).toHaveBeenCalledTimes(1)` with the real `Welcome` step); terminal auth CTAs: `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:160-165` ('navigates to sign in and sign up without requiring a selection' - `navigateMock()).toHaveBeenCalledWith('/signIn')` + `'/signUp'`, store still `brl`, `storageConfig.set).not.toHaveBeenCalled()`) | ✅ PASS |
| BC-26 WHEN the active step changes THEN the dash slides into the new active bullet's position | dash position = active × stride (stride = bullet 8 + 2×6 margin = 20; asserted against the shared `STEP_DASH_STRIDE` constant, robust to geometry tweaks) | component contract: `src/__tests__/components/stepIndicator.spec.tsx:117` ('positions the dash over the initial active step' - active 2 → `toBe(2 * STEP_DASH_STRIDE)`), `:130` ('slides the dash to the new active position' - active 0 → `toBe(0)`, then 1 → `toBe(STEP_DASH_STRIDE)`), `:104` (regression: 'anchors the dash inside the bullet row with the bullets'), `:56` ('prefixes its testIDs from the testID prop' - reusable instances keep unique IDs); shell integration: `src/__tests__/screens/welcomeFlow.spec.tsx:171` ('slides the flow dash to the tapped bullet position' - tap bullet 1 + rerender → `toBe(STEP_DASH_STRIDE)`, bullet 2 → `2 × stride`); impl `src/components/StepIndicator/index.tsx:29-73` (shared value + `withSpring` effect + `useAnimatedStyle` + testID prefix), geometry `src/components/StepIndicator/styles.ts:7-13` (`STEP_DASH_STRIDE`) | ✅ PASS (layout reference device-verified; component extracted for reuse in A7) |

**Status**: ✅ BC-26 covered with evidence; the spring interpolation itself is native-only (jest asserts the wired translateX under the documented reanimated mock — the mock's faithfulness is itself sensor-verified below).

---

## Discrimination Sensor

Scratch: temp git worktree at HEAD (`149e000`) under `$TMPDIR`, `node_modules` symlinked; real worktree never touched. Baseline `git status --porcelain` before sensor: ` M src/screens/RegisterTransaction/index.tsx` (user's concurrent edit) — identical after cleanup; `git worktree list` shows only the main worktree.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/utils/baseCurrency.ts:59` (scratch) | Dropped the support check — `parseStoredBaseCurrency` returns parsed object even when `code` is unsupported (`isSupportedBaseCurrencyCode(...)` → `typeof code === 'string'`) | ✅ Killed — `src/utils/__tests__/baseCurrency.test.ts:86` fails ('falls back to the default on an unsupported stored code', `toEqual(DEFAULT_BASE_CURRENCY)`); 1 failed / 13 passed in the M1 run |
| M2 | `src/utils/processTransactions.ts:216-219, 224-225` (scratch) | Reverted to the pre-feature chain — re-parse of the formatted `item.total` string (`replace(/[R$\s.]/g,'')…parseFloat`) instead of summing `rawTotal`, plus hardcoded `formatCurrency('BRL', …)` | ✅ Killed — `src/utils/__tests__/processTransactions.test.ts:184` (`currentCashFlow` expected `'-US$\u00A050,00'`) and `:202` (`currentCashFlowValue` expected `-25.25`, received `NaN`) both fail; 2 failed / 14 passed |
| M3 | `src/components/BaseCurrencySelectSheet/index.tsx:24` (scratch) | Dropped `filterBaseCurrencyCandidates` — raw store list passed as `items` | ✅ Killed — `src/__tests__/screens/welcomeBaseCurrency.spec.tsx:121` fails ('offers only the supported currencies in the sheet', `queryByText('Ethereum')).toBeNull()` receives a Text node); 1 failed / 11 passed |

**Sensor depth**: lightweight (3 behavior-level mutations, per tier table — not a P0 payment/auth/data-integrity path)
**Result**: 3/3 killed — PASS ✅

### Discrimination Sensor — Amendment (BC-21..BC-25)

Scratch: temp git worktree at HEAD (`77913ba`) under `$TMPDIR`, `node_modules` symlinked; real worktree never touched. Real-tree porcelain before and after the sensor: ` M src/screens/RegisterTransaction/index.tsx` only (the user's concurrent edit, out of scope) — identical after cleanup; `git worktree list` shows only the main worktree. A leftover scratch worktree from the dead Verifier sub-agent run was removed and pruned before this sensor.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| AM-M1 | `src/utils/baseCurrency.ts:89-105` (scratch) | `convertToBaseCurrency` returns `amount` unconditionally — no conversion, no null skip | ✅ Killed — 12 tests failed across `baseCurrency.test.ts` + `groupTransactionsByDate.test.ts` + `processTransactions.test.ts` (e.g. `baseCurrency.test.ts:58` `toBe(-10)` receives `-50`; `groupTransactionsByDate.test.ts:122` `toBe(14)` receives `70`)
| AM-M2 | `src/utils/groupTransactionsByDate.ts:46-60` (scratch) | `calculateGroupTotal` sums the raw `amountInAccountCurrency` — conversion skipped | ✅ Killed — 9 tests failed across `groupTransactionsByDate.test.ts` + `processTransactions.test.ts` (e.g. `groupTransactionsByDate.test.ts:110` `toBe(-10)` receives `-50`; day-total/cash-flow converted expectations all break)
| AM-M3 | `src/utils/processTransactions.ts` (chart loop) (scratch) | per-period cash-flow loop uses `new Decimal(item.amount)` instead of the converted value (chart bars raw) | ✅ Killed — exactly the conversion tests fail: `processTransactions.test.ts:282-283` chart bars `20/10` receive `100/50`, plus the ETH-skip chart assertion — 2 failed / 14 passed |
| AM-M4 | `src/utils/buildNetWorthEvolution.ts` (flow loop) (scratch) | period flows use raw `Math.abs(rawAmount)` — conversion skipped | ✅ Killed — exactly `buildNetWorthEvolution.test.ts:115-117` ('steps the series in converted values when base is USD', `[180, 200]` receives `[100, 200]`) + the ETH-skip series test fail — 2 failed / 6 passed |

**Sensor depth**: lightweight-plus (4 behavior-level mutations covering the 4 amended aggregation paths)
**Result**: 4/4 killed — PASS ✅

### Discrimination Sensor — Amendment 2 (BC-26 dash slide)

Scratch: temp git worktree at HEAD under `$TMPDIR`, `node_modules` symlinked; removed and pruned after; real-tree porcelain unchanged (user's `Welcome` visual edits committed by the user as `b0d51bf` — out of feature scope).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| AM-M5 | `src/screens/WelcomeFlow/index.tsx:58-61` (scratch) | Dropped the `useEffect` that drives `withSpring` — the dash never leaves its mount position | ⚠️ Initially **SURVIVED** — the minimal reanimated mock's `useSharedValue` re-initialized per render, so the test's rerender recomputed the translateX from the prop without the effect. Root cause: unfaithful mock, not a weak assertion. Fixed the mock to be stateful (same `{ value }` holder via `useRef`, initialized once — `jest.setup.js`), re-ran the mutant: ✅ **killed** by `welcomeFlow.spec.tsx:181` (`toBe(16)` receives `0`); real tree green afterwards. Recorded as lesson L-008 | ❌→✅ |

**Sensor depth**: 1 behavior-level mutation on the new animation path
**Result**: killed after mock faithfulness fix — PASS ✅ (the surviving-mutant finding is exactly what the sensor exists to catch; no production code was wrong, the test rig was)

---

## Interactive UAT Results

Not performed — user-facing UAT is the orchestrator's call; this Verifier run is automated-only (per-env-blocked screens rely on the full-suite regression gate + static wiring evidence above).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code / no scope creep | ✅ — diff touches only feature files, jest infra required by the new tests, and spec docs |
| Surgical changes / only touched files required | ✅ — `RegisterAccount` path untouched (default store list); `Welcome` content unchanged (chrome moved to shell) |
| No abstractions for single-use code | ✅ — `BaseCurrencySelectSheet` is used by two entry points (justified reuse, not speculative) |
| Matches existing patterns | ✅ — `sortingOption` restore precedent (`_layout.tsx:150-161`); `RegisterAccount`'s `ModalViewSelection` + `CurrencySelect` pattern; default-param convention on utils |
| Spec-anchored outcome check (asserted values match spec) | ✅ — see AC table; payload/conjunction rule below |
| Per-layer Coverage Expectation met | ✅ — domain utils 1:1 to ACs; light UI (RNTL) covers BC-05..BC-13; heavy-native layers covered by full-suite gate + static wiring per the tasks.md matrix |
| Every test maps to a spec requirement — no unclaimed tests | ✅ — each in-scope test carries an AC comment; baseline suites excluded per spec Out-of-Scope table |
| Documented guidelines followed: `.specs/codebase/CONVENTIONS.md` (sampled suites set the floor; no AGENTS.md/CI found) | ✅ |

**Payload/conjunction rule check** (persisted/emitted fields asserted on value, not merely "called"):

- `storageConfig.set` asserted WITH exact key + JSON payload: `userConfigsStorage.test.ts:59-62` (`'config.baseCurrency'` via `DATABASE_CONFIGS` mock + `JSON.stringify(usd)`); `welcomeBaseCurrency.spec.tsx:136-139` — ✅
- `currentCashFlowValue` / `rawTotal` asserted numerically on exact values incl. cents: `processTransactions.test.ts:185,202` (`-50`, `-25.25`), `groupTransactionsByDate.test.ts:64` (`69.5`) — ✅
- `balanceConvertedToBase` asserted numerically (`125`, `toBeCloseTo(197.52, 2)`): `processAccountsForList.test.ts:128,144` — ✅
- Subscription summary asserted as full object `{month, count, total}` on value: `subscriptionPaymentsSummary.test.ts:209,272` — ✅
- Active-state bullets asserted via `accessibilityState.selected` true/false: `welcomeFlow.spec.tsx:60-61` — ✅

---

## Edge Cases

- [x] Corrupt/truncated/unsupported persisted JSON → BRL default: handled — `baseCurrency.test.ts:67-87` (unparseable, wrong shape incl. missing/empty fields, unsupported code)
- [x] User reselects the already-active base currency → stays active, sheet dismisses, idempotent write: `userConfigsStorage.test.ts:66-76` + `currencySelect.spec.tsx:86-99` + dismiss asserted `welcomeBaseCurrency.spec.tsx:140` — ✅
- [x] Sign out → base currency persists (client-only, `config.*` namespace like `sortingOption`): structural — write path `userConfigsStorage.ts:50-56` never touches auth storage; no clear-on-signout of `config.baseCurrency` anywhere in the diff — ✅ (static)
- [x] Currencies query unresolved when sheet opens → empty list, no crash: domain half covered — `baseCurrency.test.ts:50-52` (`filterBaseCurrencyCandidates([eth, usdt]) → []`); `CurrencySelect` renders `data={currencies}` (empty FlatList is inert). ⚠️ Minor observation: no component-level render test with an empty/unresolved currencies store (the empty-data path is exercised only at the domain level where the risk lives). Non-blocking; does not affect any of the 20 AC verdicts.

---

## Gate Check

- **Gate command**: `env CI=true npx jest --watchman=false --silent` (repo root; `--watchman=false` required in this environment)
- **Result (after amendment)**: 328 passed, 0 new failures; exactly the 2 documented pre-existing failures unchanged:
  - `src/utils/__tests__/accountsFilter.test.ts` — 1 test fails on label text (`'Todas...'` vs `'Todas as Contas'`) — pre-existing, excluded per spec
  - `src/__tests__/screens/profile.spec.tsx` — suite fails to run (`NativeEventEmitter` env breakage via `react-native-device-info`) — pre-existing, excluded per spec
- **Test count before feature**: 267 passing (+ the same 2 pre-existing failures) — baseline from tasks.md/spec success criteria
- **Test count after original feature**: 311 passing (+44)
- **Test count after amendment**: 328 passing (+17: 11 in A1 suites, 5 in buildNetWorthEvolution, 1 added aic coverage test)
- **Test count after amendment 2**: 338 passing (component contract suite `stepIndicator.spec.tsx` +7 added in A7, 3 component-internal tests moved out of the flow spec into it; the flow spec keeps the shell integration: bullets-per-step, tap navigation, bounded slot, dash slide, extensibility, default steps, Continuar)
- **Skipped tests**: none
- Jest exit code is non-zero solely due to the two baseline failures; no feature-related failure exists.

---

## Fix Plans

None open. Two device-found faults, both fixed and closed in amendment 2:
1. The StepDash was absolutely positioned against the full-width padded `StepIndicatorContainer` (landed top-left of the screen, above the container padding where the bullets sit). Fix: shrink-wrapped `StepBulletsRow` anchors the dash to the bullet row; regression test pins the structural anchor.
2. Bullet taps failed on the first screen only: the first step's content column (tallest in the flow) centered with overflow spilled its transparent full-width children over the indicator row, swallowing taps. Fix: bounded `StepContent` slot (`overflow: hidden`) + `zIndex/elevation` on the indicator + `hitSlop` 12 tap targets on every bullet; regression tests pin the slot containment and the tap targets.
Root cause (both): jest cannot assert layout positioning or hit-testing — the wiring tests passed while the on-device layout/tap behavior was wrong; the structural assertions are the closest jest-level guards, and the layout itself was verified on device by the user. One coverage test was added during amendment verification (aic in the cash-flow loop, `77913ba`) to close a BC-22 evidence gap found while re-deriving coverage.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| BC-01..BC-20 | Implementing | ✅ Verified (evidence above; BC-14/BC-15 and screen-wiring halves verified via static evidence per the env-blocked matrix) |
| BC-21..BC-25 | Pending → Implementing | ✅ Verified (amendment evidence above; sensor 4/4 killed) |
| BC-08/BC-11 (reworded by AD-004) | Verified (old wording) | ✅ Re-verified against the user's reorder (amendment-2 evidence) |
| BC-26 | Pending → Implementing | ✅ Verified (dash slide wiring + geometry; sensor killed after mock fix) |

Note: `spec.md`'s status column was not edited by this Verifier (write scope limited to `validation.md`); the orchestrator applies the statuses.

---

## Summary

**Overall**: ✅ Ready (original feature + amendments)

**Spec-anchored check**: 26/26 ACs matched spec outcome (20 original + 5 amendment-1 + BC-26 amendment-2; BC-08/BC-11 re-anchored to the user's AD-004 reorder) | 0 spec-precision gaps
**Sensor**: 8/8 mutations killed (3 original + 4 amendment-1 + 1 amendment-2 — the last after fixing an unfaithful reanimated mock the sensor itself exposed)
**Gate**: 338 passed, 0 new failures (2 pre-existing failures unchanged)

**What works**:

- Single base-currency state with MMKV persistence (`config.baseCurrency`, full JSON) and BRL id 1 default; corrupt/unsupported fallback verified.
- One shared selection flow (`BaseCurrencySelectSheet`) serving both entry points; select → set + persist + dismiss with payload-on-value assertions.
- Welcome flow: step shell with per-step bullets, bullet-tap navigation, Continuar-without-selection, third-step extensibility, `Welcome` as terminal auth step.
- Aggregates format in the base currency across utils and all wired screens; no hardcoded `'BRL'` remains in aggregate formatting/conversion paths.
- **Amendment**: transaction-flow aggregations now CONVERT each amount to the base currency before summing — day totals (`SectionListHeader` `data.total` everywhere), Home/Account cash flow and current-cash-flow value, chart bars (Home cash-flow chart, Overview pies via converted category totals), and net-worth evolution intermediate points — using `amount_in_account_currency ?? amount` from the account's currency (`convertToBaseCurrency`), skipping unsupported pairs, and passing same-currency amounts through without touching quotes (default BRL behavior unchanged, including before quotes load).
- **Amendment 2**: the user reordered the flow (brand intro first, selection + auth last — AD-004) and the step indicator's active-step dash now slides between the uniform bullet positions with `withSpring` (reanimated), rendered as an absolutely-positioned 24px dash over the row; bullet-tap navigation and selected-state semantics unchanged.
- Raw numeric totals (`rawTotal`, `currentCashFlowValue`) replace formatted-string re-parsing; `Account` sign detection uses the raw value.
- Unsupported quote pairs skip instead of crashing (existing behavior preserved).

**Issues found**: none blocking. One minor observation (unchanged from the original run: empty-currencies-store render path asserted only at domain level — optional hardening).

**Verification provenance note**: the amendment's sensor + evidence re-derivation were run by the orchestrator via the standalone fallback (the Verifier sub-agent died mid-sensor on a model usage limit); all amendment evidence above was re-derived from scratch with evidence-or-zero, and the mutation kills were re-run, not inherited.
