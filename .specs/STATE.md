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

- **Feature**: subscription-designation (`.specs/features/subscription-designation/`) — ✅ complete; Verifier PASS (`validation.md`, `validate_state.py` exit 0, 26/26 ACs, sensor 3/3 killed)
- **Phase / Task**: All 5 tasks complete (T1 `d1b14f4`, T2 `5788efd`, T3 `ed61c85`, T4 `8b3416c`, T5 `e853f1c`); spec traceability SD-01..SD-26 ✅ Verified. Previous feature base-currency also complete (see git history)
- **Completed**: Subscriptions "+" routes through an "Adicionar assinatura" choice modal (create new vs. select existing); `TransactionSelect` picker (credit/debit, not yet `is_subscription`, stacked over the choice sheet); picking opens `RegisterTransaction` in edit mode with the advanced-selectors accordion pre-expanded; reusable `Accordion` component (——— v ———, chevron rotates 180°, fade mount/unmount); "Assinatura" `ButtonToggle` inside it with coupling rules in `src/utils/subscriptionDesignation.ts` (designation forces recurring + MONTHLY/YEARLY, DAILY/WEEKLY normalize to MONTHLY; un-recurring or non-qualifying save un-designates); `is_subscription` payload wiring (true when on; omitted on create-when-off so backend auto-classification stands; explicit toggle value on edit; transfers excluded); `TransactionProps` gained `is_subscription`/`hide_from_subscription_list`
- **In-progress**: user's separate PBL v9 upgrade work (feature `.specs/features/upgrade-pbl-v9/`) — its uncommitted android/ios files + untracked `validation.md` are in the worktree, untouched by this feature
- **Next step**: optional — interactive UAT on device (choice modal chaining, chevron rotation, designate a synced DEBIT transaction end-to-end); `origin/feat/subscription-management-improvements` is behind — local commits not pushed (push needs explicit go-ahead)
- **Blockers**: none
- **Uncommitted files**: user's only — `android/app/build.gradle`, `ios/Podfile.lock`, `ios/SmartFinances.xcodeproj/project.pbxproj`, untracked `.specs/features/upgrade-pbl-v9/validation.md`
- **Branch**: `feat/subscription-management-improvements` (local ahead of origin; feature commits `d1b14f4`, `5788efd`, `ed61c85`, `8b3416c`, `e853f1c`; the user rebased/merged the branch mid-feature — T1 `d1b14f4` sits pre-merge in history, T2-T5 on top of the user's fixes)
- **Lessons (candidates)**: L-010 — centered overflowing content columns spill transparent children over sibling UI and swallow taps; bound slots + zIndex + hitSlop, verify on device; L-009 — absolute overlays anchor to shrink-wrapped rows; L-008 — jest mocks of animation libraries must be behaviorally faithful (this feature avoided `interpolate`/`Easing`/`.duration()` chains in the Accordion for exactly that reason)
- **Test-infra notes**: jest runs with `setupFiles` (gesture-handler jestSetup + `jest.setup.js` incl. minimal stateful reanimated mock), `transformIgnorePatterns` + `phosphor-react-native`, and a `styled-components` → `styled-components/native` moduleNameMapper; full gate = 365 passing, 41 suites: 40 passed + 1 pre-existing env-broken (`profile.spec.tsx` device-info NativeEventEmitter); `accountsFilter.test.ts` fixed by the user (`68d0cfb`). `yarn lint` fails at baseline repo-wide (pre-existing errors incl. RegisterTransaction L434-440/890-897/1088-1092) — scope eslint to touched files. Watchman is broken — always `--watchman=false`.
