import { addMonths, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type SubscriptionPeriodOption = {
  /** Month key in YYYY-MM format. */
  key: string;
  /** Display label, e.g. "Agosto 2026". */
  label: string;
  isActive: boolean;
};

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/** "2026-08" → "Agosto 2026" (PT-BR, capitalized). */
export function monthLabel(key: string): string {
  const [year, monthIndex] = key.split('-').map(Number);
  const label = format(new Date(year, monthIndex - 1, 1), 'MMMM yyyy', {
    locale: ptBR,
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Builds the period-selector window: the 12 months before the current month
 * through the 12 months after it (25 options), ascending. The current month
 * is active when no explicit selection is given (spec.md R9/AC9.1).
 */
export function buildSubscriptionPeriodOptions(
  selectedMonthKey?: string,
  today: Date = new Date(),
): SubscriptionPeriodOption[] {
  const currentMonth = startOfMonth(today);
  const options: SubscriptionPeriodOption[] = [];

  for (let offset = -12; offset <= 12; offset++) {
    const month = startOfMonth(addMonths(currentMonth, offset));
    const key = monthKey(month);
    options.push({
      key,
      label: monthLabel(key),
      isActive: selectedMonthKey ? key === selectedMonthKey : offset === 0,
    });
  }

  return options;
}
