import { sortAccountsByOption } from '../sortAccountsByOption';

const account = (name: string, balanceConvertedToBRL: number) => ({
  name,
  balanceConvertedToBRL,
});

describe('sortAccountsByOption', () => {
  const input = [
    account('Conta Corrente', 5000),
    account('Carteira', 100),
    account('Investimentos', 1234.56),
  ];

  // R3: name-asc
  it('name-asc sorts alphabetically A→Z', () => {
    const sorted = sortAccountsByOption(input, 'name-asc');
    expect(sorted.map((a) => a.name)).toEqual([
      'Carteira',
      'Conta Corrente',
      'Investimentos',
    ]);
  });

  // R3: name-desc
  it('name-desc sorts alphabetically Z→A', () => {
    const sorted = sortAccountsByOption(input, 'name-desc');
    expect(sorted.map((a) => a.name)).toEqual([
      'Investimentos',
      'Conta Corrente',
      'Carteira',
    ]);
  });

  // R3: balance-asc — numeric, BRL-normalized
  it('balance-asc sorts by BRL-normalized balance ascending', () => {
    const sorted = sortAccountsByOption(input, 'balance-asc');
    expect(sorted.map((a) => a.balanceConvertedToBRL)).toEqual([
      100, 1234.56, 5000,
    ]);
  });

  // R3: balance-desc
  it('balance-desc sorts by BRL-normalized balance descending', () => {
    const sorted = sortAccountsByOption(input, 'balance-desc');
    expect(sorted.map((a) => a.balanceConvertedToBRL)).toEqual([
      5000, 1234.56, 100,
    ]);
  });

  // R3: balance sort never reads the formatted string — a high native value
  // must not beat a higher BRL-normalized value (cross-currency fairness)
  it('balance sort is BRL-normalized, not native-currency based', () => {
    const crossCurrency = [
      // native balance formatted strings are irrelevant to the comparator
      account('Conta USD', 5000),
      account('Conta BRL', 50000),
    ];
    const sorted = sortAccountsByOption(crossCurrency, 'balance-asc');
    expect(sorted.map((a) => a.name)).toEqual(['Conta USD', 'Conta BRL']);
  });

  // Pure function: input must not be mutated
  it('returns a sorted copy without mutating the input', () => {
    const before = [...input];
    sortAccountsByOption(input, 'balance-desc');
    expect(input.map((a) => a.name)).toEqual(before.map((a) => a.name));
    expect(input[0].balanceConvertedToBRL).toBe(5000);
  });

  it('handles an empty list', () => {
    expect(sortAccountsByOption([], 'name-asc')).toEqual([]);
  });
});
