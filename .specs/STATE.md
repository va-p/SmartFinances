# STATE

## Decisions

### AD-001
- **Decision**: Monthly budget periods are calendar-aligned in device local time: the first period runs from `start_date` to the end of that month; every later period runs from 00:00:00.000 on the 1st to 23:59:59.999 on the last day of the month.
- **Reason**: `getFirstPeriodEnd` already ends the first monthly period at `endOfMonth`; mixing that with an anniversary start (`addMonths(startDate, 1)`) opened a gap at every month boundary and dropped transactions created early on the 1st, so every monthly budget showed 0 spent after a month rollover. Calendar months match the product's period labels and user expectation.
- **Trade-off**: Anniversary-aligned contiguous periods were rejected: they would keep 1st-of-the-month transactions inside the previous period, leaving the reported defect unfixed. Non-monthly recurrences stay anniversary-aligned (already contiguous, no data loss).
- **Scope**: `src/utils/budgetCalculations.ts` period generation, `src/utils/buildBudgetHistory.ts` (consumes it), any future budget period logic.
- **Date**: 2026-10-02
- **Status**: active

### AD-002
- **Decision**: The app-wide base currency is a client-only preference: full `CurrencyProps` persisted as JSON in MMKV `config.baseCurrency`, restored once at root layout startup; no backend `User` field.
- **Reason**: The welcome flow selects the base currency pre-auth (no user exists); the project already has a client-only persisted preference precedent (`sortingOption`). Backend persistence would require a production-DB Prisma migration plus sign-in hydration overrides of the welcome-time choice.
- **Trade-off**: Multi-device users must pick per device until backend sync is layered on; the store stays the single UI source of truth so a backend field can be added without UI changes.
- **Scope**: `src/stores/userConfigsStorage.ts` (`setBaseCurrency` owns the MMKV write), `src/app/_layout.tsx` restore, any future persistence change.
- **Date**: 2026-10-05
- **Status**: active

### AD-003
- **Decision**: The welcome flow is a single-route step shell at `(auth)/index`: an ordered `WELCOME_STEPS` array with tappable bullet indicators, education steps first, the existing `Welcome` (auth CTAs) as the terminal step; steps receive `{ onNext?: () => void }` and own no chrome (`Screen`/`Gradient` belong to the shell).
- **Reason**: The flow must terminate in auth (Login/Criar conta live on `Welcome`); onboarding education preceding auth is the common mobile practice the task cites. A single route keeps bullets and step state in one place; adding a screen is one array entry.
- **Trade-off**: Route-per-step (deeper links per step) was rejected: bullets would need cross-route sync and each new screen adds router boilerplate for no current benefit at 2 steps.
- **Scope**: `src/screens/WelcomeFlow/`, `src/screens/Welcome/` (step refit), `src/screens/WelcomeBaseCurrency/`, future welcome steps.
- **Date**: 2026-10-05
- **Status**: superseded by AD-004 (user reordered the flow: brand intro first, selection + auth last)

### AD-004
- **Decision**: The welcome flow order is `[Welcome (brand/intro step, Continuar), WelcomeBaseCurrency (selection + auth CTAs: Login / Criar conta)]`: brand/value intro first, base-currency selection with the auth actions as the terminal step.
- **Reason**: The user reordered the flow themselves for a more cohesive onboarding; the auth actions moved from the intro screen to the terminal selection step.
- **Trade-off**: Supersedes AD-003's education-first order. The intro step advances via the shell's `onNext`; the terminal step owns the auth CTAs and navigates via the router. Future educational screens are still new array entries between the intro and the terminal step.
- **Scope**: `src/screens/WelcomeFlow/` (`WELCOME_STEPS` order), `src/screens/Welcome/` (intro step), `src/screens/WelcomeBaseCurrency/` (terminal step).
- **Date**: 2026-10-05
- **Status**: active

## Handoff

- **Feature**: base-currency (`.specs/features/base-currency/`) — ✅ complete incl. amendments (converted transaction-flow totals BC-21..25; user's flow reorder AD-004 + dash slide BC-26); Verifier PASS (`validation.md`, `validate_state.py` exit 0)
- **Phase / Task**: All 8 tasks + A1-A7 complete (A7: `StepIndicator` extracted to `src/components/StepIndicator/` as a reusable component); spec traceability BC-01..BC-26 Verified
- **Completed**: base currency state + MMKV persistence + restore (default BRL id 1); welcome flow shell with bullet indicators + sliding active-step dash (reusable `@components/StepIndicator`, `withSpring`, stride 20) + educational/terminal selection step; shared `BaseCurrencySelectSheet`; OptionsMenu "Moeda base"; all app-wide aggregates formatted in the base currency; transaction-flow aggregations convert per amount to the base before summing (day totals, cash flow, chart bars, category totals, net-worth intermediate points)
- **In-progress**: none
- **Next step**: optional — backend persistence of the base currency (Prisma migration + explicit go-ahead per AD-002); device smoke test of the dash slide + sheet present/dismiss (native-only runtime); `origin` is behind — local commits not pushed
- **Blockers**: none
- **Uncommitted files**: none (user's Welcome visual fixes committed by the user as `b0d51bf`)
- **Branch**: `feat/change-base-currency` (local ahead of origin; last feature commits: `ce0a333`, `93ad24f`, `cdeeeb9`)
- **Lessons (candidates)**: L-010 — centered overflowing content columns spill transparent children over sibling UI and swallow taps; bound slots + zIndex + hitSlop, verify on device; L-009 — absolute overlays anchor to shrink-wrapped rows; L-008 — jest mocks of animation libraries must be behaviorally faithful
- **Test-infra notes**: jest runs with `setupFiles` (gesture-handler jestSetup + `jest.setup.js` incl. minimal stateful reanimated mock), `transformIgnorePatterns` + `phosphor-react-native`, and a `styled-components` → `styled-components/native` moduleNameMapper; full gate = 338 passing + 2 pre-existing failures (`accountsFilter.test.ts` label text; `profile.spec.tsx` env-broken). Watchman is broken in this environment — always run jest with `--watchman=false`.
