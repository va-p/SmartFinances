/**
 * Pure formatter for the backend's image-quota rejection body (feature:
 * benefits-tiers). The 403 body carries `usage_bytes`/`limit_bytes`
 * (design.md §Key DTOs); the transaction form shows this message instead of
 * the generic save/upload failure (BEN-45).
 */
export interface QuotaErrorBody {
  code?: unknown;
  usage_bytes?: number | null;
  limit_bytes?: number | null;
}

const MB = 1024 * 1024;

const formatMb = (bytes: number): string =>
  `${(bytes / MB).toFixed(1).replace('.', ',')} MB`;

const FALLBACK_MESSAGE =
  'Limite de armazenamento de imagens atingido. Remova imagens de transações antigas ou assine um plano para anexar novas imagens.';

/**
 * The user-facing quota message for a QUOTA_EXCEEDED body, or null when the
 * body is not a quota rejection (the caller keeps its generic handling).
 * Handles a null (unlimited) limit and bodies missing the byte fields.
 */
export function formatQuotaMessage(
  errorBody: QuotaErrorBody | null | undefined
): string | null {
  if (!errorBody || errorBody.code !== 'QUOTA_EXCEEDED') {
    return null;
  }

  const usage =
    typeof errorBody.usage_bytes === 'number' ? errorBody.usage_bytes : null;
  const limit =
    typeof errorBody.limit_bytes === 'number' ? errorBody.limit_bytes : null;

  if (usage !== null && limit !== null) {
    return `Limite de armazenamento de imagens atingido: você está usando ${formatMb(
      usage
    )} de ${formatMb(limit)}. Remova imagens de transações antigas ou assine um plano para anexar novas imagens.`;
  }
  if (usage !== null) {
    return `Limite de armazenamento de imagens atingido (uso atual: ${formatMb(
      usage
    )}). Remova imagens de transações antigas ou assine um plano para anexar novas imagens.`;
  }
  return FALLBACK_MESSAGE;
}
