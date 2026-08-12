import { processAccountsForList } from '../processAccountsForList';

import { AccountProps } from '../../interfaces/accounts';

const quotes = {
  brlQuoteBtc: { price: 0.000003 },
  brlQuoteEur: { price: 0.16 },
  brlQuoteUsd: { price: 0.2 },
  btcQuoteBrl: { price: 300000 },
  btcQuoteEur: { price: 48000 },
  btcQuoteUsd: { price: 60000 },
  eurQuoteBrl: { price: 6.25 },
  eurQuoteBtc: { price: 0.00002 },
  eurQuoteUsd: { price: 1.25 },
  usdQuoteBrl: { price: 5 },
  usdQuoteBtc: { price: 0.000016 },
  usdQuoteEur: { price: 0.8 },
};

const brlAccount = {
  id: 1,
  name: 'Carteira',
  type: 'WALLET',
  balance: 1234.5,
  initialAmount: null,
  currency: { id: 1, name: 'Real Brasileiro', code: 'BRL', symbol: 'R$' },
} as AccountProps;

const usdAccount = {
  id: 2,
  name: 'Conta USD',
  type: 'BANK',
  balance: 100,
  initialAmount: null,
  currency: { id: 2, name: 'US Dollar', code: 'USD', symbol: '$' },
} as AccountProps;

describe('processAccountsForList', () => {
  // R1 — balance formatted in the account's currency (pt-BR separators)
  it('formats BRL balance in pt-BR currency style', () => {
    const [processed] = processAccountsForList([brlAccount], quotes);
    // Intl uses a non-breaking space between symbol and value (U+00A0)
    expect(processed.balance).toBe('R$\u00A01.234,50');
  });

  it('formats non-BRL balance in the account currency', () => {
    const [processed] = processAccountsForList([usdAccount], quotes);
    expect(processed.balance).toBe('US$\u00A0100,00');
  });

  // R2 — BRL-converted secondary line only for non-BRL accounts
  it('adds BRL-converted secondary line for non-BRL accounts', () => {
    const [processed] = processAccountsForList([usdAccount], quotes);
    // 100 USD × 5 (usdQuoteBrl) = 500 BRL
    expect(processed.totalAccountAmountConverted).toBe('R$\u00A0500,00');
  });

  it('omits secondary line for BRL accounts', () => {
    const [processed] = processAccountsForList([brlAccount], quotes);
    expect(processed.totalAccountAmountConverted).toBeUndefined();
  });

  // R3 — AccountListItem stays untouched: processing happens at data level
  it('returns the account fields needed by AccountListItem', () => {
    const [processed] = processAccountsForList([usdAccount], quotes);
    expect(processed.id).toBe(2);
    expect(processed.name).toBe('Conta USD');
    expect(processed.type).toBe('BANK');
    expect(processed.currency.code).toBe('USD');
  });

  // R4 — raw numeric balance preserved for sorting consumers
  it('keeps a numeric rawBalance alongside the formatted string', () => {
    const [processed] = processAccountsForList([usdAccount], quotes);
    expect(processed.rawBalance).toBe(100);
    expect(typeof processed.rawBalance).toBe('number');
  });

  it('processes multiple accounts in order', () => {
    const processed = processAccountsForList(
      [brlAccount, usdAccount],
      quotes
    );
    expect(processed).toHaveLength(2);
    expect(processed[0].id).toBe(1);
    expect(processed[1].id).toBe(2);
  });

  // Unsupported currency pair degrades gracefully (no crash, no secondary line)
  it('omits converted line when the currency pair is unsupported', () => {
    const gbpAccount = {
      ...brlAccount,
      currency: { id: 9, name: 'Pound', code: 'GBP', symbol: '£' },
    } as unknown as AccountProps;
    const [processed] = processAccountsForList([gbpAccount], quotes);
    expect(processed.balance).toBeDefined();
    expect(processed.totalAccountAmountConverted).toBeUndefined();
  });
});
