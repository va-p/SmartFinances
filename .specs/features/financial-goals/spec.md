# Financial Goals / Savings Targets Specification

## Problem Statement

Users have no way to set and track savings targets inside SmartFinances. Money set aside for a goal (e.g., "Viagem", "Reserva de emergência") is indistinguishable from the rest of their balance, so they can't see progress, keep goal funds separated, or review achieved targets. This is the next roadmap item after recurring transactions and subscription management.

## Goals

- [ ] User can create a savings goal (name, target amount, currency, optional deadline) and reach a first deposit in under 2 minutes.
- [ ] Goal funds are held via real internal TRANSFER transactions, so Cash Flow and Net Worth stay exactly correct (a deposit moves money between the user's own accounts — net worth unchanged).
- [ ] Virtual reserve accounts are invisible in the Accounts tab and account pickers, yet included in Total Net Worth ("Patrimônio Total").
- [ ] Full lifecycle supported: active → completed (auto-flag at 100% + manual conclude) → archived, with unarchive restoring prior status, and safe deletion with transfer-back of remaining funds.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Recurring / scheduled auto-deposits | Recurring transactions already exist; auto-enrollment into goals is a separate feature |
| Goal reminders / notifications | Separate roadmap item ("Transaction reminders / notifications") |
| Shared / multi-user goals | Separate roadmap item ("Multi-user / shared wallet support") |
| Custom goal icons/colors picker | Not in the feature request; a default target icon is used |
| Investment yield / projection simulation | Belongs to "Investment portfolio tracking" roadmap item |
| Home-screen widgets | Separate roadmap item |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Virtual reserve account existence | Every goal owns exactly one virtual reserve account, created atomically at goal creation — even when real accounts are linked | Uniform deposit target; spec requires virtual accounts at least as fallback; always creating avoids ambiguous "where does a deposit go" for linked-only goals | n |
| Deposit/withdraw routing | Deposits/withdrawals always move between a real account and the goal's virtual reserve; linked real accounts contribute passively via their balance | Keeps the goal ledger clean; moving money in/out of linked accounts stays possible via the normal transfer flow | n |
| Virtual accounts in regular pickers | Virtual reserve accounts are NOT offered in regular transaction/transfer account pickers (Goals flow only) | Stated to user as default during discuss; no objection | y |
| Unarchive target status | Unarchive restores the previous status (ACTIVE → ACTIVE, COMPLETED → COMPLETED) | Stated to user as default during discuss; no objection | y |
| Deleting a linked real account | Deleting a real account that is linked to goals unlinks it (no block); goal current amounts recalculate | Blocking account deletion would couple two features' lifecycles; unlink mirrors SetNull-style conventions | n |
| Privacy masking | Goal amounts respect the existing `hideAmount` ("Ocultar informações") config | Consistent with every other screen showing amounts | n |
| Deadline validation | Deadline is optional; when provided it must be today or later | A past deadline at creation is a data-entry error | n |
| Deposit source pre-selection | Deposit form pre-selects the user's default account (`isDefault`) as source, changeable | Reduces taps; matches default-account feature | n |
| Backend location & shape | New `goal` module in `smart-finances-backend` repo (routes/controller/schema + service for non-trivial logic), registered as `/api/v1/goal` | Mirrors budget/transfer module conventions | n |
| Virtual account discriminator | Technical mechanism (new flag/type on Account) is a Design-phase decision; must satisfy GOAL-20/21/22 | The existing `hide` flag excludes from net worth too, so it cannot be reused | n |
| Observability | No new analytics events; backend uses the existing winston logger only | Feature request does not mention analytics | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Goals Entry Point & Active Goals List ⭐ MVP

**User Story**: As a user, I want to open "Metas & Objetivos" from the options menu and see my active goals with progress, so that I can track my savings targets at a glance.

**Why P1**: This is the feature's front door and main screen; nothing else is reachable without it.

**Acceptance Criteria**:

1. WHEN the user taps "Metas & Objetivos" in the OptionsMenu screen THEN the system SHALL navigate to the Goals screen. <!-- event-driven -->
2. WHILE the Goals screen is displayed the system SHALL render each ACTIVE goal as a card showing name, current amount, target amount, progress percentage, and deadline when one is set. <!-- state-driven -->
3. WHEN the user has no ACTIVE goals THEN the system SHALL display an empty state with a call-to-action to create the first goal. <!-- event-driven -->
4. The system SHALL display a create-goal button (FAB) on the Goals screen at all times. <!-- ubiquitous -->
5. WHILE the `hideAmount` privacy config is enabled the system SHALL mask all goal monetary values on Goals screens. <!-- state-driven -->
6. The system SHALL provide navigation from the Goals screen to the Completed Goals list and to the Archived Goals list. <!-- ubiquitous -->

**Independent Test**: Open options menu → "Metas & Objetivos" → see empty state; seed one active goal → see its card with correct progress.

---

### P1: Create Goal ⭐ MVP

**User Story**: As a user, I want to create a savings goal with a target amount and optionally link existing accounts, so that I can start tracking a target immediately.

**Why P1**: Creating a goal is the core write operation of the MVP.

**Acceptance Criteria**:

1. WHEN the user submits the create-goal form with a non-empty name, a target amount greater than zero, and a currency THEN the system SHALL create the goal in ACTIVE status and SHALL atomically create its virtual reserve account in the goal's currency with zero balance. <!-- event-driven -->
2. IF the form is submitted with an empty name or a target amount less than or equal to zero THEN the system SHALL show field-level validation errors and SHALL NOT call the API. <!-- unwanted-behavior -->
3. WHERE the user selects one or more existing accounts during creation the system SHALL link them to the goal and include their full balances in the goal's current amount. <!-- optional-feature -->
4. WHEN the user sets a deadline THEN the system SHALL require the date to be today or later. <!-- event-driven -->
5. IF the create-goal API call fails THEN the system SHALL roll back any optimistic state and display an error alert. <!-- unwanted-behavior -->

**Independent Test**: Create a goal "Viagem" with target R$ 5.000, no linked accounts → goal appears in active list at 0%; create another goal linking a savings account → its current amount equals that account's balance.

---

### P1: Goal Details, Deposits & Withdrawals ⭐ MVP

**User Story**: As a user, I want to deposit into and withdraw from a goal via transfers between my accounts, and see the history, so that my goal progress reflects real money movement.

**Why P1**: Explicit balance allocation via transfers is the feature's core architectural decision.

**Acceptance Criteria**:

1. WHEN the user confirms a deposit with an amount greater than zero and a source account THEN the system SHALL create an internal TRANSFER from the source account to the goal's virtual reserve account and the goal's current amount SHALL increase by the deposited amount (in goal currency). <!-- event-driven -->
2. WHEN the user confirms a withdrawal with an amount greater than zero and a destination account THEN the system SHALL create an internal TRANSFER from the goal's virtual reserve account to the destination account and the goal's current amount SHALL decrease accordingly. <!-- event-driven -->
3. IF the withdrawal amount exceeds the goal's virtual reserve balance THEN the system SHALL reject the operation with a validation message and SHALL NOT create any transaction. <!-- unwanted-behavior -->
4. WHILE a deposit or withdrawal mutation is in flight the system SHALL disable the confirmation button to prevent duplicate submissions. <!-- state-driven -->
5. WHERE the picked account's currency differs from the goal currency the system SHALL execute the transfer using the existing multi-currency transfer conversion (per-leg `amount_in_account_currency`). <!-- optional-feature -->
6. WHEN the user opens a goal's details screen THEN the system SHALL display the goal's progress, its linked accounts, and the contribution/withdrawal history (transfer legs on the virtual reserve account) ordered newest first. <!-- event-driven -->
7. WHEN a deposit or withdrawal completes THEN the system SHALL refresh the accounts and transactions queries so balances and histories stay consistent. <!-- event-driven -->

**Independent Test**: Create a goal, deposit R$ 500 from checking → checking balance −500, goal +500, net worth unchanged; withdraw R$ 200 to savings → goal 300; attempt withdraw R$ 400 → rejected, no transaction created.

---

### P1: Goal Completion ⭐ MVP

**User Story**: As a user, I want the app to tell me when I reached my target and to conclude the goal myself, so that I keep control over my achieved goals.

**Why P1**: Completing a goal is the payoff moment of the MVP and feeds the Completed Goals history.

**Acceptance Criteria**:

1. WHEN an ACTIVE goal's current amount reaches or exceeds its target amount THEN the system SHALL display a "Meta atingida" state on that goal while keeping it in the active list. <!-- event-driven -->
2. WHEN the user taps "Concluir" on a goal THEN the system SHALL set the goal status to COMPLETED and remove it from the active goals list. <!-- event-driven -->
3. WHEN the user opens the Completed Goals list THEN the system SHALL display each completed goal with name, target amount, and completion date. <!-- event-driven -->
4. WHILE a goal has COMPLETED status the system SHALL NOT allow deposits, withdrawals, or edits to its linked accounts. <!-- state-driven -->
5. IF the user has no completed goals THEN the Completed Goals screen SHALL display an empty state. <!-- unwanted-behavior -->

**Independent Test**: Deposit the full target amount → card shows "Meta atingida" → tap "Concluir" → goal disappears from active list and appears in Completed list.

---

### P1: Virtual Reserve Visibility & Net Worth Integrity ⭐ MVP

**User Story**: As a user, I want my goal reserves to count toward my total patrimony without cluttering my accounts list, so that both screens stay accurate.

**Why P1**: This is the feature's defining visibility constraint; getting it wrong corrupts either the Accounts tab or Net Worth.

**Acceptance Criteria**:

1. The system SHALL NOT render virtual reserve accounts in the Accounts tab list, institution groupings, or account management lists. <!-- ubiquitous -->
2. The system SHALL include virtual reserve account balances in the Total Net Worth ("Patrimônio Total") calculation and its historical evolution chart. <!-- ubiquitous -->
3. The system SHALL NOT offer virtual reserve accounts as selectable accounts in regular transaction or transfer pickers. <!-- ubiquitous -->
4. WHEN a deposit transfer pair is created THEN the system SHALL leave Total Net Worth unchanged (money moves between two accounts owned by the user). <!-- event-driven -->

**Independent Test**: Create a goal with a deposit → Accounts tab shows no new account; "Patrimônio Total" is identical before and after the deposit; virtual account is absent from transfer pickers.

---

### P2: Edit Goal

**User Story**: As a user, I want to edit a goal's name, target amount, deadline, and linked accounts, so that the goal stays aligned with my plans.

**Why P2**: Important for long-lived goals, but the MVP works without editing.

**Acceptance Criteria**:

1. WHEN the user saves edits to an ACTIVE goal's name, target amount, deadline, or linked accounts THEN the system SHALL persist the changes and recompute the goal's progress. <!-- event-driven -->
2. IF the target amount is edited to a value at or below the current amount THEN the system SHALL display the "Meta atingida" state without changing the goal's status. <!-- unwanted-behavior -->
3. WHEN the user removes a linked account from a goal THEN the system SHALL unlink it and subtract its balance from the goal's current amount without moving any money. <!-- event-driven -->

**Independent Test**: Edit a goal's target from R$ 5.000 to R$ 300 after a R$ 500 deposit → progress shows ≥ 100% "Meta atingida", goal still ACTIVE.

---

### P2: Archive & Unarchive

**User Story**: As a user, I want to archive goals I no longer track and unarchive them later, so that my active list stays focused without losing history.

**Why P2**: Explicitly requested lifecycle, but goals can be concluded/deleted without it in MVP.

**Acceptance Criteria**:

1. WHEN the user archives an ACTIVE or COMPLETED goal THEN the system SHALL record its previous status, set its status to ARCHIVED, and remove it from the active/completed lists. <!-- event-driven -->
2. WHEN the user opens the Archived Goals list THEN the system SHALL display all archived goals. <!-- event-driven -->
3. WHEN the user unarchives a goal THEN the system SHALL restore it to its recorded previous status (ACTIVE or COMPLETED). <!-- event-driven -->
4. WHILE a goal has ARCHIVED status the system SHALL make it read-only: no deposits, withdrawals, or edits. <!-- state-driven -->
5. IF the user has no archived goals THEN the Archived Goals screen SHALL display an empty state. <!-- unwanted-behavior -->

**Independent Test**: Archive an active goal → appears only in Archived list → unarchive → back in active list with unchanged progress.

---

### P2: Delete Goal with Transfer-Back

**User Story**: As a user, I want to delete a goal and get any remaining reserve money back into an account of my choice, so that no funds are orphaned.

**Why P2**: Needed for data lifecycle integrity, but MVP users can withdraw then delete at zero balance.

**Acceptance Criteria**:

1. WHEN the user deletes a goal whose virtual reserve balance is zero THEN the system SHALL delete the goal and its virtual reserve account without changing Total Net Worth. <!-- event-driven -->
2. WHEN the user deletes a goal whose virtual reserve balance is greater than zero THEN the system SHALL require the user to pick a destination account and SHALL atomically transfer the full reserve balance to it before deletion. <!-- event-driven -->
3. WHEN a goal is deleted THEN the system SHALL unlink any linked real accounts without modifying them or their transactions. <!-- event-driven -->
4. The system SHALL preserve transaction-history integrity on real accounts when a goal is deleted (no dangling transfer relations). <!-- ubiquitous -->
5. IF the transfer-back step fails THEN the system SHALL abort the deletion, keep the goal intact, and display an error alert. <!-- unwanted-behavior -->

**Independent Test**: Delete a goal holding R$ 300 → pick savings account → savings +R$ 300, goal and virtual account gone, net worth unchanged, no broken transfer legs.

---

### P2: Linked Account Deletion Interplay

**User Story**: As a user, I want deleting a real account that is linked to a goal to just unlink it, so that account management isn't blocked by goals.

**Why P2**: Edge integrity between two features; only matters once both exist.

**Acceptance Criteria**:

1. WHEN a real account linked to one or more goals is deleted THEN the system SHALL unlink it from those goals and recompute their current amounts. <!-- event-driven -->
2. WHEN a real account is deleted THEN the system SHALL NOT delete or modify any goal's virtual reserve account. <!-- event-driven -->

**Independent Test**: Link a savings account to a goal, delete the savings account → goal remains, current amount drops by that account's former balance.

---

## Edge Cases

- IF a deposit or withdrawal amount is less than or equal to zero THEN the system SHALL reject it with field-level validation before any API call.
- WHEN two deposits are submitted in quick succession THEN the system SHALL apply both atomically (server-side balance increments inside a database transaction).
- IF the API is unreachable during any goal mutation THEN the system SHALL roll back optimistic updates and show an error alert.
- WHEN the Completed or Archived list is empty THEN the system SHALL show an empty state (no crash, no blank screen).
- IF a goal's linked accounts cover 100%+ of the target at creation time THEN the system SHALL immediately display the "Meta atingida" state on the new goal.
- WHEN a deposit is made from an account whose currency differs from the goal currency THEN the system SHALL convert using current quotes, exactly as regular multi-currency transfers do.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| GOAL-01 | P1: Entry & List — options-menu navigation | - | Implementing |
| GOAL-02 | P1: Entry & List — active goal cards | - | Implementing |
| GOAL-03 | P1: Entry & List — empty state | - | Implementing |
| GOAL-04 | P1: Entry & List — create FAB | - | Implementing |
| GOAL-05 | P1: Entry & List — hideAmount masking | - | Implementing |
| GOAL-06 | P1: Entry & List — navigation to Completed/Archived | - | Implementing |
| GOAL-07 | P1: Create — goal + virtual account creation | - | Implementing |
| GOAL-08 | P1: Create — form validation | - | Implementing |
| GOAL-09 | P1: Create — link existing accounts | - | Implementing |
| GOAL-10 | P1: Create — deadline validation | - | Implementing |
| GOAL-11 | P1: Create — API failure rollback | - | Implementing |
| GOAL-12 | P1: Details — deposit as transfer | - | Implementing |
| GOAL-13 | P1: Details — withdrawal as transfer | - | Implementing |
| GOAL-14 | P1: Details — withdraw-over-balance rejection | - | Implementing |
| GOAL-15 | P1: Details — duplicate-submission guard | - | Implementing |
| GOAL-16 | P1: Details — multi-currency conversion | - | Implementing |
| GOAL-17 | P1: Details — history newest-first | - | Implementing |
| GOAL-18 | P1: Details — query refresh after mutation | - | Implementing |
| GOAL-19 | P1: Completion — "Meta atingida" flag | - | Implementing |
| GOAL-20 | P1: Completion — manual conclude | - | Implementing |
| GOAL-21 | P1: Completion — completed list content | - | Implementing |
| GOAL-22 | P1: Completion — completed read-only | - | Implementing |
| GOAL-23 | P1: Completion — completed empty state | - | Implementing |
| GOAL-24 | P1: Visibility — excluded from Accounts tab/lists | - | Implementing |
| GOAL-25 | P1: Visibility — included in Net Worth | - | Implementing |
| GOAL-26 | P1: Visibility — excluded from pickers | - | Implementing |
| GOAL-27 | P1: Visibility — net worth unchanged by deposit | - | Implementing |
| GOAL-28 | P2: Edit — persist & recompute | - | Implementing |
| GOAL-29 | P2: Edit — target ≤ current keeps ACTIVE + flag | - | Implementing |
| GOAL-30 | P2: Edit — unlink account | - | Implementing |
| GOAL-31 | P2: Archive — archive with previous status | - | Implementing |
| GOAL-32 | P2: Archive — archived list | - | Implementing |
| GOAL-33 | P2: Archive — unarchive restores previous | - | Implementing |
| GOAL-34 | P2: Archive — archived read-only | - | Implementing |
| GOAL-35 | P2: Archive — archived empty state | - | Implementing |
| GOAL-36 | P2: Delete — zero-balance delete | - | Implementing |
| GOAL-37 | P2: Delete — transfer-back then delete | - | Implementing |
| GOAL-38 | P2: Delete — unlink real accounts | - | Implementing |
| GOAL-39 | P2: Delete — transfer-relation integrity | - | Implementing |
| GOAL-40 | P2: Delete — abort on transfer-back failure | - | Implementing |
| GOAL-41 | P2: Interplay — linked account deletion unlinks | - | Implementing |
| GOAL-42 | P2: Interplay — reserve untouched by account deletion | - | Implementing |

**Coverage:** 42 total, 42 mapped to tasks (T1–T21), 0 unmapped — all Implemented, pending Verifier pass

---

## Success Criteria

- [ ] User can create a goal and complete a first deposit in under 2 minutes.
- [ ] Total Net Worth is byte-identical before and after any deposit/withdrawal/delete flow (only ownership-internal transfers).
- [ ] No virtual reserve account ever renders in the Accounts tab or account pickers (verified by tests).
- [ ] All P1 acceptance criteria pass automated tests; P2 criteria pass automated tests before the feature ships.
