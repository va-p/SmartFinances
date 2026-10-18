# SmartFinances — Roadmap

## Implemented Features (v2.24.x)

### Authentication
- [x] Email/Password login via Xano
- [x] SSO Login (Google) via Clerk
- [x] Biometric login (Face ID / Fingerprint)
- [x] Welcome screen (skippable)
- [x] Forgot password / reset password flow

### Transactions
- [x] List transactions (FlashList, grouped by date)
- [x] Search transactions
- [x] Filter by month, year, or all-time
- [x] Add / Edit / Delete transactions (CREDIT, DEBIT, TRANSFER)
- [x] Attach images to transactions
- [x] Bulk transaction selection
- [x] AI auto-categorization using Gemini AI

### Accounts / Wallets
- [x] List accounts
- [x] Add / Edit / Delete accounts
- [x] Hide/show accounts
- [x] Multi-currency support with live exchange rates
- [x] Credit card details (limit, due date, etc.)

### Banking Integrations (Pluggy.ai)
- [x] Connect bank accounts via Pluggy.ai widget
- [x] Auto-import accounts and credit cards
- [x] Auto-import transactions
- [x] View integration status (UPDATED, OUTDATED, LOGIN_ERROR, etc.)
- [x] Manual sync trigger

### Categories
- [x] List categories
- [x] Add / Edit / Delete categories (with icon + color)

### Tags
- [x] List tags
- [x] Add / Edit / Delete tags

### Budgets
- [x] List budgets
- [x] Add / Edit / Delete budgets
- [x] Budget recurrence (daily, weekly, monthly, etc.)
- [x] Multi-category assignment
- [x] Budget progress tracking (spent vs. limit)

### Overview / Charts
- [x] Cash flow summary (total income vs. expenses)
- [x] Cash flow bar chart (historical)
- [x] Patrimony line chart (total net worth over time)
- [x] Expenses by category (pie chart + list)
- [x] Revenues by category (pie chart + list)

### User Profile & Settings
- [x] View / edit profile
- [x] Toggle biometric login
- [x] Toggle hide amounts
- [x] Toggle insights
- [x] Dark mode / light mode support (follows device or manual)
- [x] Accounts list management from options tab

### Subscription
- [x] Premium benefits screen
- [x] RevenueCat in-app subscription
- [x] Restore purchases

### Subscription Management
- [x] Subscription list ("Minhas assinaturas") auto-identified from recurring monthly/yearly transactions
- [x] Subscription details (last/next payment, collapsible payment details)
- [x] Edit subscription payment details (amount, billing day, recurrence)
- [x] Classification actions ("Não é uma assinatura", "Ocultar da lista"/"Exibir na lista")
- [x] Upcoming payments month view with paid/pending status and BRL totals
- [x] Period selector (last 12 → next 12 months)
- [x] Help sheet explaining subscription classification

### Infrastructure
- [x] OTA updates via Revopush
- [x] Firebase Analytics, Crashlytics, Performance
- [x] OneSignal push notifications
- [x] EAS Build (development + production profiles)

---

## Potential Future Features

- [x] Recurring transactions
- [x] Subscription management (Netflix, Spotify, etc.) with automatic identification based on transactions.
- [ ] Financial goals / savings targets
- [ ] Widgets (iOS / Android home screen)
- [ ] Export data (CSV / PDF)
- [ ] Multi-user / shared wallet support
- [ ] Transaction reminders / notifications
- [ ] Automated insights via AI
- [ ] Investment portfolio tracking
- [ ] Web companion app
