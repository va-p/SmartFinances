import {
  filterInvestmentGroups,
  filterSectionsByQuery,
  investmentGroupSearchText,
} from '../filterSectionsByQuery';
import {
  InvestmentAccount,
  groupInvestments,
} from '../groupInvestments';

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
});

describe('filterInvestmentGroups (INV-08)', () => {
  const cdbData = {
    investmentType: 'FIXED_INCOME',
    investmentSubtype: 'CDB',
    investmentStatus: 'ACTIVE',
    rate: '100',
    rateType: 'CDI',
    issuer: 'NU FINANCEIRA S.A.',
    currentGrossAmount: '750.10',
    amountOriginal: '700.00',
    amountProfit: '50.06',
    currentDate: '2026-11-14T00:00:00.000Z',
    issuedAt: null,
    expiresAt: '2028-12-01T00:00:00.000Z',
  };
  const cdb = (id: number, overrides: Record<string, any> = {})
    : InvestmentAccount =>
    ({
      id,
      name: 'CDB - NU FINANCEIRA S.A.',
      currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
      type: 'INVESTMENTS',
      balance: '100',
      initialAmount: null,
      investmentData: { ...cdbData },
      ...overrides,
    }) as unknown as InvestmentAccount;
  const toBase = (account: InvestmentAccount) => Number(account.balance);
  const groups = () =>
    groupInvestments(
      [
        cdb(1, { balance: '700.06' }),
        cdb(2, { balance: '250.02', name: 'CDB Especial' }),
        cdb(3, {
          name: 'CDB - BANCO X',
          investmentData: {
            ...cdbData,
            rate: '15',
            rateType: 'IPCA',
            issuer: 'BANCO X',
          },
          balance: '300',
        }),
      ],
      toBase
    );

  // INV-08 — empty query returns the groups unchanged.
  it('returns all groups unchanged when the query is empty', () => {
    const all = groups();
    expect(filterInvestmentGroups(all, '')).toBe(all);
  });

  // INV-08 — a member-name match surfaces the entire group.
  it('surfaces the whole group when one member name matches', () => {
    const result = filterInvestmentGroups(groups(), 'especial');
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    expect(result[0].members.map((member) => member.id)).toEqual([1, 2]);
  });

  // INV-08 — issuer and rate-label matches surface the group.
  it('matches issuer and rate labels across the group', () => {
    expect(filterInvestmentGroups(groups(), 'nu financeira')).toHaveLength(1);
    expect(filterInvestmentGroups(groups(), 'cdi')).toHaveLength(1);
    expect(filterInvestmentGroups(groups(), 'ipca')).toHaveLength(1);
  });

  // INV-08 — groups with no match are dropped.
  it('drops groups with no match', () => {
    expect(filterInvestmentGroups(groups(), 'tesouro')).toHaveLength(0);
  });

  // INV-04 — group sums reconcile with member balances to the cent.
  it('reconciles grouped totals with member balances', () => {
    const all = groups();
    const groupedTotal = all.reduce(
      (sum, group) => sum + group.totalBalanceBase,
      0
    );
    expect(groupedTotal).toBeCloseTo(700.06 + 250.02 + 300, 8);
  });

  // INV-08 — the search text carries label, names, issuer and rate.
  it('builds search text from label, names, issuer and rate type', () => {
    const text = investmentGroupSearchText(groups()[0]);
    expect(text).toContain('CDB · 100% CDI');
    expect(text).toContain('CDB Especial');
    expect(text).toContain('NU FINANCEIRA');
    expect(text).toContain('CDI');
  });
});

describe('filterSectionsByQuery institution shape', () => {
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
