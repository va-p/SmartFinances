# Synced Subscriptions Specification

## Problem Statement

Marking an Openi-imported transaction as a subscription currently forces transaction recurrence. The recurring engine can then create a charge that Openi will also import, producing duplicates. The current read model also treats every subscription as one recurring parent, so it cannot group multiple imported charges into one subscription or remember a user's rejection of automatic classification.

## Goals

- [ ] Designate an imported charge as a subscription without changing transaction recurrence or generating charges.
- [ ] Group future charges from the same subscription into one visible series.
- [ ] Let the user dismiss an entire series and suppress its future automatic classification.
- [ ] Detect subscriptions during import with Gemini without making import success depend on Gemini.
- [ ] Support an optional provider-neutral fallback for failed LLM batches.
- [ ] Use detected periodicity only for forecasts, with an explicit empty state when no forecast is available.
- [ ] Preserve the existing recurring-subscription behavior for manual accounts.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Automatic scan of previously imported history | The requested automatic detection applies to new imports; manual designation covers an existing charge |
| LLM detection for manually created transactions | Manual accounts already use monthly/yearly recurrence for automatic classification |
| Automatic generation of synced charges | Openi remains the only source of new synced transactions |
| Manual editing of a synced series' forecast | This iteration uses Gemini's periodicity or no forecast; it does not add a forecast editor |
| Selecting and integrating a concrete fallback LLM | This iteration adds the provider-neutral fallback seam; the OpenCode Go Plus cost-benefit decision comes later |
| Merging two existing series or editing merchant aliases | Not needed for the requested designation and future-matching flow |
| Changes to transfer classification | Transfers remain ineligible for subscriptions |
| Changes to manual recurring transaction generation | The existing behavior is correct for manual accounts |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here. Nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Selecting an existing synced charge | Create or reactivate its subscription directly, without opening RegisterTransaction | The user asked for a mark-only flow and no recurrence side effects | y |
| Selecting an existing manual charge | Keep opening RegisterTransaction with advanced selectors expanded | Manual subscriptions still depend on user-controlled recurrence | y |
| Series identity | Same user, synced account, canonical merchant, and transaction direction | Account scoping avoids merging distinct contracts paid from different accounts | n |
| Dismissing a series | Dismiss all linked charges and suppress future automatic classification | Confirmed product decision | y |
| Explicit designation after dismissal | A new manual designation reactivates the dismissed series | An explicit user action takes precedence over the automatic-classification block | n |
| Automatic transaction direction | Only imported DEBIT charges are auto-detected; manual CREDIT/DEBIT designation remains available | Subscription charges are outflows; this limits false positives from refunds | n |
| Forecast interval | MONTHLY and YEARLY forecasts use interval 1 from the latest imported payment | Gemini is asked for monthly/yearly periodicity, not arbitrary recurrence intervals | n |
| Empty active series | Keep the matching preference but omit the series from the visible list until another charge arrives | Deleting history must not erase a dismissal or recreate a visible empty subscription | n |
| Representative list values | Use the latest linked charge for amount, currency, category, and last payment date | Imported amounts and categories can change over time | n |
| Synced details editor | Do not offer the legacy amount/date/recurrence editor for a synced series | That editor mutates the anchor transaction and would reintroduce recurrence coupling | n |
| LLM fallback | Gemini remains primary; an optional fallback implements the same batch contract and runs only for failed primary batches | A second provider can be added later without changing import or subscription logic | y |
| No-forecast copy | Show "Sem previsão da próxima cobrança" | Friendly, direct, and accurate when Gemini cannot determine periodicity | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Designate a synced charge without recurrence ⭐ MVP

**User Story**: As a user with a synced account, I want to mark an imported charge as a subscription so that it appears in my subscriptions without creating duplicate future charges.

**Why P1**: This removes the data-duplication defect in the current flow.

**Acceptance Criteria**:

1. WHEN the user selects a CREDIT or DEBIT transaction from a synced account in the subscription picker THEN the app SHALL submit the subscription designation directly and SHALL NOT open RegisterTransaction or RecurrenceSelect. <!-- event-driven -->
2. WHEN a synced transaction is designated THEN the backend SHALL preserve its existing `is_recurring`, `recurrence_interval`, `recurrence_period`, and `next_occurrence_at` values. <!-- event-driven -->
3. WHEN a synced transaction is designated THEN the backend SHALL NOT create a recurring child or any other transaction. <!-- event-driven -->
4. WHEN the user selects a transaction from a manual account in the subscription picker THEN the app SHALL open RegisterTransaction in edit mode with advanced selectors expanded. <!-- event-driven -->
5. WHILE a subscription is being designated in a manual account THEN the app SHALL preserve the existing requirement for MONTHLY or YEARLY transaction recurrence. <!-- state-driven -->
6. WHEN synced designation succeeds THEN the app SHALL dismiss the picker and choice modals and refresh the subscriptions list. <!-- event-driven -->
7. IF synced designation fails THEN the app SHALL keep the picker open and show the alert "Assinatura" / "Não foi possível adicionar a assinatura. Verifique sua conexão e tente novamente." <!-- unwanted-behavior -->
8. WHEN the same synced transaction is designated more than once through retries or repeated taps THEN the backend SHALL return the same active series and SHALL NOT duplicate its membership. <!-- event-driven -->
9. WHEN the user changes the "Assinatura" selector while editing any transaction linked to a synced series THEN the backend SHALL apply that choice to the whole series and SHALL NOT change transaction recurrence. <!-- event-driven -->
10. The backend SHALL accept synced designation only for an authenticated user's own CREDIT or DEBIT transaction whose account has a banking integration. <!-- ubiquitous -->
11. IF the designation target belongs to another user THEN the backend SHALL respond with HTTP 404. <!-- unwanted-behavior -->
12. IF the designation target is a transfer or belongs to an unsynced account THEN the backend SHALL respond with HTTP 422. <!-- unwanted-behavior -->

**Independent Test**: Select one imported Netflix charge. The picker closes after a successful save, Netflix appears once in "Minhas assinaturas", and the transaction remains non-recurring with no generated children.

---

### P1: Group charges and honor series dismissal ⭐ MVP

**User Story**: As a user, I want later charges from the same service to join the same subscription, and I want "Não é uma assinatura" to stop that classification permanently unless I explicitly restore it.

**Why P1**: Independent flags on every imported charge would duplicate list entries and undo the user's correction on the next sync.

**Acceptance Criteria**:

1. WHEN a new imported charge has the same canonical merchant and direction in the same synced account as an active series THEN the backend SHALL link it to that series. <!-- event-driven -->
2. The subscriptions list SHALL contain at most one entry per active series regardless of its number of linked charges. <!-- ubiquitous -->
3. The series list entry SHALL use the latest linked charge for amount, currency, category, and last payment date. <!-- ubiquitous -->
4. WHEN two matching charges are imported concurrently and no series exists THEN the backend SHALL create at most one series for that user, account, canonical merchant, and direction. <!-- event-driven -->
5. WHEN the user chooses "Não é uma assinatura" for a synced series THEN the backend SHALL undesignate every charge linked to that series. <!-- event-driven -->
6. WHILE a synced series is dismissed THEN the backend SHALL exclude it from the subscriptions list and SHALL NOT automatically link future matching charges. <!-- state-driven -->
7. WHEN the user explicitly designates a charge matching a dismissed series THEN the backend SHALL reactivate that series and link the selected charge. <!-- event-driven -->
8. WHEN a synced series is hidden with "Ocultar da lista" THEN the backend SHALL keep its automatic future-charge matching active. <!-- event-driven -->
9. WHEN a linked imported transaction is deleted THEN the backend SHALL preserve the series preference and all other linked transactions. <!-- event-driven -->
10. WHILE an active synced series has no linked transactions THEN the backend SHALL omit it from the visible subscriptions list. <!-- state-driven -->

**Independent Test**: Mark one imported charge, import a later matching charge, and verify one series with two payments. Dismiss the series, import another matching charge, and verify that neither the series nor the new charge is classified automatically.

---

### P2: Detect subscriptions with Gemini during import

**User Story**: As a user with a synced account, I want obvious subscription charges to be recognized during import so that I do not need to mark each new service manually.

**Why P2**: Automatic detection improves the corrected flow but is not required to eliminate recurrence duplication.

**Acceptance Criteria**:

1. WHEN new Openi transactions are categorized THEN the backend SHALL request subscription classification only for DEBIT bank and credit-card transactions. <!-- event-driven -->
2. The Gemini response schema SHALL include a subscription boolean, a canonical merchant key, and a nullable MONTHLY or YEARLY periodicity for each analyzed transaction. <!-- ubiquitous -->
3. WHEN Gemini classifies an imported charge as a subscription THEN the backend SHALL create or reuse the matching active series and link the charge. <!-- event-driven -->
4. WHEN Gemini classifies a charge as a subscription without a reliable MONTHLY or YEARLY periodicity THEN the backend SHALL retain the subscription classification and store no forecast periodicity. <!-- event-driven -->
5. IF Gemini does not classify a charge as a subscription or omits a valid subscription result THEN the backend SHALL import the charge without automatic subscription classification. <!-- unwanted-behavior -->
6. IF every configured LLM provider fails, times out, or returns malformed subscription data for a batch THEN the backend SHALL complete that batch's transaction import with the existing category fallback and without automatic subscription classification. <!-- unwanted-behavior -->
7. WHEN subscription detection fails THEN the backend SHALL log the failure without payer names, documents, account balances, or raw provider payloads. <!-- event-driven -->
8. The import pipeline SHALL reuse the existing batched categorization request for subscription detection and SHALL NOT make an additional Gemini request per transaction. <!-- ubiquitous -->
9. The backend SHALL NOT send payer names, payer documents, receiver documents, or account balances in the subscription-detection payload. <!-- ubiquitous -->
10. The backend SHALL NOT run automatic subscription detection over transactions imported before this feature is deployed. <!-- ubiquitous -->
11. WHERE a fallback LLM provider is configured, WHEN the primary provider fails for a batch THEN the backend SHALL retry that batch once with the fallback through the same analysis contract. <!-- optional-feature -->
12. WHEN the primary LLM provider returns a valid result for a batch THEN the backend SHALL NOT call the fallback provider for that batch. <!-- event-driven -->
13. The import pipeline SHALL depend on a provider-neutral batch-analysis contract with one primary and one optional fallback, without provider-specific branching in import or subscription logic. <!-- ubiquitous -->

**Independent Test**: Import a new Netflix DEBIT charge with a stubbed Gemini response marking it monthly. Verify one subscription with a monthly forecast. Repeat with Gemini failing and a fallback returning a valid result, then with both providers failing, and verify the respective enriched and unclassified successful imports.

---

### P2: Forecast synced payments without generating transactions

**User Story**: As a user, I want to see the next expected synced charge when periodicity is known, and a clear message when it is not, so that forecasts are useful without pretending they are imported payments.

**Why P2**: Forecasting completes the subscriptions experience while keeping Openi as the source of synced charges.

**Acceptance Criteria**:

1. WHILE a synced series has MONTHLY or YEARLY forecast periodicity THEN the backend SHALL expose a next payment forecast calculated from its latest linked payment with interval 1 and short-month day clamping. <!-- state-driven -->
2. WHILE a synced series has forecast periodicity THEN the backend SHALL keep all linked transactions non-recurring unless the user independently changed their recurrence outside this flow. <!-- state-driven -->
3. WHILE a synced series has no reliable forecast periodicity THEN the backend SHALL return `next_payment_at: null`. <!-- state-driven -->
4. WHILE a synced series has no reliable forecast periodicity THEN the app SHALL show "Sem previsão da próxima cobrança" in its list item and details screen. <!-- state-driven -->
5. WHEN subscription payments are requested for a month containing linked imported charges THEN the backend SHALL return those actual charges as paid on their actual transaction dates and with their actual amounts. <!-- event-driven -->
6. WHEN subscription payments are requested for a forecast month that already contains a linked charge for the same expected occurrence THEN the backend SHALL NOT add a duplicate forecast row. <!-- event-driven -->
7. The recurring payment schedule and automatic child generation for manual-account subscriptions SHALL remain unchanged. <!-- ubiquitous -->

**Independent Test**: A monthly series with a charge on January 31 forecasts February 28 or 29 according to the year. Import the February charge and verify one paid row, not a paid row plus a forecast. Clear periodicity and verify the friendly no-forecast message.

---

## Edge Cases

- IF the same provider transaction is delivered again THEN the backend SHALL preserve the provider deduplication guarantee and SHALL NOT duplicate its series membership.
- IF Gemini returns a merchant key matching a dismissed series THEN the backend SHALL import the charge without linking it to that series.
- IF Gemini returns periodicity outside MONTHLY or YEARLY THEN the backend SHALL store no forecast periodicity for that classification.
- IF the latest linked charge is deleted THEN the backend SHALL recompute the representative values from the remaining latest charge.
- IF a synced series has no reliable periodicity THEN the subscriptions footer SHALL exclude it from upcoming-payment totals.
- IF a manual-account transaction is marked as a subscription without qualifying recurrence THEN the existing RegisterTransaction flow SHALL request MONTHLY or YEARLY recurrence before saving.

---

## Implicit Requirement Coverage

| Dimension | Resolution |
| --------- | ---------- |
| Input validation and bounds | SSI-10..12 restrict designation to owned, synced, plain transactions; existing transaction and month schemas remain enforced |
| Failure and partial-failure states | SSI-07 preserves the picker on save failure; SSI-28 keeps imports successful during detection failure |
| Idempotency, retry, and duplicates | SSI-08, SSI-16, and the provider-dedup edge case prevent duplicate series and memberships |
| Auth boundaries and rate limits | SSI-10..12 enforce ownership; SSI-30 reuses Gemini batching and its existing pacing |
| Concurrency and ordering | SSI-16 requires one series under concurrent matching imports; latest-payment rules use transaction dates |
| Data lifecycle and expiry | SSI-21..22 preserve preferences and remaining history after deletion; no TTL is introduced because series preferences must persist |
| Observability | SSI-29 requires sanitized detection-failure logs |
| External-dependency failure | SSI-28 and SSI-40..42 define primary failure, optional fallback, and final unclassified import |
| State-transition integrity | SSI-17..20 define active, dismissed, explicitly reactivated, and hidden states |

---

## Requirement Traceability

Each acceptance criterion maps to one requirement ID in story order.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SSI-01 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-02 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-03 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-04 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-05 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-06 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-07 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-08 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-09 | P1: Designate a synced charge | Tasks | Implementing |
| SSI-10 | P1: Designate a synced charge | Tasks | Verified |
| SSI-11 | P1: Designate a synced charge | Tasks | Verified |
| SSI-12 | P1: Designate a synced charge | Tasks | Verified |
| SSI-13 | P1: Group charges and dismissal | Tasks | Verified |
| SSI-14 | P1: Group charges and dismissal | Tasks | Implementing |
| SSI-15 | P1: Group charges and dismissal | Tasks | Implementing |
| SSI-16 | P1: Group charges and dismissal | Tasks | Verified |
| SSI-17 | P1: Group charges and dismissal | Tasks | Implementing |
| SSI-18 | P1: Group charges and dismissal | Tasks | Implementing |
| SSI-19 | P1: Group charges and dismissal | Tasks | Verified |
| SSI-20 | P1: Group charges and dismissal | Tasks | Implementing |
| SSI-21 | P1: Group charges and dismissal | Tasks | Verified |
| SSI-22 | P1: Group charges and dismissal | Tasks | Verified |
| SSI-23 | P2: Gemini detection | Tasks | Verified |
| SSI-24 | P2: Gemini detection | Tasks | Verified |
| SSI-25 | P2: Gemini detection | Tasks | Verified |
| SSI-26 | P2: Gemini detection | Tasks | Verified |
| SSI-27 | P2: Gemini detection | Tasks | Verified |
| SSI-28 | P2: Gemini detection | Tasks | Verified |
| SSI-29 | P2: Gemini detection | Tasks | Verified |
| SSI-30 | P2: Gemini detection | Tasks | Verified |
| SSI-31 | P2: Gemini detection | Tasks | Verified |
| SSI-32 | P2: Gemini detection | Tasks | Verified |
| SSI-33 | P2: Forecast synced payments | Tasks | Verified |
| SSI-34 | P2: Forecast synced payments | Tasks | Verified |
| SSI-35 | P2: Forecast synced payments | Tasks | Implementing |
| SSI-36 | P2: Forecast synced payments | Tasks | Implementing |
| SSI-37 | P2: Forecast synced payments | Tasks | Implementing |
| SSI-38 | P2: Forecast synced payments | Tasks | Implementing |
| SSI-39 | P2: Forecast synced payments | Tasks | Implementing |
| SSI-40 | P2: Gemini detection | Tasks | Verified |
| SSI-41 | P2: Gemini detection | Tasks | Verified |
| SSI-42 | P2: Gemini detection | Tasks | Verified |

**ID format:** `SSI-NN` (synced subscriptions)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 42 total, 42 mapped to tasks, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] A synced charge can become a subscription without any recurrence field changing and without any new transaction being generated.
- [ ] Repeated matching imports produce one visible series with multiple actual payments.
- [ ] Dismissing a series survives later imports until explicit manual reactivation.
- [ ] A failed primary batch uses a configured fallback exactly once; total provider failure causes zero failed imports and zero automatic classifications for that batch.
- [ ] A series without reliable periodicity shows the specified no-forecast message and never enters upcoming-payment totals.
- [ ] Existing manual recurring subscription tests pass without behavioral changes.
