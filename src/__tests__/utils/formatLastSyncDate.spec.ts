import { formatLastSyncDate } from '@utils/formatLastSyncDate';

describe('formatLastSyncDate', () => {
  it('formats a valid ISO date as dd/MM/yyyy', () => {
    expect(formatLastSyncDate('2026-11-14T10:00:00.000Z')).toBe('14/11/2026');
  });

  it('returns Pendente for missing dates instead of throwing', () => {
    expect(formatLastSyncDate(null)).toBe('Pendente');
    expect(formatLastSyncDate(undefined)).toBe('Pendente');
    expect(formatLastSyncDate('')).toBe('Pendente');
  });

  it('returns Pendente for malformed dates instead of throwing', () => {
    expect(formatLastSyncDate('not-a-date')).toBe('Pendente');
    expect(formatLastSyncDate('2026-13-45')).toBe('Pendente');
  });
});
