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
| 21 | **@gorhom/bottom-sheet v5.2.14** | Updated from 5.2.8 to fix Reanimated 4.x compatibility (SDK 57 / RN 0.86). Bottom sheets rendered overlays but content stayed hidden due to animation worklet failures in older version.

---

## Known Issues / Blockers

| # | Area | Description | Status |
|---|---|---|---|
| 1 | RevenueCat | Apple API key is empty (`''`) in `RevenueCatProvider.tsx` | Open |
| 2 | Revopush | iOS and Android share the same deployment key — verify if intended or misconfiguration | Open |
| 3 | Auth delay | 4-second hardcoded `CLERK_WEBHOOK_DELAY` on the frontend to wait for the Clerk webhook to reach the backend — fragile on slow networks | Open |
| 4 | QueryClient | `new QueryClient()` is instantiated inline inside `RootLayout` JSX — recreates on every render. Should be a stable `useState` or module-level constant | Open |
| 5 | `apiQuotes.ts` | Currency quotes API base URL is not yet documented — needs to be confirmed and configured | Open |
| 6 | Backend README drift | Backend `README.md` and `CPANEL_DEPLOYMENT.md` mention MariaDB/MySQL and the old Xano-style URL prefix `/api:456w6v7k` — these are outdated; real stack is PostgreSQL + `/api/v1` | Open |

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
