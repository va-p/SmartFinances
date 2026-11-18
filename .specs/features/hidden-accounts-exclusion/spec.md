# Hidden Accounts Exclusion Specification

## Problem Statement

Users hide an account (`account.hide = true`) to take it out of everyday finance views. Today the flag is only honored in a few places (`calculateTotalAssets`, `Accounts` list filter, `InstitutionDetails`, widget institutions). Everywhere else the hidden account still counts: its transactions appear in transaction lists (Home, TransactionsByCategory, budget history) and feed cash-flow, net-worth, category, and budget totals. The hidden account therefore still moves every number it was meant to be removed from.

## Goals

- [ ] Hiding an account removes all of its transactions from every balance calculation and every transaction list, with zero hidden-account leakage in totals, charts, and lists.
- [ ] A hidden account remains manageable exactly where it is today: manual accounts on AccountsList, integration accounts on BankingIntegrationDetails.
- [ ] Backend transaction payloads expose the owning account's `hide` flag so every client-side filter has the data it needs.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Hide-toggle UX changes (RegisterAccount switch, hide_amount privacy toggle) | Toggle already works; this feature only honors its effect |
| Deleting hidden accounts or their transactions | Data is retained; only excluded from views and math |
| Single-account detail screen for a hidden account opened directly | Unreachable in normal flow (Accounts filters hidden; AccountsList opens the edit modal); left unchanged |
| Server-side default filtering of transaction endpoints | Backend exposes `hide`; filtering stays client-side so explicit single-account views keep working |
| Transfer-linking semantics changes | Transfers keep existing exclusion rules; per-leg hidden filtering applies with no new linking logic |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Meaning of "only listed on AccountsList / BankingIntegrationDetails" | Hidden accounts stay visible on those two management screens; visible accounts also stay there; every other account list excludes hidden accounts | AccountsList and BankingIntegrationDetails are management surfaces, not finance views; the complaint is leakage into totals and lists, not presence on management screens | y |
| Backend role | Backend adds `account.hide` to transaction payloads (`getTransactions`, `getTransactionsByCategory`, `getTransactionById`) and does not filter rows | Single-account views and future clients need the raw rows plus the flag; filtering belongs at each calculation/list entry point | y |
| Transfer legs touching a hidden account | Each leg is filtered by its own owning account's `hide` flag; existing transfer exclusions in flows stay as-is | A leg is a transaction row owned by one account; per-leg filtering is the only rule consistent with "all transactions from hidden accounts" | y |
| Transactions with missing account data (optimistic updates) | Keep existing behavior unchanged (charts skip no-account rows; lists keep current handling) | No-account rows carry no `hide` signal; inventing a rule would change optimistic-update behavior out of scope | y |
| `hide_amount` (mask values) vs `hide` (hide account) | Independent features; this spec only concerns per-account `hide = true` | `hide_amount` masks display values globally; `hide` removes an account's data from math and lists | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Hidden transactions disappear from every transaction list ⭐ MVP

**User Story**: As a user with a hidden account, I want none of its transactions in any transaction list so that hiding actually hides the account.

**Why P1**: This is the user-visible promise of hiding; a single leaked list breaks trust.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the Home transaction list renders THEN the system SHALL exclude every transaction whose owning account has `hide = true`.
2. WHEN the TransactionsByCategory list renders THEN the system SHALL exclude every transaction whose owning account has `hide = true`.
3. WHEN the BudgetDetails history list renders THEN the system SHALL exclude every transaction whose owning account has `hide = true`.
4. WHEN the TransactionSelect and Subscription candidate lists render THEN the system SHALL exclude every transaction whose owning account has `hide = true`.
5. WHILE an account has `hide = true` the system SHALL keep listing that account on AccountsList (manual) and BankingIntegrationDetails (integration).
6. WHILE an account has `hide = true` the system SHALL exclude that account from the Accounts screen list, the InstitutionDetails list, and every account picker (AccountSelect, AccountFilterSelect, AccountDestinationSelect, GoalAccountSelect).

**Independent Test**: Hide an account with known transactions; open Home, TransactionsByCategory, BudgetDetails, and TransactionSelect and confirm zero rows from that account appear, while AccountsList still shows the account.

---

### P1: Hidden transactions leave every balance and chart ⭐ MVP

**User Story**: As a user with a hidden account, I want its transactions excluded from every total and chart so that balances reflect only visible accounts.

**Why P1**: Leaked amounts defeat hiding just as visibly as leaked rows.

**Acceptance Criteria**:

1. WHEN the Home cash-flow total and chart aggregate THEN the system SHALL exclude flows from transactions whose owning account has `hide = true`.
2. WHEN the Accounts realized total and net-worth chart aggregate (including future-flow back-out) THEN the system SHALL exclude balances and flows of accounts with `hide = true`.
3. WHEN the Overview category totals and patrimonial evolution aggregate THEN the system SHALL exclude transactions whose owning account has `hide = true`.
4. WHEN budget spent and percentage compute THEN the system SHALL exclude transactions whose owning account has `hide = true`.
5. WHEN the widget snapshot aggregates cash-flow, net-worth spark, and category donut THEN the system SHALL exclude transactions whose owning account has `hide = true`.
6. The system SHALL keep excluding hidden-account balances from `calculateTotalAssets` and widget institution grouping.

**Independent Test**: Hide an account with balance 999 and known transactions; confirm Home cash-flow, Accounts total, Overview totals, budget spent, and widget snapshot equal the values computed with that account's rows removed.

---

### P1: Backend exposes the hide flag on transaction payloads ⭐ MVP

**User Story**: As a client developer, I want each transaction's owning account to carry `hide` so that filters work on real API data.

**Why P1**: The backend `getTransactions` payload currently omits `account.hide`, so no client filter can match hidden rows.

**Acceptance Criteria**:

1. WHEN `GET /transaction` returns rows THEN the system SHALL include `account.hide` (boolean) on every row's account object.
2. WHEN `GET /transaction/by-category` returns rows THEN the system SHALL include `account.hide` (boolean) on every row's account object.
3. WHEN `GET /transaction/:id` returns a row THEN the system SHALL include `account.hide` (boolean) on its account object.
4. IF a transaction's account is missing THEN the system SHALL return the row without a `hide` value rather than failing.

**Independent Test**: Call each endpoint with a hidden-account transaction present; confirm `account.hide === true` on its rows and `false` on visible-account rows.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF all accounts are hidden THEN the system SHALL show zero totals and empty transaction lists (not errors).
- IF an account is unhidden THEN the system SHALL immediately include its transactions in the next list and total computation with no app restart.
- WHEN a transfer has one leg in a hidden account and one leg in a visible account THEN the system SHALL filter each leg by its own account's `hide` flag.
- IF a transaction has no account data THEN the system SHALL keep the existing no-account handling unchanged.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| HIDE-01 | P1: transaction lists (Home) | Execute | Verified |
| HIDE-02 | P1: transaction lists (category/budget/selectors) | Execute | Verified |
| HIDE-03 | P1: balances and charts (Home/Accounts cash-flow + net worth) | Execute | Verified |
| HIDE-04 | P1: balances and charts (Overview/budgets/widgets) | Execute | Verified |
| HIDE-05 | P1: management surfaces unchanged | Execute | Verified |
| HIDE-06 | P1: backend hide flag on payloads | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 6 total, 0 mapped to tasks, 6 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Hiding an account removes 100% of its transactions from every list and every total on the next render with no restart.
- [ ] Unhiding restores the account's transactions fully with no data loss.
- [ ] Zero regressions: visible-account totals and lists are byte-identical before and after the change.
