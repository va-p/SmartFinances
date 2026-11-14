import {
  parseBankingCallback,
  validateCallbackParams,
} from '@utils/openiConnect';

// OPENI-01/OPENI-02 — the widget return carries itemId + status on the
// banking-callback link; anything else must not create an integration.
describe('parseBankingCallback', () => {
  it('parses the custom-scheme deep link', () => {
    expect(
      parseBankingCallback(
        'com.vap.smartfinances://banking-callback?itemId=abc-123&status=success'
      )
    ).toEqual({ itemId: 'abc-123', status: 'success' });
  });

  it('parses an error return', () => {
    expect(
      parseBankingCallback(
        'com.vap.smartfinances://banking-callback?status=error&itemId=abc-123'
      )
    ).toEqual({ itemId: 'abc-123', status: 'error' });
  });

  it('parses https universal links', () => {
    expect(
      parseBankingCallback(
        'https://smartfinances.com.br/banking-callback?itemId=abc-123&status=success'
      )
    ).toEqual({ itemId: 'abc-123', status: 'success' });
  });

  it('validates raw router params with the same rules', () => {
    expect(validateCallbackParams('abc-123', 'success')).toEqual({
      itemId: 'abc-123',
      status: 'success',
    });
    expect(validateCallbackParams('', 'success')).toBeNull();
    expect(validateCallbackParams('abc-123', 'pending')).toBeNull();
    expect(validateCallbackParams(undefined, 'success')).toBeNull();
    expect(validateCallbackParams(['a', 'b'], 'success')).toBeNull();
  });

  it('rejects missing itemId, missing status, and unknown statuses', () => {
    expect(
      parseBankingCallback(
        'com.vap.smartfinances://banking-callback?status=success'
      )
    ).toBeNull();
    expect(
      parseBankingCallback(
        'com.vap.smartfinances://banking-callback?itemId=abc-123'
      )
    ).toBeNull();
    expect(
      parseBankingCallback(
        'com.vap.smartfinances://banking-callback?itemId=abc-123&status=pending'
      )
    ).toBeNull();
    expect(parseBankingCallback('com.vap.smartfinances://home')).toBeNull();
    expect(parseBankingCallback('not a url at all')).toBeNull();
  });
});
