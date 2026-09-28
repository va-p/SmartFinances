# Weekly Period Filter Context

**Gathered:** 2026-09-27
**Spec:** `.specs/features/weekly-period-filter/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Add a `weeks` ("Semanas") option to the shared `ChartPeriodSelect` period filter so transactions on the Home, Account, Overview, and TransactionsByCategory screens can be filtered and grouped by week, with full PeriodRuler and arrow-navigation support. Client-side only — no backend changes, no new screens.

---

## Implementation Decisions

### Week definition

- Weeks are **ISO 8601 weeks: Monday–Sunday** (user confirmed option A).
- Rationale: deterministic, locale-independent `date-fns` ISO helpers (`getISOWeek`, `getISOWeekYear`, `getISOWeeksInYear`, `endOfISOWeek`, `addWeeks`/`subWeeks` — all available in the project's date-fns ^2.22.1); standard for finance.
- ISO week-year is used everywhere (labels, grouping), never the calendar year — they diverge at year boundaries (e.g., 2026-12-28 → 2027-01-03 is ISO week 1 of 2027).

### PeriodRuler content in weeks mode

- The ruler shows **all ISO weeks of the selected date's ISO week-year** (52 or 53 items; 2026 has 53), newest-first — mirrors months mode showing all 12 months of the selected year (user confirmed option A).
- Label format: `Sem N \n YYYY` (unpadded ISO week number, ISO week-year) — matches the existing `MMM \n yyyy` two-line label style.
- The week containing the selected date is the single active item; the ruler auto-scrolls to it (existing `PeriodRuler` behavior).

### Cash-flow chart in weeks mode

- One revenue/expense bar-pair **per ISO week with at least one transaction, across all history** — mirrors months mode exactly (user confirmed option A).
- Bar labels use the same `Sem N \n YYYY` format; chronological order (oldest → newest), as today.

### Navigation semantics (assumed defaults, consistent with existing periods)

- Arrow buttons move the selected date **±1 week** (`subWeeks`/`addWeeks`).
- Tapping a ruler week sets the selected date to the **last day of that ISO week (Sunday)** — mirrors months → `lastDayOfMonth`, years → `lastDayOfYear`.
- "Semanas" is listed **first** in the picker (smallest → largest: Semanas, Meses, Anos, Tudo).
- Overview (no ruler/arrows of its own) follows the same semantics: category totals filtered to the selected ISO week; net-worth evolution grouped by ISO week.

### Agent's Discretion

- Internal consolidation of the triplicated ruler/navigation logic (Home `PeriodRulerList`, Account `_renderPeriodRuler`/`handleDateChange` inline copies) into the shared `buildPeriodRulerDates` util and `useDateNavigation` hook — technical design decision, blessed as a follow-up by STATE.md decision #32. Behavior preservation vs. enabling tap-to-jump on Account is logged as an assumption in the spec.

### Declined / Undiscussed Gray Areas → Assumptions

- None — all three presented gray areas were decided by the user (above). Remaining low-stakes defaults are recorded in the spec's Assumptions & Open Questions.

---

## Specific References

- Existing period contract documented in STATE.md decision #32 (`all` navigates like `months`; ruler built by `buildPeriodRulerDates`).
- Label style reference: months ruler labels are `MMM \n yyyy` (e.g., `Ago \n 2026`); years are plain `yyyy`.

---

## Deferred Ideas

- None — discussion stayed within feature scope.
