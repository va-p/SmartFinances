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

### AD-005
- **Decision**: Upgrade Play Billing Library to v9 by bumping `react-native-purchases` to `^10.14.0` (RevenueCat) and setting Android `compileSdk` to 35.
- **Reason**: Google Play requires PBL v8+ by Aug 2026. PBL v9 is the latest major release. Since the app uses RevenueCat to wrap Play Billing, the upgrade is achieved by updating the wrapper and satisfying its underlying native SDK requirements.
- **Trade-off**: Native billing APIs are not accessed directly; we rely on RevenueCat to bridge PBL v9 features and lifecycle.
- **Scope**: `package.json`, `android/app/build.gradle`, `src/providers/RevenueCatProvider.tsx`.
- **Date**: 2026-10-18
- **Status**: active

## Handoff

- **Feature**: home-widgets (`.specs/features/home-widgets/`) — code-complete, Verifier CODE-PASS + UAT-PENDING (`validation.md` verdict FAIL by design: UAT-1..UAT-11 need real hardware; `validate_state.py` stays red until device QA passes)
- **Phase / Task**: All 12 tasks + 3 fix iterations committed on `feat/widgets` (latest `773e8db`); spec WDG-01..WDG-41 mapped (JS-asserted rows implemented, native-render rows UAT-pending). Previous features subscription-designation + base-currency complete (see git history)
- **Completed**: 5 widget families (Budgets, Cash Flow, Overview Small A/B, Control Panel M/L, Patrimony) on iOS WidgetKit (swiftc-typechecked) + Android RemoteViews (9 providers, bitmap charts); JS snapshot bridge (`src/widgets/`, `modules/widget-bridge/`, `plugins/withHomeWidgets/`), root-layout wiring, deep-link contract + `(app)/transactions/new.tsx` route; 26 widget unit tests, full gate 449 pass / 0 new failures, sensor 5/5 killed across both iterations
- **In-progress**: nothing code-side — device QA matrix (T12 in tasks.md) + EAS/store release (release notes in tasks.md T12)
- **Next step**: user runs device QA on iOS 17+ + Android (needs online `yarn install`, `expo prebuild`, App Group provisioning, EAS build — prerequisites in T12 release notes); on UAT pass, check off ROADMAP `Widgets` item and flip validation verdict to PASS
- **Blockers**: sandbox limits (no network for EAS/pods, Gradle env-blocked under Node 24, no simulator run) — all recorded, none code-related
- **Uncommitted files**: none (worktree clean except ignored build outputs)
- **Branch**: `feat/widgets` (local only; 19 commits ahead — push needs explicit go-ahead; DO NOT push without asking)
- **Lessons (candidates, new)**: L-016 — mask-value assertions must use literals, never the imported constant (tautological); L-017 — pin widget chart contract (donut window, bar buckets, percent decimals) in spec
- **Test-infra notes**: jest `--watchman=false` (Watchman broken); full gate 449 pass + 1 pre-existing env-broken suite (`profile.spec.tsx`); `yarn lint` baseline-red repo-wide — scope to touched files; `yarn install --offline` cannot relink `widget-bridge` file-dep (needs one online install); `node_modules/widget-bridge` is a local symlink (gitignored, same as real install)
