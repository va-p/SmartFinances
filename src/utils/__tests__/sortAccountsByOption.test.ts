import { sortAccountsByOption } from '../sortAccountsByOption';

type Fixture = { name: string; balanceConvertedToBRL: number };

// Each test builds its own fixture so a mutant that sorts in place cannot
// pre-mutate a shared module-level array and false-pass a later assertion.
const makeFixtures = (): Fixture[] => [
  { name: 'Conta Corrente', balanceConvertedToBRL: 5000 },
  { name: 'Carteira', balanceConvertedToBRL: 100 },
  { name: 'Investimentos', balanceConvertedToBRL: 1234.56 },
];

describe('sortAccountsByOption', () => {
  // R3: name-asc
  it('name-asc sorts alphabetically A→Z', () => {
    const sorted = sortAccountsByOption(makeFixtures(), 'name-asc');
    expect(sorted.map((a) => a.name)).toEqual([
      'Carteira',
      'Conta Corrente',
      'Investimentos',
    ]);
  });

  // R3: name-desc
  it('name-desc sorts alphabetically Z→A', () => {
    const sorted = sortAccountsByOption(makeFixtures(), 'name-desc');
    expect(sorted.map((a) => a.name)).toEqual([
      'Investimentos',
      'Conta Corrente',
      'Carteira',
    ]);
  });

  // R3: balance-asc — numeric, BRL-normalized
  it('balance-asc sorts by BRL-normalized balance ascending', () => {
    const sorted = sortAccountsByOption(makeFixtures(), 'balance-asc');
    expect(sorted.map((a) => a.balanceConvertedToBRL)).toEqual([
      100, 1234.56, 5000,
    ]);
  });

  // R3: balance-desc
  it('balance-desc sorts by BRL-normalized balance descending', () => {
    const sorted = sortAccountsByOption(makeFixtures(), 'balance-desc');
    expect(sorted.map((a) => a.balanceConvertedToBRL)).toEqual([
      5000, 1234.56, 100,
    ]);
  });

  // R3: balance sort never reads the formatted string — the comparator only
  // sees name + balanceConvertedToBRL, so the order must contradict the
  // alphabetical order to prove numeric comparison.
  it('balance sort is BRL-normalized, not name-based', () => {
    const crossCurrency = [
      { name: 'Conta USD', balanceConvertedToBRL: 5000 },
      { name: 'Conta BRL', balanceConvertedToBRL: 50000 },
    ];
    const sorted = sortAccountsByOption(crossCurrency, 'balance-asc');
    // Alphabetical order would be ['Conta BRL', 'Conta USD']; numeric gives
    // USD (5000) before BRL (50000).
    expect(sorted.map((a) => a.name)).toEqual(['Conta USD', 'Conta BRL']);
  });

  // Pure function: input must not be mutated (fresh fixture, independent of
  // any earlier test's execution order)
  it('returns a sorted copy without mutating the input', () => {
    const input = makeFixtures();
    const beforeNames = input.map((a) => a.name);
    const beforeBalances = input.map((a) => a.balanceConvertedToBRL);

    const sorted = sortAccountsByOption(input, 'balance-desc');

    // Sorted output is reordered…
    expect(sorted.map((a) => a.balanceConvertedToBRL)).toEqual([
      5000, 1234.56, 100,
    ]);
    // …but the original array keeps its original order and values.
    expect(input.map((a) => a.name)).toEqual(beforeNames);
    expect(input.map((a) => a.balanceConvertedToBRL)).toEqual(beforeBalances);
    // And the result is a distinct array.
    expect(sorted).not.toBe(input);
  });

  it('handles an empty list', () => {
    expect(sortAccountsByOption([], 'name-asc')).toEqual([]);
  });
});
