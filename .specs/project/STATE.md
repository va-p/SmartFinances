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
- **Frontend — Expo SDK:** 53 / React Native 0.79.6
- **Backend — Node.js:** >= 18 / Express v5 / Prisma v7

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
