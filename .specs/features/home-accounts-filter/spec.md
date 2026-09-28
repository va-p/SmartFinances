# Home Accounts Filter Specification

## Problem Statement

The Home screen mixes transactions from every account. Users who want to review the flow of one account, or a subset, must leave Home and open each account screen separately. This adds an accounts filter pill beside the period selector so any combination of accounts can be inspected in place.

## Goals

- [ ] Users can open an accounts filter modal from a pill on Home (left of the period selector) and toggle any combination of their accounts
- [ ] The pill label reflects the selection: "Todas..." (none), account name (one), "X Contas" (two or more)
- [ ] The transaction list, cash flow total and cash flow chart honor the selection at all times
- [ ] Zero regressions in period filtering, search and navigation (suite stays at its 217-test baseline plus new tests)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Backend/API changes | `useTransactionsQuery` already returns all transactions; filtering is client-side (Account screen precedent) |
| Persisting the selection across restarts | Session-only, matches the adjacent period selector (see Assumptions) |
| Accounts filter on other screens (Overview, Account, TransactionsByCategory) | Home-only per request; separate feature if wanted |
| Creating/editing accounts from the modal | Outside the filter's responsibility |
| "Confirm" button inside the modal | Live toggle + dismiss via backdrop/pan (GoalAccountSelect pattern) |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Label language | Portuguese: "Todas..." / account name / "X Contas" | The app UI is 100% pt-BR ("Selecione o período", "Pesquisar...", "Tudo"); no English string exists in any screen | n |
| Filter scope | Whole Home data surface: list + cash flow total + chart | Account screen precedent (`Account/index.tsx:192-194`) filters before `formatTransactions`/`processTransactions`; the total must match the visible transactions | n |
| Selection lifecycle | Session-only in-memory Zustand store (resets on app restart) | Matches the adjacent period selector - `selectedPeriodStorage` is not persisted | n |
| Deselect-all semantics | Empty selection = no filter ("Todas..."); no explicit "All" row in the modal | Default state per request; deselecting everything returns to it | n |
| Selecting every account | Label stays "X Contas" (not "Todas...") even though the data equals the unfiltered view | Label is defined purely by count; no special case for all-selected | n |
| Long account names | Pill label truncates to one line with tail ellipsis | The pill has a fixed 25px height; existing labels ("Por Meses") are short, so no visual change for them | n |
| Virtual goal reserves | Excluded from the modal list | GOAL-26 / AD-41: `GET /account` excludes virtual accounts by default; plain `useAccountsQuery()` | n |
| Modal snap height | 75% | GoalAccountSelect modal precedent (account list needs scroll room) | n |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Accounts filter pill + multi-select modal ⭐ MVP

**User Story**: As a user, I want to pick which accounts Home shows, so that I can review one account or a group without leaving Home.

**Why P1**: The pill, modal and multi-select are the feature; without them nothing exists.

**Acceptance Criteria** (each line is one EARS pattern):

1. The Home screen SHALL render an accounts filter pill (FilterButton) to the left of the period selector pill. <!-- ubiquitous -->
2. WHEN the user taps the accounts filter pill THEN the system SHALL present a ModalViewSelection bottom sheet titled "Selecione as contas" listing the user's accounts. <!-- event-driven -->
3. WHEN the user taps a listed account THEN the system SHALL toggle that account in the selection immediately and SHALL keep the modal open. <!-- event-driven -->
4. The system SHALL exclude virtual goal reserve accounts from the modal list. <!-- ubiquitous -->
5. IF the user has no accounts THEN the modal SHALL render the empty-list state. <!-- unwanted-behavior -->

**Independent Test**: On Home, tap the pill left of the period pill → modal lists accounts; tap two accounts → both get check marks; dismiss → both remain selected.

---

### P1: Pill label logic ⭐ MVP

**User Story**: As a user, I want the pill to tell me which accounts I am seeing, so that I always know what the screen is filtered by.

**Why P1**: A filter without a visible state is invisible; the label is the filter's status.

**Acceptance Criteria**:

1. WHILE no account is selected THEN the pill label SHALL display "Todas...". <!-- state-driven -->
2. WHEN exactly one account is selected THEN the pill label SHALL display that account's name. <!-- event-driven -->
3. WHEN two or more accounts are selected THEN the pill label SHALL display "X Contas" where X is the number of selected accounts. <!-- event-driven -->
4. WHEN the single selected account's name is longer than the pill width THEN the label SHALL truncate to a single line with a tail ellipsis. <!-- event-driven -->

**Independent Test**: Select one account → pill shows its name; add a second → "2 Contas"; deselect all → "Todas...".

---

### P1: Filtered Home data ⭐ MVP

**User Story**: As a user, I want the list, total and chart to reflect my account selection, so that the numbers always match what I am seeing.

**Why P1**: Filtering the list but not the total/chart would show contradictory data on one screen.

**Acceptance Criteria**:

1. WHILE no account is selected THEN Home SHALL include transactions from all accounts (no filter). <!-- state-driven -->
2. WHILE one or more accounts are selected THEN Home SHALL include only transactions whose account id is among the selected account ids, in the transaction list, the cash flow total and the cash flow chart. <!-- state-driven -->
3. IF a transaction has no account data THEN the system SHALL exclude it from the filtered view while a filter is active. <!-- unwanted-behavior -->
4. The system SHALL preserve the existing period filtering, search and navigation behavior unchanged. <!-- ubiquitous -->

**Independent Test**: Select two accounts → list, "Fluxo de Caixa" total and chart bars only reflect those accounts; deselect all → previous unfiltered view returns.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF the user deselects every account THEN the system SHALL return to the default state ("Todas...", no filter).
- WHEN the user selects every account THEN the label SHALL keep the count form ("X Contas") even though the data equals the unfiltered view.
- IF a transaction has no account object THEN it SHALL be included when no filter is active and excluded when a filter is active.
- IF a selected account is deleted elsewhere THEN its stale selection entry SHALL be inert (matches no transactions); the user can deselect it to update the label count.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------- |
| ACCFLT-01 | P1: Accounts filter pill + multi-select modal (Story 1, AC 1-2, 4-5) | Execute | ✅ Verified |
| ACCFLT-02 | P1: Multi-select toggle + empty-selection default (Story 1, AC 3 + edge: deselect-all) | Execute | ✅ Verified |
| ACCFLT-03 | P1: Pill label logic (Story 2, AC 1-4) | Execute | ✅ Verified |
| ACCFLT-04 | P1: Filtered Home data (Story 3, AC 1-4 + edges) | Execute | ✅ Verified |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 4 total, 4 mapped to stories, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Pill sits left of the period pill; modal opens on tap; multi-select toggles live; labels follow the three-state logic
- [ ] List, cash flow total and chart all honor the filter; clearing the selection restores the unfiltered view
- [ ] Suite: 217-test baseline (plus 1 pre-existing suite-load failure, `profile.spec.tsx`) unchanged, plus new util tests green; no new tsc/eslint errors in feature files
