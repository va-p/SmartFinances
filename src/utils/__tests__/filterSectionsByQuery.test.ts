import { filterSectionsByQuery } from '../filterSectionsByQuery';

type Transaction = { id: number; description: string | null };
type DaySection = { title: string; total: string; data: Transaction[] };

describe('filterSectionsByQuery', () => {
  const sections: DaySection[] = [
    {
      title: '18/09/2026',
      total: 'R$ 100,00',
      data: [
        { id: 1, description: 'Mercado do Bairro' },
        { id: 2, description: 'Uber' },
      ],
    },
    {
      title: '17/09/2026',
      total: 'R$ 50,00',
      data: [{ id: 3, description: 'Farmácia' }],
    },
  ];

  // SRCH-12 / edge — query of length 0 returns sections unfiltered
  it('returns all sections unchanged when the query is empty', () => {
    expect(filterSectionsByQuery(sections, '', (t) => t.description)).toEqual(
      sections
    );
  });

  // SRCH-02 — only matching transactions kept, case-insensitively
  it('keeps only matching transactions in each section, case-insensitively', () => {
    const result = filterSectionsByQuery(
      sections,
      'mErCaDo',
      (t) => t.description
    );
    expect(result).toHaveLength(1);
    expect(result[0].data).toEqual([
      { id: 1, description: 'Mercado do Bairro' },
    ]);
  });

  // Edge — sections with no matches dropped (no orphan headers)
  it('drops sections with no matching transactions', () => {
    const result = filterSectionsByQuery(sections, 'uber', (t) => t.description);
    expect(result.map((section) => section.title)).toEqual(['18/09/2026']);
    expect(result[0].data.map((t) => t.id)).toEqual([2]);
  });

  // Edge — surviving sections keep title and total unchanged
  it('preserves the title and total of surviving sections', () => {
    const result = filterSectionsByQuery(sections, 'uber', (t) => t.description);
    expect(result[0].title).toBe('18/09/2026');
    expect(result[0].total).toBe('R$ 100,00');
  });

  // Edge — no match anywhere renders the empty-list state, no headers
  it('returns an empty array when no transaction matches', () => {
    expect(
      filterSectionsByQuery(sections, 'zzz', (t) => t.description)
    ).toEqual([]);
  });

  // SRCH-08 — sections without a `total` field (InstitutionDetails shape) filter too
  it('filters sections that have no total field', () => {
    const accountSections = [
      {
        title: 'Contas',
        data: [
          { id: 1, name: 'Conta Corrente' },
          { id: 2, name: 'Poupança' },
        ],
      },
      { title: 'Cartões', data: [{ id: 3, name: 'Platinum' }] },
    ];
    const result = filterSectionsByQuery(
      accountSections,
      'pouP',
      (account) => account.name
    );
    expect(result).toEqual([
      { title: 'Contas', data: [{ id: 2, name: 'Poupança' }] },
    ]);
  });
});
