# SmartFinances — Codebase Architecture

## Directory Structure

```
src/
├── @types/              # Global TypeScript declaration files
├── __tests__/           # Jest test files
├── api/
│   ├── api.ts           # Axios instance for Xano backend (configure base URL here)
│   └── apiQuotes.ts     # Axios instance for currency quotes API
├── app/                 # Expo Router file-based routing
│   ├── _layout.tsx      # Root layout: providers, auth guard, theme
│   ├── oauth-native-callback.tsx
│   ├── (auth)/          # Public routes
│   │   ├── index.tsx    # Welcome screen
│   │   ├── signIn.tsx
│   │   ├── signUp.tsx
│   │   ├── forgotPassword.tsx
│   │   └── resetPassSentConfirmation.tsx
│   └── (app)/           # Protected routes (requires auth)
│       ├── _layout.tsx  # Bottom tab navigator (Transactions, Contas, Orçamentos, Resumo, Mais)
│       ├── index.tsx    # Transactions tab (Home)
│       ├── accounts/    # Accounts tab stack
│       ├── budgets/     # Budgets tab stack
│       ├── overview/    # Overview tab stack
│       └── options/     # Options/More tab stack
├── assets/              # Images, fonts, static assets
├── components/          # Reusable UI components (each in its own folder)
├── constants/           # App-wide constants
├── contexts/
│   └── AuthProvider.tsx # Auth context (isSignedIn, signIn, signOut, biometrics)
├── database/
│   └── database.ts      # MMKV instances (storageUser, storageToken, storageConfig)
├── enums/
│   ├── enumsInsights.ts # Insight type enums
│   └── enumsUrl.ts      # External URLs (privacy policy, terms, help)
├── global/
│   └── themes/          # lightTheme.ts, darkTheme.ts, theme.ts (type definitions)
├── hooks/               # TanStack Query hooks (one file per entity/operation)
├── interfaces/          # TypeScript interfaces for all domain entities
├── providers/
│   └── RevenueCatProvider.tsx  # In-app purchases context
├── screens/             # Screen components (used by app/ route files)
├── stores/              # Zustand stores (client-side state)
└── utils/               # Pure utility functions
```

---

## Routing Architecture

```
Root (_layout.tsx)
├── Providers: GestureHandlerRootView > ThemeProvider > RevenueCatProvider
│             > ClerkProvider > QueryClientProvider > AuthProvider
│             > BottomSheetModalProvider
└── Auth Guard (RootNavigationLayout):
    ├── Not signed in → /(auth)         (Welcome) or /(auth)/signIn (if skipWelcomeScreen)
    └── Signed in     → /(app)          (Tab navigator)

(app) Tab Navigator:
├── index           → Transactions (Home) screen
├── accounts/       → Accounts stack (list, detail [accountId], edit, banking integrations, subscription)
├── budgets/        → Budgets stack (list, detail [budgetId], edit)
├── overview/       → Overview stack (dashboard, transactions by category [categoryId])
└── options/        → Options stack (menu, profile, categories, tags, accountsList,
                       bankingIntegrations, bankingIntegrationDetails, subscription, dev)
```

---

## Data Flow

```
API (custom Node.js + Express backend, /api/v1)
     ↓  Axios (src/api/api.ts)
     ↓  TanStack Query hooks (src/hooks/)
     ↓  Screen / Component
     ↓  Zustand store (for client-only derived/UI state)
     ↓  MMKV (for persistence across app restarts)
```

**Pattern for server state:**
- Every entity has dedicated hooks: `use[Entity]Query`, `use[Entity]DetailQuery`, `use[Entity]Mutations`
- Mutations use **optimistic updates** with rollback on error (fully implemented for Accounts; partially for others)
- Query keys follow convention: `['entity']` or `['entity', id]`

---

## Authentication Flow

```
App Start
  └── Clerk loaded?
        ├── clerkSignedIn = true → fetchClerkUserDataOnBackend()
        │     └── GET /api/v1/auth/clerk_sso?clerk_user_id=...
        │           → backend verifies clerkId in PostgreSQL (upserted by webhook)
        │           → returns [backendJWTToken, userData]
        │           → stores token (MMKV) + user data
        │           → sets isSignedIn = true
        ├── biometrics available? → signInWithBiometrics()
        │     └── reads cached user from MMKV → sets isSignedIn = true
        └── neither → show (auth) screens

Manual sign-in:
  ├── signInWithEmailPassword(email, password)
  │     → POST /api/v1/auth/login  (Argon2 password verification)
  │     → GET  /api/v1/auth/me
  └── Clerk Google SSO → Clerk webhook fires → backend upserts user
                       → frontend polls GET /api/v1/auth/clerk_sso

Clerk webhook (backend):
  POST /api/v1/auth/clerk-webhook  (Svix signature verified)
  └── user.created / user.updated / user.deleted → upsert/delete in PostgreSQL

Sign out: clerk.signOut() + clear MMKV + reset Zustand
```

---

## State Management Layers

| Store | Type | Persistence | Contents |
|---|---|---|---|
| `useUser` | Zustand | MMKV (`storageUser`) | id, name, email, role, profileImage, premium |
| `useUserConfigs` | Zustand | MMKV (`storageConfig`) | darkMode, hideAmount, useLocalAuth, insights |
| `useQuotes` | Zustand | MMKV (`quotesStorage`) | FX rates (BRL/USD/EUR/BTC pairs) |
| `useCurrenciesStore` | Zustand | In-memory | Available currencies list |
| `useTransactionsStore` | Zustand | In-memory | Transaction filters / UI state |
| `currentAccountSelected` | Zustand | MMKV | Currently selected account for filtering |
| `selectedPeriod` | Zustand | MMKV | Selected month/year filter |
| `bulkTransactionSelection` | Zustand | In-memory | Selected transaction IDs for bulk ops |
| `budgetCategoriesSelected` | Zustand | In-memory | Categories selected during budget creation |
| TanStack Query cache | React Query | In-memory | All server data (transactions, accounts, etc.) |

---

## Component Conventions

- Each component lives in `src/components/[ComponentName]/` with at minimum an `index.tsx`
- Styled components are co-located within each component folder (e.g., `styles.ts`)
- Skeleton screens are separate components: `SkeletonHomeScreen`, `SkeletonAccountsScreen`, etc.
- `Screen` component wraps screens with consistent padding/safe area
- `Header` component is reused across all screens

---

## Path Aliases (Babel Module Resolver)

Key aliases (verify in `babel.config.js`):

| Alias | Path |
|---|---|
| `@components` | `src/components` |
| `@screens` | `src/screens` |
| `@hooks` | `src/hooks` |
| `@stores` | `src/stores` |
| `@storage` | `src/stores` |
| `@contexts` | `src/contexts` |
| `@providers` | `src/providers` |
| `@interfaces` | `src/interfaces` |
| `@api` | `src/api` |
| `@database` | `src/database` |
| `@themes` | `src/global/themes` |
| `@utils` | `src/utils` |
| `@assets` | `src/assets` |
| `@constants` | `src/constants` |

---

## Backend API Routes (Reference)

All routes are prefixed with `/api/v1`. The backend (`smart-finances-backend`) is a separate Node.js + Express project.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Email/password registration |
| POST | `/auth/login` | Public | Email/password login |
| GET | `/auth/me` | JWT/Clerk | Get current user |
| GET | `/auth/clerk_sso` | Public | Fetch/create user from Clerk SSO |
| POST | `/auth/clerk-webhook` | Svix | Clerk webhook handler |
| PUT | `/auth/password` | JWT/Clerk | Update password |
| POST | `/auth/forgot-password` | Public | Password reset request |
| GET/POST/PUT/DELETE | `/account` | JWT/Clerk | Account CRUD |
| GET/POST/PATCH/DELETE | `/transaction` | JWT/Clerk | Transaction CRUD |
| GET/POST/PUT/DELETE | `/category` | JWT/Clerk | Category CRUD |
| GET/POST/PUT/DELETE | `/tag` | JWT/Clerk | Tag CRUD |
| GET/POST/PUT/DELETE | `/budget` | JWT/Clerk | Budget CRUD |
| GET/POST/DELETE | `/banking-integration` | JWT/Clerk | Pluggy integration |
| GET | `/currency` | JWT/Clerk | List currencies |
| GET | `/icon` | JWT/Clerk | List icons |
| GET | `/color` | JWT/Clerk | List colors |
| GET/PUT | `/user` | JWT/Clerk | User profile |
| POST | `/webhooks` | Svix | Generic webhook handler |

---

## Key Domain Interfaces

### `TransactionProps`
`id`, `description`, `amount`, `amount_formatted`, `currency`, `type` (CREDIT/DEBIT/TRANSFER_CREDIT/TRANSFER_DEBIT), `account`, `category`, `tags`, `user_id`

### `AccountProps`
`id`, `name`, `currency`, `type` (Cartão de Crédito / Conta Corrente / Poupança / Carteira / etc.), `balance`, `initialAmount`, `hide`, `creditData?`

### `BudgetProps`
`id`, `name`, `amount`, `amount_spent`, `currency`, `account`, `categories[]`, `start_date`, `end_date?`, `recurrence`, `transactions[]`

### `CategoryProps`
`id`, `name`, `icon` (IconProps), `color` (ColorProps)

### `BankingIntegration`
`id`, `pluggyIntegrationId`, `lastSyncDate`, `health`, `status`, `executionStatus`, `connectorId`, `bankName`

### `User`
`id`, `name`, `lastName`, `email`, `phone`, `role` (admin/user), `profileImage`, `premium?`, `configs` (useLocalAuth, hideAmount, insights)
