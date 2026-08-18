# SmartFinances — State & Decisions

## Architectural Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Expo Bare Workflow** (not managed) | Required for native modules (Firebase, MMKV, CodePush, RevenueCat, Pluggy) |
| 2 | **Expo Router v5** (file-based) | Route groups: `(auth)` and `(app)` with nested tab stacks |
| 3 | **Custom Node.js + Express backend** | Written from scratch; deployed on cPanel with a Node.js Selector + reverse proxy. Replaces any prior BaaS dependency. |
| 4 | **PostgreSQL via Prisma** | Backend uses Prisma v7 with `@prisma/adapter-pg`. DB hosted on cPanel. Schema-first with migrations. |
| 5 | **Dual auth: Clerk + custom JWT** | Clerk handles OAuth/SSO on the frontend. The backend runs `@clerk/express` middleware and also issues its own JWTs (`jsonwebtoken`). The `authenticate` middleware tries Clerk first, then falls back to Bearer JWT. |
| 6 | **Clerk webhook → backend user creation** | When a user signs up via Clerk SSO, Clerk fires a webhook (`POST /api/v1/auth/clerk-webhook`) verified by Svix. The backend upserts the user in PostgreSQL. The frontend then calls `GET /api/v1/auth/clerk_sso?clerk_user_id=...` to retrieve the backend token and user data. A `CLERK_WEBHOOK_DELAY` of 4000ms is still used on the frontend to wait for the webhook round-trip — fragile. |
| 7 | **MMKV for local persistence** | Three MMKV instances: `user`, `token`, `config`. Stores user profile, auth tokens, and config flags. |
| 8 | **Zustand for client state** | Manages in-memory user data (`useUser`), user configs (`useUserConfigs`), currencies, quotes, selected period, bulk selection, etc. |
| 9 | **TanStack Query for server state** | All API calls use Query/Mutation hooks in `src/hooks/`. Optimistic updates implemented for Accounts (CRUD). |
| 10 | **RevenueCat for in-app purchases** | iOS API key is currently empty — must be filled before App Store release. |
| 11 | **Revopush for OTA** | CodePush-compatible server. Both iOS and Android share the same deployment key in `app.config.ts` — verify if intentional. |
| 12 | **Styled Components** | Global themes via ThemeProvider. Two themes: `lightTheme` and `darkTheme`. Theme tokens accessed via `useTheme()`. |
| 13 | **Decimal.js for monetary math** | Avoids floating-point errors in currency calculations (used on both frontend and backend). |
| 14 | **Argon2 for password hashing** | Backend uses `argon2` (not bcrypt) — stronger defaults. |
| 15 | **Passwords are nullable on User** | OAuth users (Clerk SSO) have no password. `password` field is nullable in Prisma schema. |
| 16 | **NativeTabs for iOS (Liquid Glass)** | iOS uses `NativeTabs` from `expo-router/unstable-native-tabs` with native `UITabBarController` providing Liquid Glass effect (iOS 26+). Android/fallback uses JS `Tabs` with `BlurView` + `LinearGradient` for custom glass effect. Platform-specific via `_layout.ios.tsx`. Icons use SF Symbols on iOS, phosphor-react-native on Android. |
| 17 | **iOS 16.4 minimum deployment target** | Expo SDK 57 requires iOS 16.4. Updated `Podfile.properties.json`, `project.pbxproj`, and `app.json`. |
| 18 | **New Architecture (React Native 0.86)** | RN 0.82+ requires New Architecture (`newArchEnabled: true`). Old architecture flag `RCT_NEW_ARCH_ENABLED=0` is ignored. |
| 19 | **Static frameworks for Firebase on iOS** | `ios.useFrameworks: static` in `Podfile.properties.json` + `$RNFirebaseAsStaticFramework = true` in Podfile + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` post-install hook required for Firebase + New Architecture compatibility. |
| 20 | **Prisma v7 env loading** | Prisma v7 requires `prisma.config.ts` for migration URLs. Backend `prisma.ts` and `server.ts` load `.env.development` with `override: true` when `NODE_ENV=development`. Dev script sets `NODE_ENV=development`. |
| 21 | **@gorhom/bottom-sheet v5.2.14** | Updated from 5.2.8 to fix Reanimated 4.x compatibility (SDK 57 / RN 0.86). Bottom sheets rendered overlays but content stayed hidden due to animation worklet failures in older version. |
| 22 | **Express v5 req immutability** | Express v5 defines `req.query`, `req.params`, and `req.body` as getter-only properties. The `validate.ts` middleware was reassigning them (`req.query = result.data`), causing a 500 error. Fixed by mutating the object in place via `Object.assign`. |
| 23 | **Removed CLERK_WEBHOOK_DELAY** | The 4-second delay before calling `/auth/clerk_sso` is unnecessary: the backend's `clerkSSO` controller already fetches the user from Clerk API directly if the webhook hasn't created them yet. SSO login is now ~4 seconds faster. Retry logic preserved for server errors (5xx). |
| 24 | **PATCH for frontend updates, keep PUT in backend** | Frontend uses PATCH for all updates (safer for mobile — partial updates won't nullify unfilled fields). Backend retains both PUT and PATCH routes for external consumers. Exception: Tags use PUT (backend only provides PUT). |
| 25 | **Transaction images: add backend support** | Added `imageUrl` (`@db.Text`) to Transaction model + `POST /transaction/image` endpoint (validates base64, max 5MB). Frontend changed from `transaction_image_id` (numeric FK) to `image_url` (base64 string). |
| 26 | **Profile save: update URL only, flag as broken** | Updated image upload from `POST upload/user_profile_image` to `PATCH user/:id`. Flagged `handleSaveProfile()` as broken — builds `profileEdited` but never calls API to persist it. Needs dedicated fix. |
| 27 | **Tags use PUT (not PATCH)** | Backend only has `PUT /tag/:id` (no PATCH route). Frontend uses PUT for tag updates. Consider adding `PATCH /tag/:id` in future backend update for consistency. |
| 28 | **API responses must be uncacheable — fix at server layer** | The cPanel/LiteSpeed reverse proxy stamps every response with `Cache-Control: public, max-age=14400` + `Expires` + `ETag` (Express only adds the ETag; the backend sets no cache headers). iOS `NSURLCache` (disk-backed, survives restarts) then serves stale GET responses for up to 4h — POSTs bypass the cache, so writes hit the DB (visible in pgAdmin) while lists never refresh, even after app restart. Fix belongs at the server layer (.htaccess/LiteSpeed: force `Cache-Control: no-store`) — no Express/RN code changes. |
| 29 | **Default account (`is_default` on Account)** | New boolean column on `accounts`. At most one default per user — enforced transactionally on create/update (`updateMany` unsets siblings before setting the new one). API exposes it as `isDefault` (camelCase response, snake_case input). Frontend: toggle in `RegisterAccount` (create + edit); `RegisterTransaction` pre-selects it only when creating a transaction with no account context (`accountId` null). |
| 30 | **Shared sorting control for account lists** | `SortFilterButton` component encapsulates funnel button + `ModalViewSelection` + `SortingOptions`; used by both Accounts and AccountsList. Both screens share one persisted preference (`useUserConfigs.sortingOption` + MMKV `config.sortingOption`). Balance sorts are BRL-normalized via `convertCurrency` (per-item `balanceConvertedToBRL` from `processAccountsForList`). |
| 31 | **Transaction date/display normalization** | `processTransactions` accepts `created_at` as ISO 8601 (raw API) or `dd/MM/yyyy` (pre-formatted) and normalizes grouped day titles to `dd/MM/yyyy` — no hidden pre-formatting contract. `formatTransactions` (`src/utils/formatTransactions.ts`) is the single display mapper (dd/MM/yyyy `created_at` + pt-BR currency-formatted amount fields), used by Home, Account and TransactionsByCategory. |

---

## Known Issues / Blockers

| # | Area | Description | Status |
|---|---|---|---|
| 1 | RevenueCat | Apple API key is empty (`''`) in `RevenueCatProvider.tsx` | Open |
| 2 | Revopush | iOS and Android share the same deployment key — verify if intended or misconfiguration | Open |
| 3 | Auth delay | ~~4-second hardcoded `CLERK_WEBHOOK_DELAY` on the frontend to wait for the Clerk webhook to reach the backend — fragile on slow networks~~ → **Resolved**: Removed delay; backend `clerkSSO` controller fetches user from Clerk API directly if webhook hasn't arrived yet. | Resolved |
| 4 | QueryClient | `new QueryClient()` is instantiated inline inside `RootLayout` JSX — recreates on every render. Should be a stable `useState` or module-level constant | Open |
| 5 | `apiQuotes.ts` | Currency quotes API base URL is not yet documented — needs to be confirmed and configured | Open |
| 6 | Backend README drift | Backend `README.md` and `CPANEL_DEPLOYMENT.md` mention MariaDB/MySQL and the old Xano-style URL prefix `/api:456w6v7k` — these are outdated; real stack is PostgreSQL + `/api/v1` | Resolved |
| 7 | Express v5 req immutability | ~~`req.query = ...` crashes in Express v5 (getter-only property).~~ → **Resolved**: `validate.ts` middleware now mutates object in place via `Object.assign`. |
| 8 | Profile editing broken | `handleSaveProfile()` in `Profile/index.tsx` builds `profileEdited` but never calls an API to persist it. Image upload endpoint was fixed in endpoint-migration, but the actual save is still missing. ⚠️ FIXME comment added. | Open |
| 9 | Transaction image DB migration | `add_transaction_image_url` migration SQL created but not applied (PostgreSQL not running locally). Must run `npx prisma migrate deploy` on cPanel after deployment. | Open | Resolved |
| 10 | Production lists stale (4h HTTP cache) | Prod responses carry `cache-control: public, max-age=14400` + `expires` + `etag` (injected by cPanel/LiteSpeed layer). iOS NSURLCache serves stale GETs (transactions/categories) for 4h, surviving app restarts; POSTs uncached → DB updated but UI stale. Server-layer fix (no-store) being applied by user — pending re-verification of prod headers. | Resolved |
| 11 | Global rate limiter strict budget | Without `X-Device-Fingerprint` header the prod limit is 30 req/15min/IP (frontend doesn't send the header yet). Normal app usage (screen loads + invalidations) can hit 429s. Consider raising `RATE_LIMIT_STRICT_MAX` or implementing the fingerprint header. | Resolved |
| 12 | Default-account DB migration | `add_account_is_default` migration SQL created (`prisma/migrations/20260812000000_add_account_is_default/`) but not applied (PostgreSQL not running locally; migrations dir is gitignored by convention). Must run `npx prisma migrate deploy` on cPanel after deploying backend `feat/default-account`. | Resolved |
| 13 | TransactionsByCategory screen coverage | Verifier gap G1 (fix-transactions-by-category): the screen-level composition `formatTransactions → processTransactions` has no automated test (a reverted mapper unwiring survives the full suite). Deferred: utils are unit-tested and `processTransactions` hardening independently covers the empty-list regression; screen-level jest tests are currently blocked by the pre-existing `phosphor-react-native` transform failure (`profile.spec.tsx` fails at base). Add a composition/render test when screen-test infra is fixed. | Open |

---

## Active Context

- **Frontend version:** 2.24.x (from Revopush scripts target binary version `2.24.0`)
- **Backend version:** 1.0.0
- **API prefix:** `/api/v1`
- **Package manager:** Yarn 1.22.22 (both repos)
- **Frontend — Expo SDK:** 57 / React Native 0.86.2
- **Backend — Node.js:** >= 18 / Express v5 / Prisma v7

### SDK Upgrade Record (SDK 53 → 57)

**Date:** 2026-08-04

**Key changes:**
- Expo SDK 53.0.27 → 57.0.0, React Native 0.79.6 → 0.86.2
- Gradle 8.13 → 9.3.1, Kotlin 2.0.21 → 2.1.20
- `app.json`: removed deprecated `edgeToEdgeEnabled`, moved `googleServicesFile` to project root
- `@react-navigation/*` imports migrated to `expo-router` (React Navigation no longer compatible since SDK 56)
- `useBottomTabBarHeight` replaced with custom hook at `src/hooks/useBottomTabBarHeight.ts`
- Added `react-native-worklets@0.10.1` (required by Reanimated 4.5.1)
- Added `@react-navigation/native` (transitive dep for expo-router types, removed as direct dep)
- Added `@expo/vector-icons` (no longer bundled in Expo 57)
- `MainApplication.kt` updated to Expo 57 pattern (uses `ExpoReactHostFactory.getDefaultReactHost`)
- `InAppUpdateModule.kt` fixed for RN 0.86 API changes (`currentActivity` → `reactApplicationContext.currentActivity`, non-nullable activity/intent params)
- Android `settings.gradle` regenerated (uses `expo-autolinking-settings` plugin)
- `app.config.ts`: Revopush plugin temporarily disabled (incompatible with Expo 57 MainApplication template)
- `tsconfig.json`: added `ignoreDeprecations: "6.0"` for TS 6.0 compat

**⚠️ Revopush/CodePush integration:** The CodePush native integration in `MainApplication.kt` was applied manually but the `getJSBundleFile()` override pattern changed in Expo 57. The `@revopush/expo-code-push-plugin` is disabled in `app.config.ts` because it can't find the old insertion pattern. Verify OTA updates work on device.

**Build status:**
- ✅ Debug APK (`./gradlew assembleDebug`)
- ✅ JS bundle (`npx expo export:embed`)
- ✅ Release AAB (`./gradlew bundleRelease`) — after restoring keystore
- ⚠️ Some TypeScript errors remain (styled-components v6 theme type incompatibilities)

### Liquid Glass & iOS Build Fixes (2026-08-06)

**Tab bar migration:**
- iOS: `Tabs` → `NativeTabs` from `expo-router/unstable-native-tabs` (native Liquid Glass via `UITabBarController`)
- Android/fallback: JS `Tabs` with `BlurView` + `LinearGradient` for custom glass effect
- Platform-specific via `_layout.ios.tsx` — Expo Router auto-resolves
- Icons: SF Symbols (`sf`) on iOS, phosphor-react-native on Android
- Tint color uses theme `primary` (`rgb(255, 170, 41)`) for active tab
- ThemeProvider from `expo-router` wraps NativeTabs for Liquid Glass compatibility

**iOS build fixes (SDK 57):**
- `ios.deploymentTarget`: `15.1` → `16.4` (Expo SDK 57 requirement)
- `newArchEnabled`: `false` → `true` (RN 0.82+ requires New Architecture)
- `ios.useFrameworks`: `static` (Firebase Swift pods require frameworks)
- `$RNFirebaseAsStaticFramework = true` in Podfile (Firebase + New Architecture)
- `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` in post_install (cross-module imports)
- `GoogleService-Info.plist` added to Xcode project for Firebase iOS
- Xcode project deployment target unified to `16.4`

---

## Environment Setup

### Frontend
```sh
yarn install

# src/api/api.ts       — set baseURL to https://api.smartfinances.com.br/api/v1
# src/api/apiQuotes.ts — set currency quotes API base URL

# .env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

npx expo start --dev-client

# iOS requires GoogleService-Info.plist in ios/SmartFinances/ 
# (download from Firebase Console)
```

### Backend
```sh
yarn install

# .env (copy from .env.example and fill in values)
DATABASE_URL="postgresql://user:password@localhost:5432/smartfinances"
JWT_SECRET="..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."
PLUGGY_CLIENT_ID="..."
PLUGGY_CLIENT_SECRET="..."
GEMINI_API_KEY="..."

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
