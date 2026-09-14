import { schema } from '@screens/RegisterAccount/schema';

/**
 * Spec-anchored tests for the RegisterAccount validation schema
 * (spec.md CC-03..CC-05, feature register-credit-card-fields; plus
 * regression anchors from account-institutions AC11.3/AC11.4).
 */

const validCreditAccount = {
  name: 'Cartão Nubank',
  balance: 0,
  type: 'CREDIT',
  institution_id: 'inst-uuid',
  credit_card_brand: 'Mastercard',
  credit_card_close_day: 8,
  credit_card_credit_limit: 5000,
  credit_card_available_credit_limit: 700,
};

const validWalletAccount = {
  name: 'Carteira',
  balance: 100,
  type: 'WALLET',
};

describe('CC-03: required credit card fields while type is CREDIT', () => {
  it('accepts a complete CREDIT form', () => {
    expect(schema.validateSync(validCreditAccount)).toBeTruthy();
  });

  it('accepts a CREDIT form without the optional available limit', () => {
    const { credit_card_available_credit_limit, ...withoutAvailable } =
      validCreditAccount;
    expect(schema.validateSync(withoutAvailable)).toBeTruthy();
  });

  it('rejects a CREDIT form without brand', () => {
    expect(() =>
      schema.validateSync({ ...validCreditAccount, credit_card_brand: '' })
    ).toThrow('Digite a bandeira do cartão');
  });

  it('rejects a CREDIT form without the closing day', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_close_day: undefined,
      })
    ).toThrow('dia de fechamento');
  });

  it('rejects a CREDIT form without the total limit', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_credit_limit: undefined,
      })
    ).toThrow('limite total');
  });

  it('rejects a negative total limit', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_credit_limit: -1,
      })
    ).toThrow('não pode ser negativo');
  });
});

describe('CC-04: closing day bounds (integer between 1 and 31)', () => {
  it.each([1, 31])('accepts boundary day %i', (day) => {
    expect(
      schema.validateSync({ ...validCreditAccount, credit_card_close_day: day })
    ).toBeTruthy();
  });

  it.each([0, 32])('rejects out-of-range day %i', (day) => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_close_day: day,
      })
    ).toThrow('entre 1 e 31');
  });

  it('rejects a non-integer closing day', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_close_day: 8.5,
      })
    ).toThrow('número inteiro');
  });

  it('rejects a non-numeric closing day', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_close_day: 'abc',
      })
    ).toThrow('dia de fechamento');
  });

  it('accepts the closing day typed as a string (keyboard input)', () => {
    expect(
      schema.validateSync({
        ...validCreditAccount,
        credit_card_close_day: '8',
      })
    ).toBeTruthy();
  });
});

describe('CC-05: optional available limit', () => {
  it('accepts an empty (null) available limit', () => {
    expect(
      schema.validateSync({
        ...validCreditAccount,
        credit_card_available_credit_limit: '',
      })
    ).toBeTruthy();
  });

  it('rejects a negative available limit', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_available_credit_limit: -50,
      })
    ).toThrow('não pode ser negativo');
  });

  it('rejects a non-numeric available limit', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        credit_card_available_credit_limit: 'abc',
      })
    ).toThrow('numérico');
  });
});

describe('CC-02: credit card fields not required for other types', () => {
  it('accepts a WALLET form with no credit card fields', () => {
    expect(schema.validateSync(validWalletAccount)).toBeTruthy();
  });
});

describe('regression: institution rules (account-institutions AC11.3/11.4)', () => {
  it('still requires an institution for CREDIT accounts', () => {
    expect(() =>
      schema.validateSync({
        ...validCreditAccount,
        institution_id: null,
      })
    ).toThrow('instituição');
  });

  it('still keeps the institution optional for WALLET accounts', () => {
    expect(
      schema.validateSync({ ...validWalletAccount, institution_id: null })
    ).toBeTruthy();
  });
});
