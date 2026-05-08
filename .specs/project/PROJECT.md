# SmartFinances — Project Overview

## Summary
SmartFinances is a **React Native / Expo** mobile application (iOS + Android) that helps users manage their personal finances. It provides automatic bank account and credit card integration (via **Pluggy.ai**), AI-powered transaction categorization (via **Gemini AI**), and a full suite of manual finance management tools. User authentication is handled by **Clerk** (SSO/Google + email/password) bridged to a **custom Node.js + Express backend** deployed on a cPanel server with PostgreSQL. Monetization is powered by **RevenueCat** (in-app subscriptions).

---

## Tech Stack

### Frontend (this repo)

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | React Native 0.79 + Expo 53 (Bare Workflow) |
| Routing | Expo Router v5 (file-based) |
| Styling | Styled Components v6 + Light/Dark themes |
| State (server) | TanStack Query v5 |
| State (client) | Zustand v4 |
| Local storage | React Native MMKV |
| HTTP client | Axios |
| Auth | Clerk (SSO) + custom backend JWT |
| Payments | RevenueCat + react-native-purchases |
| Bank integration | Pluggy.ai (react-native-pluggy-connect) |
| AI | Gemini AI (transaction auto-categorization) |
| OTA updates | Revopush (CodePush alternative) |
| Analytics | Firebase Analytics + Crashlytics + Performance |
| Push notifications | OneSignal |
| Forms | React Hook Form + Yup |
| Charts | react-native-gifted-charts |
| Icons | Phosphor React Native |
| Fonts | Poppins (Expo Google Fonts) |
| Animations | React Native Reanimated + Gesture Handler |
| Lists | @shopify/flash-list |
| Bottom Sheet | @gorhom/bottom-sheet |
| Testing | Jest + React Native Testing Library |
| Linting | ESLint + Prettier |
| Build | EAS Build |

### Backend (smart-finances-backend repo)

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js >= 18 |
| Framework | Express v5 |
| ORM | Prisma v7 |
| Database | PostgreSQL (hosted on cPanel via `@prisma/adapter-pg`) |
| Auth | Clerk (`@clerk/express`) + JWT (jsonwebtoken) |
| Password hashing | Argon2 |
| Validation | Zod + Joi |
| Webhooks | Svix (Clerk webhook verification) |
| Logging | Winston + Morgan |
| Rate limiting | express-rate-limit |
| Security | Helmet, CORS |
| Deployment | cPanel Node.js Selector + reverse proxy (.htaccess) |

---

## External Services & Environment Variables

### Frontend `.env`
| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication |

### Frontend `src/api/api.ts`
Configure the Axios `baseURL` to point to the backend (e.g. `https://api.smartfinances.com.br/api/v1`).

### Backend `.env`
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLERK_SECRET_KEY` | Clerk server-side key |
| `CLERK_PUBLISHABLE_KEY` | Clerk client-side key |
| `CLERK_WEBHOOK_SECRET` | Svix webhook signature secret |
| `PLUGGY_CLIENT_ID` | Pluggy.ai Open Finance |
| `PLUGGY_CLIENT_SECRET` | Pluggy.ai Open Finance |
| `PLUGGY_BASE_URL` | `https://api.pluggy.ai` |
| `GEMINI_API_KEY` | Google Gemini AI categorization |
| `API_BASE_URL` | Public backend URL |
| `CORS_ORIGIN` | Comma-separated allowed origins (prod) |
| `CORS_ORIGIN_DEV` | Allowed origin in development |

### Other services (frontend)
| Key | Purpose |
|---|---|
| RevenueCat Google key | In `RevenueCatProvider.tsx` (android: `goog_yACJEerdROBKywaVVejvqfPBHDY`, iOS: TBD) |
| Revopush Deployment Keys | In `app.config.ts` |

---

## Core Domains

1. **Transactions** — CRUD, search, filter (month/year/all), bulk selection, image attachments, AI categorization
2. **Accounts / Wallets** — CRUD, hide/show, multi-currency, credit card data, bank integrations
3. **Categories** — CRUD (icon + color selection)
4. **Tags** — CRUD
5. **Budgets** — CRUD, recurrence, multi-category association, progress tracking
6. **Overview / Charts** — Cash flow bar chart, patrimony line chart, expenses/revenues pie charts by category
7. **Banking Integrations** — Pluggy.ai connector, sync transactions, status tracking
8. **User Profile** — Biometric login, dark mode, hide amounts, insights toggle
9. **Subscription** — RevenueCat Premium paywall

---

## API Base URL Convention
All backend routes are prefixed with `/api/v1`. Example:
- `GET /api/v1/transaction`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/clerk_sso`

---

## Project URLs
- Privacy Policy: https://smartfinances.com.br/privacy-policy
- Terms of Use: https://smartfinances.com.br/terms-of-use
- Help Center: https://smartfinances.com.br/contact
