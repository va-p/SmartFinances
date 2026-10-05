# Base Currency — Selection Flow and App-Wide Formatting Specification

## Problem Statement

Every app-wide balance (net worth, institution totals, cash flow, category totals, goals total saved, subscription payments totals) is hardcoded to BRL: totals are converted with `toCurrency: 'BRL'` and formatted with `formatCurrency('BRL', …)`. A user whose financial life is in USD or EUR sees synthetic BRL numbers everywhere. There is also no way to pick a display currency: the `CurrencySelect` screen exists but is only used for per-account currency selection inside `RegisterAccount`.

## Goals

- [ ] Users can select an app-wide base currency; balances across the app display in it.
- [ ] Brazilian Real (currency id 1) is the default with zero user action.
- [ ] First-access users learn they can set a default currency and can select it inside the welcome flow.
- [ ] Signed-in users can change the base currency from `OptionsMenu`.
- [ ] The welcome flow is a step-based, extensible onboarding shell (bullet indicators) ready for future educational screens.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Backend persistence of the base currency (`User.base_currency_id`) | Selection happens pre-auth in the welcome flow, where no user exists; the project already has a client-only persisted preference precedent (`sortingOption`, "client-only, not from backend" comment in `src/app/_layout.tsx`). A backend change also requires a Prisma migration on production data — needs an explicit go-ahead, not bundled here. |
| Per-entity currency displays (account's own balance row, budget, goal, subscription, transaction rows) | Those values belong to their entity's currency; only app-wide aggregates are base-currency formatted (see BC-17). |
| Currency-mixing arithmetic fixes (net-worth series and day totals sum amounts across account currencies before this feature) | Pre-existing approximation: sums mix account currencies and label the result in the display currency. This feature changes the display currency only; fixing the mixing is a separate data-correctness feature. |
| Entity register forms' currency pickers (account/budget/goal/subscription) | They select the entity's own currency — unrelated to base currency. |
| Fixing the pre-existing failing tests (`accountsFilter.test.ts` label text, `profile.spec.tsx` env breakage) | Unrelated to this feature; baseline failures documented in `validation.md`. |
| App reload on base-currency change | Not needed: zustand reactivity re-renders totals (unlike `darkMode`, which reloads for native chrome). |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Where the base currency persists | Client-only: MMKV key `config.baseCurrency` (full `CurrencyProps` as JSON), restored at app start; no backend field | Welcome flow selects pre-auth; `sortingOption` precedent; backend persistence requires a production-DB migration (explicit go-ahead needed). Can be layered on later without UI changes. | n |
| Welcome flow step order | `[BaseCurrency education step, Welcome (auth) step]` — education first, auth last | The flow must terminate in auth: `Welcome` owns the Login/Criar conta actions. Onboarding education preceding auth is the "common practice in mobile apps" the task cites. `Welcome` content itself stays unchanged. | n |
| Which currencies are base-currency candidates | Only codes in `CurrencyCodes` ('BRL', 'BTC', 'EUR', 'USD') | `formatCurrency` and the quotes matrix (`convertCurrency`) only support these 4; the seeded list also contains ETH/USDC/USDT, which would throw on conversion and fail typing. | n |
| How the selection UI is presented | Shared bottom-sheet flow: `ModalViewSelection` + existing `CurrencySelect` component (the `RegisterAccount` pattern), reused by the welcome step and `OptionsMenu` | Task mandates the `CurrencySelect` screen as the selection UI; the bottom-sheet pattern is the app's established way of hosting it. | n |
| How util pipelines receive the base currency | Explicit `baseCurrencyCode: CurrencyCodes = 'BRL'` parameter on shared utils; `formatCurrency` stays pure (code passed in) | Codebase convention: utils are pure, stores are injected at call sites. Defaults keep existing call sites/tests valid during transition; screens pass the store value explicitly. | n |
| Old BRL-string re-parsing in totals | Replaced with raw numeric totals (`rawTotal` on grouped days, `currentCashFlowValue` on `processTransactions`) | `processTransactions` re-parses "R$ 1.234,56" strings (drops cents; yields NaN/1.234 for "US$ …"). Changing the display currency makes this parse chain wrong — root-cause fix required for BC-16. | n |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Select and persist the base currency ⭐ MVP

**User Story**: As a user, I want my app-wide balances displayed in a currency I choose (default BRL) so that totals are meaningful to me.

**Why P1**: Without selection + persistence there is no feature — everything else reads this state.

**Acceptance Criteria** (each line is one EARS pattern):

1. The system SHALL hold a single base currency as a `CurrencyProps` value in the `useUserConfigs` store, defaulting to Brazilian Real with id 1, code 'BRL'. (BC-01) <!-- ubiquitous -->
2. WHEN the user selects a base currency THEN the store SHALL update `baseCurrency` and persist the full currency object as JSON under MMKV key `config.baseCurrency`. (BC-02) <!-- event-driven -->
3. WHILE a valid, supported `config.baseCurrency` value exists in MMKV at app start THEN the app SHALL restore it into the store before the first render of `(app)`. (BC-03) <!-- state-driven -->
4. IF the persisted `config.baseCurrency` value is missing, unparseable, or its `code` is not in `CurrencyCodes` THEN the app SHALL fall back to the default BRL currency. (BC-04) <!-- unwanted-behavior -->
5. The base currency selection list SHALL contain only currencies whose `code` is in `CurrencyCodes` ('BRL', 'BTC', 'EUR', 'USD'). (BC-05) <!-- ubiquitous -->
6. WHEN the user picks a currency in the shared selection sheet THEN the app SHALL apply it through the same store action from both entry points (welcome step and `OptionsMenu`) and dismiss the sheet. (BC-06) <!-- event-driven -->
7. WHILE the base currency is changed from `OptionsMenu` THEN every app-wide aggregate on screen SHALL re-render in the new currency without an app reload. (BC-07) <!-- state-driven -->

**Independent Test**: Set base currency to USD in `OptionsMenu`; kill and reopen the app — totals still display in USD (persistence). Set it back to BRL — no reload needed, totals re-render as R$.

---

### P1: Welcome flow with educational currency step and step indicators ⭐ MVP

**User Story**: As a first-access user, I want an onboarding flow that tells me I can set a default currency and lets me pick it right there, with bullet indicators showing where I am, so I understand the app before signing in.

**Why P1**: The task's core ask: educate + select within the welcome flow, extensible for future educational screens.

**Acceptance Criteria** (each line is one EARS pattern):

1. The welcome flow SHALL be a step shell driven by an ordered steps array, where each entry renders a step component and the last step is the existing `Welcome` screen content. (BC-08) <!-- ubiquitous -->
2. The welcome flow SHALL render one bullet indicator per step, highlighting the active step's bullet. (BC-09) <!-- ubiquitous -->
3. WHEN the user taps a bullet THEN the flow SHALL navigate to that step. (BC-10) <!-- event-driven -->
4. WHEN the user taps "Continuar" on the currency step THEN the flow SHALL advance to the next step without requiring a currency selection. (BC-11) <!-- event-driven -->
5. The currency step SHALL display an informative message that a default currency can be set, the currently selected base currency, and the shared selection sheet trigger. (BC-12) <!-- ubiquitous -->
6. WHEN a step is added to the steps array THEN the flow SHALL render its bullet and step content with no shell changes. (BC-13) <!-- event-driven -->

**Independent Test**: Fresh install → `(auth)` shows the currency education step with 2 bullets (first active), default BRL checked; select USD, tap Continuar → `Welcome` screen (second bullet active) with Login/Criar conta untouched.

---

### P1: Change the base currency from OptionsMenu ⭐ MVP

**User Story**: As a signed-in user, I want a "Moeda base" entry in `OptionsMenu` so I can change the display currency at any time.

**Why P1**: `OptionsMenu` is the mandated entry point for changing the currency after onboarding.

**Acceptance Criteria** (each line is one EARS pattern):

1. The `OptionsMenu` SHALL offer a "Moeda base" entry in the Configurações section that shows the current base currency. (BC-14) <!-- ubiquitous -->
2. WHEN the user taps the "Moeda base" entry THEN the app SHALL present the shared `CurrencySelect` bottom sheet with the current base currency marked active. (BC-15) <!-- event-driven -->

**Independent Test**: Open Mais → Configurações → "Moeda base" shows "Brazilian Real"; tap → sheet opens with BRL checked; pick US Dollar → entry shows "US Dollar" and Accounts totals re-render as US$.

---

### P1: App-wide totals in the base currency ⭐ MVP

**User Story**: As a user, I want every app-wide aggregate (net worth, institution totals, converted secondary lines, cash flow, category totals, goals total saved, subscriptions totals) displayed in my base currency so the numbers are consistent.

**Why P1**: The visible outcome of the whole feature — formatting must match the selected base currency everywhere.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN an app-wide aggregate is computed THEN the system SHALL convert it to the base currency and format it with the base currency code. (BC-16) <!-- event-driven -->
2. The system SHALL display per-entity amounts (account's own balance, budget, goal, subscription and transaction rows) in the entity's own currency. (BC-17) <!-- ubiquitous -->
3. WHEN a secondary converted line is shown next to an account balance THEN the system SHALL show it for accounts whose currency differs from the base currency, formatted in the base currency. (BC-18) <!-- event-driven -->
4. The `processTransactions` pipeline SHALL expose the raw numeric current-cash-flow value, and the `Account` screen SHALL use that raw value for sign detection instead of re-parsing formatted currency strings. (BC-19) <!-- ubiquitous -->
5. IF a currency pair is unsupported by the quotes matrix THEN the aggregation SHALL skip that item rather than crash (existing behavior preserved). (BC-20) <!-- unwanted-behavior -->

**Independent Test**: With base USD: Accounts header shows "US$ …" net worth, a BRL account row shows its own "R$ …" balance plus a "US$ …" secondary line; Overview/Home/Goals/Subscriptions totals all show "US$ …"; set base back to BRL — everything returns to "R$ …".

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF the persisted `config.baseCurrency` JSON is corrupt, truncated, or holds an unsupported code (e.g. 'USDT') THEN the app SHALL fall back to the default BRL currency. (BC-04)
- IF the currencies query has not resolved yet when the sheet opens THEN the sheet SHALL render an empty list without crashing (selection becomes available once the store fills — the public `GET /currency` query runs at root layout, including pre-auth). (BC-05/BC-06)
- IF the user reselects the already-active base currency THEN the app SHALL keep it active and dismiss the sheet (idempotent store write). (BC-06)
- WHEN the user signs out THEN the base currency SHALL persist (client-only preference, like `sortingOption`). (BC-03)

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| BC-01 | P1: Select and persist the base currency | Design | Verified |
| BC-02 | P1: Select and persist the base currency | Design | Verified |
| BC-03 | P1: Select and persist the base currency | Design | Verified |
| BC-04 | P1: Select and persist the base currency | Design | Verified |
| BC-05 | P1: Select and persist the base currency | Design | Verified |
| BC-06 | P1: Select and persist the base currency | Design | Verified |
| BC-07 | P1: Select and persist the base currency | Design | Verified |
| BC-08 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-09 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-10 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-11 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-12 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-13 | P1: Welcome flow with educational currency step | Design | Verified |
| BC-14 | P1: Change the base currency from OptionsMenu | Design | Verified |
| BC-15 | P1: Change the base currency from OptionsMenu | Design | Verified |
| BC-16 | P1: App-wide totals in the base currency | Design | Verified |
| BC-17 | P1: App-wide totals in the base currency | Design | Verified |
| BC-18 | P1: App-wide totals in the base currency | Design | Verified |
| BC-19 | P1: App-wide totals in the base currency | Design | Verified |
| BC-20 | P1: App-wide totals in the base currency | Design | Verified |

**ID format**: `BC-NN` (Base Currency).

**Status values**: Pending → In Design → In Tasks → Implementing → Verified

**Coverage**: 20 total, 20 mapped to tasks, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Fresh install shows the welcome flow: currency education step (bullet 1 active) → Welcome auth step, default base BRL (id 1).
- [ ] Selecting USD in the welcome flow, then signing in, shows every app-wide total as "US$ …" with one shared selection flow for both entry points.
- [ ] Changing the base currency in `OptionsMenu` re-renders all visible totals without an app reload; the choice survives an app restart.
- [ ] New/updated jest suites pass; the 267 baseline-passing tests stay green (two documented pre-existing failures excluded).
- [ ] Adding a hypothetical third welcome step requires only a new step component + one array entry (verified by test BC-13).
