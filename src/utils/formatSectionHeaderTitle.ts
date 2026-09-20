import { isToday, isTomorrow, isYesterday, parse } from 'date-fns';

// Maps a transaction section header date title (dd/MM/yyyy) to a relative
// label (Hoje/Ontem/Amanhã) when it matches, keeping the raw title otherwise.
// Unparseable titles fall through untouched (parse returns an Invalid Date).
export function formatSectionHeaderTitle(title: string): string {
  const parsedTitleDate = parse(title, 'dd/MM/yyyy', new Date());

  if (isToday(parsedTitleDate)) {
    return 'Hoje';
  }
  if (isYesterday(parsedTitleDate)) {
    return 'Ontem';
  }
  if (isTomorrow(parsedTitleDate)) {
    return 'Amanhã';
  }
  return title;
}
