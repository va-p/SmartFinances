import { formatQuotaMessage } from '@utils/quotaMessage';

// BEN-45 — the quota rejection surfaces current usage and limit, formatted
describe('formatQuotaMessage', () => {
  it('formats the 403 body bytes as MB (pt-BR decimal comma)', () => {
    const message = formatQuotaMessage({
      code: 'QUOTA_EXCEEDED',
      usage_bytes: 49_500_000,
      limit_bytes: 52_428_800,
    });

    expect(message).toBe(
      'Limite de armazenamento de imagens atingido: você está usando 47,2 MB de 50,0 MB. ' +
        'Remova imagens de transações antigas ou assine um plano para anexar novas imagens.'
    );
  });

  it('handles a null (unlimited) limit by showing only the usage', () => {
    const message = formatQuotaMessage({
      code: 'QUOTA_EXCEEDED',
      usage_bytes: 52_428_800,
      limit_bytes: null,
    });

    expect(message).toContain('50,0 MB');
    expect(message).not.toContain(' de 50,0 MB');
  });

  it('falls back to a quota message without numbers when fields are missing', () => {
    expect(formatQuotaMessage({ code: 'QUOTA_EXCEEDED' })).toBe(
      'Limite de armazenamento de imagens atingido. Remova imagens de transações antigas ou assine um plano para anexar novas imagens.'
    );
    expect(
      formatQuotaMessage({ code: 'QUOTA_EXCEEDED', limit_bytes: 52_428_800 })
    ).toBe(
      'Limite de armazenamento de imagens atingido. Remova imagens de transações antigas ou assine um plano para anexar novas imagens.'
    );
  });

  it('returns null for non-quota bodies so the generic error path is kept', () => {
    expect(formatQuotaMessage({ code: 'ACCOUNT_READ_ONLY' })).toBeNull();
    expect(formatQuotaMessage({ message: 'anything' })).toBeNull();
    expect(formatQuotaMessage(null)).toBeNull();
    expect(formatQuotaMessage(undefined)).toBeNull();
  });
});
