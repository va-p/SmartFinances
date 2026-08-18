import { ptBR } from 'date-fns/locale';
import { parse, getYear, getMonth, isValid } from 'date-fns';

export type PeriodRulerDate = {
  date: string;
  isActive: boolean;
};

type PeriodType = 'months' | 'years' | 'all';

type BuildPeriodRulerDatesProps = {
  period: PeriodType;
  selectedDate: Date;
  /** Available years for the given context (e.g., the category's transactions). */
  years: number[];
};

const MONTH_ABBREVIATIONS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

// Builds the items rendered by the PeriodRuler: all 12 months of the selected
// year (periods 'months' and 'all') or the available years plus the selected
// year (period 'years'). Newest-first to match the ruler's inverted FlatList.
export function buildPeriodRulerDates({
  period,
  selectedDate,
  years,
}: BuildPeriodRulerDatesProps): PeriodRulerDate[] {
  if (period === 'years') {
    const yearsSet = new Set<number>(years);
    yearsSet.add(getYear(selectedDate)); // Ensure the selected year is always included

    return Array.from(yearsSet)
      .sort((a, b) => b - a)
      .map((year) => ({
        date: String(year),
        isActive: getYear(selectedDate) === year,
      }));
  }

  // 'months' and 'all' — show all 12 months of the selected year
  const year = getYear(selectedDate);

  return MONTH_ABBREVIATIONS.map((month) => {
    const parsedDate = parse(`${month} ${year}`, 'MMM yyyy', selectedDate, {
      locale: ptBR,
    });

    const isActive =
      isValid(parsedDate) &&
      getYear(selectedDate) === getYear(parsedDate) &&
      getMonth(selectedDate) === getMonth(parsedDate);

    return {
      date: `${month} \n ${year}`,
      isActive,
    };
  }).reverse(); // newest-first: Dez → Jan (matches the inverted FlatList)
}
