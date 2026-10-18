import { schema } from '@screens/RegisterTransaction/schema';

/**
 * Spec-anchored tests for the RegisterTransaction validation schema
 * (feature transaction-exchange-rate, spec.md FX-09 / AC P2-9).
 */

const validForm = {
  description: 'Almoço',
  amount: 50,
  amountInAccountCurrency: null,
  exchangeRate: 6.1,
};

describe('exchangeRate validation (FX-09 / AC P2-9)', () => {
  it('accepts a positive rate', () => {
    expect(schema.validateSync(validForm)).toBeTruthy();
  });

  it('accepts null (no conversion — field hidden)', () => {
    expect(
      schema.validateSync({ ...validForm, exchangeRate: null })
    ).toBeTruthy();
  });

  it('accepts undefined (field untouched)', () => {
    const { exchangeRate, ...withoutRate } = validForm;
    expect(schema.validateSync(withoutRate)).toBeTruthy();
  });

  it('AC P2-9: treats an empty input as null, not a type error', () => {
    // parseDecimalInput('') feeds '' to the schema; emptyToNull maps it to null
    expect(
      schema.validateSync({ ...validForm, exchangeRate: '' as any })
    ).toBeTruthy();
  });

  it('AC P2-9: rejects zero', () => {
    expect(() =>
      schema.validateSync({ ...validForm, exchangeRate: 0 })
    ).toThrow();
  });

  it('AC P2-9: rejects a negative rate', () => {
    expect(() =>
      schema.validateSync({ ...validForm, exchangeRate: -1 })
    ).toThrow();
  });

  it('AC P2-9: rejects a non-numeric rate', () => {
    expect(() =>
      schema.validateSync({ ...validForm, exchangeRate: 'abc' as any })
    ).toThrow();
  });
});
