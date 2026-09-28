# List Search Bar — Specification

**Feature:** `list-search`
**Date:** 2026-09-28
**Branch:** `feat/search-bar`

## Problem Statement

Only the Home screen can filter its transaction list by search. Users browsing a specific account, a category's transactions, or their accounts lists cannot find a specific entry and must scroll manually. The Home screen already defines the visual standard (magnifying-glass toggle top-right, animated search bar, clear button, description matching), but its implementation is screen-local, so each new screen would duplicate it.

## Goals

- [ ] Every screen that lists transactions (Account, TransactionsByCategory) can filter its list by search, matching Home's behavior and visuals.
- [ ] Every screen that lists accounts (Accounts, InstitutionDetails) can filter its list by account name, following Home's layout and spacing conventions.
- [ ] The search bar and filtering logic are shared (single source of truth), with Home's behavior preserved after consolidation.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Server-side search API | All lists are already client-side; filtering is local (Home parity) |
| Search on other screens (Overview, Budgets, Subscriptions, Goals, Institutions, tags) | User scoped this to transaction/account list screens |
| Accent-insensitive matching ("acao" → "ação") | Home uses plain `toLowerCase().includes()`; parity kept |
| Persisting query/bar state across screens or sessions | Home parity: bar hidden on mount, query resets |
| Re-computing header aggregates (cash flow, patrimony, day totals) while filtering | Home parity: totals unchanged while searching |
| `AccountsList` / `AccountSelect` picker screens | Modal pickers, not the user's named screens |
| Interacting with sort options while searching | Existing sorting applies before the search filter; no new interaction |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| "InstitutionAccounts" screen | `src/screens/InstitutionDetails/index.tsx` | Only screen that lists the accounts of one institution | n |
| Transaction search field | `description` (case-insensitive substring) | Home parity (`useTransactionFiltering` matches `description`) |
| Account search field | `name` (case-insensitive substring) | Natural account identifier used by the lists |
| Accounts screen credit-card carousel | Filtered by the same query (hidden when no card matches) | All visible account entries should be searchable |
| Account header button spacing | Search button sits left of the edit button in a top-right group with the Header's 16px `column-gap` | Same spacing convention as every button in the compound Header; matches Home's grouped top-right buttons |
| Accounts screen button position | Absolute `top: 4px; right: 48px`, left of the hide-data button (`right: 16px`) | Home-exact positions (`Home/styles.ts`) |
| Day/section totals while filtering | Unchanged (full-group totals kept) | Home parity: filtered groups keep their original `total` |
| Bar hidden by default on every screen | Yes; no persistence | Home parity |
| Bar horizontal margin on padded screens | `marginHorizontal: 0` on TransactionsByCategory/InstitutionDetails (their container already pads 16px) | Visual inset matches Home's 16px |
| Empty query definition | Query of length 0 → unfiltered list | Home parity (`!searchQuery || searchQuery.length === 0`) |
| Uncommitted Home tweaks on `feat/search-bar` | Preserved uncommitted (stashed during task commits, restored after) | Unrelated user work (render-prop wrappers, `max-width` tweak); not mine to commit or discard |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Search transactions on the Account screen ⭐ MVP

**User Story**: As a user viewing one account's transactions, I want to tap a magnifying-glass icon and type a query so that only matching transactions are listed.

**Why P1**: Core request; the Account screen is the primary transaction-list screen after Home.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the user taps the magnifying-glass icon in the account header THEN the system SHALL toggle the search bar visibility below the account header. <!-- event-driven -->
2. WHILE a non-empty search query is active THEN the system SHALL list only transactions whose description contains the query, case-insensitively. <!-- state-driven -->
3. WHEN the search query is empty or cleared with the X button THEN the system SHALL list all transactions of the selected period for the account. <!-- event-driven -->
4. The account search button SHALL render inside the Header, to the left of the edit button, in a top-right group with the Header's 16px button spacing. <!-- ubiquitous -->

**Independent Test**: Open an account, tap the magnifying glass, type part of a description (any case) — only matching day-groups remain; tap X — full list returns.

---

### P1: Search transactions on the TransactionsByCategory screen ⭐ MVP

**User Story**: As a user viewing a category's transactions, I want to search by description so that only matching transactions are listed.

**Why P1**: Core request; second transaction-list screen.

**Acceptance Criteria**:

1. WHEN the user taps the magnifying-glass icon in the header THEN the system SHALL toggle the search bar visibility between the period ruler and the transactions list. <!-- event-driven -->
2. WHILE a non-empty search query is active THEN the system SHALL list only transactions whose description contains the query, case-insensitively. <!-- state-driven -->
3. WHEN the search query is empty or cleared THEN the system SHALL list all transactions of the selected period for the category. <!-- event-driven -->
4. The search button SHALL render in the compound Header at the top right of the screen. <!-- ubiquitous -->

**Independent Test**: Open a category from Overview, tap search, type a description fragment — list filters live; clear — full list returns.

---

### P1: Search accounts on the Accounts screen ⭐ MVP

**User Story**: As a user browsing all my accounts, I want to search by account/institution name so that I can find a specific account.

**Why P1**: Core request; accounts list with institution cards, standalone accounts, and credit cards.

**Acceptance Criteria**:

1. WHEN the user taps the magnifying-glass icon at the top right of the accounts header THEN the system SHALL toggle the search bar visibility between the header and the accounts list. <!-- event-driven -->
2. WHILE a non-empty search query is active THEN the system SHALL list only institution cards and standalone accounts whose name contains the query, case-insensitively. <!-- state-driven -->
3. WHILE a non-empty search query is active THEN the system SHALL filter the credit-card carousel by the same name match. <!-- state-driven -->
4. WHEN the search query is empty or cleared THEN the system SHALL list all institutions, standalone accounts, and credit cards. <!-- event-driven -->
5. The accounts search button SHALL render top right, to the left of the hide-data button, mirroring Home's absolute positions (`top: 4px`, `right: 48px` vs the hide button's `right: 16px`). <!-- ubiquitous -->

**Independent Test**: On Accounts, type an institution or account name — main list and credit-card carousel filter; clear — everything returns.

---

### P1: Search accounts on the InstitutionDetails screen ⭐ MVP

**User Story**: As a user viewing one institution's accounts, I want to search by account name so that I can find a specific account.

**Why P1**: Core request ("InstitutionAccounts" screen — see Assumptions).

**Acceptance Criteria**:

1. WHEN the user taps the magnifying-glass icon in the header THEN the system SHALL toggle the search bar visibility between the summary and the accounts list. <!-- event-driven -->
2. WHILE a non-empty search query is active THEN the system SHALL list only accounts of the institution whose name contains the query, case-insensitively. <!-- state-driven -->
3. WHEN the search query is empty or cleared THEN the system SHALL list all of the institution's accounts. <!-- event-driven -->
4. The search button SHALL render in the compound Header at the top right of the screen. <!-- ubiquitous -->

**Independent Test**: Open an institution card, type an account name — sections filter; clear — full list returns.

---

### P2: Shared implementation (components, utils, Home consolidation)

**User Story**: As a developer, I want one shared search bar and filter utilities so that all list screens stay visually and behaviorally consistent.

**Why P2**: Invisible to users, but required to keep the five screens DRY and Home's behavior preserved.

**Acceptance Criteria**:

1. The search bar SHALL render identically to Home's bar: magnifying-glass input icon, placeholder `Pesquisar...`, clear (X) button, and the same fade in/out animations. <!-- ubiquitous -->
2. WHEN Home's inline search bar is replaced by the shared `SearchBar` component THEN Home's search behavior SHALL remain unchanged (toggling, filtering, clearing). <!-- event-driven -->
3. The system SHALL filter lists client-side through shared utilities (`filterItemsByQuery`, `filterSectionsByQuery`) composed by `useTransactionFiltering` and the screens. <!-- ubiquitous -->
4. The compound `Header` component SHALL expose a `SearchButton` subcomponent with the Header's standard button shape (32px circle, primary icon). <!-- ubiquitous -->

**Independent Test**: Home still searches exactly as before; the four new screens use the same components.

---

## Edge Cases

- IF no item matches the query THEN the system SHALL render the existing empty-list state and SHALL NOT render group/section headers without items. <!-- unwanted-behavior -->
- IF an item's search field (description/name) is null or undefined THEN the system SHALL exclude it from results for a non-empty query without crashing. <!-- unwanted-behavior -->
- IF the query has length 0 THEN the system SHALL return the unfiltered list. <!-- unwanted-behavior -->
- IF a group/section has matches THEN the system SHALL preserve its `title` and `total` unchanged while filtering its items. <!-- unwanted-behavior -->

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SRCH-01 | P1 Account | Design | ✅ Verified |
| SRCH-02 | P1 Account | Design | ✅ Verified |
| SRCH-03 | P1 TransactionsByCategory | Design | ✅ Verified |
| SRCH-04 | P1 TransactionsByCategory | Design | ✅ Verified |
| SRCH-05 | P1 Accounts | Design | ✅ Verified |
| SRCH-06 | P1 Accounts | Design | ✅ Verified |
| SRCH-07 | P1 InstitutionDetails | Design | ✅ Verified |
| SRCH-08 | P1 InstitutionDetails | Design | ✅ Verified |
| SRCH-09 | P2 Shared SearchBar + Home consolidation | Design | ✅ Verified |
| SRCH-10 | P2 Shared Header.SearchButton | Design | ✅ Verified |
| SRCH-11 | P2 Shared filter utils + hook composition | Design | ❌ Needs Fix (Home still on the screen-local hook — see validation.md Fix 1) |
| SRCH-12 | P1/P2 Empty/no-match/null-field handling | Design | ✅ Verified |

**ID format:** `SRCH-[NUMBER]`
**Coverage:** 12 total, 12 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [ ] All four screens filter their lists live by query, with bar visuals/animations matching Home.
- [ ] Unit suite: the 224 existing tests keep passing plus new filter/hook tests; the only failing suite remains the pre-existing `profile.spec.tsx` (STATE.md #13).
- [ ] No new `tsc`/eslint errors in feature files (baselines recorded in `tasks.md`).
- [ ] Home's search behavior unchanged after the shared-component consolidation.

---

## Known coverage boundary

Button-toggle → bar-visibility → screen wiring is UI-level and has no automated test in this repo (pre-existing jest ESM/phosphor transform blocker, STATE.md #13/#18 — same class as the `home-accounts-filter` gap). These ACs are verified by the tsc/lint gates plus manual QA; the filter logic itself (utils + hook) is fully unit-tested.
