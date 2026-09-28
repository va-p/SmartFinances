import { getISOWeek, getISOWeekYear } from 'date-fns';

type PeriodType = 'weeks' | 'months' | 'years' | 'all';

// Single source of truth for "does this date fall inside the selected period".
// Weeks are ISO 8601 (Monday-Sunday) and compared by ISO week-year so
// year-boundary dates (e.g., 2025-12-29 is ISO week 1 of 2026) group correctly.
export function isDateInSelectedPeriod(
  date: Date,
  selectedDate: Date,
  period: PeriodType
): boolean {
  switch (period) {
    case 'weeks':
      return (
        getISOWeek(date) === getISOWeek(selectedDate) &&
        getISOWeekYear(date) === getISOWeekYear(selectedDate)
      );
    case 'months':
      return (
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    case 'years':
      return date.getFullYear() === selectedDate.getFullYear();
    case 'all':
      return true;
    default:
      return false;
  }
}
