# Subscription Designation Specification

## Problem Statement

The Subscriptions screen only creates subscriptions through a new
RegisterTransaction. Users cannot turn an already-registered transaction
(notably bank/credit-card synced imports) into a subscription, and
RegisterTransaction has no control to designate a transaction as a
subscription. The backend already supports everything: `is_subscription`
and `hide_from_subscription_list` on create/update, and the subscription
read model (`isSubscription` + `isRecurring` + `recurrencePeriod` in
{MONTHLY, YEARLY}).

## Goals

- [ ] The "+" button on Subscriptions offers a choice: select an existing
      transaction or create a new one.
- [ ] Selecting an existing transaction opens it in RegisterTransaction
      (edit mode) ready to be designated as a subscription.
- [ ] RegisterTransaction gains a subscription designation selector,
      hidden by default behind a minimalist accordion (reusable for
      future selectors).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Backend changes | All endpoints and flags already exist (subscription-management R1-R7) |
| Direct "auto-mark" on selection | Designation happens in RegisterTransaction, keeping recurrence (period, billing day) under user control |
| Bulk-edit designation | Out of the requested scope; accordion hidden in bulk mode |
| Transfer designation | Transfers are internal movements, never subscriptions (backend convention) |
| Picker search/pagination | Matches the existing select-screen pattern (AccountSelect): flat list + refresh |
| Hide/unhide management | Stays in SubscriptionDetails (AC15.4/AC15.5 of subscription-management) |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| What "select an existing transaction" does | Opens RegisterTransaction in edit mode with that transaction's id (no direct PATCH) | The requested accordion selector is the designation mechanism and is explicitly aimed at synced transactions; the screen's `transactionId` state is pre-wired for this; the user keeps control of recurrence before saving | n |
| Accordion state after picking a transaction | Starts expanded (only on this path; collapsed everywhere else) | The picker's intent is designation; a collapsed accordion at the moment of need is a dead end | n |
| Toggle coupling | Subscription requires `isRecurring` + period in {MONTHLY, YEARLY} (read-model constraint): turning "Assinatura" ON forces recurrence ON and normalizes DAILY/WEEKLY to MONTHLY; turning "Recorrente" OFF or saving a DAILY/WEEKLY recurrence un-designates | Prevents saving states the subscriptions list can never show | n |
| `is_subscription` in create payload | Send `is_subscription: true` only when the toggle is ON; omit when OFF | The backend auto-classifies recurring monthly/yearly creates; sending an explicit false would break that and the help copy ("Crie transações recorrentes... para identificá-las automaticamente") | n |
| `is_subscription` in edit payload | Always send the toggle value (ON keeps/sets, OFF un-designates) | Matches PATCH semantics; un-designating an existing subscription from the editor must persist | n |
| Picker candidates | `type` in {CREDIT, DEBIT} and not already `is_subscription` (hidden ones included in the exclusion) | Transfers are never subscriptions; already-designated ones are managed in SubscriptionDetails | n |
| Accordion visuals | Header = rule line + chevron + rule line (———v———), chevron rotates 180° (collapsed v to expanded ^), content fades in/out; reusable component `src/components/Accordion` | The user's requested minimalist design; rotation follows the SubscriptionDetails `RotatingCaret` pattern | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Subscription entry choice on the Subscriptions screen ⭐ MVP

**User Story**: As a user, I want the "+" button to let me choose between
turning an existing transaction into a subscription or creating a new one,
so that I do not have to re-enter data for payments my bank already
imported.

**Why P1**: This is the entry point of the feature; without it the
existing-transaction path does not exist.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the user taps the "+" HeaderIconButton on the Subscriptions screen THEN the app SHALL present the "Adicionar assinatura" choice modal and SHALL NOT present the RegisterTransaction sheet directly. <!-- event-driven -->
2. The choice modal SHALL offer exactly two options: "Selecionar transação existente" (subtitle "Inclui transações importadas de contas sincronizadas") and "Criar nova transação" (subtitle "Cadastre uma nova transação recorrente"). <!-- ubiquitous -->
3. WHEN the user chooses "Criar nova transação" THEN the app SHALL dismiss the choice modal and present RegisterTransaction in create mode (empty id). <!-- event-driven -->
4. WHEN the user chooses "Selecionar transação existente" THEN the app SHALL present the "Selecione a transação" picker modal stacked over the choice modal, keeping the choice modal presented beneath it. <!-- event-driven -->
5. WHEN the user dismisses the picker modal (pan-down or backdrop) THEN the app SHALL return to the choice modal still presented, with no editor open. <!-- event-driven -->

**Independent Test**: Tap "+", see the choice modal; tap "Criar nova
transação", see the empty RegisterTransaction form.

---

### P1: Transaction picker (select an existing transaction) ⭐ MVP

**User Story**: As a user, I want to pick one of my registered
transactions to be designated as a subscription, so that synced
bank/card payments can become subscriptions without re-entering them.

**Why P1**: The requested "select an existing transaction" capability.

**Acceptance Criteria**:

1. The picker SHALL list only designation candidates: `type` CREDIT or DEBIT and not already `is_subscription` (transfers and already-designated transactions, including hidden ones, excluded). <!-- ubiquitous -->
2. WHEN the user taps a candidate THEN the picker SHALL call `setTransaction` with it followed by `closeSelectTransaction`, and the Subscriptions screen SHALL dismiss the picker and the choice modal, set the edit id to the tapped transaction, and present RegisterTransaction in edit mode with the advanced-selectors accordion expanded. <!-- event-driven -->
3. WHEN no candidate exists THEN the picker SHALL show the empty state "Nenhuma transação elegível. Apenas transações de crédito ou débito ainda não classificadas como assinatura podem ser selecionadas." <!-- event-driven -->
4. WHILE the transactions query is loading THEN the picker SHALL show the loading indicator. <!-- state-driven -->
5. IF the transactions query fails THEN the picker SHALL show the alert "Transações" / "Não foi possível buscar as suas transações. Verifique sua conexão com a internet e tente novamente." <!-- unwanted-behavior -->
6. The picker list SHALL support pull-to-refresh. <!-- ubiquitous -->

**Independent Test**: With a synced DEBIT transaction present, tap "+",
"Selecionar transação existente", tap it: the editor opens with that
transaction's data and the accordion expanded.

---

### P1: Subscription designation selector in a minimalist accordion (RegisterTransaction) ⭐ MVP

**User Story**: As a user, I want a selector in RegisterTransaction to
mark a transaction as a subscription, hidden by default behind a
minimalist accordion, so that the form stays uncluttered.

**Why P1**: The requested designation mechanism, and the destination of
the picker flow.

**Acceptance Criteria**:

1. The RegisterTransaction form SHALL hide the subscription designation selector behind a collapsed accordion by default; the accordion header SHALL render as a rule line, a chevron and a rule line (———v———), with the chevron rotating 180 degrees between collapsed (v) and expanded (^) and the content mounting/unmounting with fade transitions. <!-- ubiquitous -->
2. WHEN the user taps the accordion header THEN the app SHALL toggle the expanded state and mount/unmount the selector accordingly. <!-- event-driven -->
3. The accordion SHALL render only for plain transactions: not on the Transfer tab and not in bulk-edit mode. <!-- ubiquitous (WHERE-style: plain transactions only) -->
4. WHEN RegisterTransaction is opened through the transaction picker path THEN the accordion SHALL start expanded; WHEN opened through any other path THEN it SHALL start collapsed. <!-- event-driven -->
5. WHEN the user turns the "Assinatura" toggle on THEN the app SHALL set the designation on, set `isRecurring` true, and keep the recurrence period when it is MONTHLY or YEARLY or otherwise set it to MONTHLY. <!-- event-driven -->
6. WHEN the user turns the "Assinatura" toggle on while the recurrence does not qualify (not recurring, or DAILY/WEEKLY period) THEN the app SHALL also open the RecurrenceSelect modal. <!-- event-driven -->
7. WHEN the user turns the "Recorrente" toggle off THEN the app SHALL also set the designation off. <!-- event-driven -->
8. WHILE a transaction is designated, WHEN the user saves a DAILY or WEEKLY recurrence in RecurrenceSelect THEN the app SHALL set the designation off. <!-- complex -->
9. WHEN RegisterTransaction opens in edit mode for a transaction with `is_subscription` true THEN the "Assinatura" toggle SHALL present on; with false or absent THEN it SHALL present off. <!-- event-driven -->
10. The "Assinatura" toggle SHALL show the subtitle 'Aparece em "Minhas assinaturas"' while on, and no subtitle while off. <!-- ubiquitous -->

**Independent Test**: Open any transaction in the editor, expand the
accordion, toggle "Assinatura" on: recurrence becomes monthly and the
RecurrenceSelect modal opens.

---

### P1: Designation payload wiring ⭐ MVP

**User Story**: As a user, I want the designation I choose to persist
when I save, so that the transaction appears in (or leaves) "Minhas
assinaturas".

**Why P1**: Without payload wiring nothing persists.

**Acceptance Criteria**:

1. WHEN creating a plain transaction with the "Assinatura" toggle on THEN the create payload SHALL include `is_subscription: true`. <!-- event-driven -->
2. The create payload SHALL omit the `is_subscription` field when the toggle is off, preserving the backend's auto-classification of recurring monthly/yearly creates. <!-- ubiquitous -->
3. WHEN editing a plain transaction THEN the edit payload SHALL include `is_subscription` with the toggle value (`true` keeps/sets the designation, `false` un-designates). <!-- event-driven -->
4. The transfer create/edit payloads SHALL NOT include an `is_subscription` field. <!-- ubiquitous -->
5. WHEN a designated transaction is saved (create or edit) THEN the payload SHALL also carry `is_recurring: true` with a MONTHLY or YEARLY `recurrence_period`, so the saved row matches the subscriptions read model. <!-- event-driven -->

**Independent Test**: Designate a synced DEBIT transaction as "Assinatura"
(monthly), save, and see it listed on the Subscriptions screen after
refetch.

---

## Edge Cases

- IF no picker candidates exist THEN the empty state SHALL explain the eligibility rules (P1: Transaction picker, AC 3).
- IF the user designates a WEEKLY recurring transaction THEN the period SHALL normalize to MONTHLY on designation (P1: Designation selector, AC 5).
- IF a designated transaction's recurrence is later saved as DAILY/WEEKLY THEN the designation SHALL drop (P1: Designation selector, AC 8).
- WHEN the picker's query fails THEN the alert SHALL state the retry hint (P1: Transaction picker, AC 5).
- IF the RegisterTransaction sheet is re-presented after a session THEN its designation state SHALL reset to the fresh-mount defaults (BottomSheetModal unmounts content on dismiss; fresh state per session).

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------- |
| SD-01 | P1: Subscription entry choice | Design | Pending |
| SD-02 | P1: Subscription entry choice | Design | Pending |
| SD-03 | P1: Subscription entry choice | Design | Pending |
| SD-04 | P1: Subscription entry choice | Design | Pending |
| SD-05 | P1: Subscription entry choice | Design | Pending |
| SD-06 | P1: Transaction picker | Design | Implementing (filter + screen done) |
| SD-07 | P1: Transaction picker | Design | Implementing (picker half done, screen flow T5) |
| SD-08 | P1: Transaction picker | Design | Implementing (screen done) |
| SD-09 | P1: Transaction picker | Design | Implementing (screen done) |
| SD-10 | P1: Transaction picker | Design | Implementing (screen done) |
| SD-11 | P1: Transaction picker | Design | Implementing (screen done) |
| SD-12 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-13 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-14 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-15 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-16 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-17 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-18 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-19 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-20 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-21 | P1: Designation selector in accordion | Design | Implementing (wired in RegisterTransaction) |
| SD-22 | P1: Designation payload wiring | Design | Implementing (wired in RegisterTransaction) |
| SD-23 | P1: Designation payload wiring | Design | Implementing (wired in RegisterTransaction) |
| SD-24 | P1: Designation payload wiring | Design | Implementing (wired in RegisterTransaction) |
| SD-25 | P1: Designation payload wiring | Design | Implementing (wired in RegisterTransaction) |
| SD-26 | P1: Designation payload wiring | Design | Implementing (wired in RegisterTransaction) |
| SD-27 | P1: Designation payload wiring | Design | Pending (screen flow T5) |

**ID format:** `SD-NN` (subscription designation)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 27 total, 27 mapped to tasks (see tasks.md), 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] A synced DEBIT transaction can be turned into a subscription in three taps ("+", "Selecionar transação existente", the transaction) plus one toggle and one save, and it then appears in "Minhas assinaturas".
- [ ] The RegisterTransaction form looks unchanged (accordion collapsed) until the user expands it.
- [ ] Full jest suite shows no new failures vs the pre-feature baseline (338 passed, 1 pre-existing failure, 2 pre-existing broken suites).
