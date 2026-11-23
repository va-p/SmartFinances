# Synced Subscriptions Context

**Gathered:** 2026-11-23
**Spec:** `.specs/features/synced-subscriptions/spec.md`
**Status:** Approved

---

## Feature Boundary

Correct subscription designation for Openi-imported transactions. Synced charges join a series without transaction recurrence or generated children. Future matching charges join that series automatically. Gemini detects subscriptions in new imports and supplies optional forecast periodicity. Manual accounts keep their existing recurring-subscription behavior.

---

## Implementation Decisions

### Designation and account type

- Selecting a synced transaction in the subscription picker designates it directly.
- That path does not open RegisterTransaction or RecurrenceSelect.
- Selecting a manual-account transaction keeps the existing editor flow.
- Synced designation never changes recurrence fields and never creates transactions.

### Series dismissal

- "Não é uma assinatura" applies to the entire synced series.
- Every linked charge is undesignated.
- Future matching charges are not automatically classified while the series remains dismissed.
- Explicit manual designation can reactivate a dismissed series.

### Forecasts

- Gemini periodicity is forecast metadata only.
- MONTHLY and YEARLY forecasts never make a synced transaction recurring.
- Unknown or unreliable periodicity leaves the subscription visible without a forecast.
- The UI shows "Sem previsão da próxima cobrança" when no forecast exists.
- Actual imported charges appear as paid payments; forecasts never duplicate them.

### Automatic detection and provider fallback

- Gemini detection runs as part of new Openi transaction imports.
- Gemini remains the primary provider.
- The analysis contract accepts one optional fallback provider.
- A configured fallback runs once only for a failed primary batch.
- Total detection failure never fails the import.
- Provider-specific branching stays out of import and subscription logic.
- No automatic historical backfill runs in this feature.

### Agent's Discretion

- Series identity defaults to user, synced account, canonical merchant, and direction.
- Automatic detection is limited to DEBIT charges; manual CREDIT/DEBIT designation remains available.
- Forecast interval is 1 from the latest actual payment.
- Series preferences survive transaction deletion; empty active series stay hidden.
- The latest linked charge supplies list amount, currency, category, and last payment date.
- Synced series do not expose the legacy transaction recurrence editor.

### Declined / Undiscussed Gray Areas → Assumptions

No gray area was dropped. The defaults listed under Agent's Discretion are recorded in the specification's Assumptions & Open Questions table for approval.

---

## Specific References

- Existing entry point: `src/screens/Subscriptions/index.tsx`.
- Existing manual behavior: RegisterTransaction subscription selection enables recurrence and asks for its period.
- Existing AI integration: backend Gemini transaction categorization.
- User requirement: Openi remains responsible for all future synced charges.

---

## Deferred Ideas

- Compare fallback LLMs for cost, quality, latency, structured-output support, data retention, and API compatibility.
- Evaluate whether the user's OpenCode Go Plus subscription can serve production backend requests under its terms and API limits.
- Model catalog supplied by the user: https://opencode.ai/console/models. The page lists per-token API pricing separately from OpenCode Go subscriptions, so subscription entitlements must be verified before choosing it.
