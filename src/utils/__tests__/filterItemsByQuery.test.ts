import { filterItemsByQuery } from '../filterItemsByQuery';

describe('filterItemsByQuery', () => {
  const items = [
    { id: 1, name: 'Mercado do Bairro' },
    { id: 2, name: 'Uber' },
    { id: 3, name: null },
  ];

  // SRCH-12 / edge — query of length 0 returns the unfiltered list
  it('returns all items unchanged when the query is empty', () => {
    expect(filterItemsByQuery(items, '', (item) => item.name)).toEqual(items);
  });

  // SRCH-02 / SRCH-06 — case-insensitive substring match on the search field
  it('keeps only items whose search text contains the query, case-insensitively', () => {
    const result = filterItemsByQuery(items, 'mErCaDo', (item) => item.name);
    expect(result).toEqual([{ id: 1, name: 'Mercado do Bairro' }]);
  });

  // SRCH-02 / SRCH-06 — original order preserved, every match kept
  it('keeps every matching item in the original order', () => {
    const list = [
      { id: 1, tag: 'alpha beta' },
      { id: 2, tag: 'beta alpha' },
      { id: 3, tag: 'gamma' },
    ];
    const result = filterItemsByQuery(list, 'beta', (item) => item.tag);
    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  // SRCH-06 — nested search field (Accounts list items: { kind, data: { name } })
  it('filters by a nested search field when the selector reaches into it', () => {
    const list = [
      { kind: 'institution' as const, data: { name: 'Nubank' } },
      { kind: 'account' as const, data: { name: 'Carteira' } },
    ];
    const result = filterItemsByQuery(list, 'nU', (item) => item.data.name);
    expect(result).toEqual([
      { kind: 'institution', data: { name: 'Nubank' } },
    ]);
  });

  // Edge — no match yields the empty-list state
  it('returns an empty array when nothing matches', () => {
    expect(filterItemsByQuery(items, 'zzz', (item) => item.name)).toEqual([]);
  });

  // Edge — null/undefined search text excluded without throwing
  it('excludes items whose search text is null or undefined', () => {
    const list = [
      { id: 1, note: 'keep' },
      { id: 2, note: null },
      { id: 3, note: undefined },
    ];
    const result = filterItemsByQuery(list, 'e', (item) => item.note);
    expect(result.map((item) => item.id)).toEqual([1]);
  });
});
