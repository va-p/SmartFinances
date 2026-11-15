import {
  buildInvestmentGroupKey,
  buildInvestmentGroupLabel,
  groupInvestments,
  grossProfitOf,
  netProfitOf,
  InvestmentAccount,
} from '../groupInvestments';

const cdb = (overrides: Record<string, any> = {}): InvestmentAccount => ({
  id: 1,
  name: 'CDB - NU FINANCEIRA S.A.',
  currency: { id: 1, name: 'Real', code: 'BRL', symbol: 'R$' },
  type: 'INVESTMENTS',
  balance: '700.06',
  initialAmount: null,
  investmentData: {
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
  },
  ...overrides,
});

describe('buildInvestmentGroupKey (INV-01)', () => {
  it('collapses positions with the same type, subtype, rateType and rate', () => {
    const a = cdb({ id: 1 });
    const b = cdb({ id: 2, balance: '250.02' });
    expect(buildInvestmentGroupKey(a)).toBe(buildInvestmentGroupKey(b));
  });

  it('splits positions with a different rate', () => {
    const a = cdb({ id: 1 });
    const b = cdb({
      id: 2,
      investmentData: { ...a.investmentData, rate: '102' },
    });
    expect(buildInvestmentGroupKey(a)).not.toBe(buildInvestmentGroupKey(b));
  });

  it('normalizes case and whitespace so bank variants still collapse', () => {
    const a = cdb({ id: 1 });
    const b = cdb({
      id: 2,
      investmentData: { ...a.investmentData, investmentSubtype: ' cdb ' },
    });
    expect(buildInvestmentGroupKey(a)).toBe(buildInvestmentGroupKey(b));
  });

  it('routes manual accounts without metadata to unique ungrouped keys', () => {
    const a = cdb({ id: 1, investmentData: null });
    const b = cdb({ id: 2, investmentData: null });
    expect(buildInvestmentGroupKey(a)).not.toBe(buildInvestmentGroupKey(b));
    expect(buildInvestmentGroupKey(a)).toMatch(/^manual:/);
  });
});

describe('groupInvestments (INV-01..INV-04)', () => {
  const toBase = (account: InvestmentAccount) => Number(account.balance);

  it('groups identical CDB legs and sums the header balance', () => {
    const groups = groupInvestments(
      [cdb({ id: 1, balance: '700.06' }), cdb({ id: 2, balance: '250.02' })],
      toBase
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(2);
    expect(groups[0].label).toBe('CDB · 100% CDI');
    expect(groups[0].totalBalanceBase).toBeCloseTo(950.08, 8);
  });

  it('keeps manual accounts as ungrouped singles (INV-07)', () => {
    const groups = groupInvestments(
      [
        cdb({ id: 1, investmentData: null }),
        cdb({ id: 2, investmentData: null }),
      ],
      toBase
    );
    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.count)).toEqual([1, 1]);
  });
});

describe('profit helpers (Q2)', () => {
  it('computes gross profit as currentGrossAmount - amountOriginal', () => {
    expect(grossProfitOf(cdb().investmentData)).toBeCloseTo(50.1, 8);
  });

  it('returns null gross profit when either leg is missing', () => {
    expect(
      grossProfitOf({ ...cdb().investmentData, amountOriginal: null })
    ).toBeNull();
    expect(
      grossProfitOf({ ...cdb().investmentData, currentGrossAmount: null })
    ).toBeNull();
  });

  it('prefers amountProfit for net profit when Openi supplies it', () => {
    expect(netProfitOf(cdb().investmentData, '700.06')).toBeCloseTo(50.06, 8);
  });

  it('falls back to balance - amountOriginal for net profit', () => {
    const details = { ...cdb().investmentData, amountProfit: null };
    expect(netProfitOf(details, '10234.56')).toBeCloseTo(9534.56, 8);
  });

  it('returns null net profit with no computable basis', () => {
    const details = {
      ...cdb().investmentData,
      amountProfit: null,
      amountOriginal: null,
    };
    expect(netProfitOf(details, '10234.56')).toBeNull();
    const noBasis = { ...cdb().investmentData, amountProfit: null };
    expect(netProfitOf(noBasis, null)).toBeNull();
  });
});

describe('buildInvestmentGroupLabel', () => {
  it('falls back gracefully when rate fields are missing', () => {
    expect(
      buildInvestmentGroupLabel({ ...cdb().investmentData, rate: null, rateType: null })
    ).toBe('CDB');
    expect(buildInvestmentGroupLabel(null)).toBe('Investimento');
  });
});
