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

- **Feature**: base-currency (`.specs/features/base-currency/`) — ✅ complete incl. the converted transaction-flow totals amendment (BC-21..BC-25); Verifier PASS (`validation.md`, `validate_state.py` exit 0)
- **Phase / Task**: All 8 tasks + amendment tasks A1-A3 complete (A1 `cb56306`, A2 `7867e37`, A3 `21721e8`, coverage test `77913ba`); spec traceability BC-01..BC-25 Verified
- **Completed**: base currency state + MMKV persistence + restore (`config.baseCurrency`, default BRL id 1); welcome flow shell with tappable bullet indicators + educational base-currency step (`WELCOME_STEPS`: base-currency → welcome/auth); shared `BaseCurrencySelectSheet` selection flow; OptionsMenu "Moeda base" entry; all app-wide aggregates formatted in the base currency; **amendment**: transaction-flow aggregations CONVERT each amount to the base before summing — day totals (every `SectionListHeader` `data.total`), Home/Account cash flow + chart bars, Overview category totals/pies, net-worth evolution intermediate points (`convertToBaseCurrency`, `amount_in_account_currency ?? amount` from the account's currency, skip unsupported pairs, identity without quotes when account = base)
- **In-progress**: none
- **Next step**: optional — backend persistence of the base currency (needs a Prisma migration + explicit go-ahead per AD-002); UI smoke test on device (sheet present/dismiss is @gorhom-native, covered only by wiring tests in jest); `origin/feat/change-base-currency` is at `bca668d` — the 5 amendment commits are local-only and unpushed
- **Blockers**: none
- **Uncommitted files**: user's concurrent edits in `src/screens/RegisterTransaction/index.tsx` (exchange-rate UI, unrelated — left untouched); base-currency artifacts are all committed
- **Branch**: `feat/change-base-currency` (original: 10 commits through `bca668d`; amendment: `cb56306`, `7867e37`, `21721e8`, `77913ba` + docs — local only)
- **Verifier note**: the amendment re-verify started in the same independent Verifier sub-agent, which died mid-sensor on a model usage limit; the sensor + evidence re-derivation were completed by the orchestrator via the standalone fallback (documented in `validation.md`)
- **Test-infra notes**: jest now runs with `setupFiles` (gesture-handler jestSetup + `jest.setup.js`), `transformIgnorePatterns` + `phosphor-react-native`, and a `styled-components` → `styled-components/native` moduleNameMapper; full gate = 328 passing + 2 pre-existing failures (`accountsFilter.test.ts` label text; `profile.spec.tsx` env-broken). Watchman is broken in this environment — always run jest with `--watchman=false`.
